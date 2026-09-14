import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

/**
 * Signs a token containing only what's needed to identify and authorize a
 * request: user id and role. Never pass passwordHash, email, or any other
 * personal data here — the payload is not encrypted, just signed, so
 * anything in it is readable by whoever holds the token.
 */
export function signAuthToken({ id, role }) {
  return jwt.sign({ sub: id, role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

/**
 * Verifies a token and returns its payload, or null if it's missing,
 * expired, or invalid — never throws. Callers (requireAuth) decide what a
 * null result means for the request; this function's only job is
 * "valid or not."
 */
export function verifyAuthToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, env.jwtSecret);
  } catch {
    return null;
  }
}

// Cookie name + options live here (not duplicated between the controller
// that sets it and the one that clears it) — mismatched set/clear options
// is a common source of "logout doesn't actually log you out" bugs.
export const AUTH_COOKIE_NAME = 'farosayr_token';

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    // 'lax' works for same-site dev (Vite on a different port is still
    // "same-site" for cookie purposes as long as it's the same registrable
    // domain in production); 'none' would be needed only for a genuinely
    // cross-site deployment, which isn't this project's setup.
    sameSite: 'lax',
    // Matches the JWT_EXPIRES_IN default (7d). These are two independent
    // settings (jsonwebtoken parses '7d'-style strings; this needs a raw
    // ms number, and pulling in a duration-parsing library just for this
    // would be more machinery than this phase needs) — if you change
    // JWT_EXPIRES_IN, update this to match so the cookie doesn't outlive
    // or expire before the token it holds.
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
}
