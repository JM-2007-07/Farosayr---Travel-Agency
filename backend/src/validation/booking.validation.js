import { z } from 'zod';

// Only tourId + quantity come from the client — userId always comes from
// req.user (requireAuth), never from the request body. See
// bookings.controller.js.
export const createBookingSchema = z.object({
  tourId: z.string().trim().min(1, 'tourId is required'),
  quantity: z.number().int().min(1).max(20).default(1),
});
