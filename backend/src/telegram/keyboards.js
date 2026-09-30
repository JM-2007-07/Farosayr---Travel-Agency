import { getTexts } from './texts.js';

// Callback data sent by the bot's own buttons. handlers.js accepts ONLY
// these shapes — anything else in a callback query is ignored. Every
// action is a public, read-only section; there are no admin buttons.
const CALLBACK_PATTERN = /^(menu:(start|tours|destinations|deals|faq|contact|help)|tours:page:([1-9]\d{0,3}))$/;

export function parseCallbackData(data) {
  const match = CALLBACK_PATTERN.exec(String(data ?? ''));
  if (!match) return null;
  if (match[2]) return { section: match[2], page: 1 };
  return { section: 'tours', page: Number(match[3]) };
}

export function mainMenuKeyboard(lang) {
  const { menu } = getTexts(lang);
  return {
    inline_keyboard: [
      [
        { text: menu.tours, callback_data: 'menu:tours' },
        { text: menu.destinations, callback_data: 'menu:destinations' },
      ],
      [
        { text: menu.deals, callback_data: 'menu:deals' },
        { text: menu.faq, callback_data: 'menu:faq' },
      ],
      [{ text: menu.contact, callback_data: 'menu:contact' }],
    ],
  };
}

export function backToMenuKeyboard(lang) {
  return { inline_keyboard: [[{ text: getTexts(lang).mainMenu, callback_data: 'menu:start' }]] };
}

export function toursPageKeyboard(lang, page, hasNext) {
  const t = getTexts(lang);
  const nav = [];
  if (page > 1) nav.push({ text: t.prev, callback_data: `tours:page:${page - 1}` });
  if (hasNext) nav.push({ text: t.next, callback_data: `tours:page:${page + 1}` });
  return {
    inline_keyboard: [...(nav.length ? [nav] : []), [{ text: t.mainMenu, callback_data: 'menu:start' }]],
  };
}
