import {
  Box,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
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

const METRICS = [
  {
    key: 'users',
    label: 'Пользователи',
    icon: PeopleAltRoundedIcon,
    description: 'Всего зарегистрировано',
    tone: 'blue',
  },
  {
    key: 'tours',
    label: 'Туры',
    icon: FlightTakeoffRoundedIcon,
    description: 'Доступно на сайте',
    tone: 'turquoise',
  },
  {
    key: 'destinations',
    label: 'Направления',
    icon: PublicRoundedIcon,
    description: 'Активных направлений',
    tone: 'gold',
  },
  {
    key: 'bookings',
    label: 'Бронирования',
    icon: CalendarMonthRoundedIcon,
    description: 'Всего заявок',
    tone: 'purple',
  },
  {
    key: 'pendingBookings',
    label: 'В ожидании',
    icon: PendingActionsRoundedIcon,
    description: 'Требуют внимания',
    tone: 'orange',
  },
  {
    key: 'reviews',
    label: 'Отзывы',
    icon: RateReviewRoundedIcon,
    description: 'Отзывы клиентов',
    tone: 'pink',
  },
  {
    key: 'messages',
    label: 'Сообщения',
    icon: MarkEmailUnreadRoundedIcon,
    description: 'Входящие сообщения',
    tone: 'cyan',
  },
  {
    key: 'newsletterSubscribers',
    label: 'Подписчики',
    icon: GroupsRoundedIcon,
    description: 'Подписка на новости',
    tone: 'green',
  },
];

function MetricCard({ metric, value }) {
  const Icon = metric.icon;

  return (
    <Grid item xs={12} sm={6} lg={3}>
      <Paper
        className={`admin-metric-card admin-metric-card-${metric.tone}`}
        elevation={0}
        sx={{width:'180px'}}
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
            {metric.label}
          </Typography>

          <Typography className="admin-metric-description">
            {metric.description}
          </Typography>
        </div>
      </Paper>
    </Grid>
  );
}

export default function AdminDashboard() {
  const { status, data, isLoading, isError } = useAsyncData(
    () => adminApi.dashboard().then((r) => r.data),
    [],
  );

  return (
    <div className="admin-dashboard">
      <AdminPageHeader title="Дашборд" />

      <section className="admin-dashboard-welcome">
        <div className="admin-dashboard-welcome-content">
          <div className="admin-dashboard-welcome-icon">
            <FlightTakeoffRoundedIcon />
          </div>

          <div>
            <span className="admin-dashboard-eyebrow">
              FAROSAYR ADMINISTRATION
            </span>

            <h2>Панель управления</h2>

            <p>
              Здесь вы можете контролировать основные показатели
              туристического сервиса и управлять контентом FaroSayr.
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
              <h3>Обзор системы</h3>
            </div>

            <div className="admin-live-status">
              <span />
              Данные актуальны
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