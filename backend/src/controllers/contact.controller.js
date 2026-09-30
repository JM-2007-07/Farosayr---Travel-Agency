import { prisma } from '../config/database.js';
import { contactMessageSchema } from '../validation/contact.validation.js';
import { zodBadRequest } from '../utils/httpErrors.js';
import { sendNewContactNotification } from '../services/telegram.service.js';

// Public, unauthenticated on purpose — a site visitor can message the
// agency without an account, same as the original contact form implied.
export async function createContactMessage(req, res) {
  const result = contactMessageSchema.safeParse(req.body);
  if (!result.success) throw zodBadRequest(result);

  const message = await prisma.contactMessage.create({ data: result.data });

  // The message is saved at this point. The Telegram notification is
  // best-effort and never throws (see telegram.service.js), so it can't
  // turn this into an error. Awaited rather than fire-and-forget because
  // on Vercel the function may be frozen as soon as the response is sent.
  await sendNewContactNotification(message);

  res.status(201).json({ success: true, data: message });
}
