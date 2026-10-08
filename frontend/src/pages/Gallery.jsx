import { Trans, useTranslation } from 'react-i18next';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { useReveal } from '../hooks/useReveal';
import { useImgFallback } from '../hooks/useImgFallback';
import { useLightbox } from '../hooks/useLightbox';
import { useAsyncData } from '../hooks/useAsyncData';
import './Gallery.css';
import { getGalleryItems } from '../services/galleryService';
import Lightbox from '../components/common/Lightbox';
import { responsiveImage, GALLERY_WIDTHS, gallerySizes } from '../utils/responsiveImage';
import AsyncState from '../components/common/AsyncState';
import PageHero from '../components/common/PageHero';
import Seo from '../seo/Seo';

function GalleryTile({ item, onOpen }) {
  const { t } = useTranslation();
  const [ref, isInView] = useReveal();
  const [broken, onError] = useImgFallback();
  // Gallery items are static config served by the backend with stable ids;
  // captions are translated by id, falling back to the API value.
  const alt = t(`galleryItems.${item.id}`, { defaultValue: item.alt });

  return (
    <button
      type="button"
      className={`gallery-item reveal ${item.sizeClass ?? ''} ${isInView ? 'in-view' : ''} ${broken ? 'img-fallback' : ''}`}
      ref={ref}
      onClick={() => onOpen(item)}
      aria-haspopup="dialog"
      aria-label={t('galleryPage.openPhoto', { title: alt })}
    >
      {/* Named by the button's aria-label and the visible caption below. */}
      <img {...responsiveImage(item.thumb, GALLERY_WIDTHS, gallerySizes(item.sizeClass))} alt="" loading="lazy" decoding="async" onError={onError} />
      <span className="gallery-item-overlay" aria-hidden="true">
        <span className="gallery-item-expand">
          <OpenInFullIcon sx={{ fontSize: 21 }} />
        </span>
      </span>
      <span className="gallery-item-caption">{alt}</span>
    </button>
  );
}

export default function Gallery() {
  const { t } = useTranslation();
  const [gridRef, gridInView] = useReveal();
  const { activeItem, open, close } = useLightbox();

  const {
    status,
    data: galleryItems,
    isLoading,
    isError,
    reload,
  } = useAsyncData(getGalleryItems, []);

  const items = galleryItems ?? [];

  return (
    <div className="gallery-page">
      <Seo page="gallery" path="/gallery" />
      <PageHero
        eyebrow={t('galleryPage.eyebrow')}
        title={<Trans i18nKey="galleryPage.title" components={{ accent: <span /> }} />}
        text={t('galleryPage.text')}
        stacked
      >
        <div className="page-hero-meta">
          <div className="page-hero-stat">
            <strong>{items.length || '—'}</strong>
            <span>{t('galleryPage.photos', { count: items.length })}</span>
          </div>

          <div className="page-hero-meta-divider" />

          <div className="page-hero-stat">
            <strong>FAROSAYR</strong>
            <span>{t('galleryPage.tagline')}</span>
          </div>
        </div>
      </PageHero>

      <section className="gallery-content">
        <div className="container">
          <div
            className={`gallery-section-head reveal ${gridInView ? 'in-view' : ''}`}
            ref={gridRef}
          >
            <div>
              <span className="eyebrow">{t('galleryPage.sectionEyebrow')}</span>
              <h2>{t('galleryPage.sectionTitle')}</h2>
            </div>

            <p>
              {t('galleryPage.sectionText')}
            </p>
          </div>

          <AsyncState
            onRetry={reload}
            isLoading={isLoading}
            isError={isError}
            isEmpty={status === 'success' && items.length === 0}
          />

          {status === 'success' && items.length > 0 && (
            <div className="gallery-grid">
              {items.map((item) => (
                <GalleryTile
                  key={item.id}
                  item={item}
                  onOpen={open}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Lightbox item={activeItem} onClose={close} />
    </div>
  );
}