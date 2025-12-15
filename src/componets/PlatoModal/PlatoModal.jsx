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
        <button className="close-btn" onClick={handleClose}>
          ✖
        </button>

        <div className="modal-body">
          <div className="modal-img-container">
            <img
              src={displayPlato.imagen}
              alt={displayPlato.nombre}
              className="modal-img"
            />
          </div>

          <div className="modal-info">
            <h1>{displayPlato.nombre}</h1>
            <p className="modal-desc">{displayPlato.descripcion}</p>

            {/* ===== OPCIONES ===== */}
            {tieneOpciones && (
              <div className="modal-options">
                <label>
                  Opción {opcionObligatoria && <span>*</span>}
                </label>
                <select
                  value={opcionSeleccionada}
                  onChange={(e) => setOpcionSeleccionada(e.target.value)}
                >
                  <option value="">
                    {opcionObligatoria
                      ? "Selecciona una opción"
                      : "Sin opción"}
                  </option>
                  {opciones.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="modal-price">
              <span>Precio:</span>
              <h3>
                $
                {(displayPlato.precio * cantidad).toLocaleString()}
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
              <button
                onClick={() => setCantidad((c) => c + 1)}
                className="qty-btn"
              >
                +
              </button>
            </div>

            <button className="add-btn" onClick={handleAdd}>
              Agregar al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlatoModal;
