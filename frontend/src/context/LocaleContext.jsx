import React, { createContext, useContext, useState, useCallback } from 'react';
import en from '../i18n/en.json';
import as from '../i18n/as.json';

const LOCALES = { en, as };
const LocaleContext = createContext(null);

export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try { return localStorage.getItem('nirmal-locale') || 'en'; } catch { return 'en'; }
  });

  const handleSetLocale = useCallback((loc) => {
    setLocale(loc);
    try { localStorage.setItem('nirmal-locale', loc); } catch {}
    document.documentElement.lang = loc;
  }, []);

  const t = useCallback((key, params) => {
    const keys = key.split('.');
    let val = LOCALES[locale] || LOCALES.en;
    for (const k of keys) {
      if (val && typeof val === 'object') val = val[k];
      else val = undefined;
    }
    if (val === undefined) {
      let fallback = LOCALES.en;
      for (const k of keys) {
        if (fallback && typeof fallback === 'object') fallback = fallback[k];
        else fallback = undefined;
      }
      val = fallback ?? key;
    }
    if (params && typeof val === 'string') {
      return Object.entries(params).reduce((s, [p, v]) => s.replace(`{${p}}`, v), val);
    }
    return val ?? key;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}
