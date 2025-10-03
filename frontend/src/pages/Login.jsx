// Logueo a nuestra aplicación

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import emblema from "../images/Emblema.png";
import { useAuth } from "../context/AuthContext";
import "../styles/FormStyles.css";

function Login() {
  const { login, errors } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      navigate("/principal"); // si login fue exitoso, redirige
    } catch (err) {
      // el error ya lo maneja AuthContext en `errors`
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <header>
          <img src={emblema} className="emblema" alt="emblema" />
          <h2>Control Servicios Taller</h2>
        </header>

        <label htmlFor="email">Correo:</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Email registrado"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Contraseña:</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Contraseña"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {/* Errores del contexto */}
        {errors.length > 0 && <p className="error">{errors[0]}</p>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <p>
          <Link to="/recuperar">Recuperar Contraseña</Link>
        </p>
        <p>
          <Link to="/registerUser">Registro Usuario</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;




