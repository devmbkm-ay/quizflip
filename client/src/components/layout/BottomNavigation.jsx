import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { LogoutModal } from '../ui/LogoutModal';

const navItems = [
  { id: 'study', label: 'Study', icon: '📚' },
  { id: 'manage', label: 'Manage', icon: '🎛️' },
];

export function BottomNavigation({ current, onChange }) {
  const { logout } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
        <div className="flex items-center gap-1 p-1.5 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          {/* Boutons de Navigation principaux */}
          <div className="flex gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                  current === item.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="hidden sm:inline text-sm">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Séparateur vertical bien visible */}
          <div className="w-px h-8 bg-white/20 mx-1" />

          {/* Bouton Logout redessiné pour correspondre au style */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-rose-400 hover:bg-rose-500/10 transition-all group"
          >
            <span className="text-lg group-hover:scale-110 transition-transform">
              🚪
            </span>
            <span className="hidden sm:inline text-sm">Quitter</span>
          </button>
        </div>
      </nav>

      <LogoutModal
        isOpen={showLogoutConfirm}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </>
  );
}
