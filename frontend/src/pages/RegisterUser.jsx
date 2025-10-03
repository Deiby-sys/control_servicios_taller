// Registro de usuarios

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import emblema from "../images/Emblema.png";
import "../styles/FormStyles.css";
import { useAuth } from "../context/AuthContext";

function RegisterUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, errors } = useAuth(); // usamos register del contexto

  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile: null,
  });

  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setLoading(false);
      return alert("Las contraseñas no coinciden");
    }

    if (!formData.profile) {
      setLoading(false);
      return alert("Debes seleccionar un perfil");
    }

    try {
      await register(formData);

      // Redirección después de registro
      const from = location.state?.from?.pathname || "/principal";
      navigate(from, { replace: true });
    } catch (error) {
      // errores vienen de AuthContext → `errors`
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

        <label htmlFor="lastName">Apellido:</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          placeholder="Tu apellido completo"
          value={formData.lastName}
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
          classNamePrefix="react-select"
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

        {/* Errores desde AuthContext */}
        {errors.length > 0 && <p className="error">{errors[0]}</p>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        <p>
          <Link to="/">Volver a Login</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterUser;


