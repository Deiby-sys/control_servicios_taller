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

  const fetchVehiclesByLine = async () => {
    try {
      console.log('📊 [PROD] Iniciando carga de vehículos por línea...');
      setLoading(true);
      
      // Paso 1: Obtener todas las órdenes
      const ordersResponse = await fetch('/api/work-orders', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 [PROD] Status órdenes:', ordersResponse.status);
      
      if (!ordersResponse.ok) {
        throw new Error(`Error HTTP órdenes: ${ordersResponse.status}`);
      }
      
      const orders = await ordersResponse.json();
      console.log('📊 [PROD] Total órdenes recibidas:', orders.length);
      console.log('📊 [PROD] Muestra primera orden:', orders[0]);
      
      // Paso 2: Obtener vehículos separadamente (backup)
      let vehiclesMap = {};
      try {
        const vehiclesResponse = await fetch('/api/vehicles', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (vehiclesResponse.ok) {
          const vehicles = await vehiclesResponse.json();
          console.log('📊 [PROD] Vehículos cargados:', vehicles.length);
          
          // Crear mapa de vehículos por ID
          vehiclesMap = vehicles.reduce((acc, vehicle) => {
            acc[vehicle._id] = vehicle;
            return acc;
          }, {});
          
          console.log('📊 [PROD] Primer vehículo en mapa:', vehiclesMap[Object.keys(vehiclesMap)[0]]);
        } else {
          console.warn('⚠️ [PROD] No se pudieron cargar vehículos:', vehiclesResponse.status);
        }
      } catch (err) {
        console.error('❌ [PROD] Error cargando vehículos:', err);
      }
      
      // Paso 3: Filtrar órdenes en taller
      const workshopStates = [
        'por_asignar', 
        'asignado', 
        'en_aprobacion', 
        'por_repuestos', 
        'en_soporte', 
        'en_proceso', 
        'completado'
      ];
      
      const workshopOrders = orders.filter(order => {
        const isInWorkshop = workshopStates.includes(order.status);
        if (isInWorkshop) {
          console.log('📊 [PROD] Orden en taller:', {
            id: order._id,
            status: order.status,
            vehicleId: order.vehicle,
            vehicleData: order.vehicle
          });
        }
        return isInWorkshop;
      });
      
      console.log('📊 [PROD] Total órdenes en taller:', workshopOrders.length);
      
      if (workshopOrders.length === 0) {
        console.warn('⚠️ [PROD] No hay órdenes en taller');
        setVehiclesByLine([]);
        setTotalInWorkshop(0);
        setLoading(false);
        return;
      }
      
      // Paso 4: Agrupar por línea (con fallback al mapa de vehículos)
      const lineCount = {};
      let processedCount = 0;
      let missingVehicleCount = 0;
      
      workshopOrders.forEach(order => {
        let line = 'Sin Línea';
        let vehicleFound = false;
        
        // Método 1: Vehicle es un objeto completo
        if (order.vehicle && typeof order.vehicle === 'object') {
          line = order.vehicle.line || order.vehicle.model || 'Sin Línea';
          vehicleFound = true;
          console.log('📊 [PROD] Línea desde order.vehicle:', line);
        }
        // Método 2: Vehicle es un ID, buscar en el mapa
        else if (typeof order.vehicle === 'string' && vehiclesMap[order.vehicle]) {
          const vehicle = vehiclesMap[order.vehicle];
          line = vehicle.line || vehicle.model || 'Sin Línea';
          vehicleFound = true;
          console.log('📊 [PROD] Línea desde vehiclesMap:', line);
        }
        // Método 3: Vehicle es un ID pero no está en el mapa
        else if (typeof order.vehicle === 'string') {
          missingVehicleCount++;
          console.warn('⚠️ [PROD] Vehículo no encontrado en mapa:', order.vehicle);
        }
        // Método 4: No hay vehicle
        else {
          missingVehicleCount++;
          console.warn('⚠️ [PROD] Orden sin vehicle:', order._id);
        }
        
        if (vehicleFound) {
          lineCount[line] = (lineCount[line] || 0) + 1;
          processedCount++;
        }
      });
      
      console.log('📊 [PROD] Resumen:', {
        total: workshopOrders.length,
        processed: processedCount,
        missing: missingVehicleCount,
        lines: lineCount
      });
      
      // Paso 5: Convertir a array y ordenar
      const sortedLines = Object.entries(lineCount)
        .map(([line, count]) => ({ line, count }))
        .sort((a, b) => b.count - a.count);
      
      console.log('📊 [PROD] Resultado final:', sortedLines);
      console.log('📊 [PROD] Total:', workshopOrders.length);
      
      setVehiclesByLine(sortedLines);
      setTotalInWorkshop(workshopOrders.length);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ [PROD] Error crítico en fetchVehiclesByLine:', error);
      console.error('❌ [PROD] Stack:', error.stack);
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
    if (loading) {
      return <div className="reports-loading">Cargando reporte...</div>;
    }

    if (vehiclesByLine.length === 0) {
      return (
        <div className="no-data">
          <p>No hay vehículos en taller actualmente</p>
          <p className="no-data-hint">
            💡 Tip: Verifica que haya órdenes con estados: Por Asignar, Asignado, En Aprobación, 
            Por Repuestos, En Soporte, En Proceso o Completado
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

  if (loading && !showLineReport) {
    return <div className="reports-loading">Cargando informes...</div>;
  }

  return (
    <div className="reports-container">
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
          <h2 className="reports-title">📊 En Taller por Línea</h2>
          {renderVehiclesByLineChart()}
        </>
      )}
    </div>
  );
};

export default ReportsPage;