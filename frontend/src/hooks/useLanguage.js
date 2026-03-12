// Module 26
import { useState } from 'react';

export function useLanguage() {
  const [language, setLanguage] = useState('en');

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return { language, changeLanguage };
}
