import { prisma } from '../config/database.js';
import { verifyAuthToken, AUTH_COOKIE_NAME } from '../utils/jwt.js';
import { asyncHandler } from './asyncHandler.js';

function unauthorized(message = 'Not authenticated') {
  const err = new Error(message);
  err.statusCode = 401;
  return err;
}

/**
 * Reads the JWT from the httpOnly cookie, verifies it, loads the current
 * user from the database, and attaches only safe fields to req.user.
 * Never attaches passwordHash. Any failure (missing/invalid/expired token,
 * or a user id that no longer exists) results in a uniform 401 — this
 * deliberately doesn't distinguish "bad token" from "token for a deleted
 * user" in the response, for the same reason login doesn't distinguish
 * "wrong email" from "wrong password".
 */
export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  const payload = verifyAuthToken(token);
  if (!payload) {
    throw unauthorized();
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true },
  });
  if (!user) {
    throw unauthorized();
  }

  req.user = user;
  next();
});
