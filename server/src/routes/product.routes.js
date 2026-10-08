import { Router } from 'express';
import * as controller from '../controllers/product.controller.js';
import validate from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import {
  createProductSchema,
  listProductsQuerySchema,
  updateProductSchema,
} from '../validators/product.validator.js';

const router = Router();
const validateId = validate(idParamSchema, 'params');

router
  .route('/')
  .get(validate(listProductsQuerySchema, 'query'), controller.listProducts)
  .post(validate(createProductSchema), controller.createProduct);

router.get('/categories', controller.getCategories);

router
  .route('/:id')
  .get(validateId, controller.getProduct)
  .put(validateId, validate(updateProductSchema), controller.updateProduct)
  .delete(validateId, controller.deleteProduct);

export default router;
