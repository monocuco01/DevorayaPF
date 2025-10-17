import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import Logo from "../../assets/log.png";
import logo2 from "../../assets/logosolo.svg";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("usuarios")) || [];
    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      localStorage.setItem("usuarioActivo", JSON.stringify(user));
      alert(`Bienvenido, ${user.nombre}!`);
      navigate("/");
    } else {
      alert("Credenciales incorrectas 😕");
    }
  };

  return (
 <div className="auth-wrapper">
  <div className="auth-image">
    <img src={Logo} alt="Login visual" />
  </div>

  <div className="auth-form">
    {/* Logo solo visible en móviles */}
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
