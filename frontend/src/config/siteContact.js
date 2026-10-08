export const OFFICE_ADDRESS =
  'Республика Таджикистан, город Душанбе, здание «Шарқи Озод»';

export const OFFICE_LAT = 38.5594;
export const OFFICE_LNG = 68.7651;

export const CONTACT_PHONE = '+992 11 211 33 77';
export const CONTACT_EMAIL = 'farosayrtour@mail.ru';

export const WORKING_HOURS = {
  days: 'Пн–Сб',
  from: 9,
  to: 19,
  label: 'Пн–Сб: 9:00–19:00',
};

export const SOCIAL_LINKS = {
  instagram: 'https://www.instagram.com/farosayragency?igsh=aGk4YWJvc2s5M3cw',
  facebook: 'https://www.facebook.com/share/1EVedLvKDL/',
  telegram: 'https://t.me/farosayragency',
  whatsapp: '',
};

// Derived links — built here once so the header, footer, contact page and
// homepage contact section can't drift apart.
export const PHONE_HREF = `tel:${CONTACT_PHONE.replace(/\s/g, '')}`;
export const EMAIL_HREF = `mailto:${CONTACT_EMAIL}`;
// No dedicated WhatsApp link is configured yet, so the office number is
// used (same fallback the contact page already relied on).
export const WHATSAPP_URL = SOCIAL_LINKS.whatsapp || `https://wa.me/${CONTACT_PHONE.replace(/\D/g, '')}`;
export const YANDEX_MAPS_URL = `https://yandex.ru/maps/?ll=${OFFICE_LNG},${OFFICE_LAT}&z=17&pt=${OFFICE_LNG},${OFFICE_LAT},pm2rdm`;
