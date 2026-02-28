export function LogoutModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop avec flou progressif */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md animate-fade-in"
        onClick={onCancel}
      />

      {/* Boîte de dialogue */}
      <div className="relative w-full max-w-sm glass-premium rounded-3xl border border-white/10 shadow-2xl p-8 text-center animate-modal-in">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
          <span className="text-4xl">🚪</span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-2">
          Quitter le Dojo ?
        </h3>
        <p className="text-slate-400 mb-8">
          Êtes-vous sûr de vouloir vous déconnecter ? Vos progrès sont
          sauvegardés.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3.5 rounded-2xl border border-slate-700/50 text-slate-400 hover:text-white hover:bg-white/5 transition-all font-medium"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20 transition-all active:scale-95"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}
