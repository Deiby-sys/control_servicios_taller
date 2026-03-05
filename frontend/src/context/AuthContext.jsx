// Centralizar en un solo lugar toda la lógica de autenticación (login, logout, registro, perfil)

// src/context/AuthProvider.jsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  loginRequest,
  registerRequest,
  logoutRequest, // Importamos la función preparada
  profileRequest,
} from "../api/auth"; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  // Verificar sesión al cargar la app
  useEffect(() => {
    let isMounted = true;
    
    const checkLogin = async () => {
      try {
        // Intenta obtener el perfil. Si falla (401), significa que no hay sesión válida
        const res = await profileRequest(); 
        if (isMounted) {
          setUser(res.data);
          setIsAuthenticated(true);
          setErrors([]);
        }
      } catch (err) {
        // Si falla, limpiamos todo
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
      // Opcional: Redirigir aquí si quieres, pero usualmente lo hace el ProtectedRoute
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
      // 1. Llamamos al backend para destruir la sesión (cookie)
      await logoutRequest(); 
    } catch (err) {
      console.error("Error al cerrar sesión en backend:", err);
      // Incluso si falla el backend, limpiamos localmente por seguridad
    } finally {
      // 2. Limpiamos el estado local inmediatamente
      setUser(null);
      setIsAuthenticated(false);
      setErrors([]);

      // 3. FORZAMOS RECARGA COMPLETA DEL NAVEGADOR
      // Esto es CLAVE: window.location.href recarga la página desde cero,
      // asegurando que no quede ningún estado en memoria de React.
      window.location.href = '/login';
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