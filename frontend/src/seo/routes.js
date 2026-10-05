// Static (non-parameterized) public routes and how search engines should
// treat them. `key` points at seo.pages.<key> in the translation files.
// Must stay in sync with the router in App.jsx — vite.config.js writes one
// HTML shell per entry here, and vercel.json relies on those files existing.
export const STATIC_ROUTES = [
  { path: '/', key: 'home', sitemap: { changefreq: 'weekly', priority: '1.0' } },
  { path: '/tours', key: 'tours', sitemap: { changefreq: 'weekly', priority: '0.9' } },
  { path: '/destinations', key: 'destinations', sitemap: { changefreq: 'weekly', priority: '0.9' } },
  { path: '/deals', key: 'deals', sitemap: { changefreq: 'daily', priority: '0.8' } },
  { path: '/about', key: 'about', sitemap: { changefreq: 'monthly', priority: '0.8' } },
  { path: '/contact', key: 'contact', sitemap: { changefreq: 'monthly', priority: '0.8' } },
  { path: '/reviews', key: 'reviews', sitemap: { changefreq: 'weekly', priority: '0.6' } },
  { path: '/gallery', key: 'gallery', sitemap: { changefreq: 'monthly', priority: '0.5' } },
  // Forms and account pages: crawlable (so the noindex is seen) but kept
  // out of the index and the sitemap.
  { path: '/booking', key: 'booking', noindex: true },
  { path: '/login', key: 'login', noindex: true },
  { path: '/register', key: 'register', noindex: true },
  { path: '/profile', key: 'profile', noindex: true },
  { path: '/bookings', key: 'bookings', noindex: true },
  { path: '/favorites', key: 'favorites', noindex: true },
];
