import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Login/Auth.css";
import Logo from "../../../assets/log.png";
import logo2 from "../../../assets/logosolo.svg";

function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

    // Validar si el correo ya existe
    const existe = usuarios.some((u) => u.email === email);
    if (existe) {
      alert("Este correo ya está registrado 😕");
      return;
    }

    // Crear usuario nuevo
    const nuevoUsuario = { nombre, email, telefono, password };
    usuarios.push(nuevoUsuario);
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Registro exitoso 🎉 ¡Ahora puedes iniciar sesión!");
    navigate("/login");
  };

  return (
    <div className="auth-wrapper">
      {/* Imagen lateral (solo en escritorio) */}
      <div className="auth-image">
        <img src={Logo} alt="Registro visual" />
      </div>

      {/* Formulario */}
      <div className="auth-form">
        {/* Logo que solo aparece en móvil */}
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
