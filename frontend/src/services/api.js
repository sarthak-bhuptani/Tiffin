import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tiffin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('tiffin_token');
      localStorage.removeItem('tiffin_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
