// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import { useLogout } from "../hooks/useLogout";

// /* ── FOOTER COMPONENT ── */
// /* ── FOOTER ── */
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
//                 The world's first AI-powered property intelligence platform for Dubai real estate. Independent, instant, investment-grade.
//               </p>
//               <div className="rics-badge">
//                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
//                   <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M9 12l2 2 4-4" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//                 <span>RICS-Aligned Intelligence</span>
//               </div>
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
//                   <a href="http://www.acqar.com/" target="_blank" rel="noopener noreferrer">
//                     TruValu™
//                   </a>
//                 </li>
//                 <li>
//                   <a href="https://signal.acqar.com/" target="_blank" rel="noopener noreferrer">
//                     ACQAR Signal™
//                   </a>
//                 </li>
//                 <li className="muted">ACQAR Passport™</li>
//                 {/* <li onClick={() => navigate('/pricing')}>Pricing Tiers</li> */}
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
//                   {['About ACQAR', 'How It Works', 'Contact Us', 'Partners'].map(l => (
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
// export default function UserDashboard() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [profile, setProfile] = useState(null);
//   const [valuations, setValuations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [msg, setMsg] = useState("");
//   const [showAllValuations, setShowAllValuations] = useState(false);
//   const [activeFilter, setActiveFilter] = useState("ALL");
//  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);

// useEffect(() => {
//   const onResize = () => setIsMobile(window.innerWidth <= 640);
//   window.addEventListener("resize", onResize);
//   return () => window.removeEventListener("resize", onResize);
// }, []);



//   // dropdown state
//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuWrapRef = useRef(null);

//   const nameToShow = useMemo(() => {
//     const n = (profile?.name || "").trim();
//     if (n) return n;
//     const em = (profile?.email || "").split("@")[0] || "User";
//     return em.charAt(0).toUpperCase() + em.slice(1);
//   }, [profile]);

//   const initials = useMemo(() => {
//     const parts = (nameToShow || "").trim().split(/\s+/).filter(Boolean);
//     const a = (parts[0] || "A")[0] || "A";
//     const b = (parts[1] || parts[0] || "M")[0] || "M";
//     return (a + b).toUpperCase();
//   }, [nameToShow]);

//   function fmtAED(n) {
//     const x = Number(n);
//     if (!Number.isFinite(x) || x <= 0) return "—";
//     if (x >= 1_000_000) return `AED ${(x / 1_000_000).toFixed(1)}M`;
//     return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
//   }

//   function fmtAEDFull(n) {
//     const x = Number(n);
//     if (!Number.isFinite(x) || x <= 0) return "—";
//     return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
//   }

//   function fmtDate(iso) {
//     if (!iso) return "";
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return "";
//     const now = new Date();
//     const diff = now - d;
//     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
//     if (days === 0) return "TODAY";
//     if (days === 1) return "1 DAY AGO";
//     if (days < 30) return `${days} DAYS AGO`;
    
//     return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
//   }

//   const selectedPassportId = useMemo(() => {
//     return valuations?.length ? valuations[0].id : null;
//   }, [valuations]);

//   useEffect(() => {
//     let mounted = true;

//     async function load() {
//       try {
//         setLoading(true);
//         setMsg("");

//         const { data, error: userErr } = await supabase.auth.getUser();
//         if (userErr) throw userErr;

//         const user = data?.user;
//         if (!user?.id) {
//           navigate("/login");
//           return;
//         }

//         const authId = user.id;
//         const authEmail = (user.email || "").toLowerCase();

//         const metaName = (
//           user.user_metadata?.name ||
//           user.user_metadata?.full_name ||
//           user.user_metadata?.display_name ||
//           ""
//         ).trim();

//         let { data: uRow, error: byIdErr } = await supabase
//           .from("users")
//           .select("id, role, name, email, phone, created_at")
//           .eq("id", authId)
//           .maybeSingle();

//         if (byIdErr) console.warn("users select by id:", byIdErr.message);

//         if (!uRow && authEmail) {
//           const { data: emailRow, error: byEmailErr } = await supabase
//             .from("users")
//             .select("id, role, name, email, phone, created_at")
//             .eq("email", authEmail)
//             .maybeSingle();

//           if (byEmailErr) console.warn("users select by email:", byEmailErr.message);

//           if (emailRow?.id && emailRow.id !== authId) {
//             const payload = {
//               id: authId,
//               email: authEmail,
//               role: emailRow.role || null,
//               name: (emailRow.name || metaName || "").trim() || null,
//               phone: emailRow.phone || null,
//             };

//             const { error: migrateUpsertErr } = await supabase
//               .from("users")
//               .upsert(payload, { onConflict: "id" });

//             if (migrateUpsertErr) {
//               console.warn("users migrate upsert:", migrateUpsertErr.message);
//             } else {
//               const { error: delErr } = await supabase.from("users").delete().eq("id", emailRow.id);
//               if (delErr) console.warn("users delete old row:", delErr.message);

//               const { data: after, error: afterErr } = await supabase
//                 .from("users")
//                 .select("id, role, name, email, phone, created_at")
//                 .eq("id", authId)
//                 .maybeSingle();

//               if (afterErr) console.warn("users select after migrate:", afterErr.message);
//               uRow = after || null;
//             }
//           } else {
//             uRow = emailRow || null;
//           }
//         }

//         if (!uRow) {
//           const payload = { id: authId, email: authEmail, name: metaName || null };

//           const { error: createErr } = await supabase.from("users").upsert(payload, {
//             onConflict: "id",
//           });
//           if (createErr) console.warn("users create upsert:", createErr.message);

//           const { data: createdRow, error: createdSelErr } = await supabase
//             .from("users")
//             .select("id, role, name, email, phone, created_at")
//             .eq("id", authId)
//             .maybeSingle();

//           if (createdSelErr) console.warn("users select created:", createdSelErr.message);
//           uRow = createdRow || null;
//         }

//         if (uRow && !(uRow.name || "").trim() && metaName) {
//           const { data: updated, error: updErr } = await supabase
//             .from("users")
//             .update({ name: metaName })
//             .eq("id", authId)
//             .select("id, role, name, email, phone, created_at")
//             .maybeSingle();

//           if (updErr) console.warn("users update name:", updErr.message);
//           else uRow = updated || uRow;
//         }

//         if (!mounted) return;

//         setProfile(
//           uRow || { id: authId, name: metaName || null, email: authEmail || null, phone: null, created_at: null }
//         );

//        const { data: vRows, error: vErr } = await supabase
//   .from("valuations")
//   .select("id, property_name, building_name, district, created_at, estimated_valuation, form_payload")
//   .eq("user_id", authId)
//   .order("created_at", { ascending: false })
//   .limit(12);

//         if (!mounted) return;

//         if (vErr) {
//           console.warn("valuations select:", vErr.message);
//           setValuations([]);
//         } else {
//           setValuations(vRows || []);
//         }
//       } catch (e) {
//         if (!mounted) return;
//         setMsg(e?.message || "Failed to load dashboard.");
//       } finally {
//         if (!mounted) return;
//         setLoading(false);
//       }
//     }

//     load();
//     return () => {
//       mounted = false;
//     };
//   }, [navigate]);

//   // close dropdown on outside click / ESC
//   useEffect(() => {
//     function onDown(e) {
//       if (e.key === "Escape") setMenuOpen(false);
//     }
//     function onClick(e) {
//       const el = menuWrapRef.current;
//       if (!el) return;
//       if (!el.contains(e.target)) setMenuOpen(false);
//     }
//     window.addEventListener("keydown", onDown);
//     window.addEventListener("mousedown", onClick);
//     return () => {
//       window.removeEventListener("keydown", onDown);
//       window.removeEventListener("mousedown", onClick);
//     };
//   }, []);

//    const handleLogout = useLogout();

//   const totalPortfolio = useMemo(() => {
//     const sum = valuations.reduce((acc, r) => acc + (Number(r.estimated_valuation) || 0), 0);
//     return sum || 0;
//   }, [valuations]);

//   const reportCards = useMemo(() => {
//     if (!valuations?.length) return [];
//     return valuations.map((v) => {
//       const property = (v.property_name || "").trim();
//       const building = (v.building_name || "").trim();
//       const district = (v.district || "").trim();

//       const title = property || building || "Property";
//       const unitInfo = building && building !== title ? building : "";

//       return {
//         id: v.id,
//         title,
//         unitInfo,
//         district,
//         date: fmtDate(v.created_at),
//         value: Number(v.estimated_valuation) || 0,
//         score: Math.floor(Math.random() * 30) + 70,
//         bedrooms: v.form_payload?.bedrooms ?? v.form_payload?.rooms_en ?? null,
// bathrooms: v.form_payload?.bathrooms ?? v.form_payload?.bathrooms_en ?? null,
// sizeSqft: v.form_payload?.procedure_area ? Math.round(Number(v.form_payload.procedure_area) * 10.764) : null,
// badge: "VALUCHECK™",
//       };
//     });
//   }, [valuations]);

//   function goPassportFromDashboard() {
//     const id = selectedPassportId;
//     if (!id) {
//       setMsg("No valuations found yet. Create a valuation first.");
//       return;
//     }
//     navigate(`/passport?id=${id}`);
//   }

//   const UI_CSS = `
//     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

//     * { margin: 0; padding: 0; box-sizing: border-box; }
//     body {
//       font-family: 'Inter', sans-serif;
//       background: #FAFAFA;
//       color: #1a1a1a;
//     }

//     /* TOP NAV */
//     .topNav {
//       position: fixed;
//       top: 0; left: 0; right: 0;
//       height: 58px;
//       background: #FFFFFF;
//       border-bottom: 1px solid #EAEAEA;
//       z-index: 100;
//       display: flex;
//       align-items: center;
//       justify-content: space-between;
//       padding: 0 28px;
//     }

//     .navLeft {
//       display: flex;
//       align-items: center;
//       gap: 44px;
//       min-width: 0;
//     }

//     .navBrand {
//       font-size: 14px;
//       font-weight: 900;
//       letter-spacing: 0.16em;
//       color: #1a1a1a;
//       cursor: pointer;
//       text-transform: uppercase;
//       line-height: 1;
//     }

//     .navLinks {
//       display: flex;
//       gap: 26px;
//       align-items: center;
//     }

//     .navLink {
//       font-size: 10px;
//       font-weight: 800;
//       letter-spacing: 0.14em;
//       color: rgba(26,26,26,0.55);
//       cursor: pointer;
//       text-transform: uppercase;
//       line-height: 1;
//       padding: 18px 0;
//       position: relative;
//       user-select: none;
//     }

//     .navLink:hover { color: rgba(26,26,26,0.85); }
//     .navLink.active { color: #1a1a1a; }
//     .navLink.active::after {
//       content: "";
//       position: absolute;
//       left: 0; right: 0;
//       bottom: 0px;
//       height: 2px;
//       background: #1a1a1a;
//       border-radius: 2px;
//     }

//     .navRight {
//       display: flex;
//       align-items: center;
//       gap: 16px;
//     }

//     .bellBtn {
//       width: 34px;
//       height: 34px;
//       border-radius: 999px;
//       background: transparent;
//       border: none;
//       display: grid;
//       place-items: center;
//       cursor: pointer;
//       position: relative;
//     }

//     .bellIcon { width: 16px; height: 16px; color: rgba(26,26,26,0.75); }

//     .notificationDot {
//       position: absolute;
//       top: 8px;
//       right: 8px;
//       width: 7px;
//       height: 7px;
//       background: #B87333;
//       border-radius: 50%;
//       border: 2px solid #fff;
//     }

//     .profileWrap { position: relative; }

//     .profileBtn {
//       display: flex;
//       align-items: center;
//       gap: 10px;
//       cursor: pointer;
//       border: none;
//       background: transparent;
//       padding: 4px 0;
//     }

//     .profileMeta {
//       display: flex;
//       flex-direction: column;
//       align-items: flex-end;
//       line-height: 1.05;
//     }

//     .profileName {
//       font-size: 10px;
//       font-weight: 800;
//       letter-spacing: 0.12em;
//       text-transform: uppercase;
//       color: #1a1a1a;
//       white-space: nowrap;
//       max-width: 220px;
//       overflow: hidden;
//       text-overflow: ellipsis;
//     }

//     .profileRole {
//       font-size: 9px;
//       font-weight: 700;
//       letter-spacing: 0.12em;
//       text-transform: uppercase;
//       color: rgba(26,26,26,0.45);
//       margin-top: 2px;
//       white-space: nowrap;
//     }

//     .profileAvatar {
//       width: 28px;
//       height: 28px;
//       border-radius: 999px;
//       background: #B87333;
//       display: grid;
//       place-items: center;
//       color: #fff;
//       font-size: 10px;
//       font-weight: 900;
//       letter-spacing: 0.06em;
//       text-transform: uppercase;
//     }

//     .caret {
//       width: 14px;
//       height: 14px;
//       color: rgba(26,26,26,0.55);
//       margin-left: 2px;
//     }

//     /* DROPDOWN */
//     .menu {
//       position: absolute;
//       top: calc(100% + 10px);
//       right: 0;
//       width: 220px;
//       background: #fff;
//       border: 1px solid #EAEAEA;
//       border-radius: 12px;
//       box-shadow: 0 18px 40px rgba(0,0,0,0.10);
//       overflow: hidden;
//       z-index: 200;
//     }

//     .menuTop {
//       padding: 14px 16px 12px;
//       border-bottom: 1px solid #EFEFEF;
//       background: #fff;
//     }

//     .menuTopLabel {
//       font-size: 9px;
//       font-weight: 900;
//       letter-spacing: 0.18em;
//       color: rgba(26,26,26,0.35);
//       text-transform: uppercase;
//       margin-bottom: 8px;
//     }

//     .menuName {
//       font-size: 13px;
//       font-weight: 900;
//       font-style: italic;
//       color: #1a1a1a;
//       text-transform: uppercase;
//       letter-spacing: 0.02em;
//       margin-bottom: 4px;
//       line-height: 1.1;
//     }

//     .menuTier {
//       font-size: 9px;
//       font-weight: 900;
//       letter-spacing: 0.14em;
//       color: #B87333;
//       text-transform: uppercase;
//       line-height: 1.1;
//     }

//     .menuList { padding: 8px 0; }

//     .menuItem {
//       display: flex;
//       align-items: center;
//       gap: 10px;
//       padding: 11px 16px;
//       cursor: pointer;
//       user-select: none;
//       transition: background 0.14s;
//     }

//     .menuItem:hover { background: #FAFAFA; }

//     .menuIcon {
//       width: 16px;
//       height: 16px;
//       color: rgba(26,26,26,0.55);
//       flex-shrink: 0;
//     }

//     .menuText {
//       font-size: 10px;
//       font-weight: 900;
//       letter-spacing: 0.14em;
//       color: #1a1a1a;
//       text-transform: uppercase;
//     }

//     .menuDivider { height: 1px; background: #EFEFEF; margin: 8px 0; }

//     .menuSignout {
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       gap: 8px;
//       padding: 12px 16px 14px;
//       cursor: pointer;
//       color: #FF4D4D;
//       font-size: 10px;
//       font-weight: 900;
//       letter-spacing: 0.18em;
//       text-transform: uppercase;
//       user-select: none;
//       transition: background 0.14s;
//     }

//     .menuSignout:hover { background: #FFF6F6; }
//     .menuSignout svg { width: 16px; height: 16px; color: #FF4D4D; }

//     /* Main Content */
//     .dashMain {
//       margin-top: 58px;
//       max-width: 1200px;
//       margin-left: auto;
//       margin-right: auto;
//       padding: 48px 40px 80px;
//     }

//     /* Header */
//     .dashHeader {
//       display: flex;
//       justify-content: space-between;
//       align-items: flex-start;
//       margin-bottom: 36px;
//     }

//     .dashHeaderLeft h1 {
//       font-size: 36px;
//       font-weight: 700;
//       font-style: italic;
//       letter-spacing: -0.5px;
//       margin-bottom: 10px;
//       color: #1a1a1a;
//       text-transform: uppercase;
//     }

//     .dashHeaderLeft p {
//       font-size: 11px;
//       color: #999;
//       font-weight: 500;
//       letter-spacing: 0.05em;
//       text-transform: uppercase;
//     }

//     .memberBadge {
//       display: inline-flex;
//       align-items: center;
//       gap: 6px;
//       padding: 6px 12px;
//       background: rgba(184, 115, 51, 0.08);
//       border: 1px solid rgba(184, 115, 51, 0.25);
//       border-radius: 20px;
//       font-size: 9px;
//       font-weight: 700;
//       color: #B87333;
//       text-transform: uppercase;
//       letter-spacing: 0.08em;
//       margin-top: 10px;
//     }

//     .newValuationBtn {
//       padding: 12px 24px;
//       background: #1a1a1a;
//       color: #fff;
//       border: none;
//       border-radius: 8px;
//       font-size: 11px;
//       font-weight: 700;
//       letter-spacing: 0.08em;
//       cursor: pointer;
//       transition: all 0.2s;
//       text-transform: uppercase;
//     }

//     .newValuationBtn:hover {
//       background: #000;
//       transform: translateY(-1px);
//     }

//     /* Stats Grid */
//     .statsGrid {
//       display: grid;
//       grid-template-columns: repeat(4, 1fr);
//       gap: 20px;
//       margin-bottom: 48px;
//     }

//     .statCard {
//       background: #fff;
//       border: 1px solid #E8E8E8;
//       border-radius: 12px;
//       padding: 24px 20px;
//     }

//     .statLabel {
//       font-size: 9px;
//       font-weight: 800;
//       color: #999;
//       text-transform: uppercase;
//       letter-spacing: 0.12em;
//       margin-bottom: 10px;
//     }

//     .statValue {
//       font-size: 24px;
//       font-weight: 700;
//       color: #1a1a1a;
//       margin-bottom: 6px;
//       letter-spacing: -0.5px;
//     }

//     .statChange {
//       font-size: 11px;
//       font-weight: 600;
//       color: #00B050;
//     }

//     .statSub {
//       font-size: 10px;
//       color: #999;
//       font-weight: 500;
//       text-transform: uppercase;
//       letter-spacing: 0.05em;
//     }

//     .statActive {
//       font-size: 14px;
//       font-weight: 700;
//       color: #00B050;
//     }

//     /* Quick Actions */
//   .quickActions { 
//   margin-bottom: 56px; 
// }

// .qaLabel {
//   font-size: 10px;
//   font-weight: 800;
//   letter-spacing: 0.18em;
//   color: rgba(26,26,26,0.40);
//   text-transform: uppercase;
//   margin-bottom: 22px;
// }

// /* grid */
// .qaGrid {
//   display: grid;
//   grid-template-columns: repeat(3, minmax(0, 1fr));
//   gap: 22px;
// }

// /* default card */
// .qaCard {
//   background: #fff;
//   border: 1px solid #EDEDED;
//   border-radius: 20px;
//   padding: 28px 26px 24px;
//   cursor: pointer;
//   transition: all 0.18s ease;
//   min-height: 160px;
//   position: relative;
//   user-select: none;
// }

// /* hover copper border */
// .qaCard:hover {
//   border-color: #B87333;
//   box-shadow: 0 14px 28px rgba(0,0,0,0.06);
//   transform: translateY(-1px);
// }

// /* click copper */
// .qaCard:active {
//   border-color: #B87333;
//   box-shadow: 0 18px 38px rgba(0,0,0,0.10);
//   transform: translateY(0);
// }

// /* keyboard focus */
// .qaCard:focus-visible {
//   outline: none;
//   border-color: #B87333;
//   box-shadow: 0 18px 38px rgba(0,0,0,0.10);
// }

// /* remove special highlight so all cards same */
// .qaCardActive {
//   border-color: #EDEDED;
//   box-shadow: none;
// }

// /* icon box default */
// .qaIconBox,
// .qaIconCoin {
//   width: 42px;
//   height: 42px;
//   border-radius: 12px;
//   border: 1px solid #EFEFEF;
//   background: #F7F7F7;
//   display: grid;
//   place-items: center;
//   color: #1a1a1a;
//   margin-bottom: 18px;
//   transition: all 0.18s ease;
// }

// .qaIconBox svg,
// .qaIconCoin svg {
//   width: 18px;
//   height: 18px;
//   color: currentColor;
//   fill: currentColor;
// }

// /* hover → icon copper */
// .qaCard:hover .qaIconBox,
// .qaCard:hover .qaIconCoin,
// .qaCard:active .qaIconBox,
// .qaCard:active .qaIconCoin,
// .qaCard:focus-visible .qaIconBox,
// .qaCard:focus-visible .qaIconCoin {
//   background: #B87333;
//   border-color: #B87333;
//   color: #fff;
// }

// /* heading like screenshot */
// .qaTitle {
//   font-size: 18px;
//   font-weight: 900;
//   font-style: italic;
//   color: #1a1a1a;
//   letter-spacing: -0.4px;
//   margin-bottom: 8px;
//   text-transform: uppercase;
//   line-height: 1.15;
// }

// /* description */
// .qaDesc {
//   font-size: 10px;
//   font-weight: 800;
//   color: rgba(26,26,26,0.42);
//   letter-spacing: 0.12em;
//   text-transform: uppercase;
//   line-height: 1.55;
// }


//     /* Reports Section */
//     .reportsSection { margin-bottom: 56px; }

//     .reportsHeader {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       margin-bottom: 24px;
//     }

//     .reportsTitle {
//       font-size: 22px;
//       font-weight: 700;
//       font-style: italic;
//       color: #1a1a1a;
//       text-transform: uppercase;
//     }

//     .viewAllLink {
//       font-size: 11px;
//       font-weight: 700;
//       color: #B87333;
//       cursor: pointer;
//       text-transform: uppercase;
//       letter-spacing: 0.08em;
//     }

//     .viewAllLink:hover { text-decoration: underline; }

//     .filterTabs { display: flex; gap: 12px; margin-bottom: 24px; }

//     .filterTab {
//       padding: 8px 16px;
//       background: #fff;
//       border: 1px solid #EDEDED;
//       border-radius: 20px;
//       font-size: 10px;
//       font-weight: 800;
//       color: #999;
//       cursor: pointer;
//       transition: all 0.2s;
//       text-transform: uppercase;
//       letter-spacing: 0.08em;
//     }

//     .filterTab:hover {
//       border-color: #D9D9D9;
//     }

//     .filterTab.active { 
//       background: #1a1a1a; 
//       color: #fff; 
//       border-color: #1a1a1a;
//     }

//     .reportsGrid {
//       display: grid;
//       grid-template-columns: repeat(3, 1fr);
//       gap: 24px;
//     }

//     .reportCard {
//       background: #fff;
//       border: 1px solid #E8E8E8;
//       border-radius: 16px;
//       padding: 24px 20px 22px;
//       cursor: pointer;
//       transition: all 0.2s;
//       position: relative;
//     }

//     .reportCard:hover {
//       border-color: #B87333;
//       transform: translateY(-2px);
//       box-shadow: 0 12px 24px rgba(0,0,0,0.08);
//     }

//     .reportBadge {
//       position: absolute;
//       top: 18px;
//       right: 18px;
//       padding: 4px 10px;
//       background: #1a1a1a;
//       color: #fff;
//       border-radius: 12px;
//       font-size: 8px;
//       font-weight: 800;
//       letter-spacing: 0.08em;
//     }

//     .reportDate {
//       font-size: 9px;
//       color: #999;
//       margin-bottom: 12px;
//       font-weight: 700;
//       letter-spacing: 0.08em;
//       text-transform: uppercase;
//     }

//     .reportIcon {
//       width: 44px;
//       height: 44px;
//       background: #FAFAFA;
//       border: 1px solid #EDEDED;
//       border-radius: 10px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       font-size: 20px;
//       margin-bottom: 14px;
//     }

//     .reportTitle {
//       font-size: 16px;
//       font-weight: 800;
//       font-style: italic;
//       margin-bottom: 4px;
//       color: #1a1a1a;
//       text-transform: uppercase;
//       letter-spacing: -0.3px;
//     }

//     .reportUnit {
//       font-size: 10px;
//       color: #999;
//       margin-bottom: 18px;
//       text-transform: uppercase;
//       letter-spacing: 0.05em;
//     }

//     .reportValue {
//       font-size: 9px;
//       color: #999;
//       text-transform: uppercase;
//       letter-spacing: 0.12em;
//       margin-bottom: 4px;
//       font-weight: 700;
//     }

//     .reportPrice {
//       font-size: 20px;
//       font-weight: 700;
//       color: #1a1a1a;
//       margin-bottom: 16px;
//       letter-spacing: -0.5px;
//     }

//     .reportFooter {
//       display: flex;
//       justify-content: space-between;
//       align-items: center;
//       padding-top: 14px;
//       border-top: 1px solid #F5F5F5;
//     }

//     .reportScore {
//       font-size: 11px;
//       font-weight: 700;
//       color: #B87333;
//       text-transform: uppercase;
//       letter-spacing: 0.05em;
//     }

//     .reportActions { display: flex; gap: 8px; }

//     .reportActionBtn {
//       padding: 7px 14px;
//       background: #1a1a1a;
//       color: #fff;
//       border: none;
//       border-radius: 6px;
//       font-size: 9px;
//       font-weight: 800;
//       cursor: pointer;
//       transition: all 0.2s;
//       text-transform: uppercase;
//       letter-spacing: 0.08em;
//     }

//     .reportActionBtn:hover { background: #000; }

//     .downloadIcon {
//       width: 30px;
//       height: 30px;
//       background: #F8F8F8;
//       border: 1px solid #EDEDED;
//       border-radius: 6px;
//       cursor: pointer;
//       transition: all 0.2s;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       font-size: 13px;
//       color: #666;
//     }

//     .downloadIcon:hover { background: #EDEDED; }

//     /* Subscription Card */
//     .subscriptionCard {
//       background: #fff;
//       border: 1px solid #EDEDED;
//       border-radius: 16px;
//       padding: 28px 24px;
//       margin-bottom: 32px;
//     }

//     .subHeader { 
//       display: flex; 
//       align-items: center; 
//       gap: 14px; 
//       margin-bottom: 24px; 
//     }

//     .subIcon {
//       width: 40px;
//       height: 40px;
//       background: #B87333;
//       border-radius: 50%;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       font-size: 18px;
//     }

//     .subTitle {
//       font-size: 16px;
//       font-weight: 800;
//       font-style: italic;
//       color: #1a1a1a;
//       text-transform: uppercase;
//       letter-spacing: -0.3px;
//     }

//     .subGrid {
//       display: grid;
//       grid-template-columns: repeat(3, 1fr);
//       gap: 14px;
//       margin-bottom: 24px;
//     }

//     .subStat { 
//       padding: 16px 14px; 
//       background: #FAFAFA; 
//       border-radius: 10px; 
//     }

//     .subStatLabel {
//       font-size: 8px;
//       font-weight: 800;
//       color: #999;
//       text-transform: uppercase;
//       letter-spacing: 0.12em;
//       margin-bottom: 8px;
//     }

//     .subStatValue { 
//       font-size: 14px; 
//       font-weight: 700; 
//       color: #1a1a1a;
//       letter-spacing: -0.3px;
//     }

//     .subStatActive { color: #00B050; }

//     .usageBar { margin-bottom: 20px; }

//     .usageLabel {
//       font-size: 9px;
//       color: #999;
//       text-transform: uppercase;
//       letter-spacing: 0.12em;
//       margin-bottom: 10px;
//       font-weight: 800;
//     }

//     .usageProgress {
//       height: 8px;
//       background: #F5F5F5;
//       border-radius: 4px;
//       overflow: hidden;
//       margin-bottom: 6px;
//     }

//     .usageProgressBar {
//       height: 100%;
//       background: linear-gradient(90deg, #B87333, #D4A574);
//       border-radius: 4px;
//       transition: width 0.3s;
//     }

//     .usageText { 
//       font-size: 9px; 
//       color: #999; 
//       text-align: right; 
//       font-weight: 600;
//       text-transform: uppercase;
//       letter-spacing: 0.05em;
//     }

//     .subButtons { display: flex; gap: 12px; }

//     .subBtn {
//       flex: 1;
//       padding: 12px;
//       border: none;
//       border-radius: 8px;
//       font-size: 10px;
//       font-weight: 800;
//       cursor: pointer;
//       transition: all 0.2s;
//       text-transform: uppercase;
//       letter-spacing: 0.08em;
//     }

//     .subBtnPrimary { background: #1a1a1a; color: #fff; }
//     .subBtnPrimary:hover { background: #000; }

//     .subBtnSecondary {
//       background: #FAFAFA;
//       color: #999;
//       border: 1px solid #EDEDED;
//     }
//     .subBtnSecondary:hover { 
//       background: #F5F5F5; 
//       color: #666;
//     }

//     /* Activity Section */
//     .activitySection { margin-bottom: 48px; }

//     .sectionHeader {
//       font-size: 10px;
//       font-weight: 800;
//       color: rgba(26,26,26,0.40);
//       text-transform: uppercase;
//       letter-spacing: 0.18em;
//       margin-bottom: 16px;
//     }

//     .activityList {
//       background: #fff;
//       border: 1px solid #EDEDED;
//       border-radius: 16px;
//       overflow: hidden;
//     }

//     .activityItem {
//       display: flex;
//       align-items: center;
//       gap: 16px;
//       padding: 18px 20px;
//       border-bottom: 1px solid #F8F8F8;
//       cursor: pointer;
//       transition: all 0.2s;
//     }

//     .activityItem:last-child { border-bottom: none; }
//     .activityItem:hover { background: #FAFAFA; }

//     .activityIcon {
//       width: 36px;
//       height: 36px;
//       background: #FAFAFA;
//       border: 1px solid #F5F5F5;
//       border-radius: 8px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       font-size: 16px;
//     }

//     .activityContent { flex: 1; }

//     .activityTitle {
//       font-size: 12px;
//       font-weight: 600;
//       color: #1a1a1a;
//       margin-bottom: 3px;
//     }

//     .activityDate {
//       font-size: 9px;
//       color: #999;
//       text-transform: uppercase;
//       letter-spacing: 0.08em;
//       font-weight: 700;
//     }

//     .viewAllActivity {
//       padding: 16px;
//       text-align: center;
//       font-size: 11px;
//       font-weight: 800;
//       color: #B87333;
//       cursor: pointer;
//       text-transform: uppercase;
//       letter-spacing: 0.08em;
//       border-top: 1px solid #F5F5F5;
//     }

//     .viewAllActivity:hover { background: #FAFAFA; }

//     /* Upgrade CTA */
//     .upgradeCTA {
//       background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
//       border: 1px solid rgba(255,255,255,0.1);
//       border-radius: 20px;
//       padding: 48px 40px;
//       text-align: center;
//       color: #fff;
//       margin-bottom: 60px;
//     }

//     .ctaIcon { font-size: 28px; margin-bottom: 16px; }

//     .ctaTitle {
//       font-size: 26px;
//       font-weight: 700;
//       font-style: italic;
//       margin-bottom: 12px;
//       line-height: 1.2;
//       text-transform: uppercase;
//       letter-spacing: -0.5px;
//     }

//     .ctaDesc {
//       font-size: 11px;
//       color: rgba(255,255,255,0.7);
//       margin-bottom: 24px;
//       max-width: 700px;
//       margin-left: auto;
//       margin-right: auto;
//       text-transform: uppercase;
//       letter-spacing: 0.05em;
//       line-height: 1.6;
//     }

//     .ctaButtons { display: flex; gap: 12px; justify-content: center; }

//     .ctaBtn {
//       padding: 14px 24px;
//       border: none;
//       border-radius: 8px;
//       font-size: 10px;
//       font-weight: 800;
//       cursor: pointer;
//       transition: all 0.2s;
//       text-transform: uppercase;
//       letter-spacing: 0.08em;
//     }

//     .ctaBtnPrimary { background: #B87333; color: #fff; }
//     .ctaBtnPrimary:hover { background: #A06229; }

//     .ctaBtnSecondary {
//       background: transparent;
//       color: #fff;
//       border: 1px solid rgba(255,255,255,0.2);
//     }
//     .ctaBtnSecondary:hover { background: rgba(255,255,255,0.1); }

//     .ctaRating { 
//       margin-top: 20px; 
//       font-size: 10px; 
//       color: rgba(255,255,255,0.5);
//       letter-spacing: 0.05em;
//     }
//     .ctaStars { color: #B87333; margin-right: 8px; }

//     @media (max-width: 1024px) {
//       .navLinks { display: none; }
//       .dashMain { padding: 40px 28px 60px; }
//       .statsGrid {
//   grid-template-columns: repeat(2, minmax(0, 1fr));
//   gap: 14px;
// }
// .statCard {
//   padding: 18px 16px;
//   border-radius: 14px;
// }
// .statLabel {
//   font-size: 9px;
//   letter-spacing: 0.14em;
// }
// .statValue {
//   font-size: 20px;
// }
// .statChange {
//   font-size: 11px;
// }
// .statSub {
//   font-size: 9px;
// }
// .statActive {
//   font-size: 13px;
// }

//       .reportsGrid { grid-template-columns: repeat(2, 1fr); }
//       .qaGrid { grid-template-columns: 1fr; }
//       .qaCard { min-height: unset; }
//     }

//     @media (max-width: 640px) {
//       .topNav { padding: 0 16px; }
//       .profileMeta { display: none; }
//       .dashMain { padding: 32px 20px 60px; }
//       .dashHeaderLeft h1 { font-size: 26px; }
//     .statsGrid {
//   grid-template-columns: repeat(2, minmax(0, 1fr));
//   gap: 14px;
// }
// .statCard {
//   padding: 18px 16px;
//   border-radius: 14px;
// }
// .statLabel {
//   font-size: 9px;
//   letter-spacing: 0.14em;
// }
// .statValue {
//   font-size: 20px;
// }
// .statChange {
//   font-size: 11px;
// }
// .statSub {
//   font-size: 9px;
// }
// .statActive {
//   font-size: 13px;
// }

//       .reportsGrid { grid-template-columns: 1fr; }
//       .subGrid { grid-template-columns: 1fr; }
//       .ctaButtons { flex-direction: column; }
//       .ctaTitle { font-size: 22px; }
//     }
//   `;

//   const path = location.pathname;
//   const isDash = path === "/dashboard" || path === "/";
//   const isReports = path === "/my-reports";
//   const isSettings = path === "/settings";

//   return (
//     <>
//       <style>{UI_CSS}</style>

//       {/* Top Navigation */}
//       <nav className="topNav">
//         <div className="navLeft">
//           <div className="navBrand" onClick={() => navigate("/")}>
//           <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
//               <span style={{ color: "#B87333" }}>ACQ</span>
//               <span style={{ color: "#111111" }}>AR</span>
//             </h1>
//           </div>

//           <div className="navLinks">
//             <div
//               className={`navLink ${isDash ? "active" : ""}`}
//               onClick={() => navigate("/dashboard")}
//             >
//               DASHBOARD
//             </div>
//             <div
//               className={`navLink ${isReports ? "active" : ""}`}
//               onClick={() => navigate("/my-reports")}
//             >
//               MY REPORTS
//             </div>
//             <div
//               className={`navLink ${isSettings ? "active" : ""}`}
//               onClick={() => navigate("/settings")}
//             >
//               SETTINGS
//             </div>
//           </div>
//         </div>

//         <div className="navRight" ref={menuWrapRef}>
//           <button className="bellBtn" type="button" aria-label="Notifications">
//             <svg
//               className="bellIcon"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
//               <path d="M13.73 21a2 2 0 01-3.46 0" />
//             </svg>
//             <span className="notificationDot" />
//           </button>

//           <div className="profileWrap">
//             <button
//               type="button"
//               className="profileBtn"
//               onClick={() => setMenuOpen((v) => !v)}
//               aria-haspopup="menu"
//               aria-expanded={menuOpen ? "true" : "false"}
//             >
//               <div className="profileMeta">
//                 <div className="profileName">{nameToShow}</div>
//                 {/* <div className="profileRole">INVESTOR TIER</div> */}
//               </div>
//               <div className="profileAvatar">{initials}</div>
//               <svg
//                 className="caret"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <polyline points="6 9 12 15 18 9" />
//               </svg>
//             </button>

//             {menuOpen && (
//               <div className="menu" role="menu">
//                 <div className="menuTop">
//                   <div className="menuTopLabel">Authenticated Account</div>
//                   <div className="menuName">{nameToShow}</div>
//                   <div className="menuTier">VALUCHECK™ Premium Member</div>
//                 </div>

//                 <div className="menuList">
//                   <div
//                     className="menuItem"
//                     role="menuitem"
//                     onClick={() => {
//                       setMenuOpen(false);
//                       navigate("/dashboard");
//                     }}
//                   >
//                     <svg
//                       className="menuIcon"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
//                     </svg>
//                     <div className="menuText">Dashboard</div>
//                   </div>

//                   <div
//                     className="menuItem"
//                     role="menuitem"
//                     onClick={() => {
//                       setMenuOpen(false);
//                       navigate("/my-reports");
//                     }}
//                   >
//                     <svg
//                       className="menuIcon"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
//                       <path d="M14 2v6h6" />
//                     </svg>
//                     <div className="menuText">My Reports</div>
//                   </div>

//                   <div
//                     className="menuItem"
//                     role="menuitem"
//                     onClick={() => {
//                       setMenuOpen(false);
//                       navigate("/settings");
//                     }}
//                   >
//                     <svg
//                       className="menuIcon"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" />
//                       <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.05.05a2 2 0 0 1-1.41 3.41h-.1a1.7 1.7 0 0 0-1.6 1.16 1.7 1.7 0 0 0-.37.62 2 2 0 0 1-3.82 0 1.7 1.7 0 0 0-.37-.62 1.7 1.7 0 0 0-1.6-1.16H9.5a2 2 0 0 1-1.41-3.41l.05-.05A1.7 1.7 0 0 0 8.6 15a1.7 1.7 0 0 0-1.06-1.6l-.06-.03a2 2 0 0 1 0-3.74l.06-.03A1.7 1.7 0 0 0 8.6 9a1.7 1.7 0 0 0-.34-1.87l-.05-.05A2 2 0 0 1 9.62 3.7h.1a1.7 1.7 0 0 0 1.6-1.16 2 2 0 0 1 3.82 0 1.7 1.7 0 0 0 1.6 1.16h.1A2 2 0 0 1 21 6.98l-.05.05A1.7 1.7 0 0 0 20.6 9a1.7 1.7 0 0 0 1.06 1.6l.06.03a2 2 0 0 1 0 3.74l-.06.03A1.7 1.7 0 0 0 19.4 15z" />
//                     </svg>
//                     <div className="menuText">Account Settings</div>
//                   </div>

//                   <div
//                     className="menuItem"
//                     role="menuitem"
//                     onClick={() => {
//                       setMenuOpen(false);
//                       navigate("/billing");
//                     }}
//                   >
//                     <svg
//                       className="menuIcon"
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <rect x="2" y="5" width="20" height="14" rx="2" />
//                       <path d="M2 10h20" />
//                     </svg>
//                     <div className="menuText">Billing & Plans</div>
//                   </div>

//                   <div className="menuDivider" />

//                   <div
//                     className="menuSignout"
//                     role="menuitem"
//                     onClick={async () => {
//                       setMenuOpen(false);
//                       await handleLogout();
//                     }}
//                   >
//                     <svg
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     >
//                       <path d="M10 17l5-5-5-5" />
//                       <path d="M15 12H3" />
//                       <path d="M21 3v18" />
//                     </svg>
//                     SIGN OUT
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </nav>

//       <style>{`
//   @media (max-width: 640px){
//     .nvBtn{ width:100% !important; max-width:100% !important; margin-top:16px; }
//     .dashHeaderInline{ flex-direction:column !important; align-items:flex-start !important; }
//   }
// `}</style>


//       {/* Main Content */}
//       <main className="dashMain">
//         {/* Header */}
//        <div
//   style={{
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: isMobile ? "flex-start" : "center",
//     flexDirection: isMobile ? "column" : "row",
//     gap: isMobile ? 16 : 22,
//     marginBottom: isMobile ? 24 : 36,
//     width: "100%",
//   }}
// >
//   {/* LEFT */}
//   <div style={{ minWidth: 0, flex: 1, width: "100%" }}>
//     <h1
//       style={{
//         fontSize: isMobile ? 28 : 36,
//         fontWeight: 900,
//         fontStyle: "italic",
//         letterSpacing: isMobile ? "-0.6px" : "-0.8px",
//         marginBottom: 8,
//         color: "#1a1a1a",
//         textTransform: "uppercase",
//         lineHeight: 1.05,
//       }}
//     >
//       WELCOME BACK, {nameToShow.toUpperCase()}
//     </h1>

//     <p
//       style={{
//         fontSize: isMobile ? 10 : 11,
//         color: "rgba(26,26,26,0.45)",
//         fontWeight: 800,
//         letterSpacing: isMobile ? "0.12em" : "0.14em",
//         textTransform: "uppercase",
//       }}
//     >
//       YOU HAVE {valuations.length} ACTIVE REPORTS IN YOUR DASHBOARD
//     </p>

//     <div
//       style={{
//         display: "inline-flex",
//         alignItems: "center",
//         gap: 8,
//         padding: isMobile ? "10px 14px" : "8px 14px",
//         background: "rgba(184,115,51,0.10)",
//         border: "1px solid rgba(184,115,51,0.26)",
//         borderRadius: isMobile ? 18 : 999,
//         fontSize: 9,
//         fontWeight: 900,
//         color: "#B87333",
//         textTransform: "uppercase",
//         letterSpacing: "0.12em",
//         marginTop: 12,
//         width: isMobile ? "100%" : "fit-content",
//         maxWidth: "100%",
//       }}
//     >
//       🏆 EARLY ACQAR MEMBER - VALUCHECK™ FREE FOREVER
//     </div>
//   </div>

//   {/* BUTTON (right on desktop, full-width on mobile) */}
//   <div
//     style={{
//       marginLeft: isMobile ? 0 : "auto",
//       width: isMobile ? "100%" : "auto",
//       display: "flex",
//       justifyContent: isMobile ? "center" : "flex-end",
//       alignItems: "center",
//     }}
//   >
//     <button
//       onClick={() => navigate("/valuation")}
//       style={{
//         height: isMobile ? 48 : 44,
//         width: isMobile ? "100%" : 220,
//         padding: "0 22px",
//         background: "#111",
//         color: "#fff",
//         border: "1px solid rgba(0,0,0,0.10)",
//         borderRadius: isMobile ? 14 : 12,
//         fontSize: 11,
//         fontWeight: 900,
//         letterSpacing: "0.14em",
//         cursor: "pointer",
//         textTransform: "uppercase",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         gap: 10,
//         whiteSpace: "nowrap",
//         boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
//       }}
//     >
//       <span
//         style={{
//           display: "grid",
//           placeItems: "center",
//           width: 18,
//           height: 18,
//           borderRadius: 6,
//           background: "rgba(255,255,255,0.10)",
//           border: "1px solid rgba(255,255,255,0.10)",
//           fontWeight: 900,
//           lineHeight: 1,
//         }}
//       >
//         +
//       </span>
//       NEW VALUATION
//     </button>
//   </div>
// </div>



//         {/* Stats Grid */}
//         <div className="statsGrid">
//           <div className="statCard">
//             <div className="statLabel">TOTAL VALUE</div>
//             <div className="statValue">{fmtAED(totalPortfolio)}</div>
//             <div className="statChange">+5.2% ↗</div>
//           </div>

//           <div className="statCard">
//             <div className="statLabel">PROPERTIES</div>
//             <div className="statValue">{valuations.length}</div>
//             <div className="statSub">MARKET STABLE</div>
//           </div>

//           <div className="statCard">
//             <div className="statLabel">AVG SCORE</div>
//             <div className="statValue">82/100</div>
//             <div
//   style={{
//     fontSize: 10,
//     color: "#B87333",
//     fontWeight: 500,
//     textTransform: "uppercase",
//     letterSpacing: "0.05em"
//   }}
// >
//   EXCEEDS AREA
// </div>

//           </div>

//           <div className="statCard">
//             <div className="statLabel">ACTIVE SUBSCRIPTION</div>
//             <div className="statValue">VALUCHECK™</div>
//             <div className="statChange">ACTIVE ✓</div>
//           </div>
//         </div>

//         {/* Quick Actions */}
//         <div className="quickActions">
//           <div className="qaLabel">QUICK ACTIONS</div>

//           <div className="qaGrid">
//             {/* Card 1 */}
//             <div className="qaCard" onClick={() => navigate("/valuation")} role="button" tabIndex={0}>
//               <div className="qaIconBox">
//                 <svg viewBox="0 0 24 24" aria-hidden="true">
//                   <path
//                     d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
//                     fill="currentColor"
//                   />
//                 </svg>
//               </div>
//               <div className="qaTitle">NEW VALUATION</div>
//               <div className="qaDesc">GET INSTANT PROPERTY INTELLIGENCE FOR ANY ASSET.</div>
//             </div>

//             {/* Card 2 (highlighted) */}
//             <div
//               className="qaCard qaCardActive"
//               onClick={() => navigate("/my-reports")}
//               role="button"
//               tabIndex={0}
//             >
//               <div className="qaIconCoin" aria-hidden="true">
//                 <svg viewBox="0 0 24 24">
//                   <path
//                     d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6z"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinejoin="round"
//                   />
//                   <path
//                     d="M14 2v6h6"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinejoin="round"
//                   />
//                 </svg>
//               </div>
//               <div className="qaTitle">MY REPORTS</div>
//               <div className="qaDesc">VIEW AND MANAGE ALL YOUR GENERATED REPORTS.</div>
//             </div>

//             {/* Card 3 */}
//             <div className="qaCard" onClick={() => navigate("/settings")} role="button" tabIndex={0}>
//               <div className="qaIconBox">
//                 <svg viewBox="0 0 24 24" aria-hidden="true">
//                   <path
//                     d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   />
//                   <path
//                     d="M19.4 15a1.8 1.8 0 0 0 .35 1.9l.05.05a2 2 0 0 1-1.42 3.42h-.1a1.8 1.8 0 0 0-1.7 1.2 2 2 0 0 1-3.84 0 1.8 1.8 0 0 0-1.7-1.2H9.5a2 2 0 0 1-1.42-3.42l.05-.05A1.8 1.8 0 0 0 8.6 15a1.8 1.8 0 0 0-1.1-1.7l-.06-.03a2 2 0 0 1 0-3.74l.06-.03A1.8 1.8 0 0 0 8.6 9a1.8 1.8 0 0 0-.35-1.9l-.05-.05A2 2 0 0 1 9.62 3.7h.1a1.8 1.8 0 0 0 1.7-1.2 2 2 0 0 1 3.84 0 1.8 1.8 0 0 0 1.7 1.2h.1A2 2 0 0 1 21 6.98l-.05.05A1.8 1.8 0 0 0 20.6 9a1.8 1.8 0 0 0 1.1 1.7l.06.03a2 2 0 0 1 0 3.74l-.06.03A1.8 1.8 0 0 0 19.4 15z"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   />
//                 </svg>
//               </div>
//               <div className="qaTitle">ACCOUNT SETTINGS</div>
//               <div className="qaDesc">MANAGE YOUR PROFILE, BILLING AND PREFERENCES.</div>
//             </div>
//           </div>
//         </div>

//         {/* Reports Section */}
//         <div className="reportsSection">
//           <div className="reportsHeader">
//             <div className="reportsTitle">RECENT REPORTS</div>
//             <div className="viewAllLink" onClick={() => setShowAllValuations(!showAllValuations)}>
//               {showAllValuations ? "SHOW LESS" : "VIEW ALL REPORTS →"}
//             </div>
//           </div>

//           <div className="filterTabs">
//             <div
//               className={`filterTab ${activeFilter === "ALL" ? "active" : ""}`}
//               onClick={() => setActiveFilter("ALL")}
//             >
//               ALL
//             </div>
//             <div
//               className={`filterTab ${activeFilter === "VALUCHECK" ? "active" : ""}`}
//               onClick={() => setActiveFilter("VALUCHECK")}
//             >
//               VALUCHECK™
//             </div>
//             {/* <div
//               className={`filterTab ${activeFilter === "DEALLENS" ? "active" : ""}`}
//               onClick={() => setActiveFilter("DEALLENS")}
//             >
//               DEALLENS™
//             </div>
//             <div
//               className={`filterTab ${activeFilter === "CERTIFI" ? "active" : ""}`}
//               onClick={() => setActiveFilter("CERTIFI")}
//             >
//               CERTIFI™
//             </div> */}
//           </div>

//           {reportCards.length === 0 ? (
//             <div style={{ padding: "60px 40px", textAlign: "center", color: "#999", background: "#FAFAFA", borderRadius: "16px", border: "1px solid #EDEDED" }}>
//               <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
//               <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px", color: "#1a1a1a" }}>No Valuations Yet</div>
//               <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Create your first valuation to see it here.</div>
//             </div>
//           ) : (
//             <div className="reportsGrid">
//               {(showAllValuations ? reportCards : reportCards.slice(0, 6)).map((card) => (
//                 <div
//                   key={card.id}
//                   className="reportCard"
//                   onClick={() => navigate(`/report?id=${card.id}`)}
//                 >
//                   <div className="reportBadge">{card.badge}</div>
//                   <div className="reportDate">{card.date}</div>
//                   <div className="reportIcon">🏠</div>
//                   <div className="reportTitle">{card.title}</div>
// <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
//   {card.bedrooms != null && (
//     <span style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
//       🛏 {card.bedrooms === 0 || String(card.bedrooms).toLowerCase() === "studio" ? "Studio" : `${card.bedrooms} Bed`}
//     </span>
//   )}
//   {card.bathrooms != null && (
//     <>
//       <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#ccc", display: "inline-block", flexShrink: 0 }} />
//       <span style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
//         🚿 {card.bathrooms} Bath
//       </span>
//     </>
//   )}
//   {card.sizeSqft != null && (
//     <>
//       <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#ccc", display: "inline-block", flexShrink: 0 }} />
//       <span style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
//         📐 {card.sizeSqft.toLocaleString()} sqft
//       </span>
//     </>
//   )}
// </div>
// {card.district && (
//   <div style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
//     📍 {card.district}
//   </div>
// )}
//                   <div className="reportValue">ASSET VALUE</div>
//                   <div className="reportPrice">{fmtAEDFull(card.value)}</div>
//                   <div className="reportFooter">
//                     <div className="reportScore">SCORE: {card.score}/100</div>
//                     <div className="reportActions">
//                       <button className="reportActionBtn">VIEW REPORT</button>
//                       <div className="downloadIcon">↓</div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Subscription Card */}
//         <div className="subscriptionCard">
//           <div className="subHeader">
//             <div className="subIcon">⚡</div>
//             <div className="subTitle">YOUR VALUCHECK™ SUBSCRIPTION</div>
//           </div>

//           <div className="subGrid">
//             <div className="subStat">
//               <div className="subStatLabel">STATUS</div>
//               <div className="subStatValue subStatActive">● ACTIVE</div>
//             </div>
//             <div className="subStat">
//               <div className="subStatLabel">NEXT BILLING</div>
//               <div className="subStatValue">Free</div>
//             </div>
//             <div className="subStat">
//               <div className="subStatLabel">REPORTS USED</div>
//               <div className="subStatValue">{valuations.length} <span style={{ fontSize: "10px", color: "#999", fontWeight: "500" }}>Reports</span></div>
//             </div>
//           </div>

//           <div className="usageBar">
//             <div className="usageLabel">USAGE THIS MONTH</div>
//             <div className="usageProgress">
//               <div className="usageProgressBar" style={{ width: "60%" }} />
//             </div>
//             <div className="usageText">60% USED</div>
//           </div>

//           <div className="subButtons">
//             <button className="subBtn subBtnPrimary">MANAGE SUBSCRIPTION</button>
//             <button className="subBtn subBtnSecondary">VIEW BILLING HISTORY</button>
//           </div>
//         </div>

//         {/* Activity Section */}
//         {/* <div className="activitySection">
//           <div className="sectionHeader">RECENT ACTIVITY</div>
//           <div className="activityList">
//             {reportCards.slice(0, 3).map((card, idx) => (
//               <div key={card.id} className="activityItem" onClick={() => navigate(`/report?id=${card.id}`)}>
//                 <div className="activityIcon">
//                   {idx === 0 ? "📄" : idx === 1 ? "💳" : "⬇️"}
//                 </div>
//                 <div className="activityContent">
//                   <div className="activityTitle">
//                     {idx === 0 ? `Report generated: ${card.title}` :
//                      idx === 1 ? "Subscription renewed: VALUCHECK™ Annual" :
//                      `Report downloaded: ${card.title}`}
//                   </div>
//                   <div className="activityDate">{card.date}</div>
//                 </div>
//               </div>
//             ))}

//             <div className="viewAllActivity">VIEW ALL ACTIVITY →</div>
//           </div>
//         </div> */}

//         {/* Upgrade CTA */}
//         <div className="upgradeCTA">
//           <div className="ctaIcon">⚡</div>
//           <div className="ctaTitle">UPGRADE TO INVESTMENT-GRADE INTELLIGENCE</div>
//           <div className="ctaDesc">
//             GET EXACT VALUATIONS (±5%), INVESTMENT SCORES, AND 3-YEAR FORECASTS WITH DEALLENS™.
//             TRUSTED BY 2,500+ DUBAI INVESTORS.
//           </div>
//           <div className="ctaButtons">
//             <button className="ctaBtn ctaBtnPrimary">UPGRADE TO DEALLENS™ - AED 149 →</button>
//             <button className="ctaBtn ctaBtnSecondary">SEE ALL PLANS</button>
//           </div>
//           <div className="ctaRating">
//             <span className="ctaStars">★★★★★</span>
//             <span>4.9/5 Rating</span>
//           </div>
//           <div style={{ fontSize: "9px", marginTop: "8px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
//             VERIFIED BY 347 GLOBAL PORTFOLIO MANAGERS
//           </div>
//         </div>
//       </main>

//       <Footer />
//     </>
//   );
// }







// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import { useLogout } from "../hooks/useLogout";

// /* ── FOOTER COMPONENT ── */
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
//           <div className="main-grid">
//             <div>
//               <div style={{ marginBottom: 24, lineHeight: 1 }}>
//                 <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px' }}>
//                   <span style={{ color: '#B87333' }}>ACQ</span>
//                   <span style={{ color: '#111111' }}>AR</span>
//                 </span>
//               </div>
//               <p style={{ fontSize: 12, lineHeight: 1.75, color: 'rgba(10,10,10,0.5)', fontWeight: 500, marginBottom: 28, maxWidth: 280 }}>
//                 The world's first AI-powered property intelligence platform for Dubai real estate. Independent, instant, investment-grade.
//               </p>
//               <div className="rics-badge">
//                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
//                   <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M9 12l2 2 4-4" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//                 <span>RICS-Aligned Intelligence</span>
//               </div>
//               <div className="social-row">
//                 {[
//                   { href: 'https://www.linkedin.com/company/acqar', label: 'LinkedIn', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
//                   { href: 'https://www.instagram.com/acqar.dxb/', label: 'Instagram', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
//                 ].map(({ href, label, icon }) => (
//                   <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="social-btn">{icon}</a>
//                 ))}
//               </div>
//             </div>
//             <div>
//               <div className="col-heading"><span className="col-heading-dot"></span><h6>Product</h6></div>
//               <ul>
//                 <li><a href="http://www.acqar.com/" target="_blank" rel="noopener noreferrer">TruValu™</a></li>
//                 <li><a href="https://signal.acqar.com/" target="_blank" rel="noopener noreferrer">ACQAR Signal™</a></li>
//                 <li className="muted">ACQAR Passport™</li>
//               </ul>
//             </div>
//             <div>
//               <div className="col-heading"><span className="col-heading-dot"></span><h6>Company</h6></div>
//               <ul>
//                 {['About ACQAR', 'How It Works', 'Contact Us', 'Partners'].map(l => (<li key={l}>{l}</li>))}
//               </ul>
//             </div>
//             <div>
//               <div className="col-heading"><span className="col-heading-dot"></span><h6>Legal & Info</h6></div>
//               <ul>
//                 <li onClick={() => window.open('https://www.acqar.com/blogs', '_blank')}>Intelligence Blog</li>
//                 <li onClick={() => navigate('/terms')}>Terms of Use</li>
//                 <li onClick={() => navigate('/terms')}>Privacy Policy</li>
//               </ul>
//             </div>
//             <div>
//               <div className="col-heading"><span className="col-heading-dot"></span><h6>Comparisons</h6></div>
//               <ul>
//                 {['vs Bayut TruEstimate', 'vs Property Finder', 'vs Traditional Valuers', 'Why ACQAR?'].map(l => (<li key={l}>{l}</li>))}
//               </ul>
//             </div>
//           </div>
//           <div className="bottom-bar">
//             <div className="bottom-location">
//               <span className="logo"><span style={{ color: '#B87333' }}>ACQ</span><span style={{ color: '#0A0A0A' }}>AR</span></span>
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

// export default function UserDashboard() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [profile, setProfile] = useState(null);
//   const [valuations, setValuations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [msg, setMsg] = useState("");
//   const [showAllValuations, setShowAllValuations] = useState(false);
//   const [activeFilter, setActiveFilter] = useState("ALL");
//   const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);

//   // ── NEW: active tab state ──
//   const [activeTab, setActiveTab] = useState("dashboard"); // "dashboard" | "terminal" | "reports" | "settings"

//   useEffect(() => {
//     const onResize = () => setIsMobile(window.innerWidth <= 640);
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuWrapRef = useRef(null);

//   const nameToShow = useMemo(() => {
//     const n = (profile?.name || "").trim();
//     if (n) return n;
//     const em = (profile?.email || "").split("@")[0] || "User";
//     return em.charAt(0).toUpperCase() + em.slice(1);
//   }, [profile]);

//   const initials = useMemo(() => {
//     const parts = (nameToShow || "").trim().split(/\s+/).filter(Boolean);
//     const a = (parts[0] || "A")[0] || "A";
//     const b = (parts[1] || parts[0] || "M")[0] || "M";
//     return (a + b).toUpperCase();
//   }, [nameToShow]);

//   function fmtAED(n) {
//     const x = Number(n);
//     if (!Number.isFinite(x) || x <= 0) return "—";
//     if (x >= 1_000_000) return `AED ${(x / 1_000_000).toFixed(1)}M`;
//     return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
//   }

//   function fmtAEDFull(n) {
//     const x = Number(n);
//     if (!Number.isFinite(x) || x <= 0) return "—";
//     return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
//   }

//   function fmtDate(iso) {
//     if (!iso) return "";
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return "";
//     const now = new Date();
//     const diff = now - d;
//     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//     if (days === 0) return "TODAY";
//     if (days === 1) return "1 DAY AGO";
//     if (days < 30) return `${days} DAYS AGO`;
//     return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
//   }

//   const selectedPassportId = useMemo(() => {
//     return valuations?.length ? valuations[0].id : null;
//   }, [valuations]);

//   useEffect(() => {
//     let mounted = true;
//     async function load() {
//       try {
//         setLoading(true);
//         setMsg("");
//         const { data, error: userErr } = await supabase.auth.getUser();
//         if (userErr) throw userErr;
//         const user = data?.user;
//         if (!user?.id) { navigate("/login"); return; }
//         const authId = user.id;
//         const authEmail = (user.email || "").toLowerCase();
//         const metaName = (user.user_metadata?.name || user.user_metadata?.full_name || user.user_metadata?.display_name || "").trim();

//         let { data: uRow, error: byIdErr } = await supabase.from("users").select("id, role, name, email, phone, created_at").eq("id", authId).maybeSingle();
//         if (byIdErr) console.warn("users select by id:", byIdErr.message);

//         if (!uRow && authEmail) {
//           const { data: emailRow, error: byEmailErr } = await supabase.from("users").select("id, role, name, email, phone, created_at").eq("email", authEmail).maybeSingle();
//           if (byEmailErr) console.warn("users select by email:", byEmailErr.message);
//           if (emailRow?.id && emailRow.id !== authId) {
//             const payload = { id: authId, email: authEmail, role: emailRow.role || null, name: (emailRow.name || metaName || "").trim() || null, phone: emailRow.phone || null };
//             const { error: migrateUpsertErr } = await supabase.from("users").upsert(payload, { onConflict: "id" });
//             if (migrateUpsertErr) { console.warn("users migrate upsert:", migrateUpsertErr.message); } else {
//               const { error: delErr } = await supabase.from("users").delete().eq("id", emailRow.id);
//               if (delErr) console.warn("users delete old row:", delErr.message);
//               const { data: after, error: afterErr } = await supabase.from("users").select("id, role, name, email, phone, created_at").eq("id", authId).maybeSingle();
//               if (afterErr) console.warn("users select after migrate:", afterErr.message);
//               uRow = after || null;
//             }
//           } else { uRow = emailRow || null; }
//         }

//         if (!uRow) {
//           const payload = { id: authId, email: authEmail, name: metaName || null };
//           const { error: createErr } = await supabase.from("users").upsert(payload, { onConflict: "id" });
//           if (createErr) console.warn("users create upsert:", createErr.message);
//           const { data: createdRow, error: createdSelErr } = await supabase.from("users").select("id, role, name, email, phone, created_at").eq("id", authId).maybeSingle();
//           if (createdSelErr) console.warn("users select created:", createdSelErr.message);
//           uRow = createdRow || null;
//         }

//         if (uRow && !(uRow.name || "").trim() && metaName) {
//           const { data: updated, error: updErr } = await supabase.from("users").update({ name: metaName }).eq("id", authId).select("id, role, name, email, phone, created_at").maybeSingle();
//           if (updErr) console.warn("users update name:", updErr.message);
//           else uRow = updated || uRow;
//         }

//         if (!mounted) return;
//         setProfile(uRow || { id: authId, name: metaName || null, email: authEmail || null, phone: null, created_at: null });

//         const { data: vRows, error: vErr } = await supabase.from("valuations").select("id, property_name, building_name, district, created_at, estimated_valuation, form_payload").eq("user_id", authId).order("created_at", { ascending: false }).limit(12);
//         if (!mounted) return;
//         if (vErr) { console.warn("valuations select:", vErr.message); setValuations([]); } else { setValuations(vRows || []); }
//       } catch (e) {
//         if (!mounted) return;
//         setMsg(e?.message || "Failed to load dashboard.");
//       } finally {
//         if (!mounted) return;
//         setLoading(false);
//       }
//     }
//     load();
//     return () => { mounted = false; };
//   }, [navigate]);

//   useEffect(() => {
//     function onDown(e) { if (e.key === "Escape") setMenuOpen(false); }
//     function onClick(e) { const el = menuWrapRef.current; if (!el) return; if (!el.contains(e.target)) setMenuOpen(false); }
//     window.addEventListener("keydown", onDown);
//     window.addEventListener("mousedown", onClick);
//     return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("mousedown", onClick); };
//   }, []);

//     // Add this useEffect near your other useEffects
// useEffect(() => {
//   if (location.state?.tab) {
//     setActiveTab(location.state.tab);
//     // Clear the state so refreshing doesn't re-trigger it
//     window.history.replaceState({}, document.title);
//   }
// }, [location.state]);
//   const handleLogout = useLogout();

//   const totalPortfolio = useMemo(() => {
//     return valuations.reduce((acc, r) => acc + (Number(r.estimated_valuation) || 0), 0) || 0;
//   }, [valuations]);

//   const reportCards = useMemo(() => {
//     if (!valuations?.length) return [];
//     return valuations.map((v) => {
//       const property = (v.property_name || "").trim();
//       const building = (v.building_name || "").trim();
//       const district = (v.district || "").trim();
//       const title = property || building || "Property";
//       const unitInfo = building && building !== title ? building : "";
//       return {
//         id: v.id, title, unitInfo, district,
//         date: fmtDate(v.created_at),
//         value: Number(v.estimated_valuation) || 0,
//         score: Math.floor(Math.random() * 30) + 70,
//         bedrooms: v.form_payload?.bedrooms ?? v.form_payload?.rooms_en ?? null,
//         bathrooms: v.form_payload?.bathrooms ?? v.form_payload?.bathrooms_en ?? null,
//         sizeSqft: v.form_payload?.procedure_area ? Math.round(Number(v.form_payload.procedure_area) * 10.764) : null,
//         badge: "VALUCHECK™",
//       };
//     });
//   }, [valuations]);

//   const UI_CSS = `
//     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
//     * { margin: 0; padding: 0; box-sizing: border-box; }
//     body { font-family: 'Inter', sans-serif; background: #FAFAFA; color: #1a1a1a; }

//     .topNav {
//       position: fixed; top: 0; left: 0; right: 0; height: 58px;
//       background: #FFFFFF; border-bottom: 1px solid #EAEAEA;
//       z-index: 100; display: flex; align-items: center;
//       justify-content: space-between; padding: 0 28px;
//     }
//     .navLeft { display: flex; align-items: center; gap: 44px; min-width: 0; }
//     .navBrand { font-size: 14px; font-weight: 900; letter-spacing: 0.16em; color: #1a1a1a; cursor: pointer; text-transform: uppercase; line-height: 1; }
//     .navLinks { display: flex; gap: 26px; align-items: center; }
//     .navLink { font-size: 10px; font-weight: 800; letter-spacing: 0.14em; color: rgba(26,26,26,0.55); cursor: pointer; text-transform: uppercase; line-height: 1; padding: 18px 0; position: relative; user-select: none; }
//     .navLink:hover { color: rgba(26,26,26,0.85); }
//     .navLink.active { color: #1a1a1a; }
//     .navLink.active::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0px; height: 2px; background: #1a1a1a; border-radius: 2px; }
//     .navLink.terminal-active { color: #00C864; }
//     .navLink.terminal-active::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0px; height: 2px; background: #00C864; border-radius: 2px; }
//     .navRight { display: flex; align-items: center; gap: 16px; }
//     .bellBtn { width: 34px; height: 34px; border-radius: 999px; background: transparent; border: none; display: grid; place-items: center; cursor: pointer; position: relative; }
//     .bellIcon { width: 16px; height: 16px; color: rgba(26,26,26,0.75); }
//     .notificationDot { position: absolute; top: 8px; right: 8px; width: 7px; height: 7px; background: #B87333; border-radius: 50%; border: 2px solid #fff; }
//     .profileWrap { position: relative; }
//     .profileBtn { display: flex; align-items: center; gap: 10px; cursor: pointer; border: none; background: transparent; padding: 4px 0; }
//     .profileMeta { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.05; }
//     .profileName { font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #1a1a1a; white-space: nowrap; max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
//     .profileAvatar { width: 28px; height: 28px; border-radius: 999px; background: #B87333; display: grid; place-items: center; color: #fff; font-size: 10px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; }
//     .caret { width: 14px; height: 14px; color: rgba(26,26,26,0.55); margin-left: 2px; }

//     .menu { position: absolute; top: calc(100% + 10px); right: 0; width: 220px; background: #fff; border: 1px solid #EAEAEA; border-radius: 12px; box-shadow: 0 18px 40px rgba(0,0,0,0.10); overflow: hidden; z-index: 200; }
//     .menuTop { padding: 14px 16px 12px; border-bottom: 1px solid #EFEFEF; background: #fff; }
//     .menuTopLabel { font-size: 9px; font-weight: 900; letter-spacing: 0.18em; color: rgba(26,26,26,0.35); text-transform: uppercase; margin-bottom: 8px; }
//     .menuName { font-size: 13px; font-weight: 900; font-style: italic; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 4px; line-height: 1.1; }
//     .menuTier { font-size: 9px; font-weight: 900; letter-spacing: 0.14em; color: #B87333; text-transform: uppercase; line-height: 1.1; }
//     .menuList { padding: 8px 0; }
//     .menuItem { display: flex; align-items: center; gap: 10px; padding: 11px 16px; cursor: pointer; user-select: none; transition: background 0.14s; }
//     .menuItem:hover { background: #FAFAFA; }
//     .menuIcon { width: 16px; height: 16px; color: rgba(26,26,26,0.55); flex-shrink: 0; }
//     .menuText { font-size: 10px; font-weight: 900; letter-spacing: 0.14em; color: #1a1a1a; text-transform: uppercase; }
//     .menuDivider { height: 1px; background: #EFEFEF; margin: 8px 0; }
//     .menuSignout { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px 14px; cursor: pointer; color: #FF4D4D; font-size: 10px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase; user-select: none; transition: background 0.14s; }
//     .menuSignout:hover { background: #FFF6F6; }
//     .menuSignout svg { width: 16px; height: 16px; color: #FF4D4D; }

//     .dashMain { margin-top: 58px; max-width: 1200px; margin-left: auto; margin-right: auto; padding: 48px 40px 80px; }
//     .statsGrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 48px; }
//     .statCard { background: #fff; border: 1px solid #E8E8E8; border-radius: 12px; padding: 24px 20px; }
//     .statLabel { font-size: 9px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px; }
//     .statValue { font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; letter-spacing: -0.5px; }
//     .statChange { font-size: 11px; font-weight: 600; color: #00B050; }
//     .statSub { font-size: 10px; color: #999; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }

//     .quickActions { margin-bottom: 56px; }
//     .qaLabel { font-size: 10px; font-weight: 800; letter-spacing: 0.18em; color: rgba(26,26,26,0.40); text-transform: uppercase; margin-bottom: 22px; }
//     .qaGrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
//     .qaCard { background: #fff; border: 1px solid #EDEDED; border-radius: 20px; padding: 28px 26px 24px; cursor: pointer; transition: all 0.18s ease; min-height: 160px; position: relative; user-select: none; }
//     .qaCard:hover { border-color: #B87333; box-shadow: 0 14px 28px rgba(0,0,0,0.06); transform: translateY(-1px); }
//     .qaCard:active { border-color: #B87333; box-shadow: 0 18px 38px rgba(0,0,0,0.10); transform: translateY(0); }
//     .qaCard:focus-visible { outline: none; border-color: #B87333; box-shadow: 0 18px 38px rgba(0,0,0,0.10); }
//     .qaIconBox, .qaIconCoin { width: 42px; height: 42px; border-radius: 12px; border: 1px solid #EFEFEF; background: #F7F7F7; display: grid; place-items: center; color: #1a1a1a; margin-bottom: 18px; transition: all 0.18s ease; }
//     .qaIconBox svg, .qaIconCoin svg { width: 18px; height: 18px; color: currentColor; fill: currentColor; }
//     .qaCard:hover .qaIconBox, .qaCard:hover .qaIconCoin, .qaCard:active .qaIconBox, .qaCard:active .qaIconCoin { background: #B87333; border-color: #B87333; color: #fff; }
//     .qaTitle { font-size: 18px; font-weight: 900; font-style: italic; color: #1a1a1a; letter-spacing: -0.4px; margin-bottom: 8px; text-transform: uppercase; line-height: 1.15; }
//     .qaDesc { font-size: 10px; font-weight: 800; color: rgba(26,26,26,0.42); letter-spacing: 0.12em; text-transform: uppercase; line-height: 1.55; }

//     .reportsSection { margin-bottom: 56px; }
//     .reportsHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
//     .reportsTitle { font-size: 22px; font-weight: 700; font-style: italic; color: #1a1a1a; text-transform: uppercase; }
//     .viewAllLink { font-size: 11px; font-weight: 700; color: #B87333; cursor: pointer; text-transform: uppercase; letter-spacing: 0.08em; }
//     .viewAllLink:hover { text-decoration: underline; }
//     .filterTabs { display: flex; gap: 12px; margin-bottom: 24px; }
//     .filterTab { padding: 8px 16px; background: #fff; border: 1px solid #EDEDED; border-radius: 20px; font-size: 10px; font-weight: 800; color: #999; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.08em; }
//     .filterTab:hover { border-color: #D9D9D9; }
//     .filterTab.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
//     .reportsGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
//     .reportCard { background: #fff; border: 1px solid #E8E8E8; border-radius: 16px; padding: 24px 20px 22px; cursor: pointer; transition: all 0.2s; position: relative; }
//     .reportCard:hover { border-color: #B87333; transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
//     .reportBadge { position: absolute; top: 18px; right: 18px; padding: 4px 10px; background: #1a1a1a; color: #fff; border-radius: 12px; font-size: 8px; font-weight: 800; letter-spacing: 0.08em; }
//     .reportDate { font-size: 9px; color: #999; margin-bottom: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
//     .reportIcon { width: 44px; height: 44px; background: #FAFAFA; border: 1px solid #EDEDED; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 14px; }
//     .reportTitle { font-size: 16px; font-weight: 800; font-style: italic; margin-bottom: 4px; color: #1a1a1a; text-transform: uppercase; letter-spacing: -0.3px; }
//     .reportValue { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 4px; font-weight: 700; }
//     .reportPrice { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; letter-spacing: -0.5px; }
//     .reportFooter { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid #F5F5F5; }
//     .reportScore { font-size: 11px; font-weight: 700; color: #B87333; text-transform: uppercase; letter-spacing: 0.05em; }
//     .reportActions { display: flex; gap: 8px; }
//     .reportActionBtn { padding: 7px 14px; background: #1a1a1a; color: #fff; border: none; border-radius: 6px; font-size: 9px; font-weight: 800; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.08em; }
//     .reportActionBtn:hover { background: #000; }
//     .downloadIcon { width: 30px; height: 30px; background: #F8F8F8; border: 1px solid #EDEDED; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #666; }
//     .downloadIcon:hover { background: #EDEDED; }

//     .subscriptionCard { background: #fff; border: 1px solid #EDEDED; border-radius: 16px; padding: 28px 24px; margin-bottom: 32px; }
//     .subHeader { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
//     .subIcon { width: 40px; height: 40px; background: #B87333; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; }
//     .subTitle { font-size: 16px; font-weight: 800; font-style: italic; color: #1a1a1a; text-transform: uppercase; letter-spacing: -0.3px; }
//     .subGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
//     .subStat { padding: 16px 14px; background: #FAFAFA; border-radius: 10px; }
//     .subStatLabel { font-size: 8px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px; }
//     .subStatValue { font-size: 14px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.3px; }
//     .subStatActive { color: #00B050; }
//     .usageBar { margin-bottom: 20px; }
//     .usageLabel { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px; font-weight: 800; }
//     .usageProgress { height: 8px; background: #F5F5F5; border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
//     .usageProgressBar { height: 100%; background: linear-gradient(90deg, #B87333, #D4A574); border-radius: 4px; transition: width 0.3s; }
//     .usageText { font-size: 9px; color: #999; text-align: right; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
//     .subButtons { display: flex; gap: 12px; }
//     .subBtn { flex: 1; padding: 12px; border: none; border-radius: 8px; font-size: 10px; font-weight: 800; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.08em; }
//     .subBtnPrimary { background: #1a1a1a; color: #fff; }
//     .subBtnPrimary:hover { background: #000; }
//     .subBtnSecondary { background: #FAFAFA; color: #999; border: 1px solid #EDEDED; }
//     .subBtnSecondary:hover { background: #F5F5F5; color: #666; }

//     .upgradeCTA { background: linear-gradient(135deg, #1a1a1a, #2a2a2a); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 48px 40px; text-align: center; color: #fff; margin-bottom: 60px; }
//     .ctaIcon { font-size: 28px; margin-bottom: 16px; }
//     .ctaTitle { font-size: 26px; font-weight: 700; font-style: italic; margin-bottom: 12px; line-height: 1.2; text-transform: uppercase; letter-spacing: -0.5px; }
//     .ctaDesc { font-size: 11px; color: rgba(255,255,255,0.7); margin-bottom: 24px; max-width: 700px; margin-left: auto; margin-right: auto; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.6; }
//     .ctaButtons { display: flex; gap: 12px; justify-content: center; }
//     .ctaBtn { padding: 14px 24px; border: none; border-radius: 8px; font-size: 10px; font-weight: 800; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.08em; }
//     .ctaBtnPrimary { background: #B87333; color: #fff; }
//     .ctaBtnPrimary:hover { background: #A06229; }
//     .ctaBtnSecondary { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.2); }
//     .ctaBtnSecondary:hover { background: rgba(255,255,255,0.1); }
//     .ctaRating { margin-top: 20px; font-size: 10px; color: rgba(255,255,255,0.5); letter-spacing: 0.05em; }
//     .ctaStars { color: #B87333; margin-right: 8px; }

//     /* Terminal iframe container */
//     .terminalMain {
//       margin-top: 58px;
//       height: calc(100vh - 58px);
//       overflow: hidden;
//       position: relative;
//     }
//     .terminalFrame {
//       width: 100%;
//       height: 100%;
//       border: none;
//       display: block;
//     }

//     @media (max-width: 1024px) {
//       .navLinks { display: none; }
//       .dashMain { padding: 40px 28px 60px; }
//       .statsGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
//       .statCard { padding: 18px 16px; border-radius: 14px; }
//       .statLabel { font-size: 9px; letter-spacing: 0.14em; }
//       .statValue { font-size: 20px; }
//       .reportsGrid { grid-template-columns: repeat(2, 1fr); }
//       .qaGrid { grid-template-columns: 1fr; }
//       .qaCard { min-height: unset; }
//     }
//     @media (max-width: 640px) {
//       .topNav { padding: 0 16px; }
//       .profileMeta { display: none; }
//       .dashMain { padding: 32px 20px 60px; }
//       .statsGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
//       .statCard { padding: 18px 16px; border-radius: 14px; }
//       .statValue { font-size: 20px; }
//       .reportsGrid { grid-template-columns: 1fr; }
//       .subGrid { grid-template-columns: 1fr; }
//       .ctaButtons { flex-direction: column; }
//       .ctaTitle { font-size: 22px; }
//     }
//   `;

//   return (
//     <>
//       <style>{UI_CSS}</style>

//       {/* ── TOP NAVIGATION ── */}
//       <nav className="topNav">
//         <div className="navLeft">

//           {/* ── DYNAMIC LOGO ── */}
//           <div
//             className="navBrand"
//             onClick={() => { setActiveTab("dashboard"); navigate("/"); }}
//           >
//             {activeTab === "terminal" ? (
//               /* ACQAR SIGNAL™ logo */
//               <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//                 <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: "0.12em", lineHeight: 1 }}>
//                   <span style={{ color: "#B87333" }}>ACQ</span>
//                   <span style={{ color: "#111111" }}>AR</span>
//                 </span>
//                 <span style={{
//                   display: "inline-flex", alignItems: "center", gap: 5,
//                   padding: "3px 9px", borderRadius: 999,
//                   background: "rgba(0,200,100,0.10)",
//                   border: "1px solid rgba(0,200,100,0.30)",
//                 }}>
//                   <span style={{
//                     width: 6, height: 6, borderRadius: "50%",
//                     background: "#00C864", display: "inline-block",
//                     boxShadow: "0 0 6px rgba(0,200,100,0.6)",
//                   }} />
//                   <span style={{
//                     fontSize: 9, fontWeight: 900, color: "#00C864",
//                     letterSpacing: "0.16em", textTransform: "uppercase",
//                   }}>SIGNAL™</span>
//                 </span>
//               </div>
//             ) : activeTab === "reports" ? (
//               /* ACQAR TRUVALU™ logo */
//               <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//                 <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: "0.12em", lineHeight: 1 }}>
//                   <span style={{ color: "#B87333" }}>ACQ</span>
//                   <span style={{ color: "#111111" }}>AR</span>
//                 </span>
//                 <span style={{
//                   display: "inline-flex", alignItems: "center", gap: 5,
//                   padding: "3px 9px", borderRadius: 999,
//                   background: "rgba(184,115,51,0.10)",
//                   border: "1px solid rgba(184,115,51,0.30)",
//                 }}>
//                   <span style={{
//                     fontSize: 9, fontWeight: 900, color: "#B87333",
//                     letterSpacing: "0.16em", textTransform: "uppercase",
//                   }}>TRUVALU™</span>
//                 </span>
//               </div>
//             ) : (
//               /* Default ACQAR logo */
//               <h1 style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.12em", margin: 0, lineHeight: 1 }}>
//                 <span style={{ color: "#B87333" }}>ACQ</span>
//                 <span style={{ color: "#111111" }}>AR</span>
//               </h1>
//             )}
//           </div>

//           {/* ── NAV LINKS ── */}
//           <div className="navLinks">
//             <div
//               className={`navLink ${activeTab === "dashboard" ? "active" : ""}`}
//               onClick={() => { setActiveTab("dashboard"); navigate("/dashboard"); }}
//             >
//               DASHBOARD
//             </div>
//             <div
//               className={`navLink ${activeTab === "terminal" ? "terminal-active" : ""}`}
//               onClick={() => setActiveTab("terminal")}
//             >
//               TERMINAL
//             </div>
//             <div
//               className={`navLink ${activeTab === "reports" ? "active" : ""}`}
//               onClick={() => { setActiveTab("reports"); navigate("/my-reports"); }}
//             >
//               MY REPORTS
//             </div>
//             <div
//               className={`navLink ${activeTab === "settings" ? "active" : ""}`}
//               onClick={() => { setActiveTab("settings"); navigate("/settings"); }}
//             >
//               SETTINGS
//             </div>
//           </div>
//         </div>

//         {/* ── RIGHT SIDE ── */}
//         <div className="navRight" ref={menuWrapRef}>
//           <button className="bellBtn" type="button" aria-label="Notifications">
//             <svg className="bellIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
//               <path d="M13.73 21a2 2 0 01-3.46 0" />
//             </svg>
//             <span className="notificationDot" />
//           </button>

//           <div className="profileWrap">
//             <button type="button" className="profileBtn" onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={menuOpen ? "true" : "false"}>
//               <div className="profileMeta">
//                 <div className="profileName">{nameToShow}</div>
//               </div>
//               <div className="profileAvatar">{initials}</div>
//               <svg className="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <polyline points="6 9 12 15 18 9" />
//               </svg>
//             </button>

//             {menuOpen && (
//               <div className="menu" role="menu">
//                 <div className="menuTop">
//                   <div className="menuTopLabel">Authenticated Account</div>
//                   <div className="menuName">{nameToShow}</div>
//                   <div className="menuTier">VALUCHECK™ Premium Member</div>
//                 </div>
//                 <div className="menuList">
//                   <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); setActiveTab("dashboard"); navigate("/dashboard"); }}>
//                     <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
//                     </svg>
//                     <div className="menuText">Dashboard</div>
//                   </div>
//                   <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); setActiveTab("terminal"); }}>
//                     <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <rect x="2" y="3" width="20" height="18" rx="2" />
//                       <path d="M8 10l4 4 4-4" />
//                     </svg>
//                     <div className="menuText" style={{ color: "#00C864" }}>Terminal</div>
//                   </div>
//                   <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); setActiveTab("reports"); navigate("/my-reports"); }}>
//                     <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
//                       <path d="M14 2v6h6" />
//                     </svg>
//                     <div className="menuText">My Reports</div>
//                   </div>
//                   <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); setActiveTab("settings"); navigate("/settings"); }}>
//                     <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" />
//                       <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.05.05a2 2 0 0 1-1.41 3.41h-.1a1.7 1.7 0 0 0-1.6 1.16 1.7 1.7 0 0 0-.37.62 2 2 0 0 1-3.82 0 1.7 1.7 0 0 0-.37-.62 1.7 1.7 0 0 0-1.6-1.16H9.5a2 2 0 0 1-1.41-3.41l.05-.05A1.7 1.7 0 0 0 8.6 15a1.7 1.7 0 0 0-1.06-1.6l-.06-.03a2 2 0 0 1 0-3.74l.06-.03A1.7 1.7 0 0 0 8.6 9a1.7 1.7 0 0 0-.34-1.87l-.05-.05A2 2 0 0 1 9.62 3.7h.1a1.7 1.7 0 0 0 1.6-1.16 2 2 0 0 1 3.82 0 1.7 1.7 0 0 0 1.6 1.16h.1A2 2 0 0 1 21 6.98l-.05.05A1.7 1.7 0 0 0 20.6 9a1.7 1.7 0 0 0 1.06 1.6l.06.03a2 2 0 0 1 0 3.74l-.06.03A1.7 1.7 0 0 0 19.4 15z" />
//                     </svg>
//                     <div className="menuText">Account Settings</div>
//                   </div>
//                   <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); navigate("/billing"); }}>
//                     <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <rect x="2" y="5" width="20" height="14" rx="2" />
//                       <path d="M2 10h20" />
//                     </svg>
//                     <div className="menuText">Billing & Plans</div>
//                   </div>
//                   <div className="menuDivider" />
//                   <div className="menuSignout" role="menuitem" onClick={async () => { setMenuOpen(false); await handleLogout(); }}>
//                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 3v18" />
//                     </svg>
//                     SIGN OUT
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </nav>

//       {/* ── TERMINAL VIEW ── */}
//       {activeTab === "terminal" && (
//         <main className="terminalMain">
//           <iframe
//             src="https://signal.acqar.com/dashboard"
//             className="terminalFrame"
//             title="ACQAR Signal Terminal"
//             allow="fullscreen"
//           />
//         </main>
//       )}

//       {/* ── DASHBOARD VIEW ── */}
//       {activeTab !== "terminal" && (
//         <>
//           <main className="dashMain">
//             {/* Header */}
//             <div style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: isMobile ? "flex-start" : "center",
//               flexDirection: isMobile ? "column" : "row",
//               gap: isMobile ? 16 : 22,
//               marginBottom: isMobile ? 24 : 36,
//               width: "100%",
//             }}>
//               <div style={{ minWidth: 0, flex: 1, width: "100%" }}>
//                 <h1 style={{
//                   fontSize: isMobile ? 28 : 36, fontWeight: 900, fontStyle: "italic",
//                   letterSpacing: isMobile ? "-0.6px" : "-0.8px", marginBottom: 8,
//                   color: "#1a1a1a", textTransform: "uppercase", lineHeight: 1.05,
//                 }}>
//                   WELCOME BACK, {nameToShow.toUpperCase()}
//                 </h1>
//                 <p style={{
//                   fontSize: isMobile ? 10 : 11, color: "rgba(26,26,26,0.45)",
//                   fontWeight: 800, letterSpacing: isMobile ? "0.12em" : "0.14em", textTransform: "uppercase",
//                 }}>
//                   YOU HAVE {valuations.length} ACTIVE REPORTS IN YOUR DASHBOARD
//                 </p>
//                 <div style={{
//                   display: "inline-flex", alignItems: "center", gap: 8,
//                   padding: isMobile ? "10px 14px" : "8px 14px",
//                   background: "rgba(184,115,51,0.10)", border: "1px solid rgba(184,115,51,0.26)",
//                   borderRadius: isMobile ? 18 : 999, fontSize: 9, fontWeight: 900, color: "#B87333",
//                   textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 12,
//                   width: isMobile ? "100%" : "fit-content", maxWidth: "100%",
//                 }}>
//                   🏆 EARLY ACQAR MEMBER - VALUCHECK™ FREE FOREVER
//                 </div>
//               </div>
//               <div style={{
//                 marginLeft: isMobile ? 0 : "auto", width: isMobile ? "100%" : "auto",
//                 display: "flex", justifyContent: isMobile ? "center" : "flex-end", alignItems: "center",
//               }}>
//                 <button onClick={() => navigate("/valuation")} style={{
//                   height: isMobile ? 48 : 44, width: isMobile ? "100%" : 220,
//                   padding: "0 22px", background: "#111", color: "#fff",
//                   border: "1px solid rgba(0,0,0,0.10)", borderRadius: isMobile ? 14 : 12,
//                   fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", cursor: "pointer",
//                   textTransform: "uppercase", display: "flex", alignItems: "center",
//                   justifyContent: "center", gap: 10, whiteSpace: "nowrap",
//                   boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
//                 }}>
//                   <span style={{
//                     display: "grid", placeItems: "center", width: 18, height: 18,
//                     borderRadius: 6, background: "rgba(255,255,255,0.10)",
//                     border: "1px solid rgba(255,255,255,0.10)", fontWeight: 900, lineHeight: 1,
//                   }}>+</span>
//                   NEW VALUATION
//                 </button>
//               </div>
//             </div>

//             {/* Stats Grid */}
//             <div className="statsGrid">
//               <div className="statCard">
//                 <div className="statLabel">TOTAL VALUE</div>
//                 <div className="statValue">{fmtAED(totalPortfolio)}</div>
//                 <div className="statChange">+5.2% ↗</div>
//               </div>
//               <div className="statCard">
//                 <div className="statLabel">PROPERTIES</div>
//                 <div className="statValue">{valuations.length}</div>
//                 <div className="statSub">MARKET STABLE</div>
//               </div>
//               <div className="statCard">
//                 <div className="statLabel">AVG SCORE</div>
//                 <div className="statValue">82/100</div>
//                 <div style={{ fontSize: 10, color: "#B87333", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>EXCEEDS AREA</div>
//               </div>
//               <div className="statCard">
//                 <div className="statLabel">ACTIVE SUBSCRIPTION</div>
//                 <div className="statValue">VALUCHECK™</div>
//                 <div className="statChange">ACTIVE ✓</div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="quickActions">
//               <div className="qaLabel">QUICK ACTIONS</div>
//               <div className="qaGrid">
//                 <div className="qaCard" onClick={() => navigate("/valuation")} role="button" tabIndex={0}>
//                   <div className="qaIconBox">
//                     <svg viewBox="0 0 24 24" aria-hidden="true">
//                       <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" fill="currentColor" />
//                     </svg>
//                   </div>
//                   <div className="qaTitle">NEW VALUATION</div>
//                   <div className="qaDesc">GET INSTANT PROPERTY INTELLIGENCE FOR ANY ASSET.</div>
//                 </div>
//                 <div className="qaCard" onClick={() => { setActiveTab("terminal"); }} role="button" tabIndex={0}>
//                   <div className="qaIconCoin">
//                     <svg viewBox="0 0 24 24">
//                       <rect x="2" y="3" width="20" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
//                       <path d="M8 10l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>
//                   </div>
//                   <div className="qaTitle">TERMINAL</div>
//                   <div className="qaDesc">ACCESS ACQAR SIGNAL™ LIVE MARKET INTELLIGENCE.</div>
//                 </div>
//                 <div className="qaCard" onClick={() => navigate("/settings")} role="button" tabIndex={0}>
//                   <div className="qaIconBox">
//                     <svg viewBox="0 0 24 24" aria-hidden="true">
//                       <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" fill="none" stroke="currentColor" strokeWidth="2" />
//                       <path d="M19.4 15a1.8 1.8 0 0 0 .35 1.9l.05.05a2 2 0 0 1-1.42 3.42h-.1a1.8 1.8 0 0 0-1.7 1.2 2 2 0 0 1-3.84 0 1.8 1.8 0 0 0-1.7-1.2H9.5a2 2 0 0 1-1.42-3.42l.05-.05A1.8 1.8 0 0 0 8.6 15a1.8 1.8 0 0 0-1.1-1.7l-.06-.03a2 2 0 0 1 0-3.74l.06-.03A1.8 1.8 0 0 0 8.6 9a1.8 1.8 0 0 0-.35-1.9l-.05-.05A2 2 0 0 1 9.62 3.7h.1a1.8 1.8 0 0 0 1.7-1.2 2 2 0 0 1 3.84 0 1.8 1.8 0 0 0 1.7 1.2h.1A2 2 0 0 1 21 6.98l-.05.05A1.8 1.8 0 0 0 20.6 9a1.8 1.8 0 0 0 1.1 1.7l.06.03a2 2 0 0 1 0 3.74l-.06.03A1.8 1.8 0 0 0 19.4 15z" fill="none" stroke="currentColor" strokeWidth="2" />
//                     </svg>
//                   </div>
//                   <div className="qaTitle">ACCOUNT SETTINGS</div>
//                   <div className="qaDesc">MANAGE YOUR PROFILE, BILLING AND PREFERENCES.</div>
//                 </div>
//               </div>
//             </div>

//             {/* Reports Section */}
//             <div className="reportsSection">
//               <div className="reportsHeader">
//                 <div className="reportsTitle">RECENT REPORTS</div>
//                 <div className="viewAllLink" onClick={() => setShowAllValuations(!showAllValuations)}>
//                   {showAllValuations ? "SHOW LESS" : "VIEW ALL REPORTS →"}
//                 </div>
//               </div>
//               <div className="filterTabs">
//                 <div className={`filterTab ${activeFilter === "ALL" ? "active" : ""}`} onClick={() => setActiveFilter("ALL")}>ALL</div>
//                 <div className={`filterTab ${activeFilter === "VALUCHECK" ? "active" : ""}`} onClick={() => setActiveFilter("VALUCHECK")}>VALUCHECK™</div>
//               </div>
//               {reportCards.length === 0 ? (
//                 <div style={{ padding: "60px 40px", textAlign: "center", color: "#999", background: "#FAFAFA", borderRadius: "16px", border: "1px solid #EDEDED" }}>
//                   <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
//                   <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px", color: "#1a1a1a" }}>No Valuations Yet</div>
//                   <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Create your first valuation to see it here.</div>
//                 </div>
//               ) : (
//                 <div className="reportsGrid">
//                   {(showAllValuations ? reportCards : reportCards.slice(0, 6)).map((card) => (
//                     <div key={card.id} className="reportCard" onClick={() => navigate(`/report?id=${card.id}`)}>
//                       <div className="reportBadge">{card.badge}</div>
//                       <div className="reportDate">{card.date}</div>
//                       <div className="reportIcon">🏠</div>
//                       <div className="reportTitle">{card.title}</div>
//                       <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
//                         {card.bedrooms != null && (
//                           <span style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
//                             🛏 {card.bedrooms === 0 || String(card.bedrooms).toLowerCase() === "studio" ? "Studio" : `${card.bedrooms} Bed`}
//                           </span>
//                         )}
//                         {card.bathrooms != null && (
//                           <><span style={{ width: 3, height: 3, borderRadius: "50%", background: "#ccc", display: "inline-block", flexShrink: 0 }} />
//                           <span style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>🚿 {card.bathrooms} Bath</span></>
//                         )}
//                         {card.sizeSqft != null && (
//                           <><span style={{ width: 3, height: 3, borderRadius: "50%", background: "#ccc", display: "inline-block", flexShrink: 0 }} />
//                           <span style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>📐 {card.sizeSqft.toLocaleString()} sqft</span></>
//                         )}
//                       </div>
//                       {card.district && (
//                         <div style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>📍 {card.district}</div>
//                       )}
//                       <div className="reportValue">ASSET VALUE</div>
//                       <div className="reportPrice">{fmtAEDFull(card.value)}</div>
//                       <div className="reportFooter">
//                         <div className="reportScore">SCORE: {card.score}/100</div>
//                         <div className="reportActions">
//                           <button className="reportActionBtn">VIEW REPORT</button>
//                           <div className="downloadIcon">↓</div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Subscription Card */}
//             <div className="subscriptionCard">
//               <div className="subHeader">
//                 <div className="subIcon">⚡</div>
//                 <div className="subTitle">YOUR VALUCHECK™ SUBSCRIPTION</div>
//               </div>
//               <div className="subGrid">
//                 <div className="subStat"><div className="subStatLabel">STATUS</div><div className="subStatValue subStatActive">● ACTIVE</div></div>
//                 <div className="subStat"><div className="subStatLabel">NEXT BILLING</div><div className="subStatValue">Free</div></div>
//                 <div className="subStat"><div className="subStatLabel">REPORTS USED</div><div className="subStatValue">{valuations.length} <span style={{ fontSize: "10px", color: "#999", fontWeight: "500" }}>Reports</span></div></div>
//               </div>
//               <div className="usageBar">
//                 <div className="usageLabel">USAGE THIS MONTH</div>
//                 <div className="usageProgress"><div className="usageProgressBar" style={{ width: "60%" }} /></div>
//                 <div className="usageText">60% USED</div>
//               </div>
//               <div className="subButtons">
//                 <button className="subBtn subBtnPrimary">MANAGE SUBSCRIPTION</button>
//                 <button className="subBtn subBtnSecondary">VIEW BILLING HISTORY</button>
//               </div>
//             </div>

//             {/* Upgrade CTA */}
//             <div className="upgradeCTA">
//               <div className="ctaIcon">⚡</div>
//               <div className="ctaTitle">UPGRADE TO INVESTMENT-GRADE INTELLIGENCE</div>
//               <div className="ctaDesc">GET EXACT VALUATIONS (±5%), INVESTMENT SCORES, AND 3-YEAR FORECASTS WITH DEALLENS™. TRUSTED BY 2,500+ DUBAI INVESTORS.</div>
//               <div className="ctaButtons">
//                 <button className="ctaBtn ctaBtnPrimary">UPGRADE TO DEALLENS™ - AED 149 →</button>
//                 <button className="ctaBtn ctaBtnSecondary">SEE ALL PLANS</button>
//               </div>
//               <div className="ctaRating"><span className="ctaStars">★★★★★</span><span>4.9/5 Rating</span></div>
//               <div style={{ fontSize: "9px", marginTop: "8px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>VERIFIED BY 347 GLOBAL PORTFOLIO MANAGERS</div>
//             </div>
//           </main>

//           <Footer />
//         </>
//       )}
//     </>
//   );
// }



// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import { useLogout } from "../hooks/useLogout";

// /* ── FOOTER COMPONENT ── */
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
//           <div className="main-grid">
//             <div>
//               <div style={{ marginBottom: 24, lineHeight: 1 }}>
//                 <span style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.5px' }}>
//                   <span style={{ color: '#B87333' }}>ACQ</span>
//                   <span style={{ color: '#111111' }}>AR</span>
//                 </span>
//               </div>
//               <p style={{ fontSize: 12, lineHeight: 1.75, color: 'rgba(10,10,10,0.5)', fontWeight: 500, marginBottom: 28, maxWidth: 280 }}>
//                 The world's first AI-powered property intelligence platform for Dubai real estate. Independent, instant, investment-grade.
//               </p>
//               <div className="rics-badge">
//                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
//                   <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
//                   <path d="M9 12l2 2 4-4" stroke="#B87333" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
//                 </svg>
//                 <span>RICS-Aligned Intelligence</span>
//               </div>
//               <div className="social-row">
//                 {[
//                   { href: 'https://www.linkedin.com/company/acqar', label: 'LinkedIn', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> },
//                   { href: 'https://www.instagram.com/acqar.dxb/', label: 'Instagram', icon: <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> },
//                 ].map(({ href, label, icon }) => (
//                   <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="social-btn">{icon}</a>
//                 ))}
//               </div>
//             </div>
//             <div>
//               <div className="col-heading"><span className="col-heading-dot"></span><h6>Product</h6></div>
//               <ul>
//                 <li><a href="http://www.acqar.com/" target="_blank" rel="noopener noreferrer">TruValu™</a></li>
//                 <li><a href="https://signal.acqar.com/" target="_blank" rel="noopener noreferrer">ACQAR Signal™</a></li>
//                 <li className="muted">ACQAR Passport™</li>
//               </ul>
//             </div>
//             <div>
//               <div className="col-heading"><span className="col-heading-dot"></span><h6>Company</h6></div>
//               <ul>
//                 {['About ACQAR', 'How It Works', 'Contact Us', 'Partners'].map(l => (<li key={l}>{l}</li>))}
//               </ul>
//             </div>
//             <div>
//               <div className="col-heading"><span className="col-heading-dot"></span><h6>Legal & Info</h6></div>
//               <ul>
//                 <li onClick={() => window.open('https://www.acqar.com/blogs', '_blank')}>Intelligence Blog</li>
//                 <li onClick={() => navigate('/terms')}>Terms of Use</li>
//                 <li onClick={() => navigate('/terms')}>Privacy Policy</li>
//               </ul>
//             </div>
//             <div>
//               <div className="col-heading"><span className="col-heading-dot"></span><h6>Comparisons</h6></div>
//               <ul>
//                 {['vs Bayut TruEstimate', 'vs Property Finder', 'vs Traditional Valuers', 'Why ACQAR?'].map(l => (<li key={l}>{l}</li>))}
//               </ul>
//             </div>
//           </div>
//           <div className="bottom-bar">
//             <div className="bottom-location">
//               <span className="logo"><span style={{ color: '#B87333' }}>ACQ</span><span style={{ color: '#0A0A0A' }}>AR</span></span>
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

// export default function UserDashboard() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [profile, setProfile] = useState(null);
//   const [valuations, setValuations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [msg, setMsg] = useState("");
//   const [showAllValuations, setShowAllValuations] = useState(false);
//   const [activeFilter, setActiveFilter] = useState("ALL");
//   const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);

//   // ── NEW: active tab state ──
//   const [activeTab, setActiveTab] = useState("terminal"); // "dashboard" | "terminal" | "reports" | "settings"

//   useEffect(() => {
//     const onResize = () => setIsMobile(window.innerWidth <= 640);
//     window.addEventListener("resize", onResize);
//     return () => window.removeEventListener("resize", onResize);
//   }, []);

//   const [menuOpen, setMenuOpen] = useState(false);
//   const menuWrapRef = useRef(null);

//   const nameToShow = useMemo(() => {
//     const n = (profile?.name || "").trim();
//     if (n) return n;
//     const em = (profile?.email || "").split("@")[0] || "User";
//     return em.charAt(0).toUpperCase() + em.slice(1);
//   }, [profile]);

//   const initials = useMemo(() => {
//     const parts = (nameToShow || "").trim().split(/\s+/).filter(Boolean);
//     const a = (parts[0] || "A")[0] || "A";
//     const b = (parts[1] || parts[0] || "M")[0] || "M";
//     return (a + b).toUpperCase();
//   }, [nameToShow]);

//   function fmtAED(n) {
//     const x = Number(n);
//     if (!Number.isFinite(x) || x <= 0) return "—";
//     if (x >= 1_000_000) return `AED ${(x / 1_000_000).toFixed(1)}M`;
//     return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
//   }

//   function fmtAEDFull(n) {
//     const x = Number(n);
//     if (!Number.isFinite(x) || x <= 0) return "—";
//     return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
//   }

//   function fmtDate(iso) {
//     if (!iso) return "";
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return "";
//     const now = new Date();
//     const diff = now - d;
//     const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//     if (days === 0) return "TODAY";
//     if (days === 1) return "1 DAY AGO";
//     if (days < 30) return `${days} DAYS AGO`;
//     return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
//   }

//   const selectedPassportId = useMemo(() => {
//     return valuations?.length ? valuations[0].id : null;
//   }, [valuations]);

//   useEffect(() => {
//     let mounted = true;
//     async function load() {
//       try {
//         setLoading(true);
//         setMsg("");
//         const { data, error: userErr } = await supabase.auth.getUser();
//         if (userErr) throw userErr;
//         const user = data?.user;
//         if (!user?.id) { navigate("/login"); return; }
//         const authId = user.id;
//         const authEmail = (user.email || "").toLowerCase();
//         const metaName = (user.user_metadata?.name || user.user_metadata?.full_name || user.user_metadata?.display_name || "").trim();

//         let { data: uRow, error: byIdErr } = await supabase.from("users").select("id, role, name, email, phone, created_at").eq("id", authId).maybeSingle();
//         if (byIdErr) console.warn("users select by id:", byIdErr.message);

//         if (!uRow && authEmail) {
//           const { data: emailRow, error: byEmailErr } = await supabase.from("users").select("id, role, name, email, phone, created_at").eq("email", authEmail).maybeSingle();
//           if (byEmailErr) console.warn("users select by email:", byEmailErr.message);
//           if (emailRow?.id && emailRow.id !== authId) {
//             const payload = { id: authId, email: authEmail, role: emailRow.role || null, name: (emailRow.name || metaName || "").trim() || null, phone: emailRow.phone || null };
//             const { error: migrateUpsertErr } = await supabase.from("users").upsert(payload, { onConflict: "id" });
//             if (migrateUpsertErr) { console.warn("users migrate upsert:", migrateUpsertErr.message); } else {
//               const { error: delErr } = await supabase.from("users").delete().eq("id", emailRow.id);
//               if (delErr) console.warn("users delete old row:", delErr.message);
//               const { data: after, error: afterErr } = await supabase.from("users").select("id, role, name, email, phone, created_at").eq("id", authId).maybeSingle();
//               if (afterErr) console.warn("users select after migrate:", afterErr.message);
//               uRow = after || null;
//             }
//           } else { uRow = emailRow || null; }
//         }

//         if (!uRow) {
//           const payload = { id: authId, email: authEmail, name: metaName || null };
//           const { error: createErr } = await supabase.from("users").upsert(payload, { onConflict: "id" });
//           if (createErr) console.warn("users create upsert:", createErr.message);
//           const { data: createdRow, error: createdSelErr } = await supabase.from("users").select("id, role, name, email, phone, created_at").eq("id", authId).maybeSingle();
//           if (createdSelErr) console.warn("users select created:", createdSelErr.message);
//           uRow = createdRow || null;
//         }

//         if (uRow && !(uRow.name || "").trim() && metaName) {
//           const { data: updated, error: updErr } = await supabase.from("users").update({ name: metaName }).eq("id", authId).select("id, role, name, email, phone, created_at").maybeSingle();
//           if (updErr) console.warn("users update name:", updErr.message);
//           else uRow = updated || uRow;
//         }

//         if (!mounted) return;
//         setProfile(uRow || { id: authId, name: metaName || null, email: authEmail || null, phone: null, created_at: null });

//         const { data: vRows, error: vErr } = await supabase.from("valuations").select("id, property_name, building_name, district, created_at, estimated_valuation, form_payload").eq("user_id", authId).order("created_at", { ascending: false }).limit(12);
//         if (!mounted) return;
//         if (vErr) { console.warn("valuations select:", vErr.message); setValuations([]); } else { setValuations(vRows || []); }
//       } catch (e) {
//         if (!mounted) return;
//         setMsg(e?.message || "Failed to load dashboard.");
//       } finally {
//         if (!mounted) return;
//         setLoading(false);
//       }
//     }
//     load();
//     return () => { mounted = false; };
//   }, [navigate]);

//   useEffect(() => {
//     function onDown(e) { if (e.key === "Escape") setMenuOpen(false); }
//     function onClick(e) { const el = menuWrapRef.current; if (!el) return; if (!el.contains(e.target)) setMenuOpen(false); }
//     window.addEventListener("keydown", onDown);
//     window.addEventListener("mousedown", onClick);
//     return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("mousedown", onClick); };
//   }, []);

//     // Add this useEffect near your other useEffects
// useEffect(() => {
//   if (location.state?.tab) {
//     setActiveTab(location.state.tab);
//     // Clear the state so refreshing doesn't re-trigger it
//     window.history.replaceState({}, document.title);
//   }
// }, [location.state]);
//   const handleLogout = useLogout();

//   const totalPortfolio = useMemo(() => {
//     return valuations.reduce((acc, r) => acc + (Number(r.estimated_valuation) || 0), 0) || 0;
//   }, [valuations]);

//   const reportCards = useMemo(() => {
//     if (!valuations?.length) return [];
//     return valuations.map((v) => {
//       const property = (v.property_name || "").trim();
//       const building = (v.building_name || "").trim();
//       const district = (v.district || "").trim();
//       const title = property || building || "Property";
//       const unitInfo = building && building !== title ? building : "";
//       return {
//         id: v.id, title, unitInfo, district,
//         date: fmtDate(v.created_at),
//         value: Number(v.estimated_valuation) || 0,
//         score: Math.floor(Math.random() * 30) + 70,
//         bedrooms: v.form_payload?.bedrooms ?? v.form_payload?.rooms_en ?? null,
//         bathrooms: v.form_payload?.bathrooms ?? v.form_payload?.bathrooms_en ?? null,
//         sizeSqft: v.form_payload?.procedure_area ? Math.round(Number(v.form_payload.procedure_area) * 10.764) : null,
//         badge: "VALUCHECK™",
//       };
//     });
//   }, [valuations]);

//   const UI_CSS = `
//     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
//     * { margin: 0; padding: 0; box-sizing: border-box; }
//     body { font-family: 'Inter', sans-serif; background: #FAFAFA; color: #1a1a1a; }

//     .topNav {
//       position: fixed; top: 0; left: 0; right: 0; height: 58px;
//       background: #FFFFFF; border-bottom: 1px solid #EAEAEA;
//       z-index: 100; display: flex; align-items: center;
//       justify-content: space-between; padding: 0 28px;
//     }
//     .navLeft { display: flex; align-items: center; gap: 44px; min-width: 0; }
//     .navBrand { font-size: 14px; font-weight: 900; letter-spacing: 0.16em; color: #1a1a1a; cursor: pointer; text-transform: uppercase; line-height: 1; }
//     .navLinks { display: flex; gap: 26px; align-items: center; }
//     .navLink { font-size: 10px; font-weight: 800; letter-spacing: 0.14em; color: rgba(26,26,26,0.55); cursor: pointer; text-transform: uppercase; line-height: 1; padding: 18px 0; position: relative; user-select: none; }
//     .navLink:hover { color: rgba(26,26,26,0.85); }
//     .navLink.active { color: #1a1a1a; }
//     .navLink.active::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0px; height: 2px; background: #1a1a1a; border-radius: 2px; }
//     .navLink.terminal-active { color: #00C864; }
//     .navLink.terminal-active::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0px; height: 2px; background: #00C864; border-radius: 2px; }
//     .navRight { display: flex; align-items: center; gap: 16px; }
//     .bellBtn { width: 34px; height: 34px; border-radius: 999px; background: transparent; border: none; display: grid; place-items: center; cursor: pointer; position: relative; }
//     .bellIcon { width: 16px; height: 16px; color: rgba(26,26,26,0.75); }
//     .notificationDot { position: absolute; top: 8px; right: 8px; width: 7px; height: 7px; background: #B87333; border-radius: 50%; border: 2px solid #fff; }
//     .profileWrap { position: relative; }
//     .profileBtn { display: flex; align-items: center; gap: 10px; cursor: pointer; border: none; background: transparent; padding: 4px 0; }
//     .profileMeta { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.05; }
//     .profileName { font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #1a1a1a; white-space: nowrap; max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
//     .profileAvatar { width: 28px; height: 28px; border-radius: 999px; background: #B87333; display: grid; place-items: center; color: #fff; font-size: 10px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; }
//     .caret { width: 14px; height: 14px; color: rgba(26,26,26,0.55); margin-left: 2px; }

//     .menu { position: absolute; top: calc(100% + 10px); right: 0; width: 220px; background: #fff; border: 1px solid #EAEAEA; border-radius: 12px; box-shadow: 0 18px 40px rgba(0,0,0,0.10); overflow: hidden; z-index: 200; }
//     .menuTop { padding: 14px 16px 12px; border-bottom: 1px solid #EFEFEF; background: #fff; }
//     .menuTopLabel { font-size: 9px; font-weight: 900; letter-spacing: 0.18em; color: rgba(26,26,26,0.35); text-transform: uppercase; margin-bottom: 8px; }
//     .menuName { font-size: 13px; font-weight: 900; font-style: italic; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 4px; line-height: 1.1; }
//     .menuTier { font-size: 9px; font-weight: 900; letter-spacing: 0.14em; color: #B87333; text-transform: uppercase; line-height: 1.1; }
//     .menuList { padding: 8px 0; }
//     .menuItem { display: flex; align-items: center; gap: 10px; padding: 11px 16px; cursor: pointer; user-select: none; transition: background 0.14s; }
//     .menuItem:hover { background: #FAFAFA; }
//     .menuIcon { width: 16px; height: 16px; color: rgba(26,26,26,0.55); flex-shrink: 0; }
//     .menuText { font-size: 10px; font-weight: 900; letter-spacing: 0.14em; color: #1a1a1a; text-transform: uppercase; }
//     .menuDivider { height: 1px; background: #EFEFEF; margin: 8px 0; }
//     .menuSignout { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px 14px; cursor: pointer; color: #FF4D4D; font-size: 10px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase; user-select: none; transition: background 0.14s; }
//     .menuSignout:hover { background: #FFF6F6; }
//     .menuSignout svg { width: 16px; height: 16px; color: #FF4D4D; }

//     .dashMain { margin-top: 58px; max-width: 1200px; margin-left: auto; margin-right: auto; padding: 48px 40px 80px; }
//     .statsGrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 48px; }
//     .statCard { background: #fff; border: 1px solid #E8E8E8; border-radius: 12px; padding: 24px 20px; }
//     .statLabel { font-size: 9px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px; }
//     .statValue { font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; letter-spacing: -0.5px; }
//     .statChange { font-size: 11px; font-weight: 600; color: #00B050; }
//     .statSub { font-size: 10px; color: #999; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }

//     .quickActions { margin-bottom: 56px; }
//     .qaLabel { font-size: 10px; font-weight: 800; letter-spacing: 0.18em; color: rgba(26,26,26,0.40); text-transform: uppercase; margin-bottom: 22px; }
//     .qaGrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
//     .qaCard { background: #fff; border: 1px solid #EDEDED; border-radius: 20px; padding: 28px 26px 24px; cursor: pointer; transition: all 0.18s ease; min-height: 160px; position: relative; user-select: none; }
//     .qaCard:hover { border-color: #B87333; box-shadow: 0 14px 28px rgba(0,0,0,0.06); transform: translateY(-1px); }
//     .qaCard:active { border-color: #B87333; box-shadow: 0 18px 38px rgba(0,0,0,0.10); transform: translateY(0); }
//     .qaCard:focus-visible { outline: none; border-color: #B87333; box-shadow: 0 18px 38px rgba(0,0,0,0.10); }
//     .qaIconBox, .qaIconCoin { width: 42px; height: 42px; border-radius: 12px; border: 1px solid #EFEFEF; background: #F7F7F7; display: grid; place-items: center; color: #1a1a1a; margin-bottom: 18px; transition: all 0.18s ease; }
//     .qaIconBox svg, .qaIconCoin svg { width: 18px; height: 18px; color: currentColor; fill: currentColor; }
//     .qaCard:hover .qaIconBox, .qaCard:hover .qaIconCoin, .qaCard:active .qaIconBox, .qaCard:active .qaIconCoin { background: #B87333; border-color: #B87333; color: #fff; }
//     .qaTitle { font-size: 18px; font-weight: 900; font-style: italic; color: #1a1a1a; letter-spacing: -0.4px; margin-bottom: 8px; text-transform: uppercase; line-height: 1.15; }
//     .qaDesc { font-size: 10px; font-weight: 800; color: rgba(26,26,26,0.42); letter-spacing: 0.12em; text-transform: uppercase; line-height: 1.55; }

//     .reportsSection { margin-bottom: 56px; }
//     .reportsHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
//     .reportsTitle { font-size: 22px; font-weight: 700; font-style: italic; color: #1a1a1a; text-transform: uppercase; }
//     .viewAllLink { font-size: 11px; font-weight: 700; color: #B87333; cursor: pointer; text-transform: uppercase; letter-spacing: 0.08em; }
//     .viewAllLink:hover { text-decoration: underline; }
//     .filterTabs { display: flex; gap: 12px; margin-bottom: 24px; }
//     .filterTab { padding: 8px 16px; background: #fff; border: 1px solid #EDEDED; border-radius: 20px; font-size: 10px; font-weight: 800; color: #999; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.08em; }
//     .filterTab:hover { border-color: #D9D9D9; }
//     .filterTab.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
//     .reportsGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
//     .reportCard { background: #fff; border: 1px solid #E8E8E8; border-radius: 16px; padding: 24px 20px 22px; cursor: pointer; transition: all 0.2s; position: relative; }
//     .reportCard:hover { border-color: #B87333; transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
//     .reportBadge { position: absolute; top: 18px; right: 18px; padding: 4px 10px; background: #1a1a1a; color: #fff; border-radius: 12px; font-size: 8px; font-weight: 800; letter-spacing: 0.08em; }
//     .reportDate { font-size: 9px; color: #999; margin-bottom: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
//     .reportIcon { width: 44px; height: 44px; background: #FAFAFA; border: 1px solid #EDEDED; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 14px; }
//     .reportTitle { font-size: 16px; font-weight: 800; font-style: italic; margin-bottom: 4px; color: #1a1a1a; text-transform: uppercase; letter-spacing: -0.3px; }
//     .reportValue { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 4px; font-weight: 700; }
//     .reportPrice { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; letter-spacing: -0.5px; }
//     .reportFooter { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid #F5F5F5; }
//     .reportScore { font-size: 11px; font-weight: 700; color: #B87333; text-transform: uppercase; letter-spacing: 0.05em; }
//     .reportActions { display: flex; gap: 8px; }
//     .reportActionBtn { padding: 7px 14px; background: #1a1a1a; color: #fff; border: none; border-radius: 6px; font-size: 9px; font-weight: 800; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.08em; }
//     .reportActionBtn:hover { background: #000; }
//     .downloadIcon { width: 30px; height: 30px; background: #F8F8F8; border: 1px solid #EDEDED; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #666; }
//     .downloadIcon:hover { background: #EDEDED; }

//     .subscriptionCard { background: #fff; border: 1px solid #EDEDED; border-radius: 16px; padding: 28px 24px; margin-bottom: 32px; }
//     .subHeader { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
//     .subIcon { width: 40px; height: 40px; background: #B87333; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; }
//     .subTitle { font-size: 16px; font-weight: 800; font-style: italic; color: #1a1a1a; text-transform: uppercase; letter-spacing: -0.3px; }
//     .subGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
//     .subStat { padding: 16px 14px; background: #FAFAFA; border-radius: 10px; }
//     .subStatLabel { font-size: 8px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px; }
//     .subStatValue { font-size: 14px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.3px; }
//     .subStatActive { color: #00B050; }
//     .usageBar { margin-bottom: 20px; }
//     .usageLabel { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px; font-weight: 800; }
//     .usageProgress { height: 8px; background: #F5F5F5; border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
//     .usageProgressBar { height: 100%; background: linear-gradient(90deg, #B87333, #D4A574); border-radius: 4px; transition: width 0.3s; }
//     .usageText { font-size: 9px; color: #999; text-align: right; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
//     .subButtons { display: flex; gap: 12px; }
//     .subBtn { flex: 1; padding: 12px; border: none; border-radius: 8px; font-size: 10px; font-weight: 800; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.08em; }
//     .subBtnPrimary { background: #1a1a1a; color: #fff; }
//     .subBtnPrimary:hover { background: #000; }
//     .subBtnSecondary { background: #FAFAFA; color: #999; border: 1px solid #EDEDED; }
//     .subBtnSecondary:hover { background: #F5F5F5; color: #666; }

//     .upgradeCTA { background: linear-gradient(135deg, #1a1a1a, #2a2a2a); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 48px 40px; text-align: center; color: #fff; margin-bottom: 60px; }
//     .ctaIcon { font-size: 28px; margin-bottom: 16px; }
//     .ctaTitle { font-size: 26px; font-weight: 700; font-style: italic; margin-bottom: 12px; line-height: 1.2; text-transform: uppercase; letter-spacing: -0.5px; }
//     .ctaDesc { font-size: 11px; color: rgba(255,255,255,0.7); margin-bottom: 24px; max-width: 700px; margin-left: auto; margin-right: auto; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.6; }
//     .ctaButtons { display: flex; gap: 12px; justify-content: center; }
//     .ctaBtn { padding: 14px 24px; border: none; border-radius: 8px; font-size: 10px; font-weight: 800; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.08em; }
//     .ctaBtnPrimary { background: #B87333; color: #fff; }
//     .ctaBtnPrimary:hover { background: #A06229; }
//     .ctaBtnSecondary { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.2); }
//     .ctaBtnSecondary:hover { background: rgba(255,255,255,0.1); }
//     .ctaRating { margin-top: 20px; font-size: 10px; color: rgba(255,255,255,0.5); letter-spacing: 0.05em; }
//     .ctaStars { color: #B87333; margin-right: 8px; }

//     /* Terminal iframe container */
//     .terminalMain {
//       margin-top: 58px;
//       height: calc(100vh - 58px);
//       overflow: hidden;
//       position: relative;
//     }
//     .terminalFrame {
//       width: 100%;
//       height: 100%;
//       border: none;
//       display: block;
//     }

//     @media (max-width: 1024px) {
//       .navLinks { display: none; }
//       .dashMain { padding: 40px 28px 60px; }
//       .statsGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
//       .statCard { padding: 18px 16px; border-radius: 14px; }
//       .statLabel { font-size: 9px; letter-spacing: 0.14em; }
//       .statValue { font-size: 20px; }
//       .reportsGrid { grid-template-columns: repeat(2, 1fr); }
//       .qaGrid { grid-template-columns: 1fr; }
//       .qaCard { min-height: unset; }
//     }
//     @media (max-width: 640px) {
//       .topNav { padding: 0 16px; }
//       .profileMeta { display: none; }
//       .dashMain { padding: 32px 20px 60px; }
//       .statsGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
//       .statCard { padding: 18px 16px; border-radius: 14px; }
//       .statValue { font-size: 20px; }
//       .reportsGrid { grid-template-columns: 1fr; }
//       .subGrid { grid-template-columns: 1fr; }
//       .ctaButtons { flex-direction: column; }
//       .ctaTitle { font-size: 22px; }
//     }
//   `;

//   return (
//     <>
//       <style>{UI_CSS}</style>

//       {/* ── TOP NAVIGATION ── */}
//       <nav className="topNav">
//         <div className="navLeft">

//           {/* ── DYNAMIC LOGO ── */}
//           <div
//             className="navBrand"
//             onClick={() => { setActiveTab("dashboard"); navigate("/"); }}
//           >
//             {activeTab === "terminal" ? (
//               /* ACQAR SIGNAL™ logo */
//               <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//                 <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: "0.12em", lineHeight: 1 }}>
//                   <span style={{ color: "#B87333" }}>ACQ</span>
//                   <span style={{ color: "#111111" }}>AR</span>
//                 </span>
//                 <span style={{
//                   display: "inline-flex", alignItems: "center", gap: 5,
//                   padding: "3px 9px", borderRadius: 999,
//                   background: "rgba(0,200,100,0.10)",
//                   border: "1px solid rgba(0,200,100,0.30)",
//                 }}>
//                   <span style={{
//                     width: 6, height: 6, borderRadius: "50%",
//                     background: "#00C864", display: "inline-block",
//                     boxShadow: "0 0 6px rgba(0,200,100,0.6)",
//                   }} />
//                   <span style={{
//                     fontSize: 9, fontWeight: 900, color: "#00C864",
//                     letterSpacing: "0.16em", textTransform: "uppercase",
//                   }}>SIGNAL™</span>
//                 </span>
//               </div>
//             ) : activeTab === "reports" ? (
//               /* ACQAR TRUVALU™ logo */
//               <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//                 <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: "0.12em", lineHeight: 1 }}>
//                   <span style={{ color: "#B87333" }}>ACQ</span>
//                   <span style={{ color: "#111111" }}>AR</span>
//                 </span>
//                 <span style={{
//                   display: "inline-flex", alignItems: "center", gap: 5,
//                   padding: "3px 9px", borderRadius: 999,
//                   background: "rgba(184,115,51,0.10)",
//                   border: "1px solid rgba(184,115,51,0.30)",
//                 }}>
//                   <span style={{
//                     fontSize: 9, fontWeight: 900, color: "#B87333",
//                     letterSpacing: "0.16em", textTransform: "uppercase",
//                   }}>TRUVALU™</span>
//                 </span>
//               </div>
//             ) : (
//               /* Default ACQAR logo */
//               <h1 style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.12em", margin: 0, lineHeight: 1 }}>
//                 <span style={{ color: "#B87333" }}>ACQ</span>
//                 <span style={{ color: "#111111" }}>AR</span>
//               </h1>
//             )}
//           </div>

//           {/* ── NAV LINKS ── */}
//           <div className="navLinks">
//             {/* <div
//               className={`navLink ${activeTab === "dashboard" ? "active" : ""}`}
//               onClick={() => { setActiveTab("dashboard"); navigate("/dashboard"); }}
//             >
//               DASHBOARD
//             </div> */}
//             <div
//               className={`navLink ${activeTab === "terminal" ? "terminal-active" : ""}`}
//               onClick={() => setActiveTab("terminal")}
//             >
//               TERMINAL
//             </div>
//             <div
//               className={`navLink ${activeTab === "reports" ? "active" : ""}`}
//               onClick={() => { setActiveTab("reports"); navigate("/my-reports"); }}
//             >
//               MY REPORTS
//             </div>
//             <div
//               className={`navLink ${activeTab === "settings" ? "active" : ""}`}
//               onClick={() => { setActiveTab("settings"); navigate("/settings"); }}
//             >
//               SETTINGS
//             </div>
//           </div>
//         </div>

//         {/* ── RIGHT SIDE ── */}
//         <div className="navRight" ref={menuWrapRef}>
//           <button className="bellBtn" type="button" aria-label="Notifications">
//             <svg className="bellIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//               <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
//               <path d="M13.73 21a2 2 0 01-3.46 0" />
//             </svg>
//             <span className="notificationDot" />
//           </button>

//           <div className="profileWrap">
//             <button type="button" className="profileBtn" onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={menuOpen ? "true" : "false"}>
//               <div className="profileMeta">
//                 <div className="profileName">{nameToShow}</div>
//               </div>
//               <div className="profileAvatar">{initials}</div>
//               <svg className="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <polyline points="6 9 12 15 18 9" />
//               </svg>
//             </button>

//             {menuOpen && (
//               <div className="menu" role="menu">
//                 <div className="menuTop">
//                   <div className="menuTopLabel">Authenticated Account</div>
//                   <div className="menuName">{nameToShow}</div>
//                   <div className="menuTier">VALUCHECK™ Premium Member</div>
//                 </div>
//                 <div className="menuList">
//                   <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); setActiveTab("dashboard"); navigate("/dashboard"); }}>
//                     <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
//                     </svg>
//                     {/* <div className="menuText">Dashboard</div> */}
//                   </div>
//                   <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); setActiveTab("terminal"); }}>
//                     <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <rect x="2" y="3" width="20" height="18" rx="2" />
//                       <path d="M8 10l4 4 4-4" />
//                     </svg>
//                     <div className="menuText" style={{ color: "#00C864" }}>Terminal</div>
//                   </div>
//                   <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); setActiveTab("reports"); navigate("/my-reports"); }}>
//                     <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
//                       <path d="M14 2v6h6" />
//                     </svg>
//                     <div className="menuText">My Reports</div>
//                   </div>
//                   <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); setActiveTab("settings"); navigate("/settings"); }}>
//                     <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" />
//                       <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.05.05a2 2 0 0 1-1.41 3.41h-.1a1.7 1.7 0 0 0-1.6 1.16 1.7 1.7 0 0 0-.37.62 2 2 0 0 1-3.82 0 1.7 1.7 0 0 0-.37-.62 1.7 1.7 0 0 0-1.6-1.16H9.5a2 2 0 0 1-1.41-3.41l.05-.05A1.7 1.7 0 0 0 8.6 15a1.7 1.7 0 0 0-1.06-1.6l-.06-.03a2 2 0 0 1 0-3.74l.06-.03A1.7 1.7 0 0 0 8.6 9a1.7 1.7 0 0 0-.34-1.87l-.05-.05A2 2 0 0 1 9.62 3.7h.1a1.7 1.7 0 0 0 1.6-1.16 2 2 0 0 1 3.82 0 1.7 1.7 0 0 0 1.6 1.16h.1A2 2 0 0 1 21 6.98l-.05.05A1.7 1.7 0 0 0 20.6 9a1.7 1.7 0 0 0 1.06 1.6l.06.03a2 2 0 0 1 0 3.74l-.06.03A1.7 1.7 0 0 0 19.4 15z" />
//                     </svg>
//                     <div className="menuText">Account Settings</div>
//                   </div>
//                   <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); navigate("/billing"); }}>
//                     <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <rect x="2" y="5" width="20" height="14" rx="2" />
//                       <path d="M2 10h20" />
//                     </svg>
//                     <div className="menuText">Billing & Plans</div>
//                   </div>
//                   <div className="menuDivider" />
//                   <div className="menuSignout" role="menuitem" onClick={async () => { setMenuOpen(false); await handleLogout(); }}>
//                     <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 3v18" />
//                     </svg>
//                     SIGN OUT
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </nav>

//       {/* ── TERMINAL VIEW ── */}
//       {activeTab === "terminal" && (
//         <main className="terminalMain">
//           <iframe
//             src="https://signal.acqar.com/dashboard"
//             className="terminalFrame"
//             title="ACQAR Signal Terminal"
//             allow="fullscreen"
//           />
//         </main>
//       )}

//       {/* ── DASHBOARD VIEW ── */}
//       {activeTab !== "terminal" && (
//         <>
//           <main className="dashMain">
//             {/* Header */}
//             <div style={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: isMobile ? "flex-start" : "center",
//               flexDirection: isMobile ? "column" : "row",
//               gap: isMobile ? 16 : 22,
//               marginBottom: isMobile ? 24 : 36,
//               width: "100%",
//             }}>
//               <div style={{ minWidth: 0, flex: 1, width: "100%" }}>
//                 <h1 style={{
//                   fontSize: isMobile ? 28 : 36, fontWeight: 900, fontStyle: "italic",
//                   letterSpacing: isMobile ? "-0.6px" : "-0.8px", marginBottom: 8,
//                   color: "#1a1a1a", textTransform: "uppercase", lineHeight: 1.05,
//                 }}>
//                   WELCOME BACK, {nameToShow.toUpperCase()}
//                 </h1>
//                 <p style={{
//                   fontSize: isMobile ? 10 : 11, color: "rgba(26,26,26,0.45)",
//                   fontWeight: 800, letterSpacing: isMobile ? "0.12em" : "0.14em", textTransform: "uppercase",
//                 }}>
//                   YOU HAVE {valuations.length} ACTIVE REPORTS IN YOUR DASHBOARD
//                 </p>
//                 <div style={{
//                   display: "inline-flex", alignItems: "center", gap: 8,
//                   padding: isMobile ? "10px 14px" : "8px 14px",
//                   background: "rgba(184,115,51,0.10)", border: "1px solid rgba(184,115,51,0.26)",
//                   borderRadius: isMobile ? 18 : 999, fontSize: 9, fontWeight: 900, color: "#B87333",
//                   textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 12,
//                   width: isMobile ? "100%" : "fit-content", maxWidth: "100%",
//                 }}>
//                   🏆 EARLY ACQAR MEMBER - VALUCHECK™ FREE FOREVER
//                 </div>
//               </div>
//               <div style={{
//                 marginLeft: isMobile ? 0 : "auto", width: isMobile ? "100%" : "auto",
//                 display: "flex", justifyContent: isMobile ? "center" : "flex-end", alignItems: "center",
//               }}>
//                 <button onClick={() => navigate("/valuation")} style={{
//                   height: isMobile ? 48 : 44, width: isMobile ? "100%" : 220,
//                   padding: "0 22px", background: "#111", color: "#fff",
//                   border: "1px solid rgba(0,0,0,0.10)", borderRadius: isMobile ? 14 : 12,
//                   fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", cursor: "pointer",
//                   textTransform: "uppercase", display: "flex", alignItems: "center",
//                   justifyContent: "center", gap: 10, whiteSpace: "nowrap",
//                   boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
//                 }}>
//                   <span style={{
//                     display: "grid", placeItems: "center", width: 18, height: 18,
//                     borderRadius: 6, background: "rgba(255,255,255,0.10)",
//                     border: "1px solid rgba(255,255,255,0.10)", fontWeight: 900, lineHeight: 1,
//                   }}>+</span>
//                   NEW VALUATION
//                 </button>
//               </div>
//             </div>

//             {/* Stats Grid */}
//             <div className="statsGrid">
//               <div className="statCard">
//                 <div className="statLabel">TOTAL VALUE</div>
//                 <div className="statValue">{fmtAED(totalPortfolio)}</div>
//                 <div className="statChange">+5.2% ↗</div>
//               </div>
//               <div className="statCard">
//                 <div className="statLabel">PROPERTIES</div>
//                 <div className="statValue">{valuations.length}</div>
//                 <div className="statSub">MARKET STABLE</div>
//               </div>
//               <div className="statCard">
//                 <div className="statLabel">AVG SCORE</div>
//                 <div className="statValue">82/100</div>
//                 <div style={{ fontSize: 10, color: "#B87333", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>EXCEEDS AREA</div>
//               </div>
//               <div className="statCard">
//                 <div className="statLabel">ACTIVE SUBSCRIPTION</div>
//                 <div className="statValue">VALUCHECK™</div>
//                 <div className="statChange">ACTIVE ✓</div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="quickActions">
//               <div className="qaLabel">QUICK ACTIONS</div>
//               <div className="qaGrid">
//                 <div className="qaCard" onClick={() => navigate("/valuation")} role="button" tabIndex={0}>
//                   <div className="qaIconBox">
//                     <svg viewBox="0 0 24 24" aria-hidden="true">
//                       <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" fill="currentColor" />
//                     </svg>
//                   </div>
//                   <div className="qaTitle">NEW VALUATION</div>
//                   <div className="qaDesc">GET INSTANT PROPERTY INTELLIGENCE FOR ANY ASSET.</div>
//                 </div>
//                 <div className="qaCard" onClick={() => { setActiveTab("terminal"); }} role="button" tabIndex={0}>
//                   <div className="qaIconCoin">
//                     <svg viewBox="0 0 24 24">
//                       <rect x="2" y="3" width="20" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
//                       <path d="M8 10l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//                     </svg>
//                   </div>
//                   <div className="qaTitle">TERMINAL</div>
//                   <div className="qaDesc">ACCESS ACQAR SIGNAL™ LIVE MARKET INTELLIGENCE.</div>
//                 </div>
//                 <div className="qaCard" onClick={() => navigate("/settings")} role="button" tabIndex={0}>
//                   <div className="qaIconBox">
//                     <svg viewBox="0 0 24 24" aria-hidden="true">
//                       <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" fill="none" stroke="currentColor" strokeWidth="2" />
//                       <path d="M19.4 15a1.8 1.8 0 0 0 .35 1.9l.05.05a2 2 0 0 1-1.42 3.42h-.1a1.8 1.8 0 0 0-1.7 1.2 2 2 0 0 1-3.84 0 1.8 1.8 0 0 0-1.7-1.2H9.5a2 2 0 0 1-1.42-3.42l.05-.05A1.8 1.8 0 0 0 8.6 15a1.8 1.8 0 0 0-1.1-1.7l-.06-.03a2 2 0 0 1 0-3.74l.06-.03A1.8 1.8 0 0 0 8.6 9a1.8 1.8 0 0 0-.35-1.9l-.05-.05A2 2 0 0 1 9.62 3.7h.1a1.8 1.8 0 0 0 1.7-1.2 2 2 0 0 1 3.84 0 1.8 1.8 0 0 0 1.7 1.2h.1A2 2 0 0 1 21 6.98l-.05.05A1.8 1.8 0 0 0 20.6 9a1.8 1.8 0 0 0 1.1 1.7l.06.03a2 2 0 0 1 0 3.74l-.06.03A1.8 1.8 0 0 0 19.4 15z" fill="none" stroke="currentColor" strokeWidth="2" />
//                     </svg>
//                   </div>
//                   <div className="qaTitle">ACCOUNT SETTINGS</div>
//                   <div className="qaDesc">MANAGE YOUR PROFILE, BILLING AND PREFERENCES.</div>
//                 </div>
//               </div>
//             </div>

//             {/* Reports Section */}
//             <div className="reportsSection">
//               <div className="reportsHeader">
//                 <div className="reportsTitle">RECENT REPORTS</div>
//                 <div className="viewAllLink" onClick={() => setShowAllValuations(!showAllValuations)}>
//                   {showAllValuations ? "SHOW LESS" : "VIEW ALL REPORTS →"}
//                 </div>
//               </div>
//               <div className="filterTabs">
//                 <div className={`filterTab ${activeFilter === "ALL" ? "active" : ""}`} onClick={() => setActiveFilter("ALL")}>ALL</div>
//                 <div className={`filterTab ${activeFilter === "VALUCHECK" ? "active" : ""}`} onClick={() => setActiveFilter("VALUCHECK")}>VALUCHECK™</div>
//               </div>
//               {reportCards.length === 0 ? (
//                 <div style={{ padding: "60px 40px", textAlign: "center", color: "#999", background: "#FAFAFA", borderRadius: "16px", border: "1px solid #EDEDED" }}>
//                   <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
//                   <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px", color: "#1a1a1a" }}>No Valuations Yet</div>
//                   <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Create your first valuation to see it here.</div>
//                 </div>
//               ) : (
//                 <div className="reportsGrid">
//                   {(showAllValuations ? reportCards : reportCards.slice(0, 6)).map((card) => (
//                     <div key={card.id} className="reportCard" onClick={() => navigate(`/report?id=${card.id}`)}>
//                       <div className="reportBadge">{card.badge}</div>
//                       <div className="reportDate">{card.date}</div>
//                       <div className="reportIcon">🏠</div>
//                       <div className="reportTitle">{card.title}</div>
//                       <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
//                         {card.bedrooms != null && (
//                           <span style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
//                             🛏 {card.bedrooms === 0 || String(card.bedrooms).toLowerCase() === "studio" ? "Studio" : `${card.bedrooms} Bed`}
//                           </span>
//                         )}
//                         {card.bathrooms != null && (
//                           <><span style={{ width: 3, height: 3, borderRadius: "50%", background: "#ccc", display: "inline-block", flexShrink: 0 }} />
//                           <span style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>🚿 {card.bathrooms} Bath</span></>
//                         )}
//                         {card.sizeSqft != null && (
//                           <><span style={{ width: 3, height: 3, borderRadius: "50%", background: "#ccc", display: "inline-block", flexShrink: 0 }} />
//                           <span style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>📐 {card.sizeSqft.toLocaleString()} sqft</span></>
//                         )}
//                       </div>
//                       {card.district && (
//                         <div style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>📍 {card.district}</div>
//                       )}
//                       <div className="reportValue">ASSET VALUE</div>
//                       <div className="reportPrice">{fmtAEDFull(card.value)}</div>
//                       <div className="reportFooter">
//                         <div className="reportScore">SCORE: {card.score}/100</div>
//                         <div className="reportActions">
//                           <button className="reportActionBtn">VIEW REPORT</button>
//                           <div className="downloadIcon">↓</div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Subscription Card */}
//             <div className="subscriptionCard">
//               <div className="subHeader">
//                 <div className="subIcon">⚡</div>
//                 <div className="subTitle">YOUR VALUCHECK™ SUBSCRIPTION</div>
//               </div>
//               <div className="subGrid">
//                 <div className="subStat"><div className="subStatLabel">STATUS</div><div className="subStatValue subStatActive">● ACTIVE</div></div>
//                 <div className="subStat"><div className="subStatLabel">NEXT BILLING</div><div className="subStatValue">Free</div></div>
//                 <div className="subStat"><div className="subStatLabel">REPORTS USED</div><div className="subStatValue">{valuations.length} <span style={{ fontSize: "10px", color: "#999", fontWeight: "500" }}>Reports</span></div></div>
//               </div>
//               <div className="usageBar">
//                 <div className="usageLabel">USAGE THIS MONTH</div>
//                 <div className="usageProgress"><div className="usageProgressBar" style={{ width: "60%" }} /></div>
//                 <div className="usageText">60% USED</div>
//               </div>
//               <div className="subButtons">
//                 <button className="subBtn subBtnPrimary">MANAGE SUBSCRIPTION</button>
//                 <button className="subBtn subBtnSecondary">VIEW BILLING HISTORY</button>
//               </div>
//             </div>

//             {/* Upgrade CTA */}
//             <div className="upgradeCTA">
//               <div className="ctaIcon">⚡</div>
//               <div className="ctaTitle">UPGRADE TO INVESTMENT-GRADE INTELLIGENCE</div>
//               <div className="ctaDesc">GET EXACT VALUATIONS (±5%), INVESTMENT SCORES, AND 3-YEAR FORECASTS WITH DEALLENS™. TRUSTED BY 2,500+ DUBAI INVESTORS.</div>
//               <div className="ctaButtons">
//                 <button className="ctaBtn ctaBtnPrimary">UPGRADE TO DEALLENS™ - AED 149 →</button>
//                 <button className="ctaBtn ctaBtnSecondary">SEE ALL PLANS</button>
//               </div>
//               <div className="ctaRating"><span className="ctaStars">★★★★★</span><span>4.9/5 Rating</span></div>
//               <div style={{ fontSize: "9px", marginTop: "8px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>VERIFIED BY 347 GLOBAL PORTFOLIO MANAGERS</div>
//             </div>
//           </main>

//           <Footer />
//         </>
//       )}
//     </>
//   );
// }












import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useLogout } from "../hooks/useLogout";

/* ── FOOTER COMPONENT ── */
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

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [showAllValuations, setShowAllValuations] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);

  // ── NEW: active tab state ──
  const [activeTab, setActiveTab] = useState("terminal"); // "dashboard" | "terminal" | "reports" | "settings"
  const [showFoundingPopup, setShowFoundingPopup] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef(null);

  const nameToShow = useMemo(() => {
    const n = (profile?.name || "").trim();
    if (n) return n;
    const em = (profile?.email || "").split("@")[0] || "User";
    return em.charAt(0).toUpperCase() + em.slice(1);
  }, [profile]);

  const initials = useMemo(() => {
    const parts = (nameToShow || "").trim().split(/\s+/).filter(Boolean);
    const a = (parts[0] || "A")[0] || "A";
    const b = (parts[1] || parts[0] || "M")[0] || "M";
    return (a + b).toUpperCase();
  }, [nameToShow]);

  function fmtAED(n) {
    const x = Number(n);
    if (!Number.isFinite(x) || x <= 0) return "—";
    if (x >= 1_000_000) return `AED ${(x / 1_000_000).toFixed(1)}M`;
    return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  function fmtAEDFull(n) {
    const x = Number(n);
    if (!Number.isFinite(x) || x <= 0) return "—";
    return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "TODAY";
    if (days === 1) return "1 DAY AGO";
    if (days < 30) return `${days} DAYS AGO`;
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  }

  const selectedPassportId = useMemo(() => {
    return valuations?.length ? valuations[0].id : null;
  }, [valuations]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setMsg("");
        const { data, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        const user = data?.user;
        if (!user?.id) { navigate("/login"); return; }
        const authId = user.id;
        const authEmail = (user.email || "").toLowerCase();
        const metaName = (user.user_metadata?.name || user.user_metadata?.full_name || user.user_metadata?.display_name || "").trim();

        let { data: uRow, error: byIdErr } = await supabase.from("users").select("id, role, name, email, phone, created_at, account_type, plan").eq("id", authId).maybeSingle();
        if (byIdErr) console.warn("users select by id:", byIdErr.message);

        if (!uRow && authEmail) {
          const { data: emailRow, error: byEmailErr } = await supabase.from("users").select("id, role, name, email, phone, created_at, account_type, plan").eq("email", authEmail).maybeSingle();
          if (byEmailErr) console.warn("users select by email:", byEmailErr.message);
          if (emailRow?.id && emailRow.id !== authId) {
            const payload = { id: authId, email: authEmail, role: emailRow.role || null, name: (emailRow.name || metaName || "").trim() || null, phone: emailRow.phone || null };
            const { error: migrateUpsertErr } = await supabase.from("users").upsert(payload, { onConflict: "id" });
            if (migrateUpsertErr) { console.warn("users migrate upsert:", migrateUpsertErr.message); } else {
              const { error: delErr } = await supabase.from("users").delete().eq("id", emailRow.id);
              if (delErr) console.warn("users delete old row:", delErr.message);
              const { data: after, error: afterErr } = await supabase.from("users").select("id, role, name, email, phone, created_at, account_type").eq("id", authId).maybeSingle();
              if (afterErr) console.warn("users select after migrate:", afterErr.message);
              uRow = after || null;
            }
          } else { uRow = emailRow || null; }
        }

        if (!uRow) {
          const payload = { id: authId, email: authEmail, name: metaName || null };
          const { error: createErr } = await supabase.from("users").upsert(payload, { onConflict: "id" });
          if (createErr) console.warn("users create upsert:", createErr.message);
          const { data: createdRow, error: createdSelErr } = await supabase.from("users").select("id, role, name, email, phone, created_at, account_type").eq("id", authId).maybeSingle();
          if (createdSelErr) console.warn("users select created:", createdSelErr.message);
          uRow = createdRow || null;
        }

        if (uRow && !(uRow.name || "").trim() && metaName) {
          const { data: updated, error: updErr } = await supabase.from("users").update({ name: metaName }).eq("id", authId).select("id, role, name, email, phone, created_at, account_type").maybeSingle();
          if (updErr) console.warn("users update name:", updErr.message);
          else uRow = updated || uRow;
        }

        if (!mounted) return;
        setProfile(uRow || { id: authId, name: metaName || null, email: authEmail || null, phone: null, created_at: null });

        const { data: vRows, error: vErr } = await supabase.from("valuations").select("id, property_name, building_name, district, created_at, estimated_valuation, form_payload").eq("user_id", authId).order("created_at", { ascending: false }).limit(12);
        if (!mounted) return;
        if (vErr) { console.warn("valuations select:", vErr.message); setValuations([]); } else { setValuations(vRows || []); }
        // Show founding member popup for free users
if (uRow?.plan !== "pro" && uRow?.plan !== "elite") {
  setTimeout(() => setShowFoundingPopup(true), 1500);
}
      } catch (e) {
        if (!mounted) return;
        setMsg(e?.message || "Failed to load dashboard.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [navigate]);

  useEffect(() => {
    function onDown(e) { if (e.key === "Escape") setMenuOpen(false); }
    function onClick(e) { const el = menuWrapRef.current; if (!el) return; if (!el.contains(e.target)) setMenuOpen(false); }
    window.addEventListener("keydown", onDown);
    window.addEventListener("mousedown", onClick);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("mousedown", onClick); };
  }, []);

    // Add this useEffect near your other useEffects
useEffect(() => {
  if (location.state?.tab) {
    setActiveTab(location.state.tab);
    // Clear the state so refreshing doesn't re-trigger it
    window.history.replaceState({}, document.title);
  }
}, [location.state]);
  const handleLogout = useLogout();

  const totalPortfolio = useMemo(() => {
    return valuations.reduce((acc, r) => acc + (Number(r.estimated_valuation) || 0), 0) || 0;
  }, [valuations]);

  const reportCards = useMemo(() => {
    if (!valuations?.length) return [];
    return valuations.map((v) => {
      const property = (v.property_name || "").trim();
      const building = (v.building_name || "").trim();
      const district = (v.district || "").trim();
      const title = property || building || "Property";
      const unitInfo = building && building !== title ? building : "";
      return {
        id: v.id, title, unitInfo, district,
        date: fmtDate(v.created_at),
        value: Number(v.estimated_valuation) || 0,
        score: Math.floor(Math.random() * 30) + 70,
        bedrooms: v.form_payload?.bedrooms ?? v.form_payload?.rooms_en ?? null,
        bathrooms: v.form_payload?.bathrooms ?? v.form_payload?.bathrooms_en ?? null,
        sizeSqft: v.form_payload?.procedure_area ? Math.round(Number(v.form_payload.procedure_area) * 10.764) : null,
        badge: "VALUCHECK™",
      };
    });
  }, [valuations]);

  const UI_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; background: #FAFAFA; color: #1a1a1a; }

    .topNav {
      position: fixed; top: 0; left: 0; right: 0; height: 58px;
      background: #FFFFFF; border-bottom: 1px solid #EAEAEA;
      z-index: 100; display: flex; align-items: center;
      justify-content: space-between; padding: 0 28px;
    }
    .navLeft { display: flex; align-items: center; gap: 44px; min-width: 0; }
    .navBrand { font-size: 14px; font-weight: 900; letter-spacing: 0.16em; color: #1a1a1a; cursor: pointer; text-transform: uppercase; line-height: 1; }
    .navLinks { display: flex; gap: 26px; align-items: center; }
    .navLink { font-size: 10px; font-weight: 800; letter-spacing: 0.14em; color: rgba(26,26,26,0.55); cursor: pointer; text-transform: uppercase; line-height: 1; padding: 18px 0; position: relative; user-select: none; }
    .navLink:hover { color: #B87333; }
    .navLink.active { color: #B87333; }
    .navLink.active::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0px; height: 2px; background: #B87333; border-radius: 2px; }
    .navLink.terminal-active { color: #B87333; }
    .navLink.terminal-active::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0px; height: 2px; background: #B87333; border-radius: 2px; }
    .navRight { display: flex; align-items: center; gap: 16px; }
    .bellBtn { width: 34px; height: 34px; border-radius: 999px; background: transparent; border: none; display: grid; place-items: center; cursor: pointer; position: relative; }
    .bellIcon { width: 16px; height: 16px; color: rgba(26,26,26,0.75); }
    .notificationDot { position: absolute; top: 8px; right: 8px; width: 7px; height: 7px; background: #B87333; border-radius: 50%; border: 2px solid #fff; }
    .profileWrap { position: relative; }
    .profileBtn { display: flex; align-items: center; gap: 10px; cursor: pointer; border: none; background: transparent; padding: 4px 0; }
    .profileMeta { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.05; }
    .profileName { font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: #1a1a1a; white-space: nowrap; max-width: 220px; overflow: hidden; text-overflow: ellipsis; }
    .profileAvatar { width: 28px; height: 28px; border-radius: 999px; background: #B87333; display: grid; place-items: center; color: #fff; font-size: 10px; font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase; }
    .caret { width: 14px; height: 14px; color: rgba(26,26,26,0.55); margin-left: 2px; }

    .menu { position: absolute; top: calc(100% + 10px); right: 0; width: 220px; background: #fff; border: 1px solid #EAEAEA; border-radius: 12px; box-shadow: 0 18px 40px rgba(0,0,0,0.10); overflow: hidden; z-index: 200; }
    .menuTop { padding: 14px 16px 12px; border-bottom: 1px solid #EFEFEF; background: #fff; }
    .menuTopLabel { font-size: 9px; font-weight: 900; letter-spacing: 0.18em; color: rgba(26,26,26,0.35); text-transform: uppercase; margin-bottom: 8px; }
    .menuName { font-size: 13px; font-weight: 900; font-style: italic; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.02em; margin-bottom: 4px; line-height: 1.1; }
    .menuTier { font-size: 9px; font-weight: 900; letter-spacing: 0.14em; color: #B87333; text-transform: uppercase; line-height: 1.1; }
    .menuList { padding: 8px 0; }
    .menuItem { display: flex; align-items: center; gap: 10px; padding: 11px 16px; cursor: pointer; user-select: none; transition: background 0.14s; }
    .menuItem:hover { background: #FAFAFA; }
    .menuIcon { width: 16px; height: 16px; color: rgba(26,26,26,0.55); flex-shrink: 0; }
    .menuText { font-size: 10px; font-weight: 900; letter-spacing: 0.14em; color: #1a1a1a; text-transform: uppercase; }
    .menuDivider { height: 1px; background: #EFEFEF; margin: 8px 0; }
    .menuSignout { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px 16px 14px; cursor: pointer; color: #FF4D4D; font-size: 10px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase; user-select: none; transition: background 0.14s; }
    .menuSignout:hover { background: #FFF6F6; }
    .menuSignout svg { width: 16px; height: 16px; color: #FF4D4D; }

    .dashMain { margin-top: 58px; max-width: 1200px; margin-left: auto; margin-right: auto; padding: 48px 40px 80px; }
    .statsGrid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 48px; }
    .statCard { background: #fff; border: 1px solid #E8E8E8; border-radius: 12px; padding: 24px 20px; }
    .statLabel { font-size: 9px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px; }
    .statValue { font-size: 24px; font-weight: 700; color: #1a1a1a; margin-bottom: 6px; letter-spacing: -0.5px; }
    .statChange { font-size: 11px; font-weight: 600; color: #00B050; }
    .statSub { font-size: 10px; color: #999; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }

    .quickActions { margin-bottom: 56px; }
    .qaLabel { font-size: 10px; font-weight: 800; letter-spacing: 0.18em; color: rgba(26,26,26,0.40); text-transform: uppercase; margin-bottom: 22px; }
    .qaGrid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
    .qaCard { background: #fff; border: 1px solid #EDEDED; border-radius: 20px; padding: 28px 26px 24px; cursor: pointer; transition: all 0.18s ease; min-height: 160px; position: relative; user-select: none; }
    .qaCard:hover { border-color: #B87333; box-shadow: 0 14px 28px rgba(0,0,0,0.06); transform: translateY(-1px); }
    .qaCard:active { border-color: #B87333; box-shadow: 0 18px 38px rgba(0,0,0,0.10); transform: translateY(0); }
    .qaCard:focus-visible { outline: none; border-color: #B87333; box-shadow: 0 18px 38px rgba(0,0,0,0.10); }
    .qaIconBox, .qaIconCoin { width: 42px; height: 42px; border-radius: 12px; border: 1px solid #EFEFEF; background: #F7F7F7; display: grid; place-items: center; color: #1a1a1a; margin-bottom: 18px; transition: all 0.18s ease; }
    .qaIconBox svg, .qaIconCoin svg { width: 18px; height: 18px; color: currentColor; fill: currentColor; }
    .qaCard:hover .qaIconBox, .qaCard:hover .qaIconCoin, .qaCard:active .qaIconBox, .qaCard:active .qaIconCoin { background: #B87333; border-color: #B87333; color: #fff; }
    .qaTitle { font-size: 18px; font-weight: 900; font-style: italic; color: #1a1a1a; letter-spacing: -0.4px; margin-bottom: 8px; text-transform: uppercase; line-height: 1.15; }
    .qaDesc { font-size: 10px; font-weight: 800; color: rgba(26,26,26,0.42); letter-spacing: 0.12em; text-transform: uppercase; line-height: 1.55; }

    .reportsSection { margin-bottom: 56px; }
    .reportsHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .reportsTitle { font-size: 22px; font-weight: 700; font-style: italic; color: #1a1a1a; text-transform: uppercase; }
    .viewAllLink { font-size: 11px; font-weight: 700; color: #B87333; cursor: pointer; text-transform: uppercase; letter-spacing: 0.08em; }
    .viewAllLink:hover { text-decoration: underline; }
    .filterTabs { display: flex; gap: 12px; margin-bottom: 24px; }
    .filterTab { padding: 8px 16px; background: #fff; border: 1px solid #EDEDED; border-radius: 20px; font-size: 10px; font-weight: 800; color: #999; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.08em; }
    .filterTab:hover { border-color: #D9D9D9; }
    .filterTab.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
    .reportsGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    .reportCard { background: #fff; border: 1px solid #E8E8E8; border-radius: 16px; padding: 24px 20px 22px; cursor: pointer; transition: all 0.2s; position: relative; }
    .reportCard:hover { border-color: #B87333; transform: translateY(-2px); box-shadow: 0 12px 24px rgba(0,0,0,0.08); }
    .reportBadge { position: absolute; top: 18px; right: 18px; padding: 4px 10px; background: #1a1a1a; color: #fff; border-radius: 12px; font-size: 8px; font-weight: 800; letter-spacing: 0.08em; }
    .reportDate { font-size: 9px; color: #999; margin-bottom: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    .reportIcon { width: 44px; height: 44px; background: #FAFAFA; border: 1px solid #EDEDED; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 14px; }
    .reportTitle { font-size: 16px; font-weight: 800; font-style: italic; margin-bottom: 4px; color: #1a1a1a; text-transform: uppercase; letter-spacing: -0.3px; }
    .reportValue { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 4px; font-weight: 700; }
    .reportPrice { font-size: 20px; font-weight: 700; color: #1a1a1a; margin-bottom: 16px; letter-spacing: -0.5px; }
    .reportFooter { display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid #F5F5F5; }
    .reportScore { font-size: 11px; font-weight: 700; color: #B87333; text-transform: uppercase; letter-spacing: 0.05em; }
    .reportActions { display: flex; gap: 8px; }
    .reportActionBtn { padding: 7px 14px; background: #1a1a1a; color: #fff; border: none; border-radius: 6px; font-size: 9px; font-weight: 800; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.08em; }
    .reportActionBtn:hover { background: #000; }
    .downloadIcon { width: 30px; height: 30px; background: #F8F8F8; border: 1px solid #EDEDED; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #666; }
    .downloadIcon:hover { background: #EDEDED; }

    .subscriptionCard { background: #fff; border: 1px solid #EDEDED; border-radius: 16px; padding: 28px 24px; margin-bottom: 32px; }
    .subHeader { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
    .subIcon { width: 40px; height: 40px; background: #B87333; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .subTitle { font-size: 16px; font-weight: 800; font-style: italic; color: #1a1a1a; text-transform: uppercase; letter-spacing: -0.3px; }
    .subGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
    .subStat { padding: 16px 14px; background: #FAFAFA; border-radius: 10px; }
    .subStatLabel { font-size: 8px; font-weight: 800; color: #999; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 8px; }
    .subStatValue { font-size: 14px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.3px; }
    .subStatActive { color: #00B050; }
    .usageBar { margin-bottom: 20px; }
    .usageLabel { font-size: 9px; color: #999; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px; font-weight: 800; }
    .usageProgress { height: 8px; background: #F5F5F5; border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
    .usageProgressBar { height: 100%; background: linear-gradient(90deg, #B87333, #D4A574); border-radius: 4px; transition: width 0.3s; }
    .usageText { font-size: 9px; color: #999; text-align: right; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .subButtons { display: flex; gap: 12px; }
    .subBtn { flex: 1; padding: 12px; border: none; border-radius: 8px; font-size: 10px; font-weight: 800; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.08em; }
    .subBtnPrimary { background: #1a1a1a; color: #fff; }
    .subBtnPrimary:hover { background: #000; }
    .subBtnSecondary { background: #FAFAFA; color: #999; border: 1px solid #EDEDED; }
    .subBtnSecondary:hover { background: #F5F5F5; color: #666; }

    .upgradeCTA { background: linear-gradient(135deg, #1a1a1a, #2a2a2a); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 48px 40px; text-align: center; color: #fff; margin-bottom: 60px; }
    .ctaIcon { font-size: 28px; margin-bottom: 16px; }
    .ctaTitle { font-size: 26px; font-weight: 700; font-style: italic; margin-bottom: 12px; line-height: 1.2; text-transform: uppercase; letter-spacing: -0.5px; }
    .ctaDesc { font-size: 11px; color: rgba(255,255,255,0.7); margin-bottom: 24px; max-width: 700px; margin-left: auto; margin-right: auto; text-transform: uppercase; letter-spacing: 0.05em; line-height: 1.6; }
    .ctaButtons { display: flex; gap: 12px; justify-content: center; }
    .ctaBtn { padding: 14px 24px; border: none; border-radius: 8px; font-size: 10px; font-weight: 800; cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.08em; }
    .ctaBtnPrimary { background: #B87333; color: #fff; }
    .ctaBtnPrimary:hover { background: #A06229; }
    .ctaBtnSecondary { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.2); }
    .ctaBtnSecondary:hover { background: rgba(255,255,255,0.1); }
    .ctaRating { margin-top: 20px; font-size: 10px; color: rgba(255,255,255,0.5); letter-spacing: 0.05em; }
    .ctaStars { color: #B87333; margin-right: 8px; }

    /* Terminal iframe container */
    // .terminalMain {
    //   margin-top: 58px;
    //   height: calc(100vh - 58px);
    //   overflow: hidden;
    //   position: relative;
    // }


    .terminalMain {
  margin-top: 58px;
  height: calc(100dvh - 58px);
  overflow: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
}
    .terminalFrame {
      width: 100%;
      height: 100%;
      border: none;
      display: block;
    }

    @media (max-width: 1024px) {
      .navLinks { display: none; }
      .dashMain { padding: 40px 28px 60px; }
      .statsGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
      .statCard { padding: 18px 16px; border-radius: 14px; }
      .statLabel { font-size: 9px; letter-spacing: 0.14em; }
      .statValue { font-size: 20px; }
      .reportsGrid { grid-template-columns: repeat(2, 1fr); }
      .qaGrid { grid-template-columns: 1fr; }
      .qaCard { min-height: unset; }
    }
    @media (max-width: 640px) {
      .topNav { padding: 0 16px; }
      .profileMeta { display: none; }
      .dashMain { padding: 32px 20px 60px; }
      .statsGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
      .statCard { padding: 18px 16px; border-radius: 14px; }
      .statValue { font-size: 20px; }
      .reportsGrid { grid-template-columns: 1fr; }
      .subGrid { grid-template-columns: 1fr; }
      .ctaButtons { flex-direction: column; }
      .ctaTitle { font-size: 22px; }
    }
  `;

  return (
    <>
      <style>{UI_CSS}</style>

      {/* ── FOUNDING MEMBER POPUP ── */}
{showFoundingPopup && (
  <div style={{
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.55)",
    zIndex: 9999, display: "flex",
    alignItems: "center", justifyContent: "center",
    padding: 16,
  }}>
    <div style={{
      background: "#fff", borderRadius: 20,
      padding: "36px 32px", maxWidth: 420, width: "100%",
      boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
      position: "relative",
    }}>
      {/* Close */}
      <button onClick={() => setShowFoundingPopup(false)} style={{
        position: "absolute", top: 14, right: 16,
        background: "none", border: "none",
        fontSize: 20, cursor: "pointer", color: "#aaa",
      }}>✕</button>

      {/* Founding badge */}
      <div style={{
        fontSize: 10, fontWeight: 900, color: "#B87333",
        letterSpacing: "0.2em", textTransform: "uppercase",
        marginBottom: 12,
      }}>
        FOUNDING MEMBER OFFER
      </div>

      {/* Title */}
      <h2 style={{
        fontSize: 38, fontWeight: 900, fontStyle: "italic",
        letterSpacing: "-1px", textTransform: "uppercase",
        color: "#1a1a1a", marginBottom: 10, lineHeight: 1,
      }}>
        ACQAR PRO
      </h2>

      {/* Description */}
      <p style={{
        fontSize: 13, color: "#666",
        lineHeight: 1.6, marginBottom: 20,
        fontWeight: 500,
      }}>
        For property owners and buyers who need Dubai real estate intelligence platform.
      </p>

      {/* Price */}
      <div style={{
        display: "flex", alignItems: "center",
        gap: 6, marginBottom: 8,
      }}>
        <span style={{ fontSize: 32, fontWeight: 900, color: "#B87333" }}>
          Ð
        </span>
        <span style={{
          fontSize: 48, fontWeight: 900,
          color: "#B87333", letterSpacing: "-2px", lineHeight: 1,
        }}>
          29
        </span>
      </div>

      {/* Price note */}
      <div style={{
        fontSize: 10, fontWeight: 900, color: "#B87333",
        letterSpacing: "0.15em", textTransform: "uppercase",
        marginBottom: 28,
      }}>
        FIRST 3 MONTHS — 149/MO AFTER
      </div>

      {/* Features */}
      <div style={{
        display: "flex", flexDirection: "column",
        gap: 8, marginBottom: 28,
      }}>
        {[
          "10 TRUVALU™ AI Reports/Month",
          "Full SIGNAL™ Terminal Access",
          "PDF Reports & Shareable Links",
          "Real-Time Market Signals",
          "Cancel Anytime",
        ].map(f => (
          <div key={f} style={{
            display: "flex", alignItems: "center",
            gap: 10, fontSize: 12, fontWeight: 700, color: "#333",
          }}>
            <span style={{
              width: 18, height: 18, borderRadius: "50%",
              background: "rgba(184,115,51,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#B87333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            </span>
            {f}
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        onClick={() => { setShowFoundingPopup(false); navigate("/pricing"); }}
        style={{
          width: "100%", padding: "14px",
          background: "#B87333", color: "#fff",
          border: "none", borderRadius: 12,
          fontSize: 13, fontWeight: 900,
          cursor: "pointer", letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        AVAIL FOUNDING MEMBER OFFER →
      </button>

      {/* Dismiss */}
      <button
        onClick={() => setShowFoundingPopup(false)}
        style={{
          width: "100%", marginTop: 10, padding: "10px",
          background: "transparent", border: "none",
          fontSize: 11, color: "#aaa", cursor: "pointer",
          fontWeight: 700, letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        Maybe later
      </button>
    </div>
  </div>
)}

      {/* ── TOP NAVIGATION ── */}
      <nav className="topNav">
        <div className="navLeft">

          {/* ── DYNAMIC LOGO ── */}
          <div
            className="navBrand"
            onClick={() => { setActiveTab("dashboard"); navigate("/"); }}
          >
            {activeTab === "terminal" ? (
              /* ACQAR SIGNAL™ logo */
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: "0.12em", lineHeight: 1 }}>
                  <span style={{ color: "#B87333" }}>ACQ</span>
                  <span style={{ color: "#111111" }}>AR</span>
                </span>
                
                 <span style={{
  display: "inline-flex", alignItems: "center",
  padding: "3px 10px", borderRadius: 4,
  background: "rgba(184,115,51,0.08)",
  border: "1px solid rgba(184,115,51,0.35)",
}}>
  <span style={{
    fontSize: 11, fontWeight: 700, color: "#B87333",
    letterSpacing: "1.5px", textTransform: "uppercase",
  }}>SIGNAL™</span>
</span>
              </div>
            ) : activeTab === "reports" ? (
              /* ACQAR TRUVALU™ logo */
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: "0.12em", lineHeight: 1 }}>
                  <span style={{ color: "#B87333" }}>ACQ</span>
                  <span style={{ color: "#111111" }}>AR</span>
                </span>
               <span style={{
  display: "inline-flex", alignItems: "center",
  padding: "3px 10px", borderRadius: 4,
  background: "rgba(184,115,51,0.08)",
  border: "1px solid rgba(184,115,51,0.35)",
}}>
  <span style={{
    fontSize: 11, fontWeight: 700, color: "#B87333",
    letterSpacing: "1.5px", textTransform: "uppercase",
  }}>TRUVALU™</span>
</span>
              </div>
            ) : (
              /* Default ACQAR logo */
              <h1 style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.12em", margin: 0, lineHeight: 1 }}>
                <span style={{ color: "#B87333" }}>ACQ</span>
                <span style={{ color: "#111111" }}>AR</span>
              </h1>
            )}
          </div>

          {/* ── NAV LINKS ── */}
          <div className="navLinks">
            {/* <div
              className={`navLink ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => { setActiveTab("dashboard"); navigate("/dashboard"); }}
            >
              DASHBOARD
            </div> */}
            <div
              className={`navLink ${activeTab === "terminal" ? "terminal-active" : ""}`}
              onClick={() => setActiveTab("terminal")}
            >
              TERMINAL
            </div>
            <div
              className={`navLink ${activeTab === "reports" ? "active" : ""}`}
              onClick={() => { setActiveTab("reports"); navigate("/my-reports"); }}
            >
              MY REPORTS
            </div>
            <div
              className={`navLink ${activeTab === "settings" ? "active" : ""}`}
              onClick={() => { setActiveTab("settings"); navigate("/settings"); }}
            >
              SETTINGS
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDE ── */}
        <div className="navRight" ref={menuWrapRef}>
          <button className="bellBtn" type="button" aria-label="Notifications">
            <svg className="bellIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span className="notificationDot" />
          </button>

          <div className="profileWrap">
            <button type="button" className="profileBtn" onClick={() => setMenuOpen((v) => !v)} aria-haspopup="menu" aria-expanded={menuOpen ? "true" : "false"}>
              <div className="profileMeta">
                <div className="profileName">{nameToShow}</div>
              </div>
              <div className="profileAvatar">{initials}</div>
              <svg className="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {menuOpen && (
              <div className="menu" role="menu">
                <div className="menuTop">
                  <div className="menuTopLabel">Authenticated Account</div>
                  <div className="menuName">{nameToShow}</div>
                  {/* <div className="menuTier">VALUCHECK™ Premium Member</div> */}
                  <div className="menuTier">
  {(profile?.account_type || "Free").toUpperCase()} MEMBER
</div>
                </div>
                <div className="menuList">
                  {/* <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); setActiveTab("dashboard"); navigate("/dashboard"); }}>
                    <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
                    </svg>
                    <div className="menuText">Dashboard</div>
                  </div> */}
                  <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); setActiveTab("terminal"); }}>
                    <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="18" rx="2" />
                      <path d="M8 10l4 4 4-4" />
                    </svg>
                    <div className="menuText" style={{ color: "black" }}>Terminal</div>
                  </div>
                  <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); setActiveTab("reports"); navigate("/my-reports"); }}>
                    <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                    <div className="menuText">My Reports</div>
                  </div>
                  <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); setActiveTab("settings"); navigate("/settings"); }}>
                    <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" />
                      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.05.05a2 2 0 0 1-1.41 3.41h-.1a1.7 1.7 0 0 0-1.6 1.16 1.7 1.7 0 0 0-.37.62 2 2 0 0 1-3.82 0 1.7 1.7 0 0 0-.37-.62 1.7 1.7 0 0 0-1.6-1.16H9.5a2 2 0 0 1-1.41-3.41l.05-.05A1.7 1.7 0 0 0 8.6 15a1.7 1.7 0 0 0-1.06-1.6l-.06-.03a2 2 0 0 1 0-3.74l.06-.03A1.7 1.7 0 0 0 8.6 9a1.7 1.7 0 0 0-.34-1.87l-.05-.05A2 2 0 0 1 9.62 3.7h.1a1.7 1.7 0 0 0 1.6-1.16 2 2 0 0 1 3.82 0 1.7 1.7 0 0 0 1.6 1.16h.1A2 2 0 0 1 21 6.98l-.05.05A1.7 1.7 0 0 0 20.6 9a1.7 1.7 0 0 0 1.06 1.6l.06.03a2 2 0 0 1 0 3.74l-.06.03A1.7 1.7 0 0 0 19.4 15z" />
                    </svg>
                    <div className="menuText">Account Settings</div>
                  </div>
                  <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); navigate("/billing"); }}>
                    <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                    <div className="menuText">Billing & Plans</div>
                  </div>
                  <div className="menuDivider" />
                  <div className="menuSignout" role="menuitem" onClick={async () => { setMenuOpen(false); await handleLogout(); }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 3v18" />
                    </svg>
                    SIGN OUT
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── TERMINAL VIEW ── */}
      {activeTab === "terminal" && (
        <main className="terminalMain">
          {/* <iframe
             src="https://signal.acqar.com/terminal" 
            className="terminalFrame"
            title="ACQAR Signal Terminal"
            allow="fullscreen"
          /> */}

          <iframe
  src="https://signal.acqar.com/terminal"
  className="terminalFrame"
  title="ACQAR Signal Terminal"
  allow="fullscreen"
  style={{ width: "100%", height: "100%", border: "none", display: "block" }}
/>
        </main>
      )}

      {/* ── DASHBOARD VIEW ── */}
      {activeTab !== "terminal" && (
        <>
          <main className="dashMain">
            {/* Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              flexDirection: isMobile ? "column" : "row",
              gap: isMobile ? 16 : 22,
              marginBottom: isMobile ? 24 : 36,
              width: "100%",
            }}>
              <div style={{ minWidth: 0, flex: 1, width: "100%" }}>
                <h1 style={{
                  fontSize: isMobile ? 28 : 36, fontWeight: 900, fontStyle: "italic",
                  letterSpacing: isMobile ? "-0.6px" : "-0.8px", marginBottom: 8,
                  color: "#1a1a1a", textTransform: "uppercase", lineHeight: 1.05,
                }}>
                  WELCOME BACK, {nameToShow.toUpperCase()}
                </h1>
                <p style={{
                  fontSize: isMobile ? 10 : 11, color: "rgba(26,26,26,0.45)",
                  fontWeight: 800, letterSpacing: isMobile ? "0.12em" : "0.14em", textTransform: "uppercase",
                }}>
                  YOU HAVE {valuations.length} ACTIVE REPORTS IN YOUR DASHBOARD
                </p>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: isMobile ? "10px 14px" : "8px 14px",
                  background: "rgba(184,115,51,0.10)", border: "1px solid rgba(184,115,51,0.26)",
                  borderRadius: isMobile ? 18 : 999, fontSize: 9, fontWeight: 900, color: "#B87333",
                  textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 12,
                  width: isMobile ? "100%" : "fit-content", maxWidth: "100%",
                }}>
                  🏆 EARLY ACQAR MEMBER - VALUCHECK™ FREE FOREVER
                </div>
              </div>
              <div style={{
                marginLeft: isMobile ? 0 : "auto", width: isMobile ? "100%" : "auto",
                display: "flex", justifyContent: isMobile ? "center" : "flex-end", alignItems: "center",
              }}>
                <button onClick={() => navigate("/valuation")} style={{
                  height: isMobile ? 48 : 44, width: isMobile ? "100%" : 220,
                  padding: "0 22px", background: "#111", color: "#fff",
                  border: "1px solid rgba(0,0,0,0.10)", borderRadius: isMobile ? 14 : 12,
                  fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", cursor: "pointer",
                  textTransform: "uppercase", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 10, whiteSpace: "nowrap",
                  boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
                }}>
                  <span style={{
                    display: "grid", placeItems: "center", width: 18, height: 18,
                    borderRadius: 6, background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.10)", fontWeight: 900, lineHeight: 1,
                  }}>+</span>
                  NEW VALUATION
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="statsGrid">
              <div className="statCard">
                <div className="statLabel">TOTAL VALUE</div>
                <div className="statValue">{fmtAED(totalPortfolio)}</div>
                <div className="statChange">+5.2% ↗</div>
              </div>
              <div className="statCard">
                <div className="statLabel">PROPERTIES</div>
                <div className="statValue">{valuations.length}</div>
                <div className="statSub">MARKET STABLE</div>
              </div>
              <div className="statCard">
                <div className="statLabel">AVG SCORE</div>
                <div className="statValue">82/100</div>
                <div style={{ fontSize: 10, color: "#B87333", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>EXCEEDS AREA</div>
              </div>
              <div className="statCard">
                <div className="statLabel">ACTIVE SUBSCRIPTION</div>
                <div className="statValue">VALUCHECK™</div>
                <div className="statChange">ACTIVE ✓</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quickActions">
              <div className="qaLabel">QUICK ACTIONS</div>
              <div className="qaGrid">
                <div className="qaCard" onClick={() => navigate("/valuation")} role="button" tabIndex={0}>
                  <div className="qaIconBox">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="qaTitle">NEW VALUATION</div>
                  <div className="qaDesc">GET INSTANT PROPERTY INTELLIGENCE FOR ANY ASSET.</div>
                </div>
                <div className="qaCard" onClick={() => { setActiveTab("terminal"); }} role="button" tabIndex={0}>
                  <div className="qaIconCoin">
                    <svg viewBox="0 0 24 24">
                      <rect x="2" y="3" width="20" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path d="M8 10l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="qaTitle">TERMINAL</div>
                  <div className="qaDesc">ACCESS ACQAR SIGNAL™ LIVE MARKET INTELLIGENCE.</div>
                </div>
                <div className="qaCard" onClick={() => navigate("/settings")} role="button" tabIndex={0}>
                  <div className="qaIconBox">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" fill="none" stroke="currentColor" strokeWidth="2" />
                      <path d="M19.4 15a1.8 1.8 0 0 0 .35 1.9l.05.05a2 2 0 0 1-1.42 3.42h-.1a1.8 1.8 0 0 0-1.7 1.2 2 2 0 0 1-3.84 0 1.8 1.8 0 0 0-1.7-1.2H9.5a2 2 0 0 1-1.42-3.42l.05-.05A1.8 1.8 0 0 0 8.6 15a1.8 1.8 0 0 0-1.1-1.7l-.06-.03a2 2 0 0 1 0-3.74l.06-.03A1.8 1.8 0 0 0 8.6 9a1.8 1.8 0 0 0-.35-1.9l-.05-.05A2 2 0 0 1 9.62 3.7h.1a1.8 1.8 0 0 0 1.7-1.2 2 2 0 0 1 3.84 0 1.8 1.8 0 0 0 1.7 1.2h.1A2 2 0 0 1 21 6.98l-.05.05A1.8 1.8 0 0 0 20.6 9a1.8 1.8 0 0 0 1.1 1.7l.06.03a2 2 0 0 1 0 3.74l-.06.03A1.8 1.8 0 0 0 19.4 15z" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className="qaTitle">ACCOUNT SETTINGS</div>
                  <div className="qaDesc">MANAGE YOUR PROFILE, BILLING AND PREFERENCES.</div>
                </div>
              </div>
            </div>

            {/* Reports Section */}
            <div className="reportsSection">
              <div className="reportsHeader">
                <div className="reportsTitle">RECENT REPORTS</div>
                <div className="viewAllLink" onClick={() => setShowAllValuations(!showAllValuations)}>
                  {showAllValuations ? "SHOW LESS" : "VIEW ALL REPORTS →"}
                </div>
              </div>
              <div className="filterTabs">
                <div className={`filterTab ${activeFilter === "ALL" ? "active" : ""}`} onClick={() => setActiveFilter("ALL")}>ALL</div>
                <div className={`filterTab ${activeFilter === "VALUCHECK" ? "active" : ""}`} onClick={() => setActiveFilter("VALUCHECK")}>VALUCHECK™</div>
              </div>
              {reportCards.length === 0 ? (
                <div style={{ padding: "60px 40px", textAlign: "center", color: "#999", background: "#FAFAFA", borderRadius: "16px", border: "1px solid #EDEDED" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
                  <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px", color: "#1a1a1a" }}>No Valuations Yet</div>
                  <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Create your first valuation to see it here.</div>
                </div>
              ) : (
                <div className="reportsGrid">
                  {(showAllValuations ? reportCards : reportCards.slice(0, 6)).map((card) => (
                    <div key={card.id} className="reportCard" onClick={() => navigate(`/report?id=${card.id}`)}>
                      <div className="reportBadge">{card.badge}</div>
                      <div className="reportDate">{card.date}</div>
                      <div className="reportIcon">🏠</div>
                      <div className="reportTitle">{card.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        {card.bedrooms != null && (
                          <span style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                            🛏 {card.bedrooms === 0 || String(card.bedrooms).toLowerCase() === "studio" ? "Studio" : `${card.bedrooms} Bed`}
                          </span>
                        )}
                        {card.bathrooms != null && (
                          <><span style={{ width: 3, height: 3, borderRadius: "50%", background: "#ccc", display: "inline-block", flexShrink: 0 }} />
                          <span style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>🚿 {card.bathrooms} Bath</span></>
                        )}
                        {card.sizeSqft != null && (
                          <><span style={{ width: 3, height: 3, borderRadius: "50%", background: "#ccc", display: "inline-block", flexShrink: 0 }} />
                          <span style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>📐 {card.sizeSqft.toLocaleString()} sqft</span></>
                        )}
                      </div>
                      {card.district && (
                        <div style={{ fontSize: 10, color: "#999", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>📍 {card.district}</div>
                      )}
                      <div className="reportValue">ASSET VALUE</div>
                      <div className="reportPrice">{fmtAEDFull(card.value)}</div>
                      <div className="reportFooter">
                        <div className="reportScore">SCORE: {card.score}/100</div>
                        <div className="reportActions">
                          <button className="reportActionBtn">VIEW REPORT</button>
                          <div className="downloadIcon">↓</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subscription Card */}
            <div className="subscriptionCard">
              <div className="subHeader">
                <div className="subIcon">⚡</div>
                <div className="subTitle">YOUR VALUCHECK™ SUBSCRIPTION</div>
              </div>
              <div className="subGrid">
                <div className="subStat"><div className="subStatLabel">STATUS</div><div className="subStatValue subStatActive">● ACTIVE</div></div>
                <div className="subStat"><div className="subStatLabel">NEXT BILLING</div><div className="subStatValue">Free</div></div>
                <div className="subStat"><div className="subStatLabel">REPORTS USED</div><div className="subStatValue">{valuations.length} <span style={{ fontSize: "10px", color: "#999", fontWeight: "500" }}>Reports</span></div></div>
              </div>
              <div className="usageBar">
                <div className="usageLabel">USAGE THIS MONTH</div>
                <div className="usageProgress"><div className="usageProgressBar" style={{ width: "60%" }} /></div>
                <div className="usageText">60% USED</div>
              </div>
              <div className="subButtons">
                <button className="subBtn subBtnPrimary">MANAGE SUBSCRIPTION</button>
                <button className="subBtn subBtnSecondary">VIEW BILLING HISTORY</button>
              </div>
            </div>

            {/* Upgrade CTA */}
            <div className="upgradeCTA">
              <div className="ctaIcon">⚡</div>
              <div className="ctaTitle">UPGRADE TO INVESTMENT-GRADE INTELLIGENCE</div>
              <div className="ctaDesc">GET EXACT VALUATIONS (±5%), INVESTMENT SCORES, AND 3-YEAR FORECASTS WITH DEALLENS™. TRUSTED BY 2,500+ DUBAI INVESTORS.</div>
              <div className="ctaButtons">
                <button className="ctaBtn ctaBtnPrimary">UPGRADE TO DEALLENS™ - AED 149 →</button>
                <button className="ctaBtn ctaBtnSecondary">SEE ALL PLANS</button>
              </div>
              <div className="ctaRating"><span className="ctaStars">★★★★★</span><span>4.9/5 Rating</span></div>
              <div style={{ fontSize: "9px", marginTop: "8px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>VERIFIED BY 347 GLOBAL PORTFOLIO MANAGERS</div>
            </div>
          </main>

          <Footer />
        </>
      )}
    </>
  );
}
