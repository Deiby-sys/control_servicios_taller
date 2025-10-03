//Recuperar contraseña

import React, { useState } from "react";
import { Link } from "react-router-dom";
import emblema from "../images/Emblema.png";
import "../styles/FormStyles.css";

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
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <header>
          <img src={emblema} className="emblema" alt="emblema" />
          <h2>Recuperar Contraseña</h2>
        </header>

        <label htmlFor="email">Correo registrado:</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Ingresa tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {message && <p className="info">{message}</p>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Procesando..." : "Enviar enlace"}
        </button>

          <p>
            <Link to="/">Volver a Login</Link>
          </p>
          <p>
            <Link to="/registerUser">Registro Usuario</Link>
          </p>
        
      </form>
    </div>
  );
}

export default RecoverPassword;

