// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useLogout } from '../hooks/useLogout';

// /* ─── Tokens ──────────────────────────────────────────────────────── */
// const C = {
//   sidebar:     '#1C1C1E',
//   sidebarText: '#9A9A9A',
//   activeNav:   '#C8832A',
//   activeText:  '#FFFFFF',
//   copper:      '#C8832A',
//   bg:          '#F3F3F4',
//   white:       '#FFFFFF',
//   border:      '#E9E9EA',
//   text:        '#0F0F0F',
//   muted:       '#6B6B6B',
// };

// const SIDEBAR_W = 260;

// const navItems = [
//   { label: 'Overview',   key: 'overview'   },
//   { label: 'Users',      key: 'users'      },
//   { label: 'Valuations', key: 'valuations' },
//   { label: 'Feedback',   key: 'feedback'   },
//   { label: 'Blogs',      key: 'blogs'      },
//   { label: 'Analytics',  key: 'analytics'  },
//   { label: 'Settings',   key: 'settings'   },
// ];

// /* ─── Icons ───────────────────────────────────────────────────────── */
// const IcoMenu    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
// const IcoX       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
// const IcoSearch  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
// const IcoBell    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
// const IcoUser    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
// const IcoLogout  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
// const IcoGlobe   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
// const IcoShield  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
// const IcoBellSm  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
// const IcoSave    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
// const IcoCheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;

// const NavIcon = ({ k, size = 17 }) => {
//   const icons = {
//     overview:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
//     users:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
//     valuations: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
//     feedback:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
//     blogs:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
//     analytics:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
//     settings:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
//   };
//   return icons[k] || null;
// };

// /* ─── Global CSS ──────────────────────────────────────────────────── */
// const globalCss = `
//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//   body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
//   @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
//   @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
//   ::-webkit-scrollbar { width: 4px; }
//   ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
//   .sidebar-nav-btn { transition: background 0.14s; }
//   .sidebar-nav-btn:hover { background: rgba(255,255,255,0.07) !important; }
//   .hdr-desktop { display: flex !important; }
//   .hdr-mobile  { display: none  !important; }

//   /* Toggle switch */
//   .toggle-track {
//     width: 44px; height: 24px; border-radius: 999px;
//     position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0;
//   }
//   .toggle-thumb {
//     position: absolute; top: 3px;
//     width: 18px; height: 18px; border-radius: 50%;
//     background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.18);
//     transition: left 0.2s;
//   }

//   /* Custom checkbox */
//   .custom-checkbox {
//     width: 16px; height: 16px; border-radius: 5px;
//     border: 2px solid #E9E9EA; cursor: pointer;
//     display: flex; align-items: center; justify-content: center;
//     transition: background 0.15s, border-color 0.15s; flex-shrink: 0;
//   }
//   .custom-checkbox.checked {
//     background: #C8832A; border-color: #C8832A;
//   }

//   /* Input focus */
//   .settings-input:focus { border-color: #C8832A !important; outline: none; }
//   .settings-select:focus { border-color: #C8832A !important; outline: none; }

//   .settings-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

//   @media (max-width: 640px) {
//     .hdr-desktop { display: none !important; }
//     .hdr-mobile  { display: flex  !important; }
//     .main-content { padding-top: 60px !important; }
//     .inner-pad { padding: 20px 16px !important; }
//     .settings-form-grid { grid-template-columns: 1fr !important; }
//     .save-row { justify-content: stretch !important; }
//     .save-row button { width: 100% !important; justify-content: center; }
//   }
// `;

// /* ─── Toggle component ───────────────────────────────────────────── */
// function Toggle({ on, onChange }) {
//   return (
//     <div
//       className="toggle-track"
//       style={{ background: on ? C.copper : '#D1D5DB' }}
//       onClick={() => onChange(!on)}
//     >
//       <div className="toggle-thumb" style={{ left: on ? 23 : 3 }} />
//     </div>
//   );
// }

// /* ─── Checkbox component ─────────────────────────────────────────── */
// function Checkbox({ checked, onChange }) {
//   return (
//     <div className={`custom-checkbox ${checked ? 'checked' : ''}`} onClick={() => onChange(!checked)}>
//       {checked && <IcoCheck />}
//     </div>
//   );
// }

// /* ─── Card wrapper ────────────────────────────────────────────────── */
// const Card = ({ children, style = {} }) => (
//   <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', padding: '28px', marginBottom: 20, ...style }}>
//     {children}
//   </div>
// );

// /* ─── Section header ─────────────────────────────────────────────── */
// function SectionHeader({ icon, title }) {
//   return (
//     <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
//       <div style={{ width: 42, height: 42, background: '#F3F3F4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, flexShrink: 0 }}>
//         {icon}
//       </div>
//       <h3 style={{ fontSize: 16, fontWeight: 900, color: C.text, letterSpacing: '-0.3px' }}>{title}</h3>
//     </div>
//   );
// }

// /* ─── Shared Layout ───────────────────────────────────────────────── */
// function Sidebar({ open, onClose, active, onNav, onLogout }) {
//   if (!open) return null;
//   return (
//     <>
//       <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.5)', animation: 'fadeIn 0.18s ease' }} />
//       <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: SIDEBAR_W, background: C.sidebar, display: 'flex', flexDirection: 'column', zIndex: 99, animation: 'slideIn 0.22s ease', boxShadow: '6px 0 28px rgba(0,0,0,0.28)' }}>
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
//           <div>
//             <span style={{ color: C.white, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ACQAR </span>
//             <span style={{ color: C.copper, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ADMIN</span>
//           </div>
//           <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sidebarText }}>
//             <IcoX />
//           </button>
//         </div>
//         <nav style={{ flex: 1, padding: 10, overflowY: 'auto' }}>
//           {navItems.map(({ label, key }) => {
//             const on = active === key;
//             return (
//               <button key={key} className="sidebar-nav-btn" onClick={() => { onNav(key); onClose(); }}
//                 style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderRadius: 10, border: 'none', background: on ? C.activeNav : 'transparent', color: on ? C.activeText : C.sidebarText, cursor: 'pointer', marginBottom: 2, fontSize: 13.5, fontWeight: on ? 700 : 400, textAlign: 'left', fontFamily: 'inherit' }}>
//                 <NavIcon k={key} /> {label}
//               </button>
//             );
//           })}
//         </nav>
//         <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
//           <button className="sidebar-nav-btn" onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: C.sidebarText, cursor: 'pointer', fontSize: 13.5, fontWeight: 400, textAlign: 'left', fontFamily: 'inherit' }}>
//             <IcoLogout /> Logout
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// }

// function DesktopHeader({ onHamburger }) {
//   return (
//     <header className="hdr-desktop" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: C.white, borderBottom: `1px solid ${C.border}`, alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', zIndex: 90, gap: 12 }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
//         <button onClick={onHamburger} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: C.muted, padding: 4 }}><IcoMenu /></button>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F3F3F4', borderRadius: 22, padding: '8px 16px', maxWidth: 360, width: '100%', border: `1px solid ${C.border}` }}>
//           <IcoSearch />
//           <span style={{ fontSize: 13, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Search reports, users, or articles...</span>
//         </div>
//       </div>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
//         <div style={{ position: 'relative', cursor: 'pointer', display: 'flex' }}>
//           <IcoBell />
//           <span style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: '50%', background: C.copper, border: `2px solid ${C.white}` }} />
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <div style={{ textAlign: 'right' }}>
//             <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Admin User</div>
//             <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Super Admin</div>
//           </div>
//           <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F5EBE0', border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//             <IcoUser />
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

// function MobileHeader({ onHamburger }) {
//   return (
//     <header className="hdr-mobile" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: C.sidebar, alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', zIndex: 90 }}>
//       <div>
//         <span style={{ color: C.white, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ACQAR </span>
//         <span style={{ color: C.copper, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ADMIN</span>
//       </div>
//       <button onClick={onHamburger} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, color: C.white }}>
//         <IcoMenu />
//       </button>
//     </header>
//   );
// }

// /* ─── Input style ─────────────────────────────────────────────────── */
// const inputStyle = {
//   width: '100%', background: '#F3F3F4',
//   border: `1px solid ${C.border}`, borderRadius: 9,
//   padding: '11px 14px', fontSize: '0.875rem',
//   fontWeight: 600, fontFamily: 'Inter, sans-serif',
//   color: '#0F0F0F', transition: 'border-color 0.15s',
// };

// /* ─── Main Component ──────────────────────────────────────────────── */
// const AdminSettingsScreen = () => {
//   const navigate     = useNavigate();
//   const handleLogout = useLogout();
//   const [sideOpen,  setSideOpen]  = useState(false);
//   const [activeNav, setActiveNav] = useState('settings');

//   // Form state
//   const [platformName,   setPlatformName]   = useState('Acqar PropTech');
//   const [supportEmail,   setSupportEmail]   = useState('support@acqar.com');
//   const [maintenance,    setMaintenance]    = useState(false);
//   const [twoFactor,      setTwoFactor]      = useState(true);
//   const [sessionTimeout, setSessionTimeout] = useState(30);
//   const [saved,          setSaved]          = useState(false);

//   const [notifications, setNotifications] = useState({
//     'New User Registration':         { email: true,  push: true  },
//     'Property Valuation Generated':  { email: true,  push: true  },
//     'New Feedback Received':         { email: true,  push: false },
//     'System Alerts':                 { email: true,  push: true  },
//   });

//   const handleNav = (key) => {
//     setActiveNav(key);
//     if      (key === 'overview')  navigate('/admin-dashboard');
//     else if (key === 'blogs')     navigate('/admin/blogs');
//     else if (key !== 'settings')  navigate(`/admin/${key}`);
//   };

//   const toggleNotif = (item, type) => {
//     setNotifications(prev => ({
//       ...prev,
//       [item]: { ...prev[item], [type]: !prev[item][type] },
//     }));
//   };

//   const handleSave = () => {
//     setSaved(true);
//     setTimeout(() => setSaved(false), 2500);
//   };

//   return (
//     <div style={{ background: C.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
//       <style>{globalCss}</style>

//       <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} active={activeNav} onNav={handleNav} onLogout={handleLogout} />
//       <DesktopHeader onHamburger={() => setSideOpen(true)} />
//       <MobileHeader  onHamburger={() => setSideOpen(true)} />

//       <main className="main-content" style={{ paddingTop: 60 }}>
//         <div className="inner-pad" style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 60px' }}>

//           {/* ── Page header ── */}
//           <div style={{ marginBottom: 32 }}>
//             <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, letterSpacing: '-0.7px', margin: 0 }}>Admin Settings</h1>
//             <p style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Configure platform-wide settings and administrative preferences.</p>
//           </div>

//           {/* ── Platform Configuration ── */}
//           <Card>
//             <SectionHeader icon={<IcoGlobe />} title="Platform Configuration" />
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
//               <div className="settings-form-grid">
//                 <div>
//                   <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 7 }}>Platform Name</label>
//                   <input
//                     type="text"
//                     value={platformName}
//                     onChange={e => setPlatformName(e.target.value)}
//                     className="settings-input"
//                     style={inputStyle}
//                   />
//                 </div>
//                 <div>
//                   <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 7 }}>Support Email</label>
//                   <input
//                     type="email"
//                     value={supportEmail}
//                     onChange={e => setSupportEmail(e.target.value)}
//                     className="settings-input"
//                     style={inputStyle}
//                   />
//                 </div>
//               </div>

//               {/* Maintenance mode toggle row */}
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F3F3F4', borderRadius: 12, padding: '14px 18px' }}>
//                 <div>
//                   <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Maintenance Mode</p>
//                   <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Disable public access to the platform</p>
//                 </div>
//                 <Toggle on={maintenance} onChange={setMaintenance} />
//               </div>
//             </div>
//           </Card>

//           {/* ── Security & Access ── */}
//           <Card>
//             <SectionHeader icon={<IcoShield />} title="Security & Access" />
//             <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

//               {/* 2FA toggle row */}
//               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F3F3F4', borderRadius: 12, padding: '14px 18px' }}>
//                 <div>
//                   <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Two-Factor Authentication</p>
//                   <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Require 2FA for all administrative accounts</p>
//                 </div>
//                 <Toggle on={twoFactor} onChange={setTwoFactor} />
//               </div>

//               <div>
//                 <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 7 }}>Session Timeout (Minutes)</label>
//                 <input
//                   type="number"
//                   value={sessionTimeout}
//                   onChange={e => setSessionTimeout(e.target.value)}
//                   className="settings-input"
//                   style={{ ...inputStyle, width: 120 }}
//                 />
//               </div>
//             </div>
//           </Card>

//           {/* ── Notification Preferences ── */}
//           <Card>
//             <SectionHeader icon={<IcoBellSm />} title="Notification Preferences" />
//             <div style={{ display: 'flex', flexDirection: 'column' }}>
//               {Object.entries(notifications).map(([item, val], i, arr) => (
//                 <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none', gap: 12 }}>
//                   <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item}</p>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
//                     <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
//                       <Checkbox checked={val.email} onChange={() => toggleNotif(item, 'email')} />
//                       <span style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</span>
//                     </label>
//                     <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
//                       <Checkbox checked={val.push} onChange={() => toggleNotif(item, 'push')} />
//                       <span style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Push</span>
//                     </label>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </Card>

//           {/* ── Save button ── */}
//           <div className="save-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
//             <button
//               onClick={handleSave}
//               style={{
//                 display: 'flex', alignItems: 'center', gap: 8,
//                 background: saved ? '#16A34A' : C.copper,
//                 color: '#fff', border: 'none', borderRadius: 12,
//                 padding: '13px 32px', fontWeight: 800, fontSize: '0.8rem',
//                 textTransform: 'uppercase', letterSpacing: '0.1em',
//                 cursor: 'pointer', fontFamily: 'inherit',
//                 boxShadow: `0 6px 20px ${saved ? 'rgba(22,163,74,0.25)' : 'rgba(200,131,42,0.25)'}`,
//                 transition: 'background 0.2s',
//               }}
//               onMouseEnter={e => { if (!saved) e.currentTarget.style.background = '#a6682e'; }}
//               onMouseLeave={e => { if (!saved) e.currentTarget.style.background = C.copper; }}
//             >
//               <IcoSave />
//               {saved ? 'Saved!' : 'Save Changes'}
//             </button>
//           </div>

//         </div>
//       </main>
//     </div>
//   );
// };

// export default AdminSettingsScreen;













import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import { Helmet } from 'react-helmet-async';

/* ─── Tokens ──────────────────────────────────────────────────────── */
const C = {
  sidebar:     '#1C1C1E',
  sidebarText: '#9A9A9A',
  activeNav:   '#C8832A',
  activeText:  '#FFFFFF',
  copper:      '#C8832A',
  bg:          '#F3F3F4',
  white:       '#FFFFFF',
  border:      '#E9E9EA',
  text:        '#0F0F0F',
  muted:       '#6B6B6B',
};

const SIDEBAR_W = 260;

const navItems = [
  { label: 'Overview',   key: 'overview'   },
  { label: 'Users',      key: 'users'      },
  { label: 'Valuations', key: 'valuations' },
  { label: 'Feedback',   key: 'feedback'   },
  { label: 'Blogs',      key: 'blogs'      },
  { label: 'Analytics',  key: 'analytics'  },
  { label: 'Discount Codes', key: 'discountcodes' },
  { label: 'Settings',   key: 'settings'   },
];

/* ─── Icons ───────────────────────────────────────────────────────── */
const IcoMenu    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IcoX       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoSearch  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoBell    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoUser    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoLogout  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoGlobe   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IcoShield  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
const IcoBellSm  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoSave    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const IcoCheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>;

const NavIcon = ({ k, size = 17 }) => {
  const icons = {
    overview:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    users:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    valuations: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    feedback:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    blogs:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    analytics:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    discountcodes: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    settings:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  };
  return icons[k] || null;
};

/* ─── Global CSS ──────────────────────────────────────────────────── */
const globalCss = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
  @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
  .sidebar-nav-btn { transition: background 0.14s; }
  .sidebar-nav-btn:hover { background: rgba(255,255,255,0.07) !important; }
  .hdr-desktop { display: flex !important; }
  .hdr-mobile  { display: none  !important; }

  /* Toggle switch */
  .toggle-track {
    width: 44px; height: 24px; border-radius: 999px;
    position: relative; cursor: pointer; transition: background 0.2s; flex-shrink: 0;
  }
  .toggle-thumb {
    position: absolute; top: 3px;
    width: 18px; height: 18px; border-radius: 50%;
    background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.18);
    transition: left 0.2s;
  }

  /* Custom checkbox */
  .custom-checkbox {
    width: 16px; height: 16px; border-radius: 5px;
    border: 2px solid #E9E9EA; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.15s, border-color 0.15s; flex-shrink: 0;
  }
  .custom-checkbox.checked {
    background: #C8832A; border-color: #C8832A;
  }

  /* Input focus */
  .settings-input:focus { border-color: #C8832A !important; outline: none; }
  .settings-select:focus { border-color: #C8832A !important; outline: none; }

  .settings-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  @media (max-width: 640px) {
    .hdr-desktop { display: none !important; }
    .hdr-mobile  { display: flex  !important; }
    .main-content { padding-top: 60px !important; }
    .inner-pad { padding: 20px 16px !important; }
    .settings-form-grid { grid-template-columns: 1fr !important; }
    .save-row { justify-content: stretch !important; }
    .save-row button { width: 100% !important; justify-content: center; }
  }
`;

/* ─── Toggle component ───────────────────────────────────────────── */
function Toggle({ on, onChange }) {
  return (
    <div
      className="toggle-track"
      style={{ background: on ? C.copper : '#D1D5DB' }}
      onClick={() => onChange(!on)}
    >
      <div className="toggle-thumb" style={{ left: on ? 23 : 3 }} />
    </div>
  );
}

/* ─── Checkbox component ─────────────────────────────────────────── */
function Checkbox({ checked, onChange }) {
  return (
    <div className={`custom-checkbox ${checked ? 'checked' : ''}`} onClick={() => onChange(!checked)}>
      {checked && <IcoCheck />}
    </div>
  );
}

/* ─── Card wrapper ────────────────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
  <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', padding: '28px', marginBottom: 20, ...style }}>
    {children}
  </div>
);

/* ─── Section header ─────────────────────────────────────────────── */
function SectionHeader({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
      <div style={{ width: 42, height: 42, background: '#F3F3F4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text, flexShrink: 0 }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 900, color: C.text, letterSpacing: '-0.3px' }}>{title}</h3>
    </div>
  );
}

/* ─── Shared Layout ───────────────────────────────────────────────── */
function Sidebar({ open, onClose, active, onNav, onLogout }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.5)', animation: 'fadeIn 0.18s ease' }} />
      <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: SIDEBAR_W, background: C.sidebar, display: 'flex', flexDirection: 'column', zIndex: 99, animation: 'slideIn 0.22s ease', boxShadow: '6px 0 28px rgba(0,0,0,0.28)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div>
            <span style={{ color: C.white, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ACQAR </span>
            <span style={{ color: C.copper, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ADMIN</span>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', width: 28, height: 28, borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sidebarText }}>
            <IcoX />
          </button>
        </div>
        <nav style={{ flex: 1, padding: 10, overflowY: 'auto' }}>
          {navItems.map(({ label, key }) => {
            const on = active === key;
            return (
              <button key={key} className="sidebar-nav-btn" onClick={() => { onNav(key); onClose(); }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderRadius: 10, border: 'none', background: on ? C.activeNav : 'transparent', color: on ? C.activeText : C.sidebarText, cursor: 'pointer', marginBottom: 2, fontSize: 13.5, fontWeight: on ? 700 : 400, textAlign: 'left', fontFamily: 'inherit' }}>
                <NavIcon k={key} /> {label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <button className="sidebar-nav-btn" onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderRadius: 10, border: 'none', background: 'transparent', color: C.sidebarText, cursor: 'pointer', fontSize: 13.5, fontWeight: 400, textAlign: 'left', fontFamily: 'inherit' }}>
            <IcoLogout /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

function DesktopHeader({ onHamburger }) {
  return (
    <header className="hdr-desktop" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: C.white, borderBottom: `1px solid ${C.border}`, alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', zIndex: 90, gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
        <button onClick={onHamburger} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: C.muted, padding: 4 }}><IcoMenu /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F3F3F4', borderRadius: 22, padding: '8px 16px', maxWidth: 360, width: '100%', border: `1px solid ${C.border}` }}>
          <IcoSearch />
          <span style={{ fontSize: 13, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Search reports, users, or articles...</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        <div style={{ position: 'relative', cursor: 'pointer', display: 'flex' }}>
          <IcoBell />
          <span style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: '50%', background: C.copper, border: `2px solid ${C.white}` }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Admin User</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Super Admin</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F5EBE0', border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IcoUser />
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileHeader({ onHamburger }) {
  return (
    <header className="hdr-mobile" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: C.sidebar, alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', zIndex: 90 }}>
      <div>
        <span style={{ color: C.white, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ACQAR </span>
        <span style={{ color: C.copper, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ADMIN</span>
      </div>
      <button onClick={onHamburger} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, color: C.white }}>
        <IcoMenu />
      </button>
    </header>
  );
}

/* ─── Input style ─────────────────────────────────────────────────── */
const inputStyle = {
  width: '100%', background: '#F3F3F4',
  border: `1px solid ${C.border}`, borderRadius: 9,
  padding: '11px 14px', fontSize: '0.875rem',
  fontWeight: 600, fontFamily: 'Inter, sans-serif',
  color: '#0F0F0F', transition: 'border-color 0.15s',
};

/* ─── Main Component ──────────────────────────────────────────────── */
const AdminSettingsScreen = () => {
  const navigate     = useNavigate();
  const handleLogout = useLogout();
  const [sideOpen,  setSideOpen]  = useState(false);
  const [activeNav, setActiveNav] = useState('settings');

  // Form state
  const [platformName,   setPlatformName]   = useState('Acqar PropTech');
  const [supportEmail,   setSupportEmail]   = useState('support@acqar.com');
  const [maintenance,    setMaintenance]    = useState(false);
  const [twoFactor,      setTwoFactor]      = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [saved,          setSaved]          = useState(false);

  const [notifications, setNotifications] = useState({
    'New User Registration':         { email: true,  push: true  },
    'Property Valuation Generated':  { email: true,  push: true  },
    'New Feedback Received':         { email: true,  push: false },
    'System Alerts':                 { email: true,  push: true  },
  });

  const handleNav = (key) => {
    setActiveNav(key);
    if      (key === 'overview')  navigate('/admin-dashboard');
    else if (key === 'blogs')     navigate('/admin/blogs');
    else if (key !== 'settings')  navigate(`/admin/${key}`);
  };

  const toggleNotif = (item, type) => {
    setNotifications(prev => ({
      ...prev,
      [item]: { ...prev[item], [type]: !prev[item][type] },
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <Helmet>
  <title>Admin | Acqar</title>
  <meta name="robots" content="noindex, nofollow" />
</Helmet>
      <style>{globalCss}</style>

      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} active={activeNav} onNav={handleNav} onLogout={handleLogout} />
      <DesktopHeader onHamburger={() => setSideOpen(true)} />
      <MobileHeader  onHamburger={() => setSideOpen(true)} />

      <main className="main-content" style={{ paddingTop: 60 }}>
        <div className="inner-pad" style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 60px' }}>

          {/* ── Page header ── */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, letterSpacing: '-0.7px', margin: 0 }}>Admin Settings</h1>
            <p style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Configure platform-wide settings and administrative preferences.</p>
          </div>

          {/* ── Platform Configuration ── */}
          <Card>
            <SectionHeader icon={<IcoGlobe />} title="Platform Configuration" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="settings-form-grid">
                <div>
                  <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 7 }}>Platform Name</label>
                  <input
                    type="text"
                    value={platformName}
                    onChange={e => setPlatformName(e.target.value)}
                    className="settings-input"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 7 }}>Support Email</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={e => setSupportEmail(e.target.value)}
                    className="settings-input"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Maintenance mode toggle row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F3F3F4', borderRadius: 12, padding: '14px 18px' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Maintenance Mode</p>
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Disable public access to the platform</p>
                </div>
                <Toggle on={maintenance} onChange={setMaintenance} />
              </div>
            </div>
          </Card>

          {/* ── Security & Access ── */}
          <Card>
            <SectionHeader icon={<IcoShield />} title="Security & Access" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* 2FA toggle row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F3F3F4', borderRadius: 12, padding: '14px 18px' }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Two-Factor Authentication</p>
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>Require 2FA for all administrative accounts</p>
                </div>
                <Toggle on={twoFactor} onChange={setTwoFactor} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 7 }}>Session Timeout (Minutes)</label>
                <input
                  type="number"
                  value={sessionTimeout}
                  onChange={e => setSessionTimeout(e.target.value)}
                  className="settings-input"
                  style={{ ...inputStyle, width: 120 }}
                />
              </div>
            </div>
          </Card>

          {/* ── Notification Preferences ── */}
          <Card>
            <SectionHeader icon={<IcoBellSm />} title="Notification Preferences" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {Object.entries(notifications).map(([item, val], i, arr) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none', gap: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                      <Checkbox checked={val.email} onChange={() => toggleNotif(item, 'email')} />
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Email</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                      <Checkbox checked={val.push} onChange={() => toggleNotif(item, 'push')} />
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Push</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* ── Save button ── */}
          <div className="save-row" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              onClick={handleSave}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: saved ? '#16A34A' : C.copper,
                color: '#fff', border: 'none', borderRadius: 12,
                padding: '13px 32px', fontWeight: 800, fontSize: '0.8rem',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: `0 6px 20px ${saved ? 'rgba(22,163,74,0.25)' : 'rgba(200,131,42,0.25)'}`,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { if (!saved) e.currentTarget.style.background = '#a6682e'; }}
              onMouseLeave={e => { if (!saved) e.currentTarget.style.background = C.copper; }}
            >
              <IcoSave />
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminSettingsScreen;
