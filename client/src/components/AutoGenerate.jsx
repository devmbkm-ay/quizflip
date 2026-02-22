import { useState } from 'react';
import { cardApi } from '../services/api';

export function AutoGenerate({
  onCardsCreated,
  floatingClassName = 'fixed bottom-8 left-8 z-40',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewCards, setPreviewCards] = useState([]);
  const [step, setStep] = useState('input'); // input, preview, done

  const handleGenerate = async () => {
    if (!notes.trim()) return;

    setIsGenerating(true);

    try {
      // Call your AI endpoint
      const response = await fetch('http://localhost:5000/api/cards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, category }),
      });

      const data = await response.json();
      setPreviewCards(data.cards);
      setStep('preview');
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    // Save all preview cards
    for (const card of previewCards) {
      await cardApi.create({ ...card, category: category || card.category });
    }

    onCardsCreated?.();
    setStep('done');
    setTimeout(() => {
      setIsOpen(false);
      setStep('input');
      setNotes('');
      setPreviewCards([]);
    }, 1500);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`${floatingClassName} px-4 sm:px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105`}
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        AI Generate
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      <div className="relative w-full max-w-2xl glass-card rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-gradient flex items-center gap-2">
            <svg
              className="w-6 h-6 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            AI Card Generator
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Paste your notes and AI will create flashcards automatically
          </p>
        </div>

        {/* Step 1: Input */}
        {step === 'input' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Your Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste lecture notes, article text, or any content you want to learn..."
                className="w-full h-48 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Category (optional)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Machine Learning"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!notes.trim() || isGenerating}
              className="w-full py-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
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
                  AI is thinking...
                </>
              ) : (
                'Generate Cards'
              )}
            </button>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 'preview' && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-slate-400">
                {previewCards.length} cards generated
              </span>
              <button
                onClick={() => setStep('input')}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                ← Back to edit
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
              {previewCards.map((card, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-900/50 rounded-xl border border-slate-700"
                >
                  <div className="text-xs text-purple-400 mb-1 font-medium">
                    Q{idx + 1} • {'★'.repeat(card.difficulty)}
                  </div>
                  <div className="font-medium text-slate-200 mb-2">
                    {card.front}
                  </div>
                  <div className="text-sm text-slate-400">{card.back}</div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold"
              >
                Save All Cards
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === 'done' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-emerald-400"
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
            </div>
            <h3 className="text-xl font-bold text-emerald-400 mb-2">
              Cards Created!
            </h3>
            <p className="text-slate-400">
              {previewCards.length} new cards added to your deck
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
