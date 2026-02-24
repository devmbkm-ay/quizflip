export function LoadingState() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-spin" />
          <div
            className="absolute inset-2 border-4 border-purple-500/20 rounded-full animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}
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
