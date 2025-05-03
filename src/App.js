import './App.css';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
        <div className="App">
        <h1>Control Servicios Taller</h1>
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
    </BrowserRouter>
  );
}

export default App;
