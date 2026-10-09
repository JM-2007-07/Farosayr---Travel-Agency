import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import Seo from '../seo/Seo';
import './NotFound.css';

// Rendered inside Layout's (or AdminLayout's) <main>, so the page root is a
// plain <div> — a second <main> would be invalid.
export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="not-found-page">
      <Seo page="notFound" noindex />
      <div className="container">
        <section className="not-found-card card">
          <span className="not-found-icon" aria-hidden="true">
            <FlightTakeoffRoundedIcon />
          </span>

          <p className="eyebrow">FAROSAYR · 404</p>

          <div className="not-found-code" aria-hidden="true">
            404
          </div>

          <h1>{t('notFound.title')}</h1>

          <p className="section-desc">{t('notFound.text')}</p>

          <div className="not-found-actions">
            <Link to="/" className="btn btn-primary">
              <ArrowBackRoundedIcon />
              {t('common.backToHome')}
            </Link>

            <Link to="/tours" className="btn btn-outline-dark">
              {t('common.findTour')}
              <ArrowForwardRoundedIcon />
            </Link>
          </div>

          <p className="not-found-footer">{t('notFound.footer')}</p>
        </section>
      </div>
    </div>
  );
}
