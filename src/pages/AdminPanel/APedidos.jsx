// Archivo: src/components/admin/APedidos.jsx

import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/api';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faStore,
  faClock,
  faCircleCheck,
  faTruck,
  faBan,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import './APedidos.css';

const APedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comercioSeleccionado, setComercioSeleccionado] = useState('todos');

  /* ===============================
     FETCH PEDIDOS
  =============================== */
  const fetchPedidos = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/pedidos', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPedidos(data);
    } catch (error) {
      console.error("Error al obtener pedidos:", error.response?.data);
      Swal.fire(
        'Error',
        'No se pudieron cargar los pedidos.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  /* ===============================
     COMERCIOS ÚNICOS (PARA EL SELECT)
  =============================== */
  const comercios = useMemo(() => {
    const map = new Map();
    pedidos.forEach((p) => {
      if (p.Comercio) {
        map.set(p.Comercio.id, p.Comercio);
      }
    });
    return Array.from(map.values());
  }, [pedidos]);

  /* ===============================
     FILTRO DE PEDIDOS
  =============================== */
  const pedidosFiltrados = useMemo(() => {
    if (comercioSeleccionado === 'todos') return pedidos;
    return pedidos.filter(
      (p) => p.Comercio?.id === Number(comercioSeleccionado)
    );
  }, [pedidos, comercioSeleccionado]);

  /* ===============================
     HELPERS
  =============================== */

  /*
  // ===============================
  // FORMATEO FECHA / HORA (DESHABILITADO)
  // ===============================
  // Usa createdAt del pedido
  // Formato: fecha corta + hora
  // Para reactivar:
  // 1) Descomentar este helper
  // 2) Descomentar la columna y el <td> en la tabla
  const formatFecha = (dateString) =>
    new Date(dateString).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  */

  const getEstadoInfo = (estado) => {
    switch ((estado || '').toLowerCase()) {
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
      <h2>
        <FontAwesomeIcon icon={faClipboardList} /> Gestión de Pedidos
      </h2>

      <div className="section-card">
        {/* ===============================
            FILTRO POR COMERCIO
        =============================== */}
        <div className="pedidos-filtros">
          <FontAwesomeIcon icon={faStore} />
          <select
            value={comercioSeleccionado}
            onChange={(e) => setComercioSeleccionado(e.target.value)}
          >
            <option value="todos">Todos los comercios</option>
            {comercios.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <h3>Pedidos ({pedidosFiltrados.length})</h3>

        {loading ? (
          <p>Cargando pedidos...</p>
        ) : (
          <table className="pedidos-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>
                  <FontAwesomeIcon icon={faStore} /> Comercio
                </th>
                <th>Total</th>

                {/*
                // ===============================
                // COLUMNA FECHA / HORA (DESHABILITADA)
                // ===============================
                <th>Fecha/Hora</th>
                */}

                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map((pedido) => {
                const estadoInfo = getEstadoInfo(pedido.estado || 'Nuevo');
                return (
                  <tr key={pedido.id}>
                    <td>#{pedido.id}</td>
                    <td>
                      <strong>
                        {pedido.Comercio?.nombre || 'Comercio Eliminado'}
                      </strong>
                    </td>
                    <td>
                      ${pedido.total.toLocaleString('es-CO')}
                    </td>

                    {/*
                    // ===============================
                    // CELDA FECHA / HORA (DESHABILITADA)
                    // ===============================
                    <td>{formatFecha(pedido.createdAt)}</td>
                    */}

                    <td>
                      <span
                        className="estado-tag-pedido"
                        style={{
                          backgroundColor: estadoInfo.color + '22',
                          color: estadoInfo.color,
                        }}
                      >
                        <FontAwesomeIcon
                          icon={estadoInfo.icon}
                          style={{ marginRight: '5px' }}
                        />
                        {estadoInfo.label}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-icon btn-view"
                        title="Ver Detalles"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {!loading && pedidosFiltrados.length === 0 && (
          <p>No hay pedidos para este comercio.</p>
        )}
      </div>
    </div>
  );
};

export default APedidos;
