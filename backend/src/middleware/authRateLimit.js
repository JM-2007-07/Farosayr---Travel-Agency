import rateLimit from 'express-rate-limit';

/**
 * Stricter limiter for the two endpoints an attacker would actually brute-
 * force (login — password guessing; register — account-creation spam).
 * The global limiter in app.js (300/15min) covers general abuse but is far
 * too loose to meaningfully slow down a credential-stuffing attempt against
 * a single endpoint. 20/15min per IP is generous enough that a real user
 * mistyping their password a few times, or a shared office/NAT IP, won't
 * get locked out during normal development or use, while still bounding
 * automated guessing.
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

/**
 * Separate instance (own counter, not shared with authRateLimit) for the
 * two public, unauthenticated write endpoints most exposed to spam —
 * contact form and newsletter signup. A bit looser than the auth limiter
 * since these aren't a credential-guessing target, just a spam-volume one.
 */
export const publicWriteRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

/**
 * Telegram webhook limiter. All genuine traffic arrives from a handful of
 * Telegram server IPs, so a per-IP cap on successful requests would
 * throttle the bot itself as it gets busier (which is also why app.js
 * exempts this route from the global limiter). Instead only REJECTED
 * requests (wrong secret → 401, not configured → 503) are counted, which
 * bounds secret-guessing without ever limiting Telegram.
 */
export const telegramWebhookRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
