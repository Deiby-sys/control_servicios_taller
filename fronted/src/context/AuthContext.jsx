// Centralizar en un solo lugar toda la lógica de autenticación (login, logout, registro, perfil)

import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios.js"; // configuración base de axios

const AuthContext = createContext();

// Hook para usar el contexto fácilmente
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  // Verificar sesión activa al cargar la app
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await axios.get("/auth/profile", { withCredentials: true });
        setUser(res.data);
        setIsAuthenticated(true);
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  // Función de login
  const login = async (data) => {
    try {
      const res = await axios.post("/auth/login", data, { withCredentials: true });
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
    } catch (err) {
      setErrors(err.response?.data?.message ? [err.response.data.message] : ["Error en login"]);
    }
  };

  // Función de registro
  const register = async (data) => {
    try {
      const res = await axios.post("/auth/register", data, { withCredentials: true });
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
    } catch (err) {
      setErrors(err.response?.data?.message ? [err.response.data.message] : ["Error en registro"]);
    }
  };

  // Función de logout
  const logout = async () => {
    await axios.post("/auth/logout", {}, { withCredentials: true });
    setUser(null);
    setIsAuthenticated(false);
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
      {children}
    </AuthContext.Provider>
  );
};

