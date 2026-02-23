import { useNavigate } from 'react-router-dom';

export function EmptyState({
  type = 'empty',
  title,
  message,
  actionLabel,
  onAction,
  icon: CustomIcon,
  className = '',
}) {
  const navigate = useNavigate();

  // Predefined configurations
  const configs = {
    empty: {
      icon: EmptyIcon,
      title: 'No cards yet',
      message:
        'Create your first flashcard to start learning. You can add cards manually or generate them from your notes.',
      actionLabel: 'Create First Card',
      action: () => navigate('/manage'),
    },
    filter: {
      icon: FilterIcon,
      title: 'No cards found',
      message:
        "Try adjusting your search or filter criteria to find what you're looking for.",
      actionLabel: 'Clear Filters',
      action: () => window.location.reload(),
    },
    search: {
      icon: SearchIcon,
      title: 'No matches found',
      message:
        "We couldn't find any cards matching your search. Try different keywords.",
      actionLabel: 'Clear Search',
      action: null,
    },
    error: {
      icon: ErrorIcon,
      title: 'Something went wrong',
      message:
        'Unable to load your cards. Please check your connection and try again.',
      actionLabel: 'Try Again',
      action: () => window.location.reload(),
    },
    category: {
      icon: CategoryIcon,
      title: 'Empty category',
      message:
        "This category doesn't have any cards yet. Add some or switch to another category.",
      actionLabel: 'Add Cards',
      action: () => navigate('/manage'),
    },
  };

  const config = configs[type] || configs.empty;
  const Icon = CustomIcon || config.icon;

  const handleAction = () => {
    if (onAction) onAction();
    else if (config.action) config.action();
  };

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}
    >
      {/* Icon Container */}
      <div className="relative mb-6">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150" />

        {/* Icon */}
        <div className="relative w-24 h-24 rounded-3xl bg-slate-900/80 border border-slate-700/50 flex items-center justify-center">
          <Icon className="w-10 h-10 text-slate-600" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-slate-200 mb-3">
        {title || config.title}
      </h3>

      {/* Message */}
      <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
        {message || config.message}
      </p>

      {/* Action Button */}
      {(actionLabel || config.actionLabel) && (
        <button
          onClick={handleAction}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95"
        >
          <PlusIcon className="w-5 h-5" />
          {actionLabel || config.actionLabel}
        </button>
      )}

      {/* Secondary hint */}
      {type === 'empty' && (
        <p className="mt-6 text-sm text-slate-600">
          Or use the <span className="text-indigo-400">AI Generate</span> button
          to create cards from your notes
        </p>
      )}
    </div>
  );
}

// Icon Components
function EmptyIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );
}

function FilterIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
      />
    </svg>
  );
}

function SearchIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function ErrorIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
}

function CategoryIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  );
}

function PlusIcon({ className }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4v16m8-8H4"
      />
    </svg>
  );
}
