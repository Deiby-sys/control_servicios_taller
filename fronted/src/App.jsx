//Es la primera página en ser cargada por la aplicación

import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import RegisterUser from "./pages/RegisterUser";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/registerUser" element={<RegisterUser />} />

          {/* Rutas protegidas */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <h1>ProfileUser</h1>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workorders"
            element={
              <ProtectedRoute>
                <h1>WorkOrdersPage</h1>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workorders/new"
            element={
              <ProtectedRoute>
                <h1>NewWorkOrder</h1>
              </ProtectedRoute>
            }
          />
          <Route
            path="/workorders/:id"
            element={
              <ProtectedRoute>
                <h1>UpdateWorkOrder</h1>
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;