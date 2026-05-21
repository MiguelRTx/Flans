import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('onlyflans_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el backend responde con 401, el token expiró o es inválido
    if (error.response?.status === 401) {
      localStorage.removeItem('onlyflans_token');
      // Podríamos emitir un evento personalizado aquí para que Zustand reaccione
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);