// Centralizar en un solo lugar toda la lógica de autenticación (login, logout, registro, perfil)

// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  profileRequest,
} from "../api/auth";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Función auxiliar para borrar cookies
const clearCookies = () => {
  // Obtenemos todas las cookies
  const cookies = document.cookie.split(";");
  
  // Iteramos y las borramos estableciendo una fecha de expiración en el pasado
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    // Borramos la cookie para el dominio actual y la ruta raíz
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    // También intentamos borrarla específicamente para el dominio (a veces necesario en producción)
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.vercel.app";
  });
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
        const res = await profileRequest();
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
    
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (data) => {
    try {
      const res = await loginRequest(data);
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
    } catch (err) {
      setErrors(err.response?.data?.message ? [err.response.data.message] : ["Error en login"]);
    }
  };

  const register = async (data) => {
    try {
      const res = await registerRequest(data);
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
    } catch (err) {
      setErrors(err.response?.data?.message ? [err.response.data.message] : ["Error en registro"]);
    }
  };

  const logout = async () => {
    try {
      // 1. Intentar cerrar sesión en el backend (para invalidar la sesión en el servidor)
      await logoutRequest();
    } catch (err) {
      console.error("Error al cerrar sesión en backend:", err);
      // Continuamos incluso si falla el backend, por seguridad local
    } finally {
      // 2. LIMPIEZA LOCAL AGRESIVA
      setUser(null);
      setIsAuthenticated(false);
      setErrors([]);
      
      // 3. BORRAR COOKIES MANUALMENTE (Crítico para seguridad)
      clearCookies();
      
      // 4. LIMPIAR LOCALSTORAGE (por si acaso hay tokens residuales)
      localStorage.clear();
      sessionStorage.clear();

      // 5. FORZAR RECARGA COMPLETA DEL NAVEGADOR
      // Usamos window.location.replace para que no puedan usar el botón "Atrás"
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, errors, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};