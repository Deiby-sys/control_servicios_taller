// Página ordenes de trabajo

import { useState, useEffect } from "react";
import { useWorkOrders } from "../context/WorkOrderContext";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import "../styles/WorkOrdersPage.css";

function WorkOrdersPage() {
  const { workOrders, getWorkOrders, loading, error } = useWorkOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
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
    { value: 'completado', label: 'Completado' },
    { value: 'entregado', label: 'Entregado' }
  ];


  // Genera la lista de responsables desde las órdenes
  useEffect(() => {
    if (!workOrders.length) {
      setUsers([]);
      return;
    }

    const responsiblesMap = new Map();

     workOrders.forEach(order => {
      if (order.assignedTo && order.assignedTo.length > 0) {
        order.assignedTo.forEach(user => {
          // Validación segura
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

    // Ordenar alfabéticamente
    const responsiblesList = Array.from(responsiblesMap.values())
      .sort((a, b) => a.label.localeCompare(b.label));

    setUsers(responsiblesList);
  }, [workOrders]);
   
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
        
        {/* SOLO admin, asesor y jefe ven "+ Nueva Orden" */}
        {(user?.profile === 'admin' || user?.profile === 'asesor' || user?.profile === 'jefe') && (
          <Link to="/ordenes/new" className="btn-primary">
            + Nueva Orden
          </Link>
        )}
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
          
          {/* Filtro por responsable con datos cargados */}
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
              <th>Fecha Ingreso</th>
              <th>Días en Taller</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => {
              // Calcula días en  taller
              const orderStatus = (order.status || '').toLowerCase();
              
              let diasEnTaller = 0;
              
              try {
                const entryDate = new Date(order.entryDate);
                
                if (orderStatus === 'entregado' && order.deliveryDate) {
                  const deliveryDate = new Date(order.deliveryDate);
                  // Asegura que las fechas sean válidas
                  if (!isNaN(entryDate) && !isNaN(deliveryDate)) {
                    diasEnTaller = Math.ceil((deliveryDate - entryDate) / (1000 * 60 * 60 * 24));
                  }
                } else {
                  diasEnTaller = Math.ceil((new Date() - entryDate) / (1000 * 60 * 60 * 24));
                }
              } catch (e) {
                console.error("Error calculando días en taller:", e);
                diasEnTaller = 0;
              }

                  return (
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
                         order.status === 'entregado' ? 'Entregado' :
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
                    <td>{diasEnTaller}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
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