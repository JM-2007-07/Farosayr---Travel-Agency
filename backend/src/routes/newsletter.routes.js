import { Router } from 'express';
import { subscribeNewsletter } from '../controllers/newsletter.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { publicWriteRateLimit } from '../middleware/authRateLimit.js';

const router = Router();

router.post('/subscribe', publicWriteRateLimit, asyncHandler(subscribeNewsletter));

export default router;
