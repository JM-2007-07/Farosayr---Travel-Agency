import { useEffect, useState } from 'react';
import './Loader.css';

/**
 * Brand splash shown while the app shell boots.
 *
 * It used to wait for window "load" (every image, up to 2.5 s), which kept
 * the hero poster — the LCP element — covered. It now fades out as soon as
 * React has painted the first frame, so the splash is a brief transition,
 * never a blocker.
 */
export default function Loader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let timer;
    // Two frames: the first commits this render, the second guarantees
    // the page underneath has been painted before the fade starts.
    const frame = window.requestAnimationFrame(() => {
      timer = window.setTimeout(() => setHidden(true), 120);
    });

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`loader ${hidden ? 'hidden' : ''}`} aria-hidden="true">
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
