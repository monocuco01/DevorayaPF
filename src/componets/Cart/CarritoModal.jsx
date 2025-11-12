import { useCarrito } from "./CarritoContext.jsx";
import { useNavigate } from "react-router-dom";

import "./Carrito.css";

export default function CarritoModal({ open, setOpen }) {
  const { carrito, actualizarCantidad, eliminarProducto, limpiarCarrito } = useCarrito();
const { agregarAlCarrito } = useCarrito();
  const navigate = useNavigate();

  const subtotal = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  if (!open) return null;

  return (
    <>
      {/* Overlay para cerrar el carrito al hacer clic afuera */}
      <div
        className="containerCartOverlay"
        onClick={() => setOpen(false)}
      ></div>

      {/* Contenedor del carrito */}
      <div className={`containerCartALL ${open ? "open" : ""}`}>
        <h3> Tu Carrito</h3>
        <ul>
          {carrito.length === 0 && <p>El carrito está vacío</p>}
          {carrito.map((item) => (
            <li key={item.id}>
              <img src={item.imagen} alt={item.nombre} />
              <div className="containerCart">
                <p>{item.nombre}</p>
                <p>${item.precio} x {item.cantidad}</p>
                <div className="botoncitossumapave">
                  <button onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}>-</button>
                
                  <button onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}>+</button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Subtotal */}
        <div className="subtotal-container">
          <strong>Subtotal:</strong>
          <span>${subtotal.toLocaleString()}</span>
        </div>

        {/* Botones de acción */}
        <button
        className="botonpaylink"
        onClick={() => {
          setOpen(false);
          navigate("/checkout");
        }}
      >
        Pagar
      </button>
        <button className="botonpaylink" onClick={limpiarCarrito}>
          Vaciar Carrito
        </button>
      </div>
    </>
  );
}
