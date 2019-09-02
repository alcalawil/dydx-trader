import { logger } from '@shared';
import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { solo } from '../modules/solo';

// tslint:disable-next-line: no-var-requires
import fundsManagerFactory from '../modules/fundsManager';
const fundsManager  = fundsManagerFactory(solo); // FIXME: fundsManager class should be instanced once

const router = Router();

/******************************************************************************
 *                      Get active orders - "GET /api/funds/balance"
 ******************************************************************************/

router.get('/balances', async (req: Request, res: Response) => {
  try {
    const balances = await fundsManager.getBalances();
    return res.status(OK).json({
      message: 'Account balances converted',
      balances
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

/******************************************************************************
 *                       Deposit Funds - "POST /api/funds/balance"
 ******************************************************************************/

router.post('/deposit', async (req: Request, res: Response) => {
  try {
    // TODO: Return receipt
    return res.status(CREATED).end();
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

export default router;
