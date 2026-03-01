import { useEffect, useState } from 'react';
import { useApp } from '../../contexts/AppContext.jsx';
import { useCard } from '../../hooks/useCard.js';
import { CardManager } from '../../components/cards/CardManager.jsx';
import { CardDashboard } from '../../components/cards/CardDashboard.jsx';
import { AutoGenerate } from '../../components/cards/AutoGenerate.jsx';

export function ManageView() {
  const { setView, showToast } = useApp();
  const { cards, refresh, error, updateCard, deleteCard } = useCard();

  const [editingCard, setEditingCard] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCardCreated = async () => {
    try {
      await refresh();
      if (showToast) showToast('Card created successfully!', 'success');
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  const handleCardsCreated = async (cards = []) => {
    try {
      await refresh();
      const count = Array.isArray(cards) ? cards.length : 1;
      const message = `${count} card${count > 1 ? 's' : ''} created successfully!`;
      if (showToast) showToast(message, 'success');
    } catch (err) {
      if (showToast) showToast(err.message, 'error');
    }
  };

  const handleCardEdit = (card) => {
    if (!card?._id) return;
    setEditingCard(card);
  };

  const handleCardDelete = (card) => {
    if (!card?._id) return;
    setCardToDelete(card);
  };

  const handleEditSubmit = async (payload) => {
    if (!editingCard?._id) return;

    setIsSavingEdit(true);
    try {
      await updateCard(editingCard._id, payload);
      setEditingCard(null);
      if (showToast) showToast('Card updated successfully!', 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to update card', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!cardToDelete?._id) return;

    setIsDeleting(true);
    try {
      await deleteCard(cardToDelete._id);
      setCardToDelete(null);
      if (showToast) showToast('Card deleted successfully!', 'success');
    } catch (err) {
      if (showToast) showToast(err.message || 'Failed to delete card', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <CardManager
        cards={cards}
        onBack={() => setView('study')}
        onEdit={handleCardEdit}
        onDelete={handleCardDelete}
      />

      <CardDashboard onCardCreated={handleCardCreated} />
      <AutoGenerate onCardsCreated={handleCardsCreated} />

      {error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-rose-500/10 text-rose-400 px-4 py-2 rounded-xl border border-rose-500/20">
          {error}
        </div>
      )}

      <EditCardModal
        card={editingCard}
        isSaving={isSavingEdit}
        onCancel={() => setEditingCard(null)}
        onSubmit={handleEditSubmit}
      />

      <DeleteCardModal
        card={cardToDelete}
        isDeleting={isDeleting}
        onCancel={() => setCardToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

function EditCardModal({ card, isSaving, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    front: '',
    back: '',
    category: 'general',
    difficulty: 2,
    tags: '',
  });

  useEffect(() => {
    if (!card) return;
    setForm({
      front: card.front || '',
      back: card.back || '',
      category: card.category || 'general',
      difficulty: Number(card.difficulty) || 2,
      tags: Array.isArray(card.tags) ? card.tags.join(', ') : '',
    });
  }, [card]);

  if (!card) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.front.trim() || !form.back.trim() || !form.category.trim()) {
      return;
    }

    onSubmit({
      front: form.front.trim(),
      back: form.back.trim(),
      category: form.category.trim(),
      difficulty: Number(form.difficulty) || 2,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-fade-in"
        onClick={onCancel}
      />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl glass-premium rounded-3xl border border-white/10 shadow-2xl p-6 sm:p-8 animate-modal-in space-y-4"
      >
        <h3 className="text-2xl font-bold text-white">Edit Card</h3>
        <p className="text-slate-400 text-sm">
          Update your card and save changes.
        </p>

        <label className="block">
          <span className="text-sm text-slate-300">Question</span>
          <textarea
            value={form.front}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, front: e.target.value }))
            }
            className="mt-2 w-full h-24 px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 input-glow resize-none"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Answer</span>
          <textarea
            value={form.back}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, back: e.target.value }))
            }
            className="mt-2 w-full h-28 px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 input-glow resize-none"
            required
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block sm:col-span-2">
            <span className="text-sm text-slate-300">Category</span>
            <input
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, category: e.target.value }))
              }
              className="mt-2 w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 input-glow"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-300">Difficulty</span>
            <select
              value={form.difficulty}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  difficulty: Number(e.target.value),
                }))
              }
              className="mt-2 w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 input-glow"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm text-slate-300">Tags (comma separated)</span>
          <input
            value={form.tags}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, tags: e.target.value }))
            }
            className="mt-2 w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 input-glow"
          />
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 py-3.5 rounded-2xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-70"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

function DeleteCardModal({ card, isDeleting, onCancel, onConfirm }) {
  if (!card) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-fade-in"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-sm glass-premium rounded-3xl border border-white/10 shadow-2xl p-8 text-center animate-modal-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
          <span className="text-4xl">🗑️</span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">Delete Card?</h3>
        <p className="text-slate-400 mb-8">
          This action cannot be undone and will remove this card from your study
          list.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-3.5 rounded-2xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95 disabled:opacity-70"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
