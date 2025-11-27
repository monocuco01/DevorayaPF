import { useEffect, useState, useRef } from "react";
import api from "../../api/api";
import Swal from "sweetalert2";
import "./configuracionesC.css"; // Asegúrate de que este CSS contenga estilos para .imagen-input-group

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
  // Usamos diferentes referencias para evitar conflictos entre el logo y los QRs,
  // aunque la lógica de la función openWidget() lo manejará.
  const cloudinaryWidget = useRef(null); 

  const [form, setForm] = useState({
    nombre: "",
    descripcion: "",
    telefono: "",
    direccion: "",
    horario_apertura: "",
    horario_cierre: "",
    estado: true,
    acepta_pago_contraentrega: true,
    acepta_pago_online: false,
    tiempo_promedio_entrega: "",
    logo: "",
    metodos_pago: {
      nequi: { numero: "", titular: "", qr: "" },
      daviplata: { numero: "", titular: "", qr: "" },
      bancolombia: { numero: "", titular: "", qr: "" },
      breb: { numero: "", titular: "", qr: "" },
      instrucciones: "",
    },
  });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  // =============================
  // Cargar datos del comercio
  // =============================
  const emptyMetodos = {
    nequi: { numero: "", titular: "", qr: "" },
    daviplata: { numero: "", titular: "", qr: "" },
    bancolombia: { numero: "", titular: "", qr: "" },
    breb: { numero: "", titular: "", qr: "" },
    instrucciones: "",
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/comercios/panel/${comercioId}`);
        const comercio = res.data;

        setForm({
          ...comercio,
          metodos_pago: {
            ...emptyMetodos,
            ...(comercio.metodos_pago || {})
          }
        });
      } catch (err) {
        Swal.fire("Error", "No se pudo cargar la configuración.", "error");
      }
      setCargando(false);
    };

    fetchData();
  }, [comercioId]);

  // =============================
  // Manejadores
  // =============================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePagoChange = (metodo, campo, valor) => {
    // Si el campo es 'instrucciones', el método es la clave principal
    if (metodo === 'instrucciones') {
        setForm(prev => ({
            ...prev,
            metodos_pago: {
                ...prev.metodos_pago,
                instrucciones: valor
            }
        }));
        return;
    }
    
    setForm(prev => ({
      ...prev,
      metodos_pago: {
        ...prev.metodos_pago,
        [metodo]: {
          ...prev.metodos_pago[metodo],
          [campo]: valor,
        },
      },
    }));
  };

  // =============================
  // Cloudinary (Función centralizada para Logo y QR)
  // =============================
  /**
   * Abre el widget de Cloudinary para subir imágenes.
   * @param {string} targetField - El campo del estado principal a actualizar ('logo') o la clave del método de pago ('nequi', 'daviplata', etc.) si es un QR.
   */
  const openWidget = (targetField) => {
    const conf = {
      cloudName: "dziwyqnqk", // Reemplaza con tu Cloud Name
      uploadPreset: "kifrxmwu", // Reemplaza con tu Upload Preset
    };

    // Inicializa el widget con el callback que actualiza el estado
    cloudinaryWidget.current = window.cloudinary.createUploadWidget(
      conf,
      (error, result) => {
        if (!error && result && result.event === "success") {
          const imageUrl = result.info.secure_url;

          setForm((prev) => {
            // Si es el logo, actualiza directamente el campo 'logo'
            if (targetField === 'logo') {
              return { ...prev, logo: imageUrl };
            }
            
            // Si es un QR, actualiza el campo 'qr' dentro del método de pago
            if (prev.metodos_pago[targetField]) {
              return {
                ...prev,
                metodos_pago: {
                  ...prev.metodos_pago,
                  [targetField]: {
                    ...prev.metodos_pago[targetField],
                    qr: imageUrl, // Actualizamos el campo 'qr'
                  },
                },
              };
            }
            return prev;
          });
        }
      }
    );

    cloudinaryWidget.current.open();
  };

  // =============================
  // Guardar
  // =============================
  const handleGuardar = async () => {
    setGuardando(true);

    try {
      // Ajustamos la llamada a la API para enviar todo el objeto 'form'
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
        {/* IZQUIERDA */}
        <div className="config-left">
          <h3>📄 Datos del Comercio</h3>

          <label>Nombre del comercio</label>
          <input
            type="text"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
          />
            {/* ... otros campos generales ... */}
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
              placeholder="URL de la imagen"
              onChange={handleChange}
            />

            <button
              type="button"
              className="subir-imagen-btn"
              onClick={() => openWidget('logo')} // Llamamos con el campo 'logo'
            >
              Subir Logo
            </button>
          </div>
            {/* Si existe un logo, lo mostramos como preview */}
            {form.logo && <img src={form.logo} alt="Logo Preview" className="logo-preview" style={{ maxWidth: '100px', maxHeight: '100px', marginTop: '10px' }} />}
            
        </div>

        {/* DERECHA */}
        <div className="config-right">
          <h3>🕐 Horarios</h3>
            {/* ... campos de horario ... */}
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

          <h3>💲 Métodos de Pago</h3>

          <label className="switch-row">
            <span>Pago en efectivo / Contra Entrega</span>
            <label className="switch">
              <input
                type="checkbox"
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
                name="acepta_pago_online"
                checked={form.acepta_pago_online}
                onChange={handleChange}
              />
              <span className="slider"></span>
            </label>
          </label>

          {/* CAMPOS DE PAGO */}
          {form.acepta_pago_online && (
            <>
              {/* NEQUI */}
              <h4>📱 Nequi</h4>
              <input
                type="text"
                placeholder="Número"
                value={form.metodos_pago.nequi.numero}
                onChange={(e) =>
                  handlePagoChange("nequi", "numero", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Titular"
                value={form.metodos_pago.nequi.titular}
                onChange={(e) =>
                  handlePagoChange("nequi", "titular", e.target.value)
                }
              />
              
              {/* INPUT QR y BOTÓN SUBIR */}
              <div className="imagen-input-group">
                  <input
                      type="text"
                      placeholder="URL QR"
                      value={form.metodos_pago.nequi.qr}
                      onChange={(e) => handlePagoChange("nequi", "qr", e.target.value)}
                  />
                  <button 
                      type="button" 
                      className="subir-imagen-btn" 
                      onClick={() => openWidget('nequi')}> {/* Clave del método de pago */}
                      Subir QR
                  </button>
              </div>
              {form.metodos_pago.nequi.qr && <img src={form.metodos_pago.nequi.qr} alt="Nequi QR" style={{ maxWidth: '100px', maxHeight: '100px', marginBottom: '10px' }} />}


              {/* DAVIPLATA */}
              <h4>📱 Daviplata</h4>
              <input
                type="text"
                placeholder="Número"
                value={form.metodos_pago.daviplata.numero}
                onChange={(e) =>
                  handlePagoChange("daviplata", "numero", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Titular"
                value={form.metodos_pago.daviplata.titular}
                onChange={(e) =>
                  handlePagoChange("daviplata", "titular", e.target.value)
                }
              />
              
              {/* INPUT QR y BOTÓN SUBIR */}
              <div className="imagen-input-group">
                  <input
                      type="text"
                      placeholder="URL QR"
                      value={form.metodos_pago.daviplata.qr}
                      onChange={(e) => handlePagoChange("daviplata", "qr", e.target.value)}
                  />
                  <button 
                      type="button" 
                      className="subir-imagen-btn" 
                      onClick={() => openWidget('daviplata')}> {/* Clave del método de pago */}
                      Subir QR
                  </button>
              </div>
              {form.metodos_pago.daviplata.qr && <img src={form.metodos_pago.daviplata.qr} alt="Daviplata QR" style={{ maxWidth: '100px', maxHeight: '100px', marginBottom: '10px' }} />}


              {/* BRE-B */}
              <h4>💳 Bre-B</h4>
              <input
                type="text"
                placeholder="Número"
                value={form.metodos_pago.breb.numero}
                onChange={(e) =>
                  handlePagoChange("breb", "numero", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Titular"
                value={form.metodos_pago.breb.titular}
                onChange={(e) =>
                  handlePagoChange("breb", "titular", e.target.value)
                }
              />
              
              {/* INPUT QR y BOTÓN SUBIR */}
              <div className="imagen-input-group">
                  <input
                      type="text"
                      placeholder="URL QR"
                      value={form.metodos_pago.breb.qr}
                      onChange={(e) => handlePagoChange("breb", "qr", e.target.value)}
                  />
                  <button 
                      type="button" 
                      className="subir-imagen-btn" 
                      onClick={() => openWidget('breb')}> {/* Clave del método de pago */}
                      Subir QR
                  </button>
              </div>
              {form.metodos_pago.breb.qr && <img src={form.metodos_pago.breb.qr} alt="Bre-B QR" style={{ maxWidth: '100px', maxHeight: '100px', marginBottom: '10px' }} />}


              {/* BANCOLOMBIA */}
              <h4>🏦 Bancolombia</h4>
              <input
                type="text"
                placeholder="Número"
                value={form.metodos_pago.bancolombia.numero}
                onChange={(e) =>
                  handlePagoChange("bancolombia", "numero", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Titular"
                value={form.metodos_pago.bancolombia.titular}
                onChange={(e) =>
                  handlePagoChange("bancolombia", "titular", e.target.value)
                }
              />
              
              {/* INPUT QR y BOTÓN SUBIR */}
              <div className="imagen-input-group">
                  <input
                      type="text"
                      placeholder="URL QR"
                      value={form.metodos_pago.bancolombia.qr}
                      onChange={(e) => handlePagoChange("bancolombia", "qr", e.target.value)}
                  />
                  <button 
                      type="button" 
                      className="subir-imagen-btn" 
                      onClick={() => openWidget('bancolombia')}> {/* Clave del método de pago */}
                      Subir QR
                  </button>
              </div>
              {form.metodos_pago.bancolombia.qr && <img src={form.metodos_pago.bancolombia.qr} alt="Bancolombia QR" style={{ maxWidth: '100px', maxHeight: '100px', marginBottom: '10px' }} />}


              <h4>📝 Instrucciones</h4>
              <textarea
                placeholder="Ej: Enviar comprobante por WhatsApp..."
                value={form.metodos_pago.instrucciones}
                onChange={(e) => handlePagoChange("instrucciones", null, e.target.value)}
              />
            </>
          )}

          <h3>🟢 Estado</h3>
            {/* ... campo de estado ... */}
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

      <button
        className="btn-guardar"
        onClick={handleGuardar}
        disabled={guardando}
      >
        {guardando ? "Guardando..." : "Guardar"}
      </button>
    </div>
  );
};

export default ConfiguracionesC;