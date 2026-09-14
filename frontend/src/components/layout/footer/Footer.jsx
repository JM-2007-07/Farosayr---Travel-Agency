import { useState } from 'react';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookRoundedIcon from '@mui/icons-material/FacebookRounded';
import TelegramIcon from '@mui/icons-material/Telegram';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import { scrollToId } from '../../../utils/scrollToId';
import { subscribeToNewsletter } from '../../../services/newsletterService';
import './Footer.css';

const FOOTER_SECTIONS = [
  { href: '#tours', label: 'Туры' },
  { href: '#deals', label: 'Горячие предложения' },
  { href: '#destinations', label: 'Направления' },
  { href: '#reviews', label: 'Отзывы' },
];

const FOOTER_COMPANY = [
  { href: '#about', label: 'О нас' },
  { href: '#gallery', label: 'Галерея' },
  { href: '#faq', label: 'Вопросы' },
  { href: '#contact', label: 'Контакты' },
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
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleNavClick(e, href) {
    e.preventDefault();
    scrollToId(href.slice(1));
  }

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
            <a
              href="#home"
              className="logo footer-logo"
              onClick={(e) => handleNavClick(e, '#home')}
            >
              <span className="footer-logo-mark">
                <img src="/logo.png" alt="FaroSayr" />
              </span>
              <span className="logo-text">
                FARO<em>SAYR</em>
              </span>
            </a>

            <p className="footer-brand-description">
              Туристическое агентство в Душанбе, которое помогает превращать
              мечты о путешествиях в реальные маршруты.
            </p>

            <div className="footer-contact-list">
              <a href="tel:+992000000000" className="footer-contact-item">
                <span className="footer-contact-icon">
                  <PhoneOutlinedIcon />
                </span>
                <span>+992 00 000 00 00</span>
              </a>

              <a href="mailto:info@farosayr.tj" className="footer-contact-item">
                <span className="footer-contact-icon">
                  <EmailOutlinedIcon />
                </span>
                <span>info@farosayr.tj</span>
              </a>

              <span className="footer-contact-item">
                <span className="footer-contact-icon">
                  <LocationOnOutlinedIcon />
                </span>
                <span>Душанбе, Таджикистан</span>
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
                  rel={href !== '#' ? 'noreferrer' : undefined}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          <div className="footer-col">
            <div className="footer-heading">
              <span className="footer-heading-line" />
              <h4>Разделы</h4>
            </div>

            <ul>
              {FOOTER_SECTIONS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    <ArrowForwardRoundedIcon />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-heading">
              <span className="footer-heading-line" />
              <h4>Компания</h4>
            </div>

            <ul>
              {FOOTER_COMPANY.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => handleNavClick(e, item.href)}
                  >
                    <ArrowForwardRoundedIcon />
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col footer-newsletter">
            <div className="footer-heading">
              <span className="footer-heading-line" />
              <h4>Будьте в курсе</h4>
            </div>

            <p>
              Получайте лучшие предложения, новые маршруты и специальные цены
              прямо на вашу почту.
            </p>

            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <div className="newsletter-input-wrap">
                <EmailOutlinedIcon />
                <input
                  type="email"
                  placeholder={subscribed ? 'Спасибо за подписку!' : 'Ваш email'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting || subscribed}
                  required
                />
              </div>

              <button
                type="submit"
                aria-label="Подписаться"
                disabled={submitting || subscribed}
              >
                <ArrowForwardRoundedIcon />
              </button>
            </form>

            <span className="newsletter-note">
              Без спама. Только путешествия и выгодные предложения.
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
            <span>Ваш путь</span>
            <strong>начинается здесь</strong>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© 2026 Farosayr. Все права защищены.</span>

          <div className="footer-bottom-links">
            <a href="#home" onClick={(e) => handleNavClick(e, '#home')}>
              Главная
            </a>
            <span />
            <a href="#contact" onClick={(e) => handleNavClick(e, '#contact')}>
              Контакты
            </a>
          </div>

          <span className="footer-location">
            <LocationOnOutlinedIcon />
            Душанбе, Таджикистан
          </span>
        </div>
      </div>
    </footer>
  );
}