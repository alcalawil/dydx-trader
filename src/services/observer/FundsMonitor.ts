import _ from 'lodash';
import { logger } from '@shared';
import { StateManager } from '@services';
import { gettersService } from '@services';
import { ILogger } from '@entities';
import {
  TRADER_REQUEST_BALANCE,
  TRADER_REQUEST_BALANCE_ERROR
} from '../../constants/logTypes';

export default class FundsMonitor {
  private _stateManager: StateManager;
  private _logger: ILogger;

  constructor(stateManager: StateManager, Logger: ILogger) {
    this._stateManager = stateManager;
    this._logger = Logger;
  }

  public async checkForUpdates() {
    const currentBalance = this._stateManager.state.balances;
    try {
      const newBalance = await gettersService.getBalances();
      logger.debug(JSON.stringify(newBalance));
      if (!_.isEqual(currentBalance, newBalance)) {
        this._stateManager.setBalances(newBalance);
        logger.debug('Balance updated');
        this._logger.LogMessage(
          {
            details: newBalance
          },
          TRADER_REQUEST_BALANCE
        );
        return;
      }
    } catch (err) {
      this._logger.LogMessage(
        {
          details: err
        },
        TRADER_REQUEST_BALANCE_ERROR
      );
      logger.error('Funds Monitor Error', err);
    }
  }
}
