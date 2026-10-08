import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import EmailRounded from '@mui/icons-material/EmailRounded';
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded';
import FacebookRounded from '@mui/icons-material/FacebookRounded';
import Instagram from '@mui/icons-material/Instagram';
import LocationOnRounded from '@mui/icons-material/LocationOnRounded';
import NavigationRounded from '@mui/icons-material/NavigationRounded';
import PhoneRounded from '@mui/icons-material/PhoneRounded';
import SendRounded from '@mui/icons-material/SendRounded';
import Telegram from '@mui/icons-material/Telegram';
import WhatsApp from '@mui/icons-material/WhatsApp';
import {
  CONTACT_ERROR_FIELDS,
  CONTACT_LIMITS,
  submitContactRequest,
  validateContactRequest,
} from '../services/contactService';
import { getPublicErrorMessage } from '../utils/getPublicErrorMessage';
import { useSubmitLock } from '../hooks/useSubmitLock';
import LocationMap from '../components/common/LocationMap';
import PageHero from '../components/common/PageHero';
import CTASection from '../components/common/CTASection';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  OFFICE_LAT,
  OFFICE_LNG,
  SOCIAL_LINKS,
  WORKING_HOURS,
  EMAIL_HREF,
  PHONE_HREF,
  WHATSAPP_URL,
  YANDEX_MAPS_URL,
} from '../config/siteContact';
import './Contact.css';
import Seo from '../seo/Seo';
import logo from '../assets/images/farosayr-travel-agency-logo.webp';

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
  const [invalidField, setInvalidField] = useState(null);
  const successRef = useRef(null);
  const runOnce = useSubmitLock();

  // After sending, the form is replaced by the success card: move focus
  // there so it isn't lost (and the message is read out).
  useEffect(() => {
    if (status === SUBMITTED) successRef.current?.focus();
  }, [status]);

  // A client-side validation message belongs to one field: that field is
  // marked invalid, described by the message and focused (the message is
  // then read with the field, so it isn't also an alert).
  const fieldA11y = (field) =>
    invalidField === field ? { 'aria-invalid': true, 'aria-describedby': 'contact-form-error' } : {};

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === invalidField) {
      setInvalidField(null);
      setError('');
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const problem = validateContactRequest(form);
    if (problem) {
      const field = CONTACT_ERROR_FIELDS[problem];
      setInvalidField(field);
      setError(t(problem));
      document.getElementById(`contact-${field}`)?.focus();
      return;
    }

    await runOnce(async () => {
      setStatus(SUBMITTING);
      setError('');
      setInvalidField(null);

      try {
        await submitContactRequest(form);
        setStatus(SUBMITTED);
        setForm(EMPTY_FORM);
      } catch (err) {
        setStatus(IDLE);
        setError(getPublicErrorMessage(err, t, 'contact.submitError'));
      }
    });
  }

  if (status === SUBMITTED) {
    return (
      <div className="contact-success" ref={successRef} tabIndex={-1} role="status">
        <div className="contact-success-icon">
          <CheckCircleRounded />
        </div>

        <p className="eyebrow">{t('contactPage.successEyebrow')}</p>

        <h3>{t('contactPage.successTitle')}</h3>

        <p>
          {t('contactPage.successText')}
        </p>

        <div className="contact-success-actions">
          <a href={PHONE_HREF} className="btn btn-primary">
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
            maxLength={CONTACT_LIMITS.name}
            autoComplete="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder={t('contactPage.namePlaceholder')}
            required
            {...fieldA11y('name')}
          />
        </div>

        <div className="form-field">
          <label htmlFor="contact-phone">{t('common.phone')}</label>
          <input
            id="contact-phone"
            name="phone"
            maxLength={CONTACT_LIMITS.phone}
            inputMode="tel"
            autoComplete="tel"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+992 ..."
            required
            {...fieldA11y('phone')}
          />
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="contact-email">{t('common.email')}</label>
        <input
          id="contact-email"
          name="email"
          maxLength={CONTACT_LIMITS.email}
          autoComplete="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="example@mail.com"
          required
          {...fieldA11y('email')}
        />
      </div>

      <div className="form-field">
        <label htmlFor="contact-message">{t('common.message')}</label>
        <textarea
          id="contact-message"
          name="message"
          maxLength={CONTACT_LIMITS.message}
          value={form.message}
          onChange={handleChange}
          placeholder={t('contactPage.messagePlaceholder')}
          rows={6}
        />
      </div>

      {error && (
        <p className="contact-form-error" id="contact-form-error" role={invalidField ? undefined : 'alert'}>
          {error}
        </p>
      )}

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

  const yandexMapsUrl = YANDEX_MAPS_URL;
  const phoneHref = PHONE_HREF;
  const emailHref = EMAIL_HREF;
  const whatsappHref = WHATSAPP_URL;

  return (
    <div className="contact-page">
      <Seo page="contact" path="/contact" />
      <PageHero
        className="contact-hero"
        badge={
          <span className="contact-hero-badge">
            <span className={isOpen ? 'status-dot' : 'status-dot closed'} />
            {isOpen ? t('contactPage.openNow') : t('contactPage.closedNow')}
          </span>
        }
        eyebrow={t('contactPage.eyebrow')}
        title={<Trans i18nKey="contactPage.title" components={{ accent: <span /> }} />}
        text={t('contactPage.text')}
        aside={
          <div className="contact-hero-visual">
            <div className="contact-visual-glow" />

            <div className="contact-logo-card">
              <img src={logo} alt="Farosayr Travel Agency" />
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
        }
      >
        <div className="page-hero-actions">
          <a href={phoneHref} className="btn btn-primary">
            <PhoneRounded />
            {t('contactPage.call')}
          </a>

          <a href="#contact-form" className="btn btn-outline">
            {t('contactPage.leaveRequest')}
          </a>
        </div>
      </PageHero>

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

      <CTASection
        eyebrow="FaroSayr"
        title={t('contactPage.finalTitle')}
        text={t('contactPage.finalText')}
        actions={
          <>
            <Link to="/destinations" className="btn btn-primary">
              {t('navigation.destinations')}
            </Link>

            <a href={phoneHref} className="btn btn-outline">
              <PhoneRounded />
              {t('contactPage.finalContact')}
            </a>
          </>
        }
      />
    </div>
  );
}