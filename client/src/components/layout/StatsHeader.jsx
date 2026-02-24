import { useState, useEffect } from 'react';

export function StatsHeader({
  stats,
  onRefresh,
  isRefreshing = false,
  className = '',
}) {
  const [animatedCards, setAnimatedCards] = useState(0);
  const [animatedCategories, setAnimatedCategories] = useState(0);

  // Animate numbers on mount or stats change
  useEffect(() => {
    if (!stats) return;

    const duration = 600;
    const steps = 20;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setAnimatedCards(Math.round((stats.totalCards || 0) * easeOut));
      setAnimatedCategories(Math.round((stats.totalCategories || 0) * easeOut));

      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [stats?.totalCards, stats?.totalCategories]);

  if (!stats) return null;

  return (
    <header
      className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 ${className}`}
    >
      {/* Title Section */}
      <div>
        <h1 className="text-4xl lg:text-5xl font-bold text-gradient mb-2 tracking-tight">
          FlipCard Study
        </h1>
        <p className="text-slate-400 text-lg max-w-xl">
          Master your knowledge with spaced repetition. Flip, review, and track
          your progress.
        </p>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center gap-4">
        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 disabled:opacity-50 group"
          title="Refresh data"
          aria-label="Refresh cards"
        >
          <svg
            className={`w-5 h-5 transition-transform duration-500 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180'}`}
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

        {/* Stats Cards */}
        <div className="flex gap-3">
          <StatCard
            value={animatedCards}
            label="Cards"
            color="indigo"
            icon={
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
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            }
          />

          <StatCard
            value={animatedCategories}
            label="Topics"
            color="purple"
            icon={
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
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
            }
          />

          {/* Optional: Mastery Stat */}
          {stats.averageMastery !== undefined && (
            <StatCard
              value={`${Math.round(stats.averageMastery)}%`}
              label="Mastery"
              color="emerald"
              icon={
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
          )}
        </div>
      </div>
    </header>
  );
}

// Sub-component for individual stat card
function StatCard({ value, label, color, icon }) {
  const colorClasses = {
    indigo:
      'from-indigo-500/20 to-indigo-600/10 text-indigo-400 border-indigo-500/30',
    purple:
      'from-purple-500/20 to-purple-600/10 text-purple-400 border-purple-500/30',
    emerald:
      'from-emerald-500/20 to-emerald-600/10 text-emerald-400 border-emerald-500/30',
    amber:
      'from-amber-500/20 to-amber-600/10 text-amber-400 border-amber-500/30',
    rose: 'from-rose-500/20 to-rose-600/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div
      className={`relative px-5 py-3 rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm min-w-[100px] text-center group hover:scale-105 transition-transform duration-200`}
    >
      {/* Icon */}
      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 group-hover:text-white group-hover:border-slate-600 transition-colors">
        {icon}
      </div>

      {/* Value */}
      <div className="text-2xl font-bold tabular-nums tracking-tight">
        {value}
      </div>

      {/* Label */}
      <div className="text-xs uppercase tracking-wider font-medium opacity-70 mt-0.5">
        {label}
      </div>
    </div>
  );
}
