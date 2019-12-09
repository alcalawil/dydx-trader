import IConfig from 'src/entities/IConfig';

const config: IConfig = {
  sqs: {
    consumerQueueUrl:
      process.env.CONSUMER_QUEUE_URL ||
      'https://sqs.us-east-1.amazonaws.com/949045345033/test.fifo'
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
