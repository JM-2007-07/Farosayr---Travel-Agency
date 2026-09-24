import { useState } from 'react';
import { Alert, Chip, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import RateReviewRoundedIcon from '@mui/icons-material/RateReviewRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
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

export default function AdminReviews() {
  const { t } = useTranslation();
  const { status, rows, meta, page, setPage, isLoading, isError, isEmpty, reload } = useAdminList(adminApi.reviews);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setDeleteError('');
    try {
      await adminApi.deleteReview(deleteTarget.id);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, t, 'admin.reviews.deleteError'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-page">
      <AdminPageHeader title={t('admin.nav.reviews')} />

      <section className="admin-page-hero">
        <div className="admin-page-hero-content">
          <div className="admin-page-hero-main">
            <div className="admin-page-hero-icon"><RateReviewRoundedIcon /></div>
            <div>
              <div className="admin-page-eyebrow">FAROSAYR · REVIEWS</div>
              <h1 className="admin-page-hero-title">{t('reviewsPage.eyebrow')}</h1>
              <p className="admin-page-hero-description">{t('admin.reviews.heroText')}</p>
            </div>
          </div>
          <div className="admin-page-decoration"><StarRoundedIcon /></div>
        </div>
      </section>

      {isLoading && <AdminLoading />}
      {isError && <AdminError />}
      {isEmpty && <AdminEmptyState message={t('admin.reviews.empty')} />}

      {status === 'success' && rows.length > 0 && (
        <div className="admin-table-shell">
          <div className="admin-table-toolbar">
            <div className="admin-table-title">
              <span className="admin-table-title-icon"><RateReviewRoundedIcon /></span>
              <div>
                <div className="admin-table-title-text">{t('home.reviews.eyebrow')}</div>
                <div className="admin-table-title-subtitle">{t('admin.reviews.tableSubtitle')}</div>
              </div>
            </div>
          </div>

          <AdminTable
            columns={[
              {
                key: 'user',
                label: t('admin.reviews.author'),
                render: (r) => (
                  <div className="admin-deal-name">
                    <div className="admin-deal-image admin-review-avatar"><PersonRoundedIcon /></div>
                    <div>
                      <div className="admin-deal-name-title">{r.user?.name ?? t('admin.reviews.unknownUser')}</div>
                      <div className="admin-deal-name-subtitle">{t('admin.common.client')}</div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'tour',
                label: t('common.tour'),
                render: (r) => (
                  <div className="admin-deal-name">
                    <div className="admin-deal-image admin-review-tour-icon"><FlightTakeoffRoundedIcon /></div>
                    <div className="admin-deal-name-title">{r.tour?.title ?? t('admin.common.noTour')}</div>
                  </div>
                ),
              },
              {
                key: 'rating',
                label: t('admin.reviews.rating'),
                render: (r) => (
                  <Chip
                    icon={<StarRoundedIcon />}
                    label={`${r.rating} / 5`}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      borderRadius: '10px',
                      background: 'rgba(212,175,106,.14)',
                      color: '#A67C2E',
                      '& .MuiChip-icon': { color: '#D4AF6A', fontSize: 18 },
                    }}
                  />
                ),
              },
              {
                key: 'comment',
                label: t('admin.reviews.comment'),
                render: (r) => (
                  <div className="admin-review-comment">
                    {r.comment || t('admin.reviews.noComment')}
                  </div>
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
                  className="admin-action-btn admin-action-delete"
                  size="small"
                  onClick={() => setDeleteTarget(r)}
                  title={t('admin.reviews.deleteTitle')}
                  aria-label={t('admin.reviews.deleteTitle')}
                >
                  <DeleteRoundedIcon fontSize="small" />
                </IconButton>
              </div>
            )}
          />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('admin.reviews.deleteTitle')}
        resourceName={deleteTarget ? `${deleteTarget.user?.name} — ${deleteTarget.tour?.title}` : ''}
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