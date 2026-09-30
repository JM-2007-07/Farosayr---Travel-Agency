/**
 * Code-level self-test for the Telegram integration — NO real Telegram
 * connection. Calls to api.telegram.org are intercepted by a fetch stub
 * and recorded; everything else (the Express app, routing, validation,
 * handlers, the shared services and the local database) is real.
 * Read-only against the database: it creates no records.
 *
 *   npm run telegram:selftest
 *
 * Needs the usual backend/.env (DATABASE_URL, JWT_SECRET). Any real
 * TELEGRAM_* values in .env are overridden with dummies below, so this
 * never talks to a real bot.
 */
import assert from 'node:assert/strict';

process.env.TELEGRAM_BOT_TOKEN = '123456:SELFTEST-DUMMY-TOKEN';
process.env.TELEGRAM_ADMIN_CHAT_ID = '999';
process.env.TELEGRAM_WEBHOOK_SECRET = 'selftest-secret';

// --- Telegram API stub -------------------------------------------------
const realFetch = globalThis.fetch;
const telegramCalls = [];
let telegramMode = 'ok'; // 'ok' | 'error' | 'network'

globalThis.fetch = async (url, init) => {
  if (!String(url).startsWith('https://api.telegram.org/')) return realFetch(url, init);
  const method = String(url).split('/').pop();
  telegramCalls.push({ method, payload: JSON.parse(init.body) });
  if (telegramMode === 'network') throw new TypeError('fetch failed');
  if (telegramMode === 'error') {
    return new Response(JSON.stringify({ ok: false, description: 'Bad Request: chat not found' }), { status: 400 });
  }
  return new Response(JSON.stringify({ ok: true, result: true }), { status: 200 });
};

const { default: app } = await import('../src/app.js');
const { env } = await import('../src/config/env.js');
const { prisma } = await import('../src/config/database.js');
const { findTours } = await import('../src/services/tours.service.js');
const { sendNewContactNotification, sendNewBookingNotification } = await import(
  '../src/services/telegram.service.js'
);
const { detectSection } = await import('../src/telegram/handlers.js');

const server = app.listen(0);
const webhookUrl = `http://127.0.0.1:${server.address().port}${env.apiPrefix}/telegram/webhook`;

let updateId = 1000;
const privateChat = { id: 42, type: 'private' };
const user = (lang = 'ru') => ({ id: 42, is_bot: false, language_code: lang });
const textUpdate = (text, lang, chat = privateChat) => ({
  update_id: ++updateId,
  message: { message_id: updateId, chat, from: user(lang), text },
});
const callbackUpdate = (data, lang) => ({
  update_id: ++updateId,
  callback_query: { id: `cb${updateId}`, from: user(lang), data, message: { message_id: 1, chat: privateChat } },
});

async function post(body, secret = 'selftest-secret') {
  telegramCalls.length = 0;
  const res = await realFetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(secret ? { 'X-Telegram-Bot-Api-Secret-Token': secret } : {}),
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => null) };
}

const sent = () => telegramCalls.filter((c) => c.method === 'sendMessage');

const results = [];
async function check(name, fn) {
  try {
    await fn();
    results.push(['PASS', name]);
  } catch (err) {
    results.push(['FAIL', `${name} — ${err.message}`]);
  } finally {
    telegramMode = 'ok';
  }
}

// --- Webhook security / robustness ------------------------------------
await check('webhook route registered; missing secret -> 401', async () => {
  const r = await post(textUpdate('/start'), null);
  assert.equal(r.status, 401);
  assert.equal(telegramCalls.length, 0);
});
await check('invalid secret -> 401, nothing sent', async () => {
  const r = await post(textUpdate('/start'), 'wrong-secret');
  assert.equal(r.status, 401);
  assert.equal(telegramCalls.length, 0);
});
await check('malformed update -> 200, ignored', async () => {
  const r = await post({ hello: 'world' });
  assert.equal(r.status, 200);
  assert.equal(telegramCalls.length, 0);
});
await check('invalid JSON body -> 4xx, server keeps running', async () => {
  const r = await post('{not json');
  assert.ok(r.status >= 400 && r.status < 500, `status ${r.status}`);
  assert.ok(!r.body?.stack || !env.isProduction);
});
await check('group chat messages are ignored', async () => {
  const r = await post(textUpdate('/tours', 'ru', { id: -100, type: 'group' }));
  assert.equal(r.status, 200);
  assert.equal(sent().length, 0);
});
await check('duplicate update_id processed once', async () => {
  const u = textUpdate('/help');
  await post(u);
  assert.equal(sent().length, 1);
  await post(u);
  assert.equal(sent().length, 0);
});
await check('Telegram API failure -> webhook still 200', async () => {
  telegramMode = 'error';
  const r = await post(textUpdate('/start'));
  assert.equal(r.status, 200);
});

// --- Commands ----------------------------------------------------------
async function expectReply(update, predicate, label) {
  const r = await post(update);
  assert.equal(r.status, 200);
  const messages = sent();
  assert.equal(messages.length, 1, `${label}: expected 1 sendMessage, got ${messages.length}`);
  const { text, chat_id: chatId, parse_mode: parseMode, reply_markup: markup } = messages[0].payload;
  assert.equal(chatId, 42);
  assert.equal(parseMode, 'HTML');
  assert.ok(text.length <= 4096, `${label}: message too long (${text.length})`);
  predicate(text, markup);
}

await check('/start -> welcome + main menu keyboard', () =>
  expectReply(textUpdate('/start'), (text, markup) => {
    assert.match(text, /Добро пожаловать в FaroSayr/);
    assert.equal(markup.inline_keyboard.flat().length, 5);
  }, '/start'));

const firstTours = await findTours({}, { take: 5 });
await check('/tours -> real tours from the database', () =>
  expectReply(textUpdate('/tours'), (text) => {
    assert.match(text, /Туры/);
    for (const tour of firstTours) assert.ok(text.includes(tour.slug), `missing tour ${tour.slug}`);
  }, '/tours'));
await check('/destinations -> real destinations', async () => {
  const d = await prisma.destination.findFirst({ orderBy: [{ name: 'asc' }, { id: 'asc' }] });
  await expectReply(textUpdate('/destinations'), (text) => {
    assert.match(text, /Направления/);
    if (d) assert.ok(text.includes(d.slug));
  }, '/destinations');
});
await check('/deals -> active deals only', async () => {
  const inactive = await prisma.deal.findMany({ where: { isActive: false } });
  await expectReply(textUpdate('/deals'), (text) => {
    assert.match(text, /Горящие предложения|Сейчас нет активных/);
    for (const deal of inactive) assert.ok(!text.includes(deal.id), 'inactive deal shown');
  }, '/deals');
});
await check('/faq -> active FAQ from the database', async () => {
  const faq = await prisma.fAQ.findFirst({ where: { isActive: true }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] });
  await expectReply(textUpdate('/faq'), (text) => {
    assert.match(text, /Частые вопросы|пока пуст/);
    if (faq) assert.ok(text.includes(faq.question.slice(0, 20).replace(/&/g, '&amp;')));
  }, '/faq');
});
await check('/contact -> public contact details', () =>
  expectReply(textUpdate('/contact'), (text) => {
    assert.match(text, /\+992 11 211 33 77/);
    assert.match(text, /farosayrtour@mail\.ru/);
  }, '/contact'));
await check('/tours@BotName with suffix still works', () =>
  expectReply(textUpdate('/tours@FarosayrBot'), (text) => assert.match(text, /Туры/), '/tours@'));
await check('unknown text -> "not understood" + menu', () =>
  expectReply(textUpdate('asdfgh'), (text, markup) => {
    assert.match(text, /не понял/);
    assert.ok(markup.inline_keyboard.length > 0);
  }, 'unknown'));
await check('non-text message (sticker) -> "not understood"', () =>
  expectReply({ update_id: ++updateId, message: { message_id: 1, chat: privateChat, from: user() } },
    (text) => assert.match(text, /не понял/), 'sticker'));
await check('unknown /command -> "not understood"', () =>
  expectReply(textUpdate('/admin'), (text) => assert.match(text, /не понял/), '/admin'));
await check('language: en and tg (Tajik)', async () => {
  await expectReply(textUpdate('/start', 'en'), (text) => assert.match(text, /Welcome to FaroSayr/), 'en');
  await expectReply(textUpdate('/start', 'tg'), (text) => assert.match(text, /Хуш омадед/), 'tg');
});
await check('keyword matching', () => {
  const cases = {
    'Сколько стоят туры?': 'tours', 'prices': 'tours', 'special offers': 'deals', 'deals': 'deals',
    'Направления': 'destinations', 'contacts': 'contact', 'help': 'help', 'Турҳо': 'tours',
    '💰 Горящие предложения': 'deals', 'Саволҳо': 'faq', 'which one?': 'unknown',
  };
  for (const [text, section] of Object.entries(cases)) assert.equal(detectSection(text), section, text);
});

// --- Callback buttons --------------------------------------------------
await check('callback menu:deals -> answered + reply', async () => {
  const r = await post(callbackUpdate('menu:deals'));
  assert.equal(r.status, 200);
  assert.ok(telegramCalls.some((c) => c.method === 'answerCallbackQuery'));
  assert.equal(sent().length, 1);
});
await check('callback tours:page:2 -> page 2', async () => {
  await post(callbackUpdate('tours:page:2'));
  assert.equal(sent().length, 1);
  assert.match(sent()[0].payload.text, /стр\. 2|Сейчас нет доступных туров/);
});
await check('forged callback data -> answered, no reply', async () => {
  for (const data of ['admin:bookings', 'tours:page:0', 'tours:page:-1', 'menu:contacts; drop']) {
    await post(callbackUpdate(data));
    assert.equal(sent().length, 0, data);
  }
});

// --- Admin notifications ----------------------------------------------
const contact = {
  name: 'Test <b>User</b>', email: 'test@example.test', subject: 'Visa & tour',
  message: 'Hello <script>alert(1)</script>', createdAt: new Date(),
};
await check('contact notification -> admin chat, HTML escaped', async () => {
  telegramCalls.length = 0;
  assert.equal(await sendNewContactNotification(contact), true);
  const [msg] = sent();
  assert.equal(msg.payload.chat_id, '999');
  assert.ok(msg.payload.text.includes('&lt;script&gt;'));
  assert.ok(!msg.payload.text.includes('<script>'));
});
await check('booking notification -> admin chat', async () => {
  telegramCalls.length = 0;
  const booking = {
    totalAmount: '2400.00', createdAt: new Date(),
    items: [{ quantity: 2, tour: { title: 'Dubai <5*>' } }],
  };
  assert.equal(await sendNewBookingNotification(booking, { name: 'Anora', email: 'a@example.test' }), true);
  assert.match(sent()[0].payload.text, /Dubai &lt;5\*&gt; × 2/);
  assert.match(sent()[0].payload.text, /\$2,400/);
});
await check('notification failure never throws (API error + network error)', async () => {
  telegramMode = 'error';
  assert.equal(await sendNewContactNotification(contact), false);
  telegramMode = 'network';
  assert.equal(await sendNewContactNotification(contact), false);
});
await check('notifications skipped when not configured', async () => {
  const saved = env.telegram.adminChatId;
  env.telegram.adminChatId = null;
  telegramCalls.length = 0;
  try {
    assert.equal(await sendNewContactNotification(contact), false);
    assert.equal(telegramCalls.length, 0);
  } finally {
    env.telegram.adminChatId = saved;
  }
});
await check('webhook returns 503 when not configured', async () => {
  const saved = env.telegram.webhookSecret;
  env.telegram.webhookSecret = null;
  try {
    assert.equal((await post(textUpdate('/start'))).status, 503);
  } finally {
    env.telegram.webhookSecret = saved;
  }
});

// --- Report -------------------------------------------------------------
server.close();
await prisma.$disconnect();

for (const [status, name] of results) console.log(`${status}  ${name}`);
const failed = results.filter(([s]) => s === 'FAIL').length;
console.log(`\n${results.length - failed}/${results.length} passed (code-level only; Telegram API was mocked)`);
process.exit(failed ? 1 : 0);
