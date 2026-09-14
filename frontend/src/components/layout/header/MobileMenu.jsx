import { Link, NavLink } from 'react-router'
import { NAV_ITEMS } from '../../../constants/navigation'
import { useAuth } from '../../../context/AuthContext'
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import BookOnlineOutlinedIcon from '@mui/icons-material/BookOnlineOutlined'
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import CloseIcon from '@mui/icons-material/Close'
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useEffect } from 'react'

export default function MobileMenu({ isOpen, onNavigate }) {
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
                    <button type="button" className="mobile-close" onClick={onNavigate} aria-label="Закрыть меню">
                        <CloseIcon />
                    </button>
                </div>

                <div className="mobile-menu-content">
                    <nav className="mobile-navigation">
                        <span className="mobile-section-title">Навигация</span>
                        <ul>
                            {NAV_ITEMS.map((item) => (
                                <li key={item.to}>
                                    <NavLink
                                        to={item.to}
                                        end={item.end}
                                        className={({ isActive }) => `mobile-link ${isActive ? 'active' : ''}`}
                                        onClick={onNavigate}
                                    >
                                        <span>{item.label}</span>
                                        <span className="mobile-link-arrow">
                                          <NavigateNextIcon/>
                                        </span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <Link to="/booking" className="mobile-cta" onClick={onNavigate}>
                        <span>Забронировать путешествие</span>
                        <span style={{marginTop: '8px'}} className="mobile-cta-arrow"><NavigateNextIcon/></span>
                    </Link>

                    {!isLoading && (
                        <div className="mobile-account">
                            <span className="mobile-section-title">Аккаунт</span>

                            {isAuthenticated ? (
                                <>
                                    <div className="mobile-account-user">
                                        <AccountCircleOutlinedIcon />
                                        <div>
                                            <strong>{user?.name || 'Пользователь'}</strong>
                                            <span>{user?.email}</span>
                                        </div>
                                    </div>

                                    <Link to="/profile" className="mobile-account-link" onClick={onNavigate}>
                                        <AccountCircleOutlinedIcon />
                                        <span>Профиль</span>
                                    </Link>

                                    <Link to="/bookings" className="mobile-account-link" onClick={onNavigate}>
                                        <BookOnlineOutlinedIcon />
                                        <span>Мои бронирования</span>
                                    </Link>

                                    <Link to="/favorites" className="mobile-account-link" onClick={onNavigate}>
                                        <FavoriteBorderIcon />
                                        <span>Избранное</span>
                                    </Link>

                                    {user?.role === 'ADMIN' && (
                                        <Link to="/admin" className="mobile-account-link admin-item" onClick={onNavigate}>
                                            <AdminPanelSettingsOutlinedIcon />
                                            <span>Админ-панель</span>
                                        </Link>
                                    )}

                                    <button type="button" className="mobile-account-link logout-item" onClick={handleLogout}>
                                        <LogoutOutlinedIcon />
                                        <span>Выйти</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="mobile-account-link" onClick={onNavigate}>
                                        <AccountCircleOutlinedIcon />
                                        <span>Войти</span>
                                    </Link>

                                    <Link to="/register" className="mobile-account-link" onClick={onNavigate}>
                                        <AccountCircleOutlinedIcon />
                                        <span>Создать аккаунт</span>
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