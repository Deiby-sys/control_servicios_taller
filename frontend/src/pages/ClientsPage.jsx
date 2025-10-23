// Página de clientes

import { useState, useEffect } from "react";
import { useClients } from "../context/ClientContext";
import { Link } from "react-router-dom";
import "../styles/ClientsPage.css";

function ClientsPage() {
  const { clients, getClients, loading, error, deleteClient, updateClient } = useClients();
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingClient, setEditingClient] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    lastName: "",
    identificationNumber: "",
    phone: "",
    city: "",
    email: "", // Agregado email al formulario de edición
  });

  useEffect(() => {
    getClients();
  }, []);

  useEffect(() => {
    if (!clients.length) return;
    const term = searchTerm.toLowerCase();
    const filtered = clients.filter(
      (client) =>
        client.name.toLowerCase().includes(term) ||
        client.lastName.toLowerCase().includes(term) ||
        client.identificationNumber.toLowerCase().includes(term) ||
        client.phone.toLowerCase().includes(term) ||
        client.city.toLowerCase().includes(term) ||
        (client.email && client.email.toLowerCase().includes(term)) // Agregado email a la búsqueda
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const startEdit = (client) => {
    setEditingClient(client._id);
    setEditForm({
      name: client.name || "",
      lastName: client.lastName || "",
      identificationNumber: client.identificationNumber || "",
      phone: client.phone || "",
      city: client.city || "",
      email: client.email || "", // Agregado email al formulario
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateClient(editingClient, editForm);
      setEditingClient(null);
    } catch (error) {
      console.error("Error al actualizar cliente:", error);
      alert("Error al actualizar cliente: " + error.message);
    }
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`))
      return;
    deleteClient(id);
  };

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  if (loading) return <div className="page">Cargando clientes...</div>;
  if (error) return <div className="page error">Error: {error}</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Gestión de Clientes</h2>
        <Link to="/clients/new" className="btn-primary">
          + Nuevo Cliente
        </Link>
      </div>

      {/* Barra de búsqueda */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre, documento, teléfono, ciudad o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Tabla de clientes */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Documento</th>
              <th>Teléfono</th>
              <th>Ciudad</th>
              <th>Email</th> {/* Nueva columna */}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <tr key={client._id}>
                  {editingClient === client._id ? (
                    <td colSpan="6"> {/* Cambiado de 5 a 6 */}
                      <form onSubmit={handleEditSubmit} className="edit-form-inline">
                        <input
                          name="name"
                          placeholder="Nombre"
                          value={editForm.name}
                          onChange={handleEditChange}
                          required
                        />
                        <input
                          name="lastName"
                          placeholder="Apellido"
                          value={editForm.lastName}
                          onChange={handleEditChange}
                          required
                        />
                        <input
                          name="identificationNumber"
                          placeholder="Documento"
                          value={editForm.identificationNumber}
                          onChange={handleEditChange}
                          required
                        />
                        <input
                          name="phone"
                          placeholder="Teléfono"
                          value={editForm.phone}
                          onChange={handleEditChange}
                          required
                        />
                        <input
                          name="city"
                          placeholder="Ciudad"
                          value={editForm.city}
                          onChange={handleEditChange}
                          required
                        />
                        <input
                          name="email"
                          placeholder="Email"
                          value={editForm.email}
                          onChange={handleEditChange}
                        />
                        <button type="submit" className="btn-save">
                          Guardar
                        </button>
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => setEditingClient(null)}
                        >
                          Cancelar
                        </button>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td>{client.name} {client.lastName}</td>
                      <td>{client.identificationNumber}</td>
                      <td>{client.phone}</td>
                      <td>{client.city}</td>
                      <td>{client.email}</td> {/* Mostrar el email */}
                      <td>
                        <button
                          className="btn-edit"
                          onClick={() => startEdit(client)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(client._id, `${client.name} ${client.lastName}`)}
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
                <td colSpan="6" className="no-data"> {/* Cambiado de 5 a 6 */}
                  <div className="empty-state">
                    <p>No se encontraron clientes</p>
                    <Link to="/clients/new" className="btn-primary btn-small">
                      Registrar Cliente
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

export default ClientsPage;