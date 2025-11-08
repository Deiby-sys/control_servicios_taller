// Página para mostrar usuarios en dashboard

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Select from "react-select";
import "../styles/UsersManagementPage.css";

function UsersManagementPage() {
  const { logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    lastName: "",
    email: "",
    profile: "",
  });

  const perfiles = [
    { label: "Admin", value: "admin" },
    { label: "Asesor", value: "asesor" },
    { label: "Bodega", value: "bodega" },
    { label: "Jefe", value: "jefe" },
    { label: "Técnico", value: "tecnico" },
  ];

  // Cargar usuarios al montar
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar usuarios cuando cambie la búsqueda
  useEffect(() => {
    if (!users.length) return;
    const term = searchTerm.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users", {
        credentials: 'include',
      });
      
      if (res.status === 401) {
        logout();
        return;
      }
      
      if (!res.ok) throw new Error("Error al cargar usuarios");
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("La respuesta no es JSON válido");
      }

      const data = await res.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar edición de un usuario
  const startEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({
      name: user.name || "",
      lastName: user.lastName || "",
      email: user.email || "",
      profile: user.profile || "",
    });
  };

  // Guardar cambios del usuario editado
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${editingUser}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      
      const updatedUser = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u._id === editingUser ? updatedUser : u))
      );
      setEditingUser(null);
    } catch (err) {
      alert("Error al actualizar: " + err.message);
    }
  };

  // Eliminar un usuario
  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`))
      return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${res.status}`);
      }
      
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setFilteredUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert("Error al eliminar: " + err.message);
    }
  };

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleProfileEditChange = (option) =>
    setEditForm({ ...editForm, profile: option ? option.value : "" });

  if (loading) return <div className="page">Cargando usuarios...</div>;
  if (error) return <div className="page error">Error: {error}</div>;

  return (
    <div className="page">
      <h1>Gestión de Usuarios</h1>

      {/* Barra de búsqueda */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre, apellido o correo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Tabla de usuarios */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Correo</th>
              <th>Perfil</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id}>
                  {editingUser === user._id ? (
                    <td colSpan="5">
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
                        <span className="edit-email">{user.email}</span>
                        <Select
                          options={perfiles}
                          value={perfiles.find((p) => p.value === editForm.profile) || null}
                          onChange={handleProfileEditChange}
                          className="select-small"
                          classNamePrefix="react-select"
                        />
                        <button type="submit" className="btn-save">
                          Guardar
                        </button>
                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={() => setEditingUser(null)}
                        >
                          Cancelar
                        </button>
                      </form>
                    </td>
                  ) : (
                    <>
                      <td>{user.name}</td>
                      <td>{user.lastName}</td>
                      <td>{user.email}</td>
                      <td>{user.profile}</td>
                      <td>
                        <button
                          className="btn-edit"
                          onClick={() => startEdit(user)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(user._id, user.name)}
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
                <td colSpan="5" className="no-data">
                  No se encontraron usuarios
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersManagementPage;