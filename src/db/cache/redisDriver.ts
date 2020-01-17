import redis, { RedisClient } from 'redis';
import { promisifyAll } from 'bluebird';
import { logger } from '@shared';
import { ICacheDB } from '@entities';

const redisPromises = promisifyAll(redis);

class RedisDriver implements ICacheDB {
  private client: RedisClient;
  // public getAsync: (key: string) => Promise<string>;

  constructor({ host, port }: { host: string; port: number }) {
    this.client = redisPromises.createClient(port, host);

    this.client.on('connect', () =>
      logger.info(`Connected to redis through ${host}:${port}`)
    );

    this.client.on('error', (err) => {
      logger.error('Error ' + err);
    });
  }

  public async getValueFromCache(key: string) {
    return this.client.getAsync(key);
  }

  public async setValueInCache(key: string, value: string) {
    return this.client.setAsync(key, value);
  }
}

export default ({ host, port }: { host: string; port: number }) =>
  new RedisDriver({ host, port });
