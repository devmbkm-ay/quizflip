import { useState } from 'react';

export function CategoryFilter({
  categories,
  selected,
  onSelect,
  counts = {},
  showAll = true,
  allLabel = 'All',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Calculate total if not provided
  const totalCount =
    counts.all || Object.values(counts).reduce((a, b) => a + b, 0);

  // Mobile dropdown version
  const MobileDropdown = () => (
    <div className="relative sm:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-slate-100"
      >
        <span className="capitalize">
          {selected === 'all' ? allLabel : selected}
        </span>
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50">
          {showAll && (
            <button
              onClick={() => {
                onSelect('all');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                selected === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {allLabel}
              <span className="ml-2 text-xs opacity-70">({totalCount})</span>
            </button>
          )}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                onSelect(cat);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm capitalize transition-colors ${
                selected === cat
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {cat}
              <span className="ml-2 text-xs opacity-70">
                ({counts[cat] || 0})
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // Desktop horizontal pills
  const DesktopPills = () => (
    <div className="hidden sm:flex flex-wrap gap-2">
      {showAll && (
        <FilterPill
          label={allLabel}
          count={totalCount}
          isActive={selected === 'all'}
          onClick={() => onSelect('all')}
        />
      )}
      {categories.map((cat) => (
        <FilterPill
          key={cat}
          label={cat}
          count={counts[cat] || 0}
          isActive={selected === cat}
          onClick={() => onSelect(cat)}
        />
      ))}
    </div>
  );

  return (
    <nav className={className} aria-label="Category filters">
      <MobileDropdown />
      <DesktopPills />
    </nav>
  );
}

// Sub-component for individual filter pill
function FilterPill({ label, count, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105'
          : 'bg-slate-900/50 text-slate-400 border border-slate-700/50 hover:text-white hover:bg-slate-800 hover:border-slate-600'
      }`}
      aria-pressed={isActive}
    >
      {label}
      <span
        className={`ml-1.5 text-xs ${isActive ? 'opacity-80' : 'opacity-60'}`}
      >
        {count}
      </span>
    </button>
  );
}
