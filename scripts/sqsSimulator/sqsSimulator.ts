import { SQS } from 'aws-sdk';
import SQSPublisher from './SQSPublisher';
import { ORDERS_BUY } from '../../src/constants/Topics';

const ORDERS = [
  { price: 145, amount: 0.1, side: 0, pair: 'WETH-DAI' },
  { price: 145, amount: 0.1, side: 1, pair: 'WETH-DAI' },
  { price: 145.5, amount: 0.1, side: 0, pair: 'WETH-DAI' },
  { price: 145.5, amount: 0.1, side: 1, pair: 'WETH-DAI' },
  { price: 150, amount: 0.1, side: 0, pair: 'WETH-DAI' },
  { price: 150, amount: 0.1, side: 1, pair: 'WETH-DAI' }
];
const sqs = new SQS({
  region: process.env.SQS_REGION || 'us-east-1',
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
});
const consumerQueueUrl =
  process.env.CONSUMER_QUEUE_URL ||
  'https://sqs.us-east-1.amazonaws.com/949045345033/test1.fifo';
const SENDER = process.env.SENDER_NAME || 'dydx-operator';

const sqsPublisher = new SQSPublisher(sqs, consumerQueueUrl, {
  sender: SENDER
});

(async () => {
  ORDERS.forEach((order) => {
    sqsPublisher.publishToSQS(ORDERS_BUY, JSON.stringify(order));
  });
  console.log('SQS OK: orders sendeds');
})();
