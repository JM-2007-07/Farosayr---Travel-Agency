import { Router } from 'express';
import { register, login, logout, me, adminCheck } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authRateLimit } from '../middleware/authRateLimit.js';

const router = Router();

// authRateLimit only on the two brute-forceable endpoints — not on /me
// (called on every page load by AuthContext; rate-limiting it tightly
// would break normal browsing) or /logout (no attacker benefit from
// spamming it).
router.post('/register', authRateLimit, asyncHandler(register));
router.post('/login', authRateLimit, asyncHandler(login));
// No requireAuth here on purpose — logout must be safe to call even when
// already logged out (clearing an unset cookie is a harmless no-op).
router.post('/logout', asyncHandler(logout));
router.get('/me', requireAuth, asyncHandler(me));

// Minimal route proving requireRole works end-to-end — infrastructure
// verification for this phase, not a real feature. Not a business
// endpoint, so it stays under /auth rather than implying an admin API
// exists yet.
router.get('/admin-check', requireAuth, requireRole('ADMIN'), asyncHandler(adminCheck));

export default router;
