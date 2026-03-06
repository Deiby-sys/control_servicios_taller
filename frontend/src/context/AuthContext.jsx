// Centralizar en un solo lugar toda la lógica de autenticación (login, logout, registro, perfil)
// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.trim();
  return import.meta.env.MODE === 'production'
    ? 'https://control-servicios-taller.onrender.com'
    : 'http://localhost:4000';
};

const API_URL = getApiBaseUrl() + '/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const checkLogin = async () => {
      if (isLoggingOut) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/auth/profile`, { 
          withCredentials: true 
        });
        
        if (isMounted) {
          setUser(res.data);
          setIsAuthenticated(true);
          setErrors([]);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkLogin();
    return () => { isMounted = false; };
  }, [isLoggingOut]);

  const login = async (data) => {
    setIsLoggingOut(false);
    setErrors([]); // Limpiar errores previos
    try {
      const res = await axios.post(`${API_URL}/auth/login`, data, { 
        withCredentials: true 
      });
      
      // SOLO entramos si el backend respondió 200 OK
      setUser(res.data);
      setIsAuthenticated(true);
      
    } catch (err) {
      // SI HAY ERROR, MOSTRAMOS EL MENSAJE Y LANZAMOS EXCEPCIÓN
      const msg = err.response?.data?.message || "Credenciales incorrectas";
      setErrors([msg]);
      
      // IMPORTANTE: Lanzamos el error para que Login.jsx sepa que falló
      throw new Error(msg); 
    }
  };

  const register = async (data) => {
    setIsLoggingOut(false);
    setErrors([]);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, data, { 
        withCredentials: true 
      });
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Error en registro";
      setErrors([msg]);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    setUser(null);
    setIsAuthenticated(false);
    setErrors([]);

    try {
      await axios.post(`${API_URL}/auth/logout`, {}, { 
        withCredentials: true 
      }).catch(() => {}); // Ignorar errores de red en logout
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, errors, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};