import { useApp } from '../../contexts/AppContext.jsx';
import { useCard } from '../../hooks/useCard.js';
import { FlipCard } from '../../components/cards/FlipCard.jsx';
import { useFilter } from '../../hooks/useFilter.js';
import { StatsHeader } from '../../components/layout/StatsHeader.jsx';
import { EmptyState } from '../../components/ui/EmptyState.jsx';
import { LoadingState } from '../../components/ui/LoadingState.jsx';
import { useState, useMemo, useRef, useEffect } from 'react';

export function StudyView() {
  const { setView } = useApp();
  const { cards, stats, loading, refresh, isRefreshing, reviewCard } =
    useCard();

  const safeCards = Array.isArray(cards) ? cards : [];

  const {
    filter: selectedFilter,
    setFilter,
    filteredItems,
  } = useFilter(safeCards, 'category');

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute categories with counts
  const categoryStats = useMemo(() => {
    const stats = {};
    safeCards.forEach((card) => {
      const cat = card?.category || 'General';
      stats[cat] = (stats[cat] || 0) + 1;
    });
    return Object.entries(stats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Sort by count descending
  }, [safeCards]);

  const totalCategories = categoryStats.length;
  const displayCategories = showAllCategories
    ? categoryStats
    : categoryStats.slice(0, 4); // Show top 4 by default

  if (loading) return <LoadingState />;

  if (safeCards.length === 0) {
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

  const activeCount =
    selectedFilter === 'all'
      ? safeCards.length
      : safeCards.filter((c) => c?.category === selectedFilter).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <StatsHeader
        stats={stats}
        onRefresh={refresh}
        isRefreshing={isRefreshing}
      />

      {/* Modern Filter Bar */}
      <div className="glass-premium rounded-2xl p-4 sm:p-5 border border-white/5 shadow-xl">
        {/* Top Row: Label + Active Filter + Results */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Filter by Topic
              </h3>
              <p className="text-xs text-slate-400">
                {filteredItems.length} of {safeCards.length} cards
                {selectedFilter !== 'all' && (
                  <span className="text-indigo-400 ml-1">
                    in {selectedFilter}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Active Filter Badge with Clear */}
          {selectedFilter !== 'all' && (
            <button
              onClick={() => setFilter('all')}
              className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-sm hover:bg-indigo-500/30 transition-colors group"
            >
              <span className="capitalize">{selectedFilter}</span>
              <span className="text-xs bg-indigo-500/30 px-1.5 py-0.5 rounded-full">
                {activeCount}
              </span>
              <svg
                className="w-4 h-4 group-hover:rotate-90 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Category Pills - Responsive Grid */}
        <div className="flex flex-wrap gap-2 items-center">
          {/* All Topics Pill */}
          <CategoryPill
            label="All Topics"
            count={safeCards.length}
            isActive={selectedFilter === 'all'}
            onClick={() => setFilter('all')}
            isAll
          />

          {/* Category Pills - Visible ones */}
          {displayCategories.map(({ name, count }) => (
            <CategoryPill
              key={name}
              label={name}
              count={count}
              isActive={selectedFilter === name}
              onClick={() => setFilter(name)}
            />
          ))}

          {/* More Categories Dropdown */}
          {totalCategories > 4 && !showAllCategories && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${
                    isDropdownOpen
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-white/5'
                  }
                `}
              >
                <span>+{totalCategories - 4} more</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 glass-premium rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-fade-in z-50 max-h-64 overflow-y-auto scrollbar-thin">
                  <div className="p-2 space-y-1">
                    {categoryStats.slice(4).map(({ name, count }) => (
                      <button
                        key={name}
                        onClick={() => {
                          setFilter(name);
                          setIsDropdownOpen(false);
                        }}
                        className={`
                          w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                          ${
                            selectedFilter === name
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : 'text-slate-300 hover:bg-white/5'
                          }
                        `}
                      >
                        <span className="capitalize truncate">{name}</span>
                        <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Show All / Show Less Toggle */}
          {totalCategories > 4 && (
            <button
              onClick={() => setShowAllCategories(!showAllCategories)}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-500 hover:text-indigo-400 transition-colors"
            >
              {showAllCategories ? (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                  Show less
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  Show all
                </>
              )}
            </button>
          )}
        </div>

        {/* Progress Bar - Visual indicator */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-800/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(filteredItems.length / safeCards.length) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {Math.round((filteredItems.length / safeCards.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState onAction={() => setView('manage')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(
            (card, index) =>
              card && (
                <FlipCard
                  key={card._id || index}
                  card={card}
                  index={index}
                  onReview={reviewCard}
                />
              ),
          )}
        </div>
      )}
    </div>
  );
}

// Category Pill Component
function CategoryPill({ label, count, isActive, onClick, isAll = false }) {
  return (
    <button
      onClick={onClick}
      className={`
        group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
        ${
          isActive
            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-white border border-white/5 hover:border-white/10'
        }
        ${isAll ? 'pr-3' : ''}
      `}
    >
      {isAll && (
        <svg
          className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      )}
      <span className="capitalize whitespace-nowrap">{label}</span>
      <span
        className={`
        text-xs px-2 py-0.5 rounded-full transition-colors
        ${isActive ? 'bg-white/20 text-white' : 'bg-slate-700/50 text-slate-500 group-hover:text-slate-300'}
      `}
      >
        {count}
      </span>

      {/* Active indicator */}
      {isActive && (
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
      )}
    </button>
  );
}
