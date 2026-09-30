import { findActiveFaq } from '../services/faq.service.js';

export async function listFaq(req, res) {
  const faq = await findActiveFaq();
  res.status(200).json({ success: true, data: faq });
}
