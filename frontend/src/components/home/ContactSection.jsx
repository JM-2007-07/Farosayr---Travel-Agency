import { useState } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NavigationRoundedIcon from '@mui/icons-material/NavigationRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useReveal } from '../../hooks/useReveal';
import { submitContactMessage } from '../../services/contactService';
import { ApiError } from '../../services/api/client';
import LocationMap from '../common/LocationMap';
import './ContactSection.css';

const OFFICE_ADDRESS_RU =
  'Республика Таджикистан, город Душанбе, проспект Саади Шерози, 16';

const OFFICE_LAT = 38.5594;
const OFFICE_LNG = 68.7651;

const CONTACT_INFO = [
  {
    icon: LocationOnIcon,
    label: 'Адрес',
    value: OFFICE_ADDRESS_RU,
  },
  {
    icon: PhoneIcon,
    label: 'Телефон',
    value: '+992 11 211 33 77',
  },
  {
    icon: EmailIcon,
    label: 'Email',
    value: 'farosayrtour@mail.ru',
  },
  {
    icon: AccessTimeIcon,
    label: 'Часы работы',
    value: 'Пн–Сб: 9:00–19:00',
  },
];

const IDLE = 'idle';
const SUBMITTING = 'submitting';
const SUBMITTED = 'submitted';

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  message: '',
};

export default function ContactSection() {
  const [infoRef, infoInView] = useReveal();
  const [formRef, formInView] = useReveal();
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

      setTimeout(() => {
        setStatus(IDLE);
      }, 5000);
    } catch (err) {
      setStatus(IDLE);
      setError(
        err instanceof ApiError
          ? err.message
          : 'Не удалось отправить заявку. Попробуйте ещё раз.',
      );
    }
  }

  const yandexMapsUrl = `https://yandex.ru/maps/?ll=${OFFICE_LNG},${OFFICE_LAT}&z=17&pt=${OFFICE_LNG},${OFFICE_LAT},pm2rdm`;

  return (
    <section className="section contact" id="contact">
      <div className="container contact-grid">
        <div
          className={`contact-info reveal ${infoInView ? 'in-view' : ''}`}
          ref={infoRef}
        >
          <p className="eyebrow">Контакты</p>

          <h2>Начнём планировать ваше путешествие</h2>

          <p className="section-desc">
            Оставьте заявку, и наш менеджер свяжется с вами в течение 30 минут
            в рабочее время.
          </p>

          <ul className="contact-list">
            {CONTACT_INFO.map((item) => (
              <li key={item.label}>
                <span className="contact-icon">
                  <item.icon
                    sx={{
                      fontSize: item.label === 'Адрес' ? 22 : 20,
                    }}
                  />
                </span>

                <div>
                  <strong>{item.label}</strong>
                  <span>{item.value}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="contact-map-card">
            <div className="contact-map-head">
              <div>
                <span className="contact-map-label">Мы здесь</span>
                <strong>Наш офис в Душанбе</strong>
              </div>

              <span className="contact-map-status">
                <span />
                Открыты
              </span>
            </div>

            <div className="contact-map">
              <LocationMap
                lat={OFFICE_LAT}
                lng={OFFICE_LNG}
                popupText="FaroSayr — офис"
              />

              <div className="map-marker">
                <div className="map-marker-pulse" />

                <div className="map-marker-pin">
                  <LocationOnIcon />
                </div>
              </div>

              <div className="map-address">
                <LocationOnIcon />
                <span>Душанбе, проспект Саади Шерози, 16</span>
              </div>

              <a
                className="map-route"
                href={yandexMapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                <NavigationRoundedIcon />
                <span>Построить маршрут</span>
                <OpenInNewRoundedIcon />
              </a>
            </div>
          </div>
        </div>

        <form
          className={`contact-form reveal ${formInView ? 'in-view' : ''}`}
          ref={formRef}
          onSubmit={handleSubmit}
        >
          <div className="contact-form-head">
            <span className="form-kicker">Свяжитесь с нами</span>

            <h3>Расскажите о вашей поездке</h3>

            <p>
              Мы подберём маршрут, который подойдёт именно вам.
            </p>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="name">Имя</label>

              <input
                type="text"
                id="name"
                name="name"
                placeholder="Ваше имя"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="phone">Телефон</label>

              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="+992 ___ __ __ __"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>

            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="message">Сообщение</label>

            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder="Расскажите о вашем идеальном путешествии..."
              value={form.message}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={status === SUBMITTING}
          >
            {status === SUBMITTING
              ? 'Отправка…'
              : 'Отправить заявку'}
          </button>

          <p
            className={`form-note ${
              error ? 'form-note-error' : ''
            }`}
          >
            {status === SUBMITTED &&
              'Спасибо! Ваша заявка отправлена — мы свяжемся с вами в ближайшее время.'}

            {error}
          </p>
        </form>
      </div>
    </section>
  );
}