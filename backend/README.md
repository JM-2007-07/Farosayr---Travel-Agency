# FaroSair — Backend

Express 5 API + Prisma/PostgreSQL data layer + authentication. See
`MIGRATION_PLAN.md` at the repo root for phase status and reasoning.

## Setup

```bash
# 1. install dependencies
npm install

# 2. create a PostgreSQL database (locally or via a hosted instance) —
#    this repo does not create or manage the PostgreSQL server itself
createdb farosayr   # or your preferred method

# 3. copy the env template
cp .env.example .env

# 4. edit .env: set DATABASE_URL, and set JWT_SECRET to your own random
#    value (see the comment in .env.example for how to generate one — do
#    NOT use the example placeholder value anywhere real)

# 5. generate the Prisma client
npm run prisma:generate

# 6. run migrations (creates the first migration now that real models exist)
npm run prisma:migrate

# 7. seed demo data (idempotent — safe to run more than once)
npm run prisma:seed

# 8. start the backend
npm run dev     # node --watch, restarts on file changes
# or
npm start
```

## Endpoints

- `GET /api/health` → `{ success: true, message: "...", database: "connected" | "disconnected", timestamp: "..." }`
- `POST /api/auth/register` → `{ name, email, password }` → sets auth cookie, returns safe user
- `POST /api/auth/login` → `{ email, password }` → sets auth cookie, returns safe user
- `POST /api/auth/logout` → clears the auth cookie (safe to call when already logged out)
- `GET /api/auth/me` → requires the auth cookie, returns the current safe user, `401` if not authenticated
- `GET /api/auth/admin-check` → requires the auth cookie **and** `ADMIN` role; `401` if not authenticated, `403` if authenticated but not admin — exists only to prove role middleware works, not a real feature
- Anything else → `404 { success: false, message: "Route not found" }`

## Seed dev login

After `npm run prisma:seed`, every seeded user (including the one
`ADMIN`, `admin@farosayr.test`) shares this **development-only** password:

```
DevSeedPassword123!
```

This is a real, working credential in *your local dev database only* —
never reuse it anywhere real, and never commit a database dump containing
it to a public repo. It exists purely so you can `POST /api/auth/login`
against seeded data without registering a fresh account first.

## Status

Full database schema + idempotent seed, and now a complete auth foundation:
`bcrypt` password hashing, JWT in an httpOnly cookie, Zod-validated
register/login, centralized `requireAuth`/`requireRole` middleware. No
business CRUD (tours/destinations/bookings/etc.) yet, and no complete
frontend auth UI — those are later phases. The frontend (`../frontend`)
does not call this API yet — its services still read from local seed data,
on purpose.
