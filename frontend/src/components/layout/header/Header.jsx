
import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { NAV_ITEMS } from '../../../constants/navigation';
import { useScrollState } from '../../../hooks/useScrollState';
import { useAuth } from '../../../context/AuthContext';
import MobileMenu from './MobileMenu';
import LanguageSwitcher from '../../common/LanguageSwitcher';
import './Header.css';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookOnlineOutlinedIcon from '@mui/icons-material/BookOnlineOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export default function Header() {
  const { t } = useTranslation();
  const { isScrolled } = useScrollState();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (!e.target.closest('.account-wrapper')) {
        setIsAccountOpen(false);
      }
    }

    document.addEventListener('click', handleOutsideClick);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  async function handleLogout() {
    setIsAccountOpen(false);
    setIsMenuOpen(false);
    await logout();
  }

  const headerClassName = [
    'header',
    !isHomePage ? 'header-inner-page' : '',
    isScrolled ? 'scrolled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <header className={headerClassName}>
        <div className="container header-inner">
          <Link
            to="/"
            className="logo"
            onClick={() => {
              setIsMenuOpen(false);
              setIsAccountOpen(false);
            }}
          >
            <img
              src="/logo.png"
              alt="FaroSayr"
              className="logo-image"
            />

            <span className="logo-text">
              FARO<em>SAYR</em>
            </span>
          </Link>

          <nav className="nav">
            <ul className="nav-list">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `nav-link ${isActive ? 'active' : ''}`
                    }
                  >
                    {t(item.labelKey)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-actions">
            <LanguageSwitcher />

            <Link to="/booking" className="btn btn-cta">
              <span>{t('common.bookNow')}</span>
            </Link>

            {!isLoading && (
              <div className="account-wrapper">
                <button
                  type="button"
                  className={`account-button ${isAccountOpen ? 'open' : ''}`}
                  aria-label={t('header.openAccountMenu')}
                  aria-expanded={isAccountOpen}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAccountOpen((open) => !open);
                  }}
                >
                  <AccountCircleOutlinedIcon />
                  <KeyboardArrowDownIcon className="account-arrow" />
                </button>

                {isAccountOpen && (
                  <div className="account-menu">
                    {isAuthenticated ? (
                      <>
                        <div className="account-user">
                          <AccountCircleOutlinedIcon />

                          <div>
                            <strong>
                              {user?.name || t('common.user')}
                            </strong>

                            <span>{user?.email}</span>
                          </div>
                        </div>

                        <div className="account-divider" />

                        <Link
                          to="/profile"
                          className="account-menu-item"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          <AccountCircleOutlinedIcon />
                          <span>{t('account.profile')}</span>
                        </Link>

                        <Link
                          to="/bookings"
                          className="account-menu-item"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          <BookOnlineOutlinedIcon />
                          <span>{t('account.bookings')}</span>
                        </Link>

                        <Link
                          to="/favorites"
                          className="account-menu-item"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          <FavoriteBorderIcon />
                          <span>{t('account.favorites')}</span>
                        </Link>

                        {user?.role === 'ADMIN' && (
                          <Link
                            to="/admin"
                            className="account-menu-item admin-item"
                            onClick={() => setIsAccountOpen(false)}
                          >
                            <AdminPanelSettingsOutlinedIcon />
                            <span>{t('account.admin')}</span>
                          </Link>
                        )}

                        <div className="account-divider" />

                        <button
                          type="button"
                          className="account-menu-item logout-item"
                          onClick={handleLogout}
                        >
                          <LogoutOutlinedIcon />
                          <span>{t('account.logout')}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="account-menu-item"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          <AccountCircleOutlinedIcon />
                          <span>{t('account.login')}</span>
                        </Link>

                        <Link
                          to="/register"
                          className="account-menu-item"
                          onClick={() => setIsAccountOpen(false)}
                        >
                          <span>{t('account.register')}</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              className={`burger ${isMenuOpen ? 'open' : ''}`}
              aria-label={
                isMenuOpen ? t('header.closeMenu') : t('header.openMenu')
              }
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMenuOpen}
        onNavigate={() => setIsMenuOpen(false)}
      />
    </>
  );
}
