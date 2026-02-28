
import axios from 'axios';

// La URL base del backend

// src/api/auth.js
import axios from 'axios';

// Construir la URL base del backend SIN espacios ni barras innecesarias
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    // Usa la variable de entorno (Vercel)
    return process.env.REACT_APP_API_URL.trim();
  }
  // Fallback para desarrollo local
  return process.env.NODE_ENV === 'production'
    ? 'https://taller-backend-7oz8.onrender.com'
    : 'http://localhost:4000';
};

const API_BASE = getApiBaseUrl();

// Función para el REGISTRO de usuarios
export const registerRequest = (user) =>
  axios.post(`${API_BASE}/api/auth/register`, user, {
    withCredentials: true
  });

// Función para el LOGIN de usuarios
export const loginRequest = (user) =>
  axios.post(`${API_BASE}/api/auth/login`, user, {
    withCredentials: true
  });

// Función para verificar autenticación
export const verifyAuth = () =>
  axios.get(`${API_BASE}/api/auth/verify`, { withCredentials: true });