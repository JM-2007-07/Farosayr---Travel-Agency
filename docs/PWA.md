# Farosayr — Web app manifest & icons

Farosayr can be added to the home screen and opens as a standalone app.
It is **not** an offline app: there is no service worker (§4).

## 1. Files (`frontend/public/`, copied as-is to `dist/`)

| File | Size | Use |
|---|---|---|
| `site.webmanifest` | 0.7 KB | Web app manifest (`<link rel="manifest">`) |
| `favicon.ico` | 4.9 KB | Browsers/bots requesting `/favicon.ico` (48px PNG inside) |
| `favicon-48x48.png` | 4.9 KB | `<link rel="icon">` |
| `icon-192.png` | 14.5 KB | Manifest (`any`) + `<link rel="icon" sizes="192x192">` |
| `icon-512.png` | 66 KB | Manifest (`any`); also the logo in the site JSON-LD (`LOGO_URL`) |
| `icon-512-maskable.png` | 34 KB | Manifest (`maskable`) — Android adaptive icons |
| `apple-touch-icon.png` | 9.7 KB | iOS home screen (180×180) |

All icons are the existing Farosayr logo. `icon-512-maskable` and
`apple-touch-icon` put it on the brand navy (`#0b1f3a`); in the maskable
icon the logo is scaled to 68% so all of it (incl. the plane) stays inside
the 40%-radius safe zone — nothing is cut by a circular mask.

The PNGs are 8-bit palette images (≤256 colours, transparency kept),
4–5× smaller than the previous 32-bit files with no visible difference.
To rebuild them, compose from `icon-512.png` and quantise again; don't
upscale a smaller file.

Paths are the same as before (no `/icons/` folder): `/icon-512.png` is
referenced by structured data and already known to crawlers.

## 2. Manifest

```json
{
  "id": "/",
  "name": "Farosayr — туристическое агентство в Душанбе",
  "short_name": "Farosayr",
  "description": "Farosayr (Фаросайр) — туристическое агентство в Душанбе, Таджикистан.",
  "lang": "ru",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#0b1f3a",
  "theme_color": "#0b1f3a",
  "icons": [ 192 any, 512 any, 512 maskable ]
}
```

- `id` / `start_url` / `scope` = `/`: the installed app opens the real
  homepage (`index.html` via `/`), never `/spa` or `/index.html`; all routes
  are inside the scope. React Router has no basename.
- `display: standalone`; no `orientation` (nothing needs to be locked).
- `theme_color` = `<meta name="theme-color">` = the header navy.

## 3. HTML head (`frontend/index.html`)

One each of: `<link rel="icon">` (48 and 192), `apple-touch-icon`,
`<link rel="manifest">`, `theme-color`, `application-name`,
`apple-mobile-web-app-title`. Not used: `apple-mobile-web-app-capable`
(deprecated — iOS takes standalone mode from the manifest) and
`apple-mobile-web-app-status-bar-style` (only applies with it).

The viewport has no `viewport-fit=cover`, so the browser keeps content out
of notches and system bars by itself; no `env(safe-area-inset-*)` padding is
needed. Add both together if the layout ever goes edge-to-edge.

## 4. Service worker — intentionally none

Service Worker intentionally not added because the current Farosayr
application does not require offline-first behavior. Tours, prices and
offers come from the live API and must be current; a cached copy would show
stale prices, and a service worker adds cache-invalidation risk on every
deploy. Chrome no longer requires a service worker for installability.

## 5. Checks (2026-10-08, local production build)

- All files above: HTTP 200, correct `Content-Type`
  (`application/manifest+json`, `image/png`, `image/x-icon`), no redirect,
  no HTML fallback.
- Chrome (`Page.getAppManifest`): manifest parsed, 0 errors;
  `Page.getInstallabilityErrors`: none (desktop and mobile emulation).
- `/`, `/tours`, `/destinations`, `/deals`, `/contact` open directly.

Not verified: a real install on Android/iOS, and installability over HTTPS
on the real domain — check on a Preview deployment (Chrome DevTools →
Application → Manifest).
