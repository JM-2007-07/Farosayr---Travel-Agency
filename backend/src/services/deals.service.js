import { prisma } from '../config/database.js';

// Shared by deals.controller.js and the Telegram bot. "Active" means
// isActive only — the same rule the website has always used.
export function findActiveDeals({ take } = {}) {
  return prisma.deal.findMany({
    where: { isActive: true },
    orderBy: [{ createdAt: 'desc' }, { id: 'asc' }], // id tiebreaker for deterministic order
    take,
    include: { tour: true },
  });
}
