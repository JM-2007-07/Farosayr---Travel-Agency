import { useState } from 'react';
import { Alert, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import { adminApi } from '../../services/adminService';
import { useAdminList } from '../../hooks/useAdminList';
import { getDateLocale } from '../../i18n';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminLoading from '../../components/admin/AdminLoading';
import AdminError from '../../components/admin/AdminError';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import AdminTable from '../../components/admin/AdminTable';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import './Admin.css';

export default function AdminMessages() {
  const { t, i18n } = useTranslation();
  const { status, rows, meta, page, setPage, isLoading, isError, isEmpty, reload } = useAdminList(adminApi.messages);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setDeleteError('');
    try {
      await adminApi.deleteMessage(deleteTarget.id);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, t, 'admin.messages.deleteError'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-page">
      <AdminPageHeader title={t('admin.nav.messages')} />
      <section className="admin-page-hero">
        <div className="admin-page-hero-content">
          <div className="admin-page-hero-main">
            <div className="admin-page-hero-icon"><EmailRoundedIcon /></div>
            <div>
              <div className="admin-page-eyebrow">FAROSAYR · CONTACT</div>
              <h1 className="admin-page-hero-title">{t('admin.messages.heroTitle')}</h1>
              <p className="admin-page-hero-description">{t('admin.messages.heroText')}</p>
            </div>
          </div>
          <div className="admin-page-decoration"><MarkEmailReadRoundedIcon /></div>
        </div>
      </section>
      {isLoading && <AdminLoading />}
      {isError && <AdminError />}
      {isEmpty && <AdminEmptyState message={t('admin.messages.empty')} />}
      {status === 'success' && rows.length > 0 && (
        <div className="admin-table-shell">
          <div className="admin-table-toolbar">
            <div className="admin-table-title">
              <span className="admin-table-title-icon"><EmailRoundedIcon /></span>
              <div>
                <div className="admin-table-title-text">{t('admin.dashboard.metrics.messages.description')}</div>
                <div className="admin-table-title-subtitle">{t('admin.messages.tableSubtitle')}</div>
              </div>
            </div>
          </div>
          <AdminTable
            columns={[
              {
                key: 'name',
                label: t('common.name'),
                render: (r) => (
                  <div>
                    <div className="admin-deal-name-title">{r.name}</div>
                    <div className="admin-deal-name-subtitle">{t('admin.common.client')}</div>
                  </div>
                ),
              },
              { key: 'email', label: t('common.email') },
              {
                key: 'subject',
                label: t('admin.messages.subject'),
                render: (r) => <span className="admin-deal-name-title">{r.subject || t('admin.messages.noSubject')}</span>,
              },
              {
                key: 'createdAt',
                label: t('admin.messages.date'),
                render: (r) => new Date(r.createdAt).toLocaleString(getDateLocale(i18n.language)),
              },
            ]}
            rows={rows}
            getRowId={(r) => r.id}
            page={page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
            renderActions={(r) => (
              <div className="admin-actions">
                <IconButton className="admin-action-btn admin-action-edit" size="small" onClick={() => setViewTarget(r)} title={t('common.view')} aria-label={t('common.view')}>
                  <VisibilityRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton className="admin-action-btn admin-action-delete" size="small" onClick={() => setDeleteTarget(r)} title={t('common.delete')} aria-label={t('common.delete')}>
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </div>
            )}
          />
        </div>
      )}
      <Dialog open={!!viewTarget} onClose={() => setViewTarget(null)} fullWidth maxWidth="sm" PaperProps={{ className: 'admin-dialog' }}>
        <DialogTitle className="admin-dialog-header">
          <div className="admin-dialog-header-inner">
            <div className="admin-dialog-icon"><EmailRoundedIcon /></div>
            <div>
              <div className="admin-dialog-title">{t('admin.messages.dialogTitle')}</div>
              <div className="admin-dialog-subtitle">{viewTarget?.subject || t('admin.messages.noSubject')}</div>
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="admin-dialog-content">
          <Stack spacing={2}>
            <div>
              <Typography variant="caption" color="text.secondary">{t('admin.messages.sender')}</Typography>
              <Typography fontWeight={700}>{viewTarget?.name}</Typography>
              <Typography variant="body2" color="text.secondary">{viewTarget?.email}</Typography>
            </div>
            <div>
              <Typography variant="caption" color="text.secondary">{t('common.message')}</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap', mt: 0.5, lineHeight: 1.7 }}>{viewTarget?.message}</Typography>
            </div>
          </Stack>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('admin.messages.deleteTitle')}
        resourceName={deleteTarget?.subject}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError('');
        }}
        loading={deleting}
      />
      {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
    </div>
  );
}