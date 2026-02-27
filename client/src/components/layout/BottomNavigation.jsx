import { useApp } from '../../contexts/AppContext';

const navItems = [
  { id: 'study', label: 'Study', icon: '📚' },
  { id: 'manage', label: 'Manage', icon: '🎛️' },
];

export function BottomNavigation({ current, onChange }) {
  // On récupère la fonction de logout et les infos utilisateur depuis le contexte
  const { logout, user } = useApp();
  return (
    <nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex gap-2 p-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              current === item.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{item.icon}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        ))}
        {/* Séparateur */}
        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Bouton Logout */}
        <button
          onClick={() => {
            if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
              logout();
            }
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-rose-400 hover:bg-rose-500/10 transition-all group"
          title="Se déconnecter"
        >
          <span className="group-hover:scale-110 transition-transform">🚪</span>
          <span className="hidden sm:inline">Quitter</span>
        </button>
      </div>
    </nav>
  );
}
