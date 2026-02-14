// Centralizar la URL base del backend

import axios from "axios";

const instance = axios.create({
  baseURL: "/api", // prefijo común para todas las rutas
  withCredentials: true, // asegura que se envíen cookies
});

// Interceptor de respuesta
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Error en petición Axios:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.warn("Sesión expirada o no autorizada.");

      const path = window.location.pathname;

      // Solo redirigir si el usuario ya estaba dentro de la app
      // Evitamos redirigir en /login, /registerUser o /recuperar
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