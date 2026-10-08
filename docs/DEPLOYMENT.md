# Farosayr — Deployment & Infrastructure

Facts verified on 2026-10-06 with the Vercel CLI (read-only) and public
requests. Domains/DNS: [DNS.md](DNS.md). Security: [SECURITY.md](SECURITY.md).

## 1. Architecture

**Today**

```
Visitor ──HTTPS──► farosayr.com  (Vercel project farosayr-t-a-frontend, static + edge)
   │                    www.farosayr.com ─308─► farosayr.com
   │  fetch(credentials) cross-site
   ▼
farosayr-t-a-backend.vercel.app  (Vercel project farosayr-t-a-backend, Express, 1 function)
   │                                   ▲
   ▼                                   │ POST /api/telegram/webhook (secret header)
Neon PostgreSQL (ap-southeast-1, pooled, TLS)     Telegram
```

`farosayr.tj` does not resolve yet (DNS.md §2).

**Target** (after the domain cutover, §7)

```
farosayr.tj  ◄─308─ www.farosayr.tj, farosayr.com, www.farosayr.com
   │  fetch(credentials) same-site
   ▼
api.farosayr.tj  (backend project, region sin1 next to the database)
   ▼
Neon PostgreSQL (ap-southeast-1)          Telegram ──► api.farosayr.tj/api/telegram/webhook
```

## 2. Vercel projects

| Project | Root | Framework | Node | Production branch | Domains |
|---|---|---|---|---|---|
| `farosayr-t-a-frontend` | `frontend` | Vite | 24.x | `main` (GitHub) | farosayr.com, www.farosayr.com, farosayr.tj, www.farosayr.tj |
| `farosayr-t-a-backend` | `backend` | Express | 24.x | `main` (GitHub) | `farosayr-t-a-backend.vercel.app` (→ add `api.farosayr.tj`) |
| `farosayr-travel-agency` | `.` | Other | 24.x | — (last deploy 51 days ago) | `farosayr-travel-agency.vercel.app` — **old static version of the site, still public**. Delete the project (EXTERNAL) once nothing links to it. |

- Node is pinned to `24.x` in both `package.json` (`engines`), matching the
  Vercel projects.
- `backend/vercel.json` pins the function region to **`sin1`** (Singapore),
  next to the Neon database (`ap-southeast-1`). Before this every database
  query crossed from `iad1` (Washington) to Singapore; `/api/health` took
  ~0.9 s. Verify after deploy: `GET /api/health` → `"region": "sin1"`.
- Pushes to `main` deploy production automatically; other branches and
  PRs get **preview** deployments, protected by Vercel Authentication.
- Local CLI note: the git-ignored `.vercel/repo.json` in this working copy
  links `backend/` to a project id that no longer exists
  (`farosayr-travel-agency-backend`). Don't deploy from the CLI with it;
  re-link with `vercel link --project farosayr-t-a-backend` inside
  `backend/` if CLI deploys are ever needed.

## 3. Environment variables

All variables are currently scoped to **Production only**. Preview
deployments get no database, no JWT secret and no Telegram token — so a
preview backend doesn't start and a preview frontend has no API. Previews
are build checks; that is a deliberate, safe default. (To make previews
usable later, give them their **own** database and secrets, never the
production ones.)

| Variable | Project | Secret | Required | Value / notes |
|---|---|---|---|---|
| `DATABASE_URL` | backend | yes | yes | Neon **pooled** URL (`-pooler` host), `sslmode=require` |
| `JWT_SECRET` | backend | yes | yes | ≥ 32 random chars — **rotate** (§7, step 6) |
| `JWT_EXPIRES_IN` | backend | no | no | `7d` default |
| `API_PREFIX` | backend | no | no | `/api` |
| `CLIENT_URL` | backend | no | yes | today `https://farosayr.com`; after cutover `https://farosayr.tj` |
| `AUTH_COOKIE_SAMESITE` | backend | no | no | unset (= `none` in production) today; **`lax`** after cutover |
| `TELEGRAM_BOT_TOKEN` | backend | yes | for the bot | **rotate** (§7, step 7) |
| `TELEGRAM_WEBHOOK_SECRET` | backend | yes | with the bot | rotate together with the token |
| `TELEGRAM_ADMIN_CHAT_ID` | backend | private | for notifications | |
| `VITE_API_URL` | frontend | no (public) | yes | today `https://farosayr-t-a-backend.vercel.app/api`; after cutover `https://api.farosayr.tj/api` |
| `VITE_YANDEX_MAPS_API_KEY` | frontend | no (public) | for the map | restrict by HTTP Referer in Yandex |

Never in production: `SEED_DEV_PASSWORD`, `SEED_ALLOW_REMOTE_DATABASE`.
`NODE_ENV=production` is set by Vercel (verified: production responses
carry no stack traces).

Changing a variable needs a **redeploy** to take effect.

## 4. Database (Neon)

| | |
|---|---|
| Production | Neon PostgreSQL, `ap-southeast-1`, pooled endpoint, TLS + channel binding |
| Development | must be a **local** PostgreSQL (DEVELOPMENT.md). The current developer `backend/.env` points at the hosted Neon database — the backend now prints a warning at startup, and `prisma:migrate` / the seed refuse to run against it. |
| Connections | Prisma's per-instance pool through Neon's PgBouncer pooler — suitable for serverless. |

### Migrations

```bash
# development (local database only — guarded by scripts/assert-local-db.js)
npm run prisma:migrate              # prisma migrate dev

# production (manual, never part of the Vercel build)
DATABASE_URL="<Neon DIRECT (non-pooler) URL>" npm run prisma:migrate:deploy
```

- Review the SQL in `prisma/migrations/` first.
- Use the **direct** (non-`-pooler`) connection string for `migrate deploy`;
  migrations take advisory locks that a transaction pooler may not support.
- Never run `prisma migrate dev`, `prisma migrate reset`, `prisma db push`
  or the seed against production.
- Rollback: Prisma has no down-migrations. Make changes backward-compatible
  (add first, remove later) or write a reverse migration.

### Backups — EXTERNAL VERIFICATION REQUIRED

Not verifiable from the repository. In the Neon console check: plan,
**point-in-time restore / history retention window**, and who has access.
Restore = create a branch from a point in time and point `DATABASE_URL`
at it (or restore in place). Record the retention period and the
responsible person here once checked.

## 5. Health checks

`GET https://farosayr-t-a-backend.vercel.app/api/health` (later
`https://api.farosayr.tj/api/health`):

```json
{ "success": true, "message": "FaroSayr API is running", "database": "connected",
  "commit": "abc1234", "region": "sin1", "timestamp": "…" }
```

`503` with `"database": "disconnected"` when the database is unreachable.
No secrets or error details. Website check: `GET https://<site>/` → 200.

## 6. Release procedure

1. Work on a branch → open a PR against `main`.
2. `cd backend && npm run security:selftest` (all pass).
3. `cd frontend && npm run lint && npm run build`.
4. Push → Vercel builds a **preview** (build check).
5. Database migration in the release? Apply it (§4) **before** merging
   if the old code tolerates the new schema, otherwise right after.
6. Merge to `main` → production deploys.
7. Verify: `/api/health` (new `commit`, `region`), homepage + a tour
   page, sign in, `/api/auth/me`, admin dashboard, contact form → Telegram
   notification, bot `/start`, `npm run telegram:webhook -- info`.

### Rollback

Vercel → project → **Deployments** → previous production deployment →
**Promote to Production** (or `vercel rollback` / `vercel promote <url>`
from a correctly linked directory). Frontend and backend roll back
independently; database migrations do not (see §4).

## 7. Domain cutover to farosayr.tj (combined with the Step 2 actions)

All steps are EXTERNAL (Vercel dashboard, registrar, BotFather) except
step 5, which is a code commit prepared below. Do them in one
maintenance window; users are signed out once (step 6).

1. **Real admin.** Make sure a real (non-demo) account has role ADMIN
   (SECURITY.md §1.2).
2. **DNS.** Delegate `farosayr.tj` to Vercel (DNS.md §4). Wait until
   `https://farosayr.tj` serves the site with a certificate.
3. **Transition CORS.** Backend env `CLIENT_URL=https://farosayr.com,https://farosayr.tj`
   → redeploy backend. (Now the site works on both domains.)
4. **API domain.** Vercel → `farosayr-t-a-backend` → Settings → Domains →
   add `api.farosayr.tj`. Verify `https://api.farosayr.tj/api/health`.
5. **Code cutover commit** (then merge to `main`):
   - `frontend/src/seo/site.js` → `SITE_URL = 'https://farosayr.tj'`
     (also drives sitemap.xml and robots.txt);
   - `frontend/index.html` static head block → `farosayr.tj` (that block is
     scheduled for removal in the SEO step);
   - `frontend/vercel.json` → host redirects for `farosayr.com`,
     `www.farosayr.com`, `farosayr-t-a-frontend.vercel.app` →
     `https://farosayr.tj/:path*` (the `www.farosayr.tj` rule exists already).
   - Alternatively set the `.com` redirects in Vercel → Domains
     (*Redirect to farosayr.tj*, 308) — one hop at the edge.
6. **Env switch + secret rotation** (one redeploy of each project):
   - frontend `VITE_API_URL=https://api.farosayr.tj/api`;
   - backend `CLIENT_URL=https://farosayr.tj`, `AUTH_COOKIE_SAMESITE=lax`;
   - backend new `JWT_SECRET` (signs everyone out — sessions would be lost
     anyway because the API host changes);
   - lock demo accounts: `npm run demo:accounts -- --lock` (SECURITY.md §1.2).
7. **Telegram.** BotFather `/revoke` → new `TELEGRAM_BOT_TOKEN`, new
   `TELEGRAM_WEBHOOK_SECRET` in Vercel → redeploy backend →
   `npm run telegram:webhook -- set https://api.farosayr.tj/api/telegram/webhook`
   → `npm run telegram:webhook -- info` (url, `pending_update_count` low,
   no `last_error_message`) → `/start` in the bot → contact form →
   admin notification arrives.
8. **Verify** (§8 checklist), then Google Search Console: add and verify
   the `farosayr.tj` property, submit `https://farosayr.tj/sitemap.xml`,
   use *Change of address* from the `farosayr.com` property.
9. Keep `farosayr.com` registered and redirecting (expires 2027-10-05).

## 8. Production verification checklist

```text
[ ] http://farosayr.tj → 308 → https://farosayr.tj (one hop), valid certificate
[ ] https://www.farosayr.tj, https://farosayr.com, https://www.farosayr.com → 308 → https://farosayr.tj
[ ] https://farosayr.tj/tours/<slug> → HTTP 200 (detail pages no longer 404)
[ ] https://api.farosayr.tj/api/health → 200, database connected, region sin1
[ ] CORS: only https://farosayr.tj allowed (OPTIONS from another origin → no allow-origin)
[ ] Sign in → cookie HttpOnly; Secure; SameSite=Lax on api.farosayr.tj; /auth/me 200; admin works
[ ] Old session (before JWT rotation) → 401
[ ] Contact form → 201 + Telegram admin notification
[ ] Bot /start answers; webhook info clean
[ ] Demo admin login fails
[ ] /manifest (site.webmanifest), icons, robots.txt, sitemap.xml served from farosayr.tj
```

## 9. Monitoring & observability (current capability)

| Signal | Where | Limitation |
|---|---|---|
| Build/deploy failures | Vercel → Deployments (+ email) | — |
| API errors (5xx), DB errors | Vercel → backend → Logs (`ERROR … ->` lines, request log) | Retention per Vercel plan; no alerting |
| Telegram failures | Backend logs (`Telegram … failed`), `telegram:webhook -- info` | Manual |
| DB availability | `/api/health` (503 when down) | No external uptime monitor configured |
| Domain/certificate | Vercel → Domains | — |
| Frontend runtime errors | **none** (browser console only) | No client error reporting |

Recommended later: an external uptime check on `/api/health`, and error
reporting for frontend/backend once there is a need.

## 10. Troubleshooting

| Symptom | Likely cause |
|---|---|
| Site loads, every API call fails (CORS) | Site origin missing from `CLIENT_URL`, or no redeploy after changing it |
| Signed out immediately / login doesn't stick | Cookie SameSite vs. domains mismatch (`AUTH_COOKIE_SAMESITE`), or third-party cookies blocked while still on `*.vercel.app` |
| `403 Origin not allowed` | Request from an origin not in `CLIENT_URL` (CSRF guard) |
| Backend 500 on every request after deploy | Missing `JWT_SECRET`/`CLIENT_URL` (startup error in logs) |
| `/api/health` 503 | Database unreachable / wrong `DATABASE_URL` |
| Bot silent | Webhook URL/secret mismatch — `telegram:webhook -- info`, see TELEGRAM.md §6.3 |
| Detail pages 404 | `vercel.json` rewrites must target `/spa` (not `/spa.html`, which `cleanUrls` redirects) |
