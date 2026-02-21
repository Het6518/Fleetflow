require('dotenv').config();
const app = require('./app');
const prisma = require('./config/prisma');

const PORT = process.env.PORT || 5000;

/**
 * Gracefully connect to DB then start server
 */
const startServer = async () => {
  try {
    // Test Prisma connection
    await prisma.$connect();
    console.log('✅ Connected to MySQL database via Prisma.');

    const server = app.listen(PORT, () => {
      console.log(`🚀 FleetFlow API running on http://localhost:${PORT}`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n⚡ Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('🔌 Prisma disconnected. Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (error) {
    console.error('❌ Failed to connect to database:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
