import { prisma } from '../config/database.js';

export async function listFaq(req, res) {
  const faq = await prisma.fAQ.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], // id tiebreaker for deterministic order
  });
  res.status(200).json({ success: true, data: faq });
}
