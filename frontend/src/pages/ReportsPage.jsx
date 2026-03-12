// src/pages/ReportsPage.jsx
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

const fetchVehiclesByLine = async () => {
  try {
    console.log('📊 [REPORT] Iniciando carga de vehículos por línea...');
    
    const response = await fetch('/api/work-orders', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 [REPORT] Status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const orders = await response.json();
    console.log('📊 [REPORT] Total órdenes recibidas:', orders.length);
    console.log('📊 [REPORT] Primera orden:', orders[0]);
    
    // Filtrar estados en taller
    const workshopStates = [
      'por_asignar', 'asignado', 'en_aprobacion', 
      'por_repuestos', 'en_soporte', 'en_proceso', 'completado'
    ];
    
    const workshopOrders = orders.filter(order => {
      const isInWorkshop = workshopStates.includes(order.status);
      if (isInWorkshop) {
        console.log(`📊 [REPORT] Orden en taller: ${order._id}, Estado: ${order.status}, Vehicle:`, order.vehicle);
      }
      return isInWorkshop;
    });
    
    console.log('📊 [REPORT] Órdenes en taller:', workshopOrders.length);
    
    if (workshopOrders.length === 0) {
      console.warn('⚠️ [REPORT] No hay órdenes en taller');
    }
    
    // Agrupar por línea
    const lineCount = {};
    workshopOrders.forEach(order => {
      // Verificar si vehicle existe y es un objeto (no solo un ID)
      if (!order.vehicle) {
        console.warn('⚠️ [REPORT] Orden sin vehículo:', order._id);
        return;
      }
      
      const line = typeof order.vehicle === 'object' 
        ? (order.vehicle.line || order.vehicle.model || 'Sin Línea')
        : 'Sin Línea';
      
      console.log(`📊 [REPORT] Línea encontrada: ${line}`);
      lineCount[line] = (lineCount[line] || 0) + 1;
    });
    
    const sortedLines = Object.entries(lineCount)
      .map(([line, count]) => ({ line, count }))
      .sort((a, b) => b.count - a.count);
    
    console.log('📊 [REPORT] Resultado final:', sortedLines);
    console.log('📊 [REPORT] Total:', workshopOrders.length);
    
    setVehiclesByLine(sortedLines);
    setTotalInWorkshop(workshopOrders.length);
  } catch (error) {
    console.error('❌ [REPORT] Error crítico:', error);
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
              <div
                className="report-bar report-bar--ingresos"
                style={{ width: `${(data.ingresos / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="report-card report-card--completados">
            <h3>Completados</h3>
            <div className="report-value">{data.completados}</div>
            <div className="report-bar-container">
              <div
                className="report-bar report-bar--completados"
                style={{ width: `${(data.completados / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="report-card report-card--entregados">
            <h3>Entregados</h3>
            <div className="report-value">{data.entregados}</div>
            <div className="report-bar-container">
              <div
                className="report-bar report-bar--entregados"
                style={{ width: `${(data.entregados / maxValue) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVehiclesByLineChart = () => {
    if (vehiclesByLine.length === 0) {
      return <div className="no-data">No hay vehículos en taller actualmente</div>;
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
                  <div
                    className="chart-bar"
                    style={{ 
                      height: `${(vehicle.count / maxCount) * 100}%`,
                      minHeight: '30px'
                    }}
                    title={`${vehicle.line}: ${vehicle.count} vehículos`}
                  >
                    <span className="bar-value">{vehicle.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-color"></div>
              <span>Total</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="reports-loading">Cargando informes...</div>;
  }

  return (
    <div className="reports-container">
      {/* Tabs Principales */}
      <div className="reports-tabs">
        <button
          className={`tab-button ${!showLineReport && activeTab === "last7Days" ? "active" : ""}`}
          onClick={() => { setShowLineReport(false); setActiveTab("last7Days"); }}
        >
          Últimos 7 Días
        </button>
        <button
          className={`tab-button ${!showLineReport && activeTab === "last30Days" ? "active" : ""}`}
          onClick={() => { setShowLineReport(false); setActiveTab("last30Days"); }}
        >
          Últimos 30 Días
        </button>
        <button
          className={`tab-button ${showLineReport ? "active" : ""}`}
          onClick={() => setShowLineReport(true)}
        >
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
          <h2 className="reports-title"> En Taller por Línea</h2>
          {renderVehiclesByLineChart()}
        </>
      )}
    </div>
  );
};

export default ReportsPage;