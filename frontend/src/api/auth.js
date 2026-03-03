// src/api/auth.js
import axios from 'axios';

// Configuración segura de la URL base
const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.trim();
  return process.env.NODE_ENV === 'production'
    ? 'https://control-servicios-taller.onrender.com' // ✅ sin espacios
    : 'http://localhost:4000';
};

const API_BASE = getApiBaseUrl();

// Crea una instancia reutilizable (opcional pero recomendado)
const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

// Registro
export const registerRequest = (user) =>
  apiClient.post('/auth/register', user);

// Login
export const loginRequest = (user) =>
  apiClient.post('/auth/login', user);

// Perfil
export const profileRequest = () =>
  apiClient.get('/auth/profile');

// Logout
export const logoutRequest = () =>
  apiClient.post('/auth/logout');

// Recuperar contraseña
export const forgotPasswordRequest = (email) =>
  apiClient.post('/auth/forgot-password', { email });

// Resetear contraseña
export const resetPasswordRequest = (token, password) =>
  apiClient.post(`/auth/reset-password/${token}`, { password });

// Validar token de reset
export const validateResetTokenRequest = (token) =>
  apiClient.post('/auth/validate-reset-token', { token });

// Verificar autenticación
export const verifyAuth = () =>
  apiClient.get('/auth/verify');