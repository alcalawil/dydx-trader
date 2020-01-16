import FundsMonitor from './FundsMonitor';
import OrdersMonitor from './OrdersMonitor';
import { StateManager } from '@services';
import { observer } from '@entities';
import config from '@config';
import SNSLogger from '../../sns/SNSLogger';

let observersInterval: observer;

const FUND_MONITOR_INTERVAL = config.observer.interval.fundMonitor * 1000;
const ORDER_MONITOR_INTERVAL = config.observer.interval.orderMonitor * 1000;

class ObserverSerService {
  private fundsMonitor: FundsMonitor;
  private ordersMonitor: OrdersMonitor;

  constructor(stateManager: StateManager, snsLogger: SNSLogger) {
    this.fundsMonitor = new FundsMonitor(stateManager, snsLogger);
    this.ordersMonitor = new OrdersMonitor(stateManager, snsLogger);
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

export const Observer = (stateManager: StateManager, snsLogger: SNSLogger) =>
  new ObserverSerService(stateManager, snsLogger);
