import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Turns well-understood library errors into safe client errors.
 * Returns { statusCode, message } or null for "unexpected".
 */
function classify(err) {
  // Errors our own code threw deliberately (httpErrors.js etc.) — their
  // message was written by us and is safe to show.
  if (err && typeof err.statusCode === 'number' && !err.type) {
    return { statusCode: err.statusCode, message: err.message };
  }
  // body-parser (express.json) errors carry `type`; their messages can echo
  // parts of the request body, so they get fixed wording instead.
  switch (err?.type) {
    case 'entity.parse.failed':
      return { statusCode: 400, message: 'Invalid JSON body' };
    case 'entity.too.large':
      return { statusCode: 413, message: 'Request body too large' };
    case 'encoding.unsupported':
    case 'charset.unsupported':
      return { statusCode: 415, message: 'Unsupported request encoding' };
    default:
      break;
  }
  // Prisma known request errors — races the pre-checks in controllers can't
  // fully exclude (two simultaneous registrations with one email, a record
  // deleted between check and update).
  switch (err?.code) {
    case 'P2002':
      return { statusCode: 409, message: 'This record already exists' };
    case 'P2025':
      return { statusCode: 404, message: 'Not found' };
    case 'P2003':
      return { statusCode: 409, message: 'This record is referenced by other records' };
    default:
      return null;
  }
}

// Express 5 requires exactly 4 params for an error-handling middleware to
// be recognized as one — do not remove the unused `next`.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const known = classify(err);
  const statusCode = known?.statusCode ?? 500;
  const message =
    known && typeof known.message === 'string' && known.message ? known.message : 'Something went wrong';

  // Full detail goes to the server log only (method + path, never the
  // body, cookies or headers). 4xx are expected client mistakes — one line.
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} ->`, err);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${statusCode} ${message}`);
  }

  const body = { success: false, message };

  // Stack traces are development-only — never sent to a production client.
  if (!env.isProduction && statusCode >= 500 && err?.stack) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}
