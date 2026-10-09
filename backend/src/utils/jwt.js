import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// Pinned on both sign and verify, so a token claiming another algorithm
// (e.g. "none") is rejected outright.
const JWT_ALGORITHM = 'HS256';

/**
 * Signs a token containing only what's needed to identify the user: the
 * user id (and the role, informationally — authorization always re-reads
 * the role from the database, see auth.middleware.js). Never put
 * passwordHash, email or other personal data here: the payload is signed,
 * not encrypted.
 */
export function signAuthToken({ id, role }) {
  return jwt.sign({ sub: id, role }, env.jwtSecret, {
    algorithm: JWT_ALGORITHM,
    expiresIn: env.jwtExpiresIn,
  });
}

/**
 * Verifies a token and returns its payload, or null if it's missing,
 * expired, tampered with or signed differently — never throws.
 */
export function verifyAuthToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, env.jwtSecret, { algorithms: [JWT_ALGORITHM] });
  } catch {
    return null;
  }
}

// Cookie name + options live here (not duplicated between the controller
// that sets it and the one that clears it) — mismatched set/clear options
// is a common source of "logout doesn't actually log you out" bugs.
export const AUTH_COOKIE_NAME = 'farosayr_token';

// Cookie lifetime derived from JWT_EXPIRES_IN itself (sign a throwaway
// token once and read its exp - iat), so the cookie can never outlive or
// expire before the token it carries.
const AUTH_COOKIE_MAX_AGE_MS = (() => {
  const { iat, exp } = jwt.decode(signAuthToken({ id: 'lifetime-probe', role: 'USER' }));
  return (exp - iat) * 1000;
})();

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProduction,
    // AUTH_COOKIE_SAMESITE (config/env.js). "none" while the site and the
    // API are different sites (farosayr.com → *.vercel.app); "lax" once the
    // API lives on the site's own domain (farosayr.tj → api.farosayr.tj),
    // which also stops browsers that block third-party cookies from
    // dropping the session. CSRF is handled by middleware/csrf.middleware.js
    // either way. Development (localhost:5173 → localhost:5000) is
    // same-site, so it defaults to lax.
    sameSite: env.cookieSameSite,
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
    path: '/',
  };
}
