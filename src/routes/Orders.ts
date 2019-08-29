import { logger } from '@shared';
import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';

const router = Router();

/******************************************************************************
 *                      Get active orders - "GET /api/orders/active"
 ******************************************************************************/

router.get('/myorders', async (req: Request, res: Response) => {
  try {
    return res.status(OK).json([]);
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
    // TODO: Return order
    return res.status(CREATED).end();
  } catch (err) {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
      error: err.message
    });
  }
});

export default router;
