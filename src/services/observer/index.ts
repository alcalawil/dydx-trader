import FundsMonitor from './FundsMonitor';
import OrdersMonitor from './OrdersMonitor';
import { StateManager } from '@services';
import { observer, ILogger } from '@entities';
import config from '@config';

let observersInterval: observer;

const FUND_MONITOR_INTERVAL = config.observer.interval.fundMonitor * 1000;
const ORDER_MONITOR_INTERVAL = config.observer.interval.orderMonitor * 1000;

class ObserverSerService {
  private fundsMonitor: FundsMonitor;
  private ordersMonitor: OrdersMonitor;

  constructor(stateManager: StateManager, logger: ILogger) {
    this.fundsMonitor = new FundsMonitor(stateManager, logger);
    this.ordersMonitor = new OrdersMonitor(stateManager, logger);
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

export const Observer = (stateManager: StateManager, logger: ILogger) =>
  new ObserverSerService(stateManager, logger);
