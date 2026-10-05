import { useState } from 'react';
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

const SOCIAL_LINKS = [
  {
    href: 'https://www.instagram.com/farosayragency?igsh=aGk4YWJvc2s5M3cw',
    label: 'Instagram',
    icon: InstagramIcon,
  },
  {
    href: 'https://www.facebook.com/share/1EVedLvKDL/',
    label: 'Facebook',
    icon: FacebookRoundedIcon,
  },
  {
    href: '#',
    label: 'Telegram',
    icon: TelegramIcon,
  },
  {
    href: '#',
    label: 'WhatsApp',
    icon: WhatsAppIcon,
  },
];

export default function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubscribe(e) {
    e.preventDefault();

    if (!email || submitting) return;

    setSubmitting(true);

    try {
      await subscribeToNewsletter(email);
      setSubscribed(true);
      setEmail('');

      setTimeout(() => {
        setSubscribed(false);
      }, 3000);
    } catch {
      setSubscribed(false);
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
                <img src="/icon-192.png" alt="Farosayr" width="38" height="38" loading="lazy" />
              </span>
              <span className="logo-text">
                FARO<em>SAYR</em>
              </span>
            </Link>

            <p className="footer-brand-description">
              {t('footer.description')}
            </p>

            <div className="footer-contact-list">
              <a href="tel:+992112113377" className="footer-contact-item">
                <span className="footer-contact-icon">
                  <PhoneOutlinedIcon />
                </span>
                <span>+992 11 211 33 77</span>
              </a>

              <a href="mailto:farosayrtour@mail.ru" className="footer-contact-item">
                <span className="footer-contact-icon">
                  <EmailOutlinedIcon />
                </span>
                <span>farosayrtour@mail.ru</span>
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
                  target={href !== '#' ? '_blank' : undefined}
                  rel={href !== '#' ? 'noopener noreferrer' : undefined}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <div className="footer-heading">
              <span className="footer-heading-line" />
              <h4>{t('footer.sections')}</h4>
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
              <h4>{t('footer.company')}</h4>
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
              <h4>{t('footer.stayInformed')}</h4>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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