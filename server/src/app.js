import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter, writeLimiter } from './middleware/rateLimiter.js';
import routes from './routes/index.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: config.clientUrls }));
app.use(express.json({ limit: '100kb' }));
if (!config.isProduction) app.use(morgan('dev'));

app.use('/api', apiLimiter, writeLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
