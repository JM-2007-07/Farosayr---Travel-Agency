import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import { subscribeToNewsletter } from '../../../services/newsletterService';
import { getPublicErrorMessage } from '../../../utils/getPublicErrorMessage';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  EMAIL_HREF,
  PHONE_HREF,
  SOCIAL_LINKS as SOCIAL_URLS,
  WHATSAPP_URL,
} from '../../../config/siteContact';
import './Footer.css';

// Real routes rather than #anchors: the anchors only existed on the
// homepage, so these links did nothing on every other page.
const FOOTER_SECTIONS = [
  { to: '/tours', labelKey: 'navigation.tours' },
  { to: '/deals', labelKey: 'navigation.deals' },
  { to: '/destinations', labelKey: 'navigation.destinations' },
  { to: '/reviews', labelKey: 'navigation.reviews' },
];

const FOOTER_COMPANY = [
  { to: '/about', labelKey: 'navigation.about' },
  { to: '/gallery', labelKey: 'navigation.gallery' },
  { to: '/#faq', labelKey: 'navigation.faq' },
  { to: '/contact', labelKey: 'navigation.contact' },
];

// URLs come from config/siteContact.js. A network without a configured
// URL is left out instead of rendering a dead "#" link.
const SOCIAL_LINKS = [
  { href: SOCIAL_URLS.instagram, label: 'Instagram', icon: InstagramIcon },
  { href: SOCIAL_URLS.facebook, label: 'Facebook', icon: FacebookRoundedIcon },
  { href: SOCIAL_URLS.telegram, label: 'Telegram', icon: TelegramIcon },
  { href: WHATSAPP_URL, label: 'WhatsApp', icon: WhatsAppIcon },
].filter((link) => link.href);

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const feedbackRef = useRef(null);

  // On success the input and button are disabled, which would drop keyboard
  // focus to <body>: put it on the confirmation instead.
  useEffect(() => {
    if (subscribed) feedbackRef.current?.focus();
  }, [subscribed]);
  const [submitting, setSubmitting] = useState(false);
  const [subscribeError, setSubscribeError] = useState('');

  // The success note disappears after a few seconds (timer cleared on unmount).
  useEffect(() => {
    if (!subscribed) return undefined;
    const timer = setTimeout(() => setSubscribed(false), 4000);
    return () => clearTimeout(timer);
  }, [subscribed]);

  async function handleSubscribe(e) {
    e.preventDefault();

    if (!email.trim() || submitting) return;

    setSubmitting(true);
    setSubscribeError('');

    try {
      await subscribeToNewsletter(email.trim());
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      // Previously failures were silent — say what happened.
      setSubscribed(false);
      setSubscribeError(getPublicErrorMessage(err, t, 'footer.subscribeError', { 400: 'contact.errors.emailInvalid' }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="footer">
      <div className="footer-glow footer-glow-one" />
      <div className="footer-glow footer-glow-two" />

      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="logo footer-logo">
              <span className="footer-logo-mark">
                <img src="/logo-100.webp" alt="" width="38" height="38" loading="lazy" decoding="async" />
              </span>
              <span className="logo-text">
                FARO<em>SAYR</em>
              </span>
            </Link>

            <p className="footer-brand-description">
              {t('footer.description')}
            </p>

            <div className="footer-contact-list">
              <a href={PHONE_HREF} className="footer-contact-item">
                <span className="footer-contact-icon">
                  <PhoneOutlinedIcon />
                </span>
                <span>{CONTACT_PHONE}</span>
              </a>

              <a href={EMAIL_HREF} className="footer-contact-item">
                <span className="footer-contact-icon">
                  <EmailOutlinedIcon />
                </span>
                <span>{CONTACT_EMAIL}</span>
              </a>

              <span className="footer-contact-item">
                <span className="footer-contact-icon">
                  <LocationOnOutlinedIcon />
                </span>
                <span>{t('common.dushanbeTajikistan')}</span>
              </span>
            </div>

            <div className="social-icons">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="social-icon"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <div className="footer-heading">
              <span className="footer-heading-line" />
              <h2>{t('footer.sections')}</h2>
            </div>

            <ul>
              {FOOTER_SECTIONS.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>
                    <ArrowForwardRoundedIcon />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-heading">
              <span className="footer-heading-line" />
              <h2>{t('footer.company')}</h2>
            </div>

            <ul>
              {FOOTER_COMPANY.map((item) => (
                <li key={item.to}>
                  <Link to={item.to}>
                    <ArrowForwardRoundedIcon />
                    <span>{t(item.labelKey)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col footer-newsletter">
            <div className="footer-heading">
              <span className="footer-heading-line" />
              <h2>{t('footer.stayInformed')}</h2>
            </div>

            <p>
              {t('footer.newsletterText')}
            </p>

            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <div className="newsletter-input-wrap">
                <EmailOutlinedIcon />
                <input
                  type="email"
                  placeholder={subscribed ? t('footer.subscribed') : t('footer.emailPlaceholder')}
                  aria-label={t('footer.emailPlaceholder')}
                  autoComplete="email"
                  maxLength={254}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (subscribeError) setSubscribeError('');
                  }}
                  disabled={submitting || subscribed}
                  required
                />
              </div>

              <button
                type="submit"
                aria-label={t('footer.subscribe')}
                disabled={submitting || subscribed}
              >
                <ArrowForwardRoundedIcon />
              </button>
            </form>

            {/* Always-present live region, so the message inserted into it is
                announced reliably. */}
            <div aria-live="polite">
              {(subscribed || subscribeError) && (
                <p
                  ref={feedbackRef}
                  tabIndex={-1}
                  className={`newsletter-feedback ${subscribeError ? 'is-error' : 'is-success'}`}
                >
                  {subscribeError || t('footer.subscribed')}
                </p>
              )}
            </div>

            <span className="newsletter-note">
              {t('footer.newsletterNote')}
            </span>
          </div>
        </div>

        <div className="footer-route">
          <div className="footer-route-line">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="footer-route-plane">
            <FlightTakeoffRoundedIcon />
          </div>

          <div className="footer-route-text">
            <span>{t('common.yourJourney')}</span>
            <strong>{t('common.startsHere')}</strong>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>{t('footer.rights')}</span>

          <div className="footer-bottom-links">
            <Link to="/">{t('navigation.home')}</Link>
            <span />
            <Link to="/contact">{t('navigation.contact')}</Link>
          </div>

          <span className="footer-location">
            <LocationOnOutlinedIcon />
            {t('common.dushanbeTajikistan')}
          </span>
        </div>
      </div>
    </footer>
  );
}