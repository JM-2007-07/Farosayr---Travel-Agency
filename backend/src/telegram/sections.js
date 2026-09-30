import { env } from '../config/env.js';
import { siteContact } from '../config/siteContact.js';
import { findTours } from '../services/tours.service.js';
import { findDestinations } from '../services/destinations.service.js';
import { findActiveDeals } from '../services/deals.service.js';
import { findActiveFaq } from '../services/faq.service.js';
import { getTexts } from './texts.js';
import { mainMenuKeyboard, backToMenuKeyboard, toursPageKeyboard } from './keyboards.js';
import { escapeHtml, truncate, link, formatUsd, formatDate, joinBlocks } from './format.js';

/**
 * One builder per public bot section. Each returns { text, replyMarkup }
 * and reads data ONLY through the same services the website API uses —
 * no Prisma queries here, and nothing that isn't already public on the
 * website (no contacts, bookings, users or admin data).
 */

const TOURS_PAGE_SIZE = 5;
const DESTINATIONS_LIMIT = 10;
const DEALS_LIMIT = 5;
const FAQ_ANSWER_MAX = 400;

const siteUrl = (path) => `${env.clientUrl}${path}`;

function start(lang) {
  return { text: getTexts(lang).welcome, replyMarkup: mainMenuKeyboard(lang) };
}

function help(lang) {
  return { text: getTexts(lang).help, replyMarkup: mainMenuKeyboard(lang) };
}

function unknown(lang) {
  return { text: getTexts(lang).unknown, replyMarkup: mainMenuKeyboard(lang) };
}

async function tours(lang, { page = 1 } = {}) {
  const t = getTexts(lang);
  // One extra row tells us whether a next page exists without a COUNT query.
  const items = await findTours({}, { skip: (page - 1) * TOURS_PAGE_SIZE, take: TOURS_PAGE_SIZE + 1 });
  const hasNext = items.length > TOURS_PAGE_SIZE;
  const pageItems = items.slice(0, TOURS_PAGE_SIZE);

  if (pageItems.length === 0) {
    return { text: t.noTours, replyMarkup: page > 1 ? toursPageKeyboard(lang, page, false) : backToMenuKeyboard(lang) };
  }

  const blocks = pageItems.map((tour) =>
    [
      `<b>${escapeHtml(truncate(tour.title, 120))}</b>`,
      `📍 ${escapeHtml(truncate(tour.location, 80))} · ⏱ ${escapeHtml(truncate(tour.duration, 40))}`,
      `💵 ${t.from} ${formatUsd(tour.price)}`,
      `🔗 ${link(siteUrl(`/tours/${encodeURIComponent(tour.slug)}`), t.learnMore)}`,
    ].join('\n')
  );
  return {
    text: joinBlocks(t.toursTitle(page), blocks, link(siteUrl('/tours'), t.moreOnSite)),
    replyMarkup: toursPageKeyboard(lang, page, hasNext),
  };
}

async function destinations(lang) {
  const t = getTexts(lang);
  const items = await findDestinations({ take: DESTINATIONS_LIMIT });
  if (items.length === 0) return { text: t.noDestinations, replyMarkup: backToMenuKeyboard(lang) };

  const blocks = items.map((d) =>
    [
      `<b>${escapeHtml(truncate(d.name, 100))}</b>`,
      escapeHtml(truncate(d.description, 160)),
      `🔗 ${link(siteUrl(`/destinations/${encodeURIComponent(d.slug)}`), t.learnMore)}`,
    ].join('\n')
  );
  return {
    text: joinBlocks(t.destinationsTitle, blocks, link(siteUrl('/destinations'), t.moreOnSite)),
    replyMarkup: backToMenuKeyboard(lang),
  };
}

async function deals(lang) {
  const t = getTexts(lang);
  const items = await findActiveDeals({ take: DEALS_LIMIT });
  if (items.length === 0) return { text: t.noDeals, replyMarkup: backToMenuKeyboard(lang) };

  const blocks = items.map((deal) =>
    [
      `<b>${escapeHtml(truncate(deal.title, 120))}</b> · -${deal.discount}%`,
      `💵 <b>${formatUsd(deal.price)}</b> <s>${formatUsd(deal.oldPrice)}</s>`,
      `⏳ ${t.until} ${formatDate(deal.endsAt, lang)}`,
      `🔗 ${link(siteUrl(`/deals/${encodeURIComponent(deal.id)}`), t.learnMore)}`,
    ].join('\n')
  );
  return {
    text: joinBlocks(t.dealsTitle, blocks, link(siteUrl('/deals'), t.moreOnSite)),
    replyMarkup: backToMenuKeyboard(lang),
  };
}

async function faq(lang) {
  const t = getTexts(lang);
  const items = await findActiveFaq();
  if (items.length === 0) return { text: t.noFaq, replyMarkup: backToMenuKeyboard(lang) };

  const blocks = items.map(
    (item) => `❔ <b>${escapeHtml(truncate(item.question, 200))}</b>\n${escapeHtml(truncate(item.answer, FAQ_ANSWER_MAX))}`
  );
  return { text: joinBlocks(t.faqTitle, blocks), replyMarkup: backToMenuKeyboard(lang) };
}

function contact(lang) {
  const t = getTexts(lang);
  const { phone, email, officeAddress, workingHours, socialLinks } = siteContact;
  const lines = [
    t.contactTitle,
    '',
    `📞 ${t.phone}: ${escapeHtml(phone)}`,
    `📧 ${t.email}: ${escapeHtml(email)}`,
    `📍 ${t.address}: ${escapeHtml(officeAddress[lang] ?? officeAddress.ru)}`,
    `🕘 ${escapeHtml(t.workingHours(workingHours.from, workingHours.to))}`,
    '',
    `🌐 ${link(env.clientUrl, t.website)}`,
    ...(socialLinks.instagram ? [`📷 ${link(socialLinks.instagram, 'Instagram')}`] : []),
    ...(socialLinks.facebook ? [`👍 ${link(socialLinks.facebook, 'Facebook')}`] : []),
  ];
  return { text: lines.join('\n'), replyMarkup: backToMenuKeyboard(lang) };
}

const BUILDERS = { start, help, unknown, tours, destinations, deals, faq, contact };

export async function buildSection(section, lang, options) {
  const builder = BUILDERS[section] ?? unknown;
  return builder(lang, options);
}
