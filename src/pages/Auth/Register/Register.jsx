import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../../Auth/Login/Auth.css";
import Logo from "../../../assets/log.png";
import logo2 from "../../../assets/logosolo.svg";
import api from "../../../api/api"; // tu instancia de Axios

function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const { data } = await api.post("/auth/usuarios/register", {
        nombre,
        correo: email,
        telefono,
        contraseña: password,
      });

      Swal.fire({
        icon: "success",
        title: "Registro exitoso 🎉",
        text: "¡Ahora puedes iniciar sesión!",
        confirmButtonText: "Entrar",
      }).then(() => {
        navigate("/login");
      });

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error en el registro 😕",
        text: error.response?.data?.mensaje || "Ocurrió un error",
      });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-image">
        <img src={Logo} alt="Registro visual" />
      </div>

      <div className="auth-form">
        <img src={logo2} alt="Devoraya logo" className="auth-logo-mobile" />

        <h2>Crear cuenta</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Número de teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
            pattern="[0-9]{10}"
            title="Ingresa un número de 10 dígitos"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Registrarse</button>
        </form>

        <p>
          ¿Ya tienes cuenta?{" "}
          <span onClick={() => navigate("/login")}>Inicia sesión</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
