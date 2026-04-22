// // screens/AdminUsersScreen.jsx
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../lib/supabase';
// import { adminService } from '../services/adminService';
// import { useLogout } from '../hooks/useLogout';
// import {
//   Search, Filter, Mail, UserCheck, UserX, Trash2,
//   Users, LayoutDashboard, Home, MessageSquare, BookOpen,
//   BarChart2, Settings, LogOut, Bell, User, Menu, X,
// } from 'lucide-react';
// import { Helmet } from 'react-helmet-async';

// /* ─── Tokens ────────────────────────────────────────────────────────── */
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
//   emerald:     '#10B981',
//   amber:       '#F59E0B',
// };

// const SIDEBAR_W = 260;

// const navItems = [
//   { label: 'Overview',       icon: LayoutDashboard, key: 'overview'        },
//   { label: 'Users',          icon: Users,            key: 'users'           },
//   { label: 'Valuations',     icon: Home,             key: 'valuations'      },
//   { label: 'Feedback',       icon: MessageSquare,    key: 'feedback'        },
//   { label: 'Blogs',          icon: BookOpen,         key: 'blogs'           },
//   { label: 'Analytics',      icon: BarChart2,        key: 'analytics'       },
//   { label: 'Discount Codes', icon: Settings,         key: 'discount-codes'  },
//   { label: 'Settings',       icon: Settings,         key: 'settings'        },
// ];

// /* ─── Global CSS ────────────────────────────────────────────────────── */
// const globalCss = `
//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//   body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }

//   @keyframes spin    { to { transform: rotate(360deg); } }
//   @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
//   @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }

//   ::-webkit-scrollbar { width: 4px; height: 4px; }
//   ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
//   ::-webkit-scrollbar-track { background: transparent; }

//   .nav-btn { transition: background 0.14s; }
//   .nav-btn:hover { background: rgba(255,255,255,0.07) !important; }

//   .hdr-desktop { display: flex; }
//   .hdr-mobile  { display: none; }

//   .table-wrap {
//     background: #FFFFFF;
//     border-radius: 20px;
//     border: 1px solid #E9E9EA;
//     box-shadow: 0 1px 4px rgba(0,0,0,0.05);
//     overflow: hidden;
//   }

//   /* Desktop: no scroll */
//   .table-scroll { overflow-x: visible; }

//   @media (max-width: 600px) {
//     .hdr-desktop { display: none !important; }
//     .hdr-mobile  { display: flex !important; }
//     .main-wrap   { padding-top: 60px !important; }
//     .main-inner  { padding: 16px 12px !important; }
//     .page-h1     { font-size: 22px !important; }

//     .filter-grid    { grid-template-columns: 1fr 1fr !important; }
//     .header-actions { flex-direction: row !important; align-items: center !important; }
//     .search-wrap    { flex: 1 !important; }
// .search-input   { width: 100% !important; box-sizing: border-box !important; }

//     /* Mobile: horizontal scroll */
//     .table-wrap  { border-radius: 16px; overflow: hidden; }
//     .table-scroll {
//       overflow-x: auto !important;
//       -webkit-overflow-scrolling: touch;
//     }
//     .table-scroll table { min-width: 860px !important; table-layout: auto !important; }
//   }

//   @media (max-width: 400px) {
//     .filter-grid { grid-template-columns: 1fr !important; }
//   }
// `;

// /* ─── Sidebar ───────────────────────────────────────────────────────── */
// const Sidebar = ({ open, onClose, active, onNav, onLogout }) => {
//   if (!open) return null;
//   return (
//     <>
//       <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:98, background:'rgba(0,0,0,0.5)', animation:'fadeIn 0.18s ease' }} />
//       <aside style={{ position:'fixed', top:0, left:0, bottom:0, width:SIDEBAR_W, background:C.sidebar, display:'flex', flexDirection:'column', zIndex:99, animation:'slideIn 0.22s ease', boxShadow:'6px 0 28px rgba(0,0,0,0.28)' }}>
//         <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 18px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
//           <div>
//             <span style={{ color:C.white, fontWeight:900, fontSize:16, letterSpacing:'0.05em' }}>ACQAR </span>
//             <span style={{ color:C.copper, fontWeight:900, fontSize:16, letterSpacing:'0.05em' }}>ADMIN</span>
//           </div>
//           <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', width:28, height:28, borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.sidebarText }}>
//             <X size={14} />
//           </button>
//         </div>
//         <nav style={{ flex:1, padding:'10px', overflowY:'auto' }}>
//           {navItems.map(({ label, icon: Icon, key }) => {
//             const on = active === key;
//             return (
//               <button key={key} className="nav-btn" onClick={() => { onNav(key); onClose(); }} style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'11px 14px', borderRadius:10, border:'none', background: on ? C.activeNav : 'transparent', color: on ? C.activeText : C.sidebarText, cursor:'pointer', marginBottom:2, fontSize:13.5, fontWeight: on ? 700 : 400, textAlign:'left' }}>
//                 <Icon size={17} strokeWidth={on ? 2.2 : 1.7} />
//                 {label}
//               </button>
//             );
//           })}
//         </nav>
//         <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
//           <button className="nav-btn" onClick={onLogout} style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'11px 14px', borderRadius:10, border:'none', background:'transparent', color:C.sidebarText, cursor:'pointer', fontSize:13.5, fontWeight:400, textAlign:'left' }}>
//             <LogOut size={17} strokeWidth={1.7} />
//             Logout
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// };

// /* ─── Desktop Header ────────────────────────────────────────────────── */
// const DesktopHeader = ({ onHamburger }) => (
//   <header className="hdr-desktop" style={{ position:'fixed', top:0, left:0, right:0, height:60, background:C.white, borderBottom:`1px solid ${C.border}`, alignItems:'center', justifyContent:'space-between', padding:'0 22px', zIndex:90, gap:12 }}>
//     <div style={{ display:'flex', alignItems:'center', gap:14, flex:1, minWidth:0 }}>
//       <button onClick={onHamburger} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:C.muted, padding:4 }}>
//         <Menu size={22} strokeWidth={1.8} />
//       </button>
//       <div style={{ display:'flex', alignItems:'center', gap:8, background:'#F3F3F4', borderRadius:22, padding:'8px 16px', maxWidth:360, width:'100%', border:`1px solid ${C.border}` }}>
//         <Search size={14} color={C.muted} strokeWidth={2} style={{ flexShrink:0 }} />
//         <span style={{ fontSize:13, color:C.muted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Search reports, users, or articles...</span>
//       </div>
//     </div>
//     <div style={{ display:'flex', alignItems:'center', gap:20, flexShrink:0 }}>
//       <div style={{ position:'relative', cursor:'pointer', display:'flex' }}>
//         <Bell size={20} color={C.muted} strokeWidth={1.8} />
//         <span style={{ position:'absolute', top:-2, right:-2, width:7, height:7, borderRadius:'50%', background:C.copper, border:`2px solid ${C.white}` }} />
//       </div>
//       <div style={{ display:'flex', alignItems:'center', gap:10 }}>
//         <div style={{ textAlign:'right' }}>
//           <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Admin User</div>
//           <div style={{ fontSize:9, fontWeight:700, color:C.muted, letterSpacing:'0.1em', textTransform:'uppercase' }}>Super Admin</div>
//         </div>
//         <div style={{ width:36, height:36, borderRadius:'50%', background:'#F5EBE0', border:`2px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
//           <User size={17} color={C.copper} strokeWidth={1.8} />
//         </div>
//       </div>
//     </div>
//   </header>
// );

// /* ─── Mobile Header ─────────────────────────────────────────────────── */
// const MobileHeader = ({ onHamburger }) => (
//   <header className="hdr-mobile" style={{ position:'fixed', top:0, left:0, right:0, height:60, background:C.sidebar, alignItems:'center', justifyContent:'space-between', padding:'0 18px', zIndex:90 }}>
//     <div>
//       <span style={{ color:C.white, fontWeight:900, fontSize:16, letterSpacing:'0.05em' }}>ACQAR </span>
//       <span style={{ color:C.copper, fontWeight:900, fontSize:16, letterSpacing:'0.05em' }}>ADMIN</span>
//     </div>
//     <button onClick={onHamburger} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:C.white, padding:4 }}>
//       <Menu size={24} strokeWidth={2} />
//     </button>
//   </header>
// );

// /* ─── Role badge ────────────────────────────────────────────────────── */
// const roleBadge = () => ({ bg:'#F3F3F4', color:'#6B6B6B' });

// /* ─── Main Screen ───────────────────────────────────────────────────── */
// const AdminUsersScreen = () => {
//   const navigate     = useNavigate();
//   const handleLogout = useLogout();

//   const [users,        setUsers]        = useState([]);
//   const [reportCounts, setReportCounts] = useState({});
//   const [loading,      setLoading]      = useState(true);
//   const [searchTerm,   setSearchTerm]   = useState('');
//   const [showFilters,  setShowFilters]  = useState(false);
//   const [filters,      setFilters]      = useState({ role:'', registrationType:'', accountType:'', status:'' });
//   const [sideOpen,     setSideOpen]     = useState(false);
//   const [activeNav,    setActiveNav]    = useState('users');

//   useEffect(() => {
//     fetchAll();
//     const channel = supabase
//       .channel('users-changes')
//       .on('postgres_changes', { event:'*', schema:'public', table:'users' },      fetchAll)
//       .on('postgres_changes', { event:'*', schema:'public', table:'valuations' }, fetchAll)
//       .subscribe();
//     return () => supabase.removeChannel(channel);
//   }, []);

//   useEffect(() => {
//     const esc = (e) => { if (e.key === 'Escape') setSideOpen(false); };
//     window.addEventListener('keydown', esc);
//     return () => window.removeEventListener('keydown', esc);
//   }, []);

//   const fetchAll = async () => {
//     try {
//     //   const data = await adminService.getUsers();
//     //   setUsers(data);

//     const data = await adminService.getUsers();

// // Fetch auth users to check active sessions
// const { data: authData } = await supabase.auth.admin
//   ? { data: null }
//   : { data: null };

// // Enrich each user with real type and status from DB
// const enriched = (data || []).map(u => ({
//   ...u,
//   account_type: u.account_type || u.accountType || 'Free',
//   status: u.status || (u.deleted_at ? 'inactive' : 'active'),
// }));
// setUsers(enriched);

//       const { data: vals, error: vErr } = await supabase
//         .from('valuations')
//         .select('name');

//       if (!vErr) {
//         const counts = {};
//         (vals || []).forEach(v => {
//           const key = (v.name || '').toLowerCase().trim();
//           if (key) counts[key] = (counts[key] || 0) + 1;
//         });
//         setReportCounts(counts);
//       } else {
//         console.error('Valuations fetch error:', vErr.message);
//       }
//     } catch (err) {
//       console.error('Error fetching data:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getReportCount = (user) => {
//     const key = (user.name || '').toLowerCase().trim();
//     return reportCounts[key] || 0;
//   };

//   const handleStatusToggle = async (user) => {
//     const newStatus = user.status === 'active' ? 'inactive' : 'active';
//     try {
//       await adminService.updateUserStatus(user.id, newStatus);
//       setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
//     } catch (err) {
//       console.error('Error updating status:', err);
//     }
//   };

//   const handleDelete = async (userId) => {
//     if (!window.confirm('Are you sure you want to delete this user?')) return;
//     try {
//       await adminService.deleteUser(userId);
//       setUsers(prev => prev.filter(u => u.id !== userId));
//     } catch (err) {
//       console.error('Error deleting user:', err);
//     }
//   };

//  const handleNav = (key) => {
//   setActiveNav(key);
//   if (key === 'overview') navigate('/admin-dashboard');
//   else if (key !== 'users') navigate(`/admin/${key}`);
// };

//   const filteredUsers = users.filter(user => {
//     if ((user.name || '').toLowerCase().trim() === 'admin') return false;
//     const term = searchTerm.toLowerCase();
//     const matchesSearch =
//       String(user.id).toLowerCase().includes(term) ||
//       (user.name  || '').toLowerCase().includes(term) ||
//       (user.email || '').toLowerCase().includes(term) ||
//       (user.phone || '').toLowerCase().includes(term);

//     const userRole     = user.role || user.type || '';
//     const userProvider = user.provider || user.registration_type || user.registrationType || '';
//     const userAccType  = user.account_type || user.accountType || '';

//     const matchesRole        = !filters.role             || userRole     === filters.role;
//     const matchesRegType     = !filters.registrationType || userProvider === filters.registrationType;
//     const matchesAccountType = !filters.accountType      || userAccType  === filters.accountType;
//     const matchesStatus      = !filters.status           || user.status  === filters.status;

//     return matchesSearch && matchesRole && matchesRegType && matchesAccountType && matchesStatus;
//   });

// //   const TABLE_COLS = ['ID','Fullname','Email & Phone','Role','Join Date','Reg. Type','Reports','Type','Status','Actions'];
// const TABLE_COLS = ['ID','Fullname','Email & Phone','Role','Join Date','Reg. Type','Reports','Type','Status','Discount Code'];

//   return (
//     <div style={{ background:C.bg, minHeight:'100vh' }}>
//       <Helmet>
//   <title>Admin | Acqar</title>
//   <meta name="robots" content="noindex, nofollow" />
// </Helmet>
//       <style>{globalCss}</style>

//       <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} active={activeNav} onNav={handleNav} onLogout={handleLogout} />
//       <DesktopHeader onHamburger={() => setSideOpen(true)} />
//       <MobileHeader  onHamburger={() => setSideOpen(true)} />

//       <main className="main-wrap" style={{ paddingTop:60 }}>
//         <div className="main-inner" style={{ padding:'26px 22px', maxWidth:1180, margin:'0 auto' }}>

//           {/* Title + search */}
//           <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:22 }}>
//             <div>
//               <h1 className="page-h1" style={{ fontSize:28, fontWeight:900, color:C.text, letterSpacing:'-0.7px' }}>User Management</h1>
//               <p style={{ fontSize:14, color:C.muted, marginTop:5 }}>Manage your platform users and their access levels.</p>
//             </div>

//             <div className="header-actions" style={{ display:'flex', alignItems:'center', gap:10 }}>
//               <div className="search-wrap" style={{ position:'relative' }}>
//                 <Search size={14} color={C.muted} strokeWidth={2} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
//                 <input
//                   className="search-input"
//                   type="text"
//                   placeholder="Search ID, Name, Email, Phone..."
//                   value={searchTerm}
//                   onChange={e => setSearchTerm(e.target.value)}
//                   style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:22, paddingLeft:38, paddingRight:16, paddingTop:10, paddingBottom:10, fontSize:13, color:C.text, outline:'none', width:300, fontFamily:'inherit' }}
//                 />
//               </div>
//               <button
//                 onClick={() => setShowFilters(!showFilters)}
//                 style={{ padding:'10px 14px', borderRadius:22, border:`1px solid ${C.border}`, background: showFilters ? C.copper : C.white, color: showFilters ? C.white : C.muted, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, transition:'all 0.14s', whiteSpace:'nowrap' }}
//               >
//                 <Filter size={15} />
//                 <span>Filter</span>
//               </button>
//             </div>
//           </div>

//           {/* Filter panel */}
//           {showFilters && (
//             <div className="filter-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, background:C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:'20px', marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
//               {[
//                 { label:'Role',              key:'role',             options:['Investor','Buyer','Seller','Agent'] },
//                 { label:'Registration Type', key:'registrationType', options:['email','google','Email','Gmail'] },
//                 { label:'Account Type',      key:'accountType',      options:['Free','Paid'] },
//                 { label:'Status',            key:'status',           options:['active','inactive'] },
//               ].map(f => (
//                 <div key={f.key}>
//                   <label style={{ display:'block', fontSize:9.5, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.13em', marginBottom:6 }}>{f.label}</label>
//                   <select
//                     value={filters[f.key]}
//                     onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}
//                     style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', fontSize:13, fontWeight:600, color:C.text, outline:'none', fontFamily:'inherit', cursor:'pointer' }}
//                   >
//                     <option value="">All</option>
//                     {f.options.map(o => <option key={o} value={o}>{o}</option>)}
//                   </select>
//                 </div>
//               ))}
//             </div>
//           )}

//           {loading ? (
//             <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:200 }}>
//               <div style={{ width:30, height:30, borderRadius:'50%', border:`3px solid ${C.copper}`, borderTopColor:'transparent', animation:'spin 0.75s linear infinite' }} />
//             </div>
//           ) : (
//             <div className="table-wrap">
//               <div className="table-scroll">
//                 {/* Desktop: fixed layout, no scroll. Mobile: auto layout + min-width via CSS */}
//                 <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
//                   <colgroup>
//                     <col style={{ width:'14%' }} /> {/* ID */}
//                     <col style={{ width:'13%' }} /> {/* Fullname */}
//                     <col style={{ width:'18%' }} /> {/* Email & Phone */}
//                     <col style={{ width:'9%'  }} /> {/* Role */}
//                     <col style={{ width:'10%' }} /> {/* Join Date */}
//                     <col style={{ width:'9%'  }} /> {/* Reg. Type */}
//                     <col style={{ width:'7%'  }} /> {/* Reports */}
//                     <col style={{ width:'9%'  }} /> {/* Type */}
//                     <col style={{ width:'9%'  }} /> {/* Status */}
//                     <col style={{ width:'9%'  }} /> {/* Discount Code */}
                    
//                   </colgroup>
//                   <thead>
//                     <tr style={{ background:C.bg, borderBottom:`1px solid ${C.border}` }}>
//                       {TABLE_COLS.map(h => (
//                         <th key={h} style={{
//                           padding:'13px 12px',
//                           textAlign: h === 'Actions' ? 'right' : 'left',
//                           fontSize:9.5, fontWeight:700, color:C.muted,
//                           textTransform:'uppercase', letterSpacing:'0.12em',
//                           overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis',
//                         }}>
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredUsers.length === 0 ? (
//                       <tr>
//                         <td colSpan={TABLE_COLS.length} style={{ textAlign:'center', padding:'48px 0', color:C.muted, fontSize:14, fontWeight:600 }}>
//                           No users found.
//                         </td>
//                       </tr>
//                     ) : filteredUsers.map((user, idx) => {
//                       const role        = user.role || user.type || '—';
//                       const provider    = user.provider || user.registration_type || user.registrationType || '—';
//                       const accountType = user.account_type || user.accountType || 'Free';
// const isPaid      = ['paid','premium','subscription'].includes(accountType.toLowerCase());
// const isActive    = !user.deleted_at && user.status !== 'inactive';
//                       const isGmail     = ['gmail','google'].includes((provider || '').toLowerCase());
//                       const rb          = roleBadge(role);
//                       const reportCount = getReportCount(user);
//                       const joinDate    = user.join_date || user.joinDate || user.created_at?.slice(0,10) || '—';

//                       // Show short ID: if UUID show first 8 chars, else pad number
//                       const displayId = String(user.id).includes('-')
//                         ? '#' + String(user.id).slice(0, 8)
//                         : '#' + String(user.id).padStart(3, '0');

//                       return (
//                         <tr
//                           key={user.id}
//                           style={{ borderBottom: idx < filteredUsers.length-1 ? `1px solid ${C.border}` : 'none', transition:'background 0.1s' }}
//                           onMouseEnter={e => e.currentTarget.style.background = C.bg}
//                           onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
//                         >
//                           {/* ID */}
//                           <td style={{ padding:'13px 12px', overflow:'hidden' }}>
//                             <span
//   style={{ fontSize:10, fontWeight:800, color:C.muted, display:'block', wordBreak:'break-all' }}
// >
//   {displayId}
// </span>
//                           </td>

//                           {/* Fullname */}
//                           <td style={{ padding:'13px 12px', overflow:'hidden' }}>
//                             <div style={{ display:'flex', alignItems:'center', gap:8, overflow:'hidden' }}>
//                               {/* <div style={{ width:30, height:30, borderRadius:8, background:'#FEF3E7', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:C.copper, fontSize:12, flexShrink:0 }}>
//                                 {(user.name || '?').charAt(0).toUpperCase()}
//                               </div> */}
//                               <span style={{ fontWeight:700, fontSize:13, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
//                                 {user.name}
//                               </span>
//                             </div>
//                           </td>

//                           {/* Email & Phone */}
//                           <td style={{ padding:'13px 12px', overflow:'hidden' }}>
//                             <div style={{ fontSize:12, fontWeight:600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
//                             <div style={{ fontSize:11, color:C.muted, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.phone || '—'}</div>
//                           </td>

//                           {/* Role */}
//                           <td style={{ padding:'13px 12px', overflow:'hidden' }}>
//                             <span style={{ padding:'2px 8px', borderRadius:6, fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', background:rb.bg, color:rb.color, display:'inline-block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }}>
//                               {role}
//                             </span>
//                           </td>

//                           {/* Join Date */}
//                           <td style={{ padding:'13px 12px', fontSize:11, color:C.muted, fontWeight:500, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
//                             {joinDate}
//                           </td>

//                           {/* Reg. Type */}
//                           <td style={{ padding:'13px 12px', overflow:'hidden' }}>
//                             <span style={{ fontSize:11, fontWeight:800, color:'#6B6B6B', textTransform:'uppercase', display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
//   {provider}
// </span>
//                           </td>

//                           {/* Reports */}
//                           <td style={{ padding:'13px 12px' }}>
//                             <span style={{ fontSize:14, fontWeight:900, color:C.text }}>{reportCount}</span>
//                           </td>

//                           {/* Account Type */}
//                           <td style={{ padding:'13px 12px', overflow:'hidden' }}>
//                             <span style={{ padding:'2px 8px', borderRadius:6, fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em', background: isPaid ? '#D1FAE5' : '#F3F3F4', color: isPaid ? '#059669' : C.muted, border:`1px solid ${isPaid ? '#A7F3D0' : C.border}`, display:'inline-block', whiteSpace:'nowrap' }}>
//                               {accountType}
//                             </span>
//                           </td>

//                        {/* Status */}
//                           <td style={{ padding:'13px 12px', overflow:'hidden' }}>
//                             <div style={{ display:'flex', alignItems:'center', gap:5 }}>
//                               <span style={{ width:6, height:6, borderRadius:'50%', background: isActive ? C.emerald : '#EF4444', display:'inline-block', flexShrink:0 }} />
//                               <span style={{ fontSize:12, fontWeight:700, color:C.text, textTransform:'capitalize', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
//                                 {user.status}
//                               </span>
//                             </div>
//                           </td>

//                           {/* Discount Code */}
//                           <td style={{ padding:'13px 12px', overflow:'hidden' }}>
//                             {user.discount_code_used ? (
//                               <span style={{
//                                 padding:'2px 8px', borderRadius:6,
//                                 fontSize:9, fontWeight:800,
//                                 textTransform:'uppercase', letterSpacing:'0.06em',
//                                 background:'#FFF7ED', color:'#C8832A',
//                                 border:'1px solid #F5C89A',
//                                 display:'inline-block', whiteSpace:'nowrap'
//                               }}>
//                                 {user.discount_code_used}
//                               </span>
//                             ) : (
//                               <span style={{ fontSize:11, color:C.muted }}>—</span>
//                             )}
//                           </td>

//                           {/* Actions */}
//                           {/* <td style={{ padding:'13px 12px', textAlign:'right' }}>
//                             <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:3 }}>
//                               <button
//                                 onClick={() => window.location.href=`mailto:${user.email}`}
//                                 style={{ padding:'5px', borderRadius:6, border:`1px solid ${C.border}`, background:C.white, cursor:'pointer', display:'flex', color:C.muted, flexShrink:0 }}
//                                 title="Send Email"
//                               >
//                                 <Mail size={13} />
//                               </button>
//                               <button
//                                 onClick={() => handleStatusToggle(user)}
//                                 style={{ padding:'5px', borderRadius:6, border:`1px solid ${C.border}`, background:C.white, cursor:'pointer', display:'flex', color:C.muted, flexShrink:0 }}
//                                 title={isActive ? 'Deactivate' : 'Activate'}
//                               >
//                                 {isActive ? <UserX size={13} /> : <UserCheck size={13} />}
//                               </button>
//                               <button
//                                 onClick={() => handleDelete(user.id)}
//                                 style={{ padding:'5px', borderRadius:6, border:'1px solid #FECACA', background:'#FFF5F5', cursor:'pointer', display:'flex', color:'#EF4444', flexShrink:0 }}
//                                 title="Delete"
//                               >
//                                 <Trash2 size={13} />
//                               </button>
//                             </div>
//                           </td> */}
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default AdminUsersScreen;














// screens/AdminUsersScreen.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { adminService } from '../services/adminService';
import { useLogout } from '../hooks/useLogout';
import {
  Search, Filter, Mail, UserCheck, UserX, Trash2,
  Users, LayoutDashboard, Home, MessageSquare, BookOpen,
  BarChart2, Settings, LogOut, Bell, User, Menu, X,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

/* ─── Tokens ────────────────────────────────────────────────────────── */
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
  emerald:     '#10B981',
  amber:       '#F59E0B',
};

const SIDEBAR_W = 260;

const navItems = [
  { label: 'Overview',       icon: LayoutDashboard, key: 'overview'        },
  { label: 'Users',          icon: Users,            key: 'users'           },
  { label: 'Valuations',     icon: Home,             key: 'valuations'      },
  { label: 'Feedback',       icon: MessageSquare,    key: 'feedback'        },
  { label: 'Blogs',          icon: BookOpen,         key: 'blogs'           },
  { label: 'Analytics',      icon: BarChart2,        key: 'analytics'       },
  { label: 'Discount Codes', icon: CreditCard,         key: 'discount-codes'  },
  { label: 'Settings',       icon: Settings,         key: 'settings'        },
];

/* ─── Global CSS ────────────────────────────────────────────────────── */
const globalCss = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }

  .nav-btn { transition: background 0.14s; }
  .nav-btn:hover { background: rgba(255,255,255,0.07) !important; }

  .hdr-desktop { display: flex; }
  .hdr-mobile  { display: none; }

  .table-wrap {
    background: #FFFFFF;
    border-radius: 20px;
    border: 1px solid #E9E9EA;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    overflow: hidden;
  }

  /* Desktop: no scroll */
  .table-scroll { overflow-x: visible; }

  @media (max-width: 600px) {
    .hdr-desktop { display: none !important; }
    .hdr-mobile  { display: flex !important; }
    .main-wrap   { padding-top: 60px !important; }
    .main-inner  { padding: 16px 12px !important; }
    .page-h1     { font-size: 22px !important; }

    .filter-grid    { grid-template-columns: 1fr 1fr !important; }
    .header-actions { flex-direction: row !important; align-items: center !important; }
    .search-wrap    { flex: 1 !important; }
.search-input   { width: 100% !important; box-sizing: border-box !important; }

    /* Mobile: horizontal scroll */
    .table-wrap  { border-radius: 16px; overflow: hidden; }
    .table-scroll {
      overflow-x: auto !important;
      -webkit-overflow-scrolling: touch;
    }
    .table-scroll table { min-width: 860px !important; table-layout: auto !important; }
  }

  @media (max-width: 400px) {
    .filter-grid { grid-template-columns: 1fr !important; }
  }
`;

/* ─── Sidebar ───────────────────────────────────────────────────────── */
const Sidebar = ({ open, onClose, active, onNav, onLogout }) => {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:98, background:'rgba(0,0,0,0.5)', animation:'fadeIn 0.18s ease' }} />
      <aside style={{ position:'fixed', top:0, left:0, bottom:0, width:SIDEBAR_W, background:C.sidebar, display:'flex', flexDirection:'column', zIndex:99, animation:'slideIn 0.22s ease', boxShadow:'6px 0 28px rgba(0,0,0,0.28)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 18px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
          <div>
            <span style={{ color:C.white, fontWeight:900, fontSize:16, letterSpacing:'0.05em' }}>ACQAR </span>
            <span style={{ color:C.copper, fontWeight:900, fontSize:16, letterSpacing:'0.05em' }}>ADMIN</span>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', width:28, height:28, borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.sidebarText }}>
            <X size={14} />
          </button>
        </div>
        <nav style={{ flex:1, padding:'10px', overflowY:'auto' }}>
          {navItems.map(({ label, icon: Icon, key }) => {
            const on = active === key;
            return (
              <button key={key} className="nav-btn" onClick={() => { onNav(key); onClose(); }} style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'11px 14px', borderRadius:10, border:'none', background: on ? C.activeNav : 'transparent', color: on ? C.activeText : C.sidebarText, cursor:'pointer', marginBottom:2, fontSize:13.5, fontWeight: on ? 700 : 400, textAlign:'left' }}>
                <Icon size={17} strokeWidth={on ? 2.2 : 1.7} />
                {label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
          <button className="nav-btn" onClick={onLogout} style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'11px 14px', borderRadius:10, border:'none', background:'transparent', color:C.sidebarText, cursor:'pointer', fontSize:13.5, fontWeight:400, textAlign:'left' }}>
            <LogOut size={17} strokeWidth={1.7} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

/* ─── Desktop Header ────────────────────────────────────────────────── */
const DesktopHeader = ({ onHamburger }) => (
  <header className="hdr-desktop" style={{ position:'fixed', top:0, left:0, right:0, height:60, background:C.white, borderBottom:`1px solid ${C.border}`, alignItems:'center', justifyContent:'space-between', padding:'0 22px', zIndex:90, gap:12 }}>
    <div style={{ display:'flex', alignItems:'center', gap:14, flex:1, minWidth:0 }}>
      <button onClick={onHamburger} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:C.muted, padding:4 }}>
        <Menu size={22} strokeWidth={1.8} />
      </button>
      <div style={{ display:'flex', alignItems:'center', gap:8, background:'#F3F3F4', borderRadius:22, padding:'8px 16px', maxWidth:360, width:'100%', border:`1px solid ${C.border}` }}>
        <Search size={14} color={C.muted} strokeWidth={2} style={{ flexShrink:0 }} />
        <span style={{ fontSize:13, color:C.muted, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>Search reports, users, or articles...</span>
      </div>
    </div>
    <div style={{ display:'flex', alignItems:'center', gap:20, flexShrink:0 }}>
      <div style={{ position:'relative', cursor:'pointer', display:'flex' }}>
        <Bell size={20} color={C.muted} strokeWidth={1.8} />
        <span style={{ position:'absolute', top:-2, right:-2, width:7, height:7, borderRadius:'50%', background:C.copper, border:`2px solid ${C.white}` }} />
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Admin User</div>
          <div style={{ fontSize:9, fontWeight:700, color:C.muted, letterSpacing:'0.1em', textTransform:'uppercase' }}>Super Admin</div>
        </div>
        <div style={{ width:36, height:36, borderRadius:'50%', background:'#F5EBE0', border:`2px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <User size={17} color={C.copper} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  </header>
);

/* ─── Mobile Header ─────────────────────────────────────────────────── */
const MobileHeader = ({ onHamburger }) => (
  <header className="hdr-mobile" style={{ position:'fixed', top:0, left:0, right:0, height:60, background:C.sidebar, alignItems:'center', justifyContent:'space-between', padding:'0 18px', zIndex:90 }}>
    <div>
      <span style={{ color:C.white, fontWeight:900, fontSize:16, letterSpacing:'0.05em' }}>ACQAR </span>
      <span style={{ color:C.copper, fontWeight:900, fontSize:16, letterSpacing:'0.05em' }}>ADMIN</span>
    </div>
    <button onClick={onHamburger} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:C.white, padding:4 }}>
      <Menu size={24} strokeWidth={2} />
    </button>
  </header>
);

/* ─── Role badge ────────────────────────────────────────────────────── */
const roleBadge = () => ({ bg:'#F3F3F4', color:'#6B6B6B' });

/* ─── Main Screen ───────────────────────────────────────────────────── */
const AdminUsersScreen = () => {
  const navigate     = useNavigate();
  const handleLogout = useLogout();

  const [users,        setUsers]        = useState([]);
  const [reportCounts, setReportCounts] = useState({});
  const [loading,      setLoading]      = useState(true);
  const [searchTerm,   setSearchTerm]   = useState('');
  const [showFilters,  setShowFilters]  = useState(false);
  const [filters, setFilters] = useState({ role:'', registrationType:'', accountType:'', status:'', plan:'', discountCode:'', discountCodeSearch:'' });
  const [sideOpen,     setSideOpen]     = useState(false);
  const [activeNav,    setActiveNav]    = useState('users');

  useEffect(() => {
    fetchAll();
    const channel = supabase
      .channel('users-changes')
      .on('postgres_changes', { event:'*', schema:'public', table:'users' },      fetchAll)
      .on('postgres_changes', { event:'*', schema:'public', table:'valuations' }, fetchAll)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') setSideOpen(false); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  const fetchAll = async () => {
    try {
    //   const data = await adminService.getUsers();
    //   setUsers(data);

    const data = await adminService.getUsers();

// Fetch auth users to check active sessions
const { data: authData } = await supabase.auth.admin
  ? { data: null }
  : { data: null };

// Enrich each user with real type and status from DB
// Fetch discount code percentages
const { data: discountCodes } = await supabase
  .from('discount_codes')
  .select('code, discount_percentage');

const discountMap = {};
(discountCodes || []).forEach(d => {
  discountMap[d.code] = d.discount_percentage;
});

const enriched = (data || []).map(u => ({
  ...u,
  account_type: u.account_type || u.accountType || 'Free',
  status: u.status || (u.deleted_at ? 'inactive' : 'active'),
  discount_percentage: u.discount_code_used ? (discountMap[u.discount_code_used] || 100) : null,
}));
setUsers(enriched);

      const { data: vals, error: vErr } = await supabase
        .from('valuations')
        .select('name');

      if (!vErr) {
        const counts = {};
        (vals || []).forEach(v => {
          const key = (v.name || '').toLowerCase().trim();
          if (key) counts[key] = (counts[key] || 0) + 1;
        });
        setReportCounts(counts);
      } else {
        console.error('Valuations fetch error:', vErr.message);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getReportCount = (user) => {
    const key = (user.name || '').toLowerCase().trim();
    return reportCounts[key] || 0;
  };

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await adminService.updateUserStatus(user.id, newStatus);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminService.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

 const handleNav = (key) => {
  setActiveNav(key);
  if (key === 'overview') navigate('/admin-dashboard');
  else if (key !== 'users') navigate(`/admin/${key}`);
};

  const filteredUsers = users.filter(user => {
    if ((user.name || '').toLowerCase().trim() === 'admin') return false;
    const term = searchTerm.toLowerCase();
    const userPlanNorm = (user.plan || user.account_type || '').toLowerCase().trim();
const userCodeNorm = (user.discount_code_used || '').toLowerCase().trim();

// Special keywords that should only match plan or code — not email/name
const planKeywords = ['pro', 'free'];
const isPlanSearch = planKeywords.includes(term);

const matchesSearch = !term || (
  isPlanSearch
    ? userPlanNorm === term || userCodeNorm.includes(term)
    : (
        String(user.id).toLowerCase().includes(term) ||
        (user.name  || '').toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term) ||
        (user.phone || '').toLowerCase().includes(term) ||
        userCodeNorm.includes(term)
      )
);

    const userRole     = user.role || user.type || '';
    const userProvider = user.provider || user.registration_type || user.registrationType || '';
    const userAccType  = user.account_type || user.accountType || '';

    const matchesRole        = !filters.role             || userRole     === filters.role;
const matchesRegType     = !filters.registrationType || userProvider === filters.registrationType;
const matchesAccountType = !filters.accountType      || userAccType  === filters.accountType;
const matchesStatus      = !filters.status           || user.status  === filters.status;
const userPlan = (user.plan || user.account_type || 'free').toLowerCase().trim();
const matchesPlan = !filters.plan || userPlan === filters.plan.toLowerCase();
const userCode = user.discount_code_used;
const hasCode = userCode !== null && userCode !== undefined && userCode !== '';
const matchesDiscountCode = !filters.discountCode || (filters.discountCode === 'has_code' ? hasCode : !hasCode);
const matchesDiscountCodeSearch = !filters.discountCodeSearch || (user.discount_code_used || '').toLowerCase().includes(filters.discountCodeSearch.toLowerCase());

return matchesSearch && matchesRole && matchesRegType && matchesAccountType && matchesStatus && matchesPlan && matchesDiscountCode && matchesDiscountCodeSearch;
  });

//   const TABLE_COLS = ['ID','Fullname','Email & Phone','Role','Join Date','Reg. Type','Reports','Type','Status','Actions'];
const TABLE_COLS = ['ID','Fullname','Email & Phone','Role','Join Date','Reg. Type','Reports','Type','Status','Disc.Code','Disc.%'];

  return (
    <div style={{ background:C.bg, minHeight:'100vh' }}>
      <Helmet>
  <title>Admin | Acqar</title>
  <meta name="robots" content="noindex, nofollow" />
</Helmet>
      <style>{globalCss}</style>

      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} active={activeNav} onNav={handleNav} onLogout={handleLogout} />
      <DesktopHeader onHamburger={() => setSideOpen(true)} />
      <MobileHeader  onHamburger={() => setSideOpen(true)} />

      <main className="main-wrap" style={{ paddingTop:60 }}>
        <div className="main-inner" style={{ padding:'26px 22px', maxWidth:1180, margin:'0 auto' }}>

          {/* Title + search */}
          <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-start', justifyContent:'space-between', gap:16, marginBottom:22 }}>
            <div>
              <h1 className="page-h1" style={{ fontSize:28, fontWeight:900, color:C.text, letterSpacing:'-0.7px' }}>User Management</h1>
              <p style={{ fontSize:14, color:C.muted, marginTop:5 }}>Manage your platform users and their access levels.</p>
            </div>

            <div className="header-actions" style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div className="search-wrap" style={{ position:'relative' }}>
                <Search size={14} color={C.muted} strokeWidth={2} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search ID, Name, Email, Phone..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:22, paddingLeft:38, paddingRight:16, paddingTop:10, paddingBottom:10, fontSize:13, color:C.text, outline:'none', width:300, fontFamily:'inherit' }}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{ padding:'10px 14px', borderRadius:22, border:`1px solid ${C.border}`, background: showFilters ? C.copper : C.white, color: showFilters ? C.white : C.muted, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600, transition:'all 0.14s', whiteSpace:'nowrap' }}
              >
                <Filter size={15} />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="filter-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, background:C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:'20px', marginBottom:16, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
             {[
  { label:'Role',              key:'role',             options:['Investor','Buyer','Seller','Agent'] },
{ label:'Registration Type', key:'registrationType', options:['email','google','Email','Gmail'] },
{ label:'Plan',              key:'plan',             options:['free','pro'] },
{ label:'Has Discount Code', key:'discountCode', options:[{ label:'Has Code', value:'has_code' }, { label:'No Code', value:'no_code' }], isCustom: true },
{ label:'Search By Code', key:'discountCodeSearch', isText: true },
].map(f => (
                <div key={f.key}>
                  <label style={{ display:'block', fontSize:9.5, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.13em', marginBottom:6 }}>{f.label}</label>
                  {f.isText ? (
  <input
    type="text"
    placeholder="e.g. CABEELA"
    value={filters[f.key]}
    onChange={e => setFilters({ ...filters, [f.key]: e.target.value.toUpperCase() })}
    style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', fontSize:13, fontWeight:600, color:C.text, outline:'none', fontFamily:'inherit' }}
  />
) : (
  <select
    value={filters[f.key]}
    onChange={e => setFilters({ ...filters, [f.key]: e.target.value })}
    style={{ width:'100%', background:C.bg, border:`1px solid ${C.border}`, borderRadius:10, padding:'8px 12px', fontSize:13, fontWeight:600, color:C.text, outline:'none', fontFamily:'inherit', cursor:'pointer' }}
  >
    <option value="">All</option>
    {f.isCustom
      ? f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)
      : f.options.map(o => <option key={o} value={o}>{o}</option>)
    }
  </select>
)}
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:200 }}>
              <div style={{ width:30, height:30, borderRadius:'50%', border:`3px solid ${C.copper}`, borderTopColor:'transparent', animation:'spin 0.75s linear infinite' }} />
            </div>
          ) : (
            <div className="table-wrap">
              <div className="table-scroll">
                {/* Desktop: fixed layout, no scroll. Mobile: auto layout + min-width via CSS */}
                <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
                  <colgroup>
  <col style={{ width:'10%' }} /> {/* ID */}
  <col style={{ width:'11%' }} /> {/* Fullname */}
  <col style={{ width:'16%' }} /> {/* Email & Phone */}
  <col style={{ width:'8%'  }} /> {/* Role */}
  <col style={{ width:'9%'  }} /> {/* Join Date */}
  <col style={{ width:'7%'  }} /> {/* Reg. Type */}
  <col style={{ width:'5%'  }} /> {/* Reports */}
  <col style={{ width:'7%'  }} /> {/* Type */}
  <col style={{ width:'7%'  }} /> {/* Status */}
  <col style={{ width:'10%' }} /> {/* Code */}
  <col style={{ width:'6%'  }} /> {/* Disc.% */}
</colgroup>
                  <thead>
                    <tr style={{ background:C.bg, borderBottom:`1px solid ${C.border}` }}>
                      {TABLE_COLS.map(h => (
                        <th key={h} style={{
                          padding:'13px 12px',
                          textAlign: h === 'Actions' ? 'right' : 'left',
                          fontSize:9.5, fontWeight:700, color:C.muted,
                          textTransform:'uppercase', letterSpacing:'0.12em',
                          overflow:'hidden', whiteSpace:'normal', wordBreak:'break-word',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={TABLE_COLS.length} style={{ textAlign:'center', padding:'48px 0', color:C.muted, fontSize:14, fontWeight:600 }}>
                          No users found.
                        </td>
                      </tr>
                    ) : filteredUsers.map((user, idx) => {
                      const role        = user.role || user.type || '—';
                      const provider    = user.provider || user.registration_type || user.registrationType || '—';
                      const accountType = user.account_type || user.accountType || 'Free';
const isPaid = ['paid','premium','subscription','pro'].includes(accountType.toLowerCase());
const isActive    = !user.deleted_at && user.status !== 'inactive';
                      const isGmail     = ['gmail','google'].includes((provider || '').toLowerCase());
                      const rb          = roleBadge(role);
                      const reportCount = getReportCount(user);
                      const joinDate    = user.join_date || user.joinDate || user.created_at?.slice(0,10) || '—';

                      // Show short ID: if UUID show first 8 chars, else pad number
                      const displayId = String(user.id).includes('-')
                        ? '#' + String(user.id).slice(0, 8)
                        : '#' + String(user.id).padStart(3, '0');

                      return (
                        <tr
                          key={user.id}
                          style={{ borderBottom: idx < filteredUsers.length-1 ? `1px solid ${C.border}` : 'none', transition:'background 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = C.bg}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          {/* ID */}
                          <td style={{ padding:'13px 12px', overflow:'hidden' }}>
                            <span
  style={{ fontSize:10, fontWeight:800, color:C.muted, display:'block', wordBreak:'break-all' }}
>
  {displayId}
</span>
                          </td>

                          {/* Fullname */}
                          <td style={{ padding:'13px 12px', overflow:'hidden' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8, overflow:'hidden' }}>
                              {/* <div style={{ width:30, height:30, borderRadius:8, background:'#FEF3E7', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:C.copper, fontSize:12, flexShrink:0 }}>
                                {(user.name || '?').charAt(0).toUpperCase()}
                              </div> */}
                              <span style={{ fontWeight:700, fontSize:13, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {user.name}
                              </span>
                            </div>
                          </td>

                          {/* Email & Phone */}
                          <td style={{ padding:'13px 12px', overflow:'hidden' }}>
                            <div style={{ fontSize:12, fontWeight:600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</div>
                            <div style={{ fontSize:11, color:C.muted, marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.phone || '—'}</div>
                          </td>

                          {/* Role */}
                          <td style={{ padding:'13px 12px', overflow:'hidden' }}>
                            <span style={{ padding:'2px 8px', borderRadius:6, fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', background:rb.bg, color:rb.color, display:'inline-block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }}>
                              {role}
                            </span>
                          </td>

                          {/* Join Date */}
                          <td style={{ padding:'13px 12px', fontSize:11, color:C.muted, fontWeight:500, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>
                            {joinDate}
                          </td>

                          {/* Reg. Type */}
                          <td style={{ padding:'13px 12px', overflow:'hidden' }}>
                            <span style={{ fontSize:11, fontWeight:800, color:'#6B6B6B', textTransform:'uppercase', display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
  {provider}
</span>
                          </td>

                          {/* Reports */}
                          <td style={{ padding:'13px 12px' }}>
                            <span style={{ fontSize:14, fontWeight:900, color:C.text }}>{reportCount}</span>
                          </td>

                          {/* Account Type */}
                          <td style={{ padding:'13px 12px', overflow:'hidden' }}>
                            <span style={{ padding:'2px 8px', borderRadius:6, fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em', background: isPaid ? '#D1FAE5' : '#F3F3F4', color: isPaid ? '#059669' : C.muted, border:`1px solid ${isPaid ? '#A7F3D0' : C.border}`, display:'inline-block', whiteSpace:'nowrap' }}>
                              {accountType}
                            </span>
                          </td>

                       {/* Status */}
                          <td style={{ padding:'13px 12px', overflow:'hidden' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                              <span style={{ width:6, height:6, borderRadius:'50%', background: isActive ? C.emerald : '#EF4444', display:'inline-block', flexShrink:0 }} />
                              <span style={{ fontSize:12, fontWeight:700, color:C.text, textTransform:'capitalize', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {user.status}
                              </span>
                            </div>
                          </td>

                          {/* Discount Code */}
                          <td style={{ padding:'13px 12px', overflow:'hidden' }}>
                            {user.discount_code_used ? (
                              <span style={{
                                padding:'2px 8px', borderRadius:6,
                                fontSize:9, fontWeight:800,
                                textTransform:'uppercase', letterSpacing:'0.06em',
                                background:'#FFF7ED', color:'#C8832A',
                                border:'1px solid #F5C89A',
                                display:'inline-block', whiteSpace:'nowrap'
                              }}>
                                {user.discount_code_used}
                              </span>
                            ) : (
                              <span style={{ fontSize:11, color:C.muted }}>—</span>
                            )}
                          </td>

                          {/* Discount % */}
                          <td style={{ padding:'13px 12px', overflow:'hidden' }}>
                            {user.discount_code_used ? (
                              <span style={{
                                padding:'2px 8px', borderRadius:6,
                                fontSize:9, fontWeight:800,
                                background:'#F0FDF4', color:'#16A34A',
                                border:'1px solid #BBF7D0',
                                display:'inline-block', whiteSpace:'nowrap'
                              }}>
                                {user.discount_percentage ? `${user.discount_percentage}%` : '100%'}
                              </span>
                            ) : (
                              <span style={{ fontSize:11, color:C.muted }}>—</span>
                            )}
                          </td>

                          {/* Actions */}
                          {/* <td style={{ padding:'13px 12px', textAlign:'right' }}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:3 }}>
                              <button
                                onClick={() => window.location.href=`mailto:${user.email}`}
                                style={{ padding:'5px', borderRadius:6, border:`1px solid ${C.border}`, background:C.white, cursor:'pointer', display:'flex', color:C.muted, flexShrink:0 }}
                                title="Send Email"
                              >
                                <Mail size={13} />
                              </button>
                              <button
                                onClick={() => handleStatusToggle(user)}
                                style={{ padding:'5px', borderRadius:6, border:`1px solid ${C.border}`, background:C.white, cursor:'pointer', display:'flex', color:C.muted, flexShrink:0 }}
                                title={isActive ? 'Deactivate' : 'Activate'}
                              >
                                {isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                style={{ padding:'5px', borderRadius:6, border:'1px solid #FECACA', background:'#FFF5F5', cursor:'pointer', display:'flex', color:'#EF4444', flexShrink:0 }}
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td> */}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminUsersScreen;
