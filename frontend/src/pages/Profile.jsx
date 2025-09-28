// Es la página a la que enviamos al usuario después de iniciar sesión

import React, { useState, useEffect } from "react";
import "../styles/FormStyles.css";

function Profile() {
  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    // Simulación: datos cargados del backend
    setUser({ name: "Juan Pérez", email: "juanperez@mail.com" });
  }, []);

  return (
    <div className="form-container">
      <h2 className="form-title">Perfil de Usuario</h2>
      <p><strong>Nombre:</strong> {user.name}</p>
      <p><strong>Correo:</strong> {user.email}</p>
      <button className="btn">Cerrar sesión</button>
    </div>
  );
}

export default Profile;


