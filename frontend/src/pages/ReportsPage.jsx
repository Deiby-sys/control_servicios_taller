// Página para informes

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/ReportsPage.css';

const ReportsPage = () => {
  const [reports, setReports] = useState({
    ingresos: 0,
    completados: 0,
    entregados: 0,
    period: { from: '', to: '' }
  });
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/reports/last-7-days', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReports(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar informes:', error);
      setLoading(false);
    }
  };

  // Calcular el valor máximo para normalizar las barras
  const maxValue = Math.max(reports.ingresos, reports.completados, reports.entregados, 1);

  if (loading) {
    return <div className="reports-loading">Cargando informes...</div>;
  }

  return (
    <div className="reports-container">
      <h2 className="reports-title">📊 Rotación Últimos 7 Días</h2>
      <p className="reports-period">
        Periodo: {reports.period.from} a {reports.period.to}
      </p>
      
      <div className="reports-cards">
        {/* Ingresos */}
        <div className="report-card report-card--ingresos">
          <h3>Ingresos</h3>
          <div className="report-value">{reports.ingresos}</div>
          <div className="report-bar-container">
            <div 
              className="report-bar report-bar--ingresos"
              style={{ width: `${(reports.ingresos / maxValue) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Completados */}
        <div className="report-card report-card--completados">
          <h3>Completados</h3>
          <div className="report-value">{reports.completados}</div>
          <div className="report-bar-container">
            <div 
              className="report-bar report-bar--completados"
              style={{ width: `${(reports.completados / maxValue) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Entregados */}
        <div className="report-card report-card--entregados">
          <h3>Entregados</h3>
          <div className="report-value">{reports.entregados}</div>
          <div className="report-bar-container">
            <div 
              className="report-bar report-bar--entregados"
              style={{ width: `${(reports.entregados / maxValue) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;