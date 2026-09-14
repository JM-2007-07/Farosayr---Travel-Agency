import { prisma } from '../config/database.js';
import { notFoundError } from '../utils/httpErrors.js';

const SORT_OPTIONS = {
  // Every option includes `id` as a secondary key so ties (e.g. two tours
  // created in the same millisecond, or identical prices) resolve to a
  // stable order across repeated requests — "sorting must be
  // deterministic" per the Phase 9.2 spec.
  price_asc: [{ price: 'asc' }, { id: 'asc' }],
  price_desc: [{ price: 'desc' }, { id: 'asc' }],
  newest: [{ createdAt: 'desc' }, { id: 'asc' }],
};

export async function listTours(req, res) {
  const { destination, minPrice, maxPrice, q, sort } = req.query;

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

  const orderBy = SORT_OPTIONS[sort] ?? [{ createdAt: 'desc' }, { id: 'asc' }];

  const tours = await prisma.tour.findMany({
    where,
    orderBy,
    include: {
      destination: true,
      images: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  });

  res.status(200).json({ success: true, data: tours });
}

// :id is the tour's slug, same reasoning as destinations.controller.js.
export async function getTour(req, res) {
  const tour = await prisma.tour.findUnique({
    where: { slug: req.params.id },
    include: { destination: true, images: { orderBy: { sortOrder: 'asc' } } },
  });
  if (!tour) throw notFoundError('Tour not found');
  res.status(200).json({ success: true, data: tour });
}
