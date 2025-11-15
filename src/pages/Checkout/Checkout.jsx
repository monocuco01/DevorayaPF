import { useCarrito } from "../../componets/Cart/CarritoContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ShoppingCart, CreditCard, MapPin, User } from "lucide-react";
import api from "../../api/api"; // Asegúrate de tener tu instancia axios aquí
import "./Checkout.css";

// 🔥 Función correcta para obtener el usuario desde localStorage
const getUserId = () => {
  try {
    const raw = localStorage.getItem("usuarioActivo") || null;
    if (!raw) return null;
    return JSON.parse(raw)?.id ?? null;
  } catch {
    return null;
  }
};

export default function Checkout() {
  const { carrito, limpiarCarrito } = useCarrito();
  const navigate = useNavigate();

  const [nombreRecibe, setNombreRecibe] = useState("");
  const [direccion, setDireccion] = useState("");
  const [instrucciones, setInstrucciones] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");

  const usuario_id = getUserId();

  const total = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  // 📌 CONFIRMAR PEDIDO
  const handleConfirmar = async () => {
    if (!usuario_id) {
      alert("Debes iniciar sesión antes de confirmar el pedido.");
      navigate("/login");
      return;
    }

    if (!nombreRecibe || !direccion) {
      alert("Por favor completa el nombre y la dirección antes de confirmar.");
      return;
    }

    if (carrito.length === 0) {
      alert("Tu carrito está vacío.");
      return;
    }

    const pedido = {
      usuario_id,
      comercio_id: carrito[0].comercio_id, // ⚠️ muy importante
      direccion_entrega: direccion,
      instrucciones,
      metodo_pago: metodoPago,
      nombre_recibe: nombreRecibe,
      total,
      platos: carrito.map((item) => ({
        id: item.id,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
    };

    try {
      const res = await api.post("/pedidos", pedido);

      alert("✅ Pedido confirmado exitosamente.");
      limpiarCarrito();
      navigate("/");
    } catch (error) {
      console.error("Error al enviar pedido:", error);
      alert("Hubo un problema creando tu pedido.");
    }
  };

  return (
    <div className="checkout-wrapper">
      <div className="checkout-header">
        <ShoppingCart size={30} />
        <h2>Confirmar tu pedido</h2>
      </div>

      <div className="checkout-container">

        {/* 🧾 LISTA DEL CARRITO */}
        <div className="checkout-lista">
          <h3>Resumen de tu carrito</h3>

          {carrito.length === 0 ? (
            <p className="vacio">Tu carrito está vacío</p>
          ) : (
            carrito.map((item) => (
              <div key={item.id} className="checkout-item">
                <img src={item.imagen} alt={item.nombre} />

                <div>
                  <p className="nombre">{item.nombre}</p>
                  <p className="detalle">{item.cantidad} x ${item.precio.toLocaleString()}</p>
                </div>

                <p className="checkout-total">
                  ${(item.precio * item.cantidad).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* 🏡 FORMULARIO */}
        <div className="checkout-form">
          <h3>Datos de entrega</h3>

          <label>
            <User size={18} /> Nombre de quien recibe
          </label>
          <input
            type="text"
            placeholder="Ej: Juan Pérez"
            value={nombreRecibe}
            onChange={(e) => setNombreRecibe(e.target.value)}
          />

          <label>
            <MapPin size={18} /> Dirección de entrega
          </label>
          <input
            type="text"
            placeholder="Ej: Calle 45 #23-10"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />

          <label>Instrucciones de entrega (opcional)</label>
          <textarea
            placeholder="Ej: Llamar al llegar o dejar en portería"
            value={instrucciones}
            onChange={(e) => setInstrucciones(e.target.value)}
          ></textarea>

          <label>
            <CreditCard size={18} /> Método de pago
          </label>
          <select
            value={metodoPago}
            onChange={(e) => setMetodoPago(e.target.value)}
          >
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Nequi">Nequi</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>

          <div className="checkout-final">
            <p>
              <strong>Total a pagar:</strong> ${total.toLocaleString()}
            </p>
            <button className="boton-confirmar" onClick={handleConfirmar}>
              Confirmar Pedido
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
