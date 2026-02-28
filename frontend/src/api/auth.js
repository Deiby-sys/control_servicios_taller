import axios from 'axios';

// 1. Detectar la URL de manera automática y segura
const getApiBaseUrl = () => {
  // Vite usa import.meta.env, no process.env
  const urlVercel = import.meta.env.VITE_API_URL;
  
  if (urlVercel) return urlVercel.trim();

  return import.meta.env.MODE === 'production'
    ? 'https://taller-backend-7oz8.onrender.com'
    : 'http://localhost:4000';
};

const API_BASE = getApiBaseUrl();

// 2. Configuración de la instancia de Axios
// Esto evita repetir la URL en cada función
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true // Mantener si usas cookies/tokens en cookies
});

// Funciones simplificadas
export const registerRequest = (user) => api.post('/auth/register', user);
export const loginRequest = (user) => api.post('/auth/login', user);
export const verifyAuth = () => api.get('/auth/verify');