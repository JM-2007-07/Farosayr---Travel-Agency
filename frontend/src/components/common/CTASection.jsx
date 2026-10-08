/**
 * Closing call-to-action band shared by inner pages (Deals, Destinations,
 * Destination details, Reviews, Contact). Styles: styles/global.css,
 * "CTA band".
 *
 * - `actions` — the buttons (already-styled .btn links).
 * - `contained={false}` when the caller is already inside a .container.
 */
export default function CTASection({ eyebrow, title, text, icon = null, actions, contained = true }) {
  const band = (
    <div className="cta-band">
      <div className="cta-band-body">
        {icon && <span className="cta-band-icon">{icon}</span>}
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="cta-band-title">{title}</h2>
          {text && <p className="cta-band-text">{text}</p>}
        </div>
      </div>
      {actions && <div className="cta-band-actions">{actions}</div>}
    </div>
  );

  return (
    <section className="cta-section">
      {contained ? <div className="container">{band}</div> : band}
    </section>
  );
}
