'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, ReadingTheme } from '@/types';

interface ThemeContextType {
  theme: ReadingTheme;
  setTheme: (theme: ReadingTheme) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ReadingTheme>('sanctuary');
  const [lang, setLangState] = useState<Language>('bilingual');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedTheme = localStorage.getItem('rwg_theme') as ReadingTheme;
      if (savedTheme && ['sanctuary', 'midnight', 'sepia'].includes(savedTheme)) {
        setThemeState(savedTheme);
      }
      const savedLang = localStorage.getItem('rwg_lang') as Language;
      if (savedLang && ['ta', 'en', 'bilingual'].includes(savedLang)) {
        setLangState(savedLang);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-sepia', 'theme-sanctuary');

    if (theme === 'midnight') {
      root.classList.add('dark');
    } else if (theme === 'sepia') {
      root.classList.add('theme-sepia');
    } else {
      root.classList.add('theme-sanctuary');
    }

    try {
      localStorage.setItem('rwg_theme', theme);
    } catch {
      // ignore
    }
  }, [theme, mounted]);

  const setTheme = (t: ReadingTheme) => {
    setThemeState(t);
  };

  const setLang = (l: Language) => {
    setLangState(l);
    try {
      localStorage.setItem('rwg_lang', l);
    } catch {
      // ignore
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, lang, setLang }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
