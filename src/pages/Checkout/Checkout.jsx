import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useCarrito } from "../../componets/Cart/CarritoContext";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, CreditCard, MapPin, User, Package } from "lucide-react";
import api from "../../api/api";
import "./Checkout.css";
import Swal from "sweetalert2";

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

export default function Checkout() {
  const { carrito, limpiarCarrito } = useCarrito();
  const navigate = useNavigate();

  const [nombreRecibe, setNombreRecibe] = useState("");
  const [direccion, setDireccion] = useState("");
  const [instrucciones, setInstrucciones] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [referenciaPago, setReferenciaPago] = useState("");
  const [comprobanteUrl, setComprobanteUrl] = useState("");

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

  /* =====================================================
     🔥 DEBUG: VER CARRITO COMPLETO
  ===================================================== */
  useEffect(() => {
    console.log("🛒 CARRITO COMPLETO:", JSON.stringify(carrito, null, 2));
  }, [carrito]);

  /* =====================================================
     Cargar datos iniciales
  ===================================================== */
  useEffect(() => {
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
      } catch (err) {
        Swal.fire("Error", "No se pudo cargar datos.", "error");
      }

      setCargando(false);
    };

    fetchData();
  }, [usuario_id, comercio_id]);

  /* =====================================================
     Confirmar pedido
  ===================================================== */
  const handleConfirmar = async () => {
    if (!usuario_id) {
      Swal.fire("Atención", "Inicia sesión.", "warning");
      return navigate("/login");
    }

    if (!direccion || carrito.length === 0) {
      Swal.fire("Error", "Datos incompletos.", "warning");
      return;
    }

    const payload = {
      usuario_id,
      comercio_id,
      instrucciones,
      metodo_pago: metodoPago,
      nombre_recibe: nombreRecibe,
      comprobante_url: comprobanteUrl || null,
      referencia_pago: referenciaPago || null,

      // 🔥 AQUÍ VA LA MAGIA
      platos: carrito.map((item) => ({
        id: item.id,
        cantidad: item.cantidad,
        precio: item.precio,

        // 👇 OPCIONES (CLAVE)
        opciones: item.opciones || [],
      })),
    };

    // 🔥 DEBUG FINAL
    console.log(
      "🚀 PAYLOAD ENVIADO AL BACKEND:",
      JSON.stringify(payload, null, 2)
    );

    try {
      await api.post("/pedidos", payload);

      Swal.fire("Pedido confirmado", "Todo salió bien 🚀", "success");
      limpiarCarrito();
      navigate("/");
    } catch (err) {
      console.error("❌ ERROR PEDIDO:", err);
      Swal.fire("Error", "No se pudo crear el pedido.", "error");
    }
  };

  if (cargando) return <p>Cargando...</p>;

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <div className="checkout-wrapper">
      <div className="checkout-container">
        {/* IZQUIERDA */}
        <div className="checkout-left">
          <div className="checkout-card">
            <h3>
              <MapPin size={18} /> Dirección
            </h3>

            <input
              value={nombreRecibe}
              onChange={(e) => setNombreRecibe(e.target.value)}
              placeholder="Nombre de quien recibe"
            />

            <input value={direccion} readOnly />

            <textarea
              placeholder="Instrucciones"
              value={instrucciones}
              onChange={(e) => setInstrucciones(e.target.value)}
            />
          </div>

          <div className="checkout-card">
            <h3>
              <Package size={18} /> Detalle del pedido
            </h3>

            {carrito.map((item) => (
              <div key={item.id}>
                <strong>
                  {item.cantidad}x {item.nombre}
                </strong>

                {/* 🔥 OPCIONES VISIBLES */}
                {item.opciones?.length > 0 && (
                  <ul>
                    {item.opciones.map((op, i) => (
                      <li key={i}>
                        ▸ {op.nombre_opcion}: <b>{op.valor}</b>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* DERECHA */}
        <div className="checkout-right">
          <div className="checkout-final-card">
            <h3>Total</h3>

            <p>Subtotal: ${subtotal.toLocaleString()}</p>
            <p>Envío: ${costoEnvio.toLocaleString()}</p>
            <p>Servicio: ${TARIFA_SERVICIO.toLocaleString()}</p>

            <h2>Total: ${totalFinal.toLocaleString()}</h2>

            <button onClick={handleConfirmar} className="boton-confirmar">
              Confirmar Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
