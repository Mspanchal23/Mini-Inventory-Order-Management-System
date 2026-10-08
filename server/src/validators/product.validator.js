import Joi from 'joi';
import { PRODUCT_STATUS } from '../models/Product.js';
import { listQuery } from './common.validator.js';

const fields = {
  name: Joi.string().trim().min(2).max(120),
  sku: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z0-9][A-Z0-9_-]*$/)
    .max(40)
    .messages({ 'string.pattern.base': 'SKU may only contain letters, numbers, "-" and "_"' }),
  price: Joi.number().min(0).precision(2).max(10_000_000),
  stock: Joi.number().integer().min(0).max(1_000_000),
  category: Joi.string().trim().min(2).max(60),
  status: Joi.string().valid(...PRODUCT_STATUS),
  description: Joi.string().trim().allow('').max(500),
};

export const createProductSchema = Joi.object({
  ...fields,
  name: fields.name.required(),
  sku: fields.sku.required(),
  price: fields.price.required(),
  stock: fields.stock.required(),
  category: fields.category.required(),
  status: fields.status.default('Active'),
});

export const updateProductSchema = Joi.object(fields)
  .min(1)
  .messages({ 'object.min': 'Provide at least one field to update' });

export const listProductsQuerySchema = Joi.object({
  ...listQuery(['name', 'sku', 'price', 'stock', 'category', 'createdAt', 'updatedAt']),
  category: Joi.string().trim().allow('').max(60).default(''),
  status: Joi.string().valid(...PRODUCT_STATUS, '').default(''),
});
