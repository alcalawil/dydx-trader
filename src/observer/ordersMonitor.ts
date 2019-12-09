import { IResponseOrder, IRedisManager, IAwsManager } from '../entities';
import { logger } from '../shared/Logger';
import { ApiOrderStatus } from '@dydxprotocol/solo';
import { EventEmitter } from 'events';

const ORDERS: IResponseOrder[] = [];

class OrdersMonitor {
  private observerEvents: EventEmitter;
  private ordersManager: any;
  private redisManager: IRedisManager;
  private redisEvents: EventEmitter;
  private awsManager: IAwsManager;

  constructor(
    event: EventEmitter,
    ordersManager: any,
    redisManager: IRedisManager,
    awsManager: IAwsManager
  ) {
    this.observerEvents = event;
    this.ordersManager = ordersManager;
    this.redisManager = redisManager;
    this.redisEvents = this.redisManager.getEmitter();
    this.awsManager = awsManager;
    this.initialize();
  }

  private async initialize() {
    await this.redisManager
      .getCachedOpenOrders()
      .then((orders: IResponseOrder[]) => {
        orders.forEach((item: IResponseOrder) => {
          ORDERS.push(item);
        });
      })
      .catch((err: any) => logger.error('Error =>', JSON.stringify(err)));

    this.redisEvents.on('pushedOrder', (order: IResponseOrder) => {
      logger.info(`Order ${order.id} was pushed for account ${order.account}`);
      ORDERS.push(order);
    });
  }

  public async checkOrdersStatus() {
    const updatedOrders = await this.getUpdatedOrders(ORDERS);
    this.statusDiffed(updatedOrders);
  }

  private async getUpdatedOrders(orders: IResponseOrder[]) {
    return await Promise.all(
      orders.map((order) => this.ordersManager.getOrderById(order.id))
    );
  }

  private statusDiffed(updatedOrders: IResponseOrder[]) {
    ORDERS.forEach((order: IResponseOrder, index: number) => {
      const updatedOrder: any = updatedOrders.find(
        (item: IResponseOrder) => item.id === order.id
      );
      if (updatedOrder && order.status !== updatedOrder.status) {
        if (
          updatedOrder.status.includes(ApiOrderStatus.FILLED) ||
          updatedOrder.status.includes(ApiOrderStatus.CANCELED)
        ) {
          this.redisManager.setOrderInCache(updatedOrder);
          this.redisManager.deleteCachedOpenOrder(order);
          ORDERS.splice(index, 1);
          this.awsManager.publishLogToSNS('orderChanges', updatedOrder);
        } else if (updatedOrder.status.includes(ApiOrderStatus.PARTIALLY_FILLED)) {
          this.redisManager.updateCachedOpenOrder(updatedOrder, index);
          ORDERS[index] = updatedOrder;
          this.awsManager.publishLogToSNS('orderChanges', updatedOrder);
        } else {
          ORDERS[index] = updatedOrder;
          this.redisManager.updateCachedOpenOrder(updatedOrder, index);
        }
        this.awsManager.publishToSQS('orderChanges', updatedOrder);
        this.observerEvents.emit('orderChanges', updatedOrder);
      }
    });
  }
}

export default OrdersMonitor;
