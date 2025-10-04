// Página de clientes

import { useEffect } from 'react';
import { useClients } from '../context/ClientContext'; // Nuestro hook personalizado
import { Link } from 'react-router-dom';

function ClientsPage() {
    // Obtenemos los datos y funciones del contexto
    const { clients, getClients, loading, deleteClient } = useClients();

    // Cuando el componente se carga, pedimos la lista de clientes al backend
    useEffect(() => {
        getClients();
    }, []); // El array vacío asegura que solo se ejecute al montar

    if (loading) return <p className='text-xl text-center mt-8'>Cargando clientes...</p>;

    if (clients.length === 0 && !loading) {
        return (
            <div className='flex flex-col items-center justify-center h-full'>
                <h2 className='text-2xl font-bold mb-4'>Aún no hay clientes registrados.</h2>
                <Link to="/clients/new" className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
                    Crear Nuevo Cliente
                </Link>
            </div>
        );
    }
    
    // Función para manejar la eliminación
    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
            deleteClient(id);
        }
    };

    return (
        <div className='p-6'>
            <header className='flex justify-between items-center mb-6'>
                <h1 className='text-3xl font-bold'>Gestión de Clientes ({clients.length})</h1>
                <Link to="/clients/new" className='bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded'>
                    + Nuevo Cliente
                </Link>
            </header>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full leading-normal">
                    <thead>
                        <tr className='bg-gray-100'>
                            <th className='px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                Nombre Completo
                            </th>
                            <th className='px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                ID / Teléfono
                            </th>
                            <th className='px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                Ciudad
                            </th>
                            <th className='px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client._id} className='hover:bg-gray-50'>
                                <td className='px-5 py-5 border-b border-gray-200 text-sm'>
                                    {client.name} {client.lastName}
                                </td>
                                <td className='px-5 py-5 border-b border-gray-200 text-sm'>
                                    {client.identificationNumber} <br/> {client.phone}
                                </td>
                                <td className='px-5 py-5 border-b border-gray-200 text-sm'>
                                    {client.city}
                                </td>
                                <td className='px-5 py-5 border-b border-gray-200 text-sm flex gap-2'>
                                    <Link 
                                        to={`/clients/${client._id}`} 
                                        className='text-indigo-600 hover:text-indigo-900 font-semibold'
                                    >
                                        Editar
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(client._id)} 
                                        className='text-red-600 hover:text-red-900 font-semibold'
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ClientsPage;