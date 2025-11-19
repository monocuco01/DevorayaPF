import { useState } from "react";
import api from "../../api/api";
import Swal from "sweetalert2";
import "./PedidoModal.css";

// --- Función de utilidad para formato de moneda ---
const formatCurrency = (amount) => {
    // Asegura un valor por defecto si es nulo o indefinido
    const value = amount ?? 0;
    
    // Formatea como moneda. Ajusta 'es-CO' y 'COP' a tu región/moneda.
    return value.toLocaleString('es-CO', {
        style: 'currency',
        currency: 'COP', 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
};
// --------------------------------------------------

// 🔥 Aseguramos que SweetAlert esté siempre sobre todo
Swal.mixin({
  customClass: {
    popup: "swal-super-top",
  },
});

const style = document.createElement("style");
style.innerHTML = `
  .swal-super-top, .swal2-container {
    z-index: 999999 !important;
  }
`;
document.head.appendChild(style);

function PedidoModal({ pedido, onClose, onStatusChange }) {
  const [estado, setEstado] = useState(pedido.estado);
  const [loading, setLoading] = useState(false);

  const handleEstadoChange = async (nuevoEstado) => {
    setLoading(true);
    try {
      // ✅ Enviamos el campo correcto como lo espera el backend
      await api.put(`/pedidos/${pedido.id}/estado`, { nuevoEstado });

      setEstado(nuevoEstado);
      onStatusChange(nuevoEstado);

      Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: `El pedido ahora está "${nuevoEstado}".`,
        background: "#1e1e1e",
        color: "#fff",
        confirmButtonColor: "#00c896",
      });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: "No se pudo actualizar el estado del pedido.",
        background: "#1e1e1e",
        color: "#fff",
        confirmButtonColor: "#e74c3c",
      });
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

        {/* -------------------- CAMBIO CLAVE AÑADIDO AQUI -------------------- */}
        <p>
          <strong>Costo Domicilio:</strong> {formatCurrency(pedido.costo_envio)}
        </p>
        {/* ------------------------------------------------------------------ */}
        
        <p>
          <strong>Total:</strong> {formatCurrency(pedido.total)}
        </p>
        <p>
          <strong>Instrucciones:</strong> {pedido.instrucciones || "Ninguna"}
        </p>

        {/* Listado de platos */}
        <div className="platos-container">
          <h3> Platos del pedido</h3>
          <ul>
            {pedido.Platos?.map((plato) => (
              <li key={plato.id}>
                {plato.nombre} x {plato.PedidoPlato?.cantidad} — {formatCurrency(plato.PedidoPlato?.precio_unitario)}
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

        <button onClick={onClose} className="cerrar-btns">
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default PedidoModal;