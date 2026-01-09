//Página principal (dashboard)

import { useNavigate } from "react-router-dom";
import ingreso from "../images/ingreso.png";
import asignar from "../images/asignar.png";
import asignados from "../images/asignados.png";
import aprobacion from "../images/aprobacion.png";
import repuestos from "../images/repuestos.png";
import soporte from "../images/soporte.png";
import proceso from "../images/proceso.png";
import listos from "../images/listos.png";
import { useWorkOrderCounts } from "../hooks/useWorkOrderCounts";
import { useAuth } from "../context/AuthContext";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const { counts, totalEnTaller, loading } = useWorkOrderCounts();
  const { user } = useAuth();

  const handleCardClick = (path) => {
    navigate(path);
  };

  // Obtener el nombre del usuario (con fallback seguro)
  const userName = user?.name || "Usuario";

  return (
    <div className="dashboard-main">
            
      {/* SALUDO PERSONALIZADO */}
      <div className="dashboard-welcome">
        <p>¡Hola, <strong>{userName}</strong>! Bienvenido al sistema de gestión de órdenes de trabajo.</p>
        <p>Para ver tus órdenes de trabajo, haz clic en <strong>"Órdenes de Trabajo"</strong> en el menú lateral.</p>
      </div>

      <div className="dashboard-cards">
        {/* SOLO admin, asesor y jefe ven la tarjeta "Nueva Orden" */}
        {(user?.profile === 'admin' || user?.profile === 'asesor' || user?.profile === 'jefe') && (
          <div 
            className="dashboard-card dashboard-card--ingreso"
            onClick={() => handleCardClick("/ordenes/new")}
          >
            <img src={ingreso} alt="Nueva Orden" />
            <h3>Nueva Orden</h3>
          </div>
        )}
        
        {/* Tarjetas con nuevos labels por responsable */}
        <div 
          className="dashboard-card dashboard-card--por-asignar"
          onClick={() => handleCardClick("/ordenes/status/por_asignar")}
        >
          <img src={asignar} alt="Jefe" />
          <h3>Jefe</h3>
          {!loading && <div className="card-count">{counts.por_asignar}</div>}
        </div>
        
        <div 
          className="dashboard-card dashboard-card--asignado"
          onClick={() => handleCardClick("/ordenes/status/asignado")}
        >
          <img src={asignados} alt="Diagnóstico Técnico" />
          <h3>Técnico</h3>
          {!loading && <div className="card-count">{counts.asignado}</div>}
        </div>
        
        <div 
          className="dashboard-card dashboard-card--en-aprobacion"
          onClick={() => handleCardClick("/ordenes/status/en_aprobacion")}
        >
          <img src={aprobacion} alt="Asesor" />
          <h3>Asesor</h3>
          {!loading && <div className="card-count">{counts.en_aprobacion}</div>}
        </div>
        
        <div 
          className="dashboard-card dashboard-card--por-repuestos"
          onClick={() => handleCardClick("/ordenes/status/por_repuestos")}
        >
          <img src={repuestos} alt="Repuestos" />
          <h3>Repuestos</h3>
          {!loading && <div className="card-count">{counts.por_repuestos}</div>}
        </div>
        
        <div 
          className="dashboard-card dashboard-card--en-soporte"
          onClick={() => handleCardClick("/ordenes/status/en_soporte")}
        >
          <img src={soporte} alt="Soporte Técnico" />
          <h3>Soporte Técnico</h3>
          {!loading && <div className="card-count">{counts.en_soporte}</div>}
        </div>
        
        <div 
          className="dashboard-card dashboard-card--en-proceso"
          onClick={() => handleCardClick("/ordenes/status/en_proceso")}
        >
          <img src={proceso} alt="Proceso Técnico" />
          <h3>Proceso Técnico</h3>
          {!loading && <div className="card-count">{counts.en_proceso}</div>}
        </div>
        
        <div 
          className="dashboard-card dashboard-card--completado"
          onClick={() => handleCardClick("/ordenes/status/completado")}
        >
          <img src={listos} alt="Listo para Entrega" />
          <h3>Listo para Entrega</h3>
          {!loading && <div className="card-count">{counts.completado}</div>}
        </div>

        <div className="dashboard-card dashboard-card--total">
          <h3>Total en Taller</h3>
          {!loading && (
            <div className="card-count card-count--total">
              {totalEnTaller}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;