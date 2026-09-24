import { useTranslation } from 'react-i18next';
import { useReveal } from '../../hooks/useReveal';
import { useImgFallback } from '../../hooks/useImgFallback';
import { scrollToId } from '../../utils/scrollToId';
import './AboutSection.css';

const ABOUT_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80';

const ABOUT_POINTS = ['personal', 'direct', 'fullSupport', 'transparent'];

export default function AboutSection() {
  const { t } = useTranslation();
  const [mediaRef, mediaInView] = useReveal();
  const [contentRef, contentInView] = useReveal();
  const [broken, onError] = useImgFallback();

  function handleContactClick(e) {
    e.preventDefault();
    scrollToId('contact');
  }

  return (
    <section className="section about" id="about">
      <div className="container about-grid">
        <div
          className={`about-media reveal img-wrap ${mediaInView ? 'in-view' : ''} ${broken ? 'img-fallback' : ''}`}
          ref={mediaRef}
        >
          <img src={ABOUT_IMG} alt={t('home.about.imageAlt')} onError={onError} />
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
          <a href="#contact" className="btn btn-primary" onClick={handleContactClick}>
            {t('common.contactUs')}
          </a>
        </div>
      </div>
    </section>
  );
}
