import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./DetailNavBar.css";

export default function DetailNavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Oculta la navbar en el home
  if (location.pathname === "/") return null;

  return (
    <nav className="detail-navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          Devoraya
        </Link>

        {/* Enlaces desktop */}
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
          <Link to="/nosotros" onClick={() => setMenuOpen(false)}>Nosotros</Link>
          <Link to="/contacto" onClick={() => setMenuOpen(false)}>Contacto</Link>
          <a
            href="https://wa.me/573001112233"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-btn"
            onClick={() => setMenuOpen(false)}
          >
            WhatsApp
          </a>
        </div>

        {/* Botón hamburguesa */}
        <div
          className={`nav-toggle ${menuOpen ? "active" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}
