import { prisma } from '../config/database.js';
import { newsletterSubscribeSchema } from '../validation/newsletter.validation.js';
import { zodBadRequest } from '../utils/httpErrors.js';

// Upsert on email: subscribing twice with the same address is a success
// (the end state the client wants — "subscribed" — is already true), not
// a 409. Matches favorites.controller.js's addFavorite idempotency
// reasoning.
export async function subscribeNewsletter(req, res) {
  const result = newsletterSubscribeSchema.safeParse(req.body);
  if (!result.success) throw zodBadRequest(result);
  const { email } = result.data;

  const subscriber = await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  res.status(201).json({ success: true, data: subscriber });
}
