import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { useCarrito } from "../Cart/CarritoContext";
import "./PlatoModal.css";

const ANIMATION_DURATION = 400;

function PlatoModal({ plato, onClose }) {
  const [cantidad, setCantidad] = useState(1);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState("");
  const { agregarAlCarrito } = useCarrito();

  const [isVisible, setIsVisible] = useState(false);
  const contentRef = useRef(plato);

  useEffect(() => {
    if (plato) {
      contentRef.current = plato;
      setCantidad(1);
      setOpcionSeleccionada("");

      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [plato]);

  const handleClose = () => {
    if (!isVisible) return;
    setIsVisible(false);

    setTimeout(() => {
      onClose();
    }, ANIMATION_DURATION);
  };

  if (!plato && !isVisible) return null;

  const displayPlato = plato || contentRef.current;
  if (!displayPlato) return null;

  const opciones = displayPlato.OpcionPlatos || [];
  const tieneOpciones = opciones.length > 0;
  const opcionObligatoria = opciones.some((o) => o.obligatorio);

  const handleAdd = () => {
    if (tieneOpciones && opcionObligatoria && !opcionSeleccionada) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona una opción",
        text: "Este plato requiere elegir una opción",
      });
      return;
    }

    const opcionElegida = opciones.find(
      (o) => o.id === Number(opcionSeleccionada)
    );

    agregarAlCarrito({
      ...displayPlato,
      cantidad,
      opciones: opcionElegida
        ? [
            {
              opcion_plato_id: opcionElegida.id,
              nombre_opcion: opcionElegida.nombre,
              valor: 0,
            },
          ]
        : [],
    });

    handleClose();
  };

  return (
    <div
      className={`modal-overlay ${isVisible ? "is-open" : ""}`}
      onClick={handleClose}
    >
     <div className="modal-contents" onClick={(e) => e.stopPropagation()}>
  <button className="close-btn" onClick={handleClose}>✖</button>

  <div className="modal-layout">
    
    {/* COLUMNA IZQUIERDA: IMAGEN */}
    <div className="layout-left">
      <img
        src={displayPlato.imagen}
        alt={displayPlato.nombre}
        className="product-img"
      />
    </div>

    {/* COLUMNA DERECHA: INFO + OPCIONES + FOOTER */}
    <div className="layout-right">
      
      {/* Zona Scrolleable (Título, descripción, opciones) */}
      <div className="scrollable-content">
        <div className="product-header">
          <h1>{displayPlato.nombre}</h1>
          <p className="product-desc">{displayPlato.descripcion}</p>
        </div>

        {tieneOpciones && (
          <div className="options-container">
            <div className="options-header">
              <label>
                Elige tu Base {opcionObligatoria && <span className="tag-required">Obligatorio</span>}
              </label>
              <span className="subtitle">Selecciona 1 opción</span>
            </div>

            <div className="options-list">
              {opciones.map((op) => (
                <label key={op.id} className={`option-item ${opcionSeleccionada === op.id ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="opcion-producto"
                    value={op.id}
                    checked={opcionSeleccionada === op.id}
                    onChange={() => setOpcionSeleccionada(op.id)}
                  />
                  <div className="option-row">
                    {op.imagen && <img src={op.imagen} alt={op.nombre} className="opt-img" />}
                    <span className="opt-name">{op.nombre}</span>
                    <div className="radio-circle">
                      <div className="radio-dot"></div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Fijo (Siempre abajo en la columna derecha) */}
      <div className="modal-footer">
        <div className="qty-control">
           <button onClick={() => setCantidad(Math.max(1, cantidad - 1))}>-</button>
           <span>{cantidad}</span>
           <button onClick={() => setCantidad(cantidad + 1)}>+</button>
        </div>
        
        <button className="add-btn" onClick={handleAdd}>
          <span>Agregar</span>
          <span>${(displayPlato.precio * cantidad).toLocaleString()}</span>
        </button>
      </div>

    </div>
  </div>
</div>
    </div>
  );
}

export default PlatoModal;
