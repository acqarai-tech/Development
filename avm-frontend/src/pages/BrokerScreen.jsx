// // =============================================================================
// // BrokerScreen.jsx  — COMPLETE VERSION
// // Content: 100% from AcqarBrokerLandingPage.jsx  (nothing omitted)
// // UI Design: from code.html  (copper/zinc, architectural, Inter Black)
// // Additions: CTA after every section · fully mobile-responsive
// // =============================================================================

// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";

// // ─── Brand Tokens ─────────────────────────────────────────────────────────────
// const C = {
//   brand:         "#B87333",
//   brandDark:     "#96591E",
//   brandBg:       "#B8733314",
//   brandBorder:   "#B8733340",
//   bgCream:       "#F8F7F3",
//   bgWhite:       "#FFFFFF",
//   bgDark:        "#0F0E0C",
//   bgDarkCard:    "#181714",
//   bgDarkSurface: "#0A0906",
//   textPrimary:   "#1A1B1E",
//   textSecondary: "#6B6A66",
//   textMuted:     "#9B9A96",
//   borderLight:   "#E5E7EB",
//   borderDark:    "#2C2A27",
//   green:         "#16A34A",
//   greenLight:    "#22C55E",
//   greenBg:       "#F0FDF4",
//   greenBorder:   "#BBF7D0",
//   red:           "#DC2626",
//   redLight:      "#EF4444",
//   redBg:         "#FFF5F5",
//   redBorder:     "#FECACA",
//   amber:         "#F59E0B",
//   zinc50:        "#FAFAFA",
//   zinc200:       "#E4E4E7",
//   zinc400:       "#A1A1AA",
//   zinc500:       "#71717A",
//   zinc800:       "#27272A",
//   zinc900:       "#18181B",
//   zinc950:       "#09090B",
// };

// // ─── Animation Helpers ────────────────────────────────────────────────────────
// const fadeUp = (delay = 0, distance = 28) => ({
//   initial:     { opacity: 0, y: distance },
//   whileInView: { opacity: 1, y: 0 },
//   viewport:    { once: true, margin: "-60px" },
//   transition:  { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] },
// });

// // ─── Global Styles ────────────────────────────────────────────────────────────
// const GlobalStyles = () => (
//   <style>{`
//     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');

//     *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//     html { scroll-behavior: smooth; }
//     body {
//       font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//       background-color: #FFFFFF;
//       color: #1A1B1E;
//       -webkit-font-smoothing: antialiased;
//       overflow-x: hidden;
//     }

//     .arch-bg {
//       background-image: radial-gradient(#D4D4D4 0.5px, transparent 0.5px);
//       background-size: 24px 24px;
//     }

//     .copper-text {
//       background: linear-gradient(to right, #B87333, #D9A066);
//       -webkit-background-clip: text;
//       -webkit-text-fill-color: transparent;
//       background-clip: text;
//     }

//     @keyframes ticker-scroll {
//       0%   { transform: translateX(0); }
//       100% { transform: translateX(-50%); }
//     }
//     .ticker-track {
//       display: inline-flex;
//       align-items: center;
//       animation: ticker-scroll 38s linear infinite;
//       white-space: nowrap;
//     }
//     .ticker-track:hover { animation-play-state: paused; }

//     @keyframes live-pulse {
//       0%, 100% { opacity: 1; transform: scale(1); }
//       50%       { opacity: 0.55; transform: scale(1.35); }
//     }
//     @keyframes live-ring {
//       0%   { transform: scale(1); opacity: 0.7; }
//       100% { transform: scale(2.4); opacity: 0; }
//     }
//     .live-dot  { animation: live-pulse 2s ease-in-out infinite; }
//     .live-ring { animation: live-ring  2s ease-out infinite; }

//     .no-scroll::-webkit-scrollbar { display: none; }
//     .no-scroll { scrollbar-width: none; -ms-overflow-style: none; }

//     @media (max-width: 768px) {
//       .hide-mobile { display: none !important; }
//     }

//     @media (max-width: 480px) {
//       .chart-grid { grid-template-columns: 1fr !important; }
//       .kpi-grid   { flex-direction: column !important; }
//       .pricing-grid { grid-template-columns: 1fr !important; }
//       .notfor-grid  { grid-template-columns: 1fr !important; }
//     }
//   `}</style>
// );

// // ─── ACQAR Logo ───────────────────────────────────────────────────────────────
// const AcqarLogo = ({ dark = false }) => (
//   <a href="https://www.acqar.com/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
//     <span style={{ fontFamily: "Inter, sans-serif", fontSize: "1.35rem", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1, userSelect: "none" }}>
//       <span style={{ color: C.brand }}>ACQAR</span>
//       <span style={{ color: dark ? "#E8E6E0" : C.textPrimary }}> SIGNAL</span>
//     </span>
//   </a>
// );

// // ─── Section Label ────────────────────────────────────────────────────────────
// const SectionLabel = ({ children }) => (
//   <p style={{ color: C.brand, fontFamily: "Inter, sans-serif", fontSize: "0.62rem", fontWeight: 900, letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: "0.85rem" }}>
//     {children}
//   </p>
// );

// // ─── CTA Button ───────────────────────────────────────────────────────────────
// const CTAButton = ({ children, href = "https://www.acqar.com/register", variant = "primary", fullWidth = false, size = "md" }) => {
//   const [hov, setHov] = useState(false);
//   const pad = { xl: "20px 48px", lg: "16px 40px", md: "13px 30px", sm: "9px 22px" }[size] || "13px 30px";
//   const fz  = { xl: "1rem", lg: "0.875rem", md: "0.8rem", sm: "0.72rem" }[size] || "0.8rem";
//   const base = {
//     display: fullWidth ? "block" : "inline-block", textAlign: "center", padding: pad,
//     fontSize: fz, fontWeight: 900, fontFamily: "Inter, sans-serif", letterSpacing: "0.12em",
//     textTransform: "uppercase", textDecoration: "none", cursor: "pointer",
//     transition: "all 0.2s ease", width: fullWidth ? "100%" : "auto", borderRadius: "9999px", lineHeight: 1.4,
//   };
//   const vs = {
//     primary:       { backgroundColor: hov ? C.zinc800 : C.textPrimary, color: "#fff", border: "2px solid transparent" },
//     copper:        { backgroundColor: hov ? C.brandDark : C.brand, color: "#fff", border: "2px solid transparent", boxShadow: `0 4px 24px ${C.brand}44` },
//     outline:       { backgroundColor: hov ? C.textPrimary : "transparent", color: hov ? "#fff" : C.textPrimary, border: `2px solid ${C.textPrimary}` },
//     outlineCopper: { backgroundColor: hov ? C.brand : "transparent", color: hov ? "#fff" : C.brand, border: `2px solid ${C.brand}` },
//     ghost:         { backgroundColor: hov ? C.brandBg : "transparent", color: hov ? C.brand : C.zinc500, border: `1.5px solid ${hov ? C.brand : C.borderLight}` },
//     darkGhost:     { backgroundColor: hov ? `${C.brand}22` : "transparent", color: hov ? C.brand : "#8A8886", border: `1.5px solid ${hov ? C.brand : "#3A3836"}` },
//   };
//   return (
//     <motion.a href={href} whileTap={{ scale: 0.96 }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ ...base, ...(vs[variant] || vs.primary) }}>
//       {children}
//     </motion.a>
//   );
// };

// // ─── Section CTA Banner — appears after every section ────────────────────────
// const SectionCTA = ({ dark = false }) => (
//   <motion.div {...fadeUp(0.1)} style={{
//     backgroundColor: dark ? "rgba(184,115,51,0.08)" : C.zinc50,
//     border:          `1px solid ${dark ? C.brandBorder : C.borderLight}`,
//     borderRadius:    "16px",
//     padding:         "clamp(28px,5vw,40px) clamp(20px,5vw,48px)",
//     textAlign:       "center",
//   }}>
//     <p style={{ fontFamily: "Inter", fontSize: "clamp(1rem,2.5vw,1.15rem)", fontWeight: 700, color: dark ? "#ECECE8" : C.textPrimary, marginBottom: "1.25rem", lineHeight: 1.45 }}>
//       Ready to see the market before everyone else?
//     </p>
//     <CTAButton href="https://www.acqar.com/register" variant="copper" size="lg">
//       JOIN ACQAR FREE NOW →
//     </CTAButton>
//     <p style={{ color: C.zinc500, fontSize: "0.7rem", fontFamily: "Inter", marginTop: "10px", letterSpacing: "0.04em" }}>
//       No credit card · RERA-registered brokers only · 2 minutes to activate
//     </p>
//   </motion.div>
// );

// // =============================================================================
// // NAVBAR
// // =============================================================================
// const Navbar = () => {
//   const [scrolled, setScrolled] = useState(false);
//   useEffect(() => {
//     const fn = () => setScrolled(window.scrollY > 24);
//     window.addEventListener("scroll", fn, { passive: true });
//     return () => window.removeEventListener("scroll", fn);
//   }, []);

//   return (
//     <nav style={{
//       position: "sticky", top: 0, zIndex: 100,
//       display: "flex", justifyContent: "space-between", alignItems: "center",
//       padding: "0 clamp(1.25rem, 5vw, 2.5rem)", height: "64px",
//       backgroundColor: "rgba(255,255,255,0.92)",
//       backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
//       borderBottom: `1px solid ${scrolled ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.05)"}`,
//       boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.06)" : "none",
//       transition: "all 0.3s ease",
//     }}>
//       <AcqarLogo />
//       <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "36px" }}>
//         {[{ label: "Intelligence", active: true }, { label: "Broker Connect" }, { label: "Pricing" }, { label: "About" }].map((item, i) => (
//           <a key={i} href="#" style={{ fontFamily: "Inter", fontWeight: item.active ? 900 : 600, fontSize: "0.875rem", color: item.active ? C.textPrimary : C.zinc500, textDecoration: "none", borderBottom: item.active ? `2px solid ${C.brand}` : "2px solid transparent", paddingBottom: "2px" }}>{item.label}</a>
//         ))}
//       </div>
//       <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
//         <a href="https://www.acqar.com/login" className="hide-mobile" style={{ fontFamily: "Inter", fontWeight: 900, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: C.zinc500, textDecoration: "none" }}>LOGIN</a>
//         <CTAButton href="https://www.acqar.com/register" variant="copper" size="sm">Get Signal Pro</CTAButton>
//       </div>
//     </nav>
//   );
// };

// // =============================================================================
// // TICKER
// // =============================================================================
// const TICKER_ITEMS = [
//   { name: "Emaar Properties",  price: "4.82", chg: "-1.2%", neg: true  },
//   { name: "Aldar Properties",  price: "2.14", chg: "+0.8%", neg: false },
//   { name: "DAMAC Real Estate", price: "1.43", chg: "-0.4%", neg: true  },
//   { name: "Deyaar Dev.",       price: "0.84", chg: "+2.1%", neg: false },
//   { name: "Nakheel PJSC",      price: "3.20", chg: "+0.3%", neg: false },
//   { name: "Union Properties",  price: "0.57", chg: "+1.4%", neg: false },
//   { name: "Emaar Dev.",        price: "7.36", chg: "-0.9%", neg: true  },
//   { name: "Dubai Islands",     price: "1.91", chg: "-0.7%", neg: true  },
//   { name: "RAK Properties",    price: "1.12", chg: "+1.1%", neg: false },
// ];

// const TerminalTicker = () => (
//   <div style={{ backgroundColor: C.bgDarkSurface, borderBottom: `1px solid ${C.borderDark}`, padding: "7px 0", overflow: "hidden" }}>
//     <div style={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
//       <span style={{ color: C.brand, fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.12em", fontFamily: "Inter, monospace", padding: "0 12px", borderRight: `1px solid ${C.borderDark}`, marginRight: "12px", whiteSpace: "nowrap", flexShrink: 0 }}>DFM · ADX</span>
//       <div style={{ overflow: "hidden", flex: 1 }}>
//         <div className="ticker-track">
//           {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
//             <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginRight: "28px", fontFamily: "Inter, monospace", fontSize: "0.62rem" }}>
//               <span style={{ color: "#8A8886" }}>{t.name}</span>
//               <span style={{ color: "#D8D6D2", fontWeight: 500 }}>{t.price}</span>
//               <span style={{ color: t.neg ? C.redLight : C.greenLight, fontWeight: 600 }}>{t.neg ? "▼" : "▲"} {t.chg}</span>
//               <span style={{ color: C.borderDark, marginLeft: "6px" }}>·</span>
//             </span>
//           ))}
//         </div>
//       </div>
//     </div>
//   </div>
// );

// // =============================================================================
// // TERMINAL PREVIEW (complete from original)
// // =============================================================================
// const SIGNAL_CARDS = [
//   { area: "Business Bay", type: "PRICE MOVE",   sev: "S3", desc: "Avg. price -4.2% vs 90-day MA. 23 transactions flagged.", time: "3 min ago",  col: C.amber    },
//   { area: "JVC",          type: "DISTRESS",     sev: "S5", desc: "11 units below market. Average discount 14.3% on ask.",  time: "7 min ago",  col: C.redLight },
//   { area: "Dubai Hills",  type: "VOLUME SPIKE", sev: "S2", desc: "Viewings +75% WoW. Recovery signal confirmed by data.",  time: "12 min ago", col: C.greenLight },
// ];

// const SignalCard = ({ area, type, sev, desc, time, col }) => (
//   <div style={{ backgroundColor: C.bgDarkCard, border: `1px solid ${C.borderDark}`, borderRadius: "7px", padding: "11px 13px", minWidth: "168px", flex: "1 0 168px" }}>
//     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "7px" }}>
//       <div>
//         <div style={{ color: "#D8D6D2", fontSize: "0.68rem", fontWeight: 600, fontFamily: "Inter" }}>{area}</div>
//         <div style={{ color: col, fontSize: "0.57rem", fontWeight: 700, letterSpacing: "0.09em", marginTop: "2px", fontFamily: "Inter" }}>{type}</div>
//       </div>
//       <span style={{ backgroundColor: `${col}20`, color: col, border: `1px solid ${col}50`, borderRadius: "4px", padding: "2px 6px", fontSize: "0.58rem", fontWeight: 700, fontFamily: "Inter" }}>{sev}</span>
//     </div>
//     <div style={{ color: "#5E5C5A", fontSize: "0.58rem", fontFamily: "Inter", lineHeight: 1.45, marginBottom: "6px" }}>{desc}</div>
//     <div style={{ color: "#3E3C3A", fontSize: "0.52rem", fontFamily: "Inter" }}>{time}</div>
//   </div>
// );

// const DistressDealCard = () => (
//   <div style={{ backgroundColor: C.bgDarkCard, border: `1px solid ${C.brand}45`, borderRadius: "7px", padding: "12px 14px" }}>
//     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
//       <div>
//         <div style={{ color: C.redLight, fontSize: "0.57rem", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "Inter" }}>⚡ DISTRESS DEAL</div>
//         <div style={{ color: "#D8D6D2", fontSize: "0.72rem", fontWeight: 600, fontFamily: "Inter", marginTop: "3px" }}>Studio · JVC · Binghatti Atelier</div>
//       </div>
//       <span style={{ backgroundColor: `${C.redLight}20`, color: C.redLight, border: `1px solid ${C.redLight}50`, borderRadius: "5px", padding: "3px 9px", fontSize: "0.65rem", fontWeight: 900, fontFamily: "Inter" }}>-13.4%</span>
//     </div>
//     <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
//       {[
//         { label: "ORIGINAL (2024)", val: "AED 693K", valColor: "#5E5C5A", strike: true  },
//         { label: "CURRENT ASK",     val: "AED 600K", valColor: C.redLight,   strike: false },
//         { label: "LAST COMP.",      val: "AED 725K", valColor: C.greenLight, strike: false },
//       ].map((col, i) => (
//         <div key={i}>
//           <div style={{ color: "#3E3C3A", fontSize: "0.52rem", fontFamily: "Inter", letterSpacing: "0.06em", marginBottom: "3px" }}>{col.label}</div>
//           <div style={{ color: col.valColor, fontSize: i === 1 ? "0.75rem" : "0.68rem", fontWeight: i === 1 ? 700 : 500, fontFamily: "Inter", textDecoration: col.strike ? "line-through" : "none" }}>{col.val}</div>
//         </div>
//       ))}
//     </div>
//     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//       <span style={{ color: "#4E4C4A", fontSize: "0.55rem", fontFamily: "Inter" }}>Timing Score: <span style={{ color: C.brand, fontWeight: 700 }}>8.4 / 10</span></span>
//       <button style={{ backgroundColor: C.brand, color: "#fff", border: "none", borderRadius: "4px", padding: "6px 14px", fontSize: "0.6rem", fontWeight: 700, fontFamily: "Inter", cursor: "pointer", letterSpacing: "0.06em" }}>VIEW FULL DEAL →</button>
//     </div>
//   </div>
// );

// const TerminalPreview = () => (
//   <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
//     style={{ backgroundColor: C.bgDark, border: `1px solid ${C.borderDark}`, borderRadius: "14px", overflow: "hidden", maxWidth: "700px", margin: "0 auto", boxShadow: "0 32px 100px rgba(0,0,0,0.45), 0 0 0 1px rgba(184,115,51,0.12)" }}>
//     {/* Window chrome */}
//     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: C.bgDarkSurface, borderBottom: `1px solid ${C.borderDark}` }}>
//       <div style={{ display: "flex", gap: "6px" }}>
//         {["#3A3835","#3A3835","#3A3835"].map((bg, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: bg }} />)}
//       </div>
//       <span style={{ color: C.brand, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", fontFamily: "Inter" }}>ACQAR SIGNAL™</span>
//       <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
//         <div style={{ position: "relative", width: 10, height: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
//           <div className="live-ring" style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", backgroundColor: C.greenLight, opacity: 0.5 }} />
//           <div className="live-dot"  style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: C.greenLight, position: "relative" }} />
//         </div>
//         <span style={{ color: C.greenLight, fontSize: "0.58rem", fontWeight: 700, fontFamily: "Inter", letterSpacing: "0.12em" }}>LIVE</span>
//       </div>
//     </div>
//     <TerminalTicker />
//     <div style={{ padding: "12px", display: "flex", gap: "8px", overflowX: "auto" }} className="no-scroll">
//       {SIGNAL_CARDS.map((c, i) => <SignalCard key={i} {...c} />)}
//     </div>
//     <div style={{ padding: "0 12px 12px" }}>
//       <DistressDealCard />
//     </div>
//   </motion.div>
// );

// // =============================================================================
// // SECTION 1 — HERO
// // =============================================================================
// const HeroSection = () => {
//   const trustItems = ["✓ No credit card", "✓ RERA-registered brokers only", "✓ AED 409M+ analysed on platform", "✓ Live now at acqar.com"];
//   const ctr = { hidden: {}, show: { transition: { staggerChildren: 0.11 } } };
//   const itm = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };

//   return (
//     <section className="arch-bg" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px clamp(1.25rem, 5vw, 2rem) 60px", overflow: "hidden" }}>
//       <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6), #fff)", pointerEvents: "none" }} />
//       <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "960px", margin: "0 auto", width: "100%" }}>
//         <motion.div variants={ctr} initial="hidden" animate="show">
//           <motion.div variants={itm}><SectionLabel>ACQAR SIGNAL™ · BROKER ACCESS</SectionLabel></motion.div>

//           <motion.h1 variants={itm} style={{ fontFamily: "Inter", fontSize: "clamp(2.6rem, 8vw, 6rem)", fontWeight: 900, lineHeight: 0.92, letterSpacing: "-0.04em", color: C.textPrimary, marginBottom: "1.6rem" }}>
//             The Broker Who{" "}
//             <span className="copper-text">Sees First,</span>
//             <br />Closes First.
//           </motion.h1>

//           <motion.p variants={itm} style={{ fontSize: "clamp(1rem, 2.2vw, 1.2rem)", color: C.textSecondary, lineHeight: 1.75, maxWidth: "640px", margin: "0 auto 2.2rem", fontFamily: "Inter" }}>
//             While your WhatsApp groups were sharing rumours, Acqar was showing the real market —
//             live, verified, every 3 minutes.{" "}
//             <strong style={{ color: C.textPrimary, fontWeight: 700 }}>10,000 brokers, investors, and buyers are already inside.</strong>{" "}
//             The rebound started. The room is filling up.
//           </motion.p>

//           <motion.div variants={itm} style={{ marginBottom: "1.6rem" }}>
//             <CTAButton href="https://www.acqar.com/register" variant="copper" size="xl">
//               → Get Inside Free — 2 Minutes
//             </CTAButton>
//           </motion.div>

//           <motion.div variants={itm} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 0", fontSize: "0.76rem", fontFamily: "Inter", color: C.textMuted }}>
//             {trustItems.map((item, i) => (
//               <React.Fragment key={i}>
//                 {i > 0 && <span style={{ color: C.borderLight, padding: "0 10px" }}>|</span>}
//                 <span>{item}</span>
//               </React.Fragment>
//             ))}
//           </motion.div>
//         </motion.div>

//         <div style={{ marginTop: "4rem" }}>
//           <TerminalPreview />
//         </div>

//         {/* Trust bar */}
//         <motion.div {...fadeUp(0.8)} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "24px", padding: "40px 0", borderTop: `1px solid ${C.borderLight}`, borderBottom: `1px solid ${C.borderLight}`, maxWidth: "720px", margin: "3rem auto 0" }}>
//           {[
//             { top: "Source",    bottom: "RERA VERIFIED"      },
//             { top: "Live Data", bottom: "14-SOURCE FEED"     },
//             { top: "Community", bottom: "10,000+ BROKERS"    },
//             { top: "Coverage",  bottom: "AED 409M+ ANALYZED" },
//           ].map((item, i) => (
//             <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
//               <span style={{ color: C.zinc400, fontSize: "0.6rem", fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "6px" }}>{item.top}</span>
//               <span style={{ fontFamily: "Inter", fontWeight: 900, fontSize: "0.875rem", color: C.textPrimary }}>{item.bottom}</span>
//             </div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// // =============================================================================
// // SECTION 2 — THE HOOK (MARKET REALITY)
// // =============================================================================
// const HookSection = () => (
//   <section style={{ backgroundColor: C.bgWhite, padding: "100px 0 0" }}>
//     <div style={{ maxWidth: "740px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem)" }}>

//       <motion.div {...fadeUp(0)}><SectionLabel>MARKET REALITY · APRIL 2026</SectionLabel></motion.div>

//       <motion.h2 {...fadeUp(0.08)} style={{ fontFamily: "Inter", fontSize: "clamp(1.9rem, 4.5vw, 3.1rem)", fontWeight: 900, letterSpacing: "-0.03em", color: C.textPrimary, lineHeight: 1.08, marginBottom: "2.75rem" }}>
//         Let's Be Honest About What February 28 Did To Your Business.
//       </motion.h2>

//       {[
//         <>Your off-plan pipeline froze overnight. Clients who were ready to sign are now sending you voice notes asking you to <em>"wait."</em></>,
//         "The DFM crashed 30% and your investors think their villa lost the same.",
//         "Your phone went quiet. Your WhatsApp groups exploded — but with noise, not intelligence.",
//         <>And the portals? Still showing the same stale listings. Still selling your enquiry to nine other agents.</>,
//       ].map((para, i) => (
//         <motion.p key={i} {...fadeUp(0.12 + i * 0.07)} style={{ color: C.textSecondary, fontSize: "1.05rem", lineHeight: 1.82, marginBottom: "1.3rem", fontFamily: "Inter" }}>{para}</motion.p>
//       ))}

//       {/* Pull-quote */}
//       <motion.div {...fadeUp(0.45)} style={{ borderLeft: `4px solid ${C.brand}`, backgroundColor: C.bgCream, borderRadius: "0 12px 12px 0", padding: "28px 32px", margin: "2.8rem 0" }}>
//         <p style={{ fontFamily: "Inter", fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 900, color: C.textPrimary, lineHeight: 1.3, marginBottom: "0.6rem" }}>
//           "You are not lacking leads right now.<br />
//           <span style={{ color: C.brand }}>You are lacking clarity."</span>
//         </p>
//         <p style={{ color: C.textSecondary, fontSize: "1.05rem", fontFamily: "Inter", lineHeight: 1.6 }}>
//           And clarity is what closes deals in a crisis.
//         </p>
//       </motion.div>

//       <motion.p {...fadeUp(0.55)} style={{ color: C.textSecondary, fontSize: "1.05rem", lineHeight: 1.82, fontFamily: "Inter", marginBottom: "3.5rem" }}>
//         The brokers who are winning in this market are not working harder. They are seeing earlier.
//       </motion.p>
//     </div>
//     <div style={{ maxWidth: "740px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem) 100px" }}>
//       <SectionCTA />
//     </div>
//   </section>
// );

// // =============================================================================
// // SECTION 3 — THE REVELATION (INTELLIGENCE GAP)
// // =============================================================================
// const ChartSplit = () => (
//   <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "1.5rem" }}>
//     <div style={{ backgroundColor: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: "12px", padding: "20px", textAlign: "center" }}>
//       <div style={{ color: C.red, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", fontFamily: "Inter", marginBottom: "10px", textTransform: "uppercase" }}>DFM Real Estate Index</div>
//       <svg viewBox="0 0 140 64" style={{ width: "100%", height: "68px" }} aria-hidden="true">
//         <defs><linearGradient id="redFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#DC2626" stopOpacity="0.28" /><stop offset="100%" stopColor="#DC2626" stopOpacity="0" /></linearGradient></defs>
//         <polygon points="0,8 20,10 45,14 70,26 95,44 120,56 140,60 140,64 0,64" fill="url(#redFill)" />
//         <polyline points="0,8 20,10 45,14 70,26 95,44 120,56 140,60" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
//       </svg>
//       <div style={{ fontSize: "2.4rem", fontWeight: 900, color: C.red, letterSpacing: "-0.04em", marginTop: "6px", fontFamily: "Inter" }}>-30%</div>
//       <div style={{ color: C.textMuted, fontSize: "0.68rem", fontFamily: "Inter", marginTop: "4px" }}>Financial market crash</div>
//     </div>
//     <div style={{ backgroundColor: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: "12px", padding: "20px", textAlign: "center" }}>
//       <div style={{ color: C.green, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", fontFamily: "Inter", marginBottom: "10px", textTransform: "uppercase" }}>Actual Property Prices</div>
//       <svg viewBox="0 0 140 64" style={{ width: "100%", height: "68px" }} aria-hidden="true">
//         <defs><linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16A34A" stopOpacity="0.2" /><stop offset="100%" stopColor="#16A34A" stopOpacity="0" /></linearGradient></defs>
//         <polygon points="0,26 25,28 50,29 75,31 100,33 120,30 140,28 140,64 0,64" fill="url(#greenFill)" />
//         <polyline points="0,26 25,28 50,29 75,31 100,33 120,30 140,28" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
//       </svg>
//       <div style={{ fontSize: "2.4rem", fontWeight: 900, color: C.green, letterSpacing: "-0.04em", marginTop: "6px", fontFamily: "Inter" }}>-3 to 5%</div>
//       <div style={{ color: C.textMuted, fontSize: "0.68rem", fontFamily: "Inter", marginTop: "4px" }}>Real-world fundamentals</div>
//     </div>
//   </div>
// );

// const RevelationSection = () => (
//   <section style={{ backgroundColor: C.bgCream, padding: "100px 0 0" }}>
//     <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem)" }}>
//       <motion.div {...fadeUp(0)}><SectionLabel>THE INTELLIGENCE GAP</SectionLabel></motion.div>
//       <motion.h2 {...fadeUp(0.08)} style={{ fontFamily: "Inter", fontSize: "clamp(1.9rem, 4.5vw, 3.1rem)", fontWeight: 900, letterSpacing: "-0.03em", color: C.textPrimary, lineHeight: 1.08, marginBottom: "2.75rem" }}>
//         While Everyone Watched Headlines, The Real Market Was Doing Something Different.
//       </motion.h2>
//       <motion.div {...fadeUp(0.15)}><ChartSplit /></motion.div>
//       <motion.p {...fadeUp(0.22)} style={{ textAlign: "center", color: C.textMuted, fontFamily: "Inter", fontSize: "0.88rem", fontStyle: "italic", marginBottom: "2.75rem" }}>
//         Acqar showed the gap. In real time.
//       </motion.p>

//       {/* KPI blocks */}
//       <div className="kpi-grid" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "3.25rem" }}>
//         {[
//           { value: "30%",   label: "DFM Index Drop",      sub: "Financial market",       color: C.red   },
//           { value: "3–5%",  label: "Actual Price Move",   sub: "Real-world property",    color: C.green },
//           { value: "27pts", label: "The Opportunity Gap", sub: "Intelligence advantage", color: C.brand },
//         ].map((kpi, i) => (
//           <motion.div key={i} {...fadeUp(0.2 + i * 0.08)} style={{ flex: 1, minWidth: "140px", textAlign: "center", backgroundColor: C.bgWhite, border: `1px solid ${C.borderLight}`, borderRadius: "12px", padding: "24px 16px" }}>
//             <div style={{ fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 900, color: kpi.color, lineHeight: 1, letterSpacing: "-0.04em", fontFamily: "Inter" }}>{kpi.value}</div>
//             <div style={{ color: C.textPrimary, fontSize: "0.8rem", fontWeight: 700, fontFamily: "Inter", marginTop: "6px" }}>{kpi.label}</div>
//             <div style={{ color: C.textMuted, fontSize: "0.68rem", fontFamily: "Inter", marginTop: "3px" }}>{kpi.sub}</div>
//           </motion.div>
//         ))}
//       </div>

//       {[
//         "That gap — 27 percentage points between financial market panic and real-world property fundamentals — was the single biggest intelligence opportunity Dubai real estate has seen in two years.",
//         "A studio in JVC bought at AED 693,000 in 2024 was being offered at AED 600,000. Latest comparable transaction: AED 725,000. That is a 17% below-market entry — with the rebound already beginning.",
//         "Acqar Signal showed it. With the address. The area. The developer. The timing score. Before it hit any portal. Before anyone else called your client.",
//       ].map((p, i) => (
//         <motion.p key={i} {...fadeUp(0.3 + i * 0.09)} style={{ color: C.textSecondary, fontSize: "1.05rem", lineHeight: 1.82, marginBottom: "1.3rem", fontFamily: "Inter" }}>{p}</motion.p>
//       ))}

//       {/* Dark emphasis block */}
//       <motion.div {...fadeUp(0.6)} style={{ backgroundColor: C.bgDark, borderRadius: "14px", padding: "clamp(28px,5vw,48px) clamp(24px,5vw,44px)", textAlign: "center", marginTop: "2.75rem", marginBottom: "3.5rem" }}>
//         <p style={{ fontSize: "clamp(1.15rem,3vw,1.75rem)", fontWeight: 900, color: "#ECECE8", lineHeight: 1.42, marginBottom: "0.6rem", fontFamily: "Inter" }}>
//           The broker who had that information made the call.
//         </p>
//         <p style={{ fontSize: "clamp(1rem,2.5vw,1.4rem)", fontWeight: 600, color: C.textMuted, lineHeight: 1.42, fontFamily: "Inter" }}>
//           The broker who didn't — is still waiting for the market to "get clearer."
//         </p>
//       </motion.div>
//     </div>
//     <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem) 100px" }}>
//       <SectionCTA />
//     </div>
//   </section>
// );

// // =============================================================================
// // SECTION 4 — SOCIAL PROOF THROUGH ACTION
// // =============================================================================
// const ACTION_CARDS = [
//   { icon: "🎯", action: "Distress Deal Closed. Market \"Frozen.\"",                                           copy: "Pulled distress deal cards — live, verified, updated — before they surfaced on Bayut or Property Finder. Sent them to cash-ready clients at 10–20% below market. Closed during a \"frozen\" market." },
//   { icon: "📈", action: "Moved Clients Out Of Business Bay. Into Dubai Hills. Before The Data Was Public.",   copy: "Opened the Market Timing Index every morning. Knew that Business Bay sentiment was lagging, Dubai Hills was recovering first. Looked like a genius." },
//   { icon: "📋", action: "Sent The AI Pulse Brief Every Sunday. Became The Most Trusted Voice In The Room.",  copy: "Two paragraphs. Real data. Not WhatsApp noise. Became the most trusted professional in their client's inbox in the hardest market week in years." },
//   { icon: "🔔", action: "Got The Signal Alert 48 Hours Before The Portals Moved.",                           copy: "Set WhatsApp Signal Alerts for their target areas. Got notified when the sentiment shifted — 48 hours before the portals registered the movement. Made two calls. Booked two viewings." },
//   { icon: "🤝", action: "Found A Motivated Seller In Broker Connect Before The Listing Went Live Anywhere.", copy: "Opened Broker Connect. Saw 10,000 brokers, buyers, investors, and sellers in live conversation. Joined the thread on Marina secondary pricing. Found a motivated seller before the listing went live anywhere." },
// ];

// const SocialProofSection = () => (
//   <section style={{ backgroundColor: C.bgWhite, padding: "100px 0 0" }}>
//     <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem)" }}>
//       <motion.div {...fadeUp(0)}><SectionLabel>SIGNAL PRO BROKERS · RIGHT NOW</SectionLabel></motion.div>
//       <motion.h2 {...fadeUp(0.08)} style={{ fontFamily: "Inter", fontSize: "clamp(1.9rem, 4.5vw, 3.1rem)", fontWeight: 900, letterSpacing: "-0.03em", color: C.textPrimary, lineHeight: 1.08, marginBottom: "3rem" }}>
//         This Is What Signal Pro Brokers Did While The Market Was "Paused."
//       </motion.h2>

//       <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "3rem" }}>
//         {ACTION_CARDS.map((card, i) => (
//           <motion.div key={i} {...fadeUp(0.1 + i * 0.07)} whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
//             style={{ backgroundColor: C.bgCream, border: `1px solid ${C.borderLight}`, borderRadius: "12px", padding: "22px 24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
//             <div style={{ width: "44px", height: "44px", flexShrink: 0, backgroundColor: C.brandBg, border: `1px solid ${C.brandBorder}`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
//               {card.icon}
//             </div>
//             <div>
//               <h3 style={{ fontFamily: "Inter", fontSize: "0.95rem", fontWeight: 900, color: C.textPrimary, lineHeight: 1.3, marginBottom: "8px" }}>{card.action}</h3>
//               <p style={{ color: C.textSecondary, fontSize: "0.9rem", lineHeight: 1.72, fontFamily: "Inter" }}>{card.copy}</p>
//             </div>
//           </motion.div>
//         ))}
//       </div>

//       {/* Dark callout */}
//       <motion.div {...fadeUp(0.65)} style={{ backgroundColor: C.bgDark, borderRadius: "10px", padding: "28px 32px", borderLeft: `4px solid ${C.brand}`, marginBottom: "3.5rem" }}>
//         <p style={{ color: "#C8C6C2", fontSize: "1rem", fontFamily: "Inter", lineHeight: 1.72, fontStyle: "italic" }}>
//           "That last one is not a feature. That is the market. And it is happening inside Acqar right now."
//         </p>
//       </motion.div>
//     </div>
//     <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem) 100px" }}>
//       <SectionCTA />
//     </div>
//   </section>
// );

// // =============================================================================
// // SECTION 5 — BROKER CONNECT
// // =============================================================================
// const FEED_ITEMS = [
//   { role: "Broker",   loc: "Business Bay", time: "4 min ago",  verified: false, text: "Anyone seeing motivated sellers in Studio One? Getting calls from 3 owners this week, all bought off-plan 2023." },
//   { role: "Investor", loc: "Verified",     time: "12 min ago", verified: true,  text: "Looking for 2BR ready in Dubai Hills. Cash. Can close this week. Budget 2.8M." },
//   { role: "Broker",   loc: "JVC",          time: "28 min ago", verified: false, text: "Distress unit — Binghatti, 1BR, 61sqm, asking 870K. Last transaction 980K. DM if you have a buyer." },
//   { role: "Buyer",    loc: "Verified",     time: "1 hr ago",   verified: true,  text: "Indian national, relocating Q3. Need 3BR villa, family community. Budget 4–5M. Serious." },
// ];

// const BrokerConnectSection = () => (
//   <section style={{ backgroundColor: C.bgCream, padding: "100px 0 0" }}>
//     <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem)" }}>
//       <motion.div {...fadeUp(0)}><SectionLabel>BROKER CONNECT</SectionLabel></motion.div>
//       <motion.h2 {...fadeUp(0.08)} style={{ fontFamily: "Inter", fontSize: "clamp(1.9rem, 4.5vw, 3.1rem)", fontWeight: 900, letterSpacing: "-0.03em", color: C.textPrimary, lineHeight: 1.08, marginBottom: "1rem" }}>
//         The Most Valuable Room in Dubai Real Estate Is Not on Property Finder.
//       </motion.h2>
//       <motion.p {...fadeUp(0.15)} style={{ fontFamily: "Inter", fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)", fontWeight: 700, color: C.brand, marginBottom: "2.25rem", lineHeight: 1.45 }}>
//         Property Finder is where listings go. Broker Connect is where deals begin.
//       </motion.p>

//       {[
//         "Broker Connect is Acqar's live intelligence community — a single platform where 10,000 RERA-registered brokers, qualified investors, active buyers, and motivated sellers are in conversation right now.",
//         "Not a WhatsApp group. Not a Facebook page run by someone selling a masterclass. Not a forum full of copy-paste listings.",
//         "A structured, searchable, real-time intelligence network — layered on top of live market data — where the conversations that precede deals actually happen.",
//       ].map((p, i) => (
//         <motion.p key={i} {...fadeUp(0.2 + i * 0.08)} style={{ color: C.textSecondary, fontSize: "1.05rem", lineHeight: 1.82, marginBottom: "1.1rem", fontFamily: "Inter" }}>{p}</motion.p>
//       ))}

//       {/* Live feed terminal */}
//       <motion.div {...fadeUp(0.45)} style={{ backgroundColor: C.zinc950, border: `1px solid ${C.borderDark}`, borderRadius: "14px", overflow: "hidden", marginTop: "2.75rem", marginBottom: "1.5rem" }}>
//         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", backgroundColor: C.bgDarkSurface, borderBottom: `1px solid ${C.borderDark}` }}>
//           <span style={{ color: "#D8D6D2", fontSize: "0.75rem", fontWeight: 900, letterSpacing: "0.15em", fontFamily: "Inter", textTransform: "uppercase" }}>BROKER CONNECT</span>
//           <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
//             <div className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: C.greenLight }} />
//             <span style={{ color: C.greenLight, fontSize: "0.58rem", fontWeight: 700, fontFamily: "Inter", letterSpacing: "0.12em" }}>LIVE · 10,247 MEMBERS</span>
//           </div>
//         </div>
//         {FEED_ITEMS.map((item, i) => (
//           <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.5 + i * 0.14 }}
//             style={{ padding: "16px 18px", borderBottom: i < FEED_ITEMS.length - 1 ? `1px solid ${C.borderDark}` : "none" }}>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "7px", flexWrap: "wrap", gap: "6px" }}>
//               <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
//                 <span style={{ backgroundColor: `${C.brand}22`, color: C.brand, border: `1px solid ${C.brand}40`, borderRadius: "4px", padding: "2px 8px", fontSize: "0.58rem", fontWeight: 900, fontFamily: "Inter", letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.role}</span>
//                 <span style={{ color: "#5E5C5A", fontSize: "0.62rem", fontFamily: "Inter" }}>{item.loc}</span>
//                 {item.verified && <span style={{ color: C.greenLight, fontSize: "0.6rem", fontFamily: "Inter" }}>✓ Verified</span>}
//               </div>
//               <span style={{ color: "#3E3C3A", fontSize: "0.6rem", fontFamily: "Inter" }}>{item.time}</span>
//             </div>
//             <p style={{ color: "#C8C6C2", fontSize: "0.82rem", lineHeight: 1.62, fontFamily: "Inter" }}>{item.text}</p>
//           </motion.div>
//         ))}
//       </motion.div>

//       {/* Feature pills */}
//       <motion.div {...fadeUp(0.6)} style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "2.75rem" }}>
//         {[
//           { icon: "🟢", label: "Live · 10,000+ Members" },
//           { icon: "🔍", label: "Searchable by Area, Budget, Type" },
//           { icon: "✓",  label: "RERA-Verified Brokers Only" },
//           { icon: "📡", label: "Layered on Live Market Data" },
//         ].map((pill, i) => (
//           <span key={i} style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.borderLight}`, borderRadius: "9999px", padding: "8px 16px", fontSize: "0.82rem", fontFamily: "Inter", color: C.textPrimary, display: "inline-flex", alignItems: "center", gap: "7px" }}>
//             {pill.icon} {pill.label}
//           </span>
//         ))}
//       </motion.div>

//       <motion.p {...fadeUp(0.65)} style={{ color: C.textSecondary, fontSize: "1.05rem", lineHeight: 1.82, fontFamily: "Inter", marginBottom: "1rem" }}>
//         The broker who is inside this conversation has an unfair advantage. The broker who is not is working from rumour and noise — the same position everyone else is in.
//       </motion.p>
//       <motion.p {...fadeUp(0.7)} style={{ color: C.textPrimary, fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.82, fontFamily: "Inter", marginBottom: "3.5rem" }}>
//         Getting into Broker Connect costs nothing. Missing it costs deals.
//       </motion.p>
//     </div>
//     <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem) 100px" }}>
//       <SectionCTA />
//     </div>
//   </section>
// );

// // =============================================================================
// // SECTION 6 — PRICING
// // =============================================================================
// const FREE_FEATURES = [
//   "Live Signal Feed — 14 sources, every 3 min",
//   "Signal Map — market movement by area",
//   "DFM/ADX Ticker — developer stock tracker",
//   "3 TruValu AI Valuations / month",
//   "Distress Deals — view available listings",
//   "Property Passport",
//   "Broker Connect — community access",
// ];

// const PRO_FEATURES_LIST = [
//   { type: "header",  text: "Everything in Free, plus:" },
//   { type: "feature", text: "Distress Deal Pro — full address, discount %, timing score" },
//   { type: "feature", text: "AI Pulse Brief — daily market intelligence digest" },
//   { type: "feature", text: "Market Timing Index by Area" },
//   { type: "feature", text: "Nationality Demand Intelligence" },
//   { type: "feature", text: "AI Price Forecasting" },
//   { type: "feature", text: "Investment Scorecard" },
//   { type: "feature", text: "Rental Terminal" },
//   { type: "feature", text: "Off-Plan Pipeline Tracker" },
//   { type: "feature", text: "Developer Scorecard" },
//   { type: "feature", text: "Portfolio Intelligence" },
//   { type: "feature", text: "Unlimited TruValu AI Valuations" },
//   { type: "feature", text: "WhatsApp + Email Signal Alerts" },
//   { type: "feature", text: "Broker Connect Pro — full participation" },
// ];

// const PricingSection = () => (
//   <section style={{ backgroundColor: C.bgWhite, padding: "100px 0 0" }}>
//     <div style={{ maxWidth: "940px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem)" }}>
//       <motion.div {...fadeUp(0)} style={{ textAlign: "center" }}><SectionLabel>YOUR ACCESS</SectionLabel></motion.div>
//       <motion.h2 {...fadeUp(0.08)} style={{ fontFamily: "Inter", fontSize: "clamp(1.9rem, 4.5vw, 3.1rem)", fontWeight: 900, letterSpacing: "-0.03em", color: C.textPrimary, lineHeight: 1.08, marginBottom: "3.25rem", textAlign: "center" }}>
//         Two Ways In.{" "}<span style={{ color: C.brand }}>One Expires May 15.</span>
//       </motion.h2>

//       <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", alignItems: "start" }}>

//         {/* FREE CARD */}
//         <motion.div {...fadeUp(0.18)} whileHover={{ scale: 1.005, boxShadow: "0 8px 40px rgba(0,0,0,0.07)" }}
//           style={{ backgroundColor: C.bgCream, border: `1px solid ${C.borderLight}`, borderRadius: "16px", padding: "32px" }}>
//           <div style={{ marginBottom: "26px" }}>
//             <p style={{ color: C.textMuted, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", fontFamily: "Inter", textTransform: "uppercase", marginBottom: "14px" }}>SIGNAL FREE</p>
//             <div style={{ display: "flex", alignItems: "baseline", gap: "7px", marginBottom: "5px" }}>
//               <span style={{ fontSize: "3rem", fontWeight: 900, color: C.textPrimary, lineHeight: 1, fontFamily: "Inter" }}>AED 0</span>
//               <span style={{ color: C.textMuted, fontSize: "0.88rem", fontFamily: "Inter" }}>/month</span>
//             </div>
//             <p style={{ color: C.textMuted, fontSize: "0.8rem", fontFamily: "Inter" }}>Forever. No card.</p>
//           </div>
//           <div style={{ display: "flex", flexDirection: "column", gap: "11px", marginBottom: "28px" }}>
//             {FREE_FEATURES.map((f, i) => (
//               <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "9px", fontSize: "0.875rem", fontFamily: "Inter", color: C.textSecondary }}>
//                 <span style={{ color: C.textMuted, flexShrink: 0, lineHeight: "1.55" }}>✓</span>{f}
//               </div>
//             ))}
//           </div>
//           <CTAButton href="https://www.acqar.com/register" size="md" fullWidth variant="outline">Join Free Now</CTAButton>
//         </motion.div>

//         {/* PRO CARD */}
//         <motion.div {...fadeUp(0.28)} whileHover={{ scale: 1.005, boxShadow: `0 16px 60px ${C.brand}33` }}
//           style={{ backgroundColor: C.bgDark, border: `2px solid ${C.brand}`, borderRadius: "16px", padding: "32px", position: "relative" }}>
//           <div style={{ position: "absolute", top: "-16px", left: "50%", transform: "translateX(-50%)", backgroundColor: C.brand, color: "#fff", borderRadius: "9999px", padding: "5px 18px", fontSize: "0.62rem", fontWeight: 700, fontFamily: "Inter", letterSpacing: "0.14em", whiteSpace: "nowrap", boxShadow: `0 4px 16px ${C.brand}55` }}>
//             FOUNDING RATE · EXPIRES MAY 15
//           </div>
//           <div style={{ marginBottom: "22px" }}>
//             <p style={{ color: C.brand, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", fontFamily: "Inter", textTransform: "uppercase", marginBottom: "14px" }}>SIGNAL PRO</p>
//             <div style={{ display: "flex", alignItems: "baseline", gap: "7px", marginBottom: "5px" }}>
//               <span style={{ fontSize: "3rem", fontWeight: 900, color: "#ECECE8", lineHeight: 1, fontFamily: "Inter" }}>AED 29</span>
//               <span style={{ color: "#5E5C5A", fontSize: "0.88rem", fontFamily: "Inter" }}>/month</span>
//             </div>
//             <span style={{ color: "#4A4846", fontSize: "0.82rem", fontFamily: "Inter", textDecoration: "line-through", display: "block", marginBottom: "6px" }}>AED 149/month</span>
//             <p style={{ color: "#5E5C5A", fontSize: "0.8rem", fontFamily: "Inter" }}>Locks forever. Price never increases.</p>
//           </div>
//           <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "22px" }}>
//             {PRO_FEATURES_LIST.map(({ type, text }, i) => (
//               <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "9px", fontSize: "0.875rem", fontFamily: "Inter", color: type === "header" ? "#7A7876" : "#C8C6C2", fontWeight: type === "header" ? 600 : 400 }}>
//                 {type === "feature" && <span style={{ color: C.brand, flexShrink: 0, lineHeight: "1.55" }}>✓</span>}
//                 {text}
//               </div>
//             ))}
//           </div>
//           <p style={{ color: "#5E5C5A", fontSize: "0.84rem", fontFamily: "Inter", lineHeight: 1.72, fontStyle: "italic", marginBottom: "20px" }}>
//             "What is AED 29? One morning's coffee at Five Palm. One hour of your time on a deal that doesn't close. One month of having the intelligence that every serious broker in Dubai needs right now."
//           </p>
//           <div style={{ backgroundColor: `${C.brand}14`, border: `1px solid ${C.brand}38`, borderRadius: "10px", padding: "16px 18px", marginBottom: "24px" }}>
//             <p style={{ color: "#BCBAB6", fontSize: "0.82rem", fontFamily: "Inter", lineHeight: 1.68 }}>
//               <strong style={{ color: "#D8D6D2" }}>🛡 14-Day Full Refund. No Questions.</strong><br />
//               If you use Signal Pro for 14 days and do not find one piece of intelligence that changes a conversation with a client — ask for your money back. We return it same day.
//             </p>
//           </div>
//           <CTAButton href="https://www.acqar.com/register" size="lg" fullWidth variant="copper">
//             Lock AED 29 Forever — Join Signal Pro
//           </CTAButton>
//         </motion.div>
//       </div>

//       <div style={{ marginTop: "4rem", paddingBottom: "100px" }}>
//         <SectionCTA />
//       </div>
//     </div>
//   </section>
// );

// // =============================================================================
// // SECTION 7 — NOT FOR EVERYONE
// // =============================================================================
// const NotForEveryoneSection = () => (
//   <section style={{ backgroundColor: C.bgCream, padding: "100px 0 0" }}>
//     <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem)" }}>
//       <motion.div {...fadeUp(0)}><SectionLabel>READ THIS BEFORE YOU REGISTER</SectionLabel></motion.div>
//       <motion.h2 {...fadeUp(0.08)} style={{ fontFamily: "Inter", fontSize: "clamp(1.9rem, 4.5vw, 3.1rem)", fontWeight: 900, letterSpacing: "-0.03em", color: C.textPrimary, lineHeight: 1.08, marginBottom: "1.5rem" }}>
//         Acqar Is Not For Every Broker.
//       </motion.h2>

//       {[
//         "Acqar is not a portal. It does not list properties. It does not generate leads and sell the same lead to ten other agents.",
//         "It does not tell you what happened in the market last quarter. It does not give you a number with no context and call it a valuation.",
//       ].map((p, i) => (
//         <motion.p key={i} {...fadeUp(0.15 + i * 0.08)} style={{ color: C.textSecondary, fontSize: "1.05rem", lineHeight: 1.82, marginBottom: "1rem", fontFamily: "Inter" }}>{p}</motion.p>
//       ))}

//       {/* NOT FOR / FOR */}
//       <div className="notfor-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px", marginTop: "2.75rem", marginBottom: "3.25rem" }}>
//         <motion.div {...fadeUp(0.3)} style={{ backgroundColor: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: "12px", padding: "26px" }}>
//           <h4 style={{ fontSize: "0.72rem", fontWeight: 900, color: C.red, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "18px", fontFamily: "Inter" }}>NOT FOR YOU IF</h4>
//           {[
//             "You are looking for a shortcut to leads",
//             "You want someone else to do the thinking",
//             "You are comfortable guessing in client meetings",
//             "You rely on WhatsApp groups for market intelligence",
//           ].map((item, i) => (
//             <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "9px", fontSize: "0.875rem", fontFamily: "Inter", color: "#7F1D1D", marginBottom: "11px", lineHeight: 1.55 }}>
//               <span style={{ color: C.red, flexShrink: 0 }}>✗</span>{item}
//             </div>
//           ))}
//         </motion.div>

//         <motion.div {...fadeUp(0.38)} style={{ backgroundColor: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: "12px", padding: "26px" }}>
//           <h4 style={{ fontSize: "0.72rem", fontWeight: 900, color: C.green, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "18px", fontFamily: "Inter" }}>FOR YOU IF</h4>
//           {[
//             "You want to be the most informed broker in every room",
//             "You call your client before they call you",
//             "You show data, not gut feel, in every conversation",
//             "You want to find distress deals before they hit any portal",
//             "You want to be inside the conversation where deals begin",
//           ].map((item, i) => (
//             <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "9px", fontSize: "0.875rem", fontFamily: "Inter", color: "#14532D", marginBottom: "11px", lineHeight: 1.55 }}>
//               <span style={{ color: C.green, flexShrink: 0 }}>✓</span>{item}
//             </div>
//           ))}
//         </motion.div>
//       </div>

//       <motion.div {...fadeUp(0.55)} style={{ textAlign: "center", marginBottom: "3.5rem" }}>
//         <p style={{ fontFamily: "Inter", fontSize: "clamp(1.2rem, 3.2vw, 1.65rem)", fontWeight: 900, color: C.textPrimary, lineHeight: 1.4 }}>
//           This is for the broker who has decided to survive —<br />
//           and <span style={{ color: C.brand }}>dominate</span> — this market's reset.
//         </p>
//       </motion.div>
//     </div>
//     <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem) 100px" }}>
//       <SectionCTA />
//     </div>
//   </section>
// );

// // =============================================================================
// // SECTION 8 — THE CLOSE (with full timeline)
// // =============================================================================
// const TIMELINE = [
//   { date: "Feb 28", label: "US-Israel strikes on Iran. Market freezes.",         active: false },
//   { date: "Mar 9",  label: "DFM crashes 30%. Actual prices -3%.",               active: false },
//   { date: "Apr 17", label: "Ceasefire. Strait of Hormuz opens. Viewings +75%.", active: false },
//   { date: "NOW",    label: "Rebound begins. Position now or catch up later.",    active: true  },
// ];

// const TheCloseSection = () => (
//   <section style={{ backgroundColor: C.bgDark, padding: "100px clamp(1.25rem, 4vw, 2rem)" }}>
//     <div style={{ maxWidth: "820px", margin: "0 auto" }}>
//       <motion.div {...fadeUp(0)}><SectionLabel>THE MARKET · APRIL 2026</SectionLabel></motion.div>
//       <motion.h2 {...fadeUp(0.08)} style={{ fontFamily: "Inter", fontSize: "clamp(1.9rem, 4.5vw, 3.1rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#ECECE8", lineHeight: 1.08, marginBottom: "3.25rem" }}>
//         The Ceasefire Was Called. The Strait Is Open.{" "}
//         <span style={{ color: C.brand }}>The Market Is Moving.</span>
//       </motion.h2>

//       {/* Horizontal timeline */}
//       <motion.div {...fadeUp(0.18)} style={{ marginBottom: "3.75rem", overflowX: "auto", paddingBottom: "4px" }} className="no-scroll">
//         <div style={{ position: "relative", display: "flex", minWidth: "420px", padding: "0 20px" }}>
//           <div style={{ position: "absolute", top: "20px", left: "50px", right: "50px", height: "2px", backgroundColor: C.borderDark, zIndex: 0 }} />
//           <div style={{ position: "absolute", top: "20px", left: "50px", width: "75%", height: "2px", background: `linear-gradient(to right, ${C.brand}, ${C.brandBorder})`, zIndex: 1 }} />
//           {TIMELINE.map((ev, i) => (
//             <motion.div key={i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 + i * 0.14 }}
//               style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", zIndex: 2, padding: "0 6px" }}>
//               <div style={{ width: ev.active ? "42px" : "34px", height: ev.active ? "42px" : "34px", borderRadius: "50%", backgroundColor: ev.active ? C.brand : C.bgDarkCard, border: `2px solid ${ev.active ? C.brand : C.borderDark}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px", boxShadow: ev.active ? `0 0 22px ${C.brand}70` : "none" }}>
//                 {ev.active ? <div className="live-dot" style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#fff" }} /> : <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: C.borderDark }} />}
//               </div>
//               <div style={{ color: ev.active ? C.brand : "#4A4846", fontSize: "0.62rem", fontWeight: 700, fontFamily: "Inter", letterSpacing: "0.08em", marginBottom: "6px" }}>{ev.date}</div>
//               <div style={{ color: ev.active ? "#D8D6D2" : "#3E3C3A", fontSize: "0.68rem", fontFamily: "Inter", lineHeight: 1.45 }}>{ev.label}</div>
//             </motion.div>
//           ))}
//         </div>
//       </motion.div>

//       {[
//         "The 60–80% of deals that were on hold are beginning to fast-track. The rebound is not coming. It has started.",
//         "The brokers who spent the last 6 weeks on Acqar Signal — tracking the distress market, timing the recovery by area, building their client relationships with real intelligence — are already positioned.",
//         "They know which areas are moving first. They have distress deals lined up for cash-ready clients. They have investors who trust them because they sent the AI Pulse Brief every week when every other broker went silent.",
//       ].map((p, i) => (
//         <motion.p key={i} {...fadeUp(0.35 + i * 0.09)} style={{ color: "#8A8886", fontSize: "1.05rem", lineHeight: 1.82, marginBottom: "1.3rem", fontFamily: "Inter" }}>{p}</motion.p>
//       ))}

//       {/* Emphasis block */}
//       <motion.div {...fadeUp(0.65)} style={{ backgroundColor: C.brandBg, border: `1px solid ${C.brandBorder}`, borderRadius: "14px", padding: "clamp(28px,5vw,48px) clamp(24px,5vw,44px)", textAlign: "center", marginTop: "2.75rem", marginBottom: "3.25rem" }}>
//         <p style={{ fontSize: "clamp(1.15rem,3vw,1.75rem)", fontWeight: 900, color: "#ECECE8", lineHeight: 1.42, marginBottom: "0.5rem", fontFamily: "Inter" }}>
//           You are not joining a platform.
//         </p>
//         <p style={{ fontSize: "clamp(1.05rem,2.8vw,1.55rem)", fontWeight: 700, color: C.brand, lineHeight: 1.42, fontFamily: "Inter" }}>
//           You are getting into the room where Dubai real estate is actually happening.
//         </p>
//       </motion.div>

//       {/* Final CTA */}
//       <motion.div {...fadeUp(0.75)} style={{ textAlign: "center" }}>
//         <CTAButton href="https://www.acqar.com/register" variant="copper" size="xl" fullWidth>
//           JOIN ACQAR FREE NOW
//         </CTAButton>
//         <p style={{ color: "#5E5C5A", fontSize: "0.8rem", fontFamily: "Inter", marginTop: "14px", lineHeight: 1.6 }}>
//           No credit card. RERA-registered brokers only. 2 minutes to activate.
//         </p>
//         <p style={{ color: C.brand, fontSize: "0.85rem", fontFamily: "Inter", fontWeight: 600, marginTop: "8px" }}>
//           Signal Pro Founding Rate: AED 29/month — locks forever. Becomes AED 149 on May 16.
//         </p>
//         <p style={{ color: "#3E3C3A", fontSize: "0.76rem", fontFamily: "Inter", marginTop: "6px" }}>
//           14-day full refund. No questions.
//         </p>
//       </motion.div>
//     </div>
//   </section>
// );

// // =============================================================================
// // FOOTER
// // =============================================================================
// const Footer = () => (
//   <footer style={{ backgroundColor: "#0A0907", borderTop: `1px solid ${C.borderDark}`, padding: "44px clamp(1.25rem, 4vw, 2.5rem)" }}>
//     <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "24px" }}>
//       <div>
//         <AcqarLogo dark />
//         <p style={{ color: "#3E3C3A", fontSize: "0.72rem", fontFamily: "Inter", marginTop: "8px" }}>© 2026 AcqarLabs LLC-FZ. All rights reserved.</p>
//       </div>
//       <div style={{ display: "flex", gap: "22px", flexWrap: "wrap", alignItems: "center" }}>
//         {[
//           { label: "Privacy Policy", href: "https://www.acqar.com/privacy" },
//           { label: "Terms",          href: "https://www.acqar.com/terms"   },
//           { label: "Support",        href: "https://www.acqar.com/support" },
//         ].map((link, i) => (
//           <a key={i} href={link.href} style={{ color: "#5E5C5A", fontSize: "0.78rem", fontFamily: "Inter", textDecoration: "none", transition: "color 0.15s" }}
//             onMouseEnter={e => e.currentTarget.style.color = C.brand}
//             onMouseLeave={e => e.currentTarget.style.color = "#5E5C5A"}>
//             {link.label}
//           </a>
//         ))}
//       </div>
//       <p style={{ color: "#3E3C3A", fontSize: "0.72rem", fontFamily: "Inter" }}>Built for Dubai Real Estate Professionals</p>
//     </div>
//   </footer>
// );

// // =============================================================================
// // ROOT EXPORT
// // =============================================================================
// export default function BrokerScreen() {
//   return (
//     <>
//       <GlobalStyles />
//       <TerminalTicker />
//       <Navbar />
//       <main>
//         <HeroSection />
//         <HookSection />
//         <RevelationSection />
//         <SocialProofSection />
//         <BrokerConnectSection />
//         <PricingSection />
//         <NotForEveryoneSection />
//         <TheCloseSection />
//       </main>
//       <Footer />
//     </>
//   );
// }













// =============================================================================
// BrokerScreen.jsx  — COMPLETE VERSION
// Content: 100% from AcqarBrokerLandingPage.jsx  (nothing omitted)
// UI Design: from code.html  (copper/zinc, architectural, Inter Black)
// Additions: CTA after every section · fully mobile-responsive
// =============================================================================

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ─── Brand Tokens ─────────────────────────────────────────────────────────────
const C = {
  brand:         "#B87333",
  brandDark:     "#96591E",
  brandBg:       "#B8733314",
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
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #FFFFFF;
      color: #1A1B1E;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    .arch-bg {
      background-image: radial-gradient(#D4D4D4 0.5px, transparent 0.5px);
      background-size: 24px 24px;
    }

    .copper-text {
      background: linear-gradient(to right, #B87333, #D9A066);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

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

    @keyframes live-pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50%       { opacity: 0.55; transform: scale(1.35); }
    }
    @keyframes live-ring {
      0%   { transform: scale(1); opacity: 0.7; }
      100% { transform: scale(2.4); opacity: 0; }
    }
    .live-dot  { animation: live-pulse 2s ease-in-out infinite; }
    .live-ring { animation: live-ring  2s ease-out infinite; }

    .no-scroll::-webkit-scrollbar { display: none; }
    .no-scroll { scrollbar-width: none; -ms-overflow-style: none; }

    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
    }

    @media (max-width: 480px) {
      .chart-grid { grid-template-columns: 1fr !important; }
      .kpi-grid   { flex-direction: column !important; }
      .pricing-grid { grid-template-columns: 1fr !important; }
      .notfor-grid  { grid-template-columns: 1fr !important; }
    }
  `}</style>
);

// ─── ACQAR Logo ───────────────────────────────────────────────────────────────
const AcqarLogo = ({ dark = false }) => (
  <a href="https://www.acqar.com/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "1.35rem", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1, userSelect: "none" }}>
      <span style={{ color: C.brand }}>ACQAR</span>
      <span style={{ color: dark ? "#E8E6E0" : C.textPrimary }}> SIGNAL</span>
    </span>
  </a>
);

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <p style={{ color: C.brand, fontFamily: "Inter, sans-serif", fontSize: "0.62rem", fontWeight: 900, letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: "0.85rem" }}>
    {children}
  </p>
);

// ─── CTA Button ───────────────────────────────────────────────────────────────
const CTAButton = ({ children, href = "https://www.acqar.com/register", variant = "primary", fullWidth = false, size = "md" }) => {
  const [hov, setHov] = useState(false);
  const pad = { xl: "20px 48px", lg: "16px 40px", md: "13px 30px", sm: "9px 22px" }[size] || "13px 30px";
  const fz  = { xl: "1rem", lg: "0.875rem", md: "0.8rem", sm: "0.72rem" }[size] || "0.8rem";
  const base = {
    display: fullWidth ? "block" : "inline-block", textAlign: "center", padding: pad,
    fontSize: fz, fontWeight: 900, fontFamily: "Inter, sans-serif", letterSpacing: "0.12em",
    textTransform: "uppercase", textDecoration: "none", cursor: "pointer",
    transition: "all 0.2s ease", width: fullWidth ? "100%" : "auto", borderRadius: "9999px", lineHeight: 1.4,
  };
  const vs = {
    primary:       { backgroundColor: hov ? C.zinc800 : C.textPrimary, color: "#fff", border: "2px solid transparent" },
    copper:        { backgroundColor: hov ? C.brandDark : C.brand, color: "#fff", border: "2px solid transparent", boxShadow: `0 4px 24px ${C.brand}44` },
    outline:       { backgroundColor: hov ? C.textPrimary : "transparent", color: hov ? "#fff" : C.textPrimary, border: `2px solid ${C.textPrimary}` },
    outlineCopper: { backgroundColor: hov ? C.brand : "transparent", color: hov ? "#fff" : C.brand, border: `2px solid ${C.brand}` },
    ghost:         { backgroundColor: hov ? C.brandBg : "transparent", color: hov ? C.brand : C.zinc500, border: `1.5px solid ${hov ? C.brand : C.borderLight}` },
    darkGhost:     { backgroundColor: hov ? `${C.brand}22` : "transparent", color: hov ? C.brand : "#8A8886", border: `1.5px solid ${hov ? C.brand : "#3A3836"}` },
  };
  return (
    <motion.a href={href} whileTap={{ scale: 0.96 }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ ...base, ...(vs[variant] || vs.primary) }}>
      {children}
    </motion.a>
  );
};

// ─── Section CTA Banner — appears after every section ────────────────────────
const SectionCTA = ({ dark = false }) => (
  <motion.div {...fadeUp(0.1)} style={{
    backgroundColor: dark ? "rgba(184,115,51,0.08)" : C.zinc50,
    border:          `1px solid ${dark ? C.brandBorder : C.borderLight}`,
    borderRadius:    "16px",
    padding:         "clamp(28px,5vw,40px) clamp(20px,5vw,48px)",
    textAlign:       "center",
  }}>
    <p style={{ fontFamily: "Inter", fontSize: "clamp(1rem,2.5vw,1.15rem)", fontWeight: 700, color: dark ? "#ECECE8" : C.textPrimary, marginBottom: "1.25rem", lineHeight: 1.45 }}>
      Ready to see the market before everyone else?
    </p>
    <CTAButton href="https://www.acqar.com/register" variant="copper" size="lg">
      JOIN ACQAR FREE NOW →
    </CTAButton>
    <p style={{ color: C.zinc500, fontSize: "0.7rem", fontFamily: "Inter", marginTop: "10px", letterSpacing: "0.04em" }}>
      No credit card · RERA-registered brokers only · 2 minutes to activate
    </p>
  </motion.div>
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
      position: "sticky", top: 0, zIndex: 100,
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "0 clamp(1.25rem, 5vw, 2.5rem)", height: "64px",
      backgroundColor: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderBottom: `1px solid ${scrolled ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.05)"}`,
      boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.06)" : "none",
      transition: "all 0.3s ease",
    }}>
      <AcqarLogo />
      <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "36px" }}>
        {[{ label: "Intelligence", active: true }, { label: "Broker Connect" }, { label: "Pricing" }, { label: "About" }].map((item, i) => (
          <a key={i} href="#" style={{ fontFamily: "Inter", fontWeight: item.active ? 900 : 600, fontSize: "0.875rem", color: item.active ? C.textPrimary : C.zinc500, textDecoration: "none", borderBottom: item.active ? `2px solid ${C.brand}` : "2px solid transparent", paddingBottom: "2px" }}>{item.label}</a>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <a href="https://www.acqar.com/login" className="hide-mobile" style={{ fontFamily: "Inter", fontWeight: 900, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", color: C.zinc500, textDecoration: "none" }}>LOGIN</a>
        <CTAButton href="https://www.acqar.com/register" variant="copper" size="sm">Get Signal Pro</CTAButton>
      </div>
    </nav>
  );
};

// =============================================================================
// TICKER
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
  <div style={{ backgroundColor: C.bgDarkSurface, borderBottom: `1px solid ${C.borderDark}`, padding: "7px 0", overflow: "hidden" }}>
    <div style={{ display: "flex", alignItems: "center", overflow: "hidden" }}>
      <span style={{ color: C.brand, fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.12em", fontFamily: "Inter, monospace", padding: "0 12px", borderRight: `1px solid ${C.borderDark}`, marginRight: "12px", whiteSpace: "nowrap", flexShrink: 0 }}>DFM · ADX</span>
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginRight: "28px", fontFamily: "Inter, monospace", fontSize: "0.62rem" }}>
              <span style={{ color: "#8A8886" }}>{t.name}</span>
              <span style={{ color: "#D8D6D2", fontWeight: 500 }}>{t.price}</span>
              <span style={{ color: t.neg ? C.redLight : C.greenLight, fontWeight: 600 }}>{t.neg ? "▼" : "▲"} {t.chg}</span>
              <span style={{ color: C.borderDark, marginLeft: "6px" }}>·</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// =============================================================================
// TERMINAL PREVIEW (complete from original)
// =============================================================================
const SIGNAL_CARDS = [
  { area: "Business Bay", type: "PRICE MOVE",   sev: "S3", desc: "Avg. price -4.2% vs 90-day MA. 23 transactions flagged.", time: "3 min ago",  col: C.amber    },
  { area: "JVC",          type: "DISTRESS",     sev: "S5", desc: "11 units below market. Average discount 14.3% on ask.",  time: "7 min ago",  col: C.redLight },
  { area: "Dubai Hills",  type: "VOLUME SPIKE", sev: "S2", desc: "Viewings +75% WoW. Recovery signal confirmed by data.",  time: "12 min ago", col: C.greenLight },
];

const SignalCard = ({ area, type, sev, desc, time, col }) => (
  <div style={{ backgroundColor: C.bgDarkCard, border: `1px solid ${C.borderDark}`, borderRadius: "7px", padding: "11px 13px", minWidth: "168px", flex: "1 0 168px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "7px" }}>
      <div>
        <div style={{ color: "#D8D6D2", fontSize: "0.68rem", fontWeight: 600, fontFamily: "Inter" }}>{area}</div>
        <div style={{ color: col, fontSize: "0.57rem", fontWeight: 700, letterSpacing: "0.09em", marginTop: "2px", fontFamily: "Inter" }}>{type}</div>
      </div>
      <span style={{ backgroundColor: `${col}20`, color: col, border: `1px solid ${col}50`, borderRadius: "4px", padding: "2px 6px", fontSize: "0.58rem", fontWeight: 700, fontFamily: "Inter" }}>{sev}</span>
    </div>
    <div style={{ color: "#5E5C5A", fontSize: "0.58rem", fontFamily: "Inter", lineHeight: 1.45, marginBottom: "6px" }}>{desc}</div>
    <div style={{ color: "#3E3C3A", fontSize: "0.52rem", fontFamily: "Inter" }}>{time}</div>
  </div>
);

const DistressDealCard = () => (
  <div style={{ backgroundColor: C.bgDarkCard, border: `1px solid ${C.brand}45`, borderRadius: "7px", padding: "12px 14px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
      <div>
        <div style={{ color: C.redLight, fontSize: "0.57rem", fontWeight: 700, letterSpacing: "0.1em", fontFamily: "Inter" }}>⚡ DISTRESS DEAL</div>
        <div style={{ color: "#D8D6D2", fontSize: "0.72rem", fontWeight: 600, fontFamily: "Inter", marginTop: "3px" }}>Studio · JVC · Binghatti Atelier</div>
      </div>
      <span style={{ backgroundColor: `${C.redLight}20`, color: C.redLight, border: `1px solid ${C.redLight}50`, borderRadius: "5px", padding: "3px 9px", fontSize: "0.65rem", fontWeight: 900, fontFamily: "Inter" }}>-13.4%</span>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "12px" }}>
      {[
        { label: "ORIGINAL (2024)", val: "AED 693K", valColor: "#5E5C5A", strike: true  },
        { label: "CURRENT ASK",     val: "AED 600K", valColor: C.redLight,   strike: false },
        { label: "LAST COMP.",      val: "AED 725K", valColor: C.greenLight, strike: false },
      ].map((col, i) => (
        <div key={i}>
          <div style={{ color: "#3E3C3A", fontSize: "0.52rem", fontFamily: "Inter", letterSpacing: "0.06em", marginBottom: "3px" }}>{col.label}</div>
          <div style={{ color: col.valColor, fontSize: i === 1 ? "0.75rem" : "0.68rem", fontWeight: i === 1 ? 700 : 500, fontFamily: "Inter", textDecoration: col.strike ? "line-through" : "none" }}>{col.val}</div>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ color: "#4E4C4A", fontSize: "0.55rem", fontFamily: "Inter" }}>Timing Score: <span style={{ color: C.brand, fontWeight: 700 }}>8.4 / 10</span></span>
      <button style={{ backgroundColor: C.brand, color: "#fff", border: "none", borderRadius: "4px", padding: "6px 14px", fontSize: "0.6rem", fontWeight: 700, fontFamily: "Inter", cursor: "pointer", letterSpacing: "0.06em" }}>VIEW FULL DEAL →</button>
    </div>
  </div>
);

const TerminalPreview = () => (
  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
    style={{ backgroundColor: C.bgDark, border: `1px solid ${C.borderDark}`, borderRadius: "14px", overflow: "hidden", maxWidth: "700px", margin: "0 auto", boxShadow: "0 32px 100px rgba(0,0,0,0.45), 0 0 0 1px rgba(184,115,51,0.12)" }}>
    {/* Window chrome */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", backgroundColor: C.bgDarkSurface, borderBottom: `1px solid ${C.borderDark}` }}>
      <div style={{ display: "flex", gap: "6px" }}>
        {["#3A3835","#3A3835","#3A3835"].map((bg, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: bg }} />)}
      </div>
      <span style={{ color: C.brand, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", fontFamily: "Inter" }}>ACQAR SIGNAL™</span>
      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <div style={{ position: "relative", width: 10, height: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="live-ring" style={{ position: "absolute", width: 10, height: 10, borderRadius: "50%", backgroundColor: C.greenLight, opacity: 0.5 }} />
          <div className="live-dot"  style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: C.greenLight, position: "relative" }} />
        </div>
        <span style={{ color: C.greenLight, fontSize: "0.58rem", fontWeight: 700, fontFamily: "Inter", letterSpacing: "0.12em" }}>LIVE</span>
      </div>
    </div>
    <TerminalTicker />
    <div style={{ padding: "12px", display: "flex", gap: "8px", overflowX: "auto" }} className="no-scroll">
      {SIGNAL_CARDS.map((c, i) => <SignalCard key={i} {...c} />)}
    </div>
    <div style={{ padding: "0 12px 12px" }}>
      <DistressDealCard />
    </div>
  </motion.div>
);

// =============================================================================
// SECTION 1 — HERO
// =============================================================================
const HeroSection = () => {
  const trustItems = ["✓ No credit card", "✓ RERA-registered brokers only", "✓ AED 409M+ analysed on platform", "✓ Live now at acqar.com"];
  const ctr = { hidden: {}, show: { transition: { staggerChildren: 0.11 } } };
  const itm = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } };

  return (
    <section className="arch-bg" style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px clamp(1.25rem, 5vw, 2rem) 60px", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.6), #fff)", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "960px", margin: "0 auto", width: "100%" }}>
        <motion.div variants={ctr} initial="hidden" animate="show">
          <motion.div variants={itm}><SectionLabel>ACQAR SIGNAL™ · BROKER ACCESS</SectionLabel></motion.div>

          <motion.h1 variants={itm} style={{ fontFamily: "Inter", fontSize: "clamp(2.6rem, 8vw, 6rem)", fontWeight: 900, lineHeight: 0.92, letterSpacing: "-0.04em", color: C.textPrimary, marginBottom: "1.6rem" }}>
            The Broker Who{" "}
            <span className="copper-text">Sees First,</span>
            <br />Closes First.
          </motion.h1>

          <motion.p variants={itm} style={{ fontSize: "clamp(1rem, 2.2vw, 1.2rem)", color: C.textSecondary, lineHeight: 1.75, maxWidth: "640px", margin: "0 auto 2.2rem", fontFamily: "Inter" }}>
            While your WhatsApp groups were sharing rumours, Acqar was showing the real market —
            live, verified, every 3 minutes.{" "}
            <strong style={{ color: C.textPrimary, fontWeight: 700 }}>10,000 brokers, investors, and buyers are already inside.</strong>{" "}
            The rebound started. The room is filling up.
          </motion.p>

          <motion.div variants={itm} style={{ marginBottom: "1.6rem" }}>
            <CTAButton href="https://www.acqar.com/register" variant="copper" size="xl">
              → Get Inside Free — 2 Minutes
            </CTAButton>
          </motion.div>

          <motion.div variants={itm} style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px 0", fontSize: "0.76rem", fontFamily: "Inter", color: C.textMuted }}>
            {trustItems.map((item, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ color: C.borderLight, padding: "0 10px" }}>|</span>}
                <span>{item}</span>
              </React.Fragment>
            ))}
          </motion.div>
        </motion.div>

        <div style={{ marginTop: "4rem" }}>
          <TerminalPreview />
        </div>

        {/* Trust bar */}
        <motion.div {...fadeUp(0.8)} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "24px", padding: "40px 0", borderTop: `1px solid ${C.borderLight}`, borderBottom: `1px solid ${C.borderLight}`, maxWidth: "720px", margin: "3rem auto 0" }}>
          {[
            { top: "Source",    bottom: "RERA VERIFIED"      },
            { top: "Live Data", bottom: "14-SOURCE FEED"     },
            { top: "Community", bottom: "10,000+ BROKERS"    },
            { top: "Coverage",  bottom: "AED 409M+ ANALYZED" },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ color: C.zinc400, fontSize: "0.6rem", fontWeight: 900, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "6px" }}>{item.top}</span>
              <span style={{ fontFamily: "Inter", fontWeight: 900, fontSize: "0.875rem", color: C.textPrimary }}>{item.bottom}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// =============================================================================
// SECTION 2 — THE HOOK (MARKET REALITY)
// =============================================================================
const HookSection = () => (
  <section style={{ backgroundColor: C.bgWhite, padding: "100px 0 0" }}>
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem)" }}>

      <motion.div {...fadeUp(0)}><SectionLabel>MARKET REALITY · APRIL 2026</SectionLabel></motion.div>

      <motion.h2 {...fadeUp(0.08)} style={{ fontFamily: "Inter", fontSize: "clamp(1.9rem, 4.5vw, 3.1rem)", fontWeight: 900, letterSpacing: "-0.03em", color: C.textPrimary, lineHeight: 1.08, marginBottom: "2.75rem" }}>
        Let's Be Honest About What February 28 Did To Your Business.
      </motion.h2>

      {[
        <>Your off-plan pipeline froze overnight. Clients who were ready to sign are now sending you voice notes asking you to <em>"wait."</em></>,
        "The DFM crashed 30% and your investors think their villa lost the same.",
        "Your phone went quiet. Your WhatsApp groups exploded — but with noise, not intelligence.",
        <>And the portals? Still showing the same stale listings. Still selling your enquiry to nine other agents.</>,
      ].map((para, i) => (
        <motion.p key={i} {...fadeUp(0.12 + i * 0.07)} style={{ color: C.textSecondary, fontSize: "1.05rem", lineHeight: 1.82, marginBottom: "1.3rem", fontFamily: "Inter" }}>{para}</motion.p>
      ))}

      {/* Pull-quote */}
      <motion.div {...fadeUp(0.45)} style={{ borderLeft: `4px solid ${C.brand}`, backgroundColor: C.bgCream, borderRadius: "0 12px 12px 0", padding: "28px 32px", margin: "2.8rem 0" }}>
        <p style={{ fontFamily: "Inter", fontSize: "clamp(1.25rem, 3vw, 1.75rem)", fontWeight: 900, color: C.textPrimary, lineHeight: 1.3, marginBottom: "0.6rem" }}>
          "You are not lacking leads right now.<br />
          <span style={{ color: C.brand }}>You are lacking clarity."</span>
        </p>
        <p style={{ color: C.textSecondary, fontSize: "1.05rem", fontFamily: "Inter", lineHeight: 1.6 }}>
          And clarity is what closes deals in a crisis.
        </p>
      </motion.div>

      <motion.p {...fadeUp(0.55)} style={{ color: C.textSecondary, fontSize: "1.05rem", lineHeight: 1.82, fontFamily: "Inter", marginBottom: "3.5rem" }}>
        The brokers who are winning in this market are not working harder. They are seeing earlier.
      </motion.p>
    </div>
    <div style={{ maxWidth: "740px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem) 100px" }}>
      <SectionCTA />
    </div>
  </section>
);

// =============================================================================
// SECTION 3 — THE REVELATION (INTELLIGENCE GAP)
// =============================================================================
const ChartSplit = () => (
  <div className="chart-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "1.5rem" }}>
    <div style={{ backgroundColor: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: "12px", padding: "20px", textAlign: "center" }}>
      <div style={{ color: C.red, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", fontFamily: "Inter", marginBottom: "10px", textTransform: "uppercase" }}>DFM Real Estate Index</div>
      <svg viewBox="0 0 140 64" style={{ width: "100%", height: "68px" }} aria-hidden="true">
        <defs><linearGradient id="redFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#DC2626" stopOpacity="0.28" /><stop offset="100%" stopColor="#DC2626" stopOpacity="0" /></linearGradient></defs>
        <polygon points="0,8 20,10 45,14 70,26 95,44 120,56 140,60 140,64 0,64" fill="url(#redFill)" />
        <polyline points="0,8 20,10 45,14 70,26 95,44 120,56 140,60" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ fontSize: "2.4rem", fontWeight: 900, color: C.red, letterSpacing: "-0.04em", marginTop: "6px", fontFamily: "Inter" }}>-30%</div>
      <div style={{ color: C.textMuted, fontSize: "0.68rem", fontFamily: "Inter", marginTop: "4px" }}>Financial market crash</div>
    </div>
    <div style={{ backgroundColor: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: "12px", padding: "20px", textAlign: "center" }}>
      <div style={{ color: C.green, fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", fontFamily: "Inter", marginBottom: "10px", textTransform: "uppercase" }}>Actual Property Prices</div>
      <svg viewBox="0 0 140 64" style={{ width: "100%", height: "68px" }} aria-hidden="true">
        <defs><linearGradient id="greenFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#16A34A" stopOpacity="0.2" /><stop offset="100%" stopColor="#16A34A" stopOpacity="0" /></linearGradient></defs>
        <polygon points="0,26 25,28 50,29 75,31 100,33 120,30 140,28 140,64 0,64" fill="url(#greenFill)" />
        <polyline points="0,26 25,28 50,29 75,31 100,33 120,30 140,28" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{ fontSize: "2.4rem", fontWeight: 900, color: C.green, letterSpacing: "-0.04em", marginTop: "6px", fontFamily: "Inter" }}>-3 to 5%</div>
      <div style={{ color: C.textMuted, fontSize: "0.68rem", fontFamily: "Inter", marginTop: "4px" }}>Real-world fundamentals</div>
    </div>
  </div>
);

const RevelationSection = () => (
  <section style={{ backgroundColor: C.bgCream, padding: "100px 0 0" }}>
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem)" }}>
      <motion.div {...fadeUp(0)}><SectionLabel>THE INTELLIGENCE GAP</SectionLabel></motion.div>
      <motion.h2 {...fadeUp(0.08)} style={{ fontFamily: "Inter", fontSize: "clamp(1.9rem, 4.5vw, 3.1rem)", fontWeight: 900, letterSpacing: "-0.03em", color: C.textPrimary, lineHeight: 1.08, marginBottom: "2.75rem" }}>
        While Everyone Watched Headlines, The Real Market Was Doing Something Different.
      </motion.h2>
      <motion.div {...fadeUp(0.15)}><ChartSplit /></motion.div>
      <motion.p {...fadeUp(0.22)} style={{ textAlign: "center", color: C.textMuted, fontFamily: "Inter", fontSize: "0.88rem", fontStyle: "italic", marginBottom: "2.75rem" }}>
        Acqar showed the gap. In real time.
      </motion.p>

      {/* KPI blocks */}
      <div className="kpi-grid" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "3.25rem" }}>
        {[
          { value: "30%",   label: "DFM Index Drop",      sub: "Financial market",       color: C.red   },
          { value: "3–5%",  label: "Actual Price Move",   sub: "Real-world property",    color: C.green },
          { value: "27pts", label: "The Opportunity Gap", sub: "Intelligence advantage", color: C.brand },
        ].map((kpi, i) => (
          <motion.div key={i} {...fadeUp(0.2 + i * 0.08)} style={{ flex: 1, minWidth: "140px", textAlign: "center", backgroundColor: C.bgWhite, border: `1px solid ${C.borderLight}`, borderRadius: "12px", padding: "24px 16px" }}>
            <div style={{ fontSize: "clamp(2rem,4vw,2.8rem)", fontWeight: 900, color: kpi.color, lineHeight: 1, letterSpacing: "-0.04em", fontFamily: "Inter" }}>{kpi.value}</div>
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
        <motion.p key={i} {...fadeUp(0.3 + i * 0.09)} style={{ color: C.textSecondary, fontSize: "1.05rem", lineHeight: 1.82, marginBottom: "1.3rem", fontFamily: "Inter" }}>{p}</motion.p>
      ))}

      {/* Dark emphasis block */}
      <motion.div {...fadeUp(0.6)} style={{ backgroundColor: C.bgDark, borderRadius: "14px", padding: "clamp(28px,5vw,48px) clamp(24px,5vw,44px)", textAlign: "center", marginTop: "2.75rem", marginBottom: "3.5rem" }}>
        <p style={{ fontSize: "clamp(1.15rem,3vw,1.75rem)", fontWeight: 900, color: "#ECECE8", lineHeight: 1.42, marginBottom: "0.6rem", fontFamily: "Inter" }}>
          The broker who had that information made the call.
        </p>
        <p style={{ fontSize: "clamp(1rem,2.5vw,1.4rem)", fontWeight: 600, color: C.textMuted, lineHeight: 1.42, fontFamily: "Inter" }}>
          The broker who didn't — is still waiting for the market to "get clearer."
        </p>
      </motion.div>
    </div>
    <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem) 100px" }}>
      <SectionCTA />
    </div>
  </section>
);

// =============================================================================
// SECTION 4 — SOCIAL PROOF THROUGH ACTION
// =============================================================================
const ACTION_CARDS = [
  { icon: "🎯", action: "Distress Deal Closed. Market \"Frozen.\"",                                           copy: "Pulled distress deal cards — live, verified, updated — before they surfaced on Bayut or Property Finder. Sent them to cash-ready clients at 10–20% below market. Closed during a \"frozen\" market." },
  { icon: "📈", action: "Moved Clients Out Of Business Bay. Into Dubai Hills. Before The Data Was Public.",   copy: "Opened the Market Timing Index every morning. Knew that Business Bay sentiment was lagging, Dubai Hills was recovering first. Looked like a genius." },
  { icon: "📋", action: "Sent The AI Pulse Brief Every Sunday. Became The Most Trusted Voice In The Room.",  copy: "Two paragraphs. Real data. Not WhatsApp noise. Became the most trusted professional in their client's inbox in the hardest market week in years." },
  { icon: "🔔", action: "Got The Signal Alert 48 Hours Before The Portals Moved.",                           copy: "Set WhatsApp Signal Alerts for their target areas. Got notified when the sentiment shifted — 48 hours before the portals registered the movement. Made two calls. Booked two viewings." },
  { icon: "🤝", action: "Found A Motivated Seller In Broker Connect Before The Listing Went Live Anywhere.", copy: "Opened Broker Connect. Saw 10,000 brokers, buyers, investors, and sellers in live conversation. Joined the thread on Marina secondary pricing. Found a motivated seller before the listing went live anywhere." },
];

const SocialProofSection = () => (
  <section style={{ backgroundColor: C.bgWhite, padding: "100px 0 0" }}>
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem)" }}>
      <motion.div {...fadeUp(0)}><SectionLabel>SIGNAL PRO BROKERS · RIGHT NOW</SectionLabel></motion.div>
      <motion.h2 {...fadeUp(0.08)} style={{ fontFamily: "Inter", fontSize: "clamp(1.9rem, 4.5vw, 3.1rem)", fontWeight: 900, letterSpacing: "-0.03em", color: C.textPrimary, lineHeight: 1.08, marginBottom: "3rem" }}>
        This Is What Signal Pro Brokers Did While The Market Was "Paused."
      </motion.h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "3rem" }}>
        {ACTION_CARDS.map((card, i) => (
          <motion.div key={i} {...fadeUp(0.1 + i * 0.07)} whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
            style={{ backgroundColor: C.bgCream, border: `1px solid ${C.borderLight}`, borderRadius: "12px", padding: "22px 24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
            <div style={{ width: "44px", height: "44px", flexShrink: 0, backgroundColor: C.brandBg, border: `1px solid ${C.brandBorder}`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
              {card.icon}
            </div>
            <div>
              <h3 style={{ fontFamily: "Inter", fontSize: "0.95rem", fontWeight: 900, color: C.textPrimary, lineHeight: 1.3, marginBottom: "8px" }}>{card.action}</h3>
              <p style={{ color: C.textSecondary, fontSize: "0.9rem", lineHeight: 1.72, fontFamily: "Inter" }}>{card.copy}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Dark callout */}
      <motion.div {...fadeUp(0.65)} style={{ backgroundColor: C.bgDark, borderRadius: "10px", padding: "28px 32px", borderLeft: `4px solid ${C.brand}`, marginBottom: "3.5rem" }}>
        <p style={{ color: "#C8C6C2", fontSize: "1rem", fontFamily: "Inter", lineHeight: 1.72, fontStyle: "italic" }}>
          "That last one is not a feature. That is the market. And it is happening inside Acqar right now."
        </p>
      </motion.div>
    </div>
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem) 100px" }}>
      <SectionCTA />
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
  <section style={{ backgroundColor: C.bgCream, padding: "100px 0 0" }}>
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem)" }}>
      <motion.div {...fadeUp(0)}><SectionLabel>BROKER CONNECT</SectionLabel></motion.div>
      <motion.h2 {...fadeUp(0.08)} style={{ fontFamily: "Inter", fontSize: "clamp(1.9rem, 4.5vw, 3.1rem)", fontWeight: 900, letterSpacing: "-0.03em", color: C.textPrimary, lineHeight: 1.08, marginBottom: "1rem" }}>
        The Most Valuable Room in Dubai Real Estate Is Not on Property Finder.
      </motion.h2>
      <motion.p {...fadeUp(0.15)} style={{ fontFamily: "Inter", fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)", fontWeight: 700, color: C.brand, marginBottom: "2.25rem", lineHeight: 1.45 }}>
        Property Finder is where listings go. Broker Connect is where deals begin.
      </motion.p>

      {[
        "Broker Connect is Acqar's live intelligence community — a single platform where 10,000 RERA-registered brokers, qualified investors, active buyers, and motivated sellers are in conversation right now.",
        "Not a WhatsApp group. Not a Facebook page run by someone selling a masterclass. Not a forum full of copy-paste listings.",
        "A structured, searchable, real-time intelligence network — layered on top of live market data — where the conversations that precede deals actually happen.",
      ].map((p, i) => (
        <motion.p key={i} {...fadeUp(0.2 + i * 0.08)} style={{ color: C.textSecondary, fontSize: "1.05rem", lineHeight: 1.82, marginBottom: "1.1rem", fontFamily: "Inter" }}>{p}</motion.p>
      ))}

      {/* Live feed terminal */}
      <motion.div {...fadeUp(0.45)} style={{ backgroundColor: C.zinc950, border: `1px solid ${C.borderDark}`, borderRadius: "14px", overflow: "hidden", marginTop: "2.75rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", backgroundColor: C.bgDarkSurface, borderBottom: `1px solid ${C.borderDark}` }}>
          <span style={{ color: "#D8D6D2", fontSize: "0.75rem", fontWeight: 900, letterSpacing: "0.15em", fontFamily: "Inter", textTransform: "uppercase" }}>BROKER CONNECT</span>
          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <div className="live-dot" style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: C.greenLight }} />
            <span style={{ color: C.greenLight, fontSize: "0.58rem", fontWeight: 700, fontFamily: "Inter", letterSpacing: "0.12em" }}>LIVE · 10,247 MEMBERS</span>
          </div>
        </div>
        {FEED_ITEMS.map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.45, delay: 0.5 + i * 0.14 }}
            style={{ padding: "16px 18px", borderBottom: i < FEED_ITEMS.length - 1 ? `1px solid ${C.borderDark}` : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "7px", flexWrap: "wrap", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <span style={{ backgroundColor: `${C.brand}22`, color: C.brand, border: `1px solid ${C.brand}40`, borderRadius: "4px", padding: "2px 8px", fontSize: "0.58rem", fontWeight: 900, fontFamily: "Inter", letterSpacing: "0.12em", textTransform: "uppercase" }}>{item.role}</span>
                <span style={{ color: "#5E5C5A", fontSize: "0.62rem", fontFamily: "Inter" }}>{item.loc}</span>
                {item.verified && <span style={{ color: C.greenLight, fontSize: "0.6rem", fontFamily: "Inter" }}>✓ Verified</span>}
              </div>
              <span style={{ color: "#3E3C3A", fontSize: "0.6rem", fontFamily: "Inter" }}>{item.time}</span>
            </div>
            <p style={{ color: "#C8C6C2", fontSize: "0.82rem", lineHeight: 1.62, fontFamily: "Inter" }}>{item.text}</p>
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
          <span key={i} style={{ backgroundColor: C.bgWhite, border: `1px solid ${C.borderLight}`, borderRadius: "9999px", padding: "8px 16px", fontSize: "0.82rem", fontFamily: "Inter", color: C.textPrimary, display: "inline-flex", alignItems: "center", gap: "7px" }}>
            {pill.icon} {pill.label}
          </span>
        ))}
      </motion.div>

      <motion.p {...fadeUp(0.65)} style={{ color: C.textSecondary, fontSize: "1.05rem", lineHeight: 1.82, fontFamily: "Inter", marginBottom: "1rem" }}>
        The broker who is inside this conversation has an unfair advantage. The broker who is not is working from rumour and noise — the same position everyone else is in.
      </motion.p>
      <motion.p {...fadeUp(0.7)} style={{ color: C.textPrimary, fontSize: "1.05rem", fontWeight: 700, lineHeight: 1.82, fontFamily: "Inter", marginBottom: "3.5rem" }}>
        Getting into Broker Connect costs nothing. Missing it costs deals.
      </motion.p>
    </div>
    <div style={{ maxWidth: "820px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem) 100px" }}>
      <SectionCTA />
    </div>
  </section>
);

// =============================================================================
// SECTION 6 — PRICING
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

const PRO_FEATURES_LIST = [
  { type: "header",  text: "Everything in Free, plus:" },
  { type: "feature", text: "Distress Deal Pro — full address, discount %, timing score" },
  { type: "feature", text: "AI Pulse Brief — daily market intelligence digest" },
  { type: "feature", text: "Market Timing Index by Area" },
  { type: "feature", text: "Nationality Demand Intelligence" },
  { type: "feature", text: "AI Price Forecasting" },
  { type: "feature", text: "Investment Scorecard" },
  { type: "feature", text: "Rental Terminal" },
  { type: "feature", text: "Off-Plan Pipeline Tracker" },
  { type: "feature", text: "Developer Scorecard" },
  { type: "feature", text: "Portfolio Intelligence" },
  { type: "feature", text: "Unlimited TruValu AI Valuations" },
  { type: "feature", text: "WhatsApp + Email Signal Alerts" },
  { type: "feature", text: "Broker Connect Pro — full participation" },
];

const PricingSection = () => (
  <section style={{ backgroundColor: C.bgWhite, padding: "100px 0 0" }}>
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem)" }}>
      <motion.div {...fadeUp(0)} style={{ textAlign: "center" }}><SectionLabel>YOUR ACCESS</SectionLabel></motion.div>
      <motion.h2 {...fadeUp(0.08)} style={{ fontFamily: "Inter", fontSize: "clamp(1.9rem, 4.5vw, 3.1rem)", fontWeight: 900, letterSpacing: "-0.03em", color: C.textPrimary, lineHeight: 1.08, marginBottom: "3.25rem", textAlign: "center" }}>
        Two Ways In.{" "}<span style={{ color: C.brand }}>One Expires May 15.</span>
      </motion.h2>

      <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", alignItems: "start" }}>

        {/* FREE CARD */}
        <motion.div {...fadeUp(0.18)} whileHover={{ scale: 1.005, boxShadow: "0 8px 40px rgba(0,0,0,0.07)" }}
          style={{ backgroundColor: C.bgCream, border: `1px solid ${C.borderLight}`, borderRadius: "16px", padding: "32px" }}>
          <div style={{ marginBottom: "26px" }}>
            <p style={{ color: C.textMuted, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", fontFamily: "Inter", textTransform: "uppercase", marginBottom: "14px" }}>SIGNAL FREE</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "7px", marginBottom: "5px" }}>
              <span style={{ fontSize: "3rem", fontWeight: 900, color: C.textPrimary, lineHeight: 1, fontFamily: "Inter" }}>AED 0</span>
              <span style={{ color: C.textMuted, fontSize: "0.88rem", fontFamily: "Inter" }}>/month</span>
            </div>
            <p style={{ color: C.textMuted, fontSize: "0.8rem", fontFamily: "Inter" }}>Forever. No card.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "11px", marginBottom: "28px" }}>
            {FREE_FEATURES.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "9px", fontSize: "0.875rem", fontFamily: "Inter", color: C.textSecondary }}>
                <span style={{ color: C.textMuted, flexShrink: 0, lineHeight: "1.55" }}>✓</span>{f}
              </div>
            ))}
          </div>
          <CTAButton href="https://www.acqar.com/register" size="md" fullWidth variant="outline">Join Free Now</CTAButton>
        </motion.div>

        {/* PRO CARD */}
        <motion.div {...fadeUp(0.28)} whileHover={{ scale: 1.005, boxShadow: `0 16px 60px ${C.brand}33` }}
          style={{ backgroundColor: C.bgDark, border: `2px solid ${C.brand}`, borderRadius: "16px", padding: "32px", position: "relative" }}>
          <div style={{ position: "absolute", top: "-16px", left: "50%", transform: "translateX(-50%)", backgroundColor: C.brand, color: "#fff", borderRadius: "9999px", padding: "5px 18px", fontSize: "0.62rem", fontWeight: 700, fontFamily: "Inter", letterSpacing: "0.14em", whiteSpace: "nowrap", boxShadow: `0 4px 16px ${C.brand}55` }}>
            FOUNDING RATE · EXPIRES MAY 15
          </div>
          <div style={{ marginBottom: "22px" }}>
            <p style={{ color: C.brand, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", fontFamily: "Inter", textTransform: "uppercase", marginBottom: "14px" }}>SIGNAL PRO</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: "7px", marginBottom: "5px" }}>
              <span style={{ fontSize: "3rem", fontWeight: 900, color: "#ECECE8", lineHeight: 1, fontFamily: "Inter" }}>AED 29</span>
              <span style={{ color: "#5E5C5A", fontSize: "0.88rem", fontFamily: "Inter" }}>/month</span>
            </div>
            <span style={{ color: "#4A4846", fontSize: "0.82rem", fontFamily: "Inter", textDecoration: "line-through", display: "block", marginBottom: "6px" }}>AED 149/month</span>
            <p style={{ color: "#5E5C5A", fontSize: "0.8rem", fontFamily: "Inter" }}>Locks forever. Price never increases.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "22px" }}>
            {PRO_FEATURES_LIST.map(({ type, text }, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "9px", fontSize: "0.875rem", fontFamily: "Inter", color: type === "header" ? "#7A7876" : "#C8C6C2", fontWeight: type === "header" ? 600 : 400 }}>
                {type === "feature" && <span style={{ color: C.brand, flexShrink: 0, lineHeight: "1.55" }}>✓</span>}
                {text}
              </div>
            ))}
          </div>
          <p style={{ color: "#5E5C5A", fontSize: "0.84rem", fontFamily: "Inter", lineHeight: 1.72, fontStyle: "italic", marginBottom: "20px" }}>
            "What is AED 29? One morning's coffee at Five Palm. One hour of your time on a deal that doesn't close. One month of having the intelligence that every serious broker in Dubai needs right now."
          </p>
          <div style={{ backgroundColor: `${C.brand}14`, border: `1px solid ${C.brand}38`, borderRadius: "10px", padding: "16px 18px", marginBottom: "24px" }}>
            <p style={{ color: "#BCBAB6", fontSize: "0.82rem", fontFamily: "Inter", lineHeight: 1.68 }}>
              <strong style={{ color: "#D8D6D2" }}>🛡 14-Day Full Refund. No Questions.</strong><br />
              If you use Signal Pro for 14 days and do not find one piece of intelligence that changes a conversation with a client — ask for your money back. We return it same day.
            </p>
          </div>
          <CTAButton href="https://www.acqar.com/register" size="lg" fullWidth variant="copper">
            Lock AED 29 Forever — Join Signal Pro
          </CTAButton>
        </motion.div>
      </div>

      <div style={{ marginTop: "4rem", paddingBottom: "100px" }}>
        <SectionCTA />
      </div>
    </div>
  </section>
);

// =============================================================================
// SECTION 7 — NOT FOR EVERYONE
// =============================================================================
const NotForEveryoneSection = () => (
  <section style={{ backgroundColor: C.bgCream, padding: "100px 0 0" }}>
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem)" }}>
      <motion.div {...fadeUp(0)}><SectionLabel>READ THIS BEFORE YOU REGISTER</SectionLabel></motion.div>
      <motion.h2 {...fadeUp(0.08)} style={{ fontFamily: "Inter", fontSize: "clamp(1.9rem, 4.5vw, 3.1rem)", fontWeight: 900, letterSpacing: "-0.03em", color: C.textPrimary, lineHeight: 1.08, marginBottom: "1.5rem" }}>
        Acqar Is Not For Every Broker.
      </motion.h2>

      {[
        "Acqar is not a portal. It does not list properties. It does not generate leads and sell the same lead to ten other agents.",
        "It does not tell you what happened in the market last quarter. It does not give you a number with no context and call it a valuation.",
      ].map((p, i) => (
        <motion.p key={i} {...fadeUp(0.15 + i * 0.08)} style={{ color: C.textSecondary, fontSize: "1.05rem", lineHeight: 1.82, marginBottom: "1rem", fontFamily: "Inter" }}>{p}</motion.p>
      ))}

      {/* NOT FOR / FOR */}
      <div className="notfor-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px", marginTop: "2.75rem", marginBottom: "3.25rem" }}>
        <motion.div {...fadeUp(0.3)} style={{ backgroundColor: C.redBg, border: `1px solid ${C.redBorder}`, borderRadius: "12px", padding: "26px" }}>
          <h4 style={{ fontSize: "0.72rem", fontWeight: 900, color: C.red, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "18px", fontFamily: "Inter" }}>NOT FOR YOU IF</h4>
          {[
            "You are looking for a shortcut to leads",
            "You want someone else to do the thinking",
            "You are comfortable guessing in client meetings",
            "You rely on WhatsApp groups for market intelligence",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "9px", fontSize: "0.875rem", fontFamily: "Inter", color: "#7F1D1D", marginBottom: "11px", lineHeight: 1.55 }}>
              <span style={{ color: C.red, flexShrink: 0 }}>✗</span>{item}
            </div>
          ))}
        </motion.div>

        <motion.div {...fadeUp(0.38)} style={{ backgroundColor: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: "12px", padding: "26px" }}>
          <h4 style={{ fontSize: "0.72rem", fontWeight: 900, color: C.green, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "18px", fontFamily: "Inter" }}>FOR YOU IF</h4>
          {[
            "You want to be the most informed broker in every room",
            "You call your client before they call you",
            "You show data, not gut feel, in every conversation",
            "You want to find distress deals before they hit any portal",
            "You want to be inside the conversation where deals begin",
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "9px", fontSize: "0.875rem", fontFamily: "Inter", color: "#14532D", marginBottom: "11px", lineHeight: 1.55 }}>
              <span style={{ color: C.green, flexShrink: 0 }}>✓</span>{item}
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div {...fadeUp(0.55)} style={{ textAlign: "center", marginBottom: "3.5rem" }}>
        <p style={{ fontFamily: "Inter", fontSize: "clamp(1.2rem, 3.2vw, 1.65rem)", fontWeight: 900, color: C.textPrimary, lineHeight: 1.4 }}>
          This is for the broker who has decided to survive —<br />
          and <span style={{ color: C.brand }}>dominate</span> — this market's reset.
        </p>
      </motion.div>
    </div>
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "0 clamp(1.25rem, 4vw, 2rem) 100px" }}>
      <SectionCTA />
    </div>
  </section>
);

// =============================================================================
// SECTION 8 — THE CLOSE (with full timeline)
// =============================================================================
const TIMELINE = [
  { date: "Feb 28", label: "US-Israel strikes on Iran. Market freezes.",         active: false },
  { date: "Mar 9",  label: "DFM crashes 30%. Actual prices -3%.",               active: false },
  { date: "Apr 17", label: "Ceasefire. Strait of Hormuz opens. Viewings +75%.", active: false },
  { date: "NOW",    label: "Rebound begins. Position now or catch up later.",    active: true  },
];

const TheCloseSection = () => (
  <section style={{ backgroundColor: C.bgDark, padding: "100px clamp(1.25rem, 4vw, 2rem)" }}>
    <div style={{ maxWidth: "820px", margin: "0 auto" }}>
      <motion.div {...fadeUp(0)}><SectionLabel>THE MARKET · APRIL 2026</SectionLabel></motion.div>
      <motion.h2 {...fadeUp(0.08)} style={{ fontFamily: "Inter", fontSize: "clamp(1.9rem, 4.5vw, 3.1rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#ECECE8", lineHeight: 1.08, marginBottom: "3.25rem" }}>
        The Ceasefire Was Called. The Strait Is Open.{" "}
        <span style={{ color: C.brand }}>The Market Is Moving.</span>
      </motion.h2>

      {/* Horizontal timeline */}
      <motion.div {...fadeUp(0.18)} style={{ marginBottom: "3.75rem", overflowX: "auto", paddingBottom: "4px" }} className="no-scroll">
        <div style={{ position: "relative", display: "flex", minWidth: "420px", padding: "0 20px" }}>
          <div style={{ position: "absolute", top: "20px", left: "50px", right: "50px", height: "2px", backgroundColor: C.borderDark, zIndex: 0 }} />
          <div style={{ position: "absolute", top: "20px", left: "50px", width: "75%", height: "2px", background: `linear-gradient(to right, ${C.brand}, ${C.brandBorder})`, zIndex: 1 }} />
          {TIMELINE.map((ev, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.25 + i * 0.14 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", position: "relative", zIndex: 2, padding: "0 6px" }}>
              <div style={{ width: ev.active ? "42px" : "34px", height: ev.active ? "42px" : "34px", borderRadius: "50%", backgroundColor: ev.active ? C.brand : C.bgDarkCard, border: `2px solid ${ev.active ? C.brand : C.borderDark}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "12px", boxShadow: ev.active ? `0 0 22px ${C.brand}70` : "none" }}>
                {ev.active ? <div className="live-dot" style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#fff" }} /> : <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: C.borderDark }} />}
              </div>
              <div style={{ color: ev.active ? C.brand : "#4A4846", fontSize: "0.62rem", fontWeight: 700, fontFamily: "Inter", letterSpacing: "0.08em", marginBottom: "6px" }}>{ev.date}</div>
              <div style={{ color: ev.active ? "#D8D6D2" : "#3E3C3A", fontSize: "0.68rem", fontFamily: "Inter", lineHeight: 1.45 }}>{ev.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {[
        "The 60–80% of deals that were on hold are beginning to fast-track. The rebound is not coming. It has started.",
        "The brokers who spent the last 6 weeks on Acqar Signal — tracking the distress market, timing the recovery by area, building their client relationships with real intelligence — are already positioned.",
        "They know which areas are moving first. They have distress deals lined up for cash-ready clients. They have investors who trust them because they sent the AI Pulse Brief every week when every other broker went silent.",
      ].map((p, i) => (
        <motion.p key={i} {...fadeUp(0.35 + i * 0.09)} style={{ color: "#8A8886", fontSize: "1.05rem", lineHeight: 1.82, marginBottom: "1.3rem", fontFamily: "Inter" }}>{p}</motion.p>
      ))}

      {/* Emphasis block */}
      <motion.div {...fadeUp(0.65)} style={{ backgroundColor: C.brandBg, border: `1px solid ${C.brandBorder}`, borderRadius: "14px", padding: "clamp(28px,5vw,48px) clamp(24px,5vw,44px)", textAlign: "center", marginTop: "2.75rem", marginBottom: "3.25rem" }}>
        <p style={{ fontSize: "clamp(1.15rem,3vw,1.75rem)", fontWeight: 900, color: "#ECECE8", lineHeight: 1.42, marginBottom: "0.5rem", fontFamily: "Inter" }}>
          You are not joining a platform.
        </p>
        <p style={{ fontSize: "clamp(1.05rem,2.8vw,1.55rem)", fontWeight: 700, color: C.brand, lineHeight: 1.42, fontFamily: "Inter" }}>
          You are getting into the room where Dubai real estate is actually happening.
        </p>
      </motion.div>

      {/* Final CTA */}
      <motion.div {...fadeUp(0.75)} style={{ textAlign: "center" }}>
        <CTAButton href="https://www.acqar.com/register" variant="copper" size="xl" fullWidth>
          JOIN ACQAR FREE NOW
        </CTAButton>
        <p style={{ color: "#5E5C5A", fontSize: "0.8rem", fontFamily: "Inter", marginTop: "14px", lineHeight: 1.6 }}>
          No credit card. RERA-registered brokers only. 2 minutes to activate.
        </p>
        <p style={{ color: C.brand, fontSize: "0.85rem", fontFamily: "Inter", fontWeight: 600, marginTop: "8px" }}>
          Signal Pro Founding Rate: AED 29/month — locks forever. Becomes AED 149 on May 16.
        </p>
        <p style={{ color: "#3E3C3A", fontSize: "0.76rem", fontFamily: "Inter", marginTop: "6px" }}>
          14-day full refund. No questions.
        </p>
      </motion.div>
    </div>
  </section>
);

// =============================================================================
// FOOTER
// =============================================================================
const Footer = () => (
  <footer style={{ backgroundColor: "#FFFFFF", borderTop: `1px solid ${C.borderDark}`, padding: "44px clamp(1.25rem, 4vw, 2.5rem)" }}>
    <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "24px" }}>
      <div>
        <AcqarLogo dark />
        <p style={{ color: "#0A0907", fontSize: "0.72rem", fontFamily: "Inter", marginTop: "8px" }}>© 2026 AcqarLabs LLC-FZ. All rights reserved.</p>
      </div>
      <div style={{ display: "flex", gap: "22px", flexWrap: "wrap", alignItems: "center" }}>
        {[
          { label: "Privacy Policy", href: "https://www.acqar.com/privacy" },
          { label: "Terms",          href: "https://www.acqar.com/terms"   },
          { label: "Support",        href: "https://www.acqar.com/support" },
        ].map((link, i) => (
          <a key={i} href={link.href} style={{ color: "#5E5C5A", fontSize: "0.78rem", fontFamily: "Inter", textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = C.brand}
            onMouseLeave={e => e.currentTarget.style.color = "#5E5C5A"}>
            {link.label}
          </a>
        ))}
      </div>
      <p style={{ color: "#3E3C3A", fontSize: "0.72rem", fontFamily: "Inter" }}>Built for Dubai Real Estate Professionals</p>
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
