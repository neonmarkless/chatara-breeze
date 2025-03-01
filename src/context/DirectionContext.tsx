
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type Direction = 'ltr' | 'rtl';

interface DirectionContextType {
  direction: Direction;
  toggleDirection: () => void;
  setDirectionBasedOnLanguage: (language: string) => void;
}

const DirectionContext = createContext<DirectionContextType | undefined>(undefined);

export const DirectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [direction, setDirection] = useState<Direction>('ltr');
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set initial direction based on the current language
    setDirectionBasedOnLanguage(i18n.language);
    
    // Add direction attribute to html element
    document.documentElement.dir = direction;
  }, [direction, i18n.language]);

  const toggleDirection = () => {
    const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    document.documentElement.dir = newDirection;
  };

  const setDirectionBasedOnLanguage = (language: string) => {
    if (language === 'ar') {
      setDirection('rtl');
      document.documentElement.dir = 'rtl';
    } else {
      setDirection('ltr');
      document.documentElement.dir = 'ltr';
    }
  };

  return (
    <DirectionContext.Provider value={{ direction, toggleDirection, setDirectionBasedOnLanguage }}>
      {children}
    </DirectionContext.Provider>
  );
};

export const useDirection = () => {
  const context = useContext(DirectionContext);
  if (context === undefined) {
    throw new Error('useDirection must be used within a DirectionProvider');
  }
  return context;
};
