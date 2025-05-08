import React from 'react';
import './RegistroUsuario.css';
import emblema from '../images/Emblema.png';
import Select from 'react-select';


const perfil = [
  {label: 'Asesor', value: 'Asesor'},
  {label: 'Bodega', value: 'Bodega'},
  {label: 'Jefe', value: 'Jefe'},
  {label: 'Técnico', value: 'Técnico'},
]

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
        
        <Select 
        defaultValue = {{ label: 'Selecciona tu perfil', value: 'empty'}}
        options = {perfil}
        />
               
        <input type="password" placeholder="Contraseña"/>
        <input type="password" placeholder="Confirma Contraseña"/>
        <input type="submit" class="btn" value="Enviar"/>
      </form>
    </div>
  );
}
