import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NavigationRoundedIcon from '@mui/icons-material/NavigationRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { useReveal } from '../../hooks/useReveal';
import { CONTACT_LIMITS } from '../../services/contactService';
import { CONTACT_STATUS, useContactForm } from '../../hooks/useContactForm';
import LocationMap from '../common/LocationMap';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  OFFICE_LAT,
  OFFICE_LNG,
  WORKING_HOURS,
  YANDEX_MAPS_URL,
} from '../../config/siteContact';
import './ContactSection.css';

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
    value: CONTACT_PHONE,
  },
  {
    id: 'email',
    icon: EmailIcon,
    labelKey: 'common.email',
    value: CONTACT_EMAIL,
  },
  {
    id: 'hours',
    icon: AccessTimeIcon,
    labelKey: 'common.workingHours',
    valueKey: 'contact.workingHoursValue',
    valueParams: { from: WORKING_HOURS.from, to: WORKING_HOURS.to },
  },
];

export default function ContactSection() {
  const { t } = useTranslation();
  const [infoRef, infoInView] = useReveal();
  const [formRef, formInView] = useReveal();
  // Validation message → that field is aria-invalid, described by the note
  // below and focused; the note then stays silent (no double announcement).
  const { form, status, error, invalidField, fieldA11y, handleChange, handleSubmit, reset } = useContactForm({
    errorId: 'home-contact-note',
  });

  // The success note fades after a few seconds (timer cleared on unmount).
  useEffect(() => {
    if (status !== CONTACT_STATUS.SUBMITTED) return undefined;
    const timer = setTimeout(reset, 5000);
    return () => clearTimeout(timer);
  }, [status, reset]);

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
                href={YANDEX_MAPS_URL}
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
                maxLength={CONTACT_LIMITS.name}
                autoComplete="name"
                placeholder={t('common.yourName')}
                value={form.name}
                onChange={handleChange}
                required
                {...fieldA11y('name')}
              />
            </div>

            <div className="form-field">
              <label htmlFor="phone">{t('common.phone')}</label>

              <input
                type="tel"
                id="phone"
                name="phone"
                maxLength={CONTACT_LIMITS.phone}
                inputMode="tel"
                autoComplete="tel"
                placeholder="+992 ___ __ __ __"
                value={form.phone}
                onChange={handleChange}
                required
                {...fieldA11y('phone')}
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="email">{t('common.email')}</label>

            <input
              type="email"
              id="email"
              name="email"
              maxLength={CONTACT_LIMITS.email}
              autoComplete="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={handleChange}
              required
              {...fieldA11y('email')}
            />
          </div>

          <div className="form-field">
            <label htmlFor="message">{t('common.message')}</label>

            <textarea
              id="message"
              name="message"
              maxLength={CONTACT_LIMITS.message}
              rows="5"
              placeholder={t('home.contact.messagePlaceholder')}
              value={form.message}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={status === CONTACT_STATUS.SUBMITTING}
          >
            {status === CONTACT_STATUS.SUBMITTING
              ? t('common.sending')
              : t('common.submitRequest')}
          </button>

          <p
            className={`form-note ${
              error ? 'form-note-error' : ''
            }`}
            id="home-contact-note"
            aria-live={invalidField ? 'off' : 'polite'}
          >
            {status === CONTACT_STATUS.SUBMITTED &&
              t('home.contact.success')}

            {error}
          </p>
        </form>
      </div>
    </section>
  );
}