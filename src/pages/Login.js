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
            <ul>
                <li>
                    <a href='/Recuperar'>Recupera Contraseña</a>
                </li>
                <br></br>
                <li>
                    <a href='/RegistroUsuario'>Registro Usuario</a>
                </li>
            </ul>
            
        </form>
    </div>
    );
}