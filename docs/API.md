# Farosayr — API

Base URL (production, current): **`https://farosayr-t-a-backend.vercel.app/api`**
(`api.farosayr.tj` is a planned future host — see DEPLOYMENT.md §7; not live).

All request bodies are JSON (`Content-Type: application/json`). Browser
requests must come from an origin in `CLIENT_URL` (CORS + CSRF guard).
Responses: `{ "success": true, "data": … }` or
`{ "success": false, "message": "…" }`. Auth = httpOnly cookie set by
login/register (AUTHENTICATION.md).

## Public

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | `{ database, commit, region, timestamp }`; 503 if the DB is down |
| GET | `/tours` | Query: `destination` (slug), `minPrice`, `maxPrice`, `q`, `sort` (`price_asc`, `price_desc`, `newest`) |
| GET | `/tours/:slug` | 404 if unknown |
| GET | `/destinations` · `/destinations/:slug` | detail includes its tours |
| GET | `/deals` | **Current deals only**: `isActive` and `startsAt ≤ now < endsAt`, ending soonest first; each item has `isCurrent: true` |
| GET | `/deals/:id` | Any deal by id, with `isCurrent` (false when expired, not started or switched off) |
| GET | `/reviews` | Optional `?tour=<slug>` — reviews of one tour. Reviewer name only (no email) |
| GET | `/faq` · `/gallery` · `/stats` | |
| POST | `/contact` | `{ name, email, subject, message }` → 201. Rate-limited. Saved even if the Telegram notification fails |
| POST | `/newsletter/subscribe` | `{ email }` → 201 (idempotent) |
| POST | `/auth/register` · `/auth/login` · `/auth/logout` | see AUTHENTICATION.md |

## Signed in

| Method | Path | Notes |
|---|---|---|
| GET | `/auth/me` | current user |
| GET / POST | `/bookings` | POST `{ tourId, quantity (1–20), dealId? }` → 201. With `dealId` the deal price applies if the deal is current and belongs to that tour, otherwise **409** `This offer is no longer available`. Saved even if the Telegram notification fails |
| GET | `/favorites` · POST / DELETE `/favorites/:tourId` | idempotent |
| POST | `/reviews` | `{ tourId, rating (1–5), comment (≤ 2000) }`; one per user and tour (409) |

## Admin (`/admin/*`, role ADMIN)

dashboard, tours, destinations, deals, bookings (status), users (role),
reviews, messages — see `backend/src/routes/admin.routes.js`.

## Telegram

`POST /telegram/webhook` — Telegram only (secret header). TELEGRAM.md.

## Changes in Step 4 (backward compatible)

| Change | Effect on clients |
|---|---|
| `GET /deals` returns only current deals | Expired deals no longer appear in lists (site and bot `/deals`); still reachable by id |
| `isCurrent` added to deal responses | New field |
| `dealId` accepted by `POST /bookings` | Optional; old clients unaffected |
| `?tour=` on `GET /reviews` | Optional filter |
| Booking totals computed with Decimal | Same values, no float rounding |
