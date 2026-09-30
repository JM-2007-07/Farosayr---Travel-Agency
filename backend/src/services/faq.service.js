import { prisma } from '../config/database.js';

// Shared by faq.controller.js and the Telegram bot.
export function findActiveFaq() {
  return prisma.fAQ.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], // id tiebreaker for deterministic order
  });
}
