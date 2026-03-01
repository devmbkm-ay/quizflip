import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  X,
  Grid,
  List,
  MoreVertical,
  Edit3,
  Trash2,
  Layers,
  Sparkles,
  ChevronDown,
  Clock,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Mock Data Generator for Demo ---
const generateMockCards = (count) => {
  const categories = [
    'React',
    'System Design',
    'UI/UX',
    'Career',
    'TypeScript',
  ];
  const difficulties = ['easy', 'medium', 'hard'];

  return Array.from({ length: count }).map((_, i) => ({
    _id: `card-${i}`,
    front: `Concept ${i + 1}: ${['useMemo vs useCallback', 'CSS Grid vs Flexbox', 'Event Loop', 'Prototype Chain', 'Virtual DOM'][i % 5]}`,
    back: 'Detailed explanation of the concept goes here. This is the back of the card content.',
    category: categories[i % categories.length],
    tags: ['frontend', 'core', 'advanced'].slice(0, (i % 3) + 1),
    reviewStats: { timesReviewed: Math.floor(Math.random() * 20) },
    mastery: Math.floor(Math.random() * 100),
    difficulty: difficulties[i % 3],
  }));
};

// --- Components ---

export default function CardManager({
  cards = generateMockCards(24), // Default to 24 cards for the demo
  onEdit,
  onDelete,
  onStudy,
}) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  // Derived State
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

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      const matchesSearch =
        !searchQuery ||
        card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.back.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* --- Header Section --- */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Title & Stats */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                  Flashcards
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {filteredCards.length} cards ready for review
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search
                  className={`w-4 h-4 transition-colors ${searchQuery ? 'text-indigo-400' : 'text-slate-600 group-focus-within:text-indigo-400'}`}
                />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search concepts, tags..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Toggles */}
            <div className="flex items-center bg-slate-900/50 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-slate-800 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-slate-800 text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="mt-4 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                selectedCategory === 'all'
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300'
                  : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              All Topics{' '}
              <span className="ml-1.5 opacity-60">{cards.length}</span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                  selectedCategory === cat.name
                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {cat.name}{' '}
                <span className="ml-1.5 opacity-60">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* The "Fade" Container Logic */}
        {/* We use a fixed height container with overflow-y-auto and a mask-image for the fade effect */}
        <div className="relative h-[calc(100vh-220px)] w-full overflow-hidden">
          {/* Scrollable Area */}
          <div className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent pb-20">
            {filteredCards.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'flex flex-col gap-3'
                }
              >
                {filteredCards.map((card, index) => (
                  <CardItem
                    key={card._id}
                    card={card}
                    viewMode={viewMode}
                    index={index}
                    onEdit={() => onEdit?.(card)}
                    onDelete={() => onDelete?.(card)}
                    onStudy={() => onStudy?.(card)}
                  />
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 opacity-50" />
                </div>
                <p>No cards found matching your filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm"
                >
                  Clear filters
                </button>
              </div>
            )}

            {/* Bottom Spacer to ensure last card isn't cut off by fade */}
            <div className="h-24 w-full" />
          </div>

          {/* The Fade Overlay (Visual Trick) */}
          {/* This creates the gradient mask at the bottom so cards fade out */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent z-10" />
        </div>
      </main>
    </div>
  );
}

// --- Sub-Component: Card Item ---

function CardItem({ card, viewMode, index, onEdit, onDelete, onStudy }) {
  const isGrid = viewMode === 'grid';

  // Staggered animation delay based on index
  const delay = index < 9 ? index * 0.05 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`
        group relative overflow-hidden rounded-2xl border border-white/5 bg-[#13131f]
        hover:border-indigo-500/30 transition-colors duration-300
        ${isGrid ? 'flex flex-col' : 'flex items-center p-3 gap-4'}
      `}
    >
      {/* Decorative Gradient Blob */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-500" />

      {/* Content Container */}
      <div className={`relative z-10 ${isGrid ? 'p-5' : 'flex-1'}`}>
        {/* Header: Category & Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 rounded-md bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-700/50">
              {card.category}
            </span>
            {card.difficulty === 'hard' && (
              <span className="flex items-center text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                <Zap className="w-3 h-3 mr-1" /> Hard
              </span>
            )}
          </div>

          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <h3
          className={`font-semibold text-slate-200 mb-2 group-hover:text-indigo-300 transition-colors ${isGrid ? 'text-lg' : 'text-base'}`}
        >
          {card.front}
        </h3>

        {isGrid && (
          <p className="text-slate-500 text-sm line-clamp-2 mb-4 leading-relaxed">
            {card.back}
          </p>
        )}

        {/* Footer: Stats & Tags */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{card.reviewStats?.timesReviewed} reviews</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-700" />
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${(card.mastery || 0) > 80 ? 'bg-emerald-500' : (card.mastery || 0) > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
              />
              <span>{card.mastery}% mastery</span>
            </div>
          </div>

          {!isGrid && (
            <button
              onClick={onStudy}
              className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
            >
              Study
            </button>
          )}
        </div>
      </div>

      {/* Grid View Specific "Study" Button Overlay */}
      {isGrid && (
        <div className="absolute inset-0 bg-indigo-500/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
          <button
            onClick={onStudy}
            className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 flex flex-col items-center gap-2"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-white font-medium">Study Now</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}
