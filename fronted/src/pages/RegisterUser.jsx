// Registro de usuarios

import React, { useState } from "react";
import "./RegisterUser.css";
import emblema from "../images/Emblema.png";
import Select from "react-select";
import { useForm } from "react-hook-form";
import { registerRequest } from "../api/auth";
import { useNavigate } from "react-router-dom";
import AlertMessage from "../components/AlertMessage";

function RegisterUser() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await registerRequest(values);

      if (res.status === 201) {
        setSuccessMsg("Usuario registrado con éxito 🎉");
        setTimeout(() => navigate("/"), 2000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Error al registrar usuario");
    } finally {
      setLoading(false);
    }
  });

  const perfil = [
    { label: "Admin", value: "Admin" },
    { label: "Asesor", value: "Asesor" },
    { label: "Bodega", value: "Bodega" },
    { label: "Jefe", value: "Jefe" },
    { label: "Técnico", value: "Técnico" },
  ];

  return (
    <div className="RegisterUser">
      <form onSubmit={onSubmit}>
        <header>
          <img src={emblema} className="emblema" alt="emblema" />
          <h2>Registro Usuario</h2>
        </header>

        <label htmlFor="name">Nombre:</label>
        <input
          type="text"
          id="name"
          {...register("name", { required: "El nombre es obligatorio" })}
          placeholder="Nombre"
        />
        {errors.name && <AlertMessage type="error">{errors.name.message}</AlertMessage>}

        <label htmlFor="lastName">Apellido:</label>
        <input
          type="text"
          id="lastName"
          {...register("lastName", { required: "El apellido es obligatorio" })}
          placeholder="Apellido"
        />
        {errors.lastName && <AlertMessage type="error">{errors.lastName.message}</AlertMessage>}

        <label htmlFor="profile">Perfil:</label>
        <Select
          options={perfil}
          placeholder="Selecciona tu perfil"
          onChange={(option) => setValue("profile", option.value)}
        />
        <input type="hidden" {...register("profile", { required: true })} />
        {errors.profile && <AlertMessage type="error">El perfil es obligatorio</AlertMessage>}

        <label htmlFor="email">Correo:</label>
        <input
          type="email"
          id="email"
          {...register("email", {
            required: "El correo es obligatorio",
            pattern: { value: /^\S+@\S+$/i, message: "Correo inválido" },
          })}
          placeholder="Email"
        />
        {errors.email && <AlertMessage type="error">{errors.email.message}</AlertMessage>}

        <label htmlFor="password">Contraseña:</label>
        <input
          type="password"
          id="password"
          {...register("password", {
            required: "La contraseña es obligatoria",
            minLength: { value: 6, message: "Mínimo 6 caracteres" },
          })}
          placeholder="Contraseña"
        />
        {errors.password && <AlertMessage type="error">{errors.password.message}</AlertMessage>}

        {errorMsg && <AlertMessage type="error">{errorMsg}</AlertMessage>}
        {successMsg && <AlertMessage type="success">{successMsg}</AlertMessage>}

        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Registrando..." : "Enviar"}
        </button>
      </form>
    </div>
  );
}

export default RegisterUser;
