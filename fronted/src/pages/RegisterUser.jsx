import React from 'react';
import './RegisterUser.css';
import emblema from '../images/Emblema.png';
import Select from 'react-select';
import {useForm} from 'react-hook-form';
import {registerRequest} from '../api/auth'; //importamos la función para comunicarnos con el backend


function RegisterUser() {


const {register, handleSubmit, setValue} = useForm();

const onSubmit = handleSubmit(async (values) => {
        console.log(values);
        const res = await registerRequest (values)
        console.log(res)
      });

const perfil = [
  {label: "Asesor", value: "Asesor"},
  {label: "Bodega", value: "Bodega"},
  {label: "Jefe", value: "Jefe"},
  {label: "Técnico", value: "Técnico"}
]
  
  return (
    <div>
      <form onSubmit= {onSubmit}>
       <header>
          <img src={emblema} className="emblema" alt="emblema" />
          <h2>Registro Usuario</h2>
       </header>
        <input type="text" {... register("name", {required: true})} placeholder='Nombre'/>
        <input type="text" {... register("lastName", {required: true})} placeholder='Apellido'/>
        {/*select para el perfil*/}        
        <Select
          options={perfil}
          placeholder="Selecciona tu perfil"
          onChange={(selectedOption) => setValue("profile", selectedOption.value)}
        />

        <input type="hidden" {... register("profile")} /> {/* Esto registra el valor*/}

        <input type="text" {... register("email", {required: true})} placeholder='Email'/>
        <input type="password" {... register("password", {required: true})} placeholder='Contraseña'/>
        <button type="submit" className="btn">Enviar</button>
      </form>
    </div>
  );
}
export default RegisterUser;