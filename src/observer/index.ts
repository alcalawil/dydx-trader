import ordersMonitorFactory from './ordersMonitor';
import fundsMonitorFactory from './fundsMonitor';
import { EventEmitter } from 'events';

const OBSERVER_INTERVAL = parseInt(process.env.OBSERVER_INTERVAL || '1');
let observerInterval: NodeJS.Timeout;
const observerEvents = new EventEmitter();

class Observer {
  private ordersMonitor = new ordersMonitorFactory(observerEvents);
  private fundsMonitor = new fundsMonitorFactory(observerEvents);

  public startInterval() {
    observerInterval = setInterval(() => {
      this.ordersMonitor.checkOrdersStatus();
    }, OBSERVER_INTERVAL * 1000);
  }

  public stopInterval() {
    clearInterval(observerInterval);
  }
}

export default new Observer();
