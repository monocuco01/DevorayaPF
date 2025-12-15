import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import api from "../../api/api";
import PedidoModal from "./PedidoModal.jsx";
import "./PedidosList.css";

const getComercioId = () => {
  try {
    const raw =
      localStorage.getItem("comercioActivo") ||
      localStorage.getItem("usuarioActivo") ||
      null;

    if (!raw) return null;

    const obj = JSON.parse(raw);
    return obj?.id ?? obj?.comercio_id ?? obj?.comercio?.id ?? null;
  } catch {
    return null;
  }
};

function PedidosList() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);

  const pedidosRef = useRef([]);
  const audioRef = useRef(null);

  const comercioId = getComercioId();
const getEstadoColor = (estado) => {
  switch (estado) {
    case "pendiente":
      return "estado-pendiente";
    case "aceptado":
      return "estado-aceptado";
    case "en_preparacion":
      return "estado-preparacion";
    case "en_camino":
      return "estado-camino";
    case "entregado":
      return "estado-entregado";
    case "cancelado":
      return "estado-cancelado";
    default:
      return "estado-default";
  }
};

  useEffect(() => {
    audioRef.current = new Audio("../../../public/sounds/sonido.mp3");
  }, []);

  const fetchPedidos = async (showAlert = false) => {
    if (!comercioId) return;

    try {
      const { data } = await api.get(`/pedidos/comercio/${comercioId}`);
      const nuevosPedidos = Array.isArray(data) ? data : [data];

      if (
        pedidosRef.current.length > 0 &&
        nuevosPedidos.length > pedidosRef.current.length
      ) {
        if (showAlert) {
          audioRef.current?.play().catch(() => {});

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
    fetchPedidos();

    const interval = setInterval(() => {
      fetchPedidos(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [comercioId]);

  if (loading) return <p>Cargando pedidos...</p>;

  return (
    <div className="pedidos-list-container">
      <div className="pedidos-header">
        <h2>Pedidos Recibidos</h2>
        <button className="refresh-btn" onClick={() => fetchPedidos(true)}>
          🔄 Refrescar
        </button>
      </div>

      {pedidos.length === 0 ? (
        <p>No hay pedidos por el momento.</p>
      ) : (
        <table className="pedidos-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Dirección</th>
              <th>Método de Pago</th> {/* ← AGREGADO */}
              <th>Total</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>

          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.id}</td>
                <td>{pedido.nombre_recibe || "Sin nombre"}</td>
                <td>{pedido.direccion_entrega}</td>

                {/* ----- MÉTODO DE PAGO ----- */}
                <td>{pedido.metodo_pago || "No especificado"}</td>

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

      {pedidoSeleccionado && (
        <PedidoModal
          pedido={pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
          onStatusChange={(nuevoEstado) => {
            setPedidos((prev) =>
              prev.map((p) =>
                p.id === pedidoSeleccionado.id
                  ? { ...p, estado: nuevoEstado }
                  : p
              )
            );
          }}
        />
      )}
    </div>
  );
}

export default PedidosList;

  