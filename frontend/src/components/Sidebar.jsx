// Sidebar.jsx

import "../styles/Sidebar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="sidebar"> 
      <div className="sidebar__logo">
        <h2>Panel de Control</h2>
      </div>
      <nav className="sidebar__nav">
        <ul>
          <li>
            <button onClick={() => handleNavigation("/dashboard")} className="sidebar__link">
              Inicio
            </button>
          </li>
          <li>
            <button onClick={() => handleNavigation("/ordenes")} className="sidebar__link">
              Órdenes de Trabajo
            </button>
          </li>
          
          {/* SOLO admin, asesor y jefe ven "+ Nueva Orden" */}
          {(user?.profile === 'admin' || user?.profile === 'asesor' || user?.profile === 'jefe') && (
            <li>
              <button onClick={() => handleNavigation("/ordenes/new")} className="sidebar__link">
                + Nueva Orden
              </button>
            </li>
          )}
          
          <li>
            <button onClick={() => handleNavigation("/historial")} className="sidebar__link">
              Histórico
            </button>
          </li>
          
          {/* VEHÍCULOS: solo admin, asesor, jefe */}
          {(user?.profile === 'admin' || user?.profile === 'asesor' || user?.profile === 'jefe') && (
            <li>
              <button onClick={() => handleNavigation("/vehicles")} className="sidebar__link">
                Vehículos
              </button>
            </li>
          )}

          {/* CLIENTES: solo admin, asesor, jefe */}
          {(user?.profile === 'admin' || user?.profile === 'asesor' || user?.profile === 'jefe') && (
            <li>
              <button onClick={() => handleNavigation("/clients")} className="sidebar__link">
                Clientes
              </button>
            </li>
          )}
          
          {/* COTIZADOR: solo admin, asesor, jefe, bodega */}
          {(user?.profile === 'admin' || user?.profile === 'asesor' || user?.profile === 'jefe' || user?.profile === 'bodega') && (
            <li>
              <button onClick={() => handleNavigation("/cotizador")} className="sidebar__link">
                Cotizador
              </button>
            </li>
          )}
          
          {/* USUARIOS: solo admin */}
          {user?.profile === 'admin' && (
            <li>
              <button onClick={() => handleNavigation("/usuarios")} className="sidebar__link">
                Usuarios
              </button>
            </li>
          )}
        </ul>
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;