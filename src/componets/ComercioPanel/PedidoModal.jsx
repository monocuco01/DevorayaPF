import { useState, useEffect } from "react";
import api from "../../api/api";
import Swal from "sweetalert2";
import "./PedidoModal.css";

// =========================
// Formato de moneda
// =========================
const formatCurrency = (amount) => {
  const value = amount ?? 0;
  return value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// =========================
// SweetAlert siempre arriba
// =========================
Swal.mixin({
  customClass: {
    popup: "swalert-top",
  },
});

const style = document.createElement("style");
style.innerHTML = `
  .swalert-top, .swal2-container {
    z-index: 999999 !important;
  }
`;
document.head.appendChild(style);

function PedidoModal({ pedido, onClose, onStatusChange }) {
  const [estado, setEstado] = useState(pedido.estado);
  const [loading, setLoading] = useState(false);

  // =========================
  // Ver los datos de pedido que llegan
  // =========================
  useEffect(() => {
    console.log("Pedido recibido:", pedido); // <-- Aquí puedes ver todo el pedido
  }, [pedido]);

  // =========================
  // Cambiar estado del pedido
  // =========================
  const handleEstadoChange = async (nuevoEstado) => {
    setLoading(true);
    try {
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

  // =========================
  // Render detalle de pago
  // =========================
  const renderPaymentDetails = () => {
    const isOnline = pedido.metodo_pago && pedido.metodo_pago !== "Efectivo";
    const hasComprobante = !!pedido.comprobante_url;

    return (
      <div className="pm-payment-box">
        <h3 className="pm-section-title">Detalles de Pago</h3>

        <p>
          <strong>Método:</strong>{" "}
          <span className="pm-payment-method">
            {pedido.metodo_pago || "Efectivo"}
          </span>
        </p>

        {isOnline && pedido.referencia_pago && (
          <p>
            <strong>Referencia:</strong>{" "}
            <span className="pm-payment-ref">
              {pedido.referencia_pago}
            </span>
          </p>
        )}

        {isOnline && hasComprobante && (
          <div className="pm-proof-box">
            <h4>Comprobante</h4>
            <img
              src={pedido.comprobante_url}
              alt="Comprobante"
              className="pm-proof-img"
            />
          </div>
        )}

        {isOnline && !hasComprobante && (
          <p className="pm-pending-proof">
            El cliente aún no ha subido el comprobante.
          </p>
        )}
      </div>
    );
  };

  // =========================
  // RENDER
  // =========================
  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="pm-title">Pedido #{pedido.id}</h2>

        <p>
          <strong>Cliente:</strong>{" "}
          {pedido.Usuario?.nombre ?? "Sin nombre"}
        </p>

        <p>
          <strong>Dirección:</strong> {pedido.direccion_entrega}
        </p>

        <p>
          <strong>Costo Domicilio:</strong>{" "}
          {formatCurrency(pedido.costo_envio)}
        </p>

        <p>
          <strong>Total:</strong> {formatCurrency(pedido.total)}
        </p>

        <p>
          <strong>Instrucciones:</strong>{" "}
          {pedido.instrucciones || "Ninguna"}
        </p>

        {/* Detalles de pago */}
        {renderPaymentDetails()}

        {/* Platos */}
        {/* Platos */}
<div className="pm-platos-box">
  <h3 className="pm-section-title">Platos del pedido</h3>

  <ul className="pm-platos-list">
    {pedido.PedidoPlatos?.map((pp) => (
      <li key={pp.id} className="pm-plato-item">
        <div className="pm-plato-main">
          <strong>{pp.Plato?.nombre}</strong>{" "}
          x {pp.cantidad} — {formatCurrency(pp.precio_unitario)}
        </div>

        {/* ✅ Opciones seleccionadas */}
        {Array.isArray(pp.PedidoPlatoOpcions) && pp.PedidoPlatoOpcions.length > 0 && (
          <ul className="pm-opciones-list">
            {pp.PedidoPlatoOpcions.map((opcion) => (
              <li key={opcion.id} className="pm-opcion-item">
                ▸ <span className="pm-opcion-nombre">{opcion.nombre_opcion}</span>
             
              </li>
            ))}
          </ul>
        )}
      </li>
    ))}
  </ul>
</div>



        {/* Estado */}
        <div className="pm-state-box">
          <label className="pm-state-label">Estado:</label>
          <select
            className="pm-state-select"
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

        <button className="pm-close-btn" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}

export default PedidoModal;
