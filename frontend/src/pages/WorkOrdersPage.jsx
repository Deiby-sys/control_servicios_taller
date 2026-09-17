// Página de órdenes de trabajo

import { useState, useEffect } from "react";
import { useWorkOrders } from "../context/WorkOrderContext";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import Select from "react-select";
import { utils, writeFile } from "xlsx";
import "../styles/WorkOrdersPage.css";
import { getStatusLabel } from "../utils/statusLabels";
import { parseDateSafe } from "../utils/dateHelpers";

function WorkOrdersPage() {
  const { workOrders, getWorkOrders, loading, error } = useWorkOrders();
  const { user } = useAuth();

  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatus, setSearchStatus] = useState(null);
  const [searchAssignee, setSearchAssignee] = useState(null);
  const [users, setUsers] = useState([]);

  // Paginación
  const ORDERS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Estados que representan órdenes actualmente en taller.
  // Debe coincidir con el cálculo de totalEnTaller del dashboard.
  const workshopStatuses = [
    "por_asignar",
    "asignado",
    "en_aprobacion",
    "por_repuestos",
    "en_soporte",
    "en_proceso",
    "baterias",
    "completado"
  ];

  const statusOptions = [
    { value: "por_asignar", label: "Jefe" },
    { value: "asignado", label: "Diagnóstico" },
    { value: "en_aprobacion", label: "Asesor" },
    { value: "por_repuestos", label: "Repuestos" },
    { value: "en_soporte", label: "Soporte Técnico" },
    { value: "en_proceso", label: "Proceso Técnico" },
    { value: "baterias", label: "Baterías" },
    { value: "completado", label: "Listo para Entrega" }
  ];

  // Obtener órdenes
  useEffect(() => {
    getWorkOrders();
  }, []);

  // Obtener responsables desde las órdenes cargadas
  useEffect(() => {
    if (!workOrders.length) {
      setUsers([]);
      return;
    }

    const responsiblesMap = new Map();

    workOrders.forEach((order) => {
      if (order.assignedTo && order.assignedTo.length > 0) {
        order.assignedTo.forEach((u) => {
          if (u?._id && u?.name && u?.lastName) {
            if (!responsiblesMap.has(u._id)) {
              responsiblesMap.set(u._id, {
                value: u._id,
                label: `${u.name} ${u.lastName}`
              });
            }
          }
        });
      }
    });

    const responsiblesList = Array.from(responsiblesMap.values()).sort(
      (a, b) => a.label.localeCompare(b.label)
    );

    setUsers(responsiblesList);
  }, [workOrders]);

  // Aplicar filtros
  useEffect(() => {
    if (!workOrders.length) {
      setFilteredOrders([]);
      return;
    }

    // Primero: solamente órdenes que están actualmente en taller.
    let filtered = workOrders.filter((order) =>
      workshopStatuses.includes(order.status)
    );

    // Filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();

      filtered = filtered.filter(
        (order) =>
          order.vehicle?.plate?.toLowerCase().includes(term) ||
          order.client?.name?.toLowerCase().includes(term) ||
          order.serviceRequest?.toLowerCase().includes(term)
      );
    }

    // Filtro por estado
    if (searchStatus) {
      filtered = filtered.filter(
        (order) => order.status === searchStatus.value
      );
    }

    // Filtro por responsable
    if (searchAssignee) {
      filtered = filtered.filter((order) =>
        order.assignedTo?.some(
          (u) => u._id === searchAssignee.value
        )
      );
    }

    setFilteredOrders(filtered);

    // Cada vez que cambia un filtro, volvemos a la primera página.
    setCurrentPage(1);
  }, [
    searchTerm,
    searchStatus,
    searchAssignee,
    workOrders
  ]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSearchStatus(null);
    setSearchAssignee(null);
    setCurrentPage(1);
  };

  // ============================
  // PAGINACIÓN
  // ============================

  const totalPages = Math.ceil(
    filteredOrders.length / ORDERS_PER_PAGE
  );

  const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;

  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + ORDERS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // ============================
  // EXPORTAR A EXCEL
  // ============================

  const exportToExcel = () => {
    if (filteredOrders.length === 0) {
      alert("No hay datos para exportar con los filtros actuales");
      return;
    }

    // IMPORTANTE:
    // Exportamos todas las órdenes filtradas,
    // no solamente las 20 de la página actual.
    const dataToExport = filteredOrders.map((order) => {
      const orderStatus = (order.status || "").toLowerCase();
      let diasEnTaller = 0;

      try {
        const entryDate = parseDateSafe(order.entryDate);

        if (orderStatus === "entregado" && order.deliveryDate) {
          const deliveryDate = parseDateSafe(order.deliveryDate);

          if (
            !isNaN(entryDate.getTime()) &&
            !isNaN(deliveryDate.getTime())
          ) {
            diasEnTaller = Math.ceil(
              (deliveryDate - entryDate) /
                (1000 * 60 * 60 * 24)
            );
          }
        } else {
          const today = new Date();

          if (!isNaN(entryDate.getTime())) {
            diasEnTaller = Math.ceil(
              (today - entryDate) /
                (1000 * 60 * 60 * 24)
            );
          }
        }
      } catch (e) {
        diasEnTaller = 0;
      }

      return {
        "Fecha Ingreso": parseDateSafe(
          order.entryDate
        ).toLocaleDateString("es-CO"),

        Placa: order.vehicle?.plate || "",

        Cliente: order.client
          ? `${order.client.name} ${order.client.lastName}`
          : "No asignado",

        Kilometraje: order.currentMileage
          ? order.currentMileage.toLocaleString()
          : "0",

        Solicitud: order.serviceRequest || "",

        Estado: getStatusLabel(order.status),

        Responsable:
          order.assignedTo &&
          order.assignedTo.length > 0
            ? order.assignedTo
                .map(
                  (u) => `${u.name} ${u.lastName}`
                )
                .join(", ")
            : "Sin asignar",

        "Días en Taller": diasEnTaller
      };
    });

    const worksheet = utils.json_to_sheet(dataToExport);
    const workbook = utils.book_new();

    utils.book_append_sheet(
      workbook,
      worksheet,
      "Órdenes de Trabajo"
    );

    const fileName = `ordenes_trabajo_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;

    writeFile(workbook, fileName);
  };

  if (loading) {
    return (
      <div className="page">
        Cargando órdenes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page error">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="page">

      {/* ============================
          ENCABEZADO
      ============================ */}

      <div className="page-header">
        <h1>
          Órdenes de Trabajo ({filteredOrders.length})
        </h1>

        {(user?.profile === "admin" ||
          user?.profile === "asesor" ||
          user?.profile === "jefe") && (
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center"
            }}
          >
            <button
              onClick={exportToExcel}
              className="btn-primary"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9rem",
                padding: "0.6rem 1.2rem"
              }}
            >
              📊 Exportar a Excel
            </button>

            <Link
              to="/ordenes/new"
              className="btn-primary"
            >
              + Nueva Orden
            </Link>
          </div>
        )}
      </div>

      {/* ============================
          FILTROS
      ============================ */}

      <div className="search-container">

        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar por placa, cliente o solicitud..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            className="search-input"
          />
        </div>

        <div className="advanced-search">

          <Select
            options={statusOptions}
            value={searchStatus}
            onChange={setSearchStatus}
            placeholder="Filtrar por estado..."
            className="search-select"
            isClearable
          />

          <Select
            options={users}
            value={searchAssignee}
            onChange={setSearchAssignee}
            placeholder="Filtrar por responsable..."
            className="search-select"
            isClearable
            noOptionsMessage={() =>
              "No hay responsables disponibles"
            }
          />

        </div>

        {(searchStatus || searchAssignee || searchTerm) && (
          <button
            onClick={handleClearFilters}
            className="btn-secondary clear-filters"
          >
            Limpiar Filtros
          </button>
        )}

      </div>

      {/* ============================
          TABLA
      ============================ */}

      <div className="table-container">

        <table className="data-table">

          <thead>
            <tr>
              <th>Placa</th>
              <th>Cliente</th>
              <th>Kilometraje</th>
              <th>Solicitud</th>
              <th>Estado</th>
              <th>Responsable</th>
              <th>Fecha Ingreso</th>
              <th>Días en Taller</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>

            {paginatedOrders.length > 0 ? (

              paginatedOrders.map((order) => {

                const orderStatus =
                  (order.status || "").toLowerCase();

                let diasEnTaller = 0;

                try {
                  const entryDate =
                    parseDateSafe(order.entryDate);

                  if (
                    orderStatus === "entregado" &&
                    order.deliveryDate
                  ) {
                    const deliveryDate =
                      parseDateSafe(
                        order.deliveryDate
                      );

                    if (
                      !isNaN(entryDate.getTime()) &&
                      !isNaN(deliveryDate.getTime())
                    ) {
                      diasEnTaller = Math.ceil(
                        (deliveryDate - entryDate) /
                          (1000 * 60 * 60 * 24)
                      );
                    }

                  } else {

                    const today = new Date();

                    if (
                      !isNaN(entryDate.getTime())
                    ) {
                      diasEnTaller = Math.ceil(
                        (today - entryDate) /
                          (1000 * 60 * 60 * 24)
                      );
                    }
                  }

                } catch (e) {
                  console.error(
                    "Error calculando días en taller:",
                    e
                  );
                  diasEnTaller = 0;
                }

                return (
                  <tr key={order._id}>

                    <td>
                      {order.vehicle?.plate}
                    </td>

                    <td>
                      {order.client
                        ? `${order.client.name} ${order.client.lastName}`
                        : "Cliente no asignado"}
                    </td>

                    <td>
                      {order.currentMileage?.toLocaleString() ||
                        "0"}
                    </td>

                    <td>
                      {order.serviceRequest}
                    </td>

                    <td>
                      <span
                        className={`status status-${order.status.replace(
                          /_/g,
                          "-"
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>

                    <td>
                      {order.assignedTo &&
                      order.assignedTo.length > 0
                        ? order.assignedTo
                            .map(
                              (u) =>
                                `${u.name} ${u.lastName}`
                            )
                            .join(", ")
                        : "Sin asignar"}
                    </td>

                    <td>
                      {parseDateSafe(
                        order.entryDate
                      ).toLocaleDateString("es-CO")}
                    </td>

                    <td>
                      {diasEnTaller}
                    </td>

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
                <td
                  colSpan="9"
                  className="no-data"
                >
                  No se encontraron órdenes
                </td>
              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* ============================
          PAGINACIÓN
      ============================ */}

      {totalPages > 1 && (
        <div
          className="pagination"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1.5rem",
            flexWrap: "wrap"
          }}
        >

          <button
            className="btn-secondary"
            onClick={() =>
              handlePageChange(
                Math.max(1, currentPage - 1)
              )
            }
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
              onClick={() =>
                handlePageChange(page)
              }
              className={
                page === currentPage
                  ? "btn-primary"
                  : "btn-secondary"
              }
            >
              {page}
            </button>

          ))}

          <button
            className="btn-secondary"
            onClick={() =>
              handlePageChange(
                Math.min(
                  totalPages,
                  currentPage + 1
                )
              )
            }
            disabled={
              currentPage === totalPages
            }
          >
            Siguiente →
          </button>

        </div>
      )}

      {filteredOrders.length > 0 && (
        <div
          style={{
            textAlign: "center",
            marginTop: "0.75rem",
            fontSize: "0.9rem"
          }}
        >
          Mostrando{" "}
          {startIndex + 1}–
          {Math.min(
            startIndex + ORDERS_PER_PAGE,
            filteredOrders.length
          )}{" "}
          de {filteredOrders.length} órdenes
        </div>
      )}

    </div>
  );
}

export default WorkOrdersPage;