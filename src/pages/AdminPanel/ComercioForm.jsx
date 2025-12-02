// Archivo: src/components/admin/ComercioForm.jsx

import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import Swal from 'sweetalert2';

const ComercioForm = ({ onCreationSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        nombre: '', direccion: '', telefono: '', correo: '', contraseña: '',
        logo: '', propietario: '', descripcion: '',
        horario_apertura: '09:00',
        horario_cierre: '22:00',
        tiempo_promedio_entrega: 30,
        acepta_pago_online: false,
        acepta_pago_contraentrega: true,
        tipo_servicio: 'domicilio',
        costo_envio: 0,
        pedido_minimo: 0,
        tiempo_espera_maximo: 40,
        categoria_id: ''
    });

    const [loading, setLoading] = useState(false);
    const [categorias, setCategorias] = useState([]);

    // Cargar categorías
    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const { data } = await api.get('/categorias');
                setCategorias(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, categoria_id: data[0].id }));
                }
            } catch (error) {
                console.error("Error al cargar categorías:", error);
            }
        };
        fetchCategorias();
    }, []);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        const name = e.target.name;

        if ([
            'costo_envio',
            'pedido_minimo',
            'tiempo_promedio_entrega',
            'tiempo_espera_maximo',
            'categoria_id'
        ].includes(name)) {
            setFormData({ ...formData, [name]: Number(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            // 1️⃣ Crear comercio
            const comercioResponse = await api.post('/comercios/registrar', formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const comercioId = comercioResponse.data?.id;

            if (!comercioId) {
                throw new Error("No se obtuvo el ID del comercio.");
            }

            // 2️⃣ Crear menú automático asociado a ese comercio
            await api.post('/menus', {
                nombre: "Menú Principal",
                descripcion: "Menú generado automáticamente",
                comercio_id: comercioId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Swal.fire('¡Éxito!', 'Comercio y Menú creados correctamente.', 'success');
            onCreationSuccess();

        } catch (error) {
            console.error('Error al crear comercio o menú:', error.response?.data);
            Swal.fire('Error', error.response?.data?.mensaje || 'Error al crear el comercio.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section-card comercio-form-container">
            <h3>Crear Nuevo Comercio</h3>
            <form onSubmit={handleSubmit} className="comercio-form grid-2">

                <div className="form-group">
                    <label>Nombre:</label>
                    <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Propietario:</label>
                    <input type="text" name="propietario" value={formData.propietario} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Correo (Login):</label>
                    <input type="email" name="correo" value={formData.correo} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Contraseña:</label>
                    <input type="password" name="contraseña" value={formData.contraseña} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Teléfono:</label>
                    <input type="text" name="telefono" value={formData.telefono} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Dirección:</label>
                    <input type="text" name="direccion" value={formData.direccion} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Categoría:</label>
                    <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} required>
                        <option value="">Seleccione Categoría</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label>Logo URL (Opcional):</label>
                    <input type="text" name="logo" value={formData.logo} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Horario Apertura:</label>
                    <input type="time" name="horario_apertura" value={formData.horario_apertura} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Horario Cierre:</label>
                    <input type="time" name="horario_cierre" value={formData.horario_cierre} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Tipo de Servicio:</label>
                    <select name="tipo_servicio" value={formData.tipo_servicio} onChange={handleChange} required>
                        <option value="domicilio">Domicilio</option>
                        <option value="local">Local</option>
                        <option value="ambos">Ambos</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Tiempo Entrega Promedio (min):</label>
                    <input type="number" name="tiempo_promedio_entrega" value={formData.tiempo_promedio_entrega} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Costo Envío:</label>
                    <input type="number" name="costo_envio" value={formData.costo_envio} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>Tiempo Espera Máximo (min):</label>
                    <input type="number" name="tiempo_espera_maximo" value={formData.tiempo_espera_maximo} onChange={handleChange} required />
                </div>

                <div className="form-group full-width">
                    <label>Descripción:</label>
                    <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3"></textarea>
                </div>

                <div className="form-group checkbox-group">
                    <label>Acepta Pago Online:</label>
                    <input type="checkbox" name="acepta_pago_online" checked={formData.acepta_pago_online} onChange={handleChange} />
                </div>

                <div className="form-group checkbox-group">
                    <label>Acepta Pago Contra Entrega:</label>
                    <input type="checkbox" name="acepta_pago_contraentrega" checked={formData.acepta_pago_contraentrega} onChange={handleChange} />
                </div>

                <div className="form-actions full-width">
                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Creando...' : 'Crear Comercio y Menú'}
                    </button>

                    <button type="button" onClick={onCancel} className="btn-secondary">
                        Cancelar
                    </button>
                </div>

            </form>
        </div>
    );
};

export default ComercioForm;
