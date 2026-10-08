# Farosayr — Accessibility & Mobile

What the public site does for keyboard, touch, screen-reader and
reduced-motion users, how it was tested, and what is still open. Tested on
2026-10-07 against local builds (see §8). This is not a WCAG conformance
claim: automated checks and the manual checks listed below passed, but no
full audit with a real screen reader has been done.

## 1. Page structure

- Every page has one `<h1>`, including loading/error/not-found states of the
  detail pages (`AsyncState pageHeading` renders the message as the `<h1>`).
- Heading levels don't skip (footer column titles are `<h2>`).
- Landmarks: one `header` (banner), `main#main-content`, `footer`
  (contentinfo); both navigations are labelled ("Навигация"); the open mobile
  menu is a labelled dialog; the office map is a labelled region.
- `<html lang>` follows the selected language (`ru`, `en`, `tg` for Tajik).

## 2. Keyboard

- **Skip link** — the first Tab stop on every public page ("Перейти к
  содержимому") moves focus to `<main>`.
- **Focus ring** — global `:focus-visible` outline (turquoise, 2px, offset 3);
  form fields that remove the outline show a border + `--focus-ring` shadow
  instead. A Tab sweep over the homepage (70 stops desktop, 40 mobile)
  found a visible change on every stop.
- **In-page jumps** ("Забронировать" → contact form, `/#faq` links) move
  focus to the target section as well as scrolling (`utils/scrollToId.js`).
- **Cards** — the tour card's image link duplicates its title link, so it is
  out of the Tab order. "Подробнее" / "Забронировать тур" / favourite buttons
  are described by the card title (`aria-describedby`), so they are
  unambiguous out of context.

## 3. Menus and dialogs

| Component | Behaviour |
|---|---|
| Mobile menu (`MobileMenu.jsx`) | `role="dialog"`, `aria-modal`, named "Меню". On open: focus → close button; header, main, footer, skip link and back-to-top become `inert`; body scroll locked. Esc, close button, overlay or any link close it; focus returns to the burger. |
| Account dropdown (header) | Disclosure button with `aria-expanded`/`aria-controls`; Esc closes and returns focus to the button. |
| Language switcher | Esc closes and returns focus to the button; options use `aria-current`, each name has its own `lang`. |
| Video dialog | Native `<dialog>` (`showModal`): named, focus moves in, Tab stays inside, Esc/close button/backdrop close, focus returns to the play button. The `<video>` element is created only after the visitor presses play. |
| Gallery lightbox (`Lightbox.jsx`) | Native modal `<dialog>` named by the photo; focus on the close button; Esc / close / click outside the photo close it; focus returns to the photo tile. Tiles are real `<button>`s. |
| Search selects (MUI) | Combobox/listbox from MUI: Enter/Space/↓ open, arrows move, Enter picks, Esc closes, focus returns. |

## 4. Forms

| Form | Labels | Autocomplete / types | Errors |
|---|---|---|---|
| Login | `<label>` | `email`, `current-password` | Server error in `role="alert"`; password toggle named |
| Register | `<label>` | `name`, `email`, `new-password`; hint via `aria-describedby` | `role="alert"` |
| Booking | `<label>` for quantity; ± buttons named | `type=number` | `role="alert"`; ± use `aria-disabled` at the limits (focus is kept) |
| Contact (home + /contact) | `<label>` | `name`, `tel` (+`inputMode`), `email` | Validation: field gets `aria-invalid`, `aria-describedby` → message, and focus; message is not also announced as an alert. Server errors announced. |
| Review | `<label>` for rating and comment | — | Same pattern as contact |
| Newsletter | `aria-label` | `email` | Message inside a persistent `aria-live` region; on success focus moves to it (input/button become disabled) |
| Tour filters / home search | `<label>` / MUI `InputLabel` | `type=number` for prices | — |

After a successful submit the confirmation that replaces a form (booking,
contact page, review) receives focus, so it is read out and focus isn't lost.

## 5. Loading, empty and live content

- `AsyncState`: loading = `role="status"`, error = `role="alert"` + retry
  button, empty = text + next-step link. Route loading fallback is a labelled
  status.
- Review sliders: off-screen slides are `aria-hidden`; the active dot has
  `aria-current`. On `/reviews` the card is a polite live region **only after
  the visitor navigates** — autoplay changes are not announced.
- Deal countdowns are not live regions (they tick every second).

## 6. Motion

- `prefers-reduced-motion: reduce` (tokens.css) shortens all CSS animations
  and transitions; flying planes in the hero are hidden.
- With reduced motion there is no hero video, counters don't animate, review
  sliders don't autoplay, and JS scrolling (back-to-top, in-page links) jumps
  instead of smooth-scrolling (`scrollBehavior()` in `utils/scrollToId.js`).
- Review sliders (`hooks/useAutoAdvance.js`) pause on hover and while focus is
  inside, and stop for good once the visitor picks a slide (also covers
  touch, where there is no hover).

## 7. Touch and mobile

- Burger button: 44×44 hit area (visual unchanged, via padding + negative
  margin). Slider dots: 24×24. Text links, back links, footer links and
  title links have enlarged vertical hit areas the same way.
- Remaining controls are ≥24px (WCAG 2.2 AA minimum); some are below the
  44px comfort size: social icons 38–39px, tour-gallery arrows 38px, password
  toggle 34px, favourite button 42px.
- No horizontal scrolling at 320, 360, 375, 390, 412, 430, 768, 1024 and
  1280px on the 12 main public pages, signed in and out (§8). The booking
  form used to be cut off on the right at 320px (grid column could not
  shrink below its content); fixed with `minmax(0, 1fr)`.
- Inputs use 16px+ text (no iOS zoom-on-focus) and correct `type`/`inputMode`.

### Yandex map

- The office address is always written out as text next to both maps; the
  map is a labelled region and an enhancement, not the only source.
- Loaded only near the viewport (Step 5). If it can't load, a translated
  message and an "Открыть в Яндекс Картах" link are shown.
- On touch screens (`pointer: coarse`) one-finger drag no longer pans the
  map, so it can't trap page scrolling; pinch-zoom and double-tap remain.
- **Real map rendering has not been verified locally**: the API key only
  works on the authorised domain (localhost gets 403). Only the fallback
  state was tested. Check the map on https://farosayr.com after deploying.

## 8. How it was tested

Local production builds served by `vite preview`, with a local copy of the
backend (in-memory data, Telegram stubbed — no production writes), driven
by headless Chrome over the DevTools protocol:

- **axe-core 4.10** (WCAG 2.0/2.1/2.2 A+AA + best practices), 19 routes ×
  390/1280px signed in, login/register/booking/favorites/admin signed out at
  320/390/1280 — **0 violations** after the fixes (before: color-contrast,
  heading-order, page-has-heading-one, image-redundant-alt,
  aria-prohibited-attr, target-size).
- **Accessibility tree** (Chrome `Accessibility.getFullAXTree`): 0 unnamed
  buttons/links/fields on 9 pages × 2 widths and in ru/en/tj.
- **Keyboard scripts** (real key events): skip link, focus visibility, menus,
  dialogs, select, slider, all forms (register, login, booking, review,
  contact ×2, newsletter, favourites), 40 + 19 checks.
- **Reduced motion** emulated (`Emulation.setEmulatedMedia`).
- **Layout** overflow + screenshots at the widths in §7.

Not done: testing with NVDA/JAWS/VoiceOver/TalkBack, on real phones, with
200–400% zoom, or with Windows high-contrast mode.

- **Admin**: non-admin → "access denied", admin shell renders, sidebar and
  language switcher work by keyboard (shell only — the local stand has no
  admin data endpoints).

## 9. Known limitations

- Some touch targets are between 24 and 44px (see §7).
- At 1280×900 the hero's decorative "Листайте вниз" cue overlaps the CTA
  buttons (pre-existing, visual only; it is hidden below 700px height).
- axe reports one `list` issue in the admin tours page (not fixed here).
- MUI `Select` menus (home search, admin) follow MUI's implementation.
- The admin panel was only checked for regressions (redirect, shared
  components), not audited.
- No route-change announcement / focus move on client-side navigation
  (focus stays on the activated link; the page title updates).
