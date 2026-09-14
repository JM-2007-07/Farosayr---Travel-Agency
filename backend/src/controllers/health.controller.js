import { checkDatabaseConnection } from '../config/database.js';

// Uses the existing shared Prisma client via checkDatabaseConnection() —
// does not create a new PrismaClient here, and does not run any
// business query (no business models exist yet).
export async function getHealth(req, res) {
  const isConnected = await checkDatabaseConnection();

  res.status(200).json({
    success: true,
    message: 'FaroSayr API is running',
    database: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
}
