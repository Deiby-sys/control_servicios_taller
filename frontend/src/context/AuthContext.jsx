// Centralizar en un solo lugar toda la lógica de autenticación (login, logout, registro, perfil)

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // Tip: guarda los datos del usuario aquí

  // CENTRALIZAR URL (Vite usa import.meta.env)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/verify`, {
        withCredentials: true
      });
      // Si el backend responde con éxito
      setIsAuthenticated(true);
      setUser(response.data.user); 
    } catch (error) {
      console.error("Error de verificación:", error.message);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      // Solo dejamos de cargar cuando la petición termine (bien o mal)
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, credentials, {
        withCredentials: true
      });
      setIsAuthenticated(true);
      setUser(res.data.user);
      return res.data;
    } catch (error) {
      setIsAuthenticated(false);
      throw error; // Re-lanzar para que el formulario de login muestre el error
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    } finally {
      // Siempre limpiar el estado local aunque el servidor falle
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};