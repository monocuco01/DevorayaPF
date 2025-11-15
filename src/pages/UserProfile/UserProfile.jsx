import { useEffect, useState } from "react";
import api from "../../api/api";
import Swal from "sweetalert2";
import "./UserProfile.css";

// Obtiene el ID del usuario logueado desde localStorage
const getUserId = () => {
    try {
        const raw = localStorage.getItem("usuarioActivo") || null;
        if (!raw) return null;

        const obj = JSON.parse(raw);
        // Asume que 'usuarioActivo' contiene { id: 1, ... }
        return obj?.id ?? null; 
    } catch {
        return null;
    }
};

const UserProfile = () => {
    const userId = getUserId(); 

    const [form, setForm] = useState({
        nombre: "",
        correo: "",
        telefono: "",
        direccion: "",
        nuevaContrasena: "", 
        confirmarContrasena: "",
    });

    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    
    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                setCargando(false);
                Swal.fire("Error", "No se encontró el ID del usuario.", "error");
                return;
            }

            try {
                // Carga de datos personales
                const resUser = await api.get(`/usuarios/${userId}`); 
                const userData = resUser.data;
                
                setForm(prevForm => ({
                    ...prevForm,
                    nombre: userData.nombre || "",
                    correo: userData.correo || "",
                    telefono: userData.telefono || "",
                    direccion: userData.direccion || "",
                }));
                
            } catch (error) {
                console.error("Error al cargar el perfil:", error);
                Swal.fire("Error", "No se pudo cargar el perfil del usuario. (¿Sesión expirada?)", "error");
            }
            setCargando(false);
        };

        fetchData();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({
            ...form,
            [name]: value,
        });
    };

    const handleGuardar = async () => {
        const { nuevaContrasena, confirmarContrasena, ...restForm } = form;

        // 1. Validación de Contraseña
        if (nuevaContrasena) {
            if (nuevaContrasena.length < 6) {
                Swal.fire("Error", "La nueva contraseña debe tener al menos 6 caracteres.", "warning");
                return;
            }
            if (nuevaContrasena !== confirmarContrasena) {
                Swal.fire("Error", "La nueva contraseña y la confirmación no coinciden.", "warning");
                return;
            }
        }
        
        setGuardando(true);

        try {
            // 2. Preparar los datos a enviar
            const dataToSend = { ...restForm };
            if (nuevaContrasena) {
                dataToSend.contraseña = nuevaContrasena; // El backend espera este campo
            }
            
            // 3. Enviar la solicitud de actualización
            await api.put(`/usuarios/${userId}`, dataToSend); 

            Swal.fire({
                icon: "success",
                title: "¡Cambios guardados!",
                text: "Tus datos personales se actualizaron correctamente.",
                timer: 2000,
                showConfirmButton: false,
            });

            // 4. Limpiar los campos de contraseña
            setForm(prevForm => ({
                ...prevForm,
                nuevaContrasena: "",
                confirmarContrasena: "",
            }));

        } catch (error) {
            console.error("Error al guardar:", error);
            Swal.fire("Error", error.response?.data?.mensaje || "No se pudieron guardar los cambios.", "error");
        }
        setGuardando(false);
    };

    if (cargando) return <p className="loading-text">Cargando perfil...</p>;
    if (!userId) return <p className="error-text">Inicia sesión para ver tu perfil.</p>;

    return (
        <div className="profile-container">
            <h2>Mi Perfil</h2>

            <div className="profile-sections">
                
                {/* ==== SECCIÓN 1: DATOS PERSONALES ==== */}
                <div className="section-card personal-data">
                    <h3>Datos Personales</h3>
                    
                    {/* Contenedor para el GRID de dos columnas */}
                    <div className="personal-data-fields">
                        <div>
                            <label>Nombre</label>
                            <input
                                type="text"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label>Correo Electrónico</label>
                            <input
                                type="email"
                                name="correo"
                                value={form.correo}
                                onChange={handleChange}
                                disabled 
                            />
                        </div>

                        <div>
                            <label>Teléfono</label>
                            <input
                                type="text"
                                name="telefono"
                                value={form.telefono}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label>Dirección Principal</label>
                            <input
                                type="text"
                                name="direccion"
                                value={form.direccion}
                                onChange={handleChange}
                            />
                        </div>
                    </div> 
                    
                    {/* ==== SECCIÓN DE CAMBIO DE CONTRASEÑA ==== */}
                    <h4 style={{marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '20px'}}>Cambiar Contraseña</h4>

                    <label>Nueva Contraseña</label>
                    <input
                        type="password"
                        name="nuevaContrasena"
                        value={form.nuevaContrasena}
                        onChange={handleChange}
                        placeholder="Dejar vacío para no cambiar"
                    />

                    <label>Confirmar Contraseña</label>
                    <input
                        type="password"
                        name="confirmarContrasena"
                        value={form.confirmarContrasena}
                        onChange={handleChange}
                        placeholder="Confirma la nueva contraseña"
                    />

                    <button 
                        className="btn-guardar-perfil" 
                        onClick={handleGuardar} 
                        disabled={guardando}
                    >
                        {guardando ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </div>
     
            </div>
        </div>
    );
};

export default UserProfile;