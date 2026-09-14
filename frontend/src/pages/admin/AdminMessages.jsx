import { useState } from 'react';
import { Alert, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import { adminApi } from '../../services/adminService';
import { useAdminList } from '../../hooks/useAdminList';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminLoading from '../../components/admin/AdminLoading';
import AdminError from '../../components/admin/AdminError';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import AdminTable from '../../components/admin/AdminTable';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import './Admin.css';

export default function AdminMessages() {
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
      setDeleteError(err.message || 'Не удалось удалить сообщение.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-page">
      <AdminPageHeader title="Сообщения" />
      <section className="admin-page-hero">
        <div className="admin-page-hero-content">
          <div className="admin-page-hero-main">
            <div className="admin-page-hero-icon"><EmailRoundedIcon /></div>
            <div>
              <div className="admin-page-eyebrow">FAROSAYR · CONTACT</div>
              <h1 className="admin-page-hero-title">Сообщения клиентов</h1>
              <p className="admin-page-hero-description">Обращения и вопросы клиентов, отправленные через форму обратной связи.</p>
            </div>
          </div>
          <div className="admin-page-decoration"><MarkEmailReadRoundedIcon /></div>
        </div>
      </section>
      {isLoading && <AdminLoading />}
      {isError && <AdminError />}
      {isEmpty && <AdminEmptyState message="Сообщений пока нет." />}
      {status === 'success' && rows.length > 0 && (
        <div className="admin-table-shell">
          <div className="admin-table-toolbar">
            <div className="admin-table-title">
              <span className="admin-table-title-icon"><EmailRoundedIcon /></span>
              <div>
                <div className="admin-table-title-text">Входящие сообщения</div>
                <div className="admin-table-title-subtitle">Просмотр и управление обращениями клиентов</div>
              </div>
            </div>
          </div>
          <AdminTable
            columns={[
              {
                key: 'name',
                label: 'Имя',
                render: (r) => (
                  <div>
                    <div className="admin-deal-name-title">{r.name}</div>
                    <div className="admin-deal-name-subtitle">Клиент FaroSayr</div>
                  </div>
                ),
              },
              { key: 'email', label: 'Email' },
              {
                key: 'subject',
                label: 'Тема',
                render: (r) => <span className="admin-deal-name-title">{r.subject || 'Без темы'}</span>,
              },
              {
                key: 'createdAt',
                label: 'Дата',
                render: (r) => new Date(r.createdAt).toLocaleString('ru-RU'),
              },
            ]}
            rows={rows}
            getRowId={(r) => r.id}
            page={page}
            totalPages={meta.totalPages}
            onPageChange={setPage}
            renderActions={(r) => (
              <div className="admin-actions">
                <IconButton className="admin-action-btn admin-action-edit" size="small" onClick={() => setViewTarget(r)} title="Просмотреть">
                  <VisibilityRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton className="admin-action-btn admin-action-delete" size="small" onClick={() => setDeleteTarget(r)} title="Удалить">
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
              <div className="admin-dialog-title">Сообщение клиента</div>
              <div className="admin-dialog-subtitle">{viewTarget?.subject || 'Без темы'}</div>
            </div>
          </div>
        </DialogTitle>
        <DialogContent className="admin-dialog-content">
          <Stack spacing={2}>
            <div>
              <Typography variant="caption" color="text.secondary">Отправитель</Typography>
              <Typography fontWeight={700}>{viewTarget?.name}</Typography>
              <Typography variant="body2" color="text.secondary">{viewTarget?.email}</Typography>
            </div>
            <div>
              <Typography variant="caption" color="text.secondary">Сообщение</Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap', mt: 0.5, lineHeight: 1.7 }}>{viewTarget?.message}</Typography>
            </div>
          </Stack>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={!!deleteTarget}
        title="Удалить сообщение"
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