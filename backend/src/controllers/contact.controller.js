import { prisma } from '../config/database.js';
import { contactMessageSchema } from '../validation/contact.validation.js';
import { zodBadRequest } from '../utils/httpErrors.js';

// Public, unauthenticated on purpose — a site visitor can message the
// agency without an account, same as the original contact form implied.
export async function createContactMessage(req, res) {
  const result = contactMessageSchema.safeParse(req.body);
  if (!result.success) throw zodBadRequest(result);

  const message = await prisma.contactMessage.create({ data: result.data });
  res.status(201).json({ success: true, data: message });
}
