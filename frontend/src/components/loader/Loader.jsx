import { useEffect, useState } from 'react';
import './Loader.css';

/**
 * Ports the original:
 *   window.addEventListener('load', () => setTimeout(() => loader.classList.add('hidden'), 350));
 *   setTimeout(() => loader.classList.add('hidden'), 2500); // fallback
 */
export default function Loader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let loadTimer;
    const onLoad = () => {
      loadTimer = setTimeout(() => setHidden(true), 350);
    };

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad);
    }

    // fallback in case 'load' is slow/unreachable
    const fallbackTimer = setTimeout(() => setHidden(true), 2500);

    return () => {
      window.removeEventListener('load', onLoad);
      clearTimeout(loadTimer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div className={`loader ${hidden ? 'hidden' : ''}`} aria-hidden={hidden}>
      <div className="loader-mark">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="url(#loaderGrad)"
            strokeWidth="3"
            strokeDasharray="8 6"
          />
          <path
            d="M20 34 L30 24 L44 38"
            stroke="#2FD9C4"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <defs>
            <linearGradient id="loaderGrad" x1="0" y1="0" x2="64" y2="64">
              <stop offset="0" stopColor="#2FD9C4" />
              <stop offset="1" stopColor="#D4AF6A" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <span className="loader-text">FAROSAYR</span>
    </div>
  );
}
