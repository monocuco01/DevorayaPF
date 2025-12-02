import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import "./Menu.css";
import api from "../../../api/api";

// 🔥 SweetAlert siempre encima
Swal.mixin({
  customClass: { popup: "swal-super-top" },
});

const style = document.createElement("style");
style.innerHTML = `
  .swal-super-top, .swal2-container {
    z-index: 999999 !important;
  }
`;
document.head.appendChild(style);

export default function PlatoModal({ onClose, platoEditar, comercio_id }) {
  const cloudinaryWidget = useRef(null);

  const [plato, setPlato] = useState(
    platoEditar || {
      nombre: "",
      descripcion: "",
      precio: "",
      imagen: "",
      disponible: true,
      destacado: false,
      menu_id: null,        // ← se llenará automáticamente
      comercio_id,
    }
  );

  // 🚀 OBTENER AUTOMÁTICAMENTE EL menu_id DEL COMERCIO
  useEffect(() => {
    const cargarMenu = async () => {
      try {
        const { data } = await api.get(`/comercios/${comercio_id}`);

        if (data?.Menus?.length > 0) {
          const menuIdReal = data.Menus[0].id;

          setPlato((prev) => ({
            ...prev,
            menu_id: menuIdReal,
          }));
        }
      } catch (error) {
        console.error("❌ Error cargando menú:", error);
      }
    };

    if (!platoEditar) cargarMenu();
  }, [comercio_id, platoEditar]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlato({
      ...plato,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 🚀 CLOUDINARY
  const openWidget = () => {
    const cloudinaryConfig = {
      cloudName: "dziwyqnqk",
      uploadPreset: "kifrxmwu",
    };

    cloudinaryWidget.current = window.cloudinary.createUploadWidget(
      cloudinaryConfig,
      (error, result) => {
        if (!error && result && result.event === "success") {
          const imageUrl = result.info.secure_url;
          setPlato((prev) => ({ ...prev, imagen: imageUrl }));
        }
      }
    );

    cloudinaryWidget.current.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const platoData = {
        ...plato,
        precio: Number(plato.precio),
        comercio_id: Number(plato.comercio_id),
        menu_id: Number(plato.menu_id),
      };

      if (platoEditar) {
        await api.put(`/platos/${platoEditar.id}`, platoData);
        Swal.fire({
          icon: "success",
          title: "✔ Plato actualizado",
          background: "#1e1e1e",
          color: "#fff",
        });
      } else {
        await api.post(`/platos`, platoData);
        Swal.fire({
          icon: "success",
          title: "🍽 Plato creado",
          background: "#1e1e1e",
          color: "#fff",
        });
      }

      onClose();
    } catch (error) {
      console.error("❌ Error al guardar plato:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: "Ocurrió un error al intentar guardar el plato.",
        background: "#1e1e1e",
        color: "#fff",
        confirmButtonColor: "#e74c3c",
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          {platoEditar ? "✏️ Editar Plato" : "🍽️ Nuevo Plato"}
        </h2>

        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="text"
            name="nombre"
            value={plato.nombre}
            onChange={handleChange}
            placeholder="Nombre del plato"
            required
          />

          <textarea
            name="descripcion"
            value={plato.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            required
          />

          <input
            type="number"
            name="precio"
            value={plato.precio}
            onChange={handleChange}
            placeholder="Precio"
            required
          />

          {/* Imagen */}
          <div className="imagen-input-group">
            <input
              type="text"
              name="imagen"
              value={plato.imagen}
              onChange={handleChange}
              placeholder="URL de la imagen"
            />

            <button
              type="button"
              className="subir-imagen-btn"
              onClick={openWidget}
            >
              Subir Imagen
            </button>
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                name="disponible"
                checked={plato.disponible}
                onChange={handleChange}
              />
              Disponible
            </label>
            <label>
              <input
                type="checkbox"
                name="destacado"
                checked={plato.destacado}
                onChange={handleChange}
              />
              Destacado
            </label>
          </div>

          <div className="modal-buttons">
            <button type="button" onClick={onClose} className="cancelar-btn">
              Cancelar
            </button>
            <button type="submit" className="guardar-btn">
              {platoEditar ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
