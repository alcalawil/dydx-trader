import { logger } from '@shared';
import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { solo } from '../modules/solo';

import tradesManagerFactory from '../modules/tradesManager';
import awsManagerFactory from '../modules/awsManager';

const tradesManager = tradesManagerFactory(solo);
const router = Router();
const awsManager = awsManagerFactory();

/******************************************************************************
 *                       Get Trades - "GET /api/trades/mytrades"
 ******************************************************************************/

router.get('/mytrades', async (req: Request, res: Response) => {
  try {
    const trades = await tradesManager.getOwnTrades();
    const msg = {
      Message: trades,
      MessageAttributes: {
        'operation': {
          DataType: 'String',
          StringValue: 'myTrades'
        }
      }
    };

    awsManager.publish(msg);
    return res.status(OK).json(trades);
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

export default router;