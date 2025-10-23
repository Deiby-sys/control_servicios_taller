//Sidebar (barra lateral)

import "../styles/Sidebar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar({ isOpen }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

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
          <li>
            <button
              className="sidebar__link"
              onClick={() => handleNavigation("/dashboard")}
            >
              Inicio
            </button>
          </li>
          <li>
            <button
              className="sidebar__link"
              onClick={() => handleNavigation("/usuarios")}
            >
              Usuarios
            </button>
          </li>
          <li>
            <button
              className="sidebar__link"
              onClick={() => handleNavigation("/clients")}
            >
              Clientes
            </button>
          </li>
          <li>
            <button
              className="sidebar__link"
              onClick={() => handleNavigation("/vehicles")}
            >
              Vehículos
            </button>
          </li>
          <li>
            <button
              className="sidebar__link"
              onClick={() => handleNavigation("/historico")}
            >
              Histórico
            </button>
          </li>
          <li>
            <button
              className="sidebar__link"
              onClick={() => handleNavigation("/ordenes")}
            >
              Órdenes Trabajo
            </button>
          </li>
          <li>
            <button
              className="sidebar__link"
              onClick={() => handleNavigation("/cotizador")}
            >
              Cotizador
            </button>
          </li>
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