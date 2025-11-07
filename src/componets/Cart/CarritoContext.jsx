import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("carrito")) || [];
    setCarrito(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("carrito", JSON.stringify(carrito));
  }, [carrito]);

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const exists = prev.find((p) => p.id === producto.id);
      if (exists) {
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + producto.cantidad } : p
        );
      } else {
        toast.success(`${producto.nombre} agregado al carrito!`);
        return [...prev, producto];
      }
    });
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    setCarrito((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, cantidad: Math.max(1, nuevaCantidad) } : p))
        .filter((p) => p.cantidad > 0)
    );
  };

  const eliminarProducto = (id) => {
    setCarrito((prev) => prev.filter((p) => p.id !== id));
  };

  const limpiarCarrito = () => setCarrito([]);

  return (
    <CarritoContext.Provider
      value={{ carrito, agregarAlCarrito, actualizarCantidad, eliminarProducto, limpiarCarrito }}
    >
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => useContext(CarritoContext);
