import { Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import Loader from '../components/loader/Loader';
import ScrollProgress from '../components/scrollprogress/ScrollProgress';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import BackToTop from '../components/common/BackToTop';
import { useButtonRipple } from '../hooks/useButtonRipple';

export default function Layout() {
  // Site-wide behavior (not homepage-specific), so it lives here rather
  // than in a Home section — matches where the original script.js applied
  // it (globally, via document.querySelectorAll('.btn')).
  useButtonRipple();
  const { t } = useTranslation();

  return (
    <>
      {/* First Tab stop: jump past the header navigation. */}
      <a className="skip-link" href="#main-content">
        {t('common.skipToContent')}
      </a>
      <Loader />
      <ScrollProgress />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
