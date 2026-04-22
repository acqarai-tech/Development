// import { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { blogService } from '../services/blogService';
// import { useLogout } from '../hooks/useLogout';

// /* ─── Tokens (exact copy from AdminDashboardHome) ─────────────────── */
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

// /* ─── Icons (inline SVG, no lucide dependency needed) ─────────────── */
// const IcoMenu      = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
// const IcoX         = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
// const IcoSearch    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
// const IcoBell      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
// const IcoUser      = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
// const IcoLogout    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
// const IcoPlus      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
// const IcoEdit      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
// const IcoTrash     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

// /* ─── NavIcon map ─────────────────────────────────────────────────── */
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

// /* ─── Global CSS ─────────────────────────────────────────────────── */
// const globalCss = `
//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//   body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
//   @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
//   @keyframes fadeIn  { from { opacity: 0; }                  to { opacity: 1; } }
//   ::-webkit-scrollbar { width: 4px; }
//   ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
//   .sidebar-nav-btn { transition: background 0.14s; }
//   .sidebar-nav-btn:hover { background: rgba(255,255,255,0.07) !important; }
//   .hdr-desktop { display: flex !important; }
//   .hdr-mobile  { display: none !important; }
//   @media (max-width: 600px) {
//     .hdr-desktop { display: none !important; }
//     .hdr-mobile  { display: flex !important; }
//     .main-content { padding-top: 60px !important; }
//     .inner-pad { padding: 20px 16px !important; }
//     .blog-table-wrap { overflow-x: auto; }
//     .stats-row { grid-template-columns: 1fr !important; }
//   }
//   .stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 28px; }
//   @media (max-width: 900px) { .stats-row { grid-template-columns: 1fr 1fr; } }
// `;

// /* ─── Sidebar ────────────────────────────────────────────────────── */
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
//                 <NavIcon k={key} />
//                 {label}
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

// /* ─── Desktop Header ─────────────────────────────────────────────── */
// function DesktopHeader({ onHamburger }) {
//   return (
//     <header className="hdr-desktop" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: C.white, borderBottom: `1px solid ${C.border}`, alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', zIndex: 90, gap: 12 }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
//         <button onClick={onHamburger} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: C.muted, padding: 4 }} aria-label="Open menu">
//           <IcoMenu />
//         </button>
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

// /* ─── Mobile Header ──────────────────────────────────────────────── */
// function MobileHeader({ onHamburger }) {
//   return (
//     <header className="hdr-mobile" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: C.sidebar, alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', zIndex: 90 }}>
//       <div>
//         <span style={{ color: C.white, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ACQAR </span>
//         <span style={{ color: C.copper, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ADMIN</span>
//       </div>
//       <button onClick={onHamburger} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, color: C.white }} aria-label="Open menu">
//         <IcoMenu />
//       </button>
//     </header>
//   );
// }

// /* ─── Main Component ─────────────────────────────────────────────── */
// const AdminBlogDashboard = () => {
//   const navigate   = useNavigate();
//   const handleLogout = useLogout();
//   const [blogs,     setBlogs]     = useState([]);
//   const [sideOpen,  setSideOpen]  = useState(false);
//   const [activeNav, setActiveNav] = useState('blogs');

//   useEffect(() => { setBlogs(blogService.getBlogs()); }, []);

//   const handleNav = (key) => {
//     setActiveNav(key);
//     if (key === 'overview') navigate('/admin-dashboard');
//     else if (key !== 'blogs') navigate(`/admin/${key}`);
//   };

//   const handleEdit = (id) => {
//     localStorage.setItem('editing_blog_id', id);
//     navigate('/admin/blog-editor');
//   };

//   const handleCreate = () => {
//     localStorage.removeItem('editing_blog_id');
//     navigate('/admin/blog-editor');
//   };

//   const handleDelete = (id) => {
//     if (window.confirm('Delete this blog post?')) {
//       blogService.deleteBlog(id);
//       setBlogs(blogService.getBlogs());
//     }
//   };

//   const totalReads = blogs.reduce((sum, b) => sum + b.readCount, 0);

//   const statusColors = {
//     published: { bg: '#D1FAE5', color: '#065F46' },
//     scheduled:  { bg: '#FEF3C7', color: '#92400E' },
//     draft:      { bg: '#F3F4F6', color: '#374151' },
//   };

//   return (
//     <div style={{ background: C.bg, minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
//       <style>{globalCss}</style>

//       <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} active={activeNav} onNav={handleNav} onLogout={handleLogout} />
//       <DesktopHeader onHamburger={() => setSideOpen(true)} />
//       <MobileHeader  onHamburger={() => setSideOpen(true)} />

//       <main className="main-content" style={{ paddingTop: 60 }}>
//         <div className="inner-pad" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

//           {/* Page title + New Post */}
//           <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 28 }}>
//             <div>
//               <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, letterSpacing: '-0.7px', margin: 0 }}>Content Management</h1>
//               <p style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Create, schedule, and analyze your market insights.</p>
//             </div>
//             <button
//               onClick={handleCreate}
//               style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.copper, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '0 6px 20px rgba(200,131,42,0.28)', fontFamily: 'inherit' }}
//               onMouseEnter={e => e.currentTarget.style.background = '#a6682e'}
//               onMouseLeave={e => e.currentTarget.style.background = C.copper}
//             >
//               <IcoPlus /> New Post
//             </button>
//           </div>

//           {/* Stats */}
//           <div className="stats-row">
//             {[
//               { label: 'Total Posts',   value: blogs.length,                                   color: C.text   },
//               { label: 'Total Reads',   value: totalReads.toLocaleString(),                    color: C.copper },
//               { label: 'Active Drafts', value: blogs.filter(b => b.status === 'draft').length, color: C.text   },
//             ].map(({ label, value, color }) => (
//               <div key={label} style={{ background: C.white, borderRadius: 16, padding: '22px', border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
//                 <p style={{ fontSize: '0.6rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.13em', marginBottom: 8 }}>{label}</p>
//                 <h3 style={{ fontSize: '2.1rem', fontWeight: 900, color, letterSpacing: '-1.5px', lineHeight: 1, margin: 0 }}>{value}</h3>
//               </div>
//             ))}
//           </div>

//           {/* Table */}
//           <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
//             <div className="blog-table-wrap" style={{ overflowX: 'auto' }}>
//               <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
//                 <thead>
//                   <tr style={{ background: '#F3F3F4', borderBottom: `1px solid ${C.border}` }}>
//                     {['Post Title', 'Status', 'Date', 'Reads', 'Actions'].map((h, i) => (
//                       <th key={h} style={{ padding: '14px 20px', fontSize: '0.6rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {blogs.length === 0 ? (
//                     <tr><td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: C.muted }}>No articles yet. Create your first post.</td></tr>
//                   ) : blogs.map((blog, i) => {
//                     const sc = statusColors[blog.status] || statusColors.draft;
//                     return (
//                       <tr key={blog.id} style={{ borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}
//                         onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
//                         onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
//                         <td style={{ padding: '14px 20px' }}>
//                           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                             <div style={{ width: 40, height: 40, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
//                               <img src={blog.imageUrl || 'https://picsum.photos/seed/placeholder/100/100'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
//                             </div>
//                             <span style={{ fontWeight: 700, color: C.text, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>{blog.title}</span>
//                           </div>
//                         </td>
//                         <td style={{ padding: '14px 20px' }}>
//                           <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 999, fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{blog.status}</span>
//                         </td>
//                         <td style={{ padding: '14px 20px', fontSize: '0.875rem', color: C.muted, whiteSpace: 'nowrap' }}>{blog.date}</td>
//                         <td style={{ padding: '14px 20px', fontSize: '0.875rem', fontWeight: 800, color: C.text }}>{blog.readCount.toLocaleString()}</td>
//                         <td style={{ padding: '14px 20px', textAlign: 'right' }}>
//                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
//                             <button onClick={() => handleEdit(blog.id)} title="Edit"
//                               style={{ width: 32, height: 32, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}
//                               onMouseEnter={e => { e.currentTarget.style.background = '#FEF3E7'; e.currentTarget.style.color = C.copper; }}
//                               onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}>
//                               <IcoEdit />
//                             </button>
//                             <button onClick={() => handleDelete(blog.id)} title="Delete"
//                               style={{ width: 32, height: 32, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}
//                               onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
//                               onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}>
//                               <IcoTrash />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//         </div>
//       </main>
//     </div>
//   );
// };

// export default AdminBlogDashboard;


import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLogout } from '../hooks/useLogout';
import { Helmet } from 'react-helmet-async';

/* ─── Tokens (exact copy from AdminDashboardHome) ─────────────────── */
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

/* ─── Icons (inline SVG, no lucide dependency needed) ─────────────── */
const IcoMenu      = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IcoX         = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoSearch    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoBell      = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoUser      = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoLogout    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoPlus      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoEdit      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IcoTrash     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;

/* ─── NavIcon map ─────────────────────────────────────────────────── */
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

/* ─── Global CSS ─────────────────────────────────────────────────── */
const globalCss = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
  @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  @keyframes fadeIn  { from { opacity: 0; }                  to { opacity: 1; } }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
  .sidebar-nav-btn { transition: background 0.14s; }
  .sidebar-nav-btn:hover { background: rgba(255,255,255,0.07) !important; }
  .hdr-desktop { display: flex !important; }
  .hdr-mobile  { display: none !important; }
  @media (max-width: 600px) {
    .hdr-desktop { display: none !important; }
    .hdr-mobile  { display: flex !important; }
    .main-content { padding-top: 60px !important; }
    .inner-pad { padding: 20px 16px !important; }
    .blog-table-wrap { overflow-x: auto; }
    .stats-row { grid-template-columns: 1fr !important; }
  }
  .stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 28px; }
  @media (max-width: 900px) { .stats-row { grid-template-columns: 1fr 1fr; } }
`;

/* ─── Sidebar ────────────────────────────────────────────────────── */
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
                <NavIcon k={key} />
                {label}
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

/* ─── Desktop Header ─────────────────────────────────────────────── */
function DesktopHeader({ onHamburger }) {
  return (
    <header className="hdr-desktop" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: C.white, borderBottom: `1px solid ${C.border}`, alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', zIndex: 90, gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
        <button onClick={onHamburger} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: C.muted, padding: 4 }} aria-label="Open menu">
          <IcoMenu />
        </button>
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

/* ─── Mobile Header ──────────────────────────────────────────────── */
function MobileHeader({ onHamburger }) {
  return (
    <header className="hdr-mobile" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: C.sidebar, alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', zIndex: 90 }}>
      <div>
        <span style={{ color: C.white, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ACQAR </span>
        <span style={{ color: C.copper, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ADMIN</span>
      </div>
      <button onClick={onHamburger} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, color: C.white }} aria-label="Open menu">
        <IcoMenu />
      </button>
    </header>
  );
}

/* ─── Main Component ─────────────────────────────────────────────── */
const AdminBlogDashboard = () => {
  const navigate     = useNavigate();
  const handleLogout = useLogout();
  const [blogs,     setBlogs]     = useState([]);
  const [sideOpen,  setSideOpen]  = useState(false);
  const [activeNav, setActiveNav] = useState('blogs');

  // ── Fetch all blogs from Supabase on mount ──
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setBlogs(data);
    })();
  }, []);

 const handleNav = (key) => {
  setActiveNav(key);
  if (key === 'overview') navigate('/admin-dashboard');
  else if (key === 'discountcodes') navigate('/admin/discount-codes'); // ← add explicit route
  else if (key !== 'blogs') navigate(`/admin/${key}`);
};

  const handleEdit = (id) => {
    localStorage.setItem('editing_blog_id', id);
    navigate('/admin/blog-editor');
  };

  const handleCreate = () => {
    localStorage.removeItem('editing_blog_id');
    navigate('/admin/blog-editor');
  };

  // ── Delete from Supabase then remove from local state ──
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (!error) setBlogs(prev => prev.filter(b => b.id !== id));
  };

  const totalReads = blogs.reduce((sum, b) => sum + (b.read_count ?? 0), 0);

  const statusColors = {
    published: { bg: '#D1FAE5', color: '#065F46' },
    scheduled:  { bg: '#FEF3C7', color: '#92400E' },
    draft:      { bg: '#F3F4F6', color: '#374151' },
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
        <div className="inner-pad" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

          {/* Page title + New Post */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 28 }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, letterSpacing: '-0.7px', margin: 0 }}>Content Management</h1>
              <p style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>Create, schedule, and analyze your market insights.</p>
            </div>
            <button
              onClick={handleCreate}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.copper, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', boxShadow: '0 6px 20px rgba(200,131,42,0.28)', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = '#a6682e'}
              onMouseLeave={e => e.currentTarget.style.background = C.copper}
            >
              <IcoPlus /> New Post
            </button>
          </div>

          {/* Stats */}
          <div className="stats-row">
            {[
              { label: 'Total Posts',   value: blogs.length,                                           color: C.text   },
              { label: 'Total Reads',   value: totalReads.toLocaleString(),                            color: C.copper },
              { label: 'Active Drafts', value: blogs.filter(b => b.status === 'draft').length,         color: C.text   },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: C.white, borderRadius: 16, padding: '22px', border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <p style={{ fontSize: '0.6rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.13em', marginBottom: 8 }}>{label}</p>
                <h3 style={{ fontSize: '2.1rem', fontWeight: 900, color, letterSpacing: '-1.5px', lineHeight: 1, margin: 0 }}>{value}</h3>
              </div>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div className="blog-table-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
                <thead>
                  <tr style={{ background: '#F3F3F4', borderBottom: `1px solid ${C.border}` }}>
                    {['Post Title', 'Status', 'Date', 'Reads', 'Actions'].map((h, i) => (
                      <th key={h} style={{ padding: '14px 20px', fontSize: '0.6rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {blogs.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: C.muted }}>No articles yet. Create your first post.</td></tr>
                  ) : blogs.map((blog, i) => {
                    const sc = statusColors[blog.status] || statusColors.draft;
                    return (
                      <tr key={blog.id} style={{ borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
                              <img src={blog.image_url || 'https://picsum.photos/seed/placeholder/100/100'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                            </div>
                            <span style={{ fontWeight: 700, color: C.text, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240 }}>{blog.title}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ background: sc.bg, color: sc.color, padding: '3px 10px', borderRadius: 999, fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{blog.status}</span>
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '0.875rem', color: C.muted, whiteSpace: 'nowrap' }}>{blog.date}</td>
                        <td style={{ padding: '14px 20px', fontSize: '0.875rem', fontWeight: 800, color: C.text }}>{(blog.read_count ?? 0).toLocaleString()}</td>
                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                            <button onClick={() => handleEdit(blog.id)} title="Edit"
                              style={{ width: 32, height: 32, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#FEF3E7'; e.currentTarget.style.color = C.copper; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}>
                              <IcoEdit />
                            </button>
                            <button onClick={() => handleDelete(blog.id)} title="Delete"
                              style={{ width: 32, height: 32, borderRadius: 7, border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted }}
                              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#EF4444'; }}
                              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.muted; }}>
                              <IcoTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminBlogDashboard;
