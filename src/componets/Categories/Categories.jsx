import React, { useState, useEffect } from "react";
import "./Categories.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/api"; // tu instancia de Axios

export default function Categories() {
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔄 Obtener categorías desde el backend
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const { data } = await api.get("/categorias");
        setCategorias(data);
      } catch (error) {
        console.error("❌ Error al obtener categorías:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategorias();
  }, []);

  const handleClick = (nombre) => {
    navigate(`/categoria/${encodeURIComponent(nombre)}`);
  };

  if (loading) return <p className="text-center text-gray-600">Cargando categorías...</p>;

  return (
    <section className="categories-section">
      <h2 className="categories-title"> Categorías</h2>
      <div className="categories-grid">
        {categorias.map((cat, i) => (
          <div
            key={i}
            className="category-card"
            onClick={() => handleClick(cat.nombre)}
          >
            <img
              src={cat.imgUrl}
              alt={cat.nombre}
              className="category-img"
              loading="lazy"
            />
            <div className="category-overlay">
              <p>{cat.nombre}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
