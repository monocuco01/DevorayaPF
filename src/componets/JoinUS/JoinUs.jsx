import React from "react";
import "./JoinUs.css";
import Restaurantes from "../../assets/Restaurantes.png";
import Repartidor from "../../assets/Repartidor2.png";


export default function JoinUs() {
  return (
    <section className="joinus">
      <div className="wave-bg"></div>

      <img src="https://glovoapp.com/_next/static/media/hands.1b6e6913.svg" alt="icono unión" className="joinus-icon" />

      <h2 className="joinus-title">Únete a Devoraya</h2>
      <p className="joinus-subtitle">
        Sé parte de nuestra comunidad y crece con nosotros 🚀
      </p>

      <div className="joinus-cards">
        <div className="joinus-card active">
          <div className="joinus-img">
            <img src={Restaurantes} alt="Partner Devoraya" />
          </div>
          <h3>Registra tu restaurante</h3>
          <p>
            Conecta tu negocio a Devoraya y llega a más clientes. Nuestra
            plataforma te ayuda a crecer y aumentar tus ventas.
          </p>
          <button className="joinus-btn">Regístrate aquí</button>
        </div>

        <div className="joinus-card coming">
          <div className="joinus-img">
            <img src={Repartidor} alt="Repartidor Devoraya" />
          </div>
          <h3>Hazte Repartidor</h3>
          <p>¡Muy pronto podrás unirte a nuestro equipo de repartidores!</p>
          <span className="coming-soon">Próximamente</span>
        </div>
      </div>
    </section>
  );
}
