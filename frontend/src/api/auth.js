
import axios from 'axios';

const API = 'http://localhost:4000/api'; //esta es la dirección del backend

export const registerRequest = (user) => axios.post(`${API}/register`, user);

//se instala Axios es una biblioteca de JavaScript que actúa como un cliente HTTP 
// basado en promesas, permitiendo realizar solicitudes a servidores de manera eficiente 
// tanto en el navegador como en Node.js. Es ampliamente utilizada para consumir APIs REST 
// y manejar datos JSON de forma sencilla