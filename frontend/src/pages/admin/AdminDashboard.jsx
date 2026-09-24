import {
  Box,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import MarkEmailUnreadRoundedIcon from '@mui/icons-material/MarkEmailUnreadRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminLoading from '../../components/admin/AdminLoading';
import AdminError from '../../components/admin/AdminError';
import { adminApi } from '../../services/adminService';
import { useAsyncData } from '../../hooks/useAsyncData';
import './AdminDashboard.css';

// Label/description text: admin.dashboard.metrics.<key>.{label,description}
const METRICS = [
  { key: 'users', icon: PeopleAltRoundedIcon, tone: 'blue' },
  { key: 'tours', icon: FlightTakeoffRoundedIcon, tone: 'turquoise' },
  { key: 'destinations', icon: PublicRoundedIcon, tone: 'gold' },
  { key: 'bookings', icon: CalendarMonthRoundedIcon, tone: 'purple' },
  { key: 'pendingBookings', icon: PendingActionsRoundedIcon, tone: 'orange' },
  { key: 'reviews', icon: RateReviewRoundedIcon, tone: 'pink' },
  { key: 'messages', icon: MarkEmailUnreadRoundedIcon, tone: 'cyan' },
  { key: 'newsletterSubscribers', icon: GroupsRoundedIcon, tone: 'green' },
];

function MetricCard({ metric, value }) {
  const { t } = useTranslation();
  const Icon = metric.icon;

  return (
    <Grid size={{ xs: 6, sm: 6, lg: 3 }}>
      <Paper
        className={`admin-metric-card admin-metric-card-${metric.tone}`}
        elevation={0}
        sx={{minWidth:'180px'}}
      >
        <div className="admin-metric-glow" />
        <div className="admin-metric-top">
          <div className="admin-metric-icon">
            <Icon />
          </div>
          <div className="admin-metric-trend">
            <TrendingUpRoundedIcon />
          </div>
        </div>

        <div className="admin-metric-content">
          <Typography className="admin-metric-value">
            {value ?? 0}
          </Typography>

          <Typography className="admin-metric-label">
            {t(`admin.dashboard.metrics.${metric.key}.label`)}
          </Typography>

          <Typography className="admin-metric-description">
            {t(`admin.dashboard.metrics.${metric.key}.description`)}
          </Typography>
        </div>
      </Paper>
    </Grid>
  );
}

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { status, data, isLoading, isError } = useAsyncData(
    () => adminApi.dashboard().then((r) => r.data),
    [],
  );

  return (
    <div className="admin-dashboard">
      <AdminPageHeader title={t('admin.nav.dashboard')} />

      <section className="admin-dashboard-welcome">
        <div className="admin-dashboard-welcome-content">
          <div className="admin-dashboard-welcome-icon">
            <FlightTakeoffRoundedIcon />
          </div>

          <div>
            <span className="admin-dashboard-eyebrow">
              FAROSAYR ADMINISTRATION
            </span>

            <h2>{t('admin.dashboard.welcomeTitle')}</h2>

            <p>
              {t('admin.dashboard.welcomeText')}
            </p>
          </div>
        </div>

        <div className="admin-dashboard-welcome-decoration">
          <div className="admin-dashboard-orbit orbit-one" />
          <div className="admin-dashboard-orbit orbit-two" />
          <div className="admin-dashboard-orbit orbit-three" />
          <FlightTakeoffRoundedIcon />
        </div>
      </section>

      {isLoading && <AdminLoading />}

      {isError && <AdminError />}

      {status === 'success' && data && (
        <section className="admin-metrics-section">
          <div className="admin-section-heading">
            <div>
              <span>OVERVIEW</span>
              <h3>{t('admin.dashboard.overview')}</h3>
            </div>

            <div className="admin-live-status">
              <span />
              {t('admin.dashboard.live')}
            </div>
          </div>

          <Grid container spacing={2.5}>
            {METRICS.map((metric) => (
              <MetricCard
                key={metric.key}
                metric={metric}
                value={data[metric.key]}
                
              />
            ))}
          </Grid>
        </section>
      )}
    </div>
  );
}