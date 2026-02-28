import { useState, useMemo, useRef, useEffect } from 'react';

export function CardManager({ cards = [], onEdit, onDelete, onStudy }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
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
  const categories = useMemo(() => {
    const cats = {};
    cards.forEach((card) => {
      const cat = card.category || 'General';
      cats[cat] = (cats[cat] || 0) + 1;
    });
    return Object.entries(cats)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [cards]);

  // Filter cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesSearch =
        !searchQuery ||
        card.front?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.back?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        );

      const matchesCategory =
        selectedCategory === 'all' || card.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [cards, searchQuery, selectedCategory]);

  const activeCategoryCount =
    selectedCategory === 'all'
      ? cards.length
      : categories.find((c) => c.name === selectedCategory)?.count || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Modern Filter Bar */}
      <div className="glass-premium rounded-2xl p-4 border border-white/5 shadow-xl">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input - Enhanced */}
          <div className="flex-1 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className={`w-5 h-5 transition-colors ${searchQuery ? 'text-indigo-400' : 'text-slate-500 group-focus-within:text-indigo-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cards, answers, or tags..."
              className="w-full pl-11 pr-10 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all input-glow"
              style={{ fontSize: '16px' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            {/* Search shortcut hint */}
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none opacity-0 group-focus-within:opacity-0 transition-opacity">
              <span className="text-xs text-slate-600 bg-slate-800/50 px-2 py-1 rounded border border-slate-700/50">
                ⌘K
              </span>
            </div>
          </div>

          {/* Category Dropdown - Modern */}
          <div className="relative min-w-[200px]" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-200
                ${
                  isDropdownOpen
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300'
                    : 'bg-slate-900/50 border-slate-700/50 text-slate-300 hover:border-slate-600'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`
                  w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                  ${isDropdownOpen ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}
                `}
                >
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="block text-xs text-slate-500 uppercase tracking-wider">
                    Category
                  </span>
                  <span className="block text-sm font-medium capitalize">
                    {selectedCategory === 'all'
                      ? 'All Categories'
                      : selectedCategory}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-1 rounded-full">
                  {activeCategoryCount}
                </span>
                <svg
                  className={`w-5 h-5 text-slate-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
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
              </div>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 glass-premium rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-fade-in z-50">
                {/* All Categories Option */}
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setIsDropdownOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 text-sm transition-colors border-b border-white/5
                    ${
                      selectedCategory === 'all'
                        ? 'bg-indigo-500/10 text-indigo-300'
                        : 'text-slate-300 hover:bg-white/5'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                      w-6 h-6 rounded-md flex items-center justify-center text-xs
                      ${selectedCategory === 'all' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}
                    `}
                    >
                      <svg
                        className="w-3.5 h-3.5"
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
                    </div>
                    <span>All Categories</span>
                  </div>
                  <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
                    {cards.length}
                  </span>
                </button>

                {/* Category List */}
                <div className="max-h-64 overflow-y-auto scrollbar-thin">
                  {categories.map(({ name, count }) => (
                    <button
                      key={name}
                      onClick={() => {
                        setSelectedCategory(name);
                        setIsDropdownOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors border-b border-white/5 last:border-0
                        ${
                          selectedCategory === name
                            ? 'bg-indigo-500/10 text-indigo-300'
                            : 'text-slate-300 hover:bg-white/5'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`
                          w-2 h-2 rounded-full
                          ${selectedCategory === name ? 'bg-indigo-400' : 'bg-slate-600'}
                        `}
                        />
                        <span className="capitalize">{name}</span>
                      </div>
                      <span className="text-xs text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setViewMode('grid')}
              className={`
                p-2.5 rounded-lg transition-all
                ${
                  viewMode === 'grid'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }
              `}
              title="Grid view"
            >
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`
                p-2.5 rounded-lg transition-all
                ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                }
              `}
              title="List view"
            >
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Active Filters & Stats */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Showing</span>
            <span className="text-white font-semibold">
              {filteredCards.length}
            </span>
            <span>of</span>
            <span className="text-white font-semibold">{cards.length}</span>
            <span>cards</span>
            {selectedCategory !== 'all' && (
              <span className="text-indigo-400">in {selectedCategory}</span>
            )}
            {searchQuery && (
              <span className="text-amber-400">matching "{searchQuery}"</span>
            )}
          </div>

          {/* Quick Filter Chips */}
          <div className="flex items-center gap-2">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs hover:bg-amber-500/20 transition-colors"
              >
                <span>
                  Search: {searchQuery.slice(0, 15)}
                  {searchQuery.length > 15 ? '...' : ''}
                </span>
                <svg
                  className="w-3.5 h-3.5"
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
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs hover:bg-indigo-500/20 transition-colors"
              >
                <span>Category: {selectedCategory}</span>
                <svg
                  className="w-3.5 h-3.5"
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
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-slate-500 hover:text-white transition-colors underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cards Grid/List */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-3'
        }
      >
        {filteredCards.map((card) => (
          <CardItem
            key={card._id}
            card={card}
            viewMode={viewMode}
            onEdit={() => onEdit?.(card)}
            onDelete={() => onDelete?.(card)}
            onStudy={() => onStudy?.(card)}
          />
        ))}
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-1">
            No cards found
          </h3>
          <p className="text-sm text-slate-500">
            Try adjusting your search or filters
          </p>
        </div>
      )}
    </div>
  );
}

// Card Item Component
function CardItem({ card, viewMode, onEdit, onDelete, onStudy }) {
  const isGrid = viewMode === 'grid';

  return (
    <div
      className={`
      group glass-premium rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/10
      ${isGrid ? '' : 'flex items-center gap-4 p-4'}
    `}
    >
      {/* Card content - adapted for grid/list views */}
      <div className={isGrid ? 'p-5' : 'flex-1'}>
        <div className="flex items-start justify-between mb-3">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-medium uppercase tracking-wider">
            {card.category || 'General'}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            >
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <h4 className="text-slate-200 font-medium mb-2 line-clamp-2">
          {card.front}
        </h4>
        <p className="text-slate-500 text-sm line-clamp-2 mb-3">{card.back}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{card.reviewStats?.timesReviewed || 0} reviews</span>
            <span>•</span>
            <span>{card.mastery || 0}% mastery</span>
          </div>
          {card.tags?.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-xs text-slate-600 bg-slate-800/50 px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {!isGrid && (
        <button
          onClick={onStudy}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Study
        </button>
      )}
    </div>
  );
}
