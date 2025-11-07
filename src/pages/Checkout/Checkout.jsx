import { useCarrito } from "../../componets/Cart/CarritoContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Checkout.css";

export default function Checkout() {
  const { carrito, limpiarCarrito } = useCarrito();
  const navigate = useNavigate();

  const [nombreRecibe, setNombreRecibe] = useState("");
  const [direccion, setDireccion] = useState("");
  const [instrucciones, setInstrucciones] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");

  const total = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const handleConfirmar = () => {
    if (!nombreRecibe || !direccion) {
      alert("Por favor completa el nombre y la dirección antes de confirmar.");
      return;
    }

    const pedido = {
      nombreRecibe,
      direccion,
      instrucciones,
      metodoPago,
      total,
      productos: carrito,
      fecha: new Date().toLocaleString(),
    };

    console.log("🧾 Pedido confirmado:", pedido);
    alert("✅ Pedido confirmado. ¡Gracias por usar Devoraya!");

    limpiarCarrito();
    navigate("/home");
  };

  return (
    <div className="checkout-container">
      <h2>Confirmar Pedido</h2>

      {/* Lista de productos */}
      <div className="checkout-lista">
        {carrito.map((item) => (
          <div key={item.id} className="checkout-item">
            <img src={item.imagen} alt={item.nombre} />
            <div>
              <p>{item.nombre}</p>
              <p>
                {item.cantidad} x ${item.precio.toLocaleString()}
              </p>
            </div>
            <p className="checkout-total">
              ${(item.precio * item.cantidad).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Formulario de entrega */}
      <div className="checkout-resumen">
        <p>
          <strong>Total:</strong> ${total.toLocaleString()}
        </p>

        <label>Nombre de quien recibe</label>
        <input
          type="text"
          placeholder="Ej: Juan Pérez"
          value={nombreRecibe}
          onChange={(e) => setNombreRecibe(e.target.value)}
        />

        <label>Dirección de entrega</label>
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

        <label>Método de pago</label>
        <select
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
        >
          <option>Efectivo</option>
          <option>Transferencia</option>
          <option>Nequi</option>
          <option>Tarjeta</option>
        </select>

        <button className="boton-confirmar" onClick={handleConfirmar}>
          Confirmar Pedido
        </button>
      </div>
    </div>
  );
}
