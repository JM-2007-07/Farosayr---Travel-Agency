import { Link } from 'react-router';
import { Trans, useTranslation } from 'react-i18next';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { getDeals } from '../services/dealsService';
import { useReveal } from '../hooks/useReveal';
import { useAsyncData } from '../hooks/useAsyncData';
import AsyncState from '../components/common/AsyncState';
import PageHero from '../components/common/PageHero';
import DealCard from '../components/common/DealCard';
import CTASection from '../components/common/CTASection';
import './Deals.css';
import Seo from '../seo/Seo';

export default function Deals() {
  const { t } = useTranslation();
  const [headRef, headInView] = useReveal();

  const {
    status,
    data: deals,
    isLoading,
    isError,
    reload,
  } = useAsyncData(getDeals, []);

  const items = deals ?? [];

  return (
    <div className="deals-page">
      <Seo page="deals" path="/deals" />
      <PageHero
        align="center"
        icon={<LocalOfferRoundedIcon />}
        eyebrow={t('dealsPage.heroEyebrow')}
        title={<Trans i18nKey="dealsPage.heroTitle" components={{ accent: <span /> }} />}
        text={t('dealsPage.heroText')}
      />

      <section className="section deals-list">
        <div className="container">
          <div
            className={`section-head deals-page-head reveal ${
              headInView ? 'in-view' : ''
            }`}
            ref={headRef}
          >
            <p className="eyebrow">{t('common.limitedOffer')}</p>

            <h2>{t('dealsPage.title')}</h2>

            <p className="section-desc">
              {t('dealsPage.text')}
            </p>
          </div>

          <AsyncState
            isLoading={isLoading}
            isError={isError}
            isEmpty={status === 'success' && items.length === 0}
            emptyLabel={t('dealsPage.empty')}
            onRetry={reload}
            emptyAction={
              <>
                <Link to="/tours" className="btn btn-primary">
                  {t('common.viewTours')}
                </Link>
                <Link to="/contact" className="btn btn-outline-dark">
                  {t('common.contactUs')}
                </Link>
              </>
            }
          />

          {status === 'success' && items.length > 0 && (
            <div className="deals-grid">
              {items.map((deal) => (
                <DealCard key={deal.id} deal={deal} showLabel />
              ))}
            </div>
          )}
        </div>
      </section>

      <CTASection
        icon={<AccessTimeRoundedIcon />}
        title={t('dealsPage.ctaTitle')}
        text={t('dealsPage.ctaText')}
        actions={
          <Link to="/contact" className="btn btn-primary">
            {t('common.contactUs')}
            <ArrowForwardRoundedIcon />
          </Link>
        }
      />
    </div>
  );
}