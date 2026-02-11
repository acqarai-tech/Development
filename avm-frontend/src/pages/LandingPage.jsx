import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', sans-serif; -webkit-text-size-adjust: 100%; }

  :root {
    --primary: #2B2B2B;
    --accent-copper: #B87333;
    --gray-light: #D4D4D4;
    --gray-medium: #B3B3B3;
    --bg-off-white: #FAFAFA;
  }

  /* ── ICONS ── */
  .mat-icon {
    font-family: 'Material Symbols Outlined';
    font-weight: normal; font-style: normal;
    font-size: 1.25rem; line-height: 1;
    letter-spacing: normal; text-transform: none;
    display: inline-block; white-space: nowrap;
    direction: ltr; -webkit-font-smoothing: antialiased;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    user-select: none; vertical-align: middle;
  }
  .mat-icon.fill { font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .mat-icon.xs  { font-size: 0.875rem; }
  .mat-icon.sm  { font-size: 1rem; }
  .mat-icon.lg  { font-size: 1.5rem; }
  .mat-icon.xl  { font-size: 2.25rem; }

  /* ── SHARED UTILS ── */
  .architectural-lines {
    background-image: radial-gradient(#2B2B2B 0.5px, transparent 0.5px);
    background-size: 40px 40px; opacity: 0.05;
    position: absolute; inset: 0; z-index: 0; pointer-events: none;
  }
  .gradient-text {
    background: linear-gradient(to right, #B87333, #2B2B2B);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .soft-shadow { box-shadow: 0 20px 50px -12px rgba(43,43,43,0.15); }

  @keyframes pulse {
    0%,100% { opacity: 1; } 50% { opacity: 0.4; }
  }
  .pulse { animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite; }

  /* ── MARQUEE ── */
  @keyframes marquee-left {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .marquee-track {
    display: flex; width: max-content;
    animation: marquee-left 34s linear infinite;
  }
  .marquee-track:hover { animation-play-state: paused; }
  .marquee-wrap {
    overflow: hidden;
    -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
    mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
  }
  .tcard { transition: transform .25s ease, box-shadow .25s ease; }
  .tcard:hover { transform: translateY(-5px); box-shadow: 0 18px 40px rgba(0,0,0,0.11); }

  /* ── CONTAINERS ── */
  .container    { max-width: 80rem; margin: 0 auto; padding: 0 1.5rem; }
  .container-sm { max-width: 64rem; margin: 0 auto; padding: 0 1.5rem; }
  .container-xs { max-width: 56rem; margin: 0 auto; padding: 0 1.5rem; }

  /* ── HEADER — FIXED (never scrolls) ── */
  .site-header {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 200;
    height: 68px;
    border-bottom: 1px solid rgba(212,212,212,0.35);
    background: rgba(255,255,255,0.94);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
  }
  .header-inner {
    height: 100%;
    display: flex; align-items: center; justify-content: space-between;
  }
  .nav-desktop { display: flex; gap: 36px; align-items: center; }
  .nav-cta     { display: flex; align-items: center; gap: 14px; }
  .hamburger   { display: none; background: none; border: none; cursor: pointer; padding: 4px; }

  /* Push content below fixed header */
  .page-body { padding-top: 68px; }

  /* ── MOBILE MENU ── */
  .mobile-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 300;
  }
  .mobile-panel {
    position: absolute; top: 0; right: 0; bottom: 0; width: 280px;
    background: #fff; padding: 24px 20px;
    display: flex; flex-direction: column; gap: 6px;
    box-shadow: -6px 0 30px rgba(0,0,0,0.14);
    overflow-y: auto;
  }
  .mobile-nav-btn {
    width: 100%; text-align: left; padding: 14px 8px;
    background: none; border: none;
    border-bottom: 1px solid #f0f0f0;
    cursor: pointer; font-size: 0.9375rem; font-weight: 600;
    font-family: 'Inter', sans-serif; color: var(--primary);
  }

  /* ── BUTTONS ── */
  .btn-copper {
    background: var(--accent-copper); color: #fff;
    border: 1px solid var(--accent-copper); cursor: pointer;
    font-family: 'Inter', sans-serif; font-weight: 700;
    border-radius: 12px; transition: all .2s;
    display: inline-flex; align-items: center; gap: 10px;
  }
  .btn-copper:hover {
    background: #a6682e;
    box-shadow: 0 14px 34px rgba(184,115,51,0.32);
    transform: translateY(-1px);
  }
  .btn-outline {
    background: #fff; color: var(--primary);
    border: 1px solid var(--gray-light); cursor: pointer;
    font-family: 'Inter', sans-serif; font-weight: 700;
    border-radius: 12px; transition: all .2s;
    display: inline-flex; align-items: center; gap: 10px;
  }
  .btn-outline:hover { background: var(--bg-off-white); border-color: var(--accent-copper); }

  /* ── HERO ── */
  .hero-section { position: relative; overflow: hidden; padding: 56px 0 80px; }
  .hero-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 56px; align-items: center;
    position: relative; z-index: 1;
  }
  .hero-left { display: flex; flex-direction: column; gap: 28px; }
  .hero-headline { font-size: 4.5rem; font-weight: 900; line-height: 1.1; letter-spacing: -.02em; color: var(--primary); }
  .hero-cta-row { display: flex; flex-direction: row; gap: 14px; align-items: center; }

  /* Trust bar */
  .trust-bar {
    margin-top: 48px; position: relative; z-index: 1;
    border: 1px solid rgba(147,197,253,0.5);
    background: rgba(239,246,255,0.3);
    border-radius: 12px; padding: 14px 20px;
    display: flex; flex-wrap: wrap;
    align-items: center; justify-content: center; gap: 28px;
  }

  /* ── STEPS ── */
  .steps-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 20px; margin-bottom: 60px; }

  /* ── STATS ── */
  .stats-grid {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 28px; text-align: center;
    background: var(--primary); border-radius: 24px; padding: 40px;
    border: 1px solid rgba(184,115,51,0.2);
    box-shadow: 0 25px 50px rgba(0,0,0,0.2);
  }

  /* ── FOOTER ── */
  .footer-grid { display: grid; grid-template-columns: 3fr 2fr 2fr 2fr 3fr; gap: 44px; margin-bottom: 72px; }
  .footer-bottom {
    display: flex; justify-content: space-between;
    align-items: center; gap: 16px;
    padding-top: 32px; border-top: 1px solid #e5e7eb;
  }

  /* ══════════════════════════════════
     RESPONSIVE
  ══════════════════════════════════ */

  @media (max-width: 1024px) {
    .hero-grid        { grid-template-columns: 1fr !important; }
    .hero-left        { max-width: 100% !important; }
    .steps-grid       { grid-template-columns: repeat(2,1fr) !important; }
    .footer-grid      { grid-template-columns: 1fr 1fr !important; }
    .footer-brand-col { grid-column: 1 / -1 !important; }
    .stats-grid       { grid-template-columns: 1fr !important; }
    .stats-border     { border-right: none !important; padding-right: 0 !important; border-bottom: 1px solid rgba(255,255,255,0.12) !important; padding-bottom: 24px !important; }
  }

  @media (max-width: 768px) {
    /* Header height */
    .site-header  { height: 60px; }
    .page-body    { padding-top: 60px; }

    /* Nav — hide desktop, show hamburger */
    .nav-desktop  { display: none !important; }
    .nav-cta      { display: none !important; }
    .hamburger    { display: flex !important; align-items: center; }

    /* Hero */
    .hero-section       { padding: 28px 0 40px; }
    .hero-headline      { font-size: 2.55rem !important; }
    .hero-cta-row       { flex-direction: column !important; align-items: stretch !important; gap: 10px !important; }
    .hero-cta-btn       { width: 100% !important; justify-content: center !important; }
    .hero-social-pill   { width: 100% !important; justify-content: center !important; }

    /* Show property card below text on mobile */
    .hero-card-section  { margin-top: 28px; }

    /* Steps */
    .steps-grid   { grid-template-columns: 1fr !important; }

    /* CTA section */
    .cta-headline { font-size: 1.9rem !important; }
    .cta-btn-row  { flex-direction: column !important; align-items: stretch !important; gap: 12px !important; }
    .cta-btn-row button { width: 100% !important; justify-content: center !important; }

    /* Footer */
    .footer-grid    { grid-template-columns: 1fr 1fr !important; }
    .footer-bottom  { flex-direction: column !important; text-align: center !important; }

    /* Trust bar */
    .trust-bar   { gap: 14px !important; }
    .trust-item span { font-size: 0.8rem !important; }

    /* Stats */
    .stats-grid  { padding: 28px 20px !important; }
    .stats-num   { font-size: 1.75rem !important; }
  }

  @media (max-width: 480px) {
    .hero-headline  { font-size: 2rem !important; }
    .container      { padding: 0 1rem !important; }
    .footer-grid    { grid-template-columns: 1fr !important; }
    .partner-logos  { gap: 24px !important; }
    .hero-card-badge { bottom: -14px !important; right: -6px !important; max-width: 148px !important; }
  }
`;

/* ── ICON ── */
function Icon({ name, fill = false, size = "", className = "" }) {
  const sz = { xs:" xs", sm:" sm", lg:" lg", xl:" xl" }[size] || "";
  return <span className={`mat-icon${fill?" fill":""}${sz}${className?" "+className:""}`}>{name}</span>;
}

/* ──────────────────────────────────────
   HEADER
────────────────────────────────────── */
// ✅ ONLY HEADER CHANGED (everything else SAME)
// Replace your existing Header() function with THIS one.
// No other changes required.



 function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const current = location.pathname;

  const navItems = [
    { label: "Products", path: "/" },
    { label: "Pricing", path: "/pricing" },
    { label: "Resources", path: "/resources" },
    { label: "About", path: "/about" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#D4D4D4] bg-white">
        <div className="hdrWrap max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
          
          {/* Logo */}
          <div
            className="hdrLogo flex items-center cursor-pointer shrink-0 whitespace-nowrap"
            onClick={() => navigate("/")}
          >
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-[#2B2B2B] uppercase whitespace-nowrap">
              ACQAR
            </h1>
          </div>

            {/* Mobile pricing */}
           <button
            onClick={() => navigate("/pricing")}
            className={`md:hidden text-[10px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-full ${
              current === "/pricing"
                ? "text-[#B87333] underline underline-offset-4"
                : "text-[#2B2B2B]/70"
            }`}
          >
            Pricing
          </button>


          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap ${
                  current === item.path ? "text-[#B87333]" : "text-[#2B2B2B]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

     {/* Right buttons */}
<div className="hdrRight flex items-center gap-2 sm:gap-4 shrink-0 flex-nowrap">
  {/* Desktop Sign In (unchanged) */}
  {/* <button
    onClick={() => navigate("/login")}
    className="hidden sm:block text-sm font-bold px-4 py-2 text-[#2B2B2B] hover:text-[#B87333] whitespace-nowrap"
  >
    Sign In
  </button> */}

  {/* ✅ MOBILE: Sign In (shows whenever mobile PRICING button is shown) */}
  <button
              onClick={() => navigate("/login")}
              className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
            >
              Sign In
            </button>


  {/* ✅ DESKTOP: Get Started ONLY on md+ */}
  <button
    onClick={() => navigate("/valuation")}
    className="hidden md:inline-flex hdrCta bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
  >
    Get Started
  </button>
</div>

        </div>

        {/* Mobile spacing tweaks (unchanged) */}
        <style>{`
          @media (max-width: 420px){
            .hdrWrap{
              padding-left: 10px !important;
              padding-right: 10px !important;
              gap: 8px !important;
            }

            .hdrLogo h1{
              font-size: 18px !important;
              letter-spacing: -0.02em !important;
            }

            .hdrPricing{
              padding: 6px 10px !important;
              font-size: 9px !important;
              letter-spacing: 0.16em !important;
            }

            .hdrCta{
              padding: 9px 12px !important;
              font-size: 10px !important;
            }
          }

          @media (max-width: 360px){
            .hdrWrap{ gap: 6px !important; }

            .hdrPricing{
              padding: 6px 8px !important;
              letter-spacing: 0.12em !important;
            }

            .hdrCta{
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




/* ──────────────────────────────────────
   PROPERTY CARD (shared between hero columns)
────────────────────────────────────── */
function PropertyCard() {
  return (
    <div className="relative w-full px-4 sm:px-0 sm:max-w-[520px] sm:mx-auto">
      {/* soft glow */}
      <div
        className="absolute -inset-3 sm:-inset-4 rounded-[28px] sm:rounded-[32px]"
        style={{
          background: "rgba(43,43,43,0.05)",
          filter: "blur(28px)",
        }}
      />

      <div
        className="
          soft-shadow relative w-full bg-white
          border border-[rgba(212,212,212,0.35)]
          rounded-3xl sm:rounded-2xl
          overflow-hidden sm:overflow-visible
          px-4 py-4 sm:p-7
        "
      >
        {/* Card header */}
        <div className="flex items-start justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            {/* icon box */}
            <div
              className="w-11 h-11 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(43,43,43,0.09)" }}
            >
              <Icon name="analytics" />
            </div>

            <div>
              {/* ✅ Mobile: keep Palm Jumeirah on ONE line, Villa second line */}
              <p className="font-bold text-[15px] sm:text-sm text-[var(--primary)] leading-tight">
                <span className="block whitespace-nowrap">Palm Jumeirah</span>
                <span className="block">Villa</span>
              </p>

              {/* ✅ Never wrap ID */}
              <p className="text-[11px] sm:text-[12px] text-[rgba(43,43,43,0.40)] whitespace-nowrap">
                ID: ACQ-7721-DUBAI
              </p>
            </div>
          </div>

          {/* LIVE badge */}
          {/* LIVE badge (mobile exactly like 1st screenshot) */}
<span
  className="
    rounded-full
    text-[11px] sm:text-[10px]
    font-extrabold uppercase tracking-[0.12em]
    text-[var(--primary)]
    px-5 py-2 sm:px-3 sm:py-1.5
    leading-[1.05] text-center
  "
  style={{ background: "rgba(212,212,212,0.85)" }}
>
  <span className="block sm:hidden">LIVE</span>
  <span className="block sm:hidden">ANALYSIS</span>
  <span className="hidden sm:inline">Live Analysis</span>
</span>

        </div>

        {/* Value */}
        <div className="mb-4 sm:mb-5">
          <p className="text-[10px] sm:text-[9px] uppercase font-extrabold tracking-[0.18em] text-[rgba(43,43,43,0.40)] mb-1">
            Estimated Value
          </p>

          {/* ✅ Mobile: keep AED + number on ONE line always */}
          <h3
            className="font-black text-[var(--primary)] tracking-[-0.02em] leading-[1.02] whitespace-nowrap"
            style={{
              fontSize: "clamp(34px, 9.2vw, 44px)", // ✅ responsive, prevents wrap
            }}
          >
            AED 4,250,000
          </h3>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 gap-3 mb-4 sm:mb-5">
          <div className="rounded-2xl sm:rounded-xl p-4 sm:p-3.5 bg-[var(--bg-off-white)]">
            <p className="text-[10px] sm:text-[9px] uppercase font-extrabold tracking-[0.12em] text-[rgba(43,43,43,0.40)] mb-2">
              Investment Score
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-2xl font-black text-[var(--primary)]">
                87
              </span>
              <span className="text-sm sm:text-xs text-[rgba(43,43,43,0.40)]">
                / 100
              </span>
            </div>
          </div>

          <div className="rounded-2xl sm:rounded-xl p-4 sm:p-3.5 bg-[var(--bg-off-white)]">
            <p className="text-[10px] sm:text-[9px] uppercase font-extrabold tracking-[0.12em] text-[rgba(43,43,43,0.40)] mb-2">
              Market Volatility
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-lg font-black text-[var(--primary)]">
                Low
              </span>
              <Icon name="trending_down" size="sm" />
            </div>
          </div>
        </div>

        {/* Bar chart (straight tops) */}
        <div
          className="
            bg-[var(--bg-off-white)]
            flex items-end
            px-3 sm:px-1
            gap-2 sm:gap-1
            mb-4 sm:mb-5
            h-[95px] sm:h-[88px]
            rounded-2xl sm:rounded-lg
          "
        >
          {[
            ["38%", "rgba(43,43,43,0.10)"],
            ["50%", "rgba(43,43,43,0.12)"],
            ["40%", "rgba(43,43,43,0.10)"],
            ["70%", "rgba(43,43,43,0.35)"],
            ["62%", "rgba(184,115,51,0.55)"],
            ["82%", "rgba(43,43,43,0.55)"],
            ["92%", "var(--primary)"],
          ].map(([h, bg], i) => (
            <div
              key={i}
              className="flex-1"          // ✅ no rounded corners (straight top)
              style={{ height: h, background: bg }}
            />
          ))}
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between pt-4 border-t border-[rgba(212,212,212,0.30)]">
          <div className="flex items-center gap-2">
            <Icon name="history" size="sm" />
            <span className="text-[10px] sm:text-[9px] font-extrabold text-[rgba(43,43,43,0.35)] uppercase tracking-[0.18em] whitespace-nowrap">
              GENERATED IN 5S
            </span>
          </div>

          <button
            className="text-[12px] sm:text-[12px] font-bold text-[var(--primary)] bg-transparent border-0 cursor-pointer flex items-center gap-2 whitespace-nowrap"
            style={{ fontFamily: "'Inter',sans-serif" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-copper)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--primary)")}
          >
            Download PDF <Icon name="download" size="sm" />
          </button>
        </div>

        {/* ✅ RICS badge on MOBILE: smaller + bottom-right like screenshot */}
        {/* ✅ RICS badge on MOBILE: bottom-right, small, like 1st screenshot */}
<div
  className="
    sm:hidden
    absolute right-3 bottom-3
    bg-white
    border border-[rgba(212,212,212,0.30)]
    rounded-2xl
    px-3 py-2.5
    flex items-center gap-3
  "
  style={{
    boxShadow: "0 8px 28px rgba(0,0,0,0.10)",
    width: 230,               // ✅ fixed width to prevent centering / stretching
  }}
>
  <div
    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
    style={{ background: "var(--accent-copper)" }}
  >
    <Icon name="verified" size="xs" />
  </div>

  <p className="text-[11px] font-medium leading-snug text-[var(--primary)]">
    Institutional Quality RICS-Standard AI
  </p>
</div>

      </div>

      {/* Desktop badge stays same */}
      <div
        className="hidden sm:flex absolute -bottom-5 -right-4 bg-white border border-[rgba(212,212,212,0.30)] rounded-xl px-3 py-3 items-center gap-3 max-w-[170px]"
        style={{ boxShadow: "0 8px 28px rgba(0,0,0,0.10)" }}
      >
        <div className="w-8 h-8 rounded-full bg-[var(--accent-copper)] flex items-center justify-center shrink-0">
          <Icon name="verified" size="xs" />
        </div>
        <p className="text-[10px] font-medium leading-snug text-[var(--primary)]">
          Institutional Quality RICS-Standard AI
        </p>
      </div>
    </div>
  );
}



/* ──────────────────────────────────────
   HERO
────────────────────────────────────── */
function Hero() {
  const navigate = useNavigate();

  return (
    <section
      className="hero-section"
      style={{
        paddingTop: 0,
        paddingBottom: 24,
      }}
    >
      <div className="architectural-lines" />

      <div className="container">
        <div className="hero-grid" style={{ marginTop: 0 }}>
          {/* ── LEFT TEXT ── */}
          <div className="hero-left" style={{ marginTop: 0, paddingTop: 0 }}>
            {/* Pill badge */}
            <div
              style={{
                marginTop: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 14px",
                background: "rgba(184,115,51,0.1)",
                border: "1px solid rgba(184,115,51,0.22)",
                borderRadius: 9999,
                width: "fit-content",
              }}
            >
              <span
                className="pulse"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--accent-copper)",
                  display: "inline-block",
                }}
              />
              <span
                style={{
                  fontSize: ".625rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: ".16em",
                  color: "var(--accent-copper)",
                }}
              >
                Where Dreams Meet Data
              </span>
            </div>

            {/* ✅ HEADLINE UPDATED (mobile matches your 2nd screenshot) */}
            <h1 className="hero-headline" style={{ marginTop: 10 }}>
              {/* Desktop text (unchanged look) */}
              <span className="hero-headline-desktop">
                See The Future.<br />
                <span className="gradient-text">Invest With Certainty.</span>
              </span>

              {/* Mobile text (forced lines like screenshot) */}
              <span className="hero-headline-mobile">
                <span>See The</span>
                <span>Future.</span>
                <span className="gradient-text">Invest With</span>
                <span className="gradient-text">Certainty.</span>
              </span>
            </h1>

            {/* Subtext */}
            <p
              style={{
                marginTop: 10,
                fontSize: "1.1rem",
                color: "rgba(43,43,43,0.62)",
                lineHeight: 1.7,
              }}
            >
              Enterprise-grade property intelligence for modern investors. Institutional accuracy, real-time data, and
              instant transparency.
            </p>

            {/* CTA + Social proof */}
            <div className="hero-mobile-stack">
              <button
                className="btn-copper hero-cta-btn hero-cta-full"
                onClick={() => navigate("/valuation")}
                style={{ padding: "18px 28px", fontSize: "1rem" }}
              >
                Get Your Free Valuation <Icon name="arrow_forward" />
              </button>

              <div
                className="hero-social-pill hero-social-full"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  border: "1px solid var(--gray-light)",
                  borderRadius: 14,
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex" }}>
                  {[
                    "AB6AXuA1AfKa0TeL3cutDm2oORjvyJfaZ4sWKjqoymij-VUfwqkb45DX_8i2TZxTL5iJwibp3eJhiolBRUnVXZJLyLX6ngOHCGgzJySTVCswUzMNX1SXHMpZaqBWe94zpXJjaCSWAFGAHlvIe2TLAgoei80lt5n1ecefPDbNqUPHJ2d3kDXpU3i6tSWHaa1SxdUWHu12D1w2VM1cggHgyKK3zb1QAnEf7D-QPEiZK5hKc9TxAPyVm9ofoWHgwoFP68S1Wzs-HgyJ_KEzQfw",
                    "AB6AXuC6t4ms24nlSJb-UnR35BnGcMuHPPgXWLkF3m44dIr8GjwERYw9AtbnnI1EYqkXR3iECnKAyYFkFNau6QJGMOJCJHngAyyXIgjJcUF_PZPb-h41AYfwYA5es1lWZyctwVgdWK3HxpAHArohK4Pp4xjd0YSW_h39WyReIqHcZl8XlOevIqbNEFV0NIWvXS_SSHPJGqNV3ofaJu4pp2BfXm9Q1AlrS9ix-UJq7kjpP8-mHnNMSrvMpf0JeOIrGzH_8GkB0N3xLu_rQ3I",
                  ].map((id, i) => (
                    <img
                      key={i}
                      src={`https://lh3.googleusercontent.com/aida-public/${id}`}
                      alt=""
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        border: "2px solid #fff",
                        marginRight: i === 0 ? -10 : 0,
                        objectFit: "cover",
                      }}
                    />
                  ))}
                </div>
                <div>
                  <p style={{ fontSize: ".95rem", fontWeight: 800, color: "var(--primary)", lineHeight: 1.1 }}>
                    2,400+
                  </p>
                  <p style={{ fontSize: ".8rem", color: "rgba(43,43,43,0.45)" }}>Active Investors</p>
                </div>
              </div>

              <div className="hero-card-mobile">
                <PropertyCard />
              </div>
            </div>
          </div>

          {/* ── RIGHT: Card (desktop only) ── */}
          <div className="hero-right-col">
            <PropertyCard />
          </div>
        </div>

     {/* Trust bar */}
<div
  className="trust-bar"
  style={{
    marginTop: 30,

    // ✅ desktop (keep as-is)
    padding: "22px 28px",
    border: "1px solid #cfd8e3",
    borderRadius: 12,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
    background: "#f7f9fc",
    width: "100%",
    maxWidth: "97%",
  }}
>
  {[
    ["check_circle", "100% Independent"],
    ["check_circle", "10,000+ Valuations"],
    ["check_circle", "RICS-Aligned"],
  ].map(([icon, label]) => (
    <div
      key={label}
      className="trust-item"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <Icon name={icon} size="sm" />
      <span
        style={{
          fontSize: "0.78rem",
          fontWeight: 600,
          color: "var(--primary)",
        }}
      >
        {label}
      </span>
    </div>
  ))}

  {/* ✅ MOBILE ONLY OVERRIDES (desktop untouched) */}
<style>{`
/* MOBILE + TABLET */
@media (max-width:1024px){

/* increase gap between first and second item */
  .trust-item:nth-child(1){
    margin-right: 8px !important;
  }

  .trust-item:nth-child(2){
    margin-left: 6px !important;
  }

  .trust-bar{
    width:100% !important;
    max-width:100% !important;
    box-sizing:border-box !important;

    height:56px !important;
    padding:0 14px !important;

    border:1.5px solid #bcd4ff !important;
    border-radius:18px !important;
    background:#f7f9fc !important;

    display:flex !important;
    align-items:center !important;
    justify-content:space-between !important;

    gap:6px !important;
    overflow:hidden !important;     /* no scroll */
  }

  .trust-item{
    display:flex !important;
    align-items:center !important;
    justify-content:center !important;
    gap:5px !important;

    flex:1 1 0 !important;          /* equal width */
    min-width:0 !important;         /* allow shrink */
    white-space:nowrap !important;
  }

  .trust-item span{
    font-size:clamp(0.60rem, 2.1vw, 0.82rem) !important;
    font-weight:700 !important;
    line-height:1 !important;
    white-space:nowrap !important;
  }

  .trust-item svg,
  .trust-item .icon{
    width:clamp(13px, 2.2vw, 18px) !important;
    height:clamp(13px, 2.2vw, 18px) !important;
    flex:0 0 auto !important;
  }
}

/* SMALL PHONES (≤420px) */
@media (max-width:420px){

  .trust-bar{
    height:52px !important;
    padding:0 10px !important;
    gap:4px !important;
  }

  .trust-item span{
    font-size:clamp(0.55rem, 2.8vw, 0.72rem) !important;
  }
}

/* VERY SMALL PHONES (≤360px) */
@media (max-width:360px){

  .trust-bar{
    height:50px !important;
    padding:0 8px !important;
    gap:3px !important;
  }

  .trust-item span{
    font-size:0.58rem !important;
  }
}
`}</style>





</div>


      </div>

      {/* ✅ Responsive rules */}
      <style>{`
        .hero-right-col { position: relative; }

        .hero-mobile-stack {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .hero-cta-full { width: auto; }
        .hero-social-full { width: fit-content; }
        .hero-card-mobile { display: none; }

        /* ✅ Headline switching */
        .hero-headline-mobile { display: none; }
        .hero-headline-desktop { display: inline; }

        @media (max-width: 1024px) {
          .hero-right-col { display: none !important; }

          .hero-cta-full { width: 100% !important; border-radius: 14px !important; }
          .hero-social-full { width: 100% !important; border-radius: 14px !important; }

          .hero-card-mobile { display: block !important; margin-top: 6px; }

          /* ✅ Mobile headline exactly like screenshot */
          .hero-headline-desktop { display: none !important; }
          .hero-headline-mobile { display: inline !important; }

          .hero-headline-mobile span {
            display: block;
            line-height: 0.95;
          }

          .hero-headline {
            font-size: 3.15rem !important;
            letter-spacing: -0.03em !important;
          }
        }
      `}</style>
    </section>
  );
}



/* ──────────────────────────────────────
   HOW IT WORKS
────────────────────────────────────── */
function HowItWorks() {
  const navigate = useNavigate();

  const steps = [
    { icon: "feed",          n: "1", title: "Enter Details",     desc: "Property location, size, and features.",          tag: "INPUT DATA" },
    { icon: "memory",        n: "2", title: "AI Analysis",       desc: "Comp selection, market signals, RICS standards",  tag: "PROCESSING ENGINE" },
    { icon: "auto_awesome",  n: "3", title: "Instant Valuation", desc: "Accurate value, confidence score, hidden costs",  tag: "60 SECONDS", star: true },
    { icon: "file_download", n: "4", title: "Actionable Report", desc: "Investment grade, shareable PDF, API-ready!",     tag: "VALUE OUTPUT" },
  ];

  return (
    <section style={{ padding: "88px 0", background: "var(--bg-off-white)" }}>
      <div className="container">
        <div style={{ textAlign: "center", maxWidth: 500, margin: "0 auto 56px" }}>
          <h2 style={{ fontSize: "1.875rem", fontWeight: 900, color: "var(--primary)", marginBottom: 14 }}>
            How TruValu™ Works
          </h2>
          <p style={{ color: "rgba(43,43,43,0.6)", lineHeight: 1.65 }}>
            From property input to investment intelligence in 60 seconds.
          </p>
        </div>

        {/* Video placeholder */}
        <div style={{ marginBottom: 68 }}>
          <div
            style={{
              position: "relative",
              maxWidth: "56rem",
              margin: "0 auto",
              aspectRatio: "16/9",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 22px 55px rgba(0,0,0,0.24)",
              background: "var(--primary)",
              cursor: "pointer",
            }}
          >
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7qkQArw2TmVGHNN9bcf75S4yDTxSbb9X-TVkQ26MW3akEDTfYgjcPNAMwG0SkcAG8hSo9OwHLiOE94qYlTvYTFMlaoEZG2KFf7HYeXlo9jc2_nMQde_AR3wiRHtiEFrFHqytfb2XyHe3friA06okLMLV8xm2Oit_9jwxLue01sF6BEh6WrXRZbTV2GWkZyyvk_jcA3pwdJZvF65ddn9KLcEcirbxK6jPC2I0AkMIwxtpevnSSzfsJNaFGb2aJJWdiuwnxgkbMzq0"
              alt="Dubai skyline"
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }}
            />

            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  width: 92,
                  height: 92,
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.28)",
                }}
              >
                <div
                  style={{
                    width: 76,
                    height: 76,
                    background: "#fff",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 34, color: "var(--primary)" }}>
                    play_arrow
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step cards */}
        <div className="steps-grid">
          {steps.map((s) => (
            <div
              key={s.n}
              style={{
                background: "#fff",
                padding: 28,
                borderRadius: 14,
                border: s.star ? "1px solid var(--accent-copper)" : "1px solid var(--gray-light)",
                boxShadow: s.star ? "0 0 0 4px rgba(184,115,51,.06)" : "none",
                position: "relative",
                transition: "border-color .2s",
              }}
              onMouseEnter={(e) => {
                if (!s.star) e.currentTarget.style.borderColor = "var(--accent-copper)";
              }}
              onMouseLeave={(e) => {
                if (!s.star) e.currentTarget.style.borderColor = "var(--gray-light)";
              }}
            >
              {s.star && (
                <div
                  style={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    background: "white",
                    color: "var(--accent-copper)",
                    padding: "2px 8px",
                    borderRadius: 4,
                    fontSize: ".5rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: ".05em",
                  }}
                >
                  Instant
                </div>
              )}

              <div
                style={{
                  width: 46,
                  height: 46,
                  background: "rgba(226, 215, 215, 0.6)",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 20,
                }}
              >
                {/* ✅ FIX: Material Symbols icon + correct color on star card */}
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontSize: 22,
                    color:  "black",
                  }}
                >
                  {s.icon}
                </span>
              </div>

              <h5 style={{ fontSize: "1.0625rem", fontWeight: 700, marginBottom: 8, color: "var(--primary)" }}>
                {s.n}. {s.title}
              </h5>

              <p
                style={{
                  fontSize: ".875rem",
                  color: "rgba(43,43,43,0.6)",
                  lineHeight: 1.6,
                  fontWeight: s.star ? 600 : 400,
                }}
              >
                {s.desc}
              </p>

              <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f3f3f3" }}>
                <span
                  style={{
                    fontSize: ".5625rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: ".15em",
                    color: s.star ? "var(--accent-copper)" : "rgba(43,43,43,0.4)",
                  }}
                >
                  {s.tag}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            className="btn-copper"
            onClick={() => navigate("/valuation")}
            style={{ padding: "18px 38px", fontSize: "1.0625rem" }}
          >
            Get My Free Valuation Now{" "}
            <span className="material-symbols-outlined" style={{ fontSize: 20, marginLeft: 8 }}>
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────
   TESTIMONIALS
────────────────────────────────────── */
const TESTIMONIALS = [
  { name:"Ahmed Al Mansouri", role:"Chairman, ALM International",   quote:"ACQAR provides the kind of certainty usually reserved for institutional funds. In 60 seconds, I had a valuation that matched my appraiser's 5-day study.", img:"https://picsum.photos/200/200?random=10" },
  { name:"Sarah J.",          role:"Private Wealth Manager",         quote:"The precision is unmatched in the Dubai market. It's now our primary tool for quarterly portfolio rebalancing and client reporting.",                       img:"https://picsum.photos/200/200?random=11" },
  { name:"Julian Chen",       role:"PE Associate, Global Capital",   quote:"We've reduced our appraisal timelines by 80% using TruValu™ technology. The market speed requires tools like this to close high-ticket deals.",            img:"https://picsum.photos/200/200?random=12" },
  { name:"Elena Rodriguez",   role:"Luxury Property Investor",       quote:"Finally, a platform that understands the nuances of prime real estate. The DealLens analysis saved me from a significantly overpriced acquisition.",         img:"https://picsum.photos/200/200?random=13" },
  { name:"Marcus Thorne",     role:"Portfolio Director",             quote:"Institutional-grade data at your fingertips. ACQAR has fundamentally changed how we evaluate exit opportunities in the Palm Jumeirah area.",                 img:"https://picsum.photos/200/200?random=14" },
  { name:"Fatima Al Sayed",   role:"Real Estate Developer",          quote:"The RICS-aligned intelligence gives our international investors the confidence they need in the Dubai market. Indispensable tool.",                           img:"https://picsum.photos/200/200?random=15" },
];

function TCard({ t }) {
  return (
    <div className="tcard" style={{ width:308, flexShrink:0, padding:26, background:"#fff", borderRadius:14, border:"1px solid rgba(212,212,212,0.35)", boxShadow:"0 3px 14px rgba(0,0,0,0.05)", margin:"0 10px" }}>
      <div style={{ display:"flex", gap:3, marginBottom:14, color:"var(--accent-copper)" }}>
        {[1,2,3,4,5].map(i => <Icon key={i} name="star" fill size="sm" />)}
      </div>
      <p style={{ fontSize:".875rem", fontStyle:"italic", color:"rgba(43,43,43,0.7)", lineHeight:1.65, marginBottom:18, minHeight:80 }}>"{t.quote}"</p>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <img src={t.img} alt={t.name} style={{ width:42, height:42, borderRadius:"50%", objectFit:"cover", border:"2px solid var(--bg-off-white)" }} />
        <div>
          <p style={{ fontWeight:700, fontSize:".8rem", color:"var(--primary)" }}>{t.name}</p>
          <p style={{ fontSize:".6875rem", color:"rgba(43,43,43,0.5)" }}>{t.role}</p>
        </div>
      </div>
    </div>
  );
}

function Testimonials() {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];
  return (
    <section style={{ padding:"88px 0", background:"#fff", borderTop:"1px solid rgba(212,212,212,0.22)", borderBottom:"1px solid rgba(212,212,212,0.22)", overflow:"hidden" }}>
      <div className="container" style={{ marginBottom:52 }}>
      <div
  style={{
    textAlign: "center",
    maxWidth: 900,          // wider for desktop
    margin: "0 auto",
    padding: "0 18px",
  }}
>
  {/* Top small label */}
  <p
    style={{
      margin: 0,
      marginBottom: 14,
      fontSize: "clamp(10px, 1.2vw, 12px)",
      fontWeight: 900,
      letterSpacing: "0.28em",
      textTransform: "uppercase",
      color: "var(--accent-copper)",
    }}
  >
    TRUSTED INTELLIGENCE
  </p>

  {/* Main heading */}
  <h2
    style={{
      margin: 0,
      fontWeight: 900,
      color: "var(--primary)",
      lineHeight: 1.08,
      letterSpacing: "-0.02em",
      fontSize: "clamp(2.1rem, 4.2vw, 3.2rem)", // perfect for desktop + mobile
      marginBottom: 16,
    }}
  >
    Elite Investor Insights
  </h2>

  {/* Sub text */}
  <p
    style={{
      margin: 0,
      color: "rgba(43,43,43,0.55)",
      lineHeight: 1.7,
      fontSize: "clamp(0.95rem, 1.4vw, 1.1rem)",
      maxWidth: 680,
      marginInline: "auto",
    }}
  >
    Why the world's leading property owners rely on ACQAR for precision.
  </p>
</div>


      </div>

      <div className="marquee-wrap">
        <div className="marquee-track">
          {doubled.map((t, i) => <TCard key={i} t={t} />)}
        </div>
      </div>

      {/* Stats block */}
      <div className="container" style={{ marginTop:64 }}>
        <div className="stats-grid">
          {[["10,000+","Valuations Performed"],["4.9 / 5","Investor Rating"],["AED 500M+","Capital Analyzed"]].map(([num,lbl],i) => (
            <div key={lbl} className={i<2 ? "stats-border" : ""} style={{ borderRight: i<2 ? "1px solid rgba(255,255,255,0.1)" : "none", paddingRight: i<2 ? 28 : 0 }}>
              <h6 className="stats-num" style={{ fontSize:"2.25rem", fontWeight:900, color:"#fff", marginBottom:8, textTransform:"uppercase" }}>{num}</h6>
              <p style={{ fontSize:".5625rem", color:"var(--accent-copper)", fontWeight:700, letterSpacing:".16em", textTransform:"uppercase" }}>{lbl}</p>
            </div>
          ))}
        </div>

        {/* Partner logos */}
        
      </div>
    </section>
  );
}

/* ──────────────────────────────────────
   CTA SECTION
────────────────────────────────────── */
function CTASection() {
  const navigate = useNavigate();
  return (
    <section style={{ padding:"112px 0", position:"relative", overflow:"hidden", background:"#fff" }}>
      <div className="architectural-lines" />
      <div className="container-xs" style={{ textAlign:"center", position:"relative", zIndex:1 }}>
        <h2 className="cta-headline" style={{ fontSize:"3rem", fontWeight:900, color:"var(--primary)", marginBottom:28, lineHeight:1.2 }}>
          Ready to See Your Property's<br />
          <span style={{ color:"var(--accent-copper)" }}>True Value?</span>
        </h2>
        <p style={{ fontSize:"1.1rem", color:"rgba(43,43,43,0.6)", maxWidth:500, margin:"0 auto 44px", lineHeight:1.7 }}>
          Join 10,000+ property owners who discovered their property's complete investment potential with ACQAR's TruValu™ analysis.
        </p>
        <div className="cta-btn-row" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
          <button className="btn-copper" onClick={() => navigate("/valuation")} style={{ padding:"18px 36px", fontSize:"1.0625rem" }}>
            Get My Free Valuation Now <Icon name="arrow_forward" />
          </button>
          <button className="btn-outline" style={{ padding:"18px 36px", fontSize:"1.0625rem" }}>
            Talk to an Expert
          </button>
        </div>
        <p style={{ marginTop:28, fontSize:".75rem", color:"rgba(43,43,43,0.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:".12em" }}>
          Results in 60 Seconds • 100% Secure • No Credit Card Required
        </p>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────
   FOOTER
────────────────────────────────────── */
/* ── FOOTER ── */
function Footer() {
  const cols = [
    ["PRODUCT", ["TruValu™ Products", "ValuCheck™ (FREE)", "DealLens™", "InvestIQ™", "CertiFi™", "Compare Tiers"]],
    ["COMPANY", ["About ACQAR", "How It Works", "Pricing", "Contact Us", "Partners", "Press Kit"]],
    ["RESOURCES", ["Help Center", "Market Reports", "Blog Column 5", "Comparisons"]],
    ["COMPARISONS", ["vs Bayut TruEstimate", "vs Property Finder", "vs Traditional Valuers", "Why ACQAR?"]],
  ];

  const lnk = {
    fontSize: ".75rem",
    color: "rgba(43,43,43,0.6)",
    fontWeight: 500,
    cursor: "pointer",
    listStyle: "none",
    transition: "color .2s",
    lineHeight: 1.5,
  };

  return (
    <footer
      style={{
        background: "var(--bg-off-white)",
        borderTop: "1px solid #e5e7eb",
        paddingTop: 64,
        paddingBottom: 28,
      }}
    >
      {/* TOP GRID */}
      <div className="container footer-grid">
        {/* Brand */}
        <div className="footer-brand-col">
          {/* NOTE: Desktop screenshot shows just ACQAR text (no square icon). */}
          <span
            style={{
              display: "inline-block",
              fontSize: "1rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: ".04em",
              color: "var(--primary)",
              marginBottom: 14,
            }}
          >
            ACQAR
          </span>

          <p
            style={{
              fontSize: ".75rem",
              color: "rgba(43,43,43,0.6)",
              lineHeight: 1.7,
              marginBottom: 16,
              maxWidth: 260,
            }}
          >
            The world's first AI-powered property intelligence platform for Dubai real estate. Independent, instant,
            investment-grade.
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: "#fff",
              border: "1px solid #f3f4f6",
              borderRadius: 10,
              width: "fit-content",
              marginBottom: 16,
            }}
          >
            <Icon name="verified" size="sm" />
            <span
              style={{
                fontSize: ".56rem",
                fontWeight: 800,
                color: "rgba(43,43,43,0.85)",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                whiteSpace: "nowrap",
              }}
            >
              RICS-Aligned Intelligence
            </span>
          </div>

          {/* Social (only LinkedIn shown in screenshot) */}
        {/* Social (LinkedIn) */}
<div style={{ display: "flex", gap: 12 }}>
  <a
    href="https://www.linkedin.com/company/acqar"   // 🔵 put your real LinkedIn page here
    target="_blank"
    rel="noopener noreferrer"
    style={{
      width: 34,
      height: 34,
      borderRadius: "50%",
      border: "1px solid #e5e7eb",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "rgba(43,43,43,0.4)",
      transition: "all .2s",
      textDecoration: "none",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = "var(--accent-copper)";
      e.currentTarget.style.borderColor = "var(--accent-copper)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = "rgba(43,43,43,0.4)";
      e.currentTarget.style.borderColor = "#e5e7eb";
    }}
  >
    {/* LinkedIn SVG icon */}
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5S1.1 1 2.48 1c1.38 0 2.5 1.12 2.5 2.5zM0 8h5v16H0V8zm7.5 0h4.8v2.2h.1c.67-1.2 2.3-2.4 4.73-2.4C22.2 7.8 24 10.2 24 14.1V24h-5v-8.5c0-2-.04-4.6-2.8-4.6-2.8 0-3.2 2.2-3.2 4.4V24h-5V8z"/>
    </svg>
  </a>
</div>

        </div>

        {/* Columns */}
        {cols.map(([title, items]) => (
          <div key={title} className="footer-col">
            <h6
              style={{
                fontWeight: 800,
                fontSize: ".8rem",
                marginBottom: 18,
                textTransform: "uppercase",
                letterSpacing: ".14em",
                color: "var(--primary)",
              }}
            >
              {title}
            </h6>

            <ul style={{ display: "flex", flexDirection: "column", gap: 12, padding: 0, margin: 0 }}>
              {items.map((item) => (
                <li
                  key={item}
                  style={lnk}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-copper)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(43,43,43,0.6)")}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      

      {/* BOTTOM ROW */}
      <div className="container footer-bottom">
        <div className="footer-copy">
          <p
            style={{
              fontSize: ".56rem",
              fontWeight: 800,
              color: "rgba(43,43,43,0.4)",
              textTransform: "uppercase",
              letterSpacing: ".12em",
              margin: 0,
            }}
          >
            © 2025 ACQARLABS L.L.C-FZ. All rights reserved.
          </p>
          <p
            style={{
              fontSize: ".5rem",
              color: "rgba(43,43,43,0.3)",
              textTransform: "uppercase",
              marginTop: 3,
              marginBottom: 0,
            }}
          >
            TruValu™ is a registered trademark.
          </p>
        </div>

        <div className="footer-legal">
          {["Legal links", "Terms", "Privacy", "Cookies", "Security"].map((l) => (
            <a
              key={l}
              href="#"
              className="footer-legal-link"
              style={{
                fontSize: ".56rem",
                fontWeight: 800,
                color: "rgba(43,43,43,0.4)",
                textTransform: "uppercase",
                letterSpacing: ".12em",
                textDecoration: "none",
                transition: "color .2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(43,43,43,0.4)")}
            >
              {l}
            </a>
          ))}
        </div>
      </div>

      {/* RESPONSIVE CSS (matches your screenshots) */}
      <style>{`
        /* Desktop: Brand + 4 columns like screenshot */
        .footer-grid{
          display:grid;
          grid-template-columns: 1.3fr 1fr 1fr 1fr 1fr;
          gap: 56px;
          align-items:start;
        }

        /* Bottom row: left copy + right legal links */
        .footer-bottom{
          margin-top: 18px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 24px;
        }

        .footer-legal{
          display:flex;
          align-items:center;
          gap: 26px;
          justify-content:flex-end;
          flex-wrap:wrap;
        }

        /* Mobile: stacked like your screenshots */
        @media (max-width: 768px){
          footer{ padding-top: 40px !important; }

          .footer-grid{
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }

          .footer-brand-col p{ max-width: 100% !important; }

          .footer-bottom{
            flex-direction:column;
            align-items:center;
            text-align:center;
            gap: 14px;
          }

          .footer-legal{
            justify-content:center;
            gap: 18px;
          }

          /* Helps "SECURITY" drop to next line if needed like screenshot */
          .footer-legal-link{
            display:inline-block;
            padding: 2px 0;
          }
        }
      `}</style>
    </footer>
  );
}

/* ──────────────────────────────────────
   APP ROOT
────────────────────────────────────── */
export default function App() {
  return (
    <>
      <style>{styles}</style>
      <div style={{ background:"#fff", color:"var(--primary)", fontFamily:"'Inter',sans-serif", overflowX:"hidden" }}>
        <Header />
        <div className="page-body">
          <Hero />
          <HowItWorks />
          <Testimonials />
          <CTASection />
          <Footer />
        </div>
      </div>
    </>
  );
}
