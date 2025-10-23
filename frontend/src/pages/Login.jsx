// Logueo a nuestra aplicación

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import emblema from "../images/Emblema.png";
import "../styles/LoginPage.css";
import { useAuth } from "../context/AuthContext";

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
      navigate("/dashboard");
    } catch (err) {
      // El error ya lo maneja AuthContext en `errors`
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit} className="login-form">
        <header>
          <img src={emblema} className="emblema" alt="emblema" />
          <h2>Control Servicios Taller</h2>
        </header>

        <div className="form-group">
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Email registrado"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {/* Errores del contexto */}
        {errors.length > 0 && <p className="error">{errors[0]}</p>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <div className="links">
          <Link to="/recuperar">Recuperar Contraseña</Link>
          <br />
          <Link to="/registerUser">Registro Usuario</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;