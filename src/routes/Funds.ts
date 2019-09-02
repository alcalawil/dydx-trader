import { logger } from '@shared';
import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
const getSoloInstance  = require('../modules/solo');

const router = Router();

/******************************************************************************
 *                      Get active orders - "GET /api/funds/balance"
 ******************************************************************************/

router.get('/balance', async (req: Request, res: Response) => {
  try {
    return res.status(OK).json({});
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
