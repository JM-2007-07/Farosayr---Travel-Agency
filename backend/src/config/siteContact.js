/**
 * Public Farosayr contact details, used by the Telegram bot's /contact.
 *
 * Mirrors frontend/src/config/siteContact.js (phone, email, working hours,
 * social links) and the localized `contact.officeAddress` strings in
 * frontend/src/i18n/locales/*\/translation.json — those remain the source
 * of truth for the website. The backend is deployed as a separate Vercel
 * project and can't import frontend code, so when the agency's contact
 * details change, update both places.
 *
 * Only public information belongs here — nothing that isn't already shown
 * on the website.
 */
export const siteContact = {
  phone: '+992 11 211 33 77',
  email: 'farosayrtour@mail.ru',
  officeAddress: {
    ru: 'Республика Таджикистан, город Душанбе, здание «Шарқи Озод»',
    tj: 'Ҷумҳурии Тоҷикистон, шаҳри Душанбе, бинои «Шарқи Озод»',
    en: 'Sharqi Ozod Building, Dushanbe, Republic of Tajikistan',
  },
  workingHours: { from: 9, to: 19 },
  socialLinks: {
    instagram: 'https://www.instagram.com/farosayragency?igsh=aGk4YWJvc2s5M3cw',
    facebook: 'https://www.facebook.com/share/1EVedLvKDL/',
  },
};
