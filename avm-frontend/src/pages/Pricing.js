import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; }

  :root {
    --primary: #2B2B2B;
    --accent-copper: #B87333;
    --gray-light: #D4D4D4;
    --gray-medium: #B3B3B3;
    --bg-off-white: #FAFAFA;
  }

  .mat-icon {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 1.25rem;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    -webkit-font-smoothing: antialiased;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    user-select: none;
  }
  .mat-icon.fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .mat-icon.sm { font-size: 1rem; }
  .mat-icon.xs { font-size: 0.75rem; }
  .mat-icon.lg { font-size: 1.5rem; }

  .container { max-width: 80rem; margin: 0 auto; padding: 0 1.5rem; }
  .container-sm { max-width: 64rem; margin: 0 auto; padding: 0 1.5rem; }

  input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: var(--gray-light);
    outline: none;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--accent-copper);
    cursor: pointer;
    border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(184,115,51,0.4);
  }
`;

function Icon({ name, fill = false, size = "", style = {}, className = "" }) {
  const sz = size === "sm" ? " sm" : size === "xs" ? " xs" : size === "lg" ? " lg" : "";
  return (
    <span className={`mat-icon${fill ? " fill" : ""}${sz}${className ? " " + className : ""}`} style={style}>
      {name}
    </span>
  );
}

/* ── HEADER ── */
function Header() {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50, width: "100%",
      borderBottom: "1px solid rgba(212,212,212,0.3)",
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(12px)",
    }}>
      <div className="container" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "var(--primary)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="architecture" size="sm" style={{ color: "#fff" }} />
          </div>
          <span style={{ fontSize: "1rem", fontWeight: 800, letterSpacing: "0.05em", color: "var(--primary)", textTransform: "uppercase" }}>ACQAR</span>
        </div>
        <nav style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {[["PRODUCTS","#"],["PRICING","#"],["RESOURCES","#"],["ABOUT","#"]].map(([label, href]) => (
            <a key={label} href={href} style={{
              fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em",
              color: label === "PRICING" ? "var(--accent-copper)" : "var(--primary)",
              textDecoration: "none", textTransform: "uppercase",
              borderBottom: label === "PRICING" ? "2px solid var(--accent-copper)" : "2px solid transparent",
              paddingBottom: 2
            }}>{label}</a>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button style={{ fontSize: "0.75rem", fontWeight: 700, background: "none", border: "none", cursor: "pointer", color: "var(--primary)", letterSpacing: "0.08em", textTransform: "uppercase" }}>SIGN IN</button>
          <button style={{
            background: "var(--accent-copper)", color: "#fff",
            padding: "9px 20px", borderRadius: 8, fontSize: "0.75rem",
            fontWeight: 700, border: "none", cursor: "pointer", letterSpacing: "0.08em", textTransform: "uppercase"
          }}>GET STARTED</button>
        </div>
      </div>
    </header>
  );
}

/* ── HERO ── */
function PricingHero() {
  return (
    <section style={{ paddingTop: 64, paddingBottom: 80, textAlign: "center", background: "#fff" }}>
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "4px 14px", background: "rgba(43,43,43,0.08)",
        borderRadius: 9999, marginBottom: 28
      }}>
        <span style={{ fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--primary)" }}>TRUVALUTM PRODUCT SUITE</span>
      </div>
      <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: 900, color: "var(--primary)", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 20 }}>
        Choose Your<br />Intelligence Level
      </h1>
      <p style={{ fontSize: "1rem", color: "rgba(43,43,43,0.55)", maxWidth: 420, margin: "0 auto", lineHeight: 1.7 }}>
        From free instant estimates to bank-grade certifications — every tier built on the same AI foundation.
      </p>
    </section>
  );
}

/* ── PRICING CARDS ── */
function PricingCards() {
  const [billingCycle, setBillingCycle] = useState("annual");

  const cards = [
    {
      id: "valucheck",
      badge: "ONLY CUSTOMERS OFFER",
      icon: "⚡",
      name: "VALUCHECK™",
      tagline: "Perfect for exploration & basic investors.",
      price: "FREE",
      priceNote: "/mo",
      subNote: "No credit card",
      features: [
        "Basic range estimate",
        "View 3 property details",
        "Percent similar sales",
        "Price movement visual",
        "Instant online access",
      ],
      cta: "START FREE",
      ctaSecondary: "NO COMMITMENT",
      featured: false,
      dark: false,
    },
    {
      id: "deallens",
      icon: "🔍",
      name: "DEALLENS™",
      tagline: "Pre-purchase analysis for serious acquiring investors.",
      price: "149",
      priceNote: "AED",
      priceLabel: "ONE-TIME PAYMENT",
      features: [
        "Everything in ValuCheck, plus:",
        "Precise market value",
        "Deep market analysis",
        "Objective buy/pass rating",
        "5-year price predictions",
      ],
      cta: "REQUEST DEALLENS™ REPORT",
      featured: false,
      dark: false,
    },
    {
      id: "investiq",
      badge: "✦ MOST POPULAR",
      icon: "📊",
      name: "INVESTIQ™",
      tagline: "Unlimited intelligence for all active & ongoing investors.",
      price: "99",
      priceNote: "AED",
      priceLabel: "SUBSCRIPTION / MONTH",
      strikePrice: "149",
      tag: "Unbeatable",
      features: [
        "Everything in DealLens",
        "Unlimited valuations",
        "Track all properties",
        "Field reports + alerts",
      ],
      cta: "SUBSCRIBE TO INVESTIQ™",
      featured: true,
      dark: false,
    },
    {
      id: "certifi",
      icon: "🏆",
      name: "CERTIFI™",
      tagline: "With approved official valuation",
      price: "2,999",
      priceNote: "AED",
      priceLabel: "PER VALUATION",
      features: [
        "Official certificate",
        "Physical inspection",
        "48-hr delivery",
      ],
      cta: "REQUEST CERTIFI™",
      ctaSecondary: "CALL TO INQUIRE",
      featured: false,
      dark: false,
    },
  ];

  return (
    <section style={{ padding: "0 0 80px", background: "#fff" }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.1fr 1fr", gap: 16, alignItems: "start" }}>
          {cards.map((card) => (
            <div key={card.id} style={{
              borderRadius: 16,
              border: card.featured ? "2px solid var(--accent-copper)" : "1px solid rgba(212,212,212,0.5)",
              background: card.featured ? "#fff" : "#fff",
              padding: card.featured ? "28px 24px" : "24px 20px",
              position: "relative",
              boxShadow: card.featured ? "0 8px 40px rgba(184,115,51,0.18)" : "0 2px 12px rgba(0,0,0,0.04)",
              marginTop: card.featured ? -8 : 0,
            }}>
              {/* Badge */}
              {card.badge && (
                <div style={{
                  position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                  background: card.featured ? "var(--accent-copper)" : "var(--primary)",
                  color: "#fff", padding: "4px 14px", borderRadius: 9999,
                  fontSize: "0.55rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em",
                  whiteSpace: "nowrap"
                }}>{card.badge}</div>
              )}

              {/* Icon + Name */}
              <div style={{ marginBottom: 6 }}>
                {card.id === "valucheck" && (
                  <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "var(--accent-copper)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>⚡ VALUCHECK™</span>
                )}
                {card.id === "deallens" && (
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--primary)", display: "block", marginBottom: 4 }}>🔍 DEALLENS™</span>
                )}
                {card.id === "investiq" && (
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--primary)", display: "block", marginBottom: 4 }}>📊 INVESTIQ™</span>
                )}
                {card.id === "certifi" && (
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--primary)", display: "block", marginBottom: 4 }}>🏆 CERTIFI™</span>
                )}
                <p style={{ fontSize: "0.7rem", color: "rgba(43,43,43,0.55)", lineHeight: 1.5 }}>{card.tagline}</p>
              </div>

              {/* Price */}
              <div style={{ margin: "16px 0 20px" }}>
                {card.priceLabel && (
                  <p style={{ fontSize: "0.55rem", fontWeight: 700, color: "rgba(43,43,43,0.4)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>{card.priceLabel}</p>
                )}
                {card.badge && card.id === "valucheck" && (
                  <p style={{ fontSize: "0.55rem", fontWeight: 700, color: "rgba(43,43,43,0.4)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>ONLY CUSTOMERS OFFER</p>
                )}
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  {card.price === "FREE" ? (
                    <span style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.03em" }}>FREE</span>
                  ) : (
                    <>
                      {card.strikePrice && (
                        <span style={{ fontSize: "0.875rem", color: "rgba(43,43,43,0.35)", textDecoration: "line-through", fontWeight: 600, marginRight: 4 }}>AED {card.strikePrice}</span>
                      )}
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: card.featured ? "var(--accent-copper)" : "var(--primary)" }}>AED</span>
                      <span style={{ fontSize: card.featured ? "2.2rem" : "2rem", fontWeight: 900, color: card.featured ? "var(--accent-copper)" : "var(--primary)", letterSpacing: "-0.03em" }}>{card.price}</span>
                    </>
                  )}
                  {card.priceNote && card.price === "FREE" && (
                    <span style={{ fontSize: "0.75rem", color: "rgba(43,43,43,0.4)" }}>/mo</span>
                  )}
                </div>
                {card.tag && (
                  <span style={{ display: "inline-block", background: "rgba(184,115,51,0.12)", color: "var(--accent-copper)", padding: "2px 8px", borderRadius: 4, fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{card.tag}</span>
                )}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(212,212,212,0.4)", marginBottom: 16 }} />

              {/* Features */}
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {card.features.map((f, i) => (
                  <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <Icon name="check" size="xs" style={{ color: card.featured ? "var(--accent-copper)" : "var(--primary)", marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: "0.72rem", color: "rgba(43,43,43,0.75)", lineHeight: 1.4, fontWeight: i === 0 && card.id !== "valucheck" ? 600 : 400 }}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button style={{
                width: "100%", padding: card.featured ? "13px 16px" : "11px 16px",
                borderRadius: 8, fontSize: "0.65rem", fontWeight: 800,
                textTransform: "uppercase", letterSpacing: "0.08em",
                cursor: "pointer", transition: "all 0.2s",
                background: card.featured ? "var(--accent-copper)" : (card.id === "valucheck" ? "var(--primary)" : "transparent"),
                color: card.featured ? "#fff" : (card.id === "valucheck" ? "#fff" : "var(--primary)"),
                border: card.featured ? "none" : (card.id === "valucheck" ? "none" : "1.5px solid var(--gray-light)"),
              }}>{card.cta}</button>

              {card.ctaSecondary && (
                <p style={{ textAlign: "center", marginTop: 8, fontSize: "0.6rem", color: "rgba(43,43,43,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>{card.ctaSecondary}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── COMPARE ALL FEATURES ── */
function CompareFeatures() {
  const [activeTab, setActiveTab] = useState("all");

  const rows = [
    { label: "Valuation accuracy", valucheck: "±10% Range", deallens: "±5% Precise", investiq: "Real-time", certifi: "Certified" },
    { label: "Number of comparables", valucheck: "3", deallens: "15+", investiq: "Unlimited", certifi: "Official Selection" },
    { label: "Report format", valucheck: "Web view", deallens: "Digital PDF", investiq: "Interactive + PDF", certifi: "Stamped Certificate" },
    { label: "Investment Score", valucheck: false, deallens: false, investiq: true, certifi: false },
    { label: "Delivery time", valucheck: "Instant", deallens: "Instant", investiq: "Instant", certifi: "48 hours" },
  ];

  const tiers = [
    { key: "valucheck", label: "VALUCHECK™", sub: "FREE" },
    { key: "deallens", label: "DEALLENS™", sub: "AED 149" },
    { key: "investiq", label: "INVESTIQ™", sub: "AED 99 /mo", featured: true },
    { key: "certifi", label: "CERTIFI™", sub: "AED 2,999" },
  ];

  return (
    <section style={{ padding: "80px 0", background: "var(--bg-off-white)", borderTop: "1px solid rgba(212,212,212,0.3)" }}>
      <div className="container-sm">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--accent-copper)", marginBottom: 10 }}>PRICING COMPARISON</p>
          <h2 style={{ fontSize: "2.25rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.02em", marginBottom: 12 }}>COMPARE ALL FEATURES</h2>
          <p style={{ fontSize: "0.875rem", color: "rgba(43,43,43,0.5)" }}>See exactly what's included in each tier</p>
        </div>

        {/* Tab toggle */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
          <button
            onClick={() => setActiveTab("key")}
            style={{
              padding: "8px 20px", borderRadius: 6, fontSize: "0.65rem", fontWeight: 800,
              textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
              background: activeTab === "key" ? "var(--primary)" : "transparent",
              color: activeTab === "key" ? "#fff" : "var(--primary)",
              border: activeTab === "key" ? "none" : "1.5px solid var(--gray-light)",
            }}>SHOW KEY FEATURES ONLY</button>
          <button
            onClick={() => setActiveTab("all")}
            style={{
              padding: "8px 20px", borderRadius: 6, fontSize: "0.65rem", fontWeight: 800,
              textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
              background: activeTab === "all" ? "var(--accent-copper)" : "transparent",
              color: activeTab === "all" ? "#fff" : "var(--primary)",
              border: activeTab === "all" ? "none" : "1.5px solid var(--gray-light)",
            }}>SHOW ALL FEATURES</button>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid rgba(212,212,212,0.4)", overflow: "hidden" }}>
          {/* Column headers */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.1fr 1fr", borderBottom: "1px solid rgba(212,212,212,0.4)" }}>
            <div style={{ padding: "16px 20px", background: "#fff" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(43,43,43,0.4)" }}>FEATURE SET</span>
            </div>
            {tiers.map(t => (
              <div key={t.key} style={{
                padding: "14px 12px", textAlign: "center",
                background: t.featured ? "var(--accent-copper)" : "#fff",
                borderLeft: "1px solid rgba(212,212,212,0.4)"
              }}>
                <p style={{ fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: t.featured ? "#fff" : "var(--primary)", marginBottom: 2 }}>{t.label}</p>
                <p style={{ fontSize: "0.6rem", fontWeight: 600, color: t.featured ? "rgba(255,255,255,0.8)" : "rgba(43,43,43,0.45)" }}>{t.sub}</p>
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((row, i) => (
            <div key={row.label} style={{
              display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.1fr 1fr",
              borderBottom: i < rows.length - 1 ? "1px solid rgba(212,212,212,0.25)" : "none",
              background: i % 2 === 0 ? "#fff" : "rgba(250,250,250,0.8)"
            }}>
              <div style={{ padding: "14px 20px", display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--primary)" }}>{row.label}</span>
              </div>
              {["valucheck","deallens","investiq","certifi"].map(key => (
                <div key={key} style={{ padding: "14px 12px", textAlign: "center", borderLeft: "1px solid rgba(212,212,212,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {row[key] === true ? (
                    <Icon name="check" size="sm" style={{ color: "var(--accent-copper)" }} />
                  ) : row[key] === false ? (
                    <span style={{ color: "rgba(212,212,212,0.8)", fontSize: "1rem" }}>—</span>
                  ) : (
                    <span style={{ fontSize: "0.7rem", color: "rgba(43,43,43,0.7)", fontWeight: 500 }}>{row[key]}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── SAVINGS CALCULATOR ── */
function SavingsCalculator() {
  const [value, setValue] = useState(5000000);

  const traditionalCost = Math.round(value * 0.0007);
  const acqarCost = 149;
  const savings = traditionalCost - acqarCost;
  const savingsPct = Math.round((savings / traditionalCost) * 100);
  const daysTraditional = 13;

  const formatAED = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(0) + "K";
    return num.toString();
  };

  return (
    <section style={{ padding: "96px 0", background: "#fff" }}>
      <div className="container-sm">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.03em", textTransform: "uppercase", marginBottom: 12 }}>SEE HOW MUCH YOU'LL SAVE</h2>
          <p style={{ fontSize: "0.875rem", color: "rgba(43,43,43,0.5)" }}>Compare ACQAR to traditional valuation services</p>
        </div>

        <div style={{ background: "#fff", border: "1px solid rgba(212,212,212,0.4)", borderRadius: 20, padding: 40, boxShadow: "0 4px 30px rgba(0,0,0,0.05)" }}>
          {/* Slider */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(43,43,43,0.45)" }}>PROPERTY VALUE (AED)</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "var(--primary)" }}>{formatAED(value)}</span>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ height: 4, background: "var(--gray-light)", borderRadius: 2, marginBottom: 4 }}>
                <div style={{ height: "100%", width: `${((value - 500000) / (20000000 - 500000)) * 100}%`, background: "var(--accent-copper)", borderRadius: 2 }} />
              </div>
              <input type="range" min={500000} max={20000000} step={100000} value={value}
                onChange={e => setValue(Number(e.target.value))}
                style={{ position: "absolute", top: -6, left: 0, width: "100%", opacity: 0, cursor: "pointer", height: 16 }}
              />
              {/* Thumb visual */}
              <div style={{
                position: "absolute", top: -8, left: `calc(${((value - 500000) / (20000000 - 500000)) * 100}% - 10px)`,
                width: 20, height: 20, borderRadius: "50%", background: "var(--accent-copper)",
                border: "3px solid #fff", boxShadow: "0 2px 8px rgba(184,115,51,0.4)", pointerEvents: "none"
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
              <span style={{ fontSize: "0.6rem", color: "rgba(43,43,43,0.35)", fontWeight: 600 }}>500K</span>
              <span style={{ fontSize: "0.6rem", color: "rgba(43,43,43,0.35)", fontWeight: 600 }}>20M</span>
            </div>
          </div>

          {/* Comparison cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
            {/* Traditional */}
            <div style={{ padding: 24, background: "var(--bg-off-white)", borderRadius: 12, border: "1px solid rgba(212,212,212,0.4)" }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(43,43,43,0.4)", marginBottom: 10 }}>TRADITIONAL VALUER</p>
              <p style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>AED {traditionalCost.toLocaleString()}*</p>
              <p style={{ fontSize: "0.6rem", color: "rgba(43,43,43,0.4)", marginBottom: 16 }}>Price estimate</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["3–5 days turnaround","Manual process","No repeat updates"].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="close" size="xs" style={{ color: "rgba(43,43,43,0.3)" }} />
                    <span style={{ fontSize: "0.68rem", color: "rgba(43,43,43,0.5)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ACQAR */}
            <div style={{ padding: 24, background: "rgba(184,115,51,0.04)", borderRadius: 12, border: "1.5px solid rgba(184,115,51,0.3)" }}>
              <p style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--accent-copper)", marginBottom: 10 }}>ACQAR DEALLENS™</p>
              <p style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--accent-copper)", letterSpacing: "-0.02em", marginBottom: 4 }}>AED 149</p>
              <p style={{ fontSize: "0.6rem", color: "rgba(43,43,43,0.4)", marginBottom: 16 }}>fixed, flat</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Icon name="bolt" size="xs" style={{ color: "var(--accent-copper)" }} />
                <span style={{ fontSize: "0.68rem", color: "var(--primary)", fontWeight: 600 }}>60 seconds</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Real-time data","Investment Score","15+ comparables"].map(item => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Icon name="check" size="xs" style={{ color: "var(--accent-copper)" }} />
                    <span style={{ fontSize: "0.68rem", color: "rgba(43,43,43,0.7)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Savings Banner */}
          <div style={{
            background: "var(--primary)", borderRadius: 12, padding: "18px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 16
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, background: "var(--accent-copper)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="savings" size="xs" style={{ color: "#fff" }} />
              </div>
              <p style={{ fontSize: "0.75rem", color: "#fff", fontWeight: 600 }}>
                AI-powered savings: Save AED {savings.toLocaleString()} ({savingsPct}%) and {daysTraditional}+ days*
              </p>
            </div>
            <button style={{
              background: "var(--accent-copper)", color: "#fff",
              padding: "10px 20px", borderRadius: 8, fontSize: "0.65rem",
              fontWeight: 800, border: "none", cursor: "pointer",
              textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap"
            }}>START SAVING NOW</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ── */
function FAQ() {
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      q: "How accurate is the TruValu™ AI?",
      a: "Our AI achieves ±5% precision on DealLens™ reports and ±3% on InvestIQ™, validated against thousands of actual Dubai transaction prices. For the free ValuCheck™, accuracy is ±10% — still highly useful for exploration."
    },
    {
      q: "Can I use ACQAR reports for bank mortgages?",
      a: "Yes — our CertiFi™ tier provides RICS-aligned stamped valuations accepted by major UAE banks. DealLens™ and InvestIQ™ reports are for personal investment decisions and are not bank-grade by default."
    },
  ];

  return (
    <section style={{ padding: "80px 0", background: "#fff", borderTop: "1px solid rgba(212,212,212,0.2)" }}>
      <div className="container-sm">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "2rem", fontWeight: 900, color: "var(--primary)", letterSpacing: "-0.02em", textTransform: "uppercase" }}>QUESTIONS & TRANSPARENCY</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              border: "1px solid rgba(212,212,212,0.5)", borderRadius: 12,
              background: "#fff", overflow: "hidden"
            }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%", padding: "20px 24px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  background: "none", border: "none", cursor: "pointer", gap: 16
                }}
              >
                <span style={{ fontSize: "0.925rem", fontWeight: 600, color: "var(--primary)", textAlign: "left" }}>{faq.q}</span>
                <Icon name={open === i ? "remove" : "add"} size="sm" style={{ color: "var(--primary)", flexShrink: 0 }} />
              </button>
              {open === i && (
                <div style={{ padding: "0 24px 20px" }}>
                  <p style={{ fontSize: "0.85rem", color: "rgba(43,43,43,0.65)", lineHeight: 1.7 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FINAL CTA ── */
function FinalCTA() {
  return (
    <section style={{ padding: "96px 0", background: "var(--bg-off-white)", borderTop: "1px solid rgba(212,212,212,0.2)" }}>
      <div style={{ textAlign: "center", maxWidth: 480, margin: "0 auto", padding: "0 1.5rem" }}>
        <h2 style={{ fontSize: "2.5rem", fontWeight: 900, color: "var(--primary)", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: 16 }}>
          Ready to Make Confident Investments?
        </h2>
        <p style={{ fontSize: "0.875rem", color: "rgba(43,43,43,0.55)", marginBottom: 36, lineHeight: 1.7 }}>
          Join 10,000+ property owners who trust ACQAR for investment intelligence
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          <button style={{
            padding: "13px 24px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.08em",
            background: "#fff", color: "var(--primary)", border: "1.5px solid var(--gray-light)",
            cursor: "pointer"
          }}>Start Free with ValuCheck™</button>
          <button style={{
            padding: "13px 24px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 800,
            textTransform: "uppercase", letterSpacing: "0.08em",
            background: "var(--accent-copper)", color: "#fff", border: "none",
            cursor: "pointer"
          }}>Get DealLens™ for AED 149</button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
          {["✦ RESULTS IN 60 SEC","✦ SECURE","✦ NO COMMITMENT REQUIRED"].map(item => (
            <span key={item} style={{ fontSize: "0.55rem", fontWeight: 800, color: "rgba(43,43,43,0.35)", textTransform: "uppercase", letterSpacing: "0.12em" }}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── FOOTER ── */
function Footer() {
  const platform = ["TruValu™ Products", "Market Reports"];
  const company = ["About", "Contact"];
  const legal = ["Privacy", "Terms"];

  return (
    <footer style={{ background: "var(--primary)", paddingTop: 60, paddingBottom: 32 }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 24, height: 24, background: "rgba(255,255,255,0.15)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="architecture" size="xs" style={{ color: "#fff" }} />
              </div>
              <span style={{ fontSize: "0.875rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: "#fff" }}>ACQAR</span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 260 }}>
              Powered by proprietary AI trained on thousands of Dubai transactions. Institutional-grade intelligence, accessible to everyone.
            </p>
            <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
              {["public","alternate_email"].map(icon => (
                <div key={icon} style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Icon name={icon} size="xs" style={{ color: "rgba(255,255,255,0.5)" }} />
                </div>
              ))}
            </div>
          </div>
          {[["PLATFORM", platform], ["COMPANY", company], ["LEGAL", legal]].map(([title, items]) => (
            <div key={title}>
              <h6 style={{ fontWeight: 800, fontSize: "0.6rem", marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.5)" }}>{title}</h6>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {items.map(item => (
                  <li key={item} style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", cursor: "pointer" }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>© 2025 ACQARLABS L.L.C-FZ. All rights reserved.</p>
          <div style={{ display: "flex", gap: 24 }}>
            {["DLD COMPLIANT","RICS-ALIGNED","DIFC BASED"].map(item => (
              <span key={item} style={{ fontSize: "0.55rem", color: "rgba(255,255,255,0.25)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ── PRICING PAGE ── */
export default function Pricing() {
  return (
    <>
      <style>{styles}</style>
      <div style={{ background: "#fff", color: "var(--primary)", fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>
        <Header />
        <PricingHero />
        <PricingCards />
        <CompareFeatures />
        <SavingsCalculator />
        <FAQ />
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
}
