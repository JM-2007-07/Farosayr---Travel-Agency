import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { SUPPORTED_LANGUAGES, changeLanguage } from '../../i18n';
import './LanguageSwitcher.css';

// Language names are always shown in their own language (endonyms), so
// they are intentionally not part of the translation files.
const LANGUAGES = {
  ru: { code: 'RU', name: 'Русский' },
  tj: { code: 'TJ', name: 'Тоҷикӣ' },
  en: { code: 'EN', name: 'English' },
};

/**
 * variant="dropdown": compact button + menu, for the desktop header.
 * variant="segmented": inline RU / TJ / EN control, for the mobile menu and
 * the admin drawer (both dark surfaces).
 */
export default function LanguageSwitcher({ variant = 'dropdown', onChange }) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const current = SUPPORTED_LANGUAGES.includes(i18n.language) ? i18n.language : 'ru';

  useEffect(() => {
    if (!isOpen) return undefined;

    function handleOutsideClick(e) {
      if (!wrapperRef.current?.contains(e.target)) setIsOpen(false);
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  function select(lng) {
    changeLanguage(lng);
    setIsOpen(false);
    onChange?.(lng);
  }

  if (variant === 'segmented') {
    return (
      <div className="lang-segmented" role="group" aria-label={t('language.choose')}>
        {SUPPORTED_LANGUAGES.map((lng) => (
          <button
            key={lng}
            type="button"
            lang={lng === 'tj' ? 'tg' : lng}
            className={`lang-segmented-option ${lng === current ? 'active' : ''}`}
            aria-pressed={lng === current}
            aria-label={LANGUAGES[lng].name}
            onClick={() => select(lng)}
          >
            {LANGUAGES[lng].code}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="lang-switcher" ref={wrapperRef}>
      <button
        type="button"
        className={`lang-switcher-button ${isOpen ? 'open' : ''}`}
        aria-label={t('language.current', { language: LANGUAGES[current].name })}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <TranslateRoundedIcon className="lang-switcher-icon" />
        <span className="lang-switcher-code">{LANGUAGES[current].code}</span>
      </button>

      {isOpen && (
        <ul className="lang-switcher-menu" aria-label={t('language.choose')}>
          {SUPPORTED_LANGUAGES.map((lng) => (
            <li key={lng}>
              <button
                type="button"
                lang={lng === 'tj' ? 'tg' : lng}
                className={`lang-switcher-option ${lng === current ? 'active' : ''}`}
                aria-current={lng === current ? 'true' : undefined}
                onClick={() => select(lng)}
              >
                <span className="lang-switcher-option-code">{LANGUAGES[lng].code}</span>
                <span className="lang-switcher-option-name">{LANGUAGES[lng].name}</span>
                {lng === current && <CheckRoundedIcon className="lang-switcher-check" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
