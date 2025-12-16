// Archivo: src/components/UserOrders/UserOrders.jsx

import { useEffect, useState } from "react";
import api from "../../api/api";
import Swal from "sweetalert2";
// 💡 Importamos los iconos de Lucide
import { ChevronDown, ChevronUp, Clock, Package } from "lucide-react"; 
import "./UserOrders.css";

const getUserId = () => {
    try {
        const raw = localStorage.getItem("usuarioActivo") || null;
        if (!raw) return null;
        return JSON.parse(raw)?.id ?? null;
    } catch {
        return null;
    }
};

/* ----------------------- COMPONENTE: BARRA DE PROGRESO ----------------------- */

const EstadoProgress = ({ estado }) => {
    const estados = ["pendiente", "preparando", "en_camino", "entregado"];

    const estadoIndex = estados.indexOf(estado?.toLowerCase());
    const progress = estadoIndex >= 0
        ? (estadoIndex / (estados.length - 1)) * 100
        : 0;

    return (
        <div className="estado-progress-container">
            <div className="estado-steps">
                {estados.map((et, i) => (
                    <div key={i} className={`step ${i <= estadoIndex ? "active" : ""}`}>
                        <div className="circle"></div>
                        <span>{et.replace("_", " ")}</span>
                    </div>
                ))}
            </div>

            <div className="progress-bar">
                <div className="progress-fill"
                     style={{ width: `${progress}%` }}>
                </div>
            </div>
        </div>
    );
};

/* ----------------------------- ITEM PEDIDO ----------------------------- */

const PedidoItem = ({ pedido }) => {
    const [detalleAbierto, setDetalleAbierto] = useState(false);

    const formattedDate = pedido.createdAt
        ? new Date(pedido.createdAt).toLocaleDateString()
        : "Sin fecha";

    const totalFormateado = pedido.total?.toLocaleString() ?? "0";
    const costoEnvioFormateado = pedido.costo_envio?.toLocaleString() ?? "0";
    const distanciaFormateada = pedido.distancia_km ?? "0";
    const direccionEntrega = pedido.direccion_entrega || "No disponible";

    return (
        <div className={`pedido-item ${detalleAbierto ? "expanded" : ""}`}>
            
            {/* HEADER */}
            <div className="pedido-header" onClick={() => setDetalleAbierto(!detalleAbierto)}>
                <div className="info-columna">
                    <p>
                        <strong>Pedido #{pedido.id}</strong> – {formattedDate}
                    </p>

                    <p className="restaurante-nombre">
                        Restaurante: <strong>{pedido.Comercio?.nombre || "No disponible"}</strong>
                    </p>

                    <p>
                        Entrega en: <strong>{direccionEntrega}</strong>
                    </p>

                    <p>
                        Distancia: <strong>{distanciaFormateada} km</strong>
                    </p>

                    <p>
                        Costo domicilio: <strong>${costoEnvioFormateado}</strong>
                    </p>
                </div>

                <div className="total-estado-columna">
                    <p>Total: <strong>${totalFormateado}</strong></p>

                    <p className="estado-badge">
                        Estado:{" "}
                        <span className={`status-${pedido.estado?.toLowerCase()}`}>
                            {pedido.estado}
                        </span>
                    </p>

                    {/* 💡 Reemplazo de emojis por iconos Lucide */}
                    <span className="toggle-icon">
                        {detalleAbierto ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </span>
                </div>
            </div>

            {/* DETALLE EXPANDIBLE */}
            {detalleAbierto && (
                <div className="pedido-detalle">

                    {/* Barra estilo tu screenshot */}
                    <EstadoProgress estado={pedido.estado} />

               <h4>Productos ({pedido.PedidoPlatos?.length || 0})</h4>

<ul className="productos-list">
  {pedido.PedidoPlatos?.length > 0 ? (

    pedido.PedidoPlatos.map((pp) => (
      <li key={pp.id}>
        <strong>{pp.cantidad || 1}x</strong> {pp.Plato?.nombre || "Sin nombre"} 
        <span className="item-price">
          ${(pp.precio_unitario * (pp.cantidad || 1)).toLocaleString()}
        </span>

        {/* Opciones seleccionadas */}
        {pp.PedidoPlatoOpcions?.length > 0 && (
          <ul className="opciones-list">
            {pp.PedidoPlatoOpcions.map((op) => (
              <li key={op.id}>
                ▸ {op.nombre_opcion} ({op.valor})
              </li>
            ))}
          </ul>
        )}
      </li>
    ))
  ) : (
    <li>No hay productos</li>
  )}
</ul>

                </div>
            )}
        </div>
    );
};

/* ------------------------------ LISTA PEDIDOS ------------------------------ */

const UserOrders = () => {
    const userId = getUserId();
    const [pedidos, setPedidos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!userId) {
                setCargando(false);
                Swal.fire("Error", "Debes iniciar sesión para ver tus pedidos.", "error");
                return;
            }

            try {
                const res = await api.get(`/pedidos/usuario/${userId}`);
                setPedidos(res.data || []);
            } catch (err) {
                Swal.fire("Error", "No se pudo cargar el historial.", "error");
            }

            setCargando(false);
        };

        fetchOrders();
    }, [userId]);

    if (cargando) return <p>Cargando...</p>;

    return (
        <div className="orders-container">
            <h2>Historial de Pedidos</h2>

            <div className="section-card order-history">
                {pedidos.length === 0 ? (
                    <p>No tienes pedidos aún.</p>
                ) : (
   
                    <div className="pedidos-list">
                        {pedidos.map((pedido) => (
                            <PedidoItem key={pedido.id} pedido={pedido} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserOrders;