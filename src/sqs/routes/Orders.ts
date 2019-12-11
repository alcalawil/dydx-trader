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
import { IRedisManager } from '@entities';
import { EventEmitter } from 'events';

const router = new SQSRouter();

let _sqsPublisher: SQSPublisher;

let ordersManager = ordersManagerFactory(solo); // FIXME: fundsManager class should be instanced once

/* PLACE ORDER ROUTE */
router.createRoute(ORDERS_PLACE, async (body: any) => {
  const topic = ORDERS_PLACE;
  try {
    const { side, amount, price, pair, operationId } = body;
    const response = await ordersManager.placeOrder(
      {
        side,
        amount,
        price
      },
      pair
    );

    logger.debug(`Topic ${topic} is working`);
    awsManager.publishLogToSNS(topic, response);
    publishResponseToSQS(topic, operationId, response);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

/* BUY ORDER ROUTE */
router.createRoute(ORDERS_BUY, async (body: any) => {
  const topic = ORDERS_BUY;
  const responseTopic = 'ORDERS_BUY_RESPONSE';
  try {
    const { operationId, price, amount, pair } = body;
    const response = await ordersManager.buy(price, amount, pair);

    logger.debug(`Topic ${topic} is working`);
    awsManager.publishLogToSNS(topic, response);
    publishResponseToSQS(responseTopic, operationId, response);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

/* SELL ORDER ROUTE */
router.createRoute(ORDERS_SELL, async (body: any) => {
  const topic = ORDERS_SELL;
  try {
    const { operationId, price, amount, pair } = body;
    const response = await ordersManager.sell(price, amount, pair);

    logger.debug(`Topic ${topic} is working`);
    awsManager.publishLogToSNS(topic, response);
    publishResponseToSQS(topic, operationId, response);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

/* CANCEL ORDER ROUTE */
router.createRoute(ORDERS_CANCEL, async (body: any) => {
  const topic = ORDERS_CANCEL;
  try {
    const { operationId, orderId } = body;
    const response = await ordersManager.cancelOrder(orderId);
    // Here add result to the application state or/and publish to sqs

    logger.debug(`Topic ${topic} is working`);
    awsManager.publishLogToSNS(topic, response);
    publishResponseToSQS(topic, operationId, response);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

/* ORDERS BUY MANY ROUTE */
router.createRoute(ORDERS_BUY_MANY, async (body: any) => {
  const topic = ORDERS_BUY_MANY;
  const side = 'buy';
  try {
    const { operationId, amount, adjust, pair } = body;
    const response = await ordersManager.postMany(amount, adjust, side, pair);

    logger.debug(`Topic ${topic} is working`);
    awsManager.publishLogToSNS(topic, response);
    publishResponseToSQS(topic, operationId, response);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

/* ORDERS SELL MANY ROUTE */
router.createRoute(ORDERS_SELL_MANY, async (body: any) => {
  const topic = ORDERS_SELL_MANY;
  const side = 'sell';
  try {
    const { operationId, amount, adjust, pair } = body;
    const response = await ordersManager.postMany(amount, adjust, side, pair);

    logger.debug(`Topic ${topic} is working`);
    awsManager.publishLogToSNS(topic, response);
    publishResponseToSQS(topic, operationId, response);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

/* CANCEL ALL ORDER ROUTE */
router.createRoute(ORDERS_CANCEL_ALL, async (body: any) => {
  const topic = ORDERS_CANCEL_ALL;
  try {
    const { operationId, pair } = body;
    const response = await ordersManager.cancelMyOrders(pair);

    logger.debug(`Topic ${topic} is working`);
    awsManager.publishLogToSNS(topic, response);
    publishResponseToSQS(topic, operationId, response);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

const publishResponseToSQS = (topic: string, operationId: string, response: object) => {
  const body = {
    operationId,
    ...response
  };

  _sqsPublisher.publishToSQS(topic, JSON.stringify(body), {
    operationId: {
      DataType: 'String',
      StringValue: operationId
    }
  });
};

export default (
  sqsPublisher: SQSPublisher,
  observerEmitter: EventEmitter,
  redisManger?: IRedisManager
) => {
  _sqsPublisher = sqsPublisher;
  ordersManager = ordersManagerFactory(solo, observerEmitter, redisManger);
  return router;
};
