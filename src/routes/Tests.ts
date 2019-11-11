import { logger } from '@shared';
import { Request, Response, Router } from 'express';
import { BAD_REQUEST, OK } from 'http-status-codes';
import { ICexOrder, IDexOrder } from '@entities';
import { convertToCexOrder, convertToDexOrder } from '../shared/utils';

const router = Router();

/******************************************************************************
 *                      Get active orders - "GET /api/funds/balance"
 ******************************************************************************/

router.get('/convert-to-dex', async (req: Request, res: Response) => {
  const { price, amount, side }: ICexOrder = req.body;
  const pair = req.body || 'WETH-DAI';

  try {
    const dexOrder = convertToDexOrder({ price, amount, side }, pair);
    return res.status(OK).json({
      message: 'CEx order converted to DEx',
      dexOrder
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

router.get('/convert-to-cex', async (req: Request, res: Response) => {
  const { takerAmount, makerAmount, makerMarket, takerMarket }: IDexOrder = req.body;
  try {
    const cexOrder = convertToCexOrder({ takerAmount, makerAmount, makerMarket, takerMarket });
    return res.status(OK).json({
      message: 'DEx order converted to CEx',
      cexOrder
    });
  } catch (err) {
    logger.error(err.message, JSON.stringify(err));
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

export default router;
