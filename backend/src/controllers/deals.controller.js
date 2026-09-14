import { prisma } from '../config/database.js';
import { notFoundError } from '../utils/httpErrors.js';

// Deals don't have a slug in the schema (see schema.prisma's Deal model —
// it wasn't given one), so real database UUIDs are used as the id here.
// This is the one exception to the slug-based id pattern used for
// destinations/tours — documented in the sub-phase report.
export async function listDeals(req, res) {
  const deals = await prisma.deal.findMany({
    where: { isActive: true },
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], // id tiebreaker for deterministic order
    include: { tour: true },
  });
  res.status(200).json({ success: true, data: deals });
}

export async function getDeal(req, res) {
  const deal = await prisma.deal.findUnique({
    where: { id: req.params.id },
    include: { tour: true },
  });
  if (!deal) throw notFoundError('Deal not found');
  res.status(200).json({ success: true, data: deal });
}
