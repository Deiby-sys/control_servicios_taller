// Sidebar.jsx

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Sidebar.css';

function Sidebar({ isExpanded = true, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
    // Cerrar sidebar solo en móviles pequeños
    if (window.innerWidth <= 480) {
      onClose();
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Solo aplicar clases de colapso en móviles pequeños
  const shouldCollapse = window.innerWidth <= 480;
  const sidebarClasses = [
    'sidebar',
    shouldCollapse && !isExpanded ? 'collapsed' : '',
    shouldCollapse && isExpanded ? 'expanded' : ''
  ].filter(Boolean).join(' ');

  return (
    <nav className={sidebarClasses}>
      <div className="sidebar__logo">
        <h2>Sistema Taller</h2>
      </div>
      
      <div className="sidebar__nav">
        <ul>
          <li>
            <button 
              onClick={() => handleNavigation('/dashboard')}
              className={`sidebar__link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              Tablero
            </button>
          </li>
          
          {/* Órdenes de Trabajo - Todos los perfiles de taller */}
          <li>
            <button 
              onClick={() => handleNavigation('/ordenes')}
              className={`sidebar__link ${isActive('/ordenes') ? 'active' : ''}`}
            >
              Órdenes de Trabajo
            </button>
          </li>
          
          {/* Solo admin, asesor, jefe */}
          {(user?.profile === 'admin' || user?.profile === 'asesor' || user?.profile === 'jefe') && (
            <>
              <li>
                <button 
                  onClick={() => handleNavigation('/ordenes/new')}
                  className={`sidebar__link ${isActive('/ordenes/new') ? 'active' : ''}`}
                >
                  Nueva Orden
                </button>
              </li>
              
              <li>
                <button 
                  onClick={() => handleNavigation('/clients')}
                  className={`sidebar__link ${isActive('/clients') ? 'active' : ''}`}
                >
                  Clientes
                </button>
              </li>
              
              <li>
                <button 
                  onClick={() => handleNavigation('/vehicles')}
                  className={`sidebar__link ${isActive('/vehicles') ? 'active' : ''}`}
                >
                  Vehículos
                </button>
              </li>
            </>
          )}
          
          <li>
            <button 
              onClick={() => handleNavigation('/historial')}
              className={`sidebar__link ${isActive('/historial') ? 'active' : ''}`}
            >
              Histórico
            </button>
          </li>
          
          {/* Cotizador */}
          {(user?.profile === 'admin' || user?.profile === 'asesor' || user?.profile === 'jefe') && (
          <li>
            <button 
              onClick={() => handleNavigation('/cotizador')}
              className={`sidebar__link ${isActive('/cotizador') ? 'active' : ''}`}
            >
              Cotizador
            </button>
          </li>
          )}
          
          {/* Solo admin */}
          {user?.profile === 'admin' && (
            <li>
              <button 
                onClick={() => handleNavigation('/usuarios')}
                className={`sidebar__link ${isActive('/usuarios') ? 'active' : ''}`}
              >
                Usuarios
            </button>
            </li>
          )}
        </ul>
      </div>
      
      <div className="sidebar__footer">
        <button 
          onClick={logout}
          className="sidebar__logout-btn"
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}

export default Sidebar;