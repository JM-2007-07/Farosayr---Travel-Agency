# Farosayr — Authentication & Authorization

How accounts, sessions and roles work today. Security context:
[SECURITY.md](SECURITY.md).

## Overview

| Piece | Implementation |
|---|---|
| Passwords | bcrypt, cost 12 (`controllers/auth.controller.js`) |
| Session | One JWT in the httpOnly cookie `farosayr_token` |
| Token | HS256 (pinned), payload `{ sub: userId, role }`, lifetime `JWT_EXPIRES_IN` (default 7d) — `utils/jwt.js` |
| Refresh tokens | **None.** When the token expires the user signs in again. |
| Authentication middleware | `requireAuth` — `middleware/auth.middleware.js` |
| Authorization | `requireRole('ADMIN')` / `requireAdmin` — `middleware/role.middleware.js`, `requireAdmin.js` |
| Roles | `USER` (default), `ADMIN` (Prisma enum `UserRole`) |

The frontend never sees the token: it's httpOnly, and every API call uses
`fetch(..., { credentials: 'include' })` (`frontend/src/services/api/client.js`).
`AuthContext` asks `GET /api/auth/me` on load to learn who is signed in.

## Register — `POST /api/auth/register`

Body `{ name, email, password }` (JSON), validated with Zod
(`validation/auth.validation.js`): name 1–120, email ≤ 254 (lower-cased),
password 8–128.

1. Rate limit: 20 / 15 min / IP.
2. Existing email → `409 An account with this email already exists`
   (a concurrent duplicate is also mapped to 409).
3. Password hashed with bcrypt; user created with role **USER** — the
   request can't set a role (unknown fields are stripped).
4. Cookie set (signed in), `201 { id, name, email, role }`.

## Login — `POST /api/auth/login`

Body `{ email, password }`.

1. Rate limit: 20 / 15 min / IP.
2. Unknown email or wrong password → the same
   `401 Invalid email or password`; bcrypt runs against a dummy hash for
   unknown emails so timing is identical.
3. Success → cookie set, `200 { id, name, email, role }`.

## Session check — `GET /api/auth/me`

`requireAuth`: reads the cookie, verifies signature, algorithm and
expiry, then **loads the user from the database** (safe fields only).
Missing / invalid / expired / forged token or a deleted user → `401`.
Because the user is re-read on every request, a role change or account
deletion applies immediately.

## Logout — `POST /api/auth/logout`

Clears the cookie (same options it was set with). Safe to call when
signed out.

Limitation: there is no server-side session store, so a token copied
before logout remains valid until it expires. To revoke **all** sessions
(e.g. after an incident), rotate `JWT_SECRET` and redeploy — everyone is
signed out. Per-user revocation would need a `tokenVersion` column
(planned, see SECURITY.md §19).

## Cookie

| Attribute | Value |
|---|---|
| Name | `farosayr_token` |
| HttpOnly | always |
| Secure | production |
| SameSite | `AUTH_COOKIE_SAMESITE`: `None` in production today (site and API are different sites), **`Lax` after the API moves to `api.farosayr.tj`** (same site as `farosayr.tj`); `Lax` in development |
| Path | `/` |
| Max-Age | derived from `JWT_EXPIRES_IN` |

State-changing requests are protected by the CSRF guard (Origin allowlist +
JSON-only bodies) regardless of the SameSite setting — SECURITY.md §7.

The cookie is host-only (no `Domain` attribute): it belongs to the API host.
Moving the API to a new host therefore signs everyone out once.

## Expiration

`JWT_EXPIRES_IN` (default `7d`) sets both the token `exp` and the cookie
`Max-Age`. After expiry `/auth/me` answers 401 and the site shows the
signed-out state.

## Authorization

- **USER** endpoints (`/api/bookings`, `/api/favorites`, `POST /api/reviews`)
  use `requireAuth` and always act on `req.user.id`; ids from the body or
  query are ignored.
- **ADMIN** endpoints (`/api/admin/*`): the admin router applies
  `requireAuth` + `requireRole('ADMIN')` to every route — 401 when signed
  out, 403 for non-admins.
- The role used for the check comes from the database, not from the
  token payload.
- Admins change roles via `PATCH /api/admin/users/:id/role`; demoting the
  last admin is refused.
- `AdminGuard` in the frontend only avoids showing admin UI to non-admins;
  it is not a security boundary.

## Creating the first admin

Register normally, then promote the account from an existing admin
account (Admin → Users). With no admin at all, set the role directly in
the database (Prisma Studio / SQL) — there is intentionally no endpoint
that grants ADMIN without an existing admin.

Demo accounts from the development seed must never exist in production —
see SECURITY.md §1.2.
