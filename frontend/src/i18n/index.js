// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translations directly
import enTranslation from './locales/en/translation.json';
import psTranslation from './locales/ps/translation.json';
import faAFTranslation from './locales/fa-AF/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  ps: {
    translation: psTranslation
  },
  'fa-AF': {
    translation: faAFTranslation
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    }
  });

export default i18n;