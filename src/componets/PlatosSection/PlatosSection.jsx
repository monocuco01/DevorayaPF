import "./PlatosSection.css";
import { Link } from "react-router-dom";
import { restaurantes } from "../../data/restaurants";
import { useState, useEffect } from "react";
import api from "../../api/api";
function PlatosSection() {
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComercios = async () => {
      try {
        const { data } = await api.get("/comercios"); // <-- tu endpoint real
        setComercios(data);
      } catch (error) {
        console.error("Error al obtener comercios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComercios();
  }, []);

  if (loading) return <p className="text-center text-gray-600">Cargando comercios...</p>;

  return (
    <section className="platos-section">
      <h2 className="platos-title">🍴 Establecimientos que te pueden gustar</h2>
      <div className="platos-grid">
        {comercios.map((rest) => (
          <Link
            to={`/restaurant/${rest.id}`}
            key={rest.id}
            className="plato-card"
          >
            <img
              src={rest.logo}
              alt={rest.nombre}
              className="plato-img"
            />
            <h3>{rest.nombre}</h3>
            <p>{rest.descripcion}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default PlatosSection;
