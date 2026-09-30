import { Router } from 'express';
import { handleTelegramWebhook } from '../controllers/telegram.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { telegramWebhookRateLimit } from '../middleware/authRateLimit.js';

const router = Router();

// Authenticated by Telegram's secret-token header (see the controller),
// not by a user session. This is the only Telegram route — webhook
// management is done from scripts/telegram-webhook.js, not over HTTP.
router.post('/webhook', telegramWebhookRateLimit, asyncHandler(handleTelegramWebhook));

export default router;
