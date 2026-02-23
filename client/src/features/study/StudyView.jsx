import { useApp } from '../../contexts/AppContext';
import { FlipCard } from '../../components/cards/FlipCard';
import { CategoryFilter } from '../../components/ui/CategoryFilter';
import { StatsHeader } from '../../components/layout/StatsHeader';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';

export function StudyView() {
  const {
    filteredItems: cards,
    categories,
    stats,
    loading,
    error,
    loadData,
    reviewCard,
    show,
    filter,
    setFilter,
  } = useApp();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={loadData} />;

  const handleReview = async (cardId, wasCorrect) => {
    try {
      await reviewCard(cardId, wasCorrect);
      show(wasCorrect ? 'Great job! 🎉' : 'Keep practicing! 💪');
    } catch {
      show('Failed to save review', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <StatsHeader stats={stats} onRefresh={() => loadData(true)} />

      <CategoryFilter
        categories={categories}
        selected={filter}
        onSelect={setFilter}
        counts={categories.reduce(
          (acc, cat) => ({
            ...acc,
            [cat]: cards.filter((c) => c.category === cat).length,
          }),
          { all: cards.length },
        )}
      />

      {cards.length === 0 ? (
        <EmptyState type={filter !== 'all' ? 'filter' : 'empty'} />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card, index) => (
            <FlipCard
              key={card._id}
              card={card}
              onReview={handleReview}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}
