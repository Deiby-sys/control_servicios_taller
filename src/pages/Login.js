import React from 'react';
import './Login.css';
import emblema from '../images/Emblema.png'


export default function Login() {

    return (

    <div className="Login">
        <form>
            <header>
                <img src={emblema} className="emblema" alt="emblema" />
                <h1>Control Servicios Taller</h1>
            </header>
            <br></br>
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