//Header superior

import emblema from "../images/Emblema.png";
import "../styles/Header.css";
import React from 'react';

function Header() {
 
  return (
    <header className="header">
       
      {/* Agrupamos emblema y título en un contenedor */}
      <div className="header__logo-container">
        <img src={emblema} alt="Emblema" className="emblema" />
        <h1 className="header__title">Control Servicios Taller</h1>
      </div>
  
      <span className="header__user">V_1.0</span>
    </header>
  );
}

export default Header;
