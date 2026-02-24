import { useEffect, useState } from 'react';

export function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  const colors = {
    success: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
    error: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
    info: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300',
  };

  return (
    <div
      className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl border backdrop-blur-xl shadow-2xl transform transition-all duration-300 z-50 flex items-center gap-3 ${colors[type]} ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      role="alert"
      aria-live="polite"
    >
      <span>{icons[type]}</span>
      <span className="font-medium">{message}</span>
    </div>
  );
}