import axios from 'axios';

const apiBaseUrl =
  import.meta.env.VITE_REACT_APP_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

/**
 * INTERCEPTEUR DE REQUÊTE : L'injection automatique
 * On ne passe plus le token manuellement dans les fonctions, l'intercepteur s'en charge.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization; // Nettoie l'en-tête si pas de token
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * INTERCEPTEUR DE RÉPONSE : La gestion centralisée
 */
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      const message = data.error || data.message || 'An error occurred';

      // LOGIQUE NINJA : Gestion de l'expiration de session
      if (status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirection forcée si on n'est pas sur la page login
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      if (status === 429) {
        return Promise.reject({
          status,
          message: 'Too many requests. Please wait a moment.',
          retryAfter: error.response.headers['retry-after'],
        });
      }

      return Promise.reject({ status, message, details: data.details });
    }

    return Promise.reject({
      status: null,
      message: error.message || 'Network Error',
    });
  },
);

export const cardApi = {
  getAll: (params) => api.get('/cards', { params }),
  getById: (id) => api.get(`/cards/${id}`),
  create: (data) => api.post('/cards', data),
  update: (id, data) => api.put(`/cards/${id}`, data),
  delete: (id) => api.delete(`/cards/${id}`),
  review: (id, wasCorrect) => api.post(`/cards/${id}/review`, { wasCorrect }),
  getStats: () => api.get('/cards/stats/overview'),
  getCategories: () => api.get('/cards/stats/categories'),

  // NINJA : On supprime l'argument userId ici car le backend
  // utilise req.user.id (le token) pour identifier l'utilisateur.
  getProgressStats: () => api.get('/cards/stats/progress'),

  getStudySession: () => api.get('/cards/study/session'),
  createBatch: (cards) => api.post('/cards/batch', { cards }),
};

// Ajout des méthodes d'authentification pour boucler le système
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

export const aiApi = {
  generate: (notes, category = 'general', count = 5, language = 'fr') =>
    api.post('/ai/generate', { notes, category, count, language }),
  generateBatch: (topics, category = 'general', cardsPerTopic = 3) =>
    api.post('/ai/generate/batch', { topics, category, cardsPerTopic }),
};

export default api;
