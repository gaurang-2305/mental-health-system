// Translations – Module 26
export const translations = {
  en: {
    'welcome': 'Welcome',
    'login': 'Login',
    'register': 'Register',
  },
  hi: {
    'welcome': 'स्वागत है',
    'login': 'लॉगिन',
    'register': 'पंजीकृत',
  },
};

export function getTranslation(key, language = 'en') {
  return translations[language]?.[key] || key;
}
