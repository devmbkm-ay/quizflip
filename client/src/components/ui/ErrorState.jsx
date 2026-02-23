export function ErrorState({ error, onRetry }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
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
        <p className="text-slate-400 mb-8">{error}</p>
        <button
          onClick={onRetry}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
