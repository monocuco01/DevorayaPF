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

function AppContent() {
  const location = useLocation();

  // Ocultar navbar en rutas específicas
  const hideNavBarRoutes = ["/comercio/panel"];
  const shouldShowNavBar = !hideNavBarRoutes.includes(location.pathname);

  // Agregar margin-bottom solo si NO estamos en "/"
  const containerStyle = {
    marginBottom: location.pathname !== "/" ? "0px" : "0",
  };

  return (
    <div style={containerStyle}>
      {shouldShowNavBar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurant/:id" element={<Restaurant />} />
        <Route path="/categoria/:nombre" element={<CategoriaPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/comercio/panel" element={<Dashboard />} />
        <Route path="/login-comercio" element={<LoginComercio />} />
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
