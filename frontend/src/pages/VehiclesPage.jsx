// Página listado vehículos

import { useState, useEffect } from "react";
import { useVehicles } from "../context/VehicleContext";
import { Link } from "react-router-dom";
import "../styles/VehiclesPage.css";

function VehiclesPage() {
  const { vehicles, getVehicles, loading, error, deleteVehicle, updateVehicle } = useVehicles();
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editForm, setEditForm] = useState({
    plate: "",
    vin: "",
    brand: "",
    line: "",
    model: "",
    color: "",
    client: ""
  });

  useEffect(() => {
    getVehicles();
  }, []);

  useEffect(() => {
    if (!vehicles.length) return;
    const term = searchTerm.toLowerCase();
    const filtered = vehicles.filter(
      (vehicle) =>
        vehicle.plate.toLowerCase().includes(term) ||
        vehicle.vin.toLowerCase().includes(term) ||
        vehicle.brand.toLowerCase().includes(term) ||
        vehicle.line.toLowerCase().includes(term) ||
        vehicle.client?.name?.toLowerCase().includes(term) ||
        vehicle.client?.lastName?.toLowerCase().includes(term)
    );
    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);

  const startEdit = (vehicle) => {
    setEditingVehicle(vehicle._id);
    setEditForm({
      plate: vehicle.plate || "",
      vin: vehicle.vin || "",
      brand: vehicle.brand || "",
      line: vehicle.line || "",
      model: vehicle.model || "",
      color: vehicle.color || "",
      client: vehicle.client?._id || ""
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateVehicle(editingVehicle, editForm);
      setEditingVehicle(null);
    } catch (error) {
      alert("Error al actualizar vehículo: " + error.message);
    }
  };

  const handleDelete = (id, plate) => {
    if (!window.confirm(`¿Eliminar el vehículo ${plate}? Esta acción no se puede deshacer.`))
      return;
    deleteVehicle(id);
  };

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  if (loading) return <div className="page">Cargando vehículos...</div>;
  if (error) return <div className="page error">Error: {error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Gestión de Vehículos</h2>
        <Link to="/vehicles/new" className="btn-primary">
          + Nuevo Vehículo
        </Link>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por placa, VIN, marca, línea o cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>VIN</th>
              <th>Marca/Línea</th>
              <th>Modelo</th>
              <th>Color</th>
              <th>Cliente</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <tr key={vehicle._id}>
                  {editingVehicle === vehicle._id ? (
                    <td colSpan="7">
                      <form onSubmit={handleEditSubmit} className="edit-form-inline">
                        <input
                          name="plate"
                          placeholder="Placa (6 caracteres)"
                          value={editForm.plate}
                          onChange={handleEditChange}
                          required
                          maxLength="6"
                        />
                        <input
                          name="vin"
                          placeholder="VIN"
                          value={editForm.vin}
                          onChange={handleEditChange}
                          required
                        />
                        <input
                          name="brand"
                          placeholder="Marca"
                          value={editForm.brand}
                          onChange={handleEditChange}
                          required
                        />
                        <input
                          name="line"
                          placeholder="Línea"
                          value={editForm.line}
                          onChange={handleEditChange}
                          required
                        />
                        <input
                          name="model"
                          placeholder="Modelo"
                          type="number"
                          value={editForm.model}
                          onChange={handleEditChange}
                          required
                        />
                        <input
                          name="color"
                          placeholder="Color"
                          value={editForm.color}
                          onChange={handleEditChange}
                          required
                        />
                        <input
                          name="client"
                          placeholder="ID Cliente"
                          value={editForm.client}
                          onChange={handleEditChange}
                          required
                        />
                        <button type="submit" className="btn-save">
                          Guardar
                        </button>
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => setEditingVehicle(null)}
                        >
                          Cancelar
                        </button>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td>{vehicle.plate}</td>
                      <td>{vehicle.vin}</td>
                      <td>{vehicle.brand} / {vehicle.line}</td>
                      <td>{vehicle.model}</td>
                      <td>{vehicle.color}</td>
                      <td>
                        {vehicle.client ? 
                          `${vehicle.client.name} ${vehicle.client.lastName}` : 
                          "Cliente no encontrado"
                        }
                      </td>
                      <td>
                        <button
                          className="btn-edit"
                          onClick={() => startEdit(vehicle)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(vehicle._id, vehicle.plate)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  <div className="empty-state">
                    <p>No se encontraron vehículos</p>
                    <Link to="/vehicles/new" className="btn-primary btn-small">
                      Registrar Vehículo
                    </Link>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VehiclesPage;