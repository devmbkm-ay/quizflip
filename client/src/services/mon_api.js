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
  timeout: 30000, // 30 second timeout for AI generation
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data, // Return only the data from the response
  (error) => {
    if (error.response) {
      // Server responded with a status other than 2xx
      const { status, data } = error.response;
      const message = data.error || data.message || 'An error occurred';

      // Handle specific status codes
      if (status === 429) {
        return Promise.reject({
          status,
          message: 'Too many requests. Please wait a moment and try again.',
          retryAfter: error.response.headers['retry-after'],
        });
      }
      if (status === 503) {
        return Promise.reject({
          status,
          message:
            'AI service temporarily unavailable. Please try again later.',
        });
      }

      return Promise.reject({ status, message, details: data.details });
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        status: null,
        message: 'No response from server. Please check your connection.',
      });
    } else {
      // Something else happened while setting up the request
      return Promise.reject({ status: null, message: error.message });
    }
  },
);

// Request interceptor to add auth token if needed in future
api.interceptors.request.use(
  (config) => {
    // You can add auth headers here later
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

export const cardApi = {
  // Existing endpoints
  getAll: (params) => api.get('/cards', { params }),
  getById: (id) => api.get(`/cards/${id}`),
  create: (data) => api.post('/cards', data),
  update: (id, data) => api.put(`/cards/${id}`, data),
  delete: (id) => api.delete(`/cards/${id}`),
  review: (id, wasCorrect) => api.post(`/cards/${id}/review`, { wasCorrect }),
  getStats: () => api.get('/cards/stats/overview'),
  getCategories: () => api.get('/cards/stats/categories'),
  getProgressStats: (userId) => api.get(`/cards/stats/progress/${userId}`),
  getStudySession: () => api.get('/cards/study/session'),

  // Batch create for AI-generated cards
  createBatch: (cards) => api.post('/cards/batch', { cards }),
};

// New AI generation API
export const aiApi = {
  /**
   * Generate flashcards from study notes
   * @param {string} notes - Study notes content
   * @param {string} [category='general'] - Category for the cards
   * @param {number} [count=5] - Number of cards to generate (1-20)
   * @param {'fr'|'en'} [language='fr'] - Output language
   * @returns {Promise<{success: boolean, data: Array, meta: Object}>}
   */
  generate: (notes, category = 'general', count = 5, language = 'fr') =>
    api.post('/ai/generate', {
      notes,
      category,
      count,
      language,
    }),

  /**
   * Generate flashcards from multiple topics (batch)
   * @param {string[]} topics - Array of study topics/notes
   * @param {string} [category='general'] - Category for all cards
   * @param {number} [cardsPerTopic=3] - Cards per topic (1-10)
   * @returns {Promise<{success: boolean, data: Array, meta: Object}>}
   */
  generateBatch: (topics, category = 'general', cardsPerTopic = 3) =>
    api.post('/ai/generate/batch', {
      topics,
      category,
      cardsPerTopic,
    }),
};

export default api;
