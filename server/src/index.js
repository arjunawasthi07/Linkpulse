require('dotenv').config();
const app = require('./app');
const prisma = require('./config/db');
const redis = require('./config/redis');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test PostgreSQL database connection
    await prisma.$connect();
    console.log('✅ [Database] PostgreSQL connected successfully via Prisma');

    const server = app.listen(PORT, () => {
      console.log(`
🚀 ───────────────────────────────────────────────────────────
   ⚡ LinkPulse API Server is live & listening
   🌐 Local:    http://localhost:${PORT}
   ❤️  Health:   http://localhost:${PORT}/health
   👨‍💻 Author:   Arjun Awasthi <arjunawasthiaj07@gmail.com>
───────────────────────────────────────────────────────────────
      `);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n🛑 [LinkPulse] Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await prisma.$disconnect();
          if (redis.raw) {
            await redis.raw.quit();
          }
          console.log('🔌 Connections closed cleanly. Goodbye!');
          process.exit(0);
        } catch (err) {
          console.error('Error during shutdown:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ [Server Startup Failure]:', error);
    process.exit(1);
  }
};

startServer();
