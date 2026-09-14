import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Express 5 requires exactly 4 params for an error-handling middleware to
// be recognized as one — do not remove the unused `next`.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Only errors OUR OWN code deliberately threw (via httpErrors.js /
  // auth.controller.js's local helpers / etc.) set `.statusCode` — that's
  // exactly the set of errors whose `.message` we wrote ourselves and know
  // is safe to show a client. Anything without a statusCode is truly
  // unexpected (a raw Prisma error, a bug, a third-party library throwing)
  // and its message was never vetted for safety — it could contain table/
  // column names, file paths, or other internal detail. Those get the
  // generic message instead, regardless of environment; only dev mode's
  // `stack` field (below) is for debugging unexpected errors.
  const isKnownError = err && typeof err.statusCode === 'number';
  const statusCode = isKnownError ? err.statusCode : 500;
  const message = isKnownError && typeof err.message === 'string' ? err.message : 'Something went wrong';

  logger.error(`${req.method} ${req.originalUrl} ->`, err);

  const body = { success: false, message };

  // Stack traces and internal error shape are dev-only — never leak them
  // to a production client.
  if (!env.isProduction && err && err.stack) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
