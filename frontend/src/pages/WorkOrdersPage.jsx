// Página ordenes de trabajo

import { useState, useEffect } from "react";
import { useWorkOrders } from "../context/WorkOrderContext";
import { Link } from "react-router-dom";
import "../styles/WorkOrdersPage.css";

function WorkOrdersPage() {
  const { workOrders, getWorkOrders, loading, error } = useWorkOrders();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getWorkOrders();
  }, []);

  useEffect(() => {
    if (!workOrders.length) return;
    const term = searchTerm.toLowerCase();
    const filtered = workOrders.filter(
      (order) =>
        order.vehicle?.plate?.toLowerCase().includes(term) ||
        order.client?.name?.toLowerCase().includes(term) || 
        order.serviceRequest.toLowerCase().includes(term)
    );
    setFilteredOrders(filtered);
  }, [searchTerm, workOrders]);

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

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por placa, cliente o solicitud..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
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
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
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