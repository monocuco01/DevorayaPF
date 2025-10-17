import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Logo from "../../assets/logo.svg";
import Logo2 from "../../assets/logo2.svg";
import "./Navbar.css";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate(); // 👈 para redireccionar

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-left">
        <img
          src={scrolled ? Logo2 : Logo}
          alt="Devoraya logo"
          className={`navbar-logo ${scrolled ? "small" : ""}`}
        />
      </div>

      {/* === Barra de búsqueda (solo visible al hacer scroll) === */}
      {scrolled && (
        <div className="navbar-search">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Buscar restaurante..."
            className="search-input"
          />
        </div>
      )}

      <div className="navbar-right">
        <button
          className="navbar-login"
          onClick={() => navigate("/login")} // 👈 redirige al login
        >
          Iniciar sesión
        </button>
      </div>
    </nav>
  );
}
