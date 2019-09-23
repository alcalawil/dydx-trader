import { logger } from '@shared';
import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { solo } from '../modules/solo';

import tradesManagerFactory from '../modules/tradesManager';
import awsManager from '../modules/awsManager';
import { IResponseTrade } from '@entities';
import { isDate } from 'util';

const tradesManager = tradesManagerFactory(solo);
const router = Router();

/******************************************************************************
 *                       Get Trades - "GET /api/trades/mytrades"
 ******************************************************************************/

router.get('/mytrades', async (req: Request, res: Response) => {
  try {
    let {
      limit = 100,
      startingBefore = new Date()
    }:
      {
        limit: number;
        startingBefore: Date;
      } = req.query;
    if (!isDate(startingBefore)) {
      startingBefore = new Date(startingBefore);
    }
    const trades = await tradesManager.getOwnTrades(limit, startingBefore);
    const msg = {
      Message: trades,
      MessageAttributes: {
        operation: {
          DataType: 'String',
          StringValue: 'myTrades'
        }
      }
    };
    awsManager.publish(msg);
    return res.status(OK).json({ trades });
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});


/******************************************************************************
 *                      Get CSV of my trades - "GET /api/trade/mytradesCsv"
 ******************************************************************************/


router.get('/mytradesCsv', async (req: Request, res: Response) => {
  try {
    let {
      limit = 100,
      startingBefore = new Date()
    }:
      {
        limit: number;
        startingBefore: Date;
      } = req.query;
    if (!isDate(startingBefore)) {
      startingBefore = new Date(startingBefore);
    }
    const trades = await tradesManager.getOwnTrades(limit, startingBefore);
    const csvHeader = ['transactionHash', 'pair', 'side', 'createdAt', 'price', 'amount', 'status'];
    const msg = {
      Message: trades,
      MessageAttributes: {
        operation: {
          DataType: 'String',
          StringValue: 'myTradesCsv'
        }
      }
    };
    awsManager.publish(msg);
    res.setHeader('Content-Type', 'text/csv');
    res.attachment(`myTrades-${new Date().toISOString()}.csv`);
    res.status(OK);
    csvHeader.forEach((item) => {
      res.write(item.toString().replace(/\"/g, '""') + ',');
    });
    res.write('\r\n');
    trades.forEach((trade: IResponseTrade) => {
      res.write('"' + trade.transactionHash.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + trade.pair.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + trade.side.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + trade.createdAt.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + trade.price.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + trade.amount.toString().replace(/\"/g, '""') + '"' + ',');
      res.write('"' + trade.status.toString().replace(/\"/g, '""') + '"' + '\r\n');
    });
    res.end();
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

export default router;
