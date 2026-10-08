import app from './app.js';
import config from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

const start = async () => {
  try {
    await connectDB();
    const server = app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port} (${config.nodeEnv})`);
    });

    const shutdown = (signal) => {
      console.log(`${signal} received, shutting down...`);
      server.close(async () => {
        await disconnectDB();
        process.exit(0);
      });
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
