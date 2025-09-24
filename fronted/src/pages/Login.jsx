// Logueo a nuestra aplicación

import React, { useState } from "react";
import "./Login.css";
import emblema from "../images/Emblema.png";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { login } = useAuth();   // obtenemos login del contexto
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(formData);      // usamos la función del contexto
      navigate("/profile");       // redirigimos al perfil
    } catch (err) {
      console.error(err);
      setError("Credenciales inválidas o error en el servidor");
    }
  };

  return (
    <div className="Login">
      <form onSubmit={handleSubmit}>
        <header>
          <img src={emblema} className="emblema" alt="emblema" />
          <h1>Control Servicios Taller</h1>
        </header>
        <br />

        <label htmlFor="email">Usuario: </label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Email registrado"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Contraseña: </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {error && <p className="error">{error}</p>}

        <input type="submit" className="btn" value="Ingresar" />

        <ul>
          <li>
            <Link to="/recuperar">Recuperar Contraseña</Link>
          </li>
          <br />
          <li>
            <Link to="/registerUser">Registro Usuario</Link>
          </li>
        </ul>
      </form>
    </div>
  );
}

export default Login;
