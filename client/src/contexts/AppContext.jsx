import { createContext, useContext, useEffect, useState } from 'react';
// import { useCard } from '../hooks/useCard.js';
import { useToast } from '../hooks/useToast.js';
// import { useFilter } from '../hooks/useFilter.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null); // On gère l'état de l'utilisateur connecté
  const [isInitializing, setIsInitializing] = useState(true);
  const [view, setView] = useState('study');

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
    try {
      // 1. On vide ABSOLUMENT TOUT le localStorage
      localStorage.clear();

      // 2. On vide les cookies (si tu en as)
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });

      // 3. On remet l'état React à null pour déclencher le switch du Layout
      setUser(null);
      setView('study');

      // 4. LE COUP DE GRÂCE : On force un rechargement complet de la page
      // Cela réinitialise l'instance Axios et tous les Hooks à zéro.
      window.location.href = '/login';
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
      // En cas d'échec du JS, on force quand même la redirection
      window.location.href = '/login';
    }
  };

  // const cardsData = useCard();
  // const toast = useToast();
  // const filter = useFilter(cardsData.cards, 'category');

  const value = {
    user,
    setUser,
    logout,
    view,
    setView,
    isInitializing,
  };

  return (
    <AppContext.Provider value={value}>
      {!isInitializing && children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
