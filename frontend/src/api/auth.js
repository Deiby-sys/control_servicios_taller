// src/api/auth.js
// Centraliza todas las llamadas HTTP relacionadas con autenticación

import axios from 'axios';

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.trim();
  return import.meta.env.MODE === 'production'
    ? 'https://control-servicios-taller.onrender.com'
    : 'http://localhost:4000';
};

const API_BASE = getApiBaseUrl();

const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

// Interceptor global para manejar errores de autenticación
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      // Evita redirigir en páginas públicas
      if (
        !path.includes('/login') &&
        !path.includes('/registerUser') &&
        !path.includes('/recuperar') &&
        !path.includes('/reset-password')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// === Funciones de autenticación ===

export const registerRequest = (user) =>
  apiClient.post('/auth/register', user);

export const loginRequest = (user) =>
  apiClient.post('/auth/login', user);

export const logoutRequest = () =>
  apiClient.post('/auth/logout');

export const profileRequest = () =>
  apiClient.get('/auth/profile');

export const verifyAuth = () =>
  apiClient.get('/auth/verify');

export const forgotPasswordRequest = (email) =>
  apiClient.post('/auth/forgot-password', { email });

export const resetPasswordRequest = (token, password) =>
  apiClient.post(`/auth/reset-password/${token}`, { password });

export const validateResetTokenRequest = (token) =>
  apiClient.post('/auth/validate-reset-token', { token });

export const getReportsSummary = () => apiClient.get('/reports/summary');

export const getUsersRequest = () => apiClient.get('/users');

export const getResponsiblesListRequest = () => apiClient.get('/users/responsibles');