import { useEffect, useState } from "react";
import api from "../../api/api"; // Tu instancia de Axios configurada
import Swal from "sweetalert2";
import axios from "axios"; // Usado para la API externa de Colombia
import "./UserProfile.css";


// Obtiene el ID del usuario logueado desde localStorage
const getUserId = () => {
  try {
    const raw = localStorage.getItem("usuarioActivo") || null;
    if (!raw) return null;

    const obj = JSON.parse(raw);
    return obj?.id ?? null;
  } catch {
    return null;
  }
};

const UserProfile = () => {
  const userId = getUserId();

  // =============================
  // ESTADO DE DATOS DEL PERFIL
  // =============================
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    direccion: "", // Aquí se guardará la dirección como string (ej: "Calle 12 # 34-56, Bogotá D.C.")
    nuevaContrasena: "",
    confirmarContrasena: "",
  });

  // =============================
  // DIRECCIÓN POR COMPONENTES (Para los SELECTS y INPUTS)
  // =============================
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);

  const [direccion, setDireccion] = useState({
    tipo: "Calle",
    numero1: "",
    numero2: "",
    numero3: "",
    departamentoId: "",
    ciudadId: "",
  });

  // =============================
  // CARGA Y ESTADOS DE PROCESO
  // =============================
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    fetchData();
    cargarDepartamentos();
  }, []);

  const fetchData = async () => {
    if (!userId) {
      setCargando(false);
      Swal.fire("Error", "No se encontró el ID del usuario.", "error");
      return;
    }

    try {
      const resUser = await api.get(`/usuarios/${userId}`);
      const userData = resUser.data;

      setForm((prev) => ({
        ...prev,
        nombre: userData.nombre || "",
        correo: userData.correo || "",
        telefono: userData.telefono || "",
        direccion: userData.direccion || "",
      }));

      // NOTA: Para precargar la dirección, necesitarías que tu backend
      // te devuelva los IDs de departamento y ciudad separados, no solo el string 'direccion'.
      // Aquí solo cargamos los datos básicos.
      
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo cargar el perfil.", "error");
    }
    setCargando(false);
  };

  // =============================
  // Cargar departamentos
  // =============================
  const cargarDepartamentos = async () => {
    try {
      const { data } = await axios.get("https://api-colombia.com/api/v1/Department");
      setDepartamentos(data);
    } catch (error) {
      console.error("Error departamentos:", error);
    }
  };

  // =============================
  // Cambiar departamento → cargar ciudades
  // =============================
  const handleDepartamentoChange = async (e) => {
    const id = e.target.value;
    setDireccion({ ...direccion, departamentoId: id, ciudadId: "" });

    if (!id) {
        setCiudades([]);
        return;
    }

    try {
        // 💡 CORRECCIÓN 1: Se usa el endpoint correcto para obtener ciudades
        const { data } = await axios.get(`https://api-colombia.com/api/v1/Department/${id}/cities`);
        
        // Este endpoint devuelve directamente el array de ciudades
        setCiudades(data || []); 
        console.log("🟢 CIUDADES RECIBIDAS:", data);

    } catch (error) {
      console.error("Error ciudades:", error);
      setCiudades([]);
    }
  };

  const handleDireccionInput = (e) => {
    const { name, value } = e.target;
    setDireccion({ ...direccion, [name]: value });
  };

  // =============================
  // GUARDAR CAMBIOS (CORREGIDO)
  // =============================
  const handleGuardar = async () => {
    const { nuevaContrasena, confirmarContrasena, ...restForm } = form;

    // 1. Buscar los nombres de la Ciudad y el Departamento seleccionados (Necesario para construir el string de dirección)
    const departamentoSeleccionado = departamentos.find(d => d.id == direccion.departamentoId);
    const ciudadSeleccionada = ciudades.find(c => c.id == direccion.ciudadId);

    // 2. Construir la dirección final completa
    let direccionCompleta = restForm.direccion; // Usa la dirección del form como fallback

    if (direccion.tipo && direccion.numero1 && direccion.numero2 && direccion.numero3) {
        direccionCompleta = `${direccion.tipo} ${direccion.numero1} # ${direccion.numero2} - ${direccion.numero3}`;
        
        if (ciudadSeleccionada && departamentoSeleccionado) {
             direccionCompleta += `, ${ciudadSeleccionada.name}, ${departamentoSeleccionado.name}`;
        }
    }


    // Validación de contraseña
    if (nuevaContrasena) {
      if (nuevaContrasena.length < 6) {
        Swal.fire("Error", "La nueva contraseña debe tener al menos 6 caracteres.", "warning");
        return;
      }
      if (nuevaContrasena !== confirmarContrasena) {
        Swal.fire("Error", "Las contraseñas no coinciden.", "warning");
        return;
      }
    }

    setGuardando(true);

    try {
        // 3. 💡 CORRECCIÓN 2: Se incluye la dirección construida en los datos a enviar
        const dataToSend = { 
            ...restForm, 
            direccion: direccionCompleta, // Se envía la dirección construida
        };

        if (nuevaContrasena) dataToSend.contraseña = nuevaContrasena;

        await api.put(`/usuarios/${userId}`, dataToSend);

        Swal.fire({
          icon: "success",
          title: "Guardado",
          text: "Datos actualizados correctamente.",
          timer: 2000,
          showConfirmButton: false,
        });

        // 4. Actualizar el estado form.direccion para que se refleje el cambio
        setForm((prev) => ({
          ...prev,
          direccion: direccionCompleta,
          nuevaContrasena: "",
          confirmarContrasena: "",
        }));
        
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudieron guardar los cambios.", "error");
    }

    setGuardando(false);
  };

  if (cargando) return <p className="loading-text">Cargando perfil...</p>;

  return (
    <div className="profile-container">
      <h2>Mi Perfil</h2>

      <div className="profile-sections">
        <div className="section-card personal-data">
          <h3>Datos Personales</h3>

          <div className="personal-data-fields">
            <div>
              <label>Nombre</label>
              <input type="text" name="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
            </div>

            <div>
              <label>Correo</label>
              <input type="email" name="correo" value={form.correo} disabled />
            </div>

            <div>
              <label>Teléfono</label>
              <input type="text" name="telefono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
            </div>

            {/* =============================
                DIRECCIÓN — NUEVO
            ============================= */}
            <div className="direccion-box">
              <label>Dirección</label>

              <div className="direccion-grid">
                <select name="tipo" value={direccion.tipo} onChange={handleDireccionInput}>
                  <option>Calle</option>
                  <option>Carrera</option>
                  <option>Avenida</option>
                  <option>Transversal</option>
                </select>

                <input name="numero1" placeholder="12" value={direccion.numero1} onChange={handleDireccionInput} />

                <span>#</span>

                <input name="numero2" placeholder="34" value={direccion.numero2} onChange={handleDireccionInput} />

                <span>-</span>

                <input name="numero3" placeholder="56" value={direccion.numero3} onChange={handleDireccionInput} />

                <select name="departamentoId" value={direccion.departamentoId} onChange={handleDepartamentoChange}>
                  <option value="">Departamento</option>
                  {departamentos.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>

                <select name="ciudadId" value={direccion.ciudadId} onChange={handleDireccionInput} disabled={!direccion.departamentoId}>
                  <option value="">Ciudad</option>
                  {ciudades.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* CAMBIO CONTRASEÑA */}
          <h4>Cambiar Contraseña</h4>

          <label>Nueva contraseña</label>
          <input type="password" name="nuevaContrasena" value={form.nuevaContrasena} onChange={(e) => setForm({ ...form, nuevaContrasena: e.target.value })} />

          <label>Confirmar contraseña</label>
          <input type="password" name="confirmarContrasena" value={form.confirmarContrasena} onChange={(e) => setForm({ ...form, confirmarContrasena: e.target.value })} />

          <button className="btn-guardar-perfil" onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;