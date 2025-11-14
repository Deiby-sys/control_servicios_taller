// Página ordenes de trabajo

import { useState, useEffect } from "react";
import { useWorkOrders } from "../context/WorkOrderContext";
import { Link } from "react-router-dom";
import Select from "react-select";
import "../styles/WorkOrdersPage.css";

function WorkOrdersPage() {
  const { workOrders, getWorkOrders, loading, error } = useWorkOrders();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatus, setSearchStatus] = useState(null);
  const [searchAssignee, setSearchAssignee] = useState(null);
  const [users, setUsers] = useState([]); 

  // Opciones de estado
  const statusOptions = [
    { value: 'por_asignar', label: 'Por Asignar' },
    { value: 'asignado', label: 'Asignado' },
    { value: 'en_aprobacion', label: 'En Aprobación' },
    { value: 'por_repuestos', label: 'Por Repuestos' },
    { value: 'en_soporte', label: 'En Soporte' },
    { value: 'en_proceso', label: 'En Proceso' },
    { value: 'completado', label: 'Completado' }
  ];

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
    
    let filtered = workOrders;
    
    // Filtrar por texto general (placa, cliente, solicitud)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.vehicle?.plate?.toLowerCase().includes(term) ||
        order.client?.name?.toLowerCase().includes(term) ||
        order.serviceRequest.toLowerCase().includes(term)
      );
    }
    
    // Filtrar por estado
    if (searchStatus) {
      filtered = filtered.filter(order => order.status === searchStatus.value);
    }
    
    // Filtrar por responsable
    if (searchAssignee) {
      filtered = filtered.filter(order =>
        order.assignedTo?.some(user => user._id === searchAssignee.value)
      );
    }
    
    setFilteredOrders(filtered);
  }, [searchTerm, searchStatus, searchAssignee, workOrders]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSearchStatus(null);
    setSearchAssignee(null);
  };

  if (loading) return <div className="page">Cargando órdenes...</div>;
  if (error) return <div className="page error">Error: {error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Órdenes de Trabajo</h1>
        <Link to="/ordenes/new" className="btn-primary">
          + Nueva Orden
        </Link>
      </div>

      {/* Formulario de búsqueda avanzada */}
      <div className="search-container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por placa, cliente o solicitud..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="advanced-search">
          <Select
            options={statusOptions}
            value={searchStatus}
            onChange={setSearchStatus}
            placeholder="Filtrar por estado..."
            className="search-select"
            isClearable
          />
          
          <Select
            options={users}
            value={searchAssignee}
            onChange={setSearchAssignee}
            placeholder="Filtrar por responsable..."
            className="search-select"
            isClearable
          />
        </div>

        {(searchStatus || searchAssignee) && (
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
              <th>Estado</th>
              <th>Responsable</th>
              <th>Fecha</th>
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
                    <span className={`status status-${order.status.replace(/_/g, '-')}`}>
                      {order.status === 'por_asignar' ? 'Por Asignar' :
                       order.status === 'asignado' ? 'Asignado' :
                       order.status === 'en_aprobacion' ? 'En Aprobación' :
                       order.status === 'por_repuestos' ? 'Por Repuestos' :
                       order.status === 'en_soporte' ? 'En Soporte' :
                       order.status === 'en_proceso' ? 'En Proceso' :
                       order.status === 'completado' ? 'Completado' :
                       'Estado Desconocido'}
                    </span>
                  </td>
                  <td>
                    {order.assignedTo && order.assignedTo.length > 0
                      ? order.assignedTo.map(user => 
                          `${user.name} ${user.lastName}`
                        ).join(', ')
                      : "Sin asignar"}
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  No se encontraron órdenes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WorkOrdersPage;