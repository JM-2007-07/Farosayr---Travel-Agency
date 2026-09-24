import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import ConfirmationNumberRoundedIcon from '@mui/icons-material/ConfirmationNumberRounded';
import { adminApi } from '../../services/adminService';
import { useAdminList } from '../../hooks/useAdminList';
import { useAsyncData } from '../../hooks/useAsyncData';
import { getDateLocale } from '../../i18n';
import { getApiErrorMessage } from '../../utils/getApiErrorMessage';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminLoading from '../../components/admin/AdminLoading';
import AdminError from '../../components/admin/AdminError';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import AdminTable from '../../components/admin/AdminTable';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import './Admin.css';

const EMPTY_FORM = {
  title: '',
  description: '',
  image: '',
  price: '',
  oldPrice: '',
  discount: '',
  startsAt: '',
  endsAt: '',
  isActive: true,
  tourId: '',
};

function toDatetimeLocal(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function DealFormDialog({ open, onClose, onSaved, deal, tours }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(() =>
    deal
      ? {
          title: deal.title,
          description: deal.description,
          image: deal.image,
          price: String(deal.price),
          oldPrice: String(deal.oldPrice),
          discount: String(deal.discount),
          startsAt: toDatetimeLocal(deal.startsAt),
          endsAt: toDatetimeLocal(deal.endsAt),
          isActive: deal.isActive,
          tourId: deal.tourId ?? '',
        }
      : EMPTY_FORM
  );

  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('submitting');
    setError('');

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        oldPrice: Number(form.oldPrice),
        discount: Number(form.discount),
        startsAt: new Date(form.startsAt).toISOString(),
        endsAt: new Date(form.endsAt).toISOString(),
        tourId: form.tourId || null,
      };

      if (deal) {
        await adminApi.updateDeal(deal.id, payload);
      } else {
        await adminApi.createDeal(payload);
      }

      onSaved();
    } catch (err) {
      setStatus('idle');
      setError(getApiErrorMessage(err, t, 'admin.deals.saveError'));
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
              <LocalOfferRoundedIcon />
            </div>

            <div>
              <div className="admin-dialog-title">
                {deal ? t('admin.deals.dialogEdit') : t('admin.deals.dialogNew')}
              </div>

              <div className="admin-dialog-subtitle">
                {t('admin.deals.dialogSubtitle')}
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

            <TextField label={t('admin.common.title')} name="title" value={form.title} onChange={handleChange} required fullWidth />

            <TextField
              label={t('common.description')}
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={3}
            />

            <TextField label={t('admin.common.imageUrl')} name="image" value={form.image} onChange={handleChange} required fullWidth />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label={t('admin.deals.oldPrice')} name="oldPrice" type="number" value={form.oldPrice} onChange={handleChange} required fullWidth />
              <TextField label={t('admin.deals.newPrice')} name="price" type="number" value={form.price} onChange={handleChange} required fullWidth />
              <TextField label={t('admin.deals.discountPercent')} name="discount" type="number" value={form.discount} onChange={handleChange} required fullWidth />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label={t('admin.deals.startsAt')} name="startsAt" type="datetime-local" value={form.startsAt} onChange={handleChange} required fullWidth slotProps={{ inputLabel: { shrink: true } }} />

              <TextField label={t('admin.deals.endsAt')} name="endsAt" type="datetime-local" value={form.endsAt} onChange={handleChange} required fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            </Stack>

            <TextField select label={t('admin.deals.linkedTour')} name="tourId" value={form.tourId} onChange={handleChange} fullWidth>
              <MenuItem value="">{t('admin.deals.noLinkedTour')}</MenuItem>

              {tours.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.title}
                </MenuItem>
              ))}
            </TextField>

            <Paper
              variant="outlined"
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                background: '#f8fbfc',
                borderColor: '#e5edf0',
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    sx={{
                      color: '#2fd9c4',
                      '&.Mui-checked': {
                        color: '#2fd9c4',
                      },
                    }}
                  />
                }
                label={
                  <Typography fontSize={14} fontWeight={600}>
                    {t('admin.deals.isActive')}
                  </Typography>
                }
              />
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions className="admin-dialog-actions">
          <Button onClick={onClose} disabled={status === 'submitting'} sx={{ color: '#607482' }}>
            {t('common.cancel')}
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={status === 'submitting'}
            startIcon={<LocalOfferRoundedIcon />}
            sx={{
              minWidth: 140,
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

export default function AdminDeals() {
  const { t, i18n } = useTranslation();
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
  } = useAdminList(adminApi.deals);

  const { data: toursData } = useAsyncData(
    () => adminApi.tours({ limit: 100 }).then((r) => r.data),
    [],
  );

  const tours = toursData ?? [];

  const [dialogItem, setDialogItem] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setDeleteError('');

    try {
      await adminApi.deleteDeal(deleteTarget.id);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, t, 'admin.deals.deleteError'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-page">
      <AdminPageHeader title={t('navigation.deals')} />

      <section className="admin-page-hero">
        <div className="admin-page-hero-content">
          <div className="admin-page-hero-main">
            <div className="admin-page-hero-icon">
              <LocalOfferRoundedIcon />
            </div>

            <div>
              <span className="admin-page-eyebrow">
                FAROSAYR · SPECIAL OFFERS
              </span>

              <h2 className="admin-page-hero-title">
                {t('navigation.deals')}
              </h2>

              <p className="admin-page-hero-description">
                {t('admin.deals.heroText')}
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
              {t('admin.deals.add')}
            </Button>
          </div>
        </div>

        <div className="admin-page-decoration" />
      </section>

      {isLoading && <AdminLoading />}

      {isError && <AdminError />}

      {isEmpty && <AdminEmptyState message={t('admin.deals.empty')} />}

      {status === 'success' && rows.length > 0 && (
        <>
          <section className="admin-page-summary">
            <div className="admin-summary-card">
              <div className="admin-summary-top">
                <span className="admin-summary-label">{t('admin.deals.total')}</span>

                <div className="admin-summary-icon">
                  <ConfirmationNumberRoundedIcon fontSize="small" />
                </div>
              </div>

              <div className="admin-summary-value">
                {rows.length}
              </div>
            </div>

            <div className="admin-summary-card">
              <div className="admin-summary-top">
                <span className="admin-summary-label">{t('admin.deals.activeCount')}</span>

                <div className="admin-summary-icon">
                  <LocalOfferRoundedIcon fontSize="small" />
                </div>
              </div>

              <div className="admin-summary-value">
                {rows.filter((deal) => deal.isActive).length}
              </div>
            </div>

            <div className="admin-summary-card">
              <div className="admin-summary-top">
                <span className="admin-summary-label">{t('admin.deals.avgDiscount')}</span>

                <div className="admin-summary-icon">
                  <PercentRoundedIcon fontSize="small" />
                </div>
              </div>

              <div className="admin-summary-value">
                {rows.length
                  ? Math.round(
                      rows.reduce((sum, deal) => sum + Number(deal.discount || 0), 0) / rows.length,
                    )
                  : 0}
                %
              </div>
            </div>
          </section>

          <section className="admin-table-shell">
            <div className="admin-table-toolbar">
              <div className="admin-table-title">
                <div className="admin-table-title-icon">
                  <LocalOfferRoundedIcon fontSize="small" />
                </div>

                <div>
                  <div className="admin-table-title-text">
                    {t('admin.deals.tableTitle')}
                  </div>

                  <div className="admin-table-title-subtitle">
                    {t('admin.deals.tableSubtitle')}
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
                  key: 'title',
                  label: t('admin.deals.deal'),
                  render: (r) => (
                    <div className="admin-deal-name">
                      <div className="admin-deal-image">
                        <img src={r.image} alt={r.title} />
                      </div>

                      <div>
                        <div className="admin-deal-name-title">
                          {r.title}
                        </div>

                        <div className="admin-deal-name-subtitle">
                          {r.description}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'price',
                  label: t('common.price'),
                  render: (r) => (
                    <div className="admin-price">
                      <span className="admin-price-current">
                        ${r.price}
                      </span>

                      <span className="admin-price-old">
                        ${r.oldPrice}
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'discount',
                  label: t('admin.deals.discount'),
                  render: (r) => (
                    <span className="admin-discount">
                      -{r.discount}%
                    </span>
                  ),
                },
                {
                  key: 'endsAt',
                  label: t('admin.deals.endsAt'),
                  render: (r) => (
                    <Stack direction="row" spacing={0.7} alignItems="center">
                      <AccessTimeRoundedIcon sx={{ fontSize: 15, color: '#8a9aa5' }} />

                      <Typography variant="body2" color="#607482">
                        {new Date(r.endsAt).toLocaleString(getDateLocale(i18n.language))}
                      </Typography>
                    </Stack>
                  ),
                },
                {
                  key: 'isActive',
                  label: t('common.status'),
                  render: (r) => (
                    <span
                      className={`admin-status ${
                        r.isActive
                          ? 'admin-status-active'
                          : 'admin-status-inactive'
                      }`}
                    >
                      {r.isActive ? t('admin.deals.active') : t('admin.deals.inactive')}
                    </span>
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
        <DealFormDialog
          open
          deal={dialogItem}
          tours={tours}
          onClose={() => setDialogItem(undefined)}
          onSaved={() => {
            setDialogItem(undefined);
            reload();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('admin.deals.deleteTitle')}
        resourceName={deleteTarget?.title}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteTarget(null);
          setDeleteError('');
        }}
        loading={deleting}
      />

      {deleteError && (
        <Alert severity="error" className="admin-error" sx={{ borderRadius: 2 }}>
          {deleteError}
        </Alert>
      )}
    </div>
  );
}