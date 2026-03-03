import axios from 'axios';

// La URL base del backend
const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.trim();
  return process.env.NODE_ENV === 'production'
    ? 'https://control-servicios-taller.onrender.com'
    : 'http://localhost:4000';
};

const API = getApiBaseUrl();

// Registro
export const registerRequest = (user) =>
  axios.post(`${API}/api/auth/register`, user, {
    withCredentials: true,
  });

// Login
export const loginRequest = (user) =>
  axios.post(`${API}/api/auth/login`, user, {
    withCredentials: true,
  });

// Perfil
export const profileRequest = () =>
  axios.get(`${API}/api/auth/profile`, {
    withCredentials: true,
  });

// Logout
export const logoutRequest = () =>
  axios.post(`${API}/api/auth/logout`, {}, {
    withCredentials: true,
  });

// Recuperar contraseña
export const forgotPasswordRequest = (email) =>
  axios.post(`${API}/api/auth/forgot-password`, { email }, {
    withCredentials: true,
  });

// Resetear contraseña
export const resetPasswordRequest = (token, password) =>
  axios.post(`${API}/api/auth/reset-password/${token}`, { password }, {
    withCredentials: true,
  });

// Validar token de reset
export const validateResetTokenRequest = (token) =>
  axios.post(`${API}/api/auth/validate-reset-token`, { token }, {
    withCredentials: true,
  });

// Verificar autenticación
export const verifyAuth = () =>
  axios.get(`${API}/api/auth/verify`, {
    withCredentials: true,
  });