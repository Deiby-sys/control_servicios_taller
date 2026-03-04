// Página para ResetPassword

// src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import emblema from "../images/emblema.png";
import { validateResetTokenRequest, resetPasswordRequest } from "../api/auth"; // ✅ Usa auth.js
import "../styles/LoginPage.css";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(null);

  // Validar token al cargar
  useEffect(() => {
    if (!token) return;

    validateResetTokenRequest(token)
      .then(res => {
        setIsValidToken(res.data.valid);
        if (!res.data.valid) {
          setMessage("El enlace ha expirado o es inválido.");
        }
      })
      .catch(() => {
        setIsValidToken(false);
        setMessage("El enlace ha expirado o es inválido.");
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      await resetPasswordRequest(token, password); // ✅ Usa la función corregida
      setMessage("Contraseña actualizada correctamente. Redirigiendo al login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setMessage("Error al restablecer la contraseña. El enlace puede haber expirado.");
    } finally {
      setLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <div className="login-page">
        <div className="login-form">
          <header>
            <img src={emblema} className="emblema" alt="emblema" />
            <h2>Verificando enlace...</h2>
          </header>
          <p>Validando el enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  if (isValidToken === false) {
    return (
      <div className="login-page">
        <div className="login-form">
          <header>
            <img src={emblema} className="emblema" alt="emblema" />
            <h2>Enlace inválido</h2>
          </header>
          <p>{message}</p>
          <Link to="/recuperar" className="btn">Solicitar nuevo enlace</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <header>
          <img src={emblema} className="emblema" alt="emblema" />
          <h2>Nueva Contraseña</h2>
        </header>

        <div className="form-group">
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {message && (
          <p
            className={
              message.includes("correctamente") ? "success" :
              message.includes("Error") ? "error" : "info"
            }
            aria-live="polite"
          >
            {message}
          </p>
        )}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Actualizando..." : "Restablecer contraseña"}
        </button>

        <div className="links">
          <Link to="/login">Volver a Login</Link>
        </div>
      </form>
    </div>
  );
}

export default ResetPassword;