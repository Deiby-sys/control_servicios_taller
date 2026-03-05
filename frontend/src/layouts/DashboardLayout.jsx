// src/layouts/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/Layout.css';

function DashboardLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Detecta móviles pequeños (portrait o landscape)
  const isMobileSmall = () => {
    return window.matchMedia('(max-width: 480px), (max-height: 500px)').matches;
  };

  useEffect(() => {
    const updateSidebarState = () => {
      if (isMobileSmall()) {
        setIsSidebarExpanded(false);
      } else {
        setIsSidebarExpanded(true);
      }
    };

    updateSidebarState();

    const mediaQuery = window.matchMedia('(max-width: 480px), (max-height: 500px)');
    const handleMediaChange = () => updateSidebarState();

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
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
      {/* Botón hamburguesa: solo en móviles pequeños (portrait o landscape) */}
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