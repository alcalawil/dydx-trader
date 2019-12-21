import FundsMonitor from './FundsMonitor';
import OrdersMonitor from './OrdersMonitor';
import StateManager from '../StateManager';
import config from '@config';

let observerInterval: NodeJS.Timeout;
const INTERVAL_IN_SECONDS = config.observer.interval;

class ObserverSerService {
  private fundsMonitor: FundsMonitor;
  private ordersMonitor: OrdersMonitor;

  constructor(stateManager: StateManager) {
    this.fundsMonitor = new FundsMonitor(stateManager);
    this.ordersMonitor = new OrdersMonitor(stateManager);
  }

  public startInterval() {
    observerInterval = setInterval(() => {
      this.ordersMonitor.checkForUpdates();
      this.fundsMonitor.checkForUpdates();
    }, INTERVAL_IN_SECONDS * 1000);
  }

  public stopInterval() {
    clearInterval(observerInterval);
  }
}

export const Observer = (stateManager: StateManager) =>
  new ObserverSerService(stateManager);
