import { z } from 'zod';

export const newsletterSubscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
});
