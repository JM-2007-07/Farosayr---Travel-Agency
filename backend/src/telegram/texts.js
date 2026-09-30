// User-facing bot strings. Same languages and default as the website
// (frontend/src/i18n: ru default, tj, en); section names and several
// phrases are reused verbatim from the website's translation files so the
// bot and the site use the same wording.
//
// Strings here are static and trusted — they may contain HTML tags.
// Anything dynamic must be escaped by the caller (see format.js).

export const DEFAULT_LANGUAGE = 'ru';

// Telegram sends the user's client language as an IETF tag ("ru", "en",
// "en-US", "tg" — ISO 639-1 for Tajik; the website calls it "tj").
export function resolveLanguage(languageCode) {
  const base = String(languageCode ?? '').toLowerCase().split('-')[0];
  if (base === 'tg') return 'tj';
  if (base === 'en') return 'en';
  return DEFAULT_LANGUAGE;
}

const TEXTS = {
  ru: {
    menu: {
      tours: '🌍 Туры',
      destinations: '🏝 Направления',
      deals: '💰 Горящие предложения',
      faq: '❓ Вопросы',
      contact: '📞 Контакты',
    },
    welcome:
      '👋 <b>Добро пожаловать в FaroSayr!</b>\n\nМы поможем подобрать подходящий тур и ответим на ваши вопросы.\n\nВыберите раздел:',
    help: [
      '<b>Что умеет этот бот:</b>',
      '',
      '/tours — туры',
      '/destinations — направления',
      '/deals — горящие предложения',
      '/faq — частые вопросы',
      '/contact — контакты FaroSayr',
      '/start — главное меню',
    ].join('\n'),
    unknown: 'Я пока не понял ваш запрос.\n\nПожалуйста, выберите один из разделов:',
    error: 'Не удалось загрузить данные. Попробуйте позже.',
    toursTitle: (page) => `🌍 <b>Туры</b>${page > 1 ? ` — стр. ${page}` : ''}`,
    noTours: 'Сейчас нет доступных туров. Загляните позже или свяжитесь с нами: /contact',
    destinationsTitle: '🏝 <b>Направления</b>',
    noDestinations: 'Направления пока не добавлены.',
    dealsTitle: '💰 <b>Горящие предложения</b>',
    noDeals: 'Сейчас нет активных предложений. Загляните позже!',
    faqTitle: '❓ <b>Частые вопросы</b>',
    noFaq: 'Раздел вопросов пока пуст. Задайте вопрос менеджеру: /contact',
    contactTitle: '📞 <b>Свяжитесь с нами</b>',
    from: 'от',
    until: 'до',
    learnMore: 'Подробнее',
    moreOnSite: 'Смотреть все на сайте',
    phone: 'Телефон',
    email: 'Email',
    address: 'Адрес',
    workingHours: (from, to) => `Пн–Сб: ${from}:00–${to}:00`,
    website: 'Сайт',
    prev: '⬅️ Назад',
    next: 'Далее ➡️',
    mainMenu: '🏠 Меню',
  },

  tj: {
    menu: {
      tours: '🌍 Турҳо',
      destinations: '🏝 Самтҳо',
      deals: '💰 Пешниҳодҳои махсус',
      faq: '❓ Саволҳо',
      contact: '📞 Тамос',
    },
    welcome:
      '👋 <b>Хуш омадед ба FaroSayr!</b>\n\nМо ба шумо дар интихоби тури мувофиқ кӯмак мекунем ва ба саволҳоятон ҷавоб медиҳем.\n\nБахшро интихоб кунед:',
    help: [
      '<b>Имкониятҳои ин бот:</b>',
      '',
      '/tours — турҳо',
      '/destinations — самтҳо',
      '/deals — пешниҳодҳои махсус',
      '/faq — саволҳои маъмул',
      '/contact — тамос бо FaroSayr',
      '/start — менюи асосӣ',
    ].join('\n'),
    unknown: 'Дархости шуморо ҳоло нафаҳмидам.\n\nЛутфан, яке аз бахшҳоро интихоб кунед:',
    error: 'Маълумот бор нашуд. Лутфан, баъдтар боз кӯшиш кунед.',
    toursTitle: (page) => `🌍 <b>Турҳо</b>${page > 1 ? ` — саҳ. ${page}` : ''}`,
    noTours: 'Ҳоло турҳои дастрас нестанд. Баъдтар ворид шавед ё бо мо тамос гиред: /contact',
    destinationsTitle: '🏝 <b>Самтҳо</b>',
    noDestinations: 'Ҳоло самтҳо илова нашудаанд.',
    dealsTitle: '💰 <b>Пешниҳодҳои махсус</b>',
    noDeals: 'Ҳоло пешниҳодҳои фаъол нестанд. Баъдтар ворид шавед!',
    faqTitle: '❓ <b>Саволҳои маъмул</b>',
    noFaq: 'Ҳоло саволҳо нестанд. Саволи худро ба менеҷер диҳед: /contact',
    contactTitle: '📞 <b>Бо мо тамос гиред</b>',
    from: 'аз',
    until: 'то',
    learnMore: 'Муфассал',
    moreOnSite: 'Ҳамаро дар сайт бинед',
    phone: 'Телефон',
    email: 'Email',
    address: 'Суроға',
    workingHours: (from, to) => `Душанбе–шанбе: ${from}:00–${to}:00`,
    website: 'Сайт',
    prev: '⬅️ Қаблӣ',
    next: 'Баъдӣ ➡️',
    mainMenu: '🏠 Меню',
  },

  en: {
    menu: {
      tours: '🌍 Tours',
      destinations: '🏝 Destinations',
      deals: '💰 Hot Deals',
      faq: '❓ FAQ',
      contact: '📞 Contact',
    },
    welcome:
      '👋 <b>Welcome to FaroSayr!</b>\n\nWe can help you find a suitable tour and answer your questions.\n\nChoose an option below:',
    help: [
      '<b>What this bot can do:</b>',
      '',
      '/tours — tours',
      '/destinations — destinations',
      '/deals — hot deals',
      '/faq — frequently asked questions',
      '/contact — contact FaroSayr',
      '/start — main menu',
    ].join('\n'),
    unknown: "I didn't understand your request yet.\n\nPlease choose one of the options below:",
    error: "We couldn't load this content. Please try again later.",
    toursTitle: (page) => `🌍 <b>Tours</b>${page > 1 ? ` — page ${page}` : ''}`,
    noTours: 'There are no tours available right now. Check back later or contact us: /contact',
    destinationsTitle: '🏝 <b>Destinations</b>',
    noDestinations: 'No destinations have been added yet.',
    dealsTitle: '💰 <b>Hot Deals</b>',
    noDeals: 'There are no active deals right now. Check back soon!',
    faqTitle: '❓ <b>Frequently asked questions</b>',
    noFaq: 'No questions yet. Ask a manager: /contact',
    contactTitle: '📞 <b>Get in touch</b>',
    from: 'from',
    until: 'until',
    learnMore: 'Learn more',
    moreOnSite: 'See all on the website',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    workingHours: (from, to) => `Mon–Sat: ${from}:00–${to}:00`,
    website: 'Website',
    prev: '⬅️ Back',
    next: 'Next ➡️',
    mainMenu: '🏠 Menu',
  },
};

export function getTexts(lang) {
  return TEXTS[lang] ?? TEXTS[DEFAULT_LANGUAGE];
}
