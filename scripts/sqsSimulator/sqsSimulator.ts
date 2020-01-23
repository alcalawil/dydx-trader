import { SQS } from 'aws-sdk';
import SQSPublisher from './SQSPublisher';
import { ORDERS_BUY } from '@src/constants/Topics';
import config from '@config';

/* LOAD CONFIG */
const REGION_SQS: string = config.aws.region.sqs;
const ACCESS_KEY_ID: string = config.aws.accessKeyId;
const SECRET_ACCESS_KEY: string = config.aws.secretAccessKey;
const SENDER_NAME: string = config.sqs.senderName;
const STRATEGY_QUEUE_URL: string = config.sqs.strategyQueueUrl;

const sqs = new SQS({
  region: REGION_SQS,
  accessKeyId: ACCESS_KEY_ID,
  secretAccessKey: SECRET_ACCESS_KEY
});

const ORDERS = [
  { price: 145, amount: 0.1, side: 0, pair: 'WETH-DAI' },
  { price: 145, amount: 0.1, side: 1, pair: 'WETH-DAI' },
  { price: 145.5, amount: 0.1, side: 0, pair: 'WETH-DAI' },
  { price: 145.5, amount: 0.1, side: 1, pair: 'WETH-DAI' },
  { price: 150, amount: 0.1, side: 0, pair: 'WETH-DAI' },
  { price: 150, amount: 0.1, side: 1, pair: 'WETH-DAI' }
];

const sqsPublisher = new SQSPublisher(sqs, STRATEGY_QUEUE_URL, {
  sender: SENDER_NAME
});

(async () => {
  ORDERS.forEach((order) => {
    sqsPublisher.publishToSQS(ORDERS_BUY, JSON.stringify(order));
  });
  console.log('SQS OK: orders sendeds');
})();
