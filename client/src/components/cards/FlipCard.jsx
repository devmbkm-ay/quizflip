import { useState, useRef, useEffect, useCallback } from 'react';

export function FlipCard({ card, onReview, index = 0 }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showBackFade, setShowBackFade] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const cardRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const answerScrollRef = useRef(null);

  // Handle flip with accessibility
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      const newState = !prev;
      // Announce to screen readers
      setAnnouncement(newState ? 'Answer revealed' : 'Question shown');
      return newState;
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement !== cardRef.current) return;

      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleFlip();
          break;
        case 'ArrowLeft':
          if (isFlipped && onReview) {
            e.preventDefault();
            onReview(card._id, false);
          }
          break;
        case 'ArrowRight':
          if (isFlipped && onReview) {
            e.preventDefault();
            onReview(card._id, true);
          }
          break;
        case 'Escape':
          if (isFlipped) {
            e.preventDefault();
            setIsFlipped(false);
          }
          break;
      }
    };

    const element = cardRef.current;
    element?.addEventListener('keydown', handleKeyDown);
    return () => element?.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, onReview, card._id, handleFlip]);

  // Handle review with feedback
  const handleReview = useCallback(
    (wasCorrect, e) => {
      e?.stopPropagation();

      // Visual feedback
      const button = e?.currentTarget;
      if (button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => (button.style.transform = ''), 150);
      }

      // Announce result
      setAnnouncement(wasCorrect ? 'Marked as correct' : 'Marked for review');

      onReview?.(card._id, wasCorrect);

      // Auto flip back after review
      setTimeout(() => setIsFlipped(false), 400);
    },
    [onReview, card._id],
  );

  // Determine mastery status
  const getMasteryStatus = (mastery) => {
    if (mastery >= 80) return { class: 'success', label: 'Mastered' };
    if (mastery >= 50) return { class: 'warning', label: 'Learning' };
    return { class: 'danger', label: 'New' };
  };

  const mastery = getMasteryStatus(card.mastery || 0);
  const staggerClass = `stagger-${(index % 4) + 1}`;

  const updateBackFade = useCallback(() => {
    const el = answerScrollRef.current;
    if (!el) {
      setShowBackFade(false);
      return;
    }

    const hasOverflow = el.scrollHeight > el.clientHeight + 1;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
    setShowBackFade(hasOverflow && !atBottom);
  }, []);

  useEffect(() => {
    if (!isFlipped) {
      setShowBackFade(false);
      return;
    }

    const raf = requestAnimationFrame(updateBackFade);
    const el = answerScrollRef.current;
    if (!el) return () => cancelAnimationFrame(raf);

    el.addEventListener('scroll', updateBackFade, { passive: true });
    window.addEventListener('resize', updateBackFade);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('scroll', updateBackFade);
      window.removeEventListener('resize', updateBackFade);
    };
  }, [isFlipped, card.back, updateBackFade]);

  return (
    <>
      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <article
        ref={cardRef}
        className={`flip-card h-[21rem] w-full animate-float ${staggerClass} group`}
        data-flipped={isFlipped}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleFlip}
        tabIndex={0}
        role="button"
        aria-label={`Flashcard: ${card.front}. Press Enter to flip.`}
        aria-pressed={isFlipped}
      >
        <div className="flip-card-inner card-elevation ">
          {/* Front Face */}
          <div
            ref={frontRef}
            className="flip-card-face glass-card gradient-border p-6 flex flex-col cursor-pointer overflow-hidden"
          >
            {/* Header */}
            <header className="flex justify-between items-start mb-4">
              <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                {card.category}
              </span>

              <div
                className="flex gap-1.5"
                aria-label={`Difficulty: ${card.difficulty} out of 3`}
              >
                {[1, 2, 3].map((star) => (
                  <div
                    key={star}
                    className={`star-icon ${star <= card.difficulty ? 'filled' : 'empty'}`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </header>

            {/* Content */}
            <div className="flex-1 min-h-0 flex items-center justify-center px-2">
              <h3 className="text-xl font-semibold text-center leading-relaxed text-slate-100 group-hover:text-indigo-200 transition-colors duration-300 line-clamp-6">
                {card.front}
              </h3>
            </div>

            {/* Footer */}
            <footer className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
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
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
                Click or press Enter to flip
              </span>

              {card.reviewStats?.timesReviewed > 0 && (
                <span className="text-slate-400 tabular-nums">
                  {card.reviewStats.timesReviewed} reviews
                </span>
              )}
            </footer>

            {/* Progress Bar */}
            <div
              className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform origin-left transition-transform duration-500"
              style={{ transform: `scaleX(${isHovered ? 1 : 0})` }}
              aria-hidden="true"
            />
          </div>

          {/* Back Face */}
          <div
            ref={backRef}
            className="flip-card-face flip-card-back glass-card-back p-6 flex flex-col cursor-pointer overflow-hidden"
          >
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
              {/* Header */}
              <header className="flex justify-between items-start mb-4">
                <span className="status-badge success">Answer</span>

                {card.mastery > 0 && (
                  <span className={`status-badge ${mastery.class}`}>
                    {card.mastery}% {mastery.label}
                  </span>
                )}
              </header>

              {/* Answer Text */}
              <div className="relative flex-1 min-h-0 px-2 py-4 overflow-hidden">
                <div
                  ref={answerScrollRef}
                  className="no-scrollbar h-full overflow-y-auto pr-1"
                >
                  <p className="min-h-full flex items-center justify-center text-lg text-slate-200 text-center leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
                    {card.back}
                  </p>
                </div>
                {showBackFade && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-4 left-2 right-3 h-10 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent"
                  />
                )}
              </div>

              {/* Review Actions */}
              {onReview && (
                <div
                  className="mt-4 pt-4 border-t border-indigo-500/20 grid grid-cols-2 gap-3"
                  role="group"
                  aria-label="Review actions"
                >
                  <button
                    onClick={(e) => handleReview(false, e)}
                    className="btn-interactive py-3 px-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-rose-500/20 focus:ring-rose-500"
                    aria-label="Mark as incorrect - press Left Arrow"
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
                    Again
                  </button>

                  <button
                    onClick={(e) => handleReview(true, e)}
                    className="btn-interactive py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500/20 focus:ring-emerald-500"
                    aria-label="Mark as correct - press Right Arrow"
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Good
                  </button>
                </div>
              )}

              {/* Keyboard Hint */}
              {/* <div className="mt-3 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono text-xs">
                    ←
                  </kbd>
                  Again
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono text-xs">
                    →
                  </kbd>
                  Good
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 font-mono text-xs">
                    Esc
                  </kbd>
                  Flip
                </span>
              </div> */}
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
