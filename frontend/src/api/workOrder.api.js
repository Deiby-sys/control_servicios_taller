//api orden de trabajo

import axios from "axios";

// Configuración base de Axios para incluir credenciales
const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true, // Esto envía las cookies automáticamente
});

export const getWorkOrdersRequest = () => apiClient.get("/work-orders");
export const createWorkOrderRequest = (workOrderData) => apiClient.post("/work-orders", workOrderData);
export const getWorkOrderRequest = (id) => apiClient.get(`/work-orders/${id}`);
export const updateWorkOrderStatusRequest = (id, updateData) => apiClient.patch(`/work-orders/${id}/status`, updateData);
export const getWorkOrdersByStatusRequest = (status) => apiClient.get(`/work-orders/status/${status}`);
export const getWorkOrderCountsRequest = () => apiClient.get("/work-orders/counts");
export const getVehicleByPlateRequest = (plate) => apiClient.get(`/work-orders/vehicle/plate/${plate}`);
export const getClientByIdentificationRequest = (identification) => apiClient.get(`/work-orders/client/${identification}`); 
export const addNoteToWorkOrderRequest = (id, noteData) => apiClient.post(`/work-orders/${id}/notes`, noteData);

// FUNCIONES PARA ADJUNTOS
export const uploadAttachmentRequest = async (orderId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return await axios.post(`/api/work-orders/${orderId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const downloadAttachmentRequest = async (orderId, fileId) => {
  // Retorna la URL para descargar
  return `/api/work-orders/${orderId}/attachments/${fileId}`;
};

// Eliminar adjunto y devolver orden actualizada
export const deleteAttachmentRequest = async (orderId, fileId) => {
  return await axios.delete(`/api/work-orders/${orderId}/attachments/${fileId}`);
};

// Historial órdenes de trabajo
export const deliverWorkOrderRequest = async (id, deliveryData) => {
  return await axios.post(`/api/work-orders/${id}/deliver`, deliveryData);
};