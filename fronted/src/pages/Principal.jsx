import React from 'react';
import './Principal.css';


function PaginaPrincipal() {


return ( 
    <div>   
    {/*<div className="contenedor_cabeza">
        <header>
            <h2 class="titulo">CONTROL SERVICIOS TALLER</h2>
        </header>
    </div> 
        
    <div className="contenedor_menu">
        <img className="emblema" src="imagenes/Emblema.png" alt="Imagen emblema" onclick="irAPaginaEstados()">
        
            <div className="menu">
                <p><a href="clientes">Clientes</a></p>
                <br>
                <p><a href="clientes">Cotizador</a></p>
                <br>
                <p><a href="clientes">Estado</a></p>
                <br>
                <p><a href="clientes">Histórico</a></p>
                <br>
                <p><a href="clientes">Vehículos</a></p>

            </div>
    </div>
         <!-- Archivo JavaScript -->
         <script src="js/emblema.js"></script>
            

    <div className="contenedor_modulos">

        <h2 className="saludo_modulos">ESTADO VEHICULOS</h2>

            <div className="columna">
                <h2>Ingreso</h2>
                <img alt="imagen 1" src="imagenes/Ingreso.png">
            </div>

            <div className="columna">
                <h2>Asignar</h2>
                <img alt="imagen 2" src="imagenes/Asignar.png">
            </div>

            <div className="columna">
                <h2>Asignados</h2>
                <img alt="imagen 3" src="imagenes/Asignados.png">
            </div>

            <br>
    
            <div className="columna">
                <h2>Aprobación</h2>
                <img alt="imagen 4" src="imagenes/Aprobacion.png">
            </div>

            <div className="columna">
                <h2>Repuestos</h2>
                <img alt="imagen 5" src="imagenes/Repuestos.png">
            </div>

            <div className="columna">
                <h2>Listos</h2>
                <img alt="imagen 6" src="imagenes/Listos.png">
            </div>
        </div>

                    
        <div className="contenedor_opciones">
            {/* Atributo onclick: Llama a la función JavaScript irAPagina() cuando se hace clic en la imagen */}
          {/*  <img class="salir" src="imagenes/Salir.png" alt="imagen salir" onclick="irAPaginaIndex()">   */ }

    </div>
        
    );
}

export default PaginaPrincipal;