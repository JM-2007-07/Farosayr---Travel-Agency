import { useState } from 'react';
import { Alert, Avatar, Chip, MenuItem, Select, Stack, Typography } from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import BookOnlineRoundedIcon from '@mui/icons-material/BookOnlineRounded';
import { adminApi } from '../../services/adminService';
import { useAdminList } from '../../hooks/useAdminList';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminLoading from '../../components/admin/AdminLoading';
import AdminError from '../../components/admin/AdminError';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import AdminTable from '../../components/admin/AdminTable';
import './Admin.css';

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
const PAYMENT_OPTIONS = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

const STATUS_LABELS = {
  PENDING: 'В ожидании',
  CONFIRMED: 'Подтверждено',
  CANCELLED: 'Отменено',
  COMPLETED: 'Завершено',
};

const PAYMENT_LABELS = {
  PENDING: 'Ожидает',
  PAID: 'Оплачено',
  FAILED: 'Ошибка',
  REFUNDED: 'Возвращено',
};

function StatusCell({ booking, field, options, reload, setError }) {
  const [saving, setSaving] = useState(false);
  const isPayment = field === 'paymentStatus';
  const value = booking[field];

  async function handleChange(e) {
    setSaving(true);
    setError('');
    try {
      await adminApi.updateBooking(booking.id, { [field]: e.target.value });
      reload();
    } catch (err) {
      setError(err.message || 'Не удалось обновить бронирование.');
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
          {isPayment ? PAYMENT_LABELS[selected] : STATUS_LABELS[selected]}
        </span>
      )}
    >
      {options.map((opt) => (
        <MenuItem key={opt} value={opt}>
          {isPayment ? PAYMENT_LABELS[opt] : STATUS_LABELS[opt]}
        </MenuItem>
      ))}
    </Select>
  );
}

export default function AdminBookings() {
  const { status, rows, meta, page, setPage, isLoading, isError, isEmpty, reload } = useAdminList(adminApi.bookings);
  const [error, setError] = useState('');

  return (
    <div className="admin-page">
      <AdminPageHeader title="Бронирования" />

      <section className="admin-page-hero">
        <div className="admin-page-hero-content">
          <div className="admin-page-hero-main">
            <div className="admin-page-hero-icon"><BookOnlineRoundedIcon /></div>
            <div>
              <div className="admin-page-eyebrow">FAROSAYR · BOOKINGS</div>
              <h1 className="admin-page-hero-title">Бронирования клиентов</h1>
              <p className="admin-page-hero-description">Контролируйте заявки на туры, статусы бронирований и оплату в одном месте.</p>
            </div>
          </div>
          <div className="admin-page-decoration"><FlightTakeoffRoundedIcon /></div>
        </div>
      </section>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {isLoading && <AdminLoading />}
      {isError && <AdminError />}
      {isEmpty && <AdminEmptyState message="Бронирований пока нет." />}

      {status === 'success' && rows.length > 0 && (
        <div className="admin-table-shell">
          <div className="admin-table-toolbar">
            <div className="admin-table-title">
              <span className="admin-table-title-icon"><BookOnlineRoundedIcon /></span>
              <div>
                <div className="admin-table-title-text">Все бронирования</div>
                <div className="admin-table-title-subtitle">Заявки клиентов и состояние оплаты</div>
              </div>
            </div>
          </div>

          <AdminTable
            columns={[
              {
                key: 'user',
                label: 'Клиент',
                render: (r) => (
                  <div className="admin-user-cell">
                    <Avatar className="admin-user-avatar"><PersonRoundedIcon /></Avatar>
                    <Stack spacing={0}>
                      <Typography className="admin-deal-name-title">{r.user?.name || '—'}</Typography>
                      <Typography className="admin-deal-name-subtitle">{r.user?.email || 'Email не указан'}</Typography>
                    </Stack>
                  </div>
                ),
              },
              {
                key: 'items',
                label: 'Туры',
                render: (r) => (
                  <div className="admin-booking-tours">
                    {r.items?.map((i) => (
                      <div key={i.tour?.id || i.tour?.title} className="admin-booking-tour">
                        <FlightTakeoffRoundedIcon />
                        <span>{i.tour?.title || 'Тур не указан'}</span>
                        <b>×{i.quantity}</b>
                      </div>
                    ))}
                  </div>
                ),
              },
              {
                key: 'totalAmount',
                label: 'Сумма',
                render: (r) => (
                  <div className="admin-booking-price">
                    <PaymentsRoundedIcon />
                    <strong>${r.totalAmount}</strong>
                  </div>
                ),
              },
              {
                key: 'status',
                label: 'Статус',
                render: (r) => <StatusCell booking={r} field="status" options={STATUS_OPTIONS} reload={reload} setError={setError} />,
              },
              {
                key: 'paymentStatus',
                label: 'Оплата',
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