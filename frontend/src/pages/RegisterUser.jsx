// Registro de usuarios

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import "../styles/FormStyles.css";
import { useAuth } from "../context/AuthContext";

function RegisterUser() {
  const navigate = useNavigate();
  const { register, errors } = useAuth();

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
    { label: "Admin", value: "admin" },
    { label: "Asesor", value: "asesor" },
    { label: "Bodega", value: "bodega" },
    { label: "Jefe", value: "jefe" },
    { label: "Técnico", value: "tecnico" },
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
      
      // Redirigir a la página de gestión de usuarios después del registro
      navigate("/usuarios", { replace: true });
    } catch (error) {
      // errores vienen de AuthContext → `errors`
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/usuarios");
  };

  return (
    <div className="page">
      <div className="form-container">
        <h1>Registro de Nuevo Usuario</h1>
        
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-group">
            <label htmlFor="name">Nombre:</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Nombre completo"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Apellido:</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Apellido completo"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo:</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="profile">Perfil:</label>
            <Select
              options={perfiles}
              placeholder="Selecciona el perfil"
              onChange={handleProfileChange}
              className="select"
              classNamePrefix="react-select"
              isClearable={false}
            />
          </div>

          <div className="form-group">
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
          </div>

          <div className="form-group">
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
          </div>

          {/* Errores desde AuthContext */}
          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((err, index) => (
                <p key={index} className="error">{err}</p>
              ))}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterUser;


