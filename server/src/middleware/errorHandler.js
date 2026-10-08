import mongoose from 'mongoose';
import config from '../config/env.js';
import ApiError from '../utils/ApiError.js';

export const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

/** Convert known library errors into ApiError so the client gets a clear response. */
const normalizeError = (err) => {
  if (err instanceof ApiError) return err;

  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return ApiError.badRequest('Validation failed', errors);
  }

  if (err instanceof mongoose.Error.CastError) {
    return ApiError.badRequest(`Invalid value for ${err.path}`);
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue || err.keyPattern || {})[0] || 'field';
    const value = err.keyValue?.[field];
    return ApiError.conflict(`Duplicate ${field}${value ? `: ${value}` : ''} already exists`);
  }

  // Malformed JSON body
  if (err?.type === 'entity.parse.failed') {
    return ApiError.badRequest('Malformed JSON in request body');
  }

  return null;
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  const apiError = normalizeError(err);
  const statusCode = apiError?.statusCode || 500;

  if (statusCode >= 500) console.error(err);

  res.status(statusCode).json({
    success: false,
    message: apiError?.message || 'Internal server error',
    ...(apiError?.errors && { errors: apiError.errors }),
    ...(!config.isProduction && statusCode >= 500 && { stack: err.stack }),
  });
};
