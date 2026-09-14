import { z } from 'zod';

// tourId + rating + comment only — userId always comes from req.user
// (requireAuth), never from the request body. See reviews.controller.js.
export const createReviewSchema = z.object({
  tourId: z.string().trim().min(1, 'tourId is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  comment: z.string().trim().min(1, 'Comment is required').max(2000),
});
