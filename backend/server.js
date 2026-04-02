require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const app = require('./src/app');
const connectDB = require('./src/config/database');
const { initializeSocketHandlers } = require('./src/sockets/socketHandlers');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Create HTTP server and attach Socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

// Register all Socket.io event handlers and store the io instance
initializeSocketHandlers(io);

// Boot sequence: connect to DB then start listening
(async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      logger.info(`RescueNet X server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled Promise Rejection: ${reason}`);
  server.close(() => process.exit(1));
});
