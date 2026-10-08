import { Router } from 'express';
import { dashboardStats, listCustomers } from '../controllers/misc.controller.js';
import validate from '../middleware/validate.js';
import { searchCustomersQuerySchema } from '../validators/customer.validator.js';
import orderRoutes from './order.routes.js';
import productRoutes from './product.routes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, message: 'API is running' }));
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.get('/customers', validate(searchCustomersQuerySchema, 'query'), listCustomers);
router.get('/dashboard/stats', dashboardStats);

export default router;
