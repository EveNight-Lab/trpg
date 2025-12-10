import React, { createContext, useState, useContext, ReactNode } from 'react';
import { translations } from '../components/i18n/translations';

type Language = 'ko' | 'en';
export type TranslationKeys = keyof typeof translations.ko;

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKeys, placeholders?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ko');

  const t = (key: TranslationKeys, placeholders?: Record<string, string>): string => {
    let text = translations[language][key] || translations['en'][key];
    if (placeholders) {
        Object.keys(placeholders).forEach(pKey => {
            text = text.replace(`{${pKey}}`, placeholders[pKey]);
        });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};