import { useState, useEffect, useCallback } from 'react';
import { cardApi } from '../../services/api';

// Icons as components for clarity
const PlusIcon = () => (
  <svg
    className="w-6 h-6"
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

const EditIcon = () => (
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
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

const TrashIcon = () => (
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
);

const CloseIcon = () => (
  <svg
    className="w-6 h-6"
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
);

const SearchIcon = () => (
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
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const FilterIcon = () => (
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
      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
    />
  </svg>
);

export function CardManager({ onCardsChange }) {
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    front: '',
    back: '',
    category: '',
    difficulty: 2,
    tags: '',
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [cardsRes, catsRes] = await Promise.all([
        cardApi.getAll(),
        cardApi.getCategories(),
      ]);
      setCards(cardsRes.data || []);
      setCategories(catsRes.data || []);
    } catch (err) {
      showToast('Failed to load cards', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreate = () => {
    setEditingCard(null);
    setFormData({
      front: '',
      back: '',
      category: '',
      difficulty: 2,
      tags: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      front: card.front,
      back: card.back,
      category: card.category,
      difficulty: card.difficulty,
      tags: card.tags?.join(', ') || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (cardId) => {
    try {
      await cardApi.delete(cardId);
      setCards((prev) => prev.filter((c) => c._id !== cardId));
      setDeleteConfirm(null);
      showToast('Card deleted');
      onCardsChange?.();
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      tags: formData.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (editingCard) {
        await cardApi.update(editingCard._id, payload);
        setCards((prev) =>
          prev.map((c) =>
            c._id === editingCard._id ? { ...c, ...payload } : c,
          ),
        );
        showToast('Card updated');
      } else {
        const res = await cardApi.create(payload);
        setCards((prev) => [res.data, ...prev]);
        showToast('Card created');
      }

      setIsModalOpen(false);
      onCardsChange?.();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.back.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (level) => {
    const colors = {
      1: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      2: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      3: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
    };
    return colors[level] || colors[2];
  };

  const getMasteryColor = (mastery) => {
    if (mastery >= 80) return 'text-emerald-400';
    if (mastery >= 50) return 'text-amber-400';
    return 'text-slate-500';
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      {/* <div className="flex flex-col lg:flex-row lg:items-center gap-4"> */}
      <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex items-center gap-4 min-w-0">
              {/* Back Button */}
              <div
                onClick={() => window.history.back()}
                className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-900/30 rounded-lg cursor-pointer transition-colors shrink-0"
                title="Go Back"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </div>

              {/* Title */}
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gradient">
                  Card Manager
                </h1>
                <p className="text-xs text-slate-500 truncate">
                  {cards.length} cards • {categories.length} categories
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full sm:flex-row lg:flex-1">
              {/* Search */}
              <div className="w-full sm:flex-1 lg:max-w-md">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500"
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
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cards..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Filter */}
              <div className="w-full sm:w-48 lg:w-44">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-xl text-sm text-slate-100 appearance-none cursor-pointer focus:border-indigo-500/50"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* New Card */}
              {/* <button
                onClick={handleCreate}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25 whitespace-nowrap"
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Card
              </button> */}
            </div>
          </div>
        </div>
      </header>
      {/* </div> */}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-900/50 flex items-center justify-center">
              <SearchIcon />
            </div>
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              No cards found
            </h3>
            <p className="text-slate-500 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first card to get started'}
            </p>
            {!searchQuery && selectedCategory === 'all' && (
              <button
                onClick={handleCreate}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all"
              >
                Create First Card
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCards.map((card) => (
              <div
                key={card._id}
                className="group relative bg-slate-900/40 border border-white/5 rounded-2xl p-5 hover:border-indigo-500/30 hover:bg-slate-900/60 transition-all duration-300"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3">
                  <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {card.category}
                  </span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((star) => (
                      <div
                        key={star}
                        className={`w-1.5 h-1.5 rounded-full ${star <= card.difficulty ? 'bg-amber-400' : 'bg-slate-700'}`}
                      />
                    ))}
                  </div>
                </div>

                {/* Card Content */}
                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                      Question
                    </p>
                    <p className="text-sm font-medium text-slate-200 line-clamp-2">
                      {card.front}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                      Answer
                    </p>
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {card.back}
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {card.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {card.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                    {card.tags.length > 3 && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-500">
                        +{card.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-3 text-xs">
                    <span className={getMasteryColor(card.mastery)}>
                      {card.mastery || 0}% mastery
                    </span>
                    <span className="text-slate-600">
                      {card.reviewStats?.timesReviewed || 0} reviews
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(card)}
                      className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                      title="Edit"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(card)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Delete"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-lg glass-premium rounded-3xl shadow-2xl animate-modal-in">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">
                {editingCard ? 'Edit Card' : 'Create Card'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <CloseIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Question
                </label>
                <textarea
                  name="front"
                  value={formData.front}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, front: e.target.value }))
                  }
                  className="w-full h-24 px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                  placeholder="What is..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Answer
                </label>
                <textarea
                  name="back"
                  value={formData.back}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, back: e.target.value }))
                  }
                  className="w-full h-28 px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                  placeholder="The answer is..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, category: e.target.value }))
                    }
                    list="modal-categories"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                    placeholder="General"
                  />
                  <datalist id="modal-categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Difficulty
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({ ...p, difficulty: level }))
                        }
                        className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                          formData.difficulty === level
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                            : 'bg-slate-900/30 border-slate-700/50 text-slate-500 hover:border-slate-600'
                        }`}
                      >
                        {'★'.repeat(level)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, tags: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25"
                >
                  {editingCard ? 'Save Changes' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          />

          <div className="relative w-full max-w-md glass-premium rounded-3xl shadow-2xl p-8 text-center animate-modal-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-500/10 flex items-center justify-center">
              <TrashIcon />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Delete Card?</h3>
            <p className="text-slate-400 mb-6">
              This will permanently remove "{deleteConfirm.front.slice(0, 50)}
              ..."
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm._id)}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-rose-500/25"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl animate-fade-in z-50 ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
