
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { ClientProvider } from "./context/ClientContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <ClientProvider> {/* Envolvemos App con el Proveedor de Clientes */}
        <App />
      </ClientProvider>
    </AuthProvider>
  </StrictMode>
);