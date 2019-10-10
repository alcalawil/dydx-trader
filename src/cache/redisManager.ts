import redis from 'redis';
import { IResponseOrder, IFundsBalances } from '../entities';
import { EventEmitter } from 'events';
import { logger } from '../shared/Logger';

const HOST = process.env.REDIS_HOST || '192.168.99.100';
const PORT = parseInt(process.env.REDIS_PORT || '6379');
const client = redis.createClient(PORT, HOST);
const emitter = new EventEmitter();

client.on('connect', () => logger.info(`Connected to redis through ${HOST}:${PORT}`));

export const setOpenOrderInCache = (order: IResponseOrder) => {
  client.rpush('openOrders', JSON.stringify(order));
  emitter.emit('pushedOrder', order);
};

export const setOrderInCache = (order: IResponseOrder) => {
  client.rpush('orders', JSON.stringify(order));
};

export const setBalance = (balance: IFundsBalances) => {
  client.rpush('balances', JSON.stringify(balance));
};

export const getCachedOpenOrders = (): Promise<IResponseOrder[]> =>
  new Promise((resolve, reject) => {
    client.lrange('openOrders', 0, -1, (err, values) => {
      if (err) {
        return reject(err);
      }
      const data: IResponseOrder[] = values.map((item: string) => JSON.parse(item));
      resolve(data);
    });
  });

export const getCachedOrders = (): Promise<IResponseOrder[]> =>
  new Promise((resolve, reject) => {
    client.lrange('orders', 0, -1, (err, values) => {
      if (err) {
        return reject(err);
      }
      const data: IResponseOrder[] = values.map((item: string) => JSON.parse(item));
      resolve(data);
    });
  });

export const getBalances = (): Promise<IFundsBalances[]> =>
  new Promise((resolve, reject) => {
    client.lrange('balances', 0, -1, (err, values) => {
      if (err) {
        return reject(err);
      }
      const data: IFundsBalances[] = values.map((item: string) => JSON.parse(item));
      resolve(data);
    });
  });

export const getBalance = (account: string): Promise<IFundsBalances> =>
  new Promise((resolve, reject) => {
    client.lrange('balances', 0, -1, (err, values) => {
      if (err) {
        return reject(err);
      }
      values.map((item: string) => {
        const balance: IFundsBalances = JSON.parse(item);
        if (balance.account.includes(account)) {
          resolve(balance);
        }
      });
      resolve();
    });
  });

export const deleteCachedOpenOrder = (order: IResponseOrder) => {
  client.lrem('openOrders', 1, JSON.stringify(order));
};

export const updateCachedOpenOrder = (order: IResponseOrder, index: number) => {
  client.lset('openOrders', index, JSON.stringify(order));
};

export const updateBalance = (balance: IFundsBalances, index: number) => {
  client.lset('balances', index, JSON.stringify(balance));
};

export const getEmitter = () => {
  return emitter;
};
