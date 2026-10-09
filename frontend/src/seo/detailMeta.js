// Metadata for tour and destination detail pages, built from API records.
//
// Plain JS (no React, no i18next) on purpose: the browser uses it through
// DetailSeo.jsx with i18next's `t`, and vite.config.js uses it at build time
// with a tiny `t` over the Russian translations to write the static HTML
// shells (tours/<slug>.html, destinations/<slug>.html). Same function on
// both sides, so the HTML a crawler or a link preview gets matches what the
// app sets after it loads.
import { SITE_URL, absoluteUrl, buildBreadcrumbs, ogImageFor } from './site.js';

const ORGANIZATION_REF = { '@id': `${SITE_URL}/#organization` };

// Meta descriptions over ~160 chars get cut off in results anyway; cut at a
// word boundary so the snippet doesn't end mid-word.
export function clip(text, max = 160) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

export const tourPath = (slug) => `/tours/${encodeURIComponent(slug)}`;
export const destinationPath = (slug) => `/destinations/${encodeURIComponent(slug)}`;

/**
 * tour: { slug, title, description, location, duration, price, images: [{ url }] }
 * Returns props for <Seo>: { path, title, description, image, jsonLd }.
 */
export function buildTourMeta(tour, t) {
  const path = tourPath(tour.slug);
  const url = absoluteUrl(path);
  const images = (tour.images ?? []).map((image) => image?.url).filter(Boolean);
  return {
    path,
    title: t('seo.tourTitle', { title: tour.title }),
    description: clip(
      t('seo.tourDescription', {
        description: tour.description ?? '',
        location: tour.location ?? '',
        duration: tour.duration ?? '',
      })
    ),
    image: images[0] ? ogImageFor(images[0]) : null,
    jsonLd: {
      '@graph': [
        {
          '@type': 'TouristTrip',
          name: tour.title,
          description: tour.description,
          url,
          ...(images.length ? { image: images } : {}),
          provider: ORGANIZATION_REF,
          ...(tour.price != null
            ? {
                offers: {
                  '@type': 'Offer',
                  price: String(tour.price),
                  priceCurrency: 'USD',
                  url,
                  offeredBy: ORGANIZATION_REF,
                },
              }
            : {}),
        },
        buildBreadcrumbs([
          { name: t('seo.home'), path: '/' },
          { name: t('navigation.tours'), path: '/tours' },
          { name: tour.title, path },
        ]),
      ],
    },
  };
}

/**
 * destination: { slug, name, description, image } — `name` is the API field
 * (the app maps it to `title`).
 */
export function buildDestinationMeta(destination, t) {
  const path = destinationPath(destination.slug);
  return {
    path,
    title: t('seo.destinationTitle', { name: destination.name }),
    description: clip(
      t('seo.destinationDescription', {
        name: destination.name,
        description: destination.description ?? '',
      })
    ),
    image: destination.image ? ogImageFor(destination.image) : null,
    jsonLd: {
      '@graph': [
        {
          '@type': 'TouristDestination',
          name: destination.name,
          description: destination.description,
          url: absoluteUrl(path),
          ...(destination.image ? { image: destination.image } : {}),
        },
        buildBreadcrumbs([
          { name: t('seo.home'), path: '/' },
          { name: t('navigation.destinations'), path: '/destinations' },
          { name: destination.name, path },
        ]),
      ],
    },
  };
}
