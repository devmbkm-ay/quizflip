import { useState, useCallback, useRef } from 'react';
import { aiApi, cardApi } from '../../services/api.js'; // Import aiApi

// Custom hook for async operations
const useAsync = () => {
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFunction) => {
    setStatus('loading');
    setError(null);
    try {
      const result = await asyncFunction();
      setStatus('success');
      return result;
    } catch (err) {
      setStatus('error');
      setError(err.message || 'An error occurred');
      throw err;
    }
  }, []);

  return { status, error, execute, setStatus, setError };
};

export function AutoGenerate({ onCardsCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [previewCards, setPreviewCards] = useState([]);
  const [step, setStep] = useState('input');
  const [selectedCards, setSelectedCards] = useState(new Set());

  const { status, error, execute, setError } = useAsync();
  const abortControllerRef = useRef(null);
  const isGenerating = status === 'loading' || step === 'saving';

  const handleGenerate = async () => {
    if (!notes.trim()) return;

    try {
      // Use aiApi.generate instead of cardApi.generate
      const response = await execute(() => aiApi.generate(notes, category, 5));

      // Response is already extracted by axios interceptor (response.data)
      setPreviewCards(response.data || []);
      setSelectedCards(new Set((response.data || []).map((_, i) => i)));
      setStep('preview');
    } catch (err) {
      // Error already handled by useAsync, but you can add specific handling here
      console.error('Generation failed:', err);
    }
  };

  const handleSave = async () => {
    const cardsToSave = previewCards.filter((_, idx) => selectedCards.has(idx));

    if (cardsToSave.length === 0) return;

    setStep('saving');

    try {
      // Use the batch create endpoint
      await cardApi.createBatch(cardsToSave);

      setStep('done');
      onCardsCreated?.(cardsToSave);

      setTimeout(() => {
        setIsOpen(false);
        resetForm();
      }, 1500);
    } catch (err) {
      setStep('preview');
      // Handle save error
    }
  };

  // ... rest of your component remains the same
  const resetForm = () => {
    setStep('input');
    setNotes('');
    setCategory('');
    setPreviewCards([]);
    setError(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 left-8 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-lg shadow-purple-500/30 transition-all hover:scale-105 z-40"
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
        <span className="hidden sm:inline">AI Generate</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={() => !isGenerating && setIsOpen(false)}
      />

      <div className="relative w-full max-w-2xl glass-premium rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-modal-in">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gradient flex items-center gap-2">
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
            <p className="text-slate-400 text-sm mt-1">
              Powered by Google Gemini
            </p>
          </div>
          <button
            onClick={() => !isGenerating && setIsOpen(false)}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors"
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

        {/* Error Banner */}
        {error && (
          <div className="mx-8 mt-4 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Step: Input */}
        {step === 'input' && (
          <div className="p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Study Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your lecture notes, article, or any content you want to learn..."
                className="w-full h-48 px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all resize-none"
              />
              <div className="text-xs text-slate-500 mt-1 text-right">
                {notes.length}/5000 characters
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category (optional)
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Machine Learning"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-slate-100 placeholder-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={!notes.trim() || isGenerating}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  Gemini is thinking...
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Generate Cards
                </>
              )}
            </button>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400">
                {previewCards.length} cards generated by Gemini
              </span>
              <button
                onClick={() => setStep('input')}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                ← Regenerate
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto mb-6 pr-2">
              {previewCards.map((card, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-purple-400">
                      Q{idx + 1} • {'★'.repeat(card.difficulty)}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">
                      {card.category}
                    </span>
                  </div>
                  <p className="font-medium text-slate-200 mb-2">
                    {card.front}
                  </p>
                  <p className="text-sm text-slate-400">{card.back}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('input')}
                className="flex-1 py-3 rounded-xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold transition-all hover:shadow-lg hover:shadow-purple-500/25"
              >
                Save All Cards
              </button>
            </div>
          </div>
        )}

        {/* Step: Saving */}
        {step === 'saving' && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
              <svg
                className="w-8 h-8 text-purple-400 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
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
            </div>
            <h3 className="text-lg font-medium text-white">Saving cards...</h3>
          </div>
        )}

        {/* Step: Done */}
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
