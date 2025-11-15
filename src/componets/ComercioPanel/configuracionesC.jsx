import { useEffect, useState, useRef } from "react";
import api from "../../api/api";
import Swal from "sweetalert2";
import "./ConfiguracionesC.css";

const getComercioId = () => {
  try {
    const raw =
      localStorage.getItem("comercioActivo") ||
      localStorage.getItem("usuarioActivo") ||
      null;

    if (!raw) return null;

    const obj = JSON.parse(raw);

    return obj?.id ?? obj?.comercio_id ?? obj?.comercio?.id ?? null;
  } catch {
    return null;
  }
};

const ConfiguracionesC = () => {
  const comercioId = getComercioId() ?? 5;

  const cloudinaryWidget = useRef(null);

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    telefono: "",
    direccion: "",
    horario_apertura: "",
    horario_cierre: "",
    estado: true,
    acepta_pago_contraentrega: true, // <-- Correcto
    acepta_pago_online: false, // <-- Correcto
    tiempo_promedio_entrega: "", // <-- Correcto
    logo: "", // <-- Campo para la imagen
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/comercios/panel/${comercioId}`);
        setForm(res.data);
      } catch (error) {
        Swal.fire("Error", "No se pudo cargar la configuración.", "error");
      }
      setCargando(false);
    };

    fetchData();
  }, [comercioId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const openWidget = () => {
    const conf = {
      cloudName: "dziwyqnqk",
      uploadPreset: "kifrxmwu",
    };

    cloudinaryWidget.current = window.cloudinary.createUploadWidget(
      conf,
      (error, result) => {
        if (!error && result && result.event === "success") {
          const imageUrl = result.info.secure_url;
          // 🔴 CORRECCIÓN 3: Cambiado de 'imagen' a 'logo'
          setForm((prev) => ({ ...prev, logo: imageUrl })); 
        }
      }
    );

    cloudinaryWidget.current.open();
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      console.log("➡️ Datos del comercio que se están enviando al servidor (PUT):", form);
      await api.put(`/comercios/actualizar/${comercioId}`, form);

      Swal.fire({
        icon: "success",
        title: "¡Cambios guardados!",
        text: "Las configuraciones se actualizaron correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire("Error", "No se pudieron guardar los cambios.", "error");
    }
    setGuardando(false);
  };

  if (cargando) return <p>Cargando configuración...</p>;

  return (
    <div className="config-container">
      <h2>⚙️ Configuración del Comercio</h2>

      <div className="config-flex">

        {/* ==== COLUMNA IZQUIERDA (Datos básicos + Imagen) ==== */}
        <div className="config-left">
          <h3>📄 Datos del Comercio</h3>
            {/* ... (Inputs de nombre, descripción, teléfono, dirección se mantienen) */}
          <label>Nombre del comercio</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
          />

          <label>Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
          />

          <label>Teléfono</label>
          <input
            type="text"
            name="telefono"
            value={form.telefono}
            onChange={handleChange}
          />

          <label>Dirección</label>
          <input
            type="text"
            name="direccion"
            value={form.direccion}
            onChange={handleChange}
          />

         
          <h3>📸 Imagen del Comercio</h3>
         

          <div className="imagen-input-group">
            <input
              type="text"
              name="logo"
              value={form.logo}
              onChange={handleChange}
              placeholder="URL de la imagen"
            />
            <button type="button" className="subir-imagen-btn" onClick={openWidget}>
              Subir Imagen
            </button>
          </div>
        </div>

        {/* ==== COLUMNA DERECHA (Horarios + Pagos + Estado) ==== */}
        <div className="config-right">

          <h3>🕐 Horarios</h3>
            {/* ... (Inputs de horarios se mantienen) */}
          <label>Apertura</label>
          <input
            type="time"
            name="horario_apertura"
            value={form.horario_apertura || ""}
            onChange={handleChange}
          />

          <label>Cierre</label>
          <input
            type="time"
            name="horario_cierre"
            value={form.horario_cierre || ""}
            onChange={handleChange}
          />

          <h3>💲 Métodos de pago</h3>

          <label className="switch-row">
            <span>Pago en efectivo / Contra Entrega</span>
            <label className="switch">
              <input
                type="checkbox"
                // 🔴 CORRECCIÓN 1: Cambiado a nombre del estado
                name="acepta_pago_contraentrega"
                checked={form.acepta_pago_contraentrega}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </label>
          </label>

          <label className="switch-row">
            <span>Pagos online</span>
            <label className="switch">
              <input
                type="checkbox"
                // 🔴 CORRECCIÓN 1: Cambiado a nombre del estado
                name="acepta_pago_online"
                checked={form.acepta_pago_online}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </label>
          </label>

          <h3>⏳ Tiempo de entrega (min)</h3>
          <input
            type="number"
            // 🔴 CORRECCIÓN 2: Cambiado a nombre del estado
            name="tiempo_promedio_entrega"
            value={form.tiempo_promedio_entrega || ""}
            onChange={handleChange}
          />

          <h3>🟢 Estado</h3>
          <label className="switch-row">
            <span>Comercio abierto</span>
            <label className="switch">
              <input
                type="checkbox"
                name="estado"
                checked={form.estado}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </label>
          </label>

        </div>
      </div>

      <button className="btn-guardar" onClick={handleGuardar} disabled={guardando}>
        {guardando ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
};

export default ConfiguracionesC;