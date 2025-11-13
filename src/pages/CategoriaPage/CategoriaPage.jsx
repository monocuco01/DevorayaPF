import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Usaremos useNavigate para cambiar la URL
import DetailNavBar from "../../componets/DetailNavBar/DetailNavBar";
import api from "../../api/api";
import "./CategoriaPage.css";
import { Link } from "react-router-dom";

export default function CategoriaPage() {
    const { nombre } = useParams();
    const navigate = useNavigate(); // Hook para navegación
    
    const [comercios, setComercios] = useState([]);
    const [categorias, setCategorias] = useState([]); // 🆕 Nuevo estado para todas las categorías
    const [loading, setLoading] = useState(true);

    // 1. Cargar todas las categorías disponibles
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                // Suponemos que tienes un endpoint para todas las categorías
                const { data } = await api.get("/categorias"); 
                setCategorias(data);
            } catch (error) {
                console.error("❌ Error al cargar las categorías:", error);
            }
        };
        fetchCategorias();
    }, []);

    // 2. Traer comercios por la categoría seleccionada (basada en el URL)
    useEffect(() => {
        const fetchComercios = async () => {
            setLoading(true);
            try {
                // Obtener todos los comercios (o usar un endpoint filtrado si existe)
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
    }, [nombre]); // Se ejecuta cada vez que el nombre de la URL cambia

    // 🆕 Handler para cambiar de categoría
    const handleCategoryChange = (nombre) => {
        // Redirige a la nueva URL, lo que activa el useEffect de los comercios
       navigate(`/categoria/${encodeURIComponent(nombre)}`);; 
    };

    // La página siempre muestra la categoría seleccionada
    const currentCategory = nombre;

    return (
        <div className="categoria-page">

            <div className="categoria-header">
                <h1>{currentCategory}</h1>
            </div>
            
            {/* 🆕 BARRA DE FILTROS/CATEGORÍAS */}
            <div className="category-filter-bar">
                {categorias.map((cat) => (
                    <div 
                        key={cat.id} 
                        className={`category-chip ${
                            cat.nombre.toLowerCase().trim() === currentCategory.toLowerCase().trim() ? 'active' : ''
                        }`}
                        onClick={() => handleCategoryChange(cat.nombre)}
                    >
                        {/* Asume que 'cat.icono' existe o usa un ícono por defecto */}
                        {/* <img src={cat.icono} alt={cat.nombre} className="chip-icon" /> */}
                        <span className="chip-text">{cat.nombre}</span>
                    </div>
                ))}
            </div>
            {/* 🆕 FIN BARRA DE FILTROS */}

            {loading ? (
                <p className="loading-text">Cargando restaurantes de {currentCategory}...</p>
            ) : comercios.length > 0 ? (
                <div className="categoria-grid">
                    {/* ... (Tu mapeo de comercios se mantiene igual) ... */}
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
                    😔 No hay restaurantes en la categoría "{currentCategory}" todavía.
                </p>
            )}
        </div>
    );
}