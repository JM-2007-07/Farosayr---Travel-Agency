import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

/**
 * Single shared PrismaClient instance for the whole backend.
 *
 * `node --watch` (our dev script) restarts the process on file changes
 * rather than hot-swapping modules in place, so — unlike frameworks with
 * true in-process HMR (e.g. Next.js dev server) — a plain module-level
 * singleton is already safe here: each restart is a fresh process with a
 * fresh client, not an accumulation of orphaned clients within one process.
 * The globalThis-cache pattern below is kept anyway, at negligible cost,
 * as a guard against any future dev tooling change that *does* reuse the
 * module registry across reloads (e.g. switching to a bundler-based dev
 * server later) — it costs nothing today and prevents a real problem if
 * that assumption ever changes.
 */
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.__farosayrPrisma ?? new PrismaClient();

if (!env.isProduction) {
  globalForPrisma.__farosayrPrisma = prisma;
}

/**
 * Trivial connectivity check — `SELECT 1`, nothing business-specific.
 * No business models exist yet, so this is deliberately the simplest
 * possible query rather than touching a real table.
 * Returns true/false; never throws — callers decide what to do with a
 * failed check (see server.js startup and the health controller).
 */
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
