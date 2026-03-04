// src/pages/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { getReportsSummary } from '../api/auth'; // ✅ Usa auth.js
import { useAuth } from '../context/AuthContext';
import '../styles/ReportsPage.css';

const ReportsPage = () => {
  const [reports, setReports] = useState({
    last7Days: { ingresos: 0, completados: 0, entregados: 0, period: { from: '', to: '' } },
    last30Days: { ingresos: 0, completados: 0, entregados: 0, period: { from: '', to: '' } }
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("last7Days");
  const { user } = useAuth(); // ✅ No necesitas token si usas cookies

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await getReportsSummary(); // ✅ Usa la función corregida
      setReports(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar informes:', error);
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
          {/* Ingresos */}
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

          {/* Completados */}
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

          {/* Entregados */}
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

  if (loading) {
    return <div className="reports-loading">Cargando informes...</div>;
  }

  return (
    <div className="reports-container">
      {/* Tabs */}
      <div className="reports-tabs">
        <button
          className={`tab-button ${activeTab === "last7Days" ? "active" : ""}`}
          onClick={() => setActiveTab("last7Days")}
        >
          Últimos 7 Días
        </button>
        <button
          className={`tab-button ${activeTab === "last30Days" ? "active" : ""}`}
          onClick={() => setActiveTab("last30Days")}
        >
          Últimos 30 Días
        </button>
      </div>

      <h2 className="reports-title">
        📊 Rotación {activeTab === "last7Days" ? "Últimos 7 Días" : "Últimos 30 Días"}
      </h2>

      {activeTab === "last7Days" && renderReportBlock(reports.last7Days)}
      {activeTab === "last30Days" && renderReportBlock(reports.last30Days)}
    </div>
  );
};

export default ReportsPage;