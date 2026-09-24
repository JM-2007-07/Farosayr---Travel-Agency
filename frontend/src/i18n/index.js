import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru/translation.json';
import tj from './locales/tj/translation.json';
import en from './locales/en/translation.json';

export const SUPPORTED_LANGUAGES = ['ru', 'tj', 'en'];
export const DEFAULT_LANGUAGE = 'ru';
export const LANGUAGE_STORAGE_KEY = 'farosayr-language';

// 'tj' is the app's own language code; the ISO 639-1 code for Tajik is
// 'tg', which is what <html lang> and Intl date formatting need.
const HTML_LANG = { ru: 'ru', tj: 'tg', en: 'en' };
const DATE_LOCALES = { ru: 'ru-RU', tj: 'tg-TJ', en: 'en-GB' };

function isSupported(lng) {
  return SUPPORTED_LANGUAGES.includes(lng);
}

function readStoredLanguage() {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isSupported(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

function applyLanguage(lng) {
  document.documentElement.lang = HTML_LANG[lng] ?? HTML_LANG[DEFAULT_LANGUAGE];
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch {
    // Storage can be unavailable (private mode, blocked site data) — the
    // language still switches for this session, it just won't persist.
  }
}

// Translations are bundled locally, so init completes synchronously and
// no Suspense boundary is needed for i18n.
i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    tj: { translation: tj },
    en: { translation: en },
  },
  lng: readStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  load: 'currentOnly',
  interpolation: {
    // React already escapes rendered strings.
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

applyLanguage(i18n.language);
i18n.on('languageChanged', applyLanguage);

export function changeLanguage(lng) {
  if (!isSupported(lng) || lng === i18n.language) return;
  i18n.changeLanguage(lng);
}

export function getDateLocale(lng) {
  return DATE_LOCALES[lng] ?? DATE_LOCALES[DEFAULT_LANGUAGE];
}

export default i18n;
