import { Router } from 'express';
import { createBooking, listMyBookings } from '../controllers/bookings.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.post('/', requireAuth, asyncHandler(createBooking));
router.get('/', requireAuth, asyncHandler(listMyBookings));

export default router;
