import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { prisma, checkDatabaseConnection } from './config/database.js';

let server;

async function start() {
  if (!env.databaseUrl) {
    logger.error(
      'DATABASE_URL is not set. Copy .env.example to .env and configure it before starting the server.'
    );
    process.exit(1);
    return;
  }

  const connected = await checkDatabaseConnection();
  if (!connected) {
    logger.error(
      'Could not connect to the database. Check that PostgreSQL is running and DATABASE_URL is correct.'
    );
    // A single clean exit, not a retry loop — if something outside this
    // process (a process manager, `node --watch` on a later file save)
    // wants to try again, that's its call, not this script's.
    process.exit(1);
    return;
  }

  server = app.listen(env.port, () => {
    logger.info(`FaroSayr API running on port ${env.port} (${env.nodeEnv})`);
  });
}

function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);

  const finish = async () => {
    await prisma.$disconnect();
    logger.info('Database disconnected');
    process.exit(0);
  };

  if (!server) {
    finish();
    return;
  }

  server.close((err) => {
    if (err) {
      logger.error('Error while closing server', err);
      process.exit(1);
      return;
    }
    logger.info('Server closed');
    finish();
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

start();
