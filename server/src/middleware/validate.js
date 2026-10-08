import ApiError from '../utils/ApiError.js';

/**
 * Validate and sanitize a request part against a Joi schema.
 * Usage: validate(schema) for body, validate(schema, 'query'), validate(schema, 'params').
 */
const validate = (schema, property = 'body') => (req, _res, next) => {
  const { value, error } = schema.validate(req[property] ?? {}, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message.replace(/"/g, ''),
    }));
    return next(ApiError.badRequest('Validation failed', errors));
  }

  // Express 5 exposes req.query as a getter, so redefine instead of assigning.
  Object.defineProperty(req, property, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  return next();
};

export default validate;
