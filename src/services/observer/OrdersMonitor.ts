import { ApiOrderStatus } from '@dydxprotocol/solo';
import { gettersService, StateManager } from '@services';
import { IState } from '@entities';
import { logger } from '@shared';
import _ from 'lodash';
import { ORDERS_STATUS_CHANGES } from '@topics';
import {
  TRADER_ORDER_STATUS_CHANGES,
  TRADER_ORDER_STATUS_CHANGES_ERROR
} from '../../constants/logTypes';
import Logger from '../../loggers/Logger';

export default class OrdersMonitor {
  private _stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this._stateManager = stateManager;
  }

  public async checkForUpdates() {
    logger.debug('checking for orders updates');

    const { state } = this._stateManager;
    const openOrders = this.getOpenOrdersFromState(state);
    if (!openOrders.length) {
      logger.debug('There are no open orders');
      return;
    }

    await Promise.all(
      openOrders.map(async (currentOrder) => {
        try {
          const updatedOrder = await gettersService.getOrderById(currentOrder.id);
          const currentOperation = this._stateManager.state.operations.find(
            (operation) => operation.orderId === currentOrder.id
          );
          if (updatedOrder.status !== currentOrder.status) {
            Logger.log(
              {
                details: updatedOrder,
                topic: ORDERS_STATUS_CHANGES,
                ...currentOperation
              },
              TRADER_ORDER_STATUS_CHANGES
            );
            logger.debug(`Order: ${currentOrder.id} updated`);
            this._stateManager.setOrderStatus(currentOrder.id, updatedOrder.status);
            return;
          }
        } catch (err) {
          Logger.log(
            {
              details: err,
              topic: ORDERS_STATUS_CHANGES
            },
            TRADER_ORDER_STATUS_CHANGES_ERROR
          );
          logger.error('Orders Monitor Error', err);
        }
      })
    );
  }

  private getOpenOrdersFromState(state: IState) {
    return state.orders.filter(
      (order) =>
        order.status === ApiOrderStatus.OPEN || order.status === ApiOrderStatus.PENDING
    );
  }
}
