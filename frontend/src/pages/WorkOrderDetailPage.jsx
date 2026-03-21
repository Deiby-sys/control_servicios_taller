// Página detalle órdenes de trabajo

import { useState, useEffect } from "react";
import axios from "axios";
import { useWorkOrders } from "../context/WorkOrderContext";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import generateWorkOrderPDF from '../components/WorkOrderPDFGenerator';
import "../styles/WorkOrderDetailPage.css";
import { getStatusLabel } from "../utils/statusLabels";

// FUNCIÓN DE URL BASE
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.REACT_APP_API_URL;
  if (envUrl) return envUrl.trim();
  return import.meta.env.MODE === 'production'
    ? 'https://control-servicios-taller.onrender.com'
    : 'http://localhost:4000';
};

const API_URL = getApiBaseUrl() + '/api';

function WorkOrderDetailPage() {
  const { id } = useParams();
  const { 
    workOrders, 
    getWorkOrderById, 
    updateWorkOrderStatus, 
    addNoteToWorkOrder,
    uploadAttachment,
    downloadAttachment,
    deleteAttachment,
    deliverWorkOrder
  } = useWorkOrders();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAssignees, setSelectedAssignees] = useState([]);
  const [users, setUsers] = useState([]);

  // Estados disponibles
  const statusOptions = [
    { value: 'por_asignar', label: 'Jefe' },
    { value: 'asignado', label: 'Diagnóstico' },
    { value: 'en_aprobacion', label: 'Asesor' },
    { value: 'por_repuestos', label: 'Repuestos' },
    { value: 'en_soporte', label: 'Soporte Técnico' },
    { value: 'en_proceso', label: 'Proceso Técnico' },
    { value: 'completado', label: 'Listo para Entrega' },
    { value: 'entregado', label: 'Entregado' }
  ];

  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        setLoading(true);
        const order = await getWorkOrderById(id);
        setWorkOrder(order);
        setSelectedStatus(order.status);
        
        const assigneeIds = order.assignedTo?.map(u => u._id) || [];
        setSelectedAssignees(assigneeIds);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      try {
        // USA LA URL ABSOLUTA CORRECTA
        const response = await axios.get(`${API_URL}/users/public`, {
          withCredentials: true
        });
        
        const userData = response.data;
        
        if (!Array.isArray(userData)) {
          throw new Error("La respuesta no es un array de usuarios");
        }

        setUsers(userData.map(u => ({ 
          value: u._id, 
          label: `${u.name} ${u.lastName} (${u.profile})` 
        })));
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        setUsers([]); 
      }
    };

    if (id) {
      fetchWorkOrder();
      fetchUsers();
    }
  }, [id]);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const updatedOrder = await addNoteToWorkOrder(id, { content: newNote });
      setWorkOrder(updatedOrder);
      setNewNote("");
    } catch (error) {
      alert("Error al agregar nota: " + error.message);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const updatedOrder = await updateWorkOrderStatus(id, {
        status: selectedStatus,
        assignedTo: selectedAssignees
      });
      setWorkOrder(updatedOrder);
      alert("Orden actualizada correctamente");
    } catch (error) {
      alert("Error al actualizar orden: " + error.message);
    }
  };

  const handleUploadAttachment = async (file) => {
    try {
      const updatedOrder = await uploadAttachment(workOrder._id, file);
      setWorkOrder(updatedOrder);
      alert('Archivo subido correctamente');
    } catch (error) {
      alert('Error al subir archivo: ' + error.message);
    }
  };

  const handleDeleteAttachment = async (fileId) => {
    if (window.confirm('¿Estás seguro de eliminar este archivo?')) {
      try {
        await deleteAttachment(workOrder._id, fileId);
        setWorkOrder(prevOrder => ({
          ...prevOrder,
          attachments: prevOrder.attachments.filter(att => att._id !== fileId)
        }));
        alert('Archivo eliminado correctamente');
      } catch (error) {
        console.error('Error al eliminar archivo:', error);
        alert('Error al eliminar archivo: ' + (error.message || 'Error desconocido'));
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status) => {
    const colors = {
      'por_asignar': '#6c757d',
      'asignado': '#0d6efd',
      'en_aprobacion': '#ffc107',
      'por_repuestos': '#fd7e14',
      'en_soporte': '#20c997',
      'en_proceso': '#20c997',
      'completado': '#198754',
      'entregado': '#28a745'
    };
    return colors[status] || '#6c757d';
  };

  if (loading) return <div className="page">Cargando orden de trabajo...</div>;
  if (error) return <div className="page error">Error: {error}</div>;
  if (!workOrder) return <div className="page">Orden no encontrada</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Orden de Trabajo</h1>
          <h2>{workOrder.orderNumber}</h2>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => generateWorkOrderPDF(workOrder)}
            className="btn-primary"
            style={{ marginRight: '0.5rem' }}
          >
            📄 Descargar PDF
          </button>
          
          {workOrder.status === 'completado' && 
            ['admin', 'asesor', 'jefe'].includes(user?.profile) && (
            <button 
              onClick={() => navigate(`/ordenes/${workOrder._id}/entregar`)}
              className="btn-primary"
              style={{ marginRight: '0.5rem' }}
            >
              🚗 Entregar Vehículo
            </button>
          )}
          
          <button 
            onClick={() => navigate('/ordenes')}
            className="btn-secondary"
          >
            ← Volver a Órdenes
          </button>
        </div>
      </div>

      <div className="order-info">
        <div className="info-card">
          <h3>Información General</h3>
          <div className="info-grid">
            <div><strong>Fecha de Ingreso:</strong> {new Date(workOrder.entryDate).toLocaleString('es-CO')}</div>
            <div><strong>Estado:</strong> 
              <span 
                className={`status-badge status-${workOrder.status.replace(/_/g, '-')}`}
                style={{ backgroundColor: getStatusColor(workOrder.status) }}
              >
                {getStatusLabel(workOrder.status)}
              </span>
            </div>
            <div><strong>Creado por:</strong> {workOrder.createdBy?.name} {workOrder.createdBy?.lastName}</div>
          </div>
        </div>

        <div className="info-card">
          <h3>Vehículo</h3>
          <div className="info-grid">
            <div><strong>Placa:</strong> {workOrder.vehicle?.plate}</div>
            <div><strong>VIN:</strong> {workOrder.vehicle?.vin}</div>
            <div><strong>Marca:</strong> {workOrder.vehicle?.brand}</div>
            <div><strong>Línea:</strong> {workOrder.vehicle?.line}</div>
            <div><strong>Modelo:</strong> {workOrder.vehicle?.model}</div>
            <div><strong>Color:</strong> {workOrder.vehicle?.color}</div>
          </div>
        </div>

        <div className="info-card">
          <h3>Cliente</h3>
          <div className="info-grid">
            <div><strong>Nombre:</strong> {workOrder.client?.name} {workOrder.client?.lastName}</div>
            <div><strong>Email:</strong> {workOrder.client?.email}</div>
            <div><strong>Kilometraje:</strong> {workOrder.currentMileage.toLocaleString()} km</div>
          </div>
        </div>
      </div>

      <div className="order-section">
        <h3>Solicitud del Cliente</h3>
        <div className="solicitud-content">
          {workOrder.serviceRequest}
        </div>
      </div>

      {workOrder.status !== 'entregado' && (
        <div className="order-section">
          <h3>Gestión de la Orden</h3>
          <div className="management-grid">
            <div className="form-group">
              <label>Estado Actual</label>
              <Select
                options={statusOptions}
                value={statusOptions.find(option => option.value === selectedStatus)}
                onChange={(option) => setSelectedStatus(option.value)}
                className="select-status"
              />
            </div>

            <div className="form-group">
              <label>Asignar a</label>
              <Select
                options={users}
                isMulti
                value={users.filter(u => selectedAssignees.includes(u.value))}
                onChange={(selected) => setSelectedAssignees(selected.map(u => u.value))}
                className="select-assignees"
                noOptionsMessage={() => "Cargando usuarios..."}
              />
            </div>

            <div className="form-group">
              <button 
                onClick={handleUpdateStatus}
                className="btn-primary"
                style={{ height: '100%' }}
              >
                Actualizar Orden
              </button>
            </div>
          </div>
        </div>
      )}

      {workOrder.status === 'entregado' && (
        <div className="order-section">
          <div className="info-card" style={{ backgroundColor: '#d4edda', border: '1px solid #c3e6cb' }}>
            <div style={{ textAlign: 'center', color: '#155724', fontWeight: 'bold' }}>
              📋 Esta orden ya ha sido entregada y no puede modificarse
            </div>
          </div>
        </div>
      )}

      {workOrder.status !== 'entregado' && (
        <div className="order-section">
          <h3>Notas de Seguimiento</h3>
          <form onSubmit={handleAddNote} className="add-note-form">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Escribe una nota de seguimiento..."
              rows="3"
              required
            />
            <button type="submit" className="btn-primary">
              Agregar Nota
            </button>
          </form>

          <div className="notes-list">
            {workOrder.notes && workOrder.notes.length > 0 ? (
              workOrder.notes.map((note, index) => (
                <div key={index} className="note-item">
                  <div className="note-header">
                    <strong>{note.author?.name} {note.author?.lastName}</strong>
                    <span className="note-date">
                      {new Date(note.createdAt).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="note-content">
                    {note.content}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-notes">No hay notas de seguimiento</p>
            )}
          </div>
        </div>
      )}

      {workOrder.status === 'entregado' && workOrder.notes && workOrder.notes.length > 0 && (
        <div className="order-section">
          <h3>Notas de Seguimiento</h3>
          <div className="notes-list">
            {workOrder.notes.map((note, index) => (
              <div key={index} className="note-item">
                <div className="note-header">
                  <strong>{note.author?.name} {note.author?.lastName}</strong>
                  <span className="note-date">
                    {new Date(note.createdAt).toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="note-content">
                  {note.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="order-section">
        <h3>Archivos Adjuntos</h3>
        
        {workOrder.status !== 'entregado' && (
          <div className="attachments-upload">
            <input
              type="file"
              id="attachment-file"
              className="attachment-input"
              onChange={(e) => {
                if (e.target.files[0]) {
                  handleUploadAttachment(e.target.files[0]);
                }
              }}
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
            />
            <label htmlFor="attachment-file" className="btn-primary attachment-label">
              + Adjuntar Archivo
            </label>
          </div>
        )}

        <div className="attachments-list">
          {workOrder.attachments && workOrder.attachments.length > 0 ? (
            workOrder.attachments.map((attachment) => (
              <div key={attachment._id} className="attachment-item">
                <div className="attachment-info">
                  <span className="attachment-name">{attachment.originalName}</span>
                  <span className="attachment-size">({formatFileSize(attachment.size)})</span>
                  <span className="attachment-uploader">
                    Subido por {attachment.uploadedBy?.name} {attachment.uploadedBy?.lastName}
                  </span>
                </div>
                <div className="attachment-actions">
                  <button
                    className="btn-view"
                    onClick={() => downloadAttachment(workOrder._id, attachment._id)}
                  >
                    Descargar
                  </button>
                  {attachment.uploadedBy?._id === user._id && workOrder.status !== 'entregado' && (
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteAttachment(attachment._id)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-attachments">No hay archivos adjuntos</p>
          )}
        </div>
      </div>

      {workOrder.status === 'entregado' && workOrder.deliverySignature && (
        <div className="order-section">
          <h3>Entrega del Servicio</h3>
          <div className="signature-display">
            <span className="signature-label">Firma del Cliente - Entrega</span>
            <img src={workOrder.deliverySignature} alt="Firma de entrega" />
          </div>
          {workOrder.deliveryNote && (
            <div className="solicitud-content">
              <strong>Resumen de Actividades Realizadas:</strong><br />
              {workOrder.deliveryNote}
            </div>
          )}
          <div className="info-card">
            <div className="info-grid">
              <div>
                <strong>Fecha de Entrega:</strong> 
                {new Date(workOrder.deliveryDate).toLocaleString('es-CO')}
              </div>
              <div>
                <strong>Entregado por:</strong> 
                {workOrder.deliveredBy?.name} {workOrder.deliveredBy?.lastName}
              </div>
            </div>
          </div>
        </div>
      )}

      {workOrder.clientSignature && workOrder.status !== 'entregado' && (
        <div className="order-section">
          <h3>Firma Digital del Cliente</h3>
          <div className="signature-display">
            <span className="signature-label"></span>
            <img src={workOrder.clientSignature} alt="Firma del cliente" />
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkOrderDetailPage;