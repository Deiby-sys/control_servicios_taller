//Recuperar contraseña

// src/pages/RecoverPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import emblema from "../images/emblema.png";
import { forgotPasswordRequest } from "../api/auth"; // ✅ Usa auth.js
import "../styles/LoginPage.css";

function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await forgotPasswordRequest(email); // ✅ Usa la función corregida
      setMessage("Si el correo está registrado, recibirás un enlace para recuperar tu contraseña.");
      setEmail("");
    } catch (error) {
      setMessage("Error al intentar recuperar la contraseña.");
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