import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/api";
import PlatoModal from "../../componets/PlatoModal/PlatoModal.jsx";
import { useCarrito } from "../../componets/Cart/CarritoContext.jsx";
import { toast } from "react-toastify";
import "./Restaurant.css";

const PRICE_FILTERS = [
    { label: "Todos los precios", value: "all" },
    { label: "$ Económico", value: "low" },
    { label: "$$ Medio", value: "medium" },
    { label: "$$$ Alto", value: "high" },
];

const REFRESH_INTERVAL = 30000;
const FALLBACK_IMG =
    "https://res.cloudinary.com/dziwyqnqk/image/upload/v1765255779/Gemini_Generated_Image_l0j1fel0j1fel0j1_cs2esc.png";

const RestaurantHeaderSkeleton = () => (
    <div className="restaurant-header skeleton-header">
        <div className="restaurant-img skeleton-img-lg"></div>
        <div className="restaurant-info">
            <div className="info-title skeleton-text-title"></div>
            <div className="info-description skeleton-text-md"></div>
            <div className="info-description skeleton-text-sm"></div>

            <div className="info-key-details" style={{ marginTop: "20px" }}>
                <div className="detail-item skeleton-text-sm"></div>
                <div className="detail-item skeleton-text-sm"></div>
                <div className="detail-item skeleton-text-sm"></div>
            </div>

            <div className="info-badges">
                <div className="badge skeleton-badge"></div>
                <div className="badge skeleton-badge"></div>
            </div>
        </div>
    </div>
);

const PlatoCardSkeleton = ({ index }) => (
    <div key={index} className="plato-card skeleton-card">
        <div className="plato-img skeleton-plato-img"></div>
        <div className="skeleton-text-group">
            <div className="skeleton-plato-title"></div>
            <div className="skeleton-plato-desc"></div>
            <div className="skeleton-plato-price"></div>
        </div>
    </div>
);

const SKELETON_PLATO_COUNT = 6;
const skeletonPlatoArray = Array.from({ length: SKELETON_PLATO_COUNT });

function Restaurant() {
    const { id } = useParams();
    const [comercio, setComercio] = useState(null);
    const [platos, setPlatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [platoSeleccionado, setPlatoSeleccionado] = useState(null);
    const { agregarProducto } = useCarrito();

    const [filtroDestacado, setFiltroDestacado] = useState(false);
    const [filtroPrecio, setFiltroPrecio] = useState("all");

    const [categoriaActiva, setCategoriaActiva] = useState(null);

    const formatCurrency = (amount) => {
        if (!amount) return "$0";
        const valorEntero = Math.floor(Number(amount));
        return "$" + valorEntero.toLocaleString("es-CO");
    };

    const fetchData = async (isInitialLoad = false) => {
        try {
            if (isInitialLoad) setLoading(true);

            const { data: comercioData } = await api.get(`/comercios/${id}`);
            setComercio(comercioData);

            if (isInitialLoad || platos.length === 0) {
                const { data: platosData } = await api.get(`/platos/${id}`);
                setPlatos(platosData);
            }
        } catch (error) {
            console.error("Error al obtener datos del restaurante:", error);
        } finally {
            if (isInitialLoad) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(true);
        const intervalId = setInterval(() => fetchData(false), REFRESH_INTERVAL);
        return () => clearInterval(intervalId);
    }, [id]);

    const metodosDePago = [];
    if (comercio?.acepta_pago_contraentrega) metodosDePago.push("Contra Entrega");
    if (comercio?.acepta_pago_online) metodosDePago.push("Pago Online");
    const metodosDePagoDisplay =
        metodosDePago.length > 0 ? metodosDePago.join(" / ") : "Efectivo";

    const platosFiltrados = platos.filter((plato) => {
        if (filtroDestacado && !plato.destacado) return false;

        if (filtroPrecio !== "all") {
            const precio = Number(plato.precio);
            switch (filtroPrecio) {
                case "low":
                    if (precio > 15000) return false;
                    break;
                case "medium":
                    if (precio <= 15000 || precio > 30000) return false;
                    break;
                case "high":
                    if (precio <= 30000) return false;
                    break;
                default:
                    break;
            }
        }
        return true;
    });

    const handleAddToCart = (plato, cantidad = 1) => {
        agregarProducto(plato, cantidad);
        toast.success(`${plato.nombre} agregado al carrito!`, {
            position: "top-right",
            autoClose: 2000,
        });
    };

    const platosPorCategoria = platosFiltrados.reduce((acc, plato) => {
        const cat = plato.categoria || "General";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(plato);
        return acc;
    }, {});

    useEffect(() => {
        const handler = () => {
            const categorias = Object.keys(platosPorCategoria);

            categorias.forEach((cat) => {
                const section = document.getElementById(`cat-${cat}`);
                if (!section) return;

                const rect = section.getBoundingClientRect();
                if (rect.top <= 150 && rect.bottom >= 150) {
                    setCategoriaActiva(cat);
                }
            });
        };

        window.addEventListener("scroll", handler);
        return () => window.removeEventListener("scroll", handler);
    }, [platosPorCategoria]);

    const scrollToCategoria = (categoria) => {
        const section = document.getElementById(`cat-${categoria}`);
        if (section) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    if (loading) {
        return (
            <div className="restaurant-page">
                <RestaurantHeaderSkeleton />
                <h2 className="menu-title"> Menú de Platos</h2>
                <div className="filter-bar">
                    <div className="filter-button skeleton-filter-btn"></div>
                    <div className="filter-select skeleton-filter-btn"></div>
                </div>
                <div className="menu-grid">
                    {skeletonPlatoArray.map((_, i) => (
                        <PlatoCardSkeleton key={i} index={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (!comercio)
        return <div className="not-found">Restaurante no encontrado 😕</div>;

    return (
        <div className="restaurant-page">
            <div className="restaurant-header">
                <img
                    src={comercio.logo}
                    alt={comercio.nombre}
                    className="restaurant-img"
                />
                <div className="restaurant-info">
                    <h1 className="info-title">{comercio.nombre}</h1>
                    <p className="info-description">{comercio.descripcion}</p>

                    <div className="info-key-details">
                        <div className="detail-item">
                            <span className="icon">📍</span>
                            <p className="detail-text">{comercio.direccion}</p>
                        </div>
                        <div className="detail-item">
                            <span className="icon">⏰</span>
                            <p className="detail-text">
                                {comercio.horario_apertura} -{" "}
                                {comercio.horario_cierre}
                            </p>
                        </div>
                        <div className="detail-item">
                            <span className="icon">🛵</span>
                            <p className="detail-text">
                                {comercio.tiempo_promedio_entrega ||
                                    "No especificado"}{" "}
                                min{" "}
                            </p>
                        </div>
                    </div>

                    <div className="info-badges">
                        <span className="badge category-badge">
                            {comercio.Categorium?.nombre || "General"}
                        </span>
                        <span className="badge payment-badge">
                            💳 {metodosDePagoDisplay}
                        </span>
                        <span className="badge service-badge">
                            {comercio.tipo_servicio === "domicilio"
                                ? "🛵 Domicilio"
                                : "🛍️ Recoger"}
                        </span>
                        <span
                            className={`badge status-badge ${
                                comercio.estado ? "status-open" : "status-closed"
                            }`}
                        >
                            {comercio.estado ? "🟢 Abierto Ahora" : "🔴 Cerrado"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="categoria-nav sticky">
                {Object.keys(platosPorCategoria).map((cat) => (
                    <button
                        key={cat}
                        className={`categoria-nav-btn ${
                            categoriaActiva === cat ? "active" : ""
                        }`}
                        onClick={() => scrollToCategoria(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <h2 className="menu-title"> Menú de Platos</h2>

            <div className="filter-bar">
                <button
                    onClick={() => setFiltroDestacado(!filtroDestacado)}
                    className={`filter-button destacados-button ${
                        filtroDestacado ? "active" : ""
                    }`}
                >
                    ⭐ Destacados
                </button>

                <select
                    onChange={(e) => setFiltroPrecio(e.target.value)}
                    value={filtroPrecio}
                    className="filter-select"
                >
                    {PRICE_FILTERS.map((filter) => (
                        <option key={filter.value} value={filter.value}>
                            {filter.label}
                        </option>
                    ))}
                </select>

                {(filtroDestacado || filtroPrecio !== "all") && (
                    <button
                        onClick={() => {
                            setFiltroDestacado(false);
                            setFiltroPrecio("all");
                        }}
                        className="reset-button"
                    >
                        ❌ Limpiar Filtros
                    </button>
                )}
            </div>

            {/* 🔥 Render de platos con fallback de imagen */}
            {Object.keys(platosPorCategoria).map((categoria) => (
                <div
                    key={categoria}
                    id={`cat-${categoria}`}
                    className="categoria-section"
                >
                    <h3 className="categoria-title">{categoria}</h3>

                    <div className="menu-grid">
                        {platosPorCategoria[categoria].map((plato) => {
                            const imgSrc =
                                plato.imagen &&
                                plato.imagen.trim() !== "" &&
                                plato.imagen !== "null"
                                    ? plato.imagen
                                    : FALLBACK_IMG;

                            return (
                                <div
                                    key={plato.id}
                                    className="plato-card"
                                    onClick={() =>
                                        setPlatoSeleccionado(plato)
                                    }
                                >
                                    <img
                                        src={imgSrc}
                                        alt={plato.nombre}
                                        className="plato-img"
                                    />
                                    <h3>{plato.nombre}</h3>
                                    <p>{plato.descripcion}</p>
                                    <p className="plato-precio">
                                        {formatCurrency(plato.precio)}
                                    </p>

                                    {plato.destacado && (
                                        <span className="plato-tag">
                                            ⭐ Destacado
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            <Link to="/" className="back-btn">
                ⬅ Volver al inicio
            </Link>

            {platoSeleccionado && (
                <PlatoModal
                    plato={platoSeleccionado}
                    onClose={() => setPlatoSeleccionado(null)}
                    onAddToCart={handleAddToCart}
                />
            )}
        </div>
    );
}

export default Restaurant;
