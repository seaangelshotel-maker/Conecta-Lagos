import React, { createContext, useContext, useState, useEffect } from 'react';
import { translateText } from '../services/translations';
import { detectFlag, flagToLang } from '../services/langDetect';
import { setPageLanguage } from '../services/domTranslator';

export const flagToLangMap: Record<string, string> = flagToLang;

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    const saved = localStorage.getItem('lagos_go_selected_language');
    if (saved) return saved;
    // Primeira visita: detecta o idioma do aparelho (a escolha manual na bandeira sempre vence).
    return detectFlag(typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : []);
  });

  useEffect(() => { setPageLanguage(language); }, [language]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('lagos_go_selected_language', lang);
    const event = new Event('lagosGoLanguageChanged');
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('lagos_go_selected_language') || '🇧🇷';
      if (stored !== language) {
        setLanguageState(stored);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Listen to custom cross-tab or cross-component triggers
    const handleCustomChange = () => {
      const stored = localStorage.getItem('lagos_go_selected_language') || '🇧🇷';
      setLanguageState(stored);
    };
    window.addEventListener('lagosGoLanguageChanged', handleCustomChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('lagosGoLanguageChanged', handleCustomChange);
    };
  }, [language]);

  const t = (text: string): string => {
    return translateText(text, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

/** A tradução da página inteira é feita por services/domTranslator; este componente só exibe o texto. */
export const Translate: React.FC<{ text: string; fallback?: string }> = ({ text, fallback }) => {
  const { language } = useLanguage();
  const raw = text || fallback || '';
  return <>{translateText(raw, language)}</>;
};
