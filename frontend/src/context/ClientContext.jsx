// Para gestionar la lista de clientes, los estados de carga y los errores en toda la aplicación, es ideal usar el Context API de React

import { createContext, useContext, useState } from 'react';
import { 
    getClientsRequest, 
    createClientRequest, 
    deleteClientRequest, 
    updateClientRequest 
} from '../api/client.api';

// 1. Crear el Contexto
export const ClientContext = createContext();

// Hook personalizado para usar el contexto fácilmente
export const useClients = () => {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error("useClients debe usarse dentro de un ClientProvider");
    }
    return context;
};

// 2. Crear el Proveedor (Provider)
export function ClientProvider({ children }) {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState(null);

    // Función para LISTAR todos los clientes
    const getClients = async () => {
        setLoading(true);
        try {
            const res = await getClientsRequest();
            setClients(res.data);
            setErrors(null);
        } catch (error) {
          console.error("Error al cargar clientes:", error);
          const errorMessage = 
            error.response?.data?.message || 
            error.response?.data?.errors?.[0] ||
            error.message || 
            "Error al cargar clientes";
         setErrors(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Función para CREAR un nuevo cliente ✅ CORREGIDA
    const createClient = async (clientData) => {
        try {
            const res = await createClientRequest(clientData);
            const newClient = res.data;
            setClients([...clients, newClient]);
            setErrors(null);
            return newClient; // 👈 DEVUELVE EL CLIENTE CREADO
        } catch (error) {
            console.error("Error al crear cliente:", error);
            const errorMessage = 
              error.response?.data?.message || 
              error.response?.data?.errors?.[0] ||
              error.message || 
              "Error al crear cliente";
            setErrors(errorMessage);
            throw new Error(errorMessage); // 👈 LANZA EL ERROR PARA QUE EL COMPONENTE LO MANEJE
        }
    };

    // Función para ELIMINAR un cliente
    const deleteClient = async (id) => {
        try {
            await deleteClientRequest(id);
            setClients(clients.filter(client => client._id !== id));
            setErrors(null);
        } catch (error) {
            console.error("Error al eliminar cliente:", error);
            const errorMessage = 
              error.response?.data?.message || 
              error.response?.data?.errors?.[0] ||
              error.message || 
              "Error al eliminar cliente";
            setErrors(errorMessage);
            throw new Error(errorMessage); // También lanza error para manejo externo
        }
    };
    
    // Función para ACTUALIZAR un cliente
    const updateClient = async (id, clientData) => {
        try {
            const res = await updateClientRequest(id, clientData);
            setClients(clients.map(client => 
              client._id === id ? { ...client, ...res.data } : client
            ));
            setErrors(null);
            return res.data; // También devuelve el cliente actualizado
        } catch (error) {
            console.error("Error al actualizar cliente:", error);
            const errorMessage = 
              error.response?.data?.message || 
              error.response?.data?.errors?.[0] ||
              error.message || 
              "Error al actualizar cliente";
            setErrors(errorMessage);
            throw new Error(errorMessage);
        }
    };

    return (
        <ClientContext.Provider
            value={{
                clients,
                loading,
                errors,
                getClients,
                createClient,
                deleteClient,
                updateClient,
            }}
        >
            {children}
        </ClientContext.Provider>
    );
}