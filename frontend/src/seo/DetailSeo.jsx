import { useTranslation } from 'react-i18next';
import Seo from './Seo';
import { SITE_NAME, buildBreadcrumbs } from './site';
import { buildDestinationMeta, buildTourMeta, clip, destinationPath, tourPath } from './detailMeta';

/**
 * Shared loading / not-found handling for data-driven detail pages:
 * while loading, the URL is still the canonical one; once the API says
 * the record doesn't exist, the page turns noindex (a soft 404) — and
 * noindex pages carry no canonical.
 */
function DetailSeo({ status, record, path, build }) {
  const { t } = useTranslation();

  if (status === 'success' && !record) {
    return <Seo page="notFound" noindex />;
  }
  if (status !== 'success') {
    return <Seo title={SITE_NAME} description={t('seo.pages.home.description')} path={path} />;
  }
  return <Seo {...build(record, t)} path={path} />;
}

// Tour / destination metadata comes from seo/detailMeta.js — the same
// builders write the static HTML shells at build time (vite.config.js).
export function TourSeo({ status, tour, slug }) {
  return <DetailSeo status={status} record={tour} path={tourPath(slug)} build={buildTourMeta} />;
}

export function DestinationSeo({ status, destination, slug }) {
  return (
    <DetailSeo
      status={status}
      record={destination}
      path={destinationPath(slug)}
      // The app maps the API's `name` to `title`.
      build={(d, t) => buildDestinationMeta({ ...d, name: d.title, slug: d.slug ?? slug }, t)}
    />
  );
}

export function DealSeo({ status, deal, id }) {
  const path = `/deals/${encodeURIComponent(id)}`;
  return (
    <DetailSeo
      status={status}
      record={deal}
      path={path}
      build={(deal, t) => ({
        title: t('seo.dealTitle', { title: deal.title }),
        description: clip(t('seo.dealDescription', { description: deal.description ?? '' })),
        // An expired offer stays reachable for anyone holding the link, but
        // shouldn't be served from search.
        noindex: deal.hours <= 0,
        jsonLd: buildBreadcrumbs([
          { name: t('seo.home'), path: '/' },
          { name: t('navigation.deals'), path: '/deals' },
          { name: deal.title, path },
        ]),
      })}
    />
  );
}
