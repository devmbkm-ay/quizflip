import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext'; // On récupère useApp pour utiliser setUser
import { authApi } from '../services/api';

const Login = () => {
  const { setUser, showToast } = useApp(); // On récupère les outils du contexte
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authApi.login(formData);

      if (response.token) {
        // 1. Stockage physique pour la persistance
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.data));

        // 2. Mise à jour de l'état global (Déclenche le basculement du Layout)
        setUser(response.data);
        console.log('SETUSER:', response.data);

        // 3. Feedback positif
        if (showToast) showToast('Bienvenue dans votre Dojo !', 'success');
      }
    } catch (err) {
      console.error('Erreur login:', err);
      // On utilise le toast du contexte si disponible
      const msg = err.response?.data?.error || 'Identifiants invalides';
      alert(msg); // En attendant d'avoir un composant d'alerte plus sexy
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-modal-in">
        <div className="glass-premium p-8 rounded-3xl border-gradient">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gradient mb-3">QuizFlip</h1>
            <p className="text-slate-400">
              Connectez-vous pour réviser vos 38 cartes
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-slate-100 input-glow outline-none focus:border-indigo-500/50 transition-all"
                placeholder="your-name@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-slate-100 input-glow outline-none focus:border-indigo-500/50 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-shine btn-interactive bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Entrer dans le Dojo'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            Nouveau ici ?{' '}
            <span className="text-indigo-400 font-medium cursor-pointer hover:text-indigo-300 transition-colors">
              Créer un compte
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
