// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../lib/supabase';

// export default function PartnerDashboardScreen() {
//   const navigate  = useNavigate();
//   const code      = sessionStorage.getItem('partner_code');
//   const username  = sessionStorage.getItem('partner_username');

//   const [users,   setUsers]   = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // If not logged in as partner, redirect
//     if (!code || !username) {
//       navigate('/partner-login');
//       return;
//     }
//     fetchUsers();
//   }, []);

//   const fetchUsers = async () => {
//     const { data, error } = await supabase
//       .from('users')
//       .select('name, email, phone, created_at, plan, discount_code_used')
//       .eq('discount_code_used', code)
//       .order('created_at', { ascending: false });

//     if (!error) setUsers(data || []);
//     setLoading(false);
//   };

//   const handleLogout = () => {
//     sessionStorage.removeItem('partner_code');
//     sessionStorage.removeItem('partner_username');
//     sessionStorage.removeItem('partner_id');
//     navigate('/partner-login');
//   };

//   const totalSignups = users.length;
//   const proUsers     = users.filter(u => u.plan === 'pro').length;
//   const totalRevenue = proUsers * 29;

//   return (
//     <div style={{ minHeight:'100vh', background:'#F3F3F4', fontFamily:"'Inter', system-ui, sans-serif" }}>

//       {/* Header */}
//       <header style={{ background:'#1C1C1E', padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
//         <div style={{ fontSize:20, fontWeight:900 }}>
//           <span style={{ color:'#C8832A' }}>ACQ</span>
//           <span style={{ color:'#fff' }}>AR</span>
//           <span style={{ color:'#9A9A9A', fontSize:12, fontWeight:600, marginLeft:12, letterSpacing:'0.08em', textTransform:'uppercase' }}>
//             Partner Dashboard
//           </span>
//         </div>
//         <div style={{ display:'flex', alignItems:'center', gap:16 }}>
//           <span style={{ fontSize:13, color:'#9A9A9A' }}>
//             Welcome, <strong style={{ color:'#fff' }}>{username}</strong>
//           </span>
//           <button
//             onClick={handleLogout}
//             style={{ padding:'7px 16px', borderRadius:8, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'#9A9A9A', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}
//           >
//             Logout
//           </button>
//         </div>
//       </header>

//       <div style={{ maxWidth:960, margin:'0 auto', padding:'28px 20px' }}>

//         {/* Code badge */}
//         <div style={{ marginBottom:24 }}>
//           <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#FFF7ED', border:'1px solid #F5C89A', borderRadius:10, padding:'8px 16px' }}>
//             <span style={{ fontSize:11, fontWeight:700, color:'#92400E', textTransform:'uppercase', letterSpacing:'0.1em' }}>Your Discount Code:</span>
//             <span style={{ fontSize:15, fontWeight:900, color:'#C8832A' }}>{code}</span>
//           </div>
//         </div>

//         {/* Stats cards */}
//         <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, marginBottom:28 }}>
//           {[
//             { label:'Total Signups',  value: totalSignups,      color:'#0F0F0F', suffix:''      },
//             { label:'Pro Upgrades',   value: proUsers,          color:'#059669', suffix:''      },
//             { label:'Total Revenue',  value: totalRevenue,      color:'#C8832A', suffix:'AED ', prefix: true },
//           ].map(s => (
//             <div key={s.label} style={{ background:'#fff', borderRadius:16, border:'1px solid #E9E9EA', padding:'22px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
//               <div style={{ fontSize:11, fontWeight:700, color:'#6B6B6B', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>
//                 {s.label}
//               </div>
//               <div style={{ fontSize:32, fontWeight:900, color:s.color }}>
//                 {s.prefix ? `AED ${s.value}` : s.value}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Users table */}
//         <div style={{ background:'#fff', borderRadius:20, border:'1px solid #E9E9EA', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
//           <div style={{ padding:'18px 20px', borderBottom:'1px solid #E9E9EA' }}>
//             <h2 style={{ fontSize:16, fontWeight:800, color:'#0F0F0F' }}>
//               Registered Users ({totalSignups})
//             </h2>
//           </div>

//           {loading ? (
//             <div style={{ padding:48, textAlign:'center', color:'#6B6B6B' }}>Loading...</div>
//           ) : (
//             <div style={{ overflowX:'auto' }}>
//               <table style={{ width:'100%', borderCollapse:'collapse', minWidth:600 }}>
//                 <thead>
//                   <tr style={{ background:'#F3F3F4', borderBottom:'1px solid #E9E9EA' }}>
//                     {['#','Name','Email','Phone','Joined','Plan','Amount Paid'].map(h => (
//                       <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:9.5, fontWeight:700, color:'#6B6B6B', textTransform:'uppercase', letterSpacing:'0.12em', whiteSpace:'nowrap' }}>
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {users.length === 0 ? (
//                     <tr>
//                       <td colSpan={7} style={{ padding:'48px 0', textAlign:'center', color:'#6B6B6B', fontSize:14, fontWeight:600 }}>
//                         No signups yet. Share your code <strong style={{ color:'#C8832A' }}>{code}</strong> to get started!
//                       </td>
//                     </tr>
//                   ) : users.map((u, i) => {
//                     const isPro = u.plan === 'pro';
//                     return (
//                       <tr key={i}
//                         style={{ borderBottom: i < users.length-1 ? '1px solid #E9E9EA' : 'none' }}
//                         onMouseEnter={e => e.currentTarget.style.background = '#F3F3F4'}
//                         onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
//                       >
//                         {/* # */}
//                         <td style={{ padding:'13px 16px', fontSize:12, fontWeight:700, color:'#9A9A9A' }}>
//                           {i + 1}
//                         </td>

//                         {/* Name */}
//                         <td style={{ padding:'13px 16px', fontSize:13, fontWeight:700, color:'#0F0F0F' }}>
//                           {u.name || '—'}
//                         </td>

//                         {/* Email */}
//                         <td style={{ padding:'13px 16px', fontSize:12, color:'#6B6B6B' }}>
//                           {u.email}
//                         </td>

//                         {/* Phone */}
//                         <td style={{ padding:'13px 16px', fontSize:12, color:'#6B6B6B' }}>
//                           {u.phone || '—'}
//                         </td>

//                         {/* Joined */}
//                         <td style={{ padding:'13px 16px', fontSize:12, color:'#9A9A9A' }}>
//                           {u.created_at?.slice(0,10) || '—'}
//                         </td>

//                         {/* Plan */}
//                         <td style={{ padding:'13px 16px' }}>
//                           <span style={{
//                             padding:'2px 8px', borderRadius:6,
//                             fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em',
//                             background: isPro ? '#D1FAE5' : '#F3F3F4',
//                             color:       isPro ? '#059669' : '#6B6B6B',
//                             border:`1px solid ${isPro ? '#A7F3D0' : '#E9E9EA'}`,
//                           }}>
//                             {u.plan || 'free'}
//                           </span>
//                         </td>

//                         {/* Amount Paid */}
//                         <td style={{ padding:'13px 16px', fontWeight:800, color: isPro ? '#C8832A' : '#9A9A9A', fontSize:13 }}>
//                           {isPro ? 'AED 29' : '—'}
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function PartnerDashboardScreen() {
  const navigate  = useNavigate();
  const code      = sessionStorage.getItem('partner_code');
  const username  = sessionStorage.getItem('partner_username');

  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
 const [filterPlan,   setFilterPlan]   = useState('');
const [filterStatus, setFilterStatus] = useState('');
const [searchTerm,   setSearchTerm]   = useState('');
const [showFilters,  setShowFilters]  = useState(false);

  useEffect(() => {
    // If not logged in as partner, redirect
    if (!code || !username) {
      navigate('/partner-login');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('name, email, phone, created_at, plan, discount_code_used, status, role')
    .eq('discount_code_used', code)
    .order('created_at', { ascending: false });

  if (!error) {
    const { data: discountCodes } = await supabase
      .from('discount_codes')
      .select('code, discount_percentage');

    const discountMap = {};
    (discountCodes || []).forEach(d => { discountMap[d.code] = d.discount_percentage; });

    const enriched = (data || []).map(u => ({
      ...u,
      discount_percentage: u.discount_code_used ? (discountMap[u.discount_code_used] ?? 100) : null,
    }));
    setUsers(enriched);
  }
  setLoading(false);
};

  const handleLogout = () => {
    sessionStorage.removeItem('partner_code');
    sessionStorage.removeItem('partner_username');
    sessionStorage.removeItem('partner_id');
    navigate('/partner-login');
  };

  const totalSignups = users.length;
  const proUsers     = users.filter(u => u.plan === 'pro').length;
 const totalRevenue = users.reduce((sum, u) => {
  if (u.plan !== 'pro') return sum;
  const pct = u.discount_percentage ?? 100;
  return sum + Math.round(29 * pct / 100);
}, 0);

const filteredUsers = users.filter(u => {
  const term        = searchTerm.toLowerCase();
  const matchSearch = !term ||
    (u.name  || '').toLowerCase().includes(term) ||
    (u.email || '').toLowerCase().includes(term) ||
    (u.phone || '').toLowerCase().includes(term);
  const planMatch   = !filterPlan   || (u.plan || 'free').toLowerCase() === filterPlan;
  const statusMatch = !filterStatus || (u.status || 'active') === filterStatus;
  return matchSearch && planMatch && statusMatch;
});

  return (
    <div style={{ minHeight:'100vh', background:'#F3F3F4', fontFamily:"'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <header style={{ background:'#1C1C1E', padding:'0 24px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:20, fontWeight:900 }}>
          <span style={{ color:'#C8832A' }}>ACQ</span>
          <span style={{ color:'#fff' }}>AR</span>
          <span style={{ color:'#9A9A9A', fontSize:12, fontWeight:600, marginLeft:12, letterSpacing:'0.08em', textTransform:'uppercase' }}>
            Partner Dashboard
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <span style={{ fontSize:13, color:'#9A9A9A' }}>
            Welcome, <strong style={{ color:'#fff' }}>{username}</strong>
          </span>
          <button
            onClick={handleLogout}
            style={{ padding:'7px 16px', borderRadius:8, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'#9A9A9A', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={{ padding:'28px 24px' }}>

        {/* Code badge */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#FFF7ED', border:'1px solid #F5C89A', borderRadius:10, padding:'8px 16px' }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#92400E', textTransform:'uppercase', letterSpacing:'0.1em' }}>Your Discount Code:</span>
            <span style={{ fontSize:15, fontWeight:900, color:'#C8832A' }}>{code}</span>
          </div>
        </div>
{/* Search + Filter bar */}
<div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: showFilters ? 12 : 20, flexWrap:'wrap' }}>
  <div style={{ position:'relative', flex:1, minWidth:200 }}>
    <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:13, color:'#9A9A9A', pointerEvents:'none' }}>🔍</span>
    <input
      type="text"
      placeholder="Search name, email, phone..."
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
      style={{ width:'100%', paddingLeft:38, paddingRight:16, paddingTop:10, paddingBottom:10, borderRadius:22, border:'1px solid #E9E9EA', background:'#fff', fontSize:13, color:'#0F0F0F', outline:'none', fontFamily:'inherit', boxSizing:'border-box' }}
    />
  </div>
  <button
    onClick={() => setShowFilters(!showFilters)}
    style={{ padding:'10px 16px', borderRadius:22, border:`1px solid ${showFilters ? '#C8832A' : '#E9E9EA'}`, background: showFilters ? '#C8832A' : '#fff', color: showFilters ? '#fff' : '#6B6B6B', fontWeight:700, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontFamily:'inherit', whiteSpace:'nowrap' }}
  >
    ⚙ Filter
  </button>
</div>

{/* Filter panel */}
{showFilters && (
  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px, 1fr))', gap:12, background:'#fff', borderRadius:16, border:'1px solid #E9E9EA', padding:'20px', marginBottom:20, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
    {[
      { label:'Plan',   key:'filterPlan',   options:[{ label:'All', value:'' }, { label:'Pro', value:'pro' }, { label:'Free', value:'free' }] },
      { label:'Status', key:'filterStatus', options:[{ label:'All', value:'' }, { label:'Active', value:'active' }, { label:'Inactive', value:'inactive' }] },
    ].map(f => (
      <div key={f.key}>
        <label style={{ display:'block', fontSize:9.5, fontWeight:700, color:'#6B6B6B', textTransform:'uppercase', letterSpacing:'0.13em', marginBottom:6 }}>{f.label}</label>
        <select
          value={f.key === 'filterPlan' ? filterPlan : filterStatus}
          onChange={e => f.key === 'filterPlan' ? setFilterPlan(e.target.value) : setFilterStatus(e.target.value)}
          style={{ width:'100%', background:'#F3F3F4', border:'1px solid #E9E9EA', borderRadius:10, padding:'8px 12px', fontSize:13, fontWeight:600, color:'#0F0F0F', outline:'none', fontFamily:'inherit', cursor:'pointer' }}
        >
          {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    ))}
  </div>
)}
        {/* Stats cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, marginBottom:28 }}>
          {[
            { label:'Total Signups',  value: totalSignups,      color:'#0F0F0F', suffix:''      },
            { label:'Pro Upgrades',   value: proUsers,          color:'#059669', suffix:''      },
            { label:'Total Revenue',  value: totalRevenue,      color:'#C8832A', suffix:'AED ', prefix: true },
          ].map(s => (
            <div key={s.label} style={{ background:'#fff', borderRadius:16, border:'1px solid #E9E9EA', padding:'22px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#6B6B6B', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>
                {s.label}
              </div>
              <div style={{ fontSize:32, fontWeight:900, color:s.color }}>
                {s.prefix ? `AED ${s.value}` : s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Users table */}
        <div style={{ background:'#fff', borderRadius:20, border:'1px solid #E9E9EA', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ padding:'18px 20px', borderBottom:'1px solid #E9E9EA' }}>
            <h2 style={{ fontSize:16, fontWeight:800, color:'#0F0F0F' }}>
              Registered Users 
            </h2>
          </div>

          {loading ? (
            <div style={{ padding:48, textAlign:'center', color:'#6B6B6B' }}>Loading...</div>
          ) : (
           <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
  <table style={{ width:'100%', borderCollapse:'collapse', minWidth:900 }}>
                <thead>
                  <tr style={{ background:'#F3F3F4', borderBottom:'1px solid #E9E9EA' }}>
                    {['#','Name','Email','Phone','Joined','Role','Plan','Status','Disc. Code','Disc. %','Amount Paid'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:9.5, fontWeight:700, color:'#6B6B6B', textTransform:'uppercase', letterSpacing:'0.12em', whiteSpace:'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ padding:'48px 0', textAlign:'center', color:'#6B6B6B', fontSize:14, fontWeight:600 }}>
                        No signups yet. Share your code <strong style={{ color:'#C8832A' }}>{code}</strong> to get started!
                      </td>
                    </tr>
                 ) : filteredUsers.map((u, i) => {
                    const isPro = u.plan === 'pro';
                    return (
                      <tr key={i}
                        style={{ borderBottom: i < filteredUsers.length-1 ? '1px solid #E9E9EA' : 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F3F3F4'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {/* # */}
                        <td style={{ padding:'13px 16px', fontSize:12, fontWeight:700, color:'#9A9A9A' }}>
                          {i + 1}
                        </td>

                        {/* Name */}
                        <td style={{ padding:'13px 16px', fontSize:13, fontWeight:700, color:'#0F0F0F' }}>
                          {u.name || '—'}
                        </td>

                        {/* Email */}
                        <td style={{ padding:'13px 16px', fontSize:12, color:'#6B6B6B' }}>
                          {u.email}
                        </td>

                        {/* Phone */}
                        <td style={{ padding:'13px 16px', fontSize:12, color:'#6B6B6B' }}>
                          {u.phone || '—'}
                        </td>

                        {/* Joined */}
                        <td style={{ padding:'13px 16px', fontSize:12, color:'#9A9A9A' }}>
                          {u.created_at?.slice(0,10) || '—'}
                        </td>

                       {/* Role */}
<td style={{ padding:'13px 16px', fontSize:12, color:'#6B6B6B', fontWeight:600 }}>
  {u.role || '—'}
</td>

{/* Plan */}
<td style={{ padding:'13px 16px' }}>
  <span style={{
    padding:'2px 8px', borderRadius:6,
    fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em',
    background: isPro ? '#D1FAE5' : '#F3F3F4',
    color:       isPro ? '#059669' : '#6B6B6B',
    border:`1px solid ${isPro ? '#A7F3D0' : '#E9E9EA'}`,
  }}>
    {u.plan || 'free'}
  </span>
</td>

{/* Status */}
<td style={{ padding:'13px 16px' }}>
  <div style={{ display:'flex', alignItems:'center', gap:5 }}>
    <span style={{ width:6, height:6, borderRadius:'50%', background: u.status === 'inactive' ? '#EF4444' : '#10B981', display:'inline-block' }} />
    <span style={{ fontSize:12, fontWeight:700, color:'#0F0F0F', textTransform:'capitalize' }}>
      {u.status || 'active'}
    </span>
  </div>
</td>

{/* Disc. Code */}
<td style={{ padding:'13px 16px' }}>
  {u.discount_code_used ? (
    <span style={{ padding:'2px 8px', borderRadius:6, fontSize:9, fontWeight:800, textTransform:'uppercase', background:'#FFF7ED', color:'#C8832A', border:'1px solid #F5C89A' }}>
      {u.discount_code_used}
    </span>
  ) : <span style={{ color:'#9A9A9A', fontSize:11 }}>—</span>}
</td>

{/* Disc. % */}
<td style={{ padding:'13px 16px' }}>
  {u.discount_percentage != null ? (
    <span style={{ padding:'2px 8px', borderRadius:6, fontSize:9, fontWeight:800, background:'#F0FDF4', color:'#16A34A', border:'1px solid #BBF7D0' }}>
      {u.discount_percentage}%
    </span>
  ) : <span style={{ color:'#9A9A9A', fontSize:11 }}>—</span>}
</td>

{/* Amount Paid */}
<td style={{ padding:'13px 16px', fontWeight:800, fontSize:13, color: isPro ? '#C8832A' : '#9A9A9A' }}>
  {isPro ? `AED ${Math.round(29 * (u.discount_percentage ?? 100) / 100)}` : '—'}
</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '../lib/supabase';
// import { Search, Filter } from 'lucide-react';

// export default function PartnerDashboardScreen() {
//   const navigate  = useNavigate();
//   const code = sessionStorage.getItem('partner_code')?.trim();
//   const username  = sessionStorage.getItem('partner_username');

// const [users,      setUsers]      = useState([]);
// const [loading,    setLoading]    = useState(true);
// const [searchTerm, setSearchTerm] = useState('');
// const [showFilters, setShowFilters] = useState(false);
// const [filters, setFilters] = useState({ plan:'', discountCodeSearch:'' });



//   useEffect(() => {
//     // If not logged in as partner, redirect
//     if (!code || !username) {
//       navigate('/partner-login');
//       return;
//     }
//     fetchUsers();
//   }, []);

// const fetchUsers = async () => {
//   const freshCode = sessionStorage.getItem('partner_code')?.trim();
  
//   if (!freshCode) return;

//   const { data, error } = await supabase
//     .from('users')
//     .select('id, name, email, phone, created_at, plan, discount_code_used, amount_paid, role, provider, registration_type, account_type, status, deleted_at')
//     .eq('discount_code_used', freshCode)   // ← back to .eq
//     .order('created_at', { ascending: false });

//   if (!error) setUsers(data || []);
//   setLoading(false);
// };
//   const handleLogout = () => {
//     sessionStorage.removeItem('partner_code');
//     sessionStorage.removeItem('partner_username');
//     sessionStorage.removeItem('partner_id');
//     navigate('/partner-login');
//   };

// const totalSignups = users.length;
// const proUsers     = users.filter(u => u.plan === 'pro').length;
// const totalRevenue = users
//   .filter(u => u.plan === 'pro')
//   .reduce((sum, u) => sum + (u.amount_paid || 0), 0);


//   const filteredUsers = users.filter(user => {
//   const term = searchTerm.toLowerCase();

//   const userPlanNorm = (user.plan || '').toLowerCase().trim();
//   const planKeywords = ['pro', 'free'];
//   const isPlanSearch = planKeywords.includes(term);

//   const matchesSearch = !term || (
//     isPlanSearch
//       ? userPlanNorm === term
//       : (
//           (user.name  || '').toLowerCase().includes(term) ||
//           (user.email || '').toLowerCase().includes(term) ||
//           (user.phone || '').toLowerCase().includes(term)
//         )
//   );

//   const userPlan = (user.plan || 'free').toLowerCase();
//   const matchesPlan = !filters.plan || userPlan === filters.plan;

//   return matchesSearch && matchesPlan;
// });

//   return (
//     <div style={{ minHeight:'100vh', background:'#F3F3F4', fontFamily:"'Inter', system-ui, sans-serif" }}>

//       {/* Header */}
//       <header style={{ background:'#1C1C1E', padding:'0 16px', minHeight:60, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
//         <div style={{ fontSize:20, fontWeight:900 }}>
//           <span style={{ color:'#C8832A' }}>ACQ</span>
//           <span style={{ color:'#fff' }}>AR</span>
//           <span style={{ color:'#9A9A9A', fontSize:12, fontWeight:600, marginLeft:12, letterSpacing:'0.08em', textTransform:'uppercase' }}>
//             Partner Dashboard
//           </span>
//         </div>
//         <div style={{ display:'flex', alignItems:'center', gap:16 }}>
//           <span style={{ fontSize:13, color:'#9A9A9A' }}>
//             Welcome, <strong style={{ color:'#fff' }}>{username}</strong>
//           </span>
//           <button
//             onClick={handleLogout}
//             style={{ padding:'7px 16px', borderRadius:8, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', color:'#9A9A9A', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}
//           >
//             Logout
//           </button>
//         </div>
//       </header>

//       <div style={{ maxWidth:'100%', margin:'0 auto', padding:'28px 32px' }}>

//         {/* Code badge */}
//         <div style={{ marginBottom:24 }}>
//           <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'#FFF7ED', border:'1px solid #F5C89A', borderRadius:10, padding:'8px 16px' }}>
//             <span style={{ fontSize:11, fontWeight:700, color:'#92400E', textTransform:'uppercase', letterSpacing:'0.1em' }}>Your Discount Code:</span>
//             <span style={{ fontSize:15, fontWeight:900, color:'#C8832A' }}>{code}</span>
//           </div>
//         </div>

//         {/* Stats cards */}
//         <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:28 }}>
//           {[
//             { label:'Total Signups',  value: totalSignups,      color:'#0F0F0F', suffix:''      },
//             { label:'Pro Upgrades',   value: proUsers,          color:'#059669', suffix:''      },
//             { label:'Total Revenue',  value: totalRevenue,      color:'#C8832A', suffix:'AED ', prefix: true },
//           ].map(s => (
//             <div key={s.label} style={{ background:'#fff', borderRadius:16, border:'1px solid #E9E9EA', padding:'22px 20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
//               <div style={{ fontSize:11, fontWeight:700, color:'#6B6B6B', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>
//                 {s.label}
//               </div>
//               <div style={{ fontSize:32, fontWeight:900, color:s.color }}>
//                 {s.prefix ? `AED ${s.value}` : s.value}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Users table */}
// <div style={{ background:'#fff', borderRadius:20, border:'1px solid #E9E9EA', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>

//   {/* Table header + search */}
//   <div style={{ padding:'18px 20px', borderBottom:'1px solid #E9E9EA', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:12 }}>
//     <h2 style={{ fontSize:16, fontWeight:800, color:'#0F0F0F' }}>
//       Registered Users ({filteredUsers.length})
//     </h2>
//     <div style={{ display:'flex', alignItems:'center', gap:10 }}>
//       {/* Search */}
//       <div style={{ position:'relative' }}>
//         <Search size={13} color='#6B6B6B' strokeWidth={2} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
//         <input
//           type="text"
//           placeholder="Search name, email, pro, free..."
//           value={searchTerm}
//           onChange={e => setSearchTerm(e.target.value)}
//           style={{ paddingLeft:34, paddingRight:14, paddingTop:9, paddingBottom:9, borderRadius:20, border:'1px solid #E9E9EA', fontSize:13, outline:'none', width:240, fontFamily:'inherit', background:'#F9F9F9' }}
//         />
//       </div>
//       {/* Filter button */}
//       <button
//         onClick={() => setShowFilters(!showFilters)}
//         style={{ padding:'9px 14px', borderRadius:20, border:'1px solid #E9E9EA', background: showFilters ? '#C8832A' : '#fff', color: showFilters ? '#fff' : '#6B6B6B', cursor:'pointer', display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:600 }}
//       >
//         <Filter size={14} />
//         Filter
//       </button>
//     </div>
//   </div>

//   {/* Filter panel */}
//   {showFilters && (
//     <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, padding:'16px 20px', borderBottom:'1px solid #E9E9EA', background:'#F9F9F9' }}>
//       <div>
//         <label style={{ display:'block', fontSize:9.5, fontWeight:700, color:'#6B6B6B', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:6 }}>Plan</label>
//         <select
//           value={filters.plan}
//           onChange={e => setFilters({ ...filters, plan: e.target.value })}
//           style={{ width:'100%', padding:'8px 12px', borderRadius:8, border:'1px solid #E9E9EA', fontSize:13, fontWeight:600, outline:'none', fontFamily:'inherit', background:'#fff', cursor:'pointer' }}
//         >
//           <option value="">All</option>
//           <option value="free">Free</option>
//           <option value="pro">Pro</option>
//         </select>
//       </div>
//     </div>
//   )}

//   {loading ? (
//     <div style={{ padding:48, textAlign:'center', color:'#6B6B6B' }}>Loading...</div>
//   ) : (
//     <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch' }}>
//   <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
//                 <thead>
//                   <tr style={{ background:'#F3F3F4', borderBottom:'1px solid #E9E9EA' }}>
//                     {['#','ID','Fullname','Email & Phone','Role','Joined','Reg. Type','Plan','Status','Disc. Code','Amount Paid'].map(h => (
//                       <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:9.5, fontWeight:700, color:'#6B6B6B', textTransform:'uppercase', letterSpacing:'0.12em', whiteSpace:'nowrap' }}>
//                         {h}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                  {filteredUsers.length === 0 ? (
//   <tr>
//     <td colSpan={11} style={{ padding:'48px 0', textAlign:'center', color:'#6B6B6B', fontSize:14, fontWeight:600 }}>
//       {users.length === 0
//         ? <>No signups yet. Share your code <strong style={{ color:'#C8832A' }}>{code}</strong> to get started!</>
//         : 'No users match your search or filter.'
//       }
//     </td>
//   </tr>
// ) : filteredUsers.map((u, i) => {
//   const isPro     = u.plan === 'pro';
//   const provider  = u.provider || u.registration_type || '—';
//   const role      = u.role || '—';
//   const isActive  = !u.deleted_at && u.status !== 'inactive';
//   const joinDate  = u.created_at?.slice(0,10) || '—';
//   const displayId = String(u.id).includes('-')
//     ? '#' + String(u.id).slice(0, 8)
//     : '#' + String(u.id).padStart(3, '0');

//   return (
//     <tr key={i}
//       style={{ borderBottom: i < filteredUsers.length-1 ? '1px solid #E9E9EA' : 'none' }}
//       onMouseEnter={e => e.currentTarget.style.background = '#F3F3F4'}
//       onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
//     >
//       {/* # */}
//       <td style={{ padding:'13px 16px', fontSize:12, fontWeight:700, color:'#9A9A9A' }}>{i + 1}</td>

//       {/* ID */}
//       <td style={{ padding:'13px 16px', fontSize:10, fontWeight:800, color:'#9A9A9A', wordBreak:'break-all' }}>
//         {displayId}
//       </td>

//       {/* Fullname */}
//       <td style={{ padding:'13px 16px', fontSize:13, fontWeight:700, color:'#0F0F0F' }}>
//         {u.name || '—'}
//       </td>

//       {/* Email & Phone */}
//       <td style={{ padding:'13px 16px' }}>
//         <div style={{ fontSize:12, fontWeight:600, color:'#0F0F0F' }}>{u.email}</div>
//         <div style={{ fontSize:11, color:'#6B6B6B', marginTop:2 }}>{u.phone || '—'}</div>
//       </td>

//       {/* Role */}
//       <td style={{ padding:'13px 16px' }}>
//         <span style={{ padding:'2px 8px', borderRadius:6, fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.08em', background:'#F3F3F4', color:'#6B6B6B', display:'inline-block' }}>
//           {role}
//         </span>
//       </td>

//       {/* Joined */}
//       <td style={{ padding:'13px 16px', fontSize:11, color:'#9A9A9A', fontWeight:500 }}>
//         {joinDate}
//       </td>

//       {/* Reg. Type */}
//       <td style={{ padding:'13px 16px' }}>
//         <span style={{ fontSize:11, fontWeight:800, color:'#6B6B6B', textTransform:'uppercase' }}>
//           {provider}
//         </span>
//       </td>

//       {/* Plan */}
//       <td style={{ padding:'13px 16px' }}>
//         <span style={{
//           padding:'2px 8px', borderRadius:6,
//           fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em',
//           background: isPro ? '#D1FAE5' : '#F3F3F4',
//           color:       isPro ? '#059669' : '#6B6B6B',
//           border:`1px solid ${isPro ? '#A7F3D0' : '#E9E9EA'}`,
//         }}>
//           {u.plan || 'free'}
//         </span>
//       </td>

//       {/* Status */}
//       <td style={{ padding:'13px 16px' }}>
//         <div style={{ display:'flex', alignItems:'center', gap:5 }}>
//           <span style={{ width:6, height:6, borderRadius:'50%', background: isActive ? '#10B981' : '#EF4444', display:'inline-block' }} />
//           <span style={{ fontSize:12, fontWeight:700, color:'#0F0F0F', textTransform:'capitalize' }}>
//             {u.status || 'active'}
//           </span>
//         </div>
//       </td>

//       {/* Disc. Code */}
//       <td style={{ padding:'13px 16px' }}>
//         {u.discount_code_used ? (
//           <span style={{ padding:'2px 8px', borderRadius:6, fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.06em', background:'#FFF7ED', color:'#C8832A', border:'1px solid #F5C89A', display:'inline-block' }}>
//             {u.discount_code_used}
//           </span>
//         ) : <span style={{ fontSize:11, color:'#9A9A9A' }}>—</span>}
//       </td>

//       {/* Amount Paid */}
//       <td style={{ padding:'13px 16px', fontWeight:800, color: isPro ? '#C8832A' : '#9A9A9A', fontSize:13 }}>
//         {isPro ? `AED ${u.amount_paid || 0}` : '—'}
//       </td>
//     </tr>
//   );
// })}
//                 </tbody>
                
//               </table>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
