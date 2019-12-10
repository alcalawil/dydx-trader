import ordersMonitorFactory from './ordersMonitor';
import fundsMonitorFactory from './fundsMonitor';
import ordersFactory from '../modules/ordersManager';
import fundsFactory from '../modules/fundsManager';
import awsManager from '../modules/awsManager';
import { solo } from '../modules/solo';
import { EventEmitter } from 'events';
import { IRedisManager, ISQSPublisher } from '@entities';

let observerInterval: NodeJS.Timeout;
const observerEvents = new EventEmitter();
const ordersManager = ordersFactory(solo);
const fundsManager = fundsFactory(solo);

class Observer {
  private ordersMonitor: any;
  private fundsMonitor: any;
  private interval: number;

  constructor(
    interval: number,
    redisManager: IRedisManager,
    sqsPublisher: ISQSPublisher
  ) {
    this.ordersMonitor = new ordersMonitorFactory(
      observerEvents,
      ordersManager,
      redisManager,
      awsManager,
      sqsPublisher
    );
    this.fundsMonitor = new fundsMonitorFactory(
      observerEvents,
      redisManager,
      awsManager,
      fundsManager,
      sqsPublisher
    );
    this.interval = interval;
  }

  public startInterval() {
    observerInterval = setInterval(() => {
      this.ordersMonitor.checkOrdersStatus();
    }, this.interval * 1000);
  }

  public stopInterval() {
    clearInterval(observerInterval);
  }
}

export default Observer;
