import { useState, useEffect } from "react";
import CarritoModal from "./CarritoModal";
import "./Carrito.css";

function CarritoIcon() {
  const [mostrar, setMostrar] = useState(false);
  const [carrito, setCarrito] = useState([]);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("carrito")) || [];
    setCarrito(data);
  }, []);

  // Actualizar cantidad cuando cambie localStorage
  useEffect(() => {
    const handleStorage = () => {
      const data = JSON.parse(localStorage.getItem("carrito")) || [];
      setCarrito(data);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <>
      <button className="carrito-icono" onClick={() => setMostrar(true)}>
        🛒
        {totalItems > 0 && <span className="badge">{totalItems}</span>}
      </button>

      {mostrar && (
        <CarritoModal carrito={carrito} onClose={() => setMostrar(false)} />
      )}
    </>
  );
}

export default CarritoIcon;
