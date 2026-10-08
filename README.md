# Farosayr

Website, API and Telegram bot of the Farosayr travel agency (Dushanbe).

| Folder | What |
|---|---|
| [`frontend/`](frontend/) | React 19 + Vite website — https://farosayr.com |
| [`backend/`](backend/) | Express 5 + Prisma/PostgreSQL API and Telegram bot |
| [`docs/`](docs/) | Project documentation |

## Documentation

- [Development](docs/DEVELOPMENT.md) — local setup, demo seed, checks
- [Deployment](docs/DEPLOYMENT.md) — Vercel, environment, releases, domain cutover
- [API](docs/API.md) — endpoints and contracts
- [Domains & DNS](docs/DNS.md) — farosayr.tj / farosayr.com, current and target DNS
- [Security](docs/SECURITY.md) — policies, open incidents, production checklist
- [Authentication](docs/AUTHENTICATION.md) — accounts, sessions, roles
- [Telegram bot](docs/TELEGRAM.md) — bot, webhook, notifications, token rotation
- [Performance](docs/PERFORMANCE.md) — bundle splitting, images, media, measurements
- [Accessibility & mobile](docs/ACCESSIBILITY.md) — keyboard, focus, forms, motion, touch, testing
- [SEO](docs/SEO.md) — metadata, route shells, sitemap/robots, structured data, languages, deploy checklist
- [Web app manifest & icons](docs/PWA.md) — installability, icons, why there is no service worker

> ⚠️ Open security actions (token rotation, demo accounts) are listed in
> [SECURITY.md §1](docs/SECURITY.md#1-open-incidents-action-required).

Secrets never go into this repository — see the secrets policy in
SECURITY.md §3.
