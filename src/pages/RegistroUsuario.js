import React from 'react';
import './RegistroUsuario.css';
import emblema from '../images/Emblema.png'

export default function RegistroUsuario() {

  return (
    <div className="RegistroUsuario">
      <form>
        <header>
          <img src={emblema} className="emblema" alt="emblema" />
          <h2>Registro Usuario</h2>
        </header>
        <input type="text" placeholder="Nombre"/>
        <input type="text" placeholder="Apellido"/>
        <input type="email" placeholder="Correo"/>
        <select className="perfil"/>
            <option>Selecciona tu perfil:</option>
            <option>Asesor</option>
            <option>Bodega</option>
            <option>Jefe</option>
            <option>Técnico</option>  
        
        <input type="password" placeholder="Contraseña"/>
        <input type="password" placeholder="Confirma Contraseña"/>
        <input type="submit" class="btn" value="Enviar"/>
      </form>
    </div>
  );
}
