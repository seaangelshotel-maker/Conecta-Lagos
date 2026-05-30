import React, { createContext, useContext, useState, useEffect } from 'react';
import { translateText } from '../services/translations';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (text: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('lagos_go_selected_language') || '🇧🇷';
  });

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
