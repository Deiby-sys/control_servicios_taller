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
import { utils, writeFile } from 'xlsx';

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

   // ✅ NUEVO: Estados para el manejo de repuestos
  const [showPartsForm, setShowPartsForm] = useState(false);
  const [spareParts, setSpareParts] = useState([]);
  const [newPart, setNewPart] = useState({ code: '', detail: '', quantity: 1, price: 0 });
  const [savingParts, setSavingParts] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null); // ✅ Para saber qué fila se edita

  const statusOptions = [
    { value: 'por_asignar', label: 'Jefe' },
    { value: 'asignado', label: 'Diagnóstico' },
    { value: 'en_aprobacion', label: 'Asesor' },
    { value: 'por_repuestos', label: 'Repuestos' },
    { value: 'en_soporte', label: 'Soporte Técnico' },
    { value: 'en_proceso', label: 'Proceso Técnico' },
    { value: 'baterias', label: 'Baterías' },
    { value: 'completado', label: 'Listo para Entrega' }
  ];

  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        setLoading(true);
        const order = await getWorkOrderById(id);
        setWorkOrder(order);
        setSelectedStatus(order.status);
        setSpareParts(order.spareParts || []); // ✅ Cargar repuestos existentes
        
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
        const response = await axios.get(`${API_URL}/users/public`, { withCredentials: true });
        const userData = response.data;
        if (!Array.isArray(userData)) throw new Error("La respuesta no es un array de usuarios");
        setUsers(userData.map(u => ({ value: u._id, label: `${u.name} ${u.lastName} (${u.profile})` })));
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

  // ... (Mantén handleAddNote, handleUpdateStatus, handleUploadAttachment, handleDeleteAttachment, formatFileSize, getStatusColor igual que antes) ...
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
      const updatedOrder = await updateWorkOrderStatus(id, { status: selectedStatus, assignedTo: selectedAssignees });
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
        setWorkOrder(prevOrder => ({ ...prevOrder, attachments: prevOrder.attachments.filter(att => att._id !== fileId) }));
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
      'por_asignar': '#6c757d', 'asignado': '#0d6efd', 'en_aprobacion': '#ffc107',
      'por_repuestos': '#fd7e14', 'en_soporte': '#20c997', 'en_proceso': '#20c997',
      'baterias': '#f39c12', 'completado': '#198754', 'entregado': '#28a745'
    };
    return colors[status] || '#6c757d';
  };

  // ✅ NUEVO: Funciones para manejar repuestos
  const handleAddPartRow = () => {
    if (!newPart.detail.trim()) {
      alert("El detalle del repuesto es obligatorio");
      return;
    }
    setSpareParts([...spareParts, { ...newPart }]); 
    setNewPart({ code: '', detail: '', quantity: 1, price: 0 });
  };

  const handleRemovePart = (index) => {
    const updatedParts = spareParts.filter((_, i) => i !== index);
    setSpareParts(updatedParts);
  };

  // ✅ NUEVO: Activar edición de una fila
  const handleEditPart = (index) => {
    setEditingIndex(index);
  };

  // ✅ NUEVO: Actualizar campo específico de una fila en edición
  const handleUpdatePartField = (index, field, value) => {
    const updatedParts = [...spareParts];
    updatedParts[index] = {
      ...updatedParts[index],
      [field]: field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value
    };
    setSpareParts(updatedParts);
  };

  // ✅ NUEVO: Cancelar edición
  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  const handleSaveParts = async () => {
    try {
      setSavingParts(true);
      const response = await axios.patch(`${API_URL}/work-orders/${id}/spare-parts`, 
        { spareParts }, 
        { withCredentials: true }
      );
      setWorkOrder(response.data);
      setEditingIndex(null); // ✅ Salir del modo edición al guardar
      alert("✅ Lista de repuestos guardada correctamente");
      setShowPartsForm(false);
    } catch (error) {
      console.error("Error al guardar repuestos:", error);
      alert("Error al guardar: " + (error.response?.data?.message || error.message));
    } finally {
      setSavingParts(false);
    }
  };

    // ✅ NUEVO: Exportar repuestos a Excel
  const exportPartsToExcel = () => {
    if (spareParts.length === 0) {
      alert("No hay repuestos para exportar");
      return;
    }

    const dataToExport = spareParts.map(part => ({
      'Código': part.code || 'N/A',
      'Detalle': part.detail,
      'Cantidad': part.quantity,
      'Precio Unitario': `$${Number(part.price).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`,
      'Total': `$${Number(part.quantity * part.price).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`
    }));

    // Agregar fila de subtotal
    const subtotal = spareParts.reduce((sum, part) => sum + (part.quantity * part.price), 0);
    dataToExport.push({
      'Código': '',
      'Detalle': 'SUBTOTAL',
      'Cantidad': '',
      'Precio Unitario': '',
      'Total': `$${subtotal.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`
    });

    const worksheet = utils.json_to_sheet(dataToExport);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Repuestos");
    
    const fileName = `repuestos_${workOrder.orderNumber || 'orden'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    writeFile(workbook, fileName);
  };

  if (loading) return <div className="page">Cargando orden de trabajo...</div>;
  if (error) return <div className="page error">Error: {error}</div>;
  if (!workOrder) return <div className="page">Orden no encontrada</div>;

  return (
    <div className="page">
      {/* ... (Mantén el page-header, order-info, solicitud del cliente y gestión de la orden igual que antes) ... */}
      <div className="page-header">
        <div>
          <h1>Orden de Trabajo</h1>
          <h2>{workOrder.orderNumber}</h2>
        </div>
        <div className="header-actions">
          <button onClick={() => generateWorkOrderPDF(workOrder)} className="btn-primary" style={{ marginRight: '0.5rem' }}>📄 Descargar PDF</button>
          {workOrder.status === 'completado' && ['admin', 'asesor', 'jefe'].includes(user?.profile) && (
            <button onClick={() => navigate(`/ordenes/${workOrder._id}/entregar`)} className="btn-primary" style={{ marginRight: '0.5rem' }}>🚗 Entregar Vehículo</button>
          )}
          <button onClick={() => navigate('/ordenes')} className="btn-secondary">← Volver a Órdenes</button>
        </div>
      </div>

      <div className="order-info">
        <div className="info-card">
          <h3>Información General</h3>
          <div className="info-grid">
            <div><strong>Fecha de Ingreso:</strong> {new Date(workOrder.entryDate).toLocaleString('es-CO')}</div>
            <div><strong>Estado:</strong> <span className={`status-badge status-${workOrder.status.replace(/_/g, '-')}`} style={{ backgroundColor: getStatusColor(workOrder.status) }}>{getStatusLabel(workOrder.status)}</span></div>
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
        <div className="solicitud-content">{workOrder.serviceRequest}</div>
      </div>

      {workOrder.status !== 'entregado' && (
        <div className="order-section">
          <h3>Gestión de la Orden</h3>
          <div className="management-grid">
            <div className="form-group">
              <label>Estado Actual</label>
              <Select options={statusOptions} value={statusOptions.find(option => option.value === selectedStatus)} onChange={(option) => setSelectedStatus(option.value)} className="select-status" />
            </div>
            <div className="form-group">
              <label>Asignar a</label>
              <Select options={users} isMulti value={users.filter(u => selectedAssignees.includes(u.value))} onChange={(selected) => setSelectedAssignees(selected.map(u => u.value))} className="select-assignees" noOptionsMessage={() => "Cargando usuarios..."} />
            </div>
            <div className="form-group">
              <button onClick={handleUpdateStatus} className="btn-primary" style={{ height: '100%' }}>Actualizar Orden</button>
            </div>
          </div>
        </div>
      )}

      {/* ... (Mantén la sección de Notas de Seguimiento igual que antes) ... */}
      {workOrder.status !== 'entregado' && (
        <div className="order-section">
          <h3>Notas de Seguimiento</h3>
          <form onSubmit={handleAddNote} className="add-note-form">
            <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Escribe una nota de seguimiento..." rows="3" required />
            <button type="submit" className="btn-primary">Agregar Nota</button>
          </form>
          <div className="notes-list">
            {workOrder.notes && workOrder.notes.length > 0 ? (
              workOrder.notes.map((note, index) => (
                <div key={index} className="note-item">
                  <div className="note-header">
                    <strong>{note.author?.name} {note.author?.lastName}</strong>
                    <span className="note-date">{new Date(note.createdAt).toLocaleString('es-CO')}</span>
                  </div>
                  <div className="note-content">{note.content}</div>
                </div>
              ))
            ) : (
              <p className="no-notes">No hay notas de seguimiento</p>
            )}
          </div>
        </div>
      )}

            {/* ✅ NUEVA SECCIÓN: REPUESTOS A SOLICITAR */}
      {workOrder.status !== 'entregado' && (
        <div className="order-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>📦 Repuestos a Solicitar</h3>
            <button 
              onClick={() => setShowPartsForm(!showPartsForm)} 
              className="btn-secondary"
              style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
            >
              {showPartsForm ? 'Ocultar Lista' : '+ Listar Pedido'}
            </button>
          </div>

          {showPartsForm && (
            <div className="parts-container">
              {/* Fila para agregar nuevo repuesto */}
              <div className="parts-input-row">
                <input 
                  type="text" 
                  placeholder="Código" 
                  value={newPart.code}
                  onChange={(e) => setNewPart({...newPart, code: e.target.value})}
                  className="part-input part-code"
                />
                <input 
                  type="text" 
                  placeholder="Detalle del repuesto y/o mano de obra*" 
                  value={newPart.detail}
                  onChange={(e) => setNewPart({...newPart, detail: e.target.value})}
                  className="part-input part-detail"
                />
                <input 
                  type="number" 
                  placeholder="Cant." 
                  min="1"
                  value={newPart.quantity}
                  onChange={(e) => setNewPart({...newPart, quantity: parseInt(e.target.value) || 1})}
                  className="part-input part-qty"
                />
                <input 
                  type="number" 
                  placeholder="Precio" 
                  min="0"
                  step="0.01"
                  value={newPart.price}
                  onChange={(e) => setNewPart({...newPart, price: parseFloat(e.target.value) || 0})}
                  className="part-input part-price"
                />
                <button 
                  type="button"
                  onClick={handleAddPartRow}
                  className="btn-primary"
                  style={{ padding: '0.5rem', minWidth: '40px', height: '38px' }}
                  title="Agregar a la lista"
                >
                  +
                </button>
              </div>

                            {/* Tabla de repuestos agregados */}
              {spareParts.length > 0 && (
                <>
                  <div className="parts-table-wrapper">
                    <table className="parts-table">
                      <thead>
                        <tr>
                          <th>Código</th>
                          <th>Detalle</th>
                          <th style={{ textAlign: 'center' }}>Cant.</th>
                          <th style={{ textAlign: 'right' }}>Precio</th>
                          <th style={{ textAlign: 'right' }}>Total</th> {/* ✅ NUEVA COLUMNA */}
                          <th style={{ textAlign: 'center' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {spareParts.map((part, index) => {
                          const total = part.quantity * part.price;
                          return (
                          <tr key={part._id || index} className={editingIndex === index ? 'editing-row' : ''}>
                            <td>
                              {editingIndex === index ? (
                                <input
                                  type="text"
                                  value={part.code}
                                  onChange={(e) => handleUpdatePartField(index, 'code', e.target.value)}
                                  className="part-input-inline"
                                  placeholder="Código"
                                />
                              ) : (
                                part.code || '-'
                              )}
                            </td>
                            <td>
                              {editingIndex === index ? (
                                <input
                                  type="text"
                                  value={part.detail}
                                  onChange={(e) => handleUpdatePartField(index, 'detail', e.target.value)}
                                  className="part-input-inline part-detail-inline"
                                />
                              ) : (
                                part.detail
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {editingIndex === index ? (
                                <input
                                  type="number"
                                  min="1"
                                  value={part.quantity}
                                  onChange={(e) => handleUpdatePartField(index, 'quantity', e.target.value)}
                                  className="part-input-inline part-qty-inline"
                                  style={{ width: '60px', textAlign: 'center' }}
                                />
                              ) : (
                                part.quantity
                              )}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              {editingIndex === index ? (
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={part.price}
                                  onChange={(e) => handleUpdatePartField(index, 'price', e.target.value)}
                                  className="part-input-inline part-price-inline"
                                  style={{ width: '80px', textAlign: 'right' }}
                                />
                              ) : (
                                `$${Number(part.price).toLocaleString('es-CO', { minimumFractionDigits: 0 })}`
                              )}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '600' }}>
                              ${Number(total).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {editingIndex === index ? (
                                <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                                  <button 
                                    type="button"
                                    onClick={() => setEditingIndex(null)}
                                    className="btn-secondary"
                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                    title="Cancelar"
                                  >
                                    ❌
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => setEditingIndex(null)}
                                    className="btn-primary"
                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                    title="Listo"
                                  >
                                    ✅
                                  </button>
                                </div>
                              ) : (
                                <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                                  <button 
                                    type="button"
                                    onClick={() => handleEditPart(index)}
                                    className="btn-view"
                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                    title="Editar"
                                  >
                                    ✏️
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={() => handleRemovePart(index)}
                                    className="btn-delete"
                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                    title="Eliminar"
                                  >
                                    ️
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )})}
                      </tbody>
                      {/* ✅ FILA DE SUBTOTAL */}
                      <tfoot>
                        <tr style={{ backgroundColor: '#e3f2fd', fontWeight: 'bold' }}>
                          <td colSpan="4" style={{ textAlign: 'right', padding: '0.8rem' }}>SUBTOTAL:</td>
                          <td style={{ textAlign: 'right', padding: '0.8rem', color: '#0d6efd' }}>
                            ${spareParts.reduce((sum, part) => sum + (part.quantity * part.price), 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  {/* Botones de acción */}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button 
                      type="button"
                      onClick={exportPartsToExcel}
                      className="btn-secondary"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      📊 Exportar a Excel
                    </button>
                    <button 
                      type="button"
                      onClick={handleSaveParts}
                      disabled={savingParts}
                      className="btn-primary"
                      style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                      {savingParts ? '⏳ Guardando...' : '💾 Guardar Lista de Repuestos'}
                    </button>
                  </div>
                </>
              )}
              
            </div>
          )}
        </div>
      )}

      
      {/* ... (Mantén el resto del código: Archivos Adjuntos, Entrega, Firma) ... */}
      <div className="order-section">
        <h3>Archivos Adjuntos</h3>
        {workOrder.status !== 'entregado' && (
          <div className="attachments-upload">
            <input type="file" id="attachment-file" className="attachment-input" onChange={(e) => { if (e.target.files[0]) handleUploadAttachment(e.target.files[0]); }} accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip" />
            <label htmlFor="attachment-file" className="btn-primary attachment-label">+ Adjuntar Archivo</label>
          </div>
        )}
        <div className="attachments-list">
          {workOrder.attachments && workOrder.attachments.length > 0 ? (
            workOrder.attachments.map((attachment) => (
              <div key={attachment._id} className="attachment-item">
                <div className="attachment-info">
                  <span className="attachment-name">{attachment.originalName}</span>
                  <span className="attachment-size">({formatFileSize(attachment.size)})</span>
                  <span className="attachment-uploader">Subido por {attachment.uploadedBy?.name} {attachment.uploadedBy?.lastName}</span>
                </div>
                <div className="attachment-actions">
                  <button className="btn-view" onClick={() => downloadAttachment(workOrder._id, attachment._id)}>Descargar</button>
                  {attachment.uploadedBy?._id === user._id && workOrder.status !== 'entregado' && (
                    <button className="btn-delete" onClick={() => handleDeleteAttachment(attachment._id)}>Eliminar</button>
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
              <div><strong>Fecha de Entrega:</strong> {new Date(workOrder.deliveryDate).toLocaleString('es-CO')}</div>
              <div><strong>Entregado por:</strong> {workOrder.deliveredBy?.name} {workOrder.deliveredBy?.lastName}</div>
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