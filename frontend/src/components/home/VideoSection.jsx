import { useState } from 'react';
import { useReveal } from '../../hooks/useReveal';
import { useImgFallback } from '../../hooks/useImgFallback';
import './VideoSection.css';

const VIDEO_IMG =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80';

// Cosmetic/demo only, same as the original (no real video file) — the play
// button just does a small press animation on click. Kept that way per
// Phase 2 scope.
export default function VideoSection() {
  const [ref, isInView] = useReveal();
  const [broken, onError] = useImgFallback();
  const [pressed, setPressed] = useState(false);

  function handlePlayClick() {
    setPressed(true);
    setTimeout(() => setPressed(false), 200);
  }

  return (
    <section className="section video-section">
      <div className="container">
        <div
          className={`video-card reveal img-wrap ${isInView ? 'in-view' : ''} ${broken ? 'img-fallback' : ''}`}
          ref={ref}
        >
          <img src={VIDEO_IMG} alt="Видео о путешествиях FaroSair" onError={onError} />
          <div className="video-overlay" />
          <button
            className="play-btn"
            aria-label="Воспроизвести видео"
            onClick={handlePlayClick}
            style={pressed ? { transform: 'translate(-50%,-50%) scale(0.85)' } : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 7l9 5-9 5V7z" fill="currentColor" />
            </svg>
          </button>
          <div className="video-caption">
            <h3>Посмотрите, как мы путешествуем</h3>
            <p>Короткий фильм о клиентах FaroSair и местах, которые они открыли для себя</p>
          </div>
        </div>
      </div>
    </section>
  );
}
