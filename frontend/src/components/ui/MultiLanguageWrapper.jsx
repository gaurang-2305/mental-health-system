// Module 26 – Multi-Language
import React from 'react';

export default function MultiLanguageWrapper({ children, language = 'en' }) {
  return (
    <div className="multi-language-wrapper" lang={language}>
      {children}
    </div>
  );
}
