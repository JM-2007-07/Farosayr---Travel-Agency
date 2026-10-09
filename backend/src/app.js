import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env, isAllowedOrigin } from './config/env.js';
import routes from './routes/index.js';
import { csrfProtection } from './middleware/csrf.middleware.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

app.get('/', (req, res) => {
  res.json({ success: true, message: 'FaroSayr API' });
});

// --- security headers ---
app.use(helmet());

// --- CORS ---
// Only the configured site origin(s) (CLIENT_URL) may make credentialed
// requests. A disallowed origin simply gets no CORS headers, so the browser
// blocks the response. origin:'*' is impossible here anyway — it's
// incompatible with cookies.
app.use(
  cors({
    origin(origin, callback) {
      // No Origin header: same-origin or non-browser request — CORS doesn't apply.
      callback(null, !origin || isAllowedOrigin(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Accept'],
    maxAge: 600,
  })
);

// --- cookies ---
// Required to read the httpOnly auth cookie via req.cookies in
// middleware/auth.middleware.js.
app.use(cookieParser());

// --- body parser ---
// JSON only (no urlencoded parser): every client of this API sends JSON,
// and refusing form bodies is part of the CSRF defence (see
// middleware/csrf.middleware.js). 100kb is far above the largest legitimate
// payload (an admin tour with 20 image URLs).
app.use(express.json({ limit: '100kb' }));

// --- HTTP request logging ---
// Method, URL, status, timing, IP and user agent only — never bodies,
// cookies or headers.
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// --- rate limiting ---
// Broad per-IP cap for the whole API. Stricter, per-purpose limiters sit
// on individual routes (middleware/authRateLimit.js).
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    // The Telegram webhook has its own limiter: its traffic all comes from
    // a few Telegram IPs, so this per-IP limit would throttle the bot itself.
    skip: (req) => req.path === `${env.apiPrefix}/telegram/webhook`,
  })
);

// --- CSRF ---
app.use(csrfProtection);

// --- API routes ---
app.use(env.apiPrefix, routes);

// --- 404 + error handling (must be last, in this order) ---
app.use(notFound);
app.use(errorHandler);

export default app;
