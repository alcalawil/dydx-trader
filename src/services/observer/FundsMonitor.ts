import _ from 'lodash';
import { logger } from '@shared';
import { StateManager } from '@services';
import { gettersService } from '@services';

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
        return;
      }
    } catch (err) {
      logger.error('Funds Monitor Error', err);
    }
  }
}
