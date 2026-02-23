import { createContext, useContext, useState } from 'react';
import { useCards } from '../hooks/useCard';
import { useToast } from '../hooks/useToast';
import { useFilter } from '../hooks/useFilter';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const cardsData = useCards();
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
