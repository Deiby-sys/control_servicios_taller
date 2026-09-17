// Historial órdenes de trabajo

import { useState, useEffect } from "react";
import axios from "axios";
import { useWorkOrders } from "../context/WorkOrderContext";
import Select from "react-select";
import { Link } from "react-router-dom";
import { utils, writeFile } from "xlsx";
import "../styles/WorkOrderHistoryPage.css";

// Cantidad de órdenes por página
const ORDERS_PER_PAGE = 20;

// Función de URL Base
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl.trim();

  return import.meta.env.MODE === "production"
    ? "https://api.mytallerapp.com"
    : "http://localhost:4000";
};

const API_URL = getApiBaseUrl() + "/api";

function WorkOrderHistoryPage() {
  const { workOrders, getWorkOrders, loading, error } = useWorkOrders();

  const [historial, setHistorial] = useState([]);
  const [filteredHistorial, setFilteredHistorial] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchAssignee, setSearchAssignee] = useState(null);

  // Filtros de fecha
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [users, setUsers] = useState([]);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);

  // =========================================================
  // CARGAR ÓRDENES Y USUARIOS
  // =========================================================

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        await getWorkOrders();
      } catch (error) {
        console.error("Error al cargar historial:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/public`, {
          withCredentials: true,
        });

        const userData = response.data;

        if (!Array.isArray(userData)) {
          throw new Error("La respuesta no es un array");
        }

        setUsers(
          userData.map((u) => ({
            value: u._id,
            label: `${u.name} ${u.lastName}`,
          }))
        );
      } catch (error) {
        console.error(
          "Error al cargar usuarios (Status:",
          error.response?.status,
          "):",
          error.message
        );

        setUsers([]);
      }
    };

    fetchHistorial();
    fetchUsers();
  }, []);

  // =========================================================
  // SINCRONIZAR HISTORIAL CON workOrders
  // =========================================================

  useEffect(() => {
    // Historial ahora contiene TODAS las órdenes,
    // incluyendo las entregadas.
    setHistorial(Array.isArray(workOrders) ? workOrders : []);
  }, [workOrders]);

  // =========================================================
  // FILTRAR HISTORIAL
  // =========================================================

  useEffect(() => {
    let filtered = [...historial];

    // Buscar por placa, cliente o solicitud
    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      filtered = filtered.filter((order) => {
        const plate = order.vehicle?.plate?.toLowerCase() || "";

        const clientName = order.client
          ? `${order.client.name || ""} ${order.client.lastName || ""}`.toLowerCase()
          : "";

        const serviceRequest =
          order.serviceRequest?.toLowerCase() || "";

        return (
          plate.includes(term) ||
          clientName.includes(term) ||
          serviceRequest.includes(term)
        );
      });
    }

    // Filtrar por responsable
    if (searchAssignee) {
      filtered = filtered.filter((order) =>
        order.assignedTo?.some(
          (user) => user._id === searchAssignee.value
        )
      );
    }

    // Filtrar desde fecha
    if (startDate) {
      const start = new Date(`${startDate}T00:00:00`);

      filtered = filtered.filter((order) => {
        if (!order.entryDate) return false;

        const entryDate = new Date(order.entryDate);

        return entryDate >= start;
      });
    }

    // Filtrar hasta fecha
    if (endDate) {
      const end = new Date(`${endDate}T23:59:59`);

      filtered = filtered.filter((order) => {
        if (!order.entryDate) return false;

        const entryDate = new Date(order.entryDate);

        return entryDate <= end;
      });
    }

    setFilteredHistorial(filtered);

    // Cada cambio de filtro vuelve a la primera página
    setCurrentPage(1);
  }, [
    searchTerm,
    searchAssignee,
    startDate,
    endDate,
    historial,
  ]);

  // =========================================================
  // PAGINACIÓN
  // =========================================================

  const totalPages = Math.ceil(
    filteredHistorial.length / ORDERS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;

  const paginatedHistorial = filteredHistorial.slice(
    startIndex,
    startIndex + ORDERS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
  };

  // =========================================================
  // LIMPIAR FILTROS
  // =========================================================

  const clearFilters = () => {
    setSearchTerm("");
    setSearchAssignee(null);
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  // =========================================================
  // EXPORTAR A EXCEL
  // =========================================================

  const exportToExcel = () => {
    if (filteredHistorial.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    // Se exportan TODOS los resultados filtrados,
    // no solamente los 20 visibles en la página.
    const dataToExport = filteredHistorial.map((order) => {
      const diasEnTaller =
        order.deliveryDate && order.entryDate
          ? Math.ceil(
              (new Date(order.deliveryDate) -
                new Date(order.entryDate)) /
                (1000 * 60 * 60 * 24)
            )
          : 0;

      return {
        "Fecha Ingreso": order.entryDate
          ? new Date(order.entryDate).toLocaleDateString("es-CO")
          : "",

        Placa: order.vehicle?.plate || "",

        Cliente: order.client
          ? `${order.client.name || ""} ${
              order.client.lastName || ""
            }`.trim()
          : "",

        Solicitud: order.serviceRequest || "",

        Estado: order.status || "",

        Responsable:
          order.assignedTo
            ?.map((user) => `${user.name} ${user.lastName}`)
            .join(", ") || "Sin asignar",

        "Fecha Entrega": order.deliveryDate
          ? new Date(order.deliveryDate).toLocaleDateString("es-CO")
          : "",

        "Días en Taller": diasEnTaller,
      };
    });

    const worksheet = utils.json_to_sheet(dataToExport);
    const workbook = utils.book_new();

    utils.book_append_sheet(
      workbook,
      worksheet,
      "Historial Órdenes"
    );

    writeFile(workbook, "historial_ordenes.xlsx");
  };

  // =========================================================
  // INFORMACIÓN DE PAGINACIÓN
  // =========================================================

  const firstVisibleOrder =
    filteredHistorial.length === 0 ? 0 : startIndex + 1;

  const lastVisibleOrder = Math.min(
    startIndex + ORDERS_PER_PAGE,
    filteredHistorial.length
  );

  // =========================================================
  // ESTADOS DE CARGA / ERROR
  // =========================================================

  if (loading) {
    return <div className="page">Cargando historial...</div>;
  }

  if (error) {
    return <div className="page error">Error: {error}</div>;
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="page">

      <div className="page-header">
        <h1>
          Historial de Órdenes ({filteredHistorial.length})
        </h1>

        <button
          className="btn-primary"
          onClick={exportToExcel}
        >
          📊 Exportar a Excel
        </button>
      </div>

      {/* =====================================================
          FILTROS
      ====================================================== */}

      <div className="search-container">

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por placa, cliente o solicitud..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="advanced-search">
          <Select
            options={users}
            value={searchAssignee}
            onChange={setSearchAssignee}
            placeholder="Filtrar por responsable..."
            className="search-select"
            isClearable
            noOptionsMessage={() => "No hay usuarios"}
          />
        </div>

        {/* Fecha desde */}
        <div className="date-filter">
          <label>Desde</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        {/* Fecha hasta */}
        <div className="date-filter">
          <label>Hasta</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={clearFilters}
        >
          Limpiar filtros
        </button>

      </div>

      {/* =====================================================
          TABLA
      ====================================================== */}

      <div className="table-container">
        <table className="data-table">

          <thead>
            <tr>
              <th>Fecha Ingreso</th>
              <th>Placa</th>
              <th>Cliente</th>
              <th>Solicitud</th>
              <th>Estado</th>
              <th>Responsable</th>
              <th>Fecha Entrega</th>
              <th>Días en Taller</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            {paginatedHistorial.length > 0 ? (

              paginatedHistorial.map((order) => {

                const diasEnTaller =
                  order.deliveryDate && order.entryDate
                    ? Math.ceil(
                        (new Date(order.deliveryDate) -
                          new Date(order.entryDate)) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0;

                return (
                  <tr key={order._id}>

                    <td>
                      {order.entryDate
                        ? new Date(
                            order.entryDate
                          ).toLocaleDateString("es-CO")
                        : "N/A"}
                    </td>

                    <td>
                      {order.vehicle?.plate || ""}
                    </td>

                    <td>
                      {order.client?.name || ""}{" "}
                      {order.client?.lastName || ""}
                    </td>

                    <td>
                      {order.serviceRequest || ""}
                    </td>

                    <td>
                      {order.status || ""}
                    </td>

                    <td>
                      {order.assignedTo &&
                      order.assignedTo.length > 0
                        ? order.assignedTo
                            .map(
                              (user) =>
                                `${user.name} ${user.lastName}`
                            )
                            .join(", ")
                        : "Sin asignar"}
                    </td>

                    <td>
                      {order.deliveryDate
                        ? new Date(
                            order.deliveryDate
                          ).toLocaleDateString("es-CO")
                        : "N/A"}
                    </td>

                    <td>{diasEnTaller}</td>

                    <td>
                      <Link
                        to={`/ordenes/${order._id}`}
                        className="btn-view"
                      >
                        Ver Detalle
                      </Link>
                    </td>

                  </tr>
                );
              })

            ) : (

              <tr>
                <td colSpan="9" className="no-data">
                  No hay órdenes que coincidan con los filtros
                </td>
              </tr>

            )}

          </tbody>
        </table>
      </div>

      {/* =====================================================
          PAGINACIÓN
      ====================================================== */}

      {filteredHistorial.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              marginTop: "20px",
              flexWrap: "wrap",
            }}
          >

            <button
              type="button"
              className="btn-secondary"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Anterior
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (

              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                style={{
                  minWidth: "36px",
                  padding: "8px 10px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  cursor: "pointer",
                  background:
                    currentPage === page
                      ? "#333"
                      : "#fff",
                  color:
                    currentPage === page
                      ? "#fff"
                      : "#333",
                }}
              >
                {page}
              </button>

            ))}

            <button
              type="button"
              className="btn-secondary"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Siguiente →
            </button>

          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: "10px",
              fontSize: "14px",
            }}
          >
            Mostrando {firstVisibleOrder}–{lastVisibleOrder} de{" "}
            {filteredHistorial.length} órdenes
          </div>
        </>
      )}

    </div>
  );
}

export default WorkOrderHistoryPage;