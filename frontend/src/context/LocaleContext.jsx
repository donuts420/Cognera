import React, { createContext, useContext, useState, useCallback } from 'react';
import en from '../i18n/en.json';

const LOCALES = { en };
const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState('en');

  const t = useCallback((key, fallback) => {
    const keys = key.split('.');
    let val = LOCALES[locale];
    for (const k of keys) {
      if (val && typeof val === 'object') val = val[k];
      else val = undefined;
    }
    return val ?? fallback ?? key;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
