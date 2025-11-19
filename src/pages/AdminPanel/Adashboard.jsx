// Archivo: src/components/admin/Adashboard.jsx

import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Adashboard.css'; 

// 🚨 IMPORTACIONES DE FONT AWESOME
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers,       // Para Usuarios
    faStore,       // Para Comercios
    faClock,       // Para Pedidos Pendientes
    faDollarSign,  // Para Ingresos
    faChartBar     // Icono general para el título
} from '@fortawesome/free-solid-svg-icons';


// Componente KpiCard para renderizar las estadísticas
const KpiCard = ({ title, value, icon, color }) => (
    <div className="kpi-card" style={{ borderLeft: `5px solid ${color}` }}>
        <div className="kpi-icon" style={{ backgroundColor: color }}>
            {/* Renderizamos el icono de Font Awesome con color blanco */}
            <FontAwesomeIcon icon={icon} style={{ color: 'white' }} /> 
        </div>
        <div className="kpi-info">
            <span className="kpi-title">{title}</span>
            <span className="kpi-value">{value}</span>
        </div>
    </div>
);


// 💡 USO DE EXPORT DEFAULT
const Adashboard = () => {
    // Estado inicial que coincide con el endpoint del backend (obtenerKpisAdmin)
    const [kpis, setKpis] = useState({
        totalUsuarios: 0,
        totalComercios: 0,
        pedidosPendientes: 0,
        totalIngresos: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Función para formatear moneda (asumiendo COP, como en la sugerencia anterior)
    const formatCurrency = (amount) => {
        return (amount ?? 0).toLocaleString('es-CO', { 
            style: 'currency', 
            currency: 'COP', 
            minimumFractionDigits: 0 
        });
    };

    // 🔄 Lógica de carga de estadísticas
    useEffect(() => {
        const fetchKpis = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await api.get('/admin', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                
                setKpis(data);
                setLoading(false);

            } catch (err) {
                console.error("Error al cargar los KPIs del administrador:", err.response?.data || err.message);
                
                // Manejo de error de autenticación/autorización
                if (err.response?.status === 401 || err.response?.status === 403) {
                     Swal.fire({
                        icon: 'error',
                        title: 'Acceso Denegado',
                        text: 'Tu sesión ha expirado o no tienes permisos de administrador.',
                        confirmButtonColor: '#3085d6',
                     }).then(() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("usuarioActivo");
                        navigate('/login');
                     });
                } else {
                    setError("Error al cargar los indicadores. Intente de nuevo.");
                    setLoading(false);
                }
            }
        };

        fetchKpis();
    }, [navigate]);

    if (loading) {
        return <div className="section-card">Cargando indicadores del sistema...</div>;
    }

    if (error) {
        return <div className="section-card error-message">{error}</div>;
    }

    return (
        <div className="admin-dashboard">
            <h2><FontAwesomeIcon icon={faChartBar} /> Resumen del Sistema</h2>

            <div className="kpi-grid">
                
                <KpiCard
                    title="Total de Usuarios"
                    value={kpis.totalUsuarios.toLocaleString()}
                    icon={faUsers}
                    color="#00c896"
                />

                <KpiCard
                    title="Comercios Activos"
                    value={kpis.totalComercios.toLocaleString()}
                    icon={faStore}
                    color="#3498db"
                />

                <KpiCard
                    title="Pedidos en Proceso"
                    value={kpis.pedidosPendientes.toLocaleString()}
                    icon={faClock}
                    color="#f39c12"
                />

                <KpiCard
                    title="Ingresos Totales (Est.)"
                    value={formatCurrency(kpis.totalIngresos)}
                    icon={faDollarSign}
                    color="#27ae60"
                />
            </div>
            
            <div className="section-card" style={{ marginTop: '30px' }}>
                <h3>Actividad Principal</h3>
                <p>Aquí se podría integrar una tabla de los últimos registros de usuarios o pedidos.</p>
            </div>
        </div>
    );
};

export default Adashboard;