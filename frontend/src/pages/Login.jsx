// Logueo a nuestra aplicación

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom"; // 👈 Agrega useLocation
import emblema from "../images/Emblema.png";
import { useAuth } from "../context/AuthContext";
import "../styles/FormStyles.css";

function Login() {
  const { login, errors } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // 👈 Obtiene la ubicación anterior

  // Si el usuario fue redirigido aquí desde una ruta protegida,
  // location.state?.from contendrá esa ruta. Si no, usamos "/".
  const from = location.state?.from?.pathname || "/";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData);
      navigate(from, { replace: true }); // ✅ Redirección dinámica
    } catch (err) {
      // El error ya se maneja en AuthContext
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