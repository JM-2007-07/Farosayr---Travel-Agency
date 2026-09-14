import { Router } from 'express';
import { listTours, getTour } from '../controllers/tours.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listTours));
router.get('/:id', asyncHandler(getTour));

export default router;
