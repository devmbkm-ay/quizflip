import { createContext, useContext, useState } from 'react';
import { useCard } from '../hooks/useCard.js';
import { useToast } from '../hooks/useToast.js';
import { useFilter } from '../hooks/useFilter.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const cardsData = useCard();
  const toast = useToast();
  const filter = useFilter(cardsData.cards, 'category');
  const [view, setView] = useState('study'); // 'study' | 'manage'

  const value = {
    ...cardsData,
    ...toast,
    ...filter,
    view,
    setView,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
