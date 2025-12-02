// Página para la entrega del vehículo

import { useState, useEffect } from "react";
import { useWorkOrders } from "../context/WorkOrderContext";
import { useParams, useNavigate } from "react-router-dom";
import SignatureCanvas from 'react-signature-canvas';
import { useRef } from "react";
import "../styles/WorkOrderDeliveryPage.css";

function WorkOrderDeliveryPage() {
  const { id } = useParams();
  const { getWorkOrderById, deliverWorkOrder } = useWorkOrders();
  const navigate = useNavigate();

  const [workOrder, setWorkOrder] = useState(null);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const signatureRef = useRef();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const order = await getWorkOrderById(id);
        if (order.status !== 'completado') {
          setError("La orden no está en estado 'completado'");
          return;
        }
        setWorkOrder(order);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!deliveryNote.trim()) {
      alert("Debe ingresar la nota resumen de actividades");
      return;
    }
    
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      alert("Debe firmar para entregar el servicio");
      return;
    }

    try {
      const signatureData = signatureRef.current.toDataURL('image/png');
      // Usar la función del contexto
      await deliverWorkOrder(id, {
        deliverySignature: signatureData,
        deliveryNote: deliveryNote
      });
      
      alert("Orden entregada correctamente");
      navigate(`/ordenes/${id}`);
    } catch (error) {
      // Mostrar el error real
      console.error("Error al entregar:", error);
      alert("Error al entregar orden: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="page">Cargando orden...</div>;
  if (error) return <div className="page error">Error: {error}</div>;
  if (!workOrder) return <div className="page">Orden no encontrada</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Entrega de Orden de Trabajo</h1>
        <h2>{workOrder.orderNumber}</h2>
      </div>

      <div className="delivery-container">
        <div className="order-info">
          <h3>Datos de la Orden</h3>
          <div><strong>Placa:</strong> {workOrder.vehicle?.plate}</div>
          <div><strong>Cliente:</strong> {workOrder.client?.name} {workOrder.client?.lastName}</div>
          <div><strong>Solicitud:</strong> {workOrder.serviceRequest}</div>
        </div>

        <form onSubmit={handleSubmit} className="delivery-form">
          <div className="form-group">
            <label>Resumen de Actividades Realizadas *</label>
            <textarea
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="Describa las actividades realizadas durante el servicio..."
              required
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Firma del Cliente *</label>
            <div className="signature-container">
              <SignatureCanvas
                ref={signatureRef}
                penColor='black'
                canvasProps={{ width: 500, height: 200, className: 'signature-canvas' }}
              />
              <button 
                type="button" 
                onClick={() => signatureRef.current?.clear()}
                className="btn-secondary"
              >
                Limpiar Firma
              </button>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Entregar Servicio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WorkOrderDeliveryPage;