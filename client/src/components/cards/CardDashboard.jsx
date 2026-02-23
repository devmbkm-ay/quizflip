import { useState, useEffect } from 'react';
import { cardApi } from '../../services/api';

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
    }
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

      // Reset with animation
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
    if (ratio > 0.9) return 'char-count-danger';
    if (ratio > 0.75) return 'char-count-warning';
    return 'text-slate-600';
  };

  const fabVariants = {
    idle: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 90 },
    tap: { scale: 0.95 },
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`${floatingClassName} group`}
        aria-label="Create new card"
      >
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
        <div className="relative w-16 h-16 bg--to-br from-indigo-500 to-purple-600 text-white rounded-2xl shadow-2xl shadow-indigo-500/40 flex items-center justify-center transition-all duration-300 group-hover:rounded-3xl group-active:scale-95">
          <svg
            className="w-7 h-7 transition-transform duration-300"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Animated Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 animate-backdrop transition-opacity"
        onClick={() => !isSubmitting && setIsOpen(false)}
      />

      {/* Modal */}
      <div
        className={`relative w-full max-w-4xl glass-premium rounded-3xl shadow-2xl overflow-hidden animate-modal-in ${isAnimating ? '' : ''}`}
      >
        {/* Header with gradient line */}
        <div className="relative px-8 py-6 border-b border-white/5">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Create Flashcard
              </h2>
              <p className="text-sm text-slate-400">
                Craft the perfect question and answer
              </p>
            </div>
            <button
              onClick={() => !isSubmitting && setIsOpen(false)}
              disabled={isSubmitting}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6 text-slate-400"
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

        <div className="flex flex-col lg:flex-row">
          {/* Form Side */}
          <div className="flex-1 p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Front Input */}
              <div className="group">
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
                    className="w-full h-28 px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 input-glow resize-none"
                    maxLength={255}
                  />
                  <div className="absolute bottom-3 right-3 opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <span className="text-xs text-indigo-400 font-medium">
                      Front side
                    </span>
                  </div>
                </div>
              </div>

              {/* Back Input */}
              <div className="group">
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
                    className="w-full h-32 px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 input-glow resize-none"
                    maxLength={500}
                  />
                  <div className="absolute bottom-3 right-3 opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <span className="text-xs text-emerald-400 font-medium">
                      Back side
                    </span>
                  </div>
                </div>
              </div>

              {/* Category & Difficulty Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category with autocomplete */}
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
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 input-glow"
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

                {/* Difficulty Stars */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Difficulty
                  </label>
                  <div className="flex gap-2">
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
                        className={`difficulty-btn flex-1 py-3 rounded-xl border transition-all ${
                          formData.difficulty === level
                            ? 'active border-amber-500/50 bg-amber-500/10 text-amber-400'
                            : 'border-slate-700/50 bg-slate-900/30 text-slate-600 hover:border-slate-600 hover:text-slate-400'
                        }`}
                      >
                        <span className="relative z-10">
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
                  <span className="text-slate-500 font-normal ml-1">
                    (comma separated)
                  </span>
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="europe, capital, history"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 input-glow"
                />
                {formData.tags && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags
                      .split(',')
                      .filter(Boolean)
                      .map((tag, i) => (
                        <span key={i} className="tag-pill">
                          {tag.trim()}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
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
                  className="flex-1 btn-shine py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
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

          {/* Live Preview Side */}
          <div
            className={`lg:w-80 bg-slate-900/30 border-l border-white/5 p-8 transition-all duration-500 ${showPreview ? 'opacity-100' : 'opacity-50'}`}
          >
            <h3 className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
              Live Preview
            </h3>

            <div className="preview-card relative h-64">
              {/* Front Preview */}
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
            className={`absolute bottom-6 left-6 right-6 py-4 px-6 rounded-xl text-center font-medium animate-fade-in ${
              toast.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
