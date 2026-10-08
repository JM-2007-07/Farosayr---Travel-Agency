import { randomBytes } from 'node:crypto';

// Hosts that are unambiguously a developer's own database.
const LOCAL_DB_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]', 'postgres', 'db']);

/** True when DATABASE_URL points at a developer's own (local) database. */
export function isLocalDatabaseUrl(databaseUrl) {
  const host = databaseHost(databaseUrl);
  return host !== null && LOCAL_DB_HOSTS.has(host);
}

function databaseHost(databaseUrl) {
  try {
    return new URL(databaseUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Decides whether the demo seed may run, and with which password.
 *
 * The seed creates demo users — including an ADMIN — plus fake reviews,
 * a demo booking and a demo contact message. That must never reach a real
 * database. NODE_ENV alone is not enough: a developer's backend/.env can
 * point DATABASE_URL at the hosted (production) database while NODE_ENV is
 * "development", which is exactly how demo data reached production before.
 *
 * Rules:
 * - never when NODE_ENV=production or on Vercel;
 * - only against a local database, unless SEED_ALLOW_REMOTE_DATABASE=true
 *   is set explicitly (e.g. a disposable staging database);
 * - the demo password is SEED_DEV_PASSWORD (min. 12 chars) or, if unset, a
 *   fresh random one — never a value written in the repository.
 *
 * Returns { ok: true, password, generated } or { ok: false, reason }.
 */
export function checkSeedEnvironment(environment) {
  if (environment.NODE_ENV === 'production' || environment.VERCEL) {
    return { ok: false, reason: 'the demo seed is disabled in production (NODE_ENV=production / Vercel).' };
  }

  const host = databaseHost(environment.DATABASE_URL);
  if (!host) {
    return { ok: false, reason: 'DATABASE_URL is missing or not a valid URL.' };
  }
  if (!LOCAL_DB_HOSTS.has(host) && environment.SEED_ALLOW_REMOTE_DATABASE !== 'true') {
    return {
      ok: false,
      reason:
        'DATABASE_URL points at a non-local database. The demo seed creates an ADMIN account and fake reviews, ' +
        'so it only runs against localhost. For a disposable non-production database set SEED_ALLOW_REMOTE_DATABASE=true.',
    };
  }

  const configured = environment.SEED_DEV_PASSWORD;
  if (configured !== undefined && configured.length < 12) {
    return { ok: false, reason: 'SEED_DEV_PASSWORD must be at least 12 characters.' };
  }
  if (configured) return { ok: true, password: configured, generated: false };
  return { ok: true, password: randomBytes(12).toString('base64url'), generated: true };
}
