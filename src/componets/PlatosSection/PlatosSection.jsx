import React, { useState, useEffect } from "react";
import "./PlatosSection.css";
import { Link } from "react-router-dom";
import api from "../../api/api";

/* ===========================================
   SKELETON
=========================================== */
const SkeletonCard = ({ key }) => (
  <div key={key} className="plato-card skeleton-plato-card">
    <div className="skeleton-plato-img"></div>
    <div className="skeleton-plato-text-group">
      <div className="skeleton-plato-title"></div>
      <div className="skeleton-plato-desc"></div>
    </div>
  </div>
);

const skeletons = Array.from({ length: 6 });

/* ===========================================
   SECCIÓN PLATOS
=========================================== */
const PlatosGrid = ({ title, platos, loading }) => (
  <section className="platos-section">
    <h2 className="platos-title">{title}</h2>

    <div className="platos-grid">
      {loading
        ? skeletons.map((_, i) => <SkeletonCard key={i} />)
        : platos.map((plato) => (
            <Link
              to={`/restaurant/${plato.ComercioId}`}
              key={plato.id}
              className="plato-card"
            >
              <img src={plato.imagen} alt={plato.nombre} className="plato-img" />
              <h3>{plato.nombre}</h3>
              <p>${plato.precio}</p>
            </Link>
          ))}
    </div>
  </section>
);

/* ===========================================
   SECCIÓN COMERCIOS
=========================================== */
const ComerciosGrid = ({ title, comercios, loading }) => (
  <section className="platos-section">
    <h2 className="platos-title">{title}</h2>

    <div className="platos-grid">
      {loading
        ? skeletons.map((_, i) => <SkeletonCard key={i} />)
        : comercios.map((rest) => (
            <Link
              to={`/restaurant/${rest.id}`}
              key={rest.id}
              className="plato-card"
            >
              <img src={rest.logo} alt={rest.nombre} className="plato-img" />
              <h3>{rest.nombre}</h3>
              <p>{rest.descripcion}</p>
            </Link>
          ))}
    </div>
  </section>
);

/* ===========================================
   COMPONENTE PRINCIPAL
=========================================== */
function PlatosSection() {
  const [comercios, setComercios] = useState([]);
  const [platosSemana, setPlatosSemana] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        /* ---------- 1. Traer comercios ---------- */
        const { data: comerciosData } = await api.get("/comercios");
        setComercios(comerciosData);

        /* ---------- 2. Platos destacados ---------- */
        const platosDestacados = [];

        for (const comercio of comerciosData) {
          try {
            const { data: platos } = await api.get(
              `/platos/comercio/${comercio.id}`
            );

            platos
              .filter((p) => p.destacado === true)
              .forEach((p) =>
                platosDestacados.push({
                  ...p,
                  ComercioId: comercio.id,
                })
              );
              console.log(platosDestacados)
          } catch (err) {
            console.warn("Error platos comercio", comercio.id);
          }
        }

        setPlatosSemana(platosDestacados);
      } catch (error) {
        console.error("Error general:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /* ---------- Lo más vendido (HARDCODED) ---------- */
const masVendidoIds = [35, 36, 41];

const masVendido = comercios.filter((c) =>
  masVendidoIds.includes(c.id)
);


  /* ---------- Recomendados ---------- */
  const recomendados = comercios.slice(0, 8);

  return (
    <>
      <PlatosGrid
        title="🍽 Platos de la semana"
        platos={platosSemana}
        loading={loading}
      />

      <ComerciosGrid
        title="⭐ Restaurantes que te pueden gustar"
        comercios={recomendados}
        loading={loading}
      />

      <ComerciosGrid
        title="🔥 Lo más vendido"
        comercios={masVendido}
        loading={loading}
      />
    </>
  );
}

export default PlatosSection;
