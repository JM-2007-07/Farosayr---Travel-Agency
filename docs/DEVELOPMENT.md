# Farosayr — Development

## Requirements

Node.js 18+ (the backend uses the built-in `fetch`), npm, and a **local**
PostgreSQL for the backend.

## Backend

```bash
cd backend
npm install
cp .env.example .env        # then edit it (see below)
npm run prisma:generate
npm run prisma:migrate      # migrate dev — refuses unless DATABASE_URL is local
npm run prisma:seed         # optional demo data — see "Demo seed"
npm run dev                 # http://localhost:5000/api
```

`.env` essentials:

- `DATABASE_URL` → your **local** database. Don't point a development
  `.env` at the production database: `npm run dev` would then read and
  write production data, and that is how demo content reached production
  before. The backend prints a warning at startup when it sees a
  non-local database outside production, and `prisma:migrate` and the
  seed refuse to run against one.

  Quick local database (Docker): `docker run -d --name farosayr-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=farosayr -p 5432:5432 postgres:16`
  → `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/farosayr"`.
- `JWT_SECRET` → your own random value (≥ 32 chars).
- `CLIENT_URL` → `http://localhost:5173` (the Vite dev server).
- Telegram variables → empty, or a **separate test bot**
  ([TELEGRAM.md §7](TELEGRAM.md#7-local-development)). Never the production
  token.

## Frontend

```bash
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm run dev                 # http://localhost:5173
npm run lint
npm run build
```

Everything prefixed `VITE_` ends up in the public JavaScript bundle —
never put a secret there.

## Demo seed

`npm run prisma:seed` creates demo users (four users **and one ADMIN,
`admin@farosayr.test`**), destinations, tours, deals, FAQ, reviews, a
booking and a contact message. Guarded by `prisma/seed-guard.js`:

- refuses when `NODE_ENV=production` or on Vercel;
- refuses unless `DATABASE_URL` is local (`localhost`, `127.0.0.1`,
  `postgres`, `db`); for a disposable remote database set
  `SEED_ALLOW_REMOTE_DATABASE=true` explicitly;
- the demo password is `SEED_DEV_PASSWORD` (≥ 12 chars) or a random one
  printed at the end of the run. There is no fixed password in the code.

Re-running the seed is idempotent and never changes existing users'
passwords.

## Checks

| Command | What it does |
|---|---|
| `backend: npm run security:selftest` | Security regression suite on the real app with an in-memory DB stub and mocked Telegram. Touches no database. |
| `backend: npm run telegram:selftest` | Bot behaviour against the **real database in `.env`** (read-only) with a mocked Telegram API. Run it only with a local database. |
| `backend: npm run demo:accounts` | Lists demo accounts in the configured database (report only; `--lock` disables them). |
| `frontend: npm run lint` | oxlint. |
| `frontend: npm run build` | Production build + SEO shells + sitemap. |

There is no unit-test framework or TypeScript type check in the project.

## Security basics for contributors

- Secrets only in `.env` (git-ignored) / Vercel. If one is ever committed,
  rotate it — deleting the commit is not enough.
- Validate every request body with Zod on the backend; take the user id
  from `req.user`, never from the request.
- New admin routes go into `routes/admin.routes.js` (protected as a whole).
- Never log request bodies, headers, cookies or `process.env`.

More: [SECURITY.md](SECURITY.md).
