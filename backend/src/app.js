import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import routes from './routes/index.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'FaroSayr Backend is working on Vercel',
  });
});

// --- security headers ---
app.use(helmet());

// --- CORS ---
// Restricted to the configured client origin, not '*' — origin:'*' is
// incompatible with credentialed (cookie-based) requests, which auth now
// genuinely needs (this was set up ahead of time in the Backend Foundation
// phase and didn't need to change here).
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

// --- cookies ---
// Required to read the httpOnly auth cookie via req.cookies in
// middleware/auth.middleware.js — without this, req.cookies is undefined.
app.use(cookieParser());

// --- body parsers ---
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --- HTTP request logging ---
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

// --- rate limiting ---
// Global, development-friendly limit. Auth endpoints will get their own
// stricter limiter once they exist.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// --- API routes ---
app.use(env.apiPrefix, routes);

// --- 404 + error handling (must be last, in this order) ---
app.use(notFound);
app.use(errorHandler);

export default app;
