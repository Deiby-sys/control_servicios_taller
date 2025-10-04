//Es la primera página en ser cargada por la aplicación

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RegisterUser from "./pages/RegisterUser";
import Principal from "./pages/Principal";
import Profile from "./pages/Profile";
import RecoverPassword from "./pages/RecoverPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import ClientsPage from "./pages/ClientsPage"; // Página para listar clientes
import ClientFormPage from "./pages/ClientFormPage"; // Página para crear/editar

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/registerUser" element={<RegisterUser />} />
        <Route path="/recuperar" element={<RecoverPassword />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard y Perfil */}
          <Route path="/principal" element={<Principal />} />
          <Route path="/profile" element={<Profile />} />

          {/* Rutas del MÓDULO CLIENTES */}
          <Route path="/clients" element={<ClientsPage />} /> {/* Listado y CRUD general */}
          <Route path="/clients/new" element={<ClientFormPage />} /> {/* Formulario de creación */}
          <Route path="/clients/:id" element={<ClientFormPage />} /> {/* Formulario de edición */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;