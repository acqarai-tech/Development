import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogout } from '../hooks/useLogout';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
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
  { label: 'Discount Codes', key: 'discount-codes' },
  { label: 'Settings',   key: 'settings'   },
];

/* ─── Icons ───────────────────────────────────────────────────────── */
const IcoMenu    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IcoX       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoSearch  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IcoBell    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const IcoUser    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IcoLogout  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IcoArrowUp = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>;
const IcoArrowDn = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></svg>;
const IcoUsers   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoEye     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const IcoClock   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IcoMouse   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="7"/><line x1="12" y1="6" x2="12" y2="10"/></svg>;
const IcoMonitor = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
const IcoPhone   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>;
const IcoGlobe   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const IcoExport  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;

const NavIcon = ({ k, size = 17 }) => {
  const icons = {
    overview:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    users:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    valuations: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    feedback:   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    blogs:      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
    analytics:  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    discountcodes: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
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
  @keyframes pulse   { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
  .sidebar-nav-btn { transition: background 0.14s; }
  .sidebar-nav-btn:hover { background: rgba(255,255,255,0.07) !important; }
  .hdr-desktop { display: flex !important; }
  .hdr-mobile  { display: none  !important; }
  .stat-card { transition: transform 0.15s, box-shadow 0.15s; }
  .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.09) !important; }
  .analytics-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
  .analytics-bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 8px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .export-btn { transition: background 0.15s, opacity 0.15s; }
  .export-btn:hover:not(:disabled) { background: #a6682e !important; }
  @media (max-width: 1100px) {
    .analytics-stats { grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 640px) {
    .hdr-desktop { display: none !important; }
    .hdr-mobile  { display: flex  !important; }
    .main-content { padding-top: 60px !important; }
    .inner-pad { padding: 20px 16px !important; }
    .analytics-stats { grid-template-columns: 1fr 1fr; gap: 12px; }
    .analytics-bottom { grid-template-columns: 1fr; }
    .page-header { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
    .page-header-actions { width: 100%; }
    .chart-legend { flex-direction: column; gap: 6px !important; }
    .device-inner { flex-direction: column; }
  }
`;

/* ─── Helpers ─────────────────────────────────────────────────────── */
const fmt     = n => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n);
const fmtTime = s => `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`;

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

/* ─── Shared Layout Components ────────────────────────────────────── */
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

/* ─── Card wrapper ────────────────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
  <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: '0 1px 6px rgba(0,0,0,0.05)', padding: '28px', ...style }}>
    {children}
  </div>
);

/* ─── Skeleton loader ─────────────────────────────────────────────── */
const StatSkeleton = () => (
  <div className="stat-card" style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
      <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 12 }} />
      <div className="skeleton" style={{ width: 50, height: 18 }} />
    </div>
    <div className="skeleton" style={{ width: 80, height: 10, marginBottom: 10 }} />
    <div className="skeleton" style={{ width: 100, height: 36 }} />
  </div>
);

/* ─── Main Component ──────────────────────────────────────────────── */
const AdminAnalyticsScreen = () => {
  const navigate     = useNavigate();
  const handleLogout = useLogout();
  const [sideOpen,  setSideOpen]  = useState(false);
  const [activeNav, setActiveNav] = useState('analytics');
  const [dateRange, setDateRange] = useState('30daysAgo');
  const [dateLabel, setDateLabel] = useState('Last 30 Days');
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const [stats, setStats] = useState([
    { label: 'Total Visitors', value: '—', icon: <IcoUsers />, trend: '', isUp: true  },
    { label: 'Page Views',     value: '—', icon: <IcoEye />,   trend: '', isUp: true  },
    { label: 'Avg. Session',   value: '—', icon: <IcoClock />, trend: '', isUp: false },
    { label: 'Bounce Rate',    value: '—', icon: <IcoMouse />, trend: '', isUp: true  },
  ]);
  const [visitorData,  setVisitorData]  = useState([]);
  const [deviceData,   setDeviceData]   = useState([
    { name: 'Desktop', value: 0, color: C.copper  },
    { name: 'Mobile',  value: 0, color: '#1C1C1E' },
    { name: 'Tablet',  value: 0, color: '#C0C0C0' },
  ]);
  const [locationData, setLocationData] = useState([]);

  // ── Raw numeric values kept aside for export ──
  const [rawStats, setRawStats] = useState({ totalUsers: 0, totalViews: 0, avgSession: 0, bounceRate: 0 });

  /* ── Fetch from backend ── */
  useEffect(() => {
    // FIX 1 ✅ correct env var name
    const API = process.env.REACT_APP_AVM_API || 'http://127.0.0.1:8000';
    setLoading(true);
    setError(null);

    fetch(`${API}/api/analytics?range=${dateRange}`)
      .then(r => {
        if (!r.ok) throw new Error(`Server error: ${r.status}`);
        return r.json();
      })
      .then(data => {
        const rows   = data.rows   || [];
        const totals = data.totals?.[0]?.metricValues || [];

        // FIX 2 ✅ fall back to summing rows when totals array is empty
        let totalUsers = parseInt(totals[0]?.value || 0);
        let totalViews = parseInt(totals[1]?.value || 0);
        let avgSession = parseFloat(totals[2]?.value || 0);
        let bounceRate = parseFloat(totals[3]?.value || 0);

        if (totalUsers === 0 && totalViews === 0 && rows.length > 0) {
          rows.forEach(row => {
            totalUsers += parseInt(row.metricValues?.[0]?.value || 0);
            totalViews += parseInt(row.metricValues?.[1]?.value || 0);
          });
          const sessions = rows.map(r => parseFloat(r.metricValues?.[2]?.value || 0)).filter(v => v > 0);
          avgSession = sessions.length ? sessions.reduce((a, b) => a + b, 0) / sessions.length : 0;
          const bounces = rows.map(r => parseFloat(r.metricValues?.[3]?.value || 0)).filter(v => v > 0);
          bounceRate = bounces.length ? bounces.reduce((a, b) => a + b, 0) / bounces.length : 0;
        }

        // Store raw numbers for the CSV export
        setRawStats({ totalUsers, totalViews, avgSession, bounceRate });

        setStats([
          { label: 'Total Visitors', value: fmt(totalUsers),             icon: <IcoUsers />, trend: '', isUp: true  },
          { label: 'Page Views',     value: fmt(totalViews),             icon: <IcoEye />,   trend: '', isUp: true  },
          { label: 'Avg. Session',   value: fmtTime(avgSession),         icon: <IcoClock />, trend: '', isUp: false },
          { label: 'Bounce Rate',    value: bounceRate.toFixed(1) + '%', icon: <IcoMouse />, trend: '', isUp: true  },
        ]);

        // FIX 3 ✅ sort chart oldest → newest by real month number
        const monthMap = {};
        rows.forEach(row => {
          const monthNum = row.dimensionValues?.[0]?.value;
          const users    = parseInt(row.metricValues?.[0]?.value || 0);
          const views    = parseInt(row.metricValues?.[1]?.value || 0);
          if (!monthNum) return;
          const num = parseInt(monthNum);
          const key = MONTH_NAMES[num - 1] || monthNum;
          if (!monthMap[key]) monthMap[key] = { name: key, visitors: 0, pageViews: 0, _order: num };
          monthMap[key].visitors  += users;
          monthMap[key].pageViews += views;
        });
        setVisitorData(Object.values(monthMap).sort((a, b) => a._order - b._order));

        /* ── Device distribution ── */
        const devMap = { desktop: 0, mobile: 0, tablet: 0 };
        rows.forEach(row => {
          const device = (row.dimensionValues?.[2]?.value || '').toLowerCase();
          const users  = parseInt(row.metricValues?.[0]?.value || 0);
          if (device in devMap) devMap[device] += users;
        });
        const devTotal = Object.values(devMap).reduce((a, b) => a + b, 0) || 1;
        setDeviceData([
          { name: 'Desktop', value: Math.round(devMap.desktop / devTotal * 100), color: C.copper  },
          { name: 'Mobile',  value: Math.round(devMap.mobile  / devTotal * 100), color: '#1C1C1E' },
          { name: 'Tablet',  value: Math.round(devMap.tablet  / devTotal * 100), color: '#C0C0C0' },
        ]);

        /* ── Top locations ── */
        const countryMap = {};
        rows.forEach(row => {
          const country = row.dimensionValues?.[1]?.value;
          const users   = parseInt(row.metricValues?.[0]?.value || 0);
          if (!country || country === '(not set)') return;
          countryMap[country] = (countryMap[country] || 0) + users;
        });
        const sorted   = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const locTotal = sorted.reduce((s, [, v]) => s + v, 0) || 1;
        setLocationData(sorted.map(([country, visitors]) => ({
          country,
          visitors:      fmt(visitors),
          visitorsRaw:   visitors,
          percentage:    Math.round(visitors / locTotal * 100),
        })));

        setLoading(false);
      })
      .catch(err => {
        console.error('Analytics fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [dateRange]);

  /* ── FIX 4 ✅ Export Report → downloads a formatted CSV ── */
  const handleExport = () => {
    if (loading) return;

    const today = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
    const slug  = today.replace(/\//g, '-');

    let csv = '';
    csv += `ACQAR Analytics Report\n`;
    csv += `Period,${dateLabel}\n`;
    csv += `Generated,${today}\n`;
    csv += `\n`;

    csv += `SUMMARY\n`;
    csv += `Metric,Value\n`;
    csv += `Total Visitors,${rawStats.totalUsers}\n`;
    csv += `Page Views,${rawStats.totalViews}\n`;
    csv += `Avg. Session Duration,"${fmtTime(rawStats.avgSession)}"\n`;
    csv += `Bounce Rate,${rawStats.bounceRate.toFixed(1)}%\n`;
    csv += `\n`;

    csv += `TRAFFIC BY MONTH\n`;
    csv += `Month,Visitors,Page Views\n`;
    visitorData.forEach(r => {
      csv += `${r.name},${r.visitors},${r.pageViews}\n`;
    });
    csv += `\n`;

    csv += `DEVICE DISTRIBUTION\n`;
    csv += `Device,Share (%)\n`;
    deviceData.forEach(d => {
      csv += `${d.name},${d.value}%\n`;
    });
    csv += `\n`;

    csv += `TOP LOCATIONS\n`;
    csv += `Country,Visitors,Share (%)\n`;
    locationData.forEach(loc => {
      csv += `${loc.country},${loc.visitorsRaw ?? loc.visitors},${loc.percentage}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `acqar-analytics-${dateRange}-${slug}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNav = (key) => {
    setActiveNav(key);
    if      (key === 'overview')   navigate('/admin-dashboard');
    else if (key === 'blogs')      navigate('/admin/blogs');
    else if (key !== 'analytics')  navigate(`/admin/${key}`);
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    const map = { 'Last 30 Days': '30daysAgo', 'Last 90 Days': '90daysAgo', 'Last Year': '365daysAgo' };
    setDateLabel(val);
    setDateRange(map[val] || '30daysAgo');
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

      {loading && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, zIndex: 80, background: C.copper, color: '#fff', textAlign: 'center', padding: '7px', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em' }}>
          Loading live analytics data…
        </div>
      )}

      {error && !loading && (
        <div style={{ position: 'fixed', top: 60, left: 0, right: 0, zIndex: 80, background: '#DC2626', color: '#fff', textAlign: 'center', padding: '7px', fontSize: 12, fontWeight: 700 }}>
          Failed to load analytics: {error}
        </div>
      )}

      <main className="main-content" style={{ paddingTop: 60 }}>
        <div className="inner-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 60px' }}>

          {/* ── Page header ── */}
          <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, letterSpacing: '-0.7px', margin: 0 }}>Google Analytics</h1>
              <p style={{ fontSize: 14, color: C.muted, marginTop: 4 }}>
                Real-time traffic and engagement data for Acqar.{' '}
                {!loading && !error && <span style={{ color: '#16A34A', fontWeight: 700 }}>● Live</span>}
              </p>
            </div>
            <div className="page-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <select
                value={dateLabel}
                onChange={handleDateChange}
                style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: '9px 14px', fontSize: 13, fontWeight: 700, color: C.text, outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>Last Year</option>
              </select>

              {/* ── Export button ── */}
              <button
                className="export-btn"
                onClick={handleExport}
                disabled={loading}
                title={loading ? 'Wait for data to load…' : `Download CSV for ${dateLabel}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: loading ? '#d4a96a' : C.copper,
                  color: '#fff', border: 'none', borderRadius: 10,
                  padding: '10px 20px', fontWeight: 800, fontSize: '0.75rem',
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(200,131,42,0.25)',
                  fontFamily: 'inherit', opacity: loading ? 0.65 : 1,
                }}>
                <IcoExport />
                {loading ? 'Loading…' : 'Export Report'}
              </button>
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div className="analytics-stats">
            {loading
              ? [0,1,2,3].map(i => <StatSkeleton key={i} />)
              : stats.map(({ label, value, icon, trend, isUp }) => (
                <div key={label} className="stat-card" style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ width: 40, height: 40, background: '#F3F3F4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text }}>
                      {icon}
                    </div>
                    {trend && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.7rem', fontWeight: 800, color: isUp ? '#16A34A' : '#DC2626' }}>
                        {isUp ? <IcoArrowUp /> : <IcoArrowDn />} {trend}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.6rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.13em', marginBottom: 6 }}>{label}</p>
                  <h3 style={{ fontSize: '1.9rem', fontWeight: 900, color: C.text, letterSpacing: '-1px', lineHeight: 1 }}>{value}</h3>
                </div>
              ))
            }
          </div>

          {/* ── Traffic chart ── */}
          <Card style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 900, color: C.text, letterSpacing: '-0.3px' }}>Traffic Overview</h3>
                <p style={{ fontSize: 13, color: C.muted, marginTop: 3 }}>Visitors vs Page Views</p>
              </div>
              <div className="chart-legend" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.copper, display: 'inline-block' }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Visitors</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: C.sidebar, display: 'inline-block' }} />
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Page Views</span>
                </div>
              </div>
            </div>
            <div style={{ height: 320 }}>
              {loading ? (
                <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 12 }} />
              ) : visitorData.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: C.muted, fontSize: 14, fontWeight: 600 }}>
                  No traffic data available for this period.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={visitorData}>
                    <defs>
                      <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={C.copper} stopOpacity={0.12} />
                        <stop offset="95%" stopColor={C.copper} stopOpacity={0}    />
                      </linearGradient>
                      <linearGradient id="colorPV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#1C1C1E" stopOpacity={0.10} />
                        <stop offset="95%" stopColor="#1C1C1E" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: C.muted }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: C.muted }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.10)', fontSize: 12, fontWeight: 700 }} />
                    <Area type="monotone" dataKey="visitors"  stroke={C.copper}  strokeWidth={3} fillOpacity={1} fill="url(#colorVis)" />
                    <Area type="monotone" dataKey="pageViews" stroke="#1C1C1E" strokeWidth={3} fillOpacity={1} fill="url(#colorPV)"  />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* ── Bottom row ── */}
          <div className="analytics-bottom">

            {/* Device Distribution */}
            <Card>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: C.text, letterSpacing: '-0.3px', marginBottom: 24 }}>Device Distribution</h3>
              {loading ? (
                <div style={{ display: 'flex', gap: 24 }}>
                  <div className="skeleton" style={{ width: 200, height: 200, borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
                    {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: 36, borderRadius: 8 }} />)}
                  </div>
                </div>
              ) : (
                <div className="device-inner" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ width: 200, height: 200, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={deviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value">
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: 10, border: 'none', fontSize: 12, fontWeight: 700 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {deviceData.map((item) => (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, background: '#F3F3F4', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text }}>
                            {item.name === 'Desktop' ? <IcoMonitor /> : item.name === 'Mobile' ? <IcoPhone /> : <IcoGlobe />}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.name}</p>
                            <p style={{ fontSize: '0.6rem', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Device Type</p>
                          </div>
                        </div>
                        <p style={{ fontSize: 18, fontWeight: 900, color: C.text }}>{item.value}%</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Top Locations */}
            <Card>
              <h3 style={{ fontSize: 17, fontWeight: 900, color: C.text, letterSpacing: '-0.3px', marginBottom: 24 }}>Top Locations</h3>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {[0,1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 40, borderRadius: 8 }} />)}
                </div>
              ) : locationData.length === 0 ? (
                <div style={{ color: C.muted, fontSize: 14, fontWeight: 600, textAlign: 'center', padding: '40px 0' }}>
                  No location data available.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {locationData.map((item) => (
                    <div key={item.country}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{item.country}</p>
                        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: C.muted }}>{item.visitors} visitors</p>
                      </div>
                      <div style={{ width: '100%', height: 6, background: '#F3F3F4', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${item.percentage}%`, background: C.copper, borderRadius: 999, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminAnalyticsScreen;
