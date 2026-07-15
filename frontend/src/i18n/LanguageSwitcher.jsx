// src/i18n/LanguageSwitcher.jsx
import { useTranslation } from 'react-i18next';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';

const LanguageSwitcher = ({ variant = 'header' }) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English', flag: '🇬🇧', nativeLabel: 'English' },
    { code: 'ps', label: 'پښتو', flag: '🇦🇫', nativeLabel: 'Pashto' },
    { code: 'fa-AF', label: 'دری', flag: '🇦🇫', nativeLabel: 'Dari' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    const lang = languages.find(l => l.code === langCode);
    document.documentElement.dir = lang?.dir || 'ltr';
    document.documentElement.lang = langCode;
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Header variant
  if (variant === 'header') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
        >
          <FiGlobe className="w-4 h-4" />
          <span className="text-base sm:text-lg">{currentLanguage.flag}</span>
          <span className="hidden md:inline text-xs sm:text-sm">{currentLanguage.label}</span>
          <FiChevronDown 
            size={14} 
            className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
            <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-500">
              Select Language
            </div>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                  i18n.language === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{lang.label}</div>
                  <div className="text-xs text-gray-400">{lang.nativeLabel}</div>
                </div>
                {i18n.language === lang.code && (
                  <span className="text-blue-600 text-sm font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <div className="space-y-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors text-sm ${
              i18n.language === lang.code
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="flex-1 text-left">{lang.label}</span>
            {i18n.language === lang.code && (
              <span className="text-blue-600">✓</span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Simple toggle variant
  return (
    <button
      onClick={() => {
        const currentIndex = languages.findIndex(l => l.code === i18n.language);
        const nextIndex = (currentIndex + 1) % languages.length;
        changeLanguage(languages[nextIndex].code);
      }}
      className="flex items-center justify-center w-full p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
      title="Change Language"
    >
      <FiGlobe className="text-xl" />
    </button>
  );
};

export default LanguageSwitcher;