/**
 * Manage the Telegram webhook from the command line (see docs/TELEGRAM.md).
 *
 *   npm run telegram:webhook -- info
 *   npm run telegram:webhook -- set https://YOUR-BACKEND-DOMAIN/api/telegram/webhook
 *   npm run telegram:webhook -- delete
 *
 * Reads TELEGRAM_BOT_TOKEN / TELEGRAM_WEBHOOK_SECRET from backend/.env
 * (plus the variables config/env.js always requires). Prints only
 * Telegram's responses — never the token or the secret.
 */
import {
  setWebhook,
  deleteWebhook,
  getWebhookInfo,
  isTelegramBotConfigured,
} from '../src/services/telegram.service.js';

const [command, url] = process.argv.slice(2);

async function main() {
  if (!isTelegramBotConfigured()) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set in backend/.env');
  }

  switch (command) {
    case 'info': {
      const info = await getWebhookInfo();
      console.log(JSON.stringify(info, null, 2));
      return;
    }
    case 'set': {
      if (!url || !url.startsWith('https://')) {
        throw new Error('Usage: set https://YOUR-BACKEND-DOMAIN/api/telegram/webhook (Telegram requires HTTPS)');
      }
      await setWebhook(url);
      console.log(`Webhook set to ${url}`);
      return;
    }
    case 'delete': {
      await deleteWebhook();
      console.log('Webhook deleted');
      return;
    }
    default:
      throw new Error('Usage: npm run telegram:webhook -- <info | set <https-url> | delete>');
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
