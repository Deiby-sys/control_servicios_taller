
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Control Servicios Taller</h1>
      <form>
            <label htmlFor="Usuario">Usuario: </label>       
            <input type="email" id="Usuario" email="Usuario" placeholder="Email registrado"/>
            <label htmlFor="Contraseña">Contraseña: </label>
            <input type="password" id="Contraseña"/>
            <input type="submit" class="btn" value="Ingresar"/>
            {/*<p><a href="#">Recuperar contraseña</a></p>
            <p><a href="registro_usuario.html">Registro nuevo usuario</a></p>*/}
      </form>
        
    </div>
  );
}

export default App;
