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

// Función NUCLEAR para borrar cookies
const nuclearCookieClear = () => {
  const domain = window.location.hostname; // ej: mytallerapp.vercel.app
  const domainsToTry = [
    domain,
    `.${domain}`,
    '.vercel.app',
    '' // Sin dominio específico
  ];

  const pathsToTry = ['/', ''];
  
  // Nombres comunes de cookies de sesión
  const cookieNames = ['connect.sid', 'sid', 'session', 'jwt', 'auth_token'];

  cookieNames.forEach(name => {
    domainsToTry.forEach(d => {
      pathsToTry.forEach(p => {
        // Intentamos borrar con diferentes combinaciones
        let cookieString = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${p}`;
        if (d) cookieString += `;domain=${d}`;
        
        // Importante: Las cookies Secure solo se borran si se especifica Secure al borrar? 
        // No necesariamente, pero probemos también sin atributos extra.
        document.cookie = cookieString;
        
        // Versión explícita para producción HTTPS
        if (window.location.protocol === 'https:') {
           document.cookie = `${cookieString};secure`;
        }
      });
    });
  });

  localStorage.clear();
  sessionStorage.clear();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  
  // Estado para bloquear verificación tras logout manual
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Si estamos en proceso de logout, NO verificar sesión
    if (isLoggingOut) {
      setLoading(false);
      return;
    }

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
    
    return () => { isMounted = false; };
  }, [isLoggingOut]);

  const login = async (data) => {
    setIsLoggingOut(false); // Resetear bloqueo
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
    setIsLoggingOut(false);
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
    // 1. BLOQUEAR VERIFICACIÓN INMEDIATAMENTE
    setIsLoggingOut(true);
    
    // 2. LIMPIEZA NUCLEAR ANTES DE LLAMAR AL BACKEND
    // Limpiamos primero localmente para que si el backend falla, ya estamos "fuera"
    nuclearCookieClear();
    setUser(null);
    setIsAuthenticated(false);

    try {
      // Llamamos al backend para limpieza formal (aunque ya limpiamos local)
      await logoutRequest().catch(() => {}); 
    } catch (err) {
      console.error("Logout backend error:", err);
    } finally {
      // 3. SEGUNDA LIMPIEZA POR SEGURIDAD
      nuclearCookieClear();

      // 4. REDIRECCIÓN FORZADA SIN HISTORIAL
      // Usamos un pequeño delay para asegurar que el navegador procese el borrado de cookies
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