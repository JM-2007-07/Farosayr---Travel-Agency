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
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { adminApi } from '../../services/adminService';
import { useAdminList } from '../../hooks/useAdminList';
import { useAsyncData } from '../../hooks/useAsyncData';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminLoading from '../../components/admin/AdminLoading';
import AdminError from '../../components/admin/AdminError';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import AdminTable from '../../components/admin/AdminTable';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import './Admin.css';

const EMPTY_FORM = {
  title: '',
  slug: '',
  description: '',
  price: '',
  duration: '',
  location: '',
  destinationId: '',
  isFeatured: false,
  images: [],
};

function TourImageManager({ images, onChange }) {
  const [imageUrl, setImageUrl] = useState('');
  const [imageError, setImageError] = useState('');

  function handleAddImage() {
    const url = imageUrl.trim();

    if (!url) {
      setImageError('Введите URL изображения.');
      return;
    }

    const alreadyExists = images.some((image) => image.url === url);

    if (alreadyExists) {
      setImageError('Это изображение уже добавлено.');
      return;
    }

    onChange([
      ...images,
      {
        url,
        alt: '',
      },
    ]);

    setImageUrl('');
    setImageError('');
  }

  function handleRemoveImage(index) {
    onChange(images.filter((_, imageIndex) => imageIndex !== index));
  }

  function handleImageChange(index, field, value) {
    onChange(
      images.map((image, imageIndex) =>
        imageIndex === index
          ? {
              ...image,
              [field]: value,
            }
          : image
      )
    );
  }

  return (
    <Box
      sx={{
        border: '1px solid rgba(11,31,58,.08)',
        borderRadius: 3,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(47,217,196,.035), rgba(212,175,106,.035))',
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.8,
          borderBottom: '1px solid rgba(11,31,58,.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.2,
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(47,217,196,.12)',
            color: '#159B8A',
            flexShrink: 0,
          }}
        >
          <ImageRoundedIcon />
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 800,
              color: '#0B1F3A',
            }}
          >
            Изображения тура
          </Typography>

          <Typography
            sx={{
              mt: 0.25,
              fontSize: 12,
              color: '#607482',
            }}
          >
            Добавьте фотографии для галереи тура
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.2}
        >
          <TextField
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setImageError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddImage();
              }
            }}
            label="URL изображения"
            placeholder="https://images.unsplash.com/..."
            fullWidth
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <LinkRoundedIcon
                    sx={{
                      mr: 1,
                      color: '#9aa7b0',
                      fontSize: 19,
                    }}
                  />
                ),
              },
            }}
          />

          <Button
            type="button"
            variant="contained"
            onClick={handleAddImage}
            startIcon={<AddRoundedIcon />}
            sx={{
              minWidth: { xs: '100%', sm: 130 },
              borderRadius: 2,
              background: '#2FD9C4',
              color: '#0B1F3A',
              fontWeight: 800,
              '&:hover': {
                background: '#45E0CE',
              },
            }}
          >
            Добавить
          </Button>
        </Stack>

        {imageError && (
          <Typography
            sx={{
              mt: 1,
              color: '#C94B4B',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {imageError}
          </Typography>
        )}

        {images.length === 0 ? (
          <Box
            sx={{
              mt: 2,
              py: 4,
              px: 2,
              border: '1px dashed rgba(11,31,58,.15)',
              borderRadius: 2.5,
              textAlign: 'center',
              background: 'rgba(255,255,255,.55)',
            }}
          >
            <ImageRoundedIcon
              sx={{
                fontSize: 34,
                color: '#b7c3c9',
              }}
            />

            <Typography
              sx={{
                mt: 1,
                fontSize: 13,
                fontWeight: 700,
                color: '#607482',
              }}
            >
              Изображения пока не добавлены
            </Typography>

            <Typography
              sx={{
                mt: 0.5,
                fontSize: 12,
                color: '#91a0a8',
              }}
            >
              Добавьте хотя бы одно изображение для красивой карточки тура
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              mt: 2,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
              },
              gap: 1.5,
            }}
          >
            {images.map((image, index) => (
              <Box
                key={`${image.url}-${index}`}
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 2.5,
                  border: '1px solid rgba(11,31,58,.08)',
                  background: '#f4f7f8',
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    height: 145,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `Изображение тура ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.currentTarget.style.opacity = '0.15';
                    }}
                  />

                  <Box
                    sx={{
                      position: 'absolute',
                      left: 10,
                      top: 10,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1.5,
                      background:
                        index === 0
                          ? 'rgba(212,175,106,.95)'
                          : 'rgba(11,31,58,.78)',
                      color: index === 0 ? '#0B1F3A' : '#fff',
                      fontSize: 10,
                      fontWeight: 800,
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {index === 0 ? '★ ГЛАВНОЕ' : `ФОТО ${index + 1}`}
                  </Box>

                  <IconButton
                    type="button"
                    size="small"
                    onClick={() => handleRemoveImage(index)}
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      width: 32,
                      height: 32,
                      background: 'rgba(11,31,58,.75)',
                      color: '#fff',
                      backdropFilter: 'blur(8px)',
                      '&:hover': {
                        background: '#C94B4B',
                      },
                    }}
                  >
                    <CloseRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box sx={{ p: 1.2 }}>
                  <TextField
                    value={image.alt || ''}
                    onChange={(e) =>
                      handleImageChange(index, 'alt', e.target.value)
                    }
                    placeholder="Alt-текст изображения"
                    size="small"
                    fullWidth
                  />
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

function TourFormDialog({
  open,
  onClose,
  onSaved,
  tour,
  destinations,
}) {
  const [form, setForm] = useState(() =>
    tour
      ? {
          title: tour.title,
          slug: tour.slug,
          description: tour.description,
          price: String(tour.price),
          duration: tour.duration,
          location: tour.location,
          destinationId: tour.destinationId,
          isFeatured: tour.isFeatured,
          images:
            tour.images?.map((image) => ({
              url: image.url,
              alt: image.alt || '',
            })) ?? [],
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
      };

      if (tour) {
        await adminApi.updateTour(tour.id, payload);
      } else {
        await adminApi.createTour(payload);
      }

      onSaved();
    } catch (err) {
      setStatus('idle');
      setError(err.message || 'Не удалось сохранить тур.');
      return;
    }

    setStatus('idle');
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
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
              <FlightTakeoffRoundedIcon />
            </div>

            <div>
              <div className="admin-dialog-title">
                {tour ? 'Редактировать тур' : 'Новый тур'}
              </div>

              <div className="admin-dialog-subtitle">
                {tour
                  ? 'Измените данные туристического предложения'
                  : 'Создайте новое туристическое предложение FaroSayr'}
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
              label="Название тура"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              fullWidth
              placeholder="Например: Путешествие в Дубай"
            />

            <TextField
              label="Slug"
              name="slug"
              value={form.slug}
              onChange={handleChange}
              required
              fullWidth
              placeholder="dubai-tour"
              helperText="Используется в URL страницы тура"
              slotProps={{
                input: {
                  startAdornment: (
                    <LinkRoundedIcon
                      sx={{
                        mr: 1,
                        color: '#9aa7b0',
                        fontSize: 19,
                      }}
                    />
                  ),
                },
              }}
            />

            <TextField
              label="Описание"
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              fullWidth
              multiline
              rows={4}
              placeholder="Краткое описание туристического предложения..."
            />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
            >
              <TextField
                label="Цена"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
                fullWidth
                slotProps={{
                  input: {
                    startAdornment: (
                      <PaymentsRoundedIcon
                        sx={{
                          mr: 1,
                          color: '#9aa7b0',
                          fontSize: 19,
                        }}
                      />
                    ),
                  },
                }}
              />

              <TextField
                label="Длительность"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                required
                fullWidth
                placeholder="7 дней / 6 ночей"
                slotProps={{
                  input: {
                    startAdornment: (
                      <AccessTimeRoundedIcon
                        sx={{
                          mr: 1,
                          color: '#9aa7b0',
                          fontSize: 19,
                        }}
                      />
                    ),
                  },
                }}
              />
            </Stack>

            <TextField
              label="Локация"
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              fullWidth
              placeholder="Дубай, ОАЭ"
              slotProps={{
                input: {
                  startAdornment: (
                    <LocationOnRoundedIcon
                      sx={{
                        mr: 1,
                        color: '#9aa7b0',
                        fontSize: 19,
                      }}
                    />
                  ),
                },
              }}
            />

            <TextField
              select
              label="Направление"
              name="destinationId"
              value={form.destinationId}
              onChange={handleChange}
              required
              fullWidth
            >
              {destinations.map((destination) => (
                <MenuItem
                  key={destination.id}
                  value={destination.id}
                >
                  {destination.name}
                </MenuItem>
              ))}
            </TextField>

            <TourImageManager
              images={form.images}
              onChange={(images) =>
                setForm((prev) => ({
                  ...prev,
                  images,
                }))
              }
            />

            <div className="admin-featured-toggle">
              <FormControlLabel
                control={
                  <Checkbox
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleChange}
                  />
                }
                label="Рекомендуемый тур"
              />

              <StarRoundedIcon />
            </div>
          </Stack>
        </DialogContent>

        <DialogActions className="admin-dialog-actions">
          <Button
            onClick={onClose}
            disabled={status === 'submitting'}
            sx={{ color: '#607482' }}
          >
            Отмена
          </Button>

          <Button
            type="submit"
            variant="contained"
            disabled={status === 'submitting'}
            startIcon={
              tour ? <EditRoundedIcon /> : <AddRoundedIcon />
            }
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
            {status === 'submitting'
              ? 'Сохранение…'
              : 'Сохранить'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function AdminTours() {
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
  } = useAdminList(adminApi.tours);

  const { data: destinationsData } = useAsyncData(
    () =>
      adminApi.destinations({ limit: 100 }).then((r) => r.data),
    []
  );

  const destinations = destinationsData ?? [];

  const [dialogTour, setDialogTour] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  async function handleDelete() {
    setDeleting(true);
    setDeleteError('');

    try {
      await adminApi.deleteTour(deleteTarget.id);
      setDeleteTarget(null);
      reload();
    } catch (err) {
      setDeleteError(err.message || 'Не удалось удалить тур.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="admin-page">
      <AdminPageHeader title="Туры" />

      <section className="admin-page-hero">
        <div className="admin-page-hero-content">
          <div className="admin-page-hero-main">
            <div className="admin-page-hero-icon">
              <FlightTakeoffRoundedIcon />
            </div>

            <div>
              <span className="admin-page-eyebrow">
                FAROSAYR · TOURS
              </span>

              <h2 className="admin-page-hero-title">
                Туры и путешествия
              </h2>

              <p className="admin-page-hero-description">
                Управляйте туристическими предложениями,
                направлениями, ценами, изображениями и
                рекомендованными турами FaroSayr.
              </p>
            </div>
          </div>

          <div className="admin-page-hero-action">
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setDialogTour(null)}
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
              Добавить тур
            </Button>
          </div>
        </div>

        <div className="admin-page-decoration">
          <PublicRoundedIcon />
        </div>
      </section>

      {isLoading && <AdminLoading />}

      {isError && <AdminError />}

      {isEmpty && (
        <AdminEmptyState message="Туров пока нет." />
      )}

      {status === 'success' && rows.length > 0 && (
        <>
          <section className="admin-page-summary">
            <div className="admin-summary-card">
              <div className="admin-summary-top">
                <span className="admin-summary-label">
                  На текущей странице
                </span>

                <div className="admin-summary-icon">
                  <FlightTakeoffRoundedIcon fontSize="small" />
                </div>
              </div>

              <div className="admin-summary-value">
                {rows.length}
              </div>
            </div>

            <div className="admin-summary-card">
              <div className="admin-summary-top">
                <span className="admin-summary-label">
                  Рекомендуемые
                </span>

                <div className="admin-summary-icon">
                  <StarRoundedIcon fontSize="small" />
                </div>
              </div>

              <div className="admin-summary-value">
                {rows.filter((tour) => tour.isFeatured).length}
              </div>
            </div>

            <div className="admin-summary-card">
              <div className="admin-summary-top">
                <span className="admin-summary-label">
                  Страница каталога
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
                  <FlightTakeoffRoundedIcon fontSize="small" />
                </div>

                <div>
                  <div className="admin-table-title-text">
                    Каталог туров
                  </div>

                  <div className="admin-table-title-subtitle">
                    Все туристические предложения FaroSayr
                  </div>
                </div>
              </div>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {rows.length} записей
              </Typography>
            </div>

            <AdminTable
              columns={[
                {
                  key: 'title',
                  label: 'Тур',
                  render: (r) => (
                    <div className="admin-deal-name">
                      <div
                        className="admin-deal-image admin-tour-icon"
                        style={{
                          overflow: 'hidden',
                          position: 'relative',
                        }}
                      >
                        {r.images?.[0]?.url ? (
                          <img
                            src={r.images[0].url}
                            alt={r.images[0].alt || r.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        ) : (
                          <FlightTakeoffRoundedIcon />
                        )}
                      </div>

                      <div>
                        <div className="admin-deal-name-title">
                          {r.title}
                        </div>

                        <div className="admin-deal-name-subtitle">
                          /{r.slug}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'destination',
                  label: 'Направление',
                  render: (r) => (
                    <div className="admin-tour-location">
                      <LocationOnRoundedIcon />
                      <span>
                        {r.destination?.name ?? '—'}
                      </span>
                    </div>
                  ),
                },
                {
                  key: 'price',
                  label: 'Цена',
                  render: (r) => (
                    <span className="admin-price-current">
                      ${r.price}
                    </span>
                  ),
                },
                {
                  key: 'duration',
                  label: 'Длительность',
                  render: (r) => (
                    <div className="admin-tour-duration">
                      <AccessTimeRoundedIcon />
                      <span>{r.duration}</span>
                    </div>
                  ),
                },
                {
                  key: 'isFeatured',
                  label: 'Статус',
                  render: (r) =>
                    r.isFeatured ? (
                      <span className="admin-status admin-status-active">
                        <StarRoundedIcon />
                        Рекомендуемый
                      </span>
                    ) : (
                      <span className="admin-status admin-status-inactive">
                        Обычный
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
                    onClick={() => setDialogTour(r)}
                    title="Редактировать"
                  >
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    size="small"
                    className="admin-action-btn admin-action-delete"
                    onClick={() => setDeleteTarget(r)}
                    title="Удалить"
                  >
                    <DeleteRoundedIcon fontSize="small" />
                  </IconButton>
                </div>
              )}
            />
          </section>
        </>
      )}

      {dialogTour !== undefined && (
        <TourFormDialog
          open
          tour={dialogTour}
          destinations={destinations}
          onClose={() => setDialogTour(undefined)}
          onSaved={() => {
            setDialogTour(undefined);
            reload();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Удалить тур"
        resourceName={deleteTarget?.title}
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
          sx={{
            mt: 2,
            borderRadius: 2,
          }}
        >
          {deleteError}
        </Alert>
      )}
    </div>
  );
}