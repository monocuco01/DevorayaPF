// Archivo: src/components/Checkout/Checkout.jsx

import React, { useState, useEffect } from "react";
import { useCarrito } from "../../componets/Cart/CarritoContext";
import { useNavigate } from "react-router-dom"; // 💡 Importado
import { ShoppingCart, CreditCard, MapPin, User, Clock, Package } from "lucide-react";
import api from "../../api/api";
import "./Checkout.css";
import Swal from 'sweetalert2'; 

// 🔥 Función para obtener usuario activo
const getUserId = () => {
  try {
    const raw = localStorage.getItem("usuarioActivo") || null;
    if (!raw) return null;
    return JSON.parse(raw)?.id ?? null;
  } catch {
    return null;
  }
};

export default function Checkout() {
  const { carrito, limpiarCarrito } = useCarrito();
  const navigate = useNavigate(); // 💡 Inicializado

  const [nombreRecibe, setNombreRecibe] = useState("");
  const [direccion, setDireccion] = useState("");
  const [instrucciones, setInstrucciones] = useState("");
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [cargando, setCargando] = useState(true);
  
  const tiempoEstimado = 30; 

  const usuario_id = getUserId();
  const comercio_id = carrito[0]?.comercio_id;

  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const totalFinal = subtotal + costoEnvio;

  // 📌 Obtener dirección del usuario y costo de envío
  useEffect(() => {
    const fetchDireccionYEnvio = async () => {
      if (!usuario_id || !comercio_id) {
        setCargando(false);
        return;
      }

      try {
        const usuarioRes = await api.get(`/usuarios/${usuario_id}`);
        // 💡 Establecer la dirección o cadena vacía si no existe
        setDireccion(usuarioRes.data.direccion || ""); 
        setNombreRecibe(usuarioRes.data.nombre || ""); 

        const envioRes = await api.get(`/pedidos/costo-envio/${comercio_id}/${usuario_id}`);
        setCostoEnvio(envioRes.data.costo_envio || 0);
      } catch (err) {
        console.error("Error obteniendo dirección o costo de envío:", err);
        Swal.fire('Error', 'No se pudo obtener la información de entrega. ¿Tu dirección está registrada?', 'error');
      }

      setCargando(false);
    };

    fetchDireccionYEnvio();
  }, [usuario_id, comercio_id]);

  // 📌 Confirmar pedido
  const handleConfirmar = async () => {
    if (!usuario_id) {
      Swal.fire('Atención', "Debes iniciar sesión antes de confirmar el pedido.", 'warning');
      navigate("/login");
      return;
    }

    if (!nombreRecibe || !direccion) {
        Swal.fire('Faltan Datos', "Por favor, completa el nombre y registra una dirección válida en tu perfil.", 'warning');
        return;
    }

    if (carrito.length === 0) {
      Swal.fire('Carrito Vacío', "Tu carrito está vacío.", 'info');
      return;
    }

    const pedido = {
      usuario_id,
      comercio_id,
      direccion_entrega: direccion,
      instrucciones,
      metodo_pago: metodoPago,
      nombre_recibe: nombreRecibe,
      total: totalFinal,
      platos: carrito.map((item) => ({
        id: item.id,
        cantidad: item.cantidad,
        precio: item.precio,
      })),
    };

    try {
      await api.post("/pedidos", pedido);
      Swal.fire('¡Éxito!', "✅ Pedido confirmado exitosamente.", 'success');
      limpiarCarrito();
      navigate("/");
    } catch (error) {
      console.error("Error al enviar pedido:", error.response?.data);
      Swal.fire('Error', "Hubo un problema creando tu pedido. Intenta nuevamente.", 'error');
    }
  };

  if (cargando) return <p className="loading-state">Cargando la confirmación del pedido...</p>;
  
  if (carrito.length === 0) return (
    <div className="checkout-wrapper">
        <div className="checkout-container">
            <h2 className="vacio-titulo"><ShoppingCart size={30} /> Tu carrito está vacío.</h2>
            <button className="boton-volver" onClick={() => navigate('/')}>Volver a la tienda</button>
        </div>
    </div>
  );

  return (
    <div className="checkout-wrapper">
      <div className="checkout-container">
        
        {/* Columna Izquierda: Bloques de Datos */}
        <div className="checkout-left">
          
          {/* 1. 🏡 Bloque de Dirección y Receptor */}
          <div className="checkout-card card-entrega">
            <h3><MapPin size={20} /> Dirección de entrega</h3>
            <div className="info-block">
                <p className="card-subtitle">Entrega a</p>
                <div className="input-group">
                    <User size={18} />
                    <input
                        type="text"
                        placeholder="Nombre de quien recibe"
                        value={nombreRecibe}
                        onChange={(e) => setNombreRecibe(e.target.value)}
                    />
                </div>
            </div>

            <div className="info-block">
                <p className="card-subtitle">Dirección</p>
                <div className="input-group">
                    <MapPin size={18} />
                    {/* 💡 Lógica para mostrar la dirección o advertencia */}
                    {direccion ? (
                        <input
                            type="text"
                            value={direccion}
                            readOnly
                            title="Tu dirección registrada. Puedes actualizarla en tu perfil."
                        />
                    ) : (
                        <input
                            type="text"
                            value="¡Debes registrar una dirección en tu perfil para continuar!"
                            readOnly
                            className="direccion-vacia-error" 
                            onClick={() => navigate('/perfil')} // Redirige al perfil
                            title="Haz clic para ir a tu perfil y agregar la dirección."
                        />
                    )}
                </div>
            </div>

            <div className="info-block">
                <p className="card-subtitle">Instrucciones (opcional)</p>
                <textarea
                    placeholder="Ej: Llamar al llegar o dejar en portería"
                    value={instrucciones}
                    onChange={(e) => setInstrucciones(e.target.value)}
                />
            </div>

            <div className="tiempo-estimado">
                <Clock size={18} />
                <span>Tiempo estimado de llegada: <strong>{tiempoEstimado} min</strong></span>
            </div>
          </div>
          
          {/* 2. 💳 Bloque de Pago */}
          <div className="checkout-card card-pago">
            <h3><CreditCard size={20} /> Método de pago</h3>
            <div className="input-group payment-select">
                <select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                    <option value="Efectivo">Efectivo al recibir</option>
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Nequi">Nequi/Daviplata</option>
                    <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                </select>
            </div>
          </div>
          
          {/* 3. 🧾 Resumen del Carrito (Detalle visible) */}
          <div className="checkout-card card-resumen-detalle">
            <h3><Package size={20} /> Detalle del pedido</h3>
            <div className="resumen-detalle-lista">
                {carrito.map((item) => (
                    <div key={item.id} className="detalle-item">
                        <span className="detalle-cantidad">{item.cantidad}x</span>
                        <p className="detalle-nombre">{item.nombre}</p>
                        <p className="detalle-precio">${(item.precio * item.cantidad).toLocaleString()}</p>
                    </div>
                ))}
            </div>
          </div>
          
        </div>

        {/* Columna Derecha: Resumen Flotante y Botón */}
        <div className="checkout-right">
          <div className="checkout-final-card">
            <h3>Resumen de pago</h3>
            <div className="total-lines">
                <p>Subtotal:</p>
                <p>${subtotal.toLocaleString()}</p>
            </div>
            <div className="total-lines shipping-line">
                <p>Costo de envío:</p>
                <p>${costoEnvio.toLocaleString()}</p>
            </div>
            <div className="total-final">
                <p>Total a pagar:</p>
                <p><strong>${totalFinal.toLocaleString()}</strong></p>
            </div>
            
            <button 
                className="boton-confirmar" 
                onClick={handleConfirmar} 
                disabled={cargando || !direccion} // Deshabilita si carga o si NO hay dirección
            >
                Confirmar Pedido (${totalFinal.toLocaleString()})
            </button>
            
            {/* Mensaje de advertencia bajo el botón si no hay dirección */}
            {!direccion && (
                <p className="advertencia-direccion">
                    ⚠️ Agrega tu dirección para habilitar el pedido.
                </p>
            )}

          </div>
        </div>
        
      </div>
    </div>
  );
}