{/*Contexto órdenes de trabajo*/}

import { createContext, useContext, useState } from "react";
import { 
    getWorkOrdersRequest, 
    createWorkOrderRequest, 
    getWorkOrderRequest,
    getVehicleByPlateRequest, 
    getClientByIdentificationRequest, 
    addNoteToWorkOrderRequest,
    updateWorkOrderStatusRequest,
    getWorkOrdersByStatusRequest,
    getWorkOrderCountsRequest,
    uploadAttachmentRequest,
    downloadAttachmentRequest,
    deleteAttachmentRequest,
    deliverWorkOrderRequest
} from "../api/workOrder.api"; 

const WorkOrderContext = createContext();

export const useWorkOrders = () => {
    const context = useContext(WorkOrderContext);
    if (!context) {
        throw new Error("useWorkOrders must be used within a WorkOrderProvider");
    }
    return context;
};

export function WorkOrderProvider({ children }) {
    const [workOrders, setWorkOrders] = useState([]);
    const [errors, setErrors] = useState([]);

    // --- FUNCIONES CRUD Y PRINCIPALES ---

    // 1. Crear Orden de Trabajo
    const createWorkOrder = async (workOrder) => {
        try {
            const res = await createWorkOrderRequest(workOrder);
            return res.data;
        } catch (error) {
            setErrors(error.response.data);
            throw error; 
        }
    };
    
    // 2. Obtener todas las órdenes
    const getWorkOrders = async () => {
        try {
            const res = await getWorkOrdersRequest();
            setWorkOrders(res.data);
            return res.data;
        } catch (error) {
            console.error(error);
        }
    };
    
    // 3. Obtener Orden por ID
    const getWorkOrderById = async (id) => {
        try {
            const res = await getWorkOrderRequest(id);
            return res.data;
        } catch (error) {
            console.error(error);
        }
    };

    // 4. Actualizar Estado
    const updateWorkOrderStatus = async (id, updateData) => {
        try {
            const res = await updateWorkOrderStatusRequest(id, updateData);
            return res.data;
        } catch (error) {
            setErrors(error.response.data);
            throw error;
        }
    };

    // 5. Añadir Nota
    const addNoteToWorkOrder = async (id, noteData) => {
        try {
            const res = await addNoteToWorkOrderRequest(id, noteData);
            return res.data;
        } catch (error) {
            setErrors(error.response.data);
            throw error;
        }
    };

    // FUNCIONES PARA ADJUNTOS
    const uploadAttachment = async (orderId, file) => {
        try {
            const res = await uploadAttachmentRequest(orderId, file);
            return res.data;
        } catch (error) {
            setErrors(error.response?.data || error.message);
            throw error;
        }
    };

    const downloadAttachment = async (orderId, fileId) => {
        try {
            // Retorna la URL para abrir en una nueva pestaña
            const url = await downloadAttachmentRequest(orderId, fileId);
            window.open(url, '_blank');
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

   
    // Eliminar adjunto y devolver orden actualizada
    const deleteAttachment = async (orderId, fileId) => {
    try {
    const res = await deleteAttachmentRequest(orderId, fileId);
    
    // ACTUALIZAR ESTADO LOCAL: Obtener la orden actualizada
    const updatedOrder = await getWorkOrderById(orderId);
    
    // ACTUALIZAR EL ESTADO GLOBAL
    setWorkOrders(prev => 
      prev.map(order => 
        order._id === orderId ? updatedOrder : order
      )
    );
    
    return res.data;
  } catch (error) {
    setErrors(error.response?.data || error.message);
    throw error;
  }
};

    // --- FUNCIONES DE BÚSQUEDA ---

    /**
     * Busca un vehículo por placa.
     */
    const getVehicleByPlate = async (plate) => {
        try {
            const res = await getVehicleByPlateRequest(plate);
            return res.data;
        } catch (error) {
            throw error; 
        }
    };

    /**
     * Implementación de la función de búsqueda por identificación
     */
    const getClientByIdentification = async (identification) => {
        try {
            const res = await getClientByIdentificationRequest(identification);
            return res.data;
        } catch (error) {
            throw error; 
        }
    };

    // 6. Obtener Contador por Estado
    const getWorkOrderCounts = async () => {
        try {
            const res = await getWorkOrderCountsRequest();
            return res.data;
        } catch (error) {
            console.error(error);
        }
    };
    
    // 7. Obtener Órdenes por Estado
    const getWorkOrdersByStatus = async (status) => {
        try {
            const res = await getWorkOrdersByStatusRequest(status);
            return res.data;
        } catch (error) {
            console.error(error);
        }
    };

    // 8. Entrega orden completada al cliente
    const deliverWorkOrder = async (id, deliveryData) => {
        try {
            const res = await deliverWorkOrderRequest(id, deliveryData);
            return res.data;
        } catch (error) {
            setErrors(error.response.data);
            throw error;
        }
    };

    return (
        <WorkOrderContext.Provider
            value={{
                workOrders,
                createWorkOrder,
                getWorkOrders,
                getWorkOrderById,
                updateWorkOrderStatus,
                addNoteToWorkOrder,
                getWorkOrderCounts,
                getWorkOrdersByStatus,
                getVehicleByPlate,
                getClientByIdentification,
                uploadAttachment,
                downloadAttachment,
                deleteAttachment,
                deliverWorkOrder,
                
                errors
            }}
        >
            {children}
        </WorkOrderContext.Provider>
    );
}