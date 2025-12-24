// Página de listado por estado

import { useState, useEffect } from "react";
import { useWorkOrders } from "../context/WorkOrderContext";
import { useParams } from "react-router-dom";
import Select from "react-select";
import "../styles/WorkOrdersByStatusPage.css";

function WorkOrdersByStatusPage() {
  const { status } = useParams();
  const { workOrders, getWorkOrders, loading, error } = useWorkOrders();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchAssignee, setSearchAssignee] = useState(null); // Nuevo estado
  const [users, setUsers] = useState([]); // Usuarios para responsable

  useEffect(() => {
    getWorkOrders();
    
    // Cargar usuarios para responsable
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users', {
          credentials: 'include'
        });
        const userData = await response.json();
        setUsers(userData.map(u => ({ 
          value: u._id, 
          label: `${u.name} ${u.lastName}` 
        })));
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!workOrders.length) return;
    
    let filtered = workOrders.filter(order => order.status === status);
    
    // Filtrar por texto general (placa, cliente, solicitud)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.vehicle?.plate?.toLowerCase().includes(term) ||
          order.client?.name?.toLowerCase().includes(term) || 
          order.serviceRequest.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por responsable
    if (searchAssignee) {
      filtered = filtered.filter(order =>
        order.assignedTo?.some(user => user._id === searchAssignee.value)
      );
    }
    
    setFilteredOrders(filtered);
  }, [searchTerm, searchAssignee, workOrders, status]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSearchAssignee(null);
  };

  if (loading) return <div className="page">Cargando órdenes...</div>;
  if (error) return <div className="page error">Error: {error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{getStatusTitle(status)} ({filteredOrders.length})</h1>
        <button 
          onClick={() => window.history.back()}
          className="btn-secondary"
        >
          ← Volver
        </button>
      </div>

      {/* Formulario de búsqueda avanzada */}
      <div className="search-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder={`Buscar por placa, cliente o solicitud...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="advanced-search">
          <Select
            options={users}
            value={searchAssignee}
            onChange={setSearchAssignee}
            placeholder="Filtrar por responsable..."
            className="search-select"
            isClearable
          />
        </div>

        {searchAssignee && (
          <button 
            onClick={handleClearFilters}
            className="btn-secondary clear-filters"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Cliente</th>
              <th>Kilometraje</th>
              <th>Solicitud</th>
              <th>Responsable</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.vehicle?.plate}</td>
                  <td>
                    {order.client 
                      ? `${order.client.name} ${order.client.lastName}`
                      : "Cliente no asignado"}
                  </td>
                  <td>{order.currentMileage.toLocaleString()}</td>
                  <td>{order.serviceRequest}</td>
                  <td>
                    {order.assignedTo && order.assignedTo.length > 0
                      ? order.assignedTo.map(user => 
                          `${user.name} ${user.lastName}`
                        ).join(', ')
                      : "Sin asignar"}
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => window.location.href = `/ordenes/${order._id}`}
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No hay órdenes en este estado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const getStatusTitle = (status) => {
  const titles = {
    'por_asignar': 'Órdenes Por Asignar',
    'asignado': 'Órdenes Asignadas',
    'en_aprobacion': 'Órdenes En Aprobación',
    'por_repuestos': 'Órdenes Por Repuestos',
    'en_soporte': 'Órdenes En Soporte',
    'en_proceso': 'Órdenes En Proceso',
    'completado': 'Órdenes Completadas'
  };
  return titles[status] || 'Órdenes';
};

export default WorkOrdersByStatusPage;