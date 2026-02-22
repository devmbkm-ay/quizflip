import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

//Add response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data, // Return only the data from the response
    (error) => {
      if (error.response) {
        // Server responded with a status other than 2xx
        const { status, data } = error.response;
        const message = data.error || 'An error occurred';
        return Promise.reject({ status, message });
      } else if (error.request) {
        // Request was made but no response received
        return Promise.reject({ status: null, message: 'No response from server' });
      } else {
        // Something else happened while setting up the request
        return Promise.reject({ status: null, message: error.message });
      }
    }
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
        getProgressStats: (userId) => api.get(`/cards/stats/progress/${userId}`),
        getStudySession: () => api.get('/cards/study/session'),
    }

export default api;