import { Router } from 'express';
import { listStats } from '../controllers/stats.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listStats));

export default router;
