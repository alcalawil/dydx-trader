import { logger } from '@shared';
import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { solo } from '../modules/solo';
import { ISimpleOrder } from 'src/entities/types';
// tslint:disable-next-line: no-var-requires
import ordersManagerFactory from '../modules/ordersManager';

const ordersManager  = ordersManagerFactory(solo); // FIXME: fundsManager class should be instanced once
const router = Router();

/******************************************************************************
 *                      Get active orders - "GET /api/orders/active"
 ******************************************************************************/

router.get('/myorders', async (req: Request, res: Response) => {
  try {
    const myOrders = await ordersManager.getOwnOrders();
    return res.status(OK).json(myOrders);
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

export default router;
