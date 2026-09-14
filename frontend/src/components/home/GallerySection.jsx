import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { getGalleryItems } from '../../services/galleryService';
import { useReveal } from '../../hooks/useReveal';
import { useImgFallback } from '../../hooks/useImgFallback';
import { useLightbox } from '../../hooks/useLightbox';
import { useAsyncData } from '../../hooks/useAsyncData';
import Lightbox from '../common/Lightbox';
import AsyncState from '../common/AsyncState';
import './GallerySection.css';

function GalleryTile({ item, onOpen }) {
  const [ref, isInView] = useReveal();
  const [broken, onError] = useImgFallback();

  return (
    <div
      className={`gallery-item reveal ${item.sizeClass} img-wrap ${isInView ? 'in-view' : ''} ${broken ? 'img-fallback' : ''}`}
      ref={ref}
      onClick={() => onOpen(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(item);
        }
      }}
      aria-label={`Открыть фото: ${item.alt}`}
    >
      <img src={item.thumb} alt={item.alt} onError={onError} />
      <span className="gallery-item-expand" aria-hidden="true">
        <OpenInFullIcon sx={{ fontSize: 22 }} />
      </span>
    </div>
  );
}

export default function GallerySection() {
  const [headRef, headInView] = useReveal();
  const { activeItem, open, close } = useLightbox();
  const { status, data: galleryItems, isLoading, isError } = useAsyncData(getGalleryItems, []);

  return (
    <section className="section gallery" id="gallery">
      <div className="container">
        <div className={`section-head reveal ${headInView ? 'in-view' : ''}`} ref={headRef}>
          <p className="eyebrow">Моменты путешествий</p>
          <h2>Галерея FaroSair</h2>
          <p className="section-desc">Кадры, присланные нашими туристами со всего мира.</p>
        </div>

        <AsyncState
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
