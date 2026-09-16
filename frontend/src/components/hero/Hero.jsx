
import { useEffect, useRef, useState } from 'react';
import { useReveal } from '../../hooks/useReveal';
import { useImgFallback } from '../../hooks/useImgFallback';
import { scrollToId } from '../../utils/scrollToId';
import './Hero.css';

const HERO_IMG =
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80';
const HERO_VIDEO =
  'https://res.cloudinary.com/m11daqfd/video/upload/v1789411627/hero.mp4';



export default function Hero() {
  const imgRef = useRef(null);
  const [broken, onError] = useImgFallback();
  const [videoError, setVideoError] = useState(false);
  const [contentRef, isInView] = useReveal({ threshold: 0.1 });

  useEffect(() => {
    function onScroll() {
      const img = imgRef.current;
      if (!img) return;
      const offset = window.scrollY;
      if (offset < window.innerHeight) {
        img.style.transform = `scale(1.08) translateY(${offset * 0.25}px)`;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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
          alt=""
          onError={onError}
        />

        {!videoError && (
          <video
            src={HERO_VIDEO}
            className="hero-video"
            autoPlay
            muted
            loop
            playsInline
            onError={() => setVideoError(true)}
          >
            
          </video>
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

        <g className="route-plane route-plane-desktop">
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

        <g className="route-plane route-plane-mobile">
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
        <p className={`hero-eyebrow reveal ${isInView ? 'in-view' : ''}`}>
          Ваш маяк в мире путешествий
        </p>

        <h1 className={`hero-title reveal ${isInView ? 'in-view' : ''}`}>
          ИССЛЕДУЙТЕ МИР <span>ВМЕСТЕ С FAROSAYR</span>
        </h1>

        <p className={`hero-subtitle reveal ${isInView ? 'in-view' : ''}`}>
          Мы прокладываем маршрут к самым ярким уголкам планеты — от бирюзовых
          берегов Мальдив до огней Дубая. Премиальный сервис, честные цены и
          забота на каждом шагу вашего путешествия.
        </p>

        <div className={`hero-buttons reveal ${isInView ? 'in-view' : ''}`}>
          <a
            href="#tours"
            className="btn btn-primary"
            onClick={(e) => handleCta(e, 'tours')}
          >
            Смотреть туры
          </a>

          <a
            href="#contact"
            className="btn btn-outline"
            onClick={(e) => handleCta(e, 'contact')}
          >
            Связаться с нами
          </a>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <span className="hero-scroll-line" />
          <span className="hero-scroll-text">Листайте вниз</span>
        </div>
      </div>
    </section>
  );
}
