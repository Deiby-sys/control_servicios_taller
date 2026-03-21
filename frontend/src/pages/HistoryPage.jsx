// Página historial órdenes de trabajo

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useExportToExcel } from "../hooks/useExportToExcel";
import "../styles/HistoryPage.css";

function HistoryPage() {
  const [workOrders, setWorkOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { exportToExcel } = useExportToExcel();

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!workOrders.length) return;
    const term = searchTerm.toLowerCase();
    const filtered = workOrders.filter(
      (order) =>
        order.vehicle?.plate?.toLowerCase().includes(term) ||
        order.vehicle?.vin?.toLowerCase().includes(term) ||
        order.client?.name?.toLowerCase().includes(term) ||
        order.client?.lastName?.toLowerCase().includes(term) ||
        order.client?.identificationNumber?.toLowerCase().includes(term)
    );
    setFilteredOrders(filtered);
  }, [searchTerm, workOrders]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/work-orders/historial', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Error al cargar historial');
      
      const data = await response.json();
      setWorkOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByPlate = async () => {
    if (!searchTerm.trim()) {
      setFilteredOrders(workOrders);
      return;
    }

    try {
      const response = await fetch(`/api/work-orders/historial/plate/${searchTerm}`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Vehículo no encontrado');
      
      const data = await response.json();
      setFilteredOrders(data);
    } catch (error) {
      console.error("Error al buscar por placa:", error);
      setFilteredOrders([]); // Mostrar vacío si no se encuentra
    }
  };

  // 👇 Función para exportar el historial
  const handleExportHistory = () => {
    if (filteredOrders.length === 0) return;
    
    // Formatear los datos para Excel
    const exportData = filteredOrders.map(order => ({
      'N° Orden': order.orderNumber,
      'Placa': order.vehicle?.plate || '',
      'VIN': order.vehicle?.vin || '',
      'Marca': order.vehicle?.brand || '',
      'Línea': order.vehicle?.line || '',
      'Modelo': order.vehicle?.model || '',
      'Color': order.vehicle?.color || '',
      'Cliente': order.client?.name ? `${order.client.name} ${order.client.lastName}` : '',
      'Documento': order.client?.identificationNumber || '',
      'Teléfono': order.client?.phone || '',
      'Email': order.client?.email || '',
      'Ciudad': order.client?.city || '',
      'Estado': getStatusLabel(order.status),
      'Fecha Ingreso': new Date(order.entryDate).toLocaleDateString('es-CO'),
      'Kilometraje': order.currentMileage ? `${order.currentMileage.toLocaleString()} km` : '',
      'Solicitud': order.serviceRequest || '',
      'Creado por': order.createdBy?.name ? `${order.createdBy.name} ${order.createdBy.lastName}` : '',
      'Responsables': order.assignedTo?.map(r => `${r.name} ${r.lastName}`).join(', ') || '',
      'Notas': order.notes?.length || 0,
      'Firma Cliente': order.clientSignature ? 'Sí' : 'No',
      'Fecha Creación': new Date(order.createdAt).toLocaleDateString('es-CO')
    }));
    
    const filename = searchTerm 
      ? `historial_${searchTerm.replace(/\s+/g, '_')}`
      : 'historial_completo';
    
    exportToExcel(exportData, filename, 'Historial Órdenes');
  };

  const getStatusColor = (status) => {
    const colors = {
      'por_asignar': '#6c757d',
      'asignado': '#0d6efd',
      'en_aprobacion': '#ffc107',
      'por_repuestos': '#fd7e14',
      'en_soporte': '#20c997',
      'completado': '#198754',
      'entregado': '#28a745'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'por_asignar': 'Jefe',
      'asignado': 'Diagnóstico',
      'en_aprobacion': 'Asesor',
      'por_repuestos': 'Repuestos',
      'en_soporte': 'Soporte Técnico',
      'completado': 'Listo para Entrega',
      'entregado': 'Entregado'
    };
    return labels[status] || status;
  };

  if (loading) return <div className="page">Cargando historial...</div>;
  if (error) return <div className="page error">Error: {error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Historial de Órdenes de Trabajo</h1>
        <div className="header-actions">
          <button 
            onClick={handleExportHistory}
            className="btn-export"
            disabled={filteredOrders.length === 0}
          >
            📊 Exportar a Excel
          </button>
          <button 
            onClick={() => navigate('/ordenes')}
            className="btn-secondary"
          >
            ← Volver a Órdenes
          </button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por placa, VIN, documento o nombre del cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button 
          onClick={handleSearchByPlate}
          className="btn-search"
        >
          Buscar por Placa
        </button>
      </div>

      {/* Tabla de historial */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Placa</th>
              <th>Cliente</th>
              <th>Documento</th>
              <th>Estado</th>
              <th>Fecha Ingreso</th>
              <th>Kilometraje</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.vehicle?.plate}</td>
                  <td>
                    {order.client?.name} {order.client?.lastName}
                  </td>
                  <td>{order.client?.identificationNumber}</td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td>{new Date(order.entryDate).toLocaleDateString()}</td>
                  <td>{order.currentMileage.toLocaleString()} km</td>
                  <td>
                    <button
                      className="btn-view"
                      onClick={() => navigate(`/ordenes/${order._id}`)}
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  {searchTerm 
                    ? "No se encontraron órdenes con esos criterios" 
                    : "No hay órdenes en el historial"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HistoryPage;