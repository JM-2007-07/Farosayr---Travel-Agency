import { useState } from 'react';
import { Alert, Avatar, Chip, MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import { adminApi } from '../../services/adminService';
import { useAdminList } from '../../hooks/useAdminList';
import { useAuth } from '../../context/AuthContext';
import { getDateLocale } from '../../i18n';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminLoading from '../../components/admin/AdminLoading';
import AdminError from '../../components/admin/AdminError';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import AdminTable from '../../components/admin/AdminTable';
import './Admin.css';

const ROLE_OPTIONS = ['USER', 'ADMIN'];

function RoleCell({ targetUser, reload, setError, disabled }) {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);

  async function handleChange(e) {
    setSaving(true);
    setError('');
    try {
      await adminApi.updateUserRole(targetUser.id, e.target.value);
      reload();
    } catch (err) {
      setError(getApiErrorMessage(err, t, 'admin.users.roleError'));
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
          {value === 'ADMIN' ? t('admin.layout.administrator') : t('common.user')}
        </span>
      )}
    >
      {ROLE_OPTIONS.map((opt) => (
        <MenuItem key={opt} value={opt}>
          <span className={`admin-role admin-role-${opt.toLowerCase()}`}>
            {opt === 'ADMIN' ? <ShieldRoundedIcon /> : <PersonRoundedIcon />}
            {opt === 'ADMIN' ? t('admin.layout.administrator') : t('common.user')}
          </span>
        </MenuItem>
      ))}
    </Select>
  );
}

export default function AdminUsers() {
  const { t, i18n } = useTranslation();
  const { status, rows, meta, page, setPage, isLoading, isError, isEmpty, reload } = useAdminList(adminApi.users);
  const { user: currentUser } = useAuth();
  const [error, setError] = useState('');

  return (
    <div className="admin-page">
      <AdminPageHeader title={t('admin.nav.users')} />

      <section className="admin-page-hero">
        <div className="admin-page-hero-content">
          <div className="admin-page-hero-main">
            <div className="admin-page-hero-icon"><PeopleAltRoundedIcon /></div>
            <div>
              <div className="admin-page-eyebrow">FAROSAYR · USERS</div>
              <h1 className="admin-page-hero-title">{t('admin.users.heroTitle')}</h1>
              <p className="admin-page-hero-description">{t('admin.users.heroText')}</p>
            </div>
          </div>
          <div className="admin-page-decoration"><AdminPanelSettingsRoundedIcon /></div>
        </div>
      </section>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {isLoading && <AdminLoading />}
      {isError && <AdminError />}
      {isEmpty && <AdminEmptyState message={t('admin.users.empty')} />}

      {status === 'success' && rows.length > 0 && (
        <div className="admin-table-shell">
          <div className="admin-table-toolbar">
            <div className="admin-table-title">
              <span className="admin-table-title-icon"><PeopleAltRoundedIcon /></span>
              <div>
                <div className="admin-table-title-text">{t('admin.users.tableTitle')}</div>
                <div className="admin-table-title-subtitle">{t('admin.users.tableSubtitle')}</div>
              </div>
            </div>
          </div>

          <AdminTable
            columns={[
              {
                key: 'name',
                label: t('common.user'),
                render: (r) => (
                  <div className="admin-user-cell">
                    <Avatar className="admin-user-avatar">
                      <PersonRoundedIcon />
                    </Avatar>
                    <div>
                      <div className="admin-deal-name-title">{r.name}</div>
                      <div className="admin-deal-name-subtitle">
                        {r.id === currentUser?.id ? t('admin.users.yourAccount') : t('admin.common.client')}
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'email',
                label: t('common.email'),
                render: (r) => <span className="admin-user-email">{r.email}</span>,
              },
              {
                key: 'createdAt',
                label: t('admin.users.registered'),
                render: (r) => (
                  <div className="admin-user-date">
                    <CalendarMonthRoundedIcon />
                    {new Date(r.createdAt).toLocaleDateString(getDateLocale(i18n.language))}
                  </div>
                ),
              },
              {
                key: 'role',
                label: t('admin.users.role'),
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