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

// ⏱️ Frecuencia de refresco para el estado del comercio (en milisegundos)
const REFRESH_INTERVAL = 30000; // 30 segundos

function Restaurant() {
    const { id } = useParams();
    const [comercio, setComercio] = useState(null);
    const [platos, setPlatos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [platoSeleccionado, setPlatoSeleccionado] = useState(null);
    const { agregarProducto } = useCarrito();
    const [cantidad, setCantidad] = useState(1);
    // 🆕 ESTADO DE FILTROS
    const [filtroDestacado, setFiltroDestacado] = useState(false);
    const [filtroPrecio, setFiltroPrecio] = useState("all");

    // 🚩 FUNCIÓN CENTRAL PARA OBTENER DATOS
    const fetchData = async (isInitialLoad = false) => {
        try {
            if (isInitialLoad) setLoading(true); 

            // 1. Obtener datos del Comercio (incluyendo el estado 'estado')
            const { data: comercioData } = await api.get(`/comercios/${id}`);
            
            // console.log("🚩 Datos del Comercio Recibidos (incluyendo estado Abierto):", comercioData);
            setComercio(comercioData);
console.log("🚩 Datos del Comercio Recibidos (incluyendo estado Abierto):", comercioData);
            // 2. Obtener datos de los Platos
            if (isInitialLoad || platos.length === 0) {
                 const { data: platosData } = await api.get(`/platos/${id}`);
                 setPlatos(platosData);
            }
           
        } catch (error) {
            console.error("Error al obtener los datos del restaurante:", error);
        } finally {
            if (isInitialLoad) setLoading(false);
        }
    };

    useEffect(() => {
        // Ejecutamos la carga inicial
        fetchData(true);

        // 🆕 Establecer el intervalo de refresco para el estado del comercio
        const intervalId = setInterval(() => {
            fetchData(false);
        }, REFRESH_INTERVAL);

        // 🧹 FUNCIÓN DE LIMPIEZA
        return () => clearInterval(intervalId);
    }, [id]);

    // 🔹 Lógica para generar la lista de Métodos de Pago
    const metodosDePago = [];
    if (comercio && comercio.acepta_pago_contraentrega) {
        metodosDePago.push("Contra Entrega");
    }
    if (comercio && comercio.acepta_pago_online) {
        metodosDePago.push("Pago Online");
    }
    const metodosDePagoDisplay = metodosDePago.length > 0 ? metodosDePago.join(" / ") : "Efectivo";


    // 🆕 LÓGICA DE FILTRADO
    const platosFiltrados = platos.filter(plato => {
        if (filtroDestacado && !plato.destacado) {
            return false;
        }

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

    // 🔹 Función para agregar al carrito
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
                {/* 1. Título y Descripción Principal */}
                <h1 className="info-title">{comercio.nombre}</h1>
                <p className="info-description">{comercio.descripcion}</p>

                {/* 2. Información Clave con Iconos */}
                <div className="info-key-details">
                    <div className="detail-item">
                        <span className="icon">📍</span>
                        <p className="detail-text">{comercio.direccion}</p>
                    </div>
                    <div className="detail-item">
                        <span className="icon">⏰</span>
                        <p className="detail-text">{comercio.horario_apertura} - {comercio.horario_cierre}</p>
                    </div>
                    <div className="detail-item">
                        <span className="icon">🛵</span>
                        <p className="detail-text">
                            {comercio.tiempo_promedio_entrega || "No especificado"} min 
                            
                        </p>
                    </div>
                </div>

                {/* 3. Tags y Badges para Info Secundaria/Estado */}
                <div className="info-badges">
                    {/* Badge de Categoría */}
                    <span className="badge category-badge">
                        {comercio.Categorium?.nombre || "General"}
                    </span>

                    {/* 💳 Badge de Métodos de Pago */}
                    <span className="badge payment-badge">
                        💳 {metodosDePagoDisplay}
                    </span>
                    
                    {/* 🛵 Badge de Tipo de Servicio */}
                    <span className="badge service-badge">
                        {comercio.tipo_servicio === 'domicilio' ? '🛵 Domicilio' : '🛍️ Recoger'}
                    </span>

                    {/* 🟢 Badge de Estado (CORREGIDO) */}
                    <span className={`badge status-badge ${comercio.estado ? "status-open" : "status-closed"}`}>
                        {comercio.estado ? "🟢 Abierto Ahora" : "🔴 Cerrado"}
                    </span>
                </div>
            </div>

            </div>

            <h2 className="menu-title"> Menú de Platos</h2>

            {/* BARRA DE FILTROS AL ESTILO CHIP */}
            <div className="filter-bar">
                
                <button 
                    onClick={() => setFiltroDestacado(!filtroDestacado)}
                    className={`filter-button destacados-button ${filtroDestacado ? 'active' : ''}`}
                >
                    ⭐ Destacados
                </button>
                
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
            {/* FIN BARRA DE FILTROS */}

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
                            
                            <p className="plato-precio"> 
                                ${plato.precio.toLocaleString()}
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