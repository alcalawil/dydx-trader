import { IConfig } from '@entities';

// TODO: Validate all this
// TODO: Validate that ENV variables are loaded before being used

const CONSUMER_QUEUE_URL =
  process.env.CONSUMER_QUEUE_URL ||
  'https://sqs.us-east-1.amazonaws.com/949045345033/test.fifo';
const STRATEGY_QUEUE_URL = process.env.STRATEGY_QUEUE_URL || '';
const TRANSACTIONAL_LOGS_QUEUE_ARN =
  process.env.TRANSACTIONAL_LOGS_QUEUE_ARN || 'arn:aws:sns:us-east-1:949045345033:test';
const  HTTP_PROVIDER = process.env.HTTP_PROVIDER || '';

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
  },
  transactionalLog: {
    queueArn: TRANSACTIONAL_LOGS_QUEUE_ARN
  },
  solo: {
    httpProvider: HTTP_PROVIDER
  }
};

export default config;
