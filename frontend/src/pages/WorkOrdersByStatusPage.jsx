// Página de listado por estado

// WorkOrdersByStatusPage.jsx - CORREGIDO

import { useState, useEffect } from "react";
import { useWorkOrders } from "../context/WorkOrderContext";
import { useParams } from "react-router-dom";
import Select from "react-select";
import "../styles/WorkOrdersByStatusPage.css";
import { getStatusLabel } from "../utils/statusLabels";

function WorkOrdersByStatusPage() {
  const { status } = useParams();
  const { workOrders, getWorkOrders, loading, error } = useWorkOrders();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchAssignee, setSearchAssignee] = useState(null);
  
  // ✅ CAMBIO: Ahora se llena desde workOrders, no desde API directa
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getWorkOrders();
  }, []);

  // ✅ NUEVO useEffect: Extraer responsables desde workOrders (igual que WorkOrdersPage)
  useEffect(() => {
    if (!workOrders.length) {
      setUsers([]);
      return;
    }

    const responsiblesMap = new Map();

    workOrders.forEach(order => {
      if (order.assignedTo && order.assignedTo.length > 0) {
        order.assignedTo.forEach(user => {
          if (user?._id && user?.name && user?.lastName) {
            if (!responsiblesMap.has(user._id)) {
              responsiblesMap.set(user._id, {
                value: user._id,
                label: `${user.name} ${user.lastName}`
              });
            }
          }
        });
      }
    });

    const responsiblesList = Array.from(responsiblesMap.values())
      .sort((a, b) => a.label.localeCompare(b.label));

    console.log('👥 Responsibles cargados:', responsiblesList); // Debug
    setUsers(responsiblesList);
  }, [workOrders]); // ← Dependencia clave

  useEffect(() => {
    if (!workOrders.length) return;
    
    let filtered = workOrders.filter(order => order.status === status);
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.vehicle?.plate?.toLowerCase().includes(term) ||
          order.client?.name?.toLowerCase().includes(term) || 
          order.serviceRequest.toLowerCase().includes(term)
      );
    }
    
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
        <h1>Órdenes - {getStatusLabel(status)} ({filteredOrders.length})</h1>
        <button 
          onClick={() => window.history.back()}
          className="btn-secondary"
        >
          ← Volver
        </button>
      </div>

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
            options={users}  // ← Ahora viene de workOrders, no de API directa
            value={searchAssignee}
            onChange={setSearchAssignee}
            placeholder="Filtrar por responsable..."
            className="search-select"
            isClearable
            noOptionsMessage={() => 
              users.length === 0 ? "Cargando..." : "No hay responsables"
            }
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


export default WorkOrdersByStatusPage;