import { operationsService, StateManager } from '@services';
import { logger } from '@shared';
import {
  ORDERS_CANCEL,
  ORDERS_PLACE,
  ORDERS_BUY,
  ORDERS_SELL,
  ORDERS_CANCEL_ALL,
  ORDERS_PLACE_RESPONSE,
  ORDERS_BUY_RESPONSE,
  ORDERS_SELL_RESPONSE,
  ORDERS_CANCEL_RESPONSE,
  ORDERS_CANCEL_ALL_RESPONSE,
  ORDERS_PLACE_MANY,
  ORDERS_PLACE_MANY_RESPONSE,
  ORDERS_CANCEL_MANY,
  ORDERS_CANCEL_MANY_RESPONSE
} from '../../constants/Topics';
import SQSPublisher from '../SQSPublisher';
import SQSRouter from '../SQSRouter';
import {
  IResponseOrder,
  ICancelResponse,
  ICancelOrder,
  IStrategyInfo,
  MarketSide,
  pair
} from '@entities';
import { ORDER_STATUS_CANCELED } from '../../constants/OrderStatuses';
import {
  STRATEGY_BUY_ORDER_COMPLETED,
  STRATEGY_SELL_ORDER_COMPLETED,
  STRATEGY_SELL_ORDER_ERROR,
  STRATEGY_BUY_ORDER_ERROR,
  STRATEGY_BUY_ORDER_ATTEMPT,
  STRATEGY_SELL_ORDER_ATTEMPT,
  STRATEGY_CANCEL_ORDER_ATTEMPT,
  STRATEGY_CANCEL_ORDER_COMPLETED,
  ERROR,
  STRATEGY_CANCEL_ALL_ORDERS_ATTEMPT,
  STRATEGY_CANCEL_ALL_ORDERS_COMPLETED,
  STRATEGY_CANCEL_ALL_ORDERS_ERROR,
  STRATEGY_CANCEL_ORDER_ERROR
} from '../../constants/logTypes';
import { getTokensFromPair } from '../../helpers/converters';
import Logger from 'src/loggers/Logger';

const router = new SQSRouter();
let _sqsPublisher: SQSPublisher;
let _stateManager: StateManager;

/* PLACE ORDER ROUTE */
router.createRoute(ORDERS_PLACE, async (body: any) => {
  const topic = ORDERS_PLACE;
  const {
    side,
    amount,
    price,
    pair,
    operationId,
    strategyInfo
  }: {
    side: number;
    amount: number;
    price: number;
    pair: pair;
    operationId: string;
    strategyInfo: IStrategyInfo;
  } = body;
  const [assetToken, baseToken] = getTokensFromPair(pair);
  try {
    Logger.log(
      {
        details: body,
        topic,
        operationId,
        ...strategyInfo
      },
      side === MarketSide.buy ? STRATEGY_BUY_ORDER_ATTEMPT : STRATEGY_SELL_ORDER_ATTEMPT
    );
    const orderResponse = await operationsService.placeOrder(
      {
        side,
        amount,
        price
      },
      pair
    );
    _stateManager.setNewOperation({
      orderId: orderResponse.id,
      pair,
      operationId,
      ...strategyInfo,
      tokenIN: side === MarketSide.buy ? assetToken.shortName : baseToken.shortName,
      tokenOUT: side === MarketSide.buy ? baseToken.shortName : assetToken.shortName,
      tokenFees: 'none',
      feesOut: 0,
      originalRequest: JSON.stringify(body),
      originalResponse: JSON.stringify(orderResponse)
    });
    logger.debug(`Topic ${topic} is working`);
    Logger.log(
      {
        details: orderResponse,
        topic,
        operationId,
        ...strategyInfo
      },
      side === MarketSide.buy
        ? STRATEGY_BUY_ORDER_COMPLETED
        : STRATEGY_SELL_ORDER_COMPLETED
    );
    publishResponseToSQS(ORDERS_PLACE_RESPONSE, operationId, orderResponse);
    return;
  } catch (err) {
    logger.error(topic, err.message);
    Logger.log(
      {
        details: { message: err.message, stack: err.stack },
        topic,
        operationId,
        ...strategyInfo
      },
      side === MarketSide.buy ? STRATEGY_BUY_ORDER_ERROR : STRATEGY_SELL_ORDER_ERROR
    );
    throw err;
  }
});

/* BUY ORDER ROUTE */
router.createRoute(ORDERS_BUY, async (body: any) => {
  const topic = ORDERS_BUY;
  const responseTopic = ORDERS_BUY_RESPONSE;
  const {
    operationId,
    price,
    amount,
    pair,
    strategyInfo
  }: {
    operationId: string;
    price: number;
    amount: number;
    pair: pair;
    strategyInfo: IStrategyInfo;
  } = body;
  try {
    const [assetToken, baseToken] = getTokensFromPair(pair);
    Logger.log(
      {
        details: body,
        topic,
        operationId,
        ...strategyInfo
      },
      STRATEGY_BUY_ORDER_ATTEMPT
    );
    const orderResponse = await operationsService.buy(price, amount, pair);
    _stateManager.setNewOperation({
      orderId: orderResponse.id,
      pair,
      operationId,
      ...strategyInfo,
      tokenIN: assetToken.shortName,
      tokenOUT: baseToken.shortName,
      tokenFees: 'none',
      feesOut: 0,
      originalRequest: JSON.stringify(body),
      originalResponse: JSON.stringify(orderResponse)
    });
    logger.debug(`Topic ${topic} is working`);
    Logger.log(
      {
        details: orderResponse,
        topic,
        operationId,
        ...strategyInfo
      },
      STRATEGY_BUY_ORDER_COMPLETED
    );
    publishResponseToSQS(responseTopic, operationId, orderResponse);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    Logger.log(
      {
        details: { message: err.message, stack: err.stack },
        topic,
        operationId,
        ...strategyInfo
      },
      STRATEGY_BUY_ORDER_ERROR
    );
    throw err;
  }
});

/* SELL ORDER ROUTE */
router.createRoute(ORDERS_SELL, async (body: any) => {
  const topic = ORDERS_SELL;
  const {
    operationId,
    price,
    amount,
    pair,
    strategyInfo
  }: {
    operationId: string;
    price: number;
    amount: number;
    pair: pair;
    strategyInfo: IStrategyInfo;
  } = body;
  try {
    const [assetToken, baseToken] = getTokensFromPair(pair);
    Logger.log(
      {
        details: body,
        topic,
        operationId,
        ...strategyInfo
      },
      STRATEGY_SELL_ORDER_ATTEMPT
    );
    const orderResponse = await operationsService.sell(price, amount, pair);
    _stateManager.setNewOperation({
      orderId: orderResponse.id,
      pair,
      operationId,
      ...strategyInfo,
      tokenIN: baseToken.shortName,
      tokenOUT: assetToken.shortName,
      tokenFees: 'none',
      feesOut: 0,
      originalRequest: JSON.stringify(body),
      originalResponse: JSON.stringify(orderResponse)
    });
    logger.debug(`Topic ${topic} is working`);
    Logger.log(
      {
        details: orderResponse,
        topic,
        operationId,
        ...strategyInfo
      },
      STRATEGY_SELL_ORDER_COMPLETED
    );
    publishResponseToSQS(ORDERS_SELL_RESPONSE, operationId, orderResponse);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    Logger.log(
      {
        details: { message: err.message, stack: err.stack },
        topic,
        operationId,
        ...strategyInfo
      },
      STRATEGY_SELL_ORDER_ERROR
    );
    throw err;
  }
});

/* CANCEL ORDER ROUTE */
router.createRoute(ORDERS_CANCEL, async (body: any) => {
  const topic = ORDERS_CANCEL;
  const {
    operationId,
    cancelOrder,
    strategyInfo
  }: {
    operationId: string;
    cancelOrder: ICancelOrder;
    strategyInfo: IStrategyInfo;
  } = body;
  try {
    Logger.log(
      {
        details: body,
        topic,
        operationId,
        ...strategyInfo
      },
      STRATEGY_CANCEL_ORDER_ATTEMPT
    );
    const response: IResponseOrder = await operationsService.cancelOrder(
      cancelOrder.orderId
    );
    const bodyResponse: ICancelResponse = { orderId: response.id };
    logger.debug(`Topic ${topic} is working`);
    Logger.log(
      {
        details: response,
        topic,
        operationId,
        ...strategyInfo
      },
      STRATEGY_CANCEL_ORDER_COMPLETED
    );
    publishResponseToSQS(ORDERS_CANCEL_RESPONSE, operationId, bodyResponse);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    Logger.log(
      {
        details: { message: err.message, stack: err.stack },
        topic,
        operationId,
        ...strategyInfo
      },
      STRATEGY_SELL_ORDER_ERROR
    );
    throw err;
  }
});

router.createRoute(ORDERS_PLACE_MANY, async (body: any) => {
  const topic = ORDERS_PLACE_MANY;
  // FIXME: order as any porque el types cexOrder de la estrategia es distinto al del bot (corregir eso)
  const {
    operations,
    strategyInfo
  }: {
    operations: Array<{ operationId: string; order: any }>;
    strategyInfo: IStrategyInfo;
  } = body;
  try {
    const bodyResponse = await Promise.all(
      operations.map(async ({ operationId, order }) => {
        const {
          side,
          amount,
          price,
          pair
        }: { side: number; amount: number; price: number; pair: pair } = order;
        const [assetToken, baseToken] = getTokensFromPair(pair);
        logger.debug('ORDER >> ', order);
        Logger.log(
          {
            details: body,
            topic,
            operationId,
            pair,
            ...strategyInfo
          },
          side === MarketSide.buy
            ? STRATEGY_BUY_ORDER_ATTEMPT
            : STRATEGY_SELL_ORDER_ATTEMPT
        );
        const orderResponse = await operationsService.placeOrder(
          {
            side,
            amount,
            price
          },
          pair
        );
        _stateManager.setNewOperation({
          orderId: orderResponse.id,
          pair,
          operationId,
          ...strategyInfo,
          tokenIN: side === MarketSide.buy ? assetToken.shortName : baseToken.shortName,
          tokenOUT: side === MarketSide.buy ? baseToken.shortName : assetToken.shortName,
          tokenFees: 'none',
          feesOut: 0,
          originalRequest: JSON.stringify(body),
          originalResponse: JSON.stringify(orderResponse)
        });
        logger.debug(`Topic ${topic} is working`);
        Logger.log(
          {
            details: orderResponse,
            topic,
            operationId,
            ...strategyInfo
          },
          side === MarketSide.buy
            ? STRATEGY_BUY_ORDER_COMPLETED
            : STRATEGY_SELL_ORDER_COMPLETED
        );
        return {
          operationId,
          orderResponse
        };
      })
    );
    publishResponseToSQS(
      ORDERS_PLACE_MANY_RESPONSE,
      operations[0].operationId,
      bodyResponse
    );
    return;
  } catch (err) {
    Logger.log(
      {
        details: { message: err.message, stack: err.stack },
        topic,
        ...strategyInfo
      },
      ERROR
    );
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
  const {
    operationId,
    pair,
    strategyInfo
  }: { operationId: string; pair: string; strategyInfo: IStrategyInfo } = body;
  try {
    Logger.log(
      {
        details: body,
        topic,
        operationId,
        ...strategyInfo
      },
      STRATEGY_CANCEL_ALL_ORDERS_ATTEMPT
    );
    const response: IResponseOrder[] = await operationsService.cancelMyOrders(pair);
    const bodyResponse: ICancelResponse[] = response.map((element: IResponseOrder) => {
      return {
        orderId: element.id
      };
    });

    logger.debug(`Topic ${topic} is working`);
    Logger.log(
      {
        details: bodyResponse,
        topic,
        ...strategyInfo
      },
      STRATEGY_CANCEL_ALL_ORDERS_COMPLETED
    );
    publishResponseToSQS(ORDERS_CANCEL_ALL_RESPONSE, operationId, bodyResponse);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    Logger.log(
      {
        details: { message: err.message, stack: err.stack },
        topic,
        operationId,
        ...strategyInfo
      },
      STRATEGY_CANCEL_ALL_ORDERS_ERROR
    );
    throw err;
  }
});

/* CANCEL MANY ROUTE */
router.createRoute(ORDERS_CANCEL_MANY, async (body: any) => {
  const topic = ORDERS_CANCEL_MANY;
  const {
    operationId,
    operations,
    strategyInfo
  }: {
    operationId: string;
    operations: ICancelOrder[];
    strategyInfo: IStrategyInfo;
  } = body;
  try {
    const bodyResponse: ICancelResponse[] = await Promise.all(
      operations.map(async ({ orderId }) => {
        Logger.log(
          {
            details: body,
            topic,
            operationId,
            ...strategyInfo
          },
          STRATEGY_CANCEL_ORDER_ATTEMPT
        );
        const cancelResponse: IResponseOrder = await operationsService.cancelOrder(
          orderId
        );
        _stateManager.setOrderStatus(cancelResponse.id, ORDER_STATUS_CANCELED);
        Logger.log(
          {
            details: cancelResponse,
            topic,
            operationId,
            ...strategyInfo
          },
          STRATEGY_CANCEL_ORDER_COMPLETED
        );
        return {
          orderId: cancelResponse.id
        };
      })
    );

    logger.debug(`Topic ${topic} is working`);
    publishResponseToSQS(ORDERS_CANCEL_MANY_RESPONSE, operationId, bodyResponse);

    return;
  } catch (err) {
    logger.error(topic, err.message);
    Logger.log(
      {
        details: { message: err.message, stack: err.stack },
        topic,
        operationId,
        ...strategyInfo
      },
      STRATEGY_CANCEL_ORDER_ERROR
    );
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

export default (
  sqsPublisher: SQSPublisher,
  stateManager: StateManager
) => {
  _sqsPublisher = sqsPublisher;
  _stateManager = stateManager;
  return router;
};
