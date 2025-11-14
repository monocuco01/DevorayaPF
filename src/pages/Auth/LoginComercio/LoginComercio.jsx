import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "../Login/Auth.css";
import Logo from "../../../assets/fondoV.jpg";
import logo2 from "../../../assets/logosolo.svg";
import api from "../../../api/api";

const MySwal = withReactContent(Swal);

function LoginComercio() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/auth/comercios/login", {
        correo,
        contraseña,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("comercioActivo", JSON.stringify(data.comercio));

      MySwal.fire({
        icon: "success",
        title: `Bienvenido, ${data.comercio.nombreComercio}!`,
        showConfirmButton: false,
        timer: 2000,
      });

      navigate("/comercio/panel");
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Error al iniciar sesión 😕",
        text: error.response?.data?.mensaje || "Credenciales inválidas",
      });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-image">
        <img src={Logo} alt="Login visual" />
      </div>

      <div className="auth-form">
        <img src={logo2} alt="Logo móvil" className="auth-logo-mobile" />

        <h2>Iniciar sesión como comercio</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo del comercio"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
        </form>

        <button
          onClick={() => navigate("/login")}
          style={{
            marginTop: "10px",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            color: "#333",
            padding: "10px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Volver al login de usuario
        </button>
      </div>
    </div>
  );
}

export default LoginComercio;
