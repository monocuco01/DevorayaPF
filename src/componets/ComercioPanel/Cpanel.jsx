// src/components/Cpanel/Cpanel.jsx
import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import "./Cpanel.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const getComercioId = () => {
  try {
    const raw =
      localStorage.getItem("comercioActivo") ||
      localStorage.getItem("usuarioActivo") ||
      null;
    if (!raw) return null;
    const obj = JSON.parse(raw);
    return obj?.id ?? obj?.comercio_id ?? obj?.comercio?.id ?? null;
  } catch {
    return null;
  }
};

export default function Cpanel() {
  const [pedidos, setPedidos] = useState([]);
  const [platos, setPlatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const comercioId = getComercioId() ?? 5;

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pedidosRes, platosRes] = await Promise.all([
        api.get(`/pedidos/comercio/${comercioId}`),
        api.get(`/platos/${comercioId}`),
      ]);

      const pedidosData = Array.isArray(pedidosRes.data)
        ? pedidosRes.data
        : pedidosRes.data
        ? [pedidosRes.data]
        : [];
      const platosData = Array.isArray(platosRes.data)
        ? platosRes.data
        : platosRes.data
        ? [platosRes.data]
        : [];

      setPedidos(pedidosData);
      setPlatos(platosData);
    } catch (err) {
      console.error("Error al cargar datos del panel:", err);
      setError("No se pudieron cargar los datos. Revisa la API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [comercioId]);

  // ====== Procesamiento de métricas ======
  const totals = useMemo(() => {
    const totalPedidos = pedidos.length;
    const pedidosPorEstado = pedidos.reduce((acc, p) => {
      const estado = (p.estado || "pendiente").toLowerCase();
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});

    // 💡 Solo sumar ventas de pedidos "aprobado" o "entregado"
    const totalVentas = pedidos.reduce((sum, p) => {
      const estado = (p.estado || "").toLowerCase();
      if (estado === "aprobado" || estado === "entregado") {
        return sum + (Number(p.total) || 0);
      }
      return sum;
    }, 0);

    return { totalPedidos, pedidosPorEstado, totalVentas };
  }, [pedidos]);

  const platosStats = useMemo(() => {
    const totalPlatos = platos.length;
    const activo = platos.filter((p) => p.disponible !== false).length;
    const destacado = platos.filter((p) => p.destacado).length;
    return { totalPlatos, activo, destacado, inactivo: totalPlatos - activo };
  }, [platos]);

  // ====== Ventas mensuales (solo aprobados o entregados) ======
  const ventasPorMes = useMemo(() => {
    const map = {};
    pedidos.forEach((p) => {
      const estado = (p.estado || "").toLowerCase();
      if (estado !== "aprobado" && estado !== "entregado") return; // ✅ filtro

      const fecha = p.createdAt || p.fecha || p.fecha_creacion || p.created_at;
      if (!fecha) return;
      const d = new Date(fecha);
      if (isNaN(d)) return;

      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      map[key] = (map[key] || 0) + (Number(p.total) || 0);
    });

    const keys = Object.keys(map).sort();
    const labels = keys.map((k) => {
      const [y, m] = k.split("-");
      return `${m}/${y}`;
    });
    const data = keys.map((k) => map[k]);

    if (labels.length === 0) {
      return { labels: ["-"], data: [0] };
    }

    return { labels, data };
  }, [pedidos]);

  // ====== Gráficos ======
  const estadosChart = useMemo(() => {
    const estadoKeys = Object.keys(totals.pedidosPorEstado);
    const labels = estadoKeys.length
      ? estadoKeys.map((s) => s.toUpperCase())
      : ["SIN DATOS"];
    const data = estadoKeys.length
      ? estadoKeys.map((k) => totals.pedidosPorEstado[k])
      : [0];
    return { labels, data };
  }, [totals]);

  const platosChart = useMemo(() => {
    const labels = ["Activos", "Inactivos"];
    const data = [platosStats.activo, platosStats.inactivo];
    return { labels, data };
  }, [platosStats]);

  const ventasData = {
    labels: ventasPorMes.labels,
    datasets: [
      {
        label: "Ventas",
        data: ventasPorMes.data,
        fill: true,
        tension: 0.3,
        borderColor: "#1abc9c",
        backgroundColor: "rgba(26,188,156,0.12)",
        pointBackgroundColor: "#1abc9c",
        pointRadius: 4,
      },
    ],
  };

  const ventasOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        grid: { color: "#222" },
        ticks: { color: "#cfcfcf" },
      },
      y: {
        grid: { color: "#222" },
        ticks: {
          color: "#cfcfcf",
          callback: (value) => "$" + Number(value).toLocaleString(),
        },
      },
    },
  };

  const estadosData = {
    labels: estadosChart.labels,
    datasets: [
      {
        data: estadosChart.data,
        backgroundColor: ["#f1c40f", "#1abc9c", "#3498db", "#9b59b6", "#e74c3c"],
        hoverOffset: 6,
      },
    ],
  };

  const platosData = {
    labels: platosChart.labels,
    datasets: [
      {
        data: platosChart.data,
        backgroundColor: ["#1abc9c", "#7f8c8d"],
        hoverOffset: 6,
      },
    ],
  };

  if (loading) {
    return (
      <div className="cpanel-wrapper">
        <div className="cpanel-loading">Cargando panel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cpanel-wrapper">
        <div className="cpanel-error">{error}</div>
        <button className="cpanel-refresh" onClick={fetchAll}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="cpanel-wrapper">
      <header className="cpanel-header">
        <h2>Panel de Control — Análisis</h2>
        <div className="cpanel-actions">
          <button className="cpanel-refresh" onClick={fetchAll}>
             Refrescar
          </button>
        </div>
      </header>

      <section className="cpanel-stats">
        <div className="stat-card">
          <small>Total pedidos</small>
          <strong>{totals.totalPedidos}</strong>
        </div>
        <div className="stat-card">
          <small>Total ventas</small>
          <strong>${totals.totalVentas.toLocaleString()}</strong>
        </div>
        <div className="stat-card">
          <small>Platos totales</small>
          <strong>{platosStats.totalPlatos}</strong>
        </div>
        <div className="stat-card">
          <small>Platos destacados</small>
          <strong>{platosStats.destacado}</strong>
        </div>
      </section>

      <section className="cpanel-charts">
        <div className="chart-card large">
          <h3>Ventas mensuales</h3>
          <div className="chart-area">
            <Line data={ventasData} options={ventasOptions} />
          </div>
        </div>

        <div className="chart-card small">
          <h3>Pedidos por estado</h3>
          <div className="chart-area doughnut">
            <Doughnut data={estadosData} />
          </div>
        </div>

        <div className="chart-card small">
          <h3>Platos (activo / inactivo)</h3>
          <div className="chart-area doughnut">
            <Doughnut data={platosData} />
          </div>
        </div>

        <div className="chart-card medium">
          <h3>Pedidos (últimos registros)</h3>
          <div className="recent-list">
            {pedidos.slice(0, 6).map((p) => (
              <div key={p.id} className="recent-item">
                <div className="ri-left">
                  <strong>#{p.id}</strong>
                  <small>{p.Usuario?.nombre || "Cliente"}</small>
                </div>
                <div className="ri-right">
                  <span className="ri-amount">
                    ${(p.total || 0).toLocaleString()}
                  </span>
                  <span
                    className={`ri-status status-${(p.estado || "pendiente").replace(
                      /\s+/g,
                      "-"
                    )}`}
                  >
                    {p.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
