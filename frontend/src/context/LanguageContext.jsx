// i18n context – Module 26
import React, { createContext } from 'react';

export const LanguageContext = createContext({});

export function LanguageProvider({ children }) {
  return (
    <LanguageContext.Provider value={{}}>
      {children}
    </LanguageContext.Provider>
  );
}
