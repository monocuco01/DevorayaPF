import { useState, useEffect } from "react";
import api from "../../api/api";
import PedidoModal from "./PedidoModal.jsx";
import "./PedidosList.css";

function PedidosList() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        // Temporalmente dejamos el comercio_id = 5
        const { data } = await api.get("/pedidos/comercio/5");
        // Nos aseguramos de que siempre sea un array
        setPedidos(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("Error al obtener pedidos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  if (loading) return <p>Cargando pedidos...</p>;

  return (
    <div className="pedidos-list-container">
      <h2>📦 Pedidos Recibidos</h2>

      {pedidos.length === 0 ? (
        <p>No hay pedidos por el momento.</p>
      ) : (
        <table className="pedidos-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Dirección</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.id}</td>
                <td>{pedido.Usuario?.nombre || "Sin nombre"}</td>
                <td>{pedido.direccion_entrega}</td>
                <td>${pedido.total?.toLocaleString()}</td>
                <td>{pedido.estado}</td>
                <td>
                  <button
                    className="ver-btn"
                    onClick={() => setPedidoSeleccionado(pedido)}
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal del pedido */}
      {pedidoSeleccionado && (
        <PedidoModal
          pedido={pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
          onStatusChange={(nuevoEstado) => {
            setPedidos((prev) =>
              prev.map((p) =>
                p.id === pedidoSeleccionado.id ? { ...p, estado: nuevoEstado } : p
              )
            );
          }}
        />
      )}
    </div>
  );
}

export default PedidosList;
