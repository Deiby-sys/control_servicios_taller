// Página de listado por estado

import { useState, useEffect } from "react";
import { useWorkOrders } from "../context/WorkOrderContext";
import { useParams } from "react-router-dom";
import "../styles/WorkOrdersByStatusPage.css";

function WorkOrdersByStatusPage() {
  const { status } = useParams();
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
        order.status === status &&
        (order.vehicle?.plate?.toLowerCase().includes(term) ||
         order.client?.name?.toLowerCase().includes(term) || 
         order.serviceRequest.toLowerCase().includes(term))
    );
    setFilteredOrders(filtered);
  }, [searchTerm, workOrders, status]);

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

      <div className="search-bar">
        <input
          type="text"
          placeholder={`Buscar por placa, cliente o solicitud...`}
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
                    {order.client // ✅ Corregido
                      ? `${order.client.name} ${order.client.lastName}`
                      : "Cliente no asignado"}
                  </td>
                  <td>{order.currentMileage.toLocaleString()}</td>
                  <td>{order.serviceRequest}</td>
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
                <td colSpan="6" className="no-data">
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