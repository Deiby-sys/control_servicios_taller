//Layout compartido

import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import "../styles/Layout.css";

function DashboardLayout() {
  
  return (
    /* Clase estática - sin lógica condicional */
    <div className="dashboard-layout">
      <Sidebar /> {/* Sin prop isOpen */}
      <div className="dashboard-content">
        <Header /> {/* Sin prop onToggleSidebar */}
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;