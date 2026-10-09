import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { STATIC_ROUTES } from './src/seo/routes.js';
import {
  DEFAULT_OG_IMAGE_META,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  buildSiteGraph,
} from './src/seo/site.js';
import { buildDestinationMeta, buildTourMeta } from './src/seo/detailMeta.js';

// Tailwind's Vite plugin is intentionally NOT registered here.
// Per the architecture decision in MIGRATION_PLAN.md, the public-facing site
// keeps the existing hand-written CSS design system (custom properties,
// component classes) rather than being rewritten in Tailwind. Tailwind may be
// wired in later, scoped to the admin app, if/when that's actually built.

// Russian is the default language (what crawlers get), so the static HTML
// is written from the RU strings — the same ones <Seo> uses at runtime.
const ru = JSON.parse(
  readFileSync(new URL('./src/i18n/locales/ru/translation.json', import.meta.url), 'utf8')
);
const seoPages = ru.seo.pages;

// Minimal i18next-style `t` over the Russian strings, for the shared
// detail-page builders in src/seo/detailMeta.js ("a.b.c" + {{var}}).
function tRu(key, vars = {}) {
  const value = key.split('.').reduce((node, part) => node?.[part], ru);
  if (typeof value !== 'string') throw new Error(`[seo] missing ru translation: ${key}`);
  return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name) => String(vars[name] ?? ''));
}

// Only plain slugs become file names (no path traversal, no odd characters).
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

const SEO_START = '<!-- seo:start -->';
const SEO_END = '<!-- seo:end -->';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const jsonForScript = (data) => JSON.stringify(data).replace(/</g, '\\u003c');

// The one set of head tags every HTML file gets (mirrors src/seo/Seo.jsx).
// noindex pages get no canonical/og:url; `image` is { url, width?, height?,
// alt? }; `jsonLd` is the page-level graph (data-seo="page", which Seo.jsx
// replaces in place after hydration).
function renderHead({ title, description, path, noindex = false, image = null, jsonLd = null }) {
  const url = !noindex && path ? absoluteUrl(path) : null;
  const og = image?.url ? image : DEFAULT_OG_IMAGE_META;
  const siteGraph = jsonForScript(buildSiteGraph(seoPages.home.description));
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    noindex
      ? '<meta name="robots" content="noindex, follow" />'
      : path
        ? '<meta name="robots" content="index, follow, max-image-preview:large" />'
        : null,
    url ? `<link rel="canonical" href="${url}" />` : null,
    '<meta property="og:type" content="website" />',
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    url ? `<meta property="og:url" content="${url}" />` : null,
    `<meta property="og:image" content="${escapeHtml(og.url)}" />`,
    og.width ? `<meta property="og:image:width" content="${og.width}" />` : null,
    og.height ? `<meta property="og:image:height" content="${og.height}" />` : null,
    `<meta property="og:image:alt" content="${escapeHtml(og.alt ?? title)}" />`,
    '<meta property="og:locale" content="ru_RU" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(og.url)}" />`,
    `<script type="application/ld+json" data-seo="site">${siteGraph}</script>`,
    jsonLd
      ? `<script type="application/ld+json" data-seo="page">${jsonForScript({ '@context': 'https://schema.org', ...jsonLd })}</script>`
      : null,
  ].filter(Boolean);
  return `${SEO_START}\n    ${tags.join('\n    ')}\n    ${SEO_END}`;
}

function replaceHead(html, head) {
  const start = html.indexOf(SEO_START);
  const end = html.indexOf(SEO_END);
  if (start === -1 || end === -1) throw new Error('seo markers missing from index.html');
  return html.slice(0, start) + head + html.slice(end + SEO_END.length);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function fetchList(apiUrl, path) {
  const res = await fetch(`${apiUrl}${path}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`${path} responded ${res.status}`);
  const body = await res.json();
  if (!body || body.success !== true || !Array.isArray(body.data)) {
    throw new Error(`${path} returned an unexpected shape`);
  }
  return body.data;
}

function toDate(value) {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : null;
}

// Tours and destinations are fetched from the API once per build: their
// slug URLs go into the sitemap and each gets its own HTML shell. If the
// API is unreachable the build still succeeds with the static pages only
// (and says so) — detail pages then fall back to spa.html, which is far
// better than a failed deploy.
async function fetchCatalog(apiUrl, logger) {
  if (!apiUrl) {
    logger.warn('[seo] VITE_API_URL not set — no tour/destination shells, static sitemap only');
    return { tours: [], destinations: [] };
  }
  try {
    const [destinations, tours] = await Promise.all([
      fetchList(apiUrl, '/destinations'),
      fetchList(apiUrl, '/tours'),
    ]);
    return {
      tours: tours.filter((t) => t.slug),
      destinations: destinations.filter((d) => d.slug),
    };
  } catch (err) {
    logger.warn(`[seo] API unavailable (${err.message}) — no tour/destination shells, static sitemap only`);
    return { tours: [], destinations: [] };
  }
}

function buildSitemap({ tours, destinations }) {
  const entries = STATIC_ROUTES.filter((r) => r.sitemap).map((r) => ({
    loc: absoluteUrl(r.path),
    ...r.sitemap,
  }));
  for (const d of destinations) {
    entries.push({
      loc: absoluteUrl(`/destinations/${encodeURIComponent(d.slug)}`),
      lastmod: toDate(d.updatedAt),
      changefreq: 'weekly',
      priority: '0.8',
    });
  }
  for (const t of tours) {
    entries.push({
      loc: absoluteUrl(`/tours/${encodeURIComponent(t.slug)}`),
      lastmod: toDate(t.updatedAt),
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  const urls = entries
    .map((e) =>
      [
        '  <url>',
        `    <loc>${escapeXml(e.loc)}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
        e.priority ? `    <priority>${e.priority}</priority>` : null,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n')
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function seoPlugin(apiUrl) {
  let outDir;
  let logger;
  let isBuild = false;

  return {
    name: 'farosayr-seo',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
      logger = config.logger;
      isBuild = config.command === 'build';
    },
    // Dev and build: index.html gets the homepage head.
    transformIndexHtml(html) {
      const home = seoPages.home;
      return html.replace(
        '<!-- seo:head -->',
        renderHead({ title: home.title, description: home.description, path: '/' })
      );
    },
    // Build only: one HTML shell per static route and per known tour /
    // destination (served by Vercel via cleanUrls), a generic shell for
    // everything else parameterized, a real 404 page, sitemap and robots.
    async closeBundle() {
      if (!isBuild) return;
      const indexHtml = readFileSync(resolve(outDir, 'index.html'), 'utf8');
      const catalog = await fetchCatalog(apiUrl, logger);

      for (const route of STATIC_ROUTES) {
        if (route.path === '/') continue;
        const meta = seoPages[route.key];
        const head = renderHead({
          title: meta.title,
          description: meta.description,
          path: route.path,
          noindex: route.noindex,
        });
        writeFileSync(resolve(outDir, `${route.path.slice(1)}.html`), replaceHead(indexHtml, head));
      }

      // Known tours and destinations: real title, description, canonical,
      // og:image and JSON-LD in the HTML itself — what crawlers that don't
      // run JS (Telegram/WhatsApp/Facebook previews, partly Yandex) see.
      // Built with the same functions DetailSeo.jsx uses at runtime.
      const detailShells = [
        ...catalog.tours.map((tour) => buildTourMeta(tour, tRu)),
        ...catalog.destinations.map((d) => buildDestinationMeta(d, tRu)),
      ];
      let shellCount = 0;
      for (const meta of detailShells) {
        const [, section, slug] = meta.path.split('/');
        if (!SAFE_SLUG.test(decodeURIComponent(slug))) continue;
        mkdirSync(resolve(outDir, section), { recursive: true });
        writeFileSync(resolve(outDir, section, `${slug}.html`), replaceHead(indexHtml, renderHead(meta)));
        shellCount++;
      }

      // Everything else parameterized (/tours/:slug added after the build,
      // /deals/:id, /admin/*) — the page sets its own title/canonical once
      // its data loads, so no canonical here (a wrong one would be worse
      // than none).
      writeFileSync(
        resolve(outDir, 'spa.html'),
        replaceHead(indexHtml, renderHead({ title: SITE_NAME, description: seoPages.home.description }))
      );

      writeFileSync(
        resolve(outDir, '404.html'),
        replaceHead(
          indexHtml,
          renderHead({
            title: seoPages.notFound.title,
            description: seoPages.notFound.description,
            noindex: true,
          })
        )
      );

      writeFileSync(resolve(outDir, 'sitemap.xml'), buildSitemap(catalog));
      // Generated (not a static public/ file) so the canonical domain lives
      // in exactly one place: SITE_URL in src/seo/site.js.
      // /spa is the internal fallback shell (served via rewrites for detail
      // URLs); requested directly it's a duplicate of the homepage. robots
      // rules match the requested path, so this doesn't affect /tours/… etc.
      writeFileSync(
        resolve(outDir, 'robots.txt'),
        [
          'User-agent: *',
          'Allow: /',
          'Disallow: /admin',
          'Disallow: /spa',
          '',
          `Sitemap: ${absoluteUrl('/sitemap.xml')}`,
          '',
        ].join('\n')
      );
      logger.info(
        `[seo] wrote ${STATIC_ROUTES.length - 1} route shells, ${shellCount} tour/destination shells ` +
          `(${catalog.tours.length} tours, ${catalog.destinations.length} destinations), spa.html, 404.html, ` +
          `sitemap.xml, robots.txt for ${SITE_URL}`
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = (process.env.VITE_API_URL || env.VITE_API_URL || '').replace(/\/+$/, '');

  return {
    plugins: [react(), seoPlugin(apiUrl)],
    server: {
      port: 5173,
    },
  };
});
