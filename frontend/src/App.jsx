//Es la primera página en ser cargada por la aplicación

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RegisterUser from "./pages/RegisterUser";
import Principal from "./pages/Principal";
import Profile from "./pages/Profile";
import RecoverPassword from "./pages/RecoverPassword";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/registerUser" element={<RegisterUser />} />
        <Route path="/recuperar" element={<RecoverPassword />} />

        {/* Rutas protegidas */}
        <Route
          path="/principal"
          element={
            <ProtectedRoute>
              <Principal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

