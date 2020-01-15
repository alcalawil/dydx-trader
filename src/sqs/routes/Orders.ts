import { awsManager, operationsService } from '@services';
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
  ORDERS_PLACE_MANY_RESPONSE,
  ORDERS_CANCEL_MANY,
  ORDERS_CANCEL_MANY_RESPONSE
} from '../../constants/Topics';
import SQSPublisher from '../SQSPublisher';
import SQSRouter from '../SQSRouter';
import { IResponseOrder, ICancelResponse, ICancelOrder } from '@entities';

const router = new SQSRouter();
let _sqsPublisher: SQSPublisher;

/* PLACE ORDER ROUTE */
router.createRoute(ORDERS_PLACE, async (body: any) => {
  const topic = ORDERS_PLACE;
  try {
    const { side, amount, price, pair, operationId } = body;
    const orderResponse = await operationsService.placeOrder(
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
    const orderResponse = await operationsService.buy(price, amount, pair);

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
    const orderResponse = await operationsService.sell(price, amount, pair);

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
    const {
      operationId,
      cancelOrder
    }: { operationId: string; cancelOrder: ICancelOrder } = body;
    const response: IResponseOrder = await operationsService.cancelOrder(cancelOrder.orderId);
    const bodyResponse: ICancelResponse = { orderId: response.id };
    logger.debug(`Topic ${topic} is working`);
    awsManager.publishLogToSNS(topic, response);
    publishResponseToSQS(ORDERS_CANCEL_RESPONSE, operationId, bodyResponse);

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
        const orderResponse = await operationsService.placeOrder(
          {
            side,
            amount,
            price
          },
          pair
        );
        return {
          operationId,
          orderResponse
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

// TODO: no usar postMany porque está deprecado, crear nuevo postMany sin adjust,
// todas las ordenes deben venir calculadas desde la estartegia
// /* ORDERS BUY MANY ROUTE */
// router.createRoute(ORDERS_BUY_MANY, async (body: any) => {
//   const topic = ORDERS_BUY_MANY;
//   const side = 'buy';
//   try {
//     const { operationId, amount, adjust, pair } = body;
//     const response = await operationsService.postMany(amount, adjust, side, pair);

//     logger.debug(`Topic ${topic} is working`);
//     awsManager.publishLogToSNS(topic, response);
//     publishResponseToSQS(ORDERS_BUY_MANY_RESPONSE, operationId, response);

//     return;
//   } catch (err) {
//     logger.error(topic, err.message);
//     throw err;
//   }
// });

// /* ORDERS SELL MANY ROUTE */
// router.createRoute(ORDERS_SELL_MANY, async (body: any) => {
//   const topic = ORDERS_SELL_MANY;
//   const side = 'sell';
//   try {
//     const { operationId, amount, adjust, pair } = body;
//     const response = await ordersManager.postMany(amount, adjust, side, pair);

//     logger.debug(`Topic ${topic} is working`);
//     awsManager.publishLogToSNS(topic, response);
//     publishResponseToSQS(ORDERS_SELL_MANY, operationId, response);

//     return;
//   } catch (err) {
//     logger.error(topic, err.message);
//     throw err;
//   }
// });

/* CANCEL ALL ORDER ROUTE */
router.createRoute(ORDERS_CANCEL_ALL, async (body: any) => {
  const topic = ORDERS_CANCEL_ALL;
  try {
    const { operationId, pair }: { operationId: string; pair: string } = body;
    const response: IResponseOrder[] = await operationsService.cancelMyOrders(pair);
    const bodyResponse: ICancelResponse[] = response.map((element: IResponseOrder) => {
      return {
        orderId: element.id
      };
    });

    logger.debug(`Topic ${topic} is working`);
    awsManager.publishLogToSNS(topic, response);
    publishResponseToSQS(ORDERS_CANCEL_ALL_RESPONSE, operationId, bodyResponse);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

/* CANCEL MANY ROUTE */
router.createRoute(ORDERS_CANCEL_MANY, async (body: any) => {
  const topic = ORDERS_CANCEL_MANY;
  try {
    const operation: { operationId: string; ordersId: ICancelOrder[] } = body;
    const bodyResponse: ICancelResponse[] = await Promise.all(
      operation.ordersId.map(async ({ orderId }) => {
        const cancelResponse: IResponseOrder = await operationsService.cancelOrder(orderId);
        return {
          orderId: cancelResponse.id
        };
      })
    );

    logger.debug(`Topic ${topic} is working`);
    awsManager.publishLogToSNS(topic, bodyResponse);
    publishResponseToSQS(
      ORDERS_CANCEL_MANY_RESPONSE,
      operation.operationId,
      bodyResponse
    );

    return;
  } catch (err) {
    logger.error(topic, err.message);
    throw err;
  }
});

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

export default (sqsPublisher: SQSPublisher) => {
  _sqsPublisher = sqsPublisher;
  return router;
};
