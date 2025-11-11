// src/components/Menu.jsx
import { useEffect, useState } from "react";
import api from "../../../api/api"; // usa tu instancia
import PlatoModal from "./PlatoModal";
import "./Menu.css";

export default function Menu() {
  const [platos, setPlatos] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [platoEditar, setPlatoEditar] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtiene el comercio activo de localStorage (soporta varias formas)
  const getComercioId = () => {
    try {
      const raw = localStorage.getItem("comercioActivo") || localStorage.getItem("usuarioActivo") || null;
      if (!raw) return null;
      const obj = JSON.parse(raw);
      // distintos posibles nombres de id según cómo guardes el objeto
      return obj?.id ?? obj?.comercio_id ?? obj?.comercio?.id ?? null;
    } catch (err) {
      console.error("Error parseando comercioActivo en localStorage", err);
      return null;
    }
  };

  const comercioId = getComercioId();

  useEffect(() => {
    if (!comercioId) {
      console.warn("No se encontró comercioActivo en localStorage. Usando comercio_id = 5 temporalmente");
      fetchPlatos(5); // fallback temporal si no hay login
      return;
    }
    fetchPlatos(comercioId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPlatos = async (id) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/platos/${id}`);
      // asegurarse que data sea array; si el back devuelve objeto único, convertirlo
      const lista = Array.isArray(data) ? data : data ? [data] : [];
      setPlatos(lista);
    } catch (error) {
      console.error("Error al obtener platos:", error);
      setPlatos([]);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setPlatoEditar(null);
    setModalAbierto(true);
  };

  const abrirModalEditar = (plato) => {
    setPlatoEditar(plato);
    setModalAbierto(true);
  };

  const cerrarModal = (refrescar = true) => {
    setModalAbierto(false);
    setPlatoEditar(null);
    if (refrescar) {
      // refresca la lista con el id correcto o fallback
      fetchPlatos(comercioId ?? 5);
    }
  };

  const eliminarPlato = async (id) => {
    const confirmado = window.confirm("¿Seguro que deseas eliminar este plato?");
    if (!confirmado) return;
    try {
      await api.delete(`/platos/${id}`);
      // quitar localmente sin volver a pedir si prefieres
      setPlatos((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error al eliminar plato:", error);
      alert("No se pudo eliminar el plato");
    }
  };

  return (
    <div className="menu-container">
      <div className="menu-header">
        <h2> Mi Menú</h2>
        <button className="agregar-btn" onClick={abrirModalNuevo}>
           Agregar Plato
        </button>
      </div>

      {loading ? (
        <p>Cargando platos...</p>
      ) : platos.length === 0 ? (
        <p className="sin-platos">No tienes platos registrados aún.</p>
      ) : (
        <div className="platos-lista">
          {platos.map((plato) => (
            <div key={plato.id} className="plato-cards">
              <img src={plato.imagen} alt={plato.nombre} className="plato-img" />
              <div className="plato-info">
                <h3>{plato.nombre}</h3>
                <p className="plato-desc">{plato.descripcion}</p>
                <p className="plato-precio">
                  ${Number(plato.precio).toLocaleString()}
                </p>
              </div>
              <div className="plato-actions">
                <button className="editar-btn" onClick={() => abrirModalEditar(plato)}>
                   Editar
                </button>
                <button className="eliminar-btn" onClick={() => eliminarPlato(plato.id)}>
                   Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalAbierto && (
        <PlatoModal
          onClose={cerrarModal}
          platoEditar={platoEditar}
          comercio_id={comercioId ?? 5} // pasar id correcto o fallback
        />
      )}
    </div>
  );
}
