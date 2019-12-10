import {
  IResponseOrder,
  IRedisManager,
  IAwsManager,
  IOrderStatus,
  ISQSPublisher
} from '../entities';
import { logger } from '../shared/Logger';
import { ApiOrderStatus } from '@dydxprotocol/solo';
import { EventEmitter } from 'events';
import { ORDERS_STATUS_CHANGES } from '../constants/Topics';

const ORDERS: IResponseOrder[] = [];

class OrdersMonitor {
  private observerEvents: EventEmitter;
  private ordersManager: any;
  private redisManager: IRedisManager;
  private redisEvents: EventEmitter;
  private awsManager: IAwsManager;
  private sqsPublisher: ISQSPublisher;

  constructor(
    event: EventEmitter,
    ordersManager: any,
    redisManager: IRedisManager,
    awsManager: IAwsManager,
    sqsPublisher: ISQSPublisher
  ) {
    this.observerEvents = event;
    this.ordersManager = ordersManager;
    this.redisManager = redisManager;
    this.redisEvents = this.redisManager.getEmitter();
    this.awsManager = awsManager;
    this.sqsPublisher = sqsPublisher;
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
    // ORDERS.push({
    //   account: '0x0C700c6131D43A305B76A712226E167C275f332d',
    //   id: '0x5b835ed756b8b0bf64c42ac03201ac89e29c9d464c76e95da08e303b95cc77c1',
    //   pair: 'WETH-DAI',
    //   side: 'sell',
    //   createdAt: '2019-12-10T22:16:14.841Z',
    //   expiresAt: '2019-12-10T22:16:19.841Z',
    //   price: 145.90000000000003,
    //   amount: 0.1,
    //   status: 'OPEN',
    //   amountFilled: 0.1,
    //   amountRemaining: 0
    // });
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
    ORDERS.forEach((oldOrder: IResponseOrder, index: number) => {
      const updatedOrder: any = updatedOrders.find(
        (item: IResponseOrder) => item.id === oldOrder.id
      );
      if (updatedOrder && oldOrder.status !== updatedOrder.status) {
        const orderState: IOrderStatus = {
          orderId: updatedOrder.id,
          orderStatus: updatedOrder.status
        };
        if (
          updatedOrder.status.includes(ApiOrderStatus.FILLED) ||
          updatedOrder.status.includes(ApiOrderStatus.CANCELED)
        ) {
          this.redisManager.setOrderInCache(updatedOrder);
          this.redisManager.deleteCachedOpenOrder(oldOrder);
          ORDERS.splice(index, 1);
          this.awsManager.publishLogToSNS(ORDERS_STATUS_CHANGES, updatedOrder);
        } else if (updatedOrder.status.includes(ApiOrderStatus.PARTIALLY_FILLED)) {
          this.redisManager.updateCachedOpenOrder(updatedOrder, index);
          ORDERS[index] = updatedOrder;
          this.awsManager.publishLogToSNS(ORDERS_STATUS_CHANGES, updatedOrder);
        } else {
          ORDERS[index] = updatedOrder;
          this.redisManager.updateCachedOpenOrder(updatedOrder, index);
        }
        this.sqsPublisher.publishToSQS(ORDERS_STATUS_CHANGES, JSON.stringify(orderState));
        this.observerEvents.emit(ORDERS_STATUS_CHANGES, updatedOrder);
      }
    });
  }
}

export default OrdersMonitor;
