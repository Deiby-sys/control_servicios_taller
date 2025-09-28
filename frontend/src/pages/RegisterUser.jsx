// Registro de usuarios

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import emblema from "../images/Emblema.png";
import "../styles/FormStyles.css";

function RegisterUser() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile: null,
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const perfiles = [
    { label: "Admin", value: "Admin" },
    { label: "Asesor", value: "Asesor" },
    { label: "Bodega", value: "Bodega" },
    { label: "Jefe", value: "Jefe" },
    { label: "Técnico", value: "Técnico" },
  ];

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleProfileChange = (option) =>
    setFormData({ ...formData, profile: option ? option.value : null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (!formData.profile) {
      setErrorMsg("Debes seleccionar un perfil");
      setLoading(false);
      return;
    }

    try {
      // Aquí luego conectamos al backend (ej: POST /api/register)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccessMsg("Usuario registrado con éxito, ahora inicia sesión.");
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      setErrorMsg("Error en el registro. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <header>
          <img src={emblema} className="emblema" alt="emblema" />
          <h2>Registro Usuario</h2>
        </header>

        <label htmlFor="name">Nombre:</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Tu nombre completo"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="email">Correo:</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Tu correo"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label htmlFor="profile">Perfil:</label>
        <Select
          options={perfiles}
          placeholder="Selecciona tu perfil"
          onChange={handleProfileChange}
          className="select"
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

        <label htmlFor="confirmPassword">Confirmar Contraseña:</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Repite la contraseña"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        {errorMsg && <p className="error">{errorMsg}</p>}
        {successMsg && <p className="info">{successMsg}</p>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        <ul>
          <li>
            <Link to="/">Volver a Login</Link>
          </li>
          <li>
            <Link to="/recuperar">Recuperar Contraseña</Link>
          </li>
        </ul>
      </form>
    </div>
  );
}

export default RegisterUser;





