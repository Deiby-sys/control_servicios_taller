// Centralizar en un solo lugar toda la lógica de autenticación (login, logout, registro, perfil)

// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
// Importamos las funciones de tu API actual (que ya tienen la URL de Render configurada)
import { 
  loginRequest, 
  registerRequest, 
  logoutRequest, 
  profileRequest 
} from "../api/auth"; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// --- FUNCIÓN DE LIMPIEZA MANUAL DE COOKIES (CRÍTICA) ---
// Esta función asegura que la cookie se borre del navegador sin importar lo que haga el backend
const clearAllCookies = () => {
  const cookies = document.cookie.split(";");
  const domain = window.location.hostname; // ej: mytallerapp.vercel.app
  
  cookies.forEach(cookie => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    
    // Intentamos borrar con múltiples combinaciones de dominio y ruta
    // 1. Ruta raíz sin dominio específico
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    
    // 2. Con dominio actual (ej: .mytallerapp.vercel.app)
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${domain}`;
    
    // 3. Con dominio exacto
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${domain}`;
    
    // 4. Dominio genérico de Vercel (por si la cookie se guardó así)
    if (domain.includes('vercel.app')) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.vercel.app`;
    }
  });

  // Limpieza extra de almacenamiento local
  localStorage.clear();
  sessionStorage.clear();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  // Verificar sesión al montar el componente
  useEffect(() => {
    let isMounted = true;
    
    const checkLogin = async () => {
      try {
        // Usamos profileRequest que ya tiene la URL de Render configurada
        const res = await profileRequest(); 
        
        if (isMounted) {
          setUser(res.data);
          setIsAuthenticated(true);
          setErrors([]);
        }
      } catch (err) {
        // Si falla (401), asumimos que no hay sesión válida
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
    // 1. LIMPIEZA MANUAL INMEDIATA (Antes de llamar al backend)
    clearAllCookies();
    
    // 2. Actualizar estado local para bloquear acceso UI
    setUser(null);
    setIsAuthenticated(false);
    setErrors([]);

    try {
      // 3. Llamar al backend para cerrar sesión formalmente
      // Si falla, no importa, ya limpiamos localmente
      await logoutRequest().catch(() => {}); 
    } catch (err) {
      console.error("Error al cerrar sesión en backend:", err);
    } finally {
      // 4. SEGUNDA LIMPIEZA POR SEGURIDAD
      clearAllCookies();

      // 5. REDIRECCIÓN FORZADA SIN HISTORIAL
      // Esto recarga la página y evita el botón "Atrás"
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        errors,
        login,
        register,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};