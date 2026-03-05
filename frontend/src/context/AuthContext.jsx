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

// Función de limpieza agresiva
const clearAllCookies = () => {
  const cookies = document.cookie.split(";");
  const domain = window.location.hostname;
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    // Borrar en todas las variantes posibles
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
  
  // 🔒 CLAVE: Estado para bloquear verificaciones durante el logout
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const checkLogin = async () => {
      // SI ESTAMOS CERRANDO SESIÓN, NO HACER NADA. EVITA EL BUCLE.
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
    
    // La dependencia [isLoggingOut] hace que el efecto se re-ejecute si cambia este estado,
    // permitiéndonos cancelar la verificación si empezamos a logout.
    return () => { isMounted = false; };
  }, [isLoggingOut]);

  const login = async (data) => {
    // Al hacer login manual, desactivamos el bloqueo
    setIsLoggingOut(false);
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
    setIsLoggingOut(false);
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
    // 1. ACTIVAR EL CANDADO INMEDIATAMENTE
    setIsLoggingOut(true);
    
    // 2. LIMPIEZA LOCAL AGRESIVA
    clearAllCookies();
    setUser(null);
    setIsAuthenticated(false);
    setErrors([]);

    try {
      // 3. LLAMADA AL BACKEND (Ignoramos errores aquí para no bloquear la salida)
      await axios.post(`${API_URL}/auth/logout`, {}, { 
        withCredentials: true 
      }).catch(() => {});
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // 4. SEGUNDA LIMPIEZA POR SEGURIDAD
      clearAllCookies();
      
      // 5. REDIRECCIÓN FORZADA CON PEQUEÑO RETRASO
      // Esperamos 200ms para asegurar que el navegador procese el borrado de cookies
      setTimeout(() => {
        window.location.replace('/login');
      }, 200);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, errors, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};