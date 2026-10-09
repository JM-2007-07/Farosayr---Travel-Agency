# Farosayr — Security

How the application is protected, what is configured where, what is still
open, and the checklist to run before (and after) every production release.

Related: [AUTHENTICATION.md](AUTHENTICATION.md) · [TELEGRAM.md](TELEGRAM.md) ·
[DEPLOYMENT.md](DEPLOYMENT.md) · [DNS.md](DNS.md) · [DEVELOPMENT.md](DEVELOPMENT.md)

---

## 1. Open incidents (action required)

| # | Incident | Status |
|---|---|---|
| 1 | **Telegram bot token committed to Git** — commit `a256028` (`backend/.env.example`), removed in `ed34a94`, but both commits are on `origin/translation` of the **public** GitHub repository. The token currently configured is that same token (SHA-256 fingerprint match). | CODE: token only read from env. **EXTERNAL: rotate the token** (§1.1). |
| 2 | **Demo seed data in the production database** — the four seeded demo users' reviews are live, so the seed ran against production (a local `.env` pointing at the hosted database). The seed also creates `admin@farosayr.test` (ADMIN) with the formerly hard-coded, publicly documented password. | CODE: seed now refuses production / remote databases and has no fixed password. **EXTERNAL: lock the demo accounts** (§1.2). |

### 1.1 Rotate the Telegram bot token

Removing the token from the code does not help: anyone who cloned or
browsed the repository has it. Until it is revoked they can read the bot's
updates, change its webhook and send messages as the bot.

1. @BotFather → `/revoke` → choose the bot → copy the **new** token.
2. Vercel → backend project → Settings → Environment Variables →
   replace `TELEGRAM_BOT_TOKEN` (Production; mark *Sensitive*).
3. Also generate a new `TELEGRAM_WEBHOOK_SECRET`
   (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
   and replace it in Vercel.
4. Redeploy the backend.
5. Re-register the webhook with the new token and secret — see
   [TELEGRAM.md §6.2](TELEGRAM.md#62-register-the-webhook) — and check
   `npm run telegram:webhook -- info`.
6. Replace the old token in every local `backend/.env`.

Optional, separately: purge the commits from Git history (e.g.
`git filter-repo`) and force-push. This rewrites history for every clone,
so it is a deliberate decision — and it does **not** replace rotation.

### 1.2 Lock the demo accounts in production

`npm run demo:accounts` (backend) lists accounts created by the seed
(`*@example.test`, `admin@farosayr.test`) — report only, changes nothing.
`npm run demo:accounts -- --lock` replaces their password hashes with the
hash of a random value, so the known password stops working. It deletes
nothing (reviews and bookings stay) and refuses to lock the demo admin
while it is the only ADMIN.

Run it with `DATABASE_URL` pointing at production, from a trusted machine:

1. If the demo admin is the only admin: register a real account on the
   site, sign in once as the demo admin, promote the real account in
   Admin → Users, sign out.
2. `npm run demo:accounts` — review the list.
3. `npm run demo:accounts -- --lock`.
4. Rotate `JWT_SECRET` in Vercel and redeploy: sessions already issued to the
   demo admin stay valid until they expire (up to 7 days) otherwise. This
   signs everybody out once.
5. Removing the fake reviews/booking/contact message from production is a
   content decision; do it in the admin panel (Reviews, Messages).

---

## 2. Architecture overview

```
Browser (farosayr.com, Vercel static)
   │  fetch(..., credentials: 'include')   — JSON only
   ▼
Express API (farosayr-t-a-backend.vercel.app, Vercel serverless)
   helmet → CORS allowlist → cookie-parser → express.json(100kb)
   → request log → global rate limit → CSRF guard → routes
   → per-route: rate limit → requireAuth → requireRole('ADMIN') → Zod validation
   → Prisma (parameterised queries) → PostgreSQL (Neon)
   → notFound → errorHandler (sanitised)

Telegram ──POST /api/telegram/webhook (secret header)──► same Express app
```

Frontend and API are on **different sites**. That decides the cookie
setting (SameSite=None) and why CSRF protection is needed — see §6 and §7.

## 3. Secrets policy

- Secrets live only in environment variables: `backend/.env` locally
  (git-ignored), Vercel Environment Variables in production.
- Committed: `backend/.env.example`, `frontend/.env.example` — placeholders
  only.
- Never in the frontend: anything prefixed `VITE_` is compiled into the
  public JavaScript bundle. Only public values may use that prefix.
- Never logged, never returned by the API. `utils/logger.js` additionally
  masks credentials in URLs (`scheme://user:***@host`) and Telegram bot
  tokens in anything it prints.
- A secret that was ever committed or shared is **compromised**: rotate it.
- Ignored by Git (`.gitignore` files): `.env`, `.env.*` (except
  `.env.example`), `.vercel`, `*.pem`, `*.key`, `*.p12`, `node_modules`, `dist`.

### Git history audit (2026-10-06)

Scanned every commit on all branches for tokens, database URLs with
passwords, JWT secrets, private keys, cloud keys and `secret/password/token`
assignments.

| Finding | Assessment |
|---|---|
| Telegram bot token in `a256028` | **Real, compromised** — incident #1 |
| `DATABASE_URL` in `bd7f665` | Placeholder (`postgres:password@localhost`) |
| `JWT_SECRET` in `bd7f665` | Placeholder (`replace-this-…`) |
| Seed password in `bd7f665` (`seed.js`) | Real demo credential, public — incident #2 |
| Dummy token/secret in `telegram-selftest.js` | Test values, not credentials |

No `.env` file has ever been committed.

## 4. Environment variables

### Backend — server-only (Vercel: backend project)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Contains credentials. Never log. |
| `JWT_SECRET` | yes | ≥ 32 random chars (warning at startup if shorter). Rotating signs everyone out. |
| `JWT_EXPIRES_IN` | no (`7d`) | Cookie lifetime follows it automatically. |
| `CLIENT_URL` | yes in production | Allowed site origin(s), comma-separated; first = canonical. Production: `https://farosayr.com` → `https://farosayr.tj` after the domain cutover. |
| `AUTH_COOKIE_SAMESITE` | no | `lax` / `strict` / `none`. Default `none` in production (cross-site API), `lax` in development. Set `lax` once the API runs on `api.farosayr.tj`. |
| `NODE_ENV` | — | `production` on Vercel. Controls Secure cookies, error detail, CORS defaults. |
| `TELEGRAM_BOT_TOKEN` | no | Secret. Format checked at startup. |
| `TELEGRAM_WEBHOOK_SECRET` | with the bot | Secret, 16–256 chars `A–Z a–z 0–9 _ -`. |
| `TELEGRAM_ADMIN_CHAT_ID` | for notifications | Not secret, but private. |
| `SEED_DEV_PASSWORD`, `SEED_ALLOW_REMOTE_DATABASE` | dev only | Never set in production. |

### Frontend — public (compiled into the bundle)

| Variable | Notes |
|---|---|
| `VITE_API_URL` | Public API base URL. |
| `VITE_YANDEX_MAPS_API_KEY` | Public by design (the Maps JS API runs in the browser). **Restrict it by HTTP Referer** to `farosayr.com` in the Yandex developer console. |

Verified on 2026-10-06: a production build contains none of the backend
secrets and no server-side variable names.

## 5. Authentication & sessions

Details: [AUTHENTICATION.md](AUTHENTICATION.md).

- Passwords: bcrypt (cost 12), 8–128 chars; never stored or returned in
  plain text; responses use an explicit safe-field allowlist.
- Login: identical error for unknown email and wrong password, with a
  dummy bcrypt comparison so timing doesn't reveal which.
- Session: one JWT (HS256, algorithm pinned on sign and verify) in an
  httpOnly cookie, 7 days. **No refresh tokens.**
- Every authenticated request re-loads the user from the database, so a
  deleted user or a role change takes effect immediately.

## 6. Cookies

`farosayr_token`: `HttpOnly`, `Path=/`, `Max-Age` = token lifetime.

| | Production | Development |
|---|---|---|
| `Secure` | yes | no (http://localhost) |
| `SameSite` | `None` | `Lax` |

Why `None` in production: the site (`farosayr.com`) and the API
(`*.vercel.app`) are different sites; with `Lax`/`Strict` the browser would
not send the cookie on the site's API calls at all. Consequences:

- CSRF must be handled explicitly (§7).
- Browsers that block third-party cookies (Safari by default, Firefox
  strict mode) may not keep the session — users on those browsers can fail
  to stay signed in.

The fix is prepared: `SameSite` is configurable (`AUTH_COOKIE_SAMESITE`),
and the domain cutover ([DEPLOYMENT.md §7](DEPLOYMENT.md#7-domain-cutover-to-farosayrtj-combined-with-the-step-2-actions))
moves the API to `api.farosayr.tj` — the same site as `farosayr.tj` — and
switches the cookie to `SameSite=Lax`. The CSRF guard stays in place.

## 7. CORS & CSRF

**CORS** (`app.js`): credentialed requests only from origins in
`CLIENT_URL`; methods GET/POST/PATCH/DELETE; request headers `Content-Type`,
`Accept`. Development origins are only allowed when `NODE_ENV` is not
`production`. Foreign origins get no CORS headers.

**CSRF** (`middleware/csrf.middleware.js`) for every POST/PATCH/DELETE:

1. `Origin` (or `Referer` when Origin is absent) must be in `CLIENT_URL`
   → otherwise **403**. Requests with neither header are non-browser clients
   (curl, Telegram), which can't carry a visitor's cookie.
2. Request bodies must be `application/json` → otherwise **415**. HTML
   forms can't send JSON, and a cross-site JSON `fetch` needs a CORS
   preflight, which CORS refuses.

The URL-encoded body parser was removed; the API accepts JSON only. The
Telegram webhook passes both checks naturally (no Origin, JSON body).

## 8. Rate limiting

| Limiter | Scope | Limit |
|---|---|---|
| global | all `/api` (except webhook) | 300 / 15 min / IP |
| `authRateLimit` | `POST /auth/login`, `/auth/register` | 20 / 15 min / IP |
| `publicWriteRateLimit` | `POST /contact`, `/newsletter/subscribe` | 30 / 15 min / IP |
| `userWriteRateLimit` | bookings, reviews, favorites writes | 60 / 15 min / IP |
| `telegramWebhookRateLimit` | webhook, **failed** requests only | 20 / 15 min / IP |

**Known limitation:** all counters live in process memory. On Vercel each
serverless instance counts separately and resets on cold start, so limits
are best-effort, not a hard cap. A shared store (Redis/Upstash) is the fix
when that infrastructure is introduced.

## 9. Authorization & admin

- `/api/admin/*`: `router.use(requireAuth, requireRole('ADMIN'))` — applied
  once to every admin route. Verified for all 21 admin routes:
  unauthenticated → 401, USER → 403, ADMIN → 200.
- The role comes from the database on each request, not from the token.
- User data is always scoped to `req.user.id` (bookings, favorites,
  reviews); ids in the body/query are ignored.
- Admins can't demote the last remaining admin.
- The frontend admin guard is UX only; the API enforces everything.

## 10. Telegram

Details: [TELEGRAM.md](TELEGRAM.md). Webhook authenticated by
`X-Telegram-Bot-Api-Secret-Token` (constant-time comparison); Zod-validated
updates; private chats only; no admin commands (the admin chat id is only a
notification target); all dynamic text HTML-escaped; token never logged.

## 11. Input validation & mass assignment

- Every write endpoint validates the body with Zod on the backend
  (`src/validation/*`). Unknown fields are stripped, so `role`, `userId`,
  `passwordHash`, `status` etc. can't be injected.
- Emails ≤ 254 chars; passwords 8–128; text fields length-limited.
- Admin image URLs must be `https://`, `http://` or a site path (`/…`).
- Public list filters (`/api/tours`) are coerced to single, length-bounded
  strings; unknown sort keys fall back to the default.
- Request bodies are limited to 100 kb (413 above that).
- No file uploads exist (images are URLs).

## 12. Database

- Prisma only; the single raw query is the constant `SELECT 1` health check.
  No string-built SQL.
- `passwordHash` is never selected into API responses (allowlists / `select`).
- Public endpoints expose: tours, destinations, deals, FAQ, gallery, stats,
  and reviews with the reviewer's **name** only (no email).

## 13. Error handling & logging

- Production responses never include stack traces, Prisma messages, SQL,
  paths or environment values: unexpected errors → `500 Something went wrong`.
- Malformed JSON → 400, oversized → 413, unique conflicts → 409,
  missing record → 404, all with fixed wording.
- Server logs: method + URL + status (morgan), and error details for 5xx —
  never bodies, cookies or headers; credentials masked by `utils/logger.js`.

## 14. Security headers

**API** (helmet defaults): `Content-Security-Policy` (default-src 'self',
frame-ancestors 'self'), `Strict-Transport-Security`, `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy: no-referrer`, COOP/CORP; `X-Powered-By`
removed.

**Site** (`frontend/vercel.json`): `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`,
`Permissions-Policy` (camera, microphone, geolocation, payment, usb off),
`Cross-Origin-Opener-Policy: same-origin`. HSTS is sent by Vercel.

**Not yet: a Content-Security-Policy for the site.** It needs an exact list
for Google Fonts, images.unsplash.com, res.cloudinary.com (hero video),
Yandex Maps v3 (scripts, tiles, workers) and the API origin, and must be
validated in a browser on the production domain (Report-Only first) so the
map and video don't break.

## 15. Frontend

- No `dangerouslySetInnerHTML`; the one `innerHTML` (map marker) was
  replaced with DOM APIs + `textContent`.
- `localStorage` holds only the UI language. No tokens in JS storage —
  the session cookie is httpOnly.
- No redirect targets taken from the URL (no open redirect).
- External links use `rel="noopener noreferrer"`.

## 16. Debug / test endpoints

| Endpoint | Decision |
|---|---|
| `GET /__debug`, `GET /api/__router-debug` | **Removed** (echoed routing internals). |
| `GET /api/auth/admin-check` | **Removed** (infrastructure test, unused). |
| `GET /api/health` | Kept, public: status + DB connected yes/no + timestamp, no details. |
| `GET /` | Kept: `{ success, message }`. |

No Swagger/OpenAPI endpoint exists.

## 17. Dependencies

`npm audit` (2026-10-06): backend and frontend — **0 vulnerabilities**
after patch-level lockfile fixes (`proxy-addr` 2.0.8, `source-map-js` 1.2.2).

Deliberately not upgraded (major versions, need their own migration):
Prisma 5 → 7, Zod 3 → 4, express-rate-limit 7 → 8, dotenv 16 → 18.

## 18. Verification

`cd backend && npm run security:selftest` — runs the real app with an
in-memory database stub and a mocked Telegram API (touches no database and
no bot): authentication (missing/garbage/expired/forged/`alg:none` tokens,
deleted user, cookie flags, logout), mass assignment, validation, all admin
routes for 401/403/200, IDOR scoping, CORS, CSRF, error sanitising, body
limits, headers, Telegram webhook security, seed guard, rate limiting, log
redaction and secret leakage in responses.

## 19. Known limitations / accepted risks

| Item | Severity | Plan |
|---|---|---|
| Rate limits are per-instance (in-memory) | Medium | Shared store with infrastructure step |
| SameSite=None cross-site cookie (Safari may drop sessions) | Medium | Prepared: switch to Lax at the domain cutover (DEPLOYMENT.md §7) |
| No server-side session revocation: logout clears the cookie, a copied token stays valid until it expires (7 d) | Medium | Add a per-user token version; until then rotate `JWT_SECRET` to revoke all sessions |
| No refresh tokens / no password reset / no email verification | Low–Medium | Product decision |
| Telegram duplicate-update memory is per instance | Low | Replies are read-only; at worst a repeated message |
| No site CSP yet | Low–Medium | §14 |
| Compromised token in public Git history | **Critical until rotated** | §1.1 |

## 20. Production checklist

```text
[ ] Telegram bot token rotated (BotFather /revoke) and updated in Vercel
[ ] Telegram webhook secret rotated, webhook re-registered, `info` clean
[ ] No secrets in Git history requiring active credentials
[ ] Production env variables configured (DATABASE_URL, JWT_SECRET ≥ 32, CLIENT_URL=https://farosayr.com, NODE_ENV=production)
[ ] Demo admin disabled (npm run demo:accounts -- --lock) and JWT_SECRET rotated afterwards
[ ] Demo seed disabled in production (guard in prisma/seed-guard.js)
[ ] Cookies: HttpOnly + Secure verified; SameSite=Lax after the API moved to api.farosayr.tj
[ ] CORS restricted to CLIENT_URL (https://farosayr.tj after cutover)
[ ] CSRF guard active (403 foreign Origin, 415 non-JSON)
[ ] Rate limiting reviewed (per-instance limitation accepted)
[ ] Admin authorization verified (security:selftest)
[ ] Telegram webhook protected (401 without secret)
[ ] Production errors sanitized
[ ] Debug endpoints removed
[ ] Security headers present on API and site
[ ] Frontend bundle contains no secrets
[ ] Yandex Maps key restricted by HTTP Referer
[ ] Database access validated (no raw SQL, no passwordHash in responses)
[ ] npm audit reviewed (0 vulnerabilities)
[ ] Production deployment verified (login, booking, contact, admin, bot)
```
