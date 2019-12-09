import { ISQSRoute } from '@entities';
import { solo } from '../../modules/solo';
import ordersManagerFactory from '../../modules/ordersManager';
import { logger } from '@shared';
import {
  ORDERS_CANCEL,
  ORDERS_PLACE,
  ORDERS_BUY,
  ORDERS_SELL,
  ORDERS_CANCEL_ALL,
  ORDERS_BUY_MANY,
  ORDERS_SELL_MANY
} from '../../constants/Topics';
import awsManager from '../../modules/awsManager';
import SQSPublisher from '../SQSPublisher';
import { SQS } from 'aws-sdk';

import SQSRouter from '../SQSRouter';

const router = new SQSRouter(); 

let _sqsPublisher: SQSPublisher;

const ordersManager = ordersManagerFactory(solo); // FIXME: fundsManager class should be instanced once


router.createRoute(ORDERS_CANCEL, async (body: any) => {
  const topic = ORDERS_CANCEL;
  try {
    const { orderId } = body;
    const result = await ordersManager.cancelOrder(orderId);
    // Here add result to the application state or/and publish to sqs

    logger.info(`Topic ${topic} is working`);
    return result;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

router.createRoute(ORDERS_PLACE, async (body: any) => {
  const topic = ORDERS_PLACE;
  try {
    const { side, amount, price, pair } = body;
    const result = await ordersManager.placeOrder(
      {
        side,
        amount,
        price
      },
      pair
    );
    // Here add result to the application state or/and publish to sqs
    awsManager.publishLogToSNS('place', result);
    logger.info(`Topic ${topic} is working`);
    return result;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

router.createRoute(ORDERS_BUY, async (body: any) => {
  const topic = ORDERS_BUY;
  try {
    const { price, amount, pair } = body;
    const result = await ordersManager.buy(price, amount, pair);
    // Here add result to the application state or/and publish to sqs
    awsManager.publishLogToSNS('buy', result);
    logger.info(`Topic ${topic} is working`);
    return result;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

router.createRoute(ORDERS_SELL, async (body: any) => {
  const topic = ORDERS_SELL;
  try {
    const { price, amount, pair } = body;
    const result = await ordersManager.sell(price, amount, pair);
    // Here add result to the application state or/and publish to sqs
    awsManager.publishLogToSNS('sell', result);
    logger.info(`Topic ${topic} is working`);
    return result;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

router.createRoute(ORDERS_CANCEL_ALL, async (body: any) => {
  const topic = ORDERS_CANCEL_ALL;
  try {
    const { pair } = body;
    const result = await ordersManager.cancelMyOrders(pair);
    // Here add result to the application state or/and publish to sqs

    logger.info(`Topic ${topic} is working`);
    return result;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

router.createRoute(ORDERS_BUY_MANY, async (body: any) => {
  const topic = ORDERS_BUY_MANY;
  const side = 'buy';
  try {
    const { amount, adjust, pair } = body;
    const result = await ordersManager.postMany(amount, adjust, side, pair);
    // Here add result to the application state or/and publish to sqs
    awsManager.publishLogToSNS('buyMany', result);
    logger.info(`Topic ${topic} is working`);
    return result;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

export default (sqsPublisher: SQSPublisher) => {
  _sqsPublisher = sqsPublisher;
  return router;
}