import Joi from 'joi';
import { ORDER_STATUS } from '../models/Order.js';
import { listQuery, objectId } from './common.validator.js';

const customerSchema = Joi.object({
  // When an existing customer is picked in the UI its id is sent; otherwise a new one is created.
  id: objectId.allow(null, ''),
  name: Joi.string().trim().min(2).max(100).required(),
  phone: Joi.string()
    .trim()
    .allow('')
    .pattern(/^[+\d][\d\s-]{6,19}$/)
    .messages({ 'string.pattern.base': 'Phone number is not valid' }),
  email: Joi.string().trim().allow('').email({ tlds: false }).max(120),
  address: Joi.string().trim().min(5).max(300).required(),
});

const orderItemSchema = Joi.object({
  product: objectId.required().label('product'),
  quantity: Joi.number().integer().min(1).max(100_000).required().messages({
    'number.base': 'Quantity must be a number',
    'number.integer': 'Quantity must be a whole number',
    'number.min': 'Quantity must be at least 1',
  }),
});

const orderBody = {
  customer: customerSchema.required(),
  items: Joi.array().items(orderItemSchema).min(1).max(50).required().messages({
    'array.min': 'Order needs at least one item',
  }),
  notes: Joi.string().trim().allow('').max(500),
};

export const createOrderSchema = Joi.object(orderBody);

// Editing a pending order replaces customer + items as a whole.
export const updateOrderSchema = Joi.object(orderBody);

export const listOrdersQuerySchema = Joi.object({
  ...listQuery(['createdAt', 'totalAmount', 'orderNo', 'status']),
  status: Joi.string().valid(...Object.values(ORDER_STATUS), '').default(''),
});
