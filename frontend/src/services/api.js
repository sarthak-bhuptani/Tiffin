import axios from 'axios';

// Ensure base URL points to live Vercel backend or fallback
const rawBaseURL = import.meta.env.VITE_API_BASE_URL || 'https://tiffin-indol.vercel.app/api';
const baseURL = rawBaseURL.endsWith('/') ? rawBaseURL : `${rawBaseURL}/`;

const API = axios.create({
  baseURL,
});

API.interceptors.request.use(
  (config) => {
    // Strip leading slash if present to avoid resetting baseURL origin in Axios
    if (config.url && config.url.startsWith('/')) {
      config.url = config.url.substring(1);
    }
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
    }
    return Promise.reject(error);
  }
);

export default API;
