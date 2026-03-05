// Centralizar en un solo lugar toda la lógica de autenticación (login, logout, registro, perfil)
// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios"; // Usamos axios directo

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Función para obtener la URL base (igual que en tus archivos de API)
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.trim();
  return import.meta.env.MODE === 'production'
    ? 'https://control-servicios-taller.onrender.com' // Sin espacios
    : 'http://localhost:4000';
};

const API_URL = getApiBaseUrl() + '/api';

// --- FUNCIÓN DE LIMPIEZA MANUAL DE COOKIES (CRÍTICA PARA SEGURIDAD) ---
const clearAllCookies = () => {
  const cookies = document.cookie.split(";");
  const domain = window.location.hostname;
  
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    // Borrar con múltiples combinaciones para asegurar
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${domain}`;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`;
    if (domain.includes('vercel.app')) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.vercel.app`;
    }
  });
  localStorage.clear();
  sessionStorage.clear();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    const checkLogin = async () => {
      try {
        // Llamada directa con axios, igual que tu versión antigua que funcionaba
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
  }, []);

  const login = async (data) => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, data, { 
        withCredentials: true 
      });
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
    } catch (err) {
      setErrors(err.response?.data?.message ? [err.response.data.message] : ["Error en login"]);
    }
  };

  const register = async (data) => {
    try {
      const res = await axios.post(`${API_URL}/auth/register`, data, { 
        withCredentials: true 
      });
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
    } catch (err) {
      setErrors(err.response?.data?.message ? [err.response.data.message] : ["Error en registro"]);
    }
  };

  const logout = async () => {
    // 1. LIMPIEZA MANUAL INMEDIATA (Antes de llamar al backend)
    clearAllCookies();
    setUser(null);
    setIsAuthenticated(false);
    setErrors([]);

    try {
      // 2. Llamada directa al backend para cerrar sesión
      await axios.post(`${API_URL}/auth/logout`, {}, { 
        withCredentials: true 
      }).catch(() => {}); // Ignorar errores de red aquí
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // 3. SEGUNDA LIMPIEZA POR SEGURIDAD
      clearAllCookies();
      
      // 4. REDIRECCIÓN FORZADA SIN HISTORIAL
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, errors, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};