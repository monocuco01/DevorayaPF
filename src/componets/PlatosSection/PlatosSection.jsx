import "./PlatosSection.css";
import { Link } from "react-router-dom";
import { restaurantes } from "../../data/restaurants";

function PlatosSection() {
  return (
    <section className="platos-section">
      <h2 className="platos-title">🍴 Establecimientos que te pueden gustar</h2>
      <div className="platos-grid">
        {restaurantes.map((rest) => (
  <Link
    to={`/restaurant/${rest.id}`}
    key={rest.id}
    className="plato-card"
  >
    <img src={rest.imagen} alt={rest.nombre} className="plato-img" />
    <h3>{rest.nombre}</h3>
    <p>{rest.descripcion}</p>
  </Link>
))}

      </div>
    </section>
  );
}

export default PlatosSection;
