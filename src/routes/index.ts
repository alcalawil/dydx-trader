import { Router } from 'express';
import OrdersRouter from './Orders';
import FundsRouter from './Funds';

const router = Router();

// Add sub-routes
router.use('/orders', OrdersRouter);
router.use('/funds', FundsRouter);

export default router;
