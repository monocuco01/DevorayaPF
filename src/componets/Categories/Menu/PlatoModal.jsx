import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./Menu.css";

// 🔥 Aseguramos que SweetAlert esté siempre sobre todo
Swal.mixin({
  customClass: {
    popup: "swal-super-top",
  },
});

const style = document.createElement("style");
style.innerHTML = `
  .swal-super-top, .swal2-container {
    z-index: 999999 !important;
  }
`;
document.head.appendChild(style);

export default function PlatoModal({ onClose, platoEditar, comercio_id }) {
  const [plato, setPlato] = useState(
    platoEditar || {
      nombre: "",
      descripcion: "",
      precio: "",
      imagen: "",
      disponible: true,
      destacado: false,
      menu_id: 1,
      comercio_id,
    }
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlato({
      ...plato,
      [name]: type === "checkbox" ? checked : value,
    });
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const platoData = {
      ...plato,
      precio: Number(plato.precio),
      comercio_id: Number(plato.comercio_id),
      menu_id: Number(plato.menu_id)
    };

    if (platoEditar) {
      await axios.put(`http://localhost:4000/platos/${platoEditar.id}`, platoData);
      //...
    } else {
      await axios.post(`http://localhost:4000/platos`, platoData);
      //...
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

          <input
            type="text"
            name="imagen"
            value={plato.imagen}
            onChange={handleChange}
            placeholder="URL de la imagen"
          />

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
            <button
              type="button"
              onClick={onClose}
              className="cancelar-btn"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="guardar-btn"
            >
              {platoEditar ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
