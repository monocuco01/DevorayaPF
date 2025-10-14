import React, { useMemo } from "react";
import "./Categories.css";
import { restaurantes } from "../../data/restaurants";
import { useNavigate } from "react-router-dom";

export default function Categories() {
  const navigate = useNavigate();

  // Extraemos las categorías únicas del archivo restaurants.js
  const categorias = useMemo(() => {
    const unique = [];
    restaurantes.forEach((r) => {
      const nombre = r.categoriaRest.trim();
      if (!unique.find((c) => c.name === nombre)) {
        unique.push({
          name: nombre,
          image: r.imagen, // Usa la imagen del primer restaurante con esa categoría
        });
      }
    });
    return unique;
  }, []);

  const handleClick = (nombre) => {
    navigate(`/categoria/${encodeURIComponent(nombre)}`);
  };

  return (
    <section className="categories-section">
      <h2 className="categories-title">🍴 Categorías</h2>
      <div className="categories-grid">
        {categorias.map((cat, i) => (
          <div
            key={i}
            className="category-card"
            onClick={() => handleClick(cat.name)}
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="category-img"
              loading="lazy"
            />
            <div className="category-overlay">
              <p>{cat.name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
