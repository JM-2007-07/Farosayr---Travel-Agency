# FaroSayr — Migration Plan (Phase 0 Audit)

> Source: single-page static site (`index.html`, `style.css`, `script.js`) provided as pasted
> content, no repo on disk, no git history. Russian-language travel agency site,
> Dushanbe-based, using Unsplash hotlinked imagery.

## A. What exists now

**Structure:** one HTML file, one CSS file (design-token driven), one vanilla JS file.
No build tooling, no framework, no package.json in the current implementation.

**Sections (in DOM order):**
loader → progress bar → header (desktop nav + mobile burger menu) → hero (SVG animated
route line + plane, parallax bg) → booking/search form (destination, dates, travelers,
budget) → destinations grid (8 cards) → "why choose us" (6 cards) → hot deals (3 cards
with live countdowns) → featured tours (4 cards with wishlist toggle) → animated stats
counters → about (image + bullet list) → gallery (8 images + lightbox) → video section
(static, no real video file) → reviews slider (4 reviews, dot nav, autoplay) → FAQ
accordion (5 items) → contact (info list + map image + form) → footer (nav columns +
newsletter form + social links) → back-to-top button.

**JS behaviors (all vanilla, DOM-driven, in `script.js`):**
`handleImgError` (broken-image fallback), page loader timeout, scroll progress bar,
header scrolled-state + active-link tracking via scroll position, mobile menu open/close
+ body-scroll lock, smooth-scroll anchors with header offset, `IntersectionObserver`
reveal-on-scroll (`.reveal`), hero parallax on scroll, animated counters
(`IntersectionObserver` + `requestAnimationFrame` easing), search form (fake "searching…"
UI, then scrolls to contact — **no real search logic**), wishlist toggle (**visual only,
not persisted**), per-card countdown timers (`setInterval`, **client-side only, resets on
reload**), gallery lightbox (open/close/Escape/click-outside), video play button
(**cosmetic — no actual video**), reviews auto-slider + dots, FAQ accordion (single-open),
contact form submit (**fakes success — no network request**), newsletter form
(**fakes success — no network request**), back-to-top, button ripple effect.

**Design tokens (CSS custom properties):** dark-blue `#0B1F3A`, dark-blue-2 `#0E2647`,
ocean-blue `#14406B`/`#1B5A8C`, turquoise `#2FD9C4`/dim `#1FA895`, gold `#D4AF6A`, plus
grays. Fonts: Poppins (display), Inter (body). Radius/shadow/easing tokens defined once
and reused throughout. `prefers-reduced-motion` is respected globally.

**External dependencies today:** Google Fonts (Poppins/Inter), Unsplash-hotlinked photos
(will break/rate-limit in production — flagged as a risk below), one local icon
(`farosayr_icon_48x48_palette_v2.png`).

**Everything marked "no real X" above is UI-only simulation** — this is the core gap
the full-stack mission needs to close.

## B. What will be preserved (non-negotiable)

- Full visual identity: color tokens, typography, spacing/radius/shadow/easing scale.
- Every section listed above, in the same order and hierarchy.
- Every animation/interaction listed above, ported to React idioms (no re-implementation
  with different UX).
- Responsive breakpoints (1180/980/720/480px) and the mobile-menu behavior.
- Accessibility affordances already present (focus-visible ring, reduced-motion,
  aria-expanded on burger/lightbox-adjacent controls).
- Russian as the default/initial language and copy.

## C. What will be migrated (structure change, same behavior)

| Old (vanilla) | New (React) |
|---|---|
| `document.querySelector` + manual class toggles | component state (`useState`) |
| Global `IntersectionObserver` per `.reveal` | one reusable `useReveal`/`useInView` hook (or AOS, chosen once, not mixed) |
| `setInterval` countdown per card | `useCountdown(endTime)` hook |
| `requestAnimationFrame` counter easing | `useAnimatedCounter` hook |
| Manual reviews slider (`translateX` + dots) | Swiper (already in the provided dependency baseline) |
| Manual lightbox div toggling | `<Lightbox>` component w/ portal + Escape handling |
| Inline data (8 destinations, 4 tours, 3 deals, 4 reviews, 5 FAQs) hardcoded in HTML | `src/data/*.js` seed files → later `GET /api/*` |
| Fake form "success" states | real service calls with idle/loading/success/error states |
| Anchor-based single-page nav (`#tours`, `#gallery`, etc.) | route-based pages using `react-router` (v8 baseline), with in-page anchors kept for the homepage sections that stay single-page |

## D. What will be added (new, not present today)

- Real routing (`/`, `/tours`, `/tours/:id`, `/destinations`, `/deals`, `/about`,
  `/reviews`, `/gallery`, `/contact`, `/booking`, `/login`, `/register`, `/profile`,
  `/bookings`, `/favorites`, `/admin/*`, `*` 404).
- Auth (register/login/logout/me, roles USER/ADMIN, hashed passwords, protected routes).
- Persisted favorites, real booking flow with status machine, real reviews tied to
  users/tours, real contact-message + newsletter storage.
- Admin CRUD for tours/destinations/deals/bookings/users/reviews/messages.
- i18n scaffolding (RU seeded now; EN/TJ keys prepared, not machine-translated en masse).
- A real backend + PostgreSQL schema behind all of the above.

## E. Proposed frontend architecture

Vite + React 19 + react-router (not `-dom`) + Tailwind v4 + MUI (for admin-heavy forms
only, kept out of the public-facing pages so the existing custom design isn't diluted) +
Swiper (reviews/tours carousels) + AOS **or** the custom reveal hook — pick one, not both,
to avoid two competing animation systems (I'd default to keeping the custom
`IntersectionObserver` hook since it's tiny, already proven, and avoids an extra
dependency; AOS only if you specifically want its declarative `data-aos` API).

Folder layout matches section 4/59 of your brief — `components/{section}`,
`pages/`, `layouts/`, `context/{AuthContext, FavoritesContext, LanguageContext}`,
`hooks/{useReveal, useCountdown, useAnimatedCounter, useDebounce}`, `services/api/*`,
`data/*` (seed → later replaced by API-backed hooks), `i18n/`.

## F. Proposed database (PostgreSQL + Prisma)

Entities: `User`, `Role` (enum on User is simpler than a join table for just
USER/ADMIN — I'd flag the join-table version as overkill unless you expect many roles),
`Tour`, `Destination`, `TourImage`, `Deal`, `Booking`, `BookingItem`, `Review`,
`Favorite`, `ContactMessage`, `NewsletterSubscriber`, `FAQ`. Enums: `BookingStatus`
(PENDING/CONFIRMED/CANCELLED/COMPLETED), `PaymentStatus`
(UNPAID/PENDING/PAID/FAILED/REFUNDED). `Tour.destinationId` FK, `Booking.userId` +
`Booking.tourId` FK, `Favorite` as a `User↔Tour` composite-key join table,
`Review.userId` + `Review.tourId` FK with a unique constraint (one review per user per
tour) to satisfy the "prevent duplicate abusive submissions" requirement cheaply.

## G. Proposed API

REST, matches section 26 of your brief essentially verbatim — I don't see a reason to
deviate. Query-param filtering on `GET /api/tours` (`destination`, `minPrice`,
`maxPrice`, `q`, `sort`) rather than fetching everything client-side.

## H. Proposed authentication

JWT in an httpOnly cookie (simpler CORS/CSRF story than bearer-token-in-localStorage for
a same-origin-ish app, and avoids XSS token theft) + `bcrypt` for hashing +
role claim in the token, checked by an Express middleware (`requireAuth`,
`requireAdmin`).

## I. Proposed admin panel

Route-protected `/admin/*` under an `AdminLayout`, MUI DataGrid-style tables for
tours/bookings/users/reviews/messages, a simple dashboard with the counts listed in
section 25. Kept deliberately unglamorous per "do not over-engineer" (section 25/58).

## J. Dependencies to install (frontend — matches your provided baseline, no additions
needed beyond it for the public site; MUI is only pulled into admin routes)

`react`, `react-dom`, `react-router`, `@emotion/*`, `@mui/*`, `@tailwindcss/vite`,
`tailwindcss`, `swiper`, `i18next` + `react-i18next` + detector + http-backend, `aos`
(only if you confirm you want it over the custom hook).

Backend (new): `express@5`, `@prisma/client` + `prisma`, `zod`, `jsonwebtoken`,
`bcrypt`, `helmet`, `cors`, `express-rate-limit`, `dotenv`, `morgan`.

## K. Migration phases (execution order)

0. Audit — **this document**.
1. Vite/React scaffold, move design tokens into a CSS/Tailwind layer, verify pixel
   parity of a static homepage shell.
2. Componentize every section listed in A, data-driven from `src/data/*` seed files.
3. Port every JS behavior via the hook table in C.
4. Routing (react-router), split homepage-only sections vs. real pages
   (`/tours/:id`, `/booking`, etc.).
5. Frontend API service layer, initially pointed at the same `src/data` seeds behind
   an interface that later swaps to `fetch('/api/...')` with zero component changes.
6. Backend Express skeleton + middleware stack.
7. Prisma schema, migrations, seed script populated from the extracted data in step 2.
8. Auth (register/login/me/roles/protected routes).
9. Wire real features: tours/destinations/deals/bookings/reviews/favorites/
   contact/newsletter, replacing the seed-backed service layer from step 5 endpoint
   by endpoint.
10. Admin panel.
11. Security pass (rate limiting, CORS allow-list, helmet config, input validation
    audit, secret scan).
12. QA — lint, build, manual test matrix at the breakpoints listed in section 10.

## L. Risks

- **Unsplash hotlinking**: current images are hotlinked `images.unsplash.com` URLs with
  no attribution/licensing captured — fine for a demo, not for production; should move
  to owned/licensed assets or Unsplash's API with proper attribution before real launch.
- **This execution environment cannot install npm packages or run a database**
  (no network egress, no persistent DB service) — Phases 6–8 can be written here but not
  build-verified here; they'd need to be run/tested in your local environment or a
  sandbox with network access.
- **Video section has no real video file** — needs an actual asset or a decision to cut
  the section rather than ship a fake play button.
- **Countdown timers are currently purely client-side and reset on reload** — real "hot
  deal" expiry needs a server-authoritative `endsAt` timestamp per `Deal`, which the
  Phase-9 wiring should set from day one rather than inventing fake urgency.
- **react-router v8 / React 19 / Tailwind v4 / MUI v9** are all quite recent — I'd
  sanity-check exact compatibility (e.g. MUI v9 + React 19 peer ranges, Tailwind v4's
  Vite plugin setup) once real installs are possible, rather than assuming the versions
  in your baseline all interoperate cleanly.

---

## Phase 1 status — COMPLETE (with one caveat)

**Objective:** React/Vite foundation + visual shell (Loader, ScrollProgress, Header,
mobile menu, Hero, homepage section structure, Footer). No backend.

### Implemented
- `frontend/` scaffolded per the target structure (section 4/59): `package.json`
  matching your dependency baseline exactly, `vite.config.js` (React plugin only —
  Tailwind's plugin deliberately not registered; see rule 1 in your last message),
  `index.html` with the original title/meta-description/font links preserved.
- `src/styles/tokens.css` — every CSS custom property ported verbatim (colors, fonts,
  radii, shadows, easing, header height, `prefers-reduced-motion` block).
- `src/styles/global.css` — reset, `.container`/`.section`/`.eyebrow`/`.btn*`/`.reveal`/
  `.img-wrap` primitives, all copied from the original `style.css` unchanged.
- Hooks: `useReveal` (replaces the global reveal `IntersectionObserver`),
  `useImgFallback` (replaces `handleImgError`/`onerror`), `useScrollState` (replaces
  the scroll-position reads for header/progress-bar), `useActiveSection` (replaces
  `updateActiveLink`). `utils/scrollToId.js` replaces the anchor click handler.
- Components, each with colocated scoped CSS ported verbatim from the original:
  `Loader`, `ScrollProgress`, `Header` + `MobileMenu` (desktop nav, burger, active-link
  tracking, body-scroll lock while open), `Hero` (parallax bg, animated SVG route +
  plane, staggered reveal on the eyebrow/title/subtitle/buttons), `Footer` (nav
  columns, social links, newsletter form — form is local-state only, real
  `POST /api/newsletter/subscribe` wiring is Phase 9, per rule 11).
- `constants/navigation.js` — nav items extracted from the old hardcoded markup.
- `layouts/MainLayout.jsx`, `pages/Home.jsx`, `App.jsx` (routes via `react-router`,
  **not** `react-router-dom`, single `/` route only — no placeholder routes for
  pages that don't exist yet), `main.jsx`.
- Remaining homepage sections (booking/destinations/why/deals/tours/about/gallery/
  reviews/faq/contact) are rendered as labeled `<SectionPending>` placeholders at
  their correct anchor IDs, so navigation/anchors already resolve to the right scroll
  position ahead of Phase 2 replacing each one with a real component.

### Validation actually performed (and what couldn't be)
- **Could not run** `npm install`, `npm run lint` (oxlint), `npm run build` (vite), or
  `npm run dev` — this sandbox's egress proxy returns `403` on the npm registry
  (`npm ping` confirmed this directly), so no packages can be fetched.
- **Did run**, using esbuild bundled with a pre-installed local tool (no network
  needed): a syntax/JSX-transform check across all 24 `.jsx`/`.js`/`.css` files — 0
  errors — and an import-resolution check confirming every relative `import` in the
  scaffold points at a file that actually exists on disk — 0 problems.
- This catches typos, malformed JSX, and broken import paths, but it is **not** a
  substitute for a real `vite build`: dependency-version compatibility (React 19 +
  react-router 8, etc.) and any runtime-only issues are unverified until you run
  `npm install && npm run build` locally.

### Known gap requiring your input
- `public/farosayr_icon_48x48_palette_v2.png` (logo/favicon) was referenced by
  filename in the original site but the actual image binary was never provided to
  this migration — noted in `frontend/README.md`. Drop the real file in before
  running, or point me to it.

### Post-Phase-1 architecture correction — COMPLETE

Scope: routing/architecture only, no visual or content changes. Changes made:
- `src/layouts/MainLayout.jsx` → `src/layout/Layout.jsx` (renamed function `MainLayout`
  → `Layout` to match; JSX body byte-for-byte identical otherwise — still Loader +
  ScrollProgress + Header + `<Outlet />` + Footer).
- `src/App.jsx` rewritten from a plain `<Routes>/<Route>` tree to
  `createBrowserRouter` + `RouterProvider`, with every page `lazy()`-imported and
  wrapped in `<Suspense fallback={<Loading />}>`, plus a `ScrollToTop` component
  (`useLocation` + `useEffect(() => window.scrollTo(0,0), [pathname])`) mounted
  alongside `Layout` on every route change.
- `src/main.jsx`: removed the `<BrowserRouter>` wrapper — `RouterProvider` now owns
  routing entirely, per the strict "no `<BrowserRouter>` around `RouterProvider`" rule.
- New `src/components/Loading.jsx` (+ scoped CSS) — the Suspense fallback. Kept
  deliberately distinct from the existing `Loader` (that one is the full-page splash
  shown once on initial mount; this one is a small inline spinner for lazy chunk
  loads), reusing the same turquoise token rather than inventing new colors.
- New `src/components/common/PagePending.jsx` — same dashed-box/muted-label visual
  treatment as the existing `SectionPending`, used as the body for every route-level
  stub page below, so no new design language was introduced for "not built yet" states.
- Full route tree wired in `App.jsx` exactly per the required list (public, auth, user,
  admin, `*` → `NotFound`). Every non-Home page is a ~6-line stub file
  (`export default function X() { return <PagePending title="..." />; }`) — no content,
  no fake data, no CRUD, no auth logic, per the "routes ≠ build every page" instruction.
  `NotFound.jsx` is the one exception with real (minimal) content, since the 404 page
  is itself part of this task's required architecture rather than a future feature.
- Deleted the stray literal directory `src/{assets,components` left over from an
  earlier `mkdir -p .../{a,b,c}` (the sandbox shell doesn't do brace expansion) — dead,
  unreferenced, unrelated to this refactor but cleaned up while in the area.

**Untouched, reused as-is:** `Hero.jsx`/`.css`, `Header.jsx`/`.css`, `MobileMenu.jsx`,
`Footer.jsx`/`.css`, `Loader.jsx`/`.css`, `ScrollProgress.jsx`/`.css`,
`SectionPending.jsx`, `Home.jsx`, all hooks, `constants/navigation.js`,
`utils/scrollToId.js`, `styles/tokens.css`, `styles/global.css`. No CSS, colors,
spacing, animations, or content changed anywhere.

**Validation performed:** same two-pass check as Phase 1, re-run against the full
52-file tree — esbuild JSX/syntax transform (0 errors) and a relative-import resolver
that now also checks every dynamic `import()` used by `lazy()` (0 missing targets, all
25 lazy-loaded route chunks resolve to real files). Manually re-read every new/changed
file for bracket/tag balance, correct default exports, and correct `react-router`
(never `-dom`) imports. **Not run:** `npm install`/`lint`/`build`/`dev` — still blocked
by the sandbox's network policy, unchanged since Phase 1.

### Phase 2 status — COMPLETE

**Objective:** componentize the homepage, migrate all original `script.js` behaviors to
React, move repeated data into `src/data/*`, wire sensible internal `Link`s to the
Phase 1 route tree — without changing the approved design or touching backend/auth.

**Data extracted** (`src/data/`): `destinations.js` (8), `tours.js` (4), `deals.js` (3),
`reviews.js` (4), `faq.js` (5), `gallery.js` (7), `stats.js` (4), `whyChooseUs.jsx` (6,
`.jsx` because the icons are inline SVG JSX, same as the original markup).

**New hooks** (`src/hooks/`): `useCountdown` (per-deal countdown, replaces the
original's `setInterval`-per-card), `useAnimatedCounter` (stats easing, gated by
`useReveal`'s in-view flag, threshold matched to the original's `0.6`),
`useLightbox` (Escape + body-scroll-lock side effects), `useWishlist`
(localStorage-backed — original was visual-only; Phase 2 explicitly allows this since
it's one small hook, no new library), `useButtonRipple` (delegated document-level click
listener, intentionally different from the original's per-button listeners since React
components mount/unmount, called once from `Layout`).

**12 homepage section components** (`src/components/home/`): `BookingSearch`,
`Destinations`, `WhyChooseUs`, `HotDeals`, `FeaturedTours`, `Statistics`,
`AboutSection`, `GallerySection`, `VideoSection`, `ReviewsSection`, `FAQSection`,
`ContactSection` — each with colocated CSS ported verbatim from the original
`style.css` (byte-equivalent rules, only `class`→`className`/kebab→camelCase for
inline SVG attrs). Card-level sub-components (`DestinationCard`, `DealCard`,
`TourCard`, `WhyCard`, `GalleryTile`, `FAQItem`, `StatItem`) live inside their
section's file rather than as separate files, since each just needs its own
`useReveal`/`useImgFallback` hook instance — splitting them out would be a "tiny
wrapper" per the spec's own guidance against that.

**2 new shared components** (`src/components/common/`): `Lightbox` (markup only;
Escape/body-lock logic lives in `useLightbox`), `BackToTop` (site-wide, so it's
mounted from `Layout.jsx` alongside `Header`/`Footer`, not from a homepage section —
matches where the original button lived in the DOM, outside any single section).

**Behaviors migrated** (all 21 from the original `script.js`): image fallback,
loader, scroll progress, header scroll state, mobile menu, body-scroll lock, smooth
anchor nav, reveal-on-scroll, hero parallax, stat counters, booking/search demo
interaction, wishlist (now localStorage-persisted), deal countdowns, gallery
lightbox, video play (still cosmetic), reviews slider (manual `translateX` + dots,
no Swiper — the original was cleanly portable without a new dependency), FAQ
accordion (single-open), contact form (demo success state), newsletter form (demo
success state), back-to-top, button ripple (now delegated).

**Internal links added** (`react-router` `Link`, additive only — no existing click
behavior was changed): destination-card image → `/destinations/:id`, deal-card image
→ `/deals/:id`, tour-card image → `/tours/:id`. Every original "Забронировать" CTA
still does exactly what it did before (scroll to `#contact`) — those specific
interactions were preserved rather than rerouted, since changing them would be an
interaction change, not a routing addition.

**Demo-honesty wording change** (per Phase 2 §17, explicit instruction to not imply a
real server submission): `ContactSection`'s success message and `Footer`'s newsletter
success placeholder now say the form is in demo mode rather than implying delivery.
This is the one intentional copy change in this phase — noted here since section 23
otherwise requires zero content changes.

**Files changed outside `data/`/`hooks/`/`components/home/`:** `pages/Home.jsx`
(recomposed from 12 real sections, replacing the Phase 1 `<SectionPending>` list),
`layout/Layout.jsx` (added `BackToTop` + `useButtonRipple()` — both genuinely
site-wide, not homepage-specific), `components/layout/footer/Footer.jsx` (one-line
copy change, see above). `components/common/SectionPending.jsx` deleted — its sole
purpose (marking not-yet-built homepage anchors) is now obsolete, confirmed
unreferenced before removal. `components/common/PagePending.jsx`,
`components/hero/Hero.jsx`, `Header`/`MobileMenu`, `Loader`, `ScrollProgress`, all
hooks from Phase 1, `styles/tokens.css`, `styles/global.css` — **untouched**.

**Validation performed:** same esbuild syntax/JSX/CSS-brace check now covering all 92
files (0 errors); import-resolution check covering all static and dynamic imports
across 70 JS/JSX files (0 missing targets); an unused-import scan across every file
(0 flags); a grep sweep confirming `Header`/`Footer` are imported in exactly one place
(`Layout.jsx`), zero `react-router-dom` references, and every `setInterval`/
`addEventListener` has a matching cleanup (one false-positive grep hit was a code
comment quoting the original vanilla JS, not an actual uncleaned listener — manually
confirmed). **Not run:** `npm install`/`lint`/`build`/`dev` — still blocked by the
sandbox's network policy, unchanged since Phase 1.

**Known limitations carried forward:** the logo/favicon PNG is still missing (flagged
in Phase 1, unresolved); deal countdowns remain client-side-only per Phase 2 scope
(server-authoritative `endsAt` is a later-phase concern, noted in the original audit's
risk list); the FAQ section's "Задать вопрос" button uses `.btn-outline`, which is
white-on-white against the FAQ section's white background in the original CSS too —
this is a pre-existing visual quirk in the approved design, not a regression, and was
deliberately left as-is rather than "fixed" per the preserve-exactly-as-approved rule.

### Phase — Frontend Data/API Service Layer — COMPLETE

**Objective:** insert `components → services → data` between the homepage components
and `src/data`, with an interface that can later swap its internals to a real REST API
without touching any consumer.

**Audit findings:** 8 consumers imported `src/data` directly (the 7 homepage sections
migrated below, plus `WhyChooseUs`). No prior service layer existed. All content data
files already used slug-style string `id`s matching `/tours/:id`, `/destinations/:id`,
`/deals/:id` exactly — no id normalization was needed.

**Services created** (`src/services/`, 7 files — one per content entity with an actual
consumer; **no** service created for `whyChooseUs.jsx` since it's static icon/text
config with no route and no detail page, so a service there would exist only "for
architecture," which was explicitly out of scope): `destinationsService`
(`getDestinations`, `getDestinationById`), `toursService` (`getTours`,
`getTourById`), `dealsService` (`getDeals`, `getDealById`), `reviewsService`
(`getReviews` only — no `/reviews/:id` route exists), `faqService` (`getFaqItems`
only), `galleryService` (`getGalleryItems` only), `statsService` (`getStats` only).
Every `getById` returns the item or `null` — never `undefined`, never throws — the
same convention across all three id-based services. Every `getAll`-style function
returns `[...ARRAY]`, a shallow copy, so callers can never mutate the shared seed data.
All functions are synchronous by design (no `fetch`, no Promises, no mock server) per
the explicit instruction not to fake async for local data — swapping to a real API
later only requires changing what's inside these functions, not their call signatures
or any consumer code.

**Consumers migrated** (7/7 applicable): `Destinations`, `HotDeals`, `FeaturedTours`,
`ReviewsSection`, `FAQSection`, `GallerySection`, `Statistics` — each now calls its
service function once per render instead of importing the data constant directly.
`WhyChooseUs.jsx` intentionally left importing `data/whyChooseUs.jsx` directly (see
above). Detail-page stubs (`TourDetails`, `DestinationDetails`, `DealDetails`) and
list-page stubs (`Tours`, `Destinations` route, `Deals`) were **not** wired to the new
services and **not** given real UI — they're still `PagePending`, per the instruction
to prepare the service layer for future use without building pages ahead of their
phase.

**Cleanup:** confirmed via grep that the only remaining direct `src/data` imports are
the 7 service files themselves and the one intentional `WhyChooseUs.jsx` exception —
zero stray old-constant references (`DESTINATIONS`/`TOURS`/etc.) anywhere outside
`data/`/`services/`. No `console.log` anywhere in `src`. No dead files.

**Validation — this time actually executed, not just statically read:** transformed
each service + its data dependency to CommonJS with esbuild and ran them for real in
Node: `getAll()` length verified for all 7 services; `getById()` tested with both a
real id (found, correct object) and a nonexistent id (`null`, not `undefined`, no
throw) for all 3 id-based services; mutation-safety tested by sorting/reversing/pushing
onto a returned array and re-fetching — original data unaffected in all 7 cases (SAFE).
Also re-ran the standing checks: esbuild syntax across all 99 files (0 errors), import
resolution across 77 JS/JSX files including dynamic `lazy()` imports (0 missing),
unused-import scan (0 flags), `react-router-dom` absent, `Header`/`Footer` imported
only in `Layout.jsx`, `App.jsx` byte-identical since the last correction (mtime
unchanged), backend/auth/db grep across `src` and `package.json` clean, no `.env` or
`backend/` directory present. Circular-dependency check: confirmed `src/data` imports
nothing from `services/`/`components/`, and `services/` imports nothing from
`components/` — the layering is strictly one-directional. **Not run:**
`npm install`/`lint`/`build`/`dev` — still blocked by the sandbox's network policy.

### Backend Foundation — COMPLETE (static validation only, see below)

**Objective:** create `backend/` as a pure Express 5 API foundation — no
Prisma/PostgreSQL/auth — that later phases build on. Frontend untouched (verified via
mtimes: `frontend/src/App.jsx` unchanged since the routing correction; every file
touched this phase lives under `backend/`, created within this turn's timestamp
window).

**Structure:** `backend/src/{app.js,server.js,config/env.js,routes/index.js,
controllers/health.controller.js,middleware/{asyncHandler,notFound,errorHandler}.js,
utils/logger.js}` + `.env.example` + `.gitignore` + `package.json` + `README.md` —
matches the requested layout exactly, nothing extra.

**Separation:** `app.js` builds and configures the Express app and exports it —
zero `.listen()` calls, confirmed by grep (`.listen(` appears exactly once in the
whole backend, in `server.js`). `server.js` imports `app`, starts the HTTP server,
and handles `SIGTERM`/`SIGINT` by closing the server before `process.exit`.

**Middleware order** (verified against `app.js`, matches the spec's order exactly):
`helmet()` → `cors({ origin: env.clientUrl, credentials: true })` (never `'*'`,
deliberately credential-ready for future cookie auth) → `express.json({limit:'1mb'})`
+ `urlencoded` → `morgan` → `express-rate-limit` (300 req/15min, dev-friendly) →
API routes under `env.apiPrefix` → `notFound` → `errorHandler` (last).

**Config:** `config/env.js` centralizes all `process.env` reads into one `env` object
(`port`, `nodeEnv`, `isProduction`, `clientUrl`, `apiPrefix`). Development defaults
`CLIENT_URL` to the Vite dev server; production throws at startup if `CLIENT_URL`
isn't set explicitly, rather than silently serving with an unsafe/absent CORS origin.

**Endpoint:** `GET /api/health` only, via `controllers/health.controller.js` →
`routes/index.js`, returning `{ success, message, timestamp }` — no database touched
(none exists yet). No other business endpoints created, per explicit instruction.

**Error/404 handling:** `notFound` returns JSON 404 for any unmatched route (never
HTML). `errorHandler` returns `{ success: false, message }` uniformly, adds `stack`
only when `!env.isProduction`, and logs the full error server-side via `logger`
regardless of environment.

**Dependencies:** `express`, `cors`, `helmet`, `morgan`, `express-rate-limit`,
`dotenv` only — no Prisma, no `@prisma/client`, no `bcrypt`, no `jsonwebtoken`, no
`zod` (all explicitly deferred to later phases, confirmed absent via grep across
`backend/`).

**Validation performed:**
- Syntax: `node --check` run individually against all 9 backend `.js` files — 0
  failures (Node correctly parses them as ESM via the package's `"type": "module"`).
- Imports/exports: every relative import resolves to a file that exists (0/9
  problems); manually cross-checked every named vs. default export against its
  importer (`env`/`logger` are named exports imported with `{ }`, `getHealth` is
  named, `routes` is a default export imported without braces — no mismatches).
- Bracket/paren balance: checked across all 9 files — all balanced.
- No `require()` anywhere (confirmed no ESM/CommonJS mixing).
- `app.listen()` confirmed to exist in exactly one file (`server.js`).
- Confirmed zero references to `prisma`, `postgres`, `jsonwebtoken`, `jwt`, `bcrypt`
  anywhere in `backend/` (the only 2 hits were explanatory code comments about a
  *future* phase, not actual code/dependencies).
- **Runtime test: NOT performed.** Re-confirmed via a fresh `npm ping` that the
  sandbox's egress proxy still returns `403` on the npm registry, so `npm install`
  cannot run and `GET /api/health` could not be hit for real. This is a static/manual
  validation pass only — genuinely running the server and hitting the endpoint needs
  to happen in your local environment.

**Frontend changes:** none. `frontend/src/App.jsx` mtime is byte-for-byte identical
to its state after the routing correction phase; `frontend/src/services/*` still read
from local seed data, untouched, exactly as instructed (no wiring to this new backend
yet).

### Prisma + PostgreSQL Foundation — PARTIAL (see honest breakdown below)

**Objective:** wire `Express → Prisma Client → PostgreSQL` as infrastructure only —
no business schema, no seed, no auth. Frontend untouched (re-verified via mtime: all
frontend files predate this turn; zero `prisma`/`@prisma` references anywhere in
`frontend/src`).

**Environment reality:** re-confirmed at the start of this phase — no PostgreSQL
binary/service in this sandbox, no cached Prisma packages, and network is still
blocked (`npm ping` → `403`). I additionally ran `npx --yes prisma validate` directly
to get concrete evidence rather than assuming: it fails immediately because `npx`
itself can't fetch the `prisma` package (`403` on `registry.npmjs.org/prisma`). So
beyond static file creation and manual schema review, this phase is genuinely
**BLOCKED** on `prisma generate`, `prisma validate`, migrations, and any real
connection test — reported honestly as such below, not glossed over.

**Created:** `backend/prisma/schema.prisma` — `generator client` +
`datasource db` (PostgreSQL, `url = env("DATABASE_URL")`) only, deliberately **zero
models**. Adding placeholder business models just to give a migration something to
do would be inventing schema ahead of its phase — explicitly out of scope here.
`backend/src/config/database.js` — single exported `prisma` client instance (module-
level singleton; the `globalThis` cache is a defensive no-cost guard for a future dev-
tooling change, explained inline, since `node --watch` restarts the whole process
rather than hot-swapping modules, so it isn't strictly needed today) + a
`checkDatabaseConnection()` helper that runs `SELECT 1` via `$queryRaw`, catches
internally, and returns a boolean — never throws, never runs a business query (none
exist).

**Updated:** `env.js` (added centralized `databaseUrl`, read once, never logged —
only its truthiness is ever checked, confirmed via grep); `.env.example` (added a
`DATABASE_URL` line using the same placeholder pattern the instructions themselves
specified — localhost, generic password, clearly not a real secret); `server.js`
(startup now: load config → verify `DATABASE_URL` is set → `checkDatabaseConnection()`
→ success starts `app.listen()`, failure logs a clear error and does a single
`process.exit(1)` — not a retry loop; shutdown now also `await prisma.$disconnect()`
before exiting); `health.controller.js` (now `async`, reports
`database: "connected"|"disconnected"` via the existing shared client — does not
create a new `PrismaClient`, does not run a business query); `routes/index.js` (health
route now wrapped in `asyncHandler`, the first real use of that middleware since it
was built as pure infrastructure last phase); `package.json` (added `@prisma/client`
dependency, `prisma` devDependency, `prisma:generate`/`prisma:migrate`/`prisma:studio`
scripts — 3 only, as instructed); `README.md` (7-step setup: install → create DB →
copy env → configure `DATABASE_URL` → generate → migrate → start).

**Prisma:** version pinned in `package.json` as `^5.20.0` for both `prisma` and
`@prisma/client` (a current stable line at the time this was written — **not
independently verified against the actual latest release**, since that would require
network access this sandbox doesn't have; worth double-checking against
npmjs.com/package/prisma before your first real install).

**Validation performed (honest breakdown):**
- JS syntax: PASS — `node --check` on all 10 backend `.js` files (up from 9; added
  `database.js`), 0 failures.
- Imports/exports: PASS — 0/10 unresolved relative imports; manually cross-checked
  every new named import (`prisma`, `checkDatabaseConnection`, `asyncHandler`) against
  its export — all match.
- `prisma validate`: **BLOCKED** — `npx` cannot fetch the `prisma` package at all
  (network 403, shown above). What I did instead: manually reviewed
  `schema.prisma` against Prisma's documented syntax — balanced braces (2/2), correct
  `generator client { provider = "prisma-client-js" }` and
  `datasource db { provider = "postgresql", url = env("DATABASE_URL") }` blocks
  present, no stray tokens. This is a manual read, not a substitute for the real
  validator.
- `prisma generate`: **BLOCKED** — same root cause, not attempted (would need the
  package installed first).
- PostgreSQL connection: **BLOCKED** — no PostgreSQL binary or service exists in this
  sandbox at all, confirmed by checking for `psql`/`pg_ctl`/a `postgresql` service.
- Migration: **BLOCKED** — depends on both of the above.
- `GET /api/health` / `GET /api/unknown` runtime test: **BLOCKED** — same as the
  Backend Foundation phase, `npm install` cannot run.
- Architecture/security checks (all of these *were* actually run, not blocked):
  exactly one `new PrismaClient(` in the entire backend (in `database.js`); zero
  hardcoded real credentials anywhere in `src/`/`prisma/` (only variable references,
  `env()` calls, and the example placeholder in `.env.example`); `databaseUrl` is
  never passed to any logging call, only checked for truthiness; `.gitignore` still
  excludes `.env`/`.env.*` while keeping `.env.example` tracked; zero `prisma`/
  `@prisma` references anywhere in `frontend/src`; frontend files re-validated with
  the standing esbuild check (77 files, 0 errors) to confirm this phase didn't
  regress anything.

**Frontend changes:** none — confirmed via mtime (every frontend file predates this
turn) and via a fresh full syntax re-check.

**Security:** `.env` ignored (PASS); no credentials exposed in tracked files (NO) —
the only DB-URL-shaped string anywhere is the explicit placeholder in `.env.example`.

**Stopping here as instructed** — no business schema, no seed, no auth, no migration
attempted beyond what's described above. Waiting for separate authorization before
"Database Schema + Migrations + Seed".

### Database Schema + Migrations + Seed — PARTIAL (schema/seed complete and
tested against an in-memory mock; migration/real-DB validation BLOCKED)

**Objective:** full Prisma business schema, idempotent seed, migration if PostgreSQL
is real. No API CRUD, no auth. Frontend untouched (re-verified via mtime: unchanged
since the routing-correction phase).

**Schema — 12 models, 3 enums** (`backend/prisma/schema.prisma`): `User`,
`Destination`, `Tour`, `TourImage`, `Deal`, `Booking`, `BookingItem`, `Review`,
`Favorite`, `ContactMessage`, `NewsletterSubscriber`, `FAQ`; enums `UserRole`
(USER/ADMIN), `BookingStatus` (PENDING/CONFIRMED/CANCELLED/COMPLETED),
`PaymentStatus` (PENDING/PAID/FAILED/REFUNDED). All primary keys are string UUIDs
(`@default(uuid())`, client-generated — no Postgres extension dependency). Money
fields (`Tour.price`, `Deal.price`/`oldPrice`, `Booking.totalAmount`,
`BookingItem.unitPrice`/`totalPrice`) are `Decimal @db.Decimal(10,2)`, never Float;
`Deal.discount` is `Int` (a percentage, not money — deliberately not Decimal).
`BookingItem.unitPrice` is stored independently of `Tour.price` specifically so
historical order totals survive later price changes, as required. Unique constraints:
`User.email`, `Tour.slug`, `Destination.slug`, `NewsletterSubscriber.email`, composite
`Review(userId, tourId)`, composite `Favorite(userId, tourId)`. Explicit `@@index` on
every FK/status field the spec called out (`Tour.destinationId`, `Deal.tourId`,
`Booking.userId`/`status`, `BookingItem.bookingId`/`tourId`, `Review.userId`/`tourId`,
`Favorite.userId`/`tourId`) — none duplicated on already-unique fields. `onDelete`
chosen deliberately per relation, documented inline in the schema: `Restrict` for
`Tour→Destination`, `User→Booking`, `User→Review`, `BookingItem→Tour` (protects
historical/financial data and prevents silent orphaning); `Cascade` for
`Tour→TourImage`, `Booking→BookingItem`, `Tour→Review`, `User→Favorite`,
`Tour→Favorite` (genuinely dependent/non-historical records); `SetNull` only on the
one optional relation, `Deal→Tour` (SetNull is invalid on a required relation in
Prisma — confirmed this is the only place it's used). **Known limitation, stated
honestly rather than faked**: Review.rating's 1–5 range has no schema-level CHECK
constraint — Prisma's stable schema language (the version pinned here) has no native
attribute for this; noted inline in the schema as something to add via a manually-
edited migration SQL file later, not silently skipped.

**Seed** (`backend/prisma/seed.js`, `backend/package.json`'s `prisma.seed` config +
`prisma:seed` script): reuses the actual FaroSair frontend content (all 8
destinations, all 4 tours, all 3 deals, all 5 FAQs, all 4 reviews' text/authors) —
duplicated into the seed file rather than imported, since frontend and backend are
separate deployable packages and the frontend must stay untouched. Adds 5 demo users
(4 matching the review authors + 1 admin) with an explicit, clearly-fake
`passwordHash` placeholder (`bcrypt` is intentionally not installed this phase — see
inline comment) plus 2 favorites and 1 booking+item to exercise every relation.
Idempotency: every entity upserts on a real unique key where the schema has one
(slug, email, or the composite unique on Review/Favorite); the 4 entities with no
natural unique key in this schema (`Deal`, `FAQ`, `Booking`, `BookingItem`,
`ContactMessage`) upsert on a fixed, hardcoded UUID instead — a standard seed pattern,
not a schema change.

**Referential integrity — deliberately left visible in the seed data:** the
`istanbul-two-worlds` deal has no matching tour in the seeded set (the frontend never
had an Istanbul tour), so it's seeded with `tourId: null` — a live demonstration that
`Deal.tourId` is genuinely optional, not just optional on paper.

**Validation — this is the section to read carefully, since large parts are
genuinely blocked and I'm not going to blur that:**
- Schema structural self-review: PASS — a script parsed `schema.prisma` and checked
  brace/paren balance (17/17, 103/103), duplicate field names per model (0), every
  `@relation(fields: [...])` reference has a matching scalar field (0 missing), and
  duplicate `@@unique`/`@@index` *within* each model (0 — my first pass falsely
  flagged the two `@@unique([userId,tourId])` as duplicates by comparing across
  models instead of within each one; caught and corrected before reporting).
- `prisma format` / `prisma validate` / `prisma generate`: **BLOCKED** — actually
  attempted all three via `npx --yes prisma ...`; each fails immediately because `npx`
  itself can't fetch the `prisma` package (403 from the registry, same root cause as
  every prior phase).
- PostgreSQL connection / migration: **BLOCKED** — no PostgreSQL binary or service
  exists in this sandbox, re-confirmed.
- **Seed logic — actually executed, not just read**: transformed `seed.js` to CJS
  with esbuild and ran its real code (not a reimplementation) against a hand-written
  in-memory mock of the Prisma Client, with a persistent-singleton store simulating a
  real database across multiple runs. Run once: produced exactly 5 users, 8
  destinations, 4 tours, 4 tour images, 3 deals, 5 FAQs, 4 reviews, 2 favorites, 1
  booking, 1 booking item, 1 contact message, 1 newsletter subscriber, zero thrown
  "Seed integrity error"s. Ran a second time against the *same* persistent mock:
  identical counts across all 12 collections — genuine idempotency evidence, not an
  assumption. Explicit relation-resolution checks after both runs: `Destination→Tour`,
  `Tour→TourImage`, `Tour→Deal` (non-null only), `User→Booking`, `Booking→BookingItem`,
  `BookingItem→Tour`, `User→Review`, `Tour→Review`, `User→Favorite`, `Tour→Favorite` —
  all PASS; the Istanbul deal's `tourId` confirmed `null` as intended; duplicate-check
  (emails, destination slugs, tour slugs, favorite pairs, review pairs) all 0. **This
  mock cannot verify** Postgres-level concerns a real database enforces — actual
  `Decimal` column typing/precision, real foreign-key constraint enforcement, or
  `prisma validate`'s own schema-language checks — only the seed script's own logic
  and the shape of the data it produces.
- JS syntax: PASS — `node --check` on all 11 backend `.js` files (10 existing + new
  `seed.js`), 0 failures. `package.json`: valid JSON, confirmed.
- No migration directory was created — correctly, since one was never actually
  generated by a real `prisma migrate dev` run; fabricating an empty
  `prisma/migrations/` folder would misrepresent what happened.

**Frontend changes:** none — confirmed via mtime (unchanged since the routing
correction) and zero `prisma`/`@prisma` references in `frontend/src`.

**Scope discipline confirmed:** grep across `backend/` for `bcrypt`/`jwt`/
`jsonwebtoken` returns only comments explaining they're deliberately deferred; the
only route registered anywhere is still `GET /api/health`; no CRUD endpoints exist.

**Stopping here as instructed.** No migration attempted against a real database, no
`prisma migrate reset` or other destructive command run or considered, no auth work
started. Waiting for separate authorization before "Authentication + Authorization".

### Authentication + Authorization — PARTIAL (all code complete and rigorously
code-reviewed; runtime execution BLOCKED — see honest reasoning below)

**Objective:** bcrypt + JWT-in-httpOnly-cookie auth, Zod validation, `requireAuth`/
`requireRole` middleware, register/login/me/logout, minimal admin-only test route.
Frontend untouched (confirmed via mtime — unchanged since the routing-correction
phase — and a zero-result grep for any auth-related string in `frontend/src`).

**Created:** `src/utils/jwt.js` (`signAuthToken`, `verifyAuthToken`, `AUTH_COOKIE_NAME`,
`getAuthCookieOptions` — cookie name/options centralized here specifically so set
and clear can never drift out of sync), `src/validation/auth.validation.js`
(`registerSchema`, `loginSchema` — no `role` field accepted, ever),
`src/middleware/auth.middleware.js` (`requireAuth`, built on the existing
`asyncHandler` rather than a new try/catch pattern), `src/middleware/role.middleware.js`
(`requireRole(...roles)`), `src/controllers/auth.controller.js` (`register`, `login`,
`logout`, `me`, `adminCheck`), `src/routes/auth.routes.js`.

**Updated:** `src/config/env.js` (added `jwtSecret`/`jwtExpiresIn`; `JWT_SECRET`
has no safe default in any environment — the process throws at startup if it's
missing, unlike `CLIENT_URL` which has a dev-only fallback); `.env.example`
(`JWT_SECRET` placeholder with an explicit "generate your own, don't reuse this"
warning + a one-liner showing how, `JWT_EXPIRES_IN=7d`); `src/app.js` (added
`cookie-parser` — required for `req.cookies` to exist at all; CORS's
`credentials: true` was already correct from the Backend Foundation phase, no
change needed there); `src/routes/index.js` (mounted `/auth`); `prisma/seed.js`
(replaced the non-functional placeholder string with a real `bcrypt.hash()` of a
fixed, clearly-documented dev-only password — see `README.md`'s new "Seed dev
login" section); `package.json` (added `bcrypt`, `jsonwebtoken`, `zod`,
`cookie-parser`); `README.md` (endpoints list, setup step 4 now mentions
`JWT_SECRET`, seed dev-login credentials documented with an explicit "never reuse
this anywhere real" warning).

**Security review — code-reviewed line by line, with grep evidence for each claim:**
- `passwordHash` never appears in any `res.json`/`res.send` call anywhere — every
  response goes through an explicit `toSafeUser()` allow-list (`id`/`name`/`email`/
  `role` only, chosen over "delete passwordHash and return the rest" specifically so
  a future field added to the model can't leak by default) or `req.user`, which
  `requireAuth` populates via a Prisma `select` that excludes `passwordHash` at the
  query level, not just at the response-shaping level.
- Registration cannot create an ADMIN: the Zod `registerSchema` has no `role` field
  at all (not "ignored if present" — genuinely absent from the schema), and
  `prisma.user.create()` hardcodes `role: 'USER'` regardless of request body content.
- Login returns the identical message and status (`401 Invalid email or password`)
  whether the email doesn't exist or the password is wrong, **and** always runs
  `bcrypt.compare()` against either the real hash or a fixed dummy hash — so a
  timing difference can't reveal which case occurred either.
- JWT payload is `{ sub: id, role }` only — confirmed via grep, nothing else is ever
  passed to `jwt.sign()`.
- `env.jwtSecret` is read in exactly one file (`utils/jwt.js`); no literal secret
  string exists anywhere in the codebase.
- **`errorHandler` logs the `Error` object (message/stack), never `req.body`** —
  checked specifically because a failed login/register validation error is exactly
  the moment a plaintext password could leak into server logs if the error path
  logged the request body; it doesn't. `morgan`'s dev/combined formats log
  method/url/status/timing, not bodies, so this path is clean too.
- Cookie `set` (register, login) and `clear` (logout) both call the same
  `getAuthCookieOptions()` — can't drift out of sync the way hand-duplicated options
  commonly do.
- Zero `localStorage`/`sessionStorage` anywhere in the backend (this is server-side
  code, so this should be — and is — trivially zero).

**Validation — read this section carefully, since large parts are genuinely
untested, not just "probably fine":**
- JS syntax: PASS — `node --check` on all 17 backend `.js` files (up from 11), 0
  failures.
- Imports/exports: PASS — 0/17 unresolved relative imports; every new named
  export manually cross-checked against every importer (`signAuthToken`,
  `verifyAuthToken`, `AUTH_COOKIE_NAME`, `getAuthCookieOptions`, `registerSchema`,
  `loginSchema`, `requireAuth`, `requireRole`, `register`/`login`/`logout`/`me`/
  `adminCheck`) — all match.
- `package.json`: valid JSON.
- **Actual runtime execution of the auth flow (register/login/me/401/403/logout):
  NOT RUN, and deliberately not faked with a mock.** For the seed phase, I mocked
  `@prisma/client` and actually executed the real seed logic against it, because
  upsert/create/findFirst are simple, well-understood CRUD semantics I could
  faithfully replicate. `bcrypt`, `jsonwebtoken`, and especially `zod`'s chainable
  schema API are a different kind of dependency — hand-rolling a mock for them
  risks producing a "PASS" that reflects my mock's behavior, not the real library's,
  which would be worse than honestly reporting BLOCKED. None of `bcrypt`/
  `jsonwebtoken`/`zod`/`cookie-parser` exist anywhere in this sandbox (checked).
  `npm install` still fails (fresh `npm ping` re-confirmed the registry 403 just
  now). So: register/duplicate-register/login-correct/login-wrong/me-without-cookie/
  me-with-cookie/logout/USER-on-admin-route/ADMIN-on-admin-route/invalid-JWT are all
  **BLOCKED** — verified by static code review only (see Security review above), not
  by an actual request/response.
- Prisma validate/generate: **BLOCKED** (same registry 403, consistent with every
  prior phase).
- PostgreSQL connection: **BLOCKED** (still no PostgreSQL in this sandbox).

**Frontend changes:** none.

**Scope discipline confirmed:** the only new routes are the 5 under `/api/auth`;
grep for `/api/tours`, `/api/destinations`, `/api/bookings`, `/api/reviews` across
`backend/src` returns nothing — no business CRUD was added.

**Stopping here as instructed.** Waiting for separate authorization before "Real API
+ Frontend Integration".

### SUB-PHASE 9.1 — Frontend API Service Layer → Real Backend — PARTIAL (all
code complete and statically verified; runtime execution BLOCKED)

**Objective:** wire the existing 7 frontend services to a real Express+Prisma
backend via one small API client, preserving component-facing contracts, with
genuine loading/error states (no silent seed-data fallback). Auth, Prisma schema,
and visual design untouched.

**Backend — 7 new public GET-only resources** (`destinations`, `tours`, `deals`,
`reviews`, `faq`, `gallery`, `stats`), each a `controller.js` + `routes.js` pair
mounted in `routes/index.js`, following the exact pattern already established by
`health`/`auth` (controllers call `prisma` directly — no new abstraction layer
introduced on the backend, matching the existing architecture rather than inventing
a parallel one). `destinations`/`tours`/`deals` use real Prisma reads; `tours`
implements all 5 planned query params (`destination` → Destination.slug,
`minPrice`/`maxPrice` → `Tour.price` range, `q` → case-insensitive title/description
search, `sort` → price_asc/price_desc/newest). `reviews` includes only safe `User`
fields (`select: { id, name }` — never `passwordHash`, never `email`, since this is
an unauthenticated public endpoint). **`gallery` and `stats` have no Prisma model**
— neither was ever specified across the schema phase (gallery is stock photography,
stats are marketing copy, not business data) — so these two serve static content
directly from the controller rather than a database table. This is a deliberate,
documented choice (inline comments in both controllers) rather than an
undisclosed shortcut; revisit if either ever needs to be admin-editable.

**Frontend — API client + 7 services rewritten + shared hook:**
`services/api/client.js` is the single `fetch` wrapper (base URL from
`VITE_API_URL`, `credentials: 'include'` for the httpOnly auth cookie, a
`{ success, data }`-aware `ApiError` class, distinct handling for network failure vs.
non-2xx vs. malformed JSON vs. a 2xx response that doesn't match the expected shape)
— confirmed via grep to be the *only* file calling `fetch(` anywhere in the
frontend. `hooks/useAsyncData.js` is one small loading/success/error state hook
shared by all 7 components (not a data-fetching library — no React Query, no
Redux, matching the "don't over-engineer" instruction). `components/common/
AsyncState.jsx` renders the loading/error/empty text, reusing the existing
`.section-desc` class so **no new CSS was introduced**.

**A real field-shape mismatch was found and fixed properly, not papered over:**
the actual Prisma `Destination`/`Tour`/`Deal` models don't match the old static
demo data 1:1. Specifically:
- `Destination` has `name`/`slug`, not the old `title`/`code`/`rating`/`price` —
  `code`/`rating`/`price` don't exist anywhere in the real schema. Fixed in
  `destinationsService.js` (rename `name`→`title`) plus two small, necessary guards
  added to `Destinations.jsx` (`rating.toFixed(1)` on `undefined` would have
  **thrown**; a raw price template literal would have rendered the literal text
  "undefined") — not cosmetic changes, crash/content-correctness fixes.
- `Tour` has no flat `image` field (images live in the related `TourImage[]`) and
  no `rating` — fixed by mapping `image` from `images[0]?.url` (genuinely real data,
  every seeded tour has one) in `toursService.js`, plus the same kind of guard in
  `FeaturedTours.jsx` for the missing rating.
- `Deal` has `price`/`discount`(numeric)/`endsAt`(absolute timestamp), not the old
  `newPrice`/`discountLabel`(string)/`hours`(relative). Fully reconciled inside
  `dealsService.js`'s mapping function alone — **zero changes needed to
  `HotDeals.jsx` or the existing `useCountdown` hook**, since the relative-hours
  value it expects is now computed once per fetch from the real `endsAt`.
- `Review` has no `location` field (neither does `User`) — `reviewsService.js` maps
  it to an empty string rather than fabricating one; `initials` **is** genuinely
  derived from the real user's name, not invented.
- **Also documented, not fixed (would require a schema change this sub-phase can't
  make):** `Deal` has no `slug`, so `/deals/:id` URLs now use real database UUIDs
  instead of the old readable slugs like "dubai-5star-sea" — a genuine, visible URL
  shape change, called out explicitly in `dealsService.js` rather than hidden.
  `Destination`/`Tour` don't have this problem — their services remap `id` to the
  real `slug`, so those URLs are unchanged.

**No-silent-fallback rule enforced:** none of the 7 services import from `src/data`
anymore (confirmed via grep — 0 remaining imports outside `data/` itself and the one
pre-existing, intentional `WhyChooseUs.jsx` exception, unchanged from Phase 2). A
failed fetch rejects the promise, which `useAsyncData` turns into a real error state
rendered via `AsyncState` — not a fallback to local seed data.

**Validation performed:**
- Syntax: PASS — frontend (102 files incl. CSS brace-balance, 0 errors) and backend
  (26 `.js` files via `node --check`, 0 failures).
- Imports/exports: PASS — 0/80 unresolved in frontend, 0 unresolved in backend;
  every new service's `apiGet()` call cross-checked by hand against its mounted
  backend route (all 10 match exactly).
- Unused imports: PASS (0/80 flagged).
- `react-router-dom`: absent (confirmed).
- Auth-token-in-browser-storage: **0 occurrences** — the only `localStorage` hits
  anywhere in the frontend are in the pre-existing (Phase 2) `useWishlist.js`, which
  stores favorited tour ids, not an auth token; this is unrelated to and predates
  this sub-phase, called out explicitly so it isn't mistaken for a violation.
- `passwordHash` in public responses: confirmed absent from every new controller's
  Prisma `select`; the one grep hit in `reviews.controller.js` is a code comment
  ("never passwordHash, never email"), not a field reference.
- Duplicated fetch logic: 0 — `fetch(` appears in exactly one frontend file.
- Every dynamic `:id` interpolation uses `encodeURIComponent` (3/3 checked).
- Every new backend route is `GET`-only (10/10 checked) — no mutation endpoints
  exist yet.
- CORS/cookie config (`credentials: true`, `cookie-parser`, `requireAuth`/
  `requireRole`, `auth.controller.js`) confirmed unmodified this sub-phase — not via
  file-mtime (a check I'm retiring for cross-turn comparisons after noticing this
  session's mtimes don't reliably reflect original edit history, likely due to a
  sandbox restore point resetting some timestamps) but by content: no tool call in
  this sub-phase touched any of those files, and their content still matches what
  the Authentication phase produced.
- **Runtime (register/login flows aside — this sub-phase's own new endpoints):
  `GET /api/destinations`, `/tours` incl. query params, `/deals`, `/reviews`,
  `/faq`, `/gallery`, `/stats`, and the frontend actually rendering real fetched
  data end-to-end: NOT RUN.** `npm install` still fails (fresh `npm ping` re-run,
  still 403) and no PostgreSQL exists in this sandbox (re-confirmed). Static
  review and the field-shape reconciliation work above are real engineering, not a
  substitute for actually starting both servers and hitting them — that remains
  entirely unverified until you do it locally.

**Frontend changes:** the 7 services + 7 home components + 3 new small files
(`api/client.js`, `useAsyncData.js`, `AsyncState.jsx`) + `.env.example`. Visual
design, CSS, `Hero`/`Header`/`Footer`/`Layout`, routing (`App.jsx`), and all
non-home-section components are untouched.

**Known limitations (all documented above, repeated here for visibility):**
gallery/stats aren't database-backed; Deal URLs changed shape; Destination has no
rating/price/code; Tour has no rating; Review has no location.

**Stopping here as instructed — not continuing to sub-phase 9.2 automatically.**

### PHASE 9.2 — Complete Public Data API Integration — PARTIAL (all code
complete and statically verified; runtime execution BLOCKED)

**Objective:** finish the public read-only integration as one coherent pass —
deterministic/safe server-side filtering, complete detail pages, dedupe or
justify remaining data duplication, full fresh validation. No auth/mutation work.

**Audit finding:** most of 9.1's backend query-param handling was already correct
(guarded `Number.isNaN` checks on min/maxPrice, a `SORT_OPTIONS` lookup with a safe
default for garbage `sort` values, plain-string `findUnique` lookups that return
`null` rather than throwing for a garbage id — none of these needed fixing). What
was genuinely missing: **non-deterministic sort** (single-key `orderBy` can tie),
and **incomplete detail pages** (still `PagePending` stubs from Phase 1).

**Backend changes (small, targeted, each independently justified):**
- `tours.controller.js`, `destinations.controller.js`, `deals.controller.js`,
  `reviews.controller.js`, `faq.controller.js`: every `orderBy` now includes `id`
  as a secondary sort key — "sorting must be deterministic" was called out
  explicitly, and a single-key sort can genuinely tie (two records created in the
  same millisecond, or identical prices).
- `destinations.controller.js`: `getDestination` now `include`s the destination's
  `tours` (ordered the same deterministic way) — needed to complete the
  destination detail page; `listDestinations` deliberately does **not** include
  this, to avoid overfetching every destination's full tour list on the homepage
  grid.

**Frontend changes:**
- `toursService.js`: exported its existing `mapTour` function (previously
  module-private) so `destinationsService.js` can reuse the exact same
  slug-remapping logic for the newly-included nested `tours` array, instead of a
  second copy that could drift.
- `destinationsService.js`: `mapDestination` now also maps `tours` when present
  (only on the detail response).
- **3 detail pages completed** (`TourDetails.jsx`, `DestinationDetails.jsx`,
  `DealDetails.jsx`) — previously `PagePending` stubs, now real pages: loading via
  `useAsyncData`, not-found via a `null` result (a real, valid answer from
  `getXById`, not an error), API-error state, and the actual fetched data
  rendered using **only existing CSS classes and design tokens** (`.container`,
  `.eyebrow`, `.section-desc`, `.btn`/`.btn-primary`, `.img-wrap`,
  `.deal-countdown`/`.deal-price`, `var(--dark-blue)` etc.) plus minimal inline
  layout (two-column grid, spacing) — the same pattern `NotFound.jsx` already
  established in Phase 1, not a new stylesheet. `DealDetails.jsx` reuses the
  existing `useCountdown` hook unchanged, fed by `dealsService.js`'s already-real
  `hours` value (computed from the genuine `endsAt` column) — the countdown here
  is exactly as server-authoritative as the homepage's, no invented expiry.
  `.btn-outline`'s white-on-white styling (a pre-existing quirk on light
  backgrounds, documented back in Phase 2) is overridden with an inline color from
  the existing token palette specifically for these *new* usages — this isn't
  "fixing" the original quirk (still present and untouched on `FAQSection`), it's
  making a brand-new button legible, using only existing design tokens.

**Data duplication — audited, and one earlier decision reversed:** confirmed all 7
frontend `data/*.js` files are now fully unreferenced by any executable code
(services migrated to the API in 9.1; `backend/prisma/seed.js`'s mentions of them
are comments, not imports). I initially deleted `gallery.js`/`stats.js` as
"obviously dead," but on review that directly conflicts with this project's own
repeated, explicit rule ("do not delete seed files blindly," "do not delete data
simply because an API exists") — I'd applied a weaker standard to those two files
than to the other five for no real reason. **Restored both.** All 7 data files now
remain in the repo as unreferenced reference/historical data, treated consistently.

**Naming-convention note:** this phase's instructions list the target service
names as `getFaq()`/`getGallery()`, but the actual working functions (built in
Phase 2, confirmed still in place) are `getFaqItems()`/`getGalleryItems()`. Per
the file-change rule at the top of this phase's own instructions ("do not rename
working functions... do not refactor without a concrete reason"), I left them as
`getFaqItems`/`getGalleryItems` rather than renaming — flagging the discrepancy
here instead of silently picking one interpretation.

**Validation — fresh, not reused from prior reports:**
- Backend syntax: PASS (31/31 files, `node --check`).
- Frontend syntax/JSX: PASS (102 files incl. CSS brace-balance, 0 errors).
- Imports/exports: PASS (0/80 unresolved in frontend, including the new
  `mapTour` cross-service export/import); unused-import scan PASS (0/80 flagged).
- Security: `passwordHash` confirmed confined to `auth.controller.js` internals
  (hash creation, comparison) — never in a public GET response; no `.env`
  committed; `console.log` only in `logger.js`'s own definition; the only
  `localStorage` usage anywhere is the pre-existing (Phase 2) wishlist feature,
  unrelated to auth tokens.
- Architecture: `fetch(` appears in exactly one file; zero real Prisma references
  in frontend (the 3 grep hits are doc-comments pointing at the schema file path,
  not imports); `react-router-dom` absent; `Header`/`Footer` mounted only in
  `Layout.jsx`; no circular dependency (`destinationsService` → `toursService` is
  one-directional; the reverse doesn't exist).
- Regression: homepage section order unchanged (12 sections, same order); no CSS
  files touched or added this phase.
- **Runtime — every endpoint listed in the spec's runtime-test section: NOT RUN.**
  Re-confirmed immediately before writing this report: `npm ping` still 403, no
  `psql` binary anywhere in this sandbox. Static correctness (including the new
  deterministic-sort and include-tours logic) is unverified against an actual
  database — that remains real work for you to do locally.

**Detail pages:** `/tours/:id`, `/destinations/:id`, `/deals/:id` completed this
phase. No other stub pages (`/login`, `/register`, `/profile`, `/admin/*`, etc.)
were touched — out of scope per this phase's explicit boundaries.

**Stopping here as instructed — not continuing to 9.3 automatically.**

### PHASE 9.3 — Real API + Frontend Integration: remaining public features
— PARTIAL (all code complete and statically verified; runtime execution BLOCKED)

**Objective:** replace every remaining demo/local-state frontend implementation
(favorites via localStorage, booking stub, fake-timeout contact/newsletter,
GET-only reviews) with real backend integration, using only the existing Prisma
models — no schema changes were needed or made.

**Backend — 4 new resources + 1 extended:**
- `favorites.controller.js`/`.routes.js` — `GET/POST/DELETE /api/favorites` (list
  mine, add, remove), all three scoped to `req.user.id` via `requireAuth`; add/
  remove are idempotent (upsert / `deleteMany`) rather than erroring on a repeat
  action, matching how the old visual-only toggle never errored either.
- `bookings.controller.js`/`.routes.js` — `POST/GET /api/bookings`. Creates
  `Booking`+`BookingItem` together inside a `prisma.$transaction`, snapshotting
  `unitPrice` from the tour's *current* price at booking time (the historical-
  pricing behavior the schema was built for). `status`/`paymentStatus` both start
  at `PENDING` — no payment processing exists or is faked.
- `contact.controller.js`/`.routes.js` — `POST /api/contact`, public, Zod-validated.
- `newsletter.controller.js`/`.routes.js` — `POST /api/newsletter/subscribe`,
  public, Zod-validated, upsert-idempotent on email (subscribing twice is a
  success, not a 409 — matches the favorites-add reasoning).
- `reviews.controller.js` extended with `createReview` — `POST /api/reviews`,
  `requireAuth`, `userId` always from `req.user.id` (the Zod schema has no
  `userId` field for a client to even attempt sending), pre-checks the
  `(userId, tourId)` unique constraint to return a clean `409` instead of a raw
  Prisma constraint-violation error.
- New shared helpers in `httpErrors.js`: `badRequestError`, `conflictError`,
  `zodBadRequest` (formats a Zod `safeParse` failure consistently across all 4
  new write controllers) — every error still flows through the existing
  `errorHandler`, no parallel error system introduced.
- All 8 new/changed routers mounted in `routes/index.js`.

**Frontend — architecture additions:**
- `api/client.js` extended with `apiPost`/`apiDelete` (same single file/export
  set as Phase 9.1's `apiGet` — internally refactored to share one `request()`
  function; `apiGet`'s existing signature and behavior are unchanged for every
  existing caller).
- `context/AuthContext.jsx` — the one auth mechanism for the app. Checks
  session validity via `GET /auth/me` on load (the httpOnly cookie is invisible
  to JS, so this is the only way to know), exposes `user`/`status`/`login`/
  `register`/`logout`. Wired into `App.jsx` around `RouterProvider` — the only
  change to that file.
- `components/common/RequireAuth.jsx` — shared loading/guest-prompt/children gate,
  used by `Profile`, `Bookings`, `Favorites`, `Booking`, and the review form,
  instead of duplicating the same three-state block five times.
- `components/common/TourCard.jsx` — extracted from `FeaturedTours.jsx` (which
  now imports it) so the new `Tours.jsx` listing page doesn't duplicate the card
  markup; still imports `FeaturedTours.css` (unchanged) rather than a new
  stylesheet.
- 5 new services (`authService`, `favoritesService`, `bookingsService`,
  `contactService`, `newsletterService`) + `reviewsService.createReview` — each a
  thin wrapper over `apiGet`/`apiPost`/`apiDelete`, doing backend→frontend
  mapping at the service boundary (e.g. `favoritesService` reuses `toursService`'s
  exported `mapTour` for the nested `tour` on each favorite, same pattern as
  Phase 9.2's `destinationsService`).
- `hooks/useFavorites.js` — replaces `useWishlist.js` (deleted — explicitly
  authorized by this phase's own instruction A, not an arbitrary removal like the
  gallery/stats episode in 9.2). Backend-backed, optimistic toggle with rollback
  on failure; toggling while logged out returns `{ requiresAuth: true }` instead
  of silently no-op'ing, which `TourCard` uses to redirect to `/login` — the
  heart-icon button itself is visually unchanged.

**Frontend — demo/local-state implementations replaced:**
- `useWishlist` (localStorage) → `useFavorites` (real API), as above.
- `Booking.jsx` (`PagePending` stub) → real form: reads `?tour=` from
  `useSearchParams`, loads the tour, gated by `RequireAuth`, submits via
  `bookingsService.createBooking`, shows the created booking's id/status/total on
  success. Card "Забронировать" buttons now route to `/booking?tour=<slug>`
  instead of `#contact` wherever a real detail/list context exists
  (`Tours.jsx`, `TourDetails.jsx`) — the homepage's `FeaturedTours` keeps its
  original `#contact` scroll-CTA unchanged, since that's still the right
  behavior on a single-page hero flow.
- `ContactSection.jsx`'s fake `setTimeout` → real `POST /api/contact`. The
  `ContactMessage` schema has `{name, email, subject, message}`, no `phone` —
  the visible form is unchanged; `phone` is folded into the message body and a
  fixed `subject` is used, a mapping decision at the service-call site, not a UI
  change. Email is now `required` on the input (it wasn't in the demo version) —
  the one genuine, small behavior change, made because the real backend cannot
  store a message without a valid email; invisible until someone tries to submit
  without one.
- `Footer.jsx`'s newsletter fake `setTimeout` → real
  `POST /api/newsletter/subscribe`.
- `reviews`: GET-only → GET + authenticated POST. A review-submission form was
  added to `TourDetails.jsx` (gated by `RequireAuth`), not to the homepage
  `ReviewsSection` (a testimonial slider, not a submission surface — preserving
  homepage structure per this phase's own "N. Preserve" instruction).
- `Tours.jsx` (`PagePending` stub) → real listing page with a server-side filter
  form (destination/minPrice/maxPrice/q/sort — the exact params `tours.controller.js`
  already supported end-to-end since Phase 9.2). Draft/applied filter state is
  split so filtering happens on form submit, not per keystroke — no client-side
  filtering of an over-fetched list, and no new library.
- `Login.jsx`, `Register.jsx`, `Profile.jsx`, `Bookings.jsx`, `Favorites.jsx`
  (all `PagePending` stubs) → real pages, all using the one `AuthContext`/
  `requireAuth` architecture, no second auth mechanism.

**Deals countdown (item H): verified already correct, untouched.**
`dealsService.js` (from Phase 9.1/9.2) already computes `hours` from the real
`Deal.endsAt` column — genuinely server-authoritative, not a fresh
client-generated expiry on each load. Confirmed via content review; no changes
were needed here this phase.

**Validation — fresh, full pass per this phase's own 20-point checklist:**
- (1) Backend syntax: PASS — 44/44 files, `node --check`.
- (2) Frontend syntax/JSX incl. CSS brace-balance: PASS — 110/110 files, 0 errors.
- (2 cont'd) Relative + dynamic imports: PASS — 0/88 unresolved.
- (3) Export/import consistency: PASS — every new service/component's exports
  manually cross-checked against every importer; also an automated unused-import
  scan (0/88 flagged).
- (4/5) No duplicated fetch implementation: PASS — `fetch(` appears in exactly
  one file, `api/client.js`, across the whole frontend.
- (6) No `react-router-dom`: PASS.
- (7) No JWT/localStorage auth storage: PASS — `localStorage`/`sessionStorage`
  now return **zero** matches anywhere in the frontend (the only prior usage,
  `useWishlist.js`, is deleted).
- (8) No `passwordHash` in public responses: PASS — confined to `auth.controller.js`
  internals (hashing/comparison); the one hit in `reviews.controller.js` is a
  comment, not a field reference.
- (9) Every protected endpoint has `requireAuth`: PASS — verified route-by-route
  (favorites all 3, bookings both, reviews POST); contact/newsletter POST
  correctly have **no** `requireAuth` (public by design).
- (10/11) User-owned resources scoped to `req.user.id`, never a client-supplied
  `userId`: PASS — grep-verified across favorites/bookings/reviews controllers;
  `role` confirmed never settable by the client at registration (no `role` field
  in `registerSchema` at all).
- (12) Zod validation on every new write endpoint: PASS — 4/4 (`createBooking`,
  `createContactMessage`, `subscribeNewsletter`, `createReview`).
- (13) Correct HTTP status codes: PASS — 200 for reads/idempotent-success, 201
  for creates, consistently.
- (14) Consistent error responses: PASS — every new controller throws through
  the shared `httpErrors.js` helpers into the existing `errorHandler`; no second
  error-handling system.
- (15) No regression to existing homepage routes/components: PASS — `Home.jsx`'s
  12-section order unchanged; `App.jsx`'s route count unchanged (26) aside from
  the `AuthProvider` wrapper; zero CSS files touched this phase; `Header`/`Footer`
  still mounted only in `Layout.jsx`.
- (16) No `console.log`/debug code: PASS — only `logger.js`'s own definition.
- (17) No secrets/`.env` committed: PASS.
- (18) Prisma relations reviewed: PASS — every new/changed controller's
  `include`/`select` reviewed by hand (see per-controller notes above); no
  over-fetching of sensitive `User` fields anywhere.
- (19) Seed remains valid/idempotent: N/A-but-confirmed — `seed.js` was not
  touched this phase (568 lines, unchanged), because no schema changes were
  needed.
- (20) Runtime tests: **NOT RUN.** Re-confirmed immediately before writing this
  report — `npm ping` still returns 403, no `psql` binary anywhere in this
  sandbox. Every one of the write endpoints (favorites, bookings, contact,
  newsletter, review creation) and the full login→favorite/book→view-in-profile
  user journey remain genuinely unverified against a real server. This is real,
  unavoidable follow-up work for you to do locally — static correctness is not a
  substitute for it.

**Known limitations carried forward, unchanged:** gallery/stats still
static-content (no Prisma model), Deal URLs still use UUIDs, Destination/Tour
still lack `rating`, Destination still lacks `price`/`code`, Review still lacks
`location` — none of these blocked this phase, so none were "fixed" with
invented fields, per this phase's own explicit instruction M.

**Consciously not touched, and why:** `Header.jsx` (no login/profile nav link
added — out of scope, avoids touching the one piece of UI every page shares);
admin pages/routes (explicitly out of scope); payment processing (explicitly
out of scope, `Booking.paymentStatus` stays `PENDING`); `seed.js`/`schema.prisma`
(no change was needed).

**Stopping here as instructed — not continuing to Phase 10/Admin/Security/QA.**

### PHASE 9.3 — Final Integration Verification — PASS (real bugs found and
fixed; runtime execution still genuinely BLOCKED)

**Objective:** one comprehensive fresh verification pass over the entire project
before starting the Admin Panel — not a redo of 9.3, not cosmetic refactoring.
Read every controller against the actual schema, every service against its
controller, every page against its service, and fix only what's genuinely broken.

**Real bugs found and fixed:**

1. **Critical — all three detail pages were completely broken.**
   `TourDetails.jsx`, `DestinationDetails.jsx`, and `DealDetails.jsx` all passed
   `getXById` directly to `useAsyncData` (e.g. `useAsyncData(getTourById, [id])`).
   `useAsyncData` calls `fetchFn()` with **zero arguments** — so `id` from
   `useParams()` was captured in a local variable but never actually reached the
   fetch call. Every visit to `/tours/:id`, `/destinations/:id`, or `/deals/:id`
   was silently calling e.g. `getTourById(undefined)` → `GET /tours/undefined` →
   always "not found," regardless of the real URL. Fixed by wrapping each in an
   arrow function (`() => getTourById(id)`), matching the pattern `Booking.jsx`
   already used correctly. Swept every other `useAsyncData(` call site in the
   project (15 total) to confirm this was the only occurrence — every other bare
   function passed (`getDestinations`, `getFavorites`, `getMyBookings`, etc.)
   genuinely takes zero arguments, so those were correct as written.
2. **`DealDetails.jsx`'s booking CTA ignored the deal's linked tour.** Clicked
   "Забронировать" always went to plain `/booking` with no context, even when
   `deal.tour` existed — landing on "please pick a tour first" instead of
   carrying the tour through, unlike the equivalent buttons on `TourDetails.jsx`/
   `Tours.jsx`. Fixed to link to `/booking?tour=<slug>` when `deal.tour` is
   present.
3. **`TourCard.jsx`'s wishlist click handler had no error handling** — a
   rejected `toggleFavorite()` call (which `useFavorites` genuinely throws after
   rolling back its optimistic update) was an unhandled promise rejection in a
   fire-and-forget `onClick`. Wrapped in try/catch; the UI was already correct
   either way (the hook's own rollback handles that), this just stops the
   unhandled-rejection console error.
4. **`Footer.jsx`'s newsletter error handling was self-contradicting and its
   success copy was stale.** The `catch` block did
   `setEmail(err instanceof ApiError ? '' : email)` — but every failure the API
   client can throw (network failure, HTTP error, malformed response) is an
   `ApiError` instance, so this always evaluated true and always wiped the
   user's typed email on any failure, forcing a retype even on a transient
   error. Separately, the success-state placeholder still read **"Демо-режим —
   форма ещё не подключена"** ("Demo mode — form not yet connected") — literally
   false, left over from before this form was wired to the real API in the
   previous phase and never updated. Fixed both: errors now preserve the typed
   email, and the success placeholder correctly reads "Спасибо за подписку!".
   Also wired the already-declared-but-unused `submitting` state to actually
   disable the submit button (was tracked but never read anywhere — no
   double-submit protection existed despite the state existing for it).

**Files changed (5), each for one of the bugs above:** `TourDetails.jsx`,
`DestinationDetails.jsx`, `DealDetails.jsx` (bug 1, + bug 2 for DealDetails only),
`TourCard.jsx` (bug 3), `Footer.jsx` (bug 4). No files created or deleted this
pass — this was a fix-only pass, not new feature work.

**Backend ↔ Prisma compatibility:** every controller re-read fresh against a
fresh read of `schema.prisma`, field by field — `auth`, `bookings`, `contact`,
`deals`, `destinations`, `faq`, `favorites`, `gallery`(static, correctly),
`health`, `newsletter`, `reviews`, `stats`, `tours`. Every selected/included/
created field exists on its model; every enum value used (`'USER'`, `'PENDING'`,
etc.) matches `schema.prisma` exactly; every relation filter (e.g.
`where: { destination: { slug } }`, compound-unique lookups like
`userId_tourId`) is valid Prisma syntax for the actual declared relations/
`@@unique`s. No mismatches found — the schema-vs-controller work from 9.2/9.3
held up under a fresh, skeptical re-read.

**ID consistency end-to-end:** traced every `.dbId` usage from `TourCard` →
pages → services → backend (9 call sites) — every write endpoint (favorites
add/remove, booking creation, review creation) is fed the real database UUID via
`tour.dbId`, never the slug (`tour.id`); every read/navigation uses the slug via
`tour.id`. No mixups found.

**API contract consistency:** re-read every frontend service against its
controller's actual response shape (not assumed from memory) for all 12 resource
groups listed in the spec. `Bookings.jsx` correctly uses the *raw* (unmapped)
`item.tour.slug` for its link — `bookingsService.js` deliberately doesn't remap
tour ids the way `toursService` does, and the page was already written to match
that, correctly.

**Authentication:** `AuthContext.jsx` re-read in full — session check on load,
login/register/logout flows, `RequireAuth` gating pattern (confirmed it prevents
the wrapped child component from mounting — and therefore from firing its data
fetch — until authentication is confirmed, across all 4 pages that use it plus
the review form) — no bugs found here.

**Security regression scan:** no hardcoded secrets, no `.env` committed, CORS
still origin-restricted (not `*`), the only raw SQL is the parameterless
`SELECT 1` health check, zero `localStorage`/`sessionStorage` usage anywhere in
the frontend (confirms the wishlist migration left nothing behind),
`passwordHash` still confined to `auth.controller.js` internals.

**Dead/duplicate implementation scan:** no `useWishlist` references remain
(only the visually-named `handleWishlistClick`/`.wishlist-btn`, which is
existing CSS/UX naming, not leftover logic), no stale `SectionPending` usage,
exactly one `fetch(` call site in the whole frontend, no `react-router-dom`.

**Validation — fresh, after every fix above:**
- Backend syntax: PASS (all files, `node --check`).
- Frontend syntax/JSX/CSS: PASS (110 files, 0 errors).
- Imports: PASS (0/88 unresolved). Unused imports: PASS (0/88 flagged).
- `package.json` (both): valid JSON.
- `prisma validate`: **BLOCKED** — directly attempted, still 403 on the registry.
- `npm run build`: **BLOCKED** — directly attempted; fails because `vite` isn't
  installed (`node_modules` doesn't exist anywhere in the project — `npm install`
  has never been able to run in this sandbox).
- PostgreSQL: still absent from this sandbox (`psql` not found).
- `schema.prisma` structural re-check: 12 models, 3 enums, braces balanced
  (17/17) — unchanged this pass, re-verified anyway.

**Runtime tests: NOT RUN**, for the same reason as every phase since Backend
Foundation — no network access to install dependencies, no PostgreSQL available.
Everything above this line is static/code-level verification, which is real and
did catch a genuinely severe bug (the broken detail pages), but is not a
substitute for actually starting both servers and clicking through the app —
that remains true, unverified work for you to do locally.

**Known limitations:** unchanged from 9.3 (gallery/stats static-content,
Deal UUIDs, missing rating/price/code/location fields).

**Stopping here as instructed — not starting the Admin Panel in this pass.**

### PHASE 10 — Admin Panel — PARTIAL (all code complete and statically verified;
runtime execution genuinely BLOCKED)

**Objective:** protected `/admin/*` area for ADMIN users — dashboard, CRUD for
tours/destinations/deals, bookings status management, users role management,
reviews/messages moderation — real backend endpoints, no fake local-array UI,
no Prisma schema changes.

**Backend — new `/api/admin/*` API (22 routes, all behind one guard):**
`middleware/requireAdmin.js` — a composed `[requireAuth, requireRole('ADMIN')]`
array, applied once via `router.use(...requireAdmin)` as the very first
statement in `admin.routes.js` (verified: no route is defined before it, so
nothing is reachable without both checks). `utils/pagination.js` — safe
page/limit parsing (clamps garbage input rather than crashing `skip`/`take`).
`validation/admin.validation.js` — every field cross-checked against a fresh
read of `schema.prisma`; enum values (`BookingStatus`, `PaymentStatus`,
`UserRole`) copied verbatim, not re-typed from memory.

8 controllers under `controllers/admin/`: **dashboard** (8 concurrent
`Promise.all` `count()` queries, no record downloading — and see the
`messages` note below); **tours** (paginated list with destination join,
create/update/delete, validates `destinationId` exists, enforces slug
uniqueness, catches a Prisma FK-constraint delete failure into a clean 409);
**destinations** (same CRUD shape; delete explicitly counts dependent tours
first and returns a clear 409 naming the count, rather than leaking a raw
constraint error — respects the existing `Restrict` policy, doesn't work
around it); **deals** (create/update/delete, validates `tourId` only if
provided — `null` is valid, matching the optional relation — admin sets the
real `endsAt` directly, no countdown logic duplicated here); **bookings**
(list **not** scoped to `req.user.id`, unlike the public booking controller —
admin legitimately sees every user's bookings, `user` relation still
`select`-limited to safe fields; update accepts only `status`/`paymentStatus`,
values Zod-validated against the exact enums before Prisma ever sees them);
**users** (list via an explicit safe-field `select` — `passwordHash` is never
in the query, not just stripped after; role update refuses to demote the last
remaining `ADMIN`); **reviews** and **messages** (list + delete only — neither
schema has a moderation/status field, so no fake one was invented; see below).

**Two "don't invent a field" decisions, documented rather than silently
resolved:** `ContactMessage` has no read/unread column (confirmed by direct
schema inspection), so the dashboard's message metric reports a plain total
count under the key `messages`, not a fabricated `unreadMessages`; and neither
`Review` nor `ContactMessage` has any moderation-status field, so both admin
resources are delete-only — no "approve"/"hide" endpoint exists on either.

**Frontend — admin service layer, shared UI, 8 pages:**
`api/client.js` extended with `apiPatch` and a meta-returning
`apiGetWithMeta` (the earlier public `apiGet`/`apiPost`/`apiDelete` keep their
exact existing signatures — internally refactored to a shared `rawRequest()`
that returns the full response body, with the public functions extracting
just `.data` as before, so every existing non-admin caller is unaffected).
**Caught and fixed my own mistake here**: first pass at `adminService.js`
wrote a second, near-duplicate copy of the fetch/error-handling logic instead
of extending the shared client — recognized this directly violates "no
duplicated fetch implementation," discarded it, and did the extension
properly instead. `adminService.js` now contains zero `fetch(` calls of its
own.

7 shared admin components (`AdminGuard`, `AdminLayout`, `AdminTable`,
`ConfirmDialog`, `AdminPageHeader`, `AdminLoading`, `AdminError`,
`AdminEmptyState` — 8, not "dozens") + `useAdminList` (pagination/loading/
error/reload-after-mutation, shared by all 6 list pages instead of
reimplemented 6 times). 8 admin pages, each backed by real API calls — no
local arrays anywhere. Every destructive action (tour/destination/deal/
review/message delete) goes through `ConfirmDialog`; the backend's own
relational constraints are the real safety net regardless of what's confirmed
client-side. `AdminTourDetails.jsx` (the pre-existing `/admin/tours/:id` stub)
now redirects to `/admin/tours`, since editing happens via dialog on the list
page — kept the route resolving rather than 404ing, documented why.

**A real, severe bug found and fixed while wiring the route tree:**
`App.jsx`'s `RootShell` contained `const { Outlet } = require('react-router')`
— a CommonJS `require()` call with no `require` global in browser ESM code,
which would have thrown immediately on first render and broken the entire
site, not just the admin panel. Replaced with a proper top-level `import {
..., Outlet } from 'react-router'`. Also found and fixed a missing
`admin/tours/:id` route entry (needed for `AdminTourDetails`'s redirect to
ever be reached; without it, that path would have fallen through to the
admin-branch catch-all → `NotFound`, contradicting the redirect's own intent).

**Routing:** `/admin` is a separate top-level branch (not nested under the
public `Layout`), gated by a new `AdminShell` (`AdminGuard` wrapping
`AdminLayout`) — `Layout`/`Header`/`Footer` are never mounted inside it. All 8
required paths resolve; the admin branch has its own `*` → `NotFound`
catch-all, plus the existing top-level one is unchanged.

**Validation — fresh, full pass:**
- Backend syntax: PASS (64/64 files, `node --check`).
- Frontend syntax/JSX/CSS: PASS (121 files, 0 errors).
- Imports (static + dynamic): PASS (0/99 unresolved). Unused imports: PASS
  (0/99 flagged). No `require(` anywhere in the frontend (re-swept after the
  fix above to confirm no other instance exists).
- `react-router-dom`: absent.
- Security scan: `passwordHash` confined to comments/explicit-exclusion in
  admin controllers (never selected, let alone returned); every admin write
  checked for a client-controlled `userId`/`role` — none found, role is only
  ever settable via the dedicated, admin-only, schema-validated endpoint;
  zero `localStorage`/`sessionStorage` anywhere in the frontend; no hardcoded
  secrets; `DATABASE_URL`/`JWT_SECRET` never logged (only named in error
  messages, never their values); CORS still origin-restricted; no `.env`
  committed; `console.log` only in `logger.js`'s own definition.
- Public-site regression: PASS — `Layout.jsx` unchanged (still exactly
  Loader/ScrollProgress/Header/Outlet/Footer/BackToTop); none of the 12
  public-facing services reference any `/admin` endpoint; no CSS files
  created or touched in the admin area (MUI `sx` prop only, as instructed);
  `Header`/`Footer` still imported in exactly one place.
- `schema.prisma`: confirmed byte-structurally unchanged this phase (still
  12 models, 3 enums, braces balanced) — no schema changes were needed, so
  none were made.
- `prisma validate`: **BLOCKED** — directly attempted, still 403 on the
  registry.
- `npm run build`: **BLOCKED** — directly attempted, fails immediately
  (`vite: not found`) because `node_modules` doesn't exist anywhere in the
  project; `npm install` has never been able to run in this sandbox.
- PostgreSQL: still absent (`psql` not found).
- Both `package.json` files: valid JSON.

**Runtime tests: NOT RUN**, same root cause as every phase since Backend
Foundation. This includes the full 18-point runtime test plan from the
instructions (unauthenticated/USER/ADMIN access checks, dashboard counts,
every resource's CRUD, duplicate-slug 409, invalid-payload validation,
invalid-ID handling, unauthorized/forbidden admin access, passwordHash
never-returned, public site still loading) — all genuinely unverified
against a real server. The static work above is real (and caught two actual
bugs), but it is not a substitute for you running this locally.

**Known limitations:** unchanged from Phase 9.3 (gallery/stats static-content,
Deal UUIDs, missing rating/price/code/location fields) — none touched, none
relevant to admin functionality.

**Stopping here as instructed — not starting Phase 11 Security Pass.**

### PHASE 11 — Security Pass — PARTIAL (real issues found and fixed;
runtime verification genuinely BLOCKED)

**Objective:** repository-wide security audit and hardening — not a refactor.
Fix real problems found; preserve everything already correct.

**Issues found and fixed (4):**

1. **MEDIUM/HIGH — information disclosure via error messages.** `errorHandler.js`
   used `err.message` for the client response on *any* thrown error, not just
   ones our own code deliberately created with a safe message. An unexpected
   error (a raw Prisma error, a bug, any third-party exception) has no
   `.statusCode` set, so it fell through to `500` — but its raw `.message` was
   still sent to the client verbatim, potentially exposing internal detail
   (table/column names, library internals) that was never vetted for safety.
   **Fix:** the response message is now only trusted when the error carries an
   explicit `.statusCode` (i.e., it's one of our own deliberately-thrown,
   pre-vetted errors); anything else gets the generic "Something went wrong"
   regardless of environment. Dev-only `stack` attachment is unchanged. File:
   `backend/src/middleware/errorHandler.js`.
2. **MEDIUM — no dedicated rate limit on brute-forceable/spammable endpoints.**
   Only the single global limiter (300 req/15min) covered `/api/auth/login`,
   `/api/auth/register`, `/api/contact`, `/api/newsletter/subscribe` — far too
   loose to meaningfully slow a credential-stuffing or spam attempt against one
   specific endpoint. **Fix:** new `backend/src/middleware/authRateLimit.js`
   with two purpose-built limiters — `authRateLimit` (20/15min, applied to
   `/auth/login` and `/auth/register` only — not `/me` or `/logout`, which see
   normal per-page-load traffic) and `publicWriteRateLimit` (30/15min, applied
   to `/contact` and `/newsletter/subscribe`). Files: `authRateLimit.js` (new),
   `auth.routes.js`, `contact.routes.js`, `newsletter.routes.js`.
3. **MEDIUM — silent data-loss bug in admin PATCH updates (found during the
   input-validation audit).** `updateTourSchema`/`updateDealSchema` were built
   via `createXSchema.partial()`, but the base schemas had
   `isFeatured`/`isActive` defined with `.optional().default(...)`. Zod applies
   a field's default whenever that key is absent from the input — including
   after `.partial()`, which only makes the key optional to *provide*, not
   exempt from its default. Concretely: `PATCH /admin/tours/:id` with only
   `{ title: "new title" }` would have silently reset `isFeatured` to `false`
   on every save, and the equivalent for `isActive` on deals. Not a classic
   exploit, but a real, silent data-integrity defect surfaced by treating input
   validation as part of this audit. **Fix:** removed `.default(...)` from both
   base schema fields (now plain `.optional()`); the `false`/`true` default is
   applied explicitly, create-path-only, inside `tours.controller.js`'s
   `createTour` and `deals.controller.js`'s `createDeal` — so "omitted" means
   "default" on create but "leave unchanged" on update, which is what was
   actually intended. Files: `admin.validation.js`, `admin/tours.controller.js`,
   `admin/deals.controller.js`.
4. **LOW — unbounded password length.** `registerSchema`/`loginSchema`'s
   `password` field had no `.max()`. bcrypt silently truncates at 72 bytes
   regardless, so an unbounded string adds no strength and is unnecessary
   surface. **Fix:** added `.max(128)` to both. File: `auth.validation.js`.

**Reviewed and confirmed already correct (no change needed) — noted so this
isn't mistaken for an oversight:**
- **JWT role-staleness:** `requireAuth` re-derives `req.user.role` from a
  fresh `prisma.user.findUnique` on *every* request — the JWT payload's own
  `role` claim (`payload.role`) is never read anywhere for authorization
  (confirmed via grep: only `payload.sub` is used). A demoted admin loses
  admin access on their very next request, not just after token expiry.
- **Cookie/CORS/SameSite architecture:** `httpOnly` + `secure` (prod-only) +
  `SameSite=Lax` + a single non-wildcard `origin` from `env.clientUrl` with
  `credentials: true` is the correct, standard configuration for this
  same-registrable-domain deployment model (frontend/backend on different
  subdomains of one domain in production) — `Lax` cookies are sent on
  same-site cross-subdomain fetch requests regardless of HTTP method, so this
  works correctly for the app's actual POST/PATCH/DELETE calls, not just GET
  navigations. Left unchanged, per the instruction not to blindly alter
  SameSite/CORS without understanding the existing architecture.
- **Ownership checks:** every user-resource controller (favorites, bookings,
  reviews) re-confirmed to scope by `req.user.id` exclusively — grepped for
  any `req.body.userId`/`req.body.role` read anywhere in the codebase: zero
  matches.
- **Admin authorization:** `router.use(...requireAdmin)` confirmed to be the
  literal first statement in `admin.routes.js`, before any of the 22 route
  definitions — nothing on that router is reachable without both
  `requireAuth` and `requireRole('ADMIN')` passing.
- **Last-admin protection:** confirmed intact and correctly scoped (only
  triggers when demoting the *current* sole admin, not on ordinary role
  changes).
- **Helmet:** default configuration reviewed — nothing disabled; defaults are
  appropriate for a pure JSON API (no HTML served, so CSP specifics matter
  far less than for a page-serving server).
- **Prisma:** the only raw SQL anywhere is the parameterless
  `$queryRaw`SELECT 1`` health check (a tagged template, not string
  concatenation — not injectable even if it had parameters). No other raw
  SQL exists.

**Explicitly considered, not fixed, and why (documented rather than silently
skipped):** the public `GET /api/tours` / `/destinations` / `/deals` /
`/reviews` endpoints have no pagination (unlike their `/admin/*`
counterparts), so a large catalog could in principle return an unbounded
response. Retrofitting pagination onto these would change their response
shape (adding `meta`) and require updating the corresponding frontend
services/components — a real API-contract change, which this phase's own
instructions say to avoid "unless security requires it." Given the current
catalog size (a handful of seeded records) and that this isn't
user-generated content that grows unboundedly on its own, this is
recorded as a **known, low-severity remaining risk**, not silently ignored.

**Files created:** `backend/src/middleware/authRateLimit.js`.
**Files changed:** `backend/src/middleware/errorHandler.js`,
`backend/src/routes/auth.routes.js`, `backend/src/routes/contact.routes.js`,
`backend/src/routes/newsletter.routes.js`,
`backend/src/validation/admin.validation.js`,
`backend/src/validation/auth.validation.js`,
`backend/src/controllers/admin/tours.controller.js`,
`backend/src/controllers/admin/deals.controller.js`. **Frontend: untouched**
this phase — the audit found no frontend-side security issues requiring a
code change (confirmed via repository-wide search: zero
`localStorage`/`sessionStorage`, zero `dangerouslySetInnerHTML`, zero
`eval`/`new Function`, zero `document.cookie`, zero stray `require()`).

**Validation:**
- Backend syntax: PASS (65/65 files, `node --check`).
- Backend imports: PASS (0/65 unresolved).
- Frontend syntax/JSX: PASS (121 files, 0 errors — confirmed unchanged).
- Both `package.json`: valid JSON.
- Middleware order re-verified: helmet → cors → cookies → body parsers →
  morgan → rate limit → routes → notFound → errorHandler (unchanged, correct).
- `prisma validate`: **BLOCKED** — directly attempted, still 403 on the
  registry.
- PostgreSQL / `node_modules`: still absent from this sandbox.
- Security regression check (item 22's full list): bcrypt PASS, httpOnly
  cookie PASS, `requireAuth` PASS (9 files reference it), `requireRole` PASS,
  Zod PASS (6 validation files), CORS-restricted PASS, Helmet PASS, rate
  limiting PASS (now 3 limiter configurations, up from 1), admin protection
  PASS, no localStorage-auth PASS (0 matches, confirmed), no passwordHash
  leakage PASS (manually reviewed every match).
- **Runtime tests: NOT RUN** — no live server was started, no request was
  actually sent to any endpoint (rate limiter behavior, the fixed error
  handler's actual response shape, and the Zod default fix are all verified
  by code reading, not execution). This remains real, unavoidable work for
  you to do locally.

**Remaining risks:** the unbounded public-list-endpoint pagination gap
described above (low severity, deliberately not fixed this phase); no
CSRF-token infrastructure exists beyond `SameSite=Lax` + `httpOnly` — judged
sufficient for this deployment model per the instructions' own guidance not
to add CSRF infrastructure unless the current architecture genuinely lacks
protection, which it doesn't for a same-site cookie setup; `npm audit` could
not be run (no network/`node_modules`), so third-party dependency
vulnerabilities are unverified — worth running locally before production use.

**Stopping here as instructed — not starting Phase 12.**

### PHASE 12 — Final QA + UI Polish + Production Readiness — PARTIAL
(real issues found and fixed; runtime/build execution genuinely BLOCKED)

**Objective:** final full-application QA sweep, a genuinely interactive contact
map with the real business address, a repository-wide fake-icon audit, and a
light visual polish pass — not a redesign.

**A real, meaningful bug found during the QA sweep — 8 dead duplicate
backend controller files.** `backend/src/controllers/` contained
`adminUsers.controller.js`, `adminBookings.controller.js`,
`adminDashboard.controller.js`, `adminDeals.controller.js`,
`adminDestinations.controller.js`, `adminMessages.controller.js`,
`adminReviews.controller.js`, `adminTours.controller.js` — leftover debris
from an interrupted earlier pass during the Admin Panel phase, sitting
alongside the real, correctly-wired `controllers/admin/*.controller.js`
versions. Verified each was genuinely unreferenced (grepped every one across
the whole backend — zero real imports, one incidental comment mention) before
deleting all 8. This is exactly the "duplicate implementation" class of issue
this phase's Part 1/13 asks for — confirmed harmless to remove (backend
syntax + import resolution re-checked clean afterward, file count dropped
from 65 to 57 as expected) rather than assumed.

**Contact page — address, map, and card polish (Parts 5-7):**
- Real address now shown: «Республика Таджикистан, город Душанбе, проспект
  Саади Шерози, 16».
- **Real interactive map**, not a static image: new
  `frontend/src/components/common/LocationMap.jsx` using Leaflet directly
  (the one new dependency this phase adds — no `react-leaflet` wrapper, to
  keep the addition to exactly one package) with free OpenStreetMap tiles
  (no API key). Zoom controls, pan, and a popup on the marker all work;
  scroll-wheel zoom is deliberately disabled until the user clicks into the
  map, so it doesn't hijack normal page scrolling — a small UX
  consideration, not a limitation on interactivity. The marker is a custom
  inline-SVG `divIcon` in the FaroSair palette (dark-blue pin, turquoise
  center) rather than Leaflet's default marker images — this sidesteps the
  well-known "default marker icon path breaks under Vite/webpack" problem
  entirely, since no external icon image needs to resolve.
- **Coordinates — documented honestly, not fabricated:** no public source
  gave an exact geocode for house 16 specifically. Used real web search to
  find two verified nearby addresses on the same avenue (house 11 at
  38.559592, 68.765918; house 19 at 38.559253, 68.764158) and interpolated
  between them (38.5594, 68.7651) — documented as an interpolation in a code
  comment directly above the constants, not presented as more precise than
  it is. Close enough for the map to correctly show the right block of the
  right avenue; worth confirming against a precise source before a real
  production launch.
- The old static Unsplash "map" image + emoji pin + CSS bounce animation
  were removed (genuinely superseded, not arbitrarily deleted) and
  `.contact-map` given a taller (280px desktop / 220px mobile), bordered
  container so the real map has room to actually be used.
- Contact-info icons (previously 📍📞✉️🕘 emoji) replaced with
  `@mui/icons-material`'s `LocationOn`/`Phone`/`Email`/`AccessTime`, sized
  to 20px and colored with the existing `--turquoise-dim` token — same
  44×44 rounded-square container from the original design, just a real
  vector icon inside instead of an emoji glyph.

**Fake-icon audit (Part 8) — 5 replacements, each reasoned individually,
not a blanket sweep:**
- Gallery lightbox close button: `✕` text character → MUI `CloseIcon`.
- Footer newsletter submit button: `→` text character → MUI
  `ArrowForwardIcon` (added `display:flex` centering to the button's CSS,
  since the plain-text arrow didn't need it but an icon element does).
- Gallery tile hover-to-expand affordance: was a CSS `::after` pseudo-element
  with a `⤢` character — converted to a real `<span>` containing an MUI
  `OpenInFullIcon`, since a pseudo-element can't be sized/colored
  consistently with the other icons and is invisible to any tooling that
  inspects the DOM. Same hover-fade/darken behavior preserved exactly (just
  retargeted the CSS selector from `::after` to the new class).
- `TourCard.jsx` and `TourDetails.jsx`'s inline `📍 {location}` → MUI
  `LocationOnIcon` at small inline sizes (14–16px) matching the surrounding
  text.
- **Deliberately left alone** (per this phase's own "don't blindly replace
  decorative symbols intentionally part of the design" caveat): the FAQ
  accordion's `+`/rotate-to-`×` icon (an already-polished, animated,
  brand-colored interactive element, not a lazy placeholder); the Footer's
  hand-crafted brand SVGs for Instagram/Facebook/Telegram/WhatsApp (real,
  deliberate vector icons already, not fake ones — swapping them for MUI's
  generic equivalents would be a downgrade, not a fix); the wishlist heart
  and back-to-top arrow (both already real inline SVG icons, not text/emoji
  standing in for one).

**Forms/selects (Parts 10-11) — reviewed, not converted to MUI.** Every
public-facing form (login, register, booking, contact, newsletter, review,
the `/tours` filter form) already has the original design system's
consistent input styling — labels, focus rings (`box-shadow` + border-color
transition on `:focus`), consistent border-radius, and (where applicable)
disabled/loading button states — carried over faithfully since Phase 2.
Converting these to MUI `TextField`/`Select` would directly contradict this
project's own established, repeatedly-reaffirmed architecture decision (every
prior phase) that the public site stays on the custom CSS design system, with
MUI scoped to the admin panel — and this phase's own Part 10/11 explicitly
warn against exactly that outcome ("the final result should look like
FaroSayr, not MUI... do NOT blindly convert every input"). No form-library
change was made; this was a genuine audit, not a skipped step — the
conclusion was "already correct," which is itself a valid audit result.

**Full static QA sweep (Part 1/22) — all clean except the 8 dead files
above:** zero stale "demo mode"/"coming soon"/"not connected" text anywhere
(grepped, confirms every form wired to a real endpoint in prior phases still
reads that way); zero `TODO`/`FIXME`; `console.log` only in `logger.js`'s own
definition; zero `require()` in the frontend; zero `react-router-dom`; zero
hardcoded `localhost` URLs outside the two legitimate config locations
(`.env.example`, `api/client.js`'s documented fallback); zero
`localStorage`/`sessionStorage`; zero `dangerouslySetInnerHTML`; every
`passwordHash` match classified and confirmed safe (internal-only, never in a
response).

**Validation:**
- Frontend syntax/JSX/CSS: PASS (122 files, 0 errors).
- Backend syntax: PASS (57/57 files, post-cleanup).
- Backend imports: PASS (0/57 unresolved, post-cleanup).
- Unused imports: PASS (0/100 flagged).
- Both `package.json`: valid JSON (including the new `leaflet` dependency
  entry).
- `prisma validate`: **BLOCKED** — 403 on the registry, directly attempted.
- `npm run build` (frontend): **BLOCKED** — `vite: not found`, no
  `node_modules` anywhere in the project.
- `npm audit` (both projects): **BLOCKED** — requires an existing lockfile,
  which doesn't exist since `npm install` has never been able to run here.
- PostgreSQL: still absent (`psql` not found).

**Runtime limitations:** everything above is static verification. The map's
actual rendering, zoom/pan interactivity, and marker placement; the icon
swaps' actual visual appearance; and the full guest/authenticated/admin user
journeys from Parts 2–4 of this phase's instructions are all genuinely
unverified against a running app — that remains real work for you to do with
`npm install && npm run dev` locally.

**Files created:** `frontend/src/components/common/LocationMap.jsx`.
**Files changed:** `ContactSection.jsx`/`.css`, `Lightbox.jsx`, `TourCard.jsx`,
`TourDetails.jsx`, `Footer.jsx`/`.css`, `GallerySection.jsx`/`.css`,
`frontend/package.json`.
**Files deleted:** the 8 dead duplicate controllers listed above.

**Final readiness: NOT READY — BLOCKERS REMAIN** (all environmental: no
network for `npm install`, no PostgreSQL, consistent with every phase since
Backend Foundation). Code-level readiness is otherwise high — this phase
found one genuine cleanup item (dead files) and completed the explicitly-
requested contact/map/icon work; no unresolved functional gaps are known.

**Stopping here as instructed — this was the final phase, not starting
another.**

### What remains (unchanged from the Phase K plan)
Phases 2–12 as previously planned: componentize booking/destinations/why/deals/tours/
about/gallery/reviews/faq/contact; port countdown/counter/lightbox/slider/accordion
behavior; routing for real pages; API service layer; backend; database; auth; feature
wiring; admin; security pass; QA.

