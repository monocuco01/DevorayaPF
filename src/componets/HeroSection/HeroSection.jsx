import { useState } from "react"
import { useNavigate } from "react-router-dom"; // Importamos useNavigate
import PhoneSVG from "../../assets/phone.svg"
import "./HeroSection.css"

export default function HeroSection() {
  const [searchTerm, setSearchTerm] = useState("") // Cambiamos 'address' por 'searchTerm'
  const navigate = useNavigate(); // Inicializamos el hook de navegación

  // Función para manejar la búsqueda al presionar Enter o al hacer clic
  const executeSearch = () => {
    if (searchTerm.trim()) {
      // Redirigimos a la ruta de búsqueda
      navigate(`/buscar/${encodeURIComponent(searchTerm.trim())}`);
      // Opcional: limpiar la barra después de buscar
      // setSearchTerm(""); 
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      executeSearch();
      e.target.blur(); // Ocultar el teclado/quitar foco
    }
  };

  return (
    <section className="hero">
      <div className="hero-phone">
        <img src={PhoneSVG} alt="App preview" />
      </div>
      <div className="hero-content">
        <h1 className="hero-title">
          Comida a domicilio <br /> y mucho más
        </h1>
        <p className="hero-subtitle">Restaurantes y pronto mucho más…</p>
        
        {/* 🔄 Contenedor de búsqueda */}
        <div className="hero-input-container">
          
          {/* Ícono de Lupa */}
          <button className="hero-search-icon" onClick={executeSearch} aria-label="Buscar restaurante">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
            </svg>
          </button>
          
          <input
            type="text"
            placeholder="Busca tu restaurante favorito..." // Texto de búsqueda
            className="hero-input-field"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown} // Manejar Enter
          />
          
          <button 
             className="hero-search-button" 
             onClick={executeSearch}
             disabled={!searchTerm.trim()}
          >
            Buscar
          </button>
        </div>
        
      </div>
      <div className="hero-wave">
        <svg viewBox="0 0 500 150" preserveAspectRatio="none">
          <path d="M0.00,49.98 C150.00,150.00 349.97,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"></path>
        </svg>
      </div>
    </section>
  )
}