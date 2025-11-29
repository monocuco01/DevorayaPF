import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api/api";
import "./SearchResults.css";

// COMPONENTE SKELETON PARA RESULTADOS
const SearchResultSkeleton = ({ index }) => (
    <div key={index} className="result-card skeleton-search-card">
        <div className="skeleton-search-img"></div>
        <div className="result-info">
            <div className="skeleton-search-title"></div>
            <div className="skeleton-search-desc"></div>
            <div className="skeleton-search-status"></div>
        </div>
    </div>
);

const SKELETON_COUNT = 4;
const skeletonArray = Array.from({ length: SKELETON_COUNT });


export default function SearchResults() {
  const { termino } = useParams();
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarComercios = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/comercios");
        
        const terminoLimpio = termino.toLowerCase().trim();
        
        // 🔥 CREACIÓN DE LA EXPRESIÓN REGULAR (RegEx)
        // 'i' hace que la búsqueda sea insensible a mayúsculas/minúsculas
        const regex = new RegExp(terminoLimpio, 'i'); 

        const filtrados = data.filter((comercio) => {
            // Combinamos el nombre y la descripción para buscar en un solo texto
            const textoBusqueda = `${comercio.nombre} ${comercio.descripcion || ''}`;
            
            // Usamos test() para verificar si la RegEx encuentra el patrón
            return regex.test(textoBusqueda);
        });

        setResultados(filtrados);
      } catch (error) {
        console.error("Error en la búsqueda:", error);
      } finally {
        setLoading(false);
      }
    };

    if (termino) {
        buscarComercios();
    }
  }, [termino]);

  if (loading) return (
    <div className="search-results-page">
      <h2>Buscando: <span className="highlight">"{termino}"</span></h2>
      <div className="results-grid">
        {skeletonArray.map((_, i) => (
          <SearchResultSkeleton key={i} index={i} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="search-results-page">
      <h2>Resultados para: <span className="highlight">"{termino}"</span></h2>

      {resultados.length === 0 ? (
        <div className="no-results">
            <p>😕 No encontramos restaurantes que coincidan.</p>
            <Link to="/" className="back-link">Volver al inicio</Link>
        </div>
      ) : (
        <div className="results-grid">
          {resultados.map((rest) => (
            <Link to={`/restaurant/${rest.id}`} key={rest.id} className="result-card">
              <img src={rest.logo} alt={rest.nombre} />
              <div className="result-info">
                <h3>{rest.nombre}</h3>
                <p>{rest.descripcion}</p>
                <span className="status-tag">
                    {rest.estado ? "🟢 Abierto" : "🔴 Cerrado"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}