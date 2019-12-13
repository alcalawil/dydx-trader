import { Router } from 'express';
import OrdersRouter from './Orders';
import FundsRouter from './Funds';
import TradesRouter from './Trades';
import TestsRouter from './Tests';

const router = Router();

// Add sub-routes
router.use('/orders', OrdersRouter);
router.use('/funds', FundsRouter);
router.use('/trades', TradesRouter);
router.use('/tests', TestsRouter);

export default router;
