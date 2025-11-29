import React, { useState, useEffect } from "react";
import "./Categories.css";
import { useNavigate } from "react-router-dom";
import api from "../../api/api"; // tu instancia de Axios

// ===========================================
// NUEVO COMPONENTE: TARJETA DE SKELETON
// ===========================================
const SkeletonCard = ({ key }) => (
    // Estas clases deben definirse en Categories.css
    <div key={key} className="skeleton-card"> 
        <div className="skeleton-img"></div>
        <div className="skeleton-overlay">
            <div className="skeleton-text"></div>
        </div>
    </div>
);

// Número de tarjetas de carga a mostrar
const SKELETON_COUNT = 6;
const skeletonArray = Array.from({ length: SKELETON_COUNT });


export default function Categories() {
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(true);

    // 🔄 Obtener categorías desde el backend
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                // Opcional: añade un pequeño delay para que el efecto se vea mejor
                // await new Promise(resolve => setTimeout(resolve, 1000)); 
                
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

    // ===========================================
    // RENDERIZADO DEL SKELETON LOADER
    // ===========================================
    if (loading) {
        return (
            <section className="categories-section">
                <h2 className="categories-title"> Categorías</h2>
                <div className="categories-grid">
                    {/* Renderiza las tarjetas de esqueleto */}
                    {skeletonArray.map((_, i) => (
                        <SkeletonCard key={i} />
                    ))}
                </div>
            </section>
        );
    }

    // ===========================================
    // RENDERIZADO DEL CONTENIDO REAL
    // ===========================================
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