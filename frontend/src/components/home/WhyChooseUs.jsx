import { WHY_CHOOSE_US } from '../../data/whyChooseUs';
import { useReveal } from '../../hooks/useReveal';
import './WhyChooseUs.css';

function WhyCard({ item }) {
  const [ref, isInView] = useReveal();
  return (
    <div className={`why-card reveal ${isInView ? 'in-view' : ''}`} ref={ref}>
      <div className="why-icon">{item.icon}</div>
      <h3>{item.title}</h3>
      <p>{item.text}</p>
    </div>
  );
}

export default function WhyChooseUs() {
  const [headRef, headInView] = useReveal();

  return (
    <section className="section why" id="why">
      <div className="container">
        <div className={`section-head light reveal ${headInView ? 'in-view' : ''}`} ref={headRef}>
          <p className="eyebrow">Почему выбирают нас</p>
          <h2>Забота о каждой детали вашего путешествия</h2>
          <p className="section-desc">
            За FaroSair стоит команда, которая относится к вашему отпуску так же
            серьёзно, как вы сами.
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
