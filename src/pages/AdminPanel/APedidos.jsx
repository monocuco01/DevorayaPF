// Archivo: src/components/admin/APedidos.jsx

import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClipboardList, faStore, faClock, faCircleCheck, faTruck, faBan, faEye } from '@fortawesome/free-solid-svg-icons';
import './APedidos.css'; // Asegúrate de crear este archivo CSS

const APedidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Función para obtener todos los pedidos con la información del comercio
    const fetchPedidos = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // 🚨 Endpoint asumido para la administración: GET /admin/pedidos
            const { data } = await api.get('/pedidos', { 
                headers: { Authorization: `Bearer ${token}` },
            });
            setPedidos(data);
        } catch (error) {
            console.error("Error al obtener pedidos:", error.response?.data);
            Swal.fire('Error', 'No se pudieron cargar los pedidos. Revisa que la ruta /admin/pedidos esté configurada.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
    }, []);

    // Helper para formatear la fecha
    const formatFecha = (dateString) => {
        return new Date(dateString).toLocaleString('es-CO', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
    };

    // Helper para mapear el estado a un ícono y color
    const getEstadoInfo = (estado) => {
        switch (estado.toLowerCase()) {
            case 'nuevo':
                return { icon: faClock, color: '#f39c12', label: 'Nuevo' };
            case 'preparacion':
                return { icon: faClock, color: '#3498db', label: 'En Preparación' };
            case 'enviado':
                return { icon: faTruck, color: '#2ecc71', label: 'Enviado' };
            case 'entregado':
                return { icon: faCircleCheck, color: '#27ae60', label: 'Entregado' };
            case 'cancelado':
                return { icon: faBan, color: '#e74c3c', label: 'Cancelado' };
            default:
                return { icon: faClipboardList, color: '#95a5a6', label: estado };
        }
    };

    return (
        <div className="a-pedidos-panel">
            <h2><FontAwesomeIcon icon={faClipboardList} /> Gestión de Pedidos</h2>

            <div className="section-card">
                <h3>Todos los Pedidos ({pedidos.length})</h3>
                {loading ? (
                    <p>Cargando pedidos...</p>
                ) : (
                    <table className="pedidos-table">
                        <thead>
                            <tr>
                                <th>ID Pedido</th>
                                <th><FontAwesomeIcon icon={faStore} /> Comercio</th>
                                <th>Total</th>
                                <th>Fecha/Hora</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map((pedido) => {
                                const estadoInfo = getEstadoInfo(pedido.estado || 'Nuevo');
                                return (
                                    <tr key={pedido.id}>
                                        <td>#{pedido.id}</td>
                                        {/* 🎯 CAMPO CLAVE: Muestra el nombre del comercio */}
                                        <td>
                                            <strong>{pedido.Comercio?.nombre || 'Comercio Eliminado'}</strong>
                                        </td>
                                        <td>${pedido.total.toLocaleString('es-CO')}</td>
                                        <td>{formatFecha(pedido.createdAt)}</td>
                                        <td>
                                            <span 
                                                className="estado-tag-pedido"
                                                style={{ backgroundColor: estadoInfo.color + '22', color: estadoInfo.color }}
                                            >
                                                <FontAwesomeIcon icon={estadoInfo.icon} style={{ marginRight: '5px' }} />
                                                {estadoInfo.label}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-icon btn-view" title="Ver Detalles">
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {!loading && pedidos.length === 0 && (
                    <p>No hay pedidos registrados.</p>
                )}
            </div>
        </div>
    );
};

export default APedidos;