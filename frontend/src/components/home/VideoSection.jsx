import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useReveal } from '../../hooks/useReveal';
import { useImgFallback } from '../../hooks/useImgFallback';
import { BRAND_VIDEO_URL } from '../../config/media';
import './VideoSection.css';

const VIDEO_IMG =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80';

// The play button used to only animate; it now opens the Farosayr video in
// a native <dialog> (Esc / backdrop / close button close it, focus is
// trapped by the browser). The video is fetched only when opened.
export default function VideoSection() {
  const { t } = useTranslation();
  const [ref, isInView] = useReveal();
  const [broken, onError] = useImgFallback();
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <section className="section video-section">
      <div className="container">
        <div
          className={`video-card reveal img-wrap ${isInView ? 'in-view' : ''} ${broken ? 'img-fallback' : ''}`}
          ref={ref}
        >
          <img src={VIDEO_IMG} alt={t('home.video.imageAlt')} loading="lazy" decoding="async" onError={onError} />
          <div className="video-overlay" />
          <button
            type="button"
            className="play-btn"
            aria-label={t('home.video.play')}
            aria-haspopup="dialog"
            onClick={() => setIsOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 7l9 5-9 5V7z" fill="currentColor" />
            </svg>
          </button>
          <div className="video-caption">
            <h3>{t('home.video.title')}</h3>
            <p>{t('home.video.text')}</p>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="video-dialog"
        aria-label={t('home.video.title')}
        onClose={() => setIsOpen(false)}
        onClick={(e) => {
          // A click on the backdrop (the dialog element itself) closes it.
          if (e.target === e.currentTarget) setIsOpen(false);
        }}
      >
        <button
          type="button"
          className="video-dialog-close"
          aria-label={t('home.video.close')}
          onClick={() => setIsOpen(false)}
        >
          <CloseRoundedIcon />
        </button>
        {isOpen && (
          <video className="video-dialog-player" src={BRAND_VIDEO_URL} controls autoPlay playsInline preload="auto" />
        )}
      </dialog>
    </section>
  );
}
