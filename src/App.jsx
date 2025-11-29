import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import Restaurant from "./pages/RestaurantDetail/Restaurant";
import CategoriaPage from "./pages/CategoriaPage/CategoriaPage";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import Checkout from "./pages/Checkout/Checkout";
import Dashboard from "./componets/ComercioPanel/Dashboard";
import LoginComercio from "./pages/Auth/LoginComercio/LoginComercio";
import Navbar from "./componets/navBar/Navbar"; // 👈 tu navbar principal
import { ToastContainer } from "react-toastify";
import { Analytics } from "@vercel/analytics/react";
import UserProfile from "./pages/UserProfile/UserProfile";
import UserOrders from "./pages/UserProfile/UserOrders";
import { AdminPanel } from "./pages/AdminPanel/AdminPanel";
import SearchResults from "./pages/SearchResults/SearchResults";
function AppContent() {
  const location = useLocation();
  const currentPath = location.pathname;

  // 🚀 Lógica de Ocultar Navbar Actualizada
  const hideNavBarRoutes = [
    "/comercio/panel", 
    "/login-comercio", // Añadido si no quieres navbar en login comercio
    "/login",          // Añadido si no quieres navbar en login usuario
    "/register"        // Añadido si no quieres navbar en registro
  ];
  
  // Condición principal: Ocultar si está en la lista O si comienza con /admin
  const shouldShowNavBar = !hideNavBarRoutes.includes(currentPath) && 
                           !currentPath.startsWith("/admin"); 

  // Agregar margin-bottom solo si NO estamos en "/"
  const containerStyle = {
    marginBottom: currentPath !== "/" ? "0px" : "0",
  };

  return (
    <div style={containerStyle}>
      {/* Muestra la Navbar solo si shouldShowNavBar es true */}
      {shouldShowNavBar && <Navbar />} 

      <Routes>
        <Route path="/buscar/:termino" element={<SearchResults />} />
        <Route path="/" element={<Home />} />
        <Route path="/restaurant/:id" element={<Restaurant />} />
        <Route path="/categoria/:nombre" element={<CategoriaPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/comercio/panel" element={<Dashboard />} />
        <Route path="/login-comercio" element={<LoginComercio />} />
        <Route path="/perfil" element={<UserProfile />} />
        <Route path="/pedidos" element={<UserOrders />} />
        
        {/* 🚨 MUY IMPORTANTE: Cambia la ruta de admin para que cubra subrutas */}
        <Route path="/admin/*" element={<AdminPanel />} /> 
      </Routes>

      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <div>
      <Router>
        <AppContent />
      </Router>
      <Analytics />
    </div>
  );
}



export default App;
