import redis, { RedisClient } from 'redis';
import { IResponseOrder, IFundsBalances, IBalance } from '../entities';
import { EventEmitter } from 'events';
import { logger } from '@shared';

class RedisManager {
  private client: RedisClient;
  private emitter: EventEmitter;

  constructor(host: string, port: number) {
    this.client = redis.createClient(port, host);
    this.emitter = new EventEmitter();
    this.client.on('connect', () =>
      logger.info(`Connected to redis through ${host}:${port}`)
    );
    this.client.on('error', (err) => {
      logger.error('Error ' + err);
    });
  }

  public setOpenOrderInCache = (order: IResponseOrder) => {
    this.client.rpush('openOrders', JSON.stringify(order));
    this.emitter.emit('pushedOrder', order);
  };

  public setOrderInCache = (order: IResponseOrder) => {
    return this.client.rpush('orders', JSON.stringify(order));
  };

  public setBalance = (balance: IBalance) => {
    return this.client.set('balance', JSON.stringify(balance));
  };

  public setBalanceToList = (balance: IFundsBalances) => {
    this.client.rpush('balances', JSON.stringify(balance));
  };

  public getCachedOpenOrders = (): Promise<IResponseOrder[]> =>
    new Promise((resolve, reject) => {
      this.client.lrange('openOrders', 0, -1, (err, values) => {
        if (err) {
          return reject(err);
        }
        const data: IResponseOrder[] = values.map((item: string) => JSON.parse(item));
        resolve(data);
      });
    });

  public getCachedOrders = (): Promise<IResponseOrder[]> =>
    new Promise((resolve, reject) => {
      this.client.lrange('orders', 0, -1, (err, values) => {
        if (err) {
          return reject(err);
        }
        const data: IResponseOrder[] = values.map((item: string) => JSON.parse(item));
        resolve(data);
      });
    });

  public getBalancesFromList = (): Promise<IFundsBalances[]> =>
    new Promise((resolve, reject) => {
      this.client.lrange('balances', 0, -1, (err, values) => {
        if (err) {
          return reject(err);
        }
        const data: IFundsBalances[] = values.map((item: string) => JSON.parse(item));
        resolve(data);
      });
    });

  public getBalance = (): Promise<IBalance> =>
    new Promise((resolve, reject) => {
      this.client.get('balance', (err, value) => {
        if (err) {
          return reject(err);
        }
        const balance: IBalance = JSON.parse(value);
        resolve(balance);
      });
    });

  public getBalanceByAccountFromList = (account: string): Promise<IFundsBalances> =>
    new Promise((resolve, reject) => {
      this.client.lrange('balances', 0, -1, (err, values) => {
        if (err) {
          return reject(err);
        }
        values.map((item: string) => {
          const balance: IFundsBalances = JSON.parse(item);
          if (balance.virtualWalletId.includes(account)) {
            resolve(balance);
          }
        });
        resolve();
      });
    });

  public deleteCachedOpenOrder = (order: IResponseOrder) => {
    return this.client.lrem('openOrders', 1, JSON.stringify(order));
  };

  public updateCachedOpenOrder = (order: IResponseOrder, index: number) => {
    return this.client.lset('openOrders', index, JSON.stringify(order));
  };

  public updateBalance = (balance: IFundsBalances, index: number) => {
    return this.client.lset('balances', index, JSON.stringify(balance));
  };

  public getEmitter = () => {
    return this.emitter;
  };
}

export default (host: string, port: number) => new RedisManager(host, port);
