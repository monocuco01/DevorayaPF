import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useCarrito } from "../../componets/Cart/CarritoContext";
import { useNavigate } from "react-router-dom";
import { CreditCard, MapPin, User, Package } from "lucide-react";
import api from "../../api/api";
import "./Checkout.css";
import Swal from "sweetalert2";

/* =============================
   HELPERS
============================= */
const getUserId = () => {
  try {
    const raw = localStorage.getItem("usuarioActivo");
    return raw ? JSON.parse(raw)?.id : null;
  } catch {
    return null;
  }
};

const paymentMethodMap = {
  Nequi: "nequi",
  "Daviplata/Davivienda": "daviplata",
  "Bre-B": "breb",
  Bancolombia: "bancolombia",
};

// Cloudinary
const CLOUDINARY_CLOUD_NAME = "dziwyqnqk";
const CLOUDINARY_UPLOAD_PRESET = "kifrxmwu";

/* =============================
   COMPONENT
============================= */
export default function Checkout() {
  const { carrito, limpiarCarrito } = useCarrito();
  const navigate = useNavigate();

  const [nombreRecibe, setNombreRecibe] = useState("");
  const [direccion, setDireccion] = useState("");
  const [instrucciones, setInstrucciones] = useState("");

  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [referenciaPago, setReferenciaPago] = useState("");
  const [comprobanteUrl, setComprobanteUrl] = useState("");
  const [previewComprobante, setPreviewComprobante] = useState(null);

  const [comercioConfig, setComercioConfig] = useState(null);
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [cargando, setCargando] = useState(true);

  const TARIFA_SERVICIO = 1300;

  const usuario_id = getUserId();
  const comercio_id = carrito[0]?.comercio_id;

  const subtotal = carrito.reduce(
    (acc, item) => acc + item.precio * item.cantidad,
    0
  );

  const totalFinal = subtotal + costoEnvio + TARIFA_SERVICIO;

  /* =============================
     REFERENCIA AUTOMÁTICA
  ============================= */
  const generarReferencia = useCallback(() => {
    return `REF-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`;
  }, []);

  /* =============================
     CLOUDINARY
  ============================= */
  const openCloudinaryWidget = () => {
    if (!window.cloudinary) {
      Swal.fire("Error", "El módulo de subida no cargó.", "error");
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        sources: ["local", "camera"],
        multiple: false,
      },
      (error, result) => {
        if (!error && result?.event === "success") {
          setComprobanteUrl(result.info.secure_url);
          setPreviewComprobante(result.info.secure_url);
          setReferenciaPago(generarReferencia());
          Swal.fire("Comprobante subido", "Pago registrado 👍", "success");
        }
      }
    );

    widget.open();
  };

  /* =============================
     LOAD DATA
  ============================= */
  useEffect(() => {
    if (!window.cloudinary) {
      const script = document.createElement("script");
      script.src = "https://widget.cloudinary.com/v2.0/global/js/widget.js";
      script.async = true;
      document.body.appendChild(script);
    }

    const fetchData = async () => {
      if (!usuario_id || !comercio_id) {
        setCargando(false);
        return;
      }

      try {
        const u = await api.get(`/usuarios/${usuario_id}`);
        setDireccion(u.data.direccion || "");
        setNombreRecibe(u.data.nombre || "");

        const envio = await api.get(
          `/pedidos/costo-envio/${comercio_id}/${usuario_id}`
        );
        setCostoEnvio(envio.data.costo_envio || 0);

        const comercio = await api.get(`/comercios/panel/${comercio_id}`);
        setComercioConfig(comercio.data);
      } catch {
        Swal.fire("Error", "No se pudo cargar datos.", "error");
      }

      setCargando(false);
    };

    fetchData();
  }, [usuario_id, comercio_id]);

  /* =============================
     PAGO SELECCIONADO
  ============================= */
  const selectedPaymentDetails = useMemo(() => {
    if (!comercioConfig?.acepta_pago_online) return null;

    const key = paymentMethodMap[metodoPago];
    const details = comercioConfig.metodos_pago?.[key];

    if (!details?.qr) return null;

    return {
      titular: details.titular,
      numero: details.numero,
      qrUrl: details.qr,
    };
  }, [metodoPago, comercioConfig]);

  const qrMostrado = Boolean(selectedPaymentDetails);

  /* =============================
     CONFIRMAR PEDIDO
  ============================= */
  const handleConfirmar = async () => {
    if (!usuario_id) {
      Swal.fire("Atención", "Inicia sesión.", "warning");
      return navigate("/login");
    }

    if (!direccion || carrito.length === 0) {
      Swal.fire("Error", "Datos incompletos.", "warning");
      return;
    }

    if (qrMostrado && (!comprobanteUrl || !referenciaPago)) {
      Swal.fire("Pago incompleto", "Sube el comprobante.", "warning");
      return;
    }

    try {
      await api.post("/pedidos", {
        usuario_id,
        comercio_id,
        instrucciones,
        metodo_pago:
          metodoPago === "Efectivo"
            ? "efectivo"
            : paymentMethodMap[metodoPago],
        nombre_recibe: nombreRecibe,
        comprobante_url: comprobanteUrl || null,
        referencia_pago: referenciaPago || null,
        platos: carrito.map((item) => ({
          id: item.id,
          cantidad: item.cantidad,
          precio: item.precio,
          opciones: item.opciones || [],
        })),
      });

      Swal.fire("Pedido confirmado", "Todo salió bien 🚀", "success");
      limpiarCarrito();
      navigate("/");
    } catch {
      Swal.fire("Error", "No se pudo crear el pedido.", "error");
    }
  };

  if (cargando) return <p className="loading-state">Cargando...</p>;

  /* =============================
     RENDER
  ============================= */
  return (
    <div className="checkout-wrapper">
      <div className="checkout-container">
        {/* IZQUIERDA */}
        <div className="checkout-left">
          <div className="checkout-card">
            <h3><MapPin size={20}/> Dirección</h3>

            <div className="input-group">
              <User size={18}/>
              <input
                value={nombreRecibe}
                onChange={(e) => setNombreRecibe(e.target.value)}
                placeholder="Nombre de quien recibe"
              />
            </div>

            <div className="input-group">
              <MapPin size={18}/>
              <input value={direccion} readOnly />
            </div>

            <textarea
              placeholder="Instrucciones"
              value={instrucciones}
              onChange={(e) => setInstrucciones(e.target.value)}
            />
          </div>

          <div className="checkout-card">
            <h3><CreditCard size={20}/> Método de pago</h3>

            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
              <option value="Efectivo">Efectivo / Contra Entrega</option>
              {comercioConfig?.acepta_pago_online && (
                <>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata/Davivienda">Daviplata / Davivienda</option>
                  <option value="Bre-B">Bre-B</option>
                  <option value="Bancolombia">Bancolombia</option>
                </>
              )}
            </select>

            {qrMostrado && (
              <div className="qr-box">
                <p><b>Titular:</b> {selectedPaymentDetails.titular}</p>
                <p><b>Número:</b> {selectedPaymentDetails.numero}</p>

                <img src={selectedPaymentDetails.qrUrl} className="qr-img" />

                <button
                  onClick={openCloudinaryWidget}
                  className="boton-confirmar"
                  style={{ marginTop: 10 }}
                >
                  {comprobanteUrl ? "Cambiar comprobante" : "Subir comprobante"}
                </button>

                {previewComprobante && (
                  <img src={previewComprobante} className="preview-comp" />
                )}
              </div>
            )}
          </div>

          <div className="checkout-card">
            <h3><Package size={20}/> Detalle</h3>

            {carrito.map((item) => (
              <div key={item.id} className="detalle-item">
                <span>{item.cantidad}x</span>
                <p>{item.nombre}</p>
                <b>${(item.precio * item.cantidad).toLocaleString()}</b>
              </div>
            ))}
          </div>
        </div>

        {/* DERECHA */}
        <div className="checkout-right">
          <div className="checkout-final-card">
            <h3>Resumen</h3>

            <p>Subtotal: ${subtotal.toLocaleString()}</p>
            <p>Envío: ${costoEnvio.toLocaleString()}</p>
            <p>Servicio: ${TARIFA_SERVICIO.toLocaleString()}</p>

            <h2>Total: ${totalFinal.toLocaleString()}</h2>

            <button
              onClick={handleConfirmar}
              className="boton-confirmar"
              disabled={qrMostrado && !comprobanteUrl}
            >
              Confirmar Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
