import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

if (!process.env.MONGO_URI) {
  throw new Error('MONGO_URI is not defined. Copy .env.example to .env and set it.');
}

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 5000),
  mongoUri: process.env.MONGO_URI,
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  rateLimit: {
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toInt(process.env.RATE_LIMIT_MAX, 300),
    writeMax: toInt(process.env.RATE_LIMIT_WRITE_MAX, 60),
  },
  lowStockThreshold: toInt(process.env.LOW_STOCK_THRESHOLD, 5),
};

config.isProduction = config.nodeEnv === 'production';

export default config;
