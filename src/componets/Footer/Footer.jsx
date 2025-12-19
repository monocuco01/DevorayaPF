import React from "react";
import "./Footer.css";
import Logo from "../../assets/logo.svg"; 


export default function Footer() {
  return (
    <footer className="footer">

      <div className="footer-top-curve" aria-hidden="true">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M0,96 C360,0 1080,0 1440,96 L1440,0 L0,0 Z" fill="#e4f4f3" />

        </svg>
      </div>

      <div className="footer-container">
        <div className="footer-column">
          <img src={Logo} alt="Devoraya Logo" className="footer-logo" />
          <p className="footer-description">
            Tu comida favorita, más cerca que nunca 🍔
            ¡Únete a la revolución Devoraya!
          </p>
        </div>

        <div className="footer-column">
          <h4>Colabora con Devoraya</h4>
          <ul>
            <li><a href="https://wa.me/573215955801?text=Hola%2C%20quiero%20unirme%20a%20ustedes">Registra tu restaurante</a></li>
            <li><a href="#">Hazte repartidor</a></li>
            <li><a href="#">Trabaja con nosotros</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Enlaces de interés</h4>
          <ul>
            <li><a href="#">Inicio</a></li>
            <li><a href="#">Preguntas frecuentes</a></li>
            <li><a href="#">Términos y condiciones</a></li>
            <li><a href="#">Política de privacidad</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Síguenos</h4>
          <ul className="footer-social">
            <li><a href="#">Instagram</a></li>
            <li><a href="#">TikTok</a></li>
            <li><a href="#">Facebook</a></li>
          </ul>

          
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Devoraya. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
