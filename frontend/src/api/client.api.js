// API para clientes

import axios from 'axios';

// Esta URL debe coincidir con el puerto del backend
const API = 'http://localhost:4000/api'; 

// Configuramos una instancia de axios para asegurar que todas las peticiones 
// envíen automáticamente la cookie de autenticación (JWT).
const clientApi = axios.create({
    baseURL: API,
    withCredentials: true,
});

// GET: Obtener todos los clientes
export const getClientsRequest = () => clientApi.get('/clients');

// GET: Obtener un solo cliente por ID
export const getClientRequest = (id) => clientApi.get(`/clients/${id}`);

// POST: Crear un nuevo cliente
// El objeto 'client' debe contener 'name', 'lastName', 'phone', 'city', etc.
export const createClientRequest = (client) => clientApi.post('/clients', client);

// PUT: Actualizar un cliente por ID
export const updateClientRequest = (id, client) => clientApi.put(`/clients/${id}`, client);

// DELETE: Eliminar un cliente por ID
export const deleteClientRequest = (id) => clientApi.delete(`/clients/${id}`);