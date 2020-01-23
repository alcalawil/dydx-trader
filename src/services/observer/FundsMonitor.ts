import _ from 'lodash';
import { logger } from '@shared';
import { StateManager } from '@services';
import { gettersService } from '@services';
import {
  TRADER_REQUEST_BALANCE,
  TRADER_REQUEST_BALANCE_ERROR
} from '../../constants/logTypes';
import Logger from '../../loggers/Logger';

export default class FundsMonitor {
  private _stateManager: StateManager;

  constructor(stateManager: StateManager) {
    this._stateManager = stateManager;
  }

  public async checkForUpdates() {
    const currentBalance = this._stateManager.state.balances;
    try {
      const newBalance = await gettersService.getBalances();
      logger.debug(JSON.stringify(newBalance));
      if (!_.isEqual(currentBalance, newBalance)) {
        this._stateManager.setBalances(newBalance);
        logger.debug('Balance updated');
        Logger.log(
          {
            details: newBalance
          },
          TRADER_REQUEST_BALANCE
        );
        return;
      }
    } catch (err) {
      Logger.log(
        {
          details: err
        },
        TRADER_REQUEST_BALANCE_ERROR
      );
      logger.error('Funds Monitor Error', err);
    }
  }
}
