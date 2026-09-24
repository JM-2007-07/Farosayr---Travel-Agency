// Extracted verbatim from the original #why markup (6 cards). Icons are
// inline SVG paths in the original too, so they're kept as JSX here rather
// than split into a separate icon-component system that doesn't exist yet.
// Card copy lives in the i18n translation files (home.why.items.*).
export const WHY_CHOOSE_US = [
  {
    id: 'best-prices',
    titleKey: 'home.why.items.bestPrices.title',
    textKey: 'home.why.items.bestPrices.text',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path
          d="M8 24l32-14-14 32-4-14-14-4z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'verified-hotels',
    titleKey: 'home.why.items.verifiedHotels.title',
    textKey: 'home.why.items.verifiedHotels.text',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <path
          d="M24 6l16 6v10c0 10-7 17-16 20-9-3-16-10-16-20V12l16-6z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M17 24l5 5 10-10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'support-24-7',
    titleKey: 'home.why.items.support.title',
    textKey: 'home.why.items.support.text',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
        <path d="M24 14v10l7 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'personal-manager',
    titleKey: 'home.why.items.personalManager.title',
    textKey: 'home.why.items.personalManager.text',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="17" cy="16" r="6" stroke="currentColor" strokeWidth="2.5" />
        <path
          d="M6 40c0-7 5-12 11-12s11 5 11 12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M31 22c5 0 9 4 9 9M31 14a5 5 0 010 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'easy-booking',
    titleKey: 'home.why.items.easyBooking.title',
    textKey: 'home.why.items.easyBooking.text',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="8" y="14" width="32" height="24" rx="4" stroke="currentColor" strokeWidth="2.5" />
        <path d="M8 20h32M15 28h6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'secure-payment',
    titleKey: 'home.why.items.securePayment.title',
    textKey: 'home.why.items.securePayment.text',
    icon: (
      <svg viewBox="0 0 48 48" fill="none">
        <rect x="10" y="16" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="2.5" />
        <path d="M10 22h28" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="16" cy="29" r="2" fill="currentColor" />
      </svg>
    ),
  },
];
