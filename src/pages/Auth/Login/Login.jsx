import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import "./Auth.css";
import Logo from "../../../assets/fondoV.jpg";
import logo2 from "../../../assets/logo2.svg";
import api from "../../../api/api";

const MySwal = withReactContent(Swal);

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("usuarios/login", {
        correo: email,
        contraseña: password,
      });

      console.log("DATOS LOGIN:", data);

      // Guardar token y usuario
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuarioActivo", JSON.stringify(data.usuario));

      // Mensaje de éxito
      MySwal.fire({
        icon: "success",
        title: `Bienvenido, ${data.usuario.nombre}!`,
        showConfirmButton: false,
        timer: 1500,
      });

      // 🚀 VERIFICACIÓN ADMINISTRADOR MEJORADA
      if (data.usuario.admin) { // Verifica si el valor es truthy (true)
        return navigate("/admin");
      }

      // Caso normal → home
      navigate("/");

    } catch (error) {
      console.log(error.response?.data);

      MySwal.fire({
        icon: "error",
        title: "Credenciales incorrectas 😕",
        text: error.response?.data?.mensaje || "Error al iniciar sesión",
      });
    }
  };

  return (
    <div className="auth-wrapper">

      {/* Imagen izquierda */}
      <div className="auth-image">
        <img src={Logo} alt="Login visual" />
      </div>

      {/* Formulario */}
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

        {/* Botón para comercio */}
        <button
          className="btn-comercio"
          onClick={() => navigate("/login-comercio")}
          style={{
            marginTop: "10px",
            backgroundColor: "#ffffff",
            border: "1px solid #ccc",
            color: "#333",
            padding: "10px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ¿Eres comercio?
        </button>

        <p>
          ¿No tienes cuenta?{" "}
          <span onClick={() => navigate("/register")}>Regístrate</span>
        </p>
      </div>
    </div>
  );
}

export default Login;