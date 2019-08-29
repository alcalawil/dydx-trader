import { Router } from 'express';
import OrdersRouter from './Orders';

const router = Router();

// Add sub-routes
router.use('/orders', OrdersRouter);

export default router;
