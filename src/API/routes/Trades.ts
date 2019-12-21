import { Request, Response, Router, NextFunction } from 'express';
import { OK, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { logger } from '@shared';
import { awsManager, gettersService } from '@services';
import { IResponseTrade, HTTPError } from '@entities';
import config from '@config';

const router = Router();

/* LOAD CONFIG */
const DEFAULT_PAIR: string = config.dydx.defaultPair;
const DEFAULT_LIMIT: number = 100;

/******************************************************************************
 *                       Get Trades - "GET /api/trades/mytrades"
 ******************************************************************************/

router.get('/mytrades', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = DEFAULT_LIMIT, pair = DEFAULT_PAIR } = req.query;
    let { startingBefore } = req.query;

    if (startingBefore) {
      startingBefore = new Date(startingBefore);
    }
    const trades = await gettersService.getOwnTrades(limit, pair, startingBefore);
    return res.status(OK).json({ trades });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    awsManager.publishLogToSNS('ERROR', err);
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

/******************************************************************************
 *                      Get CSV of my trades - "GET /api/trade/mytradesCsv"
 ******************************************************************************/

router.get('/mytradesCsv', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = DEFAULT_LIMIT, pair = DEFAULT_PAIR } = req.query;
    let { startingBefore } = req.query;

    if (startingBefore) {
      startingBefore = new Date(startingBefore);
    }

    const trades = await gettersService.getOwnTrades(limit, pair, startingBefore);
    const csvHeader = [
      'transactionHash',
      'pair',
      'side',
      'createdAt',
      'price',
      'amount',
      'status'
    ];
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
    logger.error(err);
    awsManager.publishLogToSNS('ERROR', err);
    next(new HTTPError(err, INTERNAL_SERVER_ERROR));
  }
});

export default router;
