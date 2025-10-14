import { useState } from "react"
import PhoneSVG from "../../assets/phone.svg"
import "./HeroSection.css"

export default function HeroSection() {
  const [address, setAddress] = useState("")

  return (
    <section className="hero">
      <div className="hero-phone">
        <img src={PhoneSVG} alt="App preview" />
      </div>
      <div className="hero-content">
        <h1 className="hero-title">
          Comida a domicilio <br /> y mucho más
        </h1>
        <p className="hero-subtitle">Restaurantes y pronto mucho más…</p>
        <div className="hero-input">
          <span className="hero-icon">📍</span>
          <input
            type="text"
            placeholder="¿Cuál es tu dirección?"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </div>
      <div className="hero-wave">
        <svg viewBox="0 0 500 150" preserveAspectRatio="none">
          <path d="M0.00,49.98 C150.00,150.00 349.97,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z"></path>
        </svg>
      </div>
    </section>
  )
}
