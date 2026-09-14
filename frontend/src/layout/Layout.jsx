import { Outlet } from 'react-router';
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

  return (
    <>
      <Loader />
      <ScrollProgress />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
