import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // ❌ No hay token
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // ❌ No es admin
    if (!decoded?.admin) {
      return <Navigate to="/" replace />;
    }

    // ✅ Es admin
    return children;

  } catch (error) {
    console.error("Token inválido:", error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedAdminRoute;
