// Centralizar en un solo lugar toda la lógica de autenticación (login, logout, registro, perfil)

import { createContext, useContext, useEffect, useState } from 'react';
// Importamos las funciones que ya tienen la lógica de URL de producción/Vite
import { verifyAuth, loginRequest } from '../api/auth'; 

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Función para verificar si el usuario ya está logueado al cargar la página
  const checkAuth = async () => {
    try {
      // Usamos verifyAuth() que viene de '../api/auth'
      const response = await verifyAuth(); 
      setIsAuthenticated(true);
      // Asegúrate de usar .user si tu backend devuelve { user: {...} }
      setUser(response.data.user || response.data); 
    } catch (error) {
      console.error("Error de verificación:", error.message);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      // Usamos loginRequest() que viene de '../api/auth'
      const res = await loginRequest(credentials);
      setIsAuthenticated(true);
      setUser(res.data.user || res.data);
      return res.data;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error; 
    }
  };

  const logout = async () => {
  try {
    // Intentamos avisar al servidor
    await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
  } catch (error) {
    console.error("Error al avisar al servidor del logout", error);
  } finally {
    // ESTO ES LO IMPORTANTE: Limpiamos el estado local pase lo que pase
    setIsAuthenticated(false);
    setUser(null);
    // Forzamos la redirección manual si es necesario
    window.location.href = "/login";
  }
};

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};