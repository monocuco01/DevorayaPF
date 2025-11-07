import { useState } from "react";
import api from "../../api/api";
import "./PedidoModal.css";

function PedidoModal({ pedido, onClose, onStatusChange }) {
  const [estado, setEstado] = useState(pedido.estado);
  const [loading, setLoading] = useState(false);

  const handleEstadoChange = async (nuevoEstado) => {
    setLoading(true);
    try {
      // ✅ Enviamos el campo correcto como lo espera el backend
      const { data } = await api.put(`/pedidos/${pedido.id}/estado`, {
        nuevoEstado,
      });

      setEstado(nuevoEstado);
      onStatusChange(nuevoEstado);
      alert("✅ Estado actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      alert("❌ No se pudo actualizar el estado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Pedido #{pedido.id}</h2>
        <p>
          <strong>Cliente:</strong> {pedido.Usuario?.nombre}
        </p>
        <p>
          <strong>Dirección:</strong> {pedido.direccion_entrega}
        </p>
        <p>
          <strong>Total:</strong> ${pedido.total.toLocaleString()}
        </p>
        <p>
          <strong>Instrucciones:</strong> {pedido.instrucciones || "Ninguna"}
        </p>

        {/* Listado de platos */}
        <div className="platos-container">
          <h3>🧾 Platos del pedido</h3>
          <ul>
            {pedido.Platos?.map((plato) => (
              <li key={plato.id}>
                {plato.nombre} x {plato.PedidoPlato?.cantidad} — $
                {plato.PedidoPlato?.precio_unitario.toLocaleString()}
              </li>
            ))}
          </ul>
        </div>

        {/* Selector de estado */}
        <div className="estado-container">
          <label>Estado actual:</label>
          <select
            value={estado}
            onChange={(e) => handleEstadoChange(e.target.value)}
            disabled={loading}
          >
            <option value="pendiente">Pendiente</option>
            <option value="aceptado">Aceptado</option>
            <option value="rechazado">Rechazado</option>
            <option value="en camino">En camino</option>
            <option value="entregado">Entregado</option>
          </select>
        </div>

        <button onClick={onClose} className="cerrar-btn">
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default PedidoModal;
