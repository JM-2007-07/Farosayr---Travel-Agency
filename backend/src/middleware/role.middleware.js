/**
 * Must run after requireAuth (relies on req.user already being set).
 * Usage: router.get('/admin-only', requireAuth, requireRole('ADMIN'), handler)
 *
 * 401 vs 403 is deliberate: requireAuth alone answers "who are you", this
 * answers "are you allowed here" — an authenticated USER hitting an
 * ADMIN-only route gets 403, not 401, since they're authenticated, just
 * not authorized.
 */
export function requireRole(...allowedRoles) {
  return function roleCheck(req, res, next) {
    if (!req.user) {
      const err = new Error('Not authenticated');
      err.statusCode = 401;
      return next(err);
    }
    if (!allowedRoles.includes(req.user.role)) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      return next(err);
    }
    next();
  };
}
