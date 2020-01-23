import FundsMonitor from './FundsMonitor';
import OrdersMonitor from './OrdersMonitor';
import { StateManager } from '@services';
import { observer } from '@entities';
import config from '@config';

let observersInterval: observer;

const FUND_MONITOR_INTERVAL = config.intervals.fundMonitor;
const ORDER_MONITOR_INTERVAL = config.intervals.orderMonitor;

class ObserverSerService {
  private fundsMonitor: FundsMonitor;
  private ordersMonitor: OrdersMonitor;

  constructor(stateManager: StateManager) {
    this.fundsMonitor = new FundsMonitor(stateManager);
    this.ordersMonitor = new OrdersMonitor(stateManager);
  }

  public startInterval() {
    observersInterval = [
      setInterval(() => {
        this.fundsMonitor.checkForUpdates();
      }, FUND_MONITOR_INTERVAL),

      setInterval(() => {
        this.ordersMonitor.checkForUpdates();
      }, ORDER_MONITOR_INTERVAL)
    ];
  }

  public stopInterval() {
    observersInterval.map((monitor: NodeJS.Timeout) => {
      clearInterval(monitor);
    });
  }
}

export const Observer = (stateManager: StateManager) =>
  new ObserverSerService(stateManager);
