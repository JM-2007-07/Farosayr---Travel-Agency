// Small helpers for building Telegram messages. Every outgoing message uses
// parse_mode: 'HTML', so any text that came from a user or the database
// MUST go through escapeHtml() — otherwise a "<" in a contact message
// breaks the whole message (Telegram rejects it) or injects formatting.

// Telegram's hard limit is 4096 characters; staying under it leaves room
// for headers/footers added around a list.
export const MAX_MESSAGE_LENGTH = 3800;

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Truncate BEFORE escaping — cutting an escaped string could split an
// entity like "&amp;" in half.
export function truncate(value, max) {
  const text = String(value ?? '').trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export function link(url, label) {
  return `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`;
}

export function formatUsd(amount) {
  // Same "$1200" display the website's TourCard uses; Prisma Decimals
  // arrive as objects/strings, so normalize through Number.
  return `$${Number(amount).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

const DATE_LOCALES = { ru: 'ru-RU', tj: 'tg-TJ', en: 'en-GB' };

export function formatDate(date, lang = 'ru', { withTime = false } = {}) {
  return new Intl.DateTimeFormat(DATE_LOCALES[lang] ?? DATE_LOCALES.ru, {
    dateStyle: 'medium',
    ...(withTime ? { timeStyle: 'short' } : {}),
    timeZone: 'Asia/Dushanbe',
  }).format(new Date(date));
}

/**
 * Joins pre-formatted HTML blocks under a header, stopping before the
 * message would exceed MAX_MESSAGE_LENGTH. Whole blocks are dropped rather
 * than cutting HTML mid-tag (which Telegram would reject).
 */
export function joinBlocks(header, blocks, footer = '') {
  let text = header;
  for (const block of blocks) {
    if (text.length + block.length + footer.length + 2 > MAX_MESSAGE_LENGTH) break;
    text += `\n\n${block}`;
  }
  return footer ? `${text}\n\n${footer}` : text;
}
