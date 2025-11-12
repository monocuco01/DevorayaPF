import { useState } from "react";
import { useCarrito } from "../Cart/CarritoContext" // ✅ Importa el hook correcto
import "./PlatoModal.css";

function PlatoModal({ plato, onClose }) {
  const [cantidad, setCantidad] = useState(1);
  const { agregarAlCarrito } = useCarrito(); // ✅ Obtén la función desde el contexto

  if (!plato) return null;

  const handleAdd = () => {
    agregarAlCarrito({ ...plato, cantidad });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-contents" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>

        <img src={plato.imagen} alt={plato.nombre} className="modal-img" />
        <h2>{plato.nombre}</h2>
        <p className="modal-desc">{plato.descripcion}</p>

        <div className="modal-price">
          <span>Precio:</span>
        <h3>
  ${(plato.precio * cantidad).toLocaleString()}
</h3>

        </div>

        <div className="modal-quantity">
          <button
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
            className="qty-btn"
          >
            -
          </button>
          <span>{cantidad}</span>
          <button onClick={() => setCantidad((c) => c + 1)} className="qty-btn">
            +
          </button>
        </div>

       

        <button className="add-btn" onClick={handleAdd}>
           Agregar al carrito
        </button>
      </div>
    </div>
  );
}

export default PlatoModal;
