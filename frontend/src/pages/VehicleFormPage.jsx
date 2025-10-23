// Formulario vehículos

import { useState, useEffect } from "react";
import { useVehicles } from "../context/VehicleContext";
import { useClients } from "../context/ClientContext";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import "../styles/VehicleFormPage.css";

function VehicleFormPage() {
  const { createVehicle, updateVehicle, vehicles } = useVehicles();
  const { clients, getClients, createClient } = useClients();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [isEditing] = useState(!!id);
  const [formData, setFormData] = useState({
    plate: "",
    vin: "",
    brand: "",
    line: "",
    model: "",
    color: "",
    client: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: "",
    lastName: "",
    identificationNumber: "",
    phone: "",
    city: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Cargar datos para edición
  useEffect(() => {
    if (isEditing) {
      const vehicle = vehicles.find(v => v._id === id);
      if (vehicle) {
        setFormData({
          plate: vehicle.plate,
          vin: vehicle.vin,
          brand: vehicle.brand,
          line: vehicle.line,
          model: vehicle.model.toString(),
          color: vehicle.color,
          client: vehicle.client?._id || ""
        });
      }
    }
  }, [id, isEditing, vehicles]);

  // Cargar clientes
  useEffect(() => {
    getClients();
  }, []);

  // Filtrar clientes
  useEffect(() => {
    if (!clients.length) return;
    const term = searchTerm.toLowerCase();
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        client.lastName.toLowerCase().includes(term) ||
        client.identificationNumber.toLowerCase().includes(term) ||
        client.phone.toLowerCase().includes(term)
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.plate.trim()) {
      newErrors.plate = "La placa es requerida";
    } else if (formData.plate.length !== 6) {
      newErrors.plate = "La placa debe tener exactamente 6 caracteres";
    } else if (!/^[A-Z0-9]+$/.test(formData.plate)) {
      newErrors.plate = "La placa solo puede contener letras mayúsculas y números";
    }

    if (!formData.vin.trim()) newErrors.vin = "El VIN es requerido";
    if (!formData.brand.trim()) newErrors.brand = "La marca es requerida";
    if (!formData.line.trim()) newErrors.line = "La línea es requerida";
    if (!formData.model.trim()) newErrors.model = "El modelo es requerido";
    if (!formData.color.trim()) newErrors.color = "El color es requerido";
    if (!formData.client.trim()) newErrors.client = "Debe seleccionar un cliente";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await updateVehicle(id, { ...formData, model: parseInt(formData.model) });
      } else {
        await createVehicle({ ...formData, model: parseInt(formData.model) });
      }
      navigate("/vehicles");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'plate' ? value.toUpperCase() : value }));
    
    // Limpiar error cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleClientSelect = (clientId) => {
    setFormData(prev => ({ ...prev, client: clientId }));
    setErrors(prev => ({ ...prev, client: "" }));
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      const newClient = await createClient(newClientForm);
      handleClientSelect(newClient._id);
      setShowCreateClientModal(false);
      setNewClientForm({
        name: "",
        lastName: "",
        identificationNumber: "",
        phone: "",
        city: "",
        documentType: ""
      });
    } catch (error) {
      alert("Error al crear cliente: " + error.message);
    }
  };

  const handleNewClientChange = (e) => {
    setNewClientForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <h1>{isEditing ? "Editar Vehículo" : "Registrar Vehículo"}</h1>
        
        <form onSubmit={handleSubmit} className="vehicle-form">
          {/* Placa */}
          <div className="form-group">
            <label htmlFor="plate">Placa *</label>
            <input
              type="text"
              id="plate"
              name="plate"
              value={formData.plate}
              onChange={handleInputChange}
              maxLength="6"
              placeholder="Ej: ABC123"
              className={errors.plate ? "error" : ""}
            />
            {errors.plate && <span className="error-message">{errors.plate}</span>}
          </div>

          {/* VIN */}
          <div className="form-group">
            <label htmlFor="vin">VIN *</label>
            <input
              type="text"
              id="vin"
              name="vin"
              value={formData.vin}
              onChange={handleInputChange}
              placeholder="Número de identificación vehicular"
              className={errors.vin ? "error" : ""}
            />
            {errors.vin && <span className="error-message">{errors.vin}</span>}
          </div>

          {/* Marca */}
          <div className="form-group">
            <label htmlFor="brand">Marca *</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="Toyota, Ford, etc."
              className={errors.brand ? "error" : ""}
            />
            {errors.brand && <span className="error-message">{errors.brand}</span>}
          </div>

          {/* Línea */}
          <div className="form-group">
            <label htmlFor="line">Línea *</label>
            <input
              type="text"
              id="line"
              name="line"
              value={formData.line}
              onChange={handleInputChange}
              placeholder="Corolla, F-150, etc."
              className={errors.line ? "error" : ""}
            />
            {errors.line && <span className="error-message">{errors.line}</span>}
          </div>

          {/* Modelo */}
          <div className="form-group">
            <label htmlFor="model">Modelo *</label>
            <input
              type="number"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              min="1900"
              max={new Date().getFullYear() + 1}
              className={errors.model ? "error" : ""}
            />
            {errors.model && <span className="error-message">{errors.model}</span>}
          </div>

          {/* Color */}
          <div className="form-group">
            <label htmlFor="color">Color *</label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              placeholder="Rojo, Azul, etc."
              className={errors.color ? "error" : ""}
            />
            {errors.color && <span className="error-message">{errors.color}</span>}
          </div>

          {/* Cliente */}
          <div className="form-group">
            <label htmlFor="client">Cliente *</label>
            <div className="client-search-container">
              <input
                type="text"
                placeholder="Buscar cliente por nombre, documento o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="client-search-input"
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowCreateClientModal(true)}
              >
                + Nuevo Cliente
              </button>
            </div>
            
            {/* Lista de clientes */}
            {searchTerm && filteredClients.length > 0 && (
              <div className="client-list">
                {filteredClients.map(client => (
                  <div
                    key={client._id}
                    className="client-item"
                    onClick={() => handleClientSelect(client._id)}
                  >
                    <div>
                      <strong>{client.name} {client.lastName}</strong>
                    </div>
                    <div>Doc: {client.identificationNumber} | Tel: {client.phone}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Cliente seleccionado */}
            {formData.client && (
              <div className="selected-client">
                {clients.find(c => c._id === formData.client) ? (
                  <>
                    <strong>Cliente seleccionado:</strong>
                    <span>
                      {clients.find(c => c._id === formData.client)?.name}{" "}
                      {clients.find(c => c._id === formData.client)?.lastName}
                    </span>
                  </>
                ) : (
                  <span>Cliente no encontrado</span>
                )}
              </div>
            )}

            {errors.client && <span className="error-message">{errors.client}</span>}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/vehicles")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Guardando..." : isEditing ? "Actualizar" : "Registrar"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal para crear cliente */}
      {showCreateClientModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Crear Nuevo Cliente</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowCreateClientModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="modal-form">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="name"
                  value={newClientForm.name}
                  onChange={handleNewClientChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellido *</label>
                <input
                  type="text"
                  name="lastName"
                  value={newClientForm.lastName}
                  onChange={handleNewClientChange}
                  required
                />
              </div>
              <div className="form-row">
                <label>Tipo de Documento *</label>
                <select
                  name="documentType"
                  value={newClientForm.documentType}
                  onChange={handleNewClientChange}
                  required
                >
                  <option value="">Seleccione...</option>
                  <option value="Cédula">Cédula</option>
                  <option value="RUC">RUC</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="NIT">NIT</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div className="form-group">
                <label>Documento *</label>
                <input
                  type="text"
                  name="identificationNumber"
                  value={newClientForm.identificationNumber}
                  onChange={handleNewClientChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Teléfono *</label>
                <input
                  type="text"
                  name="phone"
                  value={newClientForm.phone}
                  onChange={handleNewClientChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Ciudad *</label>
                <input
                  type="text"
                  name="city"
                  value={newClientForm.city}
                  onChange={handleNewClientChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowCreateClientModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default VehicleFormPage;