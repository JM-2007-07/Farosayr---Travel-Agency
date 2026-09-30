import { createHash, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { telegramUpdateSchema } from '../validation/telegram.validation.js';
import { handleUpdate } from '../telegram/handlers.js';

const SECRET_HEADER = 'x-telegram-bot-api-secret-token';

// Hashing both sides first makes the comparison constant-time regardless
// of length (timingSafeEqual itself requires equal-length buffers).
function isValidSecret(received) {
  if (typeof received !== 'string' || !received) return false;
  const expected = createHash('sha256').update(env.telegram.webhookSecret).digest();
  const actual = createHash('sha256').update(received).digest();
  return timingSafeEqual(expected, actual);
}

// Telegram re-sends an update only when it didn't get a 2xx in time, so
// duplicates are rare — and every bot action is read-only, so a duplicate
// would at worst repeat a reply. A small per-instance memory of recent
// update_ids is enough; no table/migration is needed for that.
const RECENT_UPDATES_LIMIT = 1000;
const recentUpdateIds = new Set();

function isDuplicateUpdate(updateId) {
  if (recentUpdateIds.has(updateId)) return true;
  recentUpdateIds.add(updateId);
  if (recentUpdateIds.size > RECENT_UPDATES_LIMIT) {
    recentUpdateIds.delete(recentUpdateIds.values().next().value);
  }
  return false;
}

/**
 * POST /api/telegram/webhook — called by Telegram only.
 *
 * Responds 200 for every authenticated request, including malformed or
 * failed updates: a non-2xx makes Telegram retry the same update again
 * and again. Only unauthenticated/unconfigured calls get an error status.
 * Processing happens BEFORE responding because on Vercel the function
 * may be frozen once the response is sent.
 */
export async function handleTelegramWebhook(req, res) {
  if (!env.telegram.botToken || !env.telegram.webhookSecret) {
    logger.warn('Telegram webhook called but TELEGRAM_BOT_TOKEN / TELEGRAM_WEBHOOK_SECRET is not set');
    return res.status(503).json({ success: false, message: 'Telegram integration is not configured' });
  }

  if (!isValidSecret(req.get(SECRET_HEADER))) {
    logger.warn(`Telegram webhook rejected: invalid secret token (ip ${req.ip})`);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const result = telegramUpdateSchema.safeParse(req.body);
  if (!result.success) {
    logger.warn('Telegram webhook: ignored malformed update');
    return res.status(200).json({ success: true });
  }

  const update = result.data;
  if (isDuplicateUpdate(update.update_id)) {
    logger.info(`Telegram update ${update.update_id} ignored (duplicate)`);
    return res.status(200).json({ success: true });
  }

  try {
    const handled = await handleUpdate(update);
    logger.info(`Telegram update ${update.update_id} processed (${handled})`);
  } catch (err) {
    // Typically a failed sendMessage. Logged without the update payload
    // (personal data) and never sent back to Telegram or the user.
    logger.error(`Telegram update ${update.update_id} failed: ${err?.message ?? 'unknown error'}`);
  }

  res.status(200).json({ success: true });
}
