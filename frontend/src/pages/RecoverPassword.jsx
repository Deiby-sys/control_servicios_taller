//Recuperar contraseña

// src/pages/RecoverPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios"; // axios directo
import emblema from "../images/emblema.png";
import "../styles/LoginPage.css";

// Función de URL Base local (independiente de auth.js)
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.trim();
  return import.meta.env.MODE === 'production'
    ? 'https://control-servicios-taller.onrender.com'
    : 'http://localhost:4000';
};

const API_URL = getApiBaseUrl() + '/api';

function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // LLAMADA DIRECTA CON URL ABSOLUTA
      await axios.post(`${API_URL}/auth/forgot-password`, 
        { email }, 
        { withCredentials: true }
      );
      
      setMessage("Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.");
      setEmail("");
    } catch (error) {
      console.error("Error en recuperación:", error);
      const errorMsg = error.response?.data?.message || "Error al intentar recuperar la contraseña.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <header>
          <img src={emblema} className="emblema" alt="emblema" />
          <h2>Recuperar Contraseña</h2>
        </header>

        <div className="form-group">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
          />
        </div>

        {message && (
          <p
            className={message.includes("Error") ? "error" : "info"}
            aria-live="polite"
            style={{ 
              color: message.includes("Error") ? '#dc3545' : '#198754',
              fontWeight: 'bold',
              textAlign: 'center'
            }}
          >
            {message}
          </p>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Procesando..." : "Enviar enlace"}
        </button>

        <div className="links">
          <br />
          <Link to="/login">Volver a Login</Link>
          <br />
        </div>
      </form>
    </div>
  );
}

export default RecoverPassword;