// Formulario para crear órdenes de trabajo

import { useState, useEffect, useRef } from "react";
import { useWorkOrders } from "../context/WorkOrderContext";
import { useClients } from "../context/ClientContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SignatureCanvas from 'react-signature-canvas';
import generateWorkOrderPDF from '../components/WorkOrderPDFGenerator';
import "../styles/WorkOrderFormPage.css";

function WorkOrderFormPage() {
  const { createWorkOrder, getVehicleByPlate, getClientByIdentification } = useWorkOrders();
  const { getClients } = useClients();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados
  const [formData, setFormData] = useState({
    plate: "",
    vehicle: "",
    currentMileage: "",
    serviceRequest: "",
  });
  const [vehicleData, setVehicleData] = useState(null);
  const [clientData, setClientData] = useState(null);
  const [clientIdentification, setClientIdentification] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const signatureRef = useRef();

  // Cargar clientes al iniciar (vehículos se cargan dinámicamente por placa)
  useEffect(() => {
    const loadClients = async () => {
      try {
        await getClients();
      } catch (error) {
        console.error("Error al cargar clientes:", error);
      }
    };
    loadClients();
  }, []);

  // Validación del formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.plate.trim()) newErrors.plate = "La placa es requerida";
    if (!formData.vehicle) newErrors.vehicle = "Debe buscar y seleccionar un vehículo válido";
    if (!formData.currentMileage) newErrors.currentMileage = "El kilometraje es requerido";
    if (!formData.serviceRequest.trim()) newErrors.serviceRequest = "La solicitud es requerida";
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      newErrors.signature = "Debe firmar digitalmente";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Buscar vehículo por placa
  const handleSearchVehicle = async () => {
    if (!formData.plate.trim()) return;
    const cleanPlate = formData.plate.trim().toUpperCase();

    setSearching(true);
    setVehicleData(null);
    setClientData(null);

    try {
      const vehicle = await getVehicleByPlate(cleanPlate);
      setVehicleData(vehicle);
      setClientData(vehicle.client);
      setFormData(prev => ({ ...prev, vehicle: vehicle._id }));
      setErrors(prev => ({ ...prev, vehicle: "", client: "" }));
    } catch (error) {
      if (error.response?.status === 404) {
        alert("Vehículo no encontrado. Si es nuevo, busque primero el cliente por identificación.");
        setFormData(prev => ({ ...prev, vehicle: "" }));
      } else {
        console.error("Error al buscar vehículo:", error);
      }
    } finally {
      setSearching(false);
    }
  };

  // Buscar cliente por identificación
  const handleSearchClient = async () => {
    if (!clientIdentification.trim()) return;

    setSearching(true);
    setClientData(null);
    setVehicleData(null);

    try {
      const client = await getClientByIdentification(clientIdentification.trim());
      setClientData(client);
      alert(`Cliente ${client.name} ${client.lastName} encontrado. Ahora puede registrar el vehículo.`);
      setErrors(prev => ({ ...prev, client: "" }));
    } catch (error) {
      if (error.response?.status === 404) {
        alert("Cliente no encontrado. Debe registrar al cliente antes de crear un vehículo nuevo.");
      } else {
        console.error("Error al buscar cliente:", error);
      }
    } finally {
      setSearching(false);
    }
  };

  // Crear orden de trabajo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Validación: asegurar que se haya cargado vehicleData
      if (!vehicleData) {
        throw new Error("Debe buscar y seleccionar un vehículo válido");
      }

      // Verificar órdenes activas usando vehicleData.plate &t=${Date.now()} añade un parámetro único en cada petición, evitando el caché
      const checkResponse = await fetch(`/api/orders/exists?plate=${vehicleData.plate}&t=${Date.now()}`, {
      credentials: 'include'
      });

      if (!checkResponse.ok) {
        throw new Error("Error al verificar órdenes existentes");
      }

      const { exists } = await checkResponse.json();
      if (exists) {
        alert(`Ya existe una orden activa para la placa ${vehicleData.plate}. No se puede crear otra hasta que se entregue la actual.`);
        setLoading(false);
        return;
      }

      // Crear orden
      const signatureData = signatureRef.current.getCanvas().toDataURL('image/png');
      const createdOrder = await createWorkOrder({
        vehicle: formData.vehicle,
        currentMileage: parseInt(formData.currentMileage),
        serviceRequest: formData.serviceRequest,
        clientSignature: signatureData
      });

      // Generar PDF
      setTimeout(() => {
        generateWorkOrderPDF(createdOrder);
      }, 1000);

      navigate("/ordenes");
    } catch (error) {
      console.error("Error al crear orden:", error);
      alert("Error: " + (error.message || "No se pudo crear la orden"));
    } finally {
      setLoading(false);
    }
  };

  // Limpiar firma
  const handleClearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
    }
  };

  // Renderizado
  return (
    <div className="form-page">
      <div className="form-container">
        <h1>Nueva Orden de Trabajo</h1>

        <form onSubmit={handleSubmit} className="work-order-form">
          {/* Búsqueda por placa */}
          <div className="form-group">
            <label>Placa del Vehículo *</label>
            <div className="plate-search">
              <input
                type="text"
                value={formData.plate}
                onChange={(e) => setFormData(prev => ({ ...prev, plate: e.target.value }))}
                placeholder="Ingrese la placa"
                className={errors.plate ? "error" : ""}
                maxLength="6"
                required
              />
              <button
                type="button"
                onClick={handleSearchVehicle}
                disabled={searching || !formData.plate.trim()}
              >
                {searching ? "Buscando..." : "Buscar Placa"}
              </button>
            </div>
            {errors.plate && <span className="error-message">{errors.plate}</span>}
          </div>

          {/* Sección de Búsqueda de Cliente (Visible si el vehículo no se encontró) */}
          {!vehicleData && (
            <div className="form-group client-search-section">
              <label>Identificación del Cliente</label>
              <div className="plate-search">
                <input
                  type="text"
                  value={clientIdentification}
                  onChange={(e) => setClientIdentification(e.target.value)}
                  placeholder="Buscar cliente por Cédula/NIT"
                />
                <button type="button" onClick={handleSearchClient} disabled={searching}>
                  {searching ? "Buscando..." : "Buscar Cliente"}
                </button>
              </div>
              {errors.client && <span className="error-message">{errors.client}</span>}
            </div>
          )}

          {/* Datos del vehículo/cliente */}
          {(vehicleData || clientData) && (
            <div className="vehicle-info">
              <h3>Datos {vehicleData ? 'del Vehículo' : 'del Cliente'}</h3>
              <div className="vehicle-grid">
                {vehicleData && (
                  <>
                    <div><strong>VIN:</strong> {vehicleData.vin}</div>
                    <div><strong>Marca:</strong> {vehicleData.brand}</div>
                    <div><strong>Línea:</strong> {vehicleData.line}</div>
                    <div><strong>Modelo:</strong> {vehicleData.model}</div>
                    <div><strong>Color:</strong> {vehicleData.color}</div>
                  </>
                )}
                <div><strong>Cliente:</strong>
                  {clientData
                    ? `${clientData.name} ${clientData.lastName} (${clientData.identificationNumber})`
                    : "N/A"}
                </div>
              </div>
            </div>
          )}

          {/* Kilometraje */}
          <div className="form-group">
            <label>Kilometraje Actual *</label>
            <input
              type="number"
              value={formData.currentMileage}
              onChange={(e) => setFormData(prev => ({ ...prev, currentMileage: e.target.value }))}
              placeholder="Ingrese el kilometraje actual"
              className={errors.currentMileage ? "error" : ""}
              min="0"
              required
            />
            {errors.currentMileage && <span className="error-message">{errors.currentMileage}</span>}
          </div>

          {/* Solicitud */}
          <div className="form-group">
            <label>Solicitud del Ingreso al Taller *</label>
            <textarea
              value={formData.serviceRequest}
              onChange={(e) => setFormData(prev => ({ ...prev, serviceRequest: e.target.value }))}
              placeholder="Describa detalladamente el servicio solicitado..."
              className={errors.serviceRequest ? "error" : ""}
              rows="4"
              required
            />
            {errors.serviceRequest && <span className="error-message">{errors.serviceRequest}</span>}
          </div>

          {/* Firma digital */}
          <div className="form-group">
            <label>Firma del Cliente *</label>
            <div className="signature-container">
              <SignatureCanvas
                ref={signatureRef}
                penColor='black'
                canvasProps={{ width: 500, height: 200, className: 'signature-canvas' }}
              />
              <div className="signature-actions">
                <button type="button" onClick={handleClearSignature}>
                  Limpiar Firma
                </button>
              </div>
            </div>
            {errors.signature && <span className="error-message">{errors.signature}</span>}
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate("/ordenes")} className="btn-cancel">
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !formData.vehicle}
            >
              {loading ? "Creando Orden..." : "Crear Orden de Trabajo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WorkOrderFormPage;