// Api módulo vehículos

// src/api/vehiclesApi.js
import axios from 'axios';

// Reutiliza la misma lógica de URL base
const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.trim();
  return process.env.NODE_ENV === 'production'
    ? 'https://control-servicios-taller.onrender.com'
    : 'http://localhost:4000';
};

const apiClient = axios.create({
  baseURL: `${getApiBaseUrl()}/api`,
  withCredentials: true,
});

export const getVehiclesRequest = () => apiClient.get("/vehicles");
export const createVehicleRequest = (vehicleData) => apiClient.post("/vehicles", vehicleData);
export const getVehicleRequest = (id) => apiClient.get(`/vehicles/${id}`);
export const updateVehicleRequest = (id, vehicleData) => apiClient.put(`/vehicles/${id}`, vehicleData);
export const deleteVehicleRequest = (id) => apiClient.delete(`/vehicles/${id}`);