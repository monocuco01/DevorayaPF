import { useEffect, useState } from "react";
import api from "../../api/api";
import Swal from "sweetalert2";
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

const PedidoItem = ({ pedido }) => {
    const [detalleAbierto, setDetalleAbierto] = useState(false);

    const formattedDate = pedido.createdAt
        ? new Date(pedido.createdAt).toLocaleDateString()
        : "Sin fecha";

    const totalFormateado = pedido.total?.toLocaleString() ?? "0";

    return (
        <div className="">
          
        <div className={`pedido-item ${detalleAbierto ? "expanded" : ""}`}>
            <div className="pedido-header" onClick={() => setDetalleAbierto(!detalleAbierto)}>
                
                <div className="info-columna">
                    <p>
                        <strong>Pedido #{pedido.id}</strong> – {formattedDate}
                    </p>

                    <p className="restaurante-nombre">
                        Restaurante: <strong>{pedido.Comercio?.nombre || "No disponible"}</strong>
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

                    <span className="toggle-icon">{detalleAbierto ? "➖" : "➕"}</span>
                </div>
            </div>

            {detalleAbierto && (
                <div className="pedido-detalle">
                    <h4>Productos ({pedido.Platos?.length || 0})</h4>

                    <ul className="productos-list">
                        {pedido.Platos?.length > 0 ? (
                            pedido.Platos.map((plato, index) => (
                                <li key={index}>
                                    <strong>{plato.PedidoPlato?.cantidad || 1}x</strong>{" "}
                                    {plato.nombre}
                                    <span className="item-price">
                                        ${(plato.precio * (plato.PedidoPlato?.cantidad || 1)).toLocaleString()}
                                    </span>
                                </li>
                            ))
                        ) : (
                            <li>No hay productos</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
        </div>
    );
};

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
                console.log("📦 DATA REAL DEL BACKEND:", res.data);
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
            <h2> Historial de Pedidos</h2>

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
