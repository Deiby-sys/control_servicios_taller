// Centralizar en un solo lugar toda la lógica de autenticación (login, logout, registro, perfil)

import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      // Usa la URL dinámica desde .env
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      const response = await axios.get(`${API_URL}/api/auth/verify`, {
        withCredentials: true // ← ¡clave para enviar cookies!
      });
      setIsAuthenticated(response.data.authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    const res = await axios.post(`${API_URL}/api/auth/login`, credentials, {
      withCredentials: true
    });
    setIsAuthenticated(true);
    return res.data;
  };

  const logout = async () => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
    await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};