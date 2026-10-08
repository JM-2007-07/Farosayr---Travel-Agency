import { useTranslation } from 'react-i18next';
import { useScrollState } from '../../hooks/useScrollState';
import { scrollBehavior } from '../../utils/scrollToId';
import './BackToTop.css';

// Ports the original: backToTop.classList.toggle('show', window.scrollY > 700)
export default function BackToTop() {
  const { t } = useTranslation();
  const { scrollY } = useScrollState();
  const show = scrollY > 700;

  function handleClick() {
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  }

  return (
    <button
      className={`back-to-top ${show ? 'show' : ''}`}
      aria-label={t('common.backToTop')}
      onClick={handleClick}
    >
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 19V5M5 12l7-7 7 7"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
