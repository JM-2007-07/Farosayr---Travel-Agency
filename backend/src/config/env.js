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
  // Telegram is optional, unlike JWT_SECRET: with these unset the bot and
  // admin notifications are simply disabled — every other API keeps
  // working. Never log or return any of these values (the token is part of
  // every Bot API URL; see services/telegram.service.js, the only reader).
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || null,
    adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || null,
    webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || null,
  },
};
