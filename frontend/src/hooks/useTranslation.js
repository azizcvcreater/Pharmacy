// src/hooks/useTranslation.js
import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const translate = (key, options = {}) => {
    return t(key, options);
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const isRTL = () => {
    return ['ps', 'fa-AF'].includes(i18n.language);
  };

  return {
    t: translate,
    changeLanguage,
    getCurrentLanguage,
    isRTL,
    i18n,
  };
};