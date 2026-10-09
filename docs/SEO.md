# Farosayr — SEO

How search engines and link previews see farosayr.com, where the metadata
comes from, and what to check after a deploy. Accessibility of navigation:
[ACCESSIBILITY.md](ACCESSIBILITY.md). Performance: [PERFORMANCE.md](PERFORMANCE.md).

## 1. Architecture

The site is a React SPA on Vercel (`cleanUrls: true`, `trailingSlash: false`).
Metadata exists in two places that are built from the **same** sources:

| Where | What | Source |
|---|---|---|
| Static HTML (build) | One file per route with a complete `<head>` | `frontend/vite.config.js` (`seoPlugin`) |
| Runtime (browser) | Keeps the head correct on SPA navigation, language switch and after data loads | `src/seo/Seo.jsx`, `src/seo/DetailSeo.jsx` |

Shared, React-free modules used by both:

- `src/seo/site.js` — `SITE_URL`, default OG image, `ogImageFor()`, the
  TravelAgency + WebSite graph, breadcrumbs.
- `src/seo/detailMeta.js` — title / description / og:image / JSON-LD for a
  tour or destination.
- `src/seo/routes.js` — static routes, which are noindex, which go into the
  sitemap.
- Texts: `seo.*` in `src/i18n/locales/{ru,tj,en}/translation.json` (the
  build uses the Russian ones).

`index.html` contains **no** title/description/canonical/OG tags — only the
`<!-- seo:head -->` marker the plugin replaces. Adding tags there again would
give every page two conflicting sets.

## 2. Build output

`npm run build` writes into `dist/`:

| File | Served for | Head |
|---|---|---|
| `index.html` | `/` | Home, canonical `/` |
| `tours.html`, `destinations.html`, `deals.html`, `about.html`, `contact.html`, `reviews.html`, `gallery.html` | the route | Own title/description, canonical, index |
| `booking.html`, `login.html`, `register.html`, `profile.html`, `bookings.html`, `favorites.html` | the route | `noindex, follow`, **no canonical** |
| `tours/<slug>.html`, `destinations/<slug>.html` | each tour / destination that existed at build time | Real title, description, canonical, `og:image` (the photo at 1200×630), TouristTrip / TouristDestination + BreadcrumbList |
| `spa.html` | rewrites (new slugs, `/deals/:id`, `/admin/*`) | Generic, no canonical, no robots tag — the page sets everything after loading |
| `404.html` | unknown paths (HTTP 404) | `noindex`, no canonical |
| `sitemap.xml`, `robots.txt` | — | §4 |

Tours and destinations are read from `VITE_API_URL` (`GET /tours`,
`GET /destinations`) **once per build**, for both the sitemap and the
shells. If the API can't be reached the build still succeeds (with a
warning): no detail shells, static sitemap only, detail pages fall back to
`spa.html`. Only plain slugs (`a-z0-9-`) become file names.

A tour renamed after the build keeps its old title in the static HTML until
the next build; the page itself shows and sets the current data.

## 3. Indexing rules

| Route | Index | In sitemap |
|---|---|---|
| `/`, `/tours`, `/destinations`, `/deals`, `/about`, `/contact`, `/reviews`, `/gallery` | yes | yes |
| `/tours/:slug`, `/destinations/:slug` | yes | yes |
| `/deals/:id` | yes while the offer is current, `noindex` when expired | no (offers live for hours) |
| `/booking`, `/login`, `/register`, `/profile`, `/bookings`, `/favorites` | `noindex, follow` | no |
| `/admin/*` | `noindex` + `Disallow` | no |
| not found (unknown path, missing tour/destination/deal) | `noindex` (soft 404 for records) | no |
| `/spa` (internal shell) | `Disallow` | no |

Private pages are **not** disallowed in robots.txt on purpose: a crawler
has to fetch them to see their `noindex`.

Query strings (`/tours?destination=…`) keep the canonical of the base page.

## 4. robots.txt and sitemap.xml

Generated at build time (`SITE_URL` is the only place the domain lives):

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /spa

Sitemap: https://farosayr.com/sitemap.xml
```

`sitemap.xml`: the 8 indexable static routes + every tour and destination
from the API, with `lastmod` from `updatedAt`.

## 5. Languages and hreflang

Russian, Tajik and English share **one URL per page**; the language lives
in `localStorage`, so crawlers get the Russian version. `<html lang>`,
title, description and `og:locale` follow the selected language in the
browser.

There is deliberately **no hreflang**: hreflang has to point at URLs that
return that language, and there are none. Adding it would either point all
three languages at the same URL (ignored) or promise URLs that don't exist.
Real multilingual SEO needs language URLs (`/en/...`, `/tj/...`) — a routing
change planned separately.

## 6. Structured data (JSON-LD)

| Type | Page | Data |
|---|---|---|
| `TravelAgency` + `WebSite` | every page (`data-seo="site"`) | name, logo, phone, email, address, geo, hours, social profiles — all from `config/siteContact.js` |
| `TouristTrip` (+ `Offer` with price in USD) + `BreadcrumbList` | tour details | title, description, photos, price |
| `TouristDestination` + `BreadcrumbList` | destination details | name, description, photo |
| `BreadcrumbList` | deal details | title |

Not used on purpose: `AggregateRating` / `Review` (reviews about the
business on its own site aren't eligible for rich results), `Product`.

## 7. Open Graph / Twitter

Every page: `og:type`, `og:site_name`, `og:title`, `og:description`,
`og:url` (indexable pages only), `og:image` (+ width/height when known,
alt), `og:locale`, `twitter:card=summary_large_image`, title, description,
image. Default image: `public/og-image.jpg` (1200×630). Tours and
destinations use their own photo, requested from Unsplash at 1200×630.

## 8. SPA navigation

`components/common/RouteAnnouncer.jsx`: after a client-side route change
(not the first load, not `#hash` links, not query-only changes) focus moves
to `<main>` and the new page title is announced once in a polite live
region. See ACCESSIBILITY.md.

## 9. Hosting (vercel.json)

- Detail URLs are rewritten to the fallback shell; files that exist
  (`tours/<slug>.html` etc.) are served first.
- **Known production problem (2026-10-07):** production's rewrite
  destination is `/spa.html`; with `cleanUrls` it answers
  `/tours/<slug>`, `/destinations/<slug>`, `/deals/<id>` and `/admin` with
  **HTTP 404** (+ the noindex 404 page), while `/spa` answers 200. The
  `upgrade` branch (commit `1b7f8cf`) uses `/spa`. This must be verified on
  a **Preview** deployment before it reaches production (§10).
- `farosayr-t-a-frontend.vercel.app` currently answers 200 instead of
  redirecting (the host redirect in vercel.json doesn't apply there);
  canonical tags point to farosayr.com, so it's not a duplicate-content
  risk, but check after the next deploy.

## 10. After a deploy — checklist

On the Preview URL first, then production:

1. `curl -I <host>/tours/<slug>` and `/destinations/<slug>` → **200**;
   `/deals/<id>`, `/admin` → 200; `/no-such-page` → 404.
2. View source of `/tours/<slug>`: one `<title>` with the tour name, one
   canonical `https://farosayr.com/tours/<slug>`, `og:image` = tour photo.
3. `/robots.txt` and `/sitemap.xml` as in §4; every sitemap URL → 200.
4. Share a tour link in Telegram → preview with the tour title and photo.
5. Rich Results Test / Schema validator on a tour page.
6. Google Search Console and Yandex.Webmaster: (re)submit the sitemap,
   inspect a tour URL. (Verification needs the owner's tokens — not in the
   repo.)

## 11. Not done (later)

- Language URLs + hreflang (routing change).
- Full prerendering of page content (helps Yandex, which renders JS only
  partly) — larger change, separate decision.
- Manifest and icons: see [PWA.md](PWA.md).
- `twitter:site` — no X account.
