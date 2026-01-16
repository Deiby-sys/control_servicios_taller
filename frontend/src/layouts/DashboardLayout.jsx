//Layout compartido

import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Layout.css';

function DashboardLayout() {
  const navigate = useNavigate();
  
  // Estado para controlar si el sidebar está expandido
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Determinar si estamos en móvil muy pequeño
  const isMobileSmall = () => window.innerWidth <= 480;

  // Inicializar el estado según el tamaño de pantalla
  useEffect(() => {
    const updateSidebarState = () => {
      if (isMobileSmall()) {
        setIsSidebarExpanded(false); // Colapsado en móviles pequeños
      } else {
        setIsSidebarExpanded(true);  // Expandido en otros dispositivos
      }
    };

    // Establecer estado inicial
    updateSidebarState();

    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', updateSidebarState);
    
    return () => {
      window.removeEventListener('resize', updateSidebarState);
    };
  }, []);

  const toggleSidebar = () => {
    if (isMobileSmall()) {
      setIsSidebarExpanded(!isSidebarExpanded);
    }
  };

  const closeSidebar = () => {
    if (isMobileSmall()) {
      setIsSidebarExpanded(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Botón hamburguesa (solo en móviles muy pequeños) */}
      {isMobileSmall() && (
        <button 
          className="hamburger-btn"
          onClick={toggleSidebar}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
      )}
      
      <Sidebar 
        isExpanded={isSidebarExpanded}
        onClose={closeSidebar}
      />
      
      <div className="dashboard-content">
        <Header />
        <div className="dashboard-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;