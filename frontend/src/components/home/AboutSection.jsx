import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useReveal } from '../../hooks/useReveal';
import { useImgFallback } from '../../hooks/useImgFallback';
import { scrollToId } from '../../utils/scrollToId';
import './AboutSection.css';

const ABOUT_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80';

const ABOUT_POINTS = ['personal', 'direct', 'fullSupport', 'transparent'];

// Rendered on the homepage and on /about; `showMoreLink` hides the link to
// /about when we're already there.
export default function AboutSection({ showMoreLink = true }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mediaRef, mediaInView] = useReveal();
  const [contentRef, contentInView] = useReveal();
  const [broken, onError] = useImgFallback();

  function handleContactClick(e) {
    e.preventDefault();
    // The #contact section only exists on the homepage.
    if (document.getElementById('contact')) {
      scrollToId('contact');
    } else {
      navigate('/contact');
    }
  }

  return (
    <section className="section about" id="about">
      <div className="container about-grid">
        <div
          className={`about-media reveal img-wrap ${mediaInView ? 'in-view' : ''} ${broken ? 'img-fallback' : ''}`}
          ref={mediaRef}
        >
          <img
            src={ABOUT_IMG}
            alt={t('home.about.imageAlt')}
            loading="lazy"
            decoding="async"
            onError={onError}
          />
          <div className="about-badge">
            <strong>1+</strong>
            <span>{t('home.about.badge')}</span>
          </div>
        </div>
        <div className={`about-content reveal ${contentInView ? 'in-view' : ''}`} ref={contentRef}>
          <p className="eyebrow">{t('home.about.eyebrow')}</p>
          <h2>{t('home.about.title')}</h2>
          <p className="section-desc">
            {t('home.about.text')}
          </p>
          <ul className="about-list">
            {ABOUT_POINTS.map((point) => (
              <li key={point}>{t(`home.about.points.${point}`)}</li>
            ))}
          </ul>
          <div className="about-actions">
            <a href="/contact" className="btn btn-primary" onClick={handleContactClick}>
              {t('common.contactUs')}
            </a>
            {showMoreLink && (
              <Link to="/about" className="btn btn-outline-dark">
                {t('home.about.more')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
