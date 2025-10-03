// Centralizar la URL base del backend

import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:4000/api", // Backend
  withCredentials: true,
});

// Interceptor de respuesta
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Loguear el error
    console.error("Error en petición Axios:", error.response?.data || error.message);

    // Si el error es 401 (no autorizado)
    if (error.response?.status === 401) {
      console.warn("Sesión expirada o no autorizada. Redirigiendo al login...");
      window.location.href = "/"; // Redirige al login (raíz)
    }

    return Promise.reject(error);
  }
);

export default instance;

