import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="homeBg">
      <NavBar />

      <section className="heroSection">
        <div className="heroInner">
          <div className="heroBadge">
            ✨ Powered by XGBoost & Gradient Boosting ML
          </div>

          <h1 className="heroTitle">
            TruValu — AI Property <span className="heroAccent">Valuation</span>
          </h1>

          <p className="heroSub">
            Get RICS-compliant property valuations using advanced machine learning.
            Accurate estimates, market comparisons, and downloadable certificates.
          </p>

          <button className="heroCTA" onClick={() => navigate("/valuation")}>
            Start Property Valuation →
          </button>

          <div className="heroChips">
            <div className="chip">RICS Compliant</div>
            <div className="chip">ML-Powered AVM</div>
            <div className="chip">Real-Time Data</div>
          </div>
        </div>
      </section>

      <section id="features" className="sectionBlock">
        <h2>Features</h2>
        <div className="cardsRow">
          <div className="infoCard">
            <div className="infoTitle">Instant Valuation</div>
            <div className="infoText">Predict price per m² and total value in seconds.</div>
          </div>
          <div className="infoCard">
            <div className="infoTitle">Comparables</div>
            <div className="infoText">See similar transactions used as market references.</div>
          </div>
          <div className="infoCard">
            <div className="infoTitle">Charts</div>
            <div className="infoText">Distribution + monthly market trend for your area.</div>
          </div>
        </div>
      </section>

      <section id="about" className="sectionBlock">
        <h2>About</h2>
        <p className="aboutText">
          TruValu provides AI-driven property valuation reports for websites and valuation workflows.
        </p>
      </section>

      <footer className="footer">
        © {new Date().getFullYear()} TruValu
      </footer>
    </div>
  );
}
