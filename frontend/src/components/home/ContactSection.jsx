import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NavigationRoundedIcon from '@mui/icons-material/NavigationRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useReveal } from '../../hooks/useReveal';
import { submitContactMessage } from '../../services/contactService';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import LocationMap from '../common/LocationMap';
import './ContactSection.css';

const OFFICE_LAT = 38.5594;
const OFFICE_LNG = 68.7651;

// labelKey/valueKey are i18n keys; `value` is used as-is (not translatable).
const CONTACT_INFO = [
  {
    id: 'address',
    icon: LocationOnIcon,
    labelKey: 'common.address',
    valueKey: 'home.contact.address',
  },
  {
    id: 'phone',
    icon: PhoneIcon,
    labelKey: 'common.phone',
    value: '+992 11 211 33 77',
  },
  {
    id: 'email',
    icon: EmailIcon,
    labelKey: 'common.email',
    value: 'farosayrtour@mail.ru',
  },
  {
    id: 'hours',
    icon: AccessTimeIcon,
    labelKey: 'common.workingHours',
    valueKey: 'contact.workingHoursValue',
    valueParams: { from: 9, to: 19 },
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
  const { t } = useTranslation();
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
      setError(getApiErrorMessage(err, t, 'contact.submitError'));
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
          <p className="eyebrow">{t('navigation.contact')}</p>

          <h2>{t('home.contact.title')}</h2>

          <p className="section-desc">
            {t('home.contact.text')}
          </p>

          <ul className="contact-list">
            {CONTACT_INFO.map((item) => (
              <li key={item.id}>
                <span className="contact-icon">
                  <item.icon
                    sx={{
                      fontSize: item.id === 'address' ? 22 : 20,
                    }}
                  />
                </span>

                <div>
                  <strong>{t(item.labelKey)}</strong>
                  <span>{item.valueKey ? t(item.valueKey, item.valueParams) : item.value}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="contact-map-card">
            <div className="contact-map-head">
              <div>
                <span className="contact-map-label">{t('common.weAreHere')}</span>
                <strong>{t('common.officeInDushanbe')}</strong>
              </div>

              <span className="contact-map-status">
                <span />
                {t('common.open')}
              </span>
            </div>

            <div className="contact-map">
              <LocationMap
                lat={OFFICE_LAT}
                lng={OFFICE_LNG}
              />

              <div className="map-marker">
                <div className="map-marker-pulse" />

                <div className="map-marker-pin">
                  <LocationOnIcon />
                </div>
              </div>

              <div className="map-address">
                <LocationOnIcon />
                <span>{t('home.contact.mapAddress')}</span>
              </div>

              <a
                className="map-route"
                href={yandexMapsUrl}
                target="_blank"
                rel="noreferrer"
              >
                <NavigationRoundedIcon />
                <span>{t('common.getDirections')}</span>
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
            <span className="form-kicker">{t('contact.getInTouch')}</span>

            <h3>{t('contact.formTitle')}</h3>

            <p>
              {t('home.contact.formText')}
            </p>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="name">{t('common.name')}</label>

              <input
                type="text"
                id="name"
                name="name"
                placeholder={t('common.yourName')}
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="phone">{t('common.phone')}</label>

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
            <label htmlFor="email">{t('common.email')}</label>

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
            <label htmlFor="message">{t('common.message')}</label>

            <textarea
              id="message"
              name="message"
              rows="5"
              placeholder={t('home.contact.messagePlaceholder')}
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
              ? t('common.sending')
              : t('common.submitRequest')}
          </button>

          <p
            className={`form-note ${
              error ? 'form-note-error' : ''
            }`}
          >
            {status === SUBMITTED &&
              t('home.contact.success')}

            {error}
          </p>
        </form>
      </div>
    </section>
  );
}