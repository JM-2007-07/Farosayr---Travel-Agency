import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_OG_IMAGE, OG_LOCALES, SITE_NAME, absoluteUrl } from './site';

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (content == null || content === '') {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!href) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// Page-level JSON-LD only. The site-wide TravelAgency/WebSite graph is
// written into the static HTML by vite.config.js and never touched here.
function upsertPageJsonLd(data) {
  let el = document.head.querySelector('script[type="application/ld+json"][data-seo="page"]');
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.dataset.seo = 'page';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify({ '@context': 'https://schema.org', ...data });
}

/**
 * Per-route document metadata for the SPA. The initial HTML for every
 * static route already carries the same tags (see vite.config.js); this
 * keeps them correct across client-side navigation, language switches and
 * data-driven pages (tour/destination/deal details).
 *
 * Either pass `page` (a key under seo.pages.* in the translations) or an
 * explicit `title`/`description`. `path` is the canonical path; omit it for
 * pages that must not be indexed.
 */
export default function Seo({
  page,
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd = null,
}) {
  const { t, i18n } = useTranslation();

  const finalTitle = title ?? (page ? t(`seo.pages.${page}.title`) : SITE_NAME);
  const finalDescription =
    description ?? (page ? t(`seo.pages.${page}.description`) : t('seo.pages.home.description'));
  const url = !noindex && path ? absoluteUrl(path) : null;
  const imageUrl = absoluteUrl(image);
  const jsonLdKey = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    document.title = finalTitle;
    upsertMeta('name', 'description', finalDescription);
    upsertMeta('name', 'robots', noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large');
    upsertCanonical(url);

    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:title', finalTitle);
    upsertMeta('property', 'og:description', finalDescription);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', imageUrl);
    upsertMeta('property', 'og:locale', OG_LOCALES[i18n.language] ?? OG_LOCALES.ru);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', finalTitle);
    upsertMeta('name', 'twitter:description', finalDescription);
    upsertMeta('name', 'twitter:image', imageUrl);

    upsertPageJsonLd(jsonLdKey ? JSON.parse(jsonLdKey) : null);
  }, [finalTitle, finalDescription, url, imageUrl, type, noindex, jsonLdKey, i18n.language]);

  return null;
}
