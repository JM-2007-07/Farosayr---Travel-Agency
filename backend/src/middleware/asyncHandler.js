/**
 * Wraps an async Express handler so a rejected promise is forwarded to
 * next(err) instead of crashing the process or hanging the request.
 * Not needed by the current (synchronous) health controller — this exists
 * as infrastructure for the CRUD controllers the next phases will add.
 *
 * Usage: router.get('/things', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
