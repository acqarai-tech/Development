// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../lib/supabase';
// import {
//   Users, LayoutDashboard, Home, MessageSquare, BookOpen,
//   BarChart2, Settings, LogOut, Bell, User, Menu, X, Plus, Trash2, Eye, EyeOff,
// } from 'lucide-react';
// import { useLogout } from '../hooks/useLogout';

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
// };

// const SIDEBAR_W = 260;

// const navItems = [
//   { label: 'Overview',       icon: LayoutDashboard, key: 'overview'       },
//   { label: 'Users',          icon: Users,            key: 'users'          },
//   { label: 'Valuations',     icon: Home,             key: 'valuations'     },
//   { label: 'Feedback',       icon: MessageSquare,    key: 'feedback'       },
//   { label: 'Blogs',          icon: BookOpen,         key: 'blogs'          },
//   { label: 'Analytics',      icon: BarChart2,        key: 'analytics'      },
//   { label: 'Discount Codes', icon: Settings,         key: 'discount-codes' },
//   { label: 'Settings',       icon: Settings,         key: 'settings'       },
// ];

// const globalCss = `
//   *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
//   body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
//   @keyframes spin    { to { transform: rotate(360deg); } }
//   @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
//   @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
//   ::-webkit-scrollbar { width: 4px; height: 4px; }
//   ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
//   .nav-btn { transition: background 0.14s; }
//   .nav-btn:hover { background: rgba(255,255,255,0.07) !important; }
//   .hdr-desktop { display: flex; }
//   .hdr-mobile  { display: none; }
//   @media (max-width: 600px) {
//     .hdr-desktop { display: none !important; }
//     .hdr-mobile  { display: flex !important; }
//     .main-wrap   { padding-top: 60px !important; }
//     .main-inner  { padding: 16px 12px !important; }
//     .form-grid   { flex-direction: column !important; }
//   }
// `;

// const Sidebar = ({ open, onClose, active, onNav, onLogout }) => {
//   if (!open) return null;
//   return (
//     <>
//       <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:98, background:'rgba(0,0,0,0.5)', animation:'fadeIn 0.18s ease' }} />
//       <aside style={{ position:'fixed', top:0, left:0, bottom:0, width:SIDEBAR_W, background:C.sidebar, display:'flex', flexDirection:'column', zIndex:99, animation:'slideIn 0.22s ease', boxShadow:'6px 0 28px rgba(0,0,0,0.28)' }}>
//         <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 18px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
//           <div>
//             <span style={{ color:C.white, fontWeight:900, fontSize:16 }}>ACQAR </span>
//             <span style={{ color:C.copper, fontWeight:900, fontSize:16 }}>ADMIN</span>
//           </div>
//           <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', width:28, height:28, borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.sidebarText }}>
//             <X size={14} />
//           </button>
//         </div>
//         <nav style={{ flex:1, padding:'10px', overflowY:'auto' }}>
//           {navItems.map(({ label, icon: Icon, key }) => {
//             const on = active === key;
//             return (
//               <button key={key} className="nav-btn" onClick={() => { onNav(key); onClose(); }}
//                 style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'11px 14px', borderRadius:10, border:'none', background: on ? C.activeNav : 'transparent', color: on ? C.activeText : C.sidebarText, cursor:'pointer', marginBottom:2, fontSize:13.5, fontWeight: on ? 700 : 400, textAlign:'left' }}>
//                 <Icon size={17} strokeWidth={on ? 2.2 : 1.7} />
//                 {label}
//               </button>
//             );
//           })}
//         </nav>
//         <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
//           <button className="nav-btn" onClick={onLogout}
//             style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'11px 14px', borderRadius:10, border:'none', background:'transparent', color:C.sidebarText, cursor:'pointer', fontSize:13.5, fontWeight:400, textAlign:'left' }}>
//             <LogOut size={17} strokeWidth={1.7} />
//             Logout
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// };

// const DesktopHeader = ({ onHamburger }) => (
//   <header className="hdr-desktop" style={{ position:'fixed', top:0, left:0, right:0, height:60, background:C.white, borderBottom:`1px solid ${C.border}`, alignItems:'center', justifyContent:'space-between', padding:'0 22px', zIndex:90, gap:12 }}>
//     <div style={{ display:'flex', alignItems:'center', gap:14 }}>
//       <button onClick={onHamburger} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:C.muted, padding:4 }}>
//         <Menu size={22} strokeWidth={1.8} />
//       </button>
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
//         <div style={{ width:36, height:36, borderRadius:'50%', background:'#F5EBE0', border:`2px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
//           <User size={17} color={C.copper} strokeWidth={1.8} />
//         </div>
//       </div>
//     </div>
//   </header>
// );

// const MobileHeader = ({ onHamburger }) => (
//   <header className="hdr-mobile" style={{ position:'fixed', top:0, left:0, right:0, height:60, background:C.sidebar, alignItems:'center', justifyContent:'space-between', padding:'0 18px', zIndex:90 }}>
//     <div>
//       <span style={{ color:C.white, fontWeight:900, fontSize:16 }}>ACQAR </span>
//       <span style={{ color:C.copper, fontWeight:900, fontSize:16 }}>ADMIN</span>
//     </div>
//     <button onClick={onHamburger} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:C.white, padding:4 }}>
//       <Menu size={24} strokeWidth={2} />
//     </button>
//   </header>
// );

// export default function AdminDiscountCodesScreen() {
//   const navigate     = useNavigate();
//   const handleLogout = useLogout();

//   const [codes,        setCodes]        = useState([]);
//   const [loading,      setLoading]      = useState(true);
//   const [sideOpen,     setSideOpen]     = useState(false);
//   const [form,         setForm]         = useState({ code:'', username:'', password:'' });
//   const [creating,     setCreating]     = useState(false);
//   const [msg,          setMsg]          = useState('');
//   const [msgType,      setMsgType]      = useState('');
//   const [showPass,     setShowPass]     = useState({});
//   const [codeStats,    setCodeStats]    = useState({});

//   useEffect(() => { fetchCodes(); }, []);

//   const fetchCodes = async () => {
//     setLoading(true);
//     const { data, error } = await supabase
//       .from('discount_codes')
//       .select('*')
//       .order('created_at', { ascending: false });

//     if (!error && data) {
//       setCodes(data);
//       // Fetch stats for each code
//       const { data: users } = await supabase
//         .from('users')
//         .select('discount_code_used, plan');

//       const stats = {};
//       (users || []).forEach(u => {
//         const code = u.discount_code_used;
//         if (!code) return;
//         if (!stats[code]) stats[code] = { signups: 0, revenue: 0 };
//         stats[code].signups += 1;
//         if (u.plan === 'pro') stats[code].revenue += 29;
//       });
//       setCodeStats(stats);
//     }
//     setLoading(false);
//   };

//   const handleCreate = async () => {
//     setMsg('');
//     if (!form.code.trim())     { setMsg('Please enter a discount code.'); setMsgType('error'); return; }
//     if (!form.username.trim()) { setMsg('Please enter a username.');       setMsgType('error'); return; }
//     if (!form.password.trim()) { setMsg('Please enter a password.');       setMsgType('error'); return; }

//     setCreating(true);
//     const { error } = await supabase.from('discount_codes').insert({
//       code:     form.code.toUpperCase().trim(),
//       username: form.username.trim(),
//       password: form.password.trim(),
//     });

//     if (error) {
//       setMsg(error.message.includes('unique') ? 'Code or username already exists.' : 'Error: ' + error.message);
//       setMsgType('error');
//     } else {
//       setMsg('Discount code created successfully!');
//       setMsgType('success');
//       setForm({ code:'', username:'', password:'' });
//       fetchCodes();
//     }
//     setCreating(false);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm('Delete this discount code?')) return;
//     await supabase.from('discount_codes').delete().eq('id', id);
//     fetchCodes();
//   };

//   const handleNav = (key) => {
//     if (key === 'overview')        navigate('/admin-dashboard');
//     else if (key === 'users')      navigate('/admin/users');
//     else if (key !== 'discount-codes') navigate(`/admin/${key}`);
//   };

//   return (
//     <div style={{ background:C.bg, minHeight:'100vh' }}>
//       <style>{globalCss}</style>

//       <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} active="discount-codes" onNav={handleNav} onLogout={handleLogout} />
//       <DesktopHeader onHamburger={() => setSideOpen(true)} />
//       <MobileHeader  onHamburger={() => setSideOpen(true)} />

//       <main className="main-wrap" style={{ paddingTop:60 }}>
//         <div className="main-inner" style={{ padding:'26px 22px', maxWidth:1000, margin:'0 auto' }}>

//           {/* Title */}
//           <div style={{ marginBottom:24 }}>
//             <h1 style={{ fontSize:28, fontWeight:900, color:C.text, letterSpacing:'-0.7px' }}>Discount Codes</h1>
//             <p style={{ fontSize:14, color:C.muted, marginTop:5 }}>Create and manage partner discount codes.</p>
//           </div>

//           {/* Create form */}
//           <div style={{ background:C.white, borderRadius:20, border:`1px solid ${C.border}`, padding:24, marginBottom:28, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
//             <h2 style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:16 }}>Create New Discount Code</h2>

//             <div className="form-grid" style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
//               {/* Code */}
//               <div style={{ flex:1, minWidth:160 }}>
//                 <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Discount Code *</label>
//                 <input
//                   type="text"
//                   placeholder="e.g. CABEELA"
//                   value={form.code}
//                   onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
//                   style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:14, outline:'none', fontFamily:'inherit', background:C.bg }}
//                 />
//               </div>

//               {/* Username */}
//               <div style={{ flex:1, minWidth:160 }}>
//                 <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Username *</label>
//                 <input
//                   type="text"
//                   placeholder="e.g. cabeela"
//                   value={form.username}
//                   onChange={e => setForm({ ...form, username: e.target.value })}
//                   style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:14, outline:'none', fontFamily:'inherit', background:C.bg }}
//                 />
//               </div>

//               {/* Password */}
//               <div style={{ flex:1, minWidth:160 }}>
//                 <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Password *</label>
//                 <input
//                   type="text"
//                   placeholder="e.g. cabeela123"
//                   value={form.password}
//                   onChange={e => setForm({ ...form, password: e.target.value })}
//                   style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:14, outline:'none', fontFamily:'inherit', background:C.bg }}
//                 />
//               </div>

//               {/* Button */}
//               <div style={{ display:'flex', alignItems:'flex-end' }}>
//                 <button
//                   onClick={handleCreate}
//                   disabled={creating}
//                   style={{ padding:'11px 22px', borderRadius:10, background: creating ? '#ccc' : C.copper, color:C.white, border:'none', fontWeight:800, fontSize:14, cursor: creating ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap', fontFamily:'inherit' }}
//                 >
//                   <Plus size={16} />
//                   {creating ? 'Creating...' : 'Create Code'}
//                 </button>
//               </div>
//             </div>

//             {msg && (
//               <div style={{ marginTop:14, padding:'10px 14px', borderRadius:8, background: msgType === 'error' ? '#FEF2F2' : '#F0FDF4', border:`1px solid ${msgType === 'error' ? '#FECACA' : '#BBF7D0'}`, color: msgType === 'error' ? '#DC2626' : '#16A34A', fontSize:13, fontWeight:700 }}>
//                 {msgType === 'error' ? '⚠️' : '✅'} {msg}
//               </div>
//             )}
//           </div>

//           {/* Codes table */}
//           {loading ? (
//             <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:200 }}>
//               <div style={{ width:30, height:30, borderRadius:'50%', border:`3px solid ${C.copper}`, borderTopColor:'transparent', animation:'spin 0.75s linear infinite' }} />
//             </div>
//           ) : (
//             <div style={{ background:C.white, borderRadius:20, border:`1px solid ${C.border}`, overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
//               <table style={{ width:'100%', borderCollapse:'collapse' }}>
//                 <thead>
//                   <tr style={{ background:C.bg, borderBottom:`1px solid ${C.border}` }}>
//                     {['Code','Username','Password','Partner Login URL','Signups','Revenue','Created','Actions'].map(h => (
//                       <th key={h} style={{ padding:'13px 16px', textAlign:'left', fontSize:9.5, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.12em', whiteSpace:'nowrap' }}>{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {codes.length === 0 ? (
//                     <tr>
//                       <td colSpan={8} style={{ padding:'48px 0', textAlign:'center', color:C.muted, fontSize:14, fontWeight:600 }}>
//                         No discount codes yet. Create one above.
//                       </td>
//                     </tr>
//                   ) : codes.map((c, i) => {
//                     const stats = codeStats[c.code] || { signups:0, revenue:0 };
//                     return (
//                       <tr key={c.id} style={{ borderBottom: i < codes.length-1 ? `1px solid ${C.border}` : 'none' }}
//                         onMouseEnter={e => e.currentTarget.style.background = C.bg}
//                         onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
//                       >
//                         {/* Code */}
//                         <td style={{ padding:'14px 16px' }}>
//                           <span style={{ fontWeight:900, fontSize:13, color:C.copper, background:'#FFF7ED', padding:'3px 10px', borderRadius:6, border:'1px solid #F5C89A' }}>
//                             {c.code}
//                           </span>
//                         </td>

//                         {/* Username */}
//                         <td style={{ padding:'14px 16px', fontSize:13, fontWeight:600, color:C.text }}>
//                           {c.username}
//                         </td>

//                         {/* Password */}
//                         <td style={{ padding:'14px 16px' }}>
//                           <div style={{ display:'flex', alignItems:'center', gap:8 }}>
//                             <span style={{ fontSize:13, color:C.muted, fontFamily:'monospace' }}>
//                               {showPass[c.id] ? c.password : '•'.repeat(Math.min(c.password.length, 10))}
//                             </span>
//                             <button
//                               onClick={() => setShowPass(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
//                               style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, display:'flex', padding:2 }}
//                             >
//                               {showPass[c.id] ? <EyeOff size={13} /> : <Eye size={13} />}
//                             </button>
//                           </div>
//                         </td>

//                         {/* Partner Login URL */}
//                         <td style={{ padding:'14px 16px' }}>
//                           <span style={{ fontSize:11, color:'#6B6B6B', fontFamily:'monospace', background:C.bg, padding:'3px 8px', borderRadius:6 }}>
//                             /partner-login
//                           </span>
//                         </td>

//                         {/* Signups */}
//                         <td style={{ padding:'14px 16px' }}>
//                           <span style={{ fontSize:15, fontWeight:900, color:C.text }}>{stats.signups}</span>
//                         </td>

//                         {/* Revenue */}
//                         <td style={{ padding:'14px 16px' }}>
//                           <span style={{ fontSize:13, fontWeight:800, color:C.emerald }}>
//                             AED {stats.revenue}
//                           </span>
//                         </td>

//                         {/* Created */}
//                         <td style={{ padding:'14px 16px', fontSize:12, color:C.muted }}>
//                           {c.created_at?.slice(0,10)}
//                         </td>

//                         {/* Actions */}
//                         <td style={{ padding:'14px 16px' }}>
//                           <button
//                             onClick={() => handleDelete(c.id)}
//                             style={{ padding:'6px 12px', borderRadius:8, background:'#FFF5F5', border:'1px solid #FECACA', color:'#EF4444', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}
//                           >
//                             <Trash2 size={13} />
//                             Delete
//                           </button>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }














import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Search, Filter, Mail, UserCheck, UserX, Trash2,
  Users, LayoutDashboard, Home, MessageSquare, BookOpen,
  BarChart2, Settings, LogOut, Bell, User, Menu, X, CreditCard,
} from 'lucide-react';
import { useLogout } from '../hooks/useLogout';

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
};

const SIDEBAR_W = 260;

const navItems = [
  { label: 'Overview',       icon: LayoutDashboard, key: 'overview'       },
  { label: 'Users',          icon: Users,            key: 'users'          },
  { label: 'Valuations',     icon: Home,             key: 'valuations'     },
  { label: 'Feedback',       icon: MessageSquare,    key: 'feedback'       },
  { label: 'Blogs',          icon: BookOpen,         key: 'blogs'          },
  { label: 'Analytics',      icon: BarChart2,        key: 'analytics'      },
  { label: 'Discount Codes', icon: CreditCard,         key: 'discount-codes' },
  { label: 'Settings',       icon: Settings,         key: 'settings'       },
];

const globalCss = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
  .nav-btn { transition: background 0.14s; }
  .nav-btn:hover { background: rgba(255,255,255,0.07) !important; }
  .hdr-desktop { display: flex; }
  .hdr-mobile  { display: none; }
@media (max-width: 768px) {
    .hdr-desktop { display: none !important; }
    .hdr-mobile  { display: flex !important; }
    .main-wrap   { padding-top: 60px !important; }
    .main-inner  { padding: 16px !important; }
    .form-grid   { grid-template-columns: 1fr !important; }
    .create-card { padding: 16px 14px !important; border-radius: 12px !important; }
    .page-title  { font-size: 22px !important; }
  }
`;

const Sidebar = ({ open, onClose, active, onNav, onLogout }) => {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:98, background:'rgba(0,0,0,0.5)', animation:'fadeIn 0.18s ease' }} />
      <aside style={{ position:'fixed', top:0, left:0, bottom:0, width:SIDEBAR_W, background:C.sidebar, display:'flex', flexDirection:'column', zIndex:99, animation:'slideIn 0.22s ease', boxShadow:'6px 0 28px rgba(0,0,0,0.28)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 18px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
          <div>
            <span style={{ color:C.white, fontWeight:900, fontSize:16 }}>ACQAR </span>
            <span style={{ color:C.copper, fontWeight:900, fontSize:16 }}>ADMIN</span>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', width:28, height:28, borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:C.sidebarText }}>
            <X size={14} />
          </button>
        </div>
        <nav style={{ flex:1, padding:'10px', overflowY:'auto' }}>
          {navItems.map(({ label, icon: Icon, key }) => {
            const on = active === key;
            return (
              <button key={key} className="nav-btn" onClick={() => { onNav(key); onClose(); }}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'11px 14px', borderRadius:10, border:'none', background: on ? C.activeNav : 'transparent', color: on ? C.activeText : C.sidebarText, cursor:'pointer', marginBottom:2, fontSize:13.5, fontWeight: on ? 700 : 400, textAlign:'left' }}>
                <Icon size={17} strokeWidth={on ? 2.2 : 1.7} />
                {label}
              </button>
            );
          })}
        </nav>
        <div style={{ padding:'12px 10px', borderTop:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
          <button className="nav-btn" onClick={onLogout}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:11, padding:'11px 14px', borderRadius:10, border:'none', background:'transparent', color:C.sidebarText, cursor:'pointer', fontSize:13.5, fontWeight:400, textAlign:'left' }}>
            <LogOut size={17} strokeWidth={1.7} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

const DesktopHeader = ({ onHamburger }) => (
  <header className="hdr-desktop" style={{ position:'fixed', top:0, left:0, right:0, height:60, background:C.white, borderBottom:`1px solid ${C.border}`, alignItems:'center', justifyContent:'space-between', padding:'0 22px', zIndex:90, gap:12 }}>
    <div style={{ display:'flex', alignItems:'center', gap:14 }}>
      <button onClick={onHamburger} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', color:C.muted, padding:4 }}>
        <Menu size={22} strokeWidth={1.8} />
      </button>
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
        <div style={{ width:36, height:36, borderRadius:'50%', background:'#F5EBE0', border:`2px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <User size={17} color={C.copper} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  </header>
);

const MobileHeader = ({ onHamburger }) => (
  <header className="hdr-mobile" style={{ position:'fixed', top:0, left:0, right:0, height:60, background:C.sidebar, alignItems:'center', justifyContent:'space-between', padding:'0 18px', zIndex:90 }}>
    <div>
      <span style={{ color:C.white, fontWeight:900, fontSize:16 }}>ACQAR </span>
      <span style={{ color:C.copper, fontWeight:900, fontSize:16 }}>ADMIN</span>
    </div>
    <button onClick={onHamburger} style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:C.white, padding:4 }}>
      <Menu size={24} strokeWidth={2} />
    </button>
  </header>
);

export default function AdminDiscountCodesScreen() {
  const navigate     = useNavigate();
  const handleLogout = useLogout();

  const [codes,        setCodes]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [sideOpen,     setSideOpen]     = useState(false);
 const [form, setForm] = useState({ code:'', username:'', password:'', discount_percentage:100, roles:[], original_amount:29 });
  const [creating,     setCreating]     = useState(false);
  const [msg,          setMsg]          = useState('');
  const [msgType,      setMsgType]      = useState('');
  const [showPass,     setShowPass]     = useState({});
  const [codeStats,    setCodeStats]    = useState({});

  useEffect(() => { fetchCodes(); }, []);

  const fetchCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCodes(data);
      // Fetch stats for each code
      const { data: users } = await supabase
  .from('users')
  .select('discount_code_used, plan, amount_paid');

      // Build discount percentage map from codes
const discountPctMap = {};
const discountAmountMap = {};
(data || []).forEach(d => {
  discountPctMap[d.code] = d.discount_percentage || 100;
  discountAmountMap[d.code] = d.original_amount || 29;
});

const stats = {};
(users || []).forEach(u => {
  const code = u.discount_code_used;
  if (!code) return;
  if (!stats[code]) stats[code] = { signups: 0, revenue: 0 };
  stats[code].signups += 1;
  if (u.plan === 'pro') {
    // Use saved amount_paid if exists, otherwise calculate from discount %
    if (u.amount_paid != null && u.amount_paid > 0) {
      stats[code].revenue += u.amount_paid;
   } else {
  // Fallback: calculate discount amount given
  const discountPct = discountPctMap[code] || 100;
  const originalAmt = discountAmountMap[code] || 29;
  const discountGiven = Math.round(originalAmt * discountPct / 100);
  stats[code].revenue += discountGiven;
}
  }
});
setCodeStats(stats);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    setMsg('');
    if (!form.code.trim())     { setMsg('Please enter a discount code.'); setMsgType('error'); return; }
if (!form.username.trim()) { setMsg('Please enter a username.');       setMsgType('error'); return; }
if (!form.password.trim()) { setMsg('Please enter a password.');       setMsgType('error'); return; }
if (!form.discount_percentage || form.discount_percentage < 1 || form.discount_percentage > 100) {
  setMsg('Please enter a discount percentage between 1 and 100.');
  setMsgType('error'); return;
}

    setCreating(true);
const { error } = await supabase.from('discount_codes').insert({
  code:                form.code.toUpperCase().trim(),
  username:            form.username.trim(),
  password:            form.password.trim(),
  discount_percentage: form.discount_percentage,
  original_amount:     form.original_amount || 29,
  roles:               form.roles,
  is_active:           true,
});

    if (error) {
      setMsg(error.message.includes('unique') ? 'Code or username already exists.' : 'Error: ' + error.message);
      setMsgType('error');
    } else {
      setMsg('Discount code created successfully!');
      setMsgType('success');
     setForm({ code:'', username:'', password:'', discount_percentage:100, roles:[], original_amount:29 });
      fetchCodes();
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this discount code?')) return;
    await supabase.from('discount_codes').delete().eq('id', id);
    fetchCodes();
  };

  const handleToggleActive = async (id, currentStatus) => {
  await supabase.from('discount_codes').update({ is_active: !currentStatus }).eq('id', id);
  fetchCodes();
};

  const handleNav = (key) => {
    if (key === 'overview')        navigate('/admin-dashboard');
    else if (key === 'users')      navigate('/admin/users');
    else if (key !== 'discount-codes') navigate(`/admin/${key}`);
  };

  return (
    <div style={{ background:C.bg, minHeight:'100vh' }}>
      <style>{globalCss}</style>

      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} active="discount-codes" onNav={handleNav} onLogout={handleLogout} />
      <DesktopHeader onHamburger={() => setSideOpen(true)} />
      <MobileHeader  onHamburger={() => setSideOpen(true)} />

      <main className="main-wrap" style={{ paddingTop:60 }}>
        <div className="main-inner" style={{ padding:'26px 32px', maxWidth:'100%', margin:'0 auto', boxSizing:'border-box' }}>

          {/* Title */}
          <div style={{ marginBottom:24 }}>
            <h1 className="page-title" style={{ fontSize:28, fontWeight:900, color:C.text, letterSpacing:'-0.7px' }}>Discount Codes</h1>
            <p style={{ fontSize:14, color:C.muted, marginTop:5 }}>Create and manage partner discount codes.</p>
          </div>

          {/* Create form */}
         <div className="create-card" style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:'20px 24px', marginBottom:24, boxShadow:'0 1px 6px rgba(0,0,0,0.06)' }}>
  <h2 style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:16, textTransform:'uppercase', letterSpacing:'0.08em', color:C.muted }}>Create New Discount Code</h2>

            <div className="form-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1.5fr 0.8fr 0.8fr auto', gap:12, alignItems:'end' }}>
              {/* Code */}
              <div style={{ flex:1, minWidth:160 }}>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Discount Code *</label>
                <input
                  type="text"
                  placeholder="e.g. CABEELA"
                  value={form.code}
                  onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:14, outline:'none', fontFamily:'inherit', background:C.bg }}
                />
              </div>

              {/* Username */}
              <div style={{ flex:1, minWidth:160 }}>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Username *</label>
                <input
                  type="text"
                  placeholder="e.g. cabeela"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:14, outline:'none', fontFamily:'inherit', background:C.bg }}
                />
              </div>

              {/* Password */}
              <div style={{ flex:1, minWidth:160 }}>
                <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Password *</label>
                <input
                  type="text"
                  placeholder="e.g. cabeela123"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:14, outline:'none', fontFamily:'inherit', background:C.bg }}
                />
              </div>
{/* Roles */}
<div style={{ flex:1, minWidth:200 }}>
  <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Roles </label>
  <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
    {/* All checkbox */}
<label style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:13, fontWeight:600, color:C.text }}>
  <input
    type="checkbox"
    checked={form.roles.length === 0}
    onChange={() => setForm({ ...form, roles: [] })}
    style={{ accentColor: C.copper, width:14, height:14 }}
  />
  All
</label>
{['Investor','Buyer','Seller','Agent'].map(r => (
  <label key={r} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:13, fontWeight:600, color:C.text }}>
    <input
      type="checkbox"
      checked={form.roles.includes(r.toLowerCase())}
      onChange={e => {
        if (e.target.checked) {
          setForm({ ...form, roles: [...form.roles, r.toLowerCase()] });
        } else {
          setForm({ ...form, roles: form.roles.filter(x => x !== r.toLowerCase()) });
        }
      }}
      style={{ accentColor: C.copper, width:14, height:14 }}
    />
    {r}
  </label>
))}
  </div>
</div>

{/* Original Amount */}
<div style={{ flex:1, minWidth:120 }}>
  <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Amount (AED) *</label>
  <input
    type="number"
    min="1"
    placeholder="e.g. 29"
    value={form.original_amount}
    onChange={e => setForm({ ...form, original_amount: Number(e.target.value) })}
    style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:14, outline:'none', fontFamily:'inherit', background:C.bg }}
  />
</div>

{/* Discount % */}
<div style={{ flex:1, minWidth:120 }}>
  <label style={{ display:'block', fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:6 }}>Discount % *</label>
  <input
    type="number"
    min="1"
    max="100"
    placeholder="e.g. 100"
    value={form.discount_percentage}
    onChange={e => setForm({ ...form, discount_percentage: Number(e.target.value) })}
    style={{ width:'100%', padding:'11px 14px', borderRadius:10, border:`1px solid ${C.border}`, fontSize:14, outline:'none', fontFamily:'inherit', background:C.bg }}
  />

</div>
              {/* Button */}
              <div style={{ display:'flex', alignItems:'flex-end' }}>
                <button
  onClick={handleCreate}
  disabled={creating}
  style={{ padding:'11px 22px', borderRadius:10, background: creating ? '#ccc' : C.copper, color:C.white, border:'none', fontWeight:800, fontSize:14, cursor: creating ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', gap:8, whiteSpace:'nowrap', fontFamily:'inherit', height:46 }}
>
  <Plus size={16} />
  {creating ? 'Creating...' : 'Create Code'}
</button>
              </div>
            </div>

            {msg && (
              <div style={{ marginTop:14, padding:'10px 14px', borderRadius:8, background: msgType === 'error' ? '#FEF2F2' : '#F0FDF4', border:`1px solid ${msgType === 'error' ? '#FECACA' : '#BBF7D0'}`, color: msgType === 'error' ? '#DC2626' : '#16A34A', fontSize:13, fontWeight:700 }}>
                {msgType === 'error' ? '⚠️' : '✅'} {msg}
              </div>
            )}
          </div>

          {/* Codes table */}
          {loading ? (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:200 }}>
              <div style={{ width:30, height:30, borderRadius:'50%', border:`3px solid ${C.copper}`, borderTopColor:'transparent', animation:'spin 0.75s linear infinite' }} />
            </div>
          ) : (
           <div style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, overflow:'hidden', boxShadow:'0 1px 6px rgba(0,0,0,0.06)' }}>
  <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
  <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
                <thead>
                  <tr style={{ background:C.bg, borderBottom:`1px solid ${C.border}` }}>
                    {['Code','Username','Password','Roles','Disc.%','Signups','Disc. Amount','Created','Active','Actions'].map(h => (
                      <th key={h} style={{ padding:'13px 16px', textAlign:'left', fontSize:9.5, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.12em', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {codes.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding:'48px 0', textAlign:'center', color:C.muted, fontSize:14, fontWeight:600 }}>
                        No discount codes yet. Create one above.
                      </td>
                    </tr>
                  ) : codes.map((c, i) => {
                    const stats = codeStats[c.code] || { signups:0, revenue:0 };
                    return (
                      <tr key={c.id} style={{ borderBottom: i < codes.length-1 ? `1px solid ${C.border}` : 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = C.bg}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* Code */}
<td style={{ padding:'14px 16px' }}>
  <span style={{ fontWeight:900, fontSize:13, color:C.copper, background:'#FFF7ED', padding:'3px 10px', borderRadius:6, border:'1px solid #F5C89A' }}>
    {c.code}
  </span>
</td>

{/* Username */}
<td style={{ padding:'14px 16px', fontSize:13, fontWeight:600, color:C.text }}>
  {c.username}
</td>

{/* Password */}
<td style={{ padding:'14px 16px' }}>
  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
    <span style={{ fontSize:13, color:C.muted, fontFamily:'monospace' }}>
      {showPass[c.id] ? c.password : '•'.repeat(Math.min(c.password.length, 10))}
    </span>
    <button
      onClick={() => setShowPass(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
      style={{ background:'none', border:'none', cursor:'pointer', color:C.muted, display:'flex', padding:2 }}
    >
      {showPass[c.id] ? <EyeOff size={13} /> : <Eye size={13} />}
    </button>
  </div>
</td>

{/* Roles */}
<td style={{ padding:'14px 16px' }}>
  {(c.roles && c.roles.length > 0) ? (
    <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
      {c.roles.map(r => (
        <span key={r} style={{ padding:'2px 7px', borderRadius:5, fontSize:9, fontWeight:800, textTransform:'uppercase', background:'#F3F3F4', color:'#6B6B6B', border:'1px solid #E9E9EA' }}>
          {r}
        </span>
      ))}
    </div>
  ) : (
    <span style={{ fontSize:11, color:'#9A9A9A' }}>All</span>
  )}
</td>

{/* Disc.% */}
<td style={{ padding:'14px 16px' }}>
  <span style={{ padding:'2px 8px', borderRadius:6, fontSize:11, fontWeight:800, background:'#F0FDF4', color:'#16A34A', border:'1px solid #BBF7D0' }}>
    {c.discount_percentage || 100}%
  </span>
</td>

{/* Signups */}
<td style={{ padding:'14px 16px' }}>
  <span style={{ fontSize:15, fontWeight:900, color:C.text }}>{stats.signups}</span>
</td>

{/* Discount Amount */}
<td style={{ padding:'14px 16px' }}>
  <span style={{ fontSize:13, fontWeight:800, color:C.emerald }}>
    AED {stats.revenue}
  </span>
</td>

{/* Created */}
<td style={{ padding:'14px 16px', fontSize:12, color:C.muted }}>
  {c.created_at?.slice(0,10)}
</td>

{/* Active Toggle */}
<td style={{ padding:'14px 16px' }}>
  <div
    onClick={() => handleToggleActive(c.id, c.is_active)}
    style={{
      width:48, height:26, borderRadius:999,
      background: c.is_active ? C.copper : '#D1D5DB',
      cursor:'pointer', position:'relative',
      transition:'background 0.25s ease',
      flexShrink:0,
    }}
  >
    <div style={{
      position:'absolute',
      top:3, left: c.is_active ? 25 : 3,
      width:20, height:20, borderRadius:'50%',
      background:'#fff',
      boxShadow:'0 1px 4px rgba(0,0,0,0.2)',
      transition:'left 0.25s ease',
    }} />
  </div>
</td>

{/* Actions */}
<td style={{ padding:'14px 16px' }}>
  <button
    onClick={() => handleDelete(c.id)}
    style={{ padding:'6px 12px', borderRadius:8, background:'#FFF5F5', border:'1px solid #FECACA', color:'#EF4444', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}
  >
    <Trash2 size={13} />
    Delete
  </button>
</td>
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
}
