import {
  getCachedOpenOrders,
  getEmitter,
  setOrderInCache,
  deleteCachedOpenOrder,
  updateCachedOpenOrder
} from '../cache/redisManager';
import { IResponseOrder } from '../entities';
import { solo } from '../modules/solo';
import ordersManagerFactory from '../modules/ordersManager';
import awsManager from '../modules/awsManager';
import { logger } from '../shared/Logger';
import { ApiOrderStatus } from '@dydxprotocol/solo';
import { EventEmitter } from 'events';

const ordersManager = ordersManagerFactory(solo);
const ORDERS: IResponseOrder[] = [];
const redisEvents = getEmitter();

class OrdersMonitor {
  private observerEvents: EventEmitter;
  constructor(event: EventEmitter) {
    this.initialize();
    this.observerEvents = event;
  }

  private async initialize() {
    await getCachedOpenOrders()
      .then((orders: IResponseOrder[]) => {
        orders.forEach((item: IResponseOrder) => {
          ORDERS.push(item);
        });
      })
      .catch((err: any) => logger.error('Error =>', JSON.stringify(err)));

    redisEvents.on('pushedOrder', (order: IResponseOrder) => {
      logger.info(`Order ${order.id} was pushed for account ${order.account}`);
      ORDERS.push(order);
    });
  }

  public async checkOrdersStatus() {
    const updatedOrders = await this.getUpdatedOrders(ORDERS);
    this.statusDiffed(updatedOrders);
  }

  private async getUpdatedOrders(orders: IResponseOrder[]) {
    return await Promise.all(orders.map((order) => ordersManager.getOrderById(order.id)));
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
          setOrderInCache(updatedOrder);
          deleteCachedOpenOrder(order);
          ORDERS.splice(index, 1);
          awsManager.publishLogToSNS('orderChanges', updatedOrder);
        } else if (updatedOrder.status.includes(ApiOrderStatus.PARTIALLY_FILLED)) {
          updateCachedOpenOrder(updatedOrder, index);
          ORDERS[index] = updatedOrder;
          awsManager.publishLogToSNS('orderChanges', updatedOrder);
        } else {
          ORDERS[index] = updatedOrder;
          updateCachedOpenOrder(updatedOrder, index);
        }
        awsManager.publishToSQS('orderChanges', updatedOrder);
        this.observerEvents.emit('orderChanges', updatedOrder);
      }
    });
  }
}

export default OrdersMonitor;
