import { useReveal } from '../../hooks/useReveal';

/**
 * Shared intro for inner public pages (Tours, Deals, Destinations, About,
 * Reviews, Gallery, Booking, account pages). Styles live in
 * styles/global.css under "Page hero" so every page gets the same
 * padding, background, title scale and text color.
 *
 * - `title` may be a node (e.g. <Trans> with an <span> accent).
 * - `stacked` puts the accent span on its own line.
 * - `children` render below the text (actions, meta, page-specific extras);
 *   `aside` renders as a second column on wide screens; `decoration` is an
 *   absolutely positioned, aria-hidden ornament on the section itself.
 * - `badge` renders above the eyebrow (e.g. an "open now" status pill).
 * - `className` adds page-specific decoration without forking the base.
 */
export default function PageHero({
  eyebrow,
  eyebrowIcon = null,
  title,
  text,
  icon = null,
  align = 'start',
  stacked = false,
  className = '',
  children = null,
  aside = null,
  decoration = null,
  badge = null,
}) {
  const [ref, isInView] = useReveal();

  const classes = ['page-hero', align === 'center' ? 'page-hero--center' : '', aside ? 'page-hero--split' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes}>
      {decoration && (
        <div className="page-hero-decoration" aria-hidden="true">
          {decoration}
        </div>
      )}
      <div className="container page-hero-inner">
        <div ref={ref} className={`page-hero-content reveal ${isInView ? 'in-view' : ''}`}>
          {icon && <span className="page-hero-icon">{icon}</span>}
          {badge}

          {eyebrow && (
            <p className={`eyebrow ${eyebrowIcon ? 'eyebrow--icon' : ''}`}>
              {eyebrowIcon}
              {eyebrow}
            </p>
          )}

          <h1 className={`page-hero-title ${stacked ? 'page-hero-title--stacked' : ''}`}>{title}</h1>

          {text && <p className="page-hero-text">{text}</p>}

          {children}
        </div>

        {aside}
      </div>
    </section>
  );
}
