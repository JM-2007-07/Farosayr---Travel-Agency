import { prisma } from '../config/database.js';

/**
 * A deal is "current" when an admin has it switched on (isActive) AND it is
 * inside its own validity window (startsAt ≤ now < endsAt). Expired or
 * not-yet-started deals are not offered as "hot deals" — the website shows
 * a countdown, so listing a deal whose countdown already reached zero (or
 * hasn't started) contradicts the page itself. They stay reachable by id
 * (/deals/:id) for anyone holding a link; that page shows them as ended.
 */
export function currentDealWhere(now = new Date()) {
  return { isActive: true, startsAt: { lte: now }, endsAt: { gt: now } };
}

/** True when a loaded deal is current right now (same rule as above). */
export function isDealCurrent(deal, now = new Date()) {
  return Boolean(deal?.isActive && new Date(deal.startsAt) <= now && new Date(deal.endsAt) > now);
}

// Shared by deals.controller.js and the Telegram bot.
export function findActiveDeals({ take } = {}) {
  return prisma.deal.findMany({
    where: currentDealWhere(),
    orderBy: [{ endsAt: 'asc' }, { id: 'asc' }], // ending soonest first — what a "hot deal" list means
    take,
    include: { tour: true },
  });
}
