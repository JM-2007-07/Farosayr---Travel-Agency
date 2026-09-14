import { Router } from 'express';
import { listDestinations, getDestination } from '../controllers/destinations.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listDestinations));
router.get('/:id', asyncHandler(getDestination));

export default router;
