//Página principal (dashboard)

import ingreso from "../images/ingreso.png";
import asignar from "../images/asignar.png";
import asignados from "../images/asignados.png";
import aprobacion from "../images/aprobacion.png";
import repuestos from "../images/repuestos.png";
import soporte from "../images/soporte.png";
import listos from "../images/listos.png";
import "../styles/Dashboard.css";

function Dashboard() {
  return (
    <div className="dashboard-main">
      <h2>Estado Servicios</h2>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <img src={ingreso} alt="Ingreso" />
          <h3>Ingreso</h3>
        </div>
        <div className="dashboard-card">
          <img src={asignar} alt="Por Asignar" />
          <h3>Por Asignar</h3>
        </div>
        <div className="dashboard-card">
          <img src={asignados} alt="Asignados" />
          <h3>Asignados</h3>
        </div>
        <div className="dashboard-card">
          <img src={aprobacion} alt="En Aprobación" />
          <h3>En Aprobación</h3>
        </div>
        <div className="dashboard-card">
          <img src={repuestos} alt="Por Repuestos" />
          <h3>Por Repuestos</h3>
        </div>
        <div className="dashboard-card">
          <img src={soporte} alt="En Soporte" />
          <h3>En Soporte</h3>
        </div>
        <div className="dashboard-card">
          <img src={listos} alt="Listos" />
          <h3>Listos</h3>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
