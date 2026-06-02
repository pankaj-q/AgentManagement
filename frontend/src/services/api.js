import axios from 'axios';

const baseURL = typeof __API_URL__ !== 'undefined'
  ? __API_URL__
  : import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - API URL:', baseURL);
      return Promise.reject(new Error(
        'Cannot connect to server at ' + baseURL + '. Make sure VITE_API_URL is set correctly in Vercel env vars.'
      ));
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }
    return Promise.reject(error);
  }
);

export default api;
