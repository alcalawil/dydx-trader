import { Router } from 'express';
import OrdersRouter from './Orders';
import FundsRouter from './Funds';
import TradesRouter from './Trades';

const router = Router();

// Add sub-routes
router.use('/orders', OrdersRouter);
router.use('/funds', FundsRouter);
router.use('/trades', TradesRouter);

export default router;
