// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { ClientProvider } from "./context/ClientContext";
import { VehicleProvider } from "./context/VehicleContext";
import { WorkOrderProvider } from "./context/WorkOrderContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ClientProvider>
          <VehicleProvider>
            <WorkOrderProvider>
              <App />
            </WorkOrderProvider>
          </VehicleProvider>
        </ClientProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);