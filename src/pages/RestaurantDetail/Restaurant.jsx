import { useParams, Link } from "react-router-dom";
import { restaurantes } from "../../data/restaurants";
import "./Restaurant.css";

function Restaurant() {
  const { id } = useParams();
  const restaurant = restaurantes.find((r) => r.id === parseInt(id));

  if (!restaurant) {
    return <div className="not-found">Restaurante no encontrado 😕</div>;
  }

  return (
    <div className="restaurant-page">
      <div className="restaurant-header">
        <img src={restaurant.imagen} alt={restaurant.nombre} className="restaurant-img" />
        <div className="restaurant-info">
          <h1>{restaurant.nombre}</h1>
          <p>{restaurant.descripcion}</p>
          <p><strong>Categoría:</strong> {restaurant.categoriaRest}</p>
          <p><strong>Dirección:</strong> {restaurant.direccion}</p>
          <a href={`https://wa.me/${restaurant.numeroDeWhatsapp.replace("+", "")}`} className="whatsapp-btn" target="_blank">
            📲 Contactar por WhatsApp
          </a>
        </div>
      </div>

      <h2 className="menu-title">🍽️ Menú</h2>
      <div className="menu-grid">
        {restaurant.menu.map((plato) => (
          <div key={plato.id} className="plato-card">
            <img src={plato.imgPlato} alt={plato.nombre} className="plato-img" />
            <h3>{plato.nombre}</h3>
            <p>{plato.descripcion}</p>
            <span className="plato-precio">${plato.precio.toLocaleString()}</span>
          </div>
        ))}
      </div>

      <Link to="/" className="back-btn">⬅ Volver al inicio</Link>
    </div>
  );
}

export default Restaurant;
