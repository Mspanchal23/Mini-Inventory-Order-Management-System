import mongoose from 'mongoose';
import config from './env.js';

// One shared connection promise. On serverless platforms (Vercel) the module can be
// reused between requests, so later calls reuse the open connection instead of reconnecting.
let connectionPromise = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connectionPromise) {
    mongoose.set('strictQuery', true);
    connectionPromise = mongoose
      .connect(config.mongoUri, { serverSelectionTimeoutMS: 10000 })
      .then((conn) => {
        console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
        return conn.connection;
      })
      .catch((error) => {
        connectionPromise = null; // allow a retry on the next request
        throw error;
      });
  }
  return connectionPromise;
};

export const disconnectDB = () => mongoose.connection.close();
