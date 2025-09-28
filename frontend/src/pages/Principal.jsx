//Página principal (dashboard)


import React from "react";
import "./Principal.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import emblema from "../images/Emblema.png";
import ingreso from "../images/Ingreso.png";
import asignar from "../images/Asignar.png";
import asignados from "../images/Asignados.png";
import aprobacion from "../images/Aprobacion.png";
import repuestos from "../images/Repuestos.png";
import listos from "../images/Listos.png";
import salir from "../images/Salir.png";

function PaginaPrincipal() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // borra sesión en AuthContext
    navigate("/login"); // redirige al login
  };

  return (
    <div className="principal">
      {/* Encabezado */}
      <header className="contenedor_cabeza">
        <h2 className="titulo">CONTROL SERVICIOS TALLER</h2>
      </header>

      {/* Menú lateral */}
      <aside className="contenedor_menu">
        <img className="emblema" src={emblema} alt="Imagen emblema" />

        <nav className="menu">
          <p><a href="/clientes">Clientes</a></p>
          <p><a href="/cotizador">Cotizador</a></p>
          <p><a href="/estado">Estado</a></p>
          <p><a href="/historico">Histórico</a></p>
          <p><a href="/vehiculos">Vehículos</a></p>
        </nav>
      </aside>

      {/* Módulos principales */}
      <main className="contenedor_modulos">
        <h2 className="saludo_modulos">ESTADO VEHÍCULOS</h2>

        <div className="columna">
          <h3>Ingreso</h3>
          <img alt="Ingreso" src={ingreso} />
        </div>

        <div className="columna">
          <h3>Asignar</h3>
          <img alt="Asignar" src={asignar} />
        </div>

        <div className="columna">
          <h3>Asignados</h3>
          <img alt="Asignados" src={asignados} />
        </div>

        <div className="columna">
          <h3>Aprobación</h3>
          <img alt="Aprobación" src={aprobacion} />
        </div>

        <div className="columna">
          <h3>Repuestos</h3>
          <img alt="Repuestos" src={repuestos} />
        </div>

        <div className="columna">
          <h3>Listos</h3>
          <img alt="Listos" src={listos} />
        </div>
      </main>

      {/* Botón salir */}
      <div className="contenedor_opciones">
        <button className="btn-salir" onClick={handleLogout}>
          <img className="salir" src={salir} alt="Cerrar sesión" />
        </button>
      </div>
    </div>
  );
}

export default PaginaPrincipal;



