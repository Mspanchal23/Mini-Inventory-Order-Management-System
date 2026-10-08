import rateLimit from 'express-rate-limit';
import config from '../config/env.js';

const handler = (_req, res, _next, options) =>
  res.status(options.statusCode).json({
    success: false,
    message: options.message,
  });

const baseOptions = {
  windowMs: config.rateLimit.windowMs,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler,
};

/** Applies to every API request. */
export const apiLimiter = rateLimit({
  ...baseOptions,
  limit: config.rateLimit.max,
  message: 'Too many requests, please try again later.',
});

/** Stricter limit for requests that change data (POST/PUT/PATCH/DELETE). */
export const writeLimiter = rateLimit({
  ...baseOptions,
  limit: config.rateLimit.writeMax,
  message: 'Too many write requests, please slow down and try again later.',
  skip: (req) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method),
});
