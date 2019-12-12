import ordersMonitorFactory from './ordersMonitor';
import fundsMonitorFactory from './fundsMonitor';
import ordersFactory from '../modules/ordersManager';
import fundsFactory from '../modules/fundsManager';
import awsManager from '../modules/awsManager';
import { solo } from '../modules/solo';
import { EventEmitter } from 'events';
import { IRedisManager, ISQSPublisher, IOrdersMonitor, IFundsMonitor } from '@entities';

let observerInterval: NodeJS.Timeout;
const observerEvents = new EventEmitter();
const ordersManager = ordersFactory(solo);
const fundsManager = fundsFactory(solo);

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
