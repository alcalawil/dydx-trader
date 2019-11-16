import IConfig from 'src/entities/IConfig';

const config: IConfig = {
  sqs: {
    consumerQueueUrl: process.env.CONSUMER_QUEUE_URL || 'https://sqs.us-east-1.amazonaws.com/949045345033/test.fifo'
  }
};

export default config;
