// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import { useLogout } from "../hooks/useLogout";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";



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
// export default function MyReports() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [profile, setProfile] = useState(null);
//   const [valuations, setValuations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeFilter, setActiveFilter] = useState("ALL");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [pressedId, setPressedId] = useState(null);
//   const [showUpgradePopup, setShowUpgradePopup] = useState(false);
//   const [userPlan, setUserPlan] = useState({ plan: "free", used: 0, limit: 3 });

//   // tabs scroll refs (mobile)
//   const tabsRef = useRef(null);
//   const [tabThumb, setTabThumb] = useState({ w: 40, x: 0 });

//   useEffect(() => {
//     const el = tabsRef.current;
//     if (!el) return;
//     const update = () => {
//       const scrollW = el.scrollWidth || 1;
//       const clientW = el.clientWidth || 1;
//       const maxScroll = Math.max(1, scrollW - clientW);
//       const w = Math.max(48, Math.min(180, (clientW / scrollW) * clientW));
//       const x = ((el.scrollLeft || 0) / maxScroll) * Math.max(0, clientW - w);
//       setTabThumb({ w, x });
//     };
//     update();
//     el.addEventListener("scroll", update, { passive: true });
//     window.addEventListener("resize", update);
//     return () => {
//       el.removeEventListener("scroll", update);
//       window.removeEventListener("resize", update);
//     };
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

//   function fmtDate(iso) {
//     if (!iso) return "";
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return "";
//     return d.toLocaleDateString("en-US", {
//       month: "short",
//       day: "2-digit",
//       year: "numeric"
//     }).toUpperCase();
//   }

//  async function handleDownloadPDF(card) {
//   // Open the report page in a hidden iframe, capture it, save as PDF
//   const reportUrl = `${window.location.origin}/report?id=${card.id}`;

//   // Show loading toast
//   const toast = document.createElement("div");
//   toast.innerText = "⏳ Generating PDF...";
//   Object.assign(toast.style, {
//     position: "fixed", bottom: "24px", left: "50%",
//     transform: "translateX(-50%)", background: "#1a1a1a",
//     color: "#fff", padding: "12px 24px", borderRadius: "10px",
//     fontSize: "13px", fontWeight: "700", zIndex: "99999",
//     letterSpacing: "0.05em",
//   });
//   document.body.appendChild(toast);

//   try {
//     // Create hidden iframe to load the full report
//     const iframe = document.createElement("iframe");
//     iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:1200px;height:900px;border:none;visibility:hidden;";
//     document.body.appendChild(iframe);

//     await new Promise((resolve, reject) => {
//       iframe.onload = resolve;
//       iframe.onerror = reject;
//       iframe.src = reportUrl;
//     });

//     // Wait for charts/images to render
//     await new Promise(r => setTimeout(r, 3000));

//     const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
//     const reportEl = iframeDoc.body;

//     const canvas = await html2canvas(reportEl, {
//       scale: 2,
//       useCORS: true,
//       allowTaint: true,
//       backgroundColor: "#ffffff",
//       width: 1200,
//       scrollX: 0,
//       scrollY: 0,
//       windowWidth: 1200,
//     });

//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "mm", "a4");
//     const pdfW = pdf.internal.pageSize.getWidth();
//     const pdfH = pdf.internal.pageSize.getHeight();
//     const imgH = (canvas.height * pdfW) / canvas.width;

//     let heightLeft = imgH;
//     let position = 0;

//     pdf.addImage(imgData, "PNG", 0, position, pdfW, imgH);
//     heightLeft -= pdfH;

//     // Add new pages if content is taller than one page
//     while (heightLeft > 0) {
//       position -= pdfH;
//       pdf.addPage();
//       pdf.addImage(imgData, "PNG", 0, position, pdfW, imgH);
//       heightLeft -= pdfH;
//     }

//     pdf.save(`ACQAR_${card.title}_Report.pdf`);
//     document.body.removeChild(iframe);
//   } catch (err) {
//     console.error("PDF generation failed:", err);
//     // Fallback to basic PDF
//     const doc = new jsPDF();
//     doc.setFontSize(16);
//     doc.setFont("helvetica", "bold");
//     doc.text("ACQAR TRUVALU™ Report", 14, 15);
//     doc.setFontSize(11);
//     doc.setFont("helvetica", "normal");
//     doc.text(`Property: ${card.title}`, 14, 28);
//     doc.text(`District: ${card.district || "—"}`, 14, 36);
//     doc.text(`Estimated Value: ${fmtAED(card.value)}`, 14, 44);
//     doc.text(`Date: ${card.date}`, 14, 52);
//     doc.text(`Score: ${card.score}/100`, 14, 60);
//     doc.save(`ACQAR_${card.title}_Report.pdf`);
//   } finally {
//     document.body.removeChild(toast);
//   }
// }
//   useEffect(() => {
//     let mounted = true;
//     async function load() {
//       try {
//         setLoading(true);
//         const { data, error: userErr } = await supabase.auth.getUser();
//         if (userErr) throw userErr;
//         const user = data?.user;
//         if (!user?.id) { navigate("/login"); return; }
//         const authId = user.id;
//         const authEmail = (user.email || "").toLowerCase();
//         const metaName = (
//           user.user_metadata?.name ||
//           user.user_metadata?.full_name ||
//           user.user_metadata?.display_name ||
//           ""
//         ).trim();
//         let { data: uRow } = await supabase
//   .from("users")
//   .select("id, role, name, email, phone, created_at, account_type, plan, free_reports_used, free_reports_limit")
//   .eq("id", authId)
//   .maybeSingle();
// if (!mounted) return;
// setProfile(uRow || { id: authId, name: metaName || null, email: authEmail || null, phone: null, created_at: null });
// if (uRow) {
//   setUserPlan({
//     plan: uRow.plan ?? "free",
//     used: uRow.free_reports_used ?? 0,
//     limit: uRow.free_reports_limit ?? 3,
//   });
// }
//         const { data: vRows, error: vErr } = await supabase
//           .from("valuations")
//         .select("id, property_name, building_name, district, created_at, estimated_valuation, form_payload, type")
//           .eq("user_id", authId)
//           .order("created_at", { ascending: false });
//         if (!mounted) return;
//         if (vErr) { console.warn("valuations select:", vErr.message); setValuations([]); }
//         else { setValuations(vRows || []); }
//       } catch (e) {
//         if (!mounted) return;
//         console.error("Failed to load reports:", e);
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

//   const handleLogout = useLogout();

//   const totalValue = useMemo(() => {
//     return valuations.reduce((acc, r) => acc + (Number(r.estimated_valuation) || 0), 0) || 0;
//   }, [valuations]);

//   const reportCards = useMemo(() => {
//     if (!valuations?.length) return [];
   
//     let filtered = valuations;

// // Apply type filter
// if (activeFilter === "FREE") {
//   filtered = filtered.filter(v => {
//     const type = (v.type || "").toLowerCase();
//     return type === "free" || type === "" || type === null;
//   });
// } else if (activeFilter === "PAID") {
//   filtered = filtered.filter(v => {
//     const type = (v.type || "").toLowerCase();
//     return type === "paid";
//   });
// }

// if (searchQuery.trim()) {
//       const query = searchQuery.toLowerCase();
//       filtered = filtered.filter(v => {
//         const property = (v.property_name || "").toLowerCase();
//         const building = (v.building_name || "").toLowerCase();
//         const district = (v.district || "").toLowerCase();
//         return property.includes(query) || building.includes(query) || district.includes(query);
//       });
//     }
//     return filtered.map((v) => {
//       const property = (v.property_name || "").trim();
//       const building = (v.building_name || "").trim();
//       const district = (v.district || "").trim();
//       const title = property || building || "Property";
//       const unitInfo = building && building !== title ? building : "";
//       const createdDate = new Date(v.created_at);
//       const now = new Date();
//       const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
//       let status = "ACTIVE";
//       if (daysDiff > 90) status = "EXPIRED";
//       else if (daysDiff > 60) status = "EXPIRING";
//       return {
//         id: v.id, title, unitInfo, district,
//         date: fmtDate(v.created_at),
//         value: Number(v.estimated_valuation) || 0,
//         score: Math.floor(Math.random() * 30) + 70,
//         bedrooms: v.form_payload?.bedrooms ?? v.form_payload?.rooms_en ?? null,
//         bathrooms: v.form_payload?.bathrooms ?? v.form_payload?.bathrooms_en ?? null,
//         sizeSqft: v.form_payload?.procedure_area ? Math.round(Number(v.form_payload.procedure_area) * 10.764) : null,
//         badge: (v.type || "").toLowerCase() === "paid" ? "PAID" : "FREE",
//         status,
//       };
//     });
//   }, [valuations, activeFilter, searchQuery]);

//   const healthMetrics = useMemo(() => {
//     if (!reportCards.length) return { score: 0, investmentReady: 0, needsAttention: 0, validChange: 0 };
//     const investmentReady = reportCards.filter(r => r.value > 0).length;
//     const needsAttention = reportCards.filter(r => r.value <= 0 || r.status === "EXPIRED").length;
//     const score = Math.round((investmentReady / reportCards.length) * 100);
//     const activeCount = reportCards.filter(r => r.status === "ACTIVE").length;
//     const validChange = Math.round((activeCount / reportCards.length) * 100);
//     return {
//       score,
//       investmentReady: Math.round((investmentReady / reportCards.length) * 100),
//       needsAttention: Math.round((needsAttention / reportCards.length) * 100),
//       validChange,
//     };
//   }, [reportCards]);

//   const path = location.pathname;
//   const isDash = path === "/dashboard" || path === "/";
//   const isReports = path === "/my-reports";
//   const isSettings = path === "/settings";

//   // ── Navigate to dashboard and activate terminal tab ──
//   function goToTerminal() {
//     navigate("/dashboard", { state: { tab: "terminal" } });
//   }

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
//     .navBrand {
//       font-size: 14px; font-weight: 900; letter-spacing: 0.16em;
//       color: #1a1a1a; cursor: pointer; text-transform: uppercase; line-height: 1;
//     }
//     .navLinks { display: flex; gap: 26px; align-items: center; }
//     .navLink {
//       font-size: 10px; font-weight: 800; letter-spacing: 0.14em;
//       color: rgba(26,26,26,0.55); cursor: pointer; text-transform: uppercase;
//       line-height: 1; padding: 18px 0; position: relative; user-select: none;
//     }
//     .navLink:hover { color: #B87333; }
//     .navLink.active { color: #B87333; }
//     .navLink.active::after {
//       content: ""; position: absolute; left: 0; right: 0; bottom: 0px;
//       height: 2px; background: #B87333; border-radius: 2px;
//     }
//     .navLink.terminal-link { color: rgba(26,26,26,0.55); }
//     .navLink.terminal-link:hover { color: #B87333; }

//     .navRight { display: flex; align-items: center; gap: 16px; }
//     .bellBtn {
//       width: 34px; height: 34px; border-radius: 999px;
//       background: transparent; border: none; display: grid;
//       place-items: center; cursor: pointer; position: relative;
//     }
//     .bellIcon { width: 16px; height: 16px; color: rgba(26,26,26,0.75); }
//     .notificationDot {
//       position: absolute; top: 8px; right: 8px; width: 7px; height: 7px;
//       background: #B87333; border-radius: 50%; border: 2px solid #fff;
//     }
//     .profileWrap { position: relative; }
//     .profileBtn {
//       display: flex; align-items: center; gap: 10px; cursor: pointer;
//       border: none; background: transparent; padding: 4px 0;
//     }
//     .profileMeta { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.05; }
//     .profileName {
//       font-size: 10px; font-weight: 800; letter-spacing: 0.12em;
//       text-transform: uppercase; color: #1a1a1a; white-space: nowrap;
//       max-width: 220px; overflow: hidden; text-overflow: ellipsis;
//     }
//     .profileAvatar {
//       width: 28px; height: 28px; border-radius: 999px; background: #B87333;
//       display: grid; place-items: center; color: #fff; font-size: 10px;
//       font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase;
//     }
//     .caret { width: 14px; height: 14px; color: rgba(26,26,26,0.55); margin-left: 2px; }

//     .menu {
//       position: absolute; top: calc(100% + 10px); right: 0; width: 220px;
//       background: #fff; border: 1px solid #EAEAEA; border-radius: 12px;
//       box-shadow: 0 18px 40px rgba(0,0,0,0.10); overflow: hidden; z-index: 200;
//     }
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
//     .menuSignout {
//       display: flex; align-items: center; justify-content: center; gap: 8px;
//       padding: 12px 16px 14px; cursor: pointer; color: #FF4D4D; font-size: 10px;
//       font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase;
//       user-select: none; transition: background 0.14s;
//     }
//     .menuSignout:hover { background: #FFF6F6; }
//     .menuSignout svg { width: 16px; height: 16px; color: #FF4D4D; }

//     .reportsMain {
//       margin-top: 58px; max-width: 1200px;
//       margin-left: auto; margin-right: auto;
//       padding: 48px 40px 80px;
//     }

//     .reportsHeader {
//       padding-bottom: 30px;
//       border-bottom: 1px solid #E6E6E6;
//       margin-bottom: 50px;
//     }
//     .reportsHeaderRow {
//       display: flex; align-items: flex-start;
//       justify-content: space-between; gap: 40px;
//     }
//     .reportsHeaderLeft { min-width: 0; }
//     .reportsHeader h1 {
//       font-size: 46px; font-weight: 900; font-style: italic;
//       letter-spacing: -1.2px; margin: 0 0 8px; color: #1a1a1a;
//       text-transform: uppercase; line-height: 1; transform: skewX(-8deg);
//     }
//     .reportsHeader p {
//       margin: 0; font-size: 10px; color: #9a9a9a;
//       font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;
//     }
//     .reportsStatsTop { display: flex; gap: 46px; margin-top: 6px; flex-shrink: 0; }
//     .reportsStatItem { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; text-align: right; }
//     .reportsStatLabel { font-size: 9px; font-weight: 800; color: #9a9a9a; text-transform: uppercase; letter-spacing: 0.12em; }
//     .reportsStatValue { font-size: 18px; font-weight: 900; color: #1a1a1a; letter-spacing: -0.2px; }
//     .reportsStatAccent { color: #B87333; }

//     .controlsBar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px; gap: 20px; }
//     .filterTabsWrap { width: auto; }
//     .filterTabs { display: flex; gap: 12px; }
//     .filterTab {
//       padding: 10px 20px; background: #fff; border: 1px solid #E8E8E8;
//       border-radius: 24px; font-size: 10px; font-weight: 800; color: #999;
//       cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.08em;
//     }
//     .filterTab:hover { border-color: #D9D9D9; }
//     .filterTab.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
//     .tabsBottomRow { display: none; }

//     .searchControls { display: flex; gap: 30px; align-items: center; }
//     .searchBox { position: relative; width: 280px; }
//     .searchIcon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #999; }
//     .searchInput {
//       width: 100%; padding: 10px 14px 10px 40px; border: 1px solid #E8E8E8;
//       border-radius: 8px; font-size: 11px; font-weight: 500; color: #1a1a1a;
//       background: #fff; outline: none; transition: border-color 0.2s;
//     }
//     .searchInput:focus { border-color: #B87333; }
//     .searchInput::placeholder { color: #999; }
//     .filterBtn {
//       width: 38px; height: 38px; border: 1px solid #E8E8E8; border-radius: 8px;
//       background: #fff; display: grid; place-items: center; cursor: pointer; transition: all 0.2s;
//     }
//     .filterBtn:hover { border-color: #B87333; background: #FAFAFA; }
//     .filterBtn svg { width: 16px; height: 16px; color: #666; }

//     .reportsGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 56px; }
//     .reportCard {
//       background: #fff; border: 1px solid #EFEFEF; border-radius: 26px;
//       padding: 26px 22px 22px; cursor: pointer;
//       transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
//       position: relative; box-shadow: 0 10px 22px rgba(0,0,0,0.05); outline: none;
//     }
//     .reportCard:hover { border-color: #E7E7E7; transform: translateY(-2px); box-shadow: 0 16px 30px rgba(0,0,0,0.08); }
//     .reportCard:active { transform: translateY(0); border-color: rgba(184,115,51,0.40); box-shadow: 0 14px 28px rgba(0,0,0,0.07); }
//     .reportCard:active::after { content: ""; position: absolute; left: 12px; right: 12px; bottom: -1px; height: 3px; background: #B87333; border-radius: 999px; }
//     .reportCardHeader { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
//     .reportIcon { width: 44px; height: 44px; border-radius: 12px; background: #F6F6F6; border: 1px solid #EFEFEF; display: flex; align-items: center; justify-content: center; }
//     .reportIcon svg { width: 18px; height: 18px; color: #B87333; }
//     .reportCard:active .reportIcon { background: #B87333; border-color: #B87333; }
//     .reportCard:active .reportIcon svg { color: #fff; }
//     .reportStatus { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
//     .statusBadge { padding: 4px 10px; border-radius: 999px; font-size: 8px; font-weight: 900; letter-spacing: 0.10em; text-transform: uppercase; }
//     .statusActive { background: #00B050; color: #fff; }
//     .statusExpiring { background: #F59E0B; color: #fff; }
//     .statusExpired { background: #E8E8E8; color: #999; }
//     .reportDate { font-size: 9px; color: #9a9a9a; font-weight: 800; letter-spacing: 0.10em; text-transform: uppercase; }
//     .reportTitle { font-size: 18px; font-weight: 900; font-style: italic; margin-bottom: 6px; color: #1a1a1a; text-transform: uppercase; letter-spacing: -0.4px; }
//     .reportMeta { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
//     .reportMetaLabel { font-size: 9px; color: #9a9a9a; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 900; }
//     .reportMetaValue { font-size: 20px; font-weight: 900; color: #1a1a1a; letter-spacing: -0.6px; }
//     .reportMetaType { font-size: 9px; color: #B87333; text-transform: uppercase; letter-spacing: 0.10em; font-weight: 900; font-style: italic; }
//     .reportFooter { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid #F2F2F2; }
//     .reportScore { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; color: #B87333; }
//     .reportActions { display: flex; gap: 10px; align-items: center; }
//     .reportActionBtn {
//       padding: 9px 18px; background: #1a1a1a; color: #fff; border: none;
//       border-radius: 10px; font-size: 9px; font-weight: 900; cursor: pointer;
//       transition: all 0.18s; text-transform: uppercase; letter-spacing: 0.10em;
//       box-shadow: 0 8px 16px rgba(0,0,0,0.10);
//     }
//     .reportActionBtn:hover { background: #000; }
//     .downloadIcon {
//       width: 34px; height: 34px; background: #F7F7F7; border: 1px solid #EAEAEA;
//       border-radius: 10px; cursor: pointer; transition: all 0.18s;
//       display: flex; align-items: center; justify-content: center; color: #1a1a1a;
//     }
//     .downloadIcon:hover { background: #EFEFEF; }

//     .healthScoreCard {
//       background: #F6F6F6; border: 1px solid #EAEAEA; border-radius: 999px;
//       padding: 22px 30px; margin-bottom: 32px; display: flex; align-items: center; gap: 18px;
//     }
//     .healthScoreCircle {
//       width: 66px; height: 66px; border-radius: 999px; border: 4px solid #B87333;
//       background: #fff; display: grid; place-items: center; font-size: 18px;
//       font-weight: 900; color: #111; flex-shrink: 0; box-shadow: 0 10px 22px rgba(0,0,0,0.10);
//     }
//     .healthScoreContent { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 28px; }
//     .healthScoreText { min-width: 0; }
//     .healthScoreTitle { font-size: 16px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.25px; color: #111; margin: 0 0 6px; line-height: 1.05; }
//     .healthScoreDesc { font-size: 9px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: 0.16em; color: rgba(17,17,17,0.35); margin: 0; line-height: 1.35; }
//     .healthMetrics { display: grid; grid-template-columns: repeat(3, auto); gap: 44px; align-items: center; }
//     .healthMetric { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; min-width: 92px; }
//     .healthMetricValue { font-size: 20px; font-weight: 900; letter-spacing: -0.25px; line-height: 1; }
//     .healthMetricLabel { font-size: 8px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: 0.18em; color: rgba(17,17,17,0.35); line-height: 1.1; }
//     .metricGreen { color: #18A94B; }
//     .metricOrange { color: #B87333; }

//     .upgradeCTA {
//       width: 100%; border-radius: 56px; padding: 56px 44px 54px; margin: 44px 0 72px;
//       background: linear-gradient(180deg, #1b1b1b 0%, #141414 100%);
//       border: 1px solid rgba(255,255,255,0.07); box-shadow: 0 30px 80px rgba(0,0,0,0.35);
//       display: flex; flex-direction: column; align-items: center; justify-content: center;
//       text-align: center; position: relative; overflow: hidden; color: #fff; isolation: isolate;
//     }

//     @media (max-width: 1024px) {
//       .navLinks { display: none; }
//       .reportsMain { padding: 40px 28px 60px; }
//       .reportsGrid { grid-template-columns: repeat(2, 1fr); }
//       .controlsBar { flex-direction: column; align-items: stretch; }
//       .searchBox { width: 100%; }
//       .healthMetrics { gap: 24px; }
//     }

//     @media (max-width: 640px) {
//       .topNav { padding: 0 16px; }
//       .profileMeta { display: none; }
//       .reportsMain { padding: 32px 20px 60px; }
//       .reportsGrid { grid-template-columns: 1fr; }
//       .controlsBar { flex-direction: column; align-items: stretch; gap: 14px; }
//       .filterTabsWrap { width: 100%; }
//       .filterTabs {
//         display: flex; gap: 12px; align-items: center; overflow-x: auto; overflow-y: hidden;
//         -webkit-overflow-scrolling: touch; white-space: nowrap; padding: 0 2px; margin-bottom: 10px;
//         scrollbar-width: none;
//       }
//       .filterTabs::-webkit-scrollbar { display: none; }
//       .filterTab { flex: 0 0 auto; padding: 10px 18px; border-radius: 12px; }
//       .tabsBottomRow { display: grid; grid-template-columns: 18px 1fr 18px; align-items: center; gap: 10px; }
//       .tabArrowBtn { width: 18px; height: 18px; border: none; background: transparent; color: #9a9a9a; font-size: 16px; line-height: 1; padding: 0; cursor: pointer; }
//       .tabsRail { height: 10px; background: #BDBDBD; border-radius: 999px; position: relative; overflow: hidden; }
//       .tabsThumb { height: 100%; background: #7F7F7F; border-radius: 999px; position: absolute; left: 0; top: 0; will-change: transform; }
//       .reportsHeaderRow { flex-direction: column; align-items: flex-start; gap: 10px; }
//       .reportsHeaderLeft { width: 100%; }
//       .reportsHeader h1 { font-size: 34px; line-height: 0.95; }
//       .reportsHeader p { font-size: 9px; letter-spacing: 0.18em; line-height: 1.6; max-width: 320px; }
//       .reportsStatsTop { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-top: 14px; width: 100%; }
//       .reportsStatItem { align-items: center; text-align: center; gap: 6px; }
//       .reportsStatValue { font-size: 22px; font-weight: 900; margin-top: 4px; }
//       .reportsStatItem:last-child .reportsStatValue { color: #B87333; }
//       .healthScoreCard { background: #F6F6F6; border: 1px solid #E6E6E6; border-radius: 28px; padding: 30px 22px 34px; min-height: 340px; display: flex; align-items: flex-start; gap: 16px; }
//       .healthScoreCircle { width: 42px; height: 78px; border-radius: 999px; border: 4px solid #B87333; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 600; color: #111; flex-shrink: 0; }
//       .healthScoreContent { display: block; width: 100%; }
//       .healthScoreTitle { font-size: 18px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.25px; color: #111; margin: 2px 0 8px; line-height: 1.05; }
//       .healthScoreTitleBreak { display: block; }
//       .healthScoreDesc { font-size: 10px; font-weight: 800; font-style: italic; text-transform: uppercase; letter-spacing: 0.18em; color: #9C9C9C; line-height: 1.6; margin-top: 4px; max-width: 260px; }
//       .healthScoreCard .healthMetrics { margin-top: 42px !important; padding: 0 6px !important; width: 100% !important; display: grid !important; grid-template-columns: 1fr 1fr !important; column-gap: 34px !important; row-gap: 40px !important; align-items: start !important; margin-left: -25px !important; }
//       .healthScoreCard .healthMetric { min-width: 0 !important; display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; }
//       .healthScoreCard .healthMetric.healthMetricChange { grid-column: 1 / -1 !important; margin-top: 6px !important; }
//       .healthScoreCard .healthMetricLabel { white-space: normal !important; line-height: 1.25 !important; width: 100% !important; text-align: center !important; letter-spacing: 0.14em !important; font-size: 8px; }
//       .upgradeCTA { border-radius: 34px; padding: 34px 18px 36px; }
//     }

//     .newValuationBtn { width: auto; }
// @media (max-width: 640px) {
//   .newValuationBtn { width: 100%; text-align: center; }
// }

//     @keyframes spin { to { transform: rotate(360deg); } }
//   `;

//   return (
//     <>
//       <style>{UI_CSS}</style>

//       {/* ── TOP NAVIGATION ── */}
//       <nav className="topNav">
//         <div className="navLeft">

//           {/* ── TRUVALU™ LOGO ── */}
//           <div className="navBrand" onClick={() => navigate("/")}>
//             <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
//               <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: "0.12em", lineHeight: 1 }}>
//                 <span style={{ color: "#B87333" }}>ACQ</span>
//                 <span style={{ color: "#111111" }}>AR</span>
//               </span>
//                <span style={{
//   display: "inline-flex", alignItems: "center",
//   padding: "3px 10px", borderRadius: 4,
//   background: "rgba(184,115,51,0.08)",
//   border: "1px solid rgba(184,115,51,0.35)",
// }}>
//   <span style={{
//     fontSize: 11, fontWeight: 700, color: "#B87333",
//     letterSpacing: "1.5px", textTransform: "uppercase",
//   }}>TRUVALU™</span>
// </span>
//             </div>
//           </div>

//           {/* ── NAV LINKS ── */}
//           <div className="navLinks">
//             {/* <div
//               className={`navLink ${isDash ? "active" : ""}`}
//               onClick={() => navigate("/dashboard")}
//             >
//               DASHBOARD
//             </div> */}
//             <div
//               className="navLink terminal-link"
//               onClick={goToTerminal}
//             >
//               TERMINAL
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
//                   <div className="menuTier">
//   {(profile?.account_type || "Free").toUpperCase()} MEMBER
// </div>
//                 </div>
//                 <div className="menuList">
//                   {/* <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}>
//                     <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
//                     </svg>
//                     <div className="menuText">Dashboard</div>
//                   </div> */}
//                   <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); goToTerminal(); }}>
//                     <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <rect x="2" y="3" width="20" height="18" rx="2" />
//                       <path d="M8 10l4 4 4-4" />
//                     </svg>
//                     <div className="menuText" style={{ color: "black" }}>Terminal</div>
//                   </div>
//                   <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); navigate("/my-reports"); }}>
//                     <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
//                       <path d="M14 2v6h6" />
//                     </svg>
//                     <div className="menuText">My Reports</div>
//                   </div>
//                   <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); navigate("/settings"); }}>
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

//       {/* ── MAIN CONTENT ── */}
//       <main className="reportsMain">

//         {/* Header */}
//         <div className="reportsHeader">
//           <div className="reportsHeaderRow">
//             <div className="reportsHeaderLeft">
//   <h1>INTELLIGENCE ARCHIVE</h1>
//   <p>MANAGE AND MONITOR ALL YOUR GENERATED PROPERTY ASSESSMENTS</p>
//   <button
//   onClick={() => navigate("/valuation")}
//   className="newValuationBtn"
//   style={{
//     marginTop: 16, height: 44, padding: "0 22px",
//     background: "#111", color: "#fff", border: "none",
//     borderRadius: 10, fontSize: 11, fontWeight: 900,
//     letterSpacing: "0.14em", cursor: "pointer",
//     textTransform: "uppercase", display: "block",
//   }}
// >
//   + NEW VALUATION
// </button>
// </div>
//             <div className="reportsStats reportsStatsTop">
//              <div className="reportsStatItem">
//   <div className="reportsStatLabel">TOTAL REPORTS</div>
//   <div className="reportsStatValue">
//     {userPlan.plan === "pro" || userPlan.plan === "elite"
//       ? `${valuations.length} / ${userPlan.limit}`
//       : `${userPlan.used} / ${userPlan.limit}`
//     }
//   </div>
//   <div style={{ fontSize: 9, fontWeight: 800, color: userPlan.plan === "pro" || userPlan.plan === "elite" ? "#12b76a" : "#B87333", letterSpacing: "0.10em", textTransform: "uppercase", marginTop: 2 }}>
//     {userPlan.plan === "pro" || userPlan.plan === "elite" ? "PRO PLAN" : "FREE PLAN"}
//   </div>
// </div>
//               <div className="reportsStatItem">
//                 <div className="reportsStatLabel">ACTIVE ASSETS</div>
//                 <div className="reportsStatValue reportsStatAccent">{fmtAED(totalValue)}</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Controls Bar */}
//         <div className="controlsBar">
//           <div className="filterTabsWrap">
//             <div className="filterTabs" ref={tabsRef}>
//               <div className={`filterTab ${activeFilter === "ALL" ? "active" : ""}`} onClick={() => setActiveFilter("ALL")}>ALL</div>
//               <div className={`filterTab ${activeFilter === "FREE" ? "active" : ""}`} onClick={() => setActiveFilter("FREE")}>FREE</div>
//               <div className={`filterTab ${activeFilter === "PAID" ? "active" : ""}`} onClick={() => setActiveFilter("PAID")}>PAID</div>
//             </div>
//             <div className="tabsBottomRow">
//               <button type="button" className="tabArrowBtn" aria-label="Scroll left" onClick={() => tabsRef.current?.scrollBy({ left: -160, behavior: "smooth" })}>‹</button>
//               <div className="tabsRail">
//                 <div className="tabsThumb" style={{ width: `${tabThumb.w}px`, transform: `translateX(${tabThumb.x}px)` }} />
//               </div>
//               <button type="button" className="tabArrowBtn" aria-label="Scroll right" onClick={() => tabsRef.current?.scrollBy({ left: 160, behavior: "smooth" })}>›</button>
//             </div>
//           </div>

//           <div className="searchControls">
//             <div className="searchBox">
//               <svg className="searchIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
//               </svg>
//               <input
//                 type="text" className="searchInput"
//                 placeholder="Search by building or unit..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//             <button className="filterBtn">
//               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
//               </svg>
//             </button>
//           </div>
//         </div>

//         {/* Reports Grid */}
//         {loading ? (
//           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px", gap: 16 }}>
//             <div style={{ width: 40, height: 40, border: "3px solid #EDEDED", borderTop: "3px solid #B87333", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
//             <div style={{ fontSize: 10, fontWeight: 800, color: "#9a9a9a", letterSpacing: "0.18em", textTransform: "uppercase" }}>LOADING REPORTS...</div>
//           </div>
//         ) : reportCards.length === 0 ? (
//           activeFilter === "PAID" ? null : (
//           <div style={{ padding: "60px 40px", textAlign: "center", color: "#999", background: "#FAFAFA", borderRadius: "16px", border: "1px solid #EDEDED" }}>
//             <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
//             <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px", color: "#1a1a1a" }}>
//               {searchQuery ? "No Reports Found" : "No Valuations Yet"}
//             </div>
//             <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 24 }}>
//               {searchQuery ? "Try adjusting your search criteria" : "Create your first valuation to see it here"}
//             </div>
//             {!searchQuery && (
//               <button onClick={() => navigate("/valuation")} style={{ padding: "12px 24px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.12em" }}>
//                 + CREATE VALUATION
//               </button>
//             )}
//           </div>
//         ) ): (
//           <>
//             <div className="reportsGrid">
//               {reportCards.map((card) => (
//                 <div key={card.id} className="reportCard" onClick={() => navigate(`/report?id=${card.id}`)}>
//                   <div className="reportCardHeader">
//                     <div className="reportIcon">🏠</div>
//                     <div className="reportStatus">
//                       <div className={`statusBadge ${card.status === "ACTIVE" ? "statusActive" : card.status === "EXPIRING" ? "statusExpiring" : "statusExpired"}`}>
//                         {card.status}
//                       </div>
//                       <div className="reportDate">{card.date}</div>
//                     </div>
//                   </div>

//                   <div className="reportTitle">{card.title}</div>
//                   <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
//                     {card.bedrooms != null && (
//                       <span style={{ fontSize: 10, color: "#9a9a9a", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
//                         🛏 {card.bedrooms === 0 || String(card.bedrooms).toLowerCase() === "studio" ? "Studio" : `${card.bedrooms} Bed`}
//                       </span>
//                     )}
//                     {card.bathrooms != null && (
//                       <>
//                         <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#ccc", display: "inline-block", flexShrink: 0 }} />
//                         <span style={{ fontSize: 10, color: "#9a9a9a", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>🚿 {card.bathrooms} Bath</span>
//                       </>
//                     )}
//                     {card.sizeSqft != null && (
//                       <>
//                         <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#ccc", display: "inline-block", flexShrink: 0 }} />
//                         <span style={{ fontSize: 10, color: "#9a9a9a", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>📐 {card.sizeSqft.toLocaleString()} sqft</span>
//                       </>
//                     )}
//                   </div>
//                   {card.district && (
//                     <div style={{ fontSize: 10, color: "#9a9a9a", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>📍 {card.district}</div>
//                   )}

//                   <div className="reportMeta">
//                     <div>
//                       <div className="reportMetaLabel">ASSET VALUE</div>
//                       <div className="reportMetaValue">{fmtAED(card.value)}</div>
//                     </div>
//                     <div style={{ textAlign: "right" }}>
//                       <div className="reportMetaLabel">TYPE</div>
//                       <div className="reportMetaType">{card.badge}</div>
//                     </div>
//                   </div>

//                   <div className="reportFooter">
//                     <div className="reportScore">SCORE: {card.score}/100</div>
//                     <div className="reportActions">
//                       <button className="reportActionBtn">VIEW REPORT</button>
//                       <div className="downloadIcon" onClick={(e) => {
//   e.stopPropagation();
//   if (profile?.plan === "pro" || profile?.plan === "elite") {
//     // PDF download for pro users (handled below)
//     handleDownloadPDF(card);
//   } else {
//     setShowUpgradePopup(true);
//   }
// }}>↓</div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Archive Health Score */}
//             <div className="healthScoreCard">
//               <div className="healthScoreCircle">{healthMetrics.score}</div>
//               <div className="healthScoreContent">
//                 <div className="healthScoreText">
//                   <div className="healthScoreTitle">ARCHIVE HEALTH <span className="healthScoreTitleBreak">SCORE</span></div>
//                   <div className="healthScoreDesc">BASED ON YOUR PORTFOLIO'S<br/>INVESTMENT GRADE<br/>DISTRIBUTION</div>
//                 </div>
//                 <div className="healthMetrics">
//                   <div className="healthMetric">
//                     <div className="healthMetricValue metricGreen">{healthMetrics.investmentReady}%</div>
//                     <div className="healthMetricLabel">INVESTMENT READY</div>
//                   </div>
//                   <div className="healthMetric">
//                     <div className="healthMetricValue metricOrange">{healthMetrics.needsAttention}%</div>
//                     <div className="healthMetricLabel">NEEDS ATTENTION</div>
//                   </div>
//                   <div className="healthMetric healthMetricChange">
//                     <div className="healthMetricValue metricGreen">{healthMetrics.validChange}%</div>
//                     <div className="healthMetricLabel">ACTIVE REPORTS</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}

//         {/* Upgrade CTA */}
//         <div
//           className="upgradeCTA"
//           style={{
//             width: "100%", borderRadius: 56, padding: "56px 44px 54px", margin: "44px 0 72px",
//             background: "linear-gradient(180deg, #1b1b1b 0%, #121212 100%)",
//             border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
//             display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
//             textAlign: "center", position: "relative", overflow: "hidden", color: "#fff", isolation: "isolate",
//           }}
//         >
//           <style>{`
//             @media (max-width: 520px){
//               .upgradeCTA { border-radius: 40px !important; padding: 34px 18px 28px !important; margin: 22px 0 34px !important; }
//               .upgradeCTA .ctaTitle { font-size: 30px !important; margin-bottom: 14px !important; }
//               .upgradeCTA .ctaDesc { font-size: 15px !important; max-width: 280px !important; margin-bottom: 22px !important; font-family: 'Inter', sans-serif; }
//               .upgradeCTA .ctaBtn { width: 88% !important; max-width: 280px !important; height: 64px !important; border-radius: 18px !important; }
//             }
//           `}</style>

//           <div style={{ position: "absolute", inset: 0, background: "radial-gradient(1200px 420px at 50% 10%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(900px 360px at 15% 70%, rgba(184,115,51,0.10), transparent 60%)", pointerEvents: "none", zIndex: 0 }} />
//           <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 140, background: "linear-gradient(180deg, rgba(255,255,255,0.06), transparent)", opacity: 0.65, pointerEvents: "none", zIndex: 0 }} />

//           <div style={{ width: 52, height: 52, display: "grid", placeItems: "center", marginBottom: 14, zIndex: 1, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 18px 60px rgba(0,0,0,0.35)" }}>
//             <svg viewBox="0 0 24 24" style={{ width: 50, height: 50, color: "#B87333" }}>
//               <path d="M12 6.5c-3.3 0-6 2.2-6 5.3 0 2.6 2.2 4.6 5 4.6 2.4 0 4.3-1.6 4.3-3.6 0-1.7-1.5-3-3.3-3-1.5 0-2.7.9-2.7 2.1 0 1 1 1.7 2.1 1.7.9 0 1.6-.5 1.6-1.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
//             </svg>
//           </div>

//           <div className="ctaTitle" style={{ zIndex: 1, margin: "0 0 14px", fontSize: 44, fontWeight: 900, fontStyle: "italic", textTransform: "uppercase", letterSpacing: "-1px", lineHeight: 1, transform: "skewX(-8deg)", textShadow: "0 14px 30px rgba(0,0,0,0.55)" }}>
//             NEED DEEPER <br /> INSIGHTS?
//           </div>

//           {!(profile?.plan === "pro" || profile?.plan === "elite") && (
//   <p className="ctaDesc" style={{ zIndex: 1, maxWidth: 560, margin: "0 auto 28px", fontSize: 16, fontWeight: 400, letterSpacing: "0em", lineHeight: 1.7, color: "rgba(255,255,255,0.88)", fontFamily: "'Inter', sans-serif" }}>
//     Founding Member pricing closes soon — AED 29 won't last.<br/>
//     Join 225 founding members already locking in before it hits AED 149/mo.
//   </p>
// )}

//           {profile?.plan === "pro" || profile?.plan === "elite" ? (
//   <div style={{ zIndex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", background: "rgba(18,183,106,0.15)", border: "1px solid rgba(18,183,106,0.4)", borderRadius: 12 }}>
//     <span style={{ fontSize: 16 }}>✅</span>
//     <span style={{ fontSize: 11, fontWeight: 900, color: "#12b76a", letterSpacing: "0.14em", textTransform: "uppercase" }}>
//       PRO PLAN ACTIVATED
//     </span>
//   </div>
// ) : (
//   <button
//     type="button"
//     className="ctaBtn"
//     onClick={() => navigate("/pricing")}
//     style={{ zIndex: 1, height: 50, padding: "0 38px", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 14, background: "#B87333", color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 18px 46px rgba(184,115,51,0.28)", outline: "none", fontFamily: "'Inter', sans-serif" }}
//   >
//    CLAIM YOUR SPOT →
//   </button>
// )}
//         </div>

//       </main>

// {showUpgradePopup && (
//   <div style={{
//     position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
//     zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
//   }}>
//     <div style={{
//       background: "#fff", borderRadius: 20, padding: "28px 24px",
//       maxWidth: 400, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", position: "relative",
//     }}>
//       <button onClick={() => setShowUpgradePopup(false)} style={{
//         position: "absolute", top: 14, right: 16, background: "none",
//         border: "none", fontSize: 20, cursor: "pointer", color: "#aaa",
//       }}>✕</button>
//       <div style={{ fontSize: 10, fontWeight: 900, color: "#B87333", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
//         FOUNDING MEMBER OFFER
//       </div>
//       <h2 style={{ fontSize: 24, fontWeight: 900, fontStyle: "italic", textTransform: "uppercase", color: "#1a1a1a", marginBottom: 10 }}>
//         ACQAR PRO
//       </h2>
//       <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 20, fontWeight: 500 }}>
//         Founding Member pricing closes soon — AED 29 won't last.
// Join 225 founding members already locking in before it hits AED 149/mo. 
//       </p>
//       <button
//         onClick={() => { setShowUpgradePopup(false); navigate("/pricing"); }}
//         style={{
//           width: "100%", padding: "14px", background: "#B87333", color: "#fff",
//           border: "none", borderRadius: 12, fontSize: 13, fontWeight: 900,
//           cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase",
//         }}
//       >
//         CLAIM YOUR SPOT →
//       </button>
//       <button onClick={() => setShowUpgradePopup(false)} style={{
//         width: "100%", marginTop: 10, padding: "10px", background: "transparent",
//         border: "none", fontSize: 11, color: "#aaa", cursor: "pointer",
//         fontWeight: 700, textTransform: "uppercase",
//       }}>
//         Maybe later
//       </button>
//     </div>
//   </div>
// )}
//       <Footer />
//     </>
//   );
// }

















import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useLogout } from "../hooks/useLogout";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";



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
export default function MyReports() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [pressedId, setPressedId] = useState(null);
  const [showUpgradePopup, setShowUpgradePopup] = useState(false);
  const [userPlan, setUserPlan] = useState({ plan: "free", used: 0, limit: 3 });

  // tabs scroll refs (mobile)
  const tabsRef = useRef(null);
  const [tabThumb, setTabThumb] = useState({ w: 40, x: 0 });

  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const update = () => {
      const scrollW = el.scrollWidth || 1;
      const clientW = el.clientWidth || 1;
      const maxScroll = Math.max(1, scrollW - clientW);
      const w = Math.max(48, Math.min(180, (clientW / scrollW) * clientW));
      const x = ((el.scrollLeft || 0) / maxScroll) * Math.max(0, clientW - w);
      setTabThumb({ w, x });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
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

  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric"
    }).toUpperCase();
  }

 async function handleDownloadPDF(card) {
  const reportUrl = `${window.location.origin}/report?id=${card.id}`;

  const toast = document.createElement("div");
  toast.innerText = "⏳ Generating PDF...";
  Object.assign(toast.style, {
    position: "fixed", bottom: "24px", left: "50%",
    transform: "translateX(-50%)", background: "#1a1a1a",
    color: "#fff", padding: "12px 24px", borderRadius: "10px",
    fontSize: "13px", fontWeight: "700", zIndex: "99999",
    letterSpacing: "0.05em",
  });
  document.body.appendChild(toast);

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:1200px;height:900px;border:none;visibility:hidden;";
  document.body.appendChild(iframe);

  try {
    await new Promise((resolve, reject) => {
      iframe.onload = resolve;
      iframe.onerror = reject;
      iframe.src = reportUrl;
    });

    await new Promise(r => setTimeout(r, 3000));

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

    const canvas = await html2canvas(iframeDoc.body, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: 1200,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 1200,
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();

    const imgW = canvas.width;
    const imgH = canvas.height;
    const MARGIN_PX = 40; // breathing room at page boundaries
const pageHeightPx = Math.floor(imgW * (pdfH / pdfW)) - MARGIN_PX;
    const totalPages = Math.ceil(imgH / pageHeightPx);

    for (let page = 0; page < totalPages; page++) {
  if (page > 0) pdf.addPage();

  const remainingPx = imgH - page * pageHeightPx;
  const sliceHeight = Math.min(pageHeightPx, remainingPx);

  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = imgW;
  tempCanvas.height = sliceHeight;
  const ctx = tempCanvas.getContext("2d");

  ctx.drawImage(
    canvas,
    0, page * pageHeightPx,
    imgW, sliceHeight,
    0, 0,
    imgW, sliceHeight
  );

  const sliceHeightMM = (sliceHeight / pageHeightPx) * pdfH;
  pdf.addImage(tempCanvas.toDataURL("image/png"), "PNG", 0, 0, pdfW, sliceHeightMM);
}

    pdf.save(`ACQAR_${card.title}_Report.pdf`);

  } catch (err) {
    console.error("PDF generation failed:", err);
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("ACQAR TRUVALU™ Report", 14, 15);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Property: ${card.title}`, 14, 28);
    doc.text(`District: ${card.district || "—"}`, 14, 36);
    doc.text(`Estimated Value: ${fmtAED(card.value)}`, 14, 44);
    doc.text(`Date: ${card.date}`, 14, 52);
    doc.text(`Score: ${card.score}/100`, 14, 60);
    doc.save(`ACQAR_${card.title}_Report.pdf`);
  } finally {
    if (document.body.contains(toast)) document.body.removeChild(toast);
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
  }
}
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const { data, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        const user = data?.user;
        if (!user?.id) { navigate("/login"); return; }
        const authId = user.id;
        const authEmail = (user.email || "").toLowerCase();
        const metaName = (
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.display_name ||
          ""
        ).trim();
        let { data: uRow } = await supabase
  .from("users")
  .select("id, role, name, email, phone, created_at, account_type, plan, free_reports_used, free_reports_limit")
  .eq("id", authId)
  .maybeSingle();
if (!mounted) return;
setProfile(uRow || { id: authId, name: metaName || null, email: authEmail || null, phone: null, created_at: null });
if (uRow) {
  setUserPlan({
    plan: uRow.plan ?? "free",
    used: uRow.free_reports_used ?? 0,
    limit: uRow.free_reports_limit ?? 3,
  });
}
        const { data: vRows, error: vErr } = await supabase
          .from("valuations")
        .select("id, property_name, building_name, district, created_at, estimated_valuation, form_payload, type")
          .eq("user_id", authId)
          .order("created_at", { ascending: false });
        if (!mounted) return;
        if (vErr) { console.warn("valuations select:", vErr.message); setValuations([]); }
        else { setValuations(vRows || []); }
      } catch (e) {
        if (!mounted) return;
        console.error("Failed to load reports:", e);
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

  const handleLogout = useLogout();

  const totalValue = useMemo(() => {
    return valuations.reduce((acc, r) => acc + (Number(r.estimated_valuation) || 0), 0) || 0;
  }, [valuations]);

  const reportCards = useMemo(() => {
    if (!valuations?.length) return [];
   
    let filtered = valuations;

// Apply type filter
if (activeFilter === "FREE") {
  filtered = filtered.filter(v => {
    const type = (v.type || "").toLowerCase();
    return type === "free" || type === "" || type === null;
  });
} else if (activeFilter === "PAID") {
  filtered = filtered.filter(v => {
    const type = (v.type || "").toLowerCase();
    return type === "paid";
  });
}

if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v => {
        const property = (v.property_name || "").toLowerCase();
        const building = (v.building_name || "").toLowerCase();
        const district = (v.district || "").toLowerCase();
        return property.includes(query) || building.includes(query) || district.includes(query);
      });
    }
    return filtered.map((v) => {
      const property = (v.property_name || "").trim();
      const building = (v.building_name || "").trim();
      const district = (v.district || "").trim();
      const title = property || building || "Property";
      const unitInfo = building && building !== title ? building : "";
      const createdDate = new Date(v.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      let status = "ACTIVE";
      if (daysDiff > 90) status = "EXPIRED";
      else if (daysDiff > 60) status = "EXPIRING";
      return {
        id: v.id, title, unitInfo, district,
        date: fmtDate(v.created_at),
        value: Number(v.estimated_valuation) || 0,
        score: Math.floor(Math.random() * 30) + 70,
        bedrooms: v.form_payload?.bedrooms ?? v.form_payload?.rooms_en ?? null,
        bathrooms: v.form_payload?.bathrooms ?? v.form_payload?.bathrooms_en ?? null,
        sizeSqft: v.form_payload?.procedure_area ? Math.round(Number(v.form_payload.procedure_area) * 10.764) : null,
        badge: (v.type || "").toLowerCase() === "paid" ? "PAID" : "FREE",
        status,
      };
    });
  }, [valuations, activeFilter, searchQuery]);

  const healthMetrics = useMemo(() => {
    if (!reportCards.length) return { score: 0, investmentReady: 0, needsAttention: 0, validChange: 0 };
    const investmentReady = reportCards.filter(r => r.value > 0).length;
    const needsAttention = reportCards.filter(r => r.value <= 0 || r.status === "EXPIRED").length;
    const score = Math.round((investmentReady / reportCards.length) * 100);
    const activeCount = reportCards.filter(r => r.status === "ACTIVE").length;
    const validChange = Math.round((activeCount / reportCards.length) * 100);
    return {
      score,
      investmentReady: Math.round((investmentReady / reportCards.length) * 100),
      needsAttention: Math.round((needsAttention / reportCards.length) * 100),
      validChange,
    };
  }, [reportCards]);

  const path = location.pathname;
  const isDash = path === "/dashboard" || path === "/";
  const isReports = path === "/my-reports";
  const isSettings = path === "/settings";

  // ── Navigate to dashboard and activate terminal tab ──
  function goToTerminal() {
    navigate("/dashboard", { state: { tab: "terminal" } });
  }

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
    .navBrand {
      font-size: 14px; font-weight: 900; letter-spacing: 0.16em;
      color: #1a1a1a; cursor: pointer; text-transform: uppercase; line-height: 1;
    }
    .navLinks { display: flex; gap: 26px; align-items: center; }
    .navLink {
      font-size: 10px; font-weight: 800; letter-spacing: 0.14em;
      color: rgba(26,26,26,0.55); cursor: pointer; text-transform: uppercase;
      line-height: 1; padding: 18px 0; position: relative; user-select: none;
    }
    .navLink:hover { color: #B87333; }
    .navLink.active { color: #B87333; }
    .navLink.active::after {
      content: ""; position: absolute; left: 0; right: 0; bottom: 0px;
      height: 2px; background: #B87333; border-radius: 2px;
    }
    .navLink.terminal-link { color: rgba(26,26,26,0.55); }
    .navLink.terminal-link:hover { color: #B87333; }

    .navRight { display: flex; align-items: center; gap: 16px; }
    .bellBtn {
      width: 34px; height: 34px; border-radius: 999px;
      background: transparent; border: none; display: grid;
      place-items: center; cursor: pointer; position: relative;
    }
    .bellIcon { width: 16px; height: 16px; color: rgba(26,26,26,0.75); }
    .notificationDot {
      position: absolute; top: 8px; right: 8px; width: 7px; height: 7px;
      background: #B87333; border-radius: 50%; border: 2px solid #fff;
    }
    .profileWrap { position: relative; }
    .profileBtn {
      display: flex; align-items: center; gap: 10px; cursor: pointer;
      border: none; background: transparent; padding: 4px 0;
    }
    .profileMeta { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.05; }
    .profileName {
      font-size: 10px; font-weight: 800; letter-spacing: 0.12em;
      text-transform: uppercase; color: #1a1a1a; white-space: nowrap;
      max-width: 220px; overflow: hidden; text-overflow: ellipsis;
    }
    .profileAvatar {
      width: 28px; height: 28px; border-radius: 999px; background: #B87333;
      display: grid; place-items: center; color: #fff; font-size: 10px;
      font-weight: 900; letter-spacing: 0.06em; text-transform: uppercase;
    }
    .caret { width: 14px; height: 14px; color: rgba(26,26,26,0.55); margin-left: 2px; }

    .menu {
      position: absolute; top: calc(100% + 10px); right: 0; width: 220px;
      background: #fff; border: 1px solid #EAEAEA; border-radius: 12px;
      box-shadow: 0 18px 40px rgba(0,0,0,0.10); overflow: hidden; z-index: 200;
    }
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
    .menuSignout {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 12px 16px 14px; cursor: pointer; color: #FF4D4D; font-size: 10px;
      font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase;
      user-select: none; transition: background 0.14s;
    }
    .menuSignout:hover { background: #FFF6F6; }
    .menuSignout svg { width: 16px; height: 16px; color: #FF4D4D; }

    .reportsMain {
      margin-top: 58px; max-width: 1200px;
      margin-left: auto; margin-right: auto;
      padding: 48px 40px 80px;
    }

    .reportsHeader {
      padding-bottom: 30px;
      border-bottom: 1px solid #E6E6E6;
      margin-bottom: 50px;
    }
    .reportsHeaderRow {
      display: flex; align-items: flex-start;
      justify-content: space-between; gap: 40px;
    }
    .reportsHeaderLeft { min-width: 0; }
    .reportsHeader h1 {
      font-size: 46px; font-weight: 900; font-style: italic;
      letter-spacing: -1.2px; margin: 0 0 8px; color: #1a1a1a;
      text-transform: uppercase; line-height: 1; transform: skewX(-8deg);
    }
    .reportsHeader p {
      margin: 0; font-size: 10px; color: #9a9a9a;
      font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;
    }
    .reportsStatsTop { display: flex; gap: 46px; margin-top: 6px; flex-shrink: 0; }
    .reportsStatItem { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; text-align: right; }
    .reportsStatLabel { font-size: 9px; font-weight: 800; color: #9a9a9a; text-transform: uppercase; letter-spacing: 0.12em; }
    .reportsStatValue { font-size: 18px; font-weight: 900; color: #1a1a1a; letter-spacing: -0.2px; }
    .reportsStatAccent { color: #B87333; }

    .controlsBar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 50px; gap: 20px; }
    .filterTabsWrap { width: auto; }
    .filterTabs { display: flex; gap: 12px; }
    .filterTab {
      padding: 10px 20px; background: #fff; border: 1px solid #E8E8E8;
      border-radius: 24px; font-size: 10px; font-weight: 800; color: #999;
      cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 0.08em;
    }
    .filterTab:hover { border-color: #D9D9D9; }
    .filterTab.active { background: #1a1a1a; color: #fff; border-color: #1a1a1a; }
    .tabsBottomRow { display: none; }

    .searchControls { display: flex; gap: 30px; align-items: center; }
    .searchBox { position: relative; width: 280px; }
    .searchIcon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #999; }
    .searchInput {
      width: 100%; padding: 10px 14px 10px 40px; border: 1px solid #E8E8E8;
      border-radius: 8px; font-size: 11px; font-weight: 500; color: #1a1a1a;
      background: #fff; outline: none; transition: border-color 0.2s;
    }
    .searchInput:focus { border-color: #B87333; }
    .searchInput::placeholder { color: #999; }
    .filterBtn {
      width: 38px; height: 38px; border: 1px solid #E8E8E8; border-radius: 8px;
      background: #fff; display: grid; place-items: center; cursor: pointer; transition: all 0.2s;
    }
    .filterBtn:hover { border-color: #B87333; background: #FAFAFA; }
    .filterBtn svg { width: 16px; height: 16px; color: #666; }

    .reportsGrid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 56px; }
    .reportCard {
      background: #fff; border: 1px solid #EFEFEF; border-radius: 26px;
      padding: 26px 22px 22px; cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
      position: relative; box-shadow: 0 10px 22px rgba(0,0,0,0.05); outline: none;
    }
    .reportCard:hover { border-color: #E7E7E7; transform: translateY(-2px); box-shadow: 0 16px 30px rgba(0,0,0,0.08); }
    .reportCard:active { transform: translateY(0); border-color: rgba(184,115,51,0.40); box-shadow: 0 14px 28px rgba(0,0,0,0.07); }
    .reportCard:active::after { content: ""; position: absolute; left: 12px; right: 12px; bottom: -1px; height: 3px; background: #B87333; border-radius: 999px; }
    .reportCardHeader { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
    .reportIcon { width: 44px; height: 44px; border-radius: 12px; background: #F6F6F6; border: 1px solid #EFEFEF; display: flex; align-items: center; justify-content: center; }
    .reportIcon svg { width: 18px; height: 18px; color: #B87333; }
    .reportCard:active .reportIcon { background: #B87333; border-color: #B87333; }
    .reportCard:active .reportIcon svg { color: #fff; }
    .reportStatus { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
    .statusBadge { padding: 4px 10px; border-radius: 999px; font-size: 8px; font-weight: 900; letter-spacing: 0.10em; text-transform: uppercase; }
    .statusActive { background: #00B050; color: #fff; }
    .statusExpiring { background: #F59E0B; color: #fff; }
    .statusExpired { background: #E8E8E8; color: #999; }
    .reportDate { font-size: 9px; color: #9a9a9a; font-weight: 800; letter-spacing: 0.10em; text-transform: uppercase; }
    .reportTitle { font-size: 18px; font-weight: 900; font-style: italic; margin-bottom: 6px; color: #1a1a1a; text-transform: uppercase; letter-spacing: -0.4px; }
    .reportMeta { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
    .reportMetaLabel { font-size: 9px; color: #9a9a9a; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 900; }
    .reportMetaValue { font-size: 20px; font-weight: 900; color: #1a1a1a; letter-spacing: -0.6px; }
    .reportMetaType { font-size: 9px; color: #B87333; text-transform: uppercase; letter-spacing: 0.10em; font-weight: 900; font-style: italic; }
    .reportFooter { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid #F2F2F2; }
    .reportScore { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.06em; color: #B87333; }
    .reportActions { display: flex; gap: 10px; align-items: center; }
    .reportActionBtn {
      padding: 9px 18px; background: #1a1a1a; color: #fff; border: none;
      border-radius: 10px; font-size: 9px; font-weight: 900; cursor: pointer;
      transition: all 0.18s; text-transform: uppercase; letter-spacing: 0.10em;
      box-shadow: 0 8px 16px rgba(0,0,0,0.10);
    }
    .reportActionBtn:hover { background: #000; }
    .downloadIcon {
      width: 34px; height: 34px; background: #F7F7F7; border: 1px solid #EAEAEA;
      border-radius: 10px; cursor: pointer; transition: all 0.18s;
      display: flex; align-items: center; justify-content: center; color: #1a1a1a;
    }
    .downloadIcon:hover { background: #EFEFEF; }

    .healthScoreCard {
      background: #F6F6F6; border: 1px solid #EAEAEA; border-radius: 999px;
      padding: 22px 30px; margin-bottom: 32px; display: flex; align-items: center; gap: 18px;
    }
    .healthScoreCircle {
      width: 66px; height: 66px; border-radius: 999px; border: 4px solid #B87333;
      background: #fff; display: grid; place-items: center; font-size: 18px;
      font-weight: 900; color: #111; flex-shrink: 0; box-shadow: 0 10px 22px rgba(0,0,0,0.10);
    }
    .healthScoreContent { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 28px; }
    .healthScoreText { min-width: 0; }
    .healthScoreTitle { font-size: 16px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.25px; color: #111; margin: 0 0 6px; line-height: 1.05; }
    .healthScoreDesc { font-size: 9px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: 0.16em; color: rgba(17,17,17,0.35); margin: 0; line-height: 1.35; }
    .healthMetrics { display: grid; grid-template-columns: repeat(3, auto); gap: 44px; align-items: center; }
    .healthMetric { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 6px; min-width: 92px; }
    .healthMetricValue { font-size: 20px; font-weight: 900; letter-spacing: -0.25px; line-height: 1; }
    .healthMetricLabel { font-size: 8px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: 0.18em; color: rgba(17,17,17,0.35); line-height: 1.1; }
    .metricGreen { color: #18A94B; }
    .metricOrange { color: #B87333; }

    .upgradeCTA {
      width: 100%; border-radius: 56px; padding: 56px 44px 54px; margin: 44px 0 72px;
      background: linear-gradient(180deg, #1b1b1b 0%, #141414 100%);
      border: 1px solid rgba(255,255,255,0.07); box-shadow: 0 30px 80px rgba(0,0,0,0.35);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; position: relative; overflow: hidden; color: #fff; isolation: isolate;
    }

    @media (max-width: 1024px) {
      .navLinks { display: none; }
      .reportsMain { padding: 40px 28px 60px; }
      .reportsGrid { grid-template-columns: repeat(2, 1fr); }
      .controlsBar { flex-direction: column; align-items: stretch; }
      .searchBox { width: 100%; }
      .healthMetrics { gap: 24px; }
    }

    @media (max-width: 640px) {
      .topNav { padding: 0 16px; }
      .profileMeta { display: none; }
      .reportsMain { padding: 32px 20px 60px; }
      .reportsGrid { grid-template-columns: 1fr; }
      .controlsBar { flex-direction: column; align-items: stretch; gap: 14px; }
      .filterTabsWrap { width: 100%; }
      .filterTabs {
        display: flex; gap: 12px; align-items: center; overflow-x: auto; overflow-y: hidden;
        -webkit-overflow-scrolling: touch; white-space: nowrap; padding: 0 2px; margin-bottom: 10px;
        scrollbar-width: none;
      }
      .filterTabs::-webkit-scrollbar { display: none; }
      .filterTab { flex: 0 0 auto; padding: 10px 18px; border-radius: 12px; }
      .tabsBottomRow { display: grid; grid-template-columns: 18px 1fr 18px; align-items: center; gap: 10px; }
      .tabArrowBtn { width: 18px; height: 18px; border: none; background: transparent; color: #9a9a9a; font-size: 16px; line-height: 1; padding: 0; cursor: pointer; }
      .tabsRail { height: 10px; background: #BDBDBD; border-radius: 999px; position: relative; overflow: hidden; }
      .tabsThumb { height: 100%; background: #7F7F7F; border-radius: 999px; position: absolute; left: 0; top: 0; will-change: transform; }
      .reportsHeaderRow { flex-direction: column; align-items: flex-start; gap: 10px; }
      .reportsHeaderLeft { width: 100%; }
      .reportsHeader h1 { font-size: 34px; line-height: 0.95; }
      .reportsHeader p { font-size: 9px; letter-spacing: 0.18em; line-height: 1.6; max-width: 320px; }
      .reportsStatsTop { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-top: 14px; width: 100%; }
      .reportsStatItem { align-items: center; text-align: center; gap: 6px; }
      .reportsStatValue { font-size: 22px; font-weight: 900; margin-top: 4px; }
      .reportsStatItem:last-child .reportsStatValue { color: #B87333; }
      .healthScoreCard { background: #F6F6F6; border: 1px solid #E6E6E6; border-radius: 28px; padding: 30px 22px 34px; min-height: 340px; display: flex; align-items: flex-start; gap: 16px; }
      .healthScoreCircle { width: 42px; height: 78px; border-radius: 999px; border: 4px solid #B87333; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 600; color: #111; flex-shrink: 0; }
      .healthScoreContent { display: block; width: 100%; }
      .healthScoreTitle { font-size: 18px; font-weight: 900; font-style: italic; text-transform: uppercase; letter-spacing: -0.25px; color: #111; margin: 2px 0 8px; line-height: 1.05; }
      .healthScoreTitleBreak { display: block; }
      .healthScoreDesc { font-size: 10px; font-weight: 800; font-style: italic; text-transform: uppercase; letter-spacing: 0.18em; color: #9C9C9C; line-height: 1.6; margin-top: 4px; max-width: 260px; }
      .healthScoreCard .healthMetrics { margin-top: 42px !important; padding: 0 6px !important; width: 100% !important; display: grid !important; grid-template-columns: 1fr 1fr !important; column-gap: 34px !important; row-gap: 40px !important; align-items: start !important; margin-left: -25px !important; }
      .healthScoreCard .healthMetric { min-width: 0 !important; display: flex !important; flex-direction: column !important; align-items: center !important; text-align: center !important; }
      .healthScoreCard .healthMetric.healthMetricChange { grid-column: 1 / -1 !important; margin-top: 6px !important; }
      .healthScoreCard .healthMetricLabel { white-space: normal !important; line-height: 1.25 !important; width: 100% !important; text-align: center !important; letter-spacing: 0.14em !important; font-size: 8px; }
      .upgradeCTA { border-radius: 34px; padding: 34px 18px 36px; }
    }

    .newValuationBtn { width: auto; }
@media (max-width: 640px) {
  .newValuationBtn { width: 100%; text-align: center; }
}

    @keyframes spin { to { transform: rotate(360deg); } }
  `;

  return (
    <>
      <style>{UI_CSS}</style>

      {/* ── TOP NAVIGATION ── */}
      <nav className="topNav">
        <div className="navLeft">

          {/* ── TRUVALU™ LOGO ── */}
          <div className="navBrand" onClick={() => navigate("/")}>
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
          </div>

          {/* ── NAV LINKS ── */}
          <div className="navLinks">
            {/* <div
              className={`navLink ${isDash ? "active" : ""}`}
              onClick={() => navigate("/dashboard")}
            >
              DASHBOARD
            </div> */}
            <div
              className="navLink terminal-link"
              onClick={goToTerminal}
            >
              TERMINAL
            </div>
            <div
              className={`navLink ${isReports ? "active" : ""}`}
              onClick={() => navigate("/my-reports")}
            >
              MY REPORTS
            </div>
            <div
              className={`navLink ${isSettings ? "active" : ""}`}
              onClick={() => navigate("/settings")}
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
                  <div className="menuTier">
  {(profile?.account_type || "Free").toUpperCase()} MEMBER
</div>
                </div>
                <div className="menuList">
                  {/* <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}>
                    <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
                    </svg>
                    <div className="menuText">Dashboard</div>
                  </div> */}
                  <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); goToTerminal(); }}>
                    <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="18" rx="2" />
                      <path d="M8 10l4 4 4-4" />
                    </svg>
                    <div className="menuText" style={{ color: "black" }}>Terminal</div>
                  </div>
                  <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); navigate("/my-reports"); }}>
                    <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                    <div className="menuText">My Reports</div>
                  </div>
                  <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); navigate("/settings"); }}>
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

      {/* ── MAIN CONTENT ── */}
      <main className="reportsMain">

        {/* Header */}
        <div className="reportsHeader">
          <div className="reportsHeaderRow">
            <div className="reportsHeaderLeft">
  <h1>INTELLIGENCE ARCHIVE</h1>
  <p>MANAGE AND MONITOR ALL YOUR GENERATED PROPERTY ASSESSMENTS</p>
  <button
  onClick={() => navigate("/valuation")}
  className="newValuationBtn"
  style={{
    marginTop: 16, height: 44, padding: "0 22px",
    background: "#111", color: "#fff", border: "none",
    borderRadius: 10, fontSize: 11, fontWeight: 900,
    letterSpacing: "0.14em", cursor: "pointer",
    textTransform: "uppercase", display: "block",
  }}
>
  + NEW VALUATION
</button>
</div>
            <div className="reportsStats reportsStatsTop">
             <div className="reportsStatItem">
  <div className="reportsStatLabel">TOTAL REPORTS</div>
  <div className="reportsStatValue">
    {userPlan.plan === "pro" || userPlan.plan === "elite"
      ? `${valuations.length} / ${userPlan.limit}`
      : `${userPlan.used} / ${userPlan.limit}`
    }
  </div>
  <div style={{ fontSize: 9, fontWeight: 800, color: userPlan.plan === "pro" || userPlan.plan === "elite" ? "#12b76a" : "#B87333", letterSpacing: "0.10em", textTransform: "uppercase", marginTop: 2 }}>
    {userPlan.plan === "pro" || userPlan.plan === "elite" ? "PRO PLAN" : "FREE PLAN"}
  </div>
</div>
              <div className="reportsStatItem">
                <div className="reportsStatLabel">ACTIVE ASSETS</div>
                <div className="reportsStatValue reportsStatAccent">{fmtAED(totalValue)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="controlsBar">
          <div className="filterTabsWrap">
            <div className="filterTabs" ref={tabsRef}>
              <div className={`filterTab ${activeFilter === "ALL" ? "active" : ""}`} onClick={() => setActiveFilter("ALL")}>ALL</div>
              <div className={`filterTab ${activeFilter === "FREE" ? "active" : ""}`} onClick={() => setActiveFilter("FREE")}>FREE</div>
              <div className={`filterTab ${activeFilter === "PAID" ? "active" : ""}`} onClick={() => setActiveFilter("PAID")}>PAID</div>
            </div>
            <div className="tabsBottomRow">
              <button type="button" className="tabArrowBtn" aria-label="Scroll left" onClick={() => tabsRef.current?.scrollBy({ left: -160, behavior: "smooth" })}>‹</button>
              <div className="tabsRail">
                <div className="tabsThumb" style={{ width: `${tabThumb.w}px`, transform: `translateX(${tabThumb.x}px)` }} />
              </div>
              <button type="button" className="tabArrowBtn" aria-label="Scroll right" onClick={() => tabsRef.current?.scrollBy({ left: 160, behavior: "smooth" })}>›</button>
            </div>
          </div>

          <div className="searchControls">
            <div className="searchBox">
              <svg className="searchIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text" className="searchInput"
                placeholder="Search by building or unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="filterBtn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px", gap: 16 }}>
            <div style={{ width: 40, height: 40, border: "3px solid #EDEDED", borderTop: "3px solid #B87333", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontSize: 10, fontWeight: 800, color: "#9a9a9a", letterSpacing: "0.18em", textTransform: "uppercase" }}>LOADING REPORTS...</div>
          </div>
        ) : reportCards.length === 0 ? (
          activeFilter === "PAID" ? null : (
          <div style={{ padding: "60px 40px", textAlign: "center", color: "#999", background: "#FAFAFA", borderRadius: "16px", border: "1px solid #EDEDED" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
            <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px", color: "#1a1a1a" }}>
              {searchQuery ? "No Reports Found" : "No Valuations Yet"}
            </div>
            <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 24 }}>
              {searchQuery ? "Try adjusting your search criteria" : "Create your first valuation to see it here"}
            </div>
            {!searchQuery && (
              <button onClick={() => navigate("/valuation")} style={{ padding: "12px 24px", background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 8, fontSize: 10, fontWeight: 800, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                + CREATE VALUATION
              </button>
            )}
          </div>
        ) ): (
          <>
            <div className="reportsGrid">
              {reportCards.map((card) => (
                <div key={card.id} className="reportCard" onClick={() => navigate(`/report?id=${card.id}`)}>
                  <div className="reportCardHeader">
                    <div className="reportIcon">🏠</div>
                    <div className="reportStatus">
                      <div className={`statusBadge ${card.status === "ACTIVE" ? "statusActive" : card.status === "EXPIRING" ? "statusExpiring" : "statusExpired"}`}>
                        {card.status}
                      </div>
                      <div className="reportDate">{card.date}</div>
                    </div>
                  </div>

                  <div className="reportTitle">{card.title}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    {card.bedrooms != null && (
                      <span style={{ fontSize: 10, color: "#9a9a9a", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        🛏 {card.bedrooms === 0 || String(card.bedrooms).toLowerCase() === "studio" ? "Studio" : `${card.bedrooms} Bed`}
                      </span>
                    )}
                    {card.bathrooms != null && (
                      <>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#ccc", display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: "#9a9a9a", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>🚿 {card.bathrooms} Bath</span>
                      </>
                    )}
                    {card.sizeSqft != null && (
                      <>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#ccc", display: "inline-block", flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: "#9a9a9a", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}>📐 {card.sizeSqft.toLocaleString()} sqft</span>
                      </>
                    )}
                  </div>
                  {card.district && (
                    <div style={{ fontSize: 10, color: "#9a9a9a", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>📍 {card.district}</div>
                  )}

                  <div className="reportMeta">
                    <div>
                      <div className="reportMetaLabel">ASSET VALUE</div>
                      <div className="reportMetaValue">{fmtAED(card.value)}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="reportMetaLabel">TYPE</div>
                      <div className="reportMetaType">{card.badge}</div>
                    </div>
                  </div>

                  <div className="reportFooter">
                    <div className="reportScore">SCORE: {card.score}/100</div>
                    <div className="reportActions">
                      <button className="reportActionBtn">VIEW REPORT</button>
                      <div className="downloadIcon" onClick={(e) => {
  e.stopPropagation();
  if (profile?.plan === "pro" || profile?.plan === "elite") {
    // PDF download for pro users (handled below)
    handleDownloadPDF(card);
  } else {
    setShowUpgradePopup(true);
  }
}}>↓</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Archive Health Score */}
            <div className="healthScoreCard">
              <div className="healthScoreCircle">{healthMetrics.score}</div>
              <div className="healthScoreContent">
                <div className="healthScoreText">
                  <div className="healthScoreTitle">ARCHIVE HEALTH <span className="healthScoreTitleBreak">SCORE</span></div>
                  <div className="healthScoreDesc">BASED ON YOUR PORTFOLIO'S<br/>INVESTMENT GRADE<br/>DISTRIBUTION</div>
                </div>
                <div className="healthMetrics">
                  <div className="healthMetric">
                    <div className="healthMetricValue metricGreen">{healthMetrics.investmentReady}%</div>
                    <div className="healthMetricLabel">INVESTMENT READY</div>
                  </div>
                  <div className="healthMetric">
                    <div className="healthMetricValue metricOrange">{healthMetrics.needsAttention}%</div>
                    <div className="healthMetricLabel">NEEDS ATTENTION</div>
                  </div>
                  <div className="healthMetric healthMetricChange">
                    <div className="healthMetricValue metricGreen">{healthMetrics.validChange}%</div>
                    <div className="healthMetricLabel">ACTIVE REPORTS</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Upgrade CTA */}
        <div
          className="upgradeCTA"
          style={{
            width: "100%", borderRadius: 56, padding: "56px 44px 54px", margin: "44px 0 72px",
            background: "linear-gradient(180deg, #1b1b1b 0%, #121212 100%)",
            border: "1px solid rgba(255,255,255,0.07)", boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            textAlign: "center", position: "relative", overflow: "hidden", color: "#fff", isolation: "isolate",
          }}
        >
          <style>{`
            @media (max-width: 520px){
              .upgradeCTA { border-radius: 40px !important; padding: 34px 18px 28px !important; margin: 22px 0 34px !important; }
              .upgradeCTA .ctaTitle { font-size: 30px !important; margin-bottom: 14px !important; }
              .upgradeCTA .ctaDesc { font-size: 15px !important; max-width: 280px !important; margin-bottom: 22px !important; font-family: 'Inter', sans-serif; }
              .upgradeCTA .ctaBtn { width: 88% !important; max-width: 280px !important; height: 64px !important; border-radius: 18px !important; }
            }
          `}</style>

          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(1200px 420px at 50% 10%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(900px 360px at 15% 70%, rgba(184,115,51,0.10), transparent 60%)", pointerEvents: "none", zIndex: 0 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 140, background: "linear-gradient(180deg, rgba(255,255,255,0.06), transparent)", opacity: 0.65, pointerEvents: "none", zIndex: 0 }} />

          <div style={{ width: 52, height: 52, display: "grid", placeItems: "center", marginBottom: 14, zIndex: 1, borderRadius: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 18px 60px rgba(0,0,0,0.35)" }}>
            <svg viewBox="0 0 24 24" style={{ width: 50, height: 50, color: "#B87333" }}>
              <path d="M12 6.5c-3.3 0-6 2.2-6 5.3 0 2.6 2.2 4.6 5 4.6 2.4 0 4.3-1.6 4.3-3.6 0-1.7-1.5-3-3.3-3-1.5 0-2.7.9-2.7 2.1 0 1 1 1.7 2.1 1.7.9 0 1.6-.5 1.6-1.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="ctaTitle" style={{ zIndex: 1, margin: "0 0 14px", fontSize: 44, fontWeight: 900, fontStyle: "italic", textTransform: "uppercase", letterSpacing: "-1px", lineHeight: 1, transform: "skewX(-8deg)", textShadow: "0 14px 30px rgba(0,0,0,0.55)" }}>
            NEED DEEPER <br /> INSIGHTS?
          </div>

          {!(profile?.plan === "pro" || profile?.plan === "elite") && (
  <p className="ctaDesc" style={{ zIndex: 1, maxWidth: 560, margin: "0 auto 28px", fontSize: 16, fontWeight: 400, letterSpacing: "0em", lineHeight: 1.7, color: "rgba(255,255,255,0.88)", fontFamily: "'Inter', sans-serif" }}>
    Founding Member pricing closes soon — AED 29 won't last.<br/>
    Join 225 founding members already locking in before it hits AED 149/mo.
  </p>
)}

          {profile?.plan === "pro" || profile?.plan === "elite" ? (
  <div style={{ zIndex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", background: "rgba(18,183,106,0.15)", border: "1px solid rgba(18,183,106,0.4)", borderRadius: 12 }}>
    <span style={{ fontSize: 16 }}>✅</span>
    <span style={{ fontSize: 11, fontWeight: 900, color: "#12b76a", letterSpacing: "0.14em", textTransform: "uppercase" }}>
      PRO PLAN ACTIVATED
    </span>
  </div>
) : (
  <button
    type="button"
    className="ctaBtn"
    onClick={() => navigate("/pricing")}
    style={{ zIndex: 1, height: 50, padding: "0 38px", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 14, background: "#B87333", color: "#fff", fontSize: 16, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", boxShadow: "0 18px 46px rgba(184,115,51,0.28)", outline: "none", fontFamily: "'Inter', sans-serif" }}
  >
   CLAIM YOUR SPOT →
  </button>
)}
        </div>

      </main>

{showUpgradePopup && (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
    zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
  }}>
    <div style={{
      background: "#fff", borderRadius: 20, padding: "28px 24px",
      maxWidth: 400, width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.25)", position: "relative",
    }}>
      <button onClick={() => setShowUpgradePopup(false)} style={{
        position: "absolute", top: 14, right: 16, background: "none",
        border: "none", fontSize: 20, cursor: "pointer", color: "#aaa",
      }}>✕</button>
      <div style={{ fontSize: 10, fontWeight: 900, color: "#B87333", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
        FOUNDING MEMBER OFFER
      </div>
      <h2 style={{ fontSize: 24, fontWeight: 900, fontStyle: "italic", textTransform: "uppercase", color: "#1a1a1a", marginBottom: 10 }}>
        ACQAR PRO
      </h2>
      <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 20, fontWeight: 500 }}>
        Founding Member pricing closes soon — AED 29 won't last.
Join 225 founding members already locking in before it hits AED 149/mo. 
      </p>
      <button
        onClick={() => { setShowUpgradePopup(false); navigate("/pricing"); }}
        style={{
          width: "100%", padding: "14px", background: "#B87333", color: "#fff",
          border: "none", borderRadius: 12, fontSize: 13, fontWeight: 900,
          cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase",
        }}
      >
        CLAIM YOUR SPOT →
      </button>
      <button onClick={() => setShowUpgradePopup(false)} style={{
        width: "100%", marginTop: 10, padding: "10px", background: "transparent",
        border: "none", fontSize: 11, color: "#aaa", cursor: "pointer",
        fontWeight: 700, textTransform: "uppercase",
      }}>
        Maybe later
      </button>
    </div>
  </div>
)}
      <Footer />
    </>
  );
}



