
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDirection } from './DirectionContext';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/use-toast';

type Theme = 'light' | 'dark' | 'system';

interface SettingsContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: string;
  setLanguage: (language: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>('en');
  const { i18n } = useTranslation();
  const { setDirectionBasedOnLanguage } = useDirection();
  const { theme, setTheme: setNextTheme } = useTheme();
  const { toast } = useToast();

  // Load settings from localStorage on initial render
  useEffect(() => {
    const storedLanguage = localStorage.getItem('language');
    
    if (storedLanguage) {
      setLanguageState(storedLanguage);
      i18n.changeLanguage(storedLanguage);
      setDirectionBasedOnLanguage(storedLanguage);
    }
  }, [i18n, setDirectionBasedOnLanguage]);

  const setTheme = (newTheme: Theme) => {
    setNextTheme(newTheme);
    
    toast({
      title: "Theme Changed",
      description: `Theme set to ${newTheme === 'system' ? 'system preference' : newTheme}.`,
      duration: 2000,
    });
  };

  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage);
    i18n.changeLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    setDirectionBasedOnLanguage(newLanguage);
    
    toast({
      title: "Language Changed",
      description: `Language set to ${newLanguage === 'en' ? 'English' : 'العربية'}.`,
      duration: 2000,
    });
  };

  return (
    <SettingsContext.Provider value={{ 
      theme: (theme as Theme) || 'system', 
      setTheme, 
      language, 
      setLanguage 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
