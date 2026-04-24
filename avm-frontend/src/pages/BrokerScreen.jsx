// =============================================================================
// BrokerScreen.jsx
// Content: from AcqarBrokerLandingPage.jsx
// UI Design: from code.html (Tailwind-style, architectural, copper/zinc palette)
// =============================================================================

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
const C = {
  brand:         "#B87333",   // copper from HTML
  brandDark:     "#96591E",
  brandBg:       "#B8733312",
  brandBorder:   "#B8733340",
  bgCream:       "#F8F7F3",
  bgWhite:       "#FFFFFF",
  bgDark:        "#0F0E0C",
  bgDarkCard:    "#181714",
  bgDarkSurface: "#0A0906",
  textPrimary:   "#1A1B1E",
  textSecondary: "#6B6A66",
  textMuted:     "#9B9A96",
  borderLight:   "#E5E7EB",
  borderDark:    "#2C2A27",
  green:         "#16A34A",
  greenLight:    "#22C55E",
  greenBg:       "#F0FDF4",
  greenBorder:   "#BBF7D0",
  red:           "#DC2626",
  redLight:      "#EF4444",
  redBg:         "#FFF5F5",
  redBorder:     "#FECACA",
  amber:         "#F59E0B",
  zinc50:        "#FAFAFA",
  zinc100:       "#F4F4F5",
  zinc200:       "#E4E4E7",
  zinc400:       "#A1A1AA",
  zinc500:       "#71717A",
  zinc800:       "#27272A",
  zinc900:       "#18181B",
  zinc950:       "#09090B",
};

// ─── Animation Helpers ────────────────────────────────────────────────────────
const fadeUp = (delay = 0, distance = 28) => ({
  initial:     { opacity: 0, y: distance },
  whileInView: { opacity: 1, y: 0 },
  viewport:    { once: true, margin: "-60px" },
  transition:  { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
});

// ─── Global Styles ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;300;400;500;700;900&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #FFFFFF;
      color: #1A1B1E;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    /* Architectural dot-grid background */
    .architectural-lines {
      background-image: radial-gradient(#D4D4D4 0.5px, transparent 0.5px);
      background-size: 24px 24px;
    }

    /* Copper gradient text */
    .copper-gradient-text {
      background: linear-gradient(to right, #B87333, #D9A066);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Ticker */
    @keyframes ticker-scroll {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .ticker-track {
      display: inline-flex;
      align-items: center;
      animation: ticker-scroll 38s linear infinite;
      white-space: nowrap;
    }
    .ticker-track:hover { animation-play-state: paused; }

    /* Live dot */
    @keyframes live-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.55; transform: scale(1.35); }
    }
    .live-dot { animation: live-pulse 2s ease-in-out infinite; }

    /* Scrollbar hide */
    .no-scroll::-webkit-scrollbar { display: none; }
    .no-scroll { scrollbar-width: none; -ms-overflow-style: none; }

    /* Uppercase tracking */
    .label-caps {
      font-size: 0.6rem;
      font-weight: 900;
      letter-spacing: 0.4em;
      text-transform: uppercase;
    }

    /* Spin slow */
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    .spin-slow { animation: spin-slow 60s linear infinite; }

    @media (max-width: 640px) {
      .hide-mobile { display: none !important; }
      .stack-mobile { flex-direction: column !important; }
      .full-mobile  { width: 100% !important; }
    }
  `}</style>
);

// ─── ACQAR Logo ───────────────────────────────────────────────────────────────
const AcqarLogo = ({ dark = false }) => (
  <a href="https://www.acqar.com/" style={{ textDecoration: "none" }}>
    <span style={{
      fontFamily: "Inter, sans-serif",
      fontSize: "1.4rem",
      fontWeight: 900,
      letterSpacing: "-0.06em",
      lineHeight: 1,
      userSelect: "none",
    }}>
      <span style={{ color: C.brand }}>ACQAR</span>
      <span style={{ color: dark ? "#F4F4F5" : "#1A1B1E" }}> SIGNAL</span>
    </span>
  </a>
);

// ─── CTA Button ───────────────────────────────────────────────────────────────
const CTAButton = ({
  children,
  href = "https://www.acqar.com/register",
  variant = "primary",   // primary | outline | ghost | dark
  fullWidth = false,
  size = "md",
}) => {
  const [hovered, setHovered] = useState(false);

  const pad = {
    xl: "20px 48px",
    lg: "16px 40px",
    md: "12px 28px",
    sm: "8px 20px",
  }[size] || "12px 28px";

  const fz = {
    xl: "1rem",
    lg: "0.875rem",
    md: "0.78rem",
    sm: "0.72rem",
  }[size] || "0.78rem";

  const base = {
    display:         fullWidth ? "block" : "inline-block",
    textAlign:       "center",
    padding:         pad,
    fontSize:        fz,
    fontWeight:      900,
    fontFamily:      "Inter, sans-serif",
    letterSpacing:   "0.15em",
    textTransform:   "uppercase",
    textDecoration:  "none",
    cursor:          "pointer",
    transition:      "all 0.2s ease",
    width:           fullWidth ? "100%" : "auto",
    borderRadius:    "9999px",
  };

  const styles = {
    primary: {
      backgroundColor: hovered ? "#27272A" : "#1A1B1E",
      color:           "#ffffff",
      border:          "2px solid transparent",
    },
    copper: {
      backgroundColor: hovered ? "#96591E" : C.brand,
      color:           "#ffffff",
      border:          "2px solid transparent",
      boxShadow:       `0 4px 24px ${C.brand}33`,
    },
    outline: {
      backgroundColor: hovered ? "#1A1B1E" : "transparent",
      color:           hovered ? "#ffffff" : "#1A1B1E",
      border:          "2px solid #1A1B1E",
    },
    ghost: {
      backgroundColor: hovered ? C.brandBg : "transparent",
      color:           hovered ? C.brand : C.zinc500,
      border:          `1.5px solid ${hovered ? C.brand : C.borderLight}`,
    },
  };

  const s = styles[variant] || styles.primary;

  return (
    <motion.a
      href={href}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...base, ...s }}
    >
      {children}
    </motion.a>
  );
};

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <p className="label-caps" style={{
    color:         C.brand,
    marginBottom:  "0.75rem",
    display:       "block",
  }}>
    {children}
  </p>
);

// =============================================================================
// NAVBAR
// =============================================================================
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position:        "sticky",
      top:             0,
      width:           "100%",
      zIndex:          50,
      display:         "flex",
      justifyContent:  "space-between",
      alignItems:      "center",
      padding:         "20px clamp(1.25rem, 5vw, 2rem)",
      maxWidth:        "1920px",
      margin:          "0 auto",
      backgroundColor: scrolled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.85)",
      backdropFilter:  "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom:    `1px solid ${scrolled ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.06)"}`,
      boxShadow:       scrolled ? "0 1px 16px rgba(0,0,0,0.06)" : "none",
      transition:      "all 0.3s ease",
    }}>
      {/* Left: Logo */}
      <AcqarLogo />

      {/* Center nav links */}
      <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "40px" }}>
        {[
          { label: "Intelligence", active: true },
          { label: "Broker Connect", active: false },
          { label: "Pricing", active: false },
          { label: "About", active: false },
        ].map((item, i) => (
          <a key={i} href="#" style={{
            fontFamily:     "Inter, sans-serif",
            fontWeight:     item.active ? 900 : 700,
            fontSize:       "0.875rem",
            color:          item.active ? C.textPrimary : C.zinc500,
            textDecoration: "none",
            borderBottom:   item.active ? `2px solid ${C.brand}` : "2px solid transparent",
            paddingBottom:  "2px",
            transition:     "color 0.2s",
          }}>
            {item.label}
          </a>
        ))}
      </div>

      {/* Right: Login + CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <a href="https://www.acqar.com/login" style={{
          fontFamily:     "Inter, sans-serif",
          fontWeight:     900,
          fontSize:       "0.78rem",
          letterSpacing:  "0.1em",
          textTransform:  "uppercase",
          color:          C.zinc500,
          textDecoration: "none",
        }}
          className="hide-mobile"
        >
          LOGIN
        </a>
        <CTAButton href="https://www.acqar.com/register" variant="copper" size="sm">
          Get Signal Pro
        </CTAButton>
      </div>
    </nav>
  );
};

// =============================================================================
// TICKER (from JSX)
// =============================================================================
const TICKER_ITEMS = [
  { name: "Emaar Properties",  price: "4.82", chg: "-1.2%", neg: true  },
  { name: "Aldar Properties",  price: "2.14", chg: "+0.8%", neg: false },
  { name: "DAMAC Real Estate", price: "1.43", chg: "-0.4%", neg: true  },
  { name: "Deyaar Dev.",       price: "0.84", chg: "+2.1%", neg: false },
  { name: "Nakheel PJSC",      price: "3.20", chg: "+0.3%", neg: false },
  { name: "Union Properties",  price: "0.57", chg: "+1.4%", neg: false },
  { name: "Emaar Dev.",        price: "7.36", chg: "-0.9%", neg: true  },
  { name: "Dubai Islands",     price: "1.91", chg: "-0.7%", neg: true  },
  { name: "RAK Properties",    price: "1.12", chg: "+1.1%", neg: false },
];

const TerminalTicker = () => (
  <div style={{
    backgroundColor: C.bgDarkSurface,
    borderBottom:    `1px solid ${C.borderDark}`,
    padding:         "7px 0",
    overflow:        "hidden",
  }}>
    <div style={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
      <span style={{
        color:         C.brand,
        fontSize:      "0.58rem",
        fontWeight:    700,
        letterSpacing: "0.12em",
        fontFamily:    "Inter, monospace",
        padding:       "0 12px",
        borderRight:   `1px solid ${C.borderDark}`,
        marginRight:   "12px",
        whiteSpace:    "nowrap",
        flexShrink:    0,
      }}>DFM · ADX</span>
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} style={{
              display:    "inline-flex",
              alignItems: "center",
              gap:        "5px",
              marginRight:"28px",
              fontFamily: "Inter, monospace",
              fontSize:   "0.62rem",
            }}>
              <span style={{ color: "#8A8886" }}>{t.name}</span>
              <span style={{ color: "#D8D6D2", fontWeight: 500 }}>{t.price}</span>
              <span style={{ color: t.neg ? C.redLight : C.greenLight, fontWeight: 600 }}>
                {t.neg ? "▼" : "▲"} {t.chg}
              </span>
              <span style={{ color: C.borderDark, marginLeft: "6px" }}>·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// =============================================================================
// SECTION 1 — HERO  (HTML visual design + JSX content)
// =============================================================================
const HeroSection = () => (
  <section className="architectural-lines" style={{
    position:       "relative",
    minHeight:      "921px",
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    justifyContent: "center",
    padding:        "80px clamp(1.25rem, 5vw, 2rem) 60px",
    overflow:       "hidden",
  }}>
    {/* Gradient overlay */}
    <div style={{
      position:       "absolute",
      inset:          0,
      background:     "linear-gradient(to bottom, transparent, rgba(255,255,255,0.55), #ffffff)",
      pointerEvents:  "none",
    }} />

    <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "1152px", margin: "0 auto", width: "100%" }}>

      {/* Label */}
      <motion.span {...fadeUp(0)} className="label-caps" style={{
        color:         C.brand,
        marginBottom:  "2rem",
        display:       "block",
      }}>
        Verified Intelligence for the 1%
      </motion.span>

      {/* H1 — HTML typography style */}
      <motion.h1 {...fadeUp(0.08)} style={{
        fontFamily:    "Inter, sans-serif",
        fontSize:      "clamp(3rem, 9vw, 8rem)",
        fontWeight:    900,
        letterSpacing: "-0.04em",
        lineHeight:    0.88,
        color:         C.textPrimary,
        marginBottom:  "2.5rem",
      }}>
        The Broker Who{" "}
        <span className="copper-gradient-text">Sees First,</span>
        <br />Closes First.
      </motion.h1>

      {/* Subheadline */}
      <motion.p {...fadeUp(0.18)} style={{
        fontFamily:    "Inter, sans-serif",
        fontSize:      "clamp(1rem, 2.5vw, 1.5rem)",
        fontWeight:    500,
        color:         C.zinc500,
        maxWidth:      "48rem",
        margin:        "0 auto 3rem",
        lineHeight:    1.55,
      }}>
        Stop chasing yesterday's listings. Access live, RERA-verified market signals
        and architectural-grade data before the market reacts.
      </motion.p>

      {/* CTA row */}
      <motion.div {...fadeUp(0.26)} style={{
        display:        "flex",
        flexWrap:       "wrap",
        alignItems:     "center",
        justifyContent: "center",
        gap:            "24px",
        marginBottom:   "5rem",
      }}>
        <CTAButton href="https://www.acqar.com/register" variant="primary" size="lg">
          → Get Inside Free — 2 Minutes
        </CTAButton>
        {/* Stat aside */}
        <div style={{
          display:      "flex",
          flexDirection:"column",
          alignItems:   "flex-start",
          paddingLeft:  "16px",
          borderLeft:   `2px solid ${C.brand}`,
        }}>
          <span className="label-caps" style={{ color: C.zinc400 }}>Total Capital Analyzed</span>
          <span style={{ fontFamily: "Inter", fontWeight: 900, fontSize: "1.25rem", color: C.textPrimary }}>AED 409M+</span>
        </div>
      </motion.div>

      {/* Trust bar — HTML grid style */}
      <motion.div {...fadeUp(0.34)} style={{
        display:         "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap:             "32px",
        padding:         "40px 0",
        borderTop:       `1px solid ${C.borderLight}`,
        borderBottom:    `1px solid ${C.borderLight}`,
        maxWidth:        "56rem",
        margin:          "0 auto",
      }}>
        {[
          { top: "Source",    bottom: "RERA VERIFIED"      },
          { top: "Live Data", bottom: "14-SOURCE FEED"     },
          { top: "Community", bottom: "10,000+ BROKERS"    },
          { top: "Coverage",  bottom: "AED 409M+ ANALYZED" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span className="label-caps" style={{ color: C.zinc400, marginBottom: "8px" }}>{item.top}</span>
            <span style={{ fontFamily: "Inter", fontWeight: 900, fontSize: "0.875rem", color: C.textPrimary }}>{item.bottom}</span>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

// =============================================================================
// SECTION 2 — THE HOOK
// =============================================================================
const HookSection = () => (
  <section style={{ backgroundColor: C.bgCream, padding: "100px clamp(1.25rem, 4vw, 2rem)" }}>
    <div style={{ maxWidth: "820px", margin: "0 auto" }}>

      <motion.div {...fadeUp(0)}>
        <SectionLabel>THE MOMENT</SectionLabel>
      </motion.div>

      <motion.h2 {...fadeUp(0.08)} style={{
        fontFamily:    "Inter, sans-serif",
        fontSize:      "clamp(1.9rem, 4.5vw, 3.1rem)",
        fontWeight:    900,
        letterSpacing: "-0.03em",
        color:         C.textPrimary,
        lineHeight:    1.1,
        marginBottom:  "2.75rem",
      }}>
        Every Dubai Broker Just Experienced The
        Same Defining Moment.
      </motion.h2>

      {[
        "Six weeks of near-total market paralysis. DFM down 30%. Property viewings collapsed. Developers pausing. Buyers waiting.",
        "And in that silence — a very small number of brokers did something different.",
        "They did not wait for the market to 'get clearer'. They used intelligence. And that intelligence is now converting.",
      ].map((para, i) => (
        <motion.p key={i} {...fadeUp(0.18 + i * 0.09)} style={{
          color:      C.textSecondary,
          fontSize:   "1.05rem",
          lineHeight: 1.82,
          marginBottom: "1.3rem",
          fontFamily: "Inter, sans-serif",
        }}>
          {para}
        </motion.p>
      ))}

      {/* Pull-quote — HTML border-left style */}
      <motion.div {...fadeUp(0.45)} style={{
        borderLeft:      `4px solid ${C.brand}`,
        backgroundColor: C.bgWhite,
        borderRadius:    "0 12px 12px 0",
        padding:         "28px 32px",
        margin:          "2.8rem 0",
      }}>
        <p style={{
          fontFamily:    "Inter, sans-serif",
          fontSize:      "clamp(1.25rem, 3vw, 1.75rem)",
          fontWeight:    900,
          color:         C.textPrimary,
          lineHeight:    1.3,
          marginBottom:  "0.6rem",
        }}>
          "You are not lacking leads right now.
          <br />
          <span style={{ color: C.brand }}>You are lacking clarity."</span>
        </p>
        <p style={{ color: C.textSecondary, fontSize: "1.05rem", fontFamily: "Inter", lineHeight: 1.6 }}>
          And clarity is what closes deals in a crisis.
        </p>
      </motion.div>

      <motion.p {...fadeUp(0.55)} style={{
        color:      C.textSecondary,
        fontSize:   "1.05rem",
        lineHeight: 1.82,
        fontFamily: "Inter, sans-serif",
      }}>
        The brokers who are winning in this market are not working harder. They are seeing earlier.
      </motion.p>
    </div>
  </section>
);

// =============================================================================
// SECTION 3 — THE REVELATION
// =============================================================================
const ChartSplit = () => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "1.5rem" }}>
    <div style={{
      backgroundColor: C.redBg,
      border:          `1px solid ${C.redBorder}`,
      borderRadius:    "12px",
      padding:         "20px",
      textAlign:       "center",
    }}>
      <div className="label-caps" style={{ color: C.red, marginBottom: "10px" }}>DFM Real Estate Index</div>
      <svg viewBox="0 0 140 64" style={{ width: "100%", height: "68px" }} aria-hidden="true">
        <defs>
          <linearGradient id="redFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#DC2626" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0"    />
          </linearGradient>
        </defs>
        <polygon points="0,8 20,10 45,14 70,26 95,44 120,56 140,60 140,64 0,64" fill="url(#redFill)" />
        <polyline points="0,8 20,10 45,14 70,26 95,44 120,56 140,60"
          fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ fontSize: "2.4rem", fontWeight: 900, color: C.red, letterSpacing: "-0.04em", marginTop: "6px", fontFamily: "Inter" }}>-30%</div>
      <div style={{ color: C.textMuted, fontSize: "0.68rem", fontFamily: "Inter", marginTop: "4px" }}>Financial market crash</div>
    </div>
    <div style={{
      backgroundColor: C.greenBg,
      border:          `1px solid ${C.greenBorder}`,
      borderRadius:    "12px",
      padding:         "20px",
      textAlign:       "center",
    }}>
      <div className="label-caps" style={{ color: C.green, marginBottom: "10px" }}>Actual Property Prices</div>
      <svg viewBox="0 0 140 64" style={{ width: "100%", height: "68px" }} aria-hidden="true">
        <defs>
          <linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#16A34A" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#16A34A" stopOpacity="0"   />
          </linearGradient>
        </defs>
        <polygon points="0,26 25,28 50,29 75,31 100,33 120,30 140,28 140,64 0,64" fill="url(#greenFill)" />
        <polyline points="0,26 25,28 50,29 75,31 100,33 120,30 140,28"
          fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ fontSize: "2.4rem", fontWeight: 900, color: C.green, letterSpacing: "-0.04em", marginTop: "6px", fontFamily: "Inter" }}>-3 to 5%</div>
      <div style={{ color: C.textMuted, fontSize: "0.68rem", fontFamily: "Inter", marginTop: "4px" }}>Real-world fundamentals</div>
    </div>
  </div>
);

const RevelationSection = () => (
  <section style={{ backgroundColor: C.bgWhite, padding: "100px clamp(1.25rem, 4vw, 2rem)" }}>
    <div style={{ maxWidth: "820px", margin: "0 auto" }}>

      <motion.div {...fadeUp(0)}>
        <SectionLabel>THE INTELLIGENCE GAP</SectionLabel>
      </motion.div>

      <motion.h2 {...fadeUp(0.08)} style={{
        fontFamily:    "Inter, sans-serif",
        fontSize:      "clamp(1.9rem, 4.5vw, 3.1rem)",
        fontWeight:    900,
        letterSpacing: "-0.03em",
        color:         C.textPrimary,
        lineHeight:    1.1,
        marginBottom:  "2.75rem",
      }}>
        While Everyone Watched Headlines, The Real
        Market Was Doing Something Different.
      </motion.h2>

      <motion.div {...fadeUp(0.15)}>
        <ChartSplit />
      </motion.div>

      <motion.p {...fadeUp(0.22)} style={{
        textAlign:   "center",
        color:       C.textMuted,
        fontFamily:  "Inter",
        fontSize:    "0.88rem",
        fontStyle:   "italic",
        marginBottom:"2.75rem",
      }}>
        Acqar showed the gap. In real time.
      </motion.p>

      {/* KPI blocks — HTML card style */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "3.25rem" }}>
        {[
          { value: "30%",   label: "DFM Index Drop",      sub: "Financial market",       color: C.red   },
          { value: "3–5%",  label: "Actual Price Move",   sub: "Real-world property",    color: C.green },
          { value: "27pts", label: "The Opportunity Gap", sub: "Intelligence advantage", color: C.brand },
        ].map((kpi, i) => (
          <motion.div key={i} {...fadeUp(0.2 + i * 0.08)} style={{
            flex:            1,
            minWidth:        "160px",
            textAlign:       "center",
            backgroundColor: C.zinc50,
            border:          `1px solid ${C.borderLight}`,
            borderRadius:    "12px",
            padding:         "28px 16px",
          }}>
            <div style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 900, color: kpi.color, lineHeight: 1, letterSpacing: "-0.04em", fontFamily: "Inter" }}>{kpi.value}</div>
            <div style={{ color: C.textPrimary, fontSize: "0.8rem", fontWeight: 700, fontFamily: "Inter", marginTop: "6px" }}>{kpi.label}</div>
            <div style={{ color: C.textMuted, fontSize: "0.68rem", fontFamily: "Inter", marginTop: "3px" }}>{kpi.sub}</div>
          </motion.div>
        ))}
      </div>

      {[
        "That gap — 27 percentage points between financial market panic and real-world property fundamentals — was the single biggest intelligence opportunity Dubai real estate has seen in two years.",
        "A studio in JVC bought at AED 693,000 in 2024 was being offered at AED 600,000. Latest comparable transaction: AED 725,000. That is a 17% below-market entry — with the rebound already beginning.",
        "Acqar Signal showed it. With the address. The area. The developer. The timing score. Before it hit any portal. Before anyone else called your client.",
      ].map((p, i) => (
        <motion.p key={i} {...fadeUp(0.3 + i * 0.09)} style={{
          color:      C.textSecondary,
          fontSize:   "1.05rem",
          lineHeight: 1.82,
          marginBottom:"1.3rem",
          fontFamily: "Inter, sans-serif",
        }}>
          {p}
        </motion.p>
      ))}

      {/* Dark emphasis block */}
      <motion.div {...fadeUp(0.6)} style={{
        backgroundColor: C.zinc950,
        borderRadius:    "16px",
        padding:         "clamp(28px,5vw,48px) clamp(24px,5vw,44px)",
        textAlign:       "center",
        marginTop:       "2.75rem",
      }}>
        <p style={{ fontSize: "clamp(1.15rem,3vw,1.75rem)", fontWeight: 900, color: "#ECECE8", lineHeight: 1.42, marginBottom: "0.6rem", fontFamily: "Inter" }}>
          The broker who had that information made the call.
        </p>
        <p style={{ fontSize: "clamp(1rem,2.5vw,1.4rem)", fontWeight: 600, color: C.zinc400, lineHeight: 1.42, fontFamily: "Inter" }}>
          The broker who didn't — is still waiting for the market to "get clearer."
        </p>
      </motion.div>
    </div>
  </section>
);

// =============================================================================
// SECTION 4 — SOCIAL PROOF THROUGH ACTION
// =============================================================================
const ACTION_CARDS = [
  { icon: "🎯", action: "Distress Deal Closed. Market \"Frozen.\"",                                              copy: "Pulled distress deal cards — live, verified, updated — before they surfaced on Bayut or Property Finder. Sent them to cash-ready clients at 10–20% below market. Closed during a \"frozen\" market." },
  { icon: "📈", action: "Moved Clients Out Of Business Bay. Into Dubai Hills. Before The Data Was Public.",      copy: "Opened the Market Timing Index every morning. Knew that Business Bay sentiment was lagging, Dubai Hills was recovering first. Looked like a genius." },
  { icon: "📋", action: "Sent The AI Pulse Brief Every Sunday. Became The Most Trusted Voice In The Room.",     copy: "Two paragraphs. Real data. Not WhatsApp noise. Became the most trusted professional in their client's inbox in the hardest market week in years." },
  { icon: "🔔", action: "Got The Signal Alert 48 Hours Before The Portals Moved.",                              copy: "Set WhatsApp Signal Alerts for their target areas. Got notified when the sentiment shifted — 48 hours before the portals registered the movement. Made two calls. Booked two viewings." },
  { icon: "🤝", action: "Found A Motivated Seller In Broker Connect Before The Listing Went Live Anywhere.",    copy: "Opened Broker Connect. Saw 10,000 brokers, buyers, investors, and sellers in live conversation. Joined the thread on Marina secondary pricing. Found a motivated seller before the listing went live anywhere." },
];

const SocialProofSection = () => (
  <section style={{ backgroundColor: C.zinc50, padding: "100px clamp(1.25rem, 4vw, 2rem)" }}>
    <div style={{ maxWidth: "780px", margin: "0 auto" }}>

      <motion.div {...fadeUp(0)}>
        <SectionLabel>SIGNAL PRO BROKERS · RIGHT NOW</SectionLabel>
      </motion.div>

      <motion.h2 {...fadeUp(0.08)} style={{
        fontFamily:    "Inter, sans-serif",
        fontSize:      "clamp(1.9rem, 4.5vw, 3.1rem)",
        fontWeight:    900,
        letterSpacing: "-0.03em",
        color:         C.textPrimary,
        lineHeight:    1.1,
        marginBottom:  "3rem",
      }}>
        This Is What Signal Pro Brokers Did While
        The Market Was "Paused."
      </motion.h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "3rem" }}>
        {ACTION_CARDS.map((card, i) => (
          <motion.div
            key={i}
            {...fadeUp(0.1 + i * 0.07)}
            whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
            style={{
              backgroundColor: C.bgWhite,
              border:          `1px solid ${C.borderLight}`,
              borderRadius:    "12px",
              padding:         "22px 24px",
              display:         "flex",
              gap:             "16px",
              alignItems:      "flex-start",
            }}
          >
            <div style={{
              width:           "44px",
              height:          "44px",
              flexShrink:      0,
              backgroundColor: C.brandBg,
              border:          `1px solid ${C.brandBorder}`,
              borderRadius:    "10px",
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              fontSize:        "1.25rem",
            }}>
              {card.icon}
            </div>
            <div>
              <h3 style={{ fontFamily: "Inter", fontSize: "0.95rem", fontWeight: 900, color: C.textPrimary, lineHeight: 1.3, marginBottom: "8px" }}>
                {card.action}
              </h3>
              <p style={{ color: C.textSecondary, fontSize: "0.9rem", lineHeight: 1.72, fontFamily: "Inter" }}>
                {card.copy}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dark callout */}
      <motion.div {...fadeUp(0.65)} style={{
        backgroundColor: C.zinc950,
        borderRadius:    "12px",
        padding:         "28px 32px",
        borderLeft:      `4px solid ${C.brand}`,
      }}>
        <p style={{ color: "#C8C6C2", fontSize: "1rem", fontFamily: "Inter", lineHeight: 1.72, fontStyle: "italic" }}>
          "That last one is not a feature. That is the market. And it is happening inside Acqar right now."
        </p>
      </motion.div>
    </div>
  </section>
);

// =============================================================================
// SECTION 5 — BROKER CONNECT
// =============================================================================
const FEED_ITEMS = [
  { role: "Broker",   loc: "Business Bay", time: "4 min ago",  verified: false, text: "Anyone seeing motivated sellers in Studio One? Getting calls from 3 owners this week, all bought off-plan 2023." },
  { role: "Investor", loc: "Verified",     time: "12 min ago", verified: true,  text: "Looking for 2BR ready in Dubai Hills. Cash. Can close this week. Budget 2.8M." },
  { role: "Broker",   loc: "JVC",          time: "28 min ago", verified: false, text: "Distress unit — Binghatti, 1BR, 61sqm, asking 870K. Last transaction 980K. DM if you have a buyer." },
  { role: "Buyer",    loc: "Verified",     time: "1 hr ago",   verified: true,  text: "Indian national, relocating Q3. Need 3BR villa, family community. Budget 4–5M. Serious." },
];

const BrokerConnectSection = () => (
  <section style={{ backgroundColor: C.bgCream, padding: "100px clamp(1.25rem, 4vw, 2rem)" }}>
    <div style={{ maxWidth: "820px", margin: "0 auto" }}>

      <motion.div {...fadeUp(0)}>
        <SectionLabel>BROKER CONNECT</SectionLabel>
      </motion.div>

      <motion.h2 {...fadeUp(0.08)} style={{
        fontFamily:    "Inter, sans-serif",
        fontSize:      "clamp(1.9rem, 4.5vw, 3.1rem)",
        fontWeight:    900,
        letterSpacing: "-0.03em",
        color:         C.textPrimary,
        lineHeight:    1.1,
        marginBottom:  "1rem",
      }}>
        The Most Valuable Room in Dubai Real Estate
        Is Not on Property Finder.
      </motion.h2>

      <motion.p {...fadeUp(0.15)} style={{
        fontFamily:    "Inter, sans-serif",
        fontSize:      "clamp(1.05rem, 2.5vw, 1.25rem)",
        fontWeight:    700,
        color:         C.brand,
        marginBottom:  "2.25rem",
        lineHeight:    1.45,
      }}>
        Property Finder is where listings go. Broker Connect is where deals begin.
      </motion.p>

      {[
        "Broker Connect is Acqar's live intelligence community — a single platform where 10,000 RERA-registered brokers, qualified investors, active buyers, and motivated sellers are in conversation right now.",
        "Not a WhatsApp group. Not a Facebook page run by someone selling a masterclass. Not a forum full of copy-paste listings.",
        "A structured, searchable, real-time intelligence network — layered on top of live market data — where the conversations that precede deals actually happen.",
      ].map((p, i) => (
        <motion.p key={i} {...fadeUp(0.2 + i * 0.08)} style={{
          color:      C.textSecondary,
          fontSize:   "1.05rem",
          lineHeight: 1.82,
          marginBottom:"1.1rem",
          fontFamily: "Inter, sans-serif",
        }}>
          {p}
        </motion.p>
      ))}

      {/* Live feed terminal */}
      <motion.div {...fadeUp(0.45)} style={{
        backgroundColor: C.zinc950,
        border:          `1px solid ${C.borderDark}`,
        borderRadius:    "16px",
        overflow:        "hidden",
        marginTop:       "2.75rem",
        marginBottom:    "1.5rem",
      }}>
        <div style={{
          display:         "flex",
          justifyContent:  "space-between",
          alignItems:      "center",
          padding:         "14px 18px",
          backgroundColor: C.bgDarkSurface,
          borderBottom:    `1px solid ${C.borderDark}`,
        }}>
          <span style={{ color: "#D8D6D2", fontSize: "0.75rem", fontWeight: 900, letterSpacing: "0.15em", fontFamily: "Inter", textTransform: "uppercase" }}>
            BROKER CONNECT
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: C.greenLight }} />
            <span style={{ color: C.greenLight, fontSize: "0.58rem", fontWeight: 700, fontFamily: "Inter", letterSpacing: "0.12em" }}>
              LIVE · 10,247 MEMBERS
            </span>
          </div>
        </div>
        {FEED_ITEMS.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.5 + i * 0.14 }}
            style={{
              padding:      "16px 18px",
              borderBottom: i < FEED_ITEMS.length - 1 ? `1px solid ${C.borderDark}` : "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                  backgroundColor: `${C.brand}22`,
                  color:           C.brand,
                  border:          `1px solid ${C.brand}40`,
                  borderRadius:    "4px",
                  padding:         "2px 8px",
                  fontSize:        "0.58rem",
                  fontWeight:      900,
                  fontFamily:      "Inter",
                  letterSpacing:   "0.15em",
                  textTransform:   "uppercase",
                }}>
                  {item.role}
                </span>
                <span style={{ color: "#5E5C5A", fontSize: "0.62rem", fontFamily: "Inter" }}>{item.loc}</span>
                {item.verified && <span style={{ color: C.greenLight, fontSize: "0.6rem", fontFamily: "Inter" }}>✓ Verified</span>}
              </div>
              <span style={{ color: "#3E3C3A", fontSize: "0.6rem", fontFamily: "Inter" }}>{item.time}</span>
            </div>
            <p style={{ color: "#C8C6C2", fontSize: "0.82rem", lineHeight: 1.62, fontFamily: "Inter" }}>
              {item.text}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Feature pills */}
      <motion.div {...fadeUp(0.6)} style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "2.75rem" }}>
        {[
          { icon: "🟢", label: "Live · 10,000+ Members" },
          { icon: "🔍", label: "Searchable by Area, Budget, Type" },
          { icon: "✓",  label: "RERA-Verified Brokers Only" },
          { icon: "📡", label: "Layered on Live Market Data" },
        ].map((pill, i) => (
          <span key={i} style={{
            backgroundColor: C.bgWhite,
            border:          `1px solid ${C.borderLight}`,
            borderRadius:    "9999px",
            padding:         "8px 16px",
            fontSize:        "0.82rem",
            fontFamily:      "Inter",
            color:           C.textPrimary,
            display:         "inline-flex",
            alignItems:      "center",
            gap:             "7px",
          }}>
            {pill.icon} {pill.label}
          </span>
        ))}
      </motion.div>

      <motion.p {...fadeUp(0.68)} style={{ color: C.textSecondary, fontSize: "1.05rem", lineHeight: 1.82, fontFamily: "Inter", marginBottom: "1rem" }}>
        The broker who is inside this conversation has an unfair advantage. The broker who is not is working from rumour and noise — the same position everyone else is in.
      </motion.p>
      <motion.p {...fadeUp(0.72)} style={{ color: C.textPrimary, fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.82, fontFamily: "Inter", marginBottom: "2.25rem" }}>
        Getting into Broker Connect costs nothing. Missing it costs deals.
      </motion.p>
      <motion.div {...fadeUp(0.78)}>
        <CTAButton href="https://www.acqar.com/register" variant="primary" size="lg">
          → Join Free. Be Inside The Room.
        </CTAButton>
      </motion.div>

    </div>
  </section>
);

// =============================================================================
// SECTION 6 — PRICING  (HTML two-column card design)
// =============================================================================
const FREE_FEATURES = [
  "Live Signal Feed — 14 sources, every 3 min",
  "Signal Map — market movement by area",
  "DFM/ADX Ticker — developer stock tracker",
  "3 TruValu AI Valuations / month",
  "Distress Deals — view available listings",
  "Property Passport",
  "Broker Connect — community access",
];

const PRO_FEATURES = [
  "Distress Deal Pro — full address, discount %, timing score",
  "AI Pulse Brief — daily market intelligence digest",
  "Market Timing Index by Area",
  "Nationality Demand Intelligence",
  "AI Price Forecasting",
  "Investment Scorecard",
  "Rental Terminal",
  "Off-Plan Pipeline Tracker",
  "Developer Scorecard",
  "Portfolio Intelligence",
  "Unlimited TruValu AI Valuations",
  "WhatsApp + Email Signal Alerts",
  "Broker Connect Pro — full participation",
];

const PricingSection = () => (
  <section style={{ backgroundColor: C.zinc50, padding: "100px clamp(1.25rem, 4vw, 2rem)" }}>
    <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

      <motion.div {...fadeUp(0)} style={{ textAlign: "center" }}>
        <SectionLabel>YOUR ACCESS</SectionLabel>
      </motion.div>

      <motion.h2 {...fadeUp(0.08)} style={{
        fontFamily:    "Inter, sans-serif",
        fontSize:      "clamp(2.5rem, 6vw, 4.5rem)",
        fontWeight:    900,
        letterSpacing: "-0.04em",
        textTransform: "uppercase",
        color:         C.textPrimary,
        lineHeight:    1,
        marginBottom:  "1.5rem",
        textAlign:     "center",
      }}>
        Choose Your Intelligence Tier
      </motion.h2>

      <motion.p {...fadeUp(0.14)} style={{ textAlign: "center", color: C.zinc500, fontSize: "1.15rem", fontFamily: "Inter", marginBottom: "4rem" }}>
        The founding rate for Signal Pro ends May 15th. Secure your edge today.
      </motion.p>

      {/* HTML two-column pricing card */}
      <motion.div {...fadeUp(0.2)} style={{
        display:       "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap:           "1px",
        backgroundColor: C.borderLight,
        borderRadius:  "24px",
        overflow:      "hidden",
        boxShadow:     "0 25px 80px rgba(0,0,0,0.12)",
      }}>

        {/* FREE */}
        <div style={{ backgroundColor: C.bgWhite, padding: "clamp(2rem,5vw,4rem)" }}>
          <div style={{ marginBottom: "2.5rem" }}>
            <span className="label-caps" style={{ color: C.zinc400, display: "block", marginBottom: "0.5rem" }}>Standard Access</span>
            <h3 style={{ fontFamily: "Inter", fontSize: "2.25rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "1rem", color: C.textPrimary }}>SIGNAL FREE</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontFamily: "Inter", fontWeight: 900, fontSize: "3rem", color: C.textPrimary }}>AED 0</span>
              <span style={{ color: C.zinc400, fontSize: "0.875rem", fontWeight: 700 }}>/ LIFETIME</span>
            </div>
          </div>

          <ul style={{ listStyle: "none", marginBottom: "3rem", display: "flex", flexDirection: "column", gap: "20px" }}>
            {FREE_FEATURES.map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className="material-symbols-outlined" style={{ color: "#10B981", fontSize: "22px" }}>check_circle</span>
                <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.04em", color: C.textPrimary }}>
                  {f}
                </span>
              </li>
            ))}
          </ul>

          <CTAButton href="https://www.acqar.com/register" variant="outline" size="md" fullWidth>
            START FREE
          </CTAButton>
        </div>

        {/* PRO */}
        <div style={{ backgroundColor: C.zinc950, padding: "clamp(2rem,5vw,4rem)", position: "relative" }}>
          {/* Badge */}
          <div style={{
            position:        "absolute",
            top:             "32px",
            right:           "32px",
            backgroundColor: C.brand,
            color:           "#fff",
            padding:         "4px 12px",
            fontSize:        "0.6rem",
            fontWeight:      900,
            letterSpacing:   "0.2em",
            textTransform:   "uppercase",
            fontFamily:      "Inter",
          }}>
            FOUNDING RATE
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <span className="label-caps" style={{ color: C.brand, display: "block", marginBottom: "0.5rem" }}>Architectural Intelligence</span>
            <h3 style={{ fontFamily: "Inter", fontSize: "2.25rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "1rem", color: "#fff" }}>SIGNAL PRO</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ fontFamily: "Inter", fontWeight: 900, fontSize: "3rem", color: C.brand }}>AED 29</span>
              <span style={{ color: C.zinc500, fontSize: "0.875rem", fontWeight: 700 }}>/ MONTH</span>
            </div>
          </div>

          <p style={{ fontFamily: "Inter", fontWeight: 700, color: C.zinc400, textTransform: "uppercase", fontSize: "0.72rem", letterSpacing: "0.1em", marginBottom: "20px" }}>
            Everything in Free, plus:
          </p>

          <ul style={{ listStyle: "none", marginBottom: "3rem", display: "flex", flexDirection: "column", gap: "20px" }}>
            {PRO_FEATURES.map((f, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className="material-symbols-outlined" style={{ color: C.brand, fontSize: "22px", fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "#D4D4D8" }}>
                  {f}
                </span>
              </li>
            ))}
          </ul>

          <CTAButton href="https://www.acqar.com/register" variant="copper" size="md" fullWidth>
            UPGRADE TO PRO
          </CTAButton>
        </div>
      </motion.div>
    </div>
  </section>
);

// =============================================================================
// SECTION 7 — NOT FOR EVERYONE  (Positioning)
// =============================================================================
const NotForEveryoneSection = () => (
  <section style={{ backgroundColor: C.bgWhite, padding: "100px clamp(1.25rem, 4vw, 2rem)", borderTop: `1px solid ${C.borderLight}` }}>
    <div style={{ maxWidth: "780px", margin: "0 auto", textAlign: "center" }}>

      <motion.h2 {...fadeUp(0)} style={{
        fontFamily:    "Inter, sans-serif",
        fontSize:      "clamp(2rem, 4.5vw, 3rem)",
        fontWeight:    900,
        letterSpacing: "-0.03em",
        textTransform: "uppercase",
        color:         C.textPrimary,
        lineHeight:    1.1,
        marginBottom:  "2rem",
      }}>
        Acqar Is Not For Every Broker.
      </motion.h2>

      <motion.p {...fadeUp(0.1)} style={{ color: C.zinc500, fontSize: "1.15rem", lineHeight: 1.75, fontFamily: "Inter", marginBottom: "3rem" }}>
        We are not a property portal. We are an intelligence layer. If you are looking for simple CRM management or cold calling lists, there are other tools for that. Acqar is for the broker who understands that in Dubai,{" "}
        <strong style={{ color: C.textPrimary, fontWeight: 900 }}>Information Velocity</strong> is the only thing that creates high-margin closings.
      </motion.p>

      {/* Three NOT columns */}
      <motion.div {...fadeUp(0.2)} style={{
        display:               "grid",
        gridTemplateColumns:   "repeat(auto-fit, minmax(200px, 1fr))",
        gap:                   "16px",
        textAlign:             "left",
        marginBottom:          "3rem",
      }}>
        {[
          { icon: "✗", label: "NOT a property portal"               },
          { icon: "✗", label: "NOT a CRM or cold-calling list"      },
          { icon: "✓", label: "AN intelligence layer for closers"   },
        ].map((item, i) => (
          <div key={i} style={{
            backgroundColor: i === 2 ? C.brandBg : C.zinc50,
            border:          `1px solid ${i === 2 ? C.brandBorder : C.borderLight}`,
            borderRadius:    "12px",
            padding:         "20px",
            display:         "flex",
            alignItems:      "flex-start",
            gap:             "12px",
          }}>
            <span style={{ fontFamily: "Inter", fontWeight: 900, fontSize: "1.1rem", color: i === 2 ? C.brand : C.red, flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontFamily: "Inter", fontWeight: 700, fontSize: "0.85rem", color: i === 2 ? C.brand : C.textPrimary, lineHeight: 1.4 }}>{item.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

// =============================================================================
// SECTION 8 — THE CLOSE  (HTML closing CTA design)
// =============================================================================
const TheCloseSection = () => (
  <section className="architectural-lines" style={{
    position:       "relative",
    padding:        "160px clamp(1.25rem, 5vw, 2rem)",
    backgroundColor:"#FAFAFA",
    overflow:       "hidden",
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
  }}>
    <div style={{ position: "absolute", inset: 0, opacity: 0.4, pointerEvents: "none" }}
         className="architectural-lines" />

    <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "80rem", margin: "0 auto" }}>

      {/* HTML giant heading */}
      <motion.h2 {...fadeUp(0)} style={{
        fontFamily:    "Inter, sans-serif",
        fontSize:      "clamp(3rem, 10vw, 8rem)",
        fontWeight:    900,
        letterSpacing: "-0.05em",
        textTransform: "uppercase",
        lineHeight:    0.85,
        color:         C.textPrimary,
        marginBottom:  "3rem",
      }}>
        The Ceasefire Was Called.
        <br />
        <span className="copper-gradient-text">The Strait Is Open.</span>
        <br />
        The Market Is Moving.
      </motion.h2>

      <motion.p {...fadeUp(0.15)} className="label-caps" style={{
        color:         C.zinc400,
        fontSize:      "0.875rem",
        marginBottom:  "4rem",
        letterSpacing: "0.3em",
      }}>
        Are you moving with it or watching it?
      </motion.p>

      <motion.div {...fadeUp(0.25)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "32px" }}>
        <CTAButton href="https://www.acqar.com/register" variant="primary" size="xl" fullWidth={false}>
          JOIN ACQAR FREE NOW
        </CTAButton>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "center" }}>
          <p className="label-caps" style={{ color: C.zinc400, letterSpacing: "0.3em" }}>
            Founding Rate AED 29/mo ends May 15
          </p>
          <p style={{ color: C.brand, fontFamily: "Inter", fontWeight: 700, fontSize: "0.875rem" }}>
            Signal Pro Founding Rate: AED 29/month — locks forever. Becomes AED 149 on May 16.
          </p>
          <p style={{ color: C.zinc400, fontFamily: "Inter", fontSize: "0.78rem" }}>
            No credit card. RERA-registered brokers only. 2 minutes to activate. 14-day full refund.
          </p>
        </div>
      </motion.div>
    </div>
  </section>
);

// =============================================================================
// FOOTER  (HTML footer design)
// =============================================================================
const Footer = () => (
  <footer className="architectural-lines" style={{
    width:           "100%",
    padding:         "80px clamp(1.25rem, 4vw, 2rem)",
    display:         "flex",
    flexWrap:        "wrap",
    justifyContent:  "space-between",
    alignItems:      "center",
    gap:             "32px",
    backgroundColor: C.zinc50,
    borderTop:       `1px solid ${C.zinc200}`,
  }}>
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <AcqarLogo />
      <span className="label-caps" style={{ color: C.zinc500, letterSpacing: "0.3em" }}>
        © 2026 AcqarLabs LLC-FZ. Architectural Intelligence for Dubai Brokers.
      </span>
    </div>

    <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
      {[
        { label: "Terms of Service", href: "https://www.acqar.com/terms"   },
        { label: "Privacy Policy",   href: "https://www.acqar.com/privacy" },
        { label: "Market Reports",   href: "https://www.acqar.com/reports" },
        { label: "Contact",          href: "https://www.acqar.com/support" },
      ].map((link, i) => (
        <a key={i} href={link.href}
          style={{
            fontFamily:     "Inter",
            fontWeight:     900,
            fontSize:       "0.65rem",
            letterSpacing:  "0.3em",
            textTransform:  "uppercase",
            color:          C.zinc500,
            textDecoration: "none",
            transition:     "color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = C.brand; e.currentTarget.style.textDecoration = `underline`; e.currentTarget.style.textDecorationColor = C.brand; }}
          onMouseLeave={e => { e.currentTarget.style.color = C.zinc500; e.currentTarget.style.textDecoration = "none"; }}
        >
          {link.label}
        </a>
      ))}
    </div>
  </footer>
);

// =============================================================================
// ROOT EXPORT
// =============================================================================
export default function BrokerScreen() {
  return (
    <>
      <GlobalStyles />
      <TerminalTicker />
      <Navbar />
      <main>
        <HeroSection />
        <HookSection />
        <RevelationSection />
        <SocialProofSection />
        <BrokerConnectSection />
        <PricingSection />
        <NotForEveryoneSection />
        <TheCloseSection />
      </main>
      <Footer />
    </>
  );
}
