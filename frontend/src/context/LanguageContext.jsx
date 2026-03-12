import React, { createContext, useContext, useState, useEffect } from 'react';
import { SUPPORTED_LANGUAGES, STORAGE_KEYS } from '../utils/constants';
import { t } from '../utils/i18n';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'en';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = (lang) => {
    if (SUPPORTED_LANGUAGES.find((l) => l.code === lang)) {
      setLanguage(lang);
    }
  };

  const translate = (key) => t(key, language);

  const value = {
    language,
    changeLanguage,
    translate,
    t: translate,
    supportedLanguages: SUPPORTED_LANGUAGES,
    currentLanguage: SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Return fallback if used outside provider
    return {
      language: 'en',
      changeLanguage: () => {},
      translate: (key) => t(key, 'en'),
      t: (key) => t(key, 'en'),
      supportedLanguages: SUPPORTED_LANGUAGES,
      currentLanguage: SUPPORTED_LANGUAGES[0],
    };
  }
  return ctx;
};

export default LanguageContext;