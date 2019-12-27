import { Request, Response, Router, NextFunction } from 'express';
import { CREATED, OK, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { IResponseFill, MarketSide, ICexOrder, HTTPError } from '@entities';
import { logger } from '@shared';
import errorsConstants from '../../constants/Errors';
import config from '@config';
import { operationsService, gettersService } from '@services';

const router = Router();

/* LOAD CONFIG */
const DEFAULT_PAIR: string = config.dydx.defaultPair;
const DEFAULT_LIMIT: number = 100;

/******************************************************************************
 *                       Buy Order - "POST /api/orders/buy"
 ******************************************************************************/
router.post('/buy', async (req: Request, res: Response, next: NextFunction) => {
  // BREAKING CHANGE: In future versions symbol will be required
  const { pair = 'ETH-DAI' } = req.body; // TODO: por defecto o personalizado ?
  const { price, amount }: any = req.body;
  try {
    if (!price || !amount) {
      return next(errorsConstants.BAD_PARAMS);
    }

    const order = await operationsService.buy(price, amount, pair);

    return res.status(CREATED).json({
      message: 'Order successfully created',
      order
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

/******************************************************************************
 *                       Sell Order - "POST /api/orders/sell"
 ******************************************************************************/
router.post('/sell', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { price, amount }: any = req.body;
    // BREAKING CHANGE: In future versions symbol will be required
    const { pair = DEFAULT_PAIR } = req.body;

    // if (!isSymbolEnabled(pair)) {
    //   return next(errorsConstants.BAD_PARAMS);
    // }

    if (!price || !amount) {
      return next(errorsConstants.BAD_PARAMS);
    }

    const order = await operationsService.sell(price, amount, pair);

    return res.status(CREATED).json({
      message: 'Order successfully created',
      order
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

/****** ************************************************************************
 *                       Place Order - "POST /api/orders/place"
 ******************************************************************************/
router.post('/place/:side', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { price, amount }: ICexOrder = req.body;

    const side = req.params.side === 'buy' ? MarketSide.buy : MarketSide.sell;

    const { pair = DEFAULT_PAIR } = req.body;

    if (!price || !amount) {
      return next(errorsConstants.BAD_PARAMS);
    }

    const order = await operationsService.placeOrder(
      {
        amount,
        price,
        side
      },
      pair
    );

    res.status(CREATED).json({
      message: 'Order successfully created',
      order
    });
  } catch (err) {
    logger.error(err);
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

/******************************************************************************
 *                       Cancel Order - "POST /api/orders/cancel"
 ******************************************************************************/
router.post('/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId: string = req.body.orderId;

    if (!orderId) {
      return next(errorsConstants.BAD_PARAMS);
    }

    const result = await operationsService.cancelOrder(orderId);
    res.status(CREATED).json({
      message: 'Order canceled',
      result
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

/******************************************************************************
 *                      Cancel all my orders - "POST /api/orders/cancel-all"
 ******************************************************************************/
router.post('/cancel-all', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pair = DEFAULT_PAIR } = req.body;
    const ordersCanceled = await operationsService.cancelMyOrders(pair);

    return res.status(OK).json({
      count: ordersCanceled.length,
      orders: ordersCanceled
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

/*|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||| */

/******************************************************************************
 *                      Get my orders - "GET /api/orders/myorders"
 ******************************************************************************/
router.get('/myorders', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // FIXME: Temporary default market
    const pair = req.query.pair || DEFAULT_PAIR;
    const myOrders = await gettersService.getMyOrders(pair);

    res.status(OK).json({
      count: myOrders.length,
      orders: myOrders
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

/******************************************************************************
 *                      Get order by id - "GET /api/orders/order"
 ******************************************************************************/
router.get('/order', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId: string = req.query.id;
    if (!orderId) {
      return next(errorsConstants.BAD_PARAMS);
    }

    const order = await gettersService.getOrderById(orderId);
    res.status(OK).json(order);
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

/******************************************************************************
 *                      Get orderbook - "GET /api/orders/orderbook"
 ******************************************************************************/
router.get('/orderbook', async (req: Request, res: Response, next: NextFunction) => {
  const { limit = 10, side = 'both' }: { limit: number; side: string } = req.query;
  const pair = req.query.pair || DEFAULT_PAIR;

  try {
    const orders = await gettersService.getOrderbook(pair, limit);

    if (side === 'sell') {
      return res.status(OK).json({
        count: orders.sellOrders.length,
        orders: orders.sellOrders
      });
    }

    if (side === 'buy') {
      return res.status(OK).json({
        count: orders.buyOrders.length,
        orders: orders.buyOrders
      });
    }

    return res.status(OK).json({
      count: orders.buyOrders.length + orders.sellOrders.length,
      orders
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

/******************************************************************************
 *                       Get Bid - "GET /api/orders/bid"
 ******************************************************************************/
router.get('/bid', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pair = req.query.pair || DEFAULT_PAIR;
    const bid = await gettersService.getBid(pair);
    return res.status(OK).json({
      bid
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

/******************************************************************************
 *                       Get Ask - "GET /api/orders/ask"
 ******************************************************************************/
router.get('/ask', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pair = req.query.pair || DEFAULT_PAIR;
    const ask = await gettersService.getAsk(pair);
    return res.status(OK).json({
      ask
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

/******************************************************************************
 *                       Get Best Dydx Prices - "GET /api/orders/best-prices"
 ******************************************************************************/
router.get('/best-prices', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pair = req.query.pair || DEFAULT_PAIR;
    const bestPrices = await Promise.all([
      gettersService.getAsk(pair),
      gettersService.getBid(pair)
    ]);
    return res.status(OK).json({
      ask: bestPrices[0],
      bid: bestPrices[1]
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

/******************************************************************************
 *                      Buy Many  - "POST /api/orders/buy-many"
 ******************************************************************************/
/**
 * @deprecated Will be deleted future versions. This is a strategy module concern
 */

// router.post('/buy-many', async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { amount, adjust, pair = DEFAULT_PAIR } = req.body;
//     if (!amount) {
//       return next(errorsConstants.BAD_PARAMS);
//     }

//     const result = await ordersManager.postMany(amount, adjust, 'buy', pair);
//     return res.status(OK).json(result);
//   } catch (err) {
//     logger.error(err.message, JSON.stringify(err));
//     awsManager.publishLogToSNS('ERROR', err);
//     next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
//   }
// });

/******************************************************************************
 *                      Sell Many - "POST /api/orders/sell-many"
 ******************************************************************************/
/**
 * @deprecated Will be deleted future versions. This is a strategy module concern
 */

// router.post('/sell-many', async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { amount, adjust, pair = DEFAULT_PAIR } = req.body;
//     if (!amount) {
//       return next(errorsConstants.BAD_PARAMS);
//     }

//     const result = await ordersManager.postMany(amount, adjust, 'sell', pair);
//     return res.status(OK).json(result);
//   } catch (err) {
//     logger.error(err.message, JSON.stringify(err));
//     awsManager.publishLogToSNS('ERROR', err);
//     next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
//   }
// });

/******************************************************************************
 *                      Get my fills - "GET /api/orders/myfills"
 ******************************************************************************/
router.get('/myfills', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = DEFAULT_LIMIT, pair = DEFAULT_PAIR } = req.query;
    let { startingBefore } = req.query;

    if (startingBefore) {
      startingBefore = new Date(startingBefore);
    }

    const myFills = await gettersService.getMyFills(limit, pair, startingBefore);
    return res.status(OK).json({
      fills: myFills
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

/******************************************************************************
 *                      Get Csv of my fills - "GET /api/orders/myfillsCsv"
 ******************************************************************************/
router.get('/myfillsCsv', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = DEFAULT_LIMIT, pair = DEFAULT_PAIR } = req.query;
    let { startingBefore = new Date() } = req.query;

    if (startingBefore) {
      startingBefore = new Date(startingBefore);
    }
    const myFills = await gettersService.getMyFills(limit, pair, startingBefore);
    const csvHeader = [
      'transactionHash',
      'orderId',
      'pair',
      'side',
      'createdAt',
      'updatedAt',
      'price',
      'amountFilled',
      'amountRemaining',
      'amount',
      'fillStatus',
      'orderStatus'
    ];

    // TODO: Use a helper to create this csv
    res.setHeader('Content-Type', 'text/csv');
    res.attachment(`myFills-${new Date().toISOString()}.csv`);
    res.status(OK);
    csvHeader.forEach((item) => {
      res.write(item.toString().replace(/\"/g, '""') + ',');
    });
    res.write('\r\n');
    myFills.forEach((fill: IResponseFill) => {
      res.write('"' + fill.transactionHash.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + fill.orderId.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + fill.pair.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + fill.side.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + fill.createdAt.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + fill.updatedAt.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + fill.price.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + fill.amountFilled.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + fill.amountRemaining.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + fill.amount.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + fill.fillStatus.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + fill.orderStatus.toString().replace(/\"/g, '""') + '"' + '\r\n');
    });
    res.end();
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

export default router;
