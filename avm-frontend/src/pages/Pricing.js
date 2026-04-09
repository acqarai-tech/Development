// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import { trackEvent } from "../analytics";
// import PaywallModal from "../components/PaywallModal";

// /* ─────────────────────────────────────────
//    GLOBAL STYLES
// ───────────────────────────────────────── */
// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
//   @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

//   .pricing-page * { box-sizing: border-box; }

//   .pricing-page .material-symbols-outlined {
//     font-family: 'Material Symbols Outlined';
//     font-weight: normal;
//     font-style: normal;
//     font-size: 24px;
//     line-height: 1;
//     letter-spacing: normal;
//     text-transform: none;
//     display: inline-block;
//     white-space: nowrap;
//     word-wrap: normal;
//     direction: ltr;
//     font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
//   }

//   .pricing-page .architectural-lines {
//     background-image: radial-gradient(#2B2B2B 0.5px, transparent 0.5px);
//     background-size: 24px 24px;
//     opacity: 0.05;
//     position: absolute;
//     inset: 0;
//     pointer-events: none;
//   }

//   .pricing-page ::selection {
//     background: #B87333;
//     color: white;
//   }

//   .pricing-card:hover {
//     box-shadow: 0 20px 60px rgba(0,0,0,0.1) !important;
//   }

//   .pricing-btn-primary:hover { opacity: 0.88; }
//   .pricing-btn-outline:hover { background: #2B2B2B !important; color: white !important; }

//   /* ── TABLET ── */
//   @media (max-width: 1024px) {
//     .footer-grid { grid-template-columns: 1fr 1fr 1fr !important; }
//   }

//   /* ── MOBILE LANDSCAPE / TABLET PORTRAIT ── */
//   @media (max-width: 900px) {
//     .pricing-tiers-grid {
//       grid-template-columns: 1fr !important;
//       max-width: 480px !important;
//       margin-left: auto !important;
//       margin-right: auto !important;
//     }
//     .pricing-tiers-grid > div:nth-child(2) {
//       transform: scale(1) !important;
//     }
//     .who-uses-grid { grid-template-columns: repeat(2, 1fr) !important; }
//     .compare-table { font-size: 0.75rem !important; }
//     .compare-table th, .compare-table td { padding: 0.75rem 0.75rem !important; }
//     .footer-grid { grid-template-columns: 1fr 1fr !important; }
//     .cta-buttons { flex-direction: column !important; align-items: stretch !important; }
//     .cta-buttons button { width: 100% !important; }
//   }

//   /* ── MOBILE ── */
//   @media (max-width: 600px) {
//     /* Hero */
//     .pricing-hero-section {
//       padding: 4rem 1.25rem !important;
//     }
//     .pricing-hero-section h1 {
//       font-size: clamp(2.5rem, 14vw, 4rem) !important;
//       margin-bottom: 1.25rem !important;
//     }
//     .pricing-hero-section p {
//       font-size: 1rem !important;
//       margin-bottom: 2rem !important;
//     }
//     .pricing-toggle { margin-bottom: 2rem !important; }

//     /* Founding banner */
//     .founding-banner {
//       flex-direction: column !important;
//       gap: 1rem !important;
//       width: 100% !important;
//       padding: 1rem !important;
//     }
//     .founding-banner > div { margin-right: 0 !important; }
//     .founding-divider { display: none !important; }

//     /* Tiers */
//     .pricing-tiers-grid {
//       padding: 0 1.25rem 4rem !important;
//       max-width: 100% !important;
//     }

//     /* Who uses */
//     .who-uses-section { padding: 4rem 1.25rem !important; }
//     .who-uses-grid { grid-template-columns: 1fr !important; }

//     /* Compare table */
//     .compare-section { padding: 4rem 0.75rem !important; }
//     .compare-table-wrap { border-radius: 1rem !important; }
//     .compare-table { font-size: 0.7rem !important; min-width: 480px; }
//     .compare-table th, .compare-table td { padding: 0.6rem 0.6rem !important; }
//     .compare-table th:first-child,
//     .compare-table td:first-child { min-width: 120px; }

//     /* FAQ */
//     .faq-section { padding: 4rem 1.25rem !important; }
//     .faq-section h2 { font-size: 2rem !important; }
//     .faq-item-question { font-size: 0.9rem !important; }

//     /* CTA */
//     .cta-section { padding: 4rem 1.25rem !important; }
//     .cta-section h2 { font-size: clamp(1.75rem, 8vw, 3rem) !important; }
//     .cta-section p { font-size: 1rem !important; }
//     .cta-buttons { flex-direction: column !important; gap: 0.75rem !important; }
//     .cta-buttons button {
//       width: 100% !important;
//       padding: 1rem 1.5rem !important;
//       font-size: 0.625rem !important;
//     }

//     /* Footer */
//     .footer-inner { padding: 3rem 1.25rem 2rem !important; }
//     .footer-grid {
//       grid-template-columns: 1fr 1fr !important;
//       gap: 2rem !important;
//       margin-bottom: 2.5rem !important;
//     }
//     .footer-brand { grid-column: 1 / -1 !important; }
//     .footer-bottom {
//       flex-direction: column !important;
//       align-items: flex-start !important;
//       gap: 0.5rem !important;
//     }

//     /* Section headings */
//     .who-uses-heading h2 { font-size: 2rem !important; }
//     .compare-heading h2 { font-size: 2rem !important; }
//   }

//   /* ── EXTRA SMALL ── */
//   @media (max-width: 380px) {
//     .pricing-hero-section { padding: 3rem 1rem !important; }
//     .pricing-tiers-grid { padding: 0 1rem 3rem !important; }
//     .compare-table { font-size: 0.65rem !important; min-width: 420px; }
//   }
// `;

// /* ─────────────────────────────────────────
//    SMALL HELPERS
// ───────────────────────────────────────── */
// // const AEDIcon = ({ style = {} }) => (
// //   <img
// //     alt="AED"
// //     style={{ height: "2rem", width: "auto", ...style }}
// //     src="https://lh3.googleusercontent.com/aida/ADBb0ugyDYGIcyDrjPsg38dh61Ezcjtj-r-B9vT-LsT_b8c6iG7kkG3vpq_48Lu92EcJ2fvEZvm9lO7koOu2x2x4licRYhEd1CJFY1sginsn6lYiRDMkrs3CG_ja4_5IXDNfr98l8qHfmZdilReWrfwLN0V_oNCUnKiwgB8o_IjCYqwKK8INIrTHn4AUKf1772yMXaG-BXaSlEK_o0zEWQgxkc6rLl6Yz2pmxNRXpx92U-GjPSLsL5zTnv8YoqrehCn9_VfIXPvXxpMQ"
// //   />
// // );

// // const AEDIcon = ({ style = {} }) => (
// //   <span
// //     style={{
// //       fontFamily: "Arial, sans-serif",
// //       fontWeight: 900,
// //       fontSize: "1.5rem",
// //       lineHeight: 1,
// //       letterSpacing: "-0.02em",
// //       ...style
// //     }}
// //   >
// //     AED
// //   </span>
// // );



// const AEDIcon = ({ size = 24, style = {} }) => (
//   <svg
//     viewBox="0 0 115 100"
//     width={size}
//     height={Math.round(size * 0.87)}
//     style={{ display: "inline-block", verticalAlign: "middle", ...style }}
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     {/* Thick vertical stroke */}
//     <rect x="14" y="0" width="12" height="100" fill="currentColor"/>

//     {/* D curve — pixel traced from image */}
//     <path
//       d="M 26,0 L 49,0 C 60,0 74,4 80,10 C 88,18 93,28 95,39
//          L 95,61
//          C 93,72 88,82 80,90 C 74,96 60,100 49,100 L 26,100 Z"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="5"
//       strokeLinejoin="round"
//     />

//     {/* Bar 1 — full width, cuts through everything */}
//     <rect x="0" y="35" width="112" height="9" fill="currentColor"/>

//     {/* Bar 2 — full width, cuts through everything */}
//     <rect x="0" y="56" width="112" height="8" fill="currentColor"/>
//   </svg>
// );

// const Icon = ({ name, style = {} }) => (
//   <span className="material-symbols-outlined" style={style}>{name}</span>
// );

// function Check({ color = "#2B2B2B", dim = false }) {
//   return (
//     <span
//       className="material-symbols-outlined"
//       style={{ color: dim ? "#B3B3B3" : color, fontSize: "1.125rem", opacity: dim ? 0.4 : 1 }}
//     >
//       check_circle
//     </span>
//   );
// }

// function TableGroupHeader({ label }) {
//   return (
//     <tr style={{ background: "#F8F9FA", borderBottom: "1px solid rgba(229,231,235,0.3)" }}>
//       <td
//         colSpan={4}
//         style={{ padding: "1rem 2rem", fontSize: "0.625rem", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B87333" }}
//       >
//         {label}
//       </td>
//     </tr>
//   );
// }

// function TableRow({ label, explorer, pro, elite, proHighlight }) {
//   return (
//     <tr style={{ borderBottom: "1px solid rgba(229,231,235,0.3)" }}>
//       <td style={{ padding: "1.5rem 2rem", fontWeight: 700 }}>{label}</td>
//       <td style={{ padding: "1.5rem 2rem", textAlign: "center", color: "#B3B3B3", opacity: 0.6 }}>{explorer}</td>
//       <td style={{
//         padding: "1.5rem 2rem", textAlign: "center", fontWeight: 900,
//         background: proHighlight ? "rgba(253,241,230,0.3)" : "transparent",
//         borderLeft: "1px solid rgba(229,231,235,0.1)",
//         borderRight: "1px solid rgba(229,231,235,0.1)",
//       }}>{pro}</td>
//       <td style={{ padding: "1.5rem 2rem", textAlign: "center", fontWeight: 900 }}>{elite}</td>
//     </tr>
//   );
// }

// function FAQItem({ question, answer }) {
//   const [open, setOpen] = useState(false);
//   return (
//     <div
//       onClick={() => setOpen(!open)}
//       style={{ background: "#F8F9FA", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #E5E7EB", cursor: "pointer" }}
//     >
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
//         <span className="faq-item-question" style={{ fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", fontSize: "1.125rem" }}>
//           {question}
//         </span>
//         <span
//           className="material-symbols-outlined"
//           style={{ transition: "transform 0.3s", transform: open ? "rotate(-180deg)" : "rotate(0deg)", flexShrink: 0 }}
//         >
//           expand_more
//         </span>
//       </div>
//       {open && (
//         <p style={{ marginTop: "1rem", color: "#B3B3B3", fontWeight: 500, lineHeight: 1.7 }}>
//           {answer}
//         </p>
//       )}
//     </div>
//   );
// }

// /* ─────────────────────────────────────────
//    HEADER
// ───────────────────────────────────────── */
// function Header() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const current = location.pathname;
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       setUser(data.session?.user ?? null);
//     });
//     const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
//       setUser(session?.user ?? null);
//     });
//     return () => listener.subscription.unsubscribe();
//   }, []);

//   const navItems = [
//     { label: "TRUVALU™", href: "/truvalu" },
//     { label: "PRICING", path: "/pricing" },
//     { label: "RESOURCES", path: "/blogs" },
//   ];

//   return (
//     <>
//       <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#D4D4D4] bg-white">
//         <div className="hdrWrap max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">

//           {/* Logo */}
//           <div
//             className="hdrLogo flex items-center cursor-pointer shrink-0 whitespace-nowrap"
//             onClick={() => { trackEvent("nav_click", { item: "logo" }); navigate("/"); }}
//           >
//             <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
//               <span style={{ color: "#B87333" }}>ACQ</span>
//               <span style={{ color: "#111111" }}>AR</span>
//             </h1>
//           </div>

//           {/* Mobile nav */}
//           <div className="md:hidden flex items-center gap-0">
//             {/* <a
//               href="http://www.acqar.com/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1.5 rounded-full whitespace-nowrap text-[#2B2B2B]/70"
//               style={{ textDecoration: "none" }}
//             >
//               SIGNAL™
//             </a> */}
//             <a
//               href="https://www.acqar.com/truvalu"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-[9px] font-black uppercase tracking-[0.15em] px-1 py-1 rounded-full whitespace-nowrap text-[#2B2B2B]/70"
//               style={{ textDecoration: "none" }}
//             >
//               TRUVALU™
//             </a>
//             <button
//               onClick={() => { trackEvent("nav_click", { item: "pricing" }); navigate("/pricing"); }}
//               className={`text-[9px] font-black uppercase tracking-[0.15em] px-1 py-1 rounded-full whitespace-nowrap ${current === "/pricing" ? "text-[#B87333] underline underline-offset-4" : "text-[#2B2B2B]/70"}`}
//             >
//               PRICING
//             </button>
//             <button
//               onClick={() => { trackEvent("nav_click", { item: "resources" }); navigate("/blogs"); }}
//               className={`text-[9px] font-black uppercase tracking-[0.15em] px-1 py-1 rounded-full whitespace-nowrap ${current === "/blogs" ? "text-[#B87333] underline underline-offset-4" : "text-[#2B2B2B]/70"}`}
//             >
//               RESOURCES
//             </button>
//           </div>

//           {/* Desktop nav */}
//           <nav className="hidden md:flex items-center gap-10">
//             <a
//               href="http://www.acqar.com/"
//               target="_blank"
//               rel="noopener noreferrer"
//               onClick={() => trackEvent("Nav", "Click", "Signal")}
//               className="text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap text-[#2B2B2B]"
//               style={{ textDecoration: "none" }}
//             >
//               SIGNAL™
//             </a>

//             {navItems.map((item) =>
//               item.href ? (
//                 <a
//                   key={item.label}
//                   href={item.href}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   onClick={() => trackEvent("Nav", "Click", item.label)}
//                   className="text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap text-[#2B2B2B]"
//                   style={{ textDecoration: "none" }}
//                 >
//                   {item.label}
//                 </a>
//               ) : (
//                 <button
//                   key={item.label}
//                   onClick={() => { trackEvent("Nav", "Click", item.label); navigate(item.path); }}
//                   className={`text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap ${current === item.path ? "text-[#B87333] border-b-2 border-[#B87333]" : "text-[#2B2B2B]"}`}
//                 >
//                   {item.label}
//                 </button>
//               )
//             )}
//           </nav>

//           {/* Right CTA */}
//           <div className="hdrRight flex items-center gap-2 sm:gap-4 shrink-0 flex-nowrap">
//             {user ? (
//               <button
//                 onClick={() => navigate("/dashboard")}
//                className="bg-[#B87333] text-white px-2 sm:px-6 py-1.5 sm:py-2.5 rounded-md text-[9px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
//               >
//                 Dashboard
//               </button>
//             ) : (
//               <button
//                 onClick={() => { trackEvent("nav_click", { item: "login" }); navigate("/login"); }}
//                 className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
//               >
//                 Sign In
//               </button>
//             )}
//           </div>
//         </div>

//         <style>{`
//           @media (max-width: 420px) {
//             .hdrWrap { padding-left: 10px !important; padding-right: 10px !important; gap: 4px !important; }
//             .hdrLogo h1 { font-size: 17px !important; letter-spacing: -0.02em !important; }
//           }
//           @media (max-width: 360px) {
//             .hdrWrap { gap: 3px !important; }
//           }
//         `}</style>
//       </header>
//       <div className="h-20" />
//     </>
//   );
// }

// /* ─────────────────────────────────────────
//    FOOTER
// ───────────────────────────────────────── */
// function Footer() {
//   const navigate = useNavigate();

//   return (
//     <>
//       <style>{`
//         .acq-footer-new {
//           position: relative;
//           background: #F5F5F4;
//           border-top: 1px solid rgba(10,10,10,0.06);
//           font-family: 'Inter', sans-serif;
//         }
//         .acq-footer-new .copper-line {
//           position: absolute;
//           top: 0; left: 0; right: 0;
//           height: 1px;
//           background: linear-gradient(90deg, transparent 0%, #B87333 35%, #B87333 65%, transparent 100%);
//         }
//         .acq-footer-new .inner {
//           max-width: 100%;
//           margin: 0 auto;
//           padding: 48px 80px 32px;
//         }
//         .acq-footer-new .main-grid {
//           display: grid;
//           grid-template-columns: 1.8fr 1fr 1fr 1fr 1fr;
//           gap: 32px;
//           margin-bottom: 48px;
//         }
//         .acq-footer-new .col-heading {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           margin-bottom: 24px;
//         }
//         .acq-footer-new .col-heading-dot {
//           width: 4px; height: 4px;
//           border-radius: 50%;
//           background: #B87333;
//           opacity: 0.7;
//         }
//         .acq-footer-new .col-heading h6 {
//           font-size: 11px;
//           font-weight: 900;
//           text-transform: uppercase;
//           letter-spacing: 0.28em;
//           color: #0A0A0A;
//           margin: 0;
//         }
//         .acq-footer-new ul {
//           list-style: none;
//           padding: 0; margin: 0;
//           display: flex;
//           flex-direction: column;
//           gap: 16px;
//         }
//         .acq-footer-new ul li {
//           font-size: 11.5px;
//           font-weight: 600;
//           color: rgba(10,10,10,0.55);
//           cursor: pointer;
//           transition: color 0.2s;
//         }
//         .acq-footer-new ul li:hover { color: #B87333; }
//         .acq-footer-new ul li.muted {
//           color: rgba(10,10,10,0.55);
//           cursor: default;
//         }
//         .acq-footer-new ul li a {
//           color: inherit;
//           text-decoration: none;
//           transition: color 0.2s;
//         }
//         .acq-footer-new ul li a:hover { color: #B87333; }
//         .acq-footer-new .soon-badge {
//           padding: 1px 6px;
//           font-size: 8px;
//           font-weight: 900;
//           text-transform: uppercase;
//           background: rgba(184,115,51,0.1);
//           color: #B87333;
//           border: 1px solid rgba(184,115,51,0.2);
//           border-radius: 4px;
//           margin-left: 6px;
//         }
//         .acq-footer-new .rics-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           padding: 6px 12px;
//           background: white;
//           border: 1px solid rgba(184,115,51,0.2);
//           border-radius: 999px;
//           margin-bottom: 32px;
//         }
//         .acq-footer-new .rics-badge span {
//           font-size: 9px;
//           font-weight: 900;
//           color: rgba(10,10,10,0.7);
//           text-transform: uppercase;
//           letter-spacing: 0.2em;
//         }
//         .acq-footer-new .social-row { display: flex; gap: 12px; }
//         .acq-footer-new .social-btn {
//           width: 36px; height: 36px;
//           border-radius: 50%;
//           border: 1px solid rgba(10,10,10,0.09);
//           background: rgba(255,255,255,0.6);
//           display: flex; align-items: center; justify-content: center;
//           color: rgba(10,10,10,0.35);
//           text-decoration: none;
//           transition: all 0.2s;
//         }
//         .acq-footer-new .social-btn:hover {
//           color: #B87333;
//           border-color: rgba(184,115,51,0.4);
//         }
//         .acq-footer-new .bottom-bar {
//           border-top: 1px solid rgba(10,10,10,0.06);
//           padding-top: 32px;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           flex-wrap: wrap;
//           gap: 16px;
//           width: 100%;
//         }
//         .acq-footer-new .bottom-bar p {
//           font-weight: 700;
//           color: rgba(10,10,10,0.3);
//           text-transform: uppercase;
//           font-size: 10px;
//           letter-spacing: 0.2em;
//           margin: 0;
//         }
//         .acq-footer-new .bottom-bar .not-advice {
//           font-weight: 500;
//           color: rgba(10,10,10,0.25);
//           font-size: 10px;
//           margin: 0;
//         }
//         .acq-footer-new .bottom-location {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }
//         .acq-footer-new .bottom-location .logo {
//           font-weight: 900;
//           font-size: 10px;
//           letter-spacing: 0.05em;
//         }
//         .acq-footer-new .bottom-location .divider {
//           width: 1px; height: 12px;
//           background: rgba(10,10,10,0.15);
//         }
//         .acq-footer-new .bottom-location .city {
//           font-weight: 600;
//           color: rgba(10,10,10,0.35);
//           font-size: 10px;
//           letter-spacing: 0.05em;
//         }

//         /* Responsive */
//         @media (max-width: 1024px) {
//           .acq-footer-new .inner { padding: 48px 32px 32px; }
//           .acq-footer-new .main-grid { grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
//         }
//         @media (max-width: 768px) {
//           .acq-footer-new .inner { padding: 40px 24px 24px; }
//           .acq-footer-new .main-grid { grid-template-columns: 1fr 1fr; gap: 32px 16px; }
//           .acq-footer-new .bottom-bar { flex-direction: column; text-align: center; justify-content: center; }
//           .acq-footer-new .bottom-location { justify-content: center; }
//           .acq-footer-new .not-advice { display: none; }
//         }
//         @media (max-width: 480px) {
//           .acq-footer-new .inner { padding: 40px 16px 20px; }
//           .acq-footer-new .main-grid { grid-template-columns: 1fr; gap: 28px; }
//         }
//       `}</style>

//       <footer className="acq-footer-new">
//         <div className="copper-line"></div>
//         <div className="inner">

//           {/* Main grid */}
//           <div className="main-grid">

//             {/* Brand column */}
//             <div>
//               <div style={{ marginBottom: 24, lineHeight: 1 }}>
//                 <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px' }}>
//                   <span style={{ color: '#B87333' }}>ACQ</span>
//                   <span style={{ color: '#111111' }}>AR</span>
//                 </span>
//               </div>
//               <p style={{ fontSize: 12, lineHeight: 1.75, color: 'rgba(10,10,10,0.5)', fontWeight: 500, marginBottom: 28, maxWidth: 280 }}>
//                 An AI-powered property intelligence platform built exclusively for Dubai real estate. Independent, institutional-quality, and always on.
//               </p>
//               {/* <div className="rics-badge"> */}
//                 {/* <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
//                   <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M9 12l2 2 4-4" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg> */}
//                 {/* <span>RICS-Aligned Intelligence</span> */}
//               {/* </div> */}
//               <div className="social-row">
//                 {[
//                   { href: 'https://www.linkedin.com/company/acqar', label: 'LinkedIn', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
//                   { href: 'https://www.instagram.com/acqar.dxb/', label: 'Instagram', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
//                 ].map(({ href, label, icon }) => (
//                   <a key={label} href={href} target="_blank" rel="noopener noreferrer"
//                     aria-label={label} className="social-btn"
//                   >{icon}</a>
//                 ))}
//               </div>
//             </div>

//             {/* Product */}
//             <div>
//               <div className="col-heading">
//                 <span className="col-heading-dot"></span>
//                 <h6>Product</h6>
//               </div>
//               <ul>
//                 <li>
//                   <a href="https://www.acqar.com/truvalu" target="_blank" rel="noopener noreferrer">
//                     ACQAR TRUVALU™
//                   </a>
//                 </li>
//                 <li>
//                   <a href="http://www.acqar.com/" target="_blank" rel="noopener noreferrer">
//                     ACQAR SIGNAL™
//                   </a>
//                 </li>
//                 <li className="muted">ACQAR PASSPORT™</li>
//                 <li onClick={() => navigate('/pricing')}>PRICING</li>
//               </ul>
//             </div>

//             {/* Company */}
//             <div>
//               <div className="col-heading">
//                 <span className="col-heading-dot"></span>
//                 <h6>Company</h6>
//               </div>
//               <ul>
//                 {/* {['About ACQAR', 'How It Works', 'Pricing', 'Contact Us', 'Partners'].map(l => ( */}
//                   {['About ACQAR', 'Contact Us'].map(l => (
//                   <li key={l}>{l}</li>
//                 ))}
//               </ul>
//             </div>

//             {/* Legal */}
//             <div>
//               <div className="col-heading">
//                 <span className="col-heading-dot"></span>
//                 <h6>Legal & Info</h6>
//               </div>
//               <ul>
//                 <li onClick={() => window.open('https://www.acqar.com/blogs', '_blank')}>Intelligence Blog</li>
//                 <li onClick={() => navigate('/terms')}>Terms of Use</li>
//                 <li onClick={() => navigate('/terms')}>Privacy Policy</li>
//               </ul>
//             </div>

//             {/* Comparisons */}
//             <div>
//               <div className="col-heading">
//                 <span className="col-heading-dot"></span>
//                 <h6>Comparisons</h6>
//               </div>
//               <ul>
//                 {['vs Bayut TruEstimate', 'vs Property Finder', 'vs Traditional Valuers', 'Why ACQAR?'].map(l => (
//                   <li key={l}>{l}</li>
//                 ))}
//               </ul>
//             </div>

//           </div>

//           {/* Bottom bar */}
//           <div className="bottom-bar">
//             <div className="bottom-location">
//               <span className="logo">
//                 <span style={{ color: '#B87333' }}>ACQ</span>
//                 <span style={{ color: '#0A0A0A' }}>AR</span>
//               </span>
//               <span className="divider"></span>
//               <span className="city">Dubai, United Arab Emirates</span>
//             </div>
//             <p>© 2026 ACQARLABS L.L.C-FZ. All rights reserved.</p>
//             <p className="not-advice">Not financial advice.</p>
//           </div>

//         </div>
//       </footer>
//     </>
//   );
// }

// /* ─────────────────────────────────────────
//    MAIN PRICING PAGE
// ───────────────────────────────────────── */
// export default function Pricing() {
//   const navigate = useNavigate();
// const [isAnnual, setIsAnnual] = useState(false);
// const [spotsLeft, setSpotsLeft] = useState(null);
// const [userPlan, setUserPlan] = useState(null); // null = loading, "free", "pro", "elite"
// const [userEmail, setUserEmail] = useState("");
// const [showPaywall, setShowPaywall] = useState(false);

// useEffect(() => {
//   async function fetchSpots() {
//     const { data, error } = await supabase
//       .rpc('get_founding_member_count');

//     if (!error && data !== null) {
//   // starts at 275 baseline + real pro users from DB
//   const taken = 225 + data;
//   setSpotsLeft(taken);
// }
//   }
//   fetchSpots();
// }, []);

// useEffect(() => {
//   async function fetchUserPlan() {
//     const { data: sess } = await supabase.auth.getSession();
//     const user = sess?.session?.user;
//     if (!user) { setUserPlan("guest"); return; }
//     setUserEmail(user.email || "");
//     const { data } = await supabase
//       .from("users")
//       .select("plan")
//       .eq("id", user.id)
//       .single();
//     setUserPlan(data?.plan || "free");
//   }
//   fetchUserPlan();
// }, []);


// const proMonthly = 29;
//   const eliteMonthly = 299;

//   const proPrice = isAnnual ? Math.round(proMonthly * 12 * 0.83 / 12) : proMonthly;
//   const elitePrice = isAnnual ? Math.round(eliteMonthly * 12 * 0.83 / 12) : eliteMonthly;
//   const proPeriod = isAnnual ? "/MO · BILLED ANNUALLY" : "/MO";
//   const elitePeriod = isAnnual ? "/MO · BILLED ANNUALLY" : "/MO";
//   return (
//     <div className="pricing-page" style={{ fontFamily: "'Inter', sans-serif", background: "#FFFFFF", color: "#2B2B2B" }}>
//       <style>{styles}</style>

//       {/* ── HEADER ── */}
//       <Header />

//       <main>

//         {/* ── HERO ── */}
//         <section className="pricing-hero-section" style={{ position: "relative", padding: "8rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", overflow: "hidden" }}>
//           <div className="architectural-lines" />

//           <div style={{ marginBottom: "2rem", padding: "0.25rem 1rem", background: "#FDF1E6", border: "1px solid rgba(184,115,51,0.2)", borderRadius: "9999px" }}>
//             <span style={{ fontSize: "0.625rem", fontWeight: 900, letterSpacing: "0.3em", color: "#B87333", textTransform: "uppercase" }}>
//               Early Founding Member Access
//             </span>
//           </div>

//           <h1 style={{ fontSize: "clamp(3rem,10vw,8rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.85, marginBottom: "2rem", maxWidth: "80rem", textTransform: "uppercase" }}>
//             See. Value.<br />Decide.
//           </h1>

//           <p style={{ fontSize: "1.25rem", color: "#B3B3B3", maxWidth: "42rem", marginBottom: "3rem", fontWeight: 500 }}>
//             Acqar gives you the market signal to see what is happening, the valuation intelligence to understand what a property is worth, and the investment score to decide whether to act.
//           </p>

          

//           {/* Founding member banner */}
//           <div className="founding-banner" style={{ background: "#FAFAFA", padding: "1rem 2rem", borderRadius: "0.75rem", border: "1px solid #E5E7EB", display: "inline-flex", alignItems: "center", marginBottom: "3rem" }}>
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginRight: "2rem" }}>
//               <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B3B3B3", marginBottom: "0.25rem" }}>Founding Member Offer</span>
//               <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
//   <AEDIcon size="18" style={{ color: "#2B2B2B" }} />
//   <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "#2B2B2B" }}>
//     29<span style={{ fontSize: "0.6875rem", opacity: 0.5, marginLeft: "0.25rem" }}>/MO</span>
//   </span>
// </div>
//                 <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#B87333", textTransform: "uppercase", letterSpacing: "0.15em" }}>For 3 Months</span>
//               </div>
//             </div>
//             <div className="founding-divider" style={{ width: "1px", height: "2rem", background: "#E5E7EB", marginRight: "2rem" }} />
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
//               <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B3B3B3", marginBottom: "0.25rem" }}>Limited Availability</span>
//               <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>
//   <span style={{ color: "#B87333" }}>
//     {spotsLeft !== null ? spotsLeft : '225'}
//   </span> founding members joined
// </span>
//             </div>
//           </div>

//           {/* Monthly / Annual toggle */}
//           <div className="pricing-toggle" style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "4rem" }}>
//   <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", opacity: isAnnual ? 0.4 : 1 }}>Monthly</span>
//   <div
//     onClick={() => setIsAnnual(!isAnnual)}
//     style={{ width: "3.5rem", height: "1.75rem", background: "#2B2B2B", borderRadius: "9999px", position: "relative", padding: "0.25rem", cursor: "pointer" }}
//   >
//     <div style={{
//       width: "1.25rem", height: "1.25rem", background: "#B87333", borderRadius: "9999px",
//       position: "absolute",
//       right: isAnnual ? "0.25rem" : "auto",
//       left: isAnnual ? "auto" : "0.25rem",
//       transition: "left 0.2s, right 0.2s"
//     }} />
//   </div>
//   <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
//     <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", opacity: isAnnual ? 1 : 0.4 }}>Annual</span>
//     <span style={{ fontSize: "0.5625rem", fontWeight: 700, color: "#B87333", letterSpacing: "0.15em", textTransform: "uppercase" }}>Save 17%</span>
//   </div>
// </div>
//         </section>

//         {/* ── PRICING TIERS ── */}
//         <section className="pricing-tiers-grid" style={{ padding: "0 2rem 8rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", maxWidth: "80rem", margin: "0 auto" }}>

//           {/* Explorer */}
//           <div className="pricing-card" style={{ background: "#F8F9FA", padding: "2.5rem", borderRadius: "1.5rem", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", transition: "box-shadow 0.5s" }}>
//             <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "1rem", color: "#B3B3B3" }}>&nbsp;</span>
//             <h3 style={{ fontSize: "2.25rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginBottom: "0.5rem" }}>Explorer</h3>
//             <p style={{ fontSize: "0.875rem", color: "#B3B3B3", marginBottom: "2rem", fontWeight: 500 }}>For anyone getting started with Dubai real estate market.</p>
//             <div style={{ marginBottom: "2rem", display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
//               <span style={{ fontSize: "3rem", fontWeight: 900 }}>FREE</span>
//               <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", opacity: 0.5, textTransform: "uppercase" }}>/Mo</span>
//             </div>
//             <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem", flex: 1 }}>
//               {["3 TRUVALU™ AI Reports", "Instant AI Valuation Estimate", "Webview Reports", "Limited SIGNAL™ Terminal Access", "Limited Signals Feed", "No Credit Card Required"].map(f => (
//                 <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", fontWeight: 500 }}>
//                   <Icon name="check_circle" style={{ color: "#2B2B2B", fontSize: "1.125rem" }} /> {f}
//                 </li>
//               ))}
//             </ul>
//             {userPlan === null ? (
//   // Still loading — show nothing / skeleton
//   <div style={{
//     padding: "1rem",
//     background: "#f3f4f6",
//     borderRadius: "0.75rem",
//     height: "48px",
//   }} />
// ) : userPlan === "free" ? (
//   <div style={{
//     padding: "1rem",
//     background: "rgba(43,43,43,0.06)",
//     borderRadius: "0.75rem",
//     textAlign: "center",
//     fontWeight: 900,
//     fontSize: "0.7rem",
//     letterSpacing: "0.15em",
//     textTransform: "uppercase",
//     color: "#2B2B2B",
//     border: "2px solid rgba(43,43,43,0.15)",
//   }}>
//     ✓ Your Current Plan
//   </div>
// ) : (
//   <button
//     className="pricing-btn-primary"
//     onClick={() => navigate("/valuation")}
//     style={{ width: "100%", padding: "1rem", background: "#2B2B2B", color: "white", borderRadius: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6875rem", border: "none", cursor: "pointer", transition: "opacity 0.2s" }}
//   >
//     Get Started
//   </button>
// )}
//           </div>

//           {/* Pro */}
//           <div className="pricing-card" style={{ background: "white", padding: "2.5rem", borderRadius: "1.5rem", border: "3px solid #B87333", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(184,115,51,0.15)", position: "relative", transform: "scale(1.05)", zIndex: 10 }}>
//             <div style={{ position: "absolute", top: "-1rem", left: "50%", transform: "translateX(-50%)", background: "#B87333", color: "white", padding: "0.25rem 1rem", borderRadius: "9999px", fontSize: "0.625rem", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
//               Most Popular
//             </div>
//             <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "1rem", color: "#B87333" }}>Founding Member Offer</span>
//             <h3 style={{ fontSize: "2.25rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginBottom: "0.5rem" }}>Acqar Pro</h3>
//             <p style={{ fontSize: "0.875rem", color: "#B3B3B3", marginBottom: "2rem", fontWeight: 500 }}>For property owners and buyers who need Dubai real estate intelligence platform.</p>
//             <div style={{ marginBottom: "2rem" }}>
//               <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
//                 <AEDIcon size="42" style={{ color: "#B87333", alignSelf: "center", marginRight: "0.25rem" }} />
//                 <span style={{ fontSize: "3rem", fontWeight: 900, color: "#B87333" }}>{proPrice}</span>
//               </div>
//               <span style={{ fontSize: "0.625rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#B87333" }}>
//   {isAnnual ? proPeriod : "First 3 months → 149/mo after"}
// </span>
//             </div>
//             <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem", flex: 1 }}>
//               {["10 TRUVALU™ AI Reports/Month", "Premium Instant AI Valuation Model", "PDF Reports and Sharable Link", "Full SIGNAL™ Terminal Access", "Real-Time Signals Feed", "Real-Time Signals Report", "Community Chat Access", "Cancel Subscription Anytime"].map(f => (
//                 <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", fontWeight: 700 }}>
//                   <Icon name="verified" style={{ color: "#B87333", fontSize: "1.125rem" }} /> {f}
//                 </li>
//               ))}
//             </ul>
//             {userPlan === "pro" ? (
//   <div>
//     <div style={{
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       gap: "0.5rem",
//       padding: "0.85rem",
//       background: "rgba(34,197,94,0.1)",
//       border: "2px solid rgba(34,197,94,0.5)",
//       borderRadius: "0.75rem",
//       marginBottom: "0.75rem",
//     }}>
//       <span style={{ fontSize: "1rem" }}>✅</span>
//       <span style={{ fontWeight: 900, fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#16a34a" }}>
//         Your Current Plan
//       </span>
//     </div>
//     {userEmail && (
//       <p style={{ fontSize: "0.7rem", color: "#B3B3B3", textAlign: "center", marginBottom: "0.75rem", fontWeight: 600 }}>
//         Active as <strong style={{ color: "#2B2B2B" }}>{userEmail}</strong>
//       </p>
//     )}
//     <button
//       onClick={() => navigate("/dashboard")}
//       style={{ width: "100%", padding: "1rem", background: "transparent", color: "#B87333", borderRadius: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6875rem", border: "2px solid #B87333", cursor: "pointer" }}
//     >
//       Go to Dashboard →
//     </button>
//   </div>
// ) : (
//   <button
//     // onClick={async () => {
//     //   const { data: sess } = await supabase.auth.getSession();
//     //   if (sess?.session?.user) {
//     //     // logged in → show paywall directly
//     //     setShowPaywall(true);
//     //   } else {
//     //     // not logged in → go to signup first
//     //     navigate("/signup");
//     //   }
//     // }}

//     onClick={() => setShowPaywall(true)}
//     style={{ width: "100%", padding: "1rem", background: "#B87333", color: "white", borderRadius: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6875rem", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(184,115,51,0.2)", transition: "opacity 0.2s" }}
//   >
//     Upgrade to Pro
//   </button>
// )}
//           </div>

//           {/* Elite */}
//           <div className="pricing-card" style={{ background: "#F8F9FA", padding: "2.5rem", borderRadius: "1.5rem", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", transition: "box-shadow 0.5s" }}>
//             <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "1rem", color: "#B3B3B3" }}>&nbsp;</span>
//             <h3 style={{ fontSize: "2.25rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginBottom: "0.5rem" }}>Acqar Elite</h3>
//             <p style={{ fontSize: "0.875rem", color: "#B3B3B3", marginBottom: "2rem", fontWeight: 500 }}>For investors and brokers to make data oriented decisions.</p>
//             <div style={{ marginBottom: "2rem", display: "flex", alignItems: "baseline", gap: "0.5rem", color: "#2B2B2B" }}>
//               <AEDIcon size="42" style={{  alignSelf: "center", marginRight: "0.25rem" }} />
//               <span style={{ fontSize: "3rem", fontWeight: 900 }}>{elitePrice}</span>
// <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", opacity: 0.5, textTransform: "uppercase" }}>{elitePeriod}</span>
//             </div>
//             <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem", flex: 1 }}>
//               {["29 TRUVALU™ AI Reports/Month", "Everything in ACQAR PRO", "All S4/S5 Severity Push + Email Alerts", "Daily Market Trend Report", "Weekly Market Digest Email", "Area Specific Watchlists", "Off-plan Completion Risk Score", "Market Timing Index (by Area)", "Cancel Subscription Anytime"].map(f => (
//                 <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", fontWeight: 500 }}>
//                   <Icon name="corporate_fare" style={{ color: "#2B2B2B", fontSize: "1.125rem" }} /> {f}
//                 </li>
//               ))}
//             </ul>
//            {userPlan === "elite" ? (
//   <div>
//     <div style={{
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       gap: "0.5rem",
//       padding: "0.85rem",
//       background: "rgba(34,197,94,0.1)",
//       border: "2px solid rgba(34,197,94,0.5)",
//       borderRadius: "0.75rem",
//       marginBottom: "0.75rem",
//     }}>
//       <span style={{ fontSize: "1rem" }}>✅</span>
//       <span style={{ fontWeight: 900, fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#16a34a" }}>
//         Your Current Plan
//       </span>
//     </div>
//     {userEmail && (
//       <p style={{ fontSize: "0.7rem", color: "#B3B3B3", textAlign: "center", marginBottom: "0.75rem", fontWeight: 600 }}>
//         Active as <strong style={{ color: "#2B2B2B" }}>{userEmail}</strong>
//       </p>
//     )}
//     <button
//       onClick={() => navigate("/dashboard")}
//       style={{ width: "100%", padding: "1rem", background: "transparent", color: "#2B2B2B", borderRadius: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6875rem", border: "2px solid #2B2B2B", cursor: "pointer" }}
//     >
//       Go to Dashboard →
//     </button>
//   </div>
// ) : (
//   <button
//     className="pricing-btn-outline"
//     style={{ width: "100%", padding: "1rem", background: "transparent", color: "#2B2B2B", borderRadius: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6875rem", border: "2px solid #2B2B2B", cursor: "pointer", transition: "background 0.2s, color 0.2s" }}
//   >
//     Contact Sales
//   </button>
// )}
//           </div>
//         </section>

//         {/* ── WHO USES ACQAR ── */}
//         <section className="who-uses-section" style={{ padding: "8rem 2rem", background: "#FAFAFA", overflow: "hidden" }}>
//           <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
//             <div className="who-uses-heading" style={{ textAlign: "center", marginBottom: "5rem" }}>
//               <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase", color: "#B87333" }}>The Ecosystem</span>
//               <h2 style={{ fontSize: "3rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginTop: "1rem" }}>Who Uses Acqar</h2>
//             </div>
//             <div className="who-uses-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
//               {[
//                 { icon: "home_pin", title: "Property Owners", pain: "Uncertainty about real-time asset valuation.", features: ["Regular Value Updates", "Renovation ROI Forecast"] },
//                 { icon: "shopping_bag", title: "Property Buyers", pain: "Fear of overpaying in volatile markets.", features: ["True Market Value Data", "Negotiating Leverage"] },
//                 { icon: "monitoring", title: "Investors", pain: "Difficulty identifying high-yield areas.", features: ["Yield Heatmaps", "Area Appreciation Trends"] },
//                 { icon: "handshake", title: "Brokers", pain: "Lengthy traditional report generation.", features: ["Instant White-Label PDF", "Institutional Credibility"] },
//               ].map(card => (
//                 <div key={card.title} style={{ background: "white", padding: "2rem", borderRadius: "1.5rem", border: "1px solid #E5E7EB" }}>
//                   <div style={{ width: "3rem", height: "3rem", background: "rgba(184,115,51,0.1)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
//                     <Icon name={card.icon} style={{ color: "#B87333" }} />
//                   </div>
//                   <h4 style={{ fontSize: "1.25rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.03em", marginBottom: "1rem" }}>{card.title}</h4>
//                   <div style={{ marginBottom: "1.5rem" }}>
//                     <span style={{ fontSize: "0.5625rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#B3B3B3" }}>Pain Point</span>
//                     <p style={{ fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.6, marginTop: "0.25rem" }}>{card.pain}</p>
//                   </div>
//                   <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//                     {card.features.map(f => (
//                       <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.6875rem", fontWeight: 700 }}>
//                         <Icon name="check" style={{ color: "#B87333", fontSize: "0.875rem" }} /> {f}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* ── COMPARE TABLE ── */}
//         <section className="compare-section" style={{ padding: "8rem 2rem", background: "white" }}>
//           <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
//             <div className="compare-heading" style={{ textAlign: "center", marginBottom: "4rem" }}>
//               <span style={{ fontSize: "0.75rem", fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase", color: "#B87333", display: "block", marginBottom: "1rem" }}>Detailed Comparison</span>
//               <h2 style={{ fontSize: "3.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginBottom: "1rem" }}>Compare All Features</h2>
//               <p style={{ color: "#B3B3B3", fontWeight: 500, fontSize: "1.125rem" }}>Everything included in each plan — no hidden costs</p>
//             </div>
//             {/* overflow-x scroll wrapper for mobile */}
//             <div className="compare-table-wrap" style={{ overflowX: "auto", borderRadius: "2rem", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", background: "white" }}>
//               <table className="compare-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", fontWeight: 500 }}>
//                 <thead>
//                   <tr style={{ background: "#1C1C1C", color: "white" }}>
//                     <th style={{ padding: "2.5rem 2rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", width: "25%" }}>Feature</th>
//                     <th style={{ padding: "2.5rem 2rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", width: "25%" }}>Explorer<br /><span style={{ opacity: 0.5, fontWeight: 700 }}>Free</span></th>
//                     <th style={{ padding: "2.5rem 2rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", width: "25%", background: "#B87333" }}>
//                       Pro<br />
//                       <span style={{ opacity: 0.9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
//                             <AEDIcon style={{ fontSize: "0.68rem", lineHeight: 1 }} />149/MO

//                       </span>
//                     </th>
//                     <th style={{ padding: "2.5rem 2rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", width: "25%" }}>
//   Elite<br />
//   <span style={{ opacity: 0.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
//     <AEDIcon style={{ fontSize: "0.68rem", lineHeight: 1, filter: "grayscale(1)", opacity: 0.5 }} />299/MO
//   </span>
// </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <TableGroupHeader label="TruValu™ — AI Property Valuation" />
//                   <TableRow label="Reports per Month" explorer="3 lifetime" pro="10" elite="29" proHighlight />
//                   <TableRow label="Additional Report Price" explorer="—" pro="AED 35" elite="AED 25" proHighlight />
//                   <TableRow label="Estimated Market Value" explorer={<Check dim />} pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="Investment Score (0–100)" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="Prices & Trends" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="AI 6-Month Price Forecast" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="AI 3-Year Price Forecast" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="Supply & Demand Chart" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="Recent Sales (DLD transactions)" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="Valuation Confidence Score" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="UAE Transaction Cost Calculator" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="PDF Download" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="DLD Price Cross-Reference" explorer="—" pro="—" elite={<Check />} proHighlight />
//                   <TableRow label="Branded PDF Client Export" explorer="—" pro="—" elite={<Check />} proHighlight />

//                   <TableGroupHeader label="Signal™ — Real-Time Market Intelligence" />
//                   <TableRow label="Real-Time Feed (3-min refresh)" explorer={<span style={{ color: "#B3B3B3", fontStyle: "italic" }}>24hr delay</span>} pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="Areas Covered" explorer={<span style={{ color: "#B3B3B3" }}>Top 5 only</span>} pro={<strong>All</strong>} elite={<strong>All</strong>} proHighlight />
//                   <TableRow label="S4/S5 Email Alerts" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="All Alerts (S1–S5, Push + Email)" explorer="—" pro="—" elite={<Check />} proHighlight />
//                   <TableRow label="Portfolio Tracker" explorer="—" pro="5 properties" elite={<strong>Unlimited</strong>} proHighlight />
//                   <TableRow label="Market Timing Index (per area)" explorer="—" pro="—" elite={<Check />} proHighlight />
//                   <TableRow label="Historical Signal Archive" explorer="—" pro="—" elite={<strong>12 months</strong>} proHighlight />
//                   <TableRow label="Weekly Market Digest Email" explorer="—" pro="—" elite={<Check />} proHighlight />

//                   <TableGroupHeader label="Platform & Support" />
//                   <TableRow label="Team Seats" explorer="—" pro={<strong>1 seat</strong>} elite={<strong>1 seat</strong>} proHighlight />
//                   <TableRow label="Support" explorer={<span style={{ color: "#B3B3B3" }}>Community</span>} pro={<strong>Email</strong>} elite={<strong>Priority Email</strong>} proHighlight />
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </section>

//         {/* ── FAQ ── */}
//         <section className="faq-section" style={{ padding: "8rem 2rem", maxWidth: "56rem", margin: "0 auto" }}>
//           <div style={{ textAlign: "center", marginBottom: "5rem" }}>
//             <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase", color: "#B87333" }}>Transparency</span>
//             <h2 style={{ fontSize: "3rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginTop: "1rem" }}>Frequently Asked Questions</h2>
//           </div>
//           <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
//             <FAQItem question="Where does your data come from?" answer="We aggregate data from official land department records, institutional mortgage filings, and real-time transaction feeds from major broker networks." />
//             <FAQItem question="Can I cancel my Pro subscription?" answer="Yes, you can cancel at any time. If you are on an annual plan, your access will continue until the end of your billing cycle." />
//             <FAQItem question="Are the reports legally binding?" answer="Our reports are for intelligence and decision support purposes. While highly accurate, formal bank valuations may still be required by certain institutional lenders." />
//           </div>
//         </section>

//         {/* ── FINAL CTA ── */}
//         <section className="cta-section" style={{ padding: "8rem 2rem", textAlign: "center", background: "#2B2B2B", borderTop: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", position: "relative" }}>
//           <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#fff 0.5px, transparent 0.5px)", backgroundSize: "24px 24px", opacity: 0.03, pointerEvents: "none" }} />
//           <div style={{ position: "relative", zIndex: 10, maxWidth: "56rem", margin: "0 auto" }}>
//             <h2 style={{ fontSize: "clamp(2.5rem,7vw,5rem)", fontWeight: 900, letterSpacing: "-0.05em", textTransform: "uppercase", lineHeight: 0.9, marginBottom: "1.5rem", color: "white" }}>
//               Ready to Invest<br />With Certainty?
//             </h2>
//             <p style={{ fontSize: "1.25rem", color: "rgba(255,255,255,0.4)", maxWidth: "42rem", margin: "0 auto 3rem", fontWeight: 500, lineHeight: 1.6 }}>
//               Join <span style={{ color: "white" }}>2,400+ investors</span> who use Acqar to see Dubai's market before anyone else — and value any property in 60 seconds.
//             </p>
//             <div className="cta-buttons" style={{ display: "flex", flexDirection: "row", gap: "1.5rem", justifyContent: "center", alignItems: "center", marginBottom: "2rem" }}>
//               <button
//                 onClick={() => navigate("/signup")}
//                 style={{ padding: "1.25rem 3rem", background: "linear-gradient(to right, #B87333, #D4956A)", color: "white", borderRadius: "9999px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.6875rem", boxShadow: "0 0 40px rgba(184,115,51,0.3)", border: "none", cursor: "pointer" }}
//               >
//                 Start Free — 3 Reports Included
//               </button>
//               <button
//                 onClick={() => navigate("/signup")}
//                 style={{ padding: "1.25rem 3rem", border: "1px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "9999px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.6875rem", background: "transparent", cursor: "pointer" }}
//               >
//                 View Founding Member Offer
//               </button>
//             </div>
//             <p style={{ fontSize: "0.625rem", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
//               No card required · Cancel anytime · Built in Dubai
//             </p>
//           </div>
//         </section>
//       </main>

//       {/* ── FOOTER ── */}
//       <Footer />

//       {/* ── PAYWALL MODAL ── */}
//       {/* {showPaywall && (
//         <PaywallModal
//           valuationId={null}
//           onSuccess={async () => {
//             setShowPaywall(false);
//             const { data: sess } = await supabase.auth.getSession();
//             const user = sess?.session?.user;
//             if (user) {
//               await supabase
//                 .from("users")
//                 .update({
//                   plan: "pro",
//                   free_reports_limit: 10,
//                   free_reports_used: 0,
//                   is_founding_member: true,
//                 })
//                 .eq("id", user.id);
//               // refresh plan state so card shows "Your Current Plan"
//               setUserPlan("pro");
//               setUserEmail(user.email || "");
//             }
//           }}
//           onClose={() => setShowPaywall(false)}
//         />
//       )} */}

//       {showPaywall && (
//   <PaywallModal
//     valuationId={null}
//     onSuccess={async () => {
//       setShowPaywall(false);

//       // ✅ Re-fetch session to get the newly created user
//       // Small delay to let Supabase auth settle
//       await new Promise(resolve => setTimeout(resolve, 1000));

//       const { data: sess } = await supabase.auth.getSession();
//       const user = sess?.session?.user;

//       if (user) {
//         // ✅ Update plan in DB
//         await supabase
//           .from("users")
//           .update({
//             plan: "pro",
//             free_reports_limit: 10,
//             free_reports_used: 0,
//             is_founding_member: true,
//           })
//           .eq("id", user.id);

//         // ✅ Update local state so pricing card shows "Your Current Plan"
//         setUserPlan("pro");
//         setUserEmail(user.email || "");

//         // ✅ Navigate to dashboard
//         navigate("/dashboard");
//       } else {
//         // No session yet (email confirmation pending) → just go to dashboard
//         navigate("/dashboard");
//       }
//     }}
//     onClose={() => setShowPaywall(false)}
//   />
// )}
    
//     </div>
//   );
// }














// import { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import { trackEvent } from "../analytics";
// import PaywallModal from "../components/PaywallModal";

// /* ─────────────────────────────────────────
//    GLOBAL STYLES
// ───────────────────────────────────────── */
// const styles = `
//   @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
//   @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

//   .pricing-page * { box-sizing: border-box; }

//   .pricing-page .material-symbols-outlined {
//     font-family: 'Material Symbols Outlined';
//     font-weight: normal;
//     font-style: normal;
//     font-size: 24px;
//     line-height: 1;
//     letter-spacing: normal;
//     text-transform: none;
//     display: inline-block;
//     white-space: nowrap;
//     word-wrap: normal;
//     direction: ltr;
//     font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
//   }

//   .pricing-page .architectural-lines {
//     background-image: radial-gradient(#2B2B2B 0.5px, transparent 0.5px);
//     background-size: 24px 24px;
//     opacity: 0.05;
//     position: absolute;
//     inset: 0;
//     pointer-events: none;
//   }

//   .pricing-page ::selection {
//     background: #B87333;
//     color: white;
//   }

//   .pricing-card:hover {
//     box-shadow: 0 20px 60px rgba(0,0,0,0.1) !important;
//   }

//   .pricing-btn-primary:hover { opacity: 0.88; }
//   .pricing-btn-outline:hover { background: #2B2B2B !important; color: white !important; }

//   /* ── TABLET ── */
//   @media (max-width: 1024px) {
//     .footer-grid { grid-template-columns: 1fr 1fr 1fr !important; }
//   }

//   /* ── MOBILE LANDSCAPE / TABLET PORTRAIT ── */
//   @media (max-width: 900px) {
//     .pricing-tiers-grid {
//       grid-template-columns: 1fr !important;
//       max-width: 480px !important;
//       margin-left: auto !important;
//       margin-right: auto !important;
//     }
//     .pricing-tiers-grid > div:nth-child(2) {
//       transform: scale(1) !important;
//     }
//     .who-uses-grid { grid-template-columns: repeat(2, 1fr) !important; }
//     .compare-table { font-size: 0.75rem !important; }
//     .compare-table th, .compare-table td { padding: 0.75rem 0.75rem !important; }
//     .footer-grid { grid-template-columns: 1fr 1fr !important; }
//     .cta-buttons { flex-direction: column !important; align-items: stretch !important; }
//     .cta-buttons button { width: 100% !important; }
//   }

//   /* ── MOBILE ── */
//   @media (max-width: 600px) {
//     /* Hero */
//     .pricing-hero-section {
//       padding: 4rem 1.25rem !important;
//     }
//     .pricing-hero-section h1 {
//       font-size: clamp(2.5rem, 14vw, 4rem) !important;
//       margin-bottom: 1.25rem !important;
//     }
//     .pricing-hero-section p {
//       font-size: 1rem !important;
//       margin-bottom: 2rem !important;
//     }
//     .pricing-toggle { margin-bottom: 2rem !important; }

//     /* Founding banner */
//     .founding-banner {
//       flex-direction: column !important;
//       gap: 1rem !important;
//       width: 100% !important;
//       padding: 1rem !important;
//     }
//     .founding-banner > div { margin-right: 0 !important; }
//     .founding-divider { display: none !important; }

//     /* Tiers */
//     .pricing-tiers-grid {
//       padding: 0 1.25rem 4rem !important;
//       max-width: 100% !important;
//     }

//     /* Who uses */
//     .who-uses-section { padding: 4rem 1.25rem !important; }
//     .who-uses-grid { grid-template-columns: 1fr !important; }

//     /* Compare table */
//     .compare-section { padding: 4rem 0.75rem !important; }
//     .compare-table-wrap { border-radius: 1rem !important; }
//     .compare-table { font-size: 0.7rem !important; min-width: 480px; }
//     .compare-table th, .compare-table td { padding: 0.6rem 0.6rem !important; }
//     .compare-table th:first-child,
//     .compare-table td:first-child { min-width: 120px; }

//     /* FAQ */
//     .faq-section { padding: 4rem 1.25rem !important; }
//     .faq-section h2 { font-size: 2rem !important; }
//     .faq-item-question { font-size: 0.9rem !important; }

//     /* CTA */
//     .cta-section { padding: 4rem 1.25rem !important; }
//     .cta-section h2 { font-size: clamp(1.75rem, 8vw, 3rem) !important; }
//     .cta-section p { font-size: 1rem !important; }
//     .cta-buttons { flex-direction: column !important; gap: 0.75rem !important; }
//     .cta-buttons button {
//       width: 100% !important;
//       padding: 1rem 1.5rem !important;
//       font-size: 0.625rem !important;
//     }

//     /* Footer */
//     .footer-inner { padding: 3rem 1.25rem 2rem !important; }
//     .footer-grid {
//       grid-template-columns: 1fr 1fr !important;
//       gap: 2rem !important;
//       margin-bottom: 2.5rem !important;
//     }
//     .footer-brand { grid-column: 1 / -1 !important; }
//     .footer-bottom {
//       flex-direction: column !important;
//       align-items: flex-start !important;
//       gap: 0.5rem !important;
//     }

//     /* Section headings */
//     .who-uses-heading h2 { font-size: 2rem !important; }
//     .compare-heading h2 { font-size: 2rem !important; }
//   }

//   /* ── EXTRA SMALL ── */
//   @media (max-width: 380px) {
//     .pricing-hero-section { padding: 3rem 1rem !important; }
//     .pricing-tiers-grid { padding: 0 1rem 3rem !important; }
//     .compare-table { font-size: 0.65rem !important; min-width: 420px; }
//   }
// `;

// /* ─────────────────────────────────────────
//    SMALL HELPERS
// ───────────────────────────────────────── */
// // const AEDIcon = ({ style = {} }) => (
// //   <img
// //     alt="AED"
// //     style={{ height: "2rem", width: "auto", ...style }}
// //     src="https://lh3.googleusercontent.com/aida/ADBb0ugyDYGIcyDrjPsg38dh61Ezcjtj-r-B9vT-LsT_b8c6iG7kkG3vpq_48Lu92EcJ2fvEZvm9lO7koOu2x2x4licRYhEd1CJFY1sginsn6lYiRDMkrs3CG_ja4_5IXDNfr98l8qHfmZdilReWrfwLN0V_oNCUnKiwgB8o_IjCYqwKK8INIrTHn4AUKf1772yMXaG-BXaSlEK_o0zEWQgxkc6rLl6Yz2pmxNRXpx92U-GjPSLsL5zTnv8YoqrehCn9_VfIXPvXxpMQ"
// //   />
// // );

// // const AEDIcon = ({ style = {} }) => (
// //   <span
// //     style={{
// //       fontFamily: "Arial, sans-serif",
// //       fontWeight: 900,
// //       fontSize: "1.5rem",
// //       lineHeight: 1,
// //       letterSpacing: "-0.02em",
// //       ...style
// //     }}
// //   >
// //     AED
// //   </span>
// // );



// const AEDIcon = ({ size = 24, style = {} }) => (
//   <svg
//     viewBox="0 0 115 100"
//     width={size}
//     height={Math.round(size * 0.87)}
//     style={{ display: "inline-block", verticalAlign: "middle", ...style }}
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     {/* Thick vertical stroke */}
//     <rect x="14" y="0" width="12" height="100" fill="currentColor"/>

//     {/* D curve — pixel traced from image */}
//     <path
//       d="M 26,0 L 49,0 C 60,0 74,4 80,10 C 88,18 93,28 95,39
//          L 95,61
//          C 93,72 88,82 80,90 C 74,96 60,100 49,100 L 26,100 Z"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="5"
//       strokeLinejoin="round"
//     />

//     {/* Bar 1 — full width, cuts through everything */}
//     <rect x="0" y="35" width="112" height="9" fill="currentColor"/>

//     {/* Bar 2 — full width, cuts through everything */}
//     <rect x="0" y="56" width="112" height="8" fill="currentColor"/>
//   </svg>
// );

// const Icon = ({ name, style = {} }) => (
//   <span className="material-symbols-outlined" style={style}>{name}</span>
// );

// function Check({ color = "#2B2B2B", dim = false }) {
//   return (
//     <span
//       className="material-symbols-outlined"
//       style={{ color: dim ? "#B3B3B3" : color, fontSize: "1.125rem", opacity: dim ? 0.4 : 1 }}
//     >
//       check_circle
//     </span>
//   );
// }

// function TableGroupHeader({ label }) {
//   return (
//     <tr style={{ background: "#F8F9FA", borderBottom: "1px solid rgba(229,231,235,0.3)" }}>
//       <td
//         colSpan={4}
//         style={{ padding: "1rem 2rem", fontSize: "0.625rem", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B87333" }}
//       >
//         {label}
//       </td>
//     </tr>
//   );
// }

// function TableRow({ label, explorer, pro, elite, proHighlight }) {
//   return (
//     <tr style={{ borderBottom: "1px solid rgba(229,231,235,0.3)" }}>
//       <td style={{ padding: "1.5rem 2rem", fontWeight: 700 }}>{label}</td>
//       <td style={{ padding: "1.5rem 2rem", textAlign: "center", color: "#B3B3B3", opacity: 0.6 }}>{explorer}</td>
//       <td style={{
//         padding: "1.5rem 2rem", textAlign: "center", fontWeight: 900,
//         background: proHighlight ? "rgba(253,241,230,0.3)" : "transparent",
//         borderLeft: "1px solid rgba(229,231,235,0.1)",
//         borderRight: "1px solid rgba(229,231,235,0.1)",
//       }}>{pro}</td>
//       <td style={{ padding: "1.5rem 2rem", textAlign: "center", fontWeight: 900 }}>{elite}</td>
//     </tr>
//   );
// }

// function FAQItem({ question, answer }) {
//   const [open, setOpen] = useState(false);
//   return (
//     <div
//       onClick={() => setOpen(!open)}
//       style={{ background: "#F8F9FA", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #E5E7EB", cursor: "pointer" }}
//     >
//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
//         <span className="faq-item-question" style={{ fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", fontSize: "1.125rem" }}>
//           {question}
//         </span>
//         <span
//           className="material-symbols-outlined"
//           style={{ transition: "transform 0.3s", transform: open ? "rotate(-180deg)" : "rotate(0deg)", flexShrink: 0 }}
//         >
//           expand_more
//         </span>
//       </div>
//       {open && (
//         <p style={{ marginTop: "1rem", color: "#B3B3B3", fontWeight: 500, lineHeight: 1.7 }}>
//           {answer}
//         </p>
//       )}
//     </div>
//   );
// }

// /* ─────────────────────────────────────────
//    HEADER
// ───────────────────────────────────────── */
// function Header() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const current = location.pathname;
//   const [user, setUser] = useState(null);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data }) => {
//       setUser(data.session?.user ?? null);
//     });
//     const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
//       setUser(session?.user ?? null);
//     });
//     return () => listener.subscription.unsubscribe();
//   }, []);

//   const navItems = [
//     { label: "TRUVALU™", href: "/truvalu" },
//     { label: "PRICING", path: "/pricing" },
//     { label: "RESOURCES", path: "/blogs" },
//   ];

//   return (
//     <>
//       <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#D4D4D4] bg-white">
//         <div className="hdrWrap max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">

//           {/* Logo */}
//           <div
//             className="hdrLogo flex items-center cursor-pointer shrink-0 whitespace-nowrap"
//             onClick={() => { trackEvent("nav_click", { item: "logo" }); navigate("/"); }}
//           >
//             <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
//               <span style={{ color: "#B87333" }}>ACQ</span>
//               <span style={{ color: "#111111" }}>AR</span>
//             </h1>
//           </div>

//           {/* Mobile nav */}
//           <div className="md:hidden flex items-center gap-0">
//             {/* <a
//               href="http://www.acqar.com/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1.5 rounded-full whitespace-nowrap text-[#2B2B2B]/70"
//               style={{ textDecoration: "none" }}
//             >
//               SIGNAL™
//             </a> */}
//             <a
//               href="https://www.acqar.com/truvalu"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-[9px] font-black uppercase tracking-[0.15em] px-1 py-1 rounded-full whitespace-nowrap text-[#2B2B2B]/70"
//               style={{ textDecoration: "none" }}
//             >
//               TRUVALU™
//             </a>
//             <button
//               onClick={() => { trackEvent("nav_click", { item: "pricing" }); navigate("/pricing"); }}
//               className={`text-[9px] font-black uppercase tracking-[0.15em] px-1 py-1 rounded-full whitespace-nowrap ${current === "/pricing" ? "text-[#B87333] underline underline-offset-4" : "text-[#2B2B2B]/70"}`}
//             >
//               PRICING
//             </button>
//             <button
//               onClick={() => { trackEvent("nav_click", { item: "resources" }); navigate("/blogs"); }}
//               className={`text-[9px] font-black uppercase tracking-[0.15em] px-1 py-1 rounded-full whitespace-nowrap ${current === "/blogs" ? "text-[#B87333] underline underline-offset-4" : "text-[#2B2B2B]/70"}`}
//             >
//               RESOURCES
//             </button>
//           </div>

//           {/* Desktop nav */}
//           <nav className="hidden md:flex items-center gap-10">
//             <a
//               href="http://www.acqar.com/"
//               target="_blank"
//               rel="noopener noreferrer"
//               onClick={() => trackEvent("Nav", "Click", "Signal")}
//               className="text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap text-[#2B2B2B]"
//               style={{ textDecoration: "none" }}
//             >
//               SIGNAL™
//             </a>

//             {navItems.map((item) =>
//               item.href ? (
//                 <a
//                   key={item.label}
//                   href={item.href}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   onClick={() => trackEvent("Nav", "Click", item.label)}
//                   className="text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap text-[#2B2B2B]"
//                   style={{ textDecoration: "none" }}
//                 >
//                   {item.label}
//                 </a>
//               ) : (
//                 <button
//                   key={item.label}
//                   onClick={() => { trackEvent("Nav", "Click", item.label); navigate(item.path); }}
//                   className={`text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap ${current === item.path ? "text-[#B87333] border-b-2 border-[#B87333]" : "text-[#2B2B2B]"}`}
//                 >
//                   {item.label}
//                 </button>
//               )
//             )}
//           </nav>

//           {/* Right CTA */}
//           <div className="hdrRight flex items-center gap-2 sm:gap-4 shrink-0 flex-nowrap">
//             {user ? (
//               <button
//                 onClick={() => navigate("/dashboard")}
//                className="bg-[#B87333] text-white px-2 sm:px-6 py-1.5 sm:py-2.5 rounded-md text-[9px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
//               >
//                 Dashboard
//               </button>
//             ) : (
//               <button
//                 onClick={() => { trackEvent("nav_click", { item: "login" }); navigate("/login"); }}
//                 className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
//               >
//                 Sign In
//               </button>
//             )}
//           </div>
//         </div>

//         <style>{`
//   @media (max-width: 480px) {
//     .hdrWrap button,
//     .hdrWrap a {
//       font-size: 9px !important;
//       padding: 4px 5px !important;
//       letter-spacing: 0.05em !important;
//     }
//     .hdrRight button {
//       font-size: 10px !important;
//       padding: 7px 10px !important;
//       white-space: nowrap !important;
//     }
//   }
//   @media (max-width: 420px) {
//     .hdrWrap { padding-left: 10px !important; padding-right: 10px !important; gap: 4px !important; }
//     .hdrLogo h1 { font-size: 17px !important; letter-spacing: -0.02em !important; }
//   }
//   @media (max-width: 360px) {
//     .hdrWrap { gap: 3px !important; }
//   }
// `}</style>
//       </header>
//       <div className="h-20" />
//     </>
//   );
// }

// /* ─────────────────────────────────────────
//    FOOTER
// ───────────────────────────────────────── */
// function Footer() {
//   const navigate = useNavigate();

//   return (
//     <>
//       <style>{`
//         .acq-footer-new {
//           position: relative;
//           background: #F5F5F4;
//           border-top: 1px solid rgba(10,10,10,0.06);
//           font-family: 'Inter', sans-serif;
//         }
//         .acq-footer-new .copper-line {
//           position: absolute;
//           top: 0; left: 0; right: 0;
//           height: 1px;
//           background: linear-gradient(90deg, transparent 0%, #B87333 35%, #B87333 65%, transparent 100%);
//         }
//         .acq-footer-new .inner {
//           max-width: 100%;
//           margin: 0 auto;
//           padding: 48px 80px 32px;
//         }
//         .acq-footer-new .main-grid {
//           display: grid;
//           grid-template-columns: 1.8fr 1fr 1fr 1fr 1fr;
//           gap: 32px;
//           margin-bottom: 48px;
//         }
//         .acq-footer-new .col-heading {
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           margin-bottom: 24px;
//         }
//         .acq-footer-new .col-heading-dot {
//           width: 4px; height: 4px;
//           border-radius: 50%;
//           background: #B87333;
//           opacity: 0.7;
//         }
//         .acq-footer-new .col-heading h6 {
//           font-size: 11px;
//           font-weight: 900;
//           text-transform: uppercase;
//           letter-spacing: 0.28em;
//           color: #0A0A0A;
//           margin: 0;
//         }
//         .acq-footer-new ul {
//           list-style: none;
//           padding: 0; margin: 0;
//           display: flex;
//           flex-direction: column;
//           gap: 16px;
//         }
//         .acq-footer-new ul li {
//           font-size: 11.5px;
//           font-weight: 600;
//           color: rgba(10,10,10,0.55);
//           cursor: pointer;
//           transition: color 0.2s;
//         }
//         .acq-footer-new ul li:hover { color: #B87333; }
//         .acq-footer-new ul li.muted {
//           color: rgba(10,10,10,0.55);
//           cursor: default;
//         }
//         .acq-footer-new ul li a {
//           color: inherit;
//           text-decoration: none;
//           transition: color 0.2s;
//         }
//         .acq-footer-new ul li a:hover { color: #B87333; }
//         .acq-footer-new .soon-badge {
//           padding: 1px 6px;
//           font-size: 8px;
//           font-weight: 900;
//           text-transform: uppercase;
//           background: rgba(184,115,51,0.1);
//           color: #B87333;
//           border: 1px solid rgba(184,115,51,0.2);
//           border-radius: 4px;
//           margin-left: 6px;
//         }
//         .acq-footer-new .rics-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 8px;
//           padding: 6px 12px;
//           background: white;
//           border: 1px solid rgba(184,115,51,0.2);
//           border-radius: 999px;
//           margin-bottom: 32px;
//         }
//         .acq-footer-new .rics-badge span {
//           font-size: 9px;
//           font-weight: 900;
//           color: rgba(10,10,10,0.7);
//           text-transform: uppercase;
//           letter-spacing: 0.2em;
//         }
//         .acq-footer-new .social-row { display: flex; gap: 12px; }
//         .acq-footer-new .social-btn {
//           width: 36px; height: 36px;
//           border-radius: 50%;
//           border: 1px solid rgba(10,10,10,0.09);
//           background: rgba(255,255,255,0.6);
//           display: flex; align-items: center; justify-content: center;
//           color: rgba(10,10,10,0.35);
//           text-decoration: none;
//           transition: all 0.2s;
//         }
//         .acq-footer-new .social-btn:hover {
//           color: #B87333;
//           border-color: rgba(184,115,51,0.4);
//         }
//         .acq-footer-new .bottom-bar {
//           border-top: 1px solid rgba(10,10,10,0.06);
//           padding-top: 32px;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           flex-wrap: wrap;
//           gap: 16px;
//           width: 100%;
//         }
//         .acq-footer-new .bottom-bar p {
//           font-weight: 700;
//           color: rgba(10,10,10,0.3);
//           text-transform: uppercase;
//           font-size: 10px;
//           letter-spacing: 0.2em;
//           margin: 0;
//         }
//         .acq-footer-new .bottom-bar .not-advice {
//           font-weight: 500;
//           color: rgba(10,10,10,0.25);
//           font-size: 10px;
//           margin: 0;
//         }
//         .acq-footer-new .bottom-location {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }
//         .acq-footer-new .bottom-location .logo {
//           font-weight: 900;
//           font-size: 10px;
//           letter-spacing: 0.05em;
//         }
//         .acq-footer-new .bottom-location .divider {
//           width: 1px; height: 12px;
//           background: rgba(10,10,10,0.15);
//         }
//         .acq-footer-new .bottom-location .city {
//           font-weight: 600;
//           color: rgba(10,10,10,0.35);
//           font-size: 10px;
//           letter-spacing: 0.05em;
//         }

//         /* Responsive */
//         @media (max-width: 1024px) {
//           .acq-footer-new .inner { padding: 48px 32px 32px; }
//           .acq-footer-new .main-grid { grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
//         }
//         @media (max-width: 768px) {
//           .acq-footer-new .inner { padding: 40px 24px 24px; }
//           .acq-footer-new .main-grid { grid-template-columns: 1fr 1fr; gap: 32px 16px; }
//           .acq-footer-new .bottom-bar { flex-direction: column; text-align: center; justify-content: center; }
//           .acq-footer-new .bottom-location { justify-content: center; }
//           .acq-footer-new .not-advice { display: none; }
//         }
//         @media (max-width: 480px) {
//           .acq-footer-new .inner { padding: 40px 16px 20px; }
//           .acq-footer-new .main-grid { grid-template-columns: 1fr; gap: 28px; }
//         }
//       `}</style>

//       <footer className="acq-footer-new">
//         <div className="copper-line"></div>
//         <div className="inner">

//           {/* Main grid */}
//           <div className="main-grid">

//             {/* Brand column */}
//             <div>
//               <div style={{ marginBottom: 24, lineHeight: 1 }}>
//                 <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px' }}>
//                   <span style={{ color: '#B87333' }}>ACQ</span>
//                   <span style={{ color: '#111111' }}>AR</span>
//                 </span>
//               </div>
//               <p style={{ fontSize: 12, lineHeight: 1.75, color: 'rgba(10,10,10,0.5)', fontWeight: 500, marginBottom: 28, maxWidth: 280 }}>
//                 An AI-powered property intelligence platform built exclusively for Dubai real estate. Independent, institutional-quality, and always on.
//               </p>
//               {/* <div className="rics-badge"> */}
//                 {/* <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
//                   <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M9 12l2 2 4-4" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg> */}
//                 {/* <span>RICS-Aligned Intelligence</span> */}
//               {/* </div> */}
//               <div className="social-row">
//                 {[
//                   { href: 'https://www.linkedin.com/company/acqar', label: 'LinkedIn', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
//                   { href: 'https://www.instagram.com/acqar.dxb/', label: 'Instagram', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
//                 ].map(({ href, label, icon }) => (
//                   <a key={label} href={href} target="_blank" rel="noopener noreferrer"
//                     aria-label={label} className="social-btn"
//                   >{icon}</a>
//                 ))}
//               </div>
//             </div>

//             {/* Product */}
//             <div>
//               <div className="col-heading">
//                 <span className="col-heading-dot"></span>
//                 <h6>Product</h6>
//               </div>
//               <ul>
//                 <li>
//                   <a href="https://www.acqar.com/truvalu" target="_blank" rel="noopener noreferrer">
//                     ACQAR TRUVALU™
//                   </a>
//                 </li>
//                 <li>
//                   <a href="http://www.acqar.com/" target="_blank" rel="noopener noreferrer">
//                     ACQAR SIGNAL™
//                   </a>
//                 </li>
//                 <li className="muted">ACQAR PASSPORT™</li>
//                 <li onClick={() => navigate('/pricing')}>PRICING</li>
//               </ul>
//             </div>

//             {/* Company */}
//             <div>
//               <div className="col-heading">
//                 <span className="col-heading-dot"></span>
//                 <h6>Company</h6>
//               </div>
//               <ul>
//                 {/* {['About ACQAR', 'How It Works', 'Pricing', 'Contact Us', 'Partners'].map(l => ( */}
//                   {['About ACQAR', 'Contact Us'].map(l => (
//                   <li key={l}>{l}</li>
//                 ))}
//               </ul>
//             </div>

//             {/* Legal */}
//             <div>
//               <div className="col-heading">
//                 <span className="col-heading-dot"></span>
//                 <h6>Legal & Info</h6>
//               </div>
//               <ul>
//                 <li onClick={() => window.open('https://www.acqar.com/blogs', '_blank')}>Intelligence Blog</li>
//                 <li onClick={() => navigate('/terms')}>Terms of Use</li>
//                 <li onClick={() => navigate('/terms')}>Privacy Policy</li>
//               </ul>
//             </div>

//             {/* Comparisons */}
//             <div>
//               <div className="col-heading">
//                 <span className="col-heading-dot"></span>
//                 <h6>Comparisons</h6>
//               </div>
//               <ul>
//                 {['vs Bayut TruEstimate', 'vs Property Finder', 'vs Traditional Valuers', 'Why ACQAR?'].map(l => (
//                   <li key={l}>{l}</li>
//                 ))}
//               </ul>
//             </div>

//           </div>

//           {/* Bottom bar */}
//           <div className="bottom-bar">
//             <div className="bottom-location">
//               <span className="logo">
//                 <span style={{ color: '#B87333' }}>ACQ</span>
//                 <span style={{ color: '#0A0A0A' }}>AR</span>
//               </span>
//               <span className="divider"></span>
//               <span className="city">Dubai, United Arab Emirates</span>
//             </div>
//             <p>© 2026 ACQARLABS L.L.C-FZ. All rights reserved.</p>
//             <p className="not-advice">Not financial advice.</p>
//           </div>

//         </div>
//       </footer>
//     </>
//   );
// }

// /* ─────────────────────────────────────────
//    MAIN PRICING PAGE
// ───────────────────────────────────────── */
// export default function Pricing() {
//   const navigate = useNavigate();
// const [isAnnual, setIsAnnual] = useState(false);
// const [spotsLeft, setSpotsLeft] = useState(null);
// const [userPlan, setUserPlan] = useState(null); // null = loading, "free", "pro", "elite"
// const [userEmail, setUserEmail] = useState("");
// const [showPaywall, setShowPaywall] = useState(false);

// useEffect(() => {
//   async function fetchSpots() {
//     const { data, error } = await supabase
//       .rpc('get_founding_member_count');

//     if (!error && data !== null) {
//   // starts at 275 baseline + real pro users from DB
//   const taken = 225 + data;
//   setSpotsLeft(taken);
// }
//   }
//   fetchSpots();
// }, []);

// useEffect(() => {
//   async function fetchUserPlan() {
//     const { data: sess } = await supabase.auth.getSession();
//     const user = sess?.session?.user;
//     if (!user) { setUserPlan("guest"); return; }
//     setUserEmail(user.email || "");
//     const { data } = await supabase
//       .from("users")
//       .select("plan")
//       .eq("id", user.id)
//       .single();
//     setUserPlan(data?.plan || "free");
//   }
//   fetchUserPlan();
// }, []);


// const proMonthly = 29;
//   const eliteMonthly = 299;

//   const proPrice = isAnnual ? Math.round(proMonthly * 12 * 0.83 / 12) : proMonthly;
//   const elitePrice = isAnnual ? Math.round(eliteMonthly * 12 * 0.83 / 12) : eliteMonthly;
//   const proPeriod = isAnnual ? "/MO · BILLED ANNUALLY" : "/MO";
//   const elitePeriod = isAnnual ? "/MO · BILLED ANNUALLY" : "/MO";
//   return (
//     <div className="pricing-page" style={{ fontFamily: "'Inter', sans-serif", background: "#FFFFFF", color: "#2B2B2B" }}>
//       <style>{styles}</style>

//       {/* ── HEADER ── */}
//       <Header />

//       <main>

//         {/* ── HERO ── */}
//         <section className="pricing-hero-section" style={{ position: "relative", padding: "8rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", overflow: "hidden" }}>
//           <div className="architectural-lines" />

//           <div style={{ marginBottom: "2rem", padding: "0.25rem 1rem", background: "#FDF1E6", border: "1px solid rgba(184,115,51,0.2)", borderRadius: "9999px" }}>
//             <span style={{ fontSize: "0.625rem", fontWeight: 900, letterSpacing: "0.3em", color: "#B87333", textTransform: "uppercase" }}>
//               Early Founding Member Access
//             </span>
//           </div>

//           <h1 style={{ fontSize: "clamp(3rem,10vw,8rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.85, marginBottom: "2rem", maxWidth: "80rem", textTransform: "uppercase" }}>
//             See. Value.<br />Decide.
//           </h1>

//           <p style={{ fontSize: "1.25rem", color: "#B3B3B3", maxWidth: "42rem", marginBottom: "3rem", fontWeight: 500 }}>
//             Acqar gives you the market signal to see what is happening, the valuation intelligence to understand what a property is worth, and the investment score to decide whether to act.
//           </p>

          

//           {/* Founding member banner */}
//           <div className="founding-banner" style={{ background: "#FAFAFA", padding: "1rem 2rem", borderRadius: "0.75rem", border: "1px solid #E5E7EB", display: "inline-flex", alignItems: "center", marginBottom: "3rem" }}>
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginRight: "2rem" }}>
//               <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B3B3B3", marginBottom: "0.25rem" }}>Founding Member Offer</span>
//               <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
//   <AEDIcon size="18" style={{ color: "#2B2B2B" }} />
//   <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "#2B2B2B" }}>
//     29<span style={{ fontSize: "0.6875rem", opacity: 0.5, marginLeft: "0.25rem" }}>/MO</span>
//   </span>
// </div>
//                 <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#B87333", textTransform: "uppercase", letterSpacing: "0.15em" }}>For 3 Months</span>
//               </div>
//             </div>
//             <div className="founding-divider" style={{ width: "1px", height: "2rem", background: "#E5E7EB", marginRight: "2rem" }} />
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
//               <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B3B3B3", marginBottom: "0.25rem" }}>Limited Availability</span>
//               <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>
//   <span style={{ color: "#B87333" }}>
//     {spotsLeft !== null ? spotsLeft : '225'}
//   </span> founding members joined
// </span>
//             </div>
//           </div>

//           {/* Monthly / Annual toggle */}
//           <div className="pricing-toggle" style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "4rem" }}>
//   <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", opacity: isAnnual ? 0.4 : 1 }}>Monthly</span>
//   <div
//     onClick={() => setIsAnnual(!isAnnual)}
//     style={{ width: "3.5rem", height: "1.75rem", background: "#2B2B2B", borderRadius: "9999px", position: "relative", padding: "0.25rem", cursor: "pointer" }}
//   >
//     <div style={{
//       width: "1.25rem", height: "1.25rem", background: "#B87333", borderRadius: "9999px",
//       position: "absolute",
//       right: isAnnual ? "0.25rem" : "auto",
//       left: isAnnual ? "auto" : "0.25rem",
//       transition: "left 0.2s, right 0.2s"
//     }} />
//   </div>
//   <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
//     <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", opacity: isAnnual ? 1 : 0.4 }}>Annual</span>
//     <span style={{ fontSize: "0.5625rem", fontWeight: 700, color: "#B87333", letterSpacing: "0.15em", textTransform: "uppercase" }}>Save 17%</span>
//   </div>
// </div>
//         </section>

//         {/* ── PRICING TIERS ── */}
//         <section className="pricing-tiers-grid" style={{ padding: "0 2rem 8rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", maxWidth: "80rem", margin: "0 auto" }}>

//           {/* Explorer */}
//           <div className="pricing-card" style={{ background: "#F8F9FA", padding: "2.5rem", borderRadius: "1.5rem", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", transition: "box-shadow 0.5s" }}>
//             <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "1rem", color: "#B3B3B3" }}>&nbsp;</span>
//             <h3 style={{ fontSize: "2.25rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginBottom: "0.5rem" }}>Explorer</h3>
//             <p style={{ fontSize: "0.875rem", color: "#B3B3B3", marginBottom: "2rem", fontWeight: 500 }}>For anyone getting started with Dubai real estate market.</p>
//             <div style={{ marginBottom: "2rem", display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
//               <span style={{ fontSize: "3rem", fontWeight: 900 }}>FREE</span>
//               <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", opacity: 0.5, textTransform: "uppercase" }}>/Mo</span>
//             </div>
//             <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem", flex: 1 }}>
//               {["3 TRUVALU™ AI Reports", "Instant AI Valuation Estimate", "Webview Reports", "Limited SIGNAL™ Terminal Access", "Limited Signals Feed", "No Credit Card Required"].map(f => (
//                 <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", fontWeight: 500 }}>
//                   <Icon name="check_circle" style={{ color: "#2B2B2B", fontSize: "1.125rem" }} /> {f}
//                 </li>
//               ))}
//             </ul>
//             {userPlan === null ? (
//   // Still loading — show nothing / skeleton
//   <div style={{
//     padding: "1rem",
//     background: "#f3f4f6",
//     borderRadius: "0.75rem",
//     height: "48px",
//   }} />
// ) : userPlan === "free" ? (
//   <div style={{
//     padding: "1rem",
//     background: "rgba(43,43,43,0.06)",
//     borderRadius: "0.75rem",
//     textAlign: "center",
//     fontWeight: 900,
//     fontSize: "0.7rem",
//     letterSpacing: "0.15em",
//     textTransform: "uppercase",
//     color: "#2B2B2B",
//     border: "2px solid rgba(43,43,43,0.15)",
//   }}>
//     ✓ Your Current Plan
//   </div>
// ) : (
//   <button
//     className="pricing-btn-primary"
//     onClick={() => navigate("/login")}
//     style={{ width: "100%", padding: "1rem", background: "#2B2B2B", color: "white", borderRadius: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6875rem", border: "none", cursor: "pointer", transition: "opacity 0.2s" }}
//   >
//     Get Started
//   </button>
// )}
//           </div>

//           {/* Pro */}
//           <div className="pricing-card" style={{ background: "white", padding: "2.5rem", borderRadius: "1.5rem", border: "3px solid #B87333", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(184,115,51,0.15)", position: "relative", transform: "scale(1.05)", zIndex: 10 }}>
//             <div style={{ position: "absolute", top: "-1rem", left: "50%", transform: "translateX(-50%)", background: "#B87333", color: "white", padding: "0.25rem 1rem", borderRadius: "9999px", fontSize: "0.625rem", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
//               Most Popular
//             </div>
//             <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "1rem", color: "#B87333" }}>Founding Member Offer</span>
//             <h3 style={{ fontSize: "2.25rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginBottom: "0.5rem" }}>Acqar Pro</h3>
//             <p style={{ fontSize: "0.875rem", color: "#B3B3B3", marginBottom: "2rem", fontWeight: 500 }}>For property owners and buyers who need Dubai real estate intelligence platform.</p>
//             <div style={{ marginBottom: "2rem" }}>
//               <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
//                 <AEDIcon size="42" style={{ color: "#B87333", alignSelf: "center", marginRight: "0.25rem" }} />
//                 <span style={{ fontSize: "3rem", fontWeight: 900, color: "#B87333" }}>{proPrice}</span>
//               </div>
//               <span style={{ fontSize: "0.625rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#B87333" }}>
//   {isAnnual ? proPeriod : "First 3 months → 149/mo after"}
// </span>
//             </div>
//             <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem", flex: 1 }}>
//               {["10 TRUVALU™ AI Reports/Month", "Premium Instant AI Valuation Model", "PDF Reports and Sharable Link", "Full SIGNAL™ Terminal Access", "Real-Time Signals Feed", "Real-Time Signals Report", "Community Chat Access", "Cancel Subscription Anytime"].map(f => (
//                 <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", fontWeight: 700 }}>
//                   <Icon name="verified" style={{ color: "#B87333", fontSize: "1.125rem" }} /> {f}
//                 </li>
//               ))}
//             </ul>
//             {userPlan === "pro" ? (
//   <div>
//     <div style={{
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       gap: "0.5rem",
//       padding: "0.85rem",
//       background: "rgba(34,197,94,0.1)",
//       border: "2px solid rgba(34,197,94,0.5)",
//       borderRadius: "0.75rem",
//       marginBottom: "0.75rem",
//     }}>
//       <span style={{ fontSize: "1rem" }}>✅</span>
//       <span style={{ fontWeight: 900, fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#16a34a" }}>
//         Your Current Plan
//       </span>
//     </div>
//     {userEmail && (
//       <p style={{ fontSize: "0.7rem", color: "#B3B3B3", textAlign: "center", marginBottom: "0.75rem", fontWeight: 600 }}>
//         Active as <strong style={{ color: "#2B2B2B" }}>{userEmail}</strong>
//       </p>
//     )}
//     <button
//       onClick={() => navigate("/dashboard")}
//       style={{ width: "100%", padding: "1rem", background: "transparent", color: "#B87333", borderRadius: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6875rem", border: "2px solid #B87333", cursor: "pointer" }}
//     >
//       Go to Dashboard →
//     </button>
//   </div>
// ) : (
//   <button
//     // onClick={async () => {
//     //   const { data: sess } = await supabase.auth.getSession();
//     //   if (sess?.session?.user) {
//     //     // logged in → show paywall directly
//     //     setShowPaywall(true);
//     //   } else {
//     //     // not logged in → go to signup first
//     //     navigate("/signup");
//     //   }
//     // }}

//     onClick={() => setShowPaywall(true)}
//     style={{ width: "100%", padding: "1rem", background: "#B87333", color: "white", borderRadius: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6875rem", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(184,115,51,0.2)", transition: "opacity 0.2s" }}
//   >
//     Upgrade to Pro
//   </button>
// )}
//           </div>

//           {/* Elite */}
//           <div className="pricing-card" style={{ background: "#F8F9FA", padding: "2.5rem", borderRadius: "1.5rem", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", transition: "box-shadow 0.5s" }}>
//             <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "1rem", color: "#B3B3B3" }}>&nbsp;</span>
//             <h3 style={{ fontSize: "2.25rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginBottom: "0.5rem" }}>Acqar Elite</h3>
//             <p style={{ fontSize: "0.875rem", color: "#B3B3B3", marginBottom: "2rem", fontWeight: 500 }}>For investors and brokers to make data oriented decisions.</p>
//             <div style={{ marginBottom: "2rem", display: "flex", alignItems: "baseline", gap: "0.5rem", color: "#2B2B2B" }}>
//               <AEDIcon size="42" style={{  alignSelf: "center", marginRight: "0.25rem" }} />
//               <span style={{ fontSize: "3rem", fontWeight: 900 }}>{elitePrice}</span>
// <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", opacity: 0.5, textTransform: "uppercase" }}>{elitePeriod}</span>
//             </div>
//             <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem", flex: 1 }}>
//               {["29 TRUVALU™ AI Reports/Month", "Everything in ACQAR PRO", "All S4/S5 Severity Push + Email Alerts", "Daily Market Trend Report", "Weekly Market Digest Email", "Area Specific Watchlists", "Off-plan Completion Risk Score", "Market Timing Index (by Area)", "Cancel Subscription Anytime"].map(f => (
//                 <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", fontWeight: 500 }}>
//                   <Icon name="corporate_fare" style={{ color: "#2B2B2B", fontSize: "1.125rem" }} /> {f}
//                 </li>
//               ))}
//             </ul>
//            {userPlan === "elite" ? (
//   <div>
//     <div style={{
//       display: "flex",
//       alignItems: "center",
//       justifyContent: "center",
//       gap: "0.5rem",
//       padding: "0.85rem",
//       background: "rgba(34,197,94,0.1)",
//       border: "2px solid rgba(34,197,94,0.5)",
//       borderRadius: "0.75rem",
//       marginBottom: "0.75rem",
//     }}>
//       <span style={{ fontSize: "1rem" }}>✅</span>
//       <span style={{ fontWeight: 900, fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#16a34a" }}>
//         Your Current Plan
//       </span>
//     </div>
//     {userEmail && (
//       <p style={{ fontSize: "0.7rem", color: "#B3B3B3", textAlign: "center", marginBottom: "0.75rem", fontWeight: 600 }}>
//         Active as <strong style={{ color: "#2B2B2B" }}>{userEmail}</strong>
//       </p>
//     )}
//     <button
//       onClick={() => navigate("/dashboard")}
//       style={{ width: "100%", padding: "1rem", background: "transparent", color: "#2B2B2B", borderRadius: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6875rem", border: "2px solid #2B2B2B", cursor: "pointer" }}
//     >
//       Go to Dashboard →
//     </button>
//   </div>
// ) : (
//   <button
//     className="pricing-btn-outline"
//     style={{ width: "100%", padding: "1rem", background: "transparent", color: "#2B2B2B", borderRadius: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6875rem", border: "2px solid #2B2B2B", cursor: "pointer", transition: "background 0.2s, color 0.2s" }}
//   >
//     Contact Sales
//   </button>
// )}
//           </div>
//         </section>

//         {/* ── WHO USES ACQAR ── */}
//         <section className="who-uses-section" style={{ padding: "8rem 2rem", background: "#FAFAFA", overflow: "hidden" }}>
//           <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
//             <div className="who-uses-heading" style={{ textAlign: "center", marginBottom: "5rem" }}>
//               <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase", color: "#B87333" }}>The Ecosystem</span>
//               <h2 style={{ fontSize: "3rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginTop: "1rem" }}>Who Uses Acqar</h2>
//             </div>
//             <div className="who-uses-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
//               {[
//                 { icon: "home_pin", title: "Property Owners", pain: "Uncertainty about real-time asset valuation.", features: ["Regular Value Updates", "Renovation ROI Forecast"] },
//                 { icon: "shopping_bag", title: "Property Buyers", pain: "Fear of overpaying in volatile markets.", features: ["True Market Value Data", "Negotiating Leverage"] },
//                 { icon: "monitoring", title: "Investors", pain: "Difficulty identifying high-yield areas.", features: ["Yield Heatmaps", "Area Appreciation Trends"] },
//                 { icon: "handshake", title: "Brokers", pain: "Lengthy traditional report generation.", features: ["Instant White-Label PDF", "Institutional Credibility"] },
//               ].map(card => (
//                 <div key={card.title} style={{ background: "white", padding: "2rem", borderRadius: "1.5rem", border: "1px solid #E5E7EB" }}>
//                   <div style={{ width: "3rem", height: "3rem", background: "rgba(184,115,51,0.1)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
//                     <Icon name={card.icon} style={{ color: "#B87333" }} />
//                   </div>
//                   <h4 style={{ fontSize: "1.25rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.03em", marginBottom: "1rem" }}>{card.title}</h4>
//                   <div style={{ marginBottom: "1.5rem" }}>
//                     <span style={{ fontSize: "0.5625rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#B3B3B3" }}>Pain Point</span>
//                     <p style={{ fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.6, marginTop: "0.25rem" }}>{card.pain}</p>
//                   </div>
//                   <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
//                     {card.features.map(f => (
//                       <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.6875rem", fontWeight: 700 }}>
//                         <Icon name="check" style={{ color: "#B87333", fontSize: "0.875rem" }} /> {f}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </section>

//         {/* ── COMPARE TABLE ── */}
//         <section className="compare-section" style={{ padding: "8rem 2rem", background: "white" }}>
//           <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
//             <div className="compare-heading" style={{ textAlign: "center", marginBottom: "4rem" }}>
//               <span style={{ fontSize: "0.75rem", fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase", color: "#B87333", display: "block", marginBottom: "1rem" }}>Detailed Comparison</span>
//               <h2 style={{ fontSize: "3.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginBottom: "1rem" }}>Compare All Features</h2>
//               <p style={{ color: "#B3B3B3", fontWeight: 500, fontSize: "1.125rem" }}>Everything included in each plan — no hidden costs</p>
//             </div>
//             {/* overflow-x scroll wrapper for mobile */}
//             <div className="compare-table-wrap" style={{ overflowX: "auto", borderRadius: "2rem", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", background: "white" }}>
//               <table className="compare-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", fontWeight: 500 }}>
//                 <thead>
//                   <tr style={{ background: "#1C1C1C", color: "white" }}>
//                     <th style={{ padding: "2.5rem 2rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", width: "25%" }}>Feature</th>
//                     <th style={{ padding: "2.5rem 2rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", width: "25%" }}>Explorer<br /><span style={{ opacity: 0.5, fontWeight: 700 }}>Free</span></th>
//                     <th style={{ padding: "2.5rem 2rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", width: "25%", background: "#B87333" }}>
//                       Pro<br />
//                       <span style={{ opacity: 0.9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
//                             <AEDIcon style={{ fontSize: "0.68rem", lineHeight: 1 }} />149/MO

//                       </span>
//                     </th>
//                     <th style={{ padding: "2.5rem 2rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", width: "25%" }}>
//   Elite<br />
//   <span style={{ opacity: 0.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
//     <AEDIcon style={{ fontSize: "0.68rem", lineHeight: 1, filter: "grayscale(1)", opacity: 0.5 }} />299/MO
//   </span>
// </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <TableGroupHeader label="TruValu™ — AI Property Valuation" />
//                   <TableRow label="Reports per Month" explorer="3 lifetime" pro="10" elite="29" proHighlight />
//                   <TableRow label="Additional Report Price" explorer="—" pro="AED 35" elite="AED 25" proHighlight />
//                   <TableRow label="Estimated Market Value" explorer={<Check dim />} pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="Investment Score (0–100)" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="Prices & Trends" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="AI 6-Month Price Forecast" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="AI 3-Year Price Forecast" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="Supply & Demand Chart" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="Recent Sales (DLD transactions)" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="Valuation Confidence Score" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="UAE Transaction Cost Calculator" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="PDF Download" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="DLD Price Cross-Reference" explorer="—" pro="—" elite={<Check />} proHighlight />
//                   <TableRow label="Branded PDF Client Export" explorer="—" pro="—" elite={<Check />} proHighlight />

//                   <TableGroupHeader label="Signal™ — Real-Time Market Intelligence" />
//                   <TableRow label="Real-Time Feed (3-min refresh)" explorer={<span style={{ color: "#B3B3B3", fontStyle: "italic" }}>24hr delay</span>} pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="Areas Covered" explorer={<span style={{ color: "#B3B3B3" }}>Top 5 only</span>} pro={<strong>All</strong>} elite={<strong>All</strong>} proHighlight />
//                   <TableRow label="S4/S5 Email Alerts" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
//                   <TableRow label="All Alerts (S1–S5, Push + Email)" explorer="—" pro="—" elite={<Check />} proHighlight />
//                   <TableRow label="Portfolio Tracker" explorer="—" pro="5 properties" elite={<strong>Unlimited</strong>} proHighlight />
//                   <TableRow label="Market Timing Index (per area)" explorer="—" pro="—" elite={<Check />} proHighlight />
//                   <TableRow label="Historical Signal Archive" explorer="—" pro="—" elite={<strong>12 months</strong>} proHighlight />
//                   <TableRow label="Weekly Market Digest Email" explorer="—" pro="—" elite={<Check />} proHighlight />

//                   <TableGroupHeader label="Platform & Support" />
//                   <TableRow label="Team Seats" explorer="—" pro={<strong>1 seat</strong>} elite={<strong>1 seat</strong>} proHighlight />
//                   <TableRow label="Support" explorer={<span style={{ color: "#B3B3B3" }}>Community</span>} pro={<strong>Email</strong>} elite={<strong>Priority Email</strong>} proHighlight />
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </section>

//         {/* ── FAQ ── */}
//         <section className="faq-section" style={{ padding: "8rem 2rem", maxWidth: "56rem", margin: "0 auto" }}>
//           <div style={{ textAlign: "center", marginBottom: "5rem" }}>
//             <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase", color: "#B87333" }}>Transparency</span>
//             <h2 style={{ fontSize: "3rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginTop: "1rem" }}>Frequently Asked Questions</h2>
//           </div>
//           <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
//             <FAQItem question="Where does your data come from?" answer="We aggregate data from official land department records, institutional mortgage filings, and real-time transaction feeds from major broker networks." />
//             <FAQItem question="Can I cancel my Pro subscription?" answer="Yes, you can cancel at any time. If you are on an annual plan, your access will continue until the end of your billing cycle." />
//             <FAQItem question="Are the reports legally binding?" answer="Our reports are for intelligence and decision support purposes. While highly accurate, formal bank valuations may still be required by certain institutional lenders." />
//           </div>
//         </section>

//         {/* ── FINAL CTA ── */}
//         <section className="cta-section" style={{ padding: "8rem 2rem", textAlign: "center", background: "#2B2B2B", borderTop: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", position: "relative" }}>
//           <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#fff 0.5px, transparent 0.5px)", backgroundSize: "24px 24px", opacity: 0.03, pointerEvents: "none" }} />
//           <div style={{ position: "relative", zIndex: 10, maxWidth: "56rem", margin: "0 auto" }}>
//             <h2 style={{ fontSize: "clamp(2.5rem,7vw,5rem)", fontWeight: 900, letterSpacing: "-0.05em", textTransform: "uppercase", lineHeight: 0.9, marginBottom: "1.5rem", color: "white" }}>
//               Ready to Invest<br />With Certainty?
//             </h2>
//             <p style={{ fontSize: "1.25rem", color: "rgba(255,255,255,0.4)", maxWidth: "42rem", margin: "0 auto 3rem", fontWeight: 500, lineHeight: 1.6 }}>
//               Join <span style={{ color: "white" }}>2,400+ investors</span> who use Acqar to see Dubai's market before anyone else — and value any property in 60 seconds.
//             </p>
//             <div className="cta-buttons" style={{ display: "flex", flexDirection: "row", gap: "1.5rem", justifyContent: "center", alignItems: "center", marginBottom: "2rem" }}>
//               <button
//                 onClick={() => navigate("/signup")}
//                 style={{ padding: "1.25rem 3rem", background: "linear-gradient(to right, #B87333, #D4956A)", color: "white", borderRadius: "9999px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.6875rem", boxShadow: "0 0 40px rgba(184,115,51,0.3)", border: "none", cursor: "pointer" }}
//               >
//                 Start Free — 3 Reports Included
//               </button>
//               <button
//                 onClick={() => navigate("/signup")}
//                 style={{ padding: "1.25rem 3rem", border: "1px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "9999px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.6875rem", background: "transparent", cursor: "pointer" }}
//               >
//                 View Founding Member Offer
//               </button>
//             </div>
//             <p style={{ fontSize: "0.625rem", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
//               No card required · Cancel anytime · Built in Dubai
//             </p>
//           </div>
//         </section>
//       </main>

//       {/* ── FOOTER ── */}
//       <Footer />

//       {/* ── PAYWALL MODAL ── */}
//       {/* {showPaywall && (
//         <PaywallModal
//           valuationId={null}
//           onSuccess={async () => {
//             setShowPaywall(false);
//             const { data: sess } = await supabase.auth.getSession();
//             const user = sess?.session?.user;
//             if (user) {
//               await supabase
//                 .from("users")
//                 .update({
//                   plan: "pro",
//                   free_reports_limit: 10,
//                   free_reports_used: 0,
//                   is_founding_member: true,
//                 })
//                 .eq("id", user.id);
//               // refresh plan state so card shows "Your Current Plan"
//               setUserPlan("pro");
//               setUserEmail(user.email || "");
//             }
//           }}
//           onClose={() => setShowPaywall(false)}
//         />
//       )} */}

//       {showPaywall && (
//   <PaywallModal
//     valuationId={null}
//     onSuccess={async () => {
//       setShowPaywall(false);

//       // ✅ Re-fetch session to get the newly created user
//       // Small delay to let Supabase auth settle
//       await new Promise(resolve => setTimeout(resolve, 1000));

//       const { data: sess } = await supabase.auth.getSession();
//       const user = sess?.session?.user;

//       if (user) {
//         // ✅ Update plan in DB
//         await supabase
//           .from("users")
//           .update({
//             plan: "pro",
//             free_reports_limit: 10,
//             free_reports_used: 0,
//             is_founding_member: true,
//           })
//           .eq("id", user.id);

//         // ✅ Update local state so pricing card shows "Your Current Plan"
//         setUserPlan("pro");
//         setUserEmail(user.email || "");

//         // ✅ Navigate to dashboard
//         navigate("/dashboard");
//       } else {
//         // No session yet (email confirmation pending) → just go to dashboard
//         navigate("/dashboard");
//       }
//     }}
//     onClose={() => setShowPaywall(false)}
//   />
// )}
    
//     </div>
//   );
// }






















import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { trackEvent } from "../analytics";
import PaywallModal from "../components/PaywallModal";

/* ─────────────────────────────────────────
   GLOBAL STYLES
───────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

  .pricing-page * { box-sizing: border-box; }

  .pricing-page .material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  }

  .pricing-page .architectural-lines {
    background-image: radial-gradient(#2B2B2B 0.5px, transparent 0.5px);
    background-size: 24px 24px;
    opacity: 0.05;
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .pricing-page ::selection {
    background: #B87333;
    color: white;
  }

  .pricing-card:hover {
    box-shadow: 0 20px 60px rgba(0,0,0,0.1) !important;
  }

  .pricing-btn-primary:hover { opacity: 0.88; }
  .pricing-btn-outline:hover { background: #2B2B2B !important; color: white !important; }

  /* ── TABLET ── */
  @media (max-width: 1024px) {
    .footer-grid { grid-template-columns: 1fr 1fr 1fr !important; }
  }

  /* ── MOBILE LANDSCAPE / TABLET PORTRAIT ── */
  @media (max-width: 900px) {
    .pricing-tiers-grid {
      grid-template-columns: 1fr !important;
      max-width: 480px !important;
      margin-left: auto !important;
      margin-right: auto !important;
    }
    .pricing-tiers-grid > div:nth-child(2) {
      transform: scale(1) !important;
    }
    .who-uses-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .compare-table { font-size: 0.75rem !important; }
    .compare-table th, .compare-table td { padding: 0.75rem 0.75rem !important; }
    .footer-grid { grid-template-columns: 1fr 1fr !important; }
    .cta-buttons { flex-direction: column !important; align-items: stretch !important; }
    .cta-buttons button { width: 100% !important; }
  }

  /* ── MOBILE ── */
  @media (max-width: 600px) {
    /* Hero */
    .pricing-hero-section {
      padding: 4rem 1.25rem !important;
    }
    .pricing-hero-section h1 {
      font-size: clamp(2.5rem, 14vw, 4rem) !important;
      margin-bottom: 1.25rem !important;
    }
    .pricing-hero-section p {
      font-size: 1rem !important;
      margin-bottom: 2rem !important;
    }
    .pricing-toggle { margin-bottom: 2rem !important; }

    /* Founding banner */
    .founding-banner {
      flex-direction: column !important;
      gap: 1rem !important;
      width: 100% !important;
      padding: 1rem !important;
    }
    .founding-banner > div { margin-right: 0 !important; }
    .founding-divider { display: none !important; }

    /* Tiers */
    .pricing-tiers-grid {
      padding: 0 1.25rem 4rem !important;
      max-width: 100% !important;
    }

    /* Who uses */
    .who-uses-section { padding: 4rem 1.25rem !important; }
    .who-uses-grid { grid-template-columns: 1fr !important; }

    /* Compare table */
    .compare-section { padding: 4rem 0.75rem !important; }
    .compare-table-wrap { border-radius: 1rem !important; }
    .compare-table { font-size: 0.7rem !important; min-width: 480px; }
    .compare-table th, .compare-table td { padding: 0.6rem 0.6rem !important; }
    .compare-table th:first-child,
    .compare-table td:first-child { min-width: 120px; }

    /* FAQ */
    .faq-section { padding: 4rem 1.25rem !important; }
    .faq-section h2 { font-size: 2rem !important; }
    .faq-item-question { font-size: 0.9rem !important; }

    /* CTA */
    .cta-section { padding: 4rem 1.25rem !important; }
    .cta-section h2 { font-size: clamp(1.75rem, 8vw, 3rem) !important; }
    .cta-section p { font-size: 1rem !important; }
    .cta-buttons { flex-direction: column !important; gap: 0.75rem !important; }
    .cta-buttons button {
      width: 100% !important;
      padding: 1rem 1.5rem !important;
      font-size: 0.625rem !important;
    }

    /* Footer */
    .footer-inner { padding: 3rem 1.25rem 2rem !important; }
    .footer-grid {
      grid-template-columns: 1fr 1fr !important;
      gap: 2rem !important;
      margin-bottom: 2.5rem !important;
    }
    .footer-brand { grid-column: 1 / -1 !important; }
    .footer-bottom {
      flex-direction: column !important;
      align-items: flex-start !important;
      gap: 0.5rem !important;
    }

    /* Section headings */
    .who-uses-heading h2 { font-size: 2rem !important; }
    .compare-heading h2 { font-size: 2rem !important; }
  }

  /* ── EXTRA SMALL ── */
  @media (max-width: 380px) {
    .pricing-hero-section { padding: 3rem 1rem !important; }
    .pricing-tiers-grid { padding: 0 1rem 3rem !important; }
    .compare-table { font-size: 0.65rem !important; min-width: 420px; }
  }
`;

/* ─────────────────────────────────────────
   SMALL HELPERS
───────────────────────────────────────── */
// const AEDIcon = ({ style = {} }) => (
//   <img
//     alt="AED"
//     style={{ height: "2rem", width: "auto", ...style }}
//     src="https://lh3.googleusercontent.com/aida/ADBb0ugyDYGIcyDrjPsg38dh61Ezcjtj-r-B9vT-LsT_b8c6iG7kkG3vpq_48Lu92EcJ2fvEZvm9lO7koOu2x2x4licRYhEd1CJFY1sginsn6lYiRDMkrs3CG_ja4_5IXDNfr98l8qHfmZdilReWrfwLN0V_oNCUnKiwgB8o_IjCYqwKK8INIrTHn4AUKf1772yMXaG-BXaSlEK_o0zEWQgxkc6rLl6Yz2pmxNRXpx92U-GjPSLsL5zTnv8YoqrehCn9_VfIXPvXxpMQ"
//   />
// );

// const AEDIcon = ({ style = {} }) => (
//   <span
//     style={{
//       fontFamily: "Arial, sans-serif",
//       fontWeight: 900,
//       fontSize: "1.5rem",
//       lineHeight: 1,
//       letterSpacing: "-0.02em",
//       ...style
//     }}
//   >
//     AED
//   </span>
// );


const AEDIcon = ({ size = 24, style = {} }) => (
  <span
    style={{
      display: "inline-block",
      verticalAlign: "middle",
      fontWeight: 900,
      fontSize: size * 0.6,
      letterSpacing: "-0.02em",
      lineHeight: 1,
      ...style
    }}
  >
    AED
  </span>
);


// const AEDIcon = ({ size = 24, style = {} }) => (
//   <svg
//     viewBox="0 0 115 100"
//     width={size}
//     height={Math.round(size * 0.87)}
//     style={{ display: "inline-block", verticalAlign: "middle", ...style }}
//     xmlns="http://www.w3.org/2000/svg"
//   >
//     {/* Thick vertical stroke */}
//     <rect x="14" y="0" width="12" height="100" fill="currentColor"/>

//     {/* D curve — pixel traced from image */}
//     <path
//       d="M 26,0 L 49,0 C 60,0 74,4 80,10 C 88,18 93,28 95,39
//          L 95,61
//          C 93,72 88,82 80,90 C 74,96 60,100 49,100 L 26,100 Z"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="5"
//       strokeLinejoin="round"
//     />

//     {/* Bar 1 — full width, cuts through everything */}
//     <rect x="0" y="35" width="112" height="9" fill="currentColor"/>

//     {/* Bar 2 — full width, cuts through everything */}
//     <rect x="0" y="56" width="112" height="8" fill="currentColor"/>
//   </svg>
// );

const Icon = ({ name, style = {} }) => (
  <span className="material-symbols-outlined" style={style}>{name}</span>
);

function Check({ color = "#2B2B2B", dim = false }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{ color: dim ? "#B3B3B3" : color, fontSize: "1.125rem", opacity: dim ? 0.4 : 1 }}
    >
      check_circle
    </span>
  );
}

function TableGroupHeader({ label }) {
  return (
    <tr style={{ background: "#F8F9FA", borderBottom: "1px solid rgba(229,231,235,0.3)" }}>
      <td
        colSpan={4}
        style={{ padding: "1rem 2rem", fontSize: "0.625rem", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B87333" }}
      >
        {label}
      </td>
    </tr>
  );
}

function TableRow({ label, explorer, pro, elite, proHighlight }) {
  return (
    <tr style={{ borderBottom: "1px solid rgba(229,231,235,0.3)" }}>
      <td style={{ padding: "1.5rem 2rem", fontWeight: 700 }}>{label}</td>
      <td style={{ padding: "1.5rem 2rem", textAlign: "center", color: "#B3B3B3", opacity: 0.6 }}>{explorer}</td>
      <td style={{
        padding: "1.5rem 2rem", textAlign: "center", fontWeight: 900,
        background: proHighlight ? "rgba(253,241,230,0.3)" : "transparent",
        borderLeft: "1px solid rgba(229,231,235,0.1)",
        borderRight: "1px solid rgba(229,231,235,0.1)",
      }}>{pro}</td>
      <td style={{ padding: "1.5rem 2rem", textAlign: "center", fontWeight: 900 }}>{elite}</td>
    </tr>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{ background: "#F8F9FA", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #E5E7EB", cursor: "pointer" }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
        <span className="faq-item-question" style={{ fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em", fontSize: "1.125rem" }}>
          {question}
        </span>
        <span
          className="material-symbols-outlined"
          style={{ transition: "transform 0.3s", transform: open ? "rotate(-180deg)" : "rotate(0deg)", flexShrink: 0 }}
        >
          expand_more
        </span>
      </div>
      {open && (
        <p style={{ marginTop: "1rem", color: "#B3B3B3", fontWeight: 500, lineHeight: 1.7 }}>
          {answer}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   HEADER
───────────────────────────────────────── */
function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname;
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const navItems = [
    { label: "TRUVALU™", href: "/truvalu" },
    { label: "PRICING", path: "/pricing" },
    { label: "RESOURCES", path: "/blogs" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#D4D4D4] bg-white">
        <div className="hdrWrap max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">

          {/* Logo */}
          <div
            className="hdrLogo flex items-center cursor-pointer shrink-0 whitespace-nowrap"
            onClick={() => { trackEvent("nav_click", { item: "logo" }); navigate("/"); }}
          >
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
              <span style={{ color: "#B87333" }}>ACQ</span>
              <span style={{ color: "#111111" }}>AR</span>
            </h1>
          </div>

          {/* Mobile nav */}
          <div className="md:hidden flex items-center gap-0">
            {/* <a
              href="http://www.acqar.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-black uppercase tracking-[0.15em] px-2 py-1.5 rounded-full whitespace-nowrap text-[#2B2B2B]/70"
              style={{ textDecoration: "none" }}
            >
              SIGNAL™
            </a> */}
            <a
              href="https://www.acqar.com/truvalu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[9px] font-black uppercase tracking-[0.15em] px-1 py-1 rounded-full whitespace-nowrap text-[#2B2B2B]/70"
              style={{ textDecoration: "none" }}
            >
              TRUVALU™
            </a>
            <button
              onClick={() => { trackEvent("nav_click", { item: "pricing" }); navigate("/pricing"); }}
              className={`text-[9px] font-black uppercase tracking-[0.15em] px-1 py-1 rounded-full whitespace-nowrap ${current === "/pricing" ? "text-[#B87333] underline underline-offset-4" : "text-[#2B2B2B]/70"}`}
            >
              PRICING
            </button>
            <button
              onClick={() => { trackEvent("nav_click", { item: "resources" }); navigate("/blogs"); }}
              className={`text-[9px] font-black uppercase tracking-[0.15em] px-1 py-1 rounded-full whitespace-nowrap ${current === "/blogs" ? "text-[#B87333] underline underline-offset-4" : "text-[#2B2B2B]/70"}`}
            >
              RESOURCES
            </button>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            <a
              href="http://www.acqar.com/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("Nav", "Click", "Signal")}
              className="text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap text-[#2B2B2B]"
              style={{ textDecoration: "none" }}
            >
              SIGNAL™
            </a>

            {navItems.map((item) =>
              item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("Nav", "Click", item.label)}
                  className="text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap text-[#2B2B2B]"
                  style={{ textDecoration: "none" }}
                >
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.label}
                  onClick={() => { trackEvent("Nav", "Click", item.label); navigate(item.path); }}
                  className={`text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap ${current === item.path ? "text-[#B87333] border-b-2 border-[#B87333]" : "text-[#2B2B2B]"}`}
                >
                  {item.label}
                </button>
              )
            )}
          </nav>

          {/* Right CTA */}
          <div className="hdrRight flex items-center gap-2 sm:gap-4 shrink-0 flex-nowrap">
            {user ? (
              <button
                onClick={() => navigate("/dashboard")}
               className="bg-[#B87333] text-white px-2 sm:px-6 py-1.5 sm:py-2.5 rounded-md text-[9px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={() => { trackEvent("nav_click", { item: "login" }); navigate("/login"); }}
                className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        <style>{`
  @media (max-width: 480px) {
    .hdrWrap button,
    .hdrWrap a {
      font-size: 9px !important;
      padding: 4px 5px !important;
      letter-spacing: 0.05em !important;
    }
    .hdrRight button {
      font-size: 10px !important;
      padding: 7px 10px !important;
      white-space: nowrap !important;
    }
  }
  @media (max-width: 420px) {
    .hdrWrap { padding-left: 10px !important; padding-right: 10px !important; gap: 4px !important; }
    .hdrLogo h1 { font-size: 17px !important; letter-spacing: -0.02em !important; }
  }
  @media (max-width: 360px) {
    .hdrWrap { gap: 3px !important; }
  }
`}</style>
      </header>
      <div className="h-20" />
    </>
  );
}

/* ─────────────────────────────────────────
   FOOTER
───────────────────────────────────────── */
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
                An AI-powered property intelligence platform built exclusively for Dubai real estate. Independent, institutional-quality, and always on.
              </p>
              {/* <div className="rics-badge"> */}
                {/* <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg> */}
                {/* <span>RICS-Aligned Intelligence</span> */}
              {/* </div> */}
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
                  <a href="https://www.acqar.com/truvalu" target="_blank" rel="noopener noreferrer">
                    ACQAR TRUVALU™
                  </a>
                </li>
                <li>
                  <a href="http://www.acqar.com/" target="_blank" rel="noopener noreferrer">
                    ACQAR SIGNAL™
                  </a>
                </li>
                <li className="muted">ACQAR PASSPORT™</li>
                <li onClick={() => navigate('/pricing')}>PRICING</li>
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
                  {['About ACQAR', 'Contact Us'].map(l => (
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

/* ─────────────────────────────────────────
   MAIN PRICING PAGE
───────────────────────────────────────── */
export default function Pricing() {
  const navigate = useNavigate();
const [isAnnual, setIsAnnual] = useState(false);
const [spotsLeft, setSpotsLeft] = useState(null);
const [userPlan, setUserPlan] = useState(null); // null = loading, "free", "pro", "elite"
const [userEmail, setUserEmail] = useState("");
const [showPaywall, setShowPaywall] = useState(false);

useEffect(() => {
  async function fetchSpots() {
    const { data, error } = await supabase
      .rpc('get_founding_member_count');

    if (!error && data !== null) {
  // starts at 275 baseline + real pro users from DB
  const taken = 225 + data;
  setSpotsLeft(taken);
}
  }
  fetchSpots();
}, []);

useEffect(() => {
  async function fetchUserPlan() {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess?.session?.user;
    if (!user) { setUserPlan("guest"); return; }
    setUserEmail(user.email || "");
    const { data } = await supabase
      .from("users")
      .select("plan")
      .eq("id", user.id)
      .single();
    setUserPlan(data?.plan || "free");
  }
  fetchUserPlan();
}, []);


const proMonthly = 29;
const eliteMonthly = 299;

const proAnnual = 999;   // exact: 1428 * 0.70 = 999.6 → hardcode 999
const eliteAnnual = 2511; // exact: 3588 * 0.70 = 2511.6 → hardcode 2511

const proPrice = isAnnual ? proAnnual : proMonthly;
const elitePrice = isAnnual ? eliteAnnual : eliteMonthly;
const proPeriod = isAnnual ? "/ annually" : "/MO";
const elitePeriod = isAnnual ? "/ annually" : "/MO";
  return (
    <div className="pricing-page" style={{ fontFamily: "'Inter', sans-serif", background: "#FFFFFF", color: "#2B2B2B" }}>
      <style>{styles}</style>

      {/* ── HEADER ── */}
      <Header />

      <main>

        {/* ── HERO ── */}
        <section className="pricing-hero-section" style={{ position: "relative", padding: "8rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", overflow: "hidden" }}>
          <div className="architectural-lines" />

          <div style={{ marginBottom: "2rem", padding: "0.25rem 1rem", background: "#FDF1E6", border: "1px solid rgba(184,115,51,0.2)", borderRadius: "9999px" }}>
            <span style={{ fontSize: "0.625rem", fontWeight: 900, letterSpacing: "0.3em", color: "#B87333", textTransform: "uppercase" }}>
              Early Founding Member Access
            </span>
          </div>

          <h1 style={{ fontSize: "clamp(3rem,10vw,8rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 0.85, marginBottom: "2rem", maxWidth: "80rem", textTransform: "uppercase" }}>
            See. Value.<br />Decide.
          </h1>

          <p style={{ fontSize: "1.25rem", color: "#B3B3B3", maxWidth: "42rem", marginBottom: "3rem", fontWeight: 500 }}>
            Acqar gives you the market signal to see what is happening, the valuation intelligence to understand what a property is worth, and the investment score to decide whether to act.
          </p>

          

          {/* Founding member banner */}
          <div className="founding-banner" style={{ background: "#FAFAFA", padding: "1rem 2rem", borderRadius: "0.75rem", border: "1px solid #E5E7EB", display: "inline-flex", alignItems: "center", marginBottom: "3rem" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginRight: "2rem" }}>
              <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B3B3B3", marginBottom: "0.25rem" }}>Founding Member Offer</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
  <AEDIcon size="18" style={{ color: "#2B2B2B" }} />
  <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "#2B2B2B" }}>
    29<span style={{ fontSize: "0.6875rem", opacity: 0.5, marginLeft: "0.25rem" }}>/MO</span>
  </span>
</div>
                <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#B87333", textTransform: "uppercase", letterSpacing: "0.15em" }}>For 3 Months</span>
              </div>
            </div>
            <div className="founding-divider" style={{ width: "1px", height: "2rem", background: "#E5E7EB", marginRight: "2rem" }} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", color: "#B3B3B3", marginBottom: "0.25rem" }}>Limited Availability</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 700 }}>
  <span style={{ color: "#B87333" }}>
    {spotsLeft !== null ? spotsLeft : '225'}
  </span> founding members joined
</span>
            </div>
          </div>

          {/* Monthly / Annual toggle */}
          <div className="pricing-toggle" style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "4rem" }}>
  <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", opacity: isAnnual ? 0.4 : 1 }}>Monthly</span>
  <div
    onClick={() => setIsAnnual(!isAnnual)}
    style={{ width: "3.5rem", height: "1.75rem", background: "#2B2B2B", borderRadius: "9999px", position: "relative", padding: "0.25rem", cursor: "pointer" }}
  >
    <div style={{
      width: "1.25rem", height: "1.25rem", background: "#B87333", borderRadius: "9999px",
      position: "absolute",
      right: isAnnual ? "0.25rem" : "auto",
      left: isAnnual ? "auto" : "0.25rem",
      transition: "left 0.2s, right 0.2s"
    }} />
  </div>
  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
    <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", opacity: isAnnual ? 1 : 0.4 }}>Annual</span>
    <span style={{ fontSize: "0.5625rem", fontWeight: 700, color: "#B87333", letterSpacing: "0.15em", textTransform: "uppercase" }}>Save 17%</span>
  </div>
</div>
        </section>

        {/* ── PRICING TIERS ── */}
        <section className="pricing-tiers-grid" style={{ padding: "0 2rem 8rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", maxWidth: "80rem", margin: "0 auto" }}>

          {/* Explorer */}
          <div className="pricing-card" style={{ background: "#F8F9FA", padding: "2.5rem", borderRadius: "1.5rem", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", transition: "box-shadow 0.5s" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "1rem", color: "#B3B3B3" }}>&nbsp;</span>
            <h3 style={{ fontSize: "2.25rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginBottom: "0.5rem" }}>Explorer</h3>
            <p style={{ fontSize: "0.875rem", color: "#B3B3B3", marginBottom: "2rem", fontWeight: 500 }}>For anyone getting started with Dubai real estate market.</p>
            <div style={{ marginBottom: "2rem", display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
              <span style={{ fontSize: "3rem", fontWeight: 900 }}>FREE</span>
              <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", opacity: 0.5, textTransform: "uppercase" }}>/Mo</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem", flex: 1 }}>
              {["3 TRUVALU™ AI Reports", "Instant AI Valuation Estimate", "Webview Reports", "Limited SIGNAL™ Terminal Access", "Limited Signals Feed", "No Credit Card Required"].map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", fontWeight: 500 }}>
                  <Icon name="check_circle" style={{ color: "#2B2B2B", fontSize: "1.125rem" }} /> {f}
                </li>
              ))}
            </ul>
            {userPlan === null ? (
  // Still loading — show nothing / skeleton
  <div style={{
    padding: "1rem",
    background: "#f3f4f6",
    borderRadius: "0.75rem",
    height: "48px",
  }} />
) : userPlan === "free" ? (
  <div style={{
    padding: "1rem",
    background: "rgba(43,43,43,0.06)",
    borderRadius: "0.75rem",
    textAlign: "center",
    fontWeight: 900,
    fontSize: "0.7rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: "#2B2B2B",
    border: "2px solid rgba(43,43,43,0.15)",
  }}>
    ✓ Your Current Plan
  </div>
) : (
  <button
    className="pricing-btn-primary"
    onClick={() => navigate("/login")}
    style={{ width: "100%", padding: "1rem", background: "#2B2B2B", color: "white", borderRadius: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6875rem", border: "none", cursor: "pointer", transition: "opacity 0.2s" }}
  >
    Get Started
  </button>
)}
          </div>

          {/* Pro */}
          <div className="pricing-card" style={{ background: "white", padding: "2.5rem", borderRadius: "1.5rem", border: "3px solid #B87333", display: "flex", flexDirection: "column", boxShadow: "0 8px 32px rgba(184,115,51,0.15)", position: "relative", transform: "scale(1.05)", zIndex: 10 }}>
            <div style={{ position: "absolute", top: "-1rem", left: "50%", transform: "translateX(-50%)", background: "#B87333", color: "white", padding: "0.25rem 1rem", borderRadius: "9999px", fontSize: "0.625rem", fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              Most Popular
            </div>
            <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "1rem", color: "#B87333" }}>Founding Member Offer</span>
            <h3 style={{ fontSize: "2.25rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginBottom: "0.5rem" }}>Acqar Pro</h3>
            <p style={{ fontSize: "0.875rem", color: "#B3B3B3", marginBottom: "2rem", fontWeight: 500 }}>For property owners and buyers who need Dubai real estate intelligence platform.</p>
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                <AEDIcon size="42" style={{ color: "#B87333", alignSelf: "center", marginRight: "0.25rem" }} />
                <span style={{ fontSize: "3rem", fontWeight: 900, color: "#B87333" }}>{proPrice}</span>
              </div>
              <span style={{ fontSize: "0.625rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#B87333" }}>
  {isAnnual ? proPeriod : "First 3 months → 149/mo after"}
</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem", flex: 1 }}>
              {["10 TRUVALU™ AI Reports/Month", "Premium Instant AI Valuation Model", "PDF Reports and Sharable Link", "Full SIGNAL™ Terminal Access", "Real-Time Signals Feed", "Real-Time Signals Report", "Community Chat Access", "Cancel Subscription Anytime"].map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", fontWeight: 700 }}>
                  <Icon name="verified" style={{ color: "#B87333", fontSize: "1.125rem" }} /> {f}
                </li>
              ))}
            </ul>
            {userPlan === "pro" ? (
  <div>
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      padding: "0.85rem",
      background: "rgba(34,197,94,0.1)",
      border: "2px solid rgba(34,197,94,0.5)",
      borderRadius: "0.75rem",
      marginBottom: "0.75rem",
    }}>
      <span style={{ fontSize: "1rem" }}>✅</span>
      <span style={{ fontWeight: 900, fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#16a34a" }}>
        Your Current Plan
      </span>
    </div>
    {userEmail && (
      <p style={{ fontSize: "0.7rem", color: "#B3B3B3", textAlign: "center", marginBottom: "0.75rem", fontWeight: 600 }}>
        Active as <strong style={{ color: "#2B2B2B" }}>{userEmail}</strong>
      </p>
    )}
    <button
      onClick={() => navigate("/dashboard")}
      style={{ width: "100%", padding: "1rem", background: "transparent", color: "#B87333", borderRadius: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6875rem", border: "2px solid #B87333", cursor: "pointer" }}
    >
      Go to Dashboard →
    </button>
  </div>
) : (
  <button
    // onClick={async () => {
    //   const { data: sess } = await supabase.auth.getSession();
    //   if (sess?.session?.user) {
    //     // logged in → show paywall directly
    //     setShowPaywall(true);
    //   } else {
    //     // not logged in → go to signup first
    //     navigate("/signup");
    //   }
    // }}

    onClick={() => setShowPaywall(true)}
    style={{ width: "100%", padding: "1rem", background: "#B87333", color: "white", borderRadius: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6875rem", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(184,115,51,0.2)", transition: "opacity 0.2s" }}
  >
    Upgrade to Pro
  </button>
)}
          </div>

          {/* Elite */}
          <div className="pricing-card" style={{ background: "#F8F9FA", padding: "2.5rem", borderRadius: "1.5rem", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", transition: "box-shadow 0.5s" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "1rem", color: "#B3B3B3" }}>&nbsp;</span>
            <h3 style={{ fontSize: "2.25rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginBottom: "0.5rem" }}>Acqar Elite</h3>
            <p style={{ fontSize: "0.875rem", color: "#B3B3B3", marginBottom: "2rem", fontWeight: 500 }}>For investors and brokers to make data oriented decisions.</p>
            <div style={{ marginBottom: "2rem", display: "flex", alignItems: "baseline", gap: "0.5rem", color: "#2B2B2B" }}>
              <AEDIcon size="42" style={{  alignSelf: "center", marginRight: "0.25rem" }} />
              <span style={{ fontSize: "3rem", fontWeight: 900 }}>{elitePrice}</span>
<span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", opacity: 0.5, textTransform: "uppercase" }}>{elitePeriod}</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "3rem", flex: 1 }}>
              {["29 TRUVALU™ AI Reports/Month", "Everything in ACQAR PRO", "All S4/S5 Severity Push + Email Alerts", "Daily Market Trend Report", "Weekly Market Digest Email", "Area Specific Watchlists", "Off-plan Completion Risk Score", "Market Timing Index (by Area)", "Cancel Subscription Anytime"].map(f => (
                <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", fontWeight: 500 }}>
                  <Icon name="corporate_fare" style={{ color: "#2B2B2B", fontSize: "1.125rem" }} /> {f}
                </li>
              ))}
            </ul>
           {userPlan === "elite" ? (
  <div>
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      padding: "0.85rem",
      background: "rgba(34,197,94,0.1)",
      border: "2px solid rgba(34,197,94,0.5)",
      borderRadius: "0.75rem",
      marginBottom: "0.75rem",
    }}>
      <span style={{ fontSize: "1rem" }}>✅</span>
      <span style={{ fontWeight: 900, fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#16a34a" }}>
        Your Current Plan
      </span>
    </div>
    {userEmail && (
      <p style={{ fontSize: "0.7rem", color: "#B3B3B3", textAlign: "center", marginBottom: "0.75rem", fontWeight: 600 }}>
        Active as <strong style={{ color: "#2B2B2B" }}>{userEmail}</strong>
      </p>
    )}
    <button
      onClick={() => navigate("/dashboard")}
      style={{ width: "100%", padding: "1rem", background: "transparent", color: "#2B2B2B", borderRadius: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6875rem", border: "2px solid #2B2B2B", cursor: "pointer" }}
    >
      Go to Dashboard →
    </button>
  </div>
) : (
  <button
    className="pricing-btn-outline"
    style={{ width: "100%", padding: "1rem", background: "transparent", color: "#2B2B2B", borderRadius: "0.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: "0.6875rem", border: "2px solid #2B2B2B", cursor: "pointer", transition: "background 0.2s, color 0.2s" }}
  >
    Contact Sales
  </button>
)}
          </div>
        </section>

        {/* ── WHO USES ACQAR ── */}
        <section className="who-uses-section" style={{ padding: "8rem 2rem", background: "#FAFAFA", overflow: "hidden" }}>
          <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
            <div className="who-uses-heading" style={{ textAlign: "center", marginBottom: "5rem" }}>
              <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase", color: "#B87333" }}>The Ecosystem</span>
              <h2 style={{ fontSize: "3rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginTop: "1rem" }}>Who Uses Acqar</h2>
            </div>
            <div className="who-uses-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
              {[
                { icon: "home_pin", title: "Property Owners", pain: "Uncertainty about real-time asset valuation.", features: ["Regular Value Updates", "Renovation ROI Forecast"] },
                { icon: "shopping_bag", title: "Property Buyers", pain: "Fear of overpaying in volatile markets.", features: ["True Market Value Data", "Negotiating Leverage"] },
                { icon: "monitoring", title: "Investors", pain: "Difficulty identifying high-yield areas.", features: ["Yield Heatmaps", "Area Appreciation Trends"] },
                { icon: "handshake", title: "Brokers", pain: "Lengthy traditional report generation.", features: ["Instant White-Label PDF", "Institutional Credibility"] },
              ].map(card => (
                <div key={card.title} style={{ background: "white", padding: "2rem", borderRadius: "1.5rem", border: "1px solid #E5E7EB" }}>
                  <div style={{ width: "3rem", height: "3rem", background: "rgba(184,115,51,0.1)", borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.5rem" }}>
                    <Icon name={card.icon} style={{ color: "#B87333" }} />
                  </div>
                  <h4 style={{ fontSize: "1.25rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.03em", marginBottom: "1rem" }}>{card.title}</h4>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <span style={{ fontSize: "0.5625rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", color: "#B3B3B3" }}>Pain Point</span>
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.6, marginTop: "0.25rem" }}>{card.pain}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {card.features.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.6875rem", fontWeight: 700 }}>
                        <Icon name="check" style={{ color: "#B87333", fontSize: "0.875rem" }} /> {f}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMPARE TABLE ── */}
        <section className="compare-section" style={{ padding: "8rem 2rem", background: "white" }}>
          <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
            <div className="compare-heading" style={{ textAlign: "center", marginBottom: "4rem" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase", color: "#B87333", display: "block", marginBottom: "1rem" }}>Detailed Comparison</span>
              <h2 style={{ fontSize: "3.75rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginBottom: "1rem" }}>Compare All Features</h2>
              <p style={{ color: "#B3B3B3", fontWeight: 500, fontSize: "1.125rem" }}>Everything included in each plan — no hidden costs</p>
            </div>
            {/* overflow-x scroll wrapper for mobile */}
            <div className="compare-table-wrap" style={{ overflowX: "auto", borderRadius: "2rem", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", background: "white" }}>
              <table className="compare-table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem", fontWeight: 500 }}>
                <thead>
                  <tr style={{ background: "#1C1C1C", color: "white" }}>
                    <th style={{ padding: "2.5rem 2rem", textAlign: "left", fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", width: "25%" }}>Feature</th>
                    <th style={{ padding: "2.5rem 2rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", width: "25%" }}>Explorer<br /><span style={{ opacity: 0.5, fontWeight: 700 }}>Free</span></th>
                    <th style={{ padding: "2.5rem 2rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", width: "25%", background: "#B87333" }}>
                      Pro<br />
                      <span style={{ opacity: 0.9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
                            <AEDIcon style={{ fontSize: "0.68rem", lineHeight: 1 }} />149/MO

                      </span>
                    </th>
                    <th style={{ padding: "2.5rem 2rem", textAlign: "center", fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.15em", textTransform: "uppercase", width: "25%" }}>
  Elite<br />
  <span style={{ opacity: 0.5, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem" }}>
    <AEDIcon style={{ fontSize: "0.68rem", lineHeight: 1, filter: "grayscale(1)", opacity: 0.5 }} />299/MO
  </span>
</th>
                  </tr>
                </thead>
                <tbody>
                  <TableGroupHeader label="TruValu™ — AI Property Valuation" />
                  <TableRow label="Reports per Month" explorer="3 lifetime" pro="10" elite="29" proHighlight />
                  <TableRow label="Additional Report Price" explorer="—" pro="AED 35" elite="AED 25" proHighlight />
                  <TableRow label="Estimated Market Value" explorer={<Check dim />} pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
                  <TableRow label="Investment Score (0–100)" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
                  <TableRow label="Prices & Trends" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
                  <TableRow label="AI 6-Month Price Forecast" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
                  <TableRow label="AI 3-Year Price Forecast" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
                  <TableRow label="Supply & Demand Chart" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
                  <TableRow label="Recent Sales (DLD transactions)" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
                  <TableRow label="Valuation Confidence Score" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
                  <TableRow label="UAE Transaction Cost Calculator" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
                  <TableRow label="PDF Download" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
                  <TableRow label="DLD Price Cross-Reference" explorer="—" pro="—" elite={<Check />} proHighlight />
                  <TableRow label="Branded PDF Client Export" explorer="—" pro="—" elite={<Check />} proHighlight />

                  <TableGroupHeader label="Signal™ — Real-Time Market Intelligence" />
                  <TableRow label="Real-Time Feed (3-min refresh)" explorer={<span style={{ color: "#B3B3B3", fontStyle: "italic" }}>24hr delay</span>} pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
                  <TableRow label="Areas Covered" explorer={<span style={{ color: "#B3B3B3" }}>Top 5 only</span>} pro={<strong>All</strong>} elite={<strong>All</strong>} proHighlight />
                  <TableRow label="S4/S5 Email Alerts" explorer="—" pro={<Check color="#B87333" />} elite={<Check />} proHighlight />
                  <TableRow label="All Alerts (S1–S5, Push + Email)" explorer="—" pro="—" elite={<Check />} proHighlight />
                  <TableRow label="Portfolio Tracker" explorer="—" pro="5 properties" elite={<strong>Unlimited</strong>} proHighlight />
                  <TableRow label="Market Timing Index (per area)" explorer="—" pro="—" elite={<Check />} proHighlight />
                  <TableRow label="Historical Signal Archive" explorer="—" pro="—" elite={<strong>12 months</strong>} proHighlight />
                  <TableRow label="Weekly Market Digest Email" explorer="—" pro="—" elite={<Check />} proHighlight />

                  <TableGroupHeader label="Platform & Support" />
                  <TableRow label="Team Seats" explorer="—" pro={<strong>1 seat</strong>} elite={<strong>1 seat</strong>} proHighlight />
                  <TableRow label="Support" explorer={<span style={{ color: "#B3B3B3" }}>Community</span>} pro={<strong>Email</strong>} elite={<strong>Priority Email</strong>} proHighlight />
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="faq-section" style={{ padding: "8rem 2rem", maxWidth: "56rem", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "5rem" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 900, letterSpacing: "0.4em", textTransform: "uppercase", color: "#B87333" }}>Transparency</span>
            <h2 style={{ fontSize: "3rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.05em", marginTop: "1rem" }}>Frequently Asked Questions</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <FAQItem question="Where does your data come from?" answer="We aggregate data from official land department records, institutional mortgage filings, and real-time transaction feeds from major broker networks." />
            <FAQItem question="Can I cancel my Pro subscription?" answer="Yes, you can cancel at any time. If you are on an annual plan, your access will continue until the end of your billing cycle." />
            <FAQItem question="Are the reports legally binding?" answer="Our reports are for intelligence and decision support purposes. While highly accurate, formal bank valuations may still be required by certain institutional lenders." />
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="cta-section" style={{ padding: "8rem 2rem", textAlign: "center", background: "#2B2B2B", borderTop: "1px solid rgba(255,255,255,0.05)", overflow: "hidden", position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(#fff 0.5px, transparent 0.5px)", backgroundSize: "24px 24px", opacity: 0.03, pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 10, maxWidth: "56rem", margin: "0 auto" }}>
            <h2 style={{ fontSize: "clamp(2.5rem,7vw,5rem)", fontWeight: 900, letterSpacing: "-0.05em", textTransform: "uppercase", lineHeight: 0.9, marginBottom: "1.5rem", color: "white" }}>
              Ready to Invest<br />With Certainty?
            </h2>
            <p style={{ fontSize: "1.25rem", color: "rgba(255,255,255,0.4)", maxWidth: "42rem", margin: "0 auto 3rem", fontWeight: 500, lineHeight: 1.6 }}>
              Join <span style={{ color: "white" }}>2,400+ investors</span> who use Acqar to see Dubai's market before anyone else — and value any property in 60 seconds.
            </p>
            <div className="cta-buttons" style={{ display: "flex", flexDirection: "row", gap: "1.5rem", justifyContent: "center", alignItems: "center", marginBottom: "2rem" }}>
              <button
                onClick={() => navigate("/signup")}
                style={{ padding: "1.25rem 3rem", background: "linear-gradient(to right, #B87333, #D4956A)", color: "white", borderRadius: "9999px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.6875rem", boxShadow: "0 0 40px rgba(184,115,51,0.3)", border: "none", cursor: "pointer" }}
              >
                Start Free — 3 Reports Included
              </button>
              <button
                onClick={() => navigate("/signup")}
                style={{ padding: "1.25rem 3rem", border: "1px solid rgba(255,255,255,0.3)", color: "white", borderRadius: "9999px", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", fontSize: "0.6875rem", background: "transparent", cursor: "pointer" }}
              >
                View Founding Member Offer
              </button>
            </div>
            <p style={{ fontSize: "0.625rem", fontWeight: 900, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              No card required · Cancel anytime · Built in Dubai
            </p>
          </div>
        </section>
      </main>

      {/* ── FOOTER ── */}
      <Footer />

      {/* ── PAYWALL MODAL ── */}
      {/* {showPaywall && (
        <PaywallModal
          valuationId={null}
          onSuccess={async () => {
            setShowPaywall(false);
            const { data: sess } = await supabase.auth.getSession();
            const user = sess?.session?.user;
            if (user) {
              await supabase
                .from("users")
                .update({
                  plan: "pro",
                  free_reports_limit: 10,
                  free_reports_used: 0,
                  is_founding_member: true,
                })
                .eq("id", user.id);
              // refresh plan state so card shows "Your Current Plan"
              setUserPlan("pro");
              setUserEmail(user.email || "");
            }
          }}
          onClose={() => setShowPaywall(false)}
        />
      )} */}

      {showPaywall && (
  <PaywallModal
    valuationId={null}
    onSuccess={async () => {
      setShowPaywall(false);

      // ✅ Re-fetch session to get the newly created user
      // Small delay to let Supabase auth settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      const { data: sess } = await supabase.auth.getSession();
      const user = sess?.session?.user;

      if (user) {
        // ✅ Update plan in DB
        await supabase
          .from("users")
          .update({
            plan: "pro",
            free_reports_limit: 10,
            free_reports_used: 0,
            is_founding_member: true,
          })
          .eq("id", user.id);

        // ✅ Update local state so pricing card shows "Your Current Plan"
        setUserPlan("pro");
        setUserEmail(user.email || "");

        // ✅ Navigate to dashboard
        navigate("/dashboard");
      } else {
        // No session yet (email confirmation pending) → just go to dashboard
        navigate("/dashboard");
      }
    }}
    onClose={() => setShowPaywall(false)}
  />
)}
    
    </div>
  );
}
