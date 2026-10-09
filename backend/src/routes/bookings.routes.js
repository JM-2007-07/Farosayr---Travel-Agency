import { Router } from 'express';
import { createBooking, listMyBookings } from '../controllers/bookings.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { userWriteRateLimit } from '../middleware/authRateLimit.js';

const router = Router();

router.post('/', requireAuth, userWriteRateLimit, asyncHandler(createBooking));
router.get('/', requireAuth, asyncHandler(listMyBookings));

export default router;
