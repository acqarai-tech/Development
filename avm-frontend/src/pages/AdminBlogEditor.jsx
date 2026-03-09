// import { useEffect, useState, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useLogout } from '../hooks/useLogout';
// import ReactQuill from 'react-quill-new';
// import 'react-quill-new/dist/quill.snow.css';
// import { supabase } from '../lib/supabase'; // ← your supabase client

// /* ─── Design Tokens ───────────────────────────────────────────────── */
// const C = {
//   sidebar:     '#1C1C1E',
//   sidebarText: '#9A9A9A',
//   activeNav:   '#C8832A',
//   activeText:  '#FFFFFF',
//   copper:      '#C8832A',
//   copperLight: 'rgba(200,131,42,0.10)',
//   bg:          '#F3F3F4',
//   white:       '#FFFFFF',
//   border:      '#E9E9EA',
//   text:        '#0F0F0F',
//   muted:       '#6B6B6B',
//   danger:      '#EF4444',
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
// const IcoMenu   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
// const IcoX      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
// const IcoSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
// const IcoBell   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
// const IcoUser   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
// const IcoLogout = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
// const IcoUpload = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
// const IcoImg    = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.copper} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
// const IcoInfo   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.copper} strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
// const IcoLoader = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;

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
//   @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

//   ::-webkit-scrollbar { width: 4px; }
//   ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }

//   .sidebar-nav-btn { transition: background 0.14s; }
//   .sidebar-nav-btn:hover { background: rgba(255,255,255,0.07) !important; }

//   /* ── Header visibility ── */
//   .hdr-desktop { display: flex !important; }
//   .hdr-mobile  { display: none  !important; }

//   /* ── Quill overrides ── */
//   .ql-toolbar.ql-snow {
//     border: 1px solid rgba(233,233,234,0.9) !important;
//     border-bottom: none !important;
//     border-radius: 10px 10px 0 0 !important;
//     background: #FAFAFA !important;
//     padding: 10px 14px !important;
//   }
//   .ql-container.ql-snow {
//     border: 1px solid rgba(233,233,234,0.9) !important;
//     border-radius: 0 0 10px 10px !important;
//     font-family: 'Inter', sans-serif !important;
//     font-size: 1rem !important;
//     min-height: 280px !important;
//   }
//   .ql-editor {
//     padding: 18px 20px !important;
//     min-height: 260px !important;
//     line-height: 1.8 !important;
//     color: #0F0F0F !important;
//   }
//   .ql-editor.ql-blank::before {
//     color: rgba(107,107,107,0.45) !important;
//     font-style: normal !important;
//   }
//   .ql-snow .ql-stroke { stroke: #555 !important; }
//   .ql-snow .ql-fill   { fill:   #555 !important; }
//   .ql-snow .ql-picker  { color: #555 !important; }
//   .ql-snow.ql-toolbar button:hover .ql-stroke,
//   .ql-snow.ql-toolbar button.ql-active .ql-stroke { stroke: #C8832A !important; }
//   .ql-snow.ql-toolbar button:hover .ql-fill,
//   .ql-snow.ql-toolbar button.ql-active .ql-fill   { fill:   #C8832A !important; }
//   .ql-snow.ql-toolbar button.ql-active,
//   .ql-snow.ql-toolbar button:hover {
//     background: rgba(200,131,42,0.09) !important;
//     border-radius: 5px !important;
//   }

//   /* ── Image upload zone hover ── */
//   .img-upload-zone:hover {
//     border-color: #C8832A !important;
//     background: #FEF9F4 !important;
//   }

//   /* ── Toast ── */
//   .toast {
//     position: fixed;
//     bottom: 28px;
//     left: 50%;
//     transform: translateX(-50%);
//     background: #1C1C1E;
//     color: #fff;
//     padding: 12px 24px;
//     border-radius: 999px;
//     font-size: 0.875rem;
//     font-weight: 600;
//     z-index: 9999;
//     animation: fadeIn 0.2s ease;
//     box-shadow: 0 8px 24px rgba(0,0,0,0.25);
//     white-space: nowrap;
//   }
//   .toast.success { background: #16A34A; }
//   .toast.error   { background: #DC2626; }

//   /* ── Mobile ── */
//   @media (max-width: 640px) {
//     .hdr-desktop { display: none !important; }
//     .hdr-mobile  { display: flex !important; }

//     .editor-content {
//       padding: 24px 16px 80px !important;
//     }
//     main {
//       padding-top: 117px !important;
//     }
//     .pub-grid {
//       grid-template-columns: 1fr !important;
//     }
//     .pub-inner-grid {
//       grid-template-columns: 1fr 1fr !important;
//     }
//     .subtoolbar {
//       padding: 10px 14px !important;
//     }
//     .subtoolbar-title {
//       font-size: 0.7rem !important;
//     }
//     .publish-btn {
//       padding: 8px 16px !important;
//       font-size: 0.8rem !important;
//     }
//     .cancel-btn {
//       display: none !important;
//     }
//     .title-input {
//       font-size: clamp(1.6rem, 7vw, 2.4rem) !important;
//     }
//   }
// `;

// /* ═══════════════════════════════════════════════════════════════════
//    SUPABASE SAVE LOGIC EXPLANATION
//    ═══════════════════════════════════════════════════════════════════
   
//    Your Supabase table should look like:
   
//    Table: blogs
//    ┌─────────────────┬──────────────┬──────────────┐
//    │ Column          │ Type         │ Notes        │
//    ├─────────────────┼──────────────┼──────────────┤
//    │ id              │ uuid (PK)    │ auto-gen     │
//    │ title           │ text         │              │
//    │ excerpt         │ text         │              │
//    │ content         │ text         │ HTML string  │
//    │ author          │ text         │              │
//    │ status          │ text         │ draft/pub... │
//    │ image_url       │ text         │ storage URL  │
//    │ date            │ date         │              │
//    │ read_count      │ int4         │ default 0    │
//    │ created_at      │ timestamptz  │ auto-gen     │
//    │ updated_at      │ timestamptz  │ auto-gen     │
//    └─────────────────┴──────────────┴──────────────┘

//    For image storage:
//    - Create a Supabase Storage bucket called "blog-images"
//    - Upload the image file → get public URL
//    - Save that URL as image_url in the blogs table
   
//    The handleSave function below does exactly this.
// ═══════════════════════════════════════════════════════════════════ */

// /* ─── Sidebar ─────────────────────────────────────────────────────── */
// function Sidebar({ open, onClose, active, onNav, onLogout }) {
//   if (!open) return null;
//   return (
//     <>
//       <div
//         onClick={onClose}
//         style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.5)', animation: 'fadeIn 0.18s ease' }}
//       />
//       <aside style={{
//         position: 'fixed', top: 0, left: 0, bottom: 0, width: SIDEBAR_W,
//         background: C.sidebar, display: 'flex', flexDirection: 'column',
//         zIndex: 99, animation: 'slideIn 0.22s ease',
//         boxShadow: '6px 0 28px rgba(0,0,0,0.28)',
//       }}>
//         {/* Logo row */}
//         <div style={{
//           display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//           padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
//         }}>
//           <div>
//             <span style={{ color: C.white,  fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ACQAR </span>
//             <span style={{ color: C.copper, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ADMIN</span>
//           </div>
//           <button onClick={onClose} style={{
//             background: 'rgba(255,255,255,0.08)', border: 'none', width: 28, height: 28,
//             borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center',
//             justifyContent: 'center', color: C.sidebarText,
//           }}>
//             <IcoX />
//           </button>
//         </div>

//         {/* Nav items */}
//         <nav style={{ flex: 1, padding: 10, overflowY: 'auto' }}>
//           {navItems.map(({ label, key }) => {
//             const on = active === key;
//             return (
//               <button key={key} className="sidebar-nav-btn"
//                 onClick={() => { onNav(key); onClose(); }}
//                 style={{
//                   width: '100%', display: 'flex', alignItems: 'center', gap: 11,
//                   padding: '11px 14px', borderRadius: 10, border: 'none',
//                   background: on ? C.activeNav : 'transparent',
//                   color: on ? C.activeText : C.sidebarText,
//                   cursor: 'pointer', marginBottom: 2, fontSize: 13.5,
//                   fontWeight: on ? 700 : 400, textAlign: 'left', fontFamily: 'inherit',
//                 }}>
//                 <NavIcon k={key} />
//                 {label}
//               </button>
//             );
//           })}
//         </nav>

//         {/* Logout */}
//         <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
//           <button className="sidebar-nav-btn" onClick={onLogout} style={{
//             width: '100%', display: 'flex', alignItems: 'center', gap: 11,
//             padding: '11px 14px', borderRadius: 10, border: 'none',
//             background: 'transparent', color: C.sidebarText, cursor: 'pointer',
//             fontSize: 13.5, fontWeight: 400, textAlign: 'left', fontFamily: 'inherit',
//           }}>
//             <IcoLogout /> Logout
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// }

// /* ─── Desktop Header ──────────────────────────────────────────────── */
// function DesktopHeader({ onHamburger }) {
//   return (
//     <header className="hdr-desktop" style={{
//       position: 'fixed', top: 0, left: 0, right: 0, height: 60,
//       background: C.white, borderBottom: `1px solid ${C.border}`,
//       alignItems: 'center', justifyContent: 'space-between',
//       padding: '0 22px', zIndex: 90, gap: 12,
//     }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
//         <button onClick={onHamburger} style={{
//           background: 'none', border: 'none', cursor: 'pointer',
//           display: 'flex', color: C.muted, padding: 4,
//         }}>
//           <IcoMenu />
//         </button>
//         <div style={{
//           display: 'flex', alignItems: 'center', gap: 8,
//           background: '#F3F3F4', borderRadius: 22,
//           padding: '8px 16px', maxWidth: 360, width: '100%',
//           border: `1px solid ${C.border}`,
//         }}>
//           <IcoSearch />
//           <span style={{ fontSize: 13, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
//             Search reports, users, or articles...
//           </span>
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
//           <div style={{
//             width: 36, height: 36, borderRadius: '50%', background: '#F5EBE0',
//             border: `2px solid ${C.border}`, display: 'flex',
//             alignItems: 'center', justifyContent: 'center', flexShrink: 0,
//           }}>
//             <IcoUser />
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

// /* ─── Mobile Header ───────────────────────────────────────────────── */
// function MobileHeader({ onHamburger }) {
//   return (
//     <header className="hdr-mobile" style={{
//       position: 'fixed', top: 0, left: 0, right: 0, height: 60,
//       background: C.sidebar, alignItems: 'center',
//       justifyContent: 'space-between', padding: '0 18px', zIndex: 90,
//     }}>
//       <div>
//         <span style={{ color: C.white,  fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ACQAR </span>
//         <span style={{ color: C.copper, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ADMIN</span>
//       </div>
//       <button onClick={onHamburger} style={{
//         background: 'none', border: 'none', cursor: 'pointer',
//         display: 'flex', alignItems: 'center', justifyContent: 'center',
//         padding: 4, color: C.white,
//       }}>
//         <IcoMenu />
//       </button>
//     </header>
//   );
// }

// /* ─── Toast ───────────────────────────────────────────────────────── */
// function Toast({ msg, type }) {
//   if (!msg) return null;
//   return <div className={`toast ${type}`}>{msg}</div>;
// }

// /* ═══════════════════════════════════════════════════════════════════
//    MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════ */
// const AdminBlogEditor = () => {
//   const navigate     = useNavigate();
//   const handleLogout = useLogout();
//   const fileInputRef = useRef(null);

//   const [sideOpen,  setSideOpen]  = useState(false);
//   const [activeNav, setActiveNav] = useState('blogs');
//   const [saving,    setSaving]    = useState(false);
//   const [toast,     setToast]     = useState({ msg: '', type: 'success' });

//   const [blog, setBlog] = useState({
//     title:     '',
//     excerpt:   '',
//     content:   '',
//     author:    'Acqar Admin',
//     status:    'draft',
//     image_url: '',
//     date:      new Date().toISOString().split('T')[0],
//     read_count: 0,
//   });

//   // Track editing ID from localStorage (set by blog list when clicking "edit")
//   const editingId = localStorage.getItem('editing_blog_id');
//   const isEditing = !!editingId;

//   /* ── Load existing blog if editing ── */
//   useEffect(() => {
//     if (!editingId) return;
//     (async () => {
//       const { data, error } = await supabase
//         .from('blogs')
//         .select('*')
//         .eq('id', editingId)
//         .single();
//       if (!error && data) setBlog(data);
//     })();
//   }, [editingId]);

//   /* ── Show toast helper ── */
//   const showToast = (msg, type = 'success') => {
//     setToast({ msg, type });
//     setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
//   };

//   /* ── Navigation ── */
//   const handleNav = (key) => {
//     setActiveNav(key);
//     if (key === 'overview') navigate('/blogs');
//     else if (key === 'blogs') navigate('/admin/blogs');
//     else navigate(`/admin/${key}`);
//   };

//   /* ── Image upload → Supabase Storage → get public URL ── */
//   const handleImageUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Local preview immediately
//     const reader = new FileReader();
//     reader.onloadend = () => setBlog(b => ({ ...b, image_url: reader.result }));
//     reader.readAsDataURL(file);

//     // Upload to Supabase Storage bucket "blog-images"
//     const ext      = file.name.split('.').pop();
//     const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

//     const { data: storageData, error: storageError } = await supabase.storage
//       .from('blog-images')
//       .upload(fileName, file, { cacheControl: '3600', upsert: false });

//     if (storageError) {
//       console.error('Image upload error:', storageError.message);
//       showToast('Image upload failed', 'error');
//       return;
//     }

//     // Get public URL from storage
//     const { data: { publicUrl } } = supabase.storage
//       .from('blog-images')
//       .getPublicUrl(storageData.path);

//     setBlog(b => ({ ...b, image_url: publicUrl }));
//   };

//   /* ── Save / Publish → Supabase ── */
//   const handleSave = async () => {
//     if (!blog.title.trim() || !blog.content.trim()) {
//       showToast('Please fill in title and content', 'error');
//       return;
//     }

//     setSaving(true);

//     const payload = {
//       title:      blog.title.trim(),
//       excerpt:    blog.excerpt.trim(),
//       content:    blog.content,           // rich HTML from ReactQuill
//       author:     blog.author,
//       status:     blog.status,
//       image_url:  blog.image_url,
//       date:       blog.date,
//       read_count: blog.read_count ?? 0,
//       updated_at: new Date().toISOString(),
//     };

//     let error;

//     if (isEditing) {
//       // UPDATE existing row
//       ({ error } = await supabase
//         .from('blogs')
//         .update(payload)
//         .eq('id', editingId));
//     } else {
//       // INSERT new row (Supabase auto-generates uuid for id + created_at)
//       ({ error } = await supabase
//         .from('blogs')
//         .insert([payload]));
//     }

//     setSaving(false);

//     if (error) {
//       console.error('Save error:', error.message);
//       showToast('Failed to save blog', 'error');
//       return;
//     }

//     localStorage.removeItem('editing_blog_id');
//     showToast(isEditing ? 'Changes saved!' : 'Blog published!', 'success');
//     setTimeout(() => navigate('/admin/blogs'), 800);
//   };

//   /* ── Quill toolbar config ── */
//   const quillModules = {
//     toolbar: [
//       [{ header: [1, 2, 3, false] }],
//       ['bold', 'italic', 'underline', 'strike'],
//       [{ list: 'ordered' }, { list: 'bullet' }],
//       ['link', 'blockquote', 'code-block'],
//       ['clean'],
//     ],
//   };

//   const inputStyle = {
//     width: '100%',
//     background: '#F3F3F4',
//     border: `1px solid ${C.border}`,
//     borderRadius: 9,
//     padding: '11px 14px',
//     fontSize: '0.875rem',
//     fontWeight: 600,
//     fontFamily: 'Inter, sans-serif',
//     color: C.text,
//     outline: 'none',
//     transition: 'border-color 0.15s',
//   };

//   /* ────────────────────────────────────────────────────────────────── */
//   return (
//     <div style={{ background: C.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
//       <style>{globalCss}</style>

//       <Toast msg={toast.msg} type={toast.type} />

//       <Sidebar
//         open={sideOpen}
//         onClose={() => setSideOpen(false)}
//         active={activeNav}
//         onNav={handleNav}
//         onLogout={handleLogout}
//       />
//       <DesktopHeader onHamburger={() => setSideOpen(true)} />
//       <MobileHeader  onHamburger={() => setSideOpen(true)} />

//       {/* ── Sub-toolbar ── */}
//       <div className="subtoolbar" style={{
//         position: 'sticky', top: 60, zIndex: 80,
//         background: C.white, borderBottom: `1px solid ${C.border}`,
//         padding: '12px 22px',
//         display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
//       }}>
//         {/* Left: back + title */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
//           <button
//             onClick={() => navigate('/admin/blogs')}
//             style={{
//               width: 34, height: 34, borderRadius: '50%', border: 'none',
//               background: 'transparent', cursor: 'pointer',
//               display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted,
//               transition: 'background 0.15s',
//             }}
//             onMouseEnter={e => e.currentTarget.style.background = '#F3F3F4'}
//             onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
//           >
//             <IcoX />
//           </button>
//           <div style={{ width: 1, height: 24, background: C.border }} />
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//             <span className="subtoolbar-title" style={{
//               fontSize: '0.8rem', fontWeight: 800, color: C.text,
//               textTransform: 'uppercase', letterSpacing: '0.1em',
//             }}>
//               {isEditing ? 'Edit Article' : 'Create Article'}
//             </span>
//             <span style={{
//               background: '#F3F3F4', color: C.muted,
//               padding: '2px 8px', borderRadius: 4,
//               fontSize: '0.5625rem', fontWeight: 800,
//               textTransform: 'uppercase', letterSpacing: '0.08em',
//             }}>
//               {blog.status}
//             </span>
//           </div>
//         </div>

//         {/* Right: cancel + publish */}
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//           <button className="cancel-btn"
//             onClick={() => navigate('/admin/blogs')}
//             style={{
//               padding: '8px 18px', borderRadius: 999, border: 'none',
//               background: 'transparent', fontWeight: 600, fontSize: '0.875rem',
//               color: C.muted, cursor: 'pointer', fontFamily: 'inherit',
//               transition: 'background 0.15s',
//             }}
//             onMouseEnter={e => e.currentTarget.style.background = '#F3F3F4'}
//             onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
//           >
//             Cancel
//           </button>
//           <button className="publish-btn"
//             onClick={handleSave}
//             disabled={saving}
//             style={{
//               padding: '9px 24px', borderRadius: 999, border: 'none',
//               background: saving ? '#d9a060' : C.copper,
//               color: '#fff', fontWeight: 700, fontSize: '0.875rem',
//               cursor: saving ? 'not-allowed' : 'pointer',
//               fontFamily: 'inherit',
//               boxShadow: '0 4px 14px rgba(200,131,42,0.28)',
//               display: 'flex', alignItems: 'center', gap: 7,
//               transition: 'background 0.15s',
//             }}
//             onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#a6682e'; }}
//             onMouseLeave={e => { if (!saving) e.currentTarget.style.background = C.copper; }}
//           >
//             {saving && <IcoLoader />}
//             {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Publish')}
//           </button>
//         </div>
//       </div>

//       {/* ── Editor body ── */}
//       {/* 60px = main header, 57px = sub-toolbar = 117px total offset */}
//       <main style={{ paddingTop: 117 }}>
//         <div className="editor-content" style={{ maxWidth: 780, margin: '0 auto', padding: '36px 24px 80px' }}>

//           {/* ── Featured image ── */}
//           <div style={{ marginBottom: 36 }}>
//             {blog.image_url ? (
//               <div
//                 style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.09)' }}
//                 onMouseEnter={e => e.currentTarget.querySelector('.img-ov').style.opacity = '1'}
//                 onMouseLeave={e => e.currentTarget.querySelector('.img-ov').style.opacity = '0'}
//               >
//                 <img
//                   src={blog.image_url}
//                   alt="Featured"
//                   style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
//                   referrerPolicy="no-referrer"
//                 />
//                 <div className="img-ov" style={{
//                   position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.42)',
//                   opacity: 0, transition: 'opacity 0.2s',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
//                 }}>
//                   <button
//                     onClick={() => fileInputRef.current?.click()}
//                     style={{ width: 42, height: 42, borderRadius: '50%', background: C.white, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text }}
//                   >
//                     <IcoUpload />
//                   </button>
//                   <button
//                     onClick={() => setBlog(b => ({ ...b, image_url: '' }))}
//                     style={{ width: 42, height: 42, borderRadius: '50%', background: C.white, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.danger }}
//                   >
//                     <IcoX />
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               /* Upload placeholder — matches screenshot exactly */
//               <div
//                 className="img-upload-zone"
//                 onClick={() => fileInputRef.current?.click()}
//                 style={{
//                   border: `2px dashed ${C.border}`,
//                   borderRadius: 16,
//                   padding: '56px 24px',
//                   display: 'flex', flexDirection: 'column',
//                   alignItems: 'center', justifyContent: 'center',
//                   cursor: 'pointer',
//                   minHeight: 280,
//                   transition: 'border-color 0.2s, background 0.2s',
//                   background: C.white,
//                 }}
//               >
//                 {/* Icon circle */}
//                 <div style={{
//                   width: 60, height: 60,
//                   background: '#F3F3F4',
//                   borderRadius: '50%',
//                   display: 'flex', alignItems: 'center', justifyContent: 'center',
//                   marginBottom: 16,
//                 }}>
//                   <IcoImg />
//                 </div>

//                 <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: C.text, marginBottom: 8 }}>
//                   Add a featured image
//                 </h3>
//                 <p style={{ fontSize: '0.875rem', color: C.muted, marginBottom: 16 }}>
//                   We recommend 1200 × 627 pixels for the best display.
//                 </p>

//                 {/* Pill badge — matches screenshot */}
//                 <span style={{
//                   display: 'inline-flex', alignItems: 'center', gap: 6,
//                   background: C.copperLight,
//                   color: C.copper,
//                   padding: '5px 14px',
//                   borderRadius: 999,
//                   fontSize: '0.65rem',
//                   fontWeight: 800,
//                   textTransform: 'uppercase',
//                   letterSpacing: '0.12em',
//                 }}>
//                   <IcoInfo />
//                   Recommended size: 1200 × 627 px
//                 </span>
//               </div>
//             )}
//             <input
//               type="file"
//               ref={fileInputRef}
//               onChange={handleImageUpload}
//               accept="image/*"
//               style={{ display: 'none' }}
//             />
//           </div>

//           {/* ── Title ── */}
//           <input
//             type="text"
//             className="title-input"
//             value={blog.title}
//             onChange={e => setBlog(b => ({ ...b, title: e.target.value }))}
//             placeholder="Headline"
//             style={{
//               width: '100%',
//               fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
//               fontWeight: 900,
//               letterSpacing: '-0.03em',
//               color: blog.title ? C.text : 'rgba(15,15,15,0.18)',
//               border: 'none', outline: 'none',
//               background: 'transparent',
//               fontFamily: 'Inter, sans-serif',
//               lineHeight: 1.1,
//               marginBottom: 20,
//               width: '100%',
//             }}
//           />

//           {/* ── Excerpt ── */}
//           <textarea
//             value={blog.excerpt}
//             onChange={e => setBlog(b => ({ ...b, excerpt: e.target.value }))}
//             placeholder="Add a short summary for your readers..."
//             rows={3}
//             style={{
//               width: '100%',
//               fontSize: '1.05rem',
//               fontWeight: 500,
//               color: blog.excerpt ? C.text : C.muted,
//               border: 'none',
//               borderLeft: `3px solid ${C.border}`,
//               outline: 'none',
//               background: 'transparent',
//               fontFamily: 'Inter, sans-serif',
//               resize: 'none',
//               paddingLeft: 18,
//               lineHeight: 1.65,
//               marginBottom: 28,
//               transition: 'border-color 0.2s',
//             }}
//             onFocus={e => e.currentTarget.style.borderLeftColor = C.copper}
//             onBlur={e => e.currentTarget.style.borderLeftColor = C.border}
//           />

//           {/* ── Rich text editor ── */}
//           <div style={{ marginBottom: 40 }}>
//             <ReactQuill
//               theme="snow"
//               value={blog.content}
//               onChange={content => setBlog(b => ({ ...b, content }))}
//               modules={quillModules}
//               placeholder="Write your article here..."
//             />
//           </div>

//           {/* ── Publishing details ── */}
//           <div style={{ paddingTop: 28, borderTop: `1px solid ${C.border}` }}>
//             <div className="pub-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

//               {/* Left: author + status */}
//               <div>
//                 <h3 style={{
//                   fontSize: '0.75rem', fontWeight: 800, color: C.text,
//                   textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 16,
//                 }}>
//                   Publishing Details
//                 </h3>
//                 <div className="pub-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//                   <div>
//                     <label style={{
//                       display: 'block', fontSize: '0.625rem', fontWeight: 700,
//                       color: C.muted, textTransform: 'uppercase',
//                       letterSpacing: '0.15em', marginBottom: 6,
//                     }}>
//                       Author
//                     </label>
//                     <input
//                       type="text"
//                       value={blog.author}
//                       onChange={e => setBlog(b => ({ ...b, author: e.target.value }))}
//                       style={inputStyle}
//                       onFocus={e => e.currentTarget.style.borderColor = C.copper}
//                       onBlur={e => e.currentTarget.style.borderColor = C.border}
//                     />
//                   </div>
//                   <div>
//                     <label style={{
//                       display: 'block', fontSize: '0.625rem', fontWeight: 700,
//                       color: C.muted, textTransform: 'uppercase',
//                       letterSpacing: '0.15em', marginBottom: 6,
//                     }}>
//                       Status
//                     </label>
//                     <select
//                       value={blog.status}
//                       onChange={e => setBlog(b => ({ ...b, status: e.target.value }))}
//                       style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
//                       onFocus={e => e.currentTarget.style.borderColor = C.copper}
//                       onBlur={e => e.currentTarget.style.borderColor = C.border}
//                     >
//                       <option value="draft">Draft</option>
//                       <option value="published">Published</option>
//                       <option value="scheduled">Scheduled</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>

//               {/* Right: Pro tip */}
//               <div style={{ background: '#F3F3F4', borderRadius: 14, padding: '20px 18px' }}>
//                 <h3 style={{
//                   fontSize: '0.75rem', fontWeight: 800, color: C.text,
//                   textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 10,
//                 }}>
//                   Pro Tip
//                 </h3>
//                 <p style={{ fontSize: '0.875rem', color: C.muted, lineHeight: 1.65 }}>
//                   Articles with more than 1,500 words get the most engagement. Use headers and bullet points to make your content scannable.
//                 </p>
//               </div>

//             </div>
//           </div>

//         </div>
//       </main>
//     </div>
//   );
// };

// export default AdminBlogEditor;


import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { supabase } from '../lib/supabase'; // ← your supabase client

/* ─── Design Tokens ───────────────────────────────────────────────── */
const C = {
  sidebar:     '#1C1C1E',
  sidebarText: '#9A9A9A',
  activeNav:   '#C8832A',
  activeText:  '#FFFFFF',
  copper:      '#C8832A',
  copperLight: 'rgba(200,131,42,0.10)',
  bg:          '#F3F3F4',
  white:       '#FFFFFF',
  border:      '#E9E9EA',
  text:        '#0F0F0F',
  muted:       '#6B6B6B',
  danger:      '#EF4444',
};

const SIDEBAR_W = 260;

const navItems = [
  { label: 'Overview',   key: 'overview'   },
  { label: 'Users',      key: 'users'      },
  { label: 'Valuations', key: 'valuations' },
  { label: 'Feedback',   key: 'feedback'   },
  { label: 'Blogs',      key: 'blogs'      },
  { label: 'Analytics',  key: 'analytics'  },
  { label: 'Settings',   key: 'settings'   },
];

/* ─── Icons ───────────────────────────────────────────────────────── */
const IcoMenu   = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IcoX      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoBell   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoUser   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoLogout = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoUpload = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IcoImg    = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.copper} strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const IcoInfo   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.copper} strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IcoLoader = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;

const NavIcon = ({ k, size = 17 }) => {
  const icons = {
    overview:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    users:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    valuations: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    feedback:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    blogs:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    analytics:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
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
  @keyframes spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }

  .sidebar-nav-btn { transition: background 0.14s; }
  .sidebar-nav-btn:hover { background: rgba(255,255,255,0.07) !important; }

  /* ── Header visibility ── */
  .hdr-desktop { display: flex !important; }
  .hdr-mobile  { display: none  !important; }

  /* ── Quill overrides ── */
  .ql-toolbar.ql-snow {
    border: 1px solid rgba(233,233,234,0.9) !important;
    border-bottom: none !important;
    border-radius: 10px 10px 0 0 !important;
    background: #FAFAFA !important;
    padding: 10px 14px !important;
  }
  .ql-container.ql-snow {
    border: 1px solid rgba(233,233,234,0.9) !important;
    border-radius: 0 0 10px 10px !important;
    font-family: 'Inter', sans-serif !important;
    font-size: 1rem !important;
    min-height: 280px !important;
  }
  .ql-editor {
    padding: 18px 20px !important;
    min-height: 260px !important;
    line-height: 1.8 !important;
    color: #0F0F0F !important;
  }
  .ql-editor.ql-blank::before {
    color: rgba(107,107,107,0.45) !important;
    font-style: normal !important;
  }
  .ql-snow .ql-stroke { stroke: #555 !important; }
  .ql-snow .ql-fill   { fill:   #555 !important; }
  .ql-snow .ql-picker  { color: #555 !important; }
  .ql-snow.ql-toolbar button:hover .ql-stroke,
  .ql-snow.ql-toolbar button.ql-active .ql-stroke { stroke: #C8832A !important; }
  .ql-snow.ql-toolbar button:hover .ql-fill,
  .ql-snow.ql-toolbar button.ql-active .ql-fill   { fill:   #C8832A !important; }
  .ql-snow.ql-toolbar button.ql-active,
  .ql-snow.ql-toolbar button:hover {
    background: rgba(200,131,42,0.09) !important;
    border-radius: 5px !important;
  }

  /* ── Image upload zone hover ── */
  .img-upload-zone:hover {
    border-color: #C8832A !important;
    background: #FEF9F4 !important;
  }

  /* ── Toast ── */
  .toast {
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    background: #1C1C1E;
    color: #fff;
    padding: 12px 24px;
    border-radius: 999px;
    font-size: 0.875rem;
    font-weight: 600;
    z-index: 9999;
    animation: fadeIn 0.2s ease;
    box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    white-space: nowrap;
  }
  .toast.success { background: #16A34A; }
  .toast.error   { background: #DC2626; }

  /* ── Mobile ── */
  @media (max-width: 640px) {
    .hdr-desktop { display: none !important; }
    .hdr-mobile  { display: flex !important; }

    .editor-content {
      padding: 24px 16px 80px !important;
    }
    main {
      padding-top: 117px !important;
    }
    .pub-grid {
      grid-template-columns: 1fr !important;
    }
    .pub-inner-grid {
      grid-template-columns: 1fr 1fr !important;
    }
    .subtoolbar {
      padding: 10px 14px !important;
    }
    .subtoolbar-title {
      font-size: 0.7rem !important;
    }
    .publish-btn {
      padding: 8px 16px !important;
      font-size: 0.8rem !important;
    }
    .cancel-btn {
      display: none !important;
    }
    .title-input {
      font-size: clamp(1.6rem, 7vw, 2.4rem) !important;
    }
  }
`;

/* ═══════════════════════════════════════════════════════════════════
   SUPABASE SAVE LOGIC EXPLANATION
   ═══════════════════════════════════════════════════════════════════
   
   Your Supabase table should look like:
   
   Table: blogs
   ┌─────────────────┬──────────────┬──────────────┐
   │ Column          │ Type         │ Notes        │
   ├─────────────────┼──────────────┼──────────────┤
   │ id              │ uuid (PK)    │ auto-gen     │
   │ title           │ text         │              │
   │ excerpt         │ text         │              │
   │ content         │ text         │ HTML string  │
   │ author          │ text         │              │
   │ status          │ text         │ draft/pub... │
   │ image_url       │ text         │ storage URL  │
   │ date            │ date         │              │
   │ read_count      │ int4         │ default 0    │
   │ created_at      │ timestamptz  │ auto-gen     │
   │ updated_at      │ timestamptz  │ auto-gen     │
   └─────────────────┴──────────────┴──────────────┘

   For image storage:
   - Create a Supabase Storage bucket called "blog-images"
   - Upload the image file → get public URL
   - Save that URL as image_url in the blogs table
   
   The handleSave function below does exactly this.
═══════════════════════════════════════════════════════════════════ */

/* ─── Sidebar ─────────────────────────────────────────────────────── */
function Sidebar({ open, onClose, active, onNav, onLogout }) {
  if (!open) return null;
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.5)', animation: 'fadeIn 0.18s ease' }}
      />
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: SIDEBAR_W,
        background: C.sidebar, display: 'flex', flexDirection: 'column',
        zIndex: 99, animation: 'slideIn 0.22s ease',
        boxShadow: '6px 0 28px rgba(0,0,0,0.28)',
      }}>
        {/* Logo row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
        }}>
          <div>
            <span style={{ color: C.white,  fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ACQAR </span>
            <span style={{ color: C.copper, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ADMIN</span>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', width: 28, height: 28,
            borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: C.sidebarText,
          }}>
            <IcoX />
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: 10, overflowY: 'auto' }}>
          {navItems.map(({ label, key }) => {
            const on = active === key;
            return (
              <button key={key} className="sidebar-nav-btn"
                onClick={() => { onNav(key); onClose(); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                  padding: '11px 14px', borderRadius: 10, border: 'none',
                  background: on ? C.activeNav : 'transparent',
                  color: on ? C.activeText : C.sidebarText,
                  cursor: 'pointer', marginBottom: 2, fontSize: 13.5,
                  fontWeight: on ? 700 : 400, textAlign: 'left', fontFamily: 'inherit',
                }}>
                <NavIcon k={key} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <button className="sidebar-nav-btn" onClick={onLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 11,
            padding: '11px 14px', borderRadius: 10, border: 'none',
            background: 'transparent', color: C.sidebarText, cursor: 'pointer',
            fontSize: 13.5, fontWeight: 400, textAlign: 'left', fontFamily: 'inherit',
          }}>
            <IcoLogout /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}

/* ─── Desktop Header ──────────────────────────────────────────────── */
function DesktopHeader({ onHamburger }) {
  return (
    <header className="hdr-desktop" style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 60,
      background: C.white, borderBottom: `1px solid ${C.border}`,
      alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px', zIndex: 90, gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
        <button onClick={onHamburger} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', color: C.muted, padding: 4,
        }}>
          <IcoMenu />
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#F3F3F4', borderRadius: 22,
          padding: '8px 16px', maxWidth: 360, width: '100%',
          border: `1px solid ${C.border}`,
        }}>
          <IcoSearch />
          <span style={{ fontSize: 13, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Search reports, users, or articles...
          </span>
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
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: '#F5EBE0',
            border: `2px solid ${C.border}`, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <IcoUser />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ─── Mobile Header ───────────────────────────────────────────────── */
function MobileHeader({ onHamburger }) {
  return (
    <header className="hdr-mobile" style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 60,
      background: C.sidebar, alignItems: 'center',
      justifyContent: 'space-between', padding: '0 18px', zIndex: 90,
    }}>
      <div>
        <span style={{ color: C.white,  fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ACQAR </span>
        <span style={{ color: C.copper, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ADMIN</span>
      </div>
      <button onClick={onHamburger} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 4, color: C.white,
      }}>
        <IcoMenu />
      </button>
    </header>
  );
}

/* ─── Toast ───────────────────────────────────────────────────────── */
function Toast({ msg, type }) {
  if (!msg) return null;
  return <div className={`toast ${type}`}>{msg}</div>;
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
const AdminBlogEditor = () => {
  const navigate     = useNavigate();
  const handleLogout = useLogout();
  const fileInputRef = useRef(null);

  const [sideOpen,  setSideOpen]  = useState(false);
  const [activeNav, setActiveNav] = useState('blogs');
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState({ msg: '', type: 'success' });

  const [blog, setBlog] = useState({
    title:     '',
    excerpt:   '',
    content:   '',
    author:    'Acqar Admin',
    status:    'draft',
    image_url: '',
    date:      new Date().toISOString().split('T')[0],
    read_count: 0,
  });

  // Track editing ID from localStorage (set by blog list when clicking "edit")
  const editingId = localStorage.getItem('editing_blog_id');
  const isEditing = !!editingId;

  /* ── Load existing blog if editing ── */
  useEffect(() => {
    if (!editingId) return;
    (async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', editingId)
        .single();
      if (!error && data) setBlog(data);
    })();
  }, [editingId]);

  /* ── Show toast helper ── */
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: 'success' }), 3000);
  };

  /* ── Navigation ── */
  const handleNav = (key) => {
    setActiveNav(key);
    if (key === 'overview') navigate('/blogs');
    else if (key === 'blogs') navigate('/admin/blogs');
    else navigate(`/admin/${key}`);
  };

  /* ── Image upload → Supabase Storage → get public URL ── */
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setBlog(b => ({ ...b, image_url: reader.result }));
    reader.readAsDataURL(file);

    // Upload to Supabase Storage bucket "blog-images"
    const ext      = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from('blog-images')
      .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (storageError) {
      console.error('Image upload error:', storageError.message);
      showToast('Image upload failed', 'error');
      return;
    }

    // Get public URL from storage
    const { data: { publicUrl } } = supabase.storage
      .from('blog-images')
      .getPublicUrl(storageData.path);

    setBlog(b => ({ ...b, image_url: publicUrl }));
  };

  /* ── Save / Publish → Supabase ── */
  const handleSave = async () => {
    if (!blog.title.trim() || !blog.content.trim()) {
      showToast('Please fill in title and content', 'error');
      return;
    }

    setSaving(true);

    const payload = {
      title:      blog.title.trim(),
      excerpt:    blog.excerpt.trim(),
      content:    blog.content,           // rich HTML from ReactQuill
      author:     blog.author,
      status:     blog.status,
      image_url:  blog.image_url,
      date:       blog.date,
      read_count: blog.read_count ?? 0,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (isEditing) {
      // UPDATE existing row
      ({ error } = await supabase
        .from('blogs')
        .update(payload)
        .eq('id', editingId));
    } else {
      // INSERT new row (Supabase auto-generates uuid for id + created_at)
      ({ error } = await supabase
        .from('blogs')
        .insert([payload]));
    }

    setSaving(false);

    if (error) {
      console.error('Save error:', error.message);
      showToast('Failed to save blog', 'error');
      return;
    }

    localStorage.removeItem('editing_blog_id');
    showToast(isEditing ? 'Changes saved!' : 'Blog published!', 'success');
    setTimeout(() => navigate('/admin/blogs'), 800);
  };

  /* ── Quill toolbar config ── */
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'blockquote', 'code-block'],
      ['clean'],
    ],
  };

  const inputStyle = {
    width: '100%',
    background: '#F3F3F4',
    border: `1px solid ${C.border}`,
    borderRadius: 9,
    padding: '11px 14px',
    fontSize: '0.875rem',
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    color: C.text,
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  /* ────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <style>{globalCss}</style>

      <Toast msg={toast.msg} type={toast.type} />

      <Sidebar
        open={sideOpen}
        onClose={() => setSideOpen(false)}
        active={activeNav}
        onNav={handleNav}
        onLogout={handleLogout}
      />
      <DesktopHeader onHamburger={() => setSideOpen(true)} />
      <MobileHeader  onHamburger={() => setSideOpen(true)} />

      {/* ── Sub-toolbar ── */}
      <div className="subtoolbar" style={{
        position: 'sticky', top: 60, zIndex: 80,
        background: C.white, borderBottom: `1px solid ${C.border}`,
        padding: '12px 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        {/* Left: back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => navigate('/admin/blogs')}
            style={{
              width: 34, height: 34, borderRadius: '50%', border: 'none',
              background: 'transparent', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F3F3F4'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <IcoX />
          </button>
          <div style={{ width: 1, height: 24, background: C.border }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="subtoolbar-title" style={{
              fontSize: '0.8rem', fontWeight: 800, color: C.text,
              textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>
              {isEditing ? 'Edit Article' : 'Create Article'}
            </span>
            <span style={{
              background: '#F3F3F4', color: C.muted,
              padding: '2px 8px', borderRadius: 4,
              fontSize: '0.5625rem', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {blog.status}
            </span>
          </div>
        </div>

        {/* Right: cancel + publish */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="cancel-btn"
            onClick={() => navigate('/admin/blogs')}
            style={{
              padding: '8px 18px', borderRadius: 999, border: 'none',
              background: 'transparent', fontWeight: 600, fontSize: '0.875rem',
              color: C.muted, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F3F3F4'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Cancel
          </button>
          <button className="publish-btn"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '9px 24px', borderRadius: 999, border: 'none',
              background: saving ? '#d9a060' : C.copper,
              color: '#fff', fontWeight: 700, fontSize: '0.875rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(200,131,42,0.28)',
              display: 'flex', alignItems: 'center', gap: 7,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#a6682e'; }}
            onMouseLeave={e => { if (!saving) e.currentTarget.style.background = C.copper; }}
          >
            {saving && <IcoLoader />}
            {saving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Publish')}
          </button>
        </div>
      </div>

      {/* ── Editor body ── */}
      {/* 60px = main header, 57px = sub-toolbar = 117px total offset */}
      <main style={{ paddingTop: 117 }}>
        <div className="editor-content" style={{ maxWidth: 780, margin: '0 auto', padding: '36px 24px 80px' }}>

          {/* ── Featured image ── */}
          <div style={{ marginBottom: 36 }}>
            {blog.image_url ? (
              <div
                style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.09)' }}
                onMouseEnter={e => e.currentTarget.querySelector('.img-ov').style.opacity = '1'}
                onMouseLeave={e => e.currentTarget.querySelector('.img-ov').style.opacity = '0'}
              >
                <img
                  src={blog.image_url}
                  alt="Featured"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  referrerPolicy="no-referrer"
                />
                <div className="img-ov" style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.42)',
                  opacity: 0, transition: 'opacity 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{ width: 42, height: 42, borderRadius: '50%', background: C.white, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text }}
                  >
                    <IcoUpload />
                  </button>
                  <button
                    onClick={() => setBlog(b => ({ ...b, image_url: '' }))}
                    style={{ width: 42, height: 42, borderRadius: '50%', background: C.white, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.danger }}
                  >
                    <IcoX />
                  </button>
                </div>
              </div>
            ) : (
              /* Upload placeholder — matches screenshot exactly */
              <div
                className="img-upload-zone"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${C.border}`,
                  borderRadius: 16,
                  padding: '56px 24px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  minHeight: 420,
                  transition: 'border-color 0.2s, background 0.2s',
                  background: C.white,
                }}
              >
                {/* Icon circle */}
                <div style={{
                  width: 60, height: 60,
                  background: '#F3F3F4',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <IcoImg />
                </div>

                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: C.text, marginBottom: 8 }}>
                  Add a featured image
                </h3>
                <p style={{ fontSize: '0.875rem', color: C.muted, marginBottom: 16 }}>
                  We recommend 1200 × 627 pixels for the best display.
                </p>

                {/* Pill badge — matches screenshot */}
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: C.copperLight,
                  color: C.copper,
                  padding: '5px 14px',
                  borderRadius: 999,
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                }}>
                  <IcoInfo />
                  Recommended size: 1200 × 627 px
                </span>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>

          {/* ── Title ── */}
          <input
            type="text"
            className="title-input"
            value={blog.title}
            onChange={e => setBlog(b => ({ ...b, title: e.target.value }))}
            placeholder="Headline"
            style={{
              width: '100%',
              fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              color: blog.title ? C.text : 'rgba(15,15,15,0.18)',
              border: 'none', outline: 'none',
              background: 'transparent',
              fontFamily: 'Inter, sans-serif',
              lineHeight: 1.1,
              marginBottom: 20,
              width: '100%',
            }}
          />

          {/* ── Excerpt ── */}
          <textarea
            value={blog.excerpt}
            onChange={e => setBlog(b => ({ ...b, excerpt: e.target.value }))}
            placeholder="Add a short summary for your readers..."
            rows={3}
            style={{
              width: '100%',
              fontSize: '1.05rem',
              fontWeight: 500,
              color: blog.excerpt ? C.text : C.muted,
              border: 'none',
              borderLeft: `3px solid ${C.border}`,
              outline: 'none',
              background: 'transparent',
              fontFamily: 'Inter, sans-serif',
              resize: 'none',
              paddingLeft: 18,
              lineHeight: 1.65,
              marginBottom: 28,
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.currentTarget.style.borderLeftColor = C.copper}
            onBlur={e => e.currentTarget.style.borderLeftColor = C.border}
          />

          {/* ── Rich text editor ── */}
          <div style={{ marginBottom: 40 }}>
            <ReactQuill
              theme="snow"
              value={blog.content}
              onChange={content => setBlog(b => ({ ...b, content }))}
              modules={quillModules}
              placeholder="Write your article here..."
            />
          </div>

          {/* ── Publishing details ── */}
          <div style={{ paddingTop: 28, borderTop: `1px solid ${C.border}` }}>
            <div className="pub-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

              {/* Left: author + status */}
              <div>
                <h3 style={{
                  fontSize: '0.75rem', fontWeight: 800, color: C.text,
                  textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 16,
                }}>
                  Publishing Details
                </h3>
                <div className="pub-inner-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{
                      display: 'block', fontSize: '0.625rem', fontWeight: 700,
                      color: C.muted, textTransform: 'uppercase',
                      letterSpacing: '0.15em', marginBottom: 6,
                    }}>
                      Author
                    </label>
                    <input
                      type="text"
                      value={blog.author}
                      onChange={e => setBlog(b => ({ ...b, author: e.target.value }))}
                      style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = C.copper}
                      onBlur={e => e.currentTarget.style.borderColor = C.border}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block', fontSize: '0.625rem', fontWeight: 700,
                      color: C.muted, textTransform: 'uppercase',
                      letterSpacing: '0.15em', marginBottom: 6,
                    }}>
                      Status
                    </label>
                    <select
                      value={blog.status}
                      onChange={e => setBlog(b => ({ ...b, status: e.target.value }))}
                      style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
                      onFocus={e => e.currentTarget.style.borderColor = C.copper}
                      onBlur={e => e.currentTarget.style.borderColor = C.border}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right: Pro tip */}
              <div style={{ background: '#F3F3F4', borderRadius: 14, padding: '20px 18px' }}>
                <h3 style={{
                  fontSize: '0.75rem', fontWeight: 800, color: C.text,
                  textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 10,
                }}>
                  Pro Tip
                </h3>
                <p style={{ fontSize: '0.875rem', color: C.muted, lineHeight: 1.65 }}>
                  Articles with more than 1,500 words get the most engagement. Use headers and bullet points to make your content scannable.
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminBlogEditor;
