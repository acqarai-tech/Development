// screens/AdminValuationsScreen.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLogout } from '../hooks/useLogout';
import {
  Search, Filter, Eye, Download, FileText, X,
  Users, LayoutDashboard, Home, MessageSquare, BookOpen,
  BarChart2, Settings, LogOut, Bell, User, Menu,
  MapPin, BedDouble, Bath, Maximize2, Calendar, CreditCard,
  FileDown, ChevronRight,
} from 'lucide-react';

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
const TABLE_MIN_W = 1200;

const navItems = [
  { label:'Overview',   icon:LayoutDashboard, key:'overview'   },
  { label:'Users',      icon:Users,           key:'users'      },
  { label:'Valuations', icon:Home,            key:'valuations' },
  { label:'Feedback',   icon:MessageSquare,   key:'feedback'   },
  { label:'Blogs',      icon:BookOpen,        key:'blogs'      },
  { label:'Analytics',  icon:BarChart2,       key:'analytics'  },
  { label:'Settings',   icon:Settings,        key:'settings'   },
];

/* ─── CSS ─────────────────────────────────────────────────────────────── */
const globalCss = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Inter','Segoe UI',system-ui,sans-serif}
  @keyframes spin    {to{transform:rotate(360deg)}}
  @keyframes slideIn {from{transform:translateX(-100%)}to{transform:translateX(0)}}
  @keyframes fadeIn  {from{opacity:0}to{opacity:1}}
  @keyframes slideUp {from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.15);border-radius:4px}
  ::-webkit-scrollbar-track{background:transparent}
  .nav-btn{transition:background 0.14s}
  .nav-btn:hover{background:rgba(255,255,255,0.07)!important}
  .hdr-desktop{display:flex}
  .hdr-mobile {display:none}
  .tbl-action{transition:background 0.1s,color 0.1s}
  .tbl-action:hover{background:#F3F3F4!important;color:#0F0F0F!important}
  /* Table always scrolls horizontally */
  .table-wrap{
    background:#fff;border-radius:20px;
    border:1px solid #E9E9EA;
    box-shadow:0 1px 4px rgba(0,0,0,0.05);
    overflow:hidden;
  }
  .table-scroll{
    overflow-x:auto;
    -webkit-overflow-scrolling:touch;
  }
  .table-scroll table{
    min-width:${TABLE_MIN_W}px;
    border-collapse:collapse;
    width:100%;
    table-layout:fixed;
  }
  @media(max-width:600px){
    .hdr-desktop{display:none!important}
    .hdr-mobile {display:flex!important}
    .main-wrap  {padding-top:60px!important}
    .main-inner {padding:16px 12px!important}
    .page-h1    {font-size:22px!important}
    .filter-grid{grid-template-columns:1fr 1fr!important}
    .header-actions{flex-direction:row!important;align-items:center!important}
    .search-wrap{flex:1!important}
    .search-input{width:100%!important;box-sizing:border-box!important}
    .summary-grid{grid-template-columns:1fr!important}
    .table-wrap{border-radius:16px}
  }
  @media(max-width:400px){
    .filter-grid{grid-template-columns:1fr!important}
  }
`;

/* ─── Shared UI ──────────────────────────────────────────────────────── */
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
            const on=active===key;
            return(
              <button key={key} className="nav-btn" onClick={()=>{onNav(key);onClose();}} style={{width:'100%',display:'flex',alignItems:'center',gap:11,padding:'11px 14px',borderRadius:10,border:'none',background:on?C.activeNav:'transparent',color:on?C.activeText:C.sidebarText,cursor:'pointer',marginBottom:2,fontSize:13.5,fontWeight:on?700:400,textAlign:'left'}}>
                <Icon size={17} strokeWidth={on?2.2:1.7}/>{label}
              </button>
            );
          })}
        </nav>
        <div style={{padding:'12px 10px',borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
          <button className="nav-btn" onClick={onLogout} style={{width:'100%',display:'flex',alignItems:'center',gap:11,padding:'11px 14px',borderRadius:10,border:'none',background:'transparent',color:C.sidebarText,cursor:'pointer',fontSize:13.5,fontWeight:400,textAlign:'left'}}>
            <LogOut size={17} strokeWidth={1.7}/>Logout
          </button>
        </div>
      </aside>
    </>
  );
};

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

const SummaryCard = ({label,value}) => (
  <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:'22px',boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
    <div style={{fontSize:9.5,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.13em',marginBottom:8}}>{label}</div>
    <div style={{fontSize:32,fontWeight:900,color:C.text,letterSpacing:'-1.5px',lineHeight:1}}>{value}</div>
  </div>
);

/* ─── Report Modal ────────────────────────────────────────────────────── */
const ReportModal = ({val, onClose}) => {
  const valuation = Number(val.estimated_valuation || val.valuation_amount || 0);
  const area      = val.district || val.area || '—';
  const address   = val.property_name || val.property_address || '—';
  const beds      = val.bedroom  || val.bedrooms  || 0;
  const baths     = val.bathroom || val.bathrooms || 0;
  const size = Math.round(Number(val.apartment_size || val.size || val.property_size || 0));
  const features  = Array.isArray(val.features) ? val.features : Array.isArray(val.amenities) ? val.amenities : [];
  const date      = val.created_at?.slice(0,10) || '—';
  const isPaid    = (val.payment_type||'').toLowerCase() === 'paid';
  const reportId  = /^\d+$/.test(String(val.id)) ? `VAL-${String(val.id).padStart(3,'0')}` : `#${String(val.id).slice(0,8)}`;

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.55)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,animation:'fadeIn 0.18s ease'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,borderRadius:24,width:'100%',maxWidth:640,maxHeight:'90vh',overflowY:'auto',animation:'slideUp 0.22s ease',boxShadow:'0 24px 80px rgba(0,0,0,0.25)'}}>
        {/* Modal Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'24px 28px 20px',borderBottom:`1px solid ${C.border}`}}>
          <div>
            <div style={{fontSize:11,fontWeight:800,color:C.copper,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:4}}>Valuation Report</div>
            <div style={{fontSize:22,fontWeight:900,color:C.text,letterSpacing:'-0.5px'}}>{reportId}</div>
          </div>
          <button onClick={onClose} style={{background:C.bg,border:'none',width:36,height:36,borderRadius:10,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:C.muted}}>
            <X size={16}/>
          </button>
        </div>

        <div style={{padding:'24px 28px'}}>
          {/* Valuation highlight */}
          <div style={{background:'linear-gradient(135deg,#FEF3E7,#FFF8F0)',borderRadius:16,padding:'20px 24px',marginBottom:24,border:`1px solid #F5DEB3`}}>
            <div style={{fontSize:10,fontWeight:800,color:C.copper,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:6}}>Estimated Valuation</div>
            <div style={{fontSize:36,fontWeight:900,color:C.text,letterSpacing:'-2px'}}>
              AED {valuation > 0 ? valuation.toLocaleString() : '—'}
            </div>
            {valuation > 0 && <div style={{fontSize:13,color:C.muted,marginTop:4,fontWeight:600}}>{(valuation/1_000_000).toFixed(2)}M</div>}
          </div>

          {/* Property info grid */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:24}}>
            {[
              {icon:MapPin,    label:'District',      value:area},
              {icon:Home,      label:'Property',      value:address},
              {icon:Maximize2, label:'Size',          value:`${size.toLocaleString()} sqft`},
              {icon:BedDouble, label:'Bedrooms',      value:`${beds} Bed / ${baths} Bath`},
              {icon:FileText,  label:'Report Type',   value:val.report_type||'—'},
              {icon:CreditCard,label:'Payment',       value:val.payment_type||'—'},
              {icon:User,      label:'Submitted by',  value:val.name||'—'},
              {icon:Calendar,  label:'Date',          value:date},
            ].map(({icon:Icon,label,value})=>(
              <div key={label} style={{background:C.bg,borderRadius:12,padding:'14px 16px',border:`1px solid ${C.border}`}}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:5}}>
                  <Icon size={13} color={C.copper}/>
                  <span style={{fontSize:9.5,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.1em'}}>{label}</span>
                </div>
                <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{value}</div>
              </div>
            ))}
          </div>

          {/* Features */}
          {features.length > 0 && (
            <div style={{marginBottom:24}}>
              <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:10}}>Features & Amenities</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {features.map((f,i)=>(
                  <span key={i} style={{padding:'4px 12px',background:C.bg,borderRadius:20,fontSize:11,fontWeight:700,color:C.text,border:`1px solid ${C.border}`}}>{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Payment status */}
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'14px 16px',background: isPaid?'#F0FDF4':'#F9F9F9',borderRadius:12,border:`1px solid ${isPaid?'#A7F3D0':C.border}`}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:isPaid?C.emerald:'#9CA3AF',display:'inline-block'}}/>
            <span style={{fontSize:12,fontWeight:700,color:isPaid?'#059669':C.muted}}>
              {isPaid ? 'Paid Report — Full valuation details included' : 'Free Report — Basic valuation estimate'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Details Modal ───────────────────────────────────────────────────── */
const DetailsModal = ({val, onClose}) => {
  const area      = val.district || val.area || '—';
  const address   = val.property_name || val.property_address || '—';
  const beds      = val.bedroom  || val.bedrooms  || 0;
  const baths     = val.bathroom || val.bathrooms || 0;
const size = Math.round(Number(val.apartment_size || val.size || val.property_size || 0));
  const features  = Array.isArray(val.features) ? val.features : Array.isArray(val.amenities) ? val.amenities : [];
  const valuation = Number(val.estimated_valuation || val.valuation_amount || 0);
  const reportId  = /^\d+$/.test(String(val.id)) ? `VAL-${String(val.id).padStart(3,'0')}` : `#${String(val.id).slice(0,8)}`;

  const rows = [
    ['Report ID',      reportId],
    ['Submitted By',   val.name || '—'],
    ['User ID',        val.user_id || '—'],
    ['District',       area],
    ['Property Name',  address],
    ['Size (sqft)',    size.toLocaleString()],
    ['Bedrooms',       beds],
    ['Bathrooms',      baths],
    ['Report Type',    val.report_type  || '—'],
    ['Payment Type',   val.payment_type || '—'],
    ['Est. Valuation', valuation > 0 ? `AED ${valuation.toLocaleString()}` : '—'],
    ['Status',         val.status || '—'],
    ['Created At',     val.created_at?.replace('T',' ').slice(0,19) || '—'],
    ['Features',       features.length > 0 ? features.join(', ') : '—'],
  ];

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,0.55)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,animation:'fadeIn 0.18s ease'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.white,borderRadius:24,width:'100%',maxWidth:560,maxHeight:'90vh',overflowY:'auto',animation:'slideUp 0.22s ease',boxShadow:'0 24px 80px rgba(0,0,0,0.25)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'24px 28px 20px',borderBottom:`1px solid ${C.border}`}}>
          <div>
            <div style={{fontSize:11,fontWeight:800,color:C.muted,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:4}}>Full Details</div>
            <div style={{fontSize:22,fontWeight:900,color:C.text}}>{reportId}</div>
          </div>
          <button onClick={onClose} style={{background:C.bg,border:'none',width:36,height:36,borderRadius:10,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:C.muted}}>
            <X size={16}/>
          </button>
        </div>
        <div style={{padding:'20px 28px 28px'}}>
          {rows.map(([label,value],i)=>(
            <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'12px 0',borderBottom: i<rows.length-1?`1px solid ${C.border}`:'none',gap:12}}>
              <span style={{fontSize:12,fontWeight:600,color:C.muted,flexShrink:0,minWidth:120}}>{label}</span>
              <span style={{fontSize:12,fontWeight:700,color:C.text,textAlign:'right',wordBreak:'break-word'}}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Download PDF ────────────────────────────────────────────────────── */
const downloadReport = (val) => {
  const area      = val.district || val.area || '—';
  const address   = val.property_name || val.property_address || '—';
  const beds      = val.bedroom  || val.bedrooms  || 0;
  const baths     = val.bathroom || val.bathrooms || 0;
  const size      = Number(val.size || val.property_size || 0);
  const features  = Array.isArray(val.features) ? val.features : Array.isArray(val.amenities) ? val.amenities : [];
  const valuation = Number(val.estimated_valuation || val.valuation_amount || 0);
  const reportId  = /^\d+$/.test(String(val.id)) ? `VAL-${String(val.id).padStart(3,'0')}` : `#${String(val.id).slice(0,8)}`;
  const date      = val.created_at?.slice(0,10) || '—';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Valuation Report ${reportId}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#0F0F0F;background:#fff;padding:40px}
    .header{border-bottom:3px solid #C8832A;padding-bottom:20px;margin-bottom:28px;display:flex;justify-content:space-between;align-items:flex-end}
    .brand{font-size:24px;font-weight:900;letter-spacing:0.05em}
    .brand span{color:#C8832A}
    .report-id{font-size:13px;color:#6B6B6B;font-weight:600}
    .section-title{font-size:10px;font-weight:800;color:#C8832A;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:14px;margin-top:28px}
    .valuation-box{background:#FEF3E7;border-radius:12px;padding:20px 24px;margin-bottom:24px}
    .valuation-label{font-size:10px;font-weight:700;color:#C8832A;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px}
    .valuation-value{font-size:32px;font-weight:900;letter-spacing:-1.5px}
    .valuation-sub{font-size:13px;color:#6B6B6B;margin-top:4px;font-weight:600}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .cell{background:#F3F3F4;border-radius:10px;padding:14px}
    .cell-label{font-size:9px;font-weight:700;color:#6B6B6B;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:5px}
    .cell-value{font-size:13px;font-weight:700}
    .features{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
    .feat{padding:4px 12px;background:#F3F3F4;border-radius:20px;font-size:11px;font-weight:700;color:#0F0F0F;border:1px solid #E9E9EA}
    .footer{margin-top:40px;padding-top:16px;border-top:1px solid #E9E9EA;font-size:10px;color:#9A9A9A;display:flex;justify-content:space-between}
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">ACQAR <span>ADMIN</span></div>
    <div class="report-id">Report ID: ${reportId} &nbsp;|&nbsp; Generated: ${new Date().toLocaleDateString()}</div>
  </div>

  <div class="valuation-box">
    <div class="valuation-label">Estimated Property Valuation</div>
    <div class="valuation-value">AED ${valuation > 0 ? valuation.toLocaleString() : 'N/A'}</div>
    ${valuation > 0 ? `<div class="valuation-sub">${(valuation/1_000_000).toFixed(2)} Million AED</div>` : ''}
  </div>

  <div class="section-title">Property Details</div>
  <div class="grid">
    <div class="cell"><div class="cell-label">District / Area</div><div class="cell-value">${area}</div></div>
    <div class="cell"><div class="cell-label">Property Name</div><div class="cell-value">${address}</div></div>
    <div class="cell"><div class="cell-label">Size</div><div class="cell-value">${size.toLocaleString()} sqft</div></div>
    <div class="cell"><div class="cell-label">Bedrooms / Bathrooms</div><div class="cell-value">${beds} Bed / ${baths} Bath</div></div>
    <div class="cell"><div class="cell-label">Report Type</div><div class="cell-value">${val.report_type||'—'}</div></div>
    <div class="cell"><div class="cell-label">Payment</div><div class="cell-value">${val.payment_type||'—'}</div></div>
  </div>

  <div class="section-title">Submission Info</div>
  <div class="grid">
    <div class="cell"><div class="cell-label">Submitted By</div><div class="cell-value">${val.name||'—'}</div></div>
    <div class="cell"><div class="cell-label">Date</div><div class="cell-value">${date}</div></div>
  </div>

  ${features.length > 0 ? `
  <div class="section-title">Features & Amenities</div>
  <div class="features">${features.map(f=>`<span class="feat">${f}</span>`).join('')}</div>
  ` : ''}

  <div class="footer">
    <span>ACQAR Admin Panel — Confidential</span>
    <span>${reportId} | ${date}</span>
  </div>
</body>
</html>`;

  const blob = new Blob([html], {type:'text/html'});
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${reportId}-valuation-report.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/* ─── Main Screen ─────────────────────────────────────────────────────── */
const AdminValuationsScreen = () => {
  const navigate     = useNavigate();
  const handleLogout = useLogout();

  const [valuations,    setValuations]    = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [searchTerm,    setSearchTerm]    = useState('');
  const [showFilters,   setShowFilters]   = useState(false);
  const [filters,       setFilters]       = useState({area:'',report_type:'',payment_type:'',status:''});
  const [sideOpen,      setSideOpen]      = useState(false);
  const [activeNav,     setActiveNav]     = useState('valuations');
  const [viewReport,    setViewReport]    = useState(null);   // report modal
  const [viewDetails,   setViewDetails]   = useState(null);   // details modal

  useEffect(()=>{
    fetchValuations();
    const ch = supabase.channel('val-ch')
      .on('postgres_changes',{event:'*',schema:'public',table:'valuations'},fetchValuations)
      .subscribe();
    return ()=>supabase.removeChannel(ch);
  },[]);

  useEffect(()=>{
    const esc=(e)=>{if(e.key==='Escape'){setSideOpen(false);setViewReport(null);setViewDetails(null);}};
    window.addEventListener('keydown',esc);
    return ()=>window.removeEventListener('keydown',esc);
  },[]);

  const fetchValuations = async () => {
    try {
      const {data,error} = await supabase
        .from('valuations')
        .select('*')
        .order('created_at',{ascending:true});
      if(error) throw error;
      setValuations(data||[]);
    } catch(err){
      console.error('Error fetching valuations:',err);
    } finally {
      setLoading(false);
    }
  };

  const handleNav = (key) => {
    setActiveNav(key);
    if(key!=='valuations') navigate(key==='overview'?'/admin-dashboard':`/admin/${key}`);
  };

  const uniqueAreas = [...new Set(valuations.map(v=>v.district||v.area).filter(Boolean))];

  const filtered = valuations.filter(val=>{
    const term    = searchTerm.toLowerCase();
    const name    = (val.name||'').toLowerCase();
    const area    = (val.district||val.area||'').toLowerCase();
    const address = (val.property_name||val.property_address||'').toLowerCase();
    const matchSearch =
      String(val.id).toLowerCase().includes(term)||
      name.includes(term)||area.includes(term)||address.includes(term);
    const matchArea    = !filters.area         || (val.district||val.area)===filters.area;
    const matchRep     = !filters.report_type  || val.report_type===filters.report_type;
    const matchPay     = !filters.payment_type || val.payment_type===filters.payment_type;
    const matchStatus  = !filters.status       || val.status===filters.status;
    return matchSearch&&matchArea&&matchRep&&matchPay&&matchStatus;
  });

  const totalValue = filtered.reduce((s,v)=>s+(Number(v.estimated_valuation)||0),0);

  const COLS = ['ID','User','Area & Property','Size (sqft)','Bed/Bath','Features','Report Type','Valuation (AED)','Payment','Created On','Actions'];

  return (
    <div style={{background:C.bg,minHeight:'100vh'}}>
      <style>{globalCss}</style>

      {viewReport  && <ReportModal  val={viewReport}  onClose={()=>setViewReport(null)}/>}
      {viewDetails && <DetailsModal val={viewDetails} onClose={()=>setViewDetails(null)}/>}

      <Sidebar open={sideOpen} onClose={()=>setSideOpen(false)} active={activeNav} onNav={handleNav} onLogout={handleLogout}/>
      <DesktopHeader onHamburger={()=>setSideOpen(true)}/>
      <MobileHeader  onHamburger={()=>setSideOpen(true)}/>

      <main className="main-wrap" style={{paddingTop:60}}>
        <div className="main-inner" style={{padding:'26px 22px',maxWidth:1400,margin:'0 auto'}}>

          {/* Title + search */}
          <div style={{display:'flex',flexWrap:'wrap',alignItems:'flex-start',justifyContent:'space-between',gap:16,marginBottom:22}}>
            <div>
              <h1 className="page-h1" style={{fontSize:28,fontWeight:900,color:C.text,letterSpacing:'-0.7px'}}>Property Valuations</h1>
              <p style={{fontSize:14,color:C.muted,marginTop:5}}>View and manage all generated property valuation reports.</p>
            </div>
            <div className="header-actions" style={{display:'flex',alignItems:'center',gap:10}}>
              <div className="search-wrap" style={{position:'relative'}}>
                <Search size={14} color={C.muted} strokeWidth={2} style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}/>
                <input className="search-input" type="text" placeholder="Search ID, Name, Area..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
                  style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:22,paddingLeft:38,paddingRight:16,paddingTop:10,paddingBottom:10,fontSize:13,color:C.text,outline:'none',width:300,fontFamily:'inherit'}}/>
              </div>
              <button onClick={()=>setShowFilters(!showFilters)}
                style={{padding:'10px 14px',borderRadius:22,border:`1px solid ${C.border}`,background:showFilters?C.copper:C.white,color:showFilters?C.white:C.muted,cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13,fontWeight:600,transition:'all 0.14s',whiteSpace:'nowrap'}}>
                <Filter size={15}/><span>Filter</span>
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="summary-grid" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
            <SummaryCard label="Total Valuations" value={filtered.length}/>
            <SummaryCard label="Total Value (AED)" value={`${(totalValue/1_000_000).toFixed(2)}M`}/>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="filter-grid" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,background:C.white,borderRadius:16,border:`1px solid ${C.border}`,padding:'20px',marginBottom:16,boxShadow:'0 1px 4px rgba(0,0,0,0.05)'}}>
              <div>
                <label style={{display:'block',fontSize:9.5,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.13em',marginBottom:6}}>Area</label>
                <select value={filters.area} onChange={e=>setFilters({...filters,area:e.target.value})}
                  style={{width:'100%',background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:'8px 12px',fontSize:13,fontWeight:600,color:C.text,outline:'none',fontFamily:'inherit',cursor:'pointer'}}>
                  <option value="">All Areas</option>
                  {uniqueAreas.map(a=><option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              {[
                {label:'Report Type',  key:'report_type',  options:['ValuCheck','DealLens']},
                {label:'Payment Type', key:'payment_type', options:['Free','Paid']},
                {label:'Status',       key:'status',       options:['completed','pending']},
              ].map(f=>(
                <div key={f.key}>
                  <label style={{display:'block',fontSize:9.5,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.13em',marginBottom:6}}>{f.label}</label>
                  <select value={filters[f.key]} onChange={e=>setFilters({...filters,[f.key]:e.target.value})}
                    style={{width:'100%',background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:'8px 12px',fontSize:13,fontWeight:600,color:C.text,outline:'none',fontFamily:'inherit',cursor:'pointer'}}>
                    <option value="">All</option>
                    {f.options.map(o=><option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}

          {loading ? (
            <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:200}}>
              <div style={{width:30,height:30,borderRadius:'50%',border:`3px solid ${C.copper}`,borderTopColor:'transparent',animation:'spin 0.75s linear infinite'}}/>
            </div>
          ) : (
            <div className="table-wrap">
              <div className="table-scroll">
                <table>
                  <colgroup>
                    <col style={{width:90}}/>   {/* ID */}
                    <col style={{width:130}}/>  {/* User */}
                    <col style={{width:180}}/>  {/* Area & Property */}
                    <col style={{width:90}}/>   {/* Size */}
                    <col style={{width:90}}/>   {/* Bed/Bath */}
                    <col style={{width:150}}/>  {/* Features */}
                    <col style={{width:110}}/>  {/* Report Type */}
                    <col style={{width:120}}/>  {/* Valuation */}
                    <col style={{width:90}}/>   {/* Payment */}
                    <col style={{width:100}}/>  {/* Created On */}
                    <col style={{width:110}}/>  {/* Actions */}
                  </colgroup>
                  <thead>
                    <tr style={{background:C.bg,borderBottom:`1px solid ${C.border}`}}>
                      {COLS.map(h=>(
                        <th key={h} style={{padding:'14px 16px',textAlign:h==='Actions'?'right':'left',fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.12em',whiteSpace:'nowrap'}}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length===0 ? (
                      <tr><td colSpan={COLS.length} style={{textAlign:'center',padding:'48px 0',color:C.muted,fontSize:14,fontWeight:600}}>No valuations found.</td></tr>
                    ) : filtered.map((val,idx)=>{
                      const vId       = String(val.id||'');
                      const displayId = /^\d+$/.test(vId) ? `VAL-${vId.padStart(3,'0')}` : `#${vId.slice(0,8)}`;
                      const name      = val.name||'—';
                      const userId    = val.user_id||val.userId||'';
                      const area      = val.district||val.area||'—';
                      const address   = val.property_name||val.property_address||'—';
                      const size = Math.round(Number(val.apartment_size || val.size || val.property_size || 0));
                      const beds      = val.bedroom ||val.bedrooms ||0;
                      const baths     = val.bathroom||val.bathrooms||0;
                      const features  = Array.isArray(val.features)?val.features:Array.isArray(val.amenities)?val.amenities:[];
                      const repType   = val.report_type||'—';
                      const payType   = val.payment_type||'—';
                      const valuation = Number(val.estimated_valuation||val.valuation_amount||0);
                      const createdOn = val.created_at?.slice(0,10)||'—';
                      const isPaid    = payType.toLowerCase()==='paid';
                      const isValu    = repType.toLowerCase().includes('valu');

                      return (
                        <tr key={val.id}
                          style={{borderBottom:idx<filtered.length-1?`1px solid ${C.border}`:'none',transition:'background 0.1s'}}
                          onMouseEnter={e=>e.currentTarget.style.background=C.bg}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>

                          {/* ID */}
                          <td style={{padding:'20px 16px',overflow:'hidden'}}>
                            <span style={{fontSize:11,fontWeight:800,color:C.muted,display:'block',whiteSpace:'nowrap'}}>{displayId}</span>
                          </td>

                          {/* User */}
                          <td style={{padding:'20px 16px',overflow:'hidden'}}>
                            <div style={{fontSize:13,fontWeight:700,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{name}</div>
                            {userId&&<div style={{fontSize:10,color:C.muted,marginTop:2}}>ID: {userId}</div>}
                          </td>

                          {/* Area & Property */}
                          <td style={{padding:'20px 16px',overflow:'hidden'}}>
                            <div style={{fontSize:10,fontWeight:800,color:C.copper,textTransform:'uppercase',letterSpacing:'0.08em',whiteSpace:'nowrap',marginBottom:3,overflow:'hidden',textOverflow:'ellipsis'}}>{area}</div>
                            <div style={{fontSize:12,fontWeight:600,color:C.text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{address}</div>
                          </td>

                          {/* Size */}
                          <td style={{padding:'20px 16px'}}>
                            <span style={{fontSize:14,fontWeight:900,color:C.text}}>{size.toLocaleString()}</span>
                          </td>

                          {/* Bed/Bath */}
                          <td style={{padding:'20px 16px'}}>
                            <span style={{fontSize:12,fontWeight:700,color:C.text}}>{beds}/ {baths}</span>
                          </td>

                          {/* Features */}
                          <td style={{padding:'20px 16px',overflow:'hidden'}}>
                            <div style={{display:'flex',flexWrap:'wrap',gap:3}}>
                              {features.length>0
                                ?features.slice(0,3).map((f,i)=>(
                                    <span key={i} style={{padding:'2px 7px',background:C.bg,borderRadius:5,fontSize:9,fontWeight:700,color:C.muted,border:`1px solid ${C.border}`,whiteSpace:'nowrap'}}>{f}</span>
                                  ))
                                :<span style={{fontSize:11,color:C.muted}}>—</span>
                              }
                            </div>
                          </td>

                          {/* Report Type */}
                          <td style={{padding:'20px 16px'}}>
                            <span style={{padding:'3px 9px',borderRadius:6,fontSize:9,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.08em',background:isValu?'#FEF3E7':'#EEF2FF',color:isValu?C.copper:'#6366F1',display:'inline-block',whiteSpace:'nowrap'}}>
                              {repType}
                            </span>
                          </td>

                          {/* Valuation */}
                          <td style={{padding:'20px 16px'}}>
                            <span style={{fontSize:14,fontWeight:900,color:C.text}}>
                              {valuation>0?`${(valuation/1_000_000).toFixed(2)}M`:'—'}
                            </span>
                          </td>

                          {/* Payment */}
                          <td style={{padding:'20px 16px'}}>
                            <span style={{padding:'3px 9px',borderRadius:6,fontSize:9,fontWeight:800,textTransform:'uppercase',letterSpacing:'0.06em',background:isPaid?'#D1FAE5':'#F3F3F4',color:isPaid?'#059669':C.muted,border:`1px solid ${isPaid?'#A7F3D0':C.border}`,display:'inline-block',whiteSpace:'nowrap'}}>
                              {payType}
                            </span>
                          </td>

                          {/* Created On */}
                          <td style={{padding:'20px 16px',fontSize:11,color:C.muted,fontWeight:500,whiteSpace:'nowrap'}}>
                            {createdOn}
                          </td>

                          {/* Actions */}
                          <td style={{padding:'20px 16px'}}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'flex-end',gap:4}}>
                              {/* View Report */}
                              <button className="tbl-action" onClick={()=>setViewReport(val)}
                                style={{padding:'6px',borderRadius:7,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',color:C.muted,flexShrink:0}}
                                title="View Report">
                                <Eye size={14}/>
                              </button>
                              {/* Download PDF */}
                              <button className="tbl-action" onClick={()=>downloadReport(val)}
                                style={{padding:'6px',borderRadius:7,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',color:C.muted,flexShrink:0}}
                                title="Download Report">
                                <Download size={14}/>
                              </button>
                              {/* View Details */}
                              <button className="tbl-action" onClick={()=>setViewDetails(val)}
                                style={{padding:'6px',borderRadius:7,border:`1px solid ${C.border}`,background:C.white,cursor:'pointer',display:'flex',color:C.muted,flexShrink:0}}
                                title="View Details">
                                <FileText size={14}/>
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
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminValuationsScreen;
