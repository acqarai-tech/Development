// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import "../styles/valucheck.css";

// const LS_FORM_KEY = "truvalu_formData_v1";
// const LS_USER_EMAIL = "truvalu_user_email_v1";
// const LS_RESET_SENT = "truvalu_reset_link_sent_v1";
// const LS_VALUCHECK_DRAFT = "truvalu_valucheck_draft_v1";
// const LS_VAL_ROW_ID = "truvalu_valuation_row_id";

// function safeParse(json) {
//   try {
//     return JSON.parse(json);
//   } catch {
//     return null;
//   }
// }
// function norm(s) {
//   return (s || "").trim().replace(/\s+/g, " ");
// }

// /* ── HEADER ── */
// function Header() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const current = location.pathname;

//   const navItems = [
//     { label: "Products", path: "/" },
//     { label: "Pricing", path: "/pricing" },
//     { label: "Resources", path: "/resources" },
//     { label: "About", path: "/about" },
//   ];

//   return (
//     <>
//       <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#D4D4D4] bg-white">
//         <div className="hdrWrap max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
//           {/* Logo */}
//           <div
//             className="hdrLogo flex items-center cursor-pointer shrink-0 whitespace-nowrap"
//             onClick={() => navigate("/")}
//           >
//             <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-[#2B2B2B] uppercase whitespace-nowrap">
//               ACQAR
//             </h1>
//           </div>

//           {/* Mobile pricing */}
//           <button
//             onClick={() => navigate("/pricing")}
//             className={`md:hidden text-[10px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-full ${
//               current === "/pricing"
//                 ? "text-[#B87333] underline underline-offset-4"
//                 : "text-[#2B2B2B]/70"
//             }`}
//           >
//             Pricing
//           </button>

//           {/* Desktop nav */}
//           <nav className="hidden md:flex items-center gap-10">
//             {navItems.map((item) => (
//               <button
//                 key={item.label}
//                 onClick={() => navigate(item.path)}
//                 className={`text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap ${
//                   current === item.path ? "text-[#B87333]" : "text-[#2B2B2B]"
//                 }`}
//               >
//                 {item.label}
//               </button>
//             ))}
//           </nav>

//           {/* Right buttons */}
//           <div className="hdrRight flex items-center gap-2 sm:gap-4 shrink-0 flex-nowrap">
//             <button
//               onClick={() => navigate("/login")}
//               className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
//             >
//               Sign In
//             </button>

//             <button
//               onClick={() => navigate("/valuation")}
//               className="hidden md:inline-flex hdrCta bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
//             >
//               Get Started
//             </button>
//           </div>
//         </div>

//         <style>{`
//           @media (max-width: 420px){
//             .hdrWrap{
//               padding-left: 10px !important;
//               padding-right: 10px !important;
//               gap: 8px !important;
//             }

//             .hdrLogo h1{
//               font-size: 18px !important;
//               letter-spacing: -0.02em !important;
//             }

//             .hdrPricing{
//               padding: 6px 10px !important;
//               font-size: 9px !important;
//               letter-spacing: 0.16em !important;
//             }

//             .hdrCta{
//               padding: 9px 12px !important;
//               font-size: 10px !important;
//             }
//           }

//           @media (max-width: 360px){
//             .hdrWrap{ gap: 6px !important; }

//             .hdrPricing{
//               padding: 6px 8px !important;
//               letter-spacing: 0.12em !important;
//             }

//             .hdrCta{
//               padding: 8px 10px !important;
//               font-size: 10px !important;
//             }
//           }
//         `}</style>
//       </header>

//       <div className="h-20" />
//     </>
//   );
// }

// /* ── FOOTER ── */
// function Footer() {
//   const cols = [
//     [
//       "PRODUCT",
//       [
//         "TruValu™ Products",
//         "ValuCheck™ (FREE)",
//         "DealLens™",
//         "InvestIQ™",
//         "CertiFi™",
//         "Compare Tiers",
//       ],
//     ],
//     ["COMPANY", ["About ACQAR", "How It Works", "Pricing", "Contact Us", "Partners", "Press Kit"]],
//     ["RESOURCES", ["Help Center", "Market Reports", "Blog Column 5", "Comparisons"]],
//     ["COMPARISONS", ["vs Bayut TruEstimate", "vs Property Finder", "vs Traditional Valuers", "Why ACQAR?"]],
//   ];

//   return (
//     <>
//       <style>{`
//         .acq-footer {
//           background: #F9F9F9;
//           border-top: 1px solid #EBEBEB;
//           padding: 56px 0 0;
//           font-family: 'Inter', sans-serif;
//         }

//         .acq-footer-grid {
//           max-width: 80rem;
//           margin: 0 auto;
//           padding: 0 2rem;
//           display: grid;
//           grid-template-columns: 1.35fr 1fr 1fr 1fr 1fr;
//           gap: 48px;
//           align-items: start;
//           padding-bottom: 48px;
//         }

//         .acq-brand-name {
//           font-size: 1rem;
//           font-weight: 900;
//           letter-spacing: 0.04em;
//           text-transform: uppercase;
//           color: #2B2B2B;
//           display: block;
//           margin-bottom: 14px;
//         }
//         .acq-brand-desc {
//           font-size: 0.75rem;
//           color: rgba(43,43,43,0.58);
//           line-height: 1.75;
//           margin: 0 0 18px;
//           max-width: 240px;
//         }
//         .acq-rics-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 7px;
//           padding: 7px 12px;
//           background: #fff;
//           border: 1px solid #EBEBEB;
//           border-radius: 8px;
//           margin-bottom: 20px;
//         }
//         .acq-rics-badge svg { flex-shrink: 0; color: #2B2B2B; }
//         .acq-rics-badge span {
//           font-size: 0.5625rem;
//           font-weight: 800;
//           color: rgba(43,43,43,0.82);
//           text-transform: uppercase;
//           letter-spacing: 0.08em;
//           white-space: nowrap;
//         }
//         .acq-social-row { display: flex; gap: 10px; }
//         .acq-social-btn {
//           width: 34px; height: 34px;
//           border-radius: 50%;
//           border: 1px solid #E5E7EB;
//           display: flex; align-items: center; justify-content: center;
//           color: rgba(43,43,43,0.38);
//           text-decoration: none;
//           transition: color 0.18s, border-color 0.18s;
//           background: transparent;
//           cursor: pointer;
//         }
//         .acq-social-btn:hover { color: #B87333; border-color: #B87333; }

//         .acq-col-title {
//           font-size: 0.75rem;
//           font-weight: 800;
//           text-transform: uppercase;
//           letter-spacing: 0.16em;
//           color: #2B2B2B;
//           margin: 0 0 20px;
//         }
//         .acq-link-list {
//           list-style: none;
//           padding: 0; margin: 0;
//           display: flex;
//           flex-direction: column;
//           gap: 13px;
//         }
//         .acq-link-item {
//           font-size: 0.8125rem;
//           color: rgba(43,43,43,0.55);
//           font-weight: 400;
//           cursor: pointer;
//           transition: color 0.16s;
//           line-height: 1.4;
//         }
//         .acq-link-item:hover { color: #B87333; }

//         .acq-divider {
//           max-width: 80rem;
//           margin: 0 auto;
//           padding: 0 2rem;
//         }
//         .acq-divider hr {
//           border: none;
//           border-top: 1px solid #E5E7EB;
//           margin: 0;
//         }

//         .acq-footer-bottom {
//           max-width: 80rem;
//           margin: 0 auto;
//           padding: 18px 2rem 28px;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 16px;
//         }
//         .acq-copy p {
//           font-size: 0.5625rem;
//           font-weight: 800;
//           color: rgba(43,43,43,0.38);
//           text-transform: uppercase;
//           letter-spacing: 0.12em;
//           margin: 0 0 3px;
//         }
//         .acq-copy small {
//           font-size: 0.5rem;
//           color: rgba(43,43,43,0.28);
//           text-transform: uppercase;
//           letter-spacing: 0.08em;
//           display: block;
//         }
//         .acq-legal {
//           display: flex;
//           align-items: center;
//           gap: 28px;
//           flex-wrap: wrap;
//           justify-content: flex-end;
//         }
//         .acq-legal a {
//           font-size: 0.5625rem;
//           font-weight: 800;
//           color: rgba(43,43,43,0.38);
//           text-transform: uppercase;
//           letter-spacing: 0.12em;
//           text-decoration: none;
//           white-space: nowrap;
//           transition: color 0.16s;
//         }
//         .acq-legal a:hover { color: #2B2B2B; }

//         @media (max-width: 1024px) {
//           .acq-footer-grid {
//             grid-template-columns: 1fr 1fr 1fr;
//             gap: 32px;
//           }
//           .acq-brand-col { grid-column: 1 / -1; }
//           .acq-brand-desc { max-width: 100%; }
//         }

//         @media (max-width: 640px) {
//           .acq-footer-grid {
//             grid-template-columns: 1fr 1fr;
//             gap: 28px;
//             padding: 0 1rem 40px;
//           }
//           .acq-brand-col { grid-column: 1 / -1; }
//           .acq-footer-bottom {
//             flex-direction: column;
//             align-items: center;
//             text-align: center;
//             gap: 14px;
//             padding: 18px 1rem 28px;
//           }
//           .acq-legal { justify-content: center; gap: 18px; }
//           .acq-divider { padding: 0 1rem; }
//         }

//         @media (max-width: 420px) {
//           .acq-footer-grid { grid-template-columns: 1fr; }
//         }
//       `}</style>

//       <footer className="acq-footer">
//         <div className="acq-footer-grid">
//           <div className="acq-brand-col">
//             <span className="acq-brand-name">ACQAR</span>
//             <p className="acq-brand-desc">
//               The world's first AI-powered property intelligence platform for Dubai real estate.
//               Independent, instant, investment-grade.
//             </p>

//             <div className="acq-rics-badge">
//               <svg
//                 width="14"
//                 height="14"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//                 <polyline points="9 12 11 14 15 10" />
//               </svg>
//               <span>RICS-Aligned Intelligence</span>
//             </div>

//             <div className="acq-social-row">
//               <a
//                 href="https://www.linkedin.com/company/acqar"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="acq-social-btn"
//                 aria-label="LinkedIn"
//               >
//                 <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5S1.1 1 2.48 1c1.38 0 2.5 1.12 2.5 2.5zM0 8h5v16H0V8zm7.5 0h4.8v2.2h.1c.67-1.2 2.3-2.4 4.73-2.4C22.2 7.8 24 10.2 24 14.1V24h-5v-8.5c0-2-.04-4.6-2.8-4.6-2.8 0-3.2 2.2-3.2 4.4V24h-5V8z" />
//                 </svg>
//               </a>
//             </div>
//           </div>

//           {cols.map(([title, items]) => (
//             <div key={title}>
//               <h6 className="acq-col-title">{title}</h6>
//               <ul className="acq-link-list">
//                 {items.map((item) => (
//                   <li key={item} className="acq-link-item">
//                     {item}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>

//         <div className="acq-divider">
//           <hr />
//         </div>

//         <div className="acq-footer-bottom">
//           <div className="acq-copy">
//             <p>© 2025 ACQARLABS L.L.C-FZ. All rights reserved.</p>
//             <small>TruValu™ is a registered trademark.</small>
//           </div>
//           <nav className="acq-legal">
//             {["Legal links", "Terms", "Privacy", "Cookies", "Security"].map((l) => (
//               <a key={l} href="#">
//                 {l}
//               </a>
//             ))}
//           </nav>
//         </div>
//       </footer>
//     </>
//   );
// }

// export default function ValuCheckOtp() {
//   const navigate = useNavigate();

//   const draft = useMemo(() => safeParse(localStorage.getItem(LS_VALUCHECK_DRAFT)) || null, []);
//   const draftEmail = (draft?.email || localStorage.getItem(LS_USER_EMAIL) || "").trim().toLowerCase();

//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState({ type: "", msg: "" });

//   const OTP_LEN = 6;
//   const [digits, setDigits] = useState(Array(OTP_LEN).fill(""));
//   const inputsRef = useRef([]);

//   const [secondsLeft, setSecondsLeft] = useState(120);

//   useEffect(() => {
//     const joined = digits.join("");
//     setOtp(joined);
//   }, [digits]);

//   useEffect(() => {
//     const t = setInterval(() => {
//       setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
//     }, 1000);
//     return () => clearInterval(t);
//   }, []);

//   function mmss(sec) {
//     const m = Math.floor(sec / 60);
//     const s = sec % 60;
//     return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
//   }

//   function focusIndex(i) {
//     const el = inputsRef.current?.[i];
//     if (el) el.focus();
//   }

//   function handleDigitChange(i, v) {
//     const val = (v || "").replace(/\D/g, "");

//     if (val.length > 1) {
//       const chars = val.slice(0, OTP_LEN).split("");
//       const next = Array(OTP_LEN).fill("");
//       for (let k = 0; k < chars.length; k++) next[k] = chars[k] || "";
//       setDigits(next);
//       focusIndex(Math.min(chars.length, OTP_LEN - 1));
//       return;
//     }

//     const next = [...digits];
//     next[i] = val.slice(0, 1);
//     setDigits(next);

//     if (val && i < OTP_LEN - 1) focusIndex(i + 1);
//   }

//   function handleKeyDown(i, e) {
//     if (e.key === "Backspace") {
//       if (digits[i]) {
//         const next = [...digits];
//         next[i] = "";
//         setDigits(next);
//         return;
//       }
//       if (i > 0) {
//         focusIndex(i - 1);
//         const next = [...digits];
//         next[i - 1] = "";
//         setDigits(next);
//       }
//     }
//     if (e.key === "ArrowLeft" && i > 0) focusIndex(i - 1);
//     if (e.key === "ArrowRight" && i < OTP_LEN - 1) focusIndex(i + 1);
//   }

//   async function insertValuationAfterOtp(authUserId, userName) {
//     const formData = safeParse(localStorage.getItem(LS_FORM_KEY)) || {};
//     const computedSqm = Number(formData?.procedure_area || 0) || null;

//     const row = {
//       user_id: authUserId,
//       name: norm(userName || ""),

//       district: norm(formData?.district_name || formData?.area_name_en || ""),
//       property_name: norm(
//         formData?.property_name ||
//           formData?.project_reference ||
//           formData?.project_name_en ||
//           ""
//       ),
//       building_name: norm(formData?.building_name || formData?.building_name_en || ""),
//       title_deed_no: norm(formData?.title_deed_no || ""),
//       title_deed_type: norm(formData?.title_deed_type || ""),
//       plot_no: norm(formData?.plot_no || ""),

//       valuation_type: norm(formData?.valuation_type || ""),
//       valuation_type_selection: norm(formData?.valuation_type || ""),
//       property_category: norm(formData?.property_category || ""),
//       purpose_of_valuation: norm(formData?.purpose_of_valuation || ""),
//       property_current_status: norm(formData?.property_status || ""),

//       apartment_no: norm(formData?.apartment_no || ""),
//       apartment_size: computedSqm,
//       apartment_size_unit: norm(formData?.area_unit || ""),
//       last_renovated_on: formData?.last_renovated_on || null,
//       floor_level: norm(formData?.floor_level || ""),

//       furnishing_type: norm(formData?.furnishing || ""),
//       bedroom: norm(String(formData?.bedrooms || "")),
//       bathroom: norm(String(formData?.bathrooms || "")),
//       property_type: norm(formData?.property_type_en || ""),
//       unit: norm(formData?.property_name_unit || ""),
//       features: Array.isArray(formData?.amenities) ? formData.amenities : [],

//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//     };

//     const { data, error } = await supabase.from("valuations").insert([row]).select("id").single();
//     if (error) throw error;

//     localStorage.setItem(LS_VAL_ROW_ID, data.id);
//   }

//   async function verifyOtpAndSave() {
//     setStatus({ type: "", msg: "" });

//     const code = (otp || "").trim();
//     if (!draftEmail) {
//       setStatus({ type: "error", msg: "Email missing. Please go back and enter your details again." });
//       return;
//     }
//     if (!code) {
//       setStatus({ type: "error", msg: "Please enter the OTP code." });
//       return;
//     }

//     setLoading(true);
//     try {
//       const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
//         email: draftEmail,
//         token: code,
//         type: "email",
//       });
//       if (verifyErr) throw verifyErr;

//       const authUserId = verifyData?.user?.id || null;
//       if (!authUserId) throw new Error("Could not read authenticated user id.");

//       const { data: sessionData } = await supabase.auth.getSession();
//       if (!sessionData?.session) throw new Error("Session not created. Please try OTP again.");

//       const payload = {
//         id: authUserId,
//         role: draft?.role || null,
//         name: (draft?.name || "").trim() || null,
//         email: draftEmail,
//         phone: draft?.phone || null,
//       };

//       const { error: upErr } = await supabase.from("users").upsert(payload, { onConflict: "id" });
//       if (upErr) throw upErr;

//       await insertValuationAfterOtp(authUserId, payload.name || "");

//       setStatus({ type: "success", msg: "Verified! Generating your report..." });
//       setOtp("");
//       setDigits(Array(OTP_LEN).fill(""));

//       localStorage.setItem(LS_USER_EMAIL, draftEmail);
//       localStorage.removeItem(LS_RESET_SENT);

//       navigate("/report");
//     } catch (ex) {
//       setStatus({
//         type: "error",
//         msg: ex?.message || "OTP verification or saving failed. Check RLS policy for users/valuations.",
//       });
//       console.error("OTP verify/save error:", ex);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function resendOtp() {
//     setStatus({ type: "", msg: "" });

//     if (!draftEmail) {
//       setStatus({ type: "error", msg: "Email missing. Please go back and enter your details again." });
//       return;
//     }

//     setLoading(true);
//     try {
//       const { error } = await supabase.auth.signInWithOtp({
//         email: draftEmail,
//         options: { shouldCreateUser: true },
//       });
//       if (error) throw error;

//       setStatus({ type: "success", msg: "OTP resent to your email." });
//       setSecondsLeft(120);

//       setDigits(Array(OTP_LEN).fill(""));
//       focusIndex(0);
//     } catch (ex) {
//       setStatus({ type: "error", msg: ex?.message || "Could not resend OTP. Please try again." });
//     } finally {
//       setLoading(false);
//     }
//   }

//   function changeEmail() {
//     navigate("/valucheck");
//   }

//   const UI = {
//     BTN: "#b45309",
//     BTN_DARK: "#92400e",
//     BG: "#f7f7f7",
//     CARD: "#ffffff",
//     TEXT: "#111827",
//     MUTED: "#6b7280",
//     BORDER: "#e5e7eb",
//     SOFT: "#f3f4f6",
//   };

//   const R = {
//     pagePadX: "clamp(12px, 3.5vw, 18px)",
//     pagePadY: "clamp(24px, 6vw, 34px)",
//     cardPad: "clamp(18px, 4vw, 28px) clamp(16px, 4vw, 26px)",
//     cardRadius: "clamp(14px, 3vw, 16px)",
//     h1: "clamp(20px, 4.8vw, 26px)",
//     p: "clamp(12px, 2.6vw, 13px)",
//     otpGap: "clamp(6px, 2vw, 10px)",
//     otpW: "clamp(38px, 10vw, 46px)",
//     otpH: "clamp(46px, 12vw, 52px)",
//     otpFs: "clamp(16px, 4vw, 18px)",
//     btnH: "clamp(44px, 10.5vw, 48px)",
//     btnPadX: "clamp(12px, 3.2vw, 14px)",
//   };

//   return (
//     <div style={{ minHeight: "100vh", background: UI.BG }}>
//       {/* ✅ ONLY CHANGED: header */}
//       <Header />

//       <div
//         style={{
//           minHeight: "calc(100vh - 80px)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           padding: `${R.pagePadY} ${R.pagePadX}`,
//           boxSizing: "border-box",
//         }}
//       >
//         <div
//           style={{
//             width: "100%",
//             maxWidth: 520,
//             background: UI.CARD,
//             borderRadius: R.cardRadius,
//             border: `1px solid ${UI.BORDER}`,
//             boxShadow: "0 18px 50px rgba(0,0,0,0.06)",
//             padding: R.cardPad,
//             textAlign: "center",
//           }}
//         >
//           <div
//             style={{
//               width: "clamp(48px, 12vw, 56px)",
//               height: "clamp(48px, 12vw, 56px)",
//               margin: "0 auto 12px",
//               borderRadius: "clamp(12px, 3vw, 14px)",
//               background: UI.SOFT,
//               display: "grid",
//               placeItems: "center",
//             }}
//           >
//             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//               <path
//                 d="M4 6.5C4 5.12 5.12 4 6.5 4h11C18.88 4 20 5.12 20 6.5v11c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 20 4 18.88 4 17.5v-11Z"
//                 stroke={UI.MUTED}
//                 strokeWidth="1.6"
//               />
//               <path
//                 d="M6.5 7.5 12 12l5.5-4.5"
//                 stroke={UI.MUTED}
//                 strokeWidth="1.6"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           </div>

//           <h1 style={{ margin: "0 0 6px", fontSize: R.h1, fontWeight: 900, color: UI.TEXT }}>
//             Enter OTP Code
//           </h1>
//           <p style={{ margin: 0, fontSize: R.p, color: UI.MUTED, lineHeight: 1.6 }}>
//             We sent a verification code to{" "}
//             <b style={{ color: UI.TEXT, wordBreak: "break-word" }}>{draftEmail || "your email"}</b>
//           </p>

//           <div
//             style={{
//               marginTop: 22,
//               display: "flex",
//               gap: R.otpGap,
//               justifyContent: "center",
//               flexWrap: "wrap",
//               maxWidth: 360,
//               marginInline: "auto",
//             }}
//           >
//             {digits.map((d, i) => (
//               <input
//                 key={i}
//                 ref={(el) => (inputsRef.current[i] = el)}
//                 value={d}
//                 onChange={(e) => handleDigitChange(i, e.target.value)}
//                 onKeyDown={(e) => handleKeyDown(i, e)}
//                 inputMode="numeric"
//                 autoComplete={i === 0 ? "one-time-code" : "off"}
//                 disabled={loading}
//                 style={{
//                   width: R.otpW,
//                   height: R.otpH,
//                   borderRadius: 10,
//                   border: `1px solid ${UI.BORDER}`,
//                   background: "#fff",
//                   textAlign: "center",
//                   fontSize: R.otpFs,
//                   fontWeight: 900,
//                   color: UI.TEXT,
//                   outline: "none",
//                   boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
//                 }}
//                 aria-label={`OTP digit ${i + 1}`}
//               />
//             ))}
//           </div>

//           <div
//             style={{
//               marginTop: 14,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: 8,
//               fontSize: "clamp(11px, 2.6vw, 12px)",
//               color: UI.MUTED,
//               fontWeight: 700,
//               flexWrap: "wrap",
//             }}
//           >
//             <span
//               style={{
//                 width: 16,
//                 height: 16,
//                 borderRadius: 999,
//                 background: UI.SOFT,
//                 display: "grid",
//                 placeItems: "center",
//               }}
//               aria-hidden="true"
//             >
//               <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
//                 <path
//                   d="M12 8v5l3 2"
//                   stroke={UI.MUTED}
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//                 <circle cx="12" cy="12" r="9" stroke={UI.MUTED} strokeWidth="2" />
//               </svg>
//             </span>
//             <span>Code expires in</span>
//             <span style={{ color: UI.BTN, fontWeight: 900 }}>{mmss(secondsLeft)}</span>
//           </div>

//           {status.msg ? (
//             <div
//               style={{
//                 marginTop: 14,
//                 padding: "10px 12px",
//                 borderRadius: 12,
//                 fontWeight: 800,
//                 fontSize: "clamp(12px, 2.8vw, 13px)",
//                 border: status.type === "error" ? "1px solid #fecdd3" : "1px solid #bbf7d0",
//                 background: status.type === "error" ? "#fff1f2" : "#ecfdf5",
//                 color: status.type === "error" ? "#9f1239" : "#166534",
//                 wordBreak: "break-word",
//               }}
//             >
//               {status.msg}
//             </div>
//           ) : null}

//           <button
//             type="button"
//             onClick={verifyOtpAndSave}
//             disabled={loading}
//             style={{
//               width: "100%",
//               marginTop: 18,
//               height: R.btnH,
//               borderRadius: 10,
//               border: "none",
//               background: UI.BTN,
//               color: "#fff",
//               fontWeight: 900,
//               cursor: loading ? "not-allowed" : "pointer",
//               boxShadow: "0 14px 28px rgba(180,83,9,0.22)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: 10,
//               opacity: loading ? 0.75 : 1,
//             }}
//           >
//             <span>{loading ? "Please wait..." : "Verify OTP & Get Report"}</span>
//             <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
//           </button>

//           <div
//             style={{
//               marginTop: 14,
//               fontSize: "clamp(11px, 2.6vw, 12px)",
//               color: UI.MUTED,
//               fontWeight: 700,
//             }}
//           >
//             Didn&apos;t receive the code?{" "}
//             <button
//               type="button"
//               onClick={resendOtp}
//               disabled={loading}
//               style={{
//                 border: "none",
//                 background: "transparent",
//                 color: UI.BTN,
//                 fontWeight: 900,
//                 cursor: loading ? "not-allowed" : "pointer",
//                 padding: 0,
//               }}
//             >
//               Resend
//             </button>
//           </div>

//           <div style={{ marginTop: 10 }}>
//             <button
//               type="button"
//               onClick={changeEmail}
//               disabled={loading}
//               style={{
//                 border: "none",
//                 background: "transparent",
//                 color: UI.TEXT,
//                 fontWeight: 800,
//                 fontSize: "clamp(11px, 2.6vw, 12px)",
//                 cursor: loading ? "not-allowed" : "pointer",
//                 opacity: 0.7,
//               }}
//             >
//               Change Email
//             </button>
//           </div>

//           <div
//             style={{
//               marginTop: 16,
//               display: "inline-flex",
//               alignItems: "center",
//               gap: 8,
//               borderRadius: 999,
//               padding: "7px 12px",
//               background: "#f0fdf4",
//               border: "1px solid #bbf7d0",
//               color: "#166534",
//               fontWeight: 900,
//               fontSize: 10,
//               letterSpacing: 1.2,
//               textTransform: "uppercase",
//               maxWidth: "100%",
//             }}
//           >
//             <span
//               style={{
//                 width: 18,
//                 height: 18,
//                 borderRadius: 999,
//                 background: "#22c55e",
//                 display: "grid",
//                 placeItems: "center",
//                 color: "#fff",
//                 fontSize: 12,
//                 flex: "0 0 auto",
//               }}
//               aria-hidden="true"
//             >
//               🔒
//             </span>
//             <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
//               Secure Encryption Enabled
//             </span>
//           </div>
//         </div>
//       </div>

//       {/* ✅ ONLY CHANGED: footer */}
//       <Footer />
//     </div>
//   );
// }


import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/valucheck.css";

const LS_FORM_KEY = "truvalu_formData_v1";
const LS_USER_EMAIL = "truvalu_user_email_v1";
const LS_RESET_SENT = "truvalu_reset_link_sent_v1";
const LS_VALUCHECK_DRAFT = "truvalu_valucheck_draft_v1";
const LS_VAL_ROW_ID = "truvalu_valuation_row_id";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function norm(s) {
  return (s || "").trim().replace(/\s+/g, " ");
}

export default function ValuCheckOtp() {
  const navigate = useNavigate();

  const draft = useMemo(() => safeParse(localStorage.getItem(LS_VALUCHECK_DRAFT)) || null, []);
  const draftEmail = (draft?.email || localStorage.getItem(LS_USER_EMAIL) || "")
    .trim()
    .toLowerCase();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const OTP_LEN = 6;
  const [digits, setDigits] = useState(Array(OTP_LEN).fill(""));
  const inputsRef = useRef([]);

  const [secondsLeft, setSecondsLeft] = useState(120);

  useEffect(() => {
    const joined = digits.join("");
    setOtp(joined);
  }, [digits]);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  function mmss(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function focusIndex(i) {
    const el = inputsRef.current?.[i];
    if (el) el.focus();
  }

  function handleDigitChange(i, v) {
    const val = (v || "").replace(/\D/g, "");

    if (val.length > 1) {
      const chars = val.slice(0, OTP_LEN).split("");
      const next = Array(OTP_LEN).fill("");
      for (let k = 0; k < chars.length; k++) next[k] = chars[k] || "";
      setDigits(next);
      focusIndex(Math.min(chars.length, OTP_LEN - 1));
      return;
    }

    const next = [...digits];
    next[i] = val.slice(0, 1);
    setDigits(next);

    if (val && i < OTP_LEN - 1) focusIndex(i + 1);
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = [...digits];
        next[i] = "";
        setDigits(next);
        return;
      }
      if (i > 0) {
        focusIndex(i - 1);
        const next = [...digits];
        next[i - 1] = "";
        setDigits(next);
      }
    }
    if (e.key === "ArrowLeft" && i > 0) focusIndex(i - 1);
    if (e.key === "ArrowRight" && i < OTP_LEN - 1) focusIndex(i + 1);
  }

  async function insertValuationAfterOtp(authUserId, userName) {
    const formData = safeParse(localStorage.getItem(LS_FORM_KEY)) || {};
    const computedSqm = Number(formData?.procedure_area || 0) || null;

    const row = {
      user_id: authUserId,
      name: norm(userName || ""),

      district: norm(formData?.district_name || formData?.area_name_en || ""),
      property_name: norm(
        formData?.property_name ||
          formData?.project_reference ||
          formData?.project_name_en ||
          ""
      ),
      building_name: norm(formData?.building_name || formData?.building_name_en || ""),
      title_deed_no: norm(formData?.title_deed_no || ""),
      title_deed_type: norm(formData?.title_deed_type || ""),
      plot_no: norm(formData?.plot_no || ""),

      valuation_type: norm(formData?.valuation_type || ""),
      valuation_type_selection: norm(formData?.valuation_type || ""),
      property_category: norm(formData?.property_category || ""),
      purpose_of_valuation: norm(formData?.purpose_of_valuation || ""),
      property_current_status: norm(formData?.property_status || ""),

      apartment_no: norm(formData?.apartment_no || ""),
      apartment_size: computedSqm,
      apartment_size_unit: norm(formData?.area_unit || ""),
      last_renovated_on: formData?.last_renovated_on || null,
      floor_level: norm(formData?.floor_level || ""),

      furnishing_type: norm(formData?.furnishing || ""),
      bedroom: norm(String(formData?.bedrooms || "")),
      bathroom: norm(String(formData?.bathrooms || "")),
      property_type: norm(formData?.property_type_en || ""),
      unit: norm(formData?.property_name_unit || ""),
      features: Array.isArray(formData?.amenities) ? formData.amenities : [],

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from("valuations").insert([row]).select("id").single();
    if (error) throw error;

    localStorage.setItem(LS_VAL_ROW_ID, data.id);
  }

  async function verifyOtpAndSave() {
    setStatus({ type: "", msg: "" });

    const code = (otp || "").trim();
    if (!draftEmail) {
      setStatus({
        type: "error",
        msg: "Email missing. Please go back and enter your details again.",
      });
      return;
    }
    if (!code) {
      setStatus({ type: "error", msg: "Please enter the OTP code." });
      return;
    }

    setLoading(true);
    try {
      const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
        email: draftEmail,
        token: code,
        type: "email",
      });
      if (verifyErr) throw verifyErr;

      const authUserId = verifyData?.user?.id || null;
      if (!authUserId) throw new Error("Could not read authenticated user id.");

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) throw new Error("Session not created. Please try OTP again.");

      const payload = {
        id: authUserId,
        role: draft?.role || null,
        name: (draft?.name || "").trim() || null,
        email: draftEmail,
        phone: draft?.phone || null,
      };

      const { error: upErr } = await supabase.from("users").upsert(payload, { onConflict: "id" });
      if (upErr) throw upErr;

      await insertValuationAfterOtp(authUserId, payload.name || "");

      setStatus({ type: "success", msg: "Verified! Generating your report..." });
      setOtp("");
      setDigits(Array(OTP_LEN).fill(""));

      localStorage.setItem(LS_USER_EMAIL, draftEmail);
      localStorage.removeItem(LS_RESET_SENT);

      navigate("/report");
    } catch (ex) {
      setStatus({
        type: "error",
        msg:
          ex?.message ||
          "OTP verification or saving failed. Check RLS policy for users/valuations.",
      });
      console.error("OTP verify/save error:", ex);
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setStatus({ type: "", msg: "" });

    if (!draftEmail) {
      setStatus({
        type: "error",
        msg: "Email missing. Please go back and enter your details again.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: draftEmail,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;

      setStatus({ type: "success", msg: "OTP resent to your email." });
      setSecondsLeft(120);

      setDigits(Array(OTP_LEN).fill(""));
      focusIndex(0);
    } catch (ex) {
      setStatus({ type: "error", msg: ex?.message || "Could not resend OTP. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  function changeEmail() {
    navigate("/valucheck");
  }

  const UI = {
    BTN: "#b45309",
    BTN_DARK: "#92400e",
    BG: "#f7f7f7",
    CARD: "#ffffff",
    TEXT: "#111827",
    MUTED: "#6b7280",
    BORDER: "#e5e7eb",
    SOFT: "#f3f4f6",
  };

  const R = {
    pagePadX: "clamp(12px, 3.5vw, 18px)",
    pagePadY: "clamp(24px, 6vw, 34px)",
    cardPad: "clamp(18px, 4vw, 28px) clamp(16px, 4vw, 26px)",
    cardRadius: "clamp(14px, 3vw, 16px)",
    h1: "clamp(20px, 4.8vw, 26px)",
    p: "clamp(12px, 2.6vw, 13px)",
    otpGap: "clamp(6px, 2vw, 10px)",
    otpW: "clamp(38px, 10vw, 46px)",
    otpH: "clamp(46px, 12vw, 52px)",
    otpFs: "clamp(16px, 4vw, 18px)",
    btnH: "clamp(44px, 10.5vw, 48px)",
    btnPadX: "clamp(12px, 3.2vw, 14px)",
  };

  return (
    <div style={{ minHeight: "100vh", background: UI.BG }}>
      {/* ✅ Header removed */}

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `${R.pagePadY} ${R.pagePadX}`,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            background: UI.CARD,
            borderRadius: R.cardRadius,
            border: `1px solid ${UI.BORDER}`,
            boxShadow: "0 18px 50px rgba(0,0,0,0.06)",
            padding: R.cardPad,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "clamp(48px, 12vw, 56px)",
              height: "clamp(48px, 12vw, 56px)",
              margin: "0 auto 12px",
              borderRadius: "clamp(12px, 3vw, 14px)",
              background: UI.SOFT,
              display: "grid",
              placeItems: "center",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 6.5C4 5.12 5.12 4 6.5 4h11C18.88 4 20 5.12 20 6.5v11c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 20 4 18.88 4 17.5v-11Z"
                stroke={UI.MUTED}
                strokeWidth="1.6"
              />
              <path
                d="M6.5 7.5 12 12l5.5-4.5"
                stroke={UI.MUTED}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 style={{ margin: "0 0 6px", fontSize: R.h1, fontWeight: 900, color: UI.TEXT }}>
            Enter OTP Code
          </h1>
          <p style={{ margin: 0, fontSize: R.p, color: UI.MUTED, lineHeight: 1.6 }}>
            We sent a verification code to{" "}
            <b style={{ color: UI.TEXT, wordBreak: "break-word" }}>{draftEmail || "your email"}</b>
          </p>

          <div
            style={{
              marginTop: 22,
              display: "flex",
              gap: R.otpGap,
              justifyContent: "center",
              flexWrap: "wrap",
              maxWidth: 360,
              marginInline: "auto",
            }}
          >
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                disabled={loading}
                style={{
                  width: R.otpW,
                  height: R.otpH,
                  borderRadius: 10,
                  border: `1px solid ${UI.BORDER}`,
                  background: "#fff",
                  textAlign: "center",
                  fontSize: R.otpFs,
                  fontWeight: 900,
                  color: UI.TEXT,
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>

          <div
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: "clamp(11px, 2.6vw, 12px)",
              color: UI.MUTED,
              fontWeight: 700,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                background: UI.SOFT,
                display: "grid",
                placeItems: "center",
              }}
              aria-hidden="true"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8v5l3 2"
                  stroke={UI.MUTED}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="9" stroke={UI.MUTED} strokeWidth="2" />
              </svg>
            </span>
            <span>Code expires in</span>
            <span style={{ color: UI.BTN, fontWeight: 900 }}>{mmss(secondsLeft)}</span>
          </div>

          {status.msg ? (
            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: "clamp(12px, 2.8vw, 13px)",
                border: status.type === "error" ? "1px solid #fecdd3" : "1px solid #bbf7d0",
                background: status.type === "error" ? "#fff1f2" : "#ecfdf5",
                color: status.type === "error" ? "#9f1239" : "#166534",
                wordBreak: "break-word",
              }}
            >
              {status.msg}
            </div>
          ) : null}

          <button
            type="button"
            onClick={verifyOtpAndSave}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 18,
              height: R.btnH,
              borderRadius: 10,
              border: "none",
              background: UI.BTN,
              color: "#fff",
              fontWeight: 900,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 14px 28px rgba(180,83,9,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              opacity: loading ? 0.75 : 1,
            }}
          >
            <span>{loading ? "Please wait..." : "Verify OTP & Get Report"}</span>
            <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
          </button>

          <div
            style={{
              marginTop: 14,
              fontSize: "clamp(11px, 2.6vw, 12px)",
              color: UI.MUTED,
              fontWeight: 700,
            }}
          >
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={resendOtp}
              disabled={loading}
              style={{
                border: "none",
                background: "transparent",
                color: UI.BTN,
                fontWeight: 900,
                cursor: loading ? "not-allowed" : "pointer",
                padding: 0,
              }}
            >
              Resend
            </button>
          </div>

          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={changeEmail}
              disabled={loading}
              style={{
                border: "none",
                background: "transparent",
                color: UI.TEXT,
                fontWeight: 800,
                fontSize: "clamp(11px, 2.6vw, 12px)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: 0.7,
              }}
            >
              Change Email
            </button>
          </div>

          <div
            style={{
              marginTop: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 999,
              padding: "7px 12px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              fontWeight: 900,
              fontSize: 10,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              maxWidth: "100%",
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: "#22c55e",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontSize: 12,
                flex: "0 0 auto",
              }}
              aria-hidden="true"
            >
              🔒
            </span>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Secure Encryption Enabled
            </span>
          </div>
        </div>
      </div>

      {/* ✅ Footer removed */}
    </div>
  );
}
