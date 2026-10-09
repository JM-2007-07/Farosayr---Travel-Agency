import { isAllowedOrigin } from '../config/env.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function reject(res, status, message) {
  return res.status(status).json({ success: false, message });
}

/**
 * CSRF protection for the cookie-authenticated API.
 *
 * The auth cookie is SameSite=None in production (the site and the API are
 * on different domains — see docs/AUTHENTICATION.md), so the browser
 * attaches it to cross-site requests too. Two independent checks keep a
 * third-party page from making state-changing requests with it:
 *
 * 1. Origin check — when the browser says where a request comes from
 *    (Origin, or Referer as a fallback), it must be one of CLIENT_URL.
 *    Requests with neither header come from non-browser clients (curl,
 *    Telegram's servers), which cannot carry a visitor's cookies anyway.
 * 2. JSON-only bodies — every API body is JSON. A cross-site HTML <form>
 *    can only send urlencoded/multipart/text bodies, and a cross-site
 *    fetch() with a JSON body needs a CORS preflight, which CORS refuses
 *    for any origin outside CLIENT_URL.
 *
 * GET/HEAD/OPTIONS never change state and pass through untouched.
 */
export function csrfProtection(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();

  const origin = req.get('origin');
  if (origin) {
    if (!isAllowedOrigin(origin)) return reject(res, 403, 'Origin not allowed');
  } else {
    const referer = req.get('referer');
    if (referer) {
      let refererOrigin = null;
      try {
        refererOrigin = new URL(referer).origin;
      } catch {
        // unparsable Referer — treat as foreign
      }
      if (!isAllowedOrigin(refererOrigin)) return reject(res, 403, 'Origin not allowed');
    }
  }

  // req.is() is null when the request has no body (e.g. DELETE, or a POST
  // without payload) and false when the body is anything other than JSON.
  if (req.is('application/json') === false) {
    return reject(res, 415, 'Request body must be JSON');
  }

  next();
}
