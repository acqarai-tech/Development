// import React from "react";
// import { useNavigate } from "react-router-dom";
// import NavBar from "../components/NavBar";
// import "../styles/home.css";

// export default function Home() {
//   const navigate = useNavigate();

//   return (
//     <div className="homeBg">
//       <NavBar />

//       <section className="heroSection">
//         <div className="heroInner">
//           <div className="heroBadge">
//             ✨ Powered by XGBoost & Gradient Boosting ML
//           </div>

//           <h1 className="heroTitle">
//             TruValu — AI Property <span className="heroAccent">Valuation</span>
//           </h1>

//           <p className="heroSub">
//             Get RICS-compliant property valuations using advanced machine learning.
//             Accurate estimates, market comparisons, and downloadable certificates.
//           </p>

//           <button className="heroCTA" onClick={() => navigate("/valuation")}>
//             Start Property Valuation →
//           </button>

//           <div className="heroChips">
//             <div className="chip">RICS Compliant</div>
//             <div className="chip">ML-Powered AVM</div>
//             <div className="chip">Real-Time Data</div>
//           </div>
//         </div>
//       </section>

//       <section id="features" className="sectionBlock">
//         <h2>Features</h2>
//         <div className="cardsRow">
//           <div className="infoCard">
//             <div className="infoTitle">Instant Valuation</div>
//             <div className="infoText">Predict price per m² and total value in seconds.</div>
//           </div>
//           <div className="infoCard">
//             <div className="infoTitle">Comparables</div>
//             <div className="infoText">See similar transactions used as market references.</div>
//           </div>
//           <div className="infoCard">
//             <div className="infoTitle">Charts</div>
//             <div className="infoText">Distribution + monthly market trend for your area.</div>
//           </div>
//         </div>
//       </section>

//       <section id="about" className="sectionBlock">
//         <h2>About</h2>
//         <p className="aboutText">
//           TruValu provides AI-driven property valuation reports for websites and valuation workflows.
//         </p>
//       </section>

//       <footer className="footer">
//         © {new Date().getFullYear()} TruValu
//       </footer>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

export default function Home() {
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("acqar_theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("acqar_theme", next ? "dark" : "light");
  };

  // ✅ All CTAs go to /valuation
  const goToValuation = (e) => {
    if (e) e.preventDefault();
    navigate("/valuation");
  };

  return (
    <div className="acqar-page">
      {/* NAV */}
      <nav className="acqar-nav glass-panel">
        <div className="container nav-inner">
          <div className="nav-left">
            <a className="brand" href="#top" aria-label="ACQAR Home">
              <div className="brand-logo">A</div>
              <span className="brand-name">ACQAR</span>
            </a>

            <div className="nav-links">
              <a href="#products">Products</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#roadmap">Roadmap</a>
              <a href="#faq">FAQ</a>
            </div>
          </div>

          <div className="nav-right">
            <button
              className="icon-btn"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              type="button"
            >
              <span className="material-symbols-outlined">contrast</span>
            </button>

            {/* ✅ now routes to /valuation */}
            <button className="nav-login" onClick={goToValuation} type="button">
              Log In
            </button>

            {/* ✅ now routes to /valuation */}
            <button className="pill-btn" onClick={goToValuation} type="button">
              Request Access
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero hero-gradient" id="top">
        <div className="container hero-grid">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="pulse-dot" />
              <span>Dubai's #1 AI Valuation Engine</span>
            </div>

            <h1 className="hero-title">
              See The Future.
              <br />
              <span className="hero-accent">
                Invest With
                <br />
                Certainty.
              </span>
            </h1>

            <p className="hero-sub">
              Enterprise-grade property intelligence for modern investors.
              Institutional accuracy, real-time data, and instant transparency.
            </p>

            <div className="hero-cta">
              {/* ✅ now routes to /valuation */}
              <button className="btn-primary" onClick={goToValuation} type="button">
                Get Started Free
              </button>

              <div className="hero-trust">
                <div className="avatar-stack" aria-hidden="true">
                  <img
                    alt="User"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeKg4ldMezdDMYJIBXo1hAsnQNReoUuj6XKzB-3qdlOIWZFR2SDorMmALsrwNiefW8ipCj91wsOLZhjMGngvJetTUeioJQXq8fBYLsI3EL8Jdi_4oJKXIBf6Wcrwg9EsY5QvdI-TgSbgYrwKYJKF8cKkKkeUjls1iGh3ZJyu_Nn_Whih6l319snibKFvREF79K0HKNpH1Gxr0znszAKvtGismZlcmspWhFMKabZDLvKkQR74WVGL3RVqWER_egQP7uY6cpAgMvlNDt"
                  />
                  <img
                    alt="User"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuNAJioajYhg0bmTUkwnFn5HLicp9LY8ciaiiHbhGTFQo8ResWnkHGIdfWLb2rOSgxN4lx963M94Fzfmz_ZWHeWTqXQRovd7CEs3kMiJOjhxl6ndQyYXqqgFGxxTL-ZV1aAx52CzbDZ4FryR8vc19NKfvUIgn3txeb2z-SWo-1_PLUr-Bx9v9zFxTxLORS9SUz39hKlEJKh29EDJJJo91cKzraYtpFSrc8A8PUvSDpivRbtv7-dpXrq4zwYM29uQ2UBak5TYn9Hzay"
                  />
                  <img
                    alt="User"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_RzxQmyA6btHxoIcaIZAQAEiE6eVDevfkPnH0UrKNHs0ky9uEi-gqkmbduI6sjIb7opBXc-gLcMcssj0RUmZW8B_xI2ikKUMLdq1qIVWsxLVtn3MjjuW7_NMwm0zF7blsFtpZhTJsqTr0wyhBoB0j4SRPxnsFUZnHIllgLws1U1MyZoSOihJlJQEubOJBQsG2h98b01y6kMlRxdE-5UyApYtgtOxnKEW3h_vVGgVNJHOTrr9Fw4s3OkQZ6qNxvVgJmYQd7diM7R1d"
                  />
                  <div className="avatar-more">10k+</div>
                </div>

                <p className="hero-trust-text">
                  Trusted by over <strong>10,000+</strong> institutional investors
                </p>
              </div>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-glow" />
            <div className="glass-panel report-card">
              <div className="report-head">
                <div className="report-title">
                  <div className="report-icon">
                    <span className="material-symbols-outlined">analytics</span>
                  </div>
                  <h4>TruValu™ Report</h4>
                </div>
                <span className="chip chip-live">Live Generation</span>
              </div>

              <div className="report-block">
                <p className="kicker">Estimated Market Value</p>
                <div className="value-row">
                  <p className="big-value">AED 4,250,000</p>
                  <span className="pos">+2.4% vs LTM</span>
                </div>
              </div>

              <div className="report-grid">
                <div className="mini-block">
                  <p className="kicker">TruScore™</p>
                  <div className="score-row">
                    <span className="score">87</span>
                    <div className="bar">
                      <div className="bar-fill" style={{ width: "87%" }} />
                    </div>
                  </div>
                </div>

                <div className="mini-block">
                  <p className="kicker">Confidence</p>
                  <p className="confidence">High</p>
                </div>
              </div>

              <div className="progress">
                <div className="progress-top">
                  <span>Scanning Transaction Database</span>
                  <span>100%</span>
                </div>
                <div className="progress-track">
                  <div className="shimmer" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* STATS */}
      <section className="stats">
        <div className="container stats-grid">
          <div className="stat">
            <p className="stat-num">10,000+</p>
            <p className="stat-label">Digital Valuations</p>
          </div>
          <div className="stat">
            <p className="stat-num">4.9/5</p>
            <p className="stat-label">User Rating</p>
          </div>
          <div className="stat">
            <p className="stat-num">AED 500M+</p>
            <p className="stat-label">Assets Analyzed</p>
          </div>
        </div>
      </section>

      {/* FREE VALUATION FORM */}
      <section className="section section-alt">
        <div className="container form-wrap">
          <div className="section-head">
            <h2>Get Your Free Property Valuation</h2>
            <p>Enter your property details for an instant AI-powered report.</p>
          </div>

          <div className="glass-panel form-card">
            {/* ✅ submit routes to /valuation */}
            <form onSubmit={goToValuation}>
              <div className="segmented">
                <button className="seg-btn seg-active" type="button">
                  Buy/Sell
                </button>
                <button className="seg-btn" type="button">
                  Rent
                </button>
              </div>

              <div className="grid-2">
                <div className="field">
                  <label>Community</label>
                  <select>
                    <option>Dubai Marina</option>
                    <option>Palm Jumeirah</option>
                    <option>Downtown Dubai</option>
                    <option>Jumeirah Village Circle</option>
                  </select>
                </div>

                <div className="field">
                  <label>Building / Project</label>
                  <input placeholder="e.g. Marina Gate 2" type="text" />
                </div>

                <div className="field">
                  <label>Unit Number</label>
                  <input placeholder="e.g. 1402" type="text" />
                </div>

                <div className="field">
                  <label>Features / Upgrades</label>
                  <div className="chips">
                    <label className="chip-check">
                      <input type="checkbox" /> Sea View
                    </label>
                    <label className="chip-check">
                      <input type="checkbox" /> Fully Furnished
                    </label>
                    <label className="chip-check">
                      <input type="checkbox" /> Upgraded Interior
                    </label>
                  </div>
                </div>
              </div>

              <button className="btn-primary btn-wide" type="submit">
                <span className="material-symbols-outlined">bolt</span>
                Generate Free Valuation
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" id="how-it-works">
        <div className="container">
          <h2 className="center-title">Simple. Swift. Sophisticated.</h2>

          <div className="steps">
            <div className="step">
              <div className="step-icon step-icon-blue">
                <span className="material-symbols-outlined">edit_note</span>
              </div>
              <h4>1. Enter Details</h4>
              <p>Provide basic unit information and unique property features.</p>
            </div>

            <div className="step">
              <div className="step-icon step-icon-indigo">
                <span className="material-symbols-outlined">neurology</span>
              </div>
              <h4>2. AI Analysis</h4>
              <p>Our neural networks scan millions of DLD data points instantly.</p>
            </div>

            <div className="step">
              <div className="step-icon step-icon-amber">
                <span className="material-symbols-outlined">military_tech</span>
              </div>
              <h4>
                3. Instant Valuation <span className="mini-star">★</span>
              </h4>
              <p>Receive a precise market estimate with high-confidence scoring.</p>
            </div>

            <div className="step">
              <div className="step-icon step-icon-emerald">
                <span className="material-symbols-outlined">description</span>
              </div>
              <h4>4. Actionable Report</h4>
              <p>Download a comprehensive PDF dossier for your records.</p>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="section section-alt" id="products">
        <div className="container">
          <div className="section-head center">
            <h2>TruValu™ Product Suite</h2>
            <p>Integrated tools designed for high-end market transparency and data accuracy.</p>
          </div>

          <div className="products">
            <div className="product-card">
              <div className="product-ico blue">
                <span className="material-symbols-outlined">fact_check</span>
              </div>
              <h3>ValuCheck™</h3>
              <p>Instant AI valuations with a confidence score and detailed historical transaction logs.</p>
              <button className="link-btn" onClick={goToValuation} type="button">
                Learn more <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            <div className="product-card">
              <div className="product-ico purple">
                <span className="material-symbols-outlined">center_focus_strong</span>
              </div>
              <h3>DealLens™</h3>
              <p>Compare units side-by-side with localized market metrics and rental yield projections.</p>
              <button className="link-btn" onClick={goToValuation} type="button">
                Learn more <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            <div className="product-card">
              <div className="product-ico green">
                <span className="material-symbols-outlined">query_stats</span>
              </div>
              <h3>InvestIQ™</h3>
              <p>Advanced portfolio analytics tracking ROI, capital gains, and real-time equity growth.</p>
              <button className="link-btn" onClick={goToValuation} type="button">
                Learn more <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>

            <div className="product-card">
              <div className="product-ico amber">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <h3>Certifi™</h3>
              <p>Official RICS-compliant certificates for financing, legal, or formal audit requirements.</p>
              <button className="link-btn" onClick={goToValuation} type="button">
                Learn more <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ (short) */}
      <section className="section section-alt" id="faq">
        <div className="container faq-grid">
          <div className="faq-left">
            <h2>Technical Questions?</h2>
            <p>
              Our infrastructure is designed for high-frequency institutional trading and asset management. Explore our
              technical FAQ.
            </p>

            <div className="faq-cta">
              <p>Need custom enterprise integration?</p>
              <button onClick={goToValuation} type="button">
                Speak with an Engineer
              </button>
            </div>
          </div>

          <div className="faq-right">
            <div className="faq-card glass-panel">
              <h4>How fresh is your data?</h4>
              <p>We sync with the Dubai Land Department (DLD) data frequently so valuations reflect latest activity.</p>
            </div>

            <div className="faq-card glass-panel">
              <h4>Is TruValu™ RICS compliant?</h4>
              <p>AI valuations are guidance. For bank-level compliance, Certifi™ supports RICS-signed workflows.</p>
            </div>

            <div className="faq-card glass-panel">
              <h4>Can I export reports to PDF?</h4>
              <p>Yes—premium plans allow white-labeled PDF exports with breakdown charts and benchmarks.</p>
            </div>

            <div className="faq-card glass-panel">
              <h4>What is the TruScore™?</h4>
              <p>A 0–100 metric estimating investability using liquidity, yield, and community demand signals.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container footer-top">
          <div className="footer-brand">
            <a className="brand" href="#top">
              <div className="brand-logo">A</div>
              <span className="brand-name">ACQAR</span>
            </a>
            <p>
              The intelligence layer for Dubai real estate. Empowering investors with real-time data, AI-driven
              valuations, and transaction transparency.
            </p>

            <div className="footer-icons">
              <button className="icon-link" onClick={goToValuation} type="button" aria-label="Website">
                <span className="material-symbols-outlined">public</span>
              </button>
              <button className="icon-link" onClick={goToValuation} type="button" aria-label="Share">
                <span className="material-symbols-outlined">share</span>
              </button>
            </div>
          </div>

          <div className="footer-col">
            <h4>Products</h4>
            <button className="footer-link" onClick={goToValuation} type="button">ValuCheck™</button>
            <button className="footer-link" onClick={goToValuation} type="button">DealLens™</button>
            <button className="footer-link" onClick={goToValuation} type="button">InvestIQ™</button>
            <button className="footer-link" onClick={goToValuation} type="button">Certifi™</button>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <button className="footer-link" onClick={goToValuation} type="button">About Us</button>
            <button className="footer-link" onClick={goToValuation} type="button">Case Studies</button>
            <button className="footer-link" onClick={goToValuation} type="button">Careers</button>
            <button className="footer-link" onClick={goToValuation} type="button">Contact</button>
          </div>

          <div className="footer-col">
            <h4>Trust & Legal</h4>
            <button className="footer-link" onClick={goToValuation} type="button">Privacy Policy</button>
            <button className="footer-link" onClick={goToValuation} type="button">Terms of Service</button>

            <div className="footer-badge">
              <span className="material-symbols-outlined">verified</span>
              <span>DLD Regulated</span>
            </div>
          </div>
        </div>

        <div className="container footer-bottom">
          <p>© 2024 ACQAR Technologies Inc. All rights reserved.</p>
          <div className="footer-meta">
            <span className="status">
              <span className="dot" /> System Status: Nominal
            </span>
            <span>Made with precision in Dubai, UAE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

