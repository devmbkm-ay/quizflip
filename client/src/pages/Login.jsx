import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { authApi } from '../services/api';

const Login = () => {
  const { setUser, showToast } = useApp();
  const [isLoginMode, setIsLoginMode] = useState(true); // État pour basculer
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '', // Nouveau champ pour le register
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Choix de l'appel API selon le mode
      const response = isLoginMode
        ? await authApi.login({
            email: formData.email,
            password: formData.password,
          })
        : await authApi.register(formData);

      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.data));
        setUser(response.data);

        if (showToast) {
          showToast(
            isLoginMode
              ? 'Bienvenue dans votre Dojo !'
              : 'Compte créé avec succès !',
            'success',
          );
        }
      }
    } catch (err) {
      console.error('Erreur auth:', err);
      const msg = err.response?.data?.error || 'Une erreur est survenue';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10 animate-modal-in">
        <div className="glass-premium p-8 rounded-3xl border-gradient shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gradient mb-3">QuizFlip</h1>
            <p className="text-slate-400">
              {isLoginMode
                ? 'Connectez-vous pour réviser'
                : 'Créez votre compte de Ninja'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Champ Username affiché UNIQUEMENT en mode inscription */}
            {!isLoginMode && (
              <div className="space-y-2 animate-fade-in">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-slate-100 input-glow outline-none focus:border-indigo-500/50 transition-all"
                  placeholder="Aymard_Ninja"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest ml-1">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full bg-slate-950/50 border border-white/5 rounded-2xl px-5 py-4 text-slate-100 input-glow outline-none focus:border-indigo-500/50 transition-all"
                placeholder="votre@email.com"
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
              ) : isLoginMode ? (
                'Entrer dans le Dojo'
              ) : (
                "S'inscrire"
              )}
            </button>
          </form>

          {/* Switcher de mode */}
          <p className="mt-8 text-center text-slate-500 text-sm">
            {isLoginMode ? 'Nouveau ici ?' : 'Déjà un compte ?'}{' '}
            <span
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-indigo-400 font-medium cursor-pointer hover:text-indigo-300 transition-colors underline underline-offset-4"
            >
              {isLoginMode ? 'Créer un compte' : 'Se connecter'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
