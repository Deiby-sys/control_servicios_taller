// Centralizar la URL base del backend

import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:4000/api",
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