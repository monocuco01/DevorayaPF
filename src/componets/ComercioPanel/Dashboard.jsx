import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/api";
import PedidosList from "./PedidosList.jsx";
import "./Dashboard.css";
import Menu from "../Categories/Menu/Menu.jsx";
import Cpanel from "./Cpanel.jsx";

function Dashboard() {
  const [stats, setStats] = useState({
    totalPedidos: 0,
    pedidosPendientes: 0,
    pedidosEntregados: 0,
  });

  const [activeTab, setActiveTab] = useState("inicio");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/pedidos/stats");
        setStats(data);
      } catch (error) {
        console.error("Error al obtener estadísticas del comercio:", error);
      }
    };
    fetchStats();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "¿Estás seguro?",
      text: "Tu sesión se cerrará y deberás iniciar sesión nuevamente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuarioActivo");
      await Swal.fire({
        title: "Sesión cerrada",
        text: "Has cerrado sesión correctamente.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
      navigate("/");
      window.location.reload();
    }
  };

  return (
    <div className="dashboard-wrapper">
      {/* 🔹 Navbar */}
      <nav className="dashboard-navbar">
        <h2 className="dashboard-logo">Devoraya</h2>

        <button
          className={`menu-toggle ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`dashboard-nav-links ${menuOpen ? "active" : ""}`}>
          <li
            className={activeTab === "inicio" ? "active" : ""}
            onClick={() => handleTabChange("inicio")}
          >
            Inicio
          </li>
          <li
            className={activeTab === "pedidos" ? "active" : ""}
            onClick={() => handleTabChange("pedidos")}
          >
            Pedidos
          </li>
          <li
            className={activeTab === "menu" ? "active" : ""}
            onClick={() => handleTabChange("menu")}
          >
            Menú
          </li>
          <li
            className={activeTab === "config" ? "active" : ""}
            onClick={() => handleTabChange("config")}
          >
            Configuración
          </li>
          <li className="logout" onClick={handleLogout}>
            Cerrar sesión
          </li>
        </ul>
      </nav>

      {/* 🔹 Contenido */}
      <div className="dashboard-container">
        {activeTab === "inicio" && <Cpanel />}
        {activeTab === "pedidos" && <PedidosList />}
        {activeTab === "menu" && <Menu />}
        {activeTab === "config" && <p>⚙️ Configuración del comercio.</p>}
      </div>
    </div>
  );
}

export default Dashboard;
