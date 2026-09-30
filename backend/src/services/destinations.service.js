import { prisma } from '../config/database.js';

// Shared by destinations.controller.js and the Telegram bot.
export function findDestinations({ take } = {}) {
  return prisma.destination.findMany({
    orderBy: [{ name: 'asc' }, { id: 'asc' }], // id tiebreaker for deterministic order
    take,
  });
}
