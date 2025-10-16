import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Auth.css";

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
      {/* Imagen a la izquierda */}
      <div className="auth-image">
        <img
          src="https://images.unsplash.com/photo-1600891964599-f61ba0e24092?w=900"
          alt="Login visual"
        />
      </div>

      {/* Formulario a la derecha */}
      <div className="auth-form">
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
