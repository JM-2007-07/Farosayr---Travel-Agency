# Farosayr — Performance

How the frontend keeps payloads small, what was measured and how, and what
is left. Measured on 2026-10-07 against local production builds
(`vite build` + `vite preview`) talking to the production API
(`https://farosayr-t-a-backend.vercel.app`). Nothing here changed production
URLs, Vercel/Neon configuration, DNS or the Telegram setup.

## 1. How it was measured

- **Build:** `vite build`; per-chunk module composition via a temporary
  `generateBundle` report plugin; gzip sizes computed with zlib level 9
  (Vite's own printed gzip numbers differ slightly).
- **Runtime:** headless Chrome over the DevTools protocol, PerformanceObserver
  for FCP / LCP / CLS / long tasks, network log for requests and bytes.
  - *mobile*: 390×844 @2x, CPU ×4 slowdown, ~1.6 Mbps / 150 ms RTT.
  - *desktop*: 1440×900 @1x, no throttling.
  - Homepage, cold cache, median of 3–5 runs; baseline and new build were run
    back-to-back to share machine conditions.
- **Media:** direct download size of each Cloudinary variant; a frame of each
  variant rendered under the real hero overlay was compared visually.

Numbers from one machine are indicative, not field data. Long-task time
varied too much between runs to show a difference either way.

## 2. Results (homepage)

| | Before | After |
|---|---|---|
| Entry chunk (`index-*.js`) | 435.6 KB / 132.0 KB gz | 256.1 KB / 79.9 KB gz |
| Initial JS (entry + static imports) | 10 chunks, 697 KB / 222 KB gz | 9 chunks, 517 KB / 166 KB gz |
| Mobile FCP = LCP (median) | 2216 ms | 1788–1948 ms |
| Mobile CLS | 0.600 | 0.000 |
| Mobile transferred | 660 KB, 73 requests | 580 KB, 79 requests |
| Desktop FCP = LCP | 776 ms | 640 ms |
| Desktop CLS | 0.601 | 0.001 |
| Desktop images | 502 KB | 351 KB |
| Hero / showreel video file | 10.18 MB | 3.97 MB |
| Contact page logo | 151 KB PNG | 51 KB WebP |
| Google Fonts CSS (render-blocking) | 18.4 KB | 15.9 KB |

The request count went up slightly: the locale files and the MUI form code
are now separate lazy chunks, so they load only when they are needed.

## 3. What is in place

### JavaScript

- **Routes are lazy** (`React.lazy` per page, `App.jsx`).
- **Admin is one lazy chunk** — `layout/AdminShell.jsx` bundles the admin
  guard, layout and MUI theme. Public visitors never download it.
- **MUI theme is not global.** `ThemeProvider` wraps only the admin shell and
  the homepage search form (`components/home/BookingSearch.jsx`, the one
  public MUI form). Icons don't need the theme.
- **Locales are lazy.** Only Russian (default) is in the entry chunk; `tj`
  and `en` are loaded the first time they are selected
  (`i18n/index.js` → `changeLanguage`). On boot, `main.jsx` waits for
  `i18nReady` so a stored non-default language never flashes Russian.
  Always switch language through `changeLanguage` from `src/i18n`, not
  `i18n.changeLanguage`, so the bundle is loaded first.

### Layout stability

- The route `Suspense` fallback (`.route-loading`) fills the first screen
  (`100svh`). Previously it was `40vh`, so the footer rendered in view and
  then jumped down when the page arrived (CLS ≈ 0.6 on every navigation).
- Image boxes have fixed heights / aspect ratios in CSS; the map container
  reserves 280px.

### Images

- `utils/responsiveImage.js` adds `srcSet`/`sizes` to Unsplash URLs (the
  catalogue data uses `w=900`): tour, deal and destination cards, the
  destination page's tour cards, gallery tiles and tour-gallery thumbnails.
  Unsplash resizes via the `w` parameter; the largest candidate is never
  bigger than the original URL. Non-Unsplash URLs are left unchanged.
  `sizes` values mirror the grid breakpoints in the matching CSS — update
  them together if a grid changes.
- Header/footer logo: `public/logo-100.webp` (8.7 KB) instead of a 192px PNG.
- Contact page logo: `src/assets/images/farosayr-travel-agency-logo.webp`
  (600×400, shown at ≤290px wide).
- Below-the-fold images use `loading="lazy"` and `decoding="async"`.

### Video

- `config/media.js` → `BRAND_VIDEO_URL` uses Cloudinary `q_auto`
  (same 1280×720, 10 s; 3.97 MB instead of 10.18 MB). `q_auto:eco` was
  rejected: the derived file reported a 3 s duration and different frames.
- Hero background video loads only on screens ≥768px, without
  `prefers-reduced-motion`, without Save-Data / 2G, and only after the page
  `load` event plus an idle callback. The poster image is the LCP.
- The video section creates its `<video>` only after the user presses play.

### Third parties

- **Yandex Maps** (`components/common/LocationMap.jsx`) is loaded only when
  the map container comes within 400px of the viewport
  (IntersectionObserver). Both maps sit near the bottom of their pages, so
  most visits never load the script.
- **Google Fonts:** only weights that are actually rendered are requested —
  Poppins 400–800, Inter 400–700. Inter 300 was dropped after checking every
  public page in Chrome (`document.fonts`): it was never used. The two
  `font-weight: 300` rules use Poppins, which never had a 300 face, so they
  look exactly as before.

### API data

- Destinations are cached in memory for 60 s (`services/destinationsService.js`)
  because the homepage requests them from two places.
- **No HTTP caching was added to the API.** Public GETs are not personalised,
  but:
  - a CDN cache (`s-maxage`) on the backend would also cache the
    `Access-Control-Allow-Origin` header, which depends on the request's
    `Origin`. Whether Vercel's edge keys the cache on `Vary: Origin` cannot be
    verified without deploying; a cached no-Origin response served to
    farosayr.com would break the site.
  - a browser `max-age` would show stale reviews right after a user posts one.
  Revisit with a staging deployment (see §5).

## 4. Rules for new code

- New page → `lazy()` in `App.jsx`. New admin-only dependency → import it
  from admin files only.
- Don't import from `@mui/material` in public components unless needed; if
  a component needs the theme, wrap that component, not the app.
- Catalogue images → `responsiveImage(src, widths, sizes)`; set a box size in
  CSS so the image can't shift layout.
- Large media → Cloudinary with `q_auto`; never autoplay video on mobile.
- Third-party scripts → load on interaction or near-viewport, never in
  `index.html`.
- New font weight → check it's really rendered, then add it to the Google
  Fonts URL.

## 5. Known limitations / future work

- **Icons:** `@mui/icons-material` + `SvgIcon` (with emotion) are still in the
  initial bundle (~28 KB gz `createSvgIcon` chunk). Replacing them is a
  larger refactor, not done for size alone.
- **react-dom + react-router** are ~70% of the remaining initial JS; that is
  the framework floor.
- **`public/logo.png` (1.5 MB)** and `src/assets/images/Логотип Farosayr
  Travel Agency.png` (1.45 MB) are not referenced by the code. `public/logo.png`
  is still deployed and may be linked from outside (emails, social), so it was
  not deleted — confirm and remove or replace.
- **Icons/manifest:** done in the PWA step — icons re-encoded as palette PNGs
  (`icon-192` 60 → 14.5 KB, `icon-512` 326 → 66 KB, `apple-touch-icon`
  36.5 → 9.7 KB); see [PWA.md](PWA.md).
- **Caching / offline:** no service worker, on purpose — see [PWA.md](PWA.md).
- **API latency:** the backend function region (`sin1` in `backend/vercel.json`,
  not yet deployed) and the Neon region decide API round-trip time for users
  in Tajikistan; measure after any region change (see DEPLOYMENT.md).
- **Field data:** these are lab numbers. Real-user metrics (e.g. Vercel Speed
  Insights) would need a decision and a deployment.
