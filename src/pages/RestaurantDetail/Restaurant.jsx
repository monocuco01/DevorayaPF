import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/api";
import PlatoModal from "../../componets/PlatoModal/PlatoModal.jsx";
import { useCarrito } from "../../componets/Cart/CarritoContext.jsx"; // 👈 contexto global
import { toast } from "react-toastify";
import "./Restaurant.css";

function Restaurant() {
  const { id } = useParams();
  const [comercio, setComercio] = useState(null);
  const [platos, setPlatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [platoSeleccionado, setPlatoSeleccionado] = useState(null);
  const { agregarProducto } = useCarrito(); // 👈 usar función del contexto

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: comercioData } = await api.get(`/comercios/${id}`);
        setComercio(comercioData);

        const { data: platosData } = await api.get(`/platos/${id}`);
        setPlatos(platosData);
      } catch (error) {
        console.error("Error al obtener los datos del restaurante:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <p className="text-center">Cargando restaurante...</p>;
  if (!comercio) return <div className="not-found">Restaurante no encontrado 😕</div>;

  // 🔹 Función para agregar al carrito usando contexto + toast
  const handleAddToCart = (plato, cantidad = 1) => {
    agregarProducto(plato, cantidad); // 👈 contexto global maneja carrito
    toast.success(`${plato.nombre} agregado al carrito!`, {
      position: "top-right",
      autoClose: 2000,
    });
  };

  return (
    <div className="restaurant-page">
      <div className="restaurant-header">
        <img src={comercio.logo} alt={comercio.nombre} className="restaurant-img" />
        <div className="restaurant-info">
          <h1>{comercio.nombre}</h1>
          <p>{comercio.descripcion}</p>
          <p><strong>Categoría:</strong> {comercio.Categorium?.nombre || "Sin categoría"}</p>
          <p><strong>Dirección:</strong> {comercio.direccion}</p>
        </div>
      </div>

      <h2 className="menu-title"> Platos</h2>

      <div className="menu-grid">
        {platos.length > 0 ? (
          platos.map((plato) => (
            <div
              key={plato.id}
              className="plato-card"
              onClick={() => setPlatoSeleccionado(plato)} // abre modal
            >
              <img src={plato.imagen} alt={plato.nombre} className="plato-img" />
              <h3>{plato.nombre}</h3>
              <p>{plato.descripcion}</p>
              <p className="plato-precio"> 
    ${plato.precio.toLocaleString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
      </p>
              {plato.destacado && <span className="plato-tag">⭐ Destacado</span>}
            </div>
          ))
        ) : (
          <p>No hay platos disponibles por ahora </p>
        )}
      </div>

      <Link to="/" className="back-btn">⬅ Volver al inicio</Link>

      {/* 🔹 Modal */}
      {platoSeleccionado && (
        <PlatoModal
          plato={platoSeleccionado}
          onClose={() => setPlatoSeleccionado(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
}

export default Restaurant;
