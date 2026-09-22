import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { useReveal } from '../hooks/useReveal';
import { useImgFallback } from '../hooks/useImgFallback';
import { useLightbox } from '../hooks/useLightbox';
import { useAsyncData } from '../hooks/useAsyncData';
import './Gallery.css';
import { getGalleryItems } from '../services/galleryService';
import Lightbox from '../components/common/Lightbox';
import AsyncState from '../components/common/AsyncState';

function GalleryTile({ item, onOpen }) {
  const [ref, isInView] = useReveal();
  const [broken, onError] = useImgFallback();

  return (
    <button
      type="button"
      className={`gallery-item reveal ${item.sizeClass ?? ''} ${isInView ? 'in-view' : ''} ${broken ? 'img-fallback' : ''}`}
      ref={ref}
      onClick={() => onOpen(item)}
      aria-label={`Открыть фото: ${item.alt}`}
    >
      <img src={item.thumb} alt={item.alt} onError={onError} />
      <span className="gallery-item-overlay" aria-hidden="true">
        <span className="gallery-item-expand">
          <OpenInFullIcon sx={{ fontSize: 21 }} />
        </span>
      </span>
      <span className="gallery-item-caption">{item.alt}</span>
    </button>
  );
}

export default function Gallery() {
  const [heroRef, heroInView] = useReveal();
  const [gridRef, gridInView] = useReveal();
  const { activeItem, open, close } = useLightbox();

  const {
    status,
    data: galleryItems,
    isLoading,
    isError,
  } = useAsyncData(getGalleryItems, []);

  const items = galleryItems ?? [];

  return (
    <main className="gallery-page">
      <section className="gallery-hero">
        <div className="container">
          <div
            className={`gallery-hero-content reveal ${heroInView ? 'in-view' : ''}`}
            ref={heroRef}
          >
            <span className="gallery-hero-eyebrow">
              Путешествия в кадре
            </span>

            <h1 style={{color:'white'}}>
              Мир, который мы
              <span> увидели вместе</span>
            </h1>

            <p>
              Вдохновляющие моменты наших путешественников — от солнечных
              пляжей до древних городов и незабываемых приключений.
            </p>

            <div className="gallery-hero-meta">
              <div>
                <strong>{items.length || '—'}</strong>
                <span>фотографий</span>
              </div>

              <div className="gallery-hero-divider" />

              <div>
                <strong>FAROSAYR</strong>
                <span>ваш путь начинается здесь</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="gallery-content">
        <div className="container">
          <div
            className={`gallery-section-head reveal ${gridInView ? 'in-view' : ''}`}
            ref={gridRef}
          >
            <div>
              <span className="eyebrow">Истории путешествий</span>
              <h2>Вдохновение для следующего маршрута</h2>
            </div>

            <p>
              Каждая фотография — это воспоминание, которое хочется сохранить.
            </p>
          </div>

          <AsyncState
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
    </main>
  );
}