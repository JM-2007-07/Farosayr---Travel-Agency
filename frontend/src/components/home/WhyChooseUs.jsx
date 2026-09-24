import { useTranslation } from 'react-i18next';
import { WHY_CHOOSE_US } from '../../data/whyChooseUs';
import { useReveal } from '../../hooks/useReveal';
import './WhyChooseUs.css';

function WhyCard({ item }) {
  const { t } = useTranslation();
  const [ref, isInView] = useReveal();
  return (
    <div className={`why-card reveal ${isInView ? 'in-view' : ''}`} ref={ref}>
      <div className="why-icon">{item.icon}</div>
      <h3>{t(item.titleKey)}</h3>
      <p>{t(item.textKey)}</p>
    </div>
  );
}

export default function WhyChooseUs() {
  const { t } = useTranslation();
  const [headRef, headInView] = useReveal();

  return (
    <section className="section why" id="why">
      <div className="container">
        <div className={`section-head light reveal ${headInView ? 'in-view' : ''}`} ref={headRef}>
          <p className="eyebrow">{t('home.why.eyebrow')}</p>
          <h2>{t('home.why.title')}</h2>
          <p className="section-desc">
            {t('home.why.text')}
          </p>
        </div>

        <div className="why-grid">
          {WHY_CHOOSE_US.map((item) => (
            <WhyCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
