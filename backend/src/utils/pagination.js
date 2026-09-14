const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parses page/limit query params safely — never trusts them raw. Garbage
 * input (negative, non-numeric, absurdly large) clamps to sane defaults
 * rather than crashing Prisma's skip/take or allowing an unbounded query.
 */
export function parsePagination(query) {
  const pageNum = Number.parseInt(query.page, 10);
  const limitNum = Number.parseInt(query.limit, 10);

  const page = Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1;
  const limit =
    Number.isFinite(limitNum) && limitNum > 0 ? Math.min(limitNum, MAX_LIMIT) : DEFAULT_LIMIT;

  return { page, limit, skip: (page - 1) * limit, take: limit };
}

export function buildMeta({ page, limit }, total) {
  return { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) };
}
