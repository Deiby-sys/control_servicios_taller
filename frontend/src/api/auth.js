
import axios from 'axios';

// La URL base del backend
const API = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production'
    ? 'https://taller-backend-7oz8.onrender.com'
    : 'http://localhost:4000');
  
// Función para el REGISTRO de usuarios
export const registerRequest = (user) =>
  axios.post(`${API}/api/auth/register`, user, {
    withCredentials: true
  });

// Nueva Función para el LOGIN de usuarios
export const loginRequest = (user) =>
  axios.post(`${API}/api/auth/login`, user, {
    withCredentials: true
  });

// Función para verificar autenticación
export const verifyAuth = () =>
  axios.get(`${API}/api/auth/verify`, { withCredentials: true });
//se instala Axios es una biblioteca de JavaScript que actúa como un cliente HTTP 
// basado en promesas, permitiendo realizar solicitudes a servidores de manera eficiente 
// tanto en el navegador como en Node.js. Es ampliamente utilizada para consumir APIs REST 
// y manejar datos JSON de forma sencilla