// // screens/AdminFeedbackScreen.jsx
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../lib/supabase';
// import { adminService } from '../services/adminService';
// import { useLogout } from '../hooks/useLogout';
// import {
//   Search, X, User, Home, ExternalLink,
//   Users, LayoutDashboard, MessageSquare, BookOpen,
//   BarChart2, Settings, LogOut, Bell, Menu, Filter,
// } from 'lucide-react';

// /* ─── Tokens ─────────────────────────────────────────────────────────── */
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
//   { label:'Overview',   icon:LayoutDashboard, key:'overview'   },
//   { label:'Users',      icon:Users,           key:'users'      },
//   { label:'Valuations', icon:Home,            key:'valuations' },
//   { label:'Feedback',   icon:MessageSquare,   key:'feedback'   },
//   { label:'Blogs',      icon:BookOpen,        key:'blogs'      },
//   { label:'Analytics',  icon:BarChart2,       key:'analytics'  },
//   { label:'Settings',   icon:Settings,        key:'settings'   },
// ];

// /* ─── CSS ─────────────────────────────────────────────────────────────── */
// const globalCss = `
//   *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
//   body{font-family:'Inter','Segoe UI',system-ui,sans-serif}
//   @keyframes spin    {to{transform:rotate(360deg)}}
//   @keyframes slideIn {from{transform:translateX(-100%)}to{transform:translateX(0)}}
//   @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
//   ::-webkit-scrollbar{width:4px;height:4px}
//   ::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.15);border-radius:4px}
//   ::-webkit-scrollbar-track{background:transparent}
//   .nav-btn{transition:background 0.14s}
//   .nav-btn:hover{background:rgba(255,255,255,0.07)!important}
//   .hdr-desktop{display:flex}
//   .hdr-mobile {display:none}
//   .tbl-action{transition:background 0.1s,color 0.1s}
//   .tbl-action:hover{background:#F3F3F4!important;color:#C8832A!important}
//   .reward-btn{transition:opacity 0.14s}
//   .reward-btn:hover{opacity:0.75}
//   .filter-btn{transition:background 0.14s,border-color 0.14s}
//   .filter-btn:hover{background:#F3F3F4!important}
//   .search-input:focus{outline:none;border-color:#C8832A!important;box-shadow:0 0 0 3px rgba(200,131,42,0.1)}
//   .table-wrap{
//     background:#fff;
//     border-radius:20px;
//     border:1px solid #E9E9EA;
//     box-shadow:0 1px 4px rgba(0,0,0,0.05);
//     overflow:hidden;
//   }
//   .table-scroll{
//     overflow-x:auto;
//     -webkit-overflow-scrolling:touch;
//   }
//   .table-scroll table{
//     min-width:1100px;
//     border-collapse:collapse;
//     width:100%;
//     table-layout:fixed;
//   }
//   @media(max-width:768px){
//     .hdr-desktop{display:none!important}
//     .hdr-mobile {display:flex!important}
//     .main-wrap  {padding-top:60px!important}
//     .main-inner {padding:16px 12px!important}
//     .page-title-row{flex-direction:column!important;align-items:flex-start!important;gap:14px!important}
//     .page-title-right{width:100%!important}
//     .search-input{width:100%!important}
//     .summary-grid{grid-template-columns:1fr!important}
//     .table-wrap{border-radius:16px}
//   }
// `;

// /* ─── Sidebar ─────────────────────────────────────────────────────────── */
// const Sidebar = ({ open, onClose, active, onNav, onLogout }) => {
//   if (!open) return null;
//   return (
//     <>
//       <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:98,background:'rgba(0,0,0,0.5)',animation:'fadeIn 0.18s ease'}}/>
//       <aside style={{position:'fixed',top:0,left:0,bottom:0,width:SIDEBAR_W,background:C.sidebar,display:'flex',flexDirection:'column',zIndex:99,animation:'slideIn 0.22s ease',boxShadow:'6px 0 28px rgba(0,0,0,0.28)'}}>
//         <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 18px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
//           <div>
//             <span style={{color:C.white,fontWeight:900,fontSize:16,letterSpacing:'0.05em'}}>ACQAR </span>
//             <span style={{color:C.copper,fontWeight:900,fontSize:16,letterSpacing:'0.05em'}}>ADMIN</span>
//           </div>
//           <button onClick={onClose} style={{background:'rgba(255,255,255,0.08)',border:'none',width:28,height:28,borderRadius:6,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:C.sidebarText}}>
//             <X size={14}/>
//           </button>
//         </div>
//         <nav style={{flex:1,padding:'10px',overflowY:'auto'}}>
//           {navItems.map(({label,icon:Icon,key})=>{
//             const on = active===key;
//             return (
//               <button key={key} className="nav-btn" onClick={()=>{onNav(key);onClose();}}
//                 style={{width:'100%',display:'flex',alignItems:'center',gap:11,padding:'11px 14px',borderRadius:10,border:'none',background:on?C.activeNav:'transparent',color:on?C.activeText:C.sidebarText,cursor:'pointer',marginBottom:2,fontSize:13.5,fontWeight:on?700:400,textAlign:'left'}}>
//                 <Icon size={17} strokeWidth={on?2.2:1.7}/>{label}
//               </button>
//             );
//           })}
//         </nav>
//         <div style={{padding:'12px 10px',borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
//           <button className="nav-btn" onClick={onLogout}
//             style={{width:'100%',display:'flex',alignItems:'center',gap:11,padding:'11px 14px',borderRadius:10,border:'none',background:'transparent',color:C.sidebarText,cursor:'pointer',fontSize:13.5,fontWeight:400,textAlign:'left'}}>
//             <LogOut size={17} strokeWidth={1.7}/>Logout
//           </button>
//         </div>
//       </aside>
//     </>
//   );
// };

// /* ─── Desktop Header ──────────────────────────────────────────────────── */
// const DesktopHeader = ({onHamburger}) => (
//   <header className="hdr-desktop" style={{position:'fixed',top:0,left:0,right:0,height:60,background:C.white,borderBottom:`1px solid ${C.border}`,alignItems:'center',justifyContent:'space-between',padding:'0 22px',zIndex:90,gap:12}}>
//     <div style={{display:'flex',alignItems:'center',gap:14,flex:1,minWidth:0}}>
//       <button onClick={onHamburger} style={{background:'none',border:'none',cursor:'pointer',display:'flex',color:C.muted,padding:4}}>
//         <Menu size={22} strokeWidth={1.8}/>
//       </button>
//       <div style={{display:'flex',alignItems:'center',gap:8,background:'#F3F3F4',borderRadius:22,padding:'8px 16px',maxWidth:360,width:'100%',border:`1px solid ${C.border}`}}>
//         <Search size={14} color={C.muted} strokeWidth={2} style={{flexShrink:0}}/>
//         <span style={{fontSize:13,color:C.muted,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Search reports, users, or articles...</span>
//       </div>
//     </div>
//     <div style={{display:'flex',alignItems:'center',gap:20,flexShrink:0}}>
//       <div style={{position:'relative',cursor:'pointer',display:'flex'}}>
//         <Bell size={20} color={C.muted} strokeWidth={1.8}/>
//         <span style={{position:'absolute',top:-2,right:-2,width:7,height:7,borderRadius:'50%',background:C.copper,border:`2px solid ${C.white}`}}/>
//       </div>
//       <div style={{display:'flex',alignItems:'center',gap:10}}>
//         <div style={{textAlign:'right'}}>
//           <div style={{fontSize:13,fontWeight:700,color:C.text}}>Admin User</div>
//           <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:'0.1em',textTransform:'uppercase'}}>Super Admin</div>
//         </div>
//         <div style={{width:36,height:36,borderRadius:'50%',background:'#F5EBE0',border:`2px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
//           <User size={17} color={C.copper} strokeWidth={1.8}/>
//         </div>
//       </div>
//     </div>
//   </header>
// );

// /* ─── Mobile Header ───────────────────────────────────────────────────── */
// const MobileHeader = ({onHamburger}) => (
//   <header className="hdr-mobile" style={{position:'fixed',top:0,left:0,right:0,height:60,background:C.sidebar,alignItems:'center',justifyContent:'space-between',padding:'0 18px',zIndex:90}}>
//     <div>
//       <span style={{color:C.white,fontWeight:900,fontSize:16,letterSpacing:'0.05em'}}>ACQAR </span>
//       <span style={{color:C.copper,fontWeight:900,fontSize:16,letterSpacing:'0.05em'}}>ADMIN</span>
//     </div>
//     <button onClick={onHamburger} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',color:C.white,padding:4}}>
//       <Menu size={24} strokeWidth={2}/>
//     </button>
//   </header>
// );

// /* ─── Summary Card ────────────────────────────────────────────────────── */
// const SummaryCard = ({label, value}) => (
//   <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:'22px',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
//     <div style={{fontSize:9.5,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.13em',marginBottom:8}}>{label}</div>
//     <div style={{fontSize:32,fontWeight:900,color:C.text,letterSpacing:'-1.5px',lineHeight:1}}>{value}</div>
//   </div>
// );

// /* ─── Rating Summary Card ─────────────────────────────────────────────── */
// const RatingSummaryCard = ({ feedbacks }) => {
//   const total   = feedbacks.length;
//   const counts  = {
//     too_high: feedbacks.filter(f => (f.rating||'').toLowerCase() === 'too_high').length,
//     spot_on:  feedbacks.filter(f => (f.rating||'').toLowerCase() === 'spot_on').length,
//     too_low:  feedbacks.filter(f => (f.rating||'').toLowerCase() === 'too_low').length,
//   };
//   const pills = [
//   { key:'too_high', label:'Too High', bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' },
//   { key:'spot_on',  label:'Spot On',  bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' },
//   { key:'too_low',  label:'Too Low',  bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' },
// ];
//   return (
//     <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:'18px 22px',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
//       <div style={{fontSize:9.5,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.13em',marginBottom:10}}>Rating</div>
//       <div style={{fontSize:28,fontWeight:900,color:C.text,letterSpacing:'-1px',lineHeight:1,marginBottom:10}}>{total} Total</div>
//       <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
//         {pills.map(({key,label,bg,color,border}) => (
//           <span key={key} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:6,fontSize:10,fontWeight:800,background:bg,color,border:`1px solid ${border}`}}>
//             {label}
//             <span style={{fontWeight:900,fontSize:11}}>{counts[key]}</span>
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// };
// const RATING_MAP = {
//   too_high:  { label:'Too High',  bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' },
//   too_low:   { label:'Too Low',   bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' },
//   spot_on:   { label:'Spot On',   bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' },
//   fair:      { label:'Fair',      bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' },
// };
// const RatingBadge = ({ rating }) => {
//   const raw = (rating || '').toLowerCase().replace(/\s+/g,'_');
//   const cfg = RATING_MAP[raw] || { label: rating || '—', bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' };
//   return (
//     <span style={{
//       display:'inline-block', padding:'4px 11px', borderRadius:7,
//       fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em',
//       background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`,
//       whiteSpace:'nowrap',
//     }}>
//       {cfg.label}
//     </span>
//   );
// };

// /* ─── Info Modal ──────────────────────────────────────────────────────── */
// const InfoModal = ({ fb, type, onClose }) => {
//   if (!fb) return null;
//   const userName     = fb.user_name  || '—';
//   const userEmail    = fb.user_email || '—';
//   const valId        = fb.valuation_id ? `VAL-${String(fb.valuation_id).padStart(3,'0')}` : '—';
//   const address      = fb.property_address || '—';
//   const rating       = fb.rating || '—';
//   const comment      = fb.comment || '—';
//   const rewardStatus = fb.reward_status || 'Pending';
//   const date         = fb.created_at ? fb.created_at.slice(0,10) : '—';

//   const isReport = type === 'report';

//   const rows = isReport
//     ? [
//         { label:'Valuation ID',     value: valId },
//         { label:'Rating',           value: rating },
//         { label:'Feedback Comment', value: comment },
//         { label:'Date',             value: date },
//         { label:'Reward Status',    value: rewardStatus },
//       ]
//     : [
//         { label:'Name',               value: userName },
//         { label:'Email',              value: userEmail },
//         { label:'Feedback Comment',   value: comment },
//         { label:'Rating',             value: rating },
//         { label:'Reward Status',      value: rewardStatus },
//         { label:'Date',               value: date },
//       ];

//   return (
//     <>
//       <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.45)',animation:'fadeIn 0.18s ease'}}/>
//       <div style={{
//         position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
//         zIndex:201, background:C.white, borderRadius:20, width:'100%', maxWidth:460,
//         boxShadow:'0 20px 60px rgba(0,0,0,0.18)', animation:'fadeIn 0.18s ease',
//         overflow:'hidden',
//       }}>
//         {/* Modal Header */}
//         <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px 16px',borderBottom:`1px solid ${C.border}`}}>
//           <div style={{display:'flex',alignItems:'center',gap:10}}>
//             <div style={{width:34,height:34,borderRadius:10,background:'#FEF3E7',border:`1px solid #F5DEB3`,display:'flex',alignItems:'center',justifyContent:'center'}}>
//               {isReport ? <Home size={16} color={C.copper}/> : <User size={16} color={C.copper}/>}
//             </div>
//             <div>
//               <div style={{fontSize:15,fontWeight:800,color:C.text}}>{isReport ? 'Valuation Report' : 'User Info'}</div>
//               <div style={{fontSize:11,color:C.muted,marginTop:1}}>{isReport ? valId : userName}</div>
//             </div>
//           </div>
//           <button onClick={onClose} style={{background:'#F3F3F4',border:'none',width:30,height:30,borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:C.muted}}>
//             <X size={14}/>
//           </button>
//         </div>

//         {/* Modal Body */}
//         <div style={{padding:'20px 24px 24px'}}>
//           {rows.map(({label,value}) => (
//             <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'10px 0',borderBottom:`1px solid ${C.border}`}}>
//               <span style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.09em',flexShrink:0,marginRight:16,paddingTop:1}}>{label}</span>
//               <span style={{fontSize:13,fontWeight:600,color:C.text,textAlign:'right',wordBreak:'break-word',maxWidth:260}}>{value}</span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// };

// /* ─── Main Screen ─────────────────────────────────────────────────────── */
// const AdminFeedbackScreen = () => {
//   const navigate     = useNavigate();
//   const handleLogout = useLogout();

//   const [feedbacks,  setFeedbacks]  = useState([]);
//   const [loading,    setLoading]    = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sideOpen,   setSideOpen]   = useState(false);
//   const [activeNav,  setActiveNav]  = useState('feedback');
//   const [modal,      setModal]      = useState(null); // { fb, type: 'report' | 'user' }

//   useEffect(() => {
//     fetchFeedbacks();

//     // Real-time subscription to feedback table changes
//     const channel = supabase
//       .channel('feedbacks-realtime')
//       .on(
//         'postgres_changes',
//         { event: '*', schema: 'public', table: 'feedback' },
//         () => fetchFeedbacks()
//       )
//       .subscribe();

//     return () => supabase.removeChannel(channel);
//   }, []);

//   useEffect(() => {
//     const esc = (e) => { if (e.key === 'Escape') setSideOpen(false); };
//     window.addEventListener('keydown', esc);
//     return () => window.removeEventListener('keydown', esc);
//   }, []);

//   const fetchFeedbacks = async () => {
//     try {
//       setLoading(true);
//       // Fetch directly — user_name, user_email are flat columns in the feedback table
//       const { data, error } = await supabase
//         .from('feedback')
//         .select('*')
//         .order('created_at', { ascending: true });

//       if (error) throw error;
//       setFeedbacks(data || []);
//     } catch (err) {
//       console.error('Error fetching feedbacks:', err);
//       setFeedbacks([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRewardToggle = async (fb) => {
//     const currentStatus = fb.reward_status || 'Pending';
//     const newStatus = currentStatus === 'Given' ? 'Pending' : 'Given';
//     try {
//       const { error } = await supabase
//         .from('feedback')
//         .update({ reward_status: newStatus })
//         .eq('id', fb.id);

//       if (error) throw error;

//       setFeedbacks(prev =>
//         prev.map(f => f.id === fb.id ? { ...f, reward_status: newStatus } : f)
//       );
//     } catch (err) {
//       console.error('Error updating reward status:', err);
//     }
//   };

//   const handleNav = (key) => {
//     setActiveNav(key);
//     if (key !== 'feedback') navigate(key === 'overview' ? '/admin-dashboard' : `/admin/${key}`);
//   };

//   const filtered = feedbacks.filter(fb => {
//     const term    = searchTerm.toLowerCase();
//     const uname   = (fb.user_name || '').toLowerCase();
//     const email   = (fb.user_email || '').toLowerCase();
//     const comment = (fb.comment || '').toLowerCase();
//     return uname.includes(term) || email.includes(term) || comment.includes(term);
//   });

//   const spotOnCount = filtered.filter(f => (f.rating || '').toLowerCase() === 'spot_on').length;
//   const givenCount = filtered.filter(f => f.reward_status === 'Given').length;

// //   const COLS = ['ID', 'User', 'Report (Valuation)', 'Rating', 'Feedback Message', 'Date', 'Reward Status', 'Actions'];
// const COLS = ['ID', 'User', 'Report (Valuation)', 'Rating', 'Stars', 'Feedback Message', 'Date', 'Reward Status'];

//   return (
//     <div style={{background:C.bg, minHeight:'100vh'}}>
//       <style>{globalCss}</style>

//       <Sidebar open={sideOpen} onClose={()=>setSideOpen(false)} active={activeNav} onNav={handleNav} onLogout={handleLogout}/>
//       <DesktopHeader onHamburger={()=>setSideOpen(true)}/>
//       <MobileHeader  onHamburger={()=>setSideOpen(true)}/>
//       {modal && <InfoModal fb={modal.fb} type={modal.type} onClose={()=>setModal(null)}/>}

//       <main className="main-wrap" style={{paddingTop:60}}>
//         <div className="main-inner" style={{padding:'26px 22px', maxWidth:1400, margin:'0 auto'}}>

//           {/* ── Page Title Row ── matches screenshot: title left, search+filter right */}
//           <div
//             className="page-title-row"
//             style={{
//               display:'flex',
//               alignItems:'center',
//               justifyContent:'space-between',
//               gap:16,
//               marginBottom:22,
//             }}
//           >
//             {/* Left: Title + subtitle */}
//             <div>
//               <h1
//                 className="page-h1"
//                 style={{
//                   fontSize:28,
//                   fontWeight:900,
//                   color:C.text,
//                   letterSpacing:'-0.7px',
//                   lineHeight:1.1,
//                 }}
//               >
//                 User Feedback
//               </h1>
//               <p style={{fontSize:13.5, color:C.muted, marginTop:5, fontWeight:400}}>
//                 Review feedback provided by users on their property valuation reports.
//               </p>
//             </div>

//             {/* Right: Search + Filter button */}
//             <div
//               className="page-title-right"
//               style={{display:'flex', alignItems:'center', gap:8, flexShrink:0}}
//             >
//               {/* Search input */}
//               <div style={{position:'relative'}}>
//                 <Search
//                   size={14}
//                   color={C.muted}
//                   strokeWidth={2}
//                   style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none'}}
//                 />
//                 <input
//                   className="search-input"
//                   type="text"
//                   placeholder="Search feedback..."
//                   value={searchTerm}
//                   onChange={e => setSearchTerm(e.target.value)}
//                   style={{
//                     background:C.white,
//                     border:`1px solid ${C.border}`,
//                     borderRadius:22,
//                     paddingLeft:38,
//                     paddingRight:16,
//                     paddingTop:10,
//                     paddingBottom:10,
//                     fontSize:13,
//                     color:C.text,
//                     width:260,
//                     fontFamily:'inherit',
//                     transition:'border-color 0.15s, box-shadow 0.15s',
//                   }}
//                 />
//               </div>

//               {/* Filter icon button */}
//               <button
//                 className="filter-btn"
//                 title="Filter"
//                 style={{
//                   width:40,
//                   height:40,
//                   borderRadius:22,
//                   border:`1px solid ${C.border}`,
//                   background:C.white,
//                   cursor:'pointer',
//                   display:'flex',
//                   alignItems:'center',
//                   justifyContent:'center',
//                   flexShrink:0,
//                   color:C.muted,
//                 }}
//               >
//                 <Filter size={15} strokeWidth={2}/>
//               </button>
//             </div>
//           </div>

//           {/* Summary Cards */}
//           <div className="summary-grid" style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16}}>
//             <SummaryCard label="Total Feedback" value={filtered.length}/>
//             <RatingSummaryCard feedbacks={filtered}/>
//             <SummaryCard label="Rewards Given"   value={givenCount}/>
//           </div>

//           {/* Table */}
//           {loading ? (
//             <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:200}}>
//               <div style={{width:30, height:30, borderRadius:'50%', border:`3px solid ${C.copper}`, borderTopColor:'transparent', animation:'spin 0.75s linear infinite'}}/>
//             </div>
//           ) : (
//             <div className="table-wrap">
//               <div className="table-scroll">
//                 <table>
//                   {/* <colgroup>
//                     <col style={{width:80}}/>
//                     <col style={{width:170}}/>
//                     <col style={{width:150}}/>
//                     <col style={{width:120}}/>
//                     <col style={{width:220}}/>
//                     <col style={{width:100}}/>
//                     <col style={{width:120}}/>
//                     <col style={{width:90}}/>
//                   </colgroup> */}

//                   <colgroup>
//   <col style={{width:80}}/>
//   <col style={{width:170}}/>
//   <col style={{width:150}}/>
//   <col style={{width:120}}/>
//   <col style={{width:110}}/>
//   <col style={{width:200}}/>
//   <col style={{width:100}}/>
//   <col style={{width:120}}/>
// </colgroup>
//                   <thead>
//                     <tr style={{background:C.bg, borderBottom:`1px solid ${C.border}`}}>
//                       {COLS.map(h => (
//                         <th key={h} style={{padding:'14px 16px', textAlign: h==='Actions'?'right':'left', fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.12em', whiteSpace:'nowrap'}}>
//                           {h}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filtered.length === 0 ? (
//                       <tr>
//                         <td colSpan={COLS.length} style={{textAlign:'center', padding:'48px 0', color:C.muted, fontSize:14, fontWeight:600}}>
//                           No feedback found.
//                         </td>
//                       </tr>
//                     ) : filtered.map((fb, idx) => {
//                       const fbId         = String(fb.id || '');
//                       const displayId    = /^\d+$/.test(fbId) ? `FB-${fbId.padStart(3,'0')}` : `#${fbId.slice(0,8)}`;
//                       const userName     = fb.user_name || '—';
//                       const userEmail    = fb.user_email || '';
//                       const address      = fb.property_address || '—';
//                       const rawValId     = fb.valuation_id || '';
//                       const displayValId = rawValId
//                         ? (/^\d+$/.test(String(rawValId)) ? `VAL-${String(rawValId).padStart(3,'0')}` : String(rawValId))
//                         : '—';
//                       const rating       = fb.rating || '—';
//                       const comment      = fb.comment || '—';
//                       const rewardStatus = fb.reward_status || 'Pending';
//                       const date         = fb.created_at ? fb.created_at.slice(0, 10) : '—';
//                       const isGiven      = rewardStatus === 'Given';

//                       return (
//                         <tr
//   key={fb.id}
//   onClick={() => fb.valuation_id && navigate(`/report?id=${fb.valuation_id}`)}
//   style={{borderBottom: idx < filtered.length-1 ? `1px solid ${C.border}` : 'none', transition:'background 0.1s', cursor: fb.valuation_id ? 'pointer' : 'default'}}
//   onMouseEnter={e => e.currentTarget.style.background = C.bg}
//   onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
// >
//                           {/* ID */}
//                           <td style={{padding:'20px 16px'}}>
//                             <span style={{fontSize:11, fontWeight:800, color:C.muted, whiteSpace:'nowrap'}}>{displayId}</span>
//                           </td>

//                           {/* User */}
//                           <td style={{padding:'20px 16px', overflow:'hidden'}}>
//   <div style={{overflow:'hidden', minWidth:0}}>
//     <div style={{fontSize:13, fontWeight:700, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{userName}</div>
//     {userEmail && <div style={{fontSize:10, color:C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:1}}>{userEmail}</div>}
//   </div>
// </td>

// {/* Report (Valuation) */}
// <td style={{padding:'20px 16px', overflow:'hidden'}}>
//   <span style={{fontSize:12, fontWeight:800, color:C.text, whiteSpace:'nowrap'}}>{displayValId}</span>
// </td>
//                           {/* Rating */}
//                           {/* <td style={{padding:'20px 16px'}}>
//                             <RatingBadge rating={rating}/>
//                           </td> */}

//                           {/* Rating */}
// <td style={{padding:'20px 16px'}}>
//   <RatingBadge rating={rating}/>
// </td>

// {/* Stars */}
// <td style={{padding:'20px 16px'}}>
//   {fb.star > 0 ? (
//     <div style={{display:'flex', alignItems:'center', gap:2}}>
//       {[1,2,3,4,5].map(s => (
//         <svg key={s} width="14" height="14" viewBox="0 0 24 24"
//           fill={s <= fb.star ? '#C8832A' : 'none'}
//           stroke={s <= fb.star ? '#C8832A' : '#D1D5DB'}
//           strokeWidth="1.8">
//           <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
//         </svg>
//       ))}
//       <span style={{fontSize:14, fontWeight:1000, color:C.text, marginLeft:4}}>{fb.star}</span>
//     </div>
//   ) : (
//     <span style={{fontSize:11, color:C.muted}}>—</span>
//   )}
// </td>

//                           {/* Feedback Message */}
//                           <td style={{padding:'20px 16px', overflow:'hidden'}}>
//                             <p style={{fontSize:12, color:C.text, fontStyle:'italic', fontWeight:500, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
//                               "{comment}"
//                             </p>
//                           </td>

//                           {/* Date */}
//                           <td style={{padding:'20px 16px', fontSize:12, color:C.muted, fontWeight:600, whiteSpace:'nowrap'}}>
//                             {date}
//                           </td>

//                           {/* Reward Status */}
//                           <td style={{padding:'20px 16px'}}>
//                             <button className="reward-btn" onClick={() => handleRewardToggle(fb)}
//                               style={{
//                                 padding:'4px 12px', borderRadius:7, fontSize:9.5, fontWeight:800,
//                                 textTransform:'uppercase', letterSpacing:'0.08em', cursor:'pointer',
//                                 background: isGiven ? '#D1FAE5' : '#FEF3C7',
//                                 color:      isGiven ? '#059669' : '#D97706',
//                                 border:     `1px solid ${isGiven ? '#A7F3D0' : '#FDE68A'}`
//                               }}>
//                               {rewardStatus}
//                             </button>
//                           </td>

//                           {/* Actions */}
//                           {/* <td style={{padding:'20px 16px', textAlign:'right'}}>
//                             <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4}}>
//                               <button className="tbl-action"
//                                 onClick={() => setModal({ fb, type:'report' })}
//                                 style={{padding:'6px', borderRadius:7, border:`1px solid ${C.border}`, background:C.white, cursor:'pointer', display:'flex', color:C.muted, flexShrink:0}}
//                                 title="View Report">
//                                 <ExternalLink size={14}/>
//                               </button>
//                               <button className="tbl-action"
//                                 onClick={() => setModal({ fb, type:'user' })}
//                                 style={{padding:'6px', borderRadius:7, border:`1px solid ${C.border}`, background:C.white, cursor:'pointer', display:'flex', color:C.muted, flexShrink:0}}
//                                 title="View User">
//                                 <User size={14}/>
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

// export default AdminFeedbackScreen;














// screens/AdminFeedbackScreen.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { adminService } from '../services/adminService';
import { useLogout } from '../hooks/useLogout';
import {
  Search, Filter, Mail, UserCheck, UserX, Trash2,
  Users, LayoutDashboard, Home, MessageSquare, BookOpen,
  BarChart2, Settings, LogOut, Bell, User, Menu, X, CreditCard,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

/* ─── Tokens ─────────────────────────────────────────────────────────── */
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
  { label:'Overview',   icon:LayoutDashboard, key:'overview'   },
  { label:'Users',      icon:Users,           key:'users'      },
  { label:'Valuations', icon:Home,            key:'valuations' },
  { label:'Feedback',   icon:MessageSquare,   key:'feedback'   },
  { label:'Blogs',      icon:BookOpen,        key:'blogs'      },
  { label:'Analytics',  icon:BarChart2,       key:'analytics'  },
  { label:'Discount Codes', icon: CreditCard, key:'discount-codes' },
  { label:'Settings',   icon:Settings,        key:'settings'   },
];

/* ─── CSS ─────────────────────────────────────────────────────────────── */
const globalCss = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter','Segoe UI',system-ui,sans-serif}
  @keyframes spin    {to{transform:rotate(360deg)}}
  @keyframes slideIn {from{transform:translateX(-100%)}to{transform:translateX(0)}}
  @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.15);border-radius:4px}
  ::-webkit-scrollbar-track{background:transparent}
  .nav-btn{transition:background 0.14s}
  .nav-btn:hover{background:rgba(255,255,255,0.07)!important}
  .hdr-desktop{display:flex}
  .hdr-mobile {display:none}
  .tbl-action{transition:background 0.1s,color 0.1s}
  .tbl-action:hover{background:#F3F3F4!important;color:#C8832A!important}
  .reward-btn{transition:opacity 0.14s}
  .reward-btn:hover{opacity:0.75}
  .filter-btn{transition:background 0.14s,border-color 0.14s}
  .filter-btn:hover{background:#F3F3F4!important}
  .search-input:focus{outline:none;border-color:#C8832A!important;box-shadow:0 0 0 3px rgba(200,131,42,0.1)}
  .table-wrap{
    background:#fff;
    border-radius:20px;
    border:1px solid #E9E9EA;
    box-shadow:0 1px 4px rgba(0,0,0,0.05);
    overflow:hidden;
  }
  .table-scroll{
    overflow-x:auto;
    -webkit-overflow-scrolling:touch;
  }
  .table-scroll table{
    min-width:1100px;
    border-collapse:collapse;
    width:100%;
    table-layout:fixed;
  }
  @media(max-width:768px){
    .hdr-desktop{display:none!important}
    .hdr-mobile {display:flex!important}
    .main-wrap  {padding-top:60px!important}
    .main-inner {padding:16px 12px!important}
    .page-title-row{flex-direction:column!important;align-items:flex-start!important;gap:14px!important}
    .page-title-right{width:100%!important}
    .search-input{width:100%!important}
    .summary-grid{grid-template-columns:1fr!important}
    .table-wrap{border-radius:16px}
  }
`;

/* ─── Sidebar ─────────────────────────────────────────────────────────── */
const Sidebar = ({ open, onClose, active, onNav, onLogout }) => {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:98,background:'rgba(0,0,0,0.5)',animation:'fadeIn 0.18s ease'}}/>
      <aside style={{position:'fixed',top:0,left:0,bottom:0,width:SIDEBAR_W,background:C.sidebar,display:'flex',flexDirection:'column',zIndex:99,animation:'slideIn 0.22s ease',boxShadow:'6px 0 28px rgba(0,0,0,0.28)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 18px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
          <div>
            <span style={{color:C.white,fontWeight:900,fontSize:16,letterSpacing:'0.05em'}}>ACQAR </span>
            <span style={{color:C.copper,fontWeight:900,fontSize:16,letterSpacing:'0.05em'}}>ADMIN</span>
          </div>
          <button onClick={onClose} style={{background:'rgba(255,255,255,0.08)',border:'none',width:28,height:28,borderRadius:6,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:C.sidebarText}}>
            <X size={14}/>
          </button>
        </div>
        <nav style={{flex:1,padding:'10px',overflowY:'auto'}}>
          {navItems.map(({label,icon:Icon,key})=>{
            const on = active===key;
            return (
              <button key={key} className="nav-btn" onClick={()=>{onNav(key);onClose();}}
                style={{width:'100%',display:'flex',alignItems:'center',gap:11,padding:'11px 14px',borderRadius:10,border:'none',background:on?C.activeNav:'transparent',color:on?C.activeText:C.sidebarText,cursor:'pointer',marginBottom:2,fontSize:13.5,fontWeight:on?700:400,textAlign:'left'}}>
                <Icon size={17} strokeWidth={on?2.2:1.7}/>{label}
              </button>
            );
          })}
        </nav>
        <div style={{padding:'12px 10px',borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
          <button className="nav-btn" onClick={onLogout}
            style={{width:'100%',display:'flex',alignItems:'center',gap:11,padding:'11px 14px',borderRadius:10,border:'none',background:'transparent',color:C.sidebarText,cursor:'pointer',fontSize:13.5,fontWeight:400,textAlign:'left'}}>
            <LogOut size={17} strokeWidth={1.7}/>Logout
          </button>
        </div>
      </aside>
    </>
  );
};

/* ─── Desktop Header ──────────────────────────────────────────────────── */
const DesktopHeader = ({onHamburger}) => (
  <header className="hdr-desktop" style={{position:'fixed',top:0,left:0,right:0,height:60,background:C.white,borderBottom:`1px solid ${C.border}`,alignItems:'center',justifyContent:'space-between',padding:'0 22px',zIndex:90,gap:12}}>
    <div style={{display:'flex',alignItems:'center',gap:14,flex:1,minWidth:0}}>
      <button onClick={onHamburger} style={{background:'none',border:'none',cursor:'pointer',display:'flex',color:C.muted,padding:4}}>
        <Menu size={22} strokeWidth={1.8}/>
      </button>
      <div style={{display:'flex',alignItems:'center',gap:8,background:'#F3F3F4',borderRadius:22,padding:'8px 16px',maxWidth:360,width:'100%',border:`1px solid ${C.border}`}}>
        <Search size={14} color={C.muted} strokeWidth={2} style={{flexShrink:0}}/>
        <span style={{fontSize:13,color:C.muted,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Search reports, users, or articles...</span>
      </div>
    </div>
    <div style={{display:'flex',alignItems:'center',gap:20,flexShrink:0}}>
      <div style={{position:'relative',cursor:'pointer',display:'flex'}}>
        <Bell size={20} color={C.muted} strokeWidth={1.8}/>
        <span style={{position:'absolute',top:-2,right:-2,width:7,height:7,borderRadius:'50%',background:C.copper,border:`2px solid ${C.white}`}}/>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:13,fontWeight:700,color:C.text}}>Admin User</div>
          <div style={{fontSize:9,fontWeight:700,color:C.muted,letterSpacing:'0.1em',textTransform:'uppercase'}}>Super Admin</div>
        </div>
        <div style={{width:36,height:36,borderRadius:'50%',background:'#F5EBE0',border:`2px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
          <User size={17} color={C.copper} strokeWidth={1.8}/>
        </div>
      </div>
    </div>
  </header>
);

/* ─── Mobile Header ───────────────────────────────────────────────────── */
const MobileHeader = ({onHamburger}) => (
  <header className="hdr-mobile" style={{position:'fixed',top:0,left:0,right:0,height:60,background:C.sidebar,alignItems:'center',justifyContent:'space-between',padding:'0 18px',zIndex:90}}>
    <div>
      <span style={{color:C.white,fontWeight:900,fontSize:16,letterSpacing:'0.05em'}}>ACQAR </span>
      <span style={{color:C.copper,fontWeight:900,fontSize:16,letterSpacing:'0.05em'}}>ADMIN</span>
    </div>
    <button onClick={onHamburger} style={{background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',color:C.white,padding:4}}>
      <Menu size={24} strokeWidth={2}/>
    </button>
  </header>
);

/* ─── Summary Card ────────────────────────────────────────────────────── */
const SummaryCard = ({label, value}) => (
  <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:'22px',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
    <div style={{fontSize:9.5,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.13em',marginBottom:8}}>{label}</div>
    <div style={{fontSize:32,fontWeight:900,color:C.text,letterSpacing:'-1.5px',lineHeight:1}}>{value}</div>
  </div>
);

/* ─── Rating Summary Card ─────────────────────────────────────────────── */
const RatingSummaryCard = ({ feedbacks }) => {
  const total   = feedbacks.length;
  const counts  = {
    too_high: feedbacks.filter(f => (f.rating||'').toLowerCase() === 'too_high').length,
    spot_on:  feedbacks.filter(f => (f.rating||'').toLowerCase() === 'spot_on').length,
    too_low:  feedbacks.filter(f => (f.rating||'').toLowerCase() === 'too_low').length,
  };
  const pills = [
  { key:'too_high', label:'Too High', bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' },
  { key:'spot_on',  label:'Spot On',  bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' },
  { key:'too_low',  label:'Too Low',  bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' },
];
  return (
    <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:'18px 22px',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
      <div style={{fontSize:9.5,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.13em',marginBottom:10}}>Rating</div>
      <div style={{fontSize:28,fontWeight:900,color:C.text,letterSpacing:'-1px',lineHeight:1,marginBottom:10}}>{total} Total</div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        {pills.map(({key,label,bg,color,border}) => (
          <span key={key} style={{display:'inline-flex',alignItems:'center',gap:5,padding:'3px 10px',borderRadius:6,fontSize:10,fontWeight:800,background:bg,color,border:`1px solid ${border}`}}>
            {label}
            <span style={{fontWeight:900,fontSize:11}}>{counts[key]}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
const RATING_MAP = {
  too_high:  { label:'Too High',  bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' },
  too_low:   { label:'Too Low',   bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' },
  spot_on:   { label:'Spot On',   bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' },
  fair:      { label:'Fair',      bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' },
};
const RatingBadge = ({ rating }) => {
  const raw = (rating || '').toLowerCase().replace(/\s+/g,'_');
  const cfg = RATING_MAP[raw] || { label: rating || '—', bg:'#F3F3F4', color:'#6B6B6B', border:'#E9E9EA' };
  return (
    <span style={{
      display:'inline-block', padding:'4px 11px', borderRadius:7,
      fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em',
      background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`,
      whiteSpace:'nowrap',
    }}>
      {cfg.label}
    </span>
  );
};

/* ─── Info Modal ──────────────────────────────────────────────────────── */
const InfoModal = ({ fb, type, onClose }) => {
  if (!fb) return null;
  const userName     = fb.user_name  || '—';
  const userEmail    = fb.user_email || '—';
  const valId        = fb.valuation_id ? `VAL-${String(fb.valuation_id).padStart(3,'0')}` : '—';
  const address      = fb.property_address || '—';
  const rating       = fb.rating || '—';
  const comment      = fb.comment || '—';
  const rewardStatus = fb.reward_status || 'Pending';
  const date         = fb.created_at ? fb.created_at.slice(0,10) : '—';

  const isReport = type === 'report';

  const rows = isReport
    ? [
        { label:'Valuation ID',     value: valId },
        { label:'Rating',           value: rating },
        { label:'Feedback Comment', value: comment },
        { label:'Date',             value: date },
        { label:'Reward Status',    value: rewardStatus },
      ]
    : [
        { label:'Name',               value: userName },
        { label:'Email',              value: userEmail },
        { label:'Feedback Comment',   value: comment },
        { label:'Rating',             value: rating },
        { label:'Reward Status',      value: rewardStatus },
        { label:'Date',               value: date },
      ];

  return (
    <>
      <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.45)',animation:'fadeIn 0.18s ease'}}/>
      <div style={{
        position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        zIndex:201, background:C.white, borderRadius:20, width:'100%', maxWidth:460,
        boxShadow:'0 20px 60px rgba(0,0,0,0.18)', animation:'fadeIn 0.18s ease',
        overflow:'hidden',
      }}>
        {/* Modal Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px 16px',borderBottom:`1px solid ${C.border}`}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:34,height:34,borderRadius:10,background:'#FEF3E7',border:`1px solid #F5DEB3`,display:'flex',alignItems:'center',justifyContent:'center'}}>
              {isReport ? <Home size={16} color={C.copper}/> : <User size={16} color={C.copper}/>}
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:C.text}}>{isReport ? 'Valuation Report' : 'User Info'}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:1}}>{isReport ? valId : userName}</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:'#F3F3F4',border:'none',width:30,height:30,borderRadius:8,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:C.muted}}>
            <X size={14}/>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{padding:'20px 24px 24px'}}>
          {rows.map(({label,value}) => (
            <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'10px 0',borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.09em',flexShrink:0,marginRight:16,paddingTop:1}}>{label}</span>
              <span style={{fontSize:13,fontWeight:600,color:C.text,textAlign:'right',wordBreak:'break-word',maxWidth:260}}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

/* ─── Main Screen ─────────────────────────────────────────────────────── */
const AdminFeedbackScreen = () => {
  const navigate     = useNavigate();
  const handleLogout = useLogout();

  const [feedbacks,  setFeedbacks]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sideOpen,   setSideOpen]   = useState(false);
  const [activeNav,  setActiveNav]  = useState('feedback');
  const [modal,      setModal]      = useState(null); // { fb, type: 'report' | 'user' }

  useEffect(() => {
    fetchFeedbacks();

    // Real-time subscription to feedback table changes
    const channel = supabase
      .channel('feedbacks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feedback' },
        () => fetchFeedbacks()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') setSideOpen(false); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      // Fetch directly — user_name, user_email are flat columns in the feedback table
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setFeedbacks(data || []);
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRewardToggle = async (fb) => {
    const currentStatus = fb.reward_status || 'Pending';
    const newStatus = currentStatus === 'Given' ? 'Pending' : 'Given';
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ reward_status: newStatus })
        .eq('id', fb.id);

      if (error) throw error;

      setFeedbacks(prev =>
        prev.map(f => f.id === fb.id ? { ...f, reward_status: newStatus } : f)
      );
    } catch (err) {
      console.error('Error updating reward status:', err);
    }
  };

 const handleNav = (key) => {
    setActiveNav(key);
    if (key === 'overview') navigate('/admin-dashboard');
    else if (key !== 'feedback') navigate(`/admin/${key}`);
  };

  const filtered = feedbacks.filter(fb => {
    const term    = searchTerm.toLowerCase();
    const uname   = (fb.user_name || '').toLowerCase();
    const email   = (fb.user_email || '').toLowerCase();
    const comment = (fb.comment || '').toLowerCase();
    return uname.includes(term) || email.includes(term) || comment.includes(term);
  });

  const spotOnCount = filtered.filter(f => (f.rating || '').toLowerCase() === 'spot_on').length;
  const givenCount = filtered.filter(f => f.reward_status === 'Given').length;

//   const COLS = ['ID', 'User', 'Report (Valuation)', 'Rating', 'Feedback Message', 'Date', 'Reward Status', 'Actions'];
const COLS = ['ID', 'User', 'Report (Valuation)', 'Rating', 'Stars', 'Feedback Message', 'Date', 'Reward Status'];

  return (
    <div style={{background:C.bg, minHeight:'100vh'}}>
      <Helmet>
  <title>Admin | Acqar</title>
  <meta name="robots" content="noindex, nofollow" />
</Helmet>
      <style>{globalCss}</style>

      <Sidebar open={sideOpen} onClose={()=>setSideOpen(false)} active={activeNav} onNav={handleNav} onLogout={handleLogout}/>
      <DesktopHeader onHamburger={()=>setSideOpen(true)}/>
      <MobileHeader  onHamburger={()=>setSideOpen(true)}/>
      {modal && <InfoModal fb={modal.fb} type={modal.type} onClose={()=>setModal(null)}/>}

      <main className="main-wrap" style={{paddingTop:60}}>
        <div className="main-inner" style={{padding:'26px 22px', maxWidth:1400, margin:'0 auto'}}>

          {/* ── Page Title Row ── matches screenshot: title left, search+filter right */}
          <div
            className="page-title-row"
            style={{
              display:'flex',
              alignItems:'center',
              justifyContent:'space-between',
              gap:16,
              marginBottom:22,
            }}
          >
            {/* Left: Title + subtitle */}
            <div>
              <h1
                className="page-h1"
                style={{
                  fontSize:28,
                  fontWeight:900,
                  color:C.text,
                  letterSpacing:'-0.7px',
                  lineHeight:1.1,
                }}
              >
                User Feedback
              </h1>
              <p style={{fontSize:13.5, color:C.muted, marginTop:5, fontWeight:400}}>
                Review feedback provided by users on their property valuation reports.
              </p>
            </div>

            {/* Right: Search + Filter button */}
            <div
              className="page-title-right"
              style={{display:'flex', alignItems:'center', gap:8, flexShrink:0}}
            >
              {/* Search input */}
              <div style={{position:'relative'}}>
                <Search
                  size={14}
                  color={C.muted}
                  strokeWidth={2}
                  style={{position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', pointerEvents:'none'}}
                />
                <input
                  className="search-input"
                  type="text"
                  placeholder="Search feedback..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    background:C.white,
                    border:`1px solid ${C.border}`,
                    borderRadius:22,
                    paddingLeft:38,
                    paddingRight:16,
                    paddingTop:10,
                    paddingBottom:10,
                    fontSize:13,
                    color:C.text,
                    width:260,
                    fontFamily:'inherit',
                    transition:'border-color 0.15s, box-shadow 0.15s',
                  }}
                />
              </div>

              {/* Filter icon button */}
              <button
                className="filter-btn"
                title="Filter"
                style={{
                  width:40,
                  height:40,
                  borderRadius:22,
                  border:`1px solid ${C.border}`,
                  background:C.white,
                  cursor:'pointer',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center',
                  flexShrink:0,
                  color:C.muted,
                }}
              >
                <Filter size={15} strokeWidth={2}/>
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="summary-grid" style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16}}>
            <SummaryCard label="Total Feedback" value={filtered.length}/>
            <RatingSummaryCard feedbacks={filtered}/>
            <SummaryCard label="Rewards Given"   value={givenCount}/>
          </div>

          {/* Table */}
          {loading ? (
            <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:200}}>
              <div style={{width:30, height:30, borderRadius:'50%', border:`3px solid ${C.copper}`, borderTopColor:'transparent', animation:'spin 0.75s linear infinite'}}/>
            </div>
          ) : (
            <div className="table-wrap">
              <div className="table-scroll">
                <table>
                  {/* <colgroup>
                    <col style={{width:80}}/>
                    <col style={{width:170}}/>
                    <col style={{width:150}}/>
                    <col style={{width:120}}/>
                    <col style={{width:220}}/>
                    <col style={{width:100}}/>
                    <col style={{width:120}}/>
                    <col style={{width:90}}/>
                  </colgroup> */}

                  <colgroup>
  <col style={{width:80}}/>
  <col style={{width:170}}/>
  <col style={{width:150}}/>
  <col style={{width:120}}/>
  <col style={{width:110}}/>
  <col style={{width:200}}/>
  <col style={{width:100}}/>
  <col style={{width:120}}/>
</colgroup>
                  <thead>
                    <tr style={{background:C.bg, borderBottom:`1px solid ${C.border}`}}>
                      {COLS.map(h => (
                        <th key={h} style={{padding:'14px 16px', textAlign: h==='Actions'?'right':'left', fontSize:10, fontWeight:700, color:C.muted, textTransform:'uppercase', letterSpacing:'0.12em', whiteSpace:'nowrap'}}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={COLS.length} style={{textAlign:'center', padding:'48px 0', color:C.muted, fontSize:14, fontWeight:600}}>
                          No feedback found.
                        </td>
                      </tr>
                    ) : filtered.map((fb, idx) => {
                      const fbId         = String(fb.id || '');
                      const displayId    = /^\d+$/.test(fbId) ? `FB-${fbId.padStart(3,'0')}` : `#${fbId.slice(0,8)}`;
                      const userName     = fb.user_name || '—';
                      const userEmail    = fb.user_email || '';
                      const address      = fb.property_address || '—';
                      const rawValId     = fb.valuation_id || '';
                      const displayValId = rawValId
                        ? (/^\d+$/.test(String(rawValId)) ? `VAL-${String(rawValId).padStart(3,'0')}` : String(rawValId))
                        : '—';
                      const rating       = fb.rating || '—';
                      const comment      = fb.comment || '—';
                      const rewardStatus = fb.reward_status || 'Pending';
                      const date         = fb.created_at ? fb.created_at.slice(0, 10) : '—';
                      const isGiven      = rewardStatus === 'Given';

                      return (
                        <tr
  key={fb.id}
  onClick={() => fb.valuation_id && navigate(`/report?id=${fb.valuation_id}`)}
  style={{borderBottom: idx < filtered.length-1 ? `1px solid ${C.border}` : 'none', transition:'background 0.1s', cursor: fb.valuation_id ? 'pointer' : 'default'}}
  onMouseEnter={e => e.currentTarget.style.background = C.bg}
  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
>
                          {/* ID */}
                          <td style={{padding:'20px 16px'}}>
                            <span style={{fontSize:11, fontWeight:800, color:C.muted, whiteSpace:'nowrap'}}>{displayId}</span>
                          </td>

                          {/* User */}
                          <td style={{padding:'20px 16px', overflow:'hidden'}}>
  <div style={{overflow:'hidden', minWidth:0}}>
    <div style={{fontSize:13, fontWeight:700, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{userName}</div>
    {userEmail && <div style={{fontSize:10, color:C.muted, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:1}}>{userEmail}</div>}
  </div>
</td>

{/* Report (Valuation) */}
<td style={{padding:'20px 16px', overflow:'hidden'}}>
  <span style={{fontSize:12, fontWeight:800, color:C.text, whiteSpace:'nowrap'}}>{displayValId}</span>
</td>
                          {/* Rating */}
                          {/* <td style={{padding:'20px 16px'}}>
                            <RatingBadge rating={rating}/>
                          </td> */}

                          {/* Rating */}
<td style={{padding:'20px 16px'}}>
  <RatingBadge rating={rating}/>
</td>

{/* Stars */}
<td style={{padding:'20px 16px'}}>
  {fb.star > 0 ? (
    <div style={{display:'flex', alignItems:'center', gap:2}}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="14" height="14" viewBox="0 0 24 24"
          fill={s <= fb.star ? '#C8832A' : 'none'}
          stroke={s <= fb.star ? '#C8832A' : '#D1D5DB'}
          strokeWidth="1.8">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
      <span style={{fontSize:14, fontWeight:1000, color:C.text, marginLeft:4}}>{fb.star}</span>
    </div>
  ) : (
    <span style={{fontSize:11, color:C.muted}}>—</span>
  )}
</td>

                          {/* Feedback Message */}
                          <td style={{padding:'20px 16px', overflow:'hidden'}}>
                            <p style={{fontSize:12, color:C.text, fontStyle:'italic', fontWeight:500, lineHeight:1.55, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                              "{comment}"
                            </p>
                          </td>

                          {/* Date */}
                          <td style={{padding:'20px 16px', fontSize:12, color:C.muted, fontWeight:600, whiteSpace:'nowrap'}}>
                            {date}
                          </td>

                          {/* Reward Status */}
                          <td style={{padding:'20px 16px'}}>
                            <button className="reward-btn" onClick={() => handleRewardToggle(fb)}
                              style={{
                                padding:'4px 12px', borderRadius:7, fontSize:9.5, fontWeight:800,
                                textTransform:'uppercase', letterSpacing:'0.08em', cursor:'pointer',
                                background: isGiven ? '#D1FAE5' : '#FEF3C7',
                                color:      isGiven ? '#059669' : '#D97706',
                                border:     `1px solid ${isGiven ? '#A7F3D0' : '#FDE68A'}`
                              }}>
                              {rewardStatus}
                            </button>
                          </td>

                          {/* Actions */}
                          {/* <td style={{padding:'20px 16px', textAlign:'right'}}>
                            <div style={{display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4}}>
                              <button className="tbl-action"
                                onClick={() => setModal({ fb, type:'report' })}
                                style={{padding:'6px', borderRadius:7, border:`1px solid ${C.border}`, background:C.white, cursor:'pointer', display:'flex', color:C.muted, flexShrink:0}}
                                title="View Report">
                                <ExternalLink size={14}/>
                              </button>
                              <button className="tbl-action"
                                onClick={() => setModal({ fb, type:'user' })}
                                style={{padding:'6px', borderRadius:7, border:`1px solid ${C.border}`, background:C.white, cursor:'pointer', display:'flex', color:C.muted, flexShrink:0}}
                                title="View User">
                                <User size={14}/>
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

export default AdminFeedbackScreen;
