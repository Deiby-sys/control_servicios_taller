// Página ordenes de trabajo

import { useState, useEffect } from "react";
import { useWorkOrders } from "../context/WorkOrderContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import { utils, writeFile } from 'xlsx'; // ✅ NUEVO: Librería para Excel
import "../styles/WorkOrdersPage.css";
import { getStatusLabel } from "../utils/statusLabels";
import { parseDateSafe } from '../utils/dateHelpers';

function WorkOrdersPage() {
  const { workOrders, getWorkOrders, loading, error } = useWorkOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatus, setSearchStatus] = useState(null);
  const [searchAssignee, setSearchAssignee] = useState(null);
  const [users, setUsers] = useState([]);

  const statusOptions = [
    { value: 'por_asignar', label: 'Jefe' },
    { value: 'asignado', label: 'Diagnóstico' },
    { value: 'en_aprobacion', label: 'Asesor' },
    { value: 'por_repuestos', label: 'Repuestos' },
    { value: 'en_soporte', label: 'Soporte Técnico' },
    { value: 'en_proceso', label: 'Proceso Técnico' },
    { value: 'baterias', label: 'Baterías' },
    { value: 'completado', label: 'Listo para Entrega' },
    { value: 'entregado', label: 'Entregado' }
  ];

  useEffect(() => {
    if (!workOrders.length) {
      setUsers([]);
      return;
    }
    const responsiblesMap = new Map();
    workOrders.forEach(order => {
      if (order.assignedTo && order.assignedTo.length > 0) {
        order.assignedTo.forEach(u => {
          if (u?._id && u?.name && u?.lastName) {
            if (!responsiblesMap.has(u._id)) {
              responsiblesMap.set(u._id, { value: u._id, label: `${u.name} ${u.lastName}` });
            }
          }
        });
      }
    });
    const responsiblesList = Array.from(responsiblesMap.values()).sort((a, b) => a.label.localeCompare(b.label));
    setUsers(responsiblesList);
  }, [workOrders]);
   
  useEffect(() => {
    if (!workOrders.length) return;
    let filtered = workOrders;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.vehicle?.plate?.toLowerCase().includes(term) ||
        order.client?.name?.toLowerCase().includes(term) ||
        order.serviceRequest.toLowerCase().includes(term)
      );
    }
    if (searchStatus) {
      filtered = filtered.filter(order => order.status === searchStatus.value);
    }
    if (searchAssignee) {
      filtered = filtered.filter(order =>
        order.assignedTo?.some(u => u._id === searchAssignee.value)
      );
    }
    setFilteredOrders(filtered);
  }, [searchTerm, searchStatus, searchAssignee, workOrders]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSearchStatus(null);
    setSearchAssignee(null);
  };

  // ✅ NUEVO: Función para exportar a Excel
  const exportToExcel = () => {
    if (filteredOrders.length === 0) {
      alert("No hay datos para exportar con los filtros actuales");
      return;
    }

    const dataToExport = filteredOrders.map(order => {
      const orderStatus = (order.status || '').toLowerCase();
      let diasEnTaller = 0;
      
      try {
        const entryDate = parseDateSafe(order.entryDate);
        if (orderStatus === 'entregado' && order.deliveryDate) {
          const deliveryDate = parseDateSafe(order.deliveryDate);
          if (!isNaN(entryDate.getTime()) && !isNaN(deliveryDate.getTime())) {
            diasEnTaller = Math.ceil((deliveryDate - entryDate) / (1000 * 60 * 60 * 24));
          }
        } else {
          const today = new Date();
          if (!isNaN(entryDate.getTime())) {
            diasEnTaller = Math.ceil((today - entryDate) / (1000 * 60 * 60 * 24));
          }
        }
      } catch (e) {
        diasEnTaller = 0;
      }

      return {
        'Fecha Ingreso': parseDateSafe(order.entryDate).toLocaleDateString('es-CO'),
        'Placa': order.vehicle?.plate || '',
        'Cliente': order.client ? `${order.client.name} ${order.client.lastName}` : 'No asignado',
        'Kilometraje': order.currentMileage ? order.currentMileage.toLocaleString() : '0',
        'Solicitud': order.serviceRequest || '',
        'Estado': getStatusLabel(order.status),
        'Responsable': order.assignedTo && order.assignedTo.length > 0 
          ? order.assignedTo.map(u => `${u.name} ${u.lastName}`).join(', ') 
          : 'Sin asignar',
        'Días en Taller': diasEnTaller
      };
    });

    const worksheet = utils.json_to_sheet(dataToExport);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Órdenes de Trabajo");
    
    // Nombre del archivo con la fecha de hoy
    const fileName = `ordenes_trabajo_${new Date().toISOString().split('T')[0]}.xlsx`;
    writeFile(workbook, fileName);
  };

  if (loading) return <div className="page">Cargando órdenes...</div>;
  if (error) return <div className="page error">Error: {error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Órdenes de Trabajo</h1>
        
        {/* ✅ Contenedor de acciones para admin, asesor y jefe */}
        {(user?.profile === 'admin' || user?.profile === 'asesor' || user?.profile === 'jefe') && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={exportToExcel} 
              className="btn-primary" /* ← Cambiado a btn-primary para el fondo azul */
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                fontSize: '0.9rem', /* ← Texto un poco más pequeño */
                padding: '0.6rem 1.2rem' /* ← Un poco más compacto */
              }}
            >
              📊 Exportar a Excel
            </button>
            <Link to="/ordenes/new" className="btn-primary">
              + Nueva Orden
            </Link>
          </div>
        )}
      </div>

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
            noOptionsMessage={() => "No hay responsables disponibles"}
          />
        </div>

        {(searchStatus || searchAssignee) && (
          <button onClick={handleClearFilters} className="btn-secondary clear-filters">
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
              <th>Fecha Ingreso</th>
              <th>Días en Taller</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
                const orderStatus = (order.status || '').toLowerCase();
                let diasEnTaller = 0;
                
                try {
                  const entryDate = parseDateSafe(order.entryDate);
                  if (orderStatus === 'entregado' && order.deliveryDate) {
                    const deliveryDate = parseDateSafe(order.deliveryDate);
                    if (!isNaN(entryDate.getTime()) && !isNaN(deliveryDate.getTime())) {
                      diasEnTaller = Math.ceil((deliveryDate - entryDate) / (1000 * 60 * 60 * 24));
                    }
                  } else {
                    const today = new Date();
                    if (!isNaN(entryDate.getTime())) {
                      diasEnTaller = Math.ceil((today - entryDate) / (1000 * 60 * 60 * 24));
                    }
                  }
                } catch (e) {
                  console.error("Error calculando días en taller:", e);
                  diasEnTaller = 0;
                }

                return (
                  <tr key={order._id}>
                    <td>{order.vehicle?.plate}</td>
                    <td>{order.client ? `${order.client.name} ${order.client.lastName}` : "Cliente no asignado"}</td>
                    <td>{order.currentMileage?.toLocaleString() || '0'}</td>
                    <td>{order.serviceRequest}</td>
                    <td>
                      <span className={`status status-${order.status.replace(/_/g, '-')}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td>
                      {order.assignedTo && order.assignedTo.length > 0
                        ? order.assignedTo.map(u => `${u.name} ${u.lastName}`).join(', ')
                        : "Sin asignar"}
                    </td>
                    <td>{parseDateSafe(order.createdAt).toLocaleDateString('es-CO')}</td>
                    <td>{diasEnTaller}</td>
                    <td>
                      <Link to={`/ordenes/${order._id}`} className="btn-view">
                        Ver Detalle
                      </Link>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
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