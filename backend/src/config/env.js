import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// In development, an unset CLIENT_URL safely defaults to the Vite dev
// server. In production we refuse to silently fall back to that same
// default — a misconfigured CORS origin is a security bug, not something
// that should quietly "just work" in prod. This intentionally throws at
// startup rather than serving with a wrong/insecure origin.
const clientUrl = process.env.CLIENT_URL || (isProduction ? null : 'http://localhost:5173');
if (isProduction && !clientUrl) {
  throw new Error('CLIENT_URL must be set explicitly when NODE_ENV=production');
}

// JWT secret has no safe default in any environment — unlike CLIENT_URL,
// there's no legitimate fallback value that wouldn't be a security hole.
// Fail fast at startup rather than silently signing tokens with an
// undefined/guessable secret.
const jwtSecret = process.env.JWT_SECRET || null;
if (!jwtSecret) {
  throw new Error('JWT_SECRET must be set (see .env.example) — the server will not start without it.');
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv,
  isProduction,
  clientUrl,
  apiPrefix: process.env.API_PREFIX || '/api',
  // Read once, centrally. Never log this value (see utils/logger.js callers) —
  // it contains database credentials.
  databaseUrl: process.env.DATABASE_URL || null,
  // Never log this value either — see utils/jwt.js, which is the only
  // module that reads it.
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
