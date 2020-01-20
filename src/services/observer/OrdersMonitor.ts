import { ApiOrderStatus } from '@dydxprotocol/solo';
import { gettersService, StateManager } from '@services';
import { IState, logLevel, IResponseOrder, IStrategyInfo } from '@entities';
import { logger } from '@shared';
import _ from 'lodash';
import { ORDERS_STATUS_CHANGES } from '@topics';
import SNSLogger from '../../sns/SNSLogger';
import {
  TRADER_REQUEST_ORDER_STATUS,
  TRADER_REQUEST_ORDER_STATUS_ERROR
} from '../../constants/logTypes';

const ERROR_LOG_LEVEL: logLevel = 'error';

export default class OrdersMonitor {
  private _stateManager: StateManager;
  private _snsLogger: SNSLogger;

  constructor(stateManager: StateManager, snsLogger: SNSLogger) {
    this._stateManager = stateManager;
    this._snsLogger = snsLogger;
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
            this._snsLogger.LogMessage(
              `Detectado cambio de estado de una orden.`,
              {
                details: updatedOrder,
                topic: ORDERS_STATUS_CHANGES,
                ...currentOperation
              },
              TRADER_REQUEST_ORDER_STATUS
            );
            logger.debug(`Order: ${currentOrder.id} updated`);
            this._stateManager.setOrderStatus(currentOrder.id, updatedOrder.status);
            return;
          }
        } catch (err) {
          this._snsLogger.LogMessage(
            `Error al consultar estado de la orden.`,
            {
              details: err,
              topic: ORDERS_STATUS_CHANGES
            },
            TRADER_REQUEST_ORDER_STATUS_ERROR,
            ERROR_LOG_LEVEL
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
