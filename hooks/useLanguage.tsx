import React, { createContext, useContext, useState, useEffect } from 'react';
import { translateText } from '../services/translations';

export const flagToLangMap: Record<string, string> = {
  '🇧🇷': 'pt',
  '🇵🇹': 'pt-PT',
  '🇪🇸': 'es',
  '🇺🇸': 'en',
  '🇫🇷': 'fr',
};

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

export const Translate: React.FC<{ text: string; fallback?: string }> = ({ text, fallback }) => {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text || fallback || '');

  useEffect(() => {
    let active = true;
    const targetLang = flagToLangMap[language] || 'pt';

    const raw = text || fallback || '';
    if (!raw.trim()) {
      setTranslatedText('');
      return;
    }

    // Default to PT - no translation required
    if (targetLang === 'pt') {
      setTranslatedText(raw);
      return;
    }

    // Check if we have a direct static translation
    const staticTranslation = translateText(raw, language);
    if (staticTranslation !== raw) {
      setTranslatedText(staticTranslation);
      return;
    }

    // Dynamic fetch from the Google Translate mirror
    const runTranslation = async () => {
      try {
        const cacheKey = `lang_tr_${targetLang}_${raw.substring(0, 100)}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          if (active) setTranslatedText(cached);
          return;
        }

        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=${targetLang}&dt=t&q=${encodeURIComponent(raw)}`);
        if (res.ok) {
          const data = await res.json();
          const translation = data[0].map((item: any) => item[0]).join('');
          if (translation) {
            localStorage.setItem(cacheKey, translation);
            if (active) setTranslatedText(translation);
          }
        }
      } catch (err) {
        console.error("Translation fail", err);
        if (active) setTranslatedText(raw);
      }
    };

    runTranslation();

    return () => {
      active = false;
    };
  }, [text, fallback, language]);

  return <>{translatedText}</>;
};
