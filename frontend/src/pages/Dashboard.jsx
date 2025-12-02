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

  // Verificar si el perfil es técnico (con tolerancia a mayúsculas/minúsculas)
  const isTechnician = user?.profile?.toLowerCase() === 'tecnico';

  return (
    <div className="dashboard-main">
      <h2>Estado Servicios</h2>
      
      {/* Saludo personalizado */}
      {isTechnician && (
      <div className="info-message">
        <p>👋 ¡Hola, <strong>{user.name} {user.lastName}</strong>! Bienvenido al sistema de gestión de órdenes de trabajo.</p>
        <p>Para ver tus órdenes asignadas, haz clic en <strong>"Órdenes de Trabajo"</strong> en el menú lateral.</p>
      </div>
    )}

      <div className="dashboard-cards">
        {/* Tarjeta de ingreso - solo admin, asesor o jefe */}
        {!isTechnician && (
        <div 
          className="dashboard-card" 
          onClick={() => handleCardClick("/ordenes/new")}
        >
          <img src={ingreso} alt="Ingreso" />
          <h3>Ingreso</h3>
        </div>
      )}
        
        {/* Resto de tarjetas... */}
        <div 
          className="dashboard-card" 
          onClick={() => handleCardClick("/ordenes/status/por_asignar")}
        >
          <img src={asignar} alt="Por Asignar" />
          <h3>Por Asignar</h3>
          {!loading && <div className="card-count">{counts.por_asignar}</div>}
        </div>
        
        <div 
          className="dashboard-card" 
          onClick={() => handleCardClick("/ordenes/status/asignado")}
        >
          <img src={asignados} alt="Asignados" />
          <h3>Asignados</h3>
          {!loading && <div className="card-count">{counts.asignado}</div>}
        </div>
        
        <div 
          className="dashboard-card" 
          onClick={() => handleCardClick("/ordenes/status/en_aprobacion")}
        >
          <img src={aprobacion} alt="En Aprobación" />
          <h3>En Aprobación</h3>
          {!loading && <div className="card-count">{counts.en_aprobacion}</div>}
        </div>
        
        <div 
          className="dashboard-card" 
          onClick={() => handleCardClick("/ordenes/status/por_repuestos")}
        >
          <img src={repuestos} alt="Por Repuestos" />
          <h3>Por Repuestos</h3>
          {!loading && <div className="card-count">{counts.por_repuestos}</div>}
        </div>
        
        <div 
          className="dashboard-card" 
          onClick={() => handleCardClick("/ordenes/status/en_soporte")}
        >
          <img src={soporte} alt="En Soporte" />
          <h3>En Soporte</h3>
          {!loading && <div className="card-count">{counts.en_soporte}</div>}
        </div>
        
        <div 
          className="dashboard-card" 
          onClick={() => handleCardClick("/ordenes/status/en_proceso")}
        >
          <img src={proceso} alt="En Proceso" />
          <h3>En Proceso</h3>
          {!loading && <div className="card-count">{counts.en_proceso}</div>}
        </div>
        
        <div 
          className="dashboard-card" 
          onClick={() => handleCardClick("/ordenes/status/completado")}
        >
          <img src={listos} alt="Listos" />
          <h3>Completado</h3>
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