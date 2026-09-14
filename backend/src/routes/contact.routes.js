import { Router } from 'express';
import { createContactMessage } from '../controllers/contact.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { publicWriteRateLimit } from '../middleware/authRateLimit.js';

const router = Router();

// No requireAuth — a site visitor can message the agency without an account.
router.post('/', publicWriteRateLimit, asyncHandler(createContactMessage));

export default router;
