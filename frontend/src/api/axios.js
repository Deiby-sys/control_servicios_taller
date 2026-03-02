// Centralizar la URL base del backend

// src/api/axios.js
import axios from 'axios';

const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.trim();
  return process.env.NODE_ENV === 'production'
    ? 'https://control-servicios-taller.onrender.com'
    : 'http://localhost:4000';
};

const API_BASE = getApiBaseUrl();

const instance = axios.create({
  baseURL: `${API_BASE}/api`, // ✅ URL completa + /api
  withCredentials: true,
});

// Interceptor de respuesta
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error en petición Axios:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.warn("Sesión expirada o no autorizada.");

      const path = window.location.pathname;

      if (
        !path.includes("/login") &&
        !path.includes("/registerUser") &&
        !path.includes("/recuperar") &&
        !path.includes("/reset-password")
      ) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default instance;