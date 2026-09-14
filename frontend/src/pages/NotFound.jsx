import { Link } from 'react-router';
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: 'calc(100vh - 140px)',
        display: 'flex',
        alignItems: 'center',
        padding: '160px 0 100px',
      }}
    >
      <div className="container">
        <section
          style={{
            maxWidth: 760,
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            padding: '60px 24px',
            overflow: 'hidden',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(145deg, #f7fbfd 0%, #ffffff 100%)',
            border: '1px solid #e7eef3',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 220,
              height: 220,
              borderRadius: '50%',
              background: 'rgba(47,217,196,.08)',
              top: -100,
              right: -70,
            }}
          />

          <div
            style={{
              position: 'absolute',
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'rgba(11,31,58,.035)',
              bottom: -90,
              left: -70,
            }}
          />

          <div
            style={{
              width: 76,
              height: 76,
              margin: '0 auto 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '24px',
              background: '#0b1f3a',
              color: '#2fd9c4',
              boxShadow: '0 16px 35px rgba(11,31,58,.15)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <FlightTakeoffRoundedIcon sx={{ fontSize: 38 }} />
          </div>

          <p
            className="eyebrow"
            style={{
              justifyContent: 'center',
              marginBottom: 12,
              position: 'relative',
              zIndex: 1,
            }}
          >
            FAROSAYR · 404
          </p>

          <div
            style={{
              fontSize: 'clamp(80px, 14vw, 150px)',
              lineHeight: 0.9,
              fontWeight: 800,
              letterSpacing: '-0.06em',
              color: '#0b1f3a',
              marginBottom: 24,
              position: 'relative',
              zIndex: 1,
            }}
          >
            404
          </div>

          <h1
            style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              marginBottom: 14,
              position: 'relative',
              zIndex: 1,
            }}
          >
            Кажется, мы сбились с маршрута
          </h1>

          <p
            className="section-desc"
            style={{
              maxWidth: 560,
              margin: '0 auto 32px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            Такой страницы не существует или она была перемещена.
            Но не переживайте — ваше путешествие ещё можно продолжить.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <Link to="/" className="btn btn-primary">
              <ArrowBackRoundedIcon />
              На главную
            </Link>

            <Link to="/tours" className="btn btn-outline">
              Найти тур
              <ArrowForwardRoundedIcon />
            </Link>
          </div>

          <div
            style={{
              marginTop: 42,
              paddingTop: 24,
              borderTop: '1px solid #e7eef3',
              color: '#7a8a95',
              fontSize: 13.5,
              position: 'relative',
              zIndex: 1,
            }}
          >
            Ваш следующий маршрут может начаться прямо здесь.
          </div>
        </section>
      </div>
    </main>
  );
}