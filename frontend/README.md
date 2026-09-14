# FaroSair — Frontend

React 19 + Vite + react-router (not react-router-dom). Public site keeps the
original hand-written CSS design system — Tailwind/MUI are in the dependency
baseline but not used on public pages (see `MIGRATION_PLAN.md` at the repo
root for the reasoning).

## Setup

```bash
npm install
npm run dev       # http://localhost:5173
npm run lint
npm run build
npm run preview
```

## One manual step before first run

`public/farosayr_icon_48x48_palette_v2.png` is **not included** — it was
referenced by filename in the original site but the actual image file was
never provided to this migration. Copy your real logo/favicon PNG into
`public/farosayr_icon_48x48_palette_v2.png` (same filename the components
already reference), or update the `src` in `Header.jsx`, `Footer.jsx`, and
`index.html`'s favicon link if you rename it.

## Status: Phase 1 complete

See `MIGRATION_PLAN.md` for full phase-by-phase status. Phase 1 delivers the
React/Vite foundation and a real Loader, ScrollProgress, Header (+ mobile
menu), Hero, and Footer. The remaining homepage sections render as labeled
placeholders (`<SectionPending>`) at their correct anchors until Phase 2.
