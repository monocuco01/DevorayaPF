import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home/Home";
import Restaurant from "./pages/RestaurantDetail/Restaurant";
import DetailNavBar from "./componets/DetailNavBar/DetailNavBar";
import CategoriaPage from "./pages/CategoriaPage/CategoriaPage";
import Login from "./pages/Auth/Login/Login";
import Register from "./pages/Auth/Register/Register";
import { ToastContainer } from "react-toastify";
import Checkout from "./pages/Checkout/Checkout";
import Dashboard from "./componets/ComercioPanel/Dashboard";
import { Analytics } from "@vercel/analytics/react";
import LoginComercio from "./pages/Auth/LoginComercio/LoginComercio";

function AppContent() {
  const location = useLocation();

  // Oculta el DetailNavBar en la ruta /comercio/panel
  const hideNavBarRoutes = ["/comercio/panel"];
  const shouldShowNavBar = !hideNavBarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavBar && <DetailNavBar />}

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
    </>
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
