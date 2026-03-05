// Centralizar en un solo lugar toda la lógica de autenticación (login, logout, registro, perfil)

// src/context/AuthProvider.jsx
import { createContext, useContext, useState, useEffect } from "react";
import {
  loginRequest,
  registerRequest,
  logoutRequest,
  profileRequest,
  verifyAuth
} from "../api/auth"; // Usa auth.js, no axios.js

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    let isMounted = true;
    
    const checkLogin = async () => {
      try {
        const res = await profileRequest(); // Usa profileRequest()
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
      const res = await loginRequest(data); // Usa loginRequest()
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
    } catch (err) {
      setErrors(err.response?.data?.message ? [err.response.data.message] : ["Error en login"]);
    }
  };

  const register = async (data) => {
    try {
      const res = await registerRequest(data); // Usa registerRequest()
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
    } catch (err) {
      setErrors(err.response?.data?.message ? [err.response.data.message] : ["Error en registro"]);
    }
  };

  const logout = async () => {
  try {
    await apiClient.post('/auth/logout'); // Llama al backend para invalidar la sesión
  } catch (error) {
    console.error("Error al cerrar sesión en backend:", error);
  } finally {
    // Limpieza LOCAL obligatoria
    localStorage.removeItem('token'); // Si usas tokens
    localStorage.removeItem('user');
    
    // Redirección forzada
    window.location.href = '/login'; 
    // Usar window.location.href recarga la página completa y asegura que el estado de React se resetee
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