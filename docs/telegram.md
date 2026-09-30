# FaroSayr Telegram bot

> **Status:** the integration code is in place and tested at code level with a
> mocked Telegram API (`npm run telegram:selftest`). **No real bot is connected
> yet** — that happens once the company's official Telegram account exists and
> the steps in [Production setup](#6-production-setup) are done.

## 1. What it does

**Admin notifications** — after a website visitor's data is saved, the backend
sends a message to `TELEGRAM_ADMIN_CHAT_ID`:

| Event | Sent from | Content |
| --- | --- | --- |
| New contact message | `POST /api/contact` | name, email, subject, message, time, link to `/admin/messages` |
| New booking | `POST /api/bookings` | client name + email (from their account), tour × quantity, total, request time, link to `/admin/bookings` |

The notification is sent only **after** the database write succeeds. If
Telegram is down, slow (5 s timeout) or not configured, the contact/booking is
still saved and the API still returns `201`; the failure is only logged.
(The data model has no phone number or travel date on contacts/bookings, so
the notifications don't include them.)

**Public bot** — anyone who opens the bot in a private chat can use:

| Command | Shows | Data source |
| --- | --- | --- |
| `/start`, `/menu` | welcome + menu buttons | — |
| `/tours` | tours, 5 per page with ⬅️/➡️ buttons | `services/tours.service.js` (same as `GET /api/tours`) |
| `/destinations` | up to 10 destinations | `services/destinations.service.js` |
| `/deals` | up to 5 active deals | `services/deals.service.js` (same `isActive` rule as the site) |
| `/faq` | active FAQ entries | `services/faq.service.js` |
| `/contact` | phone, email, address, hours, website, socials | `src/config/siteContact.js` |
| `/help` | command list | — |

Plain messages are matched by keyword in Russian, Tajik and English ("туры",
"цены", "скидки", "направления", "контакты", "tours", "deals", "help", …).
Anything else gets "I didn't understand your request" plus the menu. Replies
use the user's Telegram language: Tajik (`tg`) → tj, English → en,
everything else → ru (the website's default). Database content (tour titles,
FAQ answers) is shown as stored.

The bot is deterministic — no AI. It has **no admin commands**: it only reads
the same public data the website shows. It never exposes contact messages,
bookings, users or anything from the admin panel, and it ignores groups and
channels.

## 2. Architecture

```
Telegram ──POST /api/telegram/webhook──► Express backend (same app as the website)
                                           │ routes/telegram.routes.js      rate limit (failed attempts only)
                                           │ controllers/telegram.controller.js
                                           │   secret header check → Zod validation → de-dupe → handler
                                           │ telegram/handlers.js           command / button / keyword routing
                                           │ telegram/sections.js           builds each reply
                                           ▼
                                  services/*.service.js  ◄── also used by the website controllers
                                           ▼
                                        Prisma → PostgreSQL

contact / bookings controllers ──► services/telegram.service.js ──► api.telegram.org
                                   (the ONLY module that calls the Telegram API)
```

| File | Role |
| --- | --- |
| `backend/src/services/telegram.service.js` | Bot API client (`sendTelegramMessage`, `answerCallbackQuery`, `setWebhook`, `deleteWebhook`, `getWebhookInfo`) and admin notifications (`sendNewContactNotification`, `sendNewBookingNotification`) |
| `backend/src/controllers/telegram.controller.js` | Webhook endpoint: auth, validation, duplicate protection, error isolation |
| `backend/src/routes/telegram.routes.js` | Mounts `POST /api/telegram/webhook` |
| `backend/src/validation/telegram.validation.js` | Zod schema for the parts of a Telegram Update that are used |
| `backend/src/telegram/handlers.js` | Maps commands / button callbacks / keywords to sections |
| `backend/src/telegram/sections.js` | Builds each reply from the shared services |
| `backend/src/telegram/texts.js` · `keyboards.js` · `format.js` | Translations, inline keyboards, HTML escaping/formatting |
| `backend/src/services/{tours,destinations,deals,faq}.service.js` | Shared queries used by both the website API and the bot |
| `backend/src/config/siteContact.js` | Public contact details (mirror of `frontend/src/config/siteContact.js` — keep both in sync) |
| `backend/scripts/telegram-webhook.js` | CLI: set / inspect / delete the webhook |
| `backend/scripts/telegram-selftest.js` | Code-level self-test with a mocked Telegram API |

No database changes were needed. Every bot action is read-only, so a
duplicate webhook delivery can at worst repeat a reply; recent `update_id`s
are remembered in memory to skip most duplicates anyway.

## 3. Environment variables

| Variable | Required for | Notes |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | everything Telegram | From @BotFather. Secret. |
| `TELEGRAM_ADMIN_CHAT_ID` | admin notifications | Numeric chat id (a person, or a group — groups have negative ids). |
| `TELEGRAM_WEBHOOK_SECRET` | the bot / webhook | Random string, 1–256 chars of `A–Z a–z 0–9 _ -`. Secret. Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

All three are optional for the rest of the app: with none set, the website
works exactly as before, notifications are skipped (one warning in the log),
and the webhook answers `503`.

**Never** commit these values, put them in frontend code (`VITE_*`), paste
them into tickets/chats, or log them. `backend/.env` is git-ignored; only
`backend/.env.example` (empty placeholders) is committed.

## 4. Create the bot (@BotFather)

Do this while logged into the **official company Telegram account**, so the
company — not an individual employee — owns the bot.

1. Open Telegram → search for **@BotFather** (blue check mark) → **Start**.
2. Send `/newbot`.
3. Enter the display name, e.g. `FaroSayr`.
4. Enter a username ending in `bot`, e.g. `FarosayrBot` (must be unique).
5. BotFather replies with the **bot token** (`123456789:AA…`). Store it
   immediately in the company password manager. Anyone with this token
   controls the bot.
6. Optional but recommended — send `/setcommands`, choose the bot, and paste:
   ```
   start - Главное меню
   tours - Туры
   destinations - Направления
   deals - Горящие предложения
   faq - Частые вопросы
   contact - Контакты
   help - Помощь
   ```
7. Optional: `/setdescription`, `/setabouttext`, `/setuserpic` for branding.

## 5. Get the admin chat id

The id must be obtained **before** the webhook is set (Telegram disables
`getUpdates` while a webhook is active; if one is set, run
`npm run telegram:webhook -- delete` first).

1. From the Telegram account that should receive notifications, open the new
   bot and send it any message (e.g. `/start`). For a group: add the bot to
   the group and send a message there.
2. Open in a browser (replace `<TOKEN>`; don't share this URL — it contains the token):
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
3. Find `"chat":{"id": …}` in the response. That number is
   `TELEGRAM_ADMIN_CHAT_ID` (negative for groups).

Note: a bot can only message a person who has pressed **Start** in it at least
once.

## 6. Production setup

Production URLs found in the project's local configuration (verify in the
Vercel dashboard before use):

- Backend (Vercel project `farosayr-travel-agency-backend`): `https://farosayr-t-a-backend.vercel.app` (from `frontend/.env` → `VITE_API_URL`)
- Frontend: `https://farosayr-t-a-frontend.vercel.app` (the backend's `CLIENT_URL`, used for links in bot messages)

So the webhook URL is expected to be:
`https://farosayr-t-a-backend.vercel.app/api/telegram/webhook`

### 6.1 Add the variables in Vercel

1. Vercel dashboard → backend project → **Settings → Environment Variables**.
2. Add `TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`
   for the **Production** environment (add them to Preview too only if you
   really want preview deployments to use the real bot — usually not).
3. Mark the token and secret as **Sensitive**.
4. **Redeploy** the backend (Deployments → latest → Redeploy). Environment
   changes only apply to new deployments.

### 6.2 Register the webhook

Run once from your machine, in `backend/`, with the **same** token and secret
temporarily in your local `backend/.env`:

```bash
npm run telegram:webhook -- set https://farosayr-t-a-backend.vercel.app/api/telegram/webhook
```

This calls `setWebhook` with the secret (Telegram then sends it in the
`X-Telegram-Bot-Api-Secret-Token` header, and the backend rejects any request
without it) and `allowed_updates: ["message", "callback_query"]`.

The URL must be the public **HTTPS** backend URL — never `localhost`.

Remove the production token from your local `.env` afterwards if the machine
isn't the place it should live.

### 6.3 Verify

```bash
npm run telegram:webhook -- info
```

Check that `url` is correct, `pending_update_count` is low, and there is no
`last_error_message`. Common errors:

| `last_error_message` | Meaning |
| --- | --- |
| `Wrong response from the webhook: 401 Unauthorized` | `TELEGRAM_WEBHOOK_SECRET` in Vercel ≠ the one used for `set`, or not redeployed |
| `Wrong response from the webhook: 503 Service Unavailable` | Token/secret missing in Vercel, or not redeployed |
| `Wrong response from the webhook: 404 Not Found` | Wrong URL (check the `/api` prefix) |

### 6.4 Remove the webhook

```bash
npm run telegram:webhook -- delete
```

The bot stops receiving messages; admin notifications keep working (they
don't use the webhook).

## 7. Local development

Telegram can't reach `localhost`, so locally you normally only test at code
level:

```bash
cd backend
npm run telegram:selftest   # mocked Telegram API, real app + local DB, read-only
```

It uses dummy credentials and intercepts every `api.telegram.org` call, so it
never contacts Telegram. It covers: webhook route registration, secret
rejection, malformed updates, group chats, duplicates, Telegram API failures,
every command, keyword matching, languages, buttons and pagination, forged
button data, and both notifications (including HTML escaping and failure
handling).

To try the real bot against a local backend, use a **separate test bot** (its
own token from @BotFather) and an HTTPS tunnel (e.g. `ngrok http 5000`), then
`npm run telegram:webhook -- set https://<tunnel>/api/telegram/webhook`. Never
point the production bot at a tunnel.

To test only notifications locally, set `TELEGRAM_BOT_TOKEN` and
`TELEGRAM_ADMIN_CHAT_ID` in `backend/.env` — no webhook is required.

## 8. Test checklist after going live

1. **Contact:** submit the website contact form → the admin chat receives
   "📩 Новое сообщение с сайта Farosayr"; the message also appears in
   Admin → Messages.
2. **Booking:** log in on the website, book a tour → the admin chat receives
   "✈️ Новая заявка на бронирование"; it appears in Admin → Bookings.
3. **Commands:** in a private chat with the bot, send `/start` (menu buttons
   appear), `/tours` (tap ➡️ for page 2 if there are more than 5 tours),
   `/destinations`, `/deals`, `/faq`, `/contact`, `/help`, then a free-text
   message like "цены" and a nonsense message ("asdf" → menu).
4. `npm run telegram:webhook -- info` shows no `last_error_message`.
5. Vercel → backend → Logs: look for `Telegram update … processed` lines and no
   `Telegram … failed` warnings.

## 9. If the token leaks — rotate it

1. @BotFather → `/revoke` → choose the bot. The old token stops working
   immediately and BotFather issues a new one.
2. Update `TELEGRAM_BOT_TOKEN` in Vercel and redeploy.
3. Re-register the webhook with the new token (section 6.2) and check `info`.
4. Consider rotating `TELEGRAM_WEBHOOK_SECRET` at the same time: set a new
   value in Vercel, redeploy, then run `set` again with the new value.
5. If the token was committed to Git, rotating is mandatory — removing the
   commit is not enough.

## 10. Security notes

- The webhook only accepts requests carrying the correct secret header
  (compared in constant time). Rejected attempts are rate-limited per IP
  (20 per 15 min). Successful Telegram traffic isn't limited, because all of
  it comes from a few Telegram IPs; the site-wide limiter skips this route.
- Incoming updates are validated with Zod, and unused fields are dropped.
  Malformed updates are acknowledged (`200`) and ignored, so Telegram doesn't
  retry them forever.
- Errors never reach Telegram users (they get a generic "couldn't load"
  message) and never include stack traces, database errors or the token. Logs
  record the update id and handled section, never the message content or
  user data.
- Webhook management is only possible via the CLI script with the token —
  there is no HTTP endpoint for it.
- All user or database text in bot messages is HTML-escaped.
- `TELEGRAM_ADMIN_CHAT_ID` is only a notification target. It gives no extra
  rights in the bot.
- If admin-only bot features are added later (e.g. viewing bookings), they
  must check the sender's Telegram user id against an explicit allow-list —
  never trust a chat just because it can talk to the bot.
