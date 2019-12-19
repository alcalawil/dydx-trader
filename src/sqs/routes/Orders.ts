import { soloManager, awsManager, ordersFactory } from '@services';
import { logger } from '@shared';
import {
  ORDERS_CANCEL,
  ORDERS_PLACE,
  ORDERS_BUY,
  ORDERS_SELL,
  ORDERS_CANCEL_ALL,
  ORDERS_BUY_MANY,
  ORDERS_SELL_MANY,
  ORDERS_PLACE_RESPONSE,
  ORDERS_BUY_RESPONSE,
  ORDERS_SELL_RESPONSE,
  ORDERS_CANCEL_RESPONSE,
  ORDERS_BUY_MANY_RESPONSE,
  ORDERS_CANCEL_ALL_RESPONSE,
  ORDERS_PLACE_MANY,
  ORDERS_PLACE_MANY_RESPONSE
} from '../../constants/Topics';
import SQSPublisher from '../SQSPublisher';
import SQSRouter from '../SQSRouter';
import { IRedisManager } from '@entities';
import { EventEmitter } from 'events';

const router = new SQSRouter();
let _sqsPublisher: SQSPublisher;

// FIXME: fundsManager class should be instanced once
let ordersManager = ordersFactory(soloManager);

/* PLACE ORDER ROUTE */
router.createRoute(ORDERS_PLACE, async (body: any) => {
  const topic = ORDERS_PLACE;
  try {
    const { side, amount, price, pair, operationId } = body;
    const orderResponse = await ordersManager.placeOrder(
      {
        side,
        amount,
        price
      },
      pair
    );

    logger.debug(`Topic ${topic} is working`);
    awsManager.publishLogToSNS(topic, orderResponse);
    publishResponseToSQS(ORDERS_PLACE_RESPONSE, operationId, orderResponse);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

/* BUY ORDER ROUTE */
router.createRoute(ORDERS_BUY, async (body: any) => {
  const topic = ORDERS_BUY;
  const responseTopic = ORDERS_BUY_RESPONSE;
  try {
    const { operationId, price, amount, pair } = body;
    const orderResponse = await ordersManager.buy(price, amount, pair);

    logger.debug(`Topic ${topic} is working`);
    awsManager.publishLogToSNS(topic, orderResponse);
    publishResponseToSQS(responseTopic, operationId, orderResponse);

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
    const orderResponse = await ordersManager.sell(price, amount, pair);

    logger.debug(`Topic ${topic} is working`);
    awsManager.publishLogToSNS(topic, orderResponse);
    publishResponseToSQS(ORDERS_SELL_RESPONSE, operationId, orderResponse);

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
    publishResponseToSQS(ORDERS_CANCEL_RESPONSE, operationId, response);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

router.createRoute(ORDERS_PLACE_MANY, async (body: any) => {
  const topic = ORDERS_PLACE_MANY;
  // FIXME: order as any porque el types cexOrder de la estrategia es distinto al del bot (corregir eso)
  const operations: { operationId: string; order: any }[] = body;
  try {
    const bodyResponse = await Promise.all(
      operations.map(async ({ operationId, order }) => {
        const {
          side,
          amount,
          price,
          pair
        }: { side: number; amount: number; price: number; pair: string } = order;
        logger.debug('ORDER >> ', order);
        const responseOrder = await ordersManager.placeOrder(
          {
            side,
            amount,
            price
          },
          pair
        );
        return {
          operationId,
          responseOrder
        };
      })
    );

    logger.debug(`Topic ${topic} is working`);
    awsManager.publishLogToSNS(topic, bodyResponse);
    publishResponseToSQS(
      ORDERS_PLACE_MANY_RESPONSE,
      operations[0].operationId,
      bodyResponse
    );
    return;
  } catch (err) {
    logger.error(topic, err);
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
    publishResponseToSQS(ORDERS_BUY_MANY_RESPONSE, operationId, response);

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
    publishResponseToSQS(ORDERS_SELL_MANY, operationId, response);

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
    publishResponseToSQS(ORDERS_CANCEL_ALL_RESPONSE, operationId, response);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

// TODO: Create Route PLACE_MANY

const publishResponseToSQS = (topic: string, operationId: string, response: object) => {
  const body = {
    operationId,
    response
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
  // TODO: Porque no usar el "ordersManager" que esta declado al principio de este archivo?
  ordersManager = ordersFactory(soloManager, observerEmitter, redisManger);
  return router;
};
