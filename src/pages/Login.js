import React from 'react';
import './Login.css';

export default function Login() {

    return (

    <div className="Login">
      <img className="emblema" src="images/emblema.png" alt="Emblema_proyecto"/>
      <h1>Control Servicios Taller</h1>
      <br></br>
        <form>
            <label htmlFor="Usuario">Usuario: </label>       
            <input type="email" id="Usuario" email="Usuario" placeholder="Email registrado"/>
            <label htmlFor="Contraseña">Contraseña: </label>
            <input type="password" id="Contraseña"/>
            <input type="submit" className="btn" value="Ingresar"/>
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
                href="./registro.js"
                target="_blank"
                rel="noopener noreferrer"
            >
                Registro nuevo usuario
            </a>
            
        </form>
    </div>
    );
}