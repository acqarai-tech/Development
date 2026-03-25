// // src/pages/Settings.jsx
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
// /* ── DANGER ZONE (SEPARATE SECTION, SHOWN FOR ALL TABS) ── */
// function DangerZoneBanner() {
//   return (
//     <div className="dangerZoneWrap">
//       <div className="dangerZone">
//         <div className="dangerZoneLeft">
//           <div className="dangerIconWrap">
//             <svg className="dangerIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M3 6h18" />
//               <path d="M8 6V4h8v2" />
//               <path d="M19 6l-1 14H6L5 6" />
//               <path d="M10 11v6" />
//               <path d="M14 11v6" />
//             </svg>
//           </div>

//           <div>
//             <div className="dangerZoneTitle">INSTITUTIONAL DATA DELETION</div>
//             <div className="dangerZoneDesc">PERMANENTLY ERASE ALL YOUR REPORTS AND PORTFOLIO DATA</div>
//           </div>
//         </div>

//         <button className="dangerBtn" type="button">
//           DEACTIVATE ACCOUNT
//         </button>
//       </div>
//     </div>
//   );
// }

// export default function Settings() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [activeTab, setActiveTab] = useState("PROFILE");
//   const [message, setMessage] = useState("");

//   // Form states
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [investorType, setInvestorType] = useState("Private Investor");

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

//   const createdDate = useMemo(() => {
//     if (!profile?.created_at) return "";
//     const d = new Date(profile.created_at);
//     return d.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
//   }, [profile]);

//   useEffect(() => {
//     let mounted = true;

//     async function load() {
//       try {
//         setLoading(true);

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

//         let { data: uRow } = await supabase
//           .from("users")
//           .select("id, role, name, email, phone, created_at")
//           .eq("id", authId)
//           .maybeSingle();

//         if (!mounted) return;

//         const profileData = uRow || {
//           id: authId,
//           name: metaName || null,
//           email: authEmail || null,
//           phone: null,
//           created_at: null,
//         };

//         setProfile(profileData);
//         setFullName(profileData.name || "");
//         setEmail(profileData.email || "");
//         setPhone(profileData.phone || "");
//         setInvestorType(profileData.role || "Investor");
//       } catch (e) {
//         if (!mounted) return;
//         console.error("Failed to load settings:", e);
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

//  const handleLogout = useLogout();

//   async function handleSaveProfile(e) {
//     e.preventDefault();
//     if (!profile?.id) return;

//     setSaving(true);
//     setMessage("");

//     try {
//       const { error } = await supabase
//   .from("users")
//   .update({
//     name: fullName.trim() || null,
//     phone: phone.trim() || null,
//     role: investorType || null,
//   })
//   .eq("id", profile.id);

//       if (error) throw error;

//       setMessage("Profile updated successfully!");

//       const { data: updated } = await supabase
//         .from("users")
//         .select("id, role, name, email, phone, created_at")
//         .eq("id", profile.id)
//         .single();

//       if (updated) setProfile(updated);
//       setTimeout(() => setMessage(""), 3000);
//     } catch (error) {
//       console.error("Error updating profile:", error);
//       setMessage("Failed to update profile. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   }

//   /* ✅ RESPONSIVE UPGRADE:
//      - Fix nav overflow on small screens (wrap + horizontal scroll for tabs)
//      - Stack header (title + signout) on small screens
//      - Switch to 1-col layout on tablets/phones
//      - Card padding scales down
//      - Forms become single-column on small screens
//      - Long “dangerZoneDesc” wraps cleanly on small screens
//      - Menu width clamps to viewport
//   */
//   const UI_CSS = `
//     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

//     :root{
//       --page:#fbfbfb;
//       --text:#111111;
//       --line:#e9e9e9;

//       --copper:#b87333;

//       --green:#12b76a;
//       --danger:#e11d2e;
//       --dangerSoft:#fff0f2;
//       --dangerLine:#ffd6da;

//       --shadow: 0 22px 50px rgba(0,0,0,.10);
//       --shadow2: 0 14px 30px rgba(0,0,0,.12);
//       --radiusXL: 28px;
//     }

//     *{ margin:0; padding:0; box-sizing:border-box; }
//     html, body{ height:100%; }
//     body{
//       font-family:'Inter', sans-serif;
//       background: var(--page);
//       color: var(--text);
//     }

//     /* TOP NAV (kept) */
//     .topNav{
//       position:fixed; top:0; left:0; right:0;
//       height:58px;
//       background:#fff;
//       border-bottom:1px solid var(--line);
//       z-index:100;
//       display:flex; align-items:center; justify-content:space-between;
//       padding:0 28px;
//       gap: 14px;
//       min-width: 0;
//     }
//     .navLeft{ display:flex; align-items:center; gap:44px; min-width:0; }
//     .navBrand{
//       font-size:14px; font-weight:900; letter-spacing:.16em;
//       cursor:pointer; text-transform:uppercase; line-height:1;
//       flex-shrink:0;
//     }
//     .navLinks{ display:flex; gap:26px; align-items:center; min-width:0; }
//     .navLink{
//       font-size:10px; font-weight:800; letter-spacing:.14em;
//       color:rgba(17,17,17,.55);
//       cursor:pointer; text-transform:uppercase; line-height:1;
//       padding:18px 0; position:relative; user-select:none;
//       white-space: nowrap;
//       flex-shrink: 0;
//     }
//     .navLink:hover{ color:rgba(17,17,17,.85); }
//     .navLink.active{ color:var(--text); }
//     .navLink.active::after{
//       content:""; position:absolute; left:0; right:0; bottom:0;
//       height:2px; background:var(--text); border-radius:2px;
//     }

//     .navRight{ display:flex; align-items:center; gap:16px; min-width:0; }
//     .bellBtn{
//       width:34px; height:34px;
//       border-radius:999px; background:transparent; border:none;
//       display:grid; place-items:center; cursor:pointer; position:relative;
//       flex-shrink:0;
//     }
//     .bellIcon{ width:16px; height:16px; color:rgba(17,17,17,.75); }
//     .notificationDot{
//       position:absolute; top:8px; right:8px;
//       width:7px; height:7px; background:var(--copper);
//       border-radius:50%; border:2px solid #fff;
//     }

//     .profileWrap{ position:relative; min-width:0; }
//     .profileBtn{
//       display:flex; align-items:center; gap:10px;
//       cursor:pointer; border:none; background:transparent; padding:4px 0;
//       min-width:0;
//     }
//     .profileMeta{ display:flex; flex-direction:column; align-items:flex-end; line-height:1.05; min-width:0; }
//     .profileName{
//       font-size:10px; font-weight:800; letter-spacing:.12em;
//       text-transform:uppercase; white-space:nowrap;
//       max-width:220px; overflow:hidden; text-overflow:ellipsis;
//     }
//     .profileRole{
//       font-size:9px; font-weight:700; letter-spacing:.12em;
//       text-transform:uppercase; color:rgba(17,17,17,.45);
//       margin-top:2px; white-space:nowrap;
//     }
//     .profileAvatar{
//       width:28px; height:28px; border-radius:999px;
//       background:var(--copper); display:grid; place-items:center;
//       color:#fff; font-size:10px; font-weight:900; letter-spacing:.06em;
//       text-transform:uppercase;
//       flex-shrink:0;
//     }
//     .caret{ width:14px; height:14px; color:rgba(17,17,17,.55); margin-left:2px; flex-shrink:0; }

//     .menu{
//       position:absolute; top:calc(100% + 10px); right:0;
//       width:220px; max-width: calc(100vw - 24px);
//       background:#fff; border:1px solid var(--line);
//       border-radius:14px; box-shadow:0 18px 40px rgba(0,0,0,.12);
//       overflow:hidden; z-index:200;
//     }
//     .menuTop{ padding:14px 16px 12px; border-bottom:1px solid #efefef; background:#fff; }
//     .menuTopLabel{
//       font-size:9px; font-weight:900; letter-spacing:.18em;
//       color:rgba(17,17,17,.35); text-transform:uppercase; margin-bottom:8px;
//     }
//     .menuName{
//       font-size:13px; font-weight:900; font-style:italic;
//       text-transform:uppercase; letter-spacing:.02em; margin-bottom:4px; line-height:1.1;
//     }
//     .menuTier{
//       font-size:9px; font-weight:900; letter-spacing:.14em;
//       color:var(--copper); text-transform:uppercase; line-height:1.1;
//     }
//     .menuList{ padding:8px 0; }
//     .menuItem{
//       display:flex; align-items:center; gap:10px;
//       padding:11px 16px; cursor:pointer; user-select:none;
//       transition:background .14s;
//     }
//     .menuItem:hover{ background:#fafafa; }
//     .menuIcon{ width:16px; height:16px; color:rgba(17,17,17,.55); flex-shrink:0; }
//     .menuText{
//       font-size:10px; font-weight:900; letter-spacing:.14em;
//       text-transform:uppercase;
//     }
//     .menuDivider{ height:1px; background:#efefef; margin:8px 0; }
//     .menuSignout{
//       display:flex; align-items:center; justify-content:center; gap:8px;
//       padding:12px 16px 14px; cursor:pointer; color:#ff4d4d;
//       font-size:10px; font-weight:900; letter-spacing:.18em;
//       text-transform:uppercase; user-select:none; transition:background .14s;
//     }
//     .menuSignout:hover{ background:#fff6f6; }
//     .menuSignout svg{ width:16px; height:16px; color:#ff4d4d; }

//     /* PAGE WRAP */
//     .settingsMain{
//       margin-top:58px;
//       margin-bottom: 60px;
//       max-width: 1220px;
//       margin-left:auto; margin-right:auto;
//       padding: 42px 28px 40px;
//     }

//     .settingsHeader{
//       display:flex; justify-content:space-between; align-items:flex-start;
//       margin-bottom: 26px; padding: 6px 0 18px;
//       gap: 14px;
//     }
//     .settingsHeader h1{
//       font-size: 44px; font-weight: 900; font-style: italic;
//       letter-spacing: -1px; text-transform: uppercase; line-height: 1;
//     }
//     .settingsHeader p{
//       margin-top: 10px; font-size: 11px; font-weight: 700;
//       color: rgba(17,17,17,.45); letter-spacing: .18em; text-transform: uppercase;
//       line-height: 1.5;
//       max-width: 760px;
//     }

//     .signOutBtn{
//       padding: 10px 16px;
//       background: #f4f4f4;
//       color: rgba(17,17,17,.6);
//       border: 1px solid #efefef;
//       border-radius: 10px;
//       font-size: 10px;
//       font-weight: 900;
//       letter-spacing: .16em;
//       cursor:pointer;
//       text-transform: uppercase;
//       transition: background .16s, color .16s, border-color .16s;
//       white-space: nowrap;
//       flex-shrink: 0;
//     }
//     .signOutBtn:hover{
//       background:#ededed;
//       color: rgba(17,17,17,.8);
//       border-color:#e7e7e7;
//     }

//     .settingsLayout{
//       display:grid;
//       grid-template-columns: 260px 1fr;
//       gap: 34px;
//       align-items:start;
//     }

//     .settingsSidebar{
//       display:flex; flex-direction:column; gap: 10px; padding-top: 6px;
//       position: sticky;
//       top: calc(58px + 16px);
//       align-self: start;
//     }
//     .sidebarTab{
//       padding: 14px 18px;
//       border: none;
//       background: transparent;
//       border-radius: 12px;
//       text-align:left;
//       cursor:pointer;

//       font-size: 11px;
//       font-weight: 900;
//       letter-spacing: .16em;
//       text-transform: uppercase;

//       color: rgba(17,17,17,.35);
//       transition: background .18s, color .18s, box-shadow .18s;
//     }
//     .sidebarTab:hover{
//       color: rgba(17,17,17,.65);
//       background: rgba(0,0,0,.03);
//     }
//     .sidebarTab.active{
//       background: linear-gradient(180deg, #1b1b1b 0%, #0f0f0f 100%);
//       color: #fff;
//       box-shadow: 0 16px 28px rgba(0,0,0,.18);
//     }

//     .verificationBadge{
//       margin-top: 26px;
//       padding: 18px 18px;
//       background: #fbfbfb;
//       border: 1px solid #efefef;
//       border-radius: 14px;
//     }
//     .verificationHeader{ display:flex; align-items:center; gap:10px; margin-bottom: 10px; }
//     .verificationIcon{ width: 18px; height: 18px; color: var(--green); }
//     .verificationTitle{
//       font-size: 10px; font-weight: 900; letter-spacing: .14em;
//       text-transform: uppercase; color: var(--green);
//     }
//     .verificationDesc{
//       font-size: 10px; font-weight: 700; color: rgba(17,17,17,.38);
//       letter-spacing: .12em; text-transform: uppercase; line-height: 1.5;
//     }

//     .settingsContent{
//       background:#fff;
//       border: 1px solid #f1f1f1;
//       border-radius: var(--radiusXL);
//       padding: 34px 36px 38px;
//       box-shadow: var(--shadow);
//       position: relative;
//       overflow: hidden;
//       min-width: 0;
//     }

//     .loadingWrap{
//       padding: 60px 10px;
//       text-align:center;
//       color: rgba(17,17,17,.45);
//       font-size: 12px;
//       font-weight: 800;
//       letter-spacing: .14em;
//       text-transform: uppercase;
//     }

//     /* PROFILE */
//     .profileHeader{
//       display:flex; align-items:center; gap: 22px;
//       padding: 10px 4px 22px;
//       border-bottom: 1px solid #ececec;
//       margin-bottom: 22px;
//       min-width: 0;
//     }
//     .profileAvatarLarge{
//       width: 72px; height: 72px; border-radius: 999px;
//       background: #c07a33;
//       display:flex; align-items:center; justify-content:center;
//       color:#fff; font-size: 22px; font-weight: 900; letter-spacing: .06em;
//       text-transform: uppercase; position: relative; flex-shrink: 0;
//     }
//     .editAvatarBtn{
//       position:absolute; right: -2px; bottom: -2px;
//       width: 26px; height: 26px; border-radius: 999px;
//       background:#fff; border: 1px solid #e9e9e9;
//       display:grid; place-items:center; cursor:pointer;
//       box-shadow: 0 10px 18px rgba(0,0,0,.10);
//       transition: transform .14s, border-color .14s;
//     }
//     .editAvatarBtn:hover{ transform: translateY(-1px); border-color: #dcdcdc; }
//     .editAvatarBtn svg{ width: 14px; height: 14px; color: rgba(17,17,17,.6); }

//     .profileInfo{ min-width:0; }
//     .profileInfo h2{
//       font-size: 24px; font-weight: 900; font-style: italic;
//       text-transform: uppercase; letter-spacing: -0.6px; line-height: 1.05;
//       margin-bottom: 6px;
//       overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
//       max-width: 100%;
//     }
//     .profileMemberSince{
//       font-size: 11px; font-weight: 900; text-transform: uppercase;
//       letter-spacing: .14em; color: var(--copper);
//       white-space: nowrap;
//     }

//     .settingsForm{ display:flex; flex-direction:column; gap: 18px; padding: 4px 4px 0; }
//     .formRow{ display:grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
//     .formGroup{ display:flex; flex-direction:column; gap: 10px; min-width:0; }
//     .formLabel{
//       font-size: 10px; font-weight: 900; letter-spacing: .14em;
//       text-transform: uppercase; color: rgba(17,17,17,.42);
//     }
//     .formInput, .formSelect{
//       width:100%; height: 46px; padding: 0 16px;
//       border-radius: 12px; border: 1px solid #e7e7e7;
//       background: #f8f8f8; font-size: 12px; font-weight: 700;
//       outline: none; transition: border-color .15s, background .15s;
//     }
//     .formInput:focus, .formSelect:focus{ border-color: #d9d9d9; background: #f6f6f6; }
//     .formInput:disabled{ background:#f4f4f4; color: rgba(17,17,17,.45); cursor:not-allowed; }
//     .formSelect{
//       appearance:none;
//       background-image:
//         linear-gradient(45deg, transparent 50%, rgba(17,17,17,.55) 50%),
//         linear-gradient(135deg, rgba(17,17,17,.55) 50%, transparent 50%);
//       background-position: calc(100% - 18px) 19px, calc(100% - 13px) 19px;
//       background-size: 5px 5px, 5px 5px;
//       background-repeat:no-repeat;
//       padding-right: 36px;
//       cursor:pointer;
//     }

//     .successMessage{
//       padding: 12px 14px;
//       border-radius: 12px;
//       background: rgba(18, 183, 106, .10);
//       border: 1px solid rgba(18, 183, 106, .22);
//       color: rgba(17,17,17,.75);
//       font-size: 11px;
//       font-weight: 900;
//       letter-spacing: .10em;
//       text-transform: uppercase;
//       word-break: break-word;
//     }

//     .saveBtn{
//       margin-top: 10px;
//       height: 50px;
//       padding: 0 28px;
//       border: none;
//       border-radius: 12px;
//       background: linear-gradient(180deg, #1b1b1b 0%, #0f0f0f 100%);
//       color: #fff;
//       font-size: 11px;
//       font-weight: 900;
//       letter-spacing: .18em;
//       text-transform: uppercase;
//       cursor:pointer;
//       box-shadow: 0 18px 28px rgba(0,0,0,.20);
//       transition: transform .14s, box-shadow .14s;
//       align-self:flex-start;
//       min-width: 260px;
//       max-width: 100%;
//     }
//     .saveBtn:hover{ transform: translateY(-1px); box-shadow: 0 22px 34px rgba(0,0,0,.22); }
//     .saveBtn:disabled{ background: #e9e9e9; color: rgba(17,17,17,.45); cursor:not-allowed; box-shadow:none; transform:none; }

//     /* SECTION TITLES */
//     .securitySection h3,
//     .billingSection h3,
//     .notificationsSection h3{
//       font-size: 22px;
//       font-weight: 900;
//       font-style: italic;
//       text-transform: uppercase;
//       letter-spacing: -0.5px;
//       margin: 2px 0 18px;
//     }

//     /* SECURITY */
//     .passwordFields{
//       border: 1px solid #efefef;
//       background: #fbfbfb;
//       border-radius: 18px;
//       padding: 18px;
//       margin-bottom: 18px;
//     }
//     .twoFactorCard{
//       border: 1px solid #efefef;
//       background: #fbfbfb;
//       border-radius: 18px;
//       padding: 18px;
//       display:flex;
//       align-items:center;
//       justify-content:space-between;
//       gap: 16px;
//       margin-bottom: 18px;
//       min-width:0;
//     }
//     .twoFactorLeft{ display:flex; align-items:center; gap: 14px; min-width:0; }
//     .twoFactorIcon{ width: 18px; height: 18px; color: var(--copper); flex-shrink:0; }
//     .twoFactorInfo{ min-width:0; }
//     .twoFactorInfo h4{
//       font-size: 12px;
//       font-weight: 900;
//       text-transform: uppercase;
//       letter-spacing: .10em;
//       margin-bottom: 6px;
//       font-style: italic;
//       white-space: nowrap;
//       overflow: hidden;
//       text-overflow: ellipsis;
//     }
//     .twoFactorInfo p{
//       font-size: 10px;
//       font-weight: 900;
//       text-transform: uppercase;
//       letter-spacing: .14em;
//       color: rgba(17,17,17,.35);
//       white-space: nowrap;
//       overflow: hidden;
//       text-overflow: ellipsis;
//     }
//     .toggle{
//       position:relative;
//       width: 44px;
//       height: 24px;
//       background: #111;
//       border-radius: 999px;
//       cursor: pointer;
//       flex-shrink:0;
//       box-shadow: inset 0 0 0 1px rgba(0,0,0,.04);
//     }
//     .toggle.off{ background: #dedede; }
//     .toggleKnob{
//       position:absolute;
//       top: 3px; left: 3px;
//       width: 18px; height: 18px;
//       background:#fff;
//       border-radius: 999px;
//       transition: transform .18s;
//       box-shadow: 0 8px 14px rgba(0,0,0,.18);
//     }
//     .toggle:not(.off) .toggleKnob{ transform: translateX(20px); }

//     /* BILLING */
//     .subscriptionBanner{
//       border-radius: 26px;
//       padding: 26px 26px;
//       background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
//       color:#fff;
//       position: relative;
//       overflow:hidden;
//       box-shadow: var(--shadow2);
//       margin-bottom: 22px;
//       min-height: 120px;
//       display:flex;
//       align-items:center;
//       justify-content:space-between;
//       gap: 18px;
//       min-width:0;
//     }
//     .subscriptionBanner::before{
//       content:"";
//       position:absolute;
//       inset:0;
//       opacity:.10;
//       background: radial-gradient(60% 80% at 20% 20%, rgba(255,255,255,.25), transparent 60%);
//       pointer-events:none;
//     }
//     .subscriptionLeft{ position:relative; z-index:1; min-width:0; }
//     .subscriptionRight{ position:relative; z-index:1; text-align:right; min-width: 170px; }
//     .subscriptionLabel{
//       font-size: 10px;
//       font-weight: 900;
//       letter-spacing: .24em;
//       text-transform: uppercase;
//       color: var(--copper);
//       margin-bottom: 10px;
//     }
//     .subscriptionTitle{
//       font-size: 30px;
//       font-weight: 900;
//       font-style: italic;
//       text-transform: uppercase;
//       letter-spacing: -0.6px;
//       margin-bottom: 8px;
//       line-height: 1.1;
//     }
//     .subscriptionDesc{
//       font-size: 10px;
//       font-weight: 900;
//       letter-spacing: .16em;
//       text-transform: uppercase;
//       color: rgba(255,255,255,.55);
//       line-height: 1.4;
//     }
//     .subscriptionRightTop{
//       font-size: 11px;
//       font-weight: 900;
//       letter-spacing: .14em;
//       text-transform: uppercase;
//       color: rgba(255,255,255,.75);
//       white-space: nowrap;
//     }
//     .subscriptionRightBottom{
//       margin-top: 10px;
//       font-size: 10px;
//       font-weight: 900;
//       letter-spacing: .14em;
//       text-transform: uppercase;
//       color: rgba(255,255,255,.45);
//       white-space: nowrap;
//     }

//     .paymentMethodsLabel{
//       font-size: 11px;
//       font-weight: 900;
//       letter-spacing: .24em;
//       text-transform: uppercase;
//       color: rgba(17,17,17,.35);
//       margin: 18px 0 14px;
//     }
//     .paymentCard{
//       background:#fff;
//       border: 1px solid #efefef;
//       border-radius: 16px;
//       padding: 16px 16px;
//       display:flex;
//       align-items:center;
//       justify-content:space-between;
//       gap: 14px;
//       margin-bottom: 12px;
//       min-width:0;
//     }
//     .paymentCardLeft{ display:flex; align-items:center; gap: 12px; min-width:0; }
//     .cardIcon{
//       width: 48px;
//       height: 32px;
//       border-radius: 8px;
//       border: 1px solid #ededed;
//       background: #f7f7f7;
//       display:flex;
//       align-items:center;
//       justify-content:center;
//       font-size: 11px;
//       font-weight: 900;
//       letter-spacing: .08em;
//       color: rgba(17,17,17,.7);
//       flex-shrink:0;
//     }
//     .cardInfo{ min-width:0; }
//     .cardInfo h4{
//       font-size: 12px; font-weight: 900; letter-spacing: .02em; margin-bottom: 4px;
//       white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
//       max-width: 52vw;
//     }
//     .cardInfo p{
//       font-size: 10px;
//       font-weight: 900;
//       text-transform: uppercase;
//       letter-spacing: .14em;
//       color: rgba(17,17,17,.35);
//       white-space: nowrap;
//     }
//     .editCardBtn{
//       border:none;
//       background: transparent;
//       color: rgba(17,17,17,.75);
//       font-size: 11px;
//       font-weight: 900;
//       letter-spacing: .18em;
//       text-transform: uppercase;
//       cursor:pointer;
//       padding: 10px 12px;
//       border-radius: 10px;
//       transition: background .14s;
//       text-decoration: underline;
//       text-underline-offset: 6px;
//       flex-shrink:0;
//     }
//     .editCardBtn:hover{ background: rgba(0,0,0,.03); }
//     .addPaymentBtn{
//       border:none;
//       background: transparent;
//       color: var(--copper);
//       font-size: 11px;
//       font-weight: 900;
//       letter-spacing: .22em;
//       text-transform: uppercase;
//       cursor:pointer;
//       padding: 10px 0;
//       display:inline-flex;
//       align-items:center;
//       gap: 10px;
//     }
//     .addPaymentBtn span{ font-size: 14px; font-weight: 900; line-height: 1; }

//     /* NOTIFICATIONS */
//     .notificationItem{
//       padding: 20px 18px;
//       border-top: 1px solid #ededed;
//       display:flex;
//       align-items:center;
//       justify-content:space-between;
//       gap: 14px;
//       background: transparent;
//       min-width:0;
//     }
//     .notificationItem:first-of-type{ border-top: none; padding-top: 10px; }
//     .notificationInfo{ min-width:0; }
//     .notificationInfo h4{
//       font-size: 12px;
//       font-weight: 900;
//       text-transform: uppercase;
//       letter-spacing: .10em;
//       margin-bottom: 8px;
//       font-style: italic;
//       white-space: nowrap;
//       overflow: hidden;
//       text-overflow: ellipsis;
//     }
//     .notificationInfo p{
//       font-size: 10px;
//       font-weight: 900;
//       text-transform: uppercase;
//       letter-spacing: .16em;
//       color: rgba(17,17,17,.35);
//       line-height: 1.5;
//       overflow-wrap: anywhere;
//     }

//     /* ✅ DANGER ZONE WRAP (OUTSIDE WHITE CARD) */
//     .dangerZoneWrap{
//       max-width: 1200px;
//       margin: 34px auto 120px ;
//       padding: 0 28px;
//     }

//     .dangerZone{
//       background: var(--dangerSoft);
//       border: 1px solid var(--dangerLine);
//       border-radius: 44px;
//       padding: 34px 36px;
//       min-height: 128px;
//       display:flex;
//       align-items:center;
//       justify-content:space-between;
//       gap: 22px;
//       min-width:0;
//     }

//     .dangerZoneLeft{
//       display:flex;
//       align-items:center;
//       gap: 18px;
//       min-width:0;
//     }

//     .dangerIconWrap{
//       width: 54px;
//       height: 54px;
//       border-radius: 16px;
//       background: #fff;
//       border: 1px solid #ffe1e4;
//       display:grid;
//       place-items:center;
//       flex-shrink:0;
//       box-shadow: 0 12px 22px rgba(0,0,0,.06);
//     }

//     .dangerIcon{
//       width: 20px;
//       height: 20px;
//       color: var(--danger);
//     }

//     .dangerZoneTitle{
//       font-size: 16px;
//       font-weight: 900;
//       font-style: italic;
//       text-transform: uppercase;
//       letter-spacing: -0.3px;
//       color: var(--danger);
//       margin-bottom: 8px;
//       line-height: 1.1;
//     }

//     .dangerZoneDesc{
//       font-size: 10px;
//       font-weight: 900;
//       text-transform: uppercase;
//       letter-spacing: .18em;
//       color: rgba(225,29,46,.60);
//       line-height: 1.55;
//       white-space: nowrap;
//       overflow: hidden;
//       text-overflow: ellipsis;
//       max-width: 720px;
//     }

//     .dangerBtn{
//       height: 48px;
//       padding: 0 22px;
//       background: var(--danger);
//       color:#fff;
//       border:none;
//       border-radius: 14px;
//       font-size: 10px;
//       font-weight: 900;
//       letter-spacing: .18em;
//       text-transform: uppercase;
//       cursor:pointer;
//       box-shadow: 0 18px 30px rgba(225,29,46,.28);
//       transition: transform .14s, box-shadow .14s;
//       flex-shrink:0;
//       min-width: 240px;
//       max-width: 100%;
//     }

//     .dangerBtn:hover{
//       transform: translateY(-1px);
//       box-shadow: 0 24px 38px rgba(225,29,46,.34);
//     }

//     /* ─────────────────────────────────────────────
//        ✅ RESPONSIVE BREAKPOINTS (NEW)
//        ───────────────────────────────────────────── */

//     /* ≤ 1100px: slightly tighter */
//     @media (max-width: 1100px){
//       .settingsMain{ padding: 34px 22px 36px; }
//       .settingsHeader h1{ font-size: 38px; }
//       .settingsLayout{ gap: 22px; }
//       .settingsContent{ padding: 28px 26px 28px; }
//       .dangerZoneWrap{ padding: 0 22px; }
//     }

//     /* ≤ 980px: stack sidebar above content */
//     @media (max-width: 980px){
//       .settingsLayout{
//         grid-template-columns: 1fr;
//         gap: 18px;
//       }
//       .settingsSidebar{
//         position: static;
//         top: auto;
//         flex-direction: row;
//         flex-wrap: nowrap;
//         overflow-x: auto;
//         gap: 10px;
//         padding: 0 2px 6px;
//         -webkit-overflow-scrolling: touch;
//       }
//       .settingsSidebar::-webkit-scrollbar{ height: 6px; }
//       .settingsSidebar::-webkit-scrollbar-thumb{ background: rgba(0,0,0,.10); border-radius: 999px; }
//       .sidebarTab{ white-space: nowrap; flex-shrink: 0; }
//       .verificationBadge{ display:none; }
//     }

//     /* ≤ 780px: header stacks, forms become 1 column */
//     @media (max-width: 780px){
//       .settingsHeader{
//         flex-direction: column;
//         align-items: flex-start;
//       }
//       .settingsHeader h1{ font-size: 34px; }
//       .settingsHeader p{ max-width: 100%; }
//       .signOutBtn{ align-self: flex-start; }

//       .formRow{ grid-template-columns: 1fr; }

//       .profileHeader{
//         gap: 14px;
//       }
//       .profileInfo h2{ font-size: 20px; }
//       .profileMemberSince{ font-size: 10px; letter-spacing: .12em; white-space: normal; }

//       .subscriptionBanner{
//         flex-direction: column;
//         align-items: flex-start;
//         text-align: left;
//       }
//       .subscriptionRight{ text-align: left; min-width: 0; }
//       .subscriptionRightTop, .subscriptionRightBottom{ white-space: normal; }

//       .saveBtn{ width: 100%; min-width: 0; }

//       .topNav{ padding: 0 16px; }
//       .navLeft{ gap: 18px; }
//       .navLinks{
//         gap: 14px;
//         overflow-x: auto;
//         -webkit-overflow-scrolling: touch;
//         padding-right: 6px;
//       }
//       .navLinks::-webkit-scrollbar{ height: 0px; }
//       .profileName{ max-width: 140px; }
//     }

//     /* ≤ 520px: reduce paddings + danger zone stacks */
//     @media (max-width: 520px){
//       .settingsMain{ padding: 26px 14px 30px; }
//       .settingsHeader h1{ font-size: 28px; }
//       .settingsContent{ padding: 22px 16px 22px; border-radius: 22px; }

//       .profileAvatarLarge{ width: 64px; height: 64px; font-size: 20px; }

//       .passwordFields, .twoFactorCard{ padding: 14px; border-radius: 16px; }

//       .dangerZoneWrap{ padding: 0 14px; }
//       .dangerZone{
//         padding: 18px 16px;
//         border-radius: 28px;
//         flex-direction: column;
//         align-items: flex-start;
//       }
//       .dangerZoneDesc{
//         white-space: normal;
//         overflow: visible;
//         text-overflow: clip;
//         max-width: 100%;
//       }
//       .dangerBtn{ width: 100%; min-width: 0; }
//     }

//     /* ≤ 420px: compact top nav right side */
//     @media (max-width: 420px){
//       .profileMeta{ display:none; }
//       .navBrand{ font-size: 13px; }
//     }
//       /* ✅ MOBILE HEADER: show only logo + bell + avatar (like your screenshot) */
// @media (max-width: 640px){
//   .navLinks{ display:none !important; }     /* hide DASHBOARD / MY REPORTS / SETTINGS */
//   .profileMeta{ display:none !important; }  /* hide name + INVESTOR TIER */

//   .topNav{ padding: 0 14px; }
//   .navLeft{ gap: 12px; }                   /* tighter spacing */
// }

// /* ✅ MOBILE SETTINGS HEADER: match your screenshot layout */
// @media (max-width: 640px){
//   .settingsHeader{
//     flex-direction: column;
//     align-items: flex-start;
//     gap: 12px;
//     padding: 6px 0 14px;
//     margin-bottom: 18px;
//   }

//   .settingsHeader h1{
//     font-size: 34px;   /* keeps the strong headline look */
//     line-height: 1;
//   }

//   .settingsHeader p{
//     margin-top: 8px;
//     max-width: 100%;
//   }

//   /* ✅ move SIGN OUT to the right under the text */
//   .signOutBtn{
//     align-self: flex-end;
//     margin-top: 6px;
//   }
// }

// /* ✅ MOBILE: Sidebar must be vertical + show verification card (like your screenshot) */
// @media (max-width: 640px){
//   .settingsSidebar{
//     position: static;
//     top: auto;

//     flex-direction: column;     /* ✅ stack items */
//     flex-wrap: nowrap;
//     overflow: visible;          /* ✅ no horizontal scroll */
//     gap: 18px;
//     padding: 6px 0 0;
//   }

//   .sidebarTab{
//     width: 100%;                /* ✅ full width pills */
//     white-space: normal;
//   }

//   .verificationBadge{
//     display: block !important;  /* ✅ show the card on mobile */
//     margin-top: 18px;
//   }
// }


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
//             <div className={`navLink ${isDash ? "active" : ""}`} onClick={() => navigate("/dashboard")}>
//               DASHBOARD
//             </div>
//             <div className={`navLink ${isReports ? "active" : ""}`} onClick={() => navigate("/my-reports")}>
//               MY REPORTS
//             </div>
//             <div className={`navLink ${isSettings ? "active" : ""}`} onClick={() => navigate("/settings")}>
//               SETTINGS
//             </div>
//           </div>
//         </div>

//         <div className="navRight" ref={menuWrapRef}>
//           <button className="bellBtn" type="button" aria-label="Notifications">
//             <svg className="bellIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
//                   <div className="menuItem" role="menuitem" onClick={() => { setMenuOpen(false); navigate("/dashboard"); }}>
//                     <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                       <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
//                     </svg>
//                     <div className="menuText">Dashboard</div>
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

//       {/* Main Content */}
//       <main className="settingsMain">
//         <div className="settingsHeader">
//           <div>
//             <h1>ACCOUNT SETTINGS</h1>
//             <p>MANAGE YOUR INSTITUTIONAL IDENTITY, SECURITY, AND INSTITUTIONAL PREFERENCES</p>
//           </div>
//           <button className="signOutBtn" onClick={handleLogout}>
//             SIGN OUT
//           </button>
//         </div>

//         <div className="settingsLayout">
//           {/* Sidebar */}
//           <div className="settingsSidebar">
//             <button className={`sidebarTab ${activeTab === "PROFILE" ? "active" : ""}`} onClick={() => setActiveTab("PROFILE")}>
//               PROFILE
//             </button>
//             {/* <button className={`sidebarTab ${activeTab === "SECURITY" ? "active" : ""}`} onClick={() => setActiveTab("SECURITY")}>
//               SECURITY
//             </button> */}
//             {/* <button className={`sidebarTab ${activeTab === "BILLING" ? "active" : ""}`} onClick={() => setActiveTab("BILLING")}>
//               BILLING
//             </button> */}
//             <button className={`sidebarTab ${activeTab === "NOTIFICATIONS" ? "active" : ""}`} onClick={() => setActiveTab("NOTIFICATIONS")}>
//               NOTIFICATIONS
//             </button>

//             <div className="verificationBadge">
//               <div className="verificationHeader">
//                 <svg className="verificationIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//                   <polyline points="9 12 11 14 15 10" />
//                 </svg>
//                 <div className="verificationTitle">VERIFIED INVESTOR</div>
//               </div>
//               <div className="verificationDesc">IDENTITY VERIFIED VIA DUBAI DIGITAL AUTHORITY FRAMEWORK</div>
//             </div>
//           </div>

//           {/* Content Card */}
//           <div className="settingsContent">
//             {loading ? (
//               <div className="loadingWrap">LOADING ACCOUNT SETTINGS…</div>
//             ) : (
//               <>
//                 {activeTab === "PROFILE" && (
//                   <>
//                     <div className="profileHeader">
//                       <div className="profileAvatarLarge">
//                         {initials}
//                         <button className="editAvatarBtn" type="button" aria-label="Edit avatar">
//                           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                             <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
//                             <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
//                           </svg>
//                         </button>
//                       </div>
//                       <div className="profileInfo">
//                         <h2>{nameToShow}</h2>
//                         <div className="profileMemberSince">ACTIVE SINCE {createdDate || "OCTOBER 2024"}</div>
//                       </div>
//                     </div>

//                     <form className="settingsForm" onSubmit={handleSaveProfile}>
//                       <div className="formRow">
//                         <div className="formGroup">
//                           <label className="formLabel">FULL LEGAL NAME</label>
//                           <input
//                             type="text"
//                             className="formInput"
//                             value={fullName}
//                             onChange={(e) => setFullName(e.target.value)}
//                             placeholder="Enter your full name"
//                           />
//                         </div>
//                         <div className="formGroup">
//                           <label className="formLabel">EMAIL ADDRESS</label>
//                           <input type="email" className="formInput" value={email} disabled />
//                         </div>
//                       </div>

//                       <div className="formRow">
//                         <div className="formGroup">
//                           <label className="formLabel">PHONE NUMBER</label>
//                           <input
//                             type="tel"
//                             className="formInput"
//                             value={phone}
//                             onChange={(e) => setPhone(e.target.value)}
//                             placeholder="+971 50 123 4567"
//                           />
//                         </div>
//                         <div className="formGroup">
//   <label className="formLabel">USER TYPE</label>
//   <select className="formSelect" value={investorType} onChange={(e) => setInvestorType(e.target.value)}>
//     {["Investor", "Buyer", "Seller", "Agent"].map(r => (
//       <option key={r} value={r}>{r}</option>
//     ))}
//   </select>
// </div>
//                       </div>

//                       {message && <div className="successMessage">{message}</div>}

//                       <button type="submit" className="saveBtn" disabled={saving}>
//                         {saving ? "SAVING..." : "SAVE PROFILE CHANGES"}
//                       </button>
//                     </form>
//                   </>
//                 )}

//                 {/* {activeTab === "SECURITY" && (
//                   <div className="securitySection">
//                     <h3>ACCESS CONTROLS</h3>

//                     <div className="passwordFields">
//                       <div className="formRow">
//                         <div className="formGroup">
//                           <label className="formLabel">CURRENT PASSWORD</label>
//                           <input type="password" className="formInput" placeholder="••••••••••••" />
//                         </div>
//                         <div className="formGroup">
//                           <label className="formLabel">NEW PASSWORD</label>
//                           <input type="password" className="formInput" placeholder="••••••••••••" />
//                         </div>
//                       </div>
//                     </div>

//                     <div className="twoFactorCard">
//                       <div className="twoFactorLeft">
//                         <svg className="twoFactorIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                           <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//                           <polyline points="9 12 11 14 15 10" />
//                         </svg>
//                         <div className="twoFactorInfo">
//                           <h4>TWO-FACTOR AUTHENTICATION</h4>
//                           <p>RECOMMENDED FOR INSTITUTIONAL PORTFOLIOS</p>
//                         </div>
//                       </div>
//                       <div className="toggle">
//                         <div className="toggleKnob" />
//                       </div>
//                     </div>

//                     <button className="saveBtn" type="button">
//                       UPDATE SECURITY
//                     </button>
//                   </div>
//                 )} */}

//                 {/* {activeTab === "BILLING" && (
//                   <div className="billingSection">
//                     <h3>ACTIVE SUBSCRIPTION</h3>

//                     <div className="subscriptionBanner">
//                       <div className="subscriptionLeft">
//                         <div className="subscriptionLabel">PREMIUM TIER</div>
//                         <div className="subscriptionTitle">INVESTIQ™ ANNUAL</div>
//                         <div className="subscriptionDesc">UNLIMITED DEALLENS™ ARCHIVE ENABLED</div>
//                       </div>

//                       <div className="subscriptionRight">
//                         <div className="subscriptionRightTop">AED 99 / YEAR</div>
//                         <div className="subscriptionRightBottom">NEXT BILLING: FEB 19, 2026</div>
//                       </div>
//                     </div>

//                     <div>
//                       <div className="paymentMethodsLabel">PAYMENT METHODS</div>

//                       <div className="paymentCard">
//                         <div className="paymentCardLeft">
//                           <div className="cardIcon">VISA</div>
//                           <div className="cardInfo">
//                             <h4>•••• •••• •••• 4242</h4>
//                             <p>EXPIRES 12/28</p>
//                           </div>
//                         </div>
//                         <button className="editCardBtn" type="button">
//                           EDIT
//                         </button>
//                       </div>

//                       <button className="addPaymentBtn" type="button">
//                         <span>+</span> ADD PAYMENT METHOD
//                       </button>
//                     </div>
//                   </div>
//                 )} */}

//                 {activeTab === "NOTIFICATIONS" && (
//                   <div className="notificationsSection">
//                     <h3>ALERT PREFERENCES</h3>

//                     <div className="notificationItem">
//                       <div className="notificationInfo">
//                         <h4>MARKET VOLATILITY ALERTS</h4>
//                         <p>NOTIFY ME WHEN DISTRICT PRICES CHANGE BY ≥2%</p>
//                       </div>
//                       <div className="toggle">
//                         <div className="toggleKnob" />
//                       </div>
//                     </div>

//                     <div className="notificationItem">
//                       <div className="notificationInfo">
//                         <h4>NEW COMP IDENTIFICATION</h4>
//                         <p>ALERT WHEN VERIFIED SALES MATCH MY PORTFOLIO UNITS</p>
//                       </div>
//                       <div className="toggle off">
//                         <div className="toggleKnob" />
//                       </div>
//                     </div>

//                     <div className="notificationItem">
//                       <div className="notificationInfo">
//                         <h4>INSTITUTIONAL MARKET REPORTS</h4>
//                         <p>WEEKLY MACROECONOMIC DEEP DIVES FROM ACQAR LABS</p>
//                       </div>
//                       <div className="toggle">
//                         <div className="toggleKnob" />
//                       </div>
//                     </div>

//                     <div className="notificationItem">
//                       <div className="notificationInfo">
//                         <h4>SECURITY & ACCESS LOGS</h4>
//                         <p>LOGIN ALERTS AND MULTI-FACTOR NOTIFICATIONS</p>
//                       </div>
//                       <div className="toggle off">
//                         <div className="toggleKnob" />
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </main>

//       {/* ✅ Separate section (NOT inside settingsContent), shows on all tabs */}
//       <DangerZoneBanner />

//       <Footer />
//     </>
//   );
// }






// src/pages/Settings.jsx
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
          <div className="main-grid">
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
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="social-btn">{icon}</a>
                ))}
              </div>
            </div>
            <div>
              <div className="col-heading"><span className="col-heading-dot"></span><h6>Product</h6></div>
              <ul>
                <li><a href="http://www.acqar.com/" target="_blank" rel="noopener noreferrer">TruValu™</a></li>
                <li><a href="https://signal.acqar.com/" target="_blank" rel="noopener noreferrer">ACQAR Signal™</a></li>
                <li className="muted">ACQAR Passport™</li>
              </ul>
            </div>
            <div>
              <div className="col-heading"><span className="col-heading-dot"></span><h6>Company</h6></div>
              <ul>
                {['About ACQAR', 'How It Works', 'Contact Us', 'Partners'].map(l => (<li key={l}>{l}</li>))}
              </ul>
            </div>
            <div>
              <div className="col-heading"><span className="col-heading-dot"></span><h6>Legal & Info</h6></div>
              <ul>
                <li onClick={() => window.open('https://www.acqar.com/blogs', '_blank')}>Intelligence Blog</li>
                <li onClick={() => navigate('/terms')}>Terms of Use</li>
                <li onClick={() => navigate('/terms')}>Privacy Policy</li>
              </ul>
            </div>
            <div>
              <div className="col-heading"><span className="col-heading-dot"></span><h6>Comparisons</h6></div>
              <ul>
                {['vs Bayut TruEstimate', 'vs Property Finder', 'vs Traditional Valuers', 'Why ACQAR?'].map(l => (<li key={l}>{l}</li>))}
              </ul>
            </div>
          </div>
          <div className="bottom-bar">
            <div className="bottom-location">
              <span className="logo"><span style={{ color: '#B87333' }}>ACQ</span><span style={{ color: '#0A0A0A' }}>AR</span></span>
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

/* ── DANGER ZONE ── */
function DangerZoneBanner() {
  return (
    <div className="dangerZoneWrap">
      <div className="dangerZone">
        <div className="dangerZoneLeft">
          <div className="dangerIconWrap">
            <svg className="dangerIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" />
            </svg>
          </div>
          <div>
            <div className="dangerZoneTitle">INSTITUTIONAL DATA DELETION</div>
            <div className="dangerZoneDesc">PERMANENTLY ERASE ALL YOUR REPORTS AND PORTFOLIO DATA</div>
          </div>
        </div>
        <button className="dangerBtn" type="button">DEACTIVATE ACCOUNT</button>
      </div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("PROFILE");
  const [message, setMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [investorType, setInvestorType] = useState("Private Investor");

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

  const createdDate = useMemo(() => {
    if (!profile?.created_at) return "";
    const d = new Date(profile.created_at);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
  }, [profile]);

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
          user.user_metadata?.display_name || ""
        ).trim();
        let { data: uRow } = await supabase
          .from("users").select("id, role, name, email, phone, created_at")
          .eq("id", authId).maybeSingle();
        if (!mounted) return;
        const profileData = uRow || { id: authId, name: metaName || null, email: authEmail || null, phone: null, created_at: null };
        setProfile(profileData);
        setFullName(profileData.name || "");
        setEmail(profileData.email || "");
        setPhone(profileData.phone || "");
        setInvestorType(profileData.role || "Investor");
      } catch (e) {
        if (!mounted) return;
        console.error("Failed to load settings:", e);
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

  async function handleSaveProfile(e) {
    e.preventDefault();
    if (!profile?.id) return;
    setSaving(true);
    setMessage("");
    try {
      const { error } = await supabase.from("users").update({
        name: fullName.trim() || null,
        phone: phone.trim() || null,
        role: investorType || null,
      }).eq("id", profile.id);
      if (error) throw error;
      setMessage("Profile updated successfully!");
      const { data: updated } = await supabase.from("users").select("id, role, name, email, phone, created_at").eq("id", profile.id).single();
      if (updated) setProfile(updated);
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ── Navigate to dashboard and activate terminal tab ──
  function goToTerminal() {
    navigate("/dashboard", { state: { tab: "terminal" } });
  }

  const path = location.pathname;
  // const isDash = path === "/dashboard" || path === "/";
  const isReports = path === "/my-reports";
  const isSettings = path === "/settings";

  const UI_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    :root{
      --page:#fbfbfb;
      --text:#111111;
      --line:#e9e9e9;
      --copper:#b87333;
      --green:#12b76a;
      --danger:#e11d2e;
      --dangerSoft:#fff0f2;
      --dangerLine:#ffd6da;
      --shadow: 0 22px 50px rgba(0,0,0,.10);
      --shadow2: 0 14px 30px rgba(0,0,0,.12);
      --radiusXL: 28px;
    }

    *{ margin:0; padding:0; box-sizing:border-box; }
    html, body{ height:100%; }
    body{ font-family:'Inter', sans-serif; background: var(--page); color: var(--text); }

    /* ── TOP NAV ── */
    .topNav{
      position:fixed; top:0; left:0; right:0; height:58px;
      background:#fff; border-bottom:1px solid var(--line);
      z-index:100; display:flex; align-items:center;
      justify-content:space-between; padding:0 28px; gap:14px; min-width:0;
    }
    .navLeft{ display:flex; align-items:center; gap:44px; min-width:0; }
    .navBrand{
      font-size:14px; font-weight:900; letter-spacing:.12em;
      cursor:pointer; text-transform:uppercase; line-height:1; flex-shrink:0;
    }
    .navLinks{ display:flex; gap:26px; align-items:center; min-width:0; }
    .navLink{
      font-size:10px; font-weight:800; letter-spacing:.14em;
      color:rgba(17,17,17,.55); cursor:pointer; text-transform:uppercase;
      line-height:1; padding:18px 0; position:relative; user-select:none;
      white-space:nowrap; flex-shrink:0;
    }
    .navLink:hover{ color:rgba(17,17,17,.85); }
    .navLink.active{ color:var(--text); }
    .navLink.active::after{
      content:""; position:absolute; left:0; right:0; bottom:0;
      height:2px; background:var(--text); border-radius:2px;
    }
    .navLink.terminal-link{ color:rgba(17,17,17,.55); }
    .navLink.terminal-link:hover{ color:#00C864; }

    .navRight{ display:flex; align-items:center; gap:16px; min-width:0; }
    .bellBtn{
      width:34px; height:34px; border-radius:999px; background:transparent; border:none;
      display:grid; place-items:center; cursor:pointer; position:relative; flex-shrink:0;
    }
    .bellIcon{ width:16px; height:16px; color:rgba(17,17,17,.75); }
    .notificationDot{
      position:absolute; top:8px; right:8px; width:7px; height:7px;
      background:var(--copper); border-radius:50%; border:2px solid #fff;
    }
    .profileWrap{ position:relative; min-width:0; }
    .profileBtn{ display:flex; align-items:center; gap:10px; cursor:pointer; border:none; background:transparent; padding:4px 0; min-width:0; }
    .profileMeta{ display:flex; flex-direction:column; align-items:flex-end; line-height:1.05; min-width:0; }
    .profileName{ font-size:10px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; white-space:nowrap; max-width:220px; overflow:hidden; text-overflow:ellipsis; }
    .profileAvatar{ width:28px; height:28px; border-radius:999px; background:var(--copper); display:grid; place-items:center; color:#fff; font-size:10px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; flex-shrink:0; }
    .caret{ width:14px; height:14px; color:rgba(17,17,17,.55); margin-left:2px; flex-shrink:0; }

    .menu{
      position:absolute; top:calc(100% + 10px); right:0;
      width:220px; max-width:calc(100vw - 24px);
      background:#fff; border:1px solid var(--line); border-radius:14px;
      box-shadow:0 18px 40px rgba(0,0,0,.12); overflow:hidden; z-index:200;
    }
    .menuTop{ padding:14px 16px 12px; border-bottom:1px solid #efefef; background:#fff; }
    .menuTopLabel{ font-size:9px; font-weight:900; letter-spacing:.18em; color:rgba(17,17,17,.35); text-transform:uppercase; margin-bottom:8px; }
    .menuName{ font-size:13px; font-weight:900; font-style:italic; text-transform:uppercase; letter-spacing:.02em; margin-bottom:4px; line-height:1.1; }
    .menuTier{ font-size:9px; font-weight:900; letter-spacing:.14em; color:var(--copper); text-transform:uppercase; line-height:1.1; }
    .menuList{ padding:8px 0; }
    .menuItem{ display:flex; align-items:center; gap:10px; padding:11px 16px; cursor:pointer; user-select:none; transition:background .14s; }
    .menuItem:hover{ background:#fafafa; }
    .menuIcon{ width:16px; height:16px; color:rgba(17,17,17,.55); flex-shrink:0; }
    .menuText{ font-size:10px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; }
    .menuDivider{ height:1px; background:#efefef; margin:8px 0; }
    .menuSignout{ display:flex; align-items:center; justify-content:center; gap:8px; padding:12px 16px 14px; cursor:pointer; color:#ff4d4d; font-size:10px; font-weight:900; letter-spacing:.18em; text-transform:uppercase; user-select:none; transition:background .14s; }
    .menuSignout:hover{ background:#fff6f6; }
    .menuSignout svg{ width:16px; height:16px; color:#ff4d4d; }

    /* ── PAGE ── */
    .settingsMain{
      margin-top:58px; margin-bottom:60px;
      max-width:1220px; margin-left:auto; margin-right:auto;
      padding:42px 28px 40px;
    }
    .settingsHeader{
      display:flex; justify-content:space-between; align-items:flex-start;
      margin-bottom:26px; padding:6px 0 18px; gap:14px;
    }
    .settingsHeader h1{ font-size:44px; font-weight:900; font-style:italic; letter-spacing:-1px; text-transform:uppercase; line-height:1; }
    .settingsHeader p{ margin-top:10px; font-size:11px; font-weight:700; color:rgba(17,17,17,.45); letter-spacing:.18em; text-transform:uppercase; line-height:1.5; max-width:760px; }
    .signOutBtn{ padding:10px 16px; background:#f4f4f4; color:rgba(17,17,17,.6); border:1px solid #efefef; border-radius:10px; font-size:10px; font-weight:900; letter-spacing:.16em; cursor:pointer; text-transform:uppercase; transition:background .16s,color .16s,border-color .16s; white-space:nowrap; flex-shrink:0; }
    .signOutBtn:hover{ background:#ededed; color:rgba(17,17,17,.8); border-color:#e7e7e7; }

    .settingsLayout{ display:grid; grid-template-columns:260px 1fr; gap:34px; align-items:start; }
    .settingsSidebar{ display:flex; flex-direction:column; gap:10px; padding-top:6px; position:sticky; top:calc(58px + 16px); align-self:start; }
    .sidebarTab{ padding:14px 18px; border:none; background:transparent; border-radius:12px; text-align:left; cursor:pointer; font-size:11px; font-weight:900; letter-spacing:.16em; text-transform:uppercase; color:rgba(17,17,17,.35); transition:background .18s,color .18s,box-shadow .18s; }
    .sidebarTab:hover{ color:rgba(17,17,17,.65); background:rgba(0,0,0,.03); }
    .sidebarTab.active{ background:linear-gradient(180deg,#1b1b1b 0%,#0f0f0f 100%); color:#fff; box-shadow:0 16px 28px rgba(0,0,0,.18); }

    .verificationBadge{ margin-top:26px; padding:18px; background:#fbfbfb; border:1px solid #efefef; border-radius:14px; }
    .verificationHeader{ display:flex; align-items:center; gap:10px; margin-bottom:10px; }
    .verificationIcon{ width:18px; height:18px; color:var(--green); }
    .verificationTitle{ font-size:10px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; color:var(--green); }
    .verificationDesc{ font-size:10px; font-weight:700; color:rgba(17,17,17,.38); letter-spacing:.12em; text-transform:uppercase; line-height:1.5; }

    .settingsContent{ background:#fff; border:1px solid #f1f1f1; border-radius:var(--radiusXL); padding:34px 36px 38px; box-shadow:var(--shadow); position:relative; overflow:hidden; min-width:0; }
    .loadingWrap{ padding:60px 10px; text-align:center; color:rgba(17,17,17,.45); font-size:12px; font-weight:800; letter-spacing:.14em; text-transform:uppercase; }

    .profileHeader{ display:flex; align-items:center; gap:22px; padding:10px 4px 22px; border-bottom:1px solid #ececec; margin-bottom:22px; min-width:0; }
    .profileAvatarLarge{ width:72px; height:72px; border-radius:999px; background:#c07a33; display:flex; align-items:center; justify-content:center; color:#fff; font-size:22px; font-weight:900; letter-spacing:.06em; text-transform:uppercase; position:relative; flex-shrink:0; }
    .editAvatarBtn{ position:absolute; right:-2px; bottom:-2px; width:26px; height:26px; border-radius:999px; background:#fff; border:1px solid #e9e9e9; display:grid; place-items:center; cursor:pointer; box-shadow:0 10px 18px rgba(0,0,0,.10); transition:transform .14s,border-color .14s; }
    .editAvatarBtn:hover{ transform:translateY(-1px); border-color:#dcdcdc; }
    .editAvatarBtn svg{ width:14px; height:14px; color:rgba(17,17,17,.6); }
    .profileInfo{ min-width:0; }
    .profileInfo h2{ font-size:24px; font-weight:900; font-style:italic; text-transform:uppercase; letter-spacing:-0.6px; line-height:1.05; margin-bottom:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:100%; }
    .profileMemberSince{ font-size:11px; font-weight:900; text-transform:uppercase; letter-spacing:.14em; color:var(--copper); white-space:nowrap; }

    .settingsForm{ display:flex; flex-direction:column; gap:18px; padding:4px 4px 0; }
    .formRow{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:18px; }
    .formGroup{ display:flex; flex-direction:column; gap:10px; min-width:0; }
    .formLabel{ font-size:10px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; color:rgba(17,17,17,.42); }
    .formInput,.formSelect{ width:100%; height:46px; padding:0 16px; border-radius:12px; border:1px solid #e7e7e7; background:#f8f8f8; font-size:12px; font-weight:700; outline:none; transition:border-color .15s,background .15s; }
    .formInput:focus,.formSelect:focus{ border-color:#d9d9d9; background:#f6f6f6; }
    .formInput:disabled{ background:#f4f4f4; color:rgba(17,17,17,.45); cursor:not-allowed; }
    .formSelect{ appearance:none; background-image:linear-gradient(45deg,transparent 50%,rgba(17,17,17,.55) 50%),linear-gradient(135deg,rgba(17,17,17,.55) 50%,transparent 50%); background-position:calc(100% - 18px) 19px,calc(100% - 13px) 19px; background-size:5px 5px,5px 5px; background-repeat:no-repeat; padding-right:36px; cursor:pointer; }
    .successMessage{ padding:12px 14px; border-radius:12px; background:rgba(18,183,106,.10); border:1px solid rgba(18,183,106,.22); color:rgba(17,17,17,.75); font-size:11px; font-weight:900; letter-spacing:.10em; text-transform:uppercase; word-break:break-word; }
    .saveBtn{ margin-top:10px; height:50px; padding:0 28px; border:none; border-radius:12px; background:linear-gradient(180deg,#1b1b1b 0%,#0f0f0f 100%); color:#fff; font-size:11px; font-weight:900; letter-spacing:.18em; text-transform:uppercase; cursor:pointer; box-shadow:0 18px 28px rgba(0,0,0,.20); transition:transform .14s,box-shadow .14s; align-self:flex-start; min-width:260px; max-width:100%; }
    .saveBtn:hover{ transform:translateY(-1px); box-shadow:0 22px 34px rgba(0,0,0,.22); }
    .saveBtn:disabled{ background:#e9e9e9; color:rgba(17,17,17,.45); cursor:not-allowed; box-shadow:none; transform:none; }

    .securitySection h3,.billingSection h3,.notificationsSection h3{ font-size:22px; font-weight:900; font-style:italic; text-transform:uppercase; letter-spacing:-0.5px; margin:2px 0 18px; }
    .passwordFields{ border:1px solid #efefef; background:#fbfbfb; border-radius:18px; padding:18px; margin-bottom:18px; }
    .twoFactorCard{ border:1px solid #efefef; background:#fbfbfb; border-radius:18px; padding:18px; display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:18px; min-width:0; }
    .twoFactorLeft{ display:flex; align-items:center; gap:14px; min-width:0; }
    .twoFactorIcon{ width:18px; height:18px; color:var(--copper); flex-shrink:0; }
    .twoFactorInfo{ min-width:0; }
    .twoFactorInfo h4{ font-size:12px; font-weight:900; text-transform:uppercase; letter-spacing:.10em; margin-bottom:6px; font-style:italic; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .twoFactorInfo p{ font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:.14em; color:rgba(17,17,17,.35); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .toggle{ position:relative; width:44px; height:24px; background:#111; border-radius:999px; cursor:pointer; flex-shrink:0; box-shadow:inset 0 0 0 1px rgba(0,0,0,.04); }
    .toggle.off{ background:#dedede; }
    .toggleKnob{ position:absolute; top:3px; left:3px; width:18px; height:18px; background:#fff; border-radius:999px; transition:transform .18s; box-shadow:0 8px 14px rgba(0,0,0,.18); }
    .toggle:not(.off) .toggleKnob{ transform:translateX(20px); }

    .notificationItem{ padding:20px 18px; border-top:1px solid #ededed; display:flex; align-items:center; justify-content:space-between; gap:14px; background:transparent; min-width:0; }
    .notificationItem:first-of-type{ border-top:none; padding-top:10px; }
    .notificationInfo{ min-width:0; }
    .notificationInfo h4{ font-size:12px; font-weight:900; text-transform:uppercase; letter-spacing:.10em; margin-bottom:8px; font-style:italic; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .notificationInfo p{ font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:.16em; color:rgba(17,17,17,.35); line-height:1.5; overflow-wrap:anywhere; }

    .dangerZoneWrap{ max-width:1200px; margin:34px auto 120px; padding:0 28px; }
    .dangerZone{ background:var(--dangerSoft); border:1px solid var(--dangerLine); border-radius:44px; padding:34px 36px; min-height:128px; display:flex; align-items:center; justify-content:space-between; gap:22px; min-width:0; }
    .dangerZoneLeft{ display:flex; align-items:center; gap:18px; min-width:0; }
    .dangerIconWrap{ width:54px; height:54px; border-radius:16px; background:#fff; border:1px solid #ffe1e4; display:grid; place-items:center; flex-shrink:0; box-shadow:0 12px 22px rgba(0,0,0,.06); }
    .dangerIcon{ width:20px; height:20px; color:var(--danger); }
    .dangerZoneTitle{ font-size:16px; font-weight:900; font-style:italic; text-transform:uppercase; letter-spacing:-0.3px; color:var(--danger); margin-bottom:8px; line-height:1.1; }
    .dangerZoneDesc{ font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:.18em; color:rgba(225,29,46,.60); line-height:1.55; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:720px; }
    .dangerBtn{ height:48px; padding:0 22px; background:var(--danger); color:#fff; border:none; border-radius:14px; font-size:10px; font-weight:900; letter-spacing:.18em; text-transform:uppercase; cursor:pointer; box-shadow:0 18px 30px rgba(225,29,46,.28); transition:transform .14s,box-shadow .14s; flex-shrink:0; min-width:240px; max-width:100%; }
    .dangerBtn:hover{ transform:translateY(-1px); box-shadow:0 24px 38px rgba(225,29,46,.34); }

    /* ── RESPONSIVE ── */
    @media (max-width: 1100px){
      .settingsMain{ padding:34px 22px 36px; }
      .settingsHeader h1{ font-size:38px; }
      .settingsLayout{ gap:22px; }
      .settingsContent{ padding:28px 26px 28px; }
      .dangerZoneWrap{ padding:0 22px; }
    }
    @media (max-width: 980px){
      .settingsLayout{ grid-template-columns:1fr; gap:18px; }
      .settingsSidebar{ position:static; top:auto; flex-direction:row; flex-wrap:nowrap; overflow-x:auto; gap:10px; padding:0 2px 6px; -webkit-overflow-scrolling:touch; }
      .settingsSidebar::-webkit-scrollbar{ height:6px; }
      .settingsSidebar::-webkit-scrollbar-thumb{ background:rgba(0,0,0,.10); border-radius:999px; }
      .sidebarTab{ white-space:nowrap; flex-shrink:0; }
      .verificationBadge{ display:none; }
    }
    @media (max-width: 780px){
      .settingsHeader{ flex-direction:column; align-items:flex-start; }
      .settingsHeader h1{ font-size:34px; }
      .settingsHeader p{ max-width:100%; }
      .signOutBtn{ align-self:flex-start; }
      .formRow{ grid-template-columns:1fr; }
      .profileInfo h2{ font-size:20px; }
      .saveBtn{ width:100%; min-width:0; }
      .topNav{ padding:0 16px; }
      .navLeft{ gap:18px; }
    }
    @media (max-width: 640px){
      .navLinks{ display:none !important; }
      .profileMeta{ display:none !important; }
      .topNav{ padding:0 14px; }
      .navLeft{ gap:12px; }
      .settingsHeader{ flex-direction:column; align-items:flex-start; gap:12px; padding:6px 0 14px; margin-bottom:18px; }
      .settingsHeader h1{ font-size:34px; line-height:1; }
      .settingsHeader p{ margin-top:8px; max-width:100%; }
      .signOutBtn{ align-self:flex-end; margin-top:6px; }
      .settingsSidebar{ position:static; top:auto; flex-direction:column; flex-wrap:nowrap; overflow:visible; gap:18px; padding:6px 0 0; }
      .sidebarTab{ width:100%; white-space:normal; }
      .verificationBadge{ display:block !important; margin-top:18px; }
    }
    @media (max-width: 520px){
      .settingsMain{ padding:26px 14px 30px; }
      .settingsHeader h1{ font-size:28px; }
      .settingsContent{ padding:22px 16px 22px; border-radius:22px; }
      .profileAvatarLarge{ width:64px; height:64px; font-size:20px; }
      .dangerZoneWrap{ padding:0 14px; }
      .dangerZone{ padding:18px 16px; border-radius:28px; flex-direction:column; align-items:flex-start; }
      .dangerZoneDesc{ white-space:normal; overflow:visible; text-overflow:clip; max-width:100%; }
      .dangerBtn{ width:100%; min-width:0; }
    }
  `;

  return (
    <>
      <style>{UI_CSS}</style>

      {/* ── TOP NAVIGATION ── */}
      <nav className="topNav">
        <div className="navLeft">

          {/* ── SETTINGS LOGO (plain ACQAR with settings pill) ── */}
          <div className="navBrand" onClick={() => navigate("/")}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: "0.12em", lineHeight: 1 }}>
                <span style={{ color: "#B87333" }}>ACQ</span>
                <span style={{ color: "#111111" }}>AR</span>
              </span>
              {/* <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "3px 9px", borderRadius: 999,
                background: "rgba(17,17,17,0.06)",
                border: "1px solid rgba(17,17,17,0.12)",
              }}> */}
                {/* <span style={{
                  fontSize: 9, fontWeight: 900, color: "rgba(17,17,17,0.55)",
                  letterSpacing: "0.16em", textTransform: "uppercase",
                }}>SETTINGS</span> */}
              {/* </span> */}
            </div>
          </div>

          {/* ── NAV LINKS ── */}
          <div className="navLinks">
            {/* <div className={`navLink ${isDash ? "active" : ""}`} onClick={() => navigate("/dashboard")}>
              DASHBOARD
            </div> */}
            <div className="navLink terminal-link" onClick={goToTerminal}>
              TERMINAL
            </div>
            <div className={`navLink ${isReports ? "active" : ""}`} onClick={() => navigate("/my-reports")}>
              MY REPORTS
            </div>
            <div className={`navLink ${isSettings ? "active" : ""}`} onClick={() => navigate("/settings")}>
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
                  <div className="menuTier">VALUCHECK™ Premium Member</div>
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
                    <div className="menuText" style={{ color: "#00C864" }}>Terminal</div>
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
      <main className="settingsMain">
        <div className="settingsHeader">
          <div>
            <h1>ACCOUNT SETTINGS</h1>
            <p>MANAGE YOUR INSTITUTIONAL IDENTITY, SECURITY, AND INSTITUTIONAL PREFERENCES</p>
          </div>
          <button className="signOutBtn" onClick={handleLogout}>SIGN OUT</button>
        </div>

        <div className="settingsLayout">
          {/* Sidebar */}
          <div className="settingsSidebar">
            <button className={`sidebarTab ${activeTab === "PROFILE" ? "active" : ""}`} onClick={() => setActiveTab("PROFILE")}>PROFILE</button>
            <button className={`sidebarTab ${activeTab === "NOTIFICATIONS" ? "active" : ""}`} onClick={() => setActiveTab("NOTIFICATIONS")}>NOTIFICATIONS</button>
            <div className="verificationBadge">
              <div className="verificationHeader">
                <svg className="verificationIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
                <div className="verificationTitle">VERIFIED INVESTOR</div>
              </div>
              <div className="verificationDesc">IDENTITY VERIFIED VIA DUBAI DIGITAL AUTHORITY FRAMEWORK</div>
            </div>
          </div>

          {/* Content Card */}
          <div className="settingsContent">
            {loading ? (
              <div className="loadingWrap">LOADING ACCOUNT SETTINGS…</div>
            ) : (
              <>
                {activeTab === "PROFILE" && (
                  <>
                    <div className="profileHeader">
                      <div className="profileAvatarLarge">
                        {initials}
                        <button className="editAvatarBtn" type="button" aria-label="Edit avatar">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </div>
                      <div className="profileInfo">
                        <h2>{nameToShow}</h2>
                        <div className="profileMemberSince">ACTIVE SINCE {createdDate || "OCTOBER 2024"}</div>
                      </div>
                    </div>

                    <form className="settingsForm" onSubmit={handleSaveProfile}>
                      <div className="formRow">
                        <div className="formGroup">
                          <label className="formLabel">FULL LEGAL NAME</label>
                          <input type="text" className="formInput" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" />
                        </div>
                        <div className="formGroup">
                          <label className="formLabel">EMAIL ADDRESS</label>
                          <input type="email" className="formInput" value={email} disabled />
                        </div>
                      </div>
                      <div className="formRow">
                        <div className="formGroup">
                          <label className="formLabel">PHONE NUMBER</label>
                          <input type="tel" className="formInput" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+971 50 123 4567" />
                        </div>
                        <div className="formGroup">
                          <label className="formLabel">USER TYPE</label>
                          <select className="formSelect" value={investorType} onChange={(e) => setInvestorType(e.target.value)}>
                            {["Investor", "Buyer", "Seller", "Agent"].map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {message && <div className="successMessage">{message}</div>}
                      <button type="submit" className="saveBtn" disabled={saving}>
                        {saving ? "SAVING..." : "SAVE PROFILE CHANGES"}
                      </button>
                    </form>
                  </>
                )}

                {activeTab === "NOTIFICATIONS" && (
                  <div className="notificationsSection">
                    <h3>ALERT PREFERENCES</h3>
                    <div className="notificationItem">
                      <div className="notificationInfo">
                        <h4>MARKET VOLATILITY ALERTS</h4>
                        <p>NOTIFY ME WHEN DISTRICT PRICES CHANGE BY ≥2%</p>
                      </div>
                      <div className="toggle"><div className="toggleKnob" /></div>
                    </div>
                    <div className="notificationItem">
                      <div className="notificationInfo">
                        <h4>NEW COMP IDENTIFICATION</h4>
                        <p>ALERT WHEN VERIFIED SALES MATCH MY PORTFOLIO UNITS</p>
                      </div>
                      <div className="toggle off"><div className="toggleKnob" /></div>
                    </div>
                    <div className="notificationItem">
                      <div className="notificationInfo">
                        <h4>INSTITUTIONAL MARKET REPORTS</h4>
                        <p>WEEKLY MACROECONOMIC DEEP DIVES FROM ACQAR LABS</p>
                      </div>
                      <div className="toggle"><div className="toggleKnob" /></div>
                    </div>
                    <div className="notificationItem">
                      <div className="notificationInfo">
                        <h4>SECURITY & ACCESS LOGS</h4>
                        <p>LOGIN ALERTS AND MULTI-FACTOR NOTIFICATIONS</p>
                      </div>
                      <div className="toggle off"><div className="toggleKnob" /></div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <DangerZoneBanner />
      <Footer />
    </>
  );
}
