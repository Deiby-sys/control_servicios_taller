// Historial órdenes de trabajo

import { useState, useEffect } from "react";
import axios from "axios";
import { useWorkOrders } from "../context/WorkOrderContext";
import Select from "react-select";
import { Link } from "react-router-dom";
import { utils, writeFile } from 'xlsx';
import "../styles/WorkOrderHistoryPage.css";

// Función de URL Base
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.trim();
  return import.meta.env.MODE === 'production'
    ? 'https://control-servicios-taller.onrender.com'
    : 'http://localhost:4000';
};

const API_URL = getApiBaseUrl() + '/api';

function WorkOrderHistoryPage() {
  const { workOrders, getWorkOrders, loading, error } = useWorkOrders();
  const [historial, setHistorial] = useState([]);
  const [filteredHistorial, setFilteredHistorial] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchAssignee, setSearchAssignee] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        await getWorkOrders();
        const deliveredOrders = workOrders.filter(order => order.status === 'entregado');
        setHistorial(deliveredOrders);
        setFilteredHistorial(deliveredOrders);
      } catch (error) {
        console.error("Error al cargar historial:", error);
      }
    };

    // Función fetchUsers Corregida
    const fetchUsers = async () => {
      try {
        // ✅ ASEGÚRATE DE QUE DIGA "/users/public" AL FINAL
        const response = await axios.get(`${API_URL}/users/public`, {
          withCredentials: true
        });
        
        const userData = response.data;
        
        if (!Array.isArray(userData)) {
          throw new Error("La respuesta no es un array");
        }

        setUsers(userData.map(u => ({ 
          value: u._id, 
          label: `${u.name} ${u.lastName}` 
        })));
      } catch (error) {
        console.error("Error al cargar usuarios (Status:", error.response?.status, "):", error.message);
        setUsers([]); 
      }
    };

    fetchHistorial();
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = historial;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
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
    
    setFilteredHistorial(filtered);
  }, [searchTerm, searchAssignee, historial]);

  const exportToExcel = () => {
    if (filteredHistorial.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const dataToExport = filteredHistorial.map(order => {
      const diasEnTaller = order.deliveryDate && order.entryDate 
        ? Math.ceil((new Date(order.deliveryDate) - new Date(order.entryDate)) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        'Fecha Ingreso': new Date(order.entryDate).toLocaleDateString('es-CO'),
        'Placa': order.vehicle?.plate || '',
        'Cliente': order.client ? `${order.client.name} ${order.client.lastName}` : '',
        'Solicitud': order.serviceRequest || '',
        'Responsable': order.assignedTo?.map(user => `${user.name} ${user.lastName}`).join(', ') || 'Sin asignar',
        'Fecha Entrega': order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('es-CO') : '',
        'Días en Taller': diasEnTaller
      };
    });

    const worksheet = utils.json_to_sheet(dataToExport);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Historial Órdenes");
    writeFile(workbook, "historial_ordenes.xlsx");
  };

  if (loading) return <div className="page">Cargando historial...</div>;
  if (error) return <div className="page error">Error: {error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Historial de Órdenes Entregadas</h1>
        <button className="btn-primary" onClick={exportToExcel}>
          📊 Exportar a Excel
        </button>
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
            options={users}
            value={searchAssignee}
            onChange={setSearchAssignee}
            placeholder="Filtrar por responsable..."
            className="search-select"
            isClearable
            noOptionsMessage={() => "No hay usuarios"}
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha Ingreso</th>
              <th>Placa</th>
              <th>Cliente</th>
              <th>Solicitud</th>
              <th>Responsable</th>
              <th>Fecha Entrega</th>
              <th>Días en Taller</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistorial.length > 0 ? (
              filteredHistorial.map((order) => {
                const diasEnTaller = order.deliveryDate && order.entryDate 
                  ? Math.ceil((new Date(order.deliveryDate) - new Date(order.entryDate)) / (1000 * 60 * 60 * 24))
                  : 0;

                return (
                  <tr key={order._id}>
                    <td>{new Date(order.entryDate).toLocaleDateString('es-CO')}</td>
                    <td>{order.vehicle?.plate}</td>
                    <td>{order.client?.name} {order.client?.lastName}</td>
                    <td>{order.serviceRequest}</td>
                    <td>
                      {order.assignedTo && order.assignedTo.length > 0
                        ? order.assignedTo.map(user => `${user.name} ${user.lastName}`).join(', ')
                        : "Sin asignar"}
                    </td>
                    <td>{order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('es-CO') : 'N/A'}</td>
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
                <td colSpan="8" className="no-data">
                  No hay órdenes entregadas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default WorkOrderHistoryPage;