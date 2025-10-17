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
            setErrors(null); // Limpia errores previos
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

    // Función para CREAR un nuevo cliente
    const createClient = async (clientData) => {
        try {
            const res = await createClientRequest(clientData);
            // Si el backend devuelve el cliente creado, lo añadimos al estado local
            setClients([...clients, res.data]); 
        } catch (error) {
            console.error(error);
            // Captura y expone los errores de validación de Mongoose
            setErrors(error.response?.data?.message || "Error al crear cliente");
        }
    };

    // Función para ELIMINAR un cliente
    const deleteClient = async (id) => {
        try {
            await deleteClientRequest(id);
            // Actualizamos el estado filtrando el cliente eliminado
            setClients(clients.filter(client => client._id !== id));
        } catch (error) {
            console.error(error);
            setErrors(error.response?.data?.message || "Error al eliminar cliente");
        }
    };
    
    // Función para ACTUALIZAR un cliente (la implementación en el componente puede variar)
    const updateClient = async (id, clientData) => {
        try {
            const res = await updateClientRequest(id, clientData);
            // Actualizar el estado local
             setClients(clients.map(client => 
            client._id === id ? { ...client, ...res.data } : client
             ));
            setErrors(null);
         } catch (error) {
            console.error(error);
            const errorMessage = 
            error.response?.data?.message || 
            error.response?.data?.errors?.[0] ||
            error.message || 
            "Error al actualizar cliente";
            setErrors(errorMessage);
            throw error; // Para que el componente pueda manejar el error
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
                // Puedes agregar getClient si lo necesitas para la edición
            }}
        >
            {children}
        </ClientContext.Provider>
    );
}