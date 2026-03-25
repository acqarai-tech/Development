import { useEffect, useState,useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase"; // make sure this exists
import { trackEvent } from "../analytics";

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

  /* ---------- Responsive helpers ---------- */
  .hide-desktop { display: none; }
  .stack { display: flex; gap: 12px; align-items: center; }
  .no-wrap { white-space: nowrap; }

  /* Make sticky header usable on small screens */
  @media (max-width: 1024px) {
    .container { padding: 0 1rem; }
    .container-sm { padding: 0 1rem; }
  }
  @media (max-width: 900px) {
    .hide-mobile { display: none !important; }
    .hide-desktop { display: inline-flex; }
  }

  /* ---------- Pricing cards grid ---------- */
  .pricing-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1.1fr 1fr;
    gap: 16px;
    align-items: start;
  }
  @media (max-width: 1200px) {
    .pricing-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 640px) {
    .pricing-grid { grid-template-columns: 1fr; }
  }

  /* ---------- Compare table responsiveness ---------- */
  .compare-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .compare-grid {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1.1fr 1fr;
    min-width: 820px; /* keeps layout intact; scroll on small screens */
  }
  @media (max-width: 640px) {
    .compare-grid { min-width: 760px; }
  }

  /* ---------- Savings section layout ---------- */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  @media (max-width: 900px) {
    .two-col { grid-template-columns: 1fr; }
  }

  /* ---------- Footer grid ---------- */
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; }
  @media (max-width: 900px) {
    .footer-grid { grid-template-columns: 1fr 1fr; gap: 28px; }
  }
  @media (max-width: 520px) {
    .footer-grid { grid-template-columns: 1fr; }
  }

  /* ---------- Range ---------- */
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

  /* ---------- Small-screen typography tweaks (keeps your design, just prevents overflow) ---------- */
  @media (max-width: 520px) {
    .hero-sub { padding: 0 8px; }
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
  const navigate = useNavigate();
  const location = useLocation();

  const current = location.pathname;

  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const navItems = [
    { label: "Pricing", path: "/pricing" },
    { label: "Resources", path: "/blogs" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#D4D4D4] bg-white">
        <div className="hdrWrap max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">

          {/* Logo */}
          <div
            className="hdrLogo flex items-center cursor-pointer shrink-0 whitespace-nowrap"
            onClick={() => {
              trackEvent("nav_click", { item: "logo" });
              navigate("/");
            }}
          >
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
              <span style={{ color: "#B87333" }}>ACQ</span>
              <span style={{ color: "#111111" }}>AR</span>
            </h1>
          </div>

          {/* ── MOBILE: Pricing + Resources + Signal ── */}
          <div className="md:hidden flex items-center gap-1">
            {/* <button
              onClick={() => {
                trackEvent("nav_click", { item: "pricing" });
                navigate("/pricing");
              }}
              className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1.5 rounded-full whitespace-nowrap ${
                current === "/pricing"
                  ? "text-[#B87333] underline underline-offset-4"
                  : "text-[#2B2B2B]/70"
              }`}
            >
              Pricing
            </button> */}

            <button
              onClick={() => {
                trackEvent("nav_click", { item: "resources" });
                navigate("/blogs");
              }}
              className={`text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1.5 rounded-full whitespace-nowrap ${
                current === "/blogs"
                  ? "text-[#B87333] underline underline-offset-4"
                  : "text-[#2B2B2B]/70"
              }`}
            >
              Resources
            </button>

            {/* Mobile Signal */}
            <a
              href="https://signal.acqar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1.5 rounded-full whitespace-nowrap text-[#2B2B2B]/70"
              style={{ textDecoration: 'none' }}
            >
              Signal
            </a>
          </div>

          {/* ── DESKTOP nav ── */}
          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  trackEvent("Nav", "Click", item.label);
                  navigate(item.path);
                }}
                className={`text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap ${
                  current === item.path ? "text-[#B87333]" : "text-[#2B2B2B]"
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Desktop Signal */}
            <a
              href="https://signal.acqar.com"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("Nav", "Click", "Signal")}
              className="text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap text-[#2B2B2B]"
              style={{ textDecoration: 'none' }}
            >
              Signal
            </a>
          </nav>

          {/* ── Right buttons ── */}
          <div className="hdrRight flex items-center gap-2 sm:gap-4 shrink-0 flex-nowrap">
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => {
                  trackEvent("nav_click", { item: "login" });
                  navigate("/login");
                }}
                className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
              >
                Sign In
              </button>
            )}

            {/* Desktop only: Get Started */}
            <button
              onClick={() => {
                trackEvent("valuation_start", { location: "header" });
                navigate("/valuation");
              }}
              className="hidden md:inline-flex hdrCta bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
            >
              Get Started
            </button>
          </div>

        </div>

        <style>{`
          @media (max-width: 420px) {
            .hdrWrap {
              padding-left: 10px !important;
              padding-right: 10px !important;
              gap: 4px !important;
            }
            .hdrLogo h1 {
              font-size: 17px !important;
              letter-spacing: -0.02em !important;
            }
            .hdrCta {
              padding: 9px 12px !important;
              font-size: 10px !important;
            }
          }

          @media (max-width: 360px) {
            .hdrWrap { gap: 3px !important; }
            .hdrCta {
              padding: 8px 10px !important;
              font-size: 10px !important;
            }
          }
        `}</style>
      </header>

      <div className="h-20" />
    </>
  );
}


/* ── HERO ── */
function PricingHero() {
  const isMobile =
    typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <section
      style={{
        paddingTop: 80,
        paddingBottom: 90,
        textAlign: "center",
        background: "#f5f5f5",
      }}
    >
      {/* badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 18px",
          background: "#111",
          borderRadius: 9999,
          marginBottom: 36,
        }}
      >
        <span
          style={{
            fontSize: "0.65rem",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color: "#fff",
          }}
        >
          TRUVALU™ PRODUCT SUITE
        </span>
      </div>

      {/* TITLE */}
      <h1
        style={{
          margin: "0 auto",
          fontWeight: 900,
          color: "#111",
          textAlign: "center",
          lineHeight: 0.92,
          letterSpacing: "-0.04em",

          /* desktop exact look */
          fontSize: isMobile ? "2.4rem" : "5.5rem",

          /* force 2-line desktop layout */
          maxWidth: isMobile ? "12ch" : "16ch",

          /* gradient fade like screenshot */
          background:
            "linear-gradient(to bottom, #111 60%, rgba(0,0,0,0.35))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",

          padding: "0 16px",
        }}
      >
        CHOOSE YOUR
        <br />
        INTELLIGENCE
      </h1>

      {/* subtitle */}
      <p
        style={{
          marginTop: 26,
          fontSize: "1rem",
          color: "rgba(0,0,0,0.45)",
          maxWidth: 520,
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.7,
          padding: "0 16px",
        }}
      >
        From free instant estimates to bank-grade certifications — every tier
        built on the same RICS-aligned AI foundation.
      </p>
    </section>
  );
}



/* ── PRICING CARDS ── */
function PricingCards() {
  const navigate = useNavigate();

  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  // ✅ hover + coming soon modal
  const [hoverId, setHoverId] = useState(null);
  const [comingSoon, setComingSoon] = useState({ open: false, plan: "" });

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = vw < 900;

  // ✅ Free is prominent (featured)
  const cards = useMemo(
    () => [
      {
        id: "valucheck",
        topLabel: "EARLY CUSTOMER OFFER",
        icon: "query_stats",
        name: "VALUCHECK™",
        tagline: "Perfect for exploration & new investors.",
        priceType: "free",
        priceMain: "FREE",
        strikePrice: "AED 99",
        features: [
          "Basic range estimate",
          "View 3 property details",
          "Recent similar sales",
          "Price movement visual",
          "Instant online access",
        ],
        cta: "START FREE",
        ctaSecondary: "NO CARD REQUIRED",
        featured: true,
      },
      {
        id: "deallens",
        topLabel: "",
        icon: "target",
        name: "DEALLENS™",
        tagline: "Pro-grade analysis for serious property evaluation.",
        priceLabel: "ONE-TIME PAYMENT",
        priceType: "paid",
        priceCurrency: "AED",
        priceAmount: "149",
        pricePeriod: "/report",
        features: [
          "Everything in ValuCheck, plus:",
          "Precise market value",
          "Deep market analysis",
          "Objective buy/pass rating",
          "3-year price predictions",
        ],
        cta: "REQUEST DEALLENS™ REPORT",
        featured: false,
      },
      {
        id: "investiq",
        topLabel: "MOST POPULAR",
        icon: "trending_up",
        name: "INVESTIQ™",
        tagline: "Unlimited intelligence for an active & ongoing market.",
        priceLabel: "ANNUAL SUBSCRIPTION",
        priceType: "paid",
        priceCurrency: "AED",
        priceAmount: "99",
        pricePeriod: "/month",
        pill: "AED 3 PER DAY!",
        features: [
          "Everything in DealLens",
          "Unlimited (emphasized) valuations",
          "Track all properties",
          "Yield reports + alerts",
        ],
        cta: "SUBSCRIBE TO INVESTIQ™",
        featured: false,
      },
      {
        id: "certifi",
        topLabel: "",
        icon: "verified",
        name: "CERTIFI™",
        tagline: "RERA-approved official valuation!",
        priceLabel: "OFFICIAL CERTIFICATION",
        priceType: "paid",
        priceCurrency: "AED",
        priceAmount: "2,999",
        pricePeriod: "/report",
        features: ["Official certificate", "Physical inspection", "48-hour delivery"],
        cta: "REQUEST CERTIFI™",
        ctaSecondary: "GET A QUOTE",
        featured: false,
      },
    ],
    []
  );

  // ✅ click behavior
  function handleCardAction(card) {
    if (card.id === "valucheck") {
      navigate("/valuation");
      return;
    }
    setComingSoon({ open: true, plan: card.name });
  }

  function onCardKeyDown(e, card) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardAction(card);
    }
  }

  // ✅ UI improvement #1: more bottom space on desktop
  const sectionStyle = {
    padding: isMobile ? "0 0 56px" : "0 0 120px",
    background: "#F5F5F5",
  };

  const containerStyle = {
    maxWidth: "80rem",
    margin: "0 auto",
    padding: isMobile ? "0 20px" : "0 24px",
  };

  const desktopGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 22,
    alignItems: "stretch",
  };

  const mobileStack = {
    display: "flex",
    flexDirection: "column",
    gap: 26,
  };

  // ✅ UI improvement #2: shorter card height on desktop + featured shadow for valucheck
  const cardBase = (card) => {
  const isHover = hoverId === card.id;

  // ⭐ FEATURED (VALUcheck) — super prominent
  if (card.featured) {
    return {
      background: "#FFFFFF",
      borderRadius: 28,
      border: "2px solid var(--accent-copper)",

      // 🔥 layered premium shadow
      boxShadow: isHover
        ? `
          0 40px 120px rgba(184,115,51,0.35),
          0 25px 60px rgba(184,115,51,0.25),
          0 10px 25px rgba(0,0,0,0.12),
          0 0 0 6px rgba(184,115,51,0.08)
        `
        : `
          0 32px 90px rgba(184,115,51,0.30),
          0 18px 45px rgba(184,115,51,0.20),
          0 8px 20px rgba(0,0,0,0.10),
          0 0 0 6px rgba(184,115,51,0.06)
        `,

      padding: "26px 22px",
      position: "relative",

      // ⭐ slightly bigger than others
      transform: isHover ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1.01)",

      minHeight: isMobile ? "auto" : 560,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",

      cursor: "pointer",
      userSelect: "none",
      outline: "none",
      transition: "all .25s ease",
      zIndex: 2,
    };
  }

  // normal cards
  return {
    background: "#FFFFFF",
    borderRadius: 28,
    border: "1px solid rgba(212,212,212,0.55)",
    boxShadow: isHover
      ? "0 18px 40px rgba(0,0,0,0.10)"
      : "0 8px 26px rgba(0,0,0,0.06)",

    padding: "26px 22px",
    position: "relative",
    minHeight: isMobile ? "auto" : 560,

    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",

    cursor: "pointer",
    userSelect: "none",
    outline: "none",
    transform: isHover ? "translateY(-4px)" : "translateY(0)",
    transition: "all .2s ease",
  };
};


  const mostPopularBadge = {
    position: "absolute",
    top: -12,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "6px 12px",
    borderRadius: 9999,
    background: "var(--accent-copper)",
    color: "#fff",
    fontSize: "0.56rem",
    fontWeight: 900,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    boxShadow: "0 10px 22px rgba(184,115,51,0.20)",
    zIndex: 2,
  };

  const topLabelStyle = (isCopper) => ({
    fontSize: "0.62rem",
    fontWeight: 900,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: isCopper ? "var(--accent-copper)" : "rgba(43,43,43,0.35)",
    marginBottom: 16,
  });

  const headerRow = {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 14,
  };

  const iconPill = {
    width: 46,
    height: 46,
    borderRadius: 16,
    background: "rgba(43,43,43,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const nameStyle = {
    fontSize: "1.25rem",
    fontWeight: 900,
    letterSpacing: "-0.02em",
    color: "var(--primary)",
  };

  const taglineStyle = {
    fontSize: "0.78rem",
    lineHeight: 1.6,
    color: "rgba(43,43,43,0.50)",
    marginBottom: 18,
  };

  const priceLabelStyle = {
    fontSize: "0.58rem",
    fontWeight: 900,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(43,43,43,0.35)",
    marginBottom: 10,
  };

  const priceRow = {
    display: "flex",
    alignItems: "baseline",
    gap: 10,
    marginBottom: 12,
    flexWrap: "nowrap",
    whiteSpace: "nowrap",
  };

  const priceMainStyle = (card) => ({
    fontSize: card.priceType === "free" ? "2.6rem" : card.id === "certifi" ? "2.15rem" : "2.25rem",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    color: "var(--primary)",
    lineHeight: 1,
  });

  const periodStyle = {
    fontSize: "0.95rem",
    fontWeight: 900,
    color: "rgba(43,43,43,0.45)",
    letterSpacing: "-0.01em",
    lineHeight: 1,
  };

  const currencyStyle = {
    fontSize: "1.05rem",
    fontWeight: 900,
    color: "rgba(43,43,43,0.55)",
    letterSpacing: "-0.01em",
    lineHeight: 1,
    marginRight: 2,
  };

  const strikeStyle = {
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "rgba(43,43,43,0.28)",
    textDecoration: "line-through",
    fontStyle: "italic",
  };

  const pillStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px 12px",
    borderRadius: 9999,
    background: "rgba(184,115,51,0.12)",
    color: "var(--accent-copper)",
    fontSize: "0.62rem",
    fontWeight: 900,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    marginBottom: 14,
    width: "fit-content",
  };

  const featureList = {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    marginTop: 6,
    marginBottom: 26,
    padding: 0,
  };

  const featureItem = {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  };

  const checkDot = () => ({
    width: 18,
    height: 18,
    borderRadius: 9999,
    background: "var(--accent-copper)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  });

  const featureText = (bold) => ({
    fontSize: "0.82rem",
    lineHeight: 1.35,
    color: "rgba(43,43,43,0.70)",
    fontWeight: bold ? 800 : 600,
  });

  const buttonStyle = (card) => ({
    width: "100%",
    padding: "14px 16px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    fontSize: "0.62rem",
    fontWeight: 900,
    background: card.featured ? "var(--accent-copper)" : "#111",
    color: "#fff",
    boxShadow: card.featured ? "0 10px 24px rgba(184,115,51,0.22)" : "0 10px 24px rgba(0,0,0,0.14)",
  });

  const bottomNote = {
    textAlign: "center",
    marginTop: 12,
    fontSize: "0.58rem",
    fontWeight: 900,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "rgba(43,43,43,0.25)",
  };

  function renderPrice(card) {
    if (card.priceType === "free") {
      return (
        <div style={priceRow}>
          <div style={priceMainStyle(card)}>{card.priceMain}</div>
          {card.strikePrice ? <div style={strikeStyle}>{card.strikePrice}</div> : null}
        </div>
      );
    }

    return (
      <div style={priceRow}>
        <span style={currencyStyle}>{card.priceCurrency}</span>
        <div style={priceMainStyle(card)}>{card.priceAmount}</div>
        <div style={periodStyle}>{card.pricePeriod}</div>
      </div>
    );
  }

  // ✅ Coming soon modal styles (same palette)
  const modalOverlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(43,43,43,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  };

  const modalCard = {
    width: "100%",
    maxWidth: 520,
    background: "#FFFFFF",
    borderRadius: 22,
    border: "1px solid rgba(212,212,212,0.65)",
    boxShadow: "0 16px 60px rgba(0,0,0,0.22)",
    overflow: "hidden",
  };

  const modalHeader = {
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#FAFAFA",
    borderBottom: "1px solid rgba(212,212,212,0.65)",
  };

  const modalTitle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 900,
    color: "var(--primary)",
    letterSpacing: "-0.02em",
  };

  const modalBody = {
    padding: "18px",
    color: "rgba(43,43,43,0.70)",
    lineHeight: 1.6,
    fontWeight: 600,
    fontSize: "0.95rem",
  };

  const modalActions = {
    padding: "0 18px 18px",
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
  };

  const modalBtnPrimary = {
    border: "none",
    borderRadius: 12,
    padding: "12px 14px",
    fontWeight: 900,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontSize: "0.62rem",
    cursor: "pointer",
    background: "var(--accent-copper)",
    color: "#fff",
    boxShadow: "0 10px 24px rgba(184,115,51,0.22)",
  };

  const modalBtnGhost = {
    border: "1px solid rgba(212,212,212,0.85)",
    borderRadius: 12,
    padding: "12px 14px",
    fontWeight: 900,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontSize: "0.62rem",
    cursor: "pointer",
    background: "#fff",
    color: "rgba(43,43,43,0.80)",
  };

  return (
    <>
      <section style={sectionStyle}>
        <div style={containerStyle}>
          <div style={isMobile ? mobileStack : desktopGrid}>
            {cards.map((card) => (
              <div
                key={card.id}
                style={cardBase(card)}
                role="button"
                tabIndex={0}
                aria-label={`${card.name} pricing card`}
                onMouseEnter={() => setHoverId(card.id)}
                onMouseLeave={() => setHoverId(null)}
                onFocus={() => setHoverId(card.id)}
                onBlur={() => setHoverId(null)}
                onKeyDown={(e) => onCardKeyDown(e, card)}
                onClick={() => handleCardAction(card)}
              >
                {card.topLabel === "MOST POPULAR" ? <div style={mostPopularBadge}>MOST POPULAR</div> : null}

                <div>
                  {card.topLabel && card.topLabel !== "MOST POPULAR" ? (
                    <div style={topLabelStyle(true)}>{card.topLabel}</div>
                  ) : (
                    <div style={{ height: 18 }} />
                  )}

                  <div style={headerRow}>
                    <div style={iconPill}>
                      <Icon name={card.icon} size="sm" style={{ color: "rgba(43,43,43,0.70)" }} />
                    </div>
                    <div>
                      <div style={nameStyle}>{card.name}</div>
                    </div>
                  </div>

                  <div style={taglineStyle}>{card.tagline}</div>

                  {card.priceLabel ? <div style={priceLabelStyle}>{card.priceLabel}</div> : <div style={{ height: 18 }} />}

                  {renderPrice(card)}

                  {card.pill ? <div style={pillStyle}>{card.pill}</div> : null}

                  <ul style={featureList}>
                    {card.features.map((f, i) => (
                      <li key={i} style={featureItem}>
                        <div style={checkDot()}>
                          <Icon name="check" size="xs" style={{ color: "#fff" }} />
                        </div>
                        <span style={featureText(i === 0 && card.id !== "valucheck")}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <button
                    style={buttonStyle(card)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardAction(card);
                    }}
                  >
                    {card.cta}
                  </button>
                  <div style={bottomNote}>{card.ctaSecondary || " "}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {comingSoon.open ? (
        <div
          style={modalOverlay}
          onClick={() => setComingSoon({ open: false, plan: "" })}
          role="dialog"
          aria-modal="true"
        >
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <div style={modalTitle}>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    background: "rgba(184,115,51,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="schedule" size="sm" style={{ color: "var(--accent-copper)" }} />
                </span>
                Coming Soon
              </div>

              <button
                onClick={() => setComingSoon({ open: false, plan: "" })}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: 10,
                }}
                aria-label="Close"
              >
                <Icon name="close" size="sm" style={{ color: "rgba(43,43,43,0.65)" }} />
              </button>
            </div>

            <div style={modalBody}>
              <div style={{ fontWeight: 900, color: "var(--primary)", marginBottom: 6 }}>{comingSoon.plan}</div>
              This plan is under development and will be available soon. You can start with <b>ValuCheck™</b> right now.
            </div>

            <div style={modalActions}>
              <button style={modalBtnGhost} onClick={() => setComingSoon({ open: false, plan: "" })}>
                CLOSE
              </button>
              <button
                style={modalBtnPrimary}
                onClick={() => {
                  setComingSoon({ open: false, plan: "" });
                  navigate("/valuation");
                }}
              >
                START FREE
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}


/* ── COMPARE ALL FEATURES ── */


function CompareFeatures() {
  const [activeTab, setActiveTab] = useState("all");

  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isMobile = vw < 900;

  const rows = [
    { label: "Valuation accuracy", valucheck: "±10% Range", deallens: "±5% Precise", investiq: "Real-time", certifi: "Certified" },
    { label: "Number of comparables", valucheck: "3", deallens: "15+", investiq: "Unlimited", certifi: "Official Selection" },
    { label: "Report format", valucheck: "Web view", deallens: "Digital PDF", investiq: "Interactive + PDF", certifi: "Stamped Certificate" },
    { label: "Investment Score", valucheck: false, deallens: false, investiq: true, certifi: false },
    { label: "Delivery time", valucheck: "Instant", deallens: "Instant", investiq: "Instant", certifi: "48 hours" },
  ];

  const tiers = [
    { key: "valucheck", label: "VALUCHECK™", sub: "FREE", featured: false },
    { key: "deallens", label: "DEALLENS™", sub: "AED 149", featured: false },
    { key: "investiq", label: "INVESTIQ™", sub: "AED 99 /mo", featured: true },
    { key: "certifi", label: "CERTIFI™", sub: "AED 2,999", featured: false },
  ];

  // ---------- styles (inline only) ----------
  const sectionStyle = {
    padding: isMobile ? "72px 0" : "90px 0",
    background: "var(--bg-off-white)",
    borderTop: "1px solid rgba(212,212,212,0.3)",
  };

  const containerSm = {
    maxWidth: "64rem",
    margin: "0 auto",
    padding: isMobile ? "0 14px" : "0 24px",
  };

  const headerWrap = { textAlign: "center", marginBottom: isMobile ? 32 : 44 };

  const topKicker = {
    fontSize: "0.6rem",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.26em",
    color: "var(--accent-copper)",
    marginBottom: 12,
  };

  const titleStyle = {
    fontSize: isMobile ? "2.35rem" : "2.75rem",
    fontWeight: 900,
    color: "var(--primary)",
    letterSpacing: "-0.03em",
    marginBottom: 10,
    lineHeight: 1.05,
    textTransform: "uppercase",
  };

  const subStyle = {
    fontSize: "0.95rem",
    color: "rgba(43,43,43,0.5)",
  };

  // Table card like SS1
  const tableCard = {
    background: "#fff",
    borderRadius: 22,
    border: "1px solid rgba(212,212,212,0.45)",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
  };

  // ✅ DESKTOP: normal table (5 columns)
  const desktopGridStyle = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1.1fr 1fr",
  };

  // ✅ MOBILE: show only TWO columns at a time (Feature + 1 plan) and swipe to next plan
  // We create 4 "slides": (Feature+ValuCheck), (Feature+DealLens), (Feature+InvestIQ), (Feature+Certifi)
  const mobileScroller = {
    display: "flex",
    overflowX: "auto",
    scrollSnapType: "x mandatory",
    WebkitOverflowScrolling: "touch",
  };

  const mobileSlide = {
    flex: "0 0 100%",
    scrollSnapAlign: "start",
  };

  const mobileTwoColGrid = {
    display: "grid",
    gridTemplateColumns: "1.15fr 1fr", // left Feature column + right Plan column (like SS2)
  };

  const darkHeaderCell = (w = "auto") => ({
    padding: "20px 22px",
    background: "#141414",
    color: "#fff",
    fontSize: "0.62rem",
    fontWeight: 900,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 72,
    width: w,
  });

  const darkHeaderLeft = {
    justifyContent: "flex-start",
  };

  const copperHeaderCell = {
    background: "var(--accent-copper)",
  };

  const rowCellLeft = {
    padding: "22px 22px",
    fontSize: "0.78rem",
    fontWeight: 900,
    color: "rgba(43,43,43,0.8)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    background: "#fff",
  };

  const rowCellRight = {
    padding: "22px 18px",
    fontSize: "0.78rem",
    fontWeight: 800,
    color: "rgba(43,43,43,0.65)",
    background: "#fff",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const zebra = (i) => (i % 2 === 0 ? "#fff" : "rgba(250,250,250,0.9)");

  // helper for mobile slide value rendering
  const renderValue = (v) => {
    if (v === true) return <Icon name="check" size="sm" style={{ color: "var(--accent-copper)" }} />;
    if (v === false) return <span style={{ color: "rgba(212,212,212,0.85)", fontSize: "1.1rem" }}>—</span>;
    return <span style={{ fontSize: "0.78rem", color: "rgba(43,43,43,0.65)", fontWeight: 800 }}>{v}</span>;
  };

  // optional: your tab toggle can still filter rows if you want
  const visibleRows = activeTab === "key" ? rows.slice(0, 3) : rows;

  return (
    <section style={sectionStyle}>
      <div style={containerSm}>
        {/* Header */}
        <div style={headerWrap}>
          <div style={topKicker}>TRANSPARENCY PROTOCOL</div>
          <div style={titleStyle}>COMPARE ALL FEATURES</div>
          <div style={subStyle}>The full capability matrix for institutional reporting.</div>
        </div>

        {/* Desktop table */}
        {!isMobile && (
          <div style={tableCard}>
            {/* Header row */}
            <div style={{ ...desktopGridStyle, borderBottom: "1px solid rgba(212,212,212,0.25)" }}>
              <div style={{ ...darkHeaderCell(), ...darkHeaderLeft }}>FEATURE ANALYSIS</div>

              {tiers.map((t) => (
                <div
                  key={t.key}
                  style={{
                    ...darkHeaderCell(),
                    ...(t.featured ? copperHeaderCell : {}),
                    borderLeft: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {t.label}
                </div>
              ))}
            </div>

            {/* Rows */}
            {visibleRows.map((row, i) => (
              <div
                key={row.label}
                style={{
                  ...desktopGridStyle,
                  background: zebra(i),
                  borderBottom: i < visibleRows.length - 1 ? "1px solid rgba(212,212,212,0.18)" : "none",
                }}
              >
                <div style={{ ...rowCellLeft, background: zebra(i) }}>{row.label.toUpperCase()}</div>

                {["valucheck", "deallens", "investiq", "certifi"].map((k) => (
                  <div
                    key={k}
                    style={{
                      ...rowCellRight,
                      background: zebra(i),
                      borderLeft: "1px solid rgba(212,212,212,0.18)",
                    }}
                  >
                    {renderValue(row[k])}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Mobile: TWO columns only (Feature + 1 plan), swipe to see next plan */}
        {isMobile && (
          <>
            <div style={tableCard}>
              <div style={mobileScroller}>
                {tiers.map((t) => (
                  <div key={t.key} style={mobileSlide}>
                    {/* Slide header */}
                    <div style={{ ...mobileTwoColGrid, borderBottom: "1px solid rgba(212,212,212,0.22)" }}>
                      <div style={{ ...darkHeaderCell(), ...darkHeaderLeft }}>FEATURE ANALYSIS</div>
                      <div style={{ ...darkHeaderCell(), ...(t.featured ? copperHeaderCell : {}) }}>{t.label}</div>
                    </div>

                    {/* Slide rows */}
                    {visibleRows.map((row, i) => (
                      <div
                        key={row.label}
                        style={{
                          ...mobileTwoColGrid,
                          background: zebra(i),
                          borderBottom: i < visibleRows.length - 1 ? "1px solid rgba(212,212,212,0.18)" : "none",
                        }}
                      >
                        <div style={{ ...rowCellLeft, background: zebra(i) }}>{row.label.toUpperCase()}</div>
                        <div style={{ ...rowCellRight, background: zebra(i) }}>{renderValue(row[t.key])}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* tiny hint like app screens */}
            <div
              style={{
                marginTop: 10,
                textAlign: "center",
                fontSize: "0.65rem",
                fontWeight: 800,
                color: "rgba(43,43,43,0.35)",
              }}
            >
              Swipe to compare plans →
            </div>
          </>
        )}
      </div>
    </section>
  );
}


/* ── SAVINGS CALCULATOR ── */


function SavingsCalculator() {
  const [value, setValue] = useState(5000000);

  // responsive (inline only)
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isMobile = vw < 900;

  const traditionalCost = Math.round(value * 0.0007);
  const acqarCost = 149;
  const savings = traditionalCost - acqarCost;
  const savingsPct = Math.round((savings / traditionalCost) * 100);
  const daysTraditional = 13;

  const formatAED = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(0) + "M";
    if (num >= 1000) return (num / 1000).toFixed(0) + "K";
    return String(num);
  };

  const progress = ((value - 500000) / (20000000 - 500000)) * 100;

  // -------- inline styles to match your desktop screenshots ----------
  const sectionStyle = {
    padding: isMobile ? "80px 0" : "96px 0",
    background: "#fff",
  };

  const containerSm = {
    maxWidth: "64rem",
    margin: "0 auto",
    padding: isMobile ? "0 14px" : "0 24px",
  };

  const headerWrap = { textAlign: "center", marginBottom: isMobile ? 34 : 48 };

  const titleStyle = {
    fontSize: isMobile ? "2.15rem" : "3.1rem",
    fontWeight: 900,
    color: "var(--primary)",
    letterSpacing: "-0.03em",
    textTransform: "uppercase",
    marginBottom: 10,
    lineHeight: 1.05,
  };

  const subStyle = {
    fontSize: isMobile ? "0.9rem" : "0.95rem",
    color: "rgba(43,43,43,0.45)",
    fontStyle: "italic",
  };

  const cardWrap = {
    background: "#fff",
    border: "1px solid rgba(212,212,212,0.45)",
    borderRadius: 26,
    padding: isMobile ? 18 : 40,
    boxShadow: "0 18px 44px rgba(0,0,0,0.06)",
  };

  // Slider header like desktop (label left, big value right)
  const sliderTop = {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 14,
  };

  const sliderLabel = {
    fontSize: "0.62rem",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    color: "rgba(43,43,43,0.45)",
  };

  const sliderValueBig = {
    fontSize: isMobile ? "1.6rem" : "2.15rem",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    color: "var(--primary)",
  };

  const rangeRail = {
    height: 6,
    background: "rgba(212,212,212,0.45)",
    borderRadius: 9999,
    overflow: "hidden",
  };

  const rangeFill = {
    height: "100%",
    width: `${progress}%`,
    background: "var(--accent-copper)",
    borderRadius: 9999,
  };

  const rangeInput = {
    position: "absolute",
    top: -10,
    left: 0,
    width: "100%",
    opacity: 0,
    cursor: "pointer",
    height: 28,
  };

  const thumbVisual = {
    position: "absolute",
    top: -11,
    left: `calc(${progress}% - 12px)`,
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "var(--accent-copper)",
    border: "4px solid #fff",
    boxShadow: "0 10px 22px rgba(0,0,0,0.12)",
    pointerEvents: "none",
  };

  const sliderEnds = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 10,
    fontSize: "0.62rem",
    fontWeight: 800,
    color: "rgba(43,43,43,0.32)",
    letterSpacing: "0.08em",
  };

  // ✅ Desktop: two cards side-by-side (legacy + acqar)
  // ✅ Mobile: stack (one under one) like your phone screenshot behavior
  const compareGrid = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
    gap: isMobile ? 14 : 22,
    alignItems: "stretch",
    marginBottom: isMobile ? 18 : 26,
    marginTop: isMobile ? 18 : 26,
  };

  const legacyCard = {
    background: "var(--bg-off-white)",
    border: "1px solid rgba(212,212,212,0.45)",
    borderRadius: 26,
    padding: isMobile ? 18 : 26,
    boxShadow: "0 14px 28px rgba(0,0,0,0.04)",
  };

  const acqarCard = {
    background: "var(--accent-copper)",
    border: "1px solid rgba(184,115,51,0.35)",
    borderRadius: 26,
    padding: isMobile ? 18 : 26,
    color: "#fff",
    boxShadow: "0 24px 46px rgba(0,0,0,0.10)",
  };

  const miniKicker = (light = false) => ({
    fontSize: "0.62rem",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.20em",
    color: light ? "rgba(255,255,255,0.75)" : "rgba(43,43,43,0.35)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  });

  const bigPrice = (light = false) => ({
    fontSize: isMobile ? "1.7rem" : "2rem",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    color: light ? "#fff" : "var(--primary)",
    marginBottom: 10,
  });

  const divider = (light = false) => ({
    height: 1,
    background: light ? "rgba(255,255,255,0.18)" : "rgba(43,43,43,0.10)",
    margin: "10px 0 12px",
  });

  const tinyLabel = (light = false) => ({
    fontSize: "0.58rem",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    color: light ? "rgba(255,255,255,0.70)" : "rgba(43,43,43,0.28)",
  });

  // Banner like desktop screenshot (dark bar + copper button)
  const banner = {
    background: "var(--primary)",
    borderRadius: 18,
    padding: isMobile ? "16px 16px" : "18px 22px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: isMobile ? "wrap" : "nowrap",
  };

  const bannerLeft = { display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: "1 1 auto" };

  const badgeIcon = {
    width: 40,
    height: 40,
    borderRadius: 14,
    background: "rgba(184,115,51,0.22)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const bannerTextWrap = { minWidth: 0 };

  const bannerLine1 = {
    fontSize: "0.85rem",
    fontWeight: 800,
    color: "#fff",
    lineHeight: 1.25,
    marginBottom: 4,
  };

  const bannerLine2 = {
    fontSize: "0.65rem",
    fontWeight: 700,
    color: "rgba(255,255,255,0.55)",
    fontStyle: "italic",
  };

  const bannerBtn = {
    background: "var(--accent-copper)",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: 14,
    fontSize: "0.62rem",
    fontWeight: 900,
    border: "none",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "0.18em",
    whiteSpace: "nowrap",
    flex: isMobile ? "1 1 100%" : "0 0 auto",
  };

  return (
    <section style={sectionStyle}>
      <div style={containerSm}>
        {/* Heading */}
        <div style={headerWrap}>
          <h2 style={titleStyle}>SEE HOW MUCH YOU'LL SAVE</h2>
          <p style={subStyle}>Compare ACQAR TruValu™ to traditional valuation service</p>
        </div>

        {/* Main card */}
        <div style={cardWrap}>
          {/* Slider */}
          <div>
            <div style={sliderTop}>
              <span style={sliderLabel}>PORTFOLIO VALUE</span>
              <span style={sliderValueBig}>AED {formatAED(value)}</span>
            </div>

            <div style={{ position: "relative" }}>
              <div style={rangeRail}>
                <div style={rangeFill} />
              </div>

              <input
                type="range"
                min={500000}
                max={20000000}
                step={100000}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                style={rangeInput}
              />

              <div style={thumbVisual} />
            </div>

            <div style={sliderEnds}>
              <span>1M</span>
              <span>100M</span>
            </div>
          </div>

          {/* Comparison cards */}
          <div style={compareGrid}>
            {/* Legacy */}
            <div style={legacyCard}>
              <div style={miniKicker(false)}>
                <Icon name="grid_on" size="xs" style={{ color: "rgba(43,43,43,0.35)" }} />
                <span>LEGACY</span>
              </div>

              <div style={bigPrice(false)}>AED {traditionalCost.toLocaleString()}*</div>
              <div style={divider(false)} />
              <div style={tinyLabel(false)}>TRADITIONAL APPRAISAL FEE</div>
            </div>

            {/* ACQAR */}
            <div style={acqarCard}>
              <div style={miniKicker(true)}>
                <Icon name="bolt" size="xs" style={{ color: "rgba(255,255,255,0.85)" }} />
                <span>ACQAR</span>
              </div>

              <div style={bigPrice(true)}>AED {acqarCost}</div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 14px",
                  borderRadius: 9999,
                  background: "rgba(255,255,255,0.18)",
                  color: "#fff",
                  fontSize: "0.62rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  width: "fit-content",
                }}
              >
                <Icon name="bolt" size="xs" style={{ color: "#fff" }} />
                60S PROCESSING
              </div>
            </div>
          </div>

          {/* Savings banner */}
          <div style={banner}>
            <div style={bannerLeft}>
              <div style={badgeIcon}>
                <Icon name="savings" size="sm" style={{ color: "#fff" }} />
              </div>

              <div style={bannerTextWrap}>
                <div style={bannerLine1}>
                  Savings: <span style={{ color: "var(--accent-copper)" }}>AED {savings.toLocaleString()}</span>
                </div>
                <div style={bannerLine2}>
                  {savingsPct}% Liquidity Preserved* • {daysTraditional}+ days saved
                </div>
              </div>
            </div>

            <button style={bannerBtn}>START SAVING NOW</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ── */
function FAQ() {
  const [open, setOpen] = useState(null); // first open like screenshot

  const faqs = [
    {
      q: "How accurate is the TruValu™ AI?",
      a: "Our AI achieves ±5% precision on DealLens™ reports and ±3% on InvestIQ™, validated against thousands of actual Dubai transaction prices. For the free ValuCheck™, accuracy is ±10% — still highly useful for exploration.",
    },
    {
      q: "Can I use ACQAR reports for bank mortgages?",
      a: "Yes — our CertiFi™ tier provides RICS-aligned stamped valuations accepted by major UAE banks. DealLens™ and InvestIQ™ reports are for personal investment decisions and are not bank-grade by default.",
    },
   
    {
      q: "Can I upgrade or downgrade my plan anytime?",
      a: "Absolutely. You can switch between plans or move to an annual InvestIQ™ subscription directly from your dashboard. Changes take effect immediately.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major international credit and debit cards (Visa, Mastercard, Amex), Apple Pay, and institutional bank transfers for our corporate partners.",
    },
    {
      q: "Do you offer refunds?",
      a: "Due to the instant nature of our digital intelligence reports, we typically do not offer refunds once a report is generated. However, if there is a technical error, our support team will resolve it within 24 hours.",
    },
    {
      q: "Is there a volume discount for agencies?",
      a: "Yes. We offer custom Enterprise API and seat-based pricing for real estate agencies and wealth management firms processing more than 50 valuations per month.",
    },
    {
      q: "Can I cancel my InvestIQ™ subscription?",
      a: "Yes, you can cancel your subscription at any time. You will continue to have access to your pro tools until the end of your current billing cycle.",
    },
    {
      q: "Do banks accept ACQAR reports?",
      a: "Our Certifi™ tier reports are RICS-aligned and signed by licensed valuers, making them suitable for most tier-1 banks.",
    },
    {
      q: "How long are reports valid?",
      a: "Following RICS international standards, our valuations are typically considered valid for 90 days.",
    },
  ];

  return (
    <section
      style={{
        padding: "100px 0",
        background: "#FAFAFA",
      }}
    >
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "0 20px" }}>
        {/* TITLE */}
        <h2
          style={{
            textAlign: "center",
            fontSize: "clamp(2rem,6vw,3rem)",
            fontWeight: 900,
            color: "#2B2B2B",
            marginBottom: 50,
            letterSpacing: "-0.02em",
          }}
        >
          FAQ
        </h2>

        {/* LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {faqs.map((faq, i) => {
            const isOpen = open === i;

            return (
              <div
                key={i}
                style={{
                  borderRadius: 26,
                  background: "#fff",
                  border: isOpen
                    ? "2px solid #B87333"
                    : "1px solid rgba(0,0,0,0.08)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                  transition: "all .25s",
                }}
              >
                {/* QUESTION */}
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  style={{
                    width: "100%",
                    padding: "26px 28px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 20,
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#B87333")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "#2B2B2B")
                  }
                >
                  <span
                    style={{
                      fontSize: "clamp(.95rem,2.5vw,1.05rem)",
                      fontWeight: 800,
                      letterSpacing: ".02em",
                      textTransform: "uppercase",
                      color: isOpen ? "#B87333" : "#2B2B2B",
                      lineHeight: 1.4,
                      flex: 1,
                    }}
                  >
                    {faq.q}
                  </span>

                  {/* ICON */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      border: "1px solid rgba(0,0,0,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isOpen ? "#B87333" : "#fff",
                      color: isOpen ? "#fff" : "#999",
                      fontSize: 20,
                      fontWeight: 900,
                      flexShrink: 0,
                      transition: ".25s",
                    }}
                  >
                    {isOpen ? "×" : "+"}
                  </div>
                </button>

                {/* ANSWER */}
                <div
                  style={{
                    maxHeight: isOpen ? 300 : 0,
                    overflow: "hidden",
                    transition: "all .35s ease",
                  }}
                >
                  <div
                    style={{
                      padding: "0 28px 28px",
                      fontSize: ".95rem",
                      lineHeight: 1.7,
                      color: "#666",
                    }}
                  >
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


/* ── FINAL CTA ── */

function FinalCTA() {
  const navigate = useNavigate();

  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isMobile = vw < 900;

  // ✅ NEW: modal state
  const [showDealLensModal, setShowDealLensModal] = useState(false);

  // ✅ ESC close (kept)
  useEffect(() => {
    if (!showDealLensModal) return;
    const onKey = (e) => {
      if (e.key === "Escape") setShowDealLensModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showDealLensModal]);

  // ✅ Coming soon modal styles (EXACT same as your PricingCards)
  const modalOverlay = {
    position: "fixed",
    inset: 0,
    background: "rgba(43,43,43,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    zIndex: 9999,
  };

  const modalCard = {
    width: "100%",
    maxWidth: 520,
    background: "#FFFFFF",
    borderRadius: 22,
    border: "1px solid rgba(212,212,212,0.65)",
    boxShadow: "0 16px 60px rgba(0,0,0,0.22)",
    overflow: "hidden",
  };

  const modalHeader = {
    padding: "16px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#FAFAFA",
    borderBottom: "1px solid rgba(212,212,212,0.65)",
  };

  const modalTitle = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 900,
    color: "var(--primary)",
    letterSpacing: "-0.02em",
  };

  const modalBody = {
    padding: "18px",
    color: "rgba(43,43,43,0.70)",
    lineHeight: 1.6,
    fontWeight: 600,
    fontSize: "0.95rem",
  };

  const modalActions = {
    padding: "0 18px 18px",
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    flexWrap: "wrap", // ✅ mobile safe
  };

  const modalBtnPrimary = {
    border: "none",
    borderRadius: 12,
    padding: "12px 14px",
    fontWeight: 900,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontSize: "0.62rem",
    cursor: "pointer",
    background: "var(--accent-copper)",
    color: "#fff",
    boxShadow: "0 10px 24px rgba(184,115,51,0.22)",
  };

  const modalBtnGhost = {
    border: "1px solid rgba(212,212,212,0.85)",
    borderRadius: 12,
    padding: "12px 14px",
    fontWeight: 900,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontSize: "0.62rem",
    cursor: "pointer",
    background: "#fff",
    color: "rgba(43,43,43,0.80)",
  };

  return (
    <>
      <section
        style={{
          padding: isMobile ? "84px 0" : "96px 0",
          background: "var(--bg-off-white)",
          borderTop: "1px solid rgba(212,212,212,0.2)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: isMobile ? 520 : 860,
            margin: "0 auto",
            padding: "0 1.5rem",
          }}
        >
          {/* TITLE */}
          <h2
            style={{
              margin: "0 auto 26px",
              fontWeight: 900,
              color: "var(--primary)",
              letterSpacing: "-0.04em",
              textTransform: "uppercase",
              lineHeight: 0.92,
              fontSize: isMobile ? "2.25rem" : "4.35rem",
              maxWidth: isMobile ? "16ch" : "20ch",
              background: "linear-gradient(to bottom, #111 58%, rgba(0,0,0,0.35))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            READY TO MAKE CONFIDENT INVESTMENTS?
          </h2>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
              marginBottom: 26,
            }}
          >
            {/* OUTLINE button */}
            <button
              onClick={() => navigate("/valuation")}
              style={{
                width: isMobile ? "100%" : 320,
                maxWidth: isMobile ? 520 : 320,
                padding: isMobile ? "18px 18px" : "16px 22px",
                borderRadius: 12,
                fontSize: "0.72rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                background: "#fff",
                color: "var(--primary)",
                border: "2px solid #111",
                cursor: "pointer",
                boxShadow: isMobile
                  ? "0 10px 22px rgba(0,0,0,0.06)"
                  : "0 10px 22px rgba(0,0,0,0.05)",
              }}
            >
              FREE VALUCHECK™
            </button>

            {/* GOLD button */}
            <button
              onClick={() => setShowDealLensModal(true)}
              style={{
                width: isMobile ? "100%" : 420,
                maxWidth: isMobile ? 520 : 520,
                padding: isMobile ? "18px 18px" : "16px 24px",
                borderRadius: 12,
                fontSize: "0.72rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                background: "linear-gradient(90deg, #B87333 0%, #D6B24A 100%)",
                color: "#fff",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 18px 40px rgba(184,115,51,0.25)",
              }}
            >
              GET DEALLENS™: AED 149
            </button>
          </div>

          {/* Footer micro features */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: isMobile ? 12 : 28,
              flexWrap: "wrap",
              flexDirection: isMobile ? "column" : "row",
              alignItems: "center",
            }}
          >
            {[
              { icon: "bolt", text: "60S LATENCY" },
              { icon: "lock", text: "AES-256 AUTH" },
              { icon: "credit_card_off", text: "ZERO COMMITMENT" },
            ].map((it) => (
              <div
                key={it.text}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.6rem",
                  fontWeight: 900,
                  color: "rgba(43,43,43,0.25)",
                  textTransform: "uppercase",
                  letterSpacing: "0.18em",
                }}
              >
                <Icon name={it.icon} size="xs" style={{ color: "rgba(184,115,51,0.45)" }} />
                <span>{it.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ✅ DealLens Coming Soon Popup (same UI as PricingCards) */}
      {showDealLensModal ? (
        <div
          style={modalOverlay}
          onClick={() => setShowDealLensModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div style={modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <div style={modalTitle}>
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    background: "rgba(184,115,51,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon name="schedule" size="sm" style={{ color: "var(--accent-copper)" }} />
                </span>
                Coming Soon
              </div>

              <button
                onClick={() => setShowDealLensModal(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  padding: 6,
                  borderRadius: 10,
                }}
                aria-label="Close"
              >
                <Icon name="close" size="sm" style={{ color: "rgba(43,43,43,0.65)" }} />
              </button>
            </div>

            <div style={modalBody}>
              <div style={{ fontWeight: 900, color: "var(--primary)", marginBottom: 6 }}>DEALLENS™</div>
              This plan is under development and will be available soon. You can start with{" "}
              <b>ValuCheck™</b> right now.
            </div>

            <div style={modalActions} className="ctaModalActions">
              <button style={modalBtnGhost} onClick={() => setShowDealLensModal(false)}>
                CLOSE
              </button>

              <button
                style={modalBtnPrimary}
                onClick={() => {
                  setShowDealLensModal(false);
                  navigate("/valuation");
                }}
              >
                START FREE
              </button>
            </div>

            {/* ✅ Responsive: stack buttons on very small screens */}
            <style>{`
              @media (max-width: 420px){
                .ctaModalActions button{ width: 100%; }
              }
            `}</style>
          </div>
        </div>
      ) : null}
    </>
  );
}


/* ── FOOTER ── */
/* ── FOOTER ── */

function Footer() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .acq-footer-new {
          position: relative;
          background: #F5F5F4;
          border-top: 1px solid rgba(10,10,10,0.06);
          font-family: 'Inter', sans-serif;
        }
        .acq-footer-new .copper-line {
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, #B87333 35%, #B87333 65%, transparent 100%);
        }
        .acq-footer-new .inner {
          max-width: 100%;
          margin: 0 auto;
          padding: 48px 80px 32px;
        }
        .acq-footer-new .main-grid {
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1fr 1fr;
          gap: 32px;
          margin-bottom: 48px;
        }
        .acq-footer-new .col-heading {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
        }
        .acq-footer-new .col-heading-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #B87333;
          opacity: 0.7;
        }
        .acq-footer-new .col-heading h6 {
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.28em;
          color: #0A0A0A;
          margin: 0;
        }
        .acq-footer-new ul {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .acq-footer-new ul li {
          font-size: 11.5px;
          font-weight: 600;
          color: rgba(10,10,10,0.55);
          cursor: pointer;
          transition: color 0.2s;
        }
        .acq-footer-new ul li:hover { color: #B87333; }
        .acq-footer-new ul li.muted {
          color: rgba(10,10,10,0.55);
          cursor: default;
        }
        .acq-footer-new ul li a {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s;
        }
        .acq-footer-new ul li a:hover { color: #B87333; }
        .acq-footer-new .soon-badge {
          padding: 1px 6px;
          font-size: 8px;
          font-weight: 900;
          text-transform: uppercase;
          background: rgba(184,115,51,0.1);
          color: #B87333;
          border: 1px solid rgba(184,115,51,0.2);
          border-radius: 4px;
          margin-left: 6px;
        }
        .acq-footer-new .rics-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: white;
          border: 1px solid rgba(184,115,51,0.2);
          border-radius: 999px;
          margin-bottom: 32px;
        }
        .acq-footer-new .rics-badge span {
          font-size: 9px;
          font-weight: 900;
          color: rgba(10,10,10,0.7);
          text-transform: uppercase;
          letter-spacing: 0.2em;
        }
        .acq-footer-new .social-row { display: flex; gap: 12px; }
        .acq-footer-new .social-btn {
          width: 36px; height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(10,10,10,0.09);
          background: rgba(255,255,255,0.6);
          display: flex; align-items: center; justify-content: center;
          color: rgba(10,10,10,0.35);
          text-decoration: none;
          transition: all 0.2s;
        }
        .acq-footer-new .social-btn:hover {
          color: #B87333;
          border-color: rgba(184,115,51,0.4);
        }
        .acq-footer-new .bottom-bar {
          border-top: 1px solid rgba(10,10,10,0.06);
          padding-top: 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          width: 100%;
        }
        .acq-footer-new .bottom-bar p {
          font-weight: 700;
          color: rgba(10,10,10,0.3);
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.2em;
          margin: 0;
        }
        .acq-footer-new .bottom-bar .not-advice {
          font-weight: 500;
          color: rgba(10,10,10,0.25);
          font-size: 10px;
          margin: 0;
        }
        .acq-footer-new .bottom-location {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .acq-footer-new .bottom-location .logo {
          font-weight: 900;
          font-size: 10px;
          letter-spacing: 0.05em;
        }
        .acq-footer-new .bottom-location .divider {
          width: 1px; height: 12px;
          background: rgba(10,10,10,0.15);
        }
        .acq-footer-new .bottom-location .city {
          font-weight: 600;
          color: rgba(10,10,10,0.35);
          font-size: 10px;
          letter-spacing: 0.05em;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .acq-footer-new .inner { padding: 48px 32px 32px; }
          .acq-footer-new .main-grid { grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
        }
        @media (max-width: 768px) {
          .acq-footer-new .inner { padding: 40px 24px 24px; }
          .acq-footer-new .main-grid { grid-template-columns: 1fr 1fr; gap: 32px 16px; }
          .acq-footer-new .bottom-bar { flex-direction: column; text-align: center; justify-content: center; }
          .acq-footer-new .bottom-location { justify-content: center; }
          .acq-footer-new .not-advice { display: none; }
        }
        @media (max-width: 480px) {
          .acq-footer-new .inner { padding: 40px 16px 20px; }
          .acq-footer-new .main-grid { grid-template-columns: 1fr; gap: 28px; }
        }
      `}</style>

      <footer className="acq-footer-new">
        <div className="copper-line"></div>
        <div className="inner">

          {/* Main grid */}
          <div className="main-grid">

            {/* Brand column */}
            <div>
              <div style={{ marginBottom: 24, lineHeight: 1 }}>
                <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px' }}>
                  <span style={{ color: '#B87333' }}>ACQ</span>
                  <span style={{ color: '#111111' }}>AR</span>
                </span>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.75, color: 'rgba(10,10,10,0.5)', fontWeight: 500, marginBottom: 28, maxWidth: 280 }}>
                The world's first AI-powered property intelligence platform for Dubai real estate. Independent, instant, investment-grade.
              </p>
              <div className="rics-badge">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>RICS-Aligned Intelligence</span>
              </div>
              <div className="social-row">
                {[
                  { href: 'https://www.linkedin.com/company/acqar', label: 'LinkedIn', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
                  { href: 'https://www.instagram.com/acqar.dxb/', label: 'Instagram', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
                ].map(({ href, label, icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    aria-label={label} className="social-btn"
                  >{icon}</a>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <div className="col-heading">
                <span className="col-heading-dot"></span>
                <h6>Product</h6>
              </div>
              <ul>
                <li>
                  <a href="http://www.acqar.com/" target="_blank" rel="noopener noreferrer">
                    TruValu™
                  </a>
                </li>
                <li>
                  <a href="https://signal.acqar.com/" target="_blank" rel="noopener noreferrer">
                    ACQAR Signal™
                  </a>
                </li>
                <li className="muted">ACQAR Passport™</li>
                {/* <li onClick={() => navigate('/pricing')}>Pricing Tiers</li> */}
              </ul>
            </div>

            {/* Company */}
            <div>
              <div className="col-heading">
                <span className="col-heading-dot"></span>
                <h6>Company</h6>
              </div>
              <ul>
                {/* {['About ACQAR', 'How It Works', 'Pricing', 'Contact Us', 'Partners'].map(l => ( */}
                  {['About ACQAR', 'How It Works', 'Contact Us', 'Partners'].map(l => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="col-heading">
                <span className="col-heading-dot"></span>
                <h6>Legal & Info</h6>
              </div>
              <ul>
                <li onClick={() => window.open('https://www.acqar.com/blogs', '_blank')}>Intelligence Blog</li>
                <li onClick={() => navigate('/terms')}>Terms of Use</li>
                <li onClick={() => navigate('/terms')}>Privacy Policy</li>
              </ul>
            </div>

            {/* Comparisons */}
            <div>
              <div className="col-heading">
                <span className="col-heading-dot"></span>
                <h6>Comparisons</h6>
              </div>
              <ul>
                {['vs Bayut TruEstimate', 'vs Property Finder', 'vs Traditional Valuers', 'Why ACQAR?'].map(l => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>

          </div>

          {/* Bottom bar */}
          <div className="bottom-bar">
            <div className="bottom-location">
              <span className="logo">
                <span style={{ color: '#B87333' }}>ACQ</span>
                <span style={{ color: '#0A0A0A' }}>AR</span>
              </span>
              <span className="divider"></span>
              <span className="city">Dubai, United Arab Emirates</span>
            </div>
            <p>© 2026 ACQARLABS L.L.C-FZ. All rights reserved.</p>
            <p className="not-advice">Not financial advice.</p>
          </div>

        </div>
      </footer>
    </>
  );
}
/* ── PRICING PAGE ── */
export default function Pricing() {

  const location = useLocation(); // ✅ add this
  useEffect(() => {
    // instant (no animation) so it never "opens from bottom"
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);
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


