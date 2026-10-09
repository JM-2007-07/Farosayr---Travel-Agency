/**
 * Guard for development-only Prisma commands (`npm run prisma:migrate` =
 * `prisma migrate dev`). `migrate dev` may offer to RESET the database when
 * it detects drift — harmless locally, catastrophic on production. It
 * therefore only runs against a local DATABASE_URL.
 *
 * Production migrations use `npm run prisma:migrate:deploy`
 * (`prisma migrate deploy`) — see docs/DEPLOYMENT.md.
 */
import 'dotenv/config';
import { isLocalDatabaseUrl } from '../prisma/seed-guard.js';

if (!isLocalDatabaseUrl(process.env.DATABASE_URL)) {
  console.error(
    'Refusing: DATABASE_URL is not a local database. `prisma migrate dev` is for local development only.\n' +
      'For production use `npm run prisma:migrate:deploy` (see docs/DEPLOYMENT.md).'
  );
  process.exit(1);
}
