// Archivo: src/components/admin/Comercios.jsx

import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import ComercioForm from './ComercioForm'; 
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faStore, faEdit, faToggleOn, faToggleOff, faBan } from '@fortawesome/free-solid-svg-icons';
import './Comercios.css'; 

const Comercios = () => {
    const [comercios, setComercios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false); 

    const fetchComercios = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            // 💡 Usando GET / (obtenerComercios) de tu router principal
            const { data } = await api.get('/comercios', { 
                headers: { Authorization: `Bearer ${token}` },
            });
            setComercios(data);
        } catch (error) {
            console.error("Error al obtener comercios:", error.response?.data);
            Swal.fire('Error', 'No se pudieron cargar los comercios.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComercios();
    }, []);

    const handleCreationSuccess = () => {
        setShowForm(false); 
        fetchComercios();   
    };

    // Función para Activar/Desactivar el estado del comercio
    const handleToggleEstado = async (id, nombre, estadoActual) => {
        const nuevoEstado = !estadoActual;
        const accion = nuevoEstado ? 'activar' : 'desactivar';

        const result = await Swal.fire({
            title: `¿Desea ${accion} a ${nombre}?`,
            text: `El comercio pasará a estado ${nuevoEstado ? 'ACTIVO' : 'INACTIVO'}.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: nuevoEstado ? "#2ecc71" : "#c0392b",
            cancelButtonColor: "#3085d6",
            confirmButtonText: `Sí, ${accion}`,
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                const token = localStorage.getItem('token');
                // 💡 Usando PUT /actualizar-estado/:comercio_id de tu router principal
                await api.put(`/comercios/actualizar-estado/${id}`, { estado: nuevoEstado }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                Swal.fire('Hecho!', `El comercio ${nombre} ha sido ${accion === 'desactivar' ? 'desactivado' : 'activado'}.`, 'success');
                fetchComercios(); // Recargar lista
            } catch (error) {
                console.error("Error al cambiar estado:", error);
                Swal.fire('Error', 'No se pudo cambiar el estado del comercio.', 'error');
            }
        }
    };

    return (
        <div className="comercios-panel">
            <h2><FontAwesomeIcon icon={faStore} /> Gestión de Comercios</h2>

            {/* Botón de Crear */}
            <div className="comercios-header">
                <button 
                    onClick={() => setShowForm(!showForm)} 
                    className={`btn-primary ${showForm ? 'btn-cancel' : ''}`}
                >
                    <FontAwesomeIcon icon={showForm ? faBan : faPlus} /> {showForm ? 'Cancelar Creación' : 'Crear Nuevo Comercio'}
                </button>
            </div>

            {/* Formulario Renderizado Condicionalmente */}
            {showForm && (
                <ComercioForm 
                    onCreationSuccess={handleCreationSuccess} 
                    onCancel={() => setShowForm(false)} 
                />
            )}

            {/* Listado de Comercios */}
            <div className="section-card">
                <h3>Comercios Registrados ({comercios.length})</h3>
                {loading ? (
                    <p>Cargando comercios...</p>
                ) : (
                    <table className="comercios-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Categoría</th> 
                                <th>Correo</th>
                                <th>Estado</th>
                                <th>Registro</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comercios.map((comercio) => (
                                <tr key={comercio.id}>
                                    <td>{comercio.id}</td>
                                    <td>{comercio.nombre}</td>
                                    {/* Muestra el nombre de la categoría si está cargada */}
                                    <td>{comercio.Categoria?.nombre || 'N/A'}</td> 
                                    <td>{comercio.correo}</td>
                                    <td>
                                        <span className={`estado-tag estado-${comercio.estado ? 'activo' : 'inactivo'}`}>
                                            {comercio.estado ? 'ACTIVO' : 'INACTIVO'}
                                        </span>
                                    </td>
                                    <td>{new Date(comercio.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn-icon btn-edit" title="Editar">
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button 
                                            className={`btn-icon btn-${comercio.estado ? 'desactivar' : 'activar'}`} 
                                            title={comercio.estado ? 'Desactivar' : 'Activar'}
                                            onClick={() => handleToggleEstado(comercio.id, comercio.nombre, comercio.estado)}
                                        >
                                            <FontAwesomeIcon icon={comercio.estado ? faToggleOff : faToggleOn} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Comercios;