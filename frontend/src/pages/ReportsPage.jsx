// Página para informes
// src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { getReportsSummary } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import '../styles/ReportsPage.css';

const ReportsPage = () => {
  const [reports, setReports] = useState({
    today: { ingresos: 0, completados: 0, entregados: 0, period: { from: '', to: '' } },
    last7Days: { ingresos: 0, completados: 0, entregados: 0, period: { from: '', to: '' } },
    last30Days: { ingresos: 0, completados: 0, entregados: 0, period: { from: '', to: '' } }
  });
  
  const [vehiclesByLine, setVehiclesByLine] = useState([]);
  const [vehiclesByClient, setVehiclesByClient] = useState([]);
  const [totalInWorkshop, setTotalInWorkshop] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Usamos una sola variable para controlar la pestaña activa
  const [activeReport, setActiveReport] = useState("today");
  const { user } = useAuth();

  useEffect(() => {
    fetchReports();
    if (activeReport === "byLine") fetchVehiclesByLine();
    if (activeReport === "byClient") fetchVehiclesByClient();
  }, [activeReport]);

  const fetchReports = async () => {
    try {
      const response = await getReportsSummary();
      setReports(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar informes:', error);
      setLoading(false);
    }
  };

  const fetchWorkshopData = async () => {
    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL || 
      (window.location.hostname === 'localhost' ? 'http://localhost:10000' : 'https://control-servicios-taller.onrender.com');
    
    const [ordersRes, vehiclesRes, clientsRes] = await Promise.all([
      fetch(`${API_URL}/api/work-orders`, { credentials: 'include', headers: { 'Content-Type': 'application/json' } }),
      fetch(`${API_URL}/api/vehicles`, { credentials: 'include', headers: { 'Content-Type': 'application/json' } }).catch(() => ({ ok: false })),
      fetch(`${API_URL}/api/clients`, { credentials: 'include', headers: { 'Content-Type': 'application/json' } }).catch(() => ({ ok: false }))
    ]);

    const orders = await ordersRes.json();
    
    let vehiclesMap = {}, clientsMap = {};
    if (vehiclesRes.ok) {
      const vehicles = await vehiclesRes.json();
      vehiclesMap = vehicles.reduce((acc, v) => { acc[v._id] = v; return acc; }, {});
    }
    if (clientsRes.ok) {
      const clients = await clientsRes.json();
      clientsMap = clients.reduce((acc, c) => { acc[c._id] = `${c.name} ${c.lastName}`; return acc; }, {});
    }

    // ✅ AGREGADO: 'baterias' a los estados del taller
    const workshopStates = ['por_asignar', 'asignado', 'en_aprobacion', 'por_repuestos', 'en_soporte', 'en_proceso', 'baterias', 'completado'];
    const workshopOrders = orders.filter(order => workshopStates.includes(order.status));
    
    setTotalInWorkshop(workshopOrders.length);

    // Agrupar por Línea
    const lineCount = {};
    workshopOrders.forEach(order => {
      let line = 'Sin Línea';
      if (order.vehicle && typeof order.vehicle === 'object') line = order.vehicle.line || order.vehicle.model || 'Sin Línea';
      else if (typeof order.vehicle === 'string' && vehiclesMap[order.vehicle]) line = vehiclesMap[order.vehicle].line || vehiclesMap[order.vehicle].model || 'Sin Línea';
      lineCount[line] = (lineCount[line] || 0) + 1;
    });

    // Agrupar por Cliente
    const clientCount = {};
    workshopOrders.forEach(order => {
      let clientName = 'Cliente desconocido';
      if (order.client && typeof order.client === 'object') clientName = `${order.client.name} ${order.client.lastName}`;
      else if (typeof order.client === 'string' && clientsMap[order.client]) clientName = clientsMap[order.client];
      clientCount[clientName] = (clientCount[clientName] || 0) + 1;
    });

    const sortedLines = Object.entries(lineCount).map(([line, count]) => ({ line, count })).sort((a, b) => b.count - a.count);
    const sortedClients = Object.entries(clientCount).map(([client, count]) => ({ client, count })).sort((a, b) => b.count - a.count);

    setVehiclesByLine(sortedLines);
    setVehiclesByClient(sortedClients);
    setLoading(false);
  };

  // Alias para mantener compatibilidad con los useEffect
  const fetchVehiclesByLine = fetchWorkshopData;
  const fetchVehiclesByClient = fetchWorkshopData;

  const renderReportBlock = (data, periodLabel) => {
    const maxValue = Math.max(data.ingresos, data.completados, data.entregados, 1);
    return (
      <div className="reports-block">
        <p className="reports-period">Periodo: {periodLabel}</p>
        <div className="reports-cards">
          <div className="report-card report-card--ingresos">
            <h3>Ingresos</h3>
            <div className="report-value">{data.ingresos}</div>
            <div className="report-bar-container">
              <div className="report-bar report-bar--ingresos" style={{ width: `${(data.ingresos / maxValue) * 100}%` }} />
            </div>
          </div>
          <div className="report-card report-card--completados">
            <h3>Completados</h3>
            <div className="report-value">{data.completados}</div>
            <div className="report-bar-container">
              <div className="report-bar report-bar--completados" style={{ width: `${(data.completados / maxValue) * 100}%` }} />
            </div>
          </div>
          <div className="report-card report-card--entregados">
            <h3>Entregados</h3>
            <div className="report-value">{data.entregados}</div>
            <div className="report-bar-container">
              <div className="report-bar report-bar--entregados" style={{ width: `${(data.entregados / maxValue) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ COMPONENTE REUTILIZABLE PARA GRÁFICAS HORIZONTALES
  const renderHorizontalChart = (data, labelKey, title) => {
    if (loading) return <div className="reports-loading">Cargando reporte...</div>;
    if (data.length === 0) {
      return (
        <div className="no-data">
          <p>No hay vehículos en taller actualmente</p>
        </div>
      );
    }

    const maxCount = Math.max(...data.map(v => v.count), 1);
    return (
      <div className="vehicles-chart-container">
        <div className="chart-header">
          <h3>📊 {title}</h3>
          <div className="chart-total">
            <span className="total-label">TOTAL:</span>
            <span className="total-value">{totalInWorkshop}</span>
          </div>
        </div>
        <div className="chart-bars-horizontal">
          {data.map((item, index) => (
            <div key={index} className="bar-row">
              <div className="bar-label-horizontal" title={item[labelKey]}>
                {item[labelKey]}
              </div>
              <div className="bar-wrapper-horizontal">
                <div 
                  className="chart-bar-horizontal"
                  style={{ width: `${(item.count / maxCount) * 100}%` }}
                  title={`${item[labelKey]}: ${item.count} vehículos`}
                >
                  <span className="bar-value-horizontal">{item.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading && activeReport !== "byLine" && activeReport !== "byClient") {
    return <div className="reports-loading">Cargando informes...</div>;
  }

  return (
    <div className="reports-container">
      <div className="reports-tabs">
        <button className={`tab-button ${activeReport === "today" ? "active" : ""}`} onClick={() => setActiveReport("today")}>📅 Hoy</button>
        <button className={`tab-button ${activeReport === "last7Days" ? "active" : ""}`} onClick={() => setActiveReport("last7Days")}>Últimos 7 Días</button>
        <button className={`tab-button ${activeReport === "last30Days" ? "active" : ""}`} onClick={() => setActiveReport("last30Days")}>Últimos 30 Días</button>
        <button className={`tab-button ${activeReport === "byLine" ? "active" : ""}`} onClick={() => setActiveReport("byLine")}>📈 Por Línea</button>
        <button className={`tab-button ${activeReport === "byClient" ? "active" : ""}`} onClick={() => setActiveReport("byClient")}>👥 Por Cliente</button>
      </div>

      {activeReport === "today" && (
        <>
          <h2 className="reports-title">📊 Rotación Hoy</h2>
          {renderReportBlock(reports.today, reports.today.period.from)}
        </>
      )}
      {activeReport === "last7Days" && (
        <>
          <h2 className="reports-title">📊 Rotación Últimos 7 Días</h2>
          {renderReportBlock(reports.last7Days, `${reports.last7Days.period.from} a ${reports.last7Days.period.to}`)}
        </>
      )}
      {activeReport === "last30Days" && (
        <>
          <h2 className="reports-title">📊 Rotación Últimos 30 Días</h2>
          {renderReportBlock(reports.last30Days, `${reports.last30Days.period.from} a ${reports.last30Days.period.to}`)}
        </>
      )}
      {activeReport === "byLine" && (
        <>
          <h2 className="reports-title">📊 Vehículos en Taller por Línea</h2>
          {renderHorizontalChart(vehiclesByLine, 'line', 'Total por Línea')}
        </>
      )}
      {activeReport === "byClient" && (
        <>
          <h2 className="reports-title">📊 Vehículos en Taller por Cliente</h2>
          {renderHorizontalChart(vehiclesByClient, 'client', 'Total por Cliente')}
        </>
      )}
    </div>
  );
};

export default ReportsPage;