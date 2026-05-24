import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 3500,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('factoryToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('factoryToken');
      localStorage.removeItem('factoryUser');
    }
    return Promise.reject(error);
  },
);

export default api;
