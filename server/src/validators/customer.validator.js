import Joi from 'joi';

export const searchCustomersQuerySchema = Joi.object({
  search: Joi.string().trim().allow('').max(100).default(''),
  limit: Joi.number().integer().min(1).max(50).default(10),
});
