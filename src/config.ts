import IConfig from 'src/entities/IConfig';

const CONSUMER_QUEUE_URL =
  process.env.CONSUMER_QUEUE_URL ||
  'https://sqs.us-east-1.amazonaws.com/949045345033/test.fifo';

  // TODO: Validate this
const STRATEGY_QUEUE_URL = process.env.STRATEGY_QUEUE_URL || '';

const config: IConfig = {
  sqs: {
    consumerQueueUrl: CONSUMER_QUEUE_URL,
    region: 'us-east-1',
    strategyQueueUrl: STRATEGY_QUEUE_URL
  },
  redis: {
    port: Number(process.env.REDIS_PORT || '6379'),
    host: process.env.REDIS_HOST || ''
  },
  fundsMonitor: {
    maxEthQty: Number(process.env.MAX_QTY_ETH || '0.5')
  },
  observer: {
    interval: Number(process.env.OBSERVER_INTERVAL || '1')
  }
};

export default config;
