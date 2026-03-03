// Centralizar la URL base del backend

import axios from "axios";

// Fallback para desarrollo
const DEFAULT_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://control-servicios-taller.onrender.com'
  : 'http://localhost:4000';

const API_URL = process.env.REACT_APP_API_URL || DEFAULT_API_URL;

const instance = axios.create({
  baseURL: `${API_URL}/api`,
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