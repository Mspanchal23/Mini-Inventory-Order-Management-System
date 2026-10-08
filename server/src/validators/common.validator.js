import Joi from 'joi';

export const objectId = Joi.string()
  .trim()
  .pattern(/^[a-f\d]{24}$/i)
  .messages({ 'string.pattern.base': '{{#label}} must be a valid id' });

export const idParamSchema = Joi.object({ id: objectId.required() });

/** Shared pagination + sorting query fields. */
export const listQuery = (sortFields, defaultSort = 'createdAt') => ({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('').max(100).default(''),
  sortBy: Joi.string().valid(...sortFields).default(defaultSort),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});
