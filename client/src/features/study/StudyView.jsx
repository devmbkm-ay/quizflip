import { useApp } from '../../contexts/AppContext.jsx';
import { useCard } from '../../hooks/useCard.js'; // On importe le hook ici
import { FlipCard } from '../../components/cards/FlipCard.jsx';
import { StatsHeader } from '../../components/layout/StatsHeader.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { LoadingState } from '../../components/ui/LoadingState.jsx';

export function StudyView() {
  // 1. On récupère uniquement la navigation/UI depuis le contexte
  const { setView } = useApp();

  // 2. On récupère TOUTE la donnée et la logique des cartes depuis le hook
  const { cards, stats, loading, refresh, isRefreshing, reviewCard } =
    useCard();

  // 3. Gestion du chargement initial (évite le crash du .reduce ou des stats)
  if (loading) {
    return <LoadingState />;
  }

  // 4. Si aucune carte n'est trouvée (cas de Bitémo)
  if (!cards || cards.length === 0) {
    return (
      <div className="space-y-10 animate-fade-in">
        <StatsHeader
          stats={{ totalCards: 0, totalCategories: 0, averageMastery: 0 }}
          onRefresh={refresh}
          isRefreshing={isRefreshing}
        />
        <EmptyState onAction={() => setView('manage')} />
      </div>
    );
  }

  // 5. Calculs de sécurité (si tu en as à la ligne 44)
  // On utilise le "Optional Chaining" ?. pour éviter tout crash
  const totalReviews = cards.reduce(
    (acc, c) => acc + (c.reviewStats?.timesReviewed || 0),
    0,
  );

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header avec les stats réelles du hook */}
      <StatsHeader
        stats={stats}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
      />

      {/* Grille de tes 38 cartes (pour Aymard) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((card, index) => (
          <FlipCard
            key={card._id}
            card={card}
            index={index}
            onReview={reviewCard}
          />
        ))}
      </div>
    </div>
  );
}
