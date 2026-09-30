import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { escapeHtml, truncate, formatUsd, formatDate } from '../telegram/format.js';

/**
 * The ONLY module that talks to the Telegram Bot API. Everything else
 * (webhook handlers, contact/booking notifications, the webhook CLI
 * script) goes through the functions exported here.
 *
 * The bot token is part of every Bot API URL, so request URLs are never
 * logged and raw fetch errors (which can include the URL) are never
 * passed through — only safe, hand-written messages leave this file.
 *
 * Uses Node's built-in fetch (Node 18+) — no HTTP client dependency.
 */

const API_BASE = 'https://api.telegram.org';

// Bounded so a slow/unreachable Telegram can't hold a contact/booking
// request (or a serverless function) open indefinitely.
const REQUEST_TIMEOUT_MS = 5000;

export class TelegramApiError extends Error {
  constructor(message, { status } = {}) {
    super(message);
    this.name = 'TelegramApiError';
    this.status = status;
  }
}

export function isTelegramBotConfigured() {
  return Boolean(env.telegram.botToken);
}

async function callTelegramApi(method, payload = {}) {
  if (!env.telegram.botToken) {
    throw new TelegramApiError('TELEGRAM_BOT_TOKEN is not configured');
  }

  let response;
  try {
    response = await fetch(`${API_BASE}/bot${env.telegram.botToken}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    // err.name only (TimeoutError / TypeError) — the message/cause of a
    // network error can contain the request URL, i.e. the token.
    throw new TelegramApiError(`Telegram ${method} request failed (${err?.name ?? 'Error'})`);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.ok) {
    // Telegram's `description` is a short, token-free explanation such as
    // "Bad Request: chat not found".
    const description = typeof body?.description === 'string' ? `: ${body.description}` : '';
    throw new TelegramApiError(`Telegram ${method} failed (${response.status})${description}`, {
      status: response.status,
    });
  }
  return body.result;
}

// ---------------------------------------------------------------------
// Messaging
// ---------------------------------------------------------------------

export function sendTelegramMessage(chatId, text, { replyMarkup } = {}) {
  return callTelegramApi('sendMessage', {
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

export function answerCallbackQuery(callbackQueryId) {
  return callTelegramApi('answerCallbackQuery', { callback_query_id: callbackQueryId });
}

// ---------------------------------------------------------------------
// Webhook management (used by scripts/telegram-webhook.js — deliberately
// NOT exposed as HTTP endpoints)
// ---------------------------------------------------------------------

export function setWebhook(url) {
  if (!env.telegram.webhookSecret) {
    throw new TelegramApiError('TELEGRAM_WEBHOOK_SECRET is not configured');
  }
  return callTelegramApi('setWebhook', {
    url,
    // Telegram echoes this back in the X-Telegram-Bot-Api-Secret-Token
    // header of every webhook call; telegram.controller.js rejects
    // requests without it.
    secret_token: env.telegram.webhookSecret,
    allowed_updates: ['message', 'callback_query'],
  });
}

export function deleteWebhook({ dropPendingUpdates = false } = {}) {
  return callTelegramApi('deleteWebhook', { drop_pending_updates: dropPendingUpdates });
}

export function getWebhookInfo() {
  return callTelegramApi('getWebhookInfo');
}

// ---------------------------------------------------------------------
// Admin notifications
// ---------------------------------------------------------------------

let warnedNotConfigured = false;

/**
 * Best-effort delivery to TELEGRAM_ADMIN_CHAT_ID. NEVER throws: callers
 * invoke this after their database write has already succeeded, and a
 * Telegram outage must not turn that success into an error response.
 * Returns whether the message was delivered.
 */
async function notifyAdmin(text) {
  if (!env.telegram.botToken || !env.telegram.adminChatId) {
    if (!warnedNotConfigured) {
      logger.warn('Telegram admin notifications disabled (TELEGRAM_BOT_TOKEN / TELEGRAM_ADMIN_CHAT_ID not set)');
      warnedNotConfigured = true;
    }
    return false;
  }
  try {
    await sendTelegramMessage(env.telegram.adminChatId, text);
    return true;
  } catch (err) {
    logger.warn(`Telegram admin notification failed: ${err.message}`);
    return false;
  }
}

// Admin notifications are in Russian — the site's default language and
// the language the admin panel's data is entered in.

export function sendNewContactNotification(contactMessage) {
  const text = [
    '📩 <b>Новое сообщение с сайта Farosayr</b>',
    '',
    `👤 <b>Имя:</b> ${escapeHtml(truncate(contactMessage.name, 120))}`,
    `📧 <b>Email:</b> ${escapeHtml(contactMessage.email)}`,
    `📝 <b>Тема:</b> ${escapeHtml(truncate(contactMessage.subject, 200))}`,
    '',
    '💬 <b>Сообщение:</b>',
    escapeHtml(truncate(contactMessage.message, 3000)),
    '',
    `🕒 ${formatDate(contactMessage.createdAt, 'ru', { withTime: true })}`,
    `🌐 Источник: форма обратной связи на сайте — ${escapeHtml(env.clientUrl)}/admin/messages`,
  ].join('\n');
  return notifyAdmin(text);
}

/**
 * `booking` is the object bookings.controller.js already loads (with
 * items → tour), `user` is req.user (safe fields only). The Booking model
 * has no phone or travel-date field, so neither is shown.
 */
export function sendNewBookingNotification(booking, user) {
  const tourLines = (booking.items ?? []).map(
    (item) => `🌍 <b>Тур:</b> ${escapeHtml(item.tour?.title ?? '—')} × ${item.quantity}`
  );
  const text = [
    '✈️ <b>Новая заявка на бронирование</b>',
    '',
    `👤 <b>Клиент:</b> ${escapeHtml(truncate(user.name, 120))}`,
    `📧 <b>Email:</b> ${escapeHtml(user.email)}`,
    ...tourLines,
    `💵 <b>Сумма:</b> ${formatUsd(booking.totalAmount)}`,
    `📅 <b>Дата заявки:</b> ${formatDate(booking.createdAt, 'ru', { withTime: true })}`,
    '',
    `🔗 ${escapeHtml(env.clientUrl)}/admin/bookings`,
  ].join('\n');
  return notifyAdmin(text);
}
