// Api módulo vehículos

import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const getVehiclesRequest = () => apiClient.get("/vehicles");
export const createVehicleRequest = (vehicleData) => apiClient.post("/vehicles", vehicleData);
export const getVehicleRequest = (id) => apiClient.get(`/vehicles/${id}`);
export const updateVehicleRequest = (id, vehicleData) => apiClient.put(`/vehicles/${id}`, vehicleData);
export const deleteVehicleRequest = (id) => apiClient.delete(`/vehicles/${id}`);