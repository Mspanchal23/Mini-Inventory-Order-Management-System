import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import config from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter, writeLimiter } from './middleware/rateLimiter.js';
import routes from './routes/index.js';
import ApiError from './utils/ApiError.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: config.clientUrls }));
app.use(express.json({ limit: '100kb' }));
if (!config.isProduction) app.use(morgan('dev'));

// Make sure the database is connected before handling API requests. Needed on Vercel,
// where this app is loaded as a serverless function and src/server.js does not run.
const ensureDatabase = async (_req, _res, next) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return next(new ApiError(503, 'Database is unavailable, please try again shortly'));
  }
  return next();
};

app.use('/api', apiLimiter, writeLimiter, ensureDatabase, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
