import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
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
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import LocationMap from '../components/common/LocationMap';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
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

// Question/answer text lives in the i18n files (contactPage.faq.<id>).
const FAQ_ITEMS = ['custom', 'account', 'consultation', 'fastest'];

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

function FAQItem({ id }) {
  const { t } = useTranslation();

  return (
    <details className="contact-faq-item">
      <summary>
        <span>{t(`contactPage.faq.${id}.question`)}</span>
        <ExpandMoreRounded />
      </summary>
      <p>{t(`contactPage.faq.${id}.answer`)}</p>
    </details>
  );
}

function ContactForm() {
  const { t } = useTranslation();
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
      setError(getApiErrorMessage(err, t, 'contact.submitError'));
    }
  }

  if (status === SUBMITTED) {
    return (
      <div className="contact-success">
        <div className="contact-success-icon">
          <CheckCircleRounded />
        </div>

        <p className="eyebrow">{t('contactPage.successEyebrow')}</p>

        <h3>{t('contactPage.successTitle')}</h3>

        <p>
          {t('contactPage.successText')}
        </p>

        <div className="contact-success-actions">
          <a href={`tel:${CONTACT_PHONE.replace(/\s/g, '')}`} className="btn btn-primary">
            <PhoneRounded />
            {t('contactPage.callUs')}
          </a>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setStatus(IDLE)}
          >
            {t('contactPage.newRequest')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="contact-form-page" onSubmit={handleSubmit}>
      <div className="contact-form-heading">
        <p className="eyebrow">{t('contact.getInTouch')}</p>
        <h2>{t('contact.formTitle')}</h2>
        <p>
          {t('contactPage.formText')}
        </p>
      </div>

      <div className="contact-form-row">
        <div className="form-field">
          <label htmlFor="contact-name">{t('common.yourName')}</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder={t('contactPage.namePlaceholder')}
            required
          />
        </div>

        <div className="form-field">
          <label htmlFor="contact-phone">{t('common.phone')}</label>
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
        <label htmlFor="contact-email">{t('common.email')}</label>
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
        <label htmlFor="contact-message">{t('common.message')}</label>
        <textarea
          id="contact-message"
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder={t('contactPage.messagePlaceholder')}
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
          t('common.sending')
        ) : (
          <>
            {t('common.submitRequest')}
            <SendRounded />
          </>
        )}
      </button>

      <p className="form-note">
        {t('contactPage.note')}
      </p>
    </form>
  );
}

export default function Contact() {
  const { t } = useTranslation();
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
              {isOpen ? t('contactPage.openNow') : t('contactPage.closedNow')}
            </span>

            <p className="eyebrow">{t('contactPage.eyebrow')}</p>

            <h1>
              <Trans i18nKey="contactPage.title" components={{ accent: <span /> }} />
            </h1>

            <p className="contact-hero-description">
              {t('contactPage.text')}
            </p>

            <div className="contact-hero-actions">
              <a href={phoneHref} className="btn btn-primary">
                <PhoneRounded />
                {t('contactPage.call')}
              </a>

              <a href="#contact-form" className="btn btn-secondary">
                {t('contactPage.leaveRequest')}
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
                <strong>{t('contactPage.city')}</strong>
                <span>{t('contactPage.landmarkName')}</span>
              </div>
            </div>

            <div className="contact-floating-card contact-floating-card-bottom">
              <CheckCircleRounded />
              <div>
                <strong>{t('contactPage.floatingJourney')}</strong>
                <span>{t('common.startsHere')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-actions-section">
        <div className="container">
          <div className="contact-section-heading">
            <p className="eyebrow">{t('contactPage.quickEyebrow')}</p>
            <h2>{t('contactPage.quickTitle')}</h2>
          </div>

          <div className="contact-actions-grid">
            <QuickAction
              href={phoneHref}
              icon={PhoneRounded}
              label={t('contactPage.call')}
              description={CONTACT_PHONE}
            />

            <QuickAction
              href={whatsappHref}
              icon={WhatsApp}
              label="WhatsApp"
              description={t('contactPage.whatsappDescription')}
              external
            />

            <QuickAction
              href={SOCIAL_LINKS.telegram || '#contact-form'}
              icon={Telegram}
              label="Telegram"
              description={
                SOCIAL_LINKS.telegram
                  ? t('contactPage.telegramDescription')
                  : t('contactPage.telegramSoon')
              }
              external={Boolean(SOCIAL_LINKS.telegram)}
            />
          </div>
        </div>
      </section>

      <section className="contact-details-section">
        <div className="container contact-details-grid">
          <div className="contact-details-content">
            <p className="eyebrow">{t('contactPage.detailsEyebrow')}</p>

            <h2>{t('contactPage.detailsTitle')}</h2>

            <p className="section-desc">
              {t('contactPage.detailsText')}
            </p>

            <div className="contact-info-list">
              <ContactInfoItem icon={LocationOnRounded} label={t('common.address')}>
                <span>{t('contact.officeAddress')}</span>
              </ContactInfoItem>

              <ContactInfoItem icon={PhoneRounded} label={t('common.phone')}>
                <a href={phoneHref}>{CONTACT_PHONE}</a>
              </ContactInfoItem>

              <ContactInfoItem icon={EmailRounded} label={t('common.email')}>
                <a href={emailHref}>{CONTACT_EMAIL}</a>
              </ContactInfoItem>

              <ContactInfoItem icon={AccessTimeRounded} label={t('common.workingHours')}>
                <span>
                  {t('contact.workingHoursValue', {
                    from: WORKING_HOURS.from,
                    to: WORKING_HOURS.to,
                  })}
                </span>
              </ContactInfoItem>
            </div>

            <div className="contact-socials">
              <span>{t('contactPage.socials')}</span>

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
                <span>{t('common.weAreHere')}</span>
                <strong>{t('common.officeInDushanbe')}</strong>
              </div>

              <span className={`contact-open-status ${isOpen ? '' : 'closed'}`}>
                <span />
                {isOpen ? t('common.open') : t('common.closed')}
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
                <strong>{t('contactPage.landmark')}</strong>
                <span>{t('contact.officeAddress')}</span>
              </div>

              <a
                href={yandexMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="contact-route-link"
              >
                <NavigationRounded />
                {t('contactPage.route')}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-form-section" id="contact-form">
        <div className="container contact-form-layout">
          <div className="contact-form-side">
            <p className="eyebrow">{t('contactPage.formSideEyebrow')}</p>

            <h2>
              <Trans i18nKey="contactPage.formSideTitle" components={{ accent: <span /> }} />
            </h2>

            <p>
              {t('contactPage.formSideText')}
            </p>

            <div className="contact-form-points">
              <div>
                <CheckCircleRounded />
                <span>{t('contactPage.points.chooseDestination')}</span>
              </div>

              <div>
                <CheckCircleRounded />
                <span>{t('contactPage.points.discussFormat')}</span>
              </div>

              <div>
                <CheckCircleRounded />
                <span>{t('contactPage.points.answerQuestions')}</span>
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
            <h2>{t('contactPage.faqTitle')}</h2>
            <p>
              {t('contactPage.faqText')}
            </p>
          </div>

          <div className="contact-faq-list">
            {FAQ_ITEMS.map((id) => (
              <FAQItem key={id} id={id} />
            ))}
          </div>
        </div>
      </section>

      <section className="contact-final-cta">
        <div className="container">
          <div className="contact-final-card">
            <div>
              <p className="eyebrow">FaroSayr</p>
              <h2 style={{color: 'white'}}>{t('contactPage.finalTitle')}</h2>
              <p>
                {t('contactPage.finalText')}
              </p>
            </div>

            <div className="contact-final-actions">
              <Link to="/destinations" className="btn btn-primary">
                {t('navigation.destinations')}
              </Link>

              <a href={phoneHref} className="btn btn-secondary">
                <PhoneRounded />
                {t('contactPage.finalContact')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}