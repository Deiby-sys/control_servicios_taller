//Recuperar contraseña

// src/pages/RecoverPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import emblema from "../images/Emblema.png";
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
      // Aquí luego conectamos con backend real (ej: /api/recover-password)
      // Por ahora simulamos
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setMessage(
        "Si el correo está registrado, recibirás un enlace para recuperar tu contraseña."
      );
      setEmail("");
    } catch (error) {
      setMessage("Error al intentar recuperar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form"> {/* 👈 Agrega className="login-form" */}
        <header>
          <img src={emblema} className="emblema" alt="emblema" />
          <h2>Recuperar Contraseña</h2>
        </header>

        <div className="form-group"> {/* 👈 Envuelve el input en form-group */}
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Ingresa tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {message && <p className="info">{message}</p>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Procesando..." : "Enviar enlace"}
        </button>

        <div className="links"> {/* Usa la clase links para los enlaces */}
          <Link to="/login">Volver a Login</Link>
          <br />
          <Link to="/registerUser">Registro Usuario</Link>
        </div>
      </form>
    </div>
  );
}

export default RecoverPassword;