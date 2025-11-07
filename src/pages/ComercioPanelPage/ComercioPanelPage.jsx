import React from "react";
import Dashboard from "../../components/ComercioPanel/Dashboard";
import PedidosList from "../../componets/ComercioPanel/PedidosList/PedidosList";
import "./ComercioPanelPage.css";

const ComercioPanelPage = () => {
  return (
    <div className="panel-container">
      <h1 className="panel-title">Panel del Comercio</h1>
      <Dashboard />
      <PedidosList />
    </div>
  );
};

export default ComercioPanelPage;
