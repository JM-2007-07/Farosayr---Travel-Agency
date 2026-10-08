import { checkDatabaseConnection } from '../config/database.js';

// Public liveness/readiness probe: API up + database reachable, plus which
// deployment answered (git commit and Vercel region — both public facts)
// so a release can be verified from outside. Nothing secret, no error
// details. Answers 503 when the database is unreachable so uptime checks
// can alert on it.
export async function getHealth(req, res) {
  const isConnected = await checkDatabaseConnection();

  res.status(isConnected ? 200 : 503).json({
    success: isConnected,
    message: 'FaroSayr API is running',
    database: isConnected ? 'connected' : 'disconnected',
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? null,
    region: process.env.VERCEL_REGION ?? null,
    timestamp: new Date().toISOString(),
  });
}
