import { useReveal } from '../../hooks/useReveal';
import { useImgFallback } from '../../hooks/useImgFallback';
import { scrollToId } from '../../utils/scrollToId';
import './AboutSection.css';

const ABOUT_IMG =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80';

const ABOUT_POINTS = [
  'Индивидуальный подход к каждому путешественнику',
  'Прямые договоры с отелями и авиакомпаниями',
  'Полное сопровождение — от визы до трансфера',
  'Прозрачные цены без скрытых платежей',
];

export default function AboutSection() {
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
          <img src={ABOUT_IMG} alt="Команда FaroSair" onError={onError} />
          <div className="about-badge">
            <strong>1+</strong>
            <span>год создаём путешествия мечты</span>
          </div>
        </div>
        <div className={`about-content reveal ${contentInView ? 'in-view' : ''}`} ref={contentRef}>
          <p className="eyebrow">О компании</p>
          <h2>Мы — маяк на пути к вашему идеальному отпуску</h2>
          <p className="section-desc">
            Farosayr основана в Душанбе командой, влюблённой в путешествия. Название
            компании происходит от слова «фарос» — маяк, указывающий путь морякам. Мы
            делаем то же самое для наших клиентов: освещаем путь к безопасным, ярким и
            незабываемым поездкам.
          </p>
          <ul className="about-list">
            {ABOUT_POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <a href="#contact" className="btn btn-primary" onClick={handleContactClick}>
            Связаться с нами
          </a>
        </div>
      </div>
    </section>
  );
}
