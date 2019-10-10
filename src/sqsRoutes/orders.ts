import { ISQSRoute } from '@entities';
import { solo } from '../modules/solo';
import ordersManagerFactory from '../modules/ordersManager';
import { logger } from '@shared';
import {
  ORDERS_CANCEL,
  ORDERS_PLACE,
  ORDERS_BUY,
  ORDERS_SELL,
  ORDERS_CANCELL_ALL,
  ORDERS_BUY_MANY,
  ORDERS_SELL_MANY
} from '../constants/Topics';
import awsManager from '../modules/awsManager';

const ordersManager = ordersManagerFactory(solo); // FIXME: fundsManager class should be instanced once

const testRoute: ISQSRoute = {
  topic: 'TEST_TOPIC',
  handler: async (body: any) => {
    logger.info('TEST_TOPIC working!!!', body);
    return;
  }
};

const cancelRoute: ISQSRoute = {
  topic: ORDERS_CANCEL,
  handler: async (body: any) => {
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
  }
};

const placeOrderRoute: ISQSRoute = {
  topic: ORDERS_PLACE,
  handler: async (body: any) => {
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
  }
};

const buyOrderRoute: ISQSRoute = {
  topic: ORDERS_BUY,
  handler: async (body: any) => {
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
  }
};

const sellOrderRoute: ISQSRoute = {
  topic: ORDERS_SELL,
  handler: async (body: any) => {
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
  }
};

const cancelAllRoute: ISQSRoute = {
  topic: ORDERS_CANCELL_ALL,
  handler: async (body: any) => {
    const topic = ORDERS_CANCELL_ALL;
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
  }
};

const buyManyRoute: ISQSRoute = {
  topic: ORDERS_BUY_MANY,
  handler: async (body: any) => {
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
  }
};

const sellManyRoute: ISQSRoute = {
  topic: ORDERS_SELL_MANY,
  handler: async (body: any) => {
    const topic = ORDERS_SELL_MANY;
    const side = 'sell';
    try {
      const { amount, adjust, pair } = body;
      const result = await ordersManager.postMany(amount, adjust, side, pair);
      // Here add result to the application state or/and publish to sqs
      awsManager.publishLogToSNS('sellMany', result);
      logger.info(`Topic ${topic} is working`);
      return result;
    } catch (err) {
      logger.error(topic, err.message);
      throw err;
    }
  }
};

export default [
  testRoute,
  cancelRoute,
  placeOrderRoute,
  buyOrderRoute,
  sellOrderRoute,
  cancelAllRoute,
  buyManyRoute,
  sellManyRoute
];
