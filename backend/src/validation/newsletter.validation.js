import { z } from 'zod';

export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email('Invalid email address'),
});
