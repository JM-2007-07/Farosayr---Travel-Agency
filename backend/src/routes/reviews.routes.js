import { Router } from 'express';
import { listReviews, createReview } from '../controllers/reviews.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { userWriteRateLimit } from '../middleware/authRateLimit.js';

const router = Router();

router.get('/', asyncHandler(listReviews));
router.post('/', requireAuth, userWriteRateLimit, asyncHandler(createReview));

export default router;
