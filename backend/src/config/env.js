import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// Startup warnings go straight to stderr: utils/logger.js imports nothing
// from here, but keeping this module dependency-free avoids any import cycle.
function warn(message) {
  console.warn(`[${new Date().toISOString()}] WARN ${message}`);
}

// CLIENT_URL — the website origin(s) allowed to call this API with
// credentials. Comma-separated; the FIRST entry is the canonical site URL
// (used to build links in Telegram messages). In development an unset value
// safely defaults to the Vite dev server. In production we refuse to fall
// back — a misconfigured CORS origin is a security bug, not something that
// should quietly "just work".
function parseOrigins(value) {
  return String(value ?? '')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean);
}

const clientUrls = parseOrigins(process.env.CLIENT_URL);
if (clientUrls.length === 0 && !isProduction) clientUrls.push('http://localhost:5173');
if (isProduction && clientUrls.length === 0) {
  throw new Error('CLIENT_URL must be set explicitly when NODE_ENV=production');
}
if (isProduction) {
  const insecure = clientUrls.filter((u) => !u.startsWith('https://'));
  if (insecure.length) {
    warn(`CLIENT_URL contains non-HTTPS origins in production: ${insecure.join(', ')}`);
  }
}

// JWT secret has no safe default in any environment. Fail fast rather than
// sign tokens with an undefined/guessable secret.
const jwtSecret = process.env.JWT_SECRET || null;
if (!jwtSecret) {
  throw new Error('JWT_SECRET must be set (see .env.example) — the server will not start without it.');
}
if (jwtSecret.length < 32) {
  // A warning, not a crash: refusing to boot would take the live site down
  // on the next deploy. docs/SECURITY.md lists rotating it as a checklist item.
  warn('JWT_SECRET is shorter than 32 characters — generate a longer random secret (see .env.example).');
}

// SameSite for the auth cookie. While the API runs on *.vercel.app the
// site and API are different sites and production needs "none". Once the
// API is served from the site's own domain (api.farosayr.tj next to
// farosayr.tj — docs/DEPLOYMENT.md, "Domain cutover") set
// AUTH_COOKIE_SAMESITE=lax. Default keeps today's behaviour.
const cookieSameSite = (process.env.AUTH_COOKIE_SAMESITE || (isProduction ? 'none' : 'lax')).toLowerCase();
if (!['lax', 'strict', 'none'].includes(cookieSameSite)) {
  throw new Error('AUTH_COOKIE_SAMESITE must be one of: lax, strict, none');
}
if (cookieSameSite === 'none' && !isProduction) {
  warn('AUTH_COOKIE_SAMESITE=none outside production: browsers drop SameSite=None cookies without HTTPS.');
}

// Development safety net: a dev server pointed at a hosted database reads
// and writes real data (that is how demo content reached production).
// Loud warning, not a crash — see docs/DEVELOPMENT.md.
if (!isProduction && process.env.DATABASE_URL) {
  try {
    const host = new URL(process.env.DATABASE_URL).hostname;
    if (!['localhost', '127.0.0.1', '::1', 'postgres', 'db'].includes(host)) {
      warn(`DATABASE_URL points at a non-local database (${host.replace(/^([^.]{0,3})[^.]*/, '$1***')}) while NODE_ENV=${nodeEnv}. Anything you do locally changes that database.`);
    }
  } catch {
    // unparsable URL — Prisma will report it on first use
  }
}

const telegram = {
  botToken: process.env.TELEGRAM_BOT_TOKEN || null,
  adminChatId: process.env.TELEGRAM_ADMIN_CHAT_ID || null,
  webhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET || null,
};
// Shape checks only — never print the values themselves.
if (telegram.botToken && !/^\d{5,}:[A-Za-z0-9_-]{30,}$/.test(telegram.botToken)) {
  warn('TELEGRAM_BOT_TOKEN does not look like a bot token (expected "<digits>:<secret>").');
}
if (telegram.webhookSecret && !/^[A-Za-z0-9_-]{16,256}$/.test(telegram.webhookSecret)) {
  warn('TELEGRAM_WEBHOOK_SECRET should be 16–256 chars of A–Z a–z 0–9 _ - (Telegram rejects other characters).');
}
if (telegram.botToken && !telegram.webhookSecret) {
  warn('TELEGRAM_BOT_TOKEN is set but TELEGRAM_WEBHOOK_SECRET is not — the webhook will answer 503.');
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv,
  isProduction,
  // Canonical site URL (links in bot messages) + full CORS/CSRF allowlist.
  clientUrl: clientUrls[0],
  clientUrls,
  apiPrefix: process.env.API_PREFIX || '/api',
  // Read once, centrally. Never log this value — it contains database credentials.
  databaseUrl: process.env.DATABASE_URL || null,
  // Never log this value either — utils/jwt.js is the only reader.
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieSameSite,
  // Telegram is optional: with these unset the bot and admin notifications
  // are simply disabled. Never log or return any of these values (the token
  // is part of every Bot API URL; services/telegram.service.js is the only reader).
  telegram,
};

/** True when `origin` (scheme://host[:port]) is one of the allowed site origins. */
export function isAllowedOrigin(origin) {
  return typeof origin === 'string' && env.clientUrls.includes(origin.replace(/\/+$/, ''));
}
