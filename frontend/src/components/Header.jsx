//Header superior

import emblema from "../images/Emblema.png";
import "../styles/Header.css";
import React from 'react';

function Header({ onToggleSidebar }) {
  return (
    <header className="header">
      <button onClick={onToggleSidebar} 
      className="menu-toggle" // conectamos el clic con la función
      >
        ☰
      </button>
  
      {/* Agrupamos emblema y título en un contenedor */}
        <div className="header__logo-container">
          <img src= {emblema} alt="Emblema" className="emblema" />
          <h1 className="header__title">Control Servicios Taller</h1>
        </div>
  
      <span className="header__user">Admin</span>
    </header>
  );
}

export default Header;

