import { Request, Response, Router, NextFunction } from 'express';
import { OK, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import { soloManager, awsManager, fundsFactory } from '@services';
import { logger } from '@shared';
import { HTTPError } from '@entities';

// FIXME: fundsManager class should be instanced once
const fundsManager = fundsFactory(soloManager);
const router = Router();

/******************************************************************************
 *                      Get active orders - "GET /api/funds/balance"
 ******************************************************************************/

router.get('/balances', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const balances = await fundsManager.getBalances();
    return res.status(OK).json({
      message: 'Account balances converted',
      balances
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    awsManager.publishLogToSNS('ERROR', err);
    next(new HTTPError(err.message, INTERNAL_SERVER_ERROR));
  }
});

export default router;
