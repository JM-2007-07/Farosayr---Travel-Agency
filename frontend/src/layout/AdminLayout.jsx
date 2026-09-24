import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Button,
  Avatar,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import LuggageRoundedIcon from '@mui/icons-material/LuggageRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import MailRoundedIcon from '@mui/icons-material/MailRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useAuth } from '../context/AuthContext';
import LanguageSwitcher from '../components/common/LanguageSwitcher';

const DRAWER_WIDTH = 270;

const NAV_ITEMS = [
  { to: '/admin', labelKey: 'admin.nav.dashboard', end: true, icon: DashboardRoundedIcon },
  { to: '/admin/tours', labelKey: 'admin.nav.tours', icon: FlightTakeoffRoundedIcon },
  { to: '/admin/destinations', labelKey: 'admin.nav.destinations', icon: PublicRoundedIcon },
  { to: '/admin/deals', labelKey: 'admin.nav.deals', icon: LocalOfferRoundedIcon },
  { to: '/admin/bookings', labelKey: 'admin.nav.bookings', icon: LuggageRoundedIcon },
  { to: '/admin/users', labelKey: 'admin.nav.users', icon: PeopleAltRoundedIcon },
  { to: '/admin/reviews', labelKey: 'admin.nav.reviews', icon: RateReviewRoundedIcon },
  { to: '/admin/messages', labelKey: 'admin.nav.messages', icon: MailRoundedIcon },
];

function NavList({ onNavigate }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <List sx={{ px: 1.5, pt: 2 }}>
      {NAV_ITEMS.map((item) => {
        const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
        const Icon = item.icon;

        return (
          <ListItemButton
            key={item.to}
            component={Link}
            to={item.to}
            selected={active}
            onClick={onNavigate}
            sx={{
              minHeight: 50,
              mb: 0.6,
              px: 1.5,
              borderRadius: '14px',
              color: active ? '#FFFFFF' : 'rgba(255,255,255,.58)',
              position: 'relative',
              transition: 'all .25s ease',
              '&:hover': {
                background: 'rgba(47,217,196,.08)',
                color: '#FFFFFF',
                transform: 'translateX(3px)',
              },
              '&.Mui-selected': {
                background: 'linear-gradient(135deg, rgba(47,217,196,.18), rgba(47,217,196,.07))',
                color: '#FFFFFF',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(47,217,196,.23), rgba(47,217,196,.1))',
                },
              },
              '&.Mui-selected::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '20%',
                width: 4,
                height: '60%',
                borderRadius: '0 6px 6px 0',
                background: '#2FD9C4',
                boxShadow: '0 0 14px rgba(47,217,196,.65)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 42,
                color: 'inherit',
                '& svg': {
                  fontSize: 22,
                },
              }}
            >
              <Icon />
            </ListItemIcon>

            <ListItemText
              primary={t(item.labelKey)}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: active ? 800 : 600,
              }}
            />

            {active && (
              <ChevronRightRoundedIcon
                sx={{
                  fontSize: 19,
                  color: '#2FD9C4',
                }}
              />
            )}
          </ListItemButton>
        );
      })}
    </List>
  );
}

function AdminBrand() {
  const { t } = useTranslation();

  return (
    <Box sx={{ px: 2.5, py: 2.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '14px',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            background: 'linear-gradient(135deg, #2FD9C4, #159B8A)',
            color: '#FFFFFF',
            boxShadow: '0 10px 28px rgba(47,217,196,.25)',
          }}
        >
          <FlightTakeoffRoundedIcon />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 18,
              lineHeight: 1.1,
              fontWeight: 900,
              color: '#FFFFFF',
              letterSpacing: '-.03em',
            }}
          >
            FaroSayr
          </Typography>

          <Typography
            sx={{
              mt: 0.4,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '.14em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,.42)',
            }}
          >
            {t('admin.layout.subtitle')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function AdminLayout() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'linear-gradient(180deg, #07182D 0%, #0B1F3A 55%, #081A30 100%)',
        color: '#FFFFFF',
      }}
    >
      <AdminBrand />

      <Divider sx={{ borderColor: 'rgba(255,255,255,.07)' }} />

      <Box sx={{ px: 2.5, pt: 2.5, pb: 0.5 }}>
        <Typography
          sx={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '.13em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,.32)',
          }}
        >
          {t('admin.layout.management')}
        </Typography>
      </Box>

      <NavList onNavigate={() => setMobileOpen(false)} />

      <Box sx={{ mt: 'auto', p: 1.5 }}>
        <Box sx={{ mb: 1.5 }}>
          <LanguageSwitcher variant="segmented" />
        </Box>

        <Box
          sx={{
            p: 1.5,
            mb: 1.5,
            borderRadius: '18px',
            background: 'linear-gradient(135deg, rgba(47,217,196,.1), rgba(255,255,255,.035))',
            border: '1px solid rgba(255,255,255,.07)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
            }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                fontSize: 15,
                fontWeight: 800,
                background: 'linear-gradient(135deg, #2FD9C4, #159B8A)',
                color: '#FFFFFF',
                boxShadow: '0 6px 18px rgba(47,217,196,.2)',
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#FFFFFF',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.name || t('admin.layout.administrator')}
              </Typography>

              <Typography
                sx={{
                  mt: 0.2,
                  fontSize: 11,
                  color: 'rgba(255,255,255,.42)',
                }}
              >
                {t('admin.layout.administrator')}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Button
          component={Link}
          to="/"
          fullWidth
          startIcon={<OpenInNewRoundedIcon sx={{ fontSize: 18 }} />}
          sx={{
            justifyContent: 'flex-start',
            px: 1.5,
            py: 1.1,
            mb: 0.6,
            borderRadius: '12px',
            color: 'rgba(255,255,255,.58)',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': {
              background: 'rgba(47,217,196,.08)',
              color: '#FFFFFF',
            },
          }}
        >
          {t('admin.layout.toSite')}
        </Button>

        <Button
          fullWidth
          startIcon={<LogoutRoundedIcon sx={{ fontSize: 18 }} />}
          onClick={handleLogout}
          sx={{
            justifyContent: 'flex-start',
            px: 1.5,
            py: 1.1,
            borderRadius: '12px',
            color: 'rgba(255,255,255,.58)',
            fontSize: 13,
            fontWeight: 700,
            textTransform: 'none',
            '&:hover': {
              background: 'rgba(214,92,92,.1)',
              color: '#FF8585',
            },
          }}
        >
          {t('account.logout')}
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: '#F5F8FA',
        '& ::-webkit-scrollbar': {
          width: 0,
          height: 0,
        },
        '& *': {
          scrollbarWidth: 'none',
        },
      }}
    >
      <AppBar
        position="fixed"
        sx={{
          display: { xs: 'block', md: 'none' },
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'rgba(7,24,45,.94)',
          color: '#FFFFFF',
          boxShadow: '0 8px 30px rgba(0,0,0,.18)',
          borderBottom: '1px solid rgba(255,255,255,.07)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <Toolbar sx={{ minHeight: 68 }}>
          <IconButton
            edge="start"
            aria-label={t('header.openMenu')}
            onClick={() => setMobileOpen(true)}
            sx={{
              width: 42,
              height: 42,
              mr: 1.5,
              borderRadius: '12px',
              color: '#FFFFFF',
              background: 'rgba(255,255,255,.07)',
              '&:hover': {
                background: 'rgba(47,217,196,.14)',
              },
            }}
          >
            <MenuRoundedIcon />
          </IconButton>

          <Box>
            <Typography
              sx={{
                fontSize: 17,
                lineHeight: 1.1,
                fontWeight: 900,
                color: '#FFFFFF',
              }}
            >
              FaroSayr
            </Typography>

            <Typography
              sx={{
                mt: 0.2,
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,.42)',
              }}
            >
              {t('admin.layout.subtitle')}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 0,
            background: '#0B1F3A',
            boxShadow: '20px 0 50px rgba(0,0,0,.25)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(255,255,255,.05)',
            background: '#0B1F3A',
            boxShadow: '8px 0 35px rgba(0,0,0,.12)',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          p: {
            xs: 2,
            sm: 2.5,
            md: 3.5,
            lg: 4,
          },
          mt: {
            xs: '68px',
            md: 0,
          },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}