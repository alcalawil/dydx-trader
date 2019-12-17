import ordersMonitorFactory from './ordersMonitor';
import fundsMonitorFactory from './fundsMonitor';
import { soloManager, awsManager, ordersFactory, fundsFactory } from '@services';
import { IRedisManager, ISQSPublisher, IOrdersMonitor, IFundsMonitor } from '@entities';
import { EventEmitter } from 'events';

let observerInterval: NodeJS.Timeout;
const observerEvents = new EventEmitter();
const ordersManager = ordersFactory(soloManager);
const fundsManager = fundsFactory(soloManager);

class Observer {
  private ordersMonitor: IOrdersMonitor;
  private fundsMonitor: IFundsMonitor;
  private interval: number;

  constructor(
    interval: number,
    sqsPublisher: ISQSPublisher,
    redisManager?: IRedisManager
  ) {
    this.ordersMonitor = ordersMonitorFactory(
      observerEvents,
      ordersManager,
      awsManager,
      sqsPublisher
    );
    this.fundsMonitor = fundsMonitorFactory(awsManager, fundsManager, sqsPublisher);
    this.interval = interval;
  }

  public startInterval() {
    this.fundsMonitor.initialize();
    observerInterval = setInterval(() => {
      this.ordersMonitor.checkOrdersStatus();
      this.fundsMonitor.checkBalance();
    }, this.interval * 1000);
  }

  public stopInterval() {
    clearInterval(observerInterval);
  }

  public get observerEmitter() {
    return observerEvents;
  }
}

export default Observer;
