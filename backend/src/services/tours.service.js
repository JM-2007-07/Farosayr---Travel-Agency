import { prisma } from '../config/database.js';

const SORT_OPTIONS = {
  // Every option includes `id` as a secondary key so ties (e.g. two tours
  // created in the same millisecond, or identical prices) resolve to a
  // stable order across repeated requests — "sorting must be
  // deterministic" per the Phase 9.2 spec.
  price_asc: [{ price: 'asc' }, { id: 'asc' }],
  price_desc: [{ price: 'desc' }, { id: 'asc' }],
  newest: [{ createdAt: 'desc' }, { id: 'asc' }],
};

/**
 * Public tour listing shared by the website API (tours.controller.js) and
 * the Telegram bot (telegram/sections.js). `skip`/`take` are optional —
 * the website fetches the full list, the bot pages through it.
 */
// Query-string values arrive as strings, but `?q=a&q=b` turns them into
// arrays (and Prisma rejects an array where it expects a string, which
// would surface as a 500). Keep only a single, length-bounded string.
function queryString(value, maxLength = 100) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

export function findTours(filters = {}, { skip, take } = {}) {
  const destination = queryString(filters.destination);
  const minPrice = queryString(filters.minPrice, 12);
  const maxPrice = queryString(filters.maxPrice, 12);
  const q = queryString(filters.q);
  const sort = queryString(filters.sort, 20);
  const where = {};

  // `destination` is the Destination's slug (see destinations.controller.js
  // for why the frontend deals in slugs, not raw UUIDs) — not a raw
  // destinationId, since the frontend has no reason to know a UUID exists.
  if (destination) {
    where.destination = { slug: destination };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice && !Number.isNaN(Number(minPrice))) where.price.gte = Number(minPrice);
    if (maxPrice && !Number.isNaN(Number(maxPrice))) where.price.lte = Number(maxPrice);
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const orderBy = sort && Object.hasOwn(SORT_OPTIONS, sort) ? SORT_OPTIONS[sort] : [{ createdAt: 'desc' }, { id: 'asc' }];

  return prisma.tour.findMany({
    where,
    orderBy,
    skip,
    take,
    include: {
      destination: true,
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  });
}
