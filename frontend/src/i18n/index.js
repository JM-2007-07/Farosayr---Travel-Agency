import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru/translation.json';

export const SUPPORTED_LANGUAGES = ['ru', 'tj', 'en'];
export const DEFAULT_LANGUAGE = 'ru';
export const LANGUAGE_STORAGE_KEY = 'farosayr-language';

// 'tj' is the app's own language code; the ISO 639-1 code for Tajik is
// 'tg', which is what <html lang> and Intl date formatting need.
const HTML_LANG = { ru: 'ru', tj: 'tg', en: 'en' };
const DATE_LOCALES = { ru: 'ru-RU', tj: 'tg-TJ', en: 'en-GB' };

// Only Russian (the default, what most visitors and crawlers get) is in the
// main bundle. Tajik and English are separate chunks loaded on demand, so
// nobody downloads the two languages they don't use.
const LOADERS = {
  tj: () => import('./locales/tj/translation.json'),
  en: () => import('./locales/en/translation.json'),
};

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

async function ensureLoaded(lng) {
  if (i18n.hasResourceBundle(lng, 'translation') || !LOADERS[lng]) return;
  const module = await LOADERS[lng]();
  i18n.addResourceBundle(lng, 'translation', module.default ?? module, true, true);
}

i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru } },
  lng: DEFAULT_LANGUAGE,
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

i18n.on('languageChanged', applyLanguage);

/**
 * Resolves once the visitor's saved language is ready. main.jsx waits for
 * it before the first render, so a Tajik/English visitor never sees a flash
 * of Russian. Failing to load a language falls back to Russian.
 */
export const i18nReady = (async () => {
  const stored = readStoredLanguage();
  try {
    await ensureLoaded(stored);
    await i18n.changeLanguage(stored);
  } catch {
    await i18n.changeLanguage(DEFAULT_LANGUAGE);
  }
  applyLanguage(i18n.language);
})();

export async function changeLanguage(lng) {
  if (!isSupported(lng) || lng === i18n.language) return;
  try {
    await ensureLoaded(lng);
    await i18n.changeLanguage(lng);
  } catch {
    // Network failure while fetching the language chunk — keep the current one.
  }
}

export function getDateLocale(lng) {
  return DATE_LOCALES[lng] ?? DATE_LOCALES[DEFAULT_LANGUAGE];
}

export default i18n;
