import { ApiOrderStatus } from '@dydxprotocol/solo';
import { gettersService } from '@services';
import StateManager from '../StateManager';
import { IState } from '@entities';
import { logger } from '@shared';
import _ from 'lodash';

export default class OrdersMonitor {
  private _stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this._stateManager = stateManager;
  }

  public async checkForUpdates() {
    logger.debug('checking for orders updates');

    const { state } = this._stateManager;
    const openOrders = this.getOpenOrdersFromState(state);
    if(!openOrders.length) {
      logger.debug('There are no open orders');
      return;
    }

    await Promise.all(
      openOrders.map(async (currentOrder) => {
        try {
          const updatedOrder = await gettersService.getOrderById(currentOrder.id);
          if (updatedOrder.status !== currentOrder.status) {
            this._stateManager.setOrderStatus(currentOrder.id, updatedOrder.status);
            logger.debug(`Order: ${currentOrder.id} updated`);
            return;
          }
        } catch (err) {
          logger.error('Funds Monitor Error', err);
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
