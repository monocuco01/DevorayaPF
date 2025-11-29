import React, { useState, useEffect } from "react";
import "./PlatosSection.css";
import { Link } from "react-router-dom";
import api from "../../api/api"; // tu instancia de Axios

// ===========================================
// NUEVO COMPONENTE: TARJETA DE SKELETON
// ===========================================
const SkeletonPlatoCard = ({ key }) => (
    // Las clases 'plato-card' se usan para heredar estilos de cuadrícula
    <div key={key} className="plato-card skeleton-plato-card">
        {/* Marcador de posición para la imagen */}
        <div className="skeleton-plato-img"></div>
        
        {/* Marcadores de posición para el texto */}
        <div className="skeleton-plato-text-group">
            <div className="skeleton-plato-title"></div>
            <div className="skeleton-plato-desc"></div>
            <div className="skeleton-plato-desc short"></div>
        </div>
    </div>
);

// Número de tarjetas de carga a mostrar (puedes ajustar este número)
const SKELETON_COUNT = 8;
const skeletonArray = Array.from({ length: SKELETON_COUNT });


function PlatosSection() {
    const [comercios, setComercios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchComercios = async () => {
            try {
                // Opcional: añade un pequeño delay para que el efecto se vea
                // await new Promise(resolve => setTimeout(resolve, 1000)); 
                
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

    // ===========================================
    // RENDERIZADO DEL SKELETON LOADER
    // ===========================================
    if (loading) {
        return (
            <section className="platos-section">
                <h2 className="platos-title"> Establecimientos que te pueden gustar</h2>
                <div className="platos-grid">
                    {skeletonArray.map((_, i) => (
                        <SkeletonPlatoCard key={i} />
                    ))}
                </div>
            </section>
        );
    }

    // ===========================================
    // RENDERIZADO DEL CONTENIDO REAL
    // ===========================================
    return (
        <section className="platos-section">
            <h2 className="platos-title"> Establecimientos que te pueden gustar</h2>
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