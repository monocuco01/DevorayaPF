import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../../api/api";
import PlatoModal from "../../componets/PlatoModal/PlatoModal.jsx";
import { useCarrito } from "../../componets/Cart/CarritoContext.jsx";
import { toast } from "react-toastify";
import "./Restaurant.css";

// 🔹 Constante para los filtros de precio
const PRICE_FILTERS = [
    { label: "Todos los precios", value: "all" },
    { label: "$ Económico", value: "low" },   // Precio <= 15000
    { label: "$$ Medio", value: "medium" }, // 15000 < Precio <= 30000
    { label: "$$$ Alto", value: "high" },   // Precio > 30000
];

function Restaurant() {
    const { id } = useParams();
    const [comercio, setComercio] = useState(null);
    const [platos, setPlatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [platoSeleccionado, setPlatoSeleccionado] = useState(null);
    const { agregarProducto } = useCarrito();
    const [cantidad, setCantidad] = useState(1);
    // 🆕 ESTADO DE FILTROS
    const [filtroDestacado, setFiltroDestacado] = useState(false); // true/false
    const [filtroPrecio, setFiltroPrecio] = useState("all");      // 'all', 'low', 'medium', 'high'
     
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: comercioData } = await api.get(`/comercios/${id}`);
                setComercio(comercioData);

                const { data: platosData } = await api.get(`/platos/${id}`);
                setPlatos(platosData);
            } catch (error) {
                console.error("Error al obtener los datos del restaurante:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // 🆕 LÓGICA DE FILTRADO
    const platosFiltrados = platos.filter(plato => {
        // 1. Filtro Destacados
        if (filtroDestacado && !plato.destacado) {
            return false;
        }

        // 2. Filtro Precio
        if (filtroPrecio !== "all") {
            const precio = plato.precio;
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

    if (loading) return <p className="text-center">Cargando restaurante...</p>;
    if (!comercio) return <div className="not-found">Restaurante no encontrado 😕</div>;

    // 🔹 Función para agregar al carrito usando contexto + toast
    const handleAddToCart = (plato, cantidad = 1) => {
        agregarProducto(plato, cantidad);
        toast.success(`${plato.nombre} agregado al carrito!`, {
            position: "top-right",
            autoClose: 2000,
        });
    };

    return (
        <div className="restaurant-page">
            <div className="restaurant-header">
                <img src={comercio.logo} alt={comercio.nombre} className="restaurant-img" />
                <div className="restaurant-info">
                    <h1>{comercio.nombre}</h1>
                    <p>{comercio.descripcion}</p>
                    <p><strong>Categoría:</strong> {comercio.Categorium?.nombre || "Sin categoría"}</p>
                    <p><strong>Dirección:</strong> {comercio.direccion}</p>
                </div>
            </div>

            <h2 className="menu-title"> Menú de Platos</h2>

            {/* 🆕 BARRA DE FILTROS AL ESTILO CHIP */}
            <div className="filter-bar">
                
                {/* Filtro 1: Destacados (Toggle Button) */}
                <button 
                    onClick={() => setFiltroDestacado(!filtroDestacado)}
                    className={`filter-button destacados-button ${filtroDestacado ? 'active' : ''}`}
                >
                    ⭐ Destacados
                </button>
                
                {/* Filtro 2: Precio (Select/Dropdown) */}
                <select 
                    onChange={(e) => setFiltroPrecio(e.target.value)}
                    value={filtroPrecio}
                    className="filter-select"
                >
                    {PRICE_FILTERS.map(filter => (
                        <option key={filter.value} value={filter.value}>
                            {filter.label}
                        </option>
                    ))}
                </select>

                {/* Botón para resetear filtros */}
                {(filtroDestacado || filtroPrecio !== 'all') && (
                    <button 
                        onClick={() => {
                            setFiltroDestacado(false);
                            setFiltroPrecio('all');
                        }}
                        className="reset-button"
                    >
                        ❌ Limpiar Filtros
                    </button>
                )}
            </div>
            {/* 🆕 FIN BARRA DE FILTROS */}

            <div className="menu-grid">
                {platosFiltrados.length > 0 ? (
                    platosFiltrados.map((plato) => (
                        <div
                            key={plato.id}
                            className="plato-card"
                            onClick={() => setPlatoSeleccionado(plato)}
                        >
                            <img src={plato.imagen} alt={plato.nombre} className="plato-img" />
                            <h3>{plato.nombre}</h3>
                            <p>{plato.descripcion}</p>
                            
                            {/* 💰 CORRECCIÓN APLICADA AQUÍ */}
                            <p className="plato-precio"> 
  ${(plato.precio * cantidad).toLocaleString()}
                            </p>
                            {plato.destacado && <span className="plato-tag">⭐ Destacado</span>}
                        </div>
                    ))
                ) : (
                    <p className="no-platos">No hay platos que coincidan con los filtros aplicados. </p>
                )}
            </div>

            <Link to="/" className="back-btn">⬅ Volver al inicio</Link>

            {/* 🔹 Modal */}
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