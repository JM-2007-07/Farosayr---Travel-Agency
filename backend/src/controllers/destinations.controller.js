import { prisma } from '../config/database.js';
import { notFoundError } from '../utils/httpErrors.js';

export async function listDestinations(req, res) {
  const destinations = await prisma.destination.findMany({
    orderBy: [{ name: 'asc' }, { id: 'asc' }], // id tiebreaker for deterministic order
  });
  res.status(200).json({ success: true, data: destinations });
}

// :id here is actually the destination's slug — the frontend has used
// slug-style string ids (e.g. "dubai") since before this backend existed
// (see MIGRATION_PLAN.md), so the route param is matched against `slug`,
// not the real database `id` (a UUID the frontend never had a concept of).
//
// Includes related tours (ordered the same deterministic way as
// listTours' default) so the destination detail page can show them —
// added in Phase 9.2 specifically to support that page; listDestinations
// intentionally does NOT include this, since the homepage grid never
// needed it and fetching every destination's full tour list there would
// be unnecessary overfetching.
export async function getDestination(req, res) {
  const destination = await prisma.destination.findUnique({
    where: { slug: req.params.id },
    include: { tours: { orderBy: [{ createdAt: 'desc' }, { id: 'asc' }] } },
  });
  if (!destination) throw notFoundError('Destination not found');
  res.status(200).json({ success: true, data: destination });
}
