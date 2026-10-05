import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { STATIC_ROUTES } from './src/seo/routes.js';
import {
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
  buildSiteGraph,
} from './src/seo/site.js';

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

const SEO_START = '<!-- seo:start -->';
const SEO_END = '<!-- seo:end -->';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderHead({ title, description, path, noindex = false }) {
  const url = !noindex && path ? absoluteUrl(path) : null;
  const siteGraph = JSON.stringify(buildSiteGraph(seoPages.home.description)).replace(/</g, '\\u003c');
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
    `<meta property="og:image" content="${DEFAULT_OG_IMAGE}" />`,
    '<meta property="og:image:width" content="1200" />',
    '<meta property="og:image:height" content="630" />',
    '<meta property="og:image:alt" content="Farosayr — Travel Agency" />',
    '<meta property="og:locale" content="ru_RU" />',
    '<meta name="twitter:card" content="summary_large_image" />',
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />`,
    `<script type="application/ld+json" data-seo="site">${siteGraph}</script>`,
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

// Tours and destinations are fetched from the live API at build time so
// their slug URLs land in the sitemap. If the API is unreachable the build
// still succeeds with the static pages only (and says so) — a missing
// detail URL is far better than a failed deploy.
async function buildSitemap(apiUrl, logger) {
  const entries = STATIC_ROUTES.filter((r) => r.sitemap).map((r) => ({
    loc: absoluteUrl(r.path),
    ...r.sitemap,
  }));

  if (apiUrl) {
    try {
      const [destinations, tours] = await Promise.all([
        fetchList(apiUrl, '/destinations'),
        fetchList(apiUrl, '/tours'),
      ]);
      for (const d of destinations) {
        if (!d.slug) continue;
        entries.push({
          loc: absoluteUrl(`/destinations/${encodeURIComponent(d.slug)}`),
          lastmod: toDate(d.updatedAt),
          changefreq: 'weekly',
          priority: '0.8',
        });
      }
      for (const t of tours) {
        if (!t.slug) continue;
        entries.push({
          loc: absoluteUrl(`/tours/${encodeURIComponent(t.slug)}`),
          lastmod: toDate(t.updatedAt),
          changefreq: 'weekly',
          priority: '0.8',
        });
      }
      logger.info(`[seo] sitemap: ${destinations.length} destinations, ${tours.length} tours`);
    } catch (err) {
      logger.warn(`[seo] sitemap: API unavailable (${err.message}) — static pages only`);
    }
  } else {
    logger.warn('[seo] sitemap: VITE_API_URL not set — static pages only');
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
    // Build only: one HTML shell per static route (served by Vercel via
    // cleanUrls), a generic shell for parameterized routes, a real 404
    // page, and the sitemap.
    async closeBundle() {
      if (!isBuild) return;
      const indexHtml = readFileSync(resolve(outDir, 'index.html'), 'utf8');

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

      // /tours/:slug, /destinations/:slug, /deals/:id, /admin/* — the page
      // sets its own title/canonical once its data loads, so no canonical
      // here (a wrong one would be worse than none).
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

      writeFileSync(resolve(outDir, 'sitemap.xml'), await buildSitemap(apiUrl, logger));
      logger.info(`[seo] wrote ${STATIC_ROUTES.length - 1} route shells, spa.html, 404.html, sitemap.xml for ${SITE_URL}`);
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
