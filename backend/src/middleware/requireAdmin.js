import { requireAuth } from './auth.middleware.js';
import { requireRole } from './role.middleware.js';

// Composed middleware array so every admin route applies the exact same
// two checks in the exact same order, without retyping
// `requireAuth, requireRole('ADMIN')` in ~25 route definitions. Usage:
//   router.get('/', ...requireAdmin, asyncHandler(handler))
export const requireAdmin = [requireAuth, requireRole('ADMIN')];
