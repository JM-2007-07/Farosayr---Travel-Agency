import { useRef, useState } from 'react';
import { getFaqItems } from '../../services/faqService';
import { useReveal } from '../../hooks/useReveal';
import { useAsyncData } from '../../hooks/useAsyncData';
import { scrollToId } from '../../utils/scrollToId';
import AsyncState from '../common/AsyncState';
import './FAQSection.css';

function FAQItem({ item, isOpen, onToggle }) {
  const answerRef = useRef(null);

  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button
        className="faq-question"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        {item.question}
        <span className="faq-icon">+</span>
      </button>
      <div
        className="faq-answer"
        style={{ maxHeight: isOpen ? `${answerRef.current?.scrollHeight ?? 400}px` : undefined }}
      >
        <p ref={answerRef}>{item.answer}</p>
      </div>
    </div>
  );
}

// Ports the original single-open accordion (opening one closes any other).
export default function FAQSection() {
  const [introRef, introInView] = useReveal();
  const [listRef, listInView] = useReveal();
  const [openId, setOpenId] = useState(null);
  const { status, data: faqItems, isLoading, isError } = useAsyncData(getFaqItems, []);

  function handleContactClick(e) {
    e.preventDefault();
    scrollToId('contact');
  }

  return (
    <section className="section faq" id="faq">
      <div className="container faq-grid">
        <div className={`faq-intro reveal ${introInView ? 'in-view' : ''}`} ref={introRef}>
          <p className="eyebrow">Вопросы и ответы</p>
          <h2>Часто задаваемые вопросы</h2>
          <p className="section-desc">
            Не нашли ответ на свой вопрос? Свяжитесь с нами — ответим в течение часа.
          </p>
          <a href="#contact" className="btn btn-outline" onClick={handleContactClick}>
            Задать вопрос
          </a>
        </div>
        <div className={`faq-list reveal ${listInView ? 'in-view' : ''}`} ref={listRef}>
          <AsyncState
            isLoading={isLoading}
            isError={isError}
            isEmpty={status === 'success' && faqItems.length === 0}
          />
          {status === 'success' &&
            faqItems.map((item) => (
              <FAQItem
                key={item.id}
                item={item}
                isOpen={openId === item.id}
                onToggle={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
              />
            ))}
        </div>
      </div>
    </section>
  );
}
