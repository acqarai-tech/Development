import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

export default function NavBar() {
  const navigate = useNavigate();

  return (
    <div className="navWrap">
      <div className="navInner">
        <div className="navLeft">
          <div className="tvLogo">TV</div>
          <div>
            <div className="brandTitle">TruValu</div>
            <div className="brandSub">AI Property Valuation</div>
          </div>
        </div>

        <div className="navMid">
          <a href="#features">Features</a>
          <Link to="/valuation">Get Valuation</Link>
          <a href="#about">About</a>
        </div>

        <div className="navRight">
          <div className="pillCert">RICS Certified</div>
          <button className="btnPrimary" onClick={() => navigate("/valuation")}>
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
