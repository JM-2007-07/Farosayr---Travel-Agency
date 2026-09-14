import bcrypt from 'bcrypt';
import { prisma } from '../config/database.js';
import { registerSchema, loginSchema } from '../validation/auth.validation.js';
import { signAuthToken, AUTH_COOKIE_NAME, getAuthCookieOptions } from '../utils/jwt.js';

// Cost factor 12 — a reasonable modern default (bcrypt's own docs suggest
// 10-12 for most applications as of writing); not configurable via env
// since it's a code-level security parameter, not a deployment setting.
const BCRYPT_COST = 12;

function toSafeUser(user) {
  // Explicit allow-list, not a delete-passwordHash-and-return-the-rest —
  // an allow-list can't accidentally leak a field added to the model
  // later without this function being updated too.
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  return err;
}

function zodErrorMessage(result) {
  return result.error.issues.map((i) => i.message).join('; ');
}

export async function register(req, res) {
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    throw badRequest(zodErrorMessage(result));
  }
  const { name, email, password } = result.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Unlike login, revealing "this email is already registered" on the
    // *registration* endpoint is standard/expected UX, not the kind of
    // enumeration risk that applies to login's generic-error requirement.
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

  // role is never read from the request body — the Zod schema doesn't
  // even accept a role field, so a client cannot self-assign ADMIN by
  // sending one; this create() hardcodes USER regardless.
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: 'USER' },
  });

  const token = signAuthToken({ id: user.id, role: user.role });
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

  res.status(201).json({ success: true, data: toSafeUser(user) });
}

export async function login(req, res) {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    throw badRequest(zodErrorMessage(result));
  }
  const { email, password } = result.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // Same generic error whether the email doesn't exist or the password is
  // wrong — and the bcrypt.compare call still runs either way (against a
  // fixed dummy hash when there's no user) so a timing difference can't
  // reveal which case it was.
  const DUMMY_HASH = '$2b$12$CwTycUXWue0Thq9StjUM0uJ8Fs2Y0/6uYZ0h6.rGP8Gl3v2f6b8Cy';
  const isValid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !isValid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = signAuthToken({ id: user.id, role: user.role });
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

  res.status(200).json({ success: true, data: toSafeUser(user) });
}

export async function me(req, res) {
  // requireAuth has already loaded req.user with safe fields only, and
  // already returns 401 itself if there's no valid session — nothing
  // further to check here.
  res.status(200).json({ success: true, data: req.user });
}

export async function logout(req, res) {
  // No requireAuth on this route — clearing a cookie that isn't set is a
  // harmless no-op, and the spec explicitly wants this safe to call when
  // already logged out.
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());
  res.status(200).json({ success: true, data: null });
}

// Minimal route to prove requireRole actually works end-to-end — not a
// real feature, just infrastructure verification per this phase's scope.
export async function adminCheck(req, res) {
  res.status(200).json({ success: true, data: { message: 'Admin access confirmed', user: req.user } });
}
