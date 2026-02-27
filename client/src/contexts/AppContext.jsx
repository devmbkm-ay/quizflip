import { createContext, useContext, useEffect, useState } from 'react';
import { useCard } from '../hooks/useCard.js';
import { useToast } from '../hooks/useToast.js';
import { useFilter } from '../hooks/useFilter.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null); // On gère l'état de l'utilisateur connecté
  const [isInitializing, setIsInitializing] = useState(true); // Pour gérer l'état de chargement initial

  // Vérifier le stockage au chargement
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setIsInitializing(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/'; // Reset propre
  };

  const cardsData = useCard();
  const toast = useToast();
  const filter = useFilter(cardsData.cards, 'category');
  const [view, setView] = useState('study'); // 'study' | 'manage'

  const value = {
    user,
    setUser,
    logout,
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
