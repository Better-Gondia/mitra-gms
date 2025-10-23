'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import en from '@/lib/locales/en.json';
import hi from '@/lib/locales/hi.json';
import mr from '@/lib/locales/mr.json';

type Language = 'en' | 'hi' | 'mr';

const translations: Record<Language, Record<string, string>> = {
  en,
  hi,
  mr,
};

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const storedLanguage = localStorage.getItem('language') as Language | null;
    if (storedLanguage && ['en', 'hi', 'mr'].includes(storedLanguage)) {
      setLanguage(storedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
     if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value = useMemo(() => ({
    language,
    setLanguage: handleSetLanguage,
    t,
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
