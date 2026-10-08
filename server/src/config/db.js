import mongoose from 'mongoose';
import config from './env.js';

export const connectDB = async () => {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(config.mongoUri);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
};

export const disconnectDB = () => mongoose.connection.close();
