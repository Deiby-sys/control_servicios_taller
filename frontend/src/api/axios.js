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
    const data = error.response?.data;
    const message = typeof data === "string" ? "Respuesta inesperada del servidor" : (data?.message || error.message);

    console.error("Error en petición Axios:", message);

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