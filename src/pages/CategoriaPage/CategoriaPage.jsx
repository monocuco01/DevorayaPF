import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DetailNavBar from "../../componets/DetailNavBar/DetailNavBar";
import api from "../../api/api"; // tu instancia de Axios
import "./CategoriaPage.css";

export default function CategoriaPage() {
  const { nombre } = useParams();
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Traer comercios por categoría desde el backend
  useEffect(() => {
    const fetchComercios = async () => {
      try {
        const { data } = await api.get("/comercios");
        // Filtrar por nombre de categoría
        const filtrados = data.filter(
          (c) =>
            c.Categorium?.nombre?.toLowerCase().trim() ===
            nombre.toLowerCase().trim()
        );
        setComercios(filtrados);
      } catch (error) {
        console.error("❌ Error al cargar comercios por categoría:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComercios();
  }, [nombre]);

  if (loading) return <p className="text-center text-gray-600">Cargando comercios...</p>;

  return (
    <div className="categoria-page">
      <DetailNavBar />
      <div className="categoria-header">
        <h1>{nombre}</h1>
        <p>Mostrando restaurantes de la categoría "{nombre}"</p>
      </div>

      {comercios.length > 0 ? (
        <div className="categoria-grid">
          {comercios.map((rest) => (
            <Link
              key={rest.id}
              to={`/restaurant/${rest.id}`}
              className="categoria-card"
            >
              <img src={rest.logo} alt={rest.nombre} />
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
