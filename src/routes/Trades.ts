import { logger } from '@shared';
import { Request, Response, Router, NextFunction } from 'express';
import { OK, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { solo } from '../modules/solo';
import tradesManagerFactory from '../modules/tradesManager';
import { IResponseTrade } from '@entities';
import HTTPError from '../entities/HTTPError';
import awsManager from '../modules/awsManager';

const tradesManager = tradesManagerFactory(solo);
const router = Router();

/******************************************************************************
 *                       Get Trades - "GET /api/trades/mytrades"
 ******************************************************************************/

router.get('/mytrades', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 100, pair = 'WETH-DAI' } = req.query;
    let { startingBefore } = req.query;

    if (startingBefore) {
      startingBefore = new Date(startingBefore);
    }

    const trades = await tradesManager.getOwnTrades(limit, pair, startingBefore);
    return res.status(OK).json({ trades });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    awsManager.publishToSNS('ERROR', JSON.stringify(err));
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

/******************************************************************************
 *                      Get CSV of my trades - "GET /api/trade/mytradesCsv"
 ******************************************************************************/

router.get('/mytradesCsv', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 100, pair = 'WETH-DAI' } = req.query;
    let { startingBefore } = req.query;

    if (startingBefore) {
      startingBefore = new Date(startingBefore);
    }

    const trades = await tradesManager.getOwnTrades(limit, pair, startingBefore);
    const csvHeader = ['transactionHash', 'pair', 'side', 'createdAt', 'price', 'amount', 'status'];
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
    logger.error(err.message, JSON.stringify(err));
    awsManager.publishToSNS('ERROR', JSON.stringify(err));
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

export default router;
