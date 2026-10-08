/**
 * Find — and optionally lock — the demo accounts created by prisma/seed.js
 * in an EXISTING database (e.g. production, if the seed was ever run there).
 *
 *   npm run demo:accounts            # report only (default, changes nothing)
 *   npm run demo:accounts -- --lock  # make demo accounts unusable
 *
 * "Lock" replaces each demo account's password hash with the hash of a
 * random value nobody knows, so the publicly documented demo password
 * stops working. Nothing is deleted: reviews/bookings that reference the
 * accounts stay intact (removing demo content is a separate, deliberate
 * decision).
 *
 * Refuses to lock the demo ADMIN when it is the only admin — that would
 * lock everyone out of the admin panel. Promote a real account first
 * (see docs/SECURITY.md, "Demo accounts").
 *
 * Prints emails, roles and counts only — never hashes or passwords.
 */
import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const DEMO_EMAIL_SUFFIX = '@example.test';
const DEMO_ADMIN_EMAIL = 'admin@farosayr.test';
const lock = process.argv.includes('--lock');

const prisma = new PrismaClient();

async function main() {
  const demoUsers = await prisma.user.findMany({
    where: { OR: [{ email: { endsWith: DEMO_EMAIL_SUFFIX } }, { email: DEMO_ADMIN_EMAIL }] },
    select: { id: true, email: true, role: true, _count: { select: { reviews: true, bookings: true } } },
    orderBy: { email: 'asc' },
  });
  const realAdmins = await prisma.user.count({
    where: { role: 'ADMIN', NOT: { id: { in: demoUsers.map((u) => u.id) } } },
  });

  if (demoUsers.length === 0) {
    console.log('No demo accounts found.');
    return;
  }

  console.log(`Demo accounts found: ${demoUsers.length}`);
  for (const u of demoUsers) {
    console.log(`  ${u.role.padEnd(5)}  ${u.email}  (reviews: ${u._count.reviews}, bookings: ${u._count.bookings})`);
  }
  console.log(`Non-demo ADMIN accounts: ${realAdmins}`);

  if (!lock) {
    console.log('\nReport only — nothing changed. Re-run with --lock to disable these logins.');
    return;
  }

  const demoAdmins = demoUsers.filter((u) => u.role === 'ADMIN');
  if (demoAdmins.length && realAdmins === 0) {
    console.error(
      '\nRefusing to lock: the demo admin is the only ADMIN. Promote a real account to ADMIN first ' +
        '(Admin panel → Users), then run this again.'
    );
    process.exitCode = 1;
    return;
  }

  for (const u of demoUsers) {
    const unusableHash = await bcrypt.hash(randomBytes(32).toString('base64url'), 12);
    await prisma.user.update({ where: { id: u.id }, data: { passwordHash: unusableHash } });
  }
  console.log(`\nLocked ${demoUsers.length} demo account(s): their known password no longer works.`);
}

main()
  .catch((err) => {
    console.error('demo-accounts failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
