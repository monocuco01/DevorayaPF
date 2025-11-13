import { useEffect, useState } from "react";
import { useCarrito } from "./CarritoContext.jsx";
import { useNavigate } from "react-router-dom";
import "./Carrito.css";

export default function CarritoModal({ open, setOpen }) {
  const { carrito, actualizarCantidad, eliminarProducto, limpiarCarrito } = useCarrito();
  const navigate = useNavigate();

  // Control para animaciones (montar/desmontar suave)
  const [mounted, setMounted] = useState(false); // si el DOM debe montarse
  const [visible, setVisible] = useState(false); // si se aplica la clase .open

  // Duración de la transición en ms: debe coincidir con tu CSS (aquí 750ms)
  const TRANSITION_MS = 750;

  useEffect(() => {
    if (open) {
      // montar y luego activar la animación (pequeña espera para forzar frame)
      setMounted(true);
      const t = setTimeout(() => setVisible(true), 20);
      return () => clearTimeout(t);
    } else {
      // quitar la clase .open (inicia animación de salida), luego desmontar
      setVisible(false);
      const t = setTimeout(() => setMounted(false), TRANSITION_MS + 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  function handleClose() {
    setOpen(false);
  }

  // Si no está montado, no renderizamos nada
  if (!mounted) return null;

  return (
    <>
      <div
        className={`containerCartOverlay ${open ? "show" : ""}`}
        onClick={handleClose}
      />

      <aside
        className={`containerCartALL ${visible ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        onClick={(e) => e.stopPropagation()} // evitar que clics dentro cierren por burbujeo
      >
        <button className="cart-close" onClick={handleClose} aria-label="Cerrar carrito">
          ×
        </button>

        <h3>Tu Carrito</h3>

        <ul className="cart-list">
          {carrito.length === 0 && <p className="empty-message">El carrito está vacío</p>}

          {carrito.map((item) => (
            <li key={item.id} className="cart-item">
              <img src={item.imagen} alt={item.nombre} />
              <div className="containerCart">
                <p className="item-name">{item.nombre}</p>
                <p className="item-price">${item.precio} x {item.cantidad}</p>

                <div className="botoncitossumapave">
                  <button
                    onClick={() => actualizarCantidad(item.id, Math.max(1, item.cantidad - 1))}
                    aria-label={`Disminuir cantidad de ${item.nombre}`}
                  >
                    -
                  </button>

                  <span className="cantidad">{item.cantidad}</span>

                  <button
                    onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                    aria-label={`Aumentar cantidad de ${item.nombre}`}
                  >
                    +
                  </button>

                  <button
                    className="remove-btn"
                    onClick={() => eliminarProducto(item.id)}
                    aria-label={`Eliminar ${item.nombre}`}
                  >
                    eliminar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="subtotal-container">
          <strong>Subtotal:</strong>
          <span>${subtotal.toLocaleString()}</span>
        </div>

        <button
          className="botonpaylink"
          onClick={() => {
            setOpen(false);
            navigate("/checkout");
          }}
        >
          Pagar
        </button>

        <button
          className="botonpaylink secondary"
          onClick={() => {
            limpiarCarrito();
          }}
        >
          Vaciar Carrito
        </button>
      </aside>
    </>
  );
}
