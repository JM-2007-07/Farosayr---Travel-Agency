import { logger } from '../utils/logger.js';
import { sendTelegramMessage, answerCallbackQuery } from '../services/telegram.service.js';
import { resolveLanguage, getTexts } from './texts.js';
import { parseCallbackData, backToMenuKeyboard } from './keyboards.js';
import { buildSection } from './sections.js';

/**
 * Routes an already-validated Telegram Update (see
 * validation/telegram.validation.js) to a public, read-only section.
 * Deterministic on purpose: commands, button callbacks and a small keyword
 * list — no AI.
 *
 * There are no admin commands. TELEGRAM_ADMIN_CHAT_ID is only a delivery
 * target for notifications (services/telegram.service.js); a message
 * FROM that chat gets exactly the same public answers as anyone else.
 */

const COMMANDS = {
  '/start': 'start',
  '/help': 'help',
  '/menu': 'start',
  '/tours': 'tours',
  '/destinations': 'destinations',
  '/deals': 'deals',
  '/faq': 'faq',
  '/contact': 'contact',
};

// Checked in order, as substrings of the lower-cased message, so stems
// ("направлен") also match inflected forms ("направления", "направлениях").
// Menu button labels (see texts.js) match here too.
const KEYWORDS = [
  ['destinations', ['destination', 'направлен', 'страны', 'самт']],
  ['deals', ['deal', 'offer', 'special', 'discount', 'горящ', 'акци', 'скидк', 'предложен', 'пешниҳод', 'тахфиф']],
  ['tours', ['tour', 'price', 'тур', 'цен', 'стоимост', 'нарх']],
  ['faq', ['faq', 'question', 'вопрос', 'савол']],
  ['contact', ['contact', 'phone', 'address', 'manager', 'контакт', 'телефон', 'адрес', 'менеджер', 'связ', 'тамос', 'суроға', 'менеҷер']],
  ['help', ['help', 'menu', 'помощ', 'меню', 'ёрӣ', 'кумак', 'кӯмак']],
  ['start', ['hello', 'привет', 'здравств', 'салом', 'start', 'старт']],
];

export function detectSection(text) {
  const trimmed = String(text ?? '').trim().toLowerCase();
  if (!trimmed) return 'unknown';

  if (trimmed.startsWith('/')) {
    // "/tours@FarosayrBot extra words" -> "/tours"
    const command = trimmed.split(/\s+/)[0].split('@')[0];
    return COMMANDS[command] ?? 'unknown';
  }

  for (const [section, words] of KEYWORDS) {
    if (words.some((word) => trimmed.includes(word))) return section;
  }
  return 'unknown';
}

async function reply(chatId, section, lang, options) {
  let text;
  let replyMarkup;
  try {
    ({ text, replyMarkup } = await buildSection(section, lang, options));
  } catch (err) {
    // Data loading failed (e.g. database unreachable). The user gets a
    // generic message; details stay in the server log only.
    logger.error(`Telegram section "${section}" failed to build:`, err?.message ?? err);
    text = getTexts(lang).error;
    replyMarkup = backToMenuKeyboard(lang);
  }
  await sendTelegramMessage(chatId, text, { replyMarkup });
}

async function handleMessage(message) {
  // Private chats only: the bot isn't meant to answer in groups/channels.
  if (message.chat.type !== 'private' || message.from?.is_bot) return 'ignored';

  const lang = resolveLanguage(message.from?.language_code);
  const section = detectSection(message.text);
  await reply(message.chat.id, section, lang);
  return section;
}

async function handleCallbackQuery(callbackQuery) {
  // Always answer, so the user's button stops showing a loading spinner —
  // but never let a failure there block the actual reply.
  await answerCallbackQuery(callbackQuery.id).catch((err) =>
    logger.warn(`Telegram answerCallbackQuery failed: ${err.message}`)
  );

  const action = parseCallbackData(callbackQuery.data);
  const chat = callbackQuery.message?.chat;
  if (!action || !chat || chat.type !== 'private') return 'ignored';

  const lang = resolveLanguage(callbackQuery.from.language_code);
  await reply(chat.id, action.section, lang, { page: action.page });
  return action.section;
}

/**
 * Returns a short label describing what was handled (for logging only).
 * May throw if the Telegram API call itself fails — the webhook
 * controller catches and logs that.
 */
export async function handleUpdate(update) {
  if (update.callback_query) return `callback:${await handleCallbackQuery(update.callback_query)}`;
  if (update.message) return `message:${await handleMessage(update.message)}`;
  return 'ignored';
}
