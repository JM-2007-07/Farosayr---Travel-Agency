# FaroSayr — Backend

Express 5 API + Prisma/PostgreSQL + cookie-based JWT authentication +
Telegram bot/notifications.

## Setup

```bash
npm install
cp .env.example .env     # edit: LOCAL DATABASE_URL, your own JWT_SECRET
npm run prisma:generate
npm run prisma:migrate   # local database only
npm run prisma:seed      # optional demo data (local only, see below)
npm run dev              # node --watch → http://localhost:5000/api
```

Details, including why a development `.env` must not point at the
production database: [../docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md).

## Seed (development only)

`npm run prisma:seed` creates demo content and demo users, including an
ADMIN (`admin@farosayr.test`). It refuses to run in production or against
a non-local database. The demo password comes from `SEED_DEV_PASSWORD` or
is generated and printed at the end of the run — it is never stored in
the repository. (An older version used a fixed password that is now
public; it must not work anywhere — see ../docs/SECURITY.md §1.2.)

## Scripts

| Script | Purpose |
|---|---|
| `dev` / `start` | Run the API |
| `prisma:generate` / `prisma:migrate` / `prisma:studio` / `prisma:seed` | Prisma |
| `security:selftest` | Security regression tests (no database, mocked Telegram) |
| `telegram:selftest` | Bot tests against the local database (read-only) |
| `telegram:webhook -- info|set <url>|delete` | Manage the Telegram webhook |
| `demo:accounts [-- --lock]` | Find / disable seed demo accounts in a database |

## API

Full endpoint list and contracts: [../docs/API.md](../docs/API.md).

Base path `/api`. Public: `GET /health`, `/tours`, `/tours/:slug`,
`/destinations`, `/destinations/:slug`, `/deals`, `/deals/:id`, `/reviews`,
`/faq`, `/gallery`, `/stats`, `POST /contact`, `POST /newsletter/subscribe`,
`POST /auth/register`, `POST /auth/login`, `POST /auth/logout`.
Signed in: `GET /auth/me`, `/bookings`, `/favorites`, `POST /reviews`.
Admin: `/admin/*`. Telegram: `POST /telegram/webhook`.

All bodies are JSON. Requests from browsers must come from an origin in
`CLIENT_URL` (CORS + CSRF guard).

## Documentation

- Security: [../docs/SECURITY.md](../docs/SECURITY.md)
- Authentication: [../docs/AUTHENTICATION.md](../docs/AUTHENTICATION.md)
- Telegram bot: [../docs/TELEGRAM.md](../docs/TELEGRAM.md)
- Deployment: [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)
