//Mensaje de alerta

import React from "react";
import "./AlertMessage.css"; // estilos separados para personalizar

function AlertMessage({ type = "info", message }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      {message}
    </div>
  );
}

export default AlertMessage;