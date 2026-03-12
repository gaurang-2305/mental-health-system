import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { t } from '../../utils/i18n';

/**
 * Wraps content and provides translation utilities via render prop or context.
 * Usage:
 *   <MultiLanguageWrapper>
 *     {({ translate, lang }) => <p>{translate('dashboard')}</p>}
 *   </MultiLanguageWrapper>
 *
 * Or use the `useLanguage` hook directly.
 */
const MultiLanguageWrapper = ({ children, className = '', style = {} }) => {
  const { language } = useLanguage();
  const translate = (key) => t(key, language);

  if (typeof children === 'function') {
    return (
      <div className={className} style={style} lang={language}>
        {children({ translate, lang: language })}
      </div>
    );
  }

  return (
    <div className={className} style={style} lang={language}>
      {children}
    </div>
  );
};

/**
 * Translate a single key using current language.
 * Usage: <T k="dashboard" />
 */
export const T = ({ k }) => {
  const { language } = useLanguage();
  return <>{t(k, language)}</>;
};

export default MultiLanguageWrapper;