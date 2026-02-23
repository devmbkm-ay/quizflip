import { useState, useEffect, useCallback } from 'react';
import { cardApi } from '../services/api';

export function useCards() {
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setIsRefreshing(true);
      setError(null);

      const [cardsRes, catsRes, statsRes] = await Promise.all([
        cardApi.getAll(),
        cardApi.getCategories(),
        cardApi.getStats(),
      ]);

      setCards(cardsRes.data || []);
      setCategories(catsRes.data || []);
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refresh = useCallback(() => loadData(true), [loadData]);

  const createCard = useCallback(
    async (data) => {
      const res = await cardApi.create(data);
      setCards((prev) => [res.data, ...prev]);
      await refresh();
      return res.data;
    },
    [refresh],
  );

  const updateCard = useCallback(
    async (id, data) => {
      const res = await cardApi.update(id, data);
      setCards((prev) => prev.map((c) => (c._id === id ? res.data : c)));
      await refresh();
      return res.data;
    },
    [refresh],
  );

  const deleteCard = useCallback(
    async (id) => {
      await cardApi.delete(id);
      setCards((prev) => prev.filter((c) => c._id !== id));
      await refresh();
    },
    [refresh],
  );

  const reviewCard = useCallback(async (id, wasCorrect) => {
    await cardApi.review(id, wasCorrect);

    // Optimistic update
    setCards((prev) =>
      prev.map((card) =>
        card._id === id
          ? {
              ...card,
              reviewStats: {
                ...card.reviewStats,
                timesReviewed: (card.reviewStats?.timesReviewed || 0) + 1,
                timesCorrect:
                  (card.reviewStats?.timesCorrect || 0) + (wasCorrect ? 1 : 0),
              },
            }
          : card,
      ),
    );

    // Background sync
    const res = await cardApi.getAll();
    setCards(res.data || []);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    cards,
    categories,
    stats,
    loading,
    error,
    isRefreshing,
    loadData,
    refresh,
    createCard,
    updateCard,
    deleteCard,
    reviewCard,
  };
}
