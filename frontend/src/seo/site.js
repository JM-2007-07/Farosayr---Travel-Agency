// Site-wide SEO constants and schema.org builders.
//
// Plain JS with no browser/React imports on purpose: vite.config.js imports
// this module at build time to write the per-route HTML shells and the
// sitemap, and the app imports it at runtime — one source for both.
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  OFFICE_LAT,
  OFFICE_LNG,
  SOCIAL_LINKS,
  WORKING_HOURS,
} from '../config/siteContact.js';

export const SITE_URL = 'https://farosayr.com';
export const SITE_NAME = 'Farosayr';
export const SITE_ALT_NAMES = ['Фаросайр', 'Farosayr Travel', 'FaroSayr'];
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const LOGO_URL = `${SITE_URL}/icon-512.png`;

// i18n language code -> og:locale.
export const OG_LOCALES = { ru: 'ru_RU', en: 'en_US', tj: 'tg_TJ' };

export function absoluteUrl(path = '/') {
  if (/^https?:\/\//.test(path)) return path;
  if (path === '/' || path === '') return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function cleanProfileUrl(url) {
  // Drop tracking params like Instagram's ?igsh= so the profile URL is stable.
  try {
    const u = new URL(url);
    u.search = '';
    return u.toString();
  } catch {
    return url;
  }
}

function toTime(hour) {
  return `${String(hour).padStart(2, '0')}:00`;
}

const SAME_AS = Object.values(SOCIAL_LINKS).filter(Boolean).map(cleanProfileUrl);

/**
 * TravelAgency + WebSite graph. Every value comes from config/siteContact.js
 * (address, phone, email, hours, coordinates, social profiles) — nothing
 * here is invented. `description` is passed in so it stays in sync with the
 * homepage meta description.
 */
export function buildSiteGraph(description) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'TravelAgency',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAMES,
        url: `${SITE_URL}/`,
        logo: { '@type': 'ImageObject', url: LOGO_URL, width: 512, height: 512 },
        image: DEFAULT_OG_IMAGE,
        description,
        telephone: CONTACT_PHONE.replace(/\s+/g, ''),
        email: CONTACT_EMAIL,
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'здание «Шарқи Озод»',
          addressLocality: 'Душанбе',
          addressCountry: 'TJ',
        },
        geo: { '@type': 'GeoCoordinates', latitude: OFFICE_LAT, longitude: OFFICE_LNG },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: toTime(WORKING_HOURS.from),
            closes: toTime(WORKING_HOURS.to),
          },
        ],
        areaServed: { '@type': 'Country', name: 'Tajikistan' },
        sameAs: SAME_AS,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAMES,
        url: `${SITE_URL}/`,
        inLanguage: 'ru',
        publisher: { '@id': `${SITE_URL}/#organization` },
      },
    ],
  };
}

/** items: [{ name, path }] from the homepage down to the current page. */
export function buildBreadcrumbs(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
