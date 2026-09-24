import { useState } from 'react';
import { Alert, Avatar, Chip, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import BookOnlineRoundedIcon from '@mui/icons-material/BookOnlineRounded';
import { adminApi } from '../../services/adminService';
import { useAdminList } from '../../hooks/useAdminList';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminLoading from '../../components/admin/AdminLoading';
import AdminError from '../../components/admin/AdminError';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import AdminTable from '../../components/admin/AdminTable';
import './Admin.css';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
const PAYMENT_OPTIONS = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

function StatusCell({ booking, field, options, reload, setError }) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const isPayment = field === 'paymentStatus';
  const value = booking[field];
  const labelFor = (opt) =>
    t(`admin.bookings.${isPayment ? 'payment' : 'status'}.${opt}`, { defaultValue: opt });

  async function handleChange(e) {
    setSaving(true);
    setError('');
    try {
      await adminApi.updateBooking(booking.id, { [field]: e.target.value });
      reload();
    } catch (err) {
      setError(getApiErrorMessage(err, t, 'admin.bookings.updateError'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select
      size="small"
      value={value}
      onChange={handleChange}
      disabled={saving}
      className={`admin-booking-select ${isPayment ? 'admin-payment-select' : ''}`}
      renderValue={(selected) => (
        <span className={`admin-booking-status admin-booking-status-${selected.toLowerCase()}`}>
          {isPayment ? <PaymentsRoundedIcon /> : <EventAvailableRoundedIcon />}
          {labelFor(selected)}
        </span>
      )}
    >
      {options.map((opt) => (
        <MenuItem key={opt} value={opt}>
          {labelFor(opt)}
        </MenuItem>
      ))}
    </Select>
  );
}

export default function AdminBookings() {
  const { t } = useTranslation();
  const { status, rows, meta, page, setPage, isLoading, isError, isEmpty, reload } = useAdminList(adminApi.bookings);
  const [error, setError] = useState('');

  return (
    <div className="admin-page">
      <AdminPageHeader title={t('admin.nav.bookings')} />

      <section className="admin-page-hero">
        <div className="admin-page-hero-content">
          <div className="admin-page-hero-main">
            <div className="admin-page-hero-icon"><BookOnlineRoundedIcon /></div>
            <div>
              <div className="admin-page-eyebrow">FAROSAYR · BOOKINGS</div>
              <h1 className="admin-page-hero-title">{t('admin.bookings.heroTitle')}</h1>
              <p className="admin-page-hero-description">{t('admin.bookings.heroText')}</p>
            </div>
          </div>
          <div className="admin-page-decoration"><FlightTakeoffRoundedIcon /></div>
        </div>
      </section>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {isLoading && <AdminLoading />}
      {isError && <AdminError />}
      {isEmpty && <AdminEmptyState message={t('admin.bookings.empty')} />}

      {status === 'success' && rows.length > 0 && (
        <div className="admin-table-shell">
          <div className="admin-table-toolbar">
            <div className="admin-table-title">
              <span className="admin-table-title-icon"><BookOnlineRoundedIcon /></span>
              <div>
                <div className="admin-table-title-text">{t('admin.bookings.tableTitle')}</div>
                <div className="admin-table-title-subtitle">{t('admin.bookings.tableSubtitle')}</div>
              </div>
            </div>
          </div>

          <AdminTable
            columns={[
              {
                key: 'user',
                label: t('admin.bookings.client'),
                render: (r) => (
                  <div className="admin-user-cell">
                    <Avatar className="admin-user-avatar"><PersonRoundedIcon /></Avatar>
                    <Stack spacing={0}>
                      <Typography className="admin-deal-name-title">{r.user?.name || '—'}</Typography>
                      <Typography className="admin-deal-name-subtitle">{r.user?.email || t('admin.bookings.noEmail')}</Typography>
                    </Stack>
                  </div>
                ),
              },
              {
                key: 'items',
                label: t('common.tours'),
                render: (r) => (
                  <div className="admin-booking-tours">
                    {r.items?.map((i) => (
                      <div key={i.tour?.id || i.tour?.title} className="admin-booking-tour">
                        <FlightTakeoffRoundedIcon />
                        <span>{i.tour?.title || t('admin.common.noTour')}</span>
                        <b>×{i.quantity}</b>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                key: 'totalAmount',
                label: t('common.amount'),
                render: (r) => (
                  <div className="admin-booking-price">
                    <PaymentsRoundedIcon />
                    <strong>${r.totalAmount}</strong>
                  </div>
                ),
              },
              {
                key: 'status',
                label: t('common.status'),
                render: (r) => <StatusCell booking={r} field="status" options={STATUS_OPTIONS} reload={reload} setError={setError} />,
              },
              {
                key: 'paymentStatus',
                label: t('common.payment'),
                render: (r) => <StatusCell booking={r} field="paymentStatus" options={PAYMENT_OPTIONS} reload={reload} setError={setError} />,
              },
            ]}
            rows={rows}
            getRowId={(r) => r.id}
            page={page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}