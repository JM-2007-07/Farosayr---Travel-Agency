import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import { adminApi } from '../../services/adminService';
import { useAdminList } from '../../hooks/useAdminList';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminLoading from '../../components/admin/AdminLoading';
import AdminError from '../../components/admin/AdminError';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import AdminTable from '../../components/admin/AdminTable';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import './Admin.css';

const EMPTY_FORM = {
  name: '',
  slug: '',
  description: '',
  image: '',
};

function DestinationFormDialog({ open, onClose, onSaved, destination }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() => (destination ? { ...destination } : EMPTY_FORM));
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError('');

    try {
      if (destination) {
        await adminApi.updateDestination(destination.id, form);
      } else {
        await adminApi.createDestination(form);
      }

      onSaved();
    } catch (err) {
      setStatus('idle');
      setError(getApiErrorMessage(err, t, 'admin.destinations.saveError'));
      return;
    }

    setStatus('idle');
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      className="admin-dialog"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 30px 80px rgba(11,31,58,.2)',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle className="admin-dialog-header">
          <div className="admin-dialog-header-inner">
            <div className="admin-dialog-icon">
              <PublicRoundedIcon />
            </div>

            <div>
              <div className="admin-dialog-title">
                {destination ? t('admin.destinations.dialogEdit') : t('admin.destinations.dialogNew')}
              </div>

              <div className="admin-dialog-subtitle">
                {t('admin.destinations.dialogSubtitle')}
              </div>
            </div>
          </div>
        </DialogTitle>

        <DialogContent className="admin-dialog-content">
          <Stack spacing={2}>
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              label={t('admin.common.title')}
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              fullWidth
              placeholder={t('admin.destinations.namePlaceholder')}
            />

            <TextField
              label="Slug"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              fullWidth
              placeholder="dubai"
              helperText={t('admin.common.slugHelperDestination')}
              slotProps={{
                input: {
                  startAdornment: <LinkRoundedIcon sx={{ mr: 1, color: '#9aa7b0', fontSize: 19 }} />,
                },
              }}
            />

            <TextField
              label={t('common.description')}
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={4}
              placeholder={t('admin.destinations.descriptionPlaceholder')}
            />

            <TextField
              label={t('admin.common.imageUrl')}
              name="image"
              value={form.image}
              onChange={handleChange}
              required
              fullWidth
              placeholder="https://..."
              slotProps={{
                input: {
                  startAdornment: <ImageRoundedIcon sx={{ mr: 1, color: '#9aa7b0', fontSize: 19 }} />,
                },
              }}
            />

            {form.image && (
              <Box
                sx={{
                  position: 'relative',
                  height: 150,
                  overflow: 'hidden',
                  border: '1px solid #e5edf0',
                  borderRadius: 2.5,
                  background: '#f4f7f8',
                }}
              >
                <img
                  src={form.image}
                  alt={t('admin.common.preview')}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />

                <Box
                  sx={{
                    position: 'absolute',
                    left: 12,
                    bottom: 12,
                    px: 1.2,
                    py: 0.6,
                    borderRadius: 1.5,
                    background: 'rgba(11,31,58,.78)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {t('admin.common.imagePreview')}
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions className="admin-dialog-actions">
          <Button
            onClick={onClose}
            disabled={status === 'submitting'}
            sx={{ color: '#607482' }}
          >
            {t('common.cancel')}
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={status === 'submitting'}
            startIcon={destination ? <EditRoundedIcon /> : <AddRoundedIcon />}
            sx={{
              minWidth: 145,
              borderRadius: 2,
              background: '#0b1f3a',
              boxShadow: '0 8px 20px rgba(11,31,58,.15)',
              '&:hover': {
                background: '#102b4b',
                boxShadow: '0 10px 24px rgba(11,31,58,.2)',
              },
            }}
          >
            {status === 'submitting' ? t('common.saving') : t('common.save')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function AdminDestinations() {
  const { t } = useTranslation();
  const {
    status,
    rows,
    meta,
    page,
    setPage,
    isLoading,
    isError,
    isEmpty,
    reload,
  } = useAdminList(adminApi.destinations);

  const [dialogItem, setDialogItem] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setDeleteError('');

    try {
      await adminApi.deleteDestination(deleteTarget.id);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, t, 'admin.destinations.deleteError'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-page">
      <AdminPageHeader title={t('admin.nav.destinations')} />

      <section className="admin-page-hero">
        <div className="admin-page-hero-content">
          <div className="admin-page-hero-main">
            <div className="admin-page-hero-icon">
              <PublicRoundedIcon />
            </div>

            <div>
              <span className="admin-page-eyebrow">
                FAROSAYR · DESTINATIONS
              </span>

              <h2 className="admin-page-hero-title">
                {t('admin.destinations.heroTitle')}
              </h2>

              <p className="admin-page-hero-description">
                {t('admin.destinations.heroText')}
              </p>
            </div>
          </div>

          <div className="admin-page-hero-action">
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setDialogItem(null)}
              sx={{
                px: 2.5,
                py: 1.25,
                borderRadius: 2.5,
                background: '#2fd9c4',
                color: '#0b1f3a',
                fontWeight: 800,
                boxShadow: '0 10px 28px rgba(47,217,196,.18)',
                '&:hover': {
                  background: '#45e0ce',
                  boxShadow: '0 14px 32px rgba(47,217,196,.25)',
                },
              }}
            >
              {t('admin.destinations.add')}
            </Button>
          </div>
        </div>

        <div className="admin-page-decoration" />
      </section>

      {isLoading && <AdminLoading />}

      {isError && <AdminError />}

      {isEmpty && <AdminEmptyState message={t('admin.destinations.empty')} />}

      {status === 'success' && rows.length > 0 && (
        <>
          <section className="admin-page-summary">
            <div className="admin-summary-card">
              <div className="admin-summary-top">
                <span className="admin-summary-label">
                  {t('admin.destinations.total')}
                </span>

                <div className="admin-summary-icon">
                  <PublicRoundedIcon fontSize="small" />
                </div>
              </div>

              <div className="admin-summary-value">
                {rows.length}
              </div>
            </div>

            <div className="admin-summary-card">
              <div className="admin-summary-top">
                <span className="admin-summary-label">
                  {t('admin.common.onCurrentPage')}
                </span>

                <div className="admin-summary-icon">
                  <PublicRoundedIcon fontSize="small" />
                </div>
              </div>

              <div className="admin-summary-value">
                {rows.length}
              </div>
            </div>

            <div className="admin-summary-card">
              <div className="admin-summary-top">
                <span className="admin-summary-label">
                  {t('admin.common.catalogPage')}
                </span>

                <div className="admin-summary-icon">
                  <LinkRoundedIcon fontSize="small" />
                </div>
              </div>

              <div className="admin-summary-value">
                {page}
              </div>
            </div>
          </section>

          <section className="admin-table-shell">
            <div className="admin-table-toolbar">
              <div className="admin-table-title">
                <div className="admin-table-title-icon">
                  <PublicRoundedIcon fontSize="small" />
                </div>

                <div>
                  <div className="admin-table-title-text">
                    {t('admin.destinations.tableTitle')}
                  </div>

                  <div className="admin-table-title-subtitle">
                    {t('admin.destinations.tableSubtitle')}
                  </div>
                </div>
              </div>

              <Typography variant="caption" color="text.secondary">
                {t('admin.common.records', { count: rows.length })}
              </Typography>
            </div>

            <AdminTable
              columns={[
                {
                  key: 'name',
                  label: t('common.destination'),
                  render: (r) => (
                    <div className="admin-deal-name">
                      <div className="admin-deal-image">
                        <img
                          src={r.image}
                          alt={r.name}
                          onError={(e) => {
                            e.currentTarget.style.opacity = '0';
                          }}
                        />
                      </div>

                      <div>
                        <div className="admin-deal-name-title">
                          {r.name}
                        </div>

                        <div className="admin-deal-name-subtitle">
                          {r.description || t('admin.common.noDescription')}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'slug',
                  label: 'Slug',
                  render: (r) => (
                    <Stack direction="row" spacing={0.8} alignItems="center">
                      <LinkRoundedIcon sx={{ fontSize: 15, color: '#2fd9c4' }} />

                      <Typography
                        variant="body2"
                        sx={{
                          color: '#607482',
                          fontFamily: 'monospace',
                          fontSize: 12,
                        }}
                      >
                        /{r.slug}
                      </Typography>
                    </Stack>
                  ),
                },
              ]}
              rows={rows}
              getRowId={(r) => r.id}
              page={page}
              totalPages={meta.totalPages}
              onPageChange={setPage}
              renderActions={(r) => (
                <div className="admin-actions">
                  <IconButton
                    size="small"
                    className="admin-action-btn admin-action-edit"
                    onClick={() => setDialogItem(r)}
                    title={t('common.edit')}
                    aria-label={t('common.edit')}
                  >
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    className="admin-action-btn admin-action-delete"
                    onClick={() => setDeleteTarget(r)}
                    title={t('common.delete')}
                    aria-label={t('common.delete')}
                  >
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </div>
              )}
            />
          </section>
        </>
      )}

      {dialogItem !== undefined && (
        <DestinationFormDialog
          open
          destination={dialogItem}
          onClose={() => setDialogItem(undefined)}
          onSaved={() => {
            setDialogItem(undefined);
            reload();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('admin.destinations.deleteTitle')}
        resourceName={deleteTarget?.name}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError('');
        }}
        loading={deleting}
      />

      {deleteError && (
        <Alert
          severity="error"
          className="admin-error"
          sx={{ borderRadius: 2 }}
        >
          {deleteError}
        </Alert>
      )}
    </div>
  );
}