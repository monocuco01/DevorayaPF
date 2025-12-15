import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import "./Menu.css";
import api from "../../../api/api";

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
    platoEditar
      ? {
          ...platoEditar,
          opciones: platoEditar.OpcionPlatos || [],
        }
      : {
          nombre: "",
          descripcion: "",
          precio: "",
          imagen: "",
          disponible: true,
          destacado: false,
          menu_id: null,
          comercio_id,
          categoria: "",
          opciones: [],
        }
  );

  useEffect(() => {
    const cargarMenu = async () => {
      try {
        const { data } = await api.get(`/comercios/${comercio_id}`);
        if (data?.Menus?.length > 0) {
          setPlato((prev) => ({ ...prev, menu_id: data.Menus[0].id }));
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

  /* =========================
     OPCIONES DEL PLATO
     ========================= */

  const agregarOpcion = () => {
    setPlato((prev) => ({
      ...prev,
      opciones: [...prev.opciones, { nombre: "", obligatorio: false }],
    }));
  };

  const cambiarOpcion = (index, campo, valor) => {
    const nuevas = [...plato.opciones];
    nuevas[index][campo] = valor;
    setPlato({ ...plato, opciones: nuevas });
  };

  const eliminarOpcion = (index) => {
    setPlato({
      ...plato,
      opciones: plato.opciones.filter((_, i) => i !== index),
    });
  };

  /* ========================= */

  const openWidget = () => {
    const cloudinaryConfig = {
      cloudName: "dziwyqnqk",
      uploadPreset: "kifrxmwu",
    };

    cloudinaryWidget.current = window.cloudinary.createUploadWidget(
      cloudinaryConfig,
      (error, result) => {
        if (!error && result && result.event === "success") {
          setPlato((prev) => ({ ...prev, imagen: result.info.secure_url }));
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
        opciones: plato.opciones.filter(
          (o) => o.nombre && o.nombre.trim() !== ""
        ),
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
    <div className="platoadmin-overlay">
      <div className="platoadmin-box" onClick={(e) => e.stopPropagation()}>
        <h2 className="platoadmin-title">
          {platoEditar ? "✏️ Editar Plato" : "🍽️ Nuevo Plato"}
        </h2>

        <form onSubmit={handleSubmit} className="platoadmin-form">
          <input
            type="text"
            name="nombre"
            value={plato.nombre}
            onChange={handleChange}
            placeholder="Nombre del plato"
            required
            className="platoadmin-input"
          />

          <textarea
            name="descripcion"
            value={plato.descripcion}
            onChange={handleChange}
            placeholder="Descripción"
            required
            className="platoadmin-textarea"
          />

          <input
            type="number"
            name="precio"
            value={plato.precio}
            onChange={handleChange}
            placeholder="Precio"
            required
            className="platoadmin-input"
          />

          <input
            type="text"
            name="categoria"
            value={plato.categoria}
            onChange={handleChange}
            placeholder="Categoría del plato"
            className="platoadmin-input"
          />

          <div className="platoadmin-img-row">
            <input
              type="text"
              name="imagen"
              value={plato.imagen}
              onChange={handleChange}
              placeholder="URL de la imagen"
              className="platoadmin-input"
            />
            <button
              type="button"
              className="platoadmin-upload-btn"
              onClick={openWidget}
            >
              Subir Imagen
            </button>
          </div>

          <div className="platoadmin-checkboxes">
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

          {/* ===== OPCIONES DEL PLATO ===== */}
          <div className="platoadmin-opciones">
            <h4>Opciones del plato</h4>

            {plato.opciones.map((opcion, index) => (
              <div key={index} className="platoadmin-opcion">
                <input
                  type="text"
                  value={opcion.nombre}
                  placeholder="Nombre de la opción"
                  onChange={(e) =>
                    cambiarOpcion(index, "nombre", e.target.value)
                  }
                  className="platoadmin-input"
                />

                <label>
                  <input
                    type="checkbox"
                    checked={opcion.obligatorio}
                    onChange={(e) =>
                      cambiarOpcion(index, "obligatorio", e.target.checked)
                    }
                  />
                  Obligatoria
                </label>

                <button
                  type="button"
                  onClick={() => eliminarOpcion(index)}
                >
                  ❌
                </button>
              </div>
            ))}

            <button type="button" onClick={agregarOpcion}>
              ➕ Agregar opción
            </button>
          </div>
          {/* ============================== */}

          <div className="platoadmin-buttons">
            <button
              type="button"
              onClick={onClose}
              className="platoadmin-cancel"
            >
              Cancelar
            </button>
            <button type="submit" className="platoadmin-save">
              {platoEditar ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
