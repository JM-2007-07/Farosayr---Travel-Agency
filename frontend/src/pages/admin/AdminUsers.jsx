import { useState } from 'react';
import { Alert, Avatar, Chip, MenuItem, Select } from '@mui/material';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import { adminApi } from '../../services/adminService';
import { useAdminList } from '../../hooks/useAdminList';
import { useAuth } from '../../context/AuthContext';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminLoading from '../../components/admin/AdminLoading';
import AdminError from '../../components/admin/AdminError';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import AdminTable from '../../components/admin/AdminTable';
import './Admin.css';

const ROLE_OPTIONS = ['USER', 'ADMIN'];

function RoleCell({ targetUser, reload, setError, disabled }) {
  const [saving, setSaving] = useState(false);

  async function handleChange(e) {
    setSaving(true);
    setError('');
    try {
      await adminApi.updateUserRole(targetUser.id, e.target.value);
      reload();
    } catch (err) {
      setError(err.message || 'Не удалось изменить роль.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select
      size="small"
      value={targetUser.role}
      onChange={handleChange}
      disabled={saving || disabled}
      className="admin-role-select"
      renderValue={(value) => (
        <span className={`admin-role admin-role-${value.toLowerCase()}`}>
          {value === 'ADMIN' ? <ShieldRoundedIcon /> : <PersonRoundedIcon />}
          {value === 'ADMIN' ? 'Администратор' : 'Пользователь'}
        </span>
      )}
    >
      {ROLE_OPTIONS.map((opt) => (
        <MenuItem key={opt} value={opt}>
          <span className={`admin-role admin-role-${opt.toLowerCase()}`}>
            {opt === 'ADMIN' ? <ShieldRoundedIcon /> : <PersonRoundedIcon />}
            {opt === 'ADMIN' ? 'Администратор' : 'Пользователь'}
          </span>
        </MenuItem>
      ))}
    </Select>
  );
}

export default function AdminUsers() {
  const { status, rows, meta, page, setPage, isLoading, isError, isEmpty, reload } = useAdminList(adminApi.users);
  const { user: currentUser } = useAuth();
  const [error, setError] = useState('');

  return (
    <div className="admin-page">
      <AdminPageHeader title="Пользователи" />

      <section className="admin-page-hero">
        <div className="admin-page-hero-content">
          <div className="admin-page-hero-main">
            <div className="admin-page-hero-icon"><PeopleAltRoundedIcon /></div>
            <div>
              <div className="admin-page-eyebrow">FAROSAYR · USERS</div>
              <h1 className="admin-page-hero-title">Пользователи системы</h1>
              <p className="admin-page-hero-description">Управляйте аккаунтами клиентов и ролями пользователей административной панели.</p>
            </div>
          </div>
          <div className="admin-page-decoration"><AdminPanelSettingsRoundedIcon /></div>
        </div>
      </section>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {isLoading && <AdminLoading />}
      {isError && <AdminError />}
      {isEmpty && <AdminEmptyState message="Пользователей пока нет." />}

      {status === 'success' && rows.length > 0 && (
        <div className="admin-table-shell">
          <div className="admin-table-toolbar">
            <div className="admin-table-title">
              <span className="admin-table-title-icon"><PeopleAltRoundedIcon /></span>
              <div>
                <div className="admin-table-title-text">Список пользователей</div>
                <div className="admin-table-title-subtitle">Аккаунты и права доступа к панели управления</div>
              </div>
            </div>
          </div>

          <AdminTable
            columns={[
              {
                key: 'name',
                label: 'Пользователь',
                render: (r) => (
                  <div className="admin-user-cell">
                    <Avatar className="admin-user-avatar">
                      <PersonRoundedIcon />
                    </Avatar>
                    <div>
                      <div className="admin-deal-name-title">{r.name}</div>
                      <div className="admin-deal-name-subtitle">
                        {r.id === currentUser?.id ? 'Ваш аккаунт' : 'Клиент FaroSayr'}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'email',
                label: 'Email',
                render: (r) => <span className="admin-user-email">{r.email}</span>,
              },
              {
                key: 'createdAt',
                label: 'Регистрация',
                render: (r) => (
                  <div className="admin-user-date">
                    <CalendarMonthRoundedIcon />
                    {new Date(r.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                ),
              },
              {
                key: 'role',
                label: 'Роль',
                render: (r) => (
                  <RoleCell
                    targetUser={r}
                    reload={reload}
                    setError={setError}
                    disabled={r.id === currentUser?.id}
                  />
                ),
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