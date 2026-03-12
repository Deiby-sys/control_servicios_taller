// src/pages/ReportsPage.jsx - Página Informes

import React, { useState, useEffect } from 'react';
import { getReportsSummary } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import '../styles/ReportsPage.css';

const ReportsPage = () => {
  const [reports, setReports] = useState({
    last7Days: { ingresos: 0, completados: 0, entregados: 0, period: { from: '', to: '' } },
    last30Days: { ingresos: 0, completados: 0, entregados: 0, period: { from: '', to: '' } }
  });
  const [vehiclesByLine, setVehiclesByLine] = useState([]);
  const [totalInWorkshop, setTotalInWorkshop] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("last7Days");
  const [showLineReport, setShowLineReport] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchReports();
    if (showLineReport) {
      fetchVehiclesByLine();
    }
  }, [showLineReport]);

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

  // ✅ FUNCIÓN ÚNICA Y CORRECTA
  const fetchVehiclesByLine = async () => {
    try {
      console.log('📊 [PROD] Iniciando carga...');
      setLoading(true);
      
      // Determinar URL del backend
      const API_URL = import.meta.env.VITE_API_URL || 
        (window.location.hostname === 'localhost' 
          ? 'http://localhost:10000' 
          : 'https://control-servicios-taller.onrender.com');
      
      console.log('📊 [PROD] API URL:', API_URL);
      
      // Paso 1: Obtener órdenes
      const ordersResponse = await fetch(`${API_URL}/api/work-orders`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('📊 [PROD] Status órdenes:', ordersResponse.status);
      console.log('📊 [PROD] Content-Type:', ordersResponse.headers.get('content-type'));
      
      // Verificar si es HTML (error de autenticación o 404)
      const contentType = ordersResponse.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const htmlText = await ordersResponse.text();
        console.error('❌ [PROD] Respuesta HTML:', htmlText.substring(0, 200));
        throw new Error('El backend devolvió HTML. Verifica autenticación y URL.');
      }
      
      if (!ordersResponse.ok) {
        const errorText = await ordersResponse.text();
        throw new Error(`Error HTTP ${ordersResponse.status}: ${errorText}`);
      }
      
      const orders = await ordersResponse.json();
      console.log('📊 [PROD] Total órdenes:', orders.length);
      
      // Paso 2: Obtener vehículos como backup
      let vehiclesMap = {};
      try {
        const vehiclesResponse = await fetch(`${API_URL}/api/vehicles`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        
        const vContentType = vehiclesResponse.headers.get('content-type');
        if (vContentType && vContentType.includes('text/html')) {
          console.warn('⚠️ [PROD] Vehículos devolvió HTML');
        } else if (vehiclesResponse.ok) {
          const vehicles = await vehiclesResponse.json();
          console.log('📊 [PROD] Vehículos cargados:', vehicles.length);
          
          vehiclesMap = vehicles.reduce((acc, v) => {
            acc[v._id] = v;
            return acc;
          }, {});
        }
      } catch (err) {
        console.warn('⚠️ [PROD] Error cargando vehículos:', err.message);
      }
      
      // Paso 3: Filtrar órdenes en taller
      const workshopStates = [
        'por_asignar', 'asignado', 'en_aprobacion', 
        'por_repuestos', 'en_soporte', 'en_proceso', 'completado'
      ];
      
      const workshopOrders = orders.filter(order => 
        workshopStates.includes(order.status)
      );
      
      console.log('📊 [PROD] Órdenes en taller:', workshopOrders.length);
      
      if (workshopOrders.length === 0) {
        setVehiclesByLine([]);
        setTotalInWorkshop(0);
        setLoading(false);
        return;
      }
      
      // Paso 4: Agrupar por línea
      const lineCount = {};
      workshopOrders.forEach(order => {
        let line = 'Sin Línea';
        
        if (order.vehicle && typeof order.vehicle === 'object') {
          line = order.vehicle.line || order.vehicle.model || 'Sin Línea';
        } else if (typeof order.vehicle === 'string' && vehiclesMap[order.vehicle]) {
          const vehicle = vehiclesMap[order.vehicle];
          line = vehicle.line || vehicle.model || 'Sin Línea';
        }
        
        lineCount[line] = (lineCount[line] || 0) + 1;
      });
      
      // Paso 5: Convertir a array y ordenar
      const sortedLines = Object.entries(lineCount)
        .map(([line, count]) => ({ line, count }))
        .sort((a, b) => b.count - a.count);
      
      console.log('📊 [PROD] Resultado:', sortedLines);
      
      setVehiclesByLine(sortedLines);
      setTotalInWorkshop(workshopOrders.length);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ [PROD] Error crítico:', error.message);
      alert('Error al cargar reporte: ' + error.message);
      setVehiclesByLine([]);
      setTotalInWorkshop(0);
      setLoading(false);
    }
  };

  const renderReportBlock = (data) => {
    const maxValue = Math.max(data.ingresos, data.completados, data.entregados, 1);
    return (
      <div className="reports-block">
        <p className="reports-period">
          Periodo: {data.period.from} a {data.period.to}
        </p>
        <div className="reports-cards">
          <div className="report-card report-card--ingresos">
            <h3>Ingresos</h3>
            <div className="report-value">{data.ingresos}</div>
            <div className="report-bar-container">
              <div className="report-bar report-bar--ingresos"
                style={{ width: `${(data.ingresos / maxValue) * 100}%` }} />
            </div>
          </div>
          <div className="report-card report-card--completados">
            <h3>Completados</h3>
            <div className="report-value">{data.completados}</div>
            <div className="report-bar-container">
              <div className="report-bar report-bar--completados"
                style={{ width: `${(data.completados / maxValue) * 100}%` }} />
            </div>
          </div>
          <div className="report-card report-card--entregados">
            <h3>Entregados</h3>
            <div className="report-value">{data.entregados}</div>
            <div className="report-bar-container">
              <div className="report-bar report-bar--entregados"
                style={{ width: `${(data.entregados / maxValue) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVehiclesByLineChart = () => {
    if (loading) return <div className="reports-loading">Cargando reporte...</div>;
    
    if (vehiclesByLine.length === 0) {
      return (
        <div className="no-data">
          <p>No hay vehículos en taller actualmente</p>
          <p className="no-data-hint">
            💡 Tip: Verifica que haya órdenes con estados activos
          </p>
        </div>
      );
    }

    const maxCount = Math.max(...vehiclesByLine.map(v => v.count), 1);
    return (
      <div className="vehicles-by-line-container">
        <div className="chart-header">
          <h3>📊 Total por Línea</h3>
          <div className="chart-total">
            <span className="total-label">TOTAL:</span>
            <span className="total-value">{totalInWorkshop}</span>
          </div>
        </div>
        <div className="chart-wrapper">
          <div className="chart-bars">
            {vehiclesByLine.map((vehicle, index) => (
              <div key={index} className="bar-container">
                <div className="bar-label">{vehicle.line}</div>
                <div className="bar-wrapper">
                  <div className="chart-bar"
                    style={{ height: `${(vehicle.count / maxCount) * 100}%`, minHeight: '30px' }}
                    title={`${vehicle.line}: ${vehicle.count} vehículos`}>
                    <span className="bar-value">{vehicle.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color" />
              <span>Total</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !showLineReport) {
    return <div className="reports-loading">Cargando informes...</div>;
  }

  return (
    <div className="reports-container">
      <div className="reports-tabs">
        <button className={`tab-button ${!showLineReport && activeTab === "last7Days" ? "active" : ""}`}
          onClick={() => { setShowLineReport(false); setActiveTab("last7Days"); }}>
          Últimos 7 Días
        </button>
        <button className={`tab-button ${!showLineReport && activeTab === "last30Days" ? "active" : ""}`}
          onClick={() => { setShowLineReport(false); setActiveTab("last30Days"); }}>
          Últimos 30 Días
        </button>
        <button className={`tab-button ${showLineReport ? "active" : ""}`}
          onClick={() => setShowLineReport(true)}>
          📈 En Taller por Línea
        </button>
      </div>

      {!showLineReport ? (
        <>
          <h2 className="reports-title">
            📊 Rotación {activeTab === "last7Days" ? "Últimos 7 Días" : "Últimos 30 Días"}
          </h2>
          {activeTab === "last7Days" && renderReportBlock(reports.last7Days)}
          {activeTab === "last30Days" && renderReportBlock(reports.last30Days)}
        </>
      ) : (
        <>
          <h2 className="reports-title">📊 En Taller por Línea</h2>
          {renderVehiclesByLineChart()}
        </>
      )}
    </div>
  );
};

export default ReportsPage;