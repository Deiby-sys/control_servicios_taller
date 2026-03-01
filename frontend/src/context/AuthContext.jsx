// Centralizar en un solo lugar toda la lógica de autenticación (login, logout, registro, perfil)

import { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios.js";

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
        const res = await axios.get("/auth/profile", { withCredentials: true });
        if (isMounted) {
          setUser(res.data);
          setIsAuthenticated(true);
          setErrors([]);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
          setIsAuthenticated(false);
          // No establecer errores aquí para evitar bucles
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
      const res = await axios.post("/auth/login", data, { withCredentials: true });
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
    } catch (err) {
      setErrors(err.response?.data?.message ? [err.response.data.message] : ["Error en login"]);
    }
  };

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

  const logout = async () => {
    try {
      await axios.post("/auth/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setErrors([]);
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