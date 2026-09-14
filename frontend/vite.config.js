import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Tailwind's Vite plugin is intentionally NOT registered here.
// Per the architecture decision in MIGRATION_PLAN.md, the public-facing site
// keeps the existing hand-written CSS design system (custom properties,
// component classes) rather than being rewritten in Tailwind. Tailwind may be
// wired in later, scoped to the admin app, if/when that's actually built.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
