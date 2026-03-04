// API para clientes

// src/api/clientApi.js
import axios from 'axios';

// Reutiliza la misma lógica de URL base que en auth.js
const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.trim();
  return process.env.NODE_ENV === 'production'
    ? 'https://control-servicios-taller.onrender.com'
    : 'http://localhost:4000';
};

const clientApi = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  withCredentials: true,
});

// GET: Obtener todos los clientes
export const getClientsRequest = () => clientApi.get('/clients');

// GET: Obtener un solo cliente por ID
export const getClientRequest = (id) => clientApi.get(`/clients/${id}`);

// POST: Crear un nuevo cliente
export const createClientRequest = (client) => clientApi.post('/clients', client);

// PUT: Actualizar un cliente por ID
export const updateClientRequest = (id, client) => clientApi.put(`/clients/${id}`, client);

// DELETE: Eliminar un cliente por ID
export const deleteClientRequest = (id) => clientApi.delete(`/clients/${id}`);