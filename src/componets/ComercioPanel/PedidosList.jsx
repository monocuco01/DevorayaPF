import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import api from "../../api/api";
import PedidoModal from "./PedidoModal.jsx";
import "./PedidosList.css";

function PedidosList() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const pedidosRef = useRef([]); // Guarda el estado anterior de los pedidos para comparar

  const fetchPedidos = async (showAlert = false) => {
    try {
      const { data } = await api.get("/pedidos/comercio/5");
      const nuevosPedidos = Array.isArray(data) ? data : [data];

      // Comparar si hay pedidos nuevos
      if (pedidosRef.current.length > 0 && nuevosPedidos.length > pedidosRef.current.length) {
        if (showAlert) {
          Swal.fire({
            title: "🛎️ ¡Nuevo pedido recibido!",
            text: "Tienes un nuevo pedido pendiente.",
            icon: "info",
            confirmButtonColor: "#3085d6",
            timer: 4000,
            timerProgressBar: true,
          });
        }
      }

      pedidosRef.current = nuevosPedidos;
      setPedidos(nuevosPedidos);
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Carga inicial
    fetchPedidos();

    // Cada 30 segundos se verifica si hay nuevos pedidos
    const interval = setInterval(() => {
      fetchPedidos(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getEstadoColor = (estado) => {
    switch (estado.toLowerCase()) {
      case "pendiente":
        return "estado-pendiente";
      case "en camino":
        return "estado-camino";
      case "entregado":
        return "estado-entregado";
      case "cancelado":
        return "estado-cancelado";
      default:
        return "estado-default";
    }
  };

  if (loading) return <p>Cargando pedidos...</p>;

  return (
    <div className="pedidos-list-container">
      <h2>Pedidos Recibidos</h2>

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
                <td>
                  <span className={`estado-tag ${getEstadoColor(pedido.estado)}`}>
                    {pedido.estado}
                  </span>
                </td>
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
