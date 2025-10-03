
import axios from 'axios';

// La URL base del backend
const API = 'http://localhost:4000/api'; 

// Función para el REGISTRO de usuarios
export const registerRequest = (user) => 
    axios.post(
        `${API}/auth/register`, // Asegúrate de que tu ruta de backend sea /api/auth/register
        user,
        {
            withCredentials: true // Permite enviar y recibir cookies
        }
    );

// Nueva Función para el LOGIN de usuarios
export const loginRequest = (user) => 
    axios.post(
        `${API}/auth/login`, // Apunta al endpoint de login en tu backend: /api/auth/login
        user,
        {
            withCredentials: true // ¡CLAVE! Permite que el navegador reciba la cookie JWT del servidor
        }
    );
//se instala Axios es una biblioteca de JavaScript que actúa como un cliente HTTP 
// basado en promesas, permitiendo realizar solicitudes a servidores de manera eficiente 
// tanto en el navegador como en Node.js. Es ampliamente utilizada para consumir APIs REST 
// y manejar datos JSON de forma sencilla