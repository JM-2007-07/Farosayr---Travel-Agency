/**
 * Security self-test — runs the real Express app (routing, middleware,
 * validation, auth, CORS/CSRF, error handling, Telegram webhook) WITHOUT a
 * database and WITHOUT Telegram:
 *
 * - Prisma is replaced by a small in-memory fake injected through the
 *   same globalThis cache config/database.js already uses;
 * - calls to api.telegram.org are intercepted by a fetch stub;
 * - the app runs with NODE_ENV=production, so production cookie flags and
 *   error sanitising are what gets tested.
 *
 *   npm run security:selftest
 *
 * Touches no database and no real bot; safe to run anywhere.
 */
import assert from 'node:assert/strict';

// --- environment (set BEFORE the app is imported; dotenv never overrides) --
const SITE = 'https://farosayr.com';
const FAKE_BOT_TOKEN = '123456789:SELFTESTxDUMMYxTOKENxxxxxxxxxxxxxxxxx';
const WEBHOOK_SECRET = 'selftest_webhook_secret_0123456789';
Object.assign(process.env, {
  NODE_ENV: 'production',
  CLIENT_URL: SITE,
  JWT_SECRET: 'selftest-jwt-secret-that-is-definitely-long-enough-0123456789',
  JWT_EXPIRES_IN: '7d',
  DATABASE_URL: 'postgresql://selftest:selftest@localhost:5432/selftest',
  TELEGRAM_BOT_TOKEN: FAKE_BOT_TOKEN,
  TELEGRAM_ADMIN_CHAT_ID: '999',
  TELEGRAM_WEBHOOK_SECRET: WEBHOOK_SECRET,
});

// --- in-memory Prisma fake --------------------------------------------------
const calls = [];
const users = new Map();
const DAY = 24 * 60 * 60 * 1000;
const tours = new Map([
  ['t1', { id: 't1', slug: 'tour-1', title: 'Tour 1', price: '1000.00' }],
  ['t2', { id: 't2', slug: 'tour-2', title: 'Tour 2', price: '500.00' }],
]);
const deals = new Map([
  ['deal-current', { id: 'deal-current', tourId: 't1', price: '800.00', isActive: true, startsAt: new Date(Date.now() - DAY), endsAt: new Date(Date.now() + DAY) }],
  ['deal-expired', { id: 'deal-expired', tourId: 't1', price: '700.00', isActive: true, startsAt: new Date(Date.now() - 3 * DAY), endsAt: new Date(Date.now() - DAY) }],
  ['deal-disabled', { id: 'deal-disabled', tourId: 't1', price: '600.00', isActive: false, startsAt: new Date(Date.now() - DAY), endsAt: new Date(Date.now() + DAY) }],
  ['deal-other-tour', { id: 'deal-other-tour', tourId: 't2', price: '400.00', isActive: true, startsAt: new Date(Date.now() - DAY), endsAt: new Date(Date.now() + DAY) }],
]);
let telegramDown = false;
const DB_LEAK = 'postgresql://dbuser:SUPER-SECRET-PASSWORD@db.internal:5432/prod';

const model = (name, impl = {}) =>
  new Proxy(impl, {
    get(target, method) {
      if (method in target) {
        return async (args) => {
          calls.push({ model: name, method, args });
          return target[method](args);
        };
      }
      return async (args) => {
        calls.push({ model: name, method, args });
        if (method === 'count') return 0;
        if (method === 'findMany') return [];
        return null;
      };
    },
  });

globalThis.__farosayrPrisma = {
  $queryRaw: async () => [{ ok: 1 }],
  $transaction: async (fn) => fn(globalThis.__farosayrPrisma),
  $disconnect: async () => {},
  user: model('user', {
    // Honors `select` like real Prisma does (requireAuth selects safe fields only).
    findUnique: ({ where, select }) => {
      const u = where.id ? users.get(where.id) : [...users.values()].find((x) => x.email === where.email);
      if (!u) return null;
      return select ? Object.fromEntries(Object.keys(select).map((k) => [k, u[k]])) : { ...u };
    },
    create: ({ data }) => {
      const u = { id: `u-${users.size + 1}`, createdAt: new Date(), ...data };
      users.set(u.id, u);
      return { ...u };
    },
  }),
  booking: model('booking', {
    create: ({ data }) => ({ id: 'b-1', createdAt: new Date(), ...data }),
    findUnique: () => {
      const item = calls.filter((c) => c.model === 'bookingItem' && c.method === 'create').pop()?.args.data;
      return { id: 'b-1', createdAt: new Date(), totalAmount: item?.totalPrice, items: [{ quantity: item?.quantity, tour: { title: 'Tour 1' } }] };
    },
  }),
  bookingItem: model('bookingItem', { create: ({ data }) => ({ id: 'bi-1', ...data }) }),
  tour: model('tour', { findUnique: ({ where }) => tours.get(where.id) ?? null }),
  destination: model('destination'),
  review: model('review'),
  favorite: model('favorite'),
  deal: model('deal', { findUnique: ({ where }) => deals.get(where.id) ?? null }),
  newsletterSubscriber: model('newsletterSubscriber'),
  contactMessage: model('contactMessage', {
    create: ({ data }) => ({ id: 'm-1', createdAt: new Date(), ...data }),
  }),
  fAQ: model('fAQ', {
    findMany: () => {
      throw new Error(`Connection failed for ${DB_LEAK}`);
    },
  }),
};

// --- Telegram API stub ------------------------------------------------------
const realFetch = globalThis.fetch;
const telegramCalls = [];
globalThis.fetch = async (url, init) => {
  if (!String(url).startsWith('https://api.telegram.org/')) return realFetch(url, init);
  telegramCalls.push({ method: String(url).split('/').pop(), payload: JSON.parse(init.body) });
  if (telegramDown) throw new TypeError('fetch failed');
  return new Response(JSON.stringify({ ok: true, result: true }), { status: 200 });
};

const { default: app } = await import('../src/app.js');
const { signAuthToken } = await import('../src/utils/jwt.js');
const { checkSeedEnvironment } = await import('../prisma/seed-guard.js');
const { default: jwt } = await import('jsonwebtoken');
const { default: bcrypt } = await import('bcrypt');

const server = app.listen(0);
const BASE = `http://127.0.0.1:${server.address().port}`;
const bodies = []; // every response body, to scan for leaked secrets at the end

async function request(method, path, { body, rawBody, headers = {}, cookie } = {}) {
  const init = { method, headers: { ...headers } };
  if (cookie) init.headers.Cookie = cookie;
  if (rawBody !== undefined) init.body = rawBody;
  else if (body !== undefined) {
    init.body = JSON.stringify(body);
    init.headers['Content-Type'] ??= 'application/json';
  }
  const res = await realFetch(BASE + path, init);
  const text = await res.text();
  bodies.push(text);
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, headers: res.headers, json, text };
}

const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push(['PASS', name]);
  } catch (err) {
    results.push(['FAIL', `${name} — ${err.message}`]);
  }
}

// --- fixtures -----------------------------------------------------------
const PASSWORD = 'correct horse battery staple';
const hash = await bcrypt.hash(PASSWORD, 4);
users.set('user-a', { id: 'user-a', name: 'User A', email: 'a@example.com', role: 'USER', passwordHash: hash });
users.set('user-b', { id: 'user-b', name: 'User B', email: 'b@example.com', role: 'USER', passwordHash: hash });
users.set('admin-1', { id: 'admin-1', name: 'Admin', email: 'admin@example.com', role: 'ADMIN', passwordHash: hash });
const cookieFor = (id, role = 'USER') => `farosayr_token=${signAuthToken({ id, role })}`;
const userCookie = cookieFor('user-a');
const adminCookie = cookieFor('admin-1', 'ADMIN');

// ===================================================================
// Debug / test endpoints
// ===================================================================
await check('debug endpoints removed (/__debug, /api/__router-debug, /api/auth/admin-check → 404)', async () => {
  for (const p of ['/__debug', '/api/__router-debug']) assert.equal((await request('GET', p)).status, 404, p);
  assert.equal((await request('GET', '/api/auth/admin-check', { cookie: adminCookie })).status, 404);
});

// ===================================================================
// Authentication
// ===================================================================
await check('no cookie → 401 on /api/auth/me', async () => {
  assert.equal((await request('GET', '/api/auth/me')).status, 401);
});
await check('garbage token → 401', async () => {
  assert.equal((await request('GET', '/api/auth/me', { cookie: 'farosayr_token=not.a.jwt' })).status, 401);
});
await check('expired token → 401', async () => {
  const expired = jwt.sign({ sub: 'user-a', role: 'USER', exp: Math.floor(Date.now() / 1000) - 60 }, process.env.JWT_SECRET);
  assert.equal((await request('GET', '/api/auth/me', { cookie: `farosayr_token=${expired}` })).status, 401);
});
await check('token signed with another secret → 401', async () => {
  const forged = jwt.sign({ sub: 'admin-1', role: 'ADMIN' }, 'some-other-secret-value-xxxxxxxxxxxxxxxxxxxx');
  assert.equal((await request('GET', '/api/auth/me', { cookie: `farosayr_token=${forged}` })).status, 401);
});
await check('alg "none" token → 401', async () => {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const none = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ sub: 'admin-1', role: 'ADMIN' })}.`;
  assert.equal((await request('GET', '/api/auth/me', { cookie: `farosayr_token=${none}` })).status, 401);
});
await check('valid token for a deleted user → 401', async () => {
  assert.equal((await request('GET', '/api/auth/me', { cookie: cookieFor('ghost-user') })).status, 401);
});
await check('valid token → 200, safe fields only (no passwordHash)', async () => {
  const r = await request('GET', '/api/auth/me', { cookie: userCookie });
  assert.equal(r.status, 200);
  assert.deepEqual(Object.keys(r.json.data).sort(), ['email', 'id', 'name', 'role']);
});
await check('login: wrong password → 401 with generic message', async () => {
  const r = await request('POST', '/api/auth/login', { body: { email: 'a@example.com', password: 'wrong-password' } });
  assert.equal(r.status, 401);
  assert.equal(r.json.message, 'Invalid email or password');
});
await check('login: unknown email → same 401 message (no enumeration)', async () => {
  const r = await request('POST', '/api/auth/login', { body: { email: 'nobody@example.com', password: 'whatever-123' } });
  assert.equal(r.status, 401);
  assert.equal(r.json.message, 'Invalid email or password');
});
await check('login: success sets HttpOnly; Secure; SameSite=None cookie, no hash in body', async () => {
  const r = await request('POST', '/api/auth/login', { body: { email: 'a@example.com', password: PASSWORD } });
  assert.equal(r.status, 200);
  const cookie = r.headers.getSetCookie().find((c) => c.startsWith('farosayr_token='));
  assert.ok(cookie, 'auth cookie set');
  assert.match(cookie, /HttpOnly/i);
  assert.match(cookie, /Secure/i);
  assert.match(cookie, /SameSite=None/i);
  assert.match(cookie, /Max-Age=604800/);
  assert.ok(!r.text.includes('passwordHash') && !r.text.includes('$2b$'));
});
await check('logout clears the cookie', async () => {
  const r = await request('POST', '/api/auth/logout', { body: {} });
  const cookie = r.headers.getSetCookie().find((c) => c.startsWith('farosayr_token='));
  assert.ok(cookie && /Expires=Thu, 01 Jan 1970/.test(cookie), 'cookie expired');
});
await check('register: extra "role":"ADMIN" is ignored (mass assignment)', async () => {
  const r = await request('POST', '/api/auth/register', {
    body: { name: 'Eve', email: 'eve@example.com', password: 'long-enough-pass', role: 'ADMIN', isAdmin: true },
  });
  assert.equal(r.status, 201);
  assert.equal(r.json.data.role, 'USER');
  const created = calls.filter((c) => c.model === 'user' && c.method === 'create').pop();
  assert.equal(created.args.data.role, 'USER');
  assert.ok(!('isAdmin' in created.args.data));
  assert.ok(!r.text.includes('passwordHash'));
});
await check('register: invalid input → 400 (backend validation)', async () => {
  for (const body of [
    { name: '', email: 'x@example.com', password: 'long-enough-pass' },
    { name: 'X', email: 'not-an-email', password: 'long-enough-pass' },
    { name: 'X', email: 'x2@example.com', password: 'short' },
    { name: 'X', email: `${'a'.repeat(250)}@example.com`, password: 'long-enough-pass' },
  ]) {
    assert.equal((await request('POST', '/api/auth/register', { body })).status, 400, JSON.stringify(body).slice(0, 60));
  }
});

// ===================================================================
// Authorization
// ===================================================================
const ADMIN_ROUTES = [
  ['GET', '/api/admin/dashboard'],
  ['GET', '/api/admin/tours'],
  ['POST', '/api/admin/tours'],
  ['PATCH', '/api/admin/tours/x'],
  ['DELETE', '/api/admin/tours/x'],
  ['GET', '/api/admin/destinations'],
  ['POST', '/api/admin/destinations'],
  ['PATCH', '/api/admin/destinations/x'],
  ['DELETE', '/api/admin/destinations/x'],
  ['GET', '/api/admin/deals'],
  ['POST', '/api/admin/deals'],
  ['PATCH', '/api/admin/deals/x'],
  ['DELETE', '/api/admin/deals/x'],
  ['GET', '/api/admin/bookings'],
  ['PATCH', '/api/admin/bookings/x'],
  ['GET', '/api/admin/users'],
  ['PATCH', '/api/admin/users/x/role'],
  ['GET', '/api/admin/reviews'],
  ['DELETE', '/api/admin/reviews/x'],
  ['GET', '/api/admin/messages'],
  ['DELETE', '/api/admin/messages/x'],
];
const adminBody = (m) => (m === 'POST' || m === 'PATCH' ? { body: { role: 'ADMIN' } } : {});
await check(`unauthenticated → 401 on all ${ADMIN_ROUTES.length} admin routes`, async () => {
  for (const [m, p] of ADMIN_ROUTES) assert.equal((await request(m, p, adminBody(m))).status, 401, `${m} ${p}`);
});
await check(`USER → 403 on all ${ADMIN_ROUTES.length} admin routes`, async () => {
  for (const [m, p] of ADMIN_ROUTES)
    assert.equal((await request(m, p, { ...adminBody(m), cookie: userCookie })).status, 403, `${m} ${p}`);
});
await check('token claiming ADMIN but DB role USER → 403 (role read from DB)', async () => {
  const r = await request('GET', '/api/admin/dashboard', { cookie: cookieFor('user-a', 'ADMIN') });
  assert.equal(r.status, 403);
});
await check('ADMIN → 200 on admin dashboard', async () => {
  assert.equal((await request('GET', '/api/admin/dashboard', { cookie: adminCookie })).status, 200);
});
await check('user bookings are scoped to the signed-in user (no IDOR via query)', async () => {
  calls.length = 0;
  await request('GET', '/api/bookings?userId=user-b', { cookie: userCookie });
  const q = calls.find((c) => c.model === 'booking' && c.method === 'findMany');
  assert.equal(q.args.where.userId, 'user-a');
});
await check('booking create uses the session user, not a body userId', async () => {
  calls.length = 0;
  await request('POST', '/api/bookings', { body: { tourId: 't1', quantity: 1, userId: 'user-b' }, cookie: userCookie });
  assert.ok(!calls.some((c) => c.model === 'booking' && c.method === 'create' && c.args?.data?.userId === 'user-b'));
});

// ===================================================================
// CORS
// ===================================================================
await check('CORS preflight from the site origin → allowed with credentials', async () => {
  const r = await request('OPTIONS', '/api/auth/login', {
    headers: { Origin: SITE, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
  });
  assert.equal(r.headers.get('access-control-allow-origin'), SITE);
  assert.equal(r.headers.get('access-control-allow-credentials'), 'true');
});
await check('CORS preflight from a foreign origin → no allow-origin header', async () => {
  const r = await request('OPTIONS', '/api/auth/login', {
    headers: { Origin: 'https://evil.example', 'Access-Control-Request-Method': 'POST' },
  });
  assert.equal(r.headers.get('access-control-allow-origin'), null);
});
await check('CORS: localhost dev origin is NOT allowed in production', async () => {
  const r = await request('GET', '/api/health', { headers: { Origin: 'http://localhost:5173' } });
  assert.equal(r.headers.get('access-control-allow-origin'), null);
});

// ===================================================================
// CSRF
// ===================================================================
const contactBody = { name: 'Visitor', email: 'v@example.com', subject: 'Hi', message: 'Hello' };
await check('CSRF: POST with foreign Origin → 403', async () => {
  const r = await request('POST', '/api/contact', { body: contactBody, headers: { Origin: 'https://evil.example' } });
  assert.equal(r.status, 403);
});
await check('CSRF: POST with foreign Referer (no Origin) → 403', async () => {
  const r = await request('POST', '/api/contact', { body: contactBody, headers: { Referer: 'https://evil.example/page' } });
  assert.equal(r.status, 403);
});
await check('CSRF: form-encoded body (what a cross-site <form> sends) → 415', async () => {
  const r = await request('POST', '/api/bookings', {
    rawBody: 'tourId=t1',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: SITE },
    cookie: userCookie,
  });
  assert.equal(r.status, 415);
});
await check('CSRF: text/plain body → 415', async () => {
  const r = await request('POST', '/api/contact', { rawBody: JSON.stringify(contactBody), headers: { 'Content-Type': 'text/plain' } });
  assert.equal(r.status, 415);
});
await check('CSRF: legitimate JSON request from the site → accepted (201)', async () => {
  const r = await request('POST', '/api/contact', { body: contactBody, headers: { Origin: SITE } });
  assert.equal(r.status, 201);
});

// ===================================================================
// Errors, input limits, headers
// ===================================================================
await check('unexpected error → generic 500, no stack, no DB details', async () => {
  const r = await request('GET', '/api/faq');
  assert.equal(r.status, 500);
  assert.equal(r.json.message, 'Something went wrong');
  assert.ok(!('stack' in r.json));
  assert.ok(!r.text.includes('SUPER-SECRET') && !r.text.includes('postgresql://'));
});
await check('malformed JSON → 400 "Invalid JSON body" (no echo of input)', async () => {
  const r = await request('POST', '/api/contact', { rawBody: '{"name": <script>', headers: { 'Content-Type': 'application/json' } });
  assert.equal(r.status, 400);
  assert.equal(r.json.message, 'Invalid JSON body');
});
await check('oversized body (>100kb) → 413', async () => {
  const r = await request('POST', '/api/contact', { body: { ...contactBody, message: 'x'.repeat(150_000) } });
  assert.equal(r.status, 413);
});
await check('repeated query params (?q=a&q=b) → 200, not a 500', async () => {
  assert.equal((await request('GET', '/api/tours?q=a&q=b&sort=__proto__')).status, 200);
});
await check('security headers present (nosniff, HSTS, frame-ancestors), x-powered-by absent', async () => {
  const r = await request('GET', '/api/health');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.ok(r.headers.get('strict-transport-security'));
  assert.match(r.headers.get('content-security-policy') ?? '', /frame-ancestors/);
  assert.equal(r.headers.get('x-powered-by'), null);
});

// ===================================================================
// Telegram webhook
// ===================================================================
const WEBHOOK = '/api/telegram/webhook';
let updateId = 5000;
const textUpdate = (text, chat = { id: 42, type: 'private' }) => ({
  update_id: ++updateId,
  message: { message_id: updateId, chat, from: { id: 42, is_bot: false, language_code: 'ru' }, text },
});
const hook = (body, secret = WEBHOOK_SECRET) =>
  request('POST', WEBHOOK, { body, headers: secret ? { 'X-Telegram-Bot-Api-Secret-Token': secret } : {} });
const sent = () => telegramCalls.filter((c) => c.method === 'sendMessage');

await check('webhook: missing secret → 401, nothing sent', async () => {
  telegramCalls.length = 0;
  assert.equal((await hook(textUpdate('/start'), null)).status, 401);
  assert.equal(telegramCalls.length, 0);
});
await check('webhook: wrong secret → 401, nothing sent', async () => {
  telegramCalls.length = 0;
  assert.equal((await hook(textUpdate('/start'), 'wrong-secret-value')).status, 401);
  assert.equal(telegramCalls.length, 0);
});
await check('webhook: valid secret + /start → 200, one reply', async () => {
  telegramCalls.length = 0;
  assert.equal((await hook(textUpdate('/start'))).status, 200);
  assert.equal(sent().length, 1);
});
await check('webhook: duplicate update_id → processed once', async () => {
  telegramCalls.length = 0;
  const u = textUpdate('/help');
  await hook(u);
  await hook(u);
  assert.equal(sent().length, 1);
});
await check('webhook: group chats ignored', async () => {
  telegramCalls.length = 0;
  await hook(textUpdate('/tours', { id: -100, type: 'group' }));
  assert.equal(sent().length, 0);
});
await check('webhook: "/admin" from any user → generic "not understood" (no admin commands)', async () => {
  telegramCalls.length = 0;
  await hook(textUpdate('/admin bookings'));
  assert.match(sent()[0].payload.text, /не понял/);
});
await check('webhook: forged callback "admin:bookings" → no reply', async () => {
  telegramCalls.length = 0;
  await hook({
    update_id: ++updateId,
    callback_query: { id: 'cb1', from: { id: 42 }, data: 'admin:bookings', message: { chat: { id: 42, type: 'private' } } },
  });
  assert.equal(sent().length, 0);
});

// ===================================================================
// Seed guard
// ===================================================================
await check('seed guard: refuses production, Vercel and remote DBs; no fixed password', () => {
  const local = 'postgresql://u:p@localhost:5432/db';
  assert.equal(checkSeedEnvironment({ NODE_ENV: 'production', DATABASE_URL: local }).ok, false);
  assert.equal(checkSeedEnvironment({ VERCEL: '1', DATABASE_URL: local }).ok, false);
  assert.equal(checkSeedEnvironment({ DATABASE_URL: 'postgresql://u:p@ep-x.neon.tech/db' }).ok, false);
  assert.equal(checkSeedEnvironment({ DATABASE_URL: local, SEED_DEV_PASSWORD: 'short' }).ok, false);
  const a = checkSeedEnvironment({ DATABASE_URL: local });
  const b = checkSeedEnvironment({ DATABASE_URL: local });
  assert.ok(a.ok && a.generated && a.password.length >= 16 && a.password !== b.password);
  assert.notEqual(a.password, 'DevSeedPassword123!');
});

// ===================================================================
// Business rules (Step 4)
// ===================================================================
const book = (body) => request('POST', '/api/bookings', { body, cookie: userCookie });
const lastItem = () => calls.filter((c) => c.model === 'bookingItem' && c.method === 'create').pop()?.args.data;

await check('booking without a deal → tour price × quantity (Decimal)', async () => {
  const r = await book({ tourId: 't1', quantity: 3 });
  assert.equal(r.status, 201);
  assert.equal(String(lastItem().unitPrice), '1000.00');
  assert.equal(lastItem().totalPrice, '3000.00');
});
await check('booking with a current deal of the same tour → deal price', async () => {
  const r = await book({ tourId: 't1', quantity: 2, dealId: 'deal-current' });
  assert.equal(r.status, 201);
  assert.equal(String(lastItem().unitPrice), '800.00');
  assert.equal(lastItem().totalPrice, '1600.00');
});
await check('booking with an expired / disabled / other-tour / unknown deal → 409, nothing created', async () => {
  for (const dealId of ['deal-expired', 'deal-disabled', 'deal-other-tour', 'no-such-deal']) {
    calls.length = 0;
    const r = await book({ tourId: 't1', quantity: 1, dealId });
    assert.equal(r.status, 409, dealId);
    assert.ok(!calls.some((c) => c.model === 'booking' && c.method === 'create'), `${dealId}: booking created`);
  }
});
await check('booking still succeeds (201) when Telegram is unreachable', async () => {
  telegramDown = true;
  try {
    const r = await book({ tourId: 't1', quantity: 1 });
    assert.equal(r.status, 201);
  } finally {
    telegramDown = false;
  }
});
await check('contact form still succeeds (201) when Telegram is unreachable', async () => {
  telegramDown = true;
  try {
    assert.equal((await request('POST', '/api/contact', { body: contactBody })).status, 201);
  } finally {
    telegramDown = false;
  }
});
await check('deals list asks only for current deals (active AND startsAt ≤ now < endsAt)', async () => {
  calls.length = 0;
  await request('GET', '/api/deals');
  const where = calls.find((c) => c.model === 'deal' && c.method === 'findMany').args.where;
  assert.equal(where.isActive, true);
  assert.ok(where.startsAt.lte instanceof Date && where.endsAt.gt instanceof Date);
});
await check('deal detail reports isCurrent (expired → false, current → true)', async () => {
  assert.equal((await request('GET', '/api/deals/deal-expired')).json.data.isCurrent, false);
  assert.equal((await request('GET', '/api/deals/deal-current')).json.data.isCurrent, true);
});
await check('reviews can be filtered by tour slug (?tour=)', async () => {
  calls.length = 0;
  await request('GET', '/api/reviews?tour=tour-1');
  const q = calls.find((c) => c.model === 'review' && c.method === 'findMany');
  assert.deepEqual(q.args.where, { tour: { slug: 'tour-1' } });
});

// ===================================================================
// Cookie SameSite configuration (domain cutover switch)
// ===================================================================
await check('AUTH_COOKIE_SAMESITE: lax honoured in production, invalid value refused at startup', async () => {
  const { spawnSync } = await import('node:child_process');
  const probe = (value) =>
    spawnSync(
      process.execPath,
      ['--input-type=module', '-e', "const { getAuthCookieOptions } = await import('./src/utils/jwt.js'); console.log(getAuthCookieOptions().sameSite);"],
      { env: { ...process.env, AUTH_COOKIE_SAMESITE: value }, encoding: 'utf8' }
    );
  const lax = probe('lax');
  assert.equal(lax.status, 0);
  assert.equal(lax.stdout.trim(), 'lax');
  assert.notEqual(probe('sometimes').status, 0);
});

// ===================================================================
// Rate limiting (last: it exhausts the login limiter)
// ===================================================================
await check('login rate limit → 429 within 25 attempts', async () => {
  let status = 0;
  for (let i = 0; i < 25 && status !== 429; i++) {
    status = (await request('POST', '/api/auth/login', { body: { email: 'a@example.com', password: 'wrong-password' } })).status;
  }
  assert.equal(status, 429);
});

// ===================================================================
// No secret ever appears in a response
// ===================================================================
await check('server log redacts credentials in URLs and bot tokens', async () => {
  const { logger } = await import('../src/utils/logger.js');
  const original = console.error;
  let line = '';
  console.error = (...a) => { line = a.join(' '); };
  try {
    logger.error('boom', new Error(`connect ${DB_LEAK} via https://api.telegram.org/bot${FAKE_BOT_TOKEN}/sendMessage`));
  } finally {
    console.error = original;
  }
  assert.ok(!line.includes('SUPER-SECRET-PASSWORD'), 'db password in log');
  assert.ok(!line.includes(FAKE_BOT_TOKEN.split(':')[1]), 'bot token in log');
});

await check('no response body contains the bot token, webhook secret, JWT secret or DB URL', () => {
  const all = bodies.join('\n');
  for (const secret of [FAKE_BOT_TOKEN, WEBHOOK_SECRET, process.env.JWT_SECRET, DB_LEAK, 'SUPER-SECRET-PASSWORD']) {
    assert.ok(!all.includes(secret), 'leaked secret in a response');
  }
});

server.close();
for (const [status, name] of results) console.log(`${status}  ${name}`);
const failed = results.filter(([s]) => s === 'FAIL').length;
console.log(`\n${results.length - failed}/${results.length} passed (no database, Telegram API mocked)`);
process.exit(failed ? 1 : 0);
