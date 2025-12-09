import React, { useState, useEffect, useRef } from "react";
import { useCarrito } from "../Cart/CarritoContext"; 
import "./PlatoModal.css";

// Duración de la animación (debe coincidir con tu CSS)
const ANIMATION_DURATION = 400;

function PlatoModal({ plato, onClose }) {
    const [cantidad, setCantidad] = useState(1);
    const { agregarAlCarrito } = useCarrito();

    // Controla la visibilidad animada (entrada/salida)
    const [isVisible, setIsVisible] = useState(false);

    // Mantiene el plato visible durante la animación de salida
    const contentRef = useRef(plato);

    // Maneja entrada/salida del modal
    useEffect(() => {
        if (plato) {
            contentRef.current = plato;

            // activar animación de entrada
            const timer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            // iniciar animación de salida
            setIsVisible(false);
        }
    }, [plato]);

    const handleClose = () => {
        if (!isVisible) return;

        setIsVisible(false);

        setTimeout(() => {
            onClose(); // desmonta desde el padre
        }, ANIMATION_DURATION);
    };

    // Si no hay plato y ya terminó la animación → desmontar
    if (!plato && !isVisible) return null;

    // Mantener el contenido durante la salida
    const displayPlato = plato || contentRef.current;
    if (!displayPlato) return null;

    const handleAdd = () => {
        agregarAlCarrito({ ...displayPlato, cantidad });
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

                        <div className="modal-price">
                            <span>Precio:</span>
                            <h3>${(displayPlato.precio * cantidad).toLocaleString()}</h3>
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
