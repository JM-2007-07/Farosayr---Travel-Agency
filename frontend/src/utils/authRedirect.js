/**
 * "Come back here after signing in."
 *
 * The page that sends a visitor to /login passes its own location in router
 * state: navigate('/login', { state: loginState(location) }). After a
 * successful login/registration the visitor returns there instead of
 * landing on the homepage (e.g. back to /booking?tour=… they were on).
 *
 * Router state never comes from the URL, so this can't be abused as an
 * open redirect; only same-app paths are accepted anyway.
 */
const AUTH_PAGES = new Set(['/login', '/register']);

export function loginState(location) {
  return { from: { pathname: location.pathname, search: location.search, hash: location.hash } };
}

export function getReturnPath(state, fallback = '/') {
  const from = state?.from;
  if (!from || typeof from.pathname !== 'string' || !from.pathname.startsWith('/') || from.pathname.startsWith('//')) {
    return fallback;
  }
  if (AUTH_PAGES.has(from.pathname)) return fallback;
  return `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`;
}
