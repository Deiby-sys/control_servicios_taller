// src/api/workOrdersApi.js
import axios from "axios";

// Reutiliza la misma lógica de URL base
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.REACT_APP_API_URL; //import.meta.env
  if (envUrl) return envUrl.trim();
  return import.meta.env.MODE === 'production' //import.meta.env.MODE
    ? 'https://control-servicios-taller.onrender.com'
    : 'http://localhost:4000';
};

const API_BASE = getApiBaseUrl();

// Instancia reutilizable para la mayoría de las llamadas
const apiClient = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

// Funciones principales
export const getWorkOrdersRequest = () => apiClient.get("/work-orders");
export const createWorkOrderRequest = (workOrderData) => apiClient.post("/work-orders", workOrderData);
export const getWorkOrderRequest = (id) => apiClient.get(`/work-orders/${id}`);
export const updateWorkOrderStatusRequest = (id, updateData) => apiClient.patch(`/work-orders/${id}/status`, updateData);
export const getWorkOrdersByStatusRequest = (status) => apiClient.get(`/work-orders/status/${status}`);
export const getWorkOrderCountsRequest = () => apiClient.get("/work-orders/counts");
export const getVehicleByPlateRequest = (plate) => apiClient.get(`/work-orders/vehicle/plate/${plate}`);
export const getClientByIdentificationRequest = (identification) => apiClient.get(`/work-orders/client/${identification}`);
export const addNoteToWorkOrderRequest = (id, noteData) => apiClient.post(`/work-orders/${id}/notes`, noteData);

// FUNCIONES PARA ADJUNTOS (usamos axios directamente pero con URL completa)
export const uploadAttachmentRequest = async (orderId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return await axios.post(`${API_BASE}/api/work-orders/${orderId}/attachments`, formData, {
    withCredentials: true,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const downloadAttachmentRequest = async (orderId, fileId) => {
  // Retorna la URL completa para descargar
  return `${API_BASE}/api/work-orders/${orderId}/attachments/${fileId}`;
};

export const deleteAttachmentRequest = async (orderId, fileId) => {
  return await axios.delete(`${API_BASE}/api/work-orders/${orderId}/attachments/${fileId}`, {
    withCredentials: true
  });
};

export const deliverWorkOrderRequest = async (id, deliveryData) => {
  return await apiClient.post(`/work-orders/${id}/deliver`, deliveryData);
};