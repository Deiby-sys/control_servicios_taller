//Sidebar (barra lateral)

import "../styles/Sidebar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Añadido 'user'

  // Función para verificar si el usuario tiene un perfil específico
  const hasRole = (roles) => {
    return user && roles.includes(user.profile);
  };

  // Función para navegar sin recargar
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
    <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
      <div className="sidebar__logo">
        <h2>Panel de Control</h2>
      </div>
      <nav className="sidebar__nav">
        <ul>
          {/* Inicio - Todos los perfiles */}
          <li>
            <button
              className="sidebar__link"
              onClick={() => handleNavigation("/dashboard")}
            >
              Inicio
            </button>
          </li>
          
          {/* Órdenes de trabajo - Todos los perfiles de taller */}
          {hasRole(['admin', 'asesor', 'bodega', 'jefe', 'tecnico']) && (
            <li>
              <button
                className="sidebar__link"
                onClick={() => handleNavigation("/ordenes")}
              >
                Órdenes de Trabajo
              </button>
            </li>
          )}
          
          {/* + Nueva Orden - Solo admin, asesor y jefe */}
          {hasRole(['admin', 'asesor', 'jefe']) && (
            <li>
              <button
                className="sidebar__link"
                onClick={() => handleNavigation("/ordenes/new")}
              >
                + Nueva Orden
              </button>
            </li>
          )}
          
          {/* Histórico - Todos los perfiles de taller */}
          {hasRole(['admin', 'asesor', 'bodega', 'jefe', 'tecnico']) && (
            <li>
              <button
                className="sidebar__link"
                onClick={() => handleNavigation("/historial")}
              >
                Histórico
              </button>
            </li>
          )}
          
          {/* Vehículos - Solo admin */}
          {hasRole(['admin']) && (
            <li>
              <button
                className="sidebar__link"
                onClick={() => handleNavigation("/vehicles")}
              >
                Vehículos
              </button>
            </li>
          )}
          
          {/* Clientes - Solo admin */}
          {hasRole(['admin']) && (
            <li>
              <button
                className="sidebar__link"
                onClick={() => handleNavigation("/clients")}
              >
                Clientes
              </button>
            </li>
          )}
          
          {/* Cotizador - Solo admin */}
          {hasRole(['admin']) && (
            <li>
              <button
                className="sidebar__link"
                onClick={() => handleNavigation("/cotizador")}
              >
                Cotizador
              </button>
            </li>
          )}
          
          {/* Usuarios - Solo admin */}
          {hasRole(['admin']) && (
            <li>
              <button
                className="sidebar__link"
                onClick={() => handleNavigation("/usuarios")}
              >
                Usuarios
              </button>
            </li>
          )}
        </ul>
      </nav>

      {/* Botón de cierre de sesión */}
      <div className="sidebar__footer">
        <button className="sidebar__logout-btn" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;