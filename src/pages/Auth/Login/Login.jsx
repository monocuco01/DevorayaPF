import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./Auth.css";
import Logo from "../../../assets/log.png";
import logo2 from "../../../assets/logosolo.svg";
import api from "../../../api/api"; // tu instancia de Axios

const MySwal = withReactContent(Swal);

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/auth/login", {
        correo: email,
        contraseña: password,
      });

      // Guardar token y usuario en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuarioActivo", JSON.stringify(data.usuario));

      MySwal.fire({
        icon: "success",
        title: `Bienvenido, ${data.usuario.nombre}!`,
        showConfirmButton: false,
        timer: 2000,
      });

      navigate("/"); // Redirige al inicio
    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Credenciales incorrectas 😕",
        text: error.response?.data?.mensaje || "Error al iniciar sesión",
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

        <h2>Iniciar sesión</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Entrar</button>
        </form>

        <p>
          ¿No tienes cuenta?{" "}
          <span onClick={() => navigate("/register")}>Regístrate</span>
        </p>
      </div>
    </div>
  );
}

export default Login;
