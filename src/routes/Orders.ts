import { logger } from '@shared';
import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import BigNumber from 'bignumber.js';
import { solo } from '../modules/solo';
import { ISimpleOrder } from 'src/entities/types';
// tslint:disable-next-line: no-var-requires
import ordersManagerFactory from '../modules/ordersManager';

const ordersManager = ordersManagerFactory(solo); // FIXME: fundsManager class should be instanced once
const router = Router();

/******************************************************************************
 *                      Get order by id - "GET /api/orders/order"
 ******************************************************************************/

router.get('/order', async (req: Request, res: Response) => {
  try {
    const orderId: string = req.query.id;
    const order = await ordersManager.getOrderById(orderId);
    return res.status(OK).json(order);
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

/******************************************************************************
 *                      Get my orders - "GET /api/orders/myorders"
 ******************************************************************************/

router.get('/myorders', async (req: Request, res: Response) => {
  try {
    const myOrders = await ordersManager.getOwnOrders();
    return res.status(OK).json({
      count: myOrders.length,
      orders: myOrders
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

/******************************************************************************
 *                      Get orderbook - "GET /api/orders/orderbook"
 ******************************************************************************/

router.get('/orderbook', async (req: Request, res: Response) => {
  const { limit = 10 } = req.query;
  try {
    const orders = await ordersManager.getOrderbook({ limit });
    return res.status(OK).json({
      count: orders.length,
      orders
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

/******************************************************************************
 *                       Place Order - "POST /api/orders/place"
 ******************************************************************************/

router.post('/place', async (req: Request, res: Response) => {
  try {
    const {
      makerMarket,
      takerMarket,
      makerAmount,
      takerAmount
    }: ISimpleOrder = req.body;

    const order = await ordersManager.placeOrder({
      makerMarket,
      takerMarket,
      makerAmount,
      takerAmount
    });

    return res.status(CREATED).json({
      message: 'Order successfully created',
      order
    });
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

router.post('/buy', async (req: Request, res: Response) => {
  try {
    const {
      price,
      amount
    }: any = req.body;

    const makerAmount = amount;
    const takerAmount = price * amount;

    const order = await ordersManager.placeOrder({
      makerMarket: new BigNumber(0),
      takerMarket: new BigNumber(1),
      makerAmount: `${makerAmount}e18`,
      takerAmount: `${takerAmount}e18`
    });

    return res.status(CREATED).json({
      message: 'Order successfully created',
      order
    });
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});
/******************************************************************************
 *                       Cancel Order - "POST /api/orders/cancel"
 ******************************************************************************/

router.post('/cancel', async (req: Request, res: Response) => {
  const orderId: string = req.body.orderId;
  try {
    const result = await ordersManager.cancelOrder(orderId);
    return res.status(CREATED).json({
      message: 'Order canceled',
      result
    });
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});


/******************************************************************************
 *                       Get Bid - "GET /api/orders/bid"
 ******************************************************************************/

router.get('/bid', async (req: Request, res: Response) => {
  try {
    const orders = await ordersManager.getBid();
    return res.status(OK).json(orders);
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

/******************************************************************************
 *                       Get Ask - "GET /api/orders/ask"
 ******************************************************************************/

router.get('/ask', async (req: Request, res: Response) => {
  try {
    const orders = await ordersManager.getAsk();
    return res.status(OK).json(orders);
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

export default router;
