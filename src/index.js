//index.js se encarga de arrancar la aplicación

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
    <div className="App">
      <h1>Control Servicios Taller</h1>
        <form>
          <label htmlFor="Usuario">Usuario: </label>       
          <input type="email" id="Usuario" email="Usuario" placeholder="Email registrado"/>
          <label htmlFor="Contraseña">Contraseña: </label>
          <input type="password" id="Contraseña"/>
          <input type="submit" class="btn" value="Ingresar"/>
          <a
            className="link_Recuperar"
            href="http"
            target="_blank"
            rel="noopener noreferrer"
          >
            Recuperar Contraseña
          </a>
          <br></br>
          <a
            className="link_Registro"
            href="http"
            target="_blank"
            rel="noopener noreferrer"
          >
            Registro nuevo usuario
          </a>
            {/*<p><a href="#">Recuperar contraseña</a></p>
            <p><a href="registro_usuario.html">Registro nuevo usuario</a></p>*/}
        </form>
    </div>
  );


