
import axios from 'axios';

// La URL base del backend
const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.trim();
  return process.env.NODE_ENV === 'production'
    ? 'https://control-servicios-taller.onrender.com' // ← ¡elimina los espacios al final!
    : 'http://localhost:4000';
};

// Define la constante API usando la función
const API = getApiBaseUrl();

// Función para el REGISTRO de usuarios
export const registerRequest = (user) =>
  axios.post(`${API}/api/auth/register`, user, {
    withCredentials: true
  });

// Función para el LOGIN de usuarios
export const loginRequest = (user) =>
  axios.post(`${API}/api/auth/login`, user, {
    withCredentials: true
  });

// Función para verificar autenticación
export const verifyAuth = () =>
  axios.get(`${API}/api/auth/verify`, {
    withCredentials: true
  });
//se instala Axios es una biblioteca de JavaScript que actúa como un cliente HTTP 
// basado en promesas, permitiendo realizar solicitudes a servidores de manera eficiente 
// tanto en el navegador como en Node.js. Es ampliamente utilizada para consumir APIs REST 
// y manejar datos JSON de forma sencilla