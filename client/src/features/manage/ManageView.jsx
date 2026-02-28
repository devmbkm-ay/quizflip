import { useApp } from '../../contexts/AppContext.jsx';
import { useCard } from '../../hooks/useCard.js'; // Importation du hook métier
import { CardManager } from '../../components/cards/CardManager.jsx';
import { CardDashboard } from '../../components/cards/CardDashboard.jsx';
import { AutoGenerate } from '../../components/cards/AutoGenerate.jsx';

export function ManageView() {
  // 1. On récupère la navigation du contexte global
  const { setView } = useApp();

  // 2. On récupère TOUTE la logique des cartes et les outils de notification
  // Note: Assure-toi que ton hook useToast renvoie bien 'show' ou utilise 'showToast'
  const { cards, refresh, error, showToast } = useCard();

  const handleCardCreated = async () => {
    try {
      await refresh();
      if (showToast) showToast('Card created successfully!', 'success');
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  const handleCardsCreated = async (cards = []) => {
    try {
      await refresh();
      const count = Array.isArray(cards) ? cards.length : 1;
      const message = `${count} card${count > 1 ? 's' : ''} created successfully!`;
      if (showToast) showToast(message, 'success');
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* On passe 'refresh' à CardManager pour qu'il puisse 
         recharger la liste après une suppression ou édition 
      */}
      <CardManager cards={cards} onBack={() => setView('study')} />

      <CardDashboard onCardCreated={handleCardCreated} />
      <AutoGenerate onCardsCreated={handleCardsCreated} />

      {error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-xl border border-rose-500/20">
          {error}
        </div>
      )}
    </div>
  );
}
