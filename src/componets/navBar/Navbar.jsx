import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/logo.svg";
import Logo2 from "../../assets/logo2.svg";
import "./Navbar.css";
import CarritoModal from "../Cart/CarritoModal.jsx";
import { useCarrito } from "../Cart/CarritoContext.jsx";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [carritoOpen, setCarritoOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); 
  const navigate = useNavigate();
  const location = useLocation();
  const { carrito } = useCarrito();
  
  const usuarioActivo = localStorage.getItem("usuarioActivo") 
    ? JSON.parse(localStorage.getItem("usuarioActivo")) 
    : null;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuarioActivo");
    navigate("/");
    window.location.reload();
  };

  const handleNavigateProfile = () => {
    navigate("/perfil"); 
    setMenuOpen(false);
  };
  
  // FUNCIÓN NUEVA: Navegación a la página de pedidos
  const handleNavigateOrders = () => {
    navigate("/pedidos"); // 👈 Define esta ruta en tu Router
    setMenuOpen(false);
  };

  // 👇 Ocultar navbar en ciertas rutas
  if (
    location.pathname.startsWith("/comercio") ||
    location.pathname.startsWith("/panel") ||
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/register")
  ) {
    return null;
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-left">
          <img
            src={scrolled ? Logo2 : Logo}
            alt="Devoraya logo"
            className="navbar-logo"
            onClick={() => navigate("/")}
          />
        </div>

        {scrolled && (
          <div className="navbar-search">
            <input
              type="text"
              placeholder="Buscar restaurante..."
              className="search-input"
            />
          </div>
        )}

        <div className="navbar-right">
          <button
            className="cart-button"
            data-count={carrito.length}
            onClick={() => setCarritoOpen(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              className="bi bi-cart4"
              viewBox="0 0 16 16"
            >
              <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5M3.14 5l.5 2H5V5zM6 5v2h2V5zm3 0v2h2V5zm3 0v2h1.36l.5-2zm1.11 3H12v2h.61zM11 8H9v2h2zM8 8H6v2h2zM5 8H3.89l.5 2H5zm0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0m9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0" />
            </svg>
          </button>

          {!usuarioActivo ? (
            <button
              className="navbar-login"
              onClick={() => navigate("/login")}
            >
              Iniciar sesión
            </button>
          ) : (
            // 💡 Sección de Perfil/Usuario Activo
            <div className="navbar-profile-container">
              <button
                className="profile-icon-button"
                onClick={() => setMenuOpen(!menuOpen)} // Toggle del menú
                aria-expanded={menuOpen}
              >
                {/* Ícono de Usuario (ejemplo de SVG de Bootstrap Icons) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#b3854d" viewBox="0 0 16 16">
                  <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0"/>
                  <path d="M.002 12a.5.5 0 0 1 .58.332C1.758 14.51 4.962 16 8 16s6.242-1.49 7.418-3.668a.5.5 0 0 1 .58-.332H.002z"/>
                </svg>
              </button>
              
              {menuOpen && (
                <div className="profile-dropdown">
                <div className="dropdown-header">
  Hola, {usuarioActivo?.nombre?.split(" ")[0] || "Usuario"}!
</div>

                  <button className="dropdown-item" onClick={handleNavigateProfile}>
                     Mi Perfil
                  </button>
                  
                  {/* 👇 NUEVO BOTÓN PARA PEDIDOS 👇 */}
                  <button className="dropdown-item" onClick={handleNavigateOrders}>
                     Mis Pedidos
                  </button>
                  {/* 👆 FIN NUEVO BOTÓN 👆 */}

                  <button className="dropdown-item logout" onClick={handleLogout}>
                     Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <CarritoModal open={carritoOpen} setOpen={setCarritoOpen} />
    </>
  );
}