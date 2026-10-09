
import { useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useReveal } from '../../hooks/useReveal';
import { useImgFallback } from '../../hooks/useImgFallback';
import { scrollToId } from '../../utils/scrollToId';
import { BRAND_VIDEO_URL } from '../../config/media';
import './Hero.css';

const HERO_IMG_BASE =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80';
const HERO_IMG = `${HERO_IMG_BASE}&w=2000`;
// Phones don't need the 2000px desktop image for the LCP element.
const HERO_SRCSET = [800, 1200, 1600, 2000]
  .map((w) => `${HERO_IMG_BASE}&w=${w} ${w}w`)
  .join(', ');
const HERO_VIDEO = BRAND_VIDEO_URL;

// Stable object so useReveal doesn't rebuild its observer every render.
const REVEAL_OPTIONS = { threshold: 0.1 };

/**
 * Decides whether — and when — the hero video may start loading.
 *
 * The poster image is the LCP element and renders immediately. The ~10 MB
 * video is only mounted once the page has finished loading AND the browser
 * is idle, and only where it's worth the bytes: wide screens, no Save-Data,
 * no reduced-motion preference. Everywhere else the poster simply stays.
 */
function useDeferredHeroVideo() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const connection = navigator.connection;
    const constrained = connection?.saveData === true || /(^|-)2g$/.test(connection?.effectiveType ?? '');

    if (reducedMotion || constrained) return;

    let idleId;
    let timerId;

    const start = () => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(() => setShouldLoad(true), { timeout: 3000 });
      } else {
        timerId = window.setTimeout(() => setShouldLoad(true), 1500);
      }
    };

    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });

    return () => {
      window.removeEventListener('load', start);
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timerId !== undefined) window.clearTimeout(timerId);
    };
  }, []);

  return shouldLoad;
}

export default function Hero() {
  const { t } = useTranslation();
  const imgRef = useRef(null);
  const [broken, onError] = useImgFallback();
  const shouldLoadVideo = useDeferredHeroVideo();
  const [videoError, setVideoError] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [contentRef, isInView] = useReveal(REVEAL_OPTIONS);

  useEffect(() => {
    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const img = imgRef.current;
        if (!img) return;
        const offset = window.scrollY;
        if (offset < window.innerHeight) {
          img.style.transform = `scale(1.08) translateY(${offset * 0.25}px)`;
        }
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  function handleCta(e, id) {
    e.preventDefault();
    scrollToId(id);
  }

  return (
    <section className="hero" id="home">
      <div className={`hero-bg img-wrap ${broken ? 'img-fallback' : ''}`}>
        <img
          ref={imgRef}
          src={HERO_IMG}
          srcSet={HERO_SRCSET}
          sizes="100vw"
          alt=""
          fetchPriority="high"
          decoding="async"
          onError={onError}
        />

        {/* The <img> above IS the poster: it renders immediately as the LCP
            element. The video is mounted late (see useDeferredHeroVideo) and
            stays transparent until it actually plays, so the poster never
            flashes or shifts. No `poster` attribute — it would make the
            browser fetch a second copy of the image at a different width. */}
        {shouldLoadVideo && !videoError && (
          <video
            src={HERO_VIDEO}
            className={`hero-video ${videoPlaying ? 'is-playing' : ''}`}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            onPlaying={() => setVideoPlaying(true)}
            onError={() => setVideoError(true)}
          />
        )}

        <div className="hero-overlay" />
      </div>

      <svg
        className="route-line"
        viewBox="0 0 1600 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path
          className="route-path route-path-desktop"
          id="routePathDesktop"
          d="M -50 620 C 250 500, 400 700, 650 520 S 1050 320, 1300 380 S 1550 250 1700 180"
          fill="none"
          stroke="url(#routeGradDesktop)"
          strokeWidth="2.5"
          strokeDasharray="1 14"
          strokeLinecap="round"
        />

        <path
          className="route-path route-path-mobile"
          id="routePathMobile"
          d="M 120 650 C 330 600, 470 570, 650 500 S 930 330, 1160 190"
          fill="none"
          stroke="url(#routeGradMobile)"
          strokeWidth="2.5"
          strokeDasharray="1 14"
          strokeLinecap="round"
        />

        <defs>
          <linearGradient
            id="routeGradDesktop"
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
            <stop offset="0" stopColor="#2FD9C4" />
            <stop offset="1" stopColor="#D4AF6A" />
          </linearGradient>

          <linearGradient
            id="routeGradMobile"
            x1="0"
            y1="1"
            x2="1"
            y2="0"
          >
            <stop offset="0" stopColor="#2FD9C4" />
            <stop offset="1" stopColor="#D4AF6A" />
          </linearGradient>
        </defs>

        <g className="route-plane route-plane-desktop" transform='rotate(90)'>
          <path
            className="route-plane-body"
            d="M0-15C-2-10-3-5-3 0L-13 7C-14 8-13 10-11 9L-3 6L-3 13L-7 17C-8 18-7 20-5 19L0 16L5 19C7 20 8 18 7 17L3 13L3 6L11 9C13 10 14 8 13 7L3 0C3-5 2-10 0-15Z"
            fill="#FFFFFF"
          />

          <path
            className="route-plane-core"
            d="M0-13L1 2L9 7L2 5L2 13L0 15L-2 13L-2 5L-9 7L-1 2L0-13Z"
            fill="#2FD9C4"
          />

          <animateMotion
            dur="24s"
            repeatCount="indefinite"
            rotate="auto"
          >
            <mpath href="#routePathDesktop" />
          </animateMotion>
        </g>

        <g className="route-plane route-plane-mobile" transform='rotate(90)'>
          <path
            className="route-plane-body"
            d="M0-15C-2-10-3-5-3 0L-13 7C-14 8-13 10-11 9L-3 6L-3 13L-7 17C-8 18-7 20-5 19L0 16L5 19C7 20 8 18 7 17L3 13L3 6L11 9C13 10 14 8 13 7L3 0C3-5 2-10 0-15Z"
            fill="#FFFFFF"
          />

          <path
            className="route-plane-core"
            d="M0-13L1 2L9 7L2 5L2 13L0 15L-2 13L-2 5L-9 7L-1 2L0-13Z"
            fill="#2FD9C4"
          />

          <animateMotion
            dur="8s"
            repeatCount="indefinite"
            rotate="auto"
          >
            <mpath href="#routePathMobile" />
          </animateMotion>
        </g>
      </svg>
      <div className="container hero-content" ref={contentRef}>
        {/* One H1 for both lines, so the heading says what Farosayr is (a
            travel agency in Dushanbe) without changing the visual design. */}
        <h1 className="hero-heading">
          <span className={`hero-eyebrow reveal ${isInView ? 'in-view' : ''}`}>
            {t('home.hero.eyebrow')}
          </span>{' '}
          <span className={`hero-title reveal ${isInView ? 'in-view' : ''}`}>
            <Trans i18nKey="home.hero.title" components={{ accent: <span /> }} />
          </span>
        </h1>

        <p className={`hero-subtitle reveal ${isInView ? 'in-view' : ''}`}>
          {t('home.hero.subtitle')}
        </p>

        <div className={`hero-buttons reveal ${isInView ? 'in-view' : ''}`}>
          <a
            href="#tours"
            className="btn btn-primary btn-lg"
            onClick={(e) => handleCta(e, 'tours')}
          >
            {t('common.viewTours')}
          </a>

          <a
            href="#contact"
            className="btn btn-outline btn-lg"
            onClick={(e) => handleCta(e, 'contact')}
          >
            {t('common.contactUs')}
          </a>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <span className="hero-scroll-line" />
          <span className="hero-scroll-text">{t('home.hero.scrollDown')}</span>
        </div>
      </div>
    </section>
  );
}
