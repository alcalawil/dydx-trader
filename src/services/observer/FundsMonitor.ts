import _ from 'lodash';
import { logger } from '@shared';
import { StateManager } from '@services';
import { gettersService } from '@services';
import SNSLogger from '../../sns/SNSLogger';
import { logLevel } from '@entities';
import {
  TRADER_REQUEST_BALANCE,
  TRADER_REQUEST_BALANCE_ERROR
} from '../../constants/logTypes';

const DEBUG_LOG_LEVEL: logLevel = 'debug';
const ERROR_LOG_LEVEL: logLevel = 'error';
export default class FundsMonitor {
  private _stateManager: StateManager;
  private _snsLogger: SNSLogger;

  constructor(stateManager: StateManager, snsLogger: SNSLogger) {
    this._stateManager = stateManager;
    this._snsLogger = snsLogger;
  }

  public async checkForUpdates() {
    const currentBalance = this._stateManager.state.balances;
    try {
      const newBalance = await gettersService.getBalances();
      logger.debug(JSON.stringify(newBalance));
      if (!_.isEqual(currentBalance, newBalance)) {
        this._stateManager.setBalances(newBalance);
        logger.debug('Balance updated');
        this._snsLogger.LogMessage(
          `Detectado cambio en el balance.`,
          {
            details: newBalance
          },
          TRADER_REQUEST_BALANCE,
          DEBUG_LOG_LEVEL,
          '5'
        );
        return;
      }
    } catch (err) {
      this._snsLogger.LogMessage(
        `Error al consultar el balance.`,
        {
          details: err
        },
        TRADER_REQUEST_BALANCE_ERROR,
        ERROR_LOG_LEVEL
      );
      logger.error('Funds Monitor Error', err);
    }
  }
}
