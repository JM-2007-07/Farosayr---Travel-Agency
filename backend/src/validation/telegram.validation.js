import { z } from 'zod';

// Only the parts of a Telegram Update the bot actually uses. Zod strips
// every other key, so the rest of the update (names, usernames, photos…)
// never travels further into the app — or into a log line.
// Reference: https://core.telegram.org/bots/api#update

const chatSchema = z.object({
  id: z.number().int(),
  type: z.string(),
});

const userSchema = z.object({
  id: z.number().int(),
  is_bot: z.boolean().optional(),
  language_code: z.string().max(35).optional(),
});

const messageSchema = z.object({
  message_id: z.number().int(),
  chat: chatSchema,
  from: userSchema.optional(),
  text: z.string().max(4096).optional(),
});

const callbackQuerySchema = z.object({
  id: z.string().min(1).max(128),
  from: userSchema,
  // The bot's own callback_data is at most 64 bytes (Telegram limit).
  data: z.string().max(64).optional(),
  message: z.object({ chat: chatSchema }).optional(),
});

export const telegramUpdateSchema = z.object({
  update_id: z.number().int().nonnegative(),
  message: messageSchema.optional(),
  callback_query: callbackQuerySchema.optional(),
});
