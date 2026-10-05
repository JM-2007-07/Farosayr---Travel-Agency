import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import Seo from '../seo/Seo';
import AboutSection from '../components/home/AboutSection';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Statistics from '../components/home/Statistics';
import './About.css';

const ABOUT_LINKS = [
  { to: '/tours', labelKey: 'aboutPage.toursLink', primary: true },
  { to: '/destinations', labelKey: 'aboutPage.destinationsLink' },
  { to: '/deals', labelKey: 'aboutPage.dealsLink' },
  { to: '/contact', labelKey: 'aboutPage.contactLink' },
];

// Composes the existing homepage "about" blocks under a page-specific hero,
// so /about is a real page instead of the PagePending placeholder.
export default function About() {
  const { t } = useTranslation();

  return (
    <>
      <Seo page="about" path="/about" />

      <section className="about-page-hero">
        <div className="container">
          <div className="about-page-hero-content">
            <p className="eyebrow">{t('aboutPage.eyebrow')}</p>
            <h1>{t('aboutPage.title')}</h1>
            <p className="about-page-lead">{t('aboutPage.text')}</p>

            <nav className="about-page-links" aria-label={t('aboutPage.linksTitle')}>
              <span className="about-page-links-title">{t('aboutPage.linksTitle')}</span>
              {ABOUT_LINKS.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`btn ${link.primary ? 'btn-primary' : 'btn-outline'}`}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <AboutSection showMoreLink={false} />
      <WhyChooseUs />
      <Statistics />
    </>
  );
}
