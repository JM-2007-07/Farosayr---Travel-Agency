import { Router } from 'express';
import { listDeals, getDeal } from '../controllers/deals.controller.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/', asyncHandler(listDeals));
router.get('/:id', asyncHandler(getDeal));

export default router;
