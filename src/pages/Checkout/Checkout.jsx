import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useCarrito } from "../../componets/Cart/CarritoContext";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, CreditCard, MapPin, User, Package } from "lucide-react";
import api from "../../api/api";
import "./Checkout.css";
import Swal from "sweetalert2";

const getUserId = () => {
  try {
    const raw = localStorage.getItem("usuarioActivo") || null;
    if (!raw) return null;
    return JSON.parse(raw)?.id ?? null;
  } catch {
    return null;
  }
};

// Mapeo de métodos a claves del backend
const paymentMethodMap = {
  Nequi: "nequi",
  "Daviplata/Davivienda": "daviplata",
  "Bre-B": "breb",
  Bancolombia: "bancolombia",
};

// Cloudinary
const CLOUDINARY_CLOUD_NAME = "dziwyqnqk";
const CLOUDINARY_UPLOAD_PRESET = "kifrxmwu";

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

  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const totalFinal = subtotal + costoEnvio + TARIFA_SERVICIO;

  const generarReferencia = useCallback(() => {
    return `REF-${Date.now()}-${Math.floor(Math.random() * 900) + 100}`;
  }, []);

  const openCloudinaryWidget = () => {
    if (!window.cloudinary) {
      Swal.fire("Error", "El módulo de subida aún no ha cargado.", "error");
      return;
    }

    setComprobanteUrl("");
    setPreviewComprobante(null);

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUDINARY_CLOUD_NAME,
        uploadPreset: CLOUDINARY_UPLOAD_PRESET,
        sources: ["local", "url", "camera"],
        multiple: false,
      },
      (error, result) => {
        if (!error && result && result.event === "success") {
          setComprobanteUrl(result.info.secure_url);
          setPreviewComprobante(result.info.secure_url);
          setReferenciaPago(generarReferencia());
          Swal.fire("Comprobante Subido", "Todo listo 👍", "success");
        }
      }
    );

    widget.open();
  };

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

        const envio = await api.get(`/pedidos/costo-envio/${comercio_id}/${usuario_id}`);
        setCostoEnvio(envio.data.costo_envio || 0);

        const comercio = await api.get(`/comercios/panel/${comercio_id}`);
        setComercioConfig(comercio.data);
      } catch (err) {
        Swal.fire("Error", "No se pudo cargar datos.", "error");
      }

      setCargando(false);
    };

    fetchData();
  }, [usuario_id, comercio_id]);

  const selectedPaymentDetails = useMemo(() => {
    if (!comercioConfig?.acepta_pago_online) return null;

    const key = paymentMethodMap[metodoPago];
    const details = comercioConfig.metodos_pago?.[key];

    if (!details || !details.qr) return null;

    return {
      name: metodoPago,
      number: details.numero,
      titular: details.titular,
      qrUrl: details.qr,
      instrucciones: comercioConfig.metodos_pago.instrucciones || "",
    };
  }, [metodoPago, comercioConfig]);

  const qrMostrado = Boolean(selectedPaymentDetails);

  const handleConfirmar = async () => {
    if (!usuario_id) {
      Swal.fire("Atención", "Inicia sesión para continuar.", "warning");
      return navigate("/login");
    }

    if (!direccion) {
      Swal.fire("Dirección requerida", "Actualiza tu dirección.", "warning");
      return;
    }

    if (carrito.length === 0) {
      Swal.fire("Carrito vacío", "", "info");
      return;
    }

    if (qrMostrado && (!comprobanteUrl || !referenciaPago)) {
      Swal.fire("Pago incompleto", "Sube el comprobante para continuar.", "warning");
      return;
    }

    try {
      await api.post("/pedidos", {
        usuario_id,
        comercio_id,
        instrucciones,
        metodo_pago: metodoPago,
        nombre_recibe: nombreRecibe,
        comprobante_url: comprobanteUrl || null,
        referencia_pago: referenciaPago || null,
        platos: carrito.map((item) => ({
          id: item.id,
          cantidad: item.cantidad,
          precio: item.precio,
        })),
      });

      Swal.fire("Pedido Confirmado", "Tu pedido está en camino 🚀", "success");
      limpiarCarrito();
      navigate("/");
    } catch (err) {
      Swal.fire("Error", "No se pudo crear el pedido.", "error");
    }
  };

  if (cargando) return <p className="loading-state">Cargando...</p>;

  return (
    <div className="checkout-wrapper">
      <div className="checkout-container">
        {/* IZQUIERDA */}
        <div className="checkout-left">
          <div className="checkout-card">
            <h3><MapPin size={20}/> Dirección de entrega</h3>

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
              placeholder="Instrucciones de entrega (opcional)"
              value={instrucciones}
              onChange={(e) => setInstrucciones(e.target.value)}
            />
          </div>

          {/* METODO PAGO */}
          <div className="checkout-card">
            <h3><CreditCard size={20}/> Método de pago</h3>

            <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
              <option value="Efectivo">Efectivo / Contra Entrega</option>

              {comercioConfig?.acepta_pago_online && (
                <>
                  <option value="Nequi">Nequi</option>
                  <option value="Daviplata/Davivienda">Daviplata/Davivienda</option>
                  <option value="Bre-B">Bre-B</option>
                  <option value="Bancolombia">Bancolombia</option>
                </>
              )}
            </select>

            {qrMostrado && (
              <div className="qr-box">
                <h4>Cuenta {selectedPaymentDetails.name}</h4>
                <p><strong>Titular:</strong> {selectedPaymentDetails.titular}</p>
                <p><strong>Número:</strong> {selectedPaymentDetails.number}</p>

                <p className="qr-text">Escanea el QR:</p>
                <img src={selectedPaymentDetails.qrUrl} className="qr-img" />

                <button
                  type="button"
                  onClick={openCloudinaryWidget}
                  className="cloudinary-upload-button boton-confirmar"
                  style={{
                    backgroundColor: comprobanteUrl ? "#34A853" : "#FF620C",
                    marginTop: "10px",
                  }}
                >
                  {comprobanteUrl ? "Cambiar Comprobante" : "Subir Comprobante"}
                </button>

                {previewComprobante && (
                  <img src={previewComprobante} className="preview-comp" />
                )}

                {referenciaPago && (
                  <div className="input-group" style={{ background: "#eee" }}>
                    <span>Ref. Automática:</span>
                    <input value={referenciaPago} readOnly />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* DETALLE */}
          <div className="checkout-card">
            <h3><Package size={20}/> Detalle del pedido</h3>

            <div className="resumen-detalle-lista">
              {carrito.map((item) => (
                <div key={item.id} className="detalle-item">
                  <span className="detalle-cantidad">{item.cantidad}x</span>
                  <p className="detalle-nombre">{item.nombre}</p>
                  <p className="detalle-precio">
                    ${(item.precio * item.cantidad).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DERECHA */}
        <div className="checkout-right">
          <div className="checkout-final-card">
            <h3>Resumen</h3>

            <div className="total-lines">
              <span>Subtotal:</span> <span>${subtotal.toLocaleString()}</span>
            </div>
            <div className="total-lines shipping-line">
              <span>Envío:</span> <span>${costoEnvio.toLocaleString()}</span>
            </div>
            <div className="total-lines">
              <span>Tarifa de Servicio:</span> <span>${TARIFA_SERVICIO.toLocaleString()}</span>
            </div>

            <h2 className="total-final">
              <span>Total:</span> <span>${totalFinal.toLocaleString()}</span>
            </h2>

            <button
              onClick={handleConfirmar}
              className="boton-confirmar"
              disabled={qrMostrado && !comprobanteUrl}
            >
              Confirmar Pedido (${totalFinal.toLocaleString()})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
