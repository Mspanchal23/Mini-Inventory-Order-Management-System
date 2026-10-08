import { Router } from 'express';
import * as controller from '../controllers/order.controller.js';
import validate from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import {
  createOrderSchema,
  listOrdersQuerySchema,
  updateOrderSchema,
} from '../validators/order.validator.js';

const router = Router();
const validateId = validate(idParamSchema, 'params');

router
  .route('/')
  .get(validate(listOrdersQuerySchema, 'query'), controller.listOrders)
  .post(validate(createOrderSchema), controller.createOrder);

router
  .route('/:id')
  .get(validateId, controller.getOrder)
  .put(validateId, validate(updateOrderSchema), controller.updateOrder);

router.patch('/:id/confirm', validateId, controller.confirmOrder);
router.patch('/:id/cancel', validateId, controller.cancelOrder);

export default router;
