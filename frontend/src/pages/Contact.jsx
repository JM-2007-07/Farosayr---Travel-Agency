import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  AccessTimeRounded,
  CheckCircleRounded,
  EmailRounded,
  ExpandMoreRounded,
  FacebookRounded,
  Instagram,
  LocationOnRounded,
  NavigationRounded,
  PhoneRounded,
  SendRounded,
  Telegram,
  WhatsApp,
} from '@mui/icons-material';
import { submitContactMessage } from '../services/contactService';
import { ApiError } from '../services/api/client';
import LocationMap from '../components/common/LocationMap';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  OFFICE_ADDRESS,
  OFFICE_LAT,
  OFFICE_LNG,
  SOCIAL_LINKS,
  WORKING_HOURS,
} from '../config/siteContact';
import './Contact.css';
import logo from '../assets/images/Логотип Farosayr Travel Agency.png'

const IDLE = 'idle';
const SUBMITTING = 'submitting';
const SUBMITTED = 'submitted';

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  message: '',
};

const FAQ_ITEMS = [
  {
    question: 'Можно ли подобрать тур индивидуально?',
    answer:
      'Да. Расскажите менеджеру, куда вы хотите поехать, на какие даты и какой формат отдыха вам подходит. Мы поможем подобрать подходящий вариант.',
  },
  {
    question: 'Нужно ли создавать аккаунт, чтобы связаться с агентством?',
    answer:
      'Нет. Вы можете отправить заявку через форму без регистрации. Для бронирований через личный кабинет понадобится аккаунт.',
  },
  {
    question: 'Можно ли обратиться только для консультации?',
    answer:
      'Конечно. Вы можете написать нам даже если пока не определились с направлением. Менеджер поможет с выбором и ответит на вопросы.',
  },
  {
    question: 'Как быстрее всего связаться с FaroSayr?',
    answer:
      'Для быстрого ответа можно позвонить нам или написать через один из доступных мессенджеров. Также можно оставить заявку через форму на этой странице.',
  },
];

function getCurrentWorkingState() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();

  const isWorkingDay = day >= 1 && day <= 6;
  const isWorkingHour =
    hour >= WORKING_HOURS.from && hour < WORKING_HOURS.to;

  return isWorkingDay && isWorkingHour;
}

function ContactInfoItem({ icon: Icon, label, children }) {
  return (
    <div className="contact-info-item">
      <div className="contact-info-icon">
        <Icon />
      </div>
      <div>
        <span>{label}</span>
        <div>{children}</div>
      </div>
    </div>
  );
}

function QuickAction({ href, icon: Icon, label, description, external = false }) {
  return (
    <a
      href={href}
      className="contact-action"
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
    >
      <span className="contact-action-icon">
        <Icon />
      </span>
      <span className="contact-action-content">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span className="contact-action-arrow">
        <SendRounded />
      </span>
    </a>
  );
}

function SocialLink({ href, icon: Icon, label }) {
  if (!href) return null;

  return (
    <a
      href={href}
      className="contact-social"
      target="_blank"
      rel="noreferrer"
      aria-label={label}
    >
      <Icon />
    </a>
  );
}

function FAQItem({ item }) {
  return (
    <details className="contact-faq-item">
      <summary>
        <span>{item.question}</span>
        <ExpandMoreRounded />
      </summary>
      <p>{item.answer}</p>
    </details>
  );
}

function ContactForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(IDLE);
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.phone || !form.email) {
      return;
    }

    setStatus(SUBMITTING);
    setError('');

    try {
      await submitContactMessage({
        name: form.name,
        email: form.email,
        subject: 'Заявка с сайта FaroSayr',
        message: `Телефон: ${form.phone}\n\n${form.message || '(без сообщения)'}`,
      });

      setStatus(SUBMITTED);
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus(IDLE);
      setError(
        err instanceof ApiError
          ? err.message
          : 'Не удалось отправить заявку. Попробуйте ещё раз.',
      );
    }
  }

  if (status === SUBMITTED) {
    return (
      <div className="contact-success">
        <div className="contact-success-icon">
          <CheckCircleRounded />
        </div>

        <p className="eyebrow">Заявка отправлена</p>

        <h3>Спасибо за обращение!</h3>

        <p>
          Мы получили ваши данные. Менеджер FaroSayr свяжется с вами для
          уточнения деталей путешествия.
        </p>

        <div className="contact-success-actions">
          <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="btn btn-primary">
            <PhoneRounded />
            Позвонить нам
          </a>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setStatus(IDLE)}
          >
            Новая заявка
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="contact-form-page" onSubmit={handleSubmit}>
      <div className="contact-form-heading">
        <p className="eyebrow">Свяжитесь с нами</p>
        <h2>Расскажите о вашей поездке</h2>
        <p>
          Напишите, куда хотите отправиться, и мы поможем подобрать подходящий
          вариант.
        </p>
      </div>

      <div className="contact-form-row">
        <div className="form-field">
          <label htmlFor="contact-name">Ваше имя</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Например, Манишвар"
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="contact-phone">Телефон</label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+992 ..."
            required
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="example@mail.com"
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="contact-message">Сообщение</label>
        <textarea
          id="contact-message"
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Расскажите, куда хотите поехать, когда и сколько человек..."
          rows={6}
        />
      </div>

      {error && <p className="contact-form-error">{error}</p>}

      <button
        type="submit"
        className="btn btn-primary btn-block contact-submit"
        disabled={status === SUBMITTING}
      >
        {status === SUBMITTING ? (
          'Отправляем...'
        ) : (
          <>
            Отправить заявку
            <SendRounded />
          </>
        )}
      </button>

      <p className="form-note">
        Нажимая кнопку, вы отправляете заявку в туристическое агентство
        FaroSayr. Регистрация для отправки формы не требуется.
      </p>
    </form>
  );
}

export default function Contact() {
  const isOpen = useMemo(() => getCurrentWorkingState(), []);

  const yandexMapsUrl = `https://yandex.ru/maps/?ll=${OFFICE_LNG},${OFFICE_LAT}&z=17&pt=${OFFICE_LNG},${OFFICE_LAT},pm2rdm`;

  const phoneHref = `tel:${CONTACT_PHONE.replace(/\s/g, '')}`;
  const emailHref = `mailto:${CONTACT_EMAIL}`;

  const whatsappHref =
    SOCIAL_LINKS.whatsapp ||
    `https://wa.me/${CONTACT_PHONE.replace(/\D/g, '')}`;

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <div className="container contact-hero-inner">
          <div className="contact-hero-content">
            <span className="contact-hero-badge">
              <span className={isOpen ? 'status-dot' : 'status-dot closed'} />
              {isOpen ? 'Сейчас открыты' : 'Сейчас закрыты'}
            </span>

            <p className="eyebrow">FaroSayr · Контакты</p>

            <h1>
              Давайте
              <span> спланируем </span>
              ваше путешествие
            </h1>

            <p className="contact-hero-description">
              Есть идея для поездки или пока не знаете, куда отправиться?
              Свяжитесь с нами — расскажите о своих планах, а остальное
              обсудим вместе.
            </p>

            <div className="contact-hero-actions">
              <a href={phoneHref} className="btn btn-primary">
                <PhoneRounded />
                Позвонить
              </a>

              <a href="#contact-form" className="btn btn-secondary">
                Оставить заявку
              </a>
            </div>
          </div>

          <div className="contact-hero-visual">
            <div className="contact-visual-glow" />

            <div className="contact-logo-card">
              <img src={logo} alt="" />
            </div>

            <div className="contact-floating-card contact-floating-card-top">
              <LocationOnRounded />
              <div>
                <strong>Душанбе</strong>
                <span>Шарқи Озод</span>
              </div>
            </div>

            <div className="contact-floating-card contact-floating-card-bottom">
              <CheckCircleRounded />
              <div>
                <strong>Ваше путешествие</strong>
                <span>начинается здесь</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-actions-section">
        <div className="container">
          <div className="contact-section-heading">
            <p className="eyebrow">Быстрая связь</p>
            <h2>Выберите удобный способ</h2>
          </div>

          <div className="contact-actions-grid">
            <QuickAction
              href={phoneHref}
              icon={PhoneRounded}
              label="Позвонить"
              description={CONTACT_PHONE}
            />

            <QuickAction
              href={whatsappHref}
              icon={WhatsApp}
              label="WhatsApp"
              description="Написать менеджеру"
              external
            />

            <QuickAction
              href={SOCIAL_LINKS.telegram || '#contact-form'}
              icon={Telegram}
              label="Telegram"
              description={
                SOCIAL_LINKS.telegram
                  ? 'Написать в Telegram'
                  : 'Скоро добавим ссылку'
              }
              external={Boolean(SOCIAL_LINKS.telegram)}
            />
          </div>
        </div>
      </section>

      <section className="contact-details-section">
        <div className="container contact-details-grid">
          <div className="contact-details-content">
            <p className="eyebrow">Наши контакты</p>

            <h2>Мы рядом, когда нужно спланировать поездку</h2>

            <p className="section-desc">
              Вы можете связаться с FaroSayr любым удобным способом или
              приехать к нам в офис в Душанбе.
            </p>

            <div className="contact-info-list">
              <ContactInfoItem icon={LocationOnRounded} label="Адрес">
                <span>{OFFICE_ADDRESS}</span>
              </ContactInfoItem>

              <ContactInfoItem icon={PhoneRounded} label="Телефон">
                <a href={phoneHref}>{CONTACT_PHONE}</a>
              </ContactInfoItem>

              <ContactInfoItem icon={EmailRounded} label="Email">
                <a href={emailHref}>{CONTACT_EMAIL}</a>
              </ContactInfoItem>

              <ContactInfoItem icon={AccessTimeRounded} label="Часы работы">
                <span>{WORKING_HOURS.label}</span>
              </ContactInfoItem>
            </div>

            <div className="contact-socials">
              <span>Мы в социальных сетях</span>

              <div>
                <SocialLink
                  href={SOCIAL_LINKS.instagram}
                  icon={Instagram}
                  label="Instagram"
                />

                <SocialLink
                  href={SOCIAL_LINKS.facebook}
                  icon={FacebookRounded}
                  label="Facebook"
                />

                <SocialLink
                  href={SOCIAL_LINKS.telegram}
                  icon={Telegram}
                  label="Telegram"
                />

                <SocialLink
                  href={SOCIAL_LINKS.whatsapp}
                  icon={WhatsApp}
                  label="WhatsApp"
                />
              </div>
            </div>
          </div>

          <div className="contact-map-card">
            <div className="contact-map-header">
              <div>
                <span>Мы здесь</span>
                <strong>Наш офис в Душанбе</strong>
              </div>

              <span className={`contact-open-status ${isOpen ? '' : 'closed'}`}>
                <span />
                {isOpen ? 'Открыты' : 'Закрыты'}
              </span>
            </div>

            <div className="contact-map">
              <LocationMap lat={OFFICE_LAT} lng={OFFICE_LNG} />

              <div className="contact-map-marker">
                <LocationOnRounded />
              </div>
            </div>

            <div className="contact-map-bottom">
              <div>
                <strong>Ориентир: Шарқи Озод</strong>
                <span>{OFFICE_ADDRESS}</span>
              </div>

              <a
                href={yandexMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="contact-route-link"
              >
                <NavigationRounded />
                Маршрут
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-form-section" id="contact-form">
        <div className="container contact-form-layout">
          <div className="contact-form-side">
            <p className="eyebrow">Персональный подход</p>

            <h2>
              Не знаете,
              <span> с чего начать?</span>
            </h2>

            <p>
              Просто расскажите нам о своей идее. Необязательно сразу знать
              страну, отель или точные даты.
            </p>

            <div className="contact-form-points">
              <div>
                <CheckCircleRounded />
                <span>Поможем выбрать направление</span>
              </div>

              <div>
                <CheckCircleRounded />
                <span>Обсудим подходящий формат поездки</span>
              </div>

              <div>
                <CheckCircleRounded />
                <span>Ответим на вопросы перед бронированием</span>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <ContactForm />
          </div>
        </div>
      </section>

      <section className="contact-faq-section">
        <div className="container contact-faq-container">
          <div className="contact-section-heading centered">
            <p className="eyebrow">FAQ</p>
            <h2>Частые вопросы</h2>
            <p>
              Несколько ответов на вопросы, которые могут возникнуть перед
              обращением к нам.
            </p>
          </div>

          <div className="contact-faq-list">
            {FAQ_ITEMS.map((item) => (
              <FAQItem key={item.question} item={item} />
            ))}
          </div>
        </div>
      </section>

      <section className="contact-final-cta">
        <div className="container">
          <div className="contact-final-card">
            <div>
              <p className="eyebrow">FaroSayr</p>
              <h2 style={{color: 'white'}}>Следующее путешествие может начаться сегодня</h2>
              <p>
                Посмотрите наши направления или свяжитесь с менеджером, если
                хотите подобрать поездку индивидуально.
              </p>
            </div>

            <div className="contact-final-actions">
              <Link to="/destinations" className="btn btn-primary">
                Направления
              </Link>

              <a href={phoneHref} className="btn btn-secondary">
                <PhoneRounded />
                Связаться
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}