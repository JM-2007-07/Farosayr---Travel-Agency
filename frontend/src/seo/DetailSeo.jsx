import { useTranslation } from 'react-i18next';
import Seo from './Seo';
import { SITE_NAME, SITE_URL, absoluteUrl, buildBreadcrumbs } from './site';

// Meta descriptions over ~160 chars get cut off in results anyway; cut at a
// word boundary so the snippet doesn't end mid-word.
function clip(text, max = 160) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 0 ? cut.lastIndexOf(' ') : cut.length)}…`;
}

const ORGANIZATION_REF = { '@id': `${SITE_URL}/#organization` };

/**
 * Shared loading / not-found handling for data-driven detail pages:
 * while loading, the URL is still the canonical one; once the API says
 * the record doesn't exist, the page turns noindex (a soft 404).
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

export function TourSeo({ status, tour, slug }) {
  const path = `/tours/${encodeURIComponent(slug)}`;
  return (
    <DetailSeo
      status={status}
      record={tour}
      path={path}
      build={(tour, t) => {
        const url = absoluteUrl(path);
        const images = (tour.images ?? []).map((image) => image.url).filter(Boolean);
        return {
          title: t('seo.tourTitle', { title: tour.title }),
          description: clip(
            t('seo.tourDescription', {
              description: tour.description ?? '',
              location: tour.location ?? '',
              duration: tour.duration ?? '',
            })
          ),
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
      }}
    />
  );
}

export function DestinationSeo({ status, destination, slug }) {
  const path = `/destinations/${encodeURIComponent(slug)}`;
  return (
    <DetailSeo
      status={status}
      record={destination}
      path={path}
      build={(destination, t) => ({
        title: t('seo.destinationTitle', { name: destination.title }),
        description: clip(
          t('seo.destinationDescription', {
            name: destination.title,
            description: destination.description ?? '',
          })
        ),
        jsonLd: {
          '@graph': [
            {
              '@type': 'TouristDestination',
              name: destination.title,
              description: destination.description,
              url: absoluteUrl(path),
              ...(destination.image ? { image: destination.image } : {}),
            },
            buildBreadcrumbs([
              { name: t('seo.home'), path: '/' },
              { name: t('navigation.destinations'), path: '/destinations' },
              { name: destination.title, path },
            ]),
          ],
        },
      })}
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
