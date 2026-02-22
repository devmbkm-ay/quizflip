import { useState, useEffect, useCallback } from 'react';
import { cardApi } from './services/api';
import FlipCard from './components/FlipCard';
import { Toast } from './components/Toast';
import { CardDashboard } from './components/CardDashboard';
import { AutoGenerate } from './components/AutoGenerate';
import { CardManager } from './components/CardManager';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLocation, Link } from 'react-router';

function StudyMode() {
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const loadData = useCallback(
    async (silent = false) => {
      try {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);

        const [cardsRes, catsRes, statsRes] = await Promise.all([
          cardApi.getAll(),
          cardApi.getCategories(),
          cardApi.getStats(),
        ]);

        setCards(cardsRes.data || []);
        setCategories(catsRes.data || []);
        setStats(statsRes.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        showToast('Failed to load cards', 'error');
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [showToast],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReview = useCallback(
    async (cardId, wasCorrect) => {
      try {
        await cardApi.review(cardId, wasCorrect);

        // Optimistic update
        setCards((prev) =>
          prev.map((card) =>
            card._id === cardId
              ? {
                  ...card,
                  reviewStats: {
                    ...card.reviewStats,
                    timesReviewed: (card.reviewStats?.timesReviewed || 0) + 1,
                    timesCorrect:
                      (card.reviewStats?.timesCorrect || 0) +
                      (wasCorrect ? 1 : 0),
                  },
                }
              : card,
          ),
        );

        showToast(wasCorrect ? 'Great job! 🎉' : 'Keep practicing! 💪');

        // Background refresh for accurate mastery
        const response = await cardApi.getAll(
          selectedCategory === 'all' ? {} : { category: selectedCategory },
        );
        setCards(response.data || []);
      } catch (err) {
        console.error('Review failed:', err);
        showToast('Failed to save review', 'error');
      }
    },
    [selectedCategory, showToast],
  );

  const filteredCards =
    selectedCategory === 'all'
      ? cards
      : cards.filter((c) => c.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-spin" />
            <div
              className="absolute inset-2 border-4 border-purple-500/20 rounded-full animate-spin"
              style={{
                animationDirection: 'reverse',
                animationDuration: '1.5s',
              }}
            />
            <div
              className="absolute inset-4 border-4 border-pink-500/20 rounded-full animate-spin"
              style={{ animationDuration: '2s' }}
            />
          </div>
          <p className="text-slate-400 animate-pulse">Loading your cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-rose-500/10 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-rose-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-rose-400 mb-3">
            Connection Error
          </h2>
          <p className="text-slate-400 mb-8 leading-relaxed">{error}</p>
          <button
            onClick={() => loadData()}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-8 max-w-7xl mx-auto scroll-smooth">
      {/* Header */}
      <header className="mb-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gradient mb-3 tracking-tight">
              FlipCard Study
            </h1>
            <p className="text-lg text-slate-400 max-w-xl">
              Master your knowledge with spaced repetition. Flip, review, and
              track your progress.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="p-3 rounded-xl glass text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200 disabled:opacity-50"
              aria-label="Refresh cards"
              title="Refresh"
            >
              <svg
                className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {stats && (
              <div className="flex gap-3">
                <div className="px-5 py-3 rounded-2xl glass text-center min-w-[100px]">
                  <div className="text-2xl font-bold text-indigo-400 tabular-nums">
                    {stats.totalCards}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    Cards
                  </div>
                </div>
                <div className="px-5 py-3 rounded-2xl glass text-center min-w-[100px]">
                  <div className="text-2xl font-bold text-purple-400 tabular-nums">
                    {stats.totalCategories}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                    Topics
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <nav className="flex flex-wrap gap-2" aria-label="Category filters">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
                : 'glass text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            aria-pressed={selectedCategory === 'all'}
          >
            All Cards
            <span className="ml-2 text-xs opacity-70 tabular-nums">
              {cards.length}
            </span>
          </button>

          {categories.map((cat) => {
            const count = cards.filter((c) => c.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 capitalize ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
                    : 'glass text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                aria-pressed={selectedCategory === cat}
              >
                {cat}
                <span className="ml-2 text-xs opacity-70 tabular-nums">
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </header>

      {/* Cards Grid */}

      {/* Admin Dashboard with manual creation*/}
      <CardDashboard onCardCreated={loadData} />

      {/* AI Auto-Generation */}
      <AutoGenerate onCardsCreated={loadData} />

      {filteredCards.length === 0 ? (
        <div className="text-center py-20 px-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-800/50 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-300 mb-2">
            {selectedCategory === 'all'
              ? 'No cards yet'
              : 'No cards in this category'}
          </h3>
          <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
            {selectedCategory === 'all'
              ? 'Create flashcards using your API at POST /api/cards or add them directly to MongoDB.'
              : 'Try selecting a different category or create new cards in this topic.'}
          </p>
        </div>
      ) : (
        <main
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="list"
          aria-label="Flashcards"
        >
          {filteredCards.map((card, index) => (
            <FlipCard
              key={card._id}
              card={card}
              onReview={handleReview}
              index={index}
            />
          ))}
        </main>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Keyboard Shortcuts Help */}
      <footer className="mt-16 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
        <p className="mb-2">Keyboard shortcuts</p>
        <div className="flex justify-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-slate-800 rounded-lg text-slate-400 font-mono text-xs border border-slate-700">
              Enter
            </kbd>
            Flip card
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-slate-800 rounded-lg text-slate-400 font-mono text-xs border border-slate-700">
              ←
            </kbd>
            Mark incorrect
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-slate-800 rounded-lg text-slate-400 font-mono text-xs border border-slate-700">
              →
            </kbd>
            Mark correct
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-2 py-1 bg-slate-800 rounded-lg text-slate-400 font-mono text-xs border border-slate-700">
              Esc
            </kbd>
            Flip back
          </span>
        </div>
      </footer>
    </div>
  );
}

//Navigation
function Navigation() {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Study', icon: '📚' },
    { path: '/manage', label: 'Manage Cards', icon: '🎛️' },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex gap-2 p-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              location.pathname === link.path
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{link.icon}</span>
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

function App() {
  const [cardsVersion, setCardsVersion] = useState(0);

  const handleCardsChange = () => {
    setCardsVersion((v) => v + 1);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-950 pb-24">
        <Routes>
          <Route path="/" element={<StudyMode key={cardsVersion} />} />
          <Route
            path="/manage"
            element={<CardManager onCardsChange={handleCardsChange} />}
          />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
}

export default App;
