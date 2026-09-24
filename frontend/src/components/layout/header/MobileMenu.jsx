import { Link, NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { NAV_ITEMS } from '../../../constants/navigation'
import { useAuth } from '../../../context/AuthContext'
import LanguageSwitcher from '../../common/LanguageSwitcher'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import BookOnlineOutlinedIcon from '@mui/icons-material/BookOnlineOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import CloseIcon from '@mui/icons-material/Close'
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useEffect } from 'react'

export default function MobileMenu({ isOpen, onNavigate }) {
    const { t } = useTranslation()
    const { user, isAuthenticated, isLoading, logout } = useAuth()

    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onNavigate()
            }
        }
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onNavigate])

    async function handleLogout() {
        onNavigate()
        await logout()
    }

    return (
        <>
            <div className={`mobile-overlay ${isOpen ? 'open' : ''}`} onClick={onNavigate}></div>
            <div className={`mobile-menu ${isOpen ? 'open' : ''}`} id="mobileMenu">
                <div className="mobile-menu-header">
                    <Link to="/" className="mobile-menu-logo" onClick={onNavigate}>
                        <span>FARO<span>SAYR</span></span>
                    </Link>
                    <button type="button" className="mobile-close" onClick={onNavigate} aria-label={t('header.closeMenu')}>
                        <CloseIcon />
                    </button>
                </div>

                <div className="mobile-menu-content">
                    <nav className="mobile-navigation">
                        <span className="mobile-section-title">{t('header.navigationTitle')}</span>
                        <ul>
                            {NAV_ITEMS.map((item) => (
                                <li key={item.to}>
                                    <NavLink
                                        to={item.to}
                                        end={item.end}
                                        className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
                                        onClick={onNavigate}
                                    >
                                        <span>{t(item.labelKey)}</span>
                                        <span className="mobile-link-arrow">
                                          <NavigateNextIcon/>
                                        </span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <Link to="/booking" className="mobile-cta" onClick={onNavigate}>
                        <span>{t('common.bookTrip')}</span>
                        <span style={{marginTop: '8px'}} className="mobile-cta-arrow"><NavigateNextIcon/></span>
                    </Link>

                    <div className="mobile-language">
                        <span className="mobile-section-title">{t('language.label')}</span>
                        <LanguageSwitcher variant="segmented" onChange={onNavigate} />
                    </div>

                    {!isLoading && (
                        <div className="mobile-account">
                            <span className="mobile-section-title">{t('header.accountTitle')}</span>

                            {isAuthenticated ? (
                                <>
                                    <div className="mobile-account-user">
                                        <AccountCircleOutlinedIcon />
                                        <div>
                                            <strong>{user?.name || t('common.user')}</strong>
                                            <span>{user?.email}</span>
                                        </div>
                                    </div>

                                    <Link to="/profile" className="mobile-account-link" onClick={onNavigate}>
                                        <AccountCircleOutlinedIcon />
                                        <span>{t('account.profile')}</span>
                                    </Link>

                                    <Link to="/bookings" className="mobile-account-link" onClick={onNavigate}>
                                        <BookOnlineOutlinedIcon />
                                        <span>{t('account.bookings')}</span>
                                    </Link>

                                    <Link to="/favorites" className="mobile-account-link" onClick={onNavigate}>
                                        <FavoriteBorderIcon />
                                        <span>{t('account.favorites')}</span>
                                    </Link>

                                    {user?.role === 'ADMIN' && (
                                        <Link to="/admin" className="mobile-account-link admin-item" onClick={onNavigate}>
                                            <AdminPanelSettingsOutlinedIcon />
                                            <span>{t('account.admin')}</span>
                                        </Link>
                                    )}

                                    <button type="button" className="mobile-account-link logout-item" onClick={handleLogout}>
                                        <LogoutOutlinedIcon />
                                        <span>{t('account.logout')}</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="mobile-account-link" onClick={onNavigate}>
                                        <AccountCircleOutlinedIcon />
                                        <span>{t('account.login')}</span>
                                    </Link>

                                    <Link to="/register" className="mobile-account-link" onClick={onNavigate}>
                                        <AccountCircleOutlinedIcon />
                                        <span>{t('account.register')}</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}