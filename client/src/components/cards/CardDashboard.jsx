import { useState, useEffect } from 'react';
import { cardApi } from '../../services/api.js';

export function CardDashboard({
  onCardCreated,
  floatingClassName = 'fixed bottom-8 right-8 z-40',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    front: '',
    back: '',
    category: '',
    difficulty: 2,
    tags: '',
  });

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      loadCategories();
      // Prevent body scroll on mobile
      document.body.classList.add(
        'overflow-hidden',
        'fixed',
        'w-full',
        'h-full',
      );
    }
    return () => {
      document.body.classList.remove(
        'overflow-hidden',
        'fixed',
        'w-full',
        'h-full',
      );
    };
  }, [isOpen]);

  const loadCategories = async () => {
    try {
      const res = await cardApi.getCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.front.trim() || !formData.back.trim()) {
      showToast('Fill in both sides of the card', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const newCard = await cardApi.create({
        ...formData,
        category: formData.category || 'general',
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });

      showToast('Card created successfully!', 'success');

      setFormData({
        front: '',
        back: '',
        category: '',
        difficulty: 2,
        tags: '',
      });

      onCardCreated?.(newCard.data);

      setTimeout(() => {
        setIsOpen(false);
        setShowPreview(false);
      }, 1200);
    } catch (err) {
      showToast(err.message || 'Failed to create card', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getCharCountColor = (current, max) => {
    const ratio = current / max;
    if (ratio > 0.9) return 'text-rose-400 animate-pulse';
    if (ratio > 0.75) return 'text-amber-400';
    return 'text-slate-500';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`${floatingClassName} group touch-manipulation`}
        aria-label="Create new card"
      >
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-2xl shadow-indigo-500/40 flex items-center justify-center transition-all duration-300 group-hover:rounded-3xl group-active:scale-95">
          <svg
            className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </div>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-backdrop"
        onClick={() => !isSubmitting && setIsOpen(false)}
      />

      {/* Modal - Full screen on mobile, centered on desktop */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[95vh] sm:max-w-4xl glass-premium sm:rounded-3xl shadow-2xl overflow-hidden animate-modal-in flex flex-col">
        {/* Header */}
        <div className="relative px-4 sm:px-8 py-4 sm:py-6 border-b border-white/5 shrink-0">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gradient mb-1">
                Create Flashcard
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Craft the perfect question and answer
              </p>
            </div>
            <button
              onClick={() => !isSubmitting && setIsOpen(false)}
              disabled={isSubmitting}
              className="p-2 -mr-2 sm:mr-0 hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50 touch-manipulation"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400"
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
          </div>
        </div>

        {/* Content - Stack on mobile, side-by-side on desktop */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Form Side - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
                  <span>Question</span>
                  <span
                    className={`text-xs transition-colors ${getCharCountColor(formData.front.length, 255)}`}
                  >
                    {formData.front.length}/255
                  </span>
                </label>
                <div className="relative">
                  <textarea
                    name="front"
                    value={formData.front}
                    onChange={handleChange}
                    onFocus={() => setShowPreview(true)}
                    placeholder="What is the capital of France?"
                    className="w-full h-24 sm:h-28 px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 input-glow resize-none text-base"
                    style={{ fontSize: '16px' }} // Prevent iOS zoom
                    maxLength={255}
                  />
                </div>
              </div>

              {/* Answer */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
                  <span>Answer</span>
                  <span
                    className={`text-xs transition-colors ${getCharCountColor(formData.back.length, 500)}`}
                  >
                    {formData.back.length}/500
                  </span>
                </label>
                <div className="relative">
                  <textarea
                    name="back"
                    value={formData.back}
                    onChange={handleChange}
                    placeholder="Paris is the capital and most populous city of France..."
                    className="w-full h-28 sm:h-32 px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 input-glow resize-none text-base"
                    style={{ fontSize: '16px' }}
                    maxLength={500}
                  />
                </div>
              </div>

              {/* Category & Difficulty */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="e.g. Geography"
                      list="categories"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 input-glow text-base"
                      style={{ fontSize: '16px' }}
                    />
                    <datalist id="categories">
                      {categories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 pointer-events-none"
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
                </div>

                {/* Difficulty - Mobile optimized grid */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            difficulty: level,
                          }))
                        }
                        className={`
                          difficulty-btn py-3 rounded-xl border transition-all min-h-[48px] touch-manipulation
                          ${
                            formData.difficulty === level
                              ? 'border-amber-500/50 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/10'
                              : 'border-slate-700/50 bg-slate-900/30 text-slate-600 hover:border-slate-600 hover:text-slate-400'
                          }
                        `}
                      >
                        <span className="text-sm sm:text-base">
                          {'★'.repeat(level)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tags
                  <span className="text-slate-500 font-normal ml-1 text-xs">
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="europe, capital, history"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 input-glow text-base"
                  style={{ fontSize: '16px' }}
                />
                {formData.tags && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags
                      .split(',')
                      .filter(Boolean)
                      .map((tag, i) => (
                        <span key={i} className="tag-pill text-xs sm:text-sm">
                          {tag.trim()}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Actions - Stack on mobile */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50 touch-manipulation"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.front.trim() ||
                    !formData.back.trim()
                  }
                  className="w-full sm:flex-1 btn-shine py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 touch-manipulation min-h-[48px]"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Create Card
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Side - Hidden on small mobile, shown on lg */}
          <div
            className={`
              hidden lg:block lg:w-80 bg-slate-900/30 border-l border-white/5 p-8 transition-all duration-500
              ${showPreview ? 'opacity-100' : 'opacity-50'}
            `}
          >
            <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
              Live Preview
            </h3>

            <div className="preview-card relative h-64">
              <div className="absolute inset-0 glass-premium rounded-2xl p-5 flex flex-col border-gradient">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded">
                    {formData.category || 'General'}
                  </span>
                  <span className="text-amber-400 text-xs">
                    {'★'.repeat(formData.difficulty)}
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-center text-sm font-medium line-clamp-4">
                    {formData.front || (
                      <span className="text-slate-600 italic">
                        Your question...
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-slate-500">
                {formData.front && formData.back
                  ? 'Ready to create!'
                  : 'Fill both sides to enable'}
              </p>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`
              absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:min-w-[300px] py-3 sm:py-4 px-4 sm:px-6 rounded-xl text-center font-medium animate-fade-in z-10
              ${
                toast.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }
            `}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
