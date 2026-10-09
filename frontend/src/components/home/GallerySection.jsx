import { useTranslation } from 'react-i18next';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { getGalleryItems } from '../../services/galleryService';
import { useReveal } from '../../hooks/useReveal';
import { useImgFallback } from '../../hooks/useImgFallback';
import { useLightbox } from '../../hooks/useLightbox';
import { useAsyncData } from '../../hooks/useAsyncData';
import Lightbox from '../common/Lightbox';
import { responsiveImage, GALLERY_WIDTHS, gallerySizes } from '../../utils/responsiveImage';
import AsyncState from '../common/AsyncState';
import './GallerySection.css';

function GalleryTile({ item, onOpen }) {
  const { t } = useTranslation();
  const [ref, isInView] = useReveal();
  const [broken, onError] = useImgFallback();
  // Gallery items are static config served by the backend with stable ids;
  // alt text is translated by id, falling back to the API value.
  const alt = t(`galleryItems.${item.id}`, { defaultValue: item.alt });

  return (
    <button
      type="button"
      className={`gallery-item reveal ${item.sizeClass} img-wrap ${isInView ? 'in-view' : ''} ${broken ? 'img-fallback' : ''}`}
      ref={ref}
      onClick={() => onOpen(item)}
      aria-haspopup="dialog"
      aria-label={t('galleryPage.openPhoto', { title: alt })}
    >
      {/* The button's aria-label names the photo; the image itself adds nothing. */}
      <img {...responsiveImage(item.thumb, GALLERY_WIDTHS, gallerySizes(item.sizeClass))} alt="" loading="lazy" decoding="async" onError={onError} />
      <span className="gallery-item-expand" aria-hidden="true">
        <OpenInFullIcon sx={{ fontSize: 22 }} />
      </span>
    </button>
  );
}

export default function GallerySection() {
  const { t } = useTranslation();
  const [headRef, headInView] = useReveal();
  const { activeItem, open, close } = useLightbox();
  const { status, data: galleryItems, isLoading, isError, reload } = useAsyncData(getGalleryItems, []);

  return (
    <section className="section gallery" id="gallery">
      <div className="container">
        <div className={`section-head reveal ${headInView ? 'in-view' : ''}`} ref={headRef}>
          <p className="eyebrow">{t('home.gallery.eyebrow')}</p>
          <h2>{t('home.gallery.title')}</h2>
          <p className="section-desc">{t('home.gallery.text')}</p>
        </div>

        <AsyncState
          onRetry={reload}
          isLoading={isLoading}
          isError={isError}
          isEmpty={status === 'success' && galleryItems.length === 0}
        />

        {status === 'success' && galleryItems.length > 0 && (
          <div className="gallery-grid">
            {galleryItems.map((item) => (
              <GalleryTile key={item.id} item={item} onOpen={open} />
            ))}
          </div>
        )}
      </div>

      <Lightbox item={activeItem} onClose={close} />
    </section>
  );
}
