// Logueo a nuestra aplicación

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import emblema from "../images/Emblema.png";
import { useAuth } from "../context/AuthContext";
import "../styles/FormStyles.css"; // ahora usamos estilos centralizados

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      await login(formData);
      navigate("/principal"); // redirige al dashboard
    } catch (err) {
      setErrorMsg("Credenciales inválidas");
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

        {errorMsg && <p className="error">{errorMsg}</p>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        <ul>
          <li>
            <Link to="/recuperar">Recuperar Contraseña</Link>
          </li>
          <li>
            <Link to="/registerUser">Registro Usuario</Link>
          </li>
        </ul>
      </form>
    </div>
  );
}

export default Login;


