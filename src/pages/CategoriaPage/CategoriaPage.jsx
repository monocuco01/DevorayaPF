    import React from "react";
import { useParams, Link } from "react-router-dom";
import { restaurantes } from "../../data/restaurants";
import DetailNavBar from "../../componets/DetailNavBar/DetailNavBar";
import "./CategoriaPage.css";

export default function CategoriaPage() {
  const { nombre } = useParams();

  // Filtrar restaurantes que coincidan con la categoría seleccionada
  const filtrados = restaurantes.filter(
    (rest) =>
      rest.categoriaRest.toLowerCase().trim() === nombre.toLowerCase().trim()
  );

  return (
    <div className="categoria-page">
      <DetailNavBar />
      <div className="categoria-header">
        <h1>{nombre}</h1>
        <p>Mostrando restaurantes de la categoría "{nombre}"</p>
      </div>

      {filtrados.length > 0 ? (
        <div className="categoria-grid">
          {filtrados.map((rest) => (
            <Link
              key={rest.id}
              to={`/restaurant/${rest.id}`}
              className="categoria-card"
            >
              <img src={rest.imagen} alt={rest.nombre} />
              <h3>{rest.nombre}</h3>
              <p>{rest.descripcion}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p className="sin-resultados">
          😔 No hay restaurantes en esta categoría todavía.
        </p>
      )}
    </div>
  );
}
