import { useState, useEffect } from "react";
import api from "../../api/api";
import PedidosList from "./PedidosList.jsx";
import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    totalPedidos: 0,
    pedidosPendientes: 0,
    pedidosEntregados: 0,
  });

  const [activeTab, setActiveTab] = useState("inicio");

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

  return (
    <div className="dashboard-wrapper">
      {/* 🔹 Barra de navegación */}
      <nav className="dashboard-navbar">
        <h2 className="dashboard-logo">Devoraya Comercio 🍔</h2>
        <ul className="dashboard-nav-links">
          <li
            className={activeTab === "inicio" ? "active" : ""}
            onClick={() => setActiveTab("inicio")}
          >
            🏠 Inicio
          </li>
          <li
            className={activeTab === "pedidos" ? "active" : ""}
            onClick={() => setActiveTab("pedidos")}
          >
            📦 Pedidos
          </li>
          <li
            className={activeTab === "menu" ? "active" : ""}
            onClick={() => setActiveTab("menu")}
          >
            🍽️ Menú
          </li>
          <li
            className={activeTab === "config" ? "active" : ""}
            onClick={() => setActiveTab("config")}
          >
            ⚙️ Configuración
          </li>
          <li
            className="logout"
            onClick={() => alert("Sesión cerrada")}
          >
            🚪 Cerrar sesión
          </li>
        </ul>
      </nav>

      {/* 🔹 Contenido dinámico */}
      <div className="dashboard-container">
        {activeTab === "inicio" && (
          <>
            <h1 className="dashboard-title">Panel del Comercio 🏪</h1>

            <div className="stats-container">
              <div className="stat-card">
                <h3>Total de pedidos</h3>
                <p>{stats.totalPedidos}</p>
              </div>
              <div className="stat-card">
                <h3>Pendientes</h3>
                <p>{stats.pedidosPendientes}</p>
              </div>
              <div className="stat-card">
                <h3>Entregados</h3>
                <p>{stats.pedidosEntregados}</p>
              </div>
            </div>
          </>
        )}

        {activeTab === "pedidos" && <PedidosList />}
        {activeTab === "menu" && <p>🍽️ Aquí irán los platos del comercio.</p>}
        {activeTab === "config" && <p>⚙️ Configuración del comercio.</p>}
      </div>
    </div>
  );
}

export default Dashboard;
