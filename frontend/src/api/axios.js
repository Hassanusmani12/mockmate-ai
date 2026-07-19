import axios from 'axios';

const API_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://mockmate-ai-ig2g.vercel.app'
    : 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export default api;
