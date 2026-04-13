import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLogout } from '../hooks/useLogout';
import {
  Users, User, MessageSquare, FileText,
  DollarSign, Star, BookOpen, CreditCard, Zap,
  LayoutDashboard, Home, BarChart2, Settings,
  Bell, Search, ChevronDown, X, Menu, LogOut
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area
} from 'recharts';

/* ─── Tokens ───────────────────────────────────────────────────────── */
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

/* ─── Static data ──────────────────────────────────────────────────── */
const chartData = [
  { name: 'Mon', valuations: 4  },
  { name: 'Tue', valuations: 7  },
  { name: 'Wed', valuations: 5  },
  { name: 'Thu', valuations: 12 },
  { name: 'Fri', valuations: 9  },
  { name: 'Sat', valuations: 3  },
  { name: 'Sun', valuations: 2  },
];
const revenueData = [
  { name: 'Jan', revenue: 4500 },
  { name: 'Feb', revenue: 5200 },
  { name: 'Mar', revenue: 6100 },
  { name: 'Apr', revenue: 5800 },
  { name: 'May', revenue: 7200 },
  { name: 'Jun', revenue: 8500 },
];
const ttStyle = {
  borderRadius: '12px', border: 'none',
  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
  fontSize: '12px', fontWeight: '600',
};

const navItems = [
  { label: 'Overview',   icon: LayoutDashboard, key: 'overview'   },
  { label: 'Users',      icon: Users,            key: 'users'      },
  { label: 'Valuations', icon: Home,             key: 'valuations' },
  { label: 'Feedback',   icon: MessageSquare,    key: 'feedback'   },
  { label: 'Blogs',      icon: BookOpen,         key: 'blogs'      },
  { label: 'Analytics',  icon: BarChart2,        key: 'analytics'  },
  { label: 'Settings',   icon: Settings,         key: 'settings'   },
];

/* ─── Global CSS ───────────────────────────────────────────────────── */
const globalCss = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
  @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }

  .nav-btn { transition: background 0.14s; }
  .nav-btn:hover { background: rgba(255,255,255,0.07) !important; }

  /* ── Desktop header (white, full) ── */
  .hdr-desktop {
    display: flex;
  }
  /* ── Mobile header (dark, logo+burger only) ── */
  .hdr-mobile {
    display: none;
  }

  /* ── Grid layouts ── */
  .g-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 12px; }
  .g-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 12px; }
  .g-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .g-e { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
  .g-c { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .sp2 { grid-column: span 2; }

  /* ── Tablet ── */
  @media (max-width: 900px) {
    .g-3 { grid-template-columns: 1fr 1fr; }
    .g-4 { grid-template-columns: 1fr 1fr; }
    .g-2 { grid-template-columns: 1fr; }
    .g-e { grid-template-columns: 1fr 1fr; }
    .g-c { grid-template-columns: 1fr; }
    .sp2 { grid-column: span 2; }
  }

  /* ── Mobile ── */
  @media (max-width: 600px) {
    /* Swap headers */
    .hdr-desktop { display: none !important; }
    .hdr-mobile  { display: flex !important; }

    /* Grids go 1-col */
    .g-3 { grid-template-columns: 1fr; gap: 14px; }
    .g-4 { grid-template-columns: 1fr; gap: 14px; }
    .g-2 { grid-template-columns: 1fr; gap: 14px; }
    .g-e { grid-template-columns: 1fr; gap: 14px; }
    .g-c { grid-template-columns: 1fr; gap: 14px; }
    .sp2 { grid-column: span 1; }

    /* Content padding */
    .main-inner { padding: 20px 16px !important; }
    .page-h1    { font-size: 26px !important; }

    /* Push content below mobile dark header (60px) */
    .main-wrap  { padding-top: 60px !important; }

    /* Mobile stat card overrides — full-width, generous padding, left-aligned */
    .stat-card-mobile {
      border-radius: 20px !important;
      padding: 24px 24px !important;
      box-shadow: 0 2px 12px rgba(0,0,0,0.07) !important;
      border: 1px solid #ECECEC !important;
    }

    .stat-card-mobile .sc-icon-wrap {
      width: 48px !important;
      height: 48px !important;
      border-radius: 14px !important;
      margin-bottom: 18px !important;
    }

    .stat-card-mobile .sc-icon-wrap svg {
      width: 22px !important;
      height: 22px !important;
    }

    .stat-card-mobile .sc-label {
      font-size: 10px !important;
      letter-radius: 0.15em !important;
      margin-bottom: 8px !important;
    }

    .stat-card-mobile .sc-value {
      font-size: 42px !important;
      letter-spacing: -2px !important;
    }

    .stat-card-mobile .sc-sub {
      font-size: 13px !important;
      margin-top: 10px !important;
      line-height: 1.5 !important;
    }
  }
`;

/* ─── Sidebar drawer ───────────────────────────────────────────────── */
const Sidebar = ({ open, onClose, active, onNav, onLogout }) => {
  if (!open) return null;
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 98,
          background: 'rgba(0,0,0,0.5)',
          animation: 'fadeIn 0.18s ease',
        }}
      />
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0,
        width: SIDEBAR_W, background: C.sidebar,
        display: 'flex', flexDirection: 'column',
        zIndex: 99,
        animation: 'slideIn 0.22s ease',
        boxShadow: '6px 0 28px rgba(0,0,0,0.28)',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 18px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          flexShrink: 0,
        }}>
          <div>
            <span style={{ color: C.white,  fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ACQAR </span>
            <span style={{ color: C.copper, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ADMIN</span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)', border: 'none',
              width: 28, height: 28, borderRadius: 6, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.sidebarText,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
          {navItems.map(({ label, icon: Icon, key }) => {
            const on = active === key;
            return (
              <button
                key={key}
                className="nav-btn"
                onClick={() => { onNav(key); onClose(); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                  padding: '11px 14px', borderRadius: 10, border: 'none',
                  background: on ? C.activeNav : 'transparent',
                  color: on ? C.activeText : C.sidebarText,
                  cursor: 'pointer', marginBottom: 2,
                  fontSize: 13.5, fontWeight: on ? 700 : 400, textAlign: 'left',
                }}
              >
                <Icon size={17} strokeWidth={on ? 2.2 : 1.7} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <button className="nav-btn" onClick={onLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 11,
            padding: '11px 14px', borderRadius: 10, border: 'none',
            background: 'transparent', color: C.sidebarText,
            cursor: 'pointer', fontSize: 13.5, fontWeight: 400, textAlign: 'left',
          }}>
            <LogOut size={17} strokeWidth={1.7} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

/* ─── Desktop header (white) ───────────────────────────────────────── */
const DesktopHeader = ({ onHamburger }) => (
  <header
    className="hdr-desktop"
    style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 60,
      background: C.white, borderBottom: `1px solid ${C.border}`,
      alignItems: 'center', justifyContent: 'space-between',
      padding: '0 22px', zIndex: 90, gap: 12,
    }}
  >
    {/* Left */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
      <button
        onClick={onHamburger}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: C.muted, padding: 4 }}
        aria-label="Open menu"
      >
        <Menu size={22} strokeWidth={1.8} />
      </button>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: '#F3F3F4', borderRadius: 22,
        padding: '8px 16px', maxWidth: 360, width: '100%',
        border: `1px solid ${C.border}`,
      }}>
        <Search size={14} color={C.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: C.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          Search reports, users, or articles...
        </span>
      </div>
    </div>

    {/* Right */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
      <div style={{ position: 'relative', cursor: 'pointer', display: 'flex' }}>
        <Bell size={20} color={C.muted} strokeWidth={1.8} />
        <span style={{
          position: 'absolute', top: -2, right: -2,
          width: 7, height: 7, borderRadius: '50%',
          background: C.copper, border: `2px solid ${C.white}`,
        }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Admin User</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Super Admin
          </div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#F5EBE0', border: `2px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <User size={17} color={C.copper} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  </header>
);

/* ─── Mobile header (dark — logo left, hamburger right) ────────────── */
const MobileHeader = ({ onHamburger }) => (
  <header
    className="hdr-mobile"
    style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 60,
      background: C.sidebar,
      alignItems: 'center', justifyContent: 'space-between',
      padding: '0 18px', zIndex: 90,
    }}
  >
    {/* Logo */}
    <div>
      <span style={{ color: C.white,  fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ACQAR </span>
      <span style={{ color: C.copper, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ADMIN</span>
    </div>

    {/* Hamburger */}
    <button
      onClick={onHamburger}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 4, color: C.white,
      }}
      aria-label="Open menu"
    >
      <Menu size={24} strokeWidth={2} />
    </button>
  </header>
);

/* ─── Stat Card ────────────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, sub, className, children }) => (
  <div
    className={`stat-card-mobile ${className || ''}`}
    style={{
      background: C.white, borderRadius: 16,
      border: `1px solid ${C.border}`,
      padding: '22px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column',
    }}
  >
    <div
      className="sc-icon-wrap"
      style={{
        width: 38, height: 38, borderRadius: 9,
        background: iconBg || '#FEF3E7',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}
    >
      <Icon size={19} color={iconColor || C.copper} strokeWidth={1.8} />
    </div>
    <div
      className="sc-label"
      style={{ fontSize: 9.5, fontWeight: 700, color: C.muted, letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: 5 }}
    >
      {label}
    </div>
    <div
      className="sc-value"
      style={{ fontSize: 34, fontWeight: 900, color: C.text, letterSpacing: '-1.5px', lineHeight: 1 }}
    >
      {value}
    </div>
    {sub && (
      <div className="sc-sub" style={{ fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 1.4 }}>
        {sub}
      </div>
    )}
    {children}
  </div>
);

/* ─── Chart wrapper ────────────────────────────────────────────────── */
const ChartCard = ({ title, right, children }) => (
  <div style={{
    background: C.white, borderRadius: 16,
    border: `1px solid ${C.border}`, padding: '22px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 8 }}>
      <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text }}>{title}</h3>
      {right}
    </div>
    <div style={{ height: 230 }}>{children}</div>
  </div>
);

/* ─── Page ─────────────────────────────────────────────────────────── */
const AdminDashboardHome = () => {
  const navigate = useNavigate();
  const handleLogout = useLogout();
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [activeNav, setActiveNav] = useState('overview');
  const [sideOpen,  setSideOpen]  = useState(false);
const [valPeriod,    setValPeriod]    = useState('7d');
const [valChartData, setValChartData] = useState([]);
const [valLoading,   setValLoading]   = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          usersRes,
          valuationsRes,
          valuationValueRes,
          feedbacksRes,
          paidRes,
          investorRes,
          buyerRes,
          sellerRes,
          agentRes,
            blogsRes,  
            revenueRes,
 // ← add this
        ] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }),
          supabase.from('valuations').select('*', { count: 'exact', head: true }),
          supabase.from('valuations').select('estimated_valuation'),
          supabase.from('feedback').select('rating, star'),
supabase.from('users').select('*', { count: 'exact', head: true }).eq('plan', 'pro'),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'Investor'),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'Buyer'),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'Seller'),
         supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'Agent'),
  supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('status', 'published'), 
  supabase.from('payments').select('amount, created_at').eq('status', 'succeeded'), // ← new
]);
        

        console.log('=== ADMIN DASHBOARD DEBUG ===');
        console.log('users count:', usersRes.count, usersRes.error?.message);
        console.log('valuations count:', valuationsRes.count, valuationsRes.error?.message);
        console.log('valuationValue data sample:', valuationValueRes.data?.slice(0,2), valuationValueRes.error?.message);
        console.log('feedbacks data sample:', feedbacksRes.data?.slice(0,2), feedbacksRes.error?.message);
        console.log('investor count:', investorRes.count, investorRes.error?.message);
        console.log('buyer count:', buyerRes.count, buyerRes.error?.message);
        console.log('seller count:', sellerRes.count, sellerRes.error?.message);
        console.log('agent count:', agentRes.count, agentRes.error?.message);

        const totalUsers      = usersRes.count ?? 0;
        const paidUsers       = paidRes.count  ?? 0;
        const freeUsersDb     = Math.max(0, totalUsers - paidUsers);
        const totalValuations = valuationsRes.count ?? 0;

        const totalValuationValue = (valuationValueRes.data ?? []).reduce((sum, v) => {
          const val = Number(v.estimated_valuation ?? 0);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);

        const feedbackData   = feedbacksRes.data ?? [];
        const totalFeedbacks = feedbackData.length;
        // const averageRating  = totalFeedbacks > 0
        //   ? feedbackData.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) / totalFeedbacks
        //   : 0;

        const averageRating = totalFeedbacks > 0
  ? feedbackData.reduce((sum, f) => sum + (Number(f.rating) || 0), 0) / totalFeedbacks
  : 0;
const starredFeedbacks = feedbackData.filter(f => f.star != null && Number(f.star) > 0);
const averageStar = starredFeedbacks.length > 0
  ? starredFeedbacks.reduce((sum, f) => sum + Number(f.star), 0) / starredFeedbacks.length
  : 0;
const totalStarRatings = starredFeedbacks.length;

        console.log('totalValuationValue:', totalValuationValue);
        console.log('totalFeedbacks:', totalFeedbacks, 'avgRating:', averageRating);

        const revenueByMonth = {};
(revenueRes.data ?? []).forEach(row => {
  const month = new Date(row.created_at).toLocaleDateString('en-US', { month: 'short' });
  revenueByMonth[month] = (revenueByMonth[month] || 0) + (Number(row.amount) || 0);
});
const revenueChartData = Object.entries(revenueByMonth).map(([name, revenue]) => ({ name, revenue }));

        setStats({
          totalUsers,
          revenueChartData,
          paidUsers,
          freeUsers: freeUsersDb,
         usersByType: {
  investor: investorRes.count ?? 0,
  buyer:    buyerRes.count    ?? 0,
  seller:   sellerRes.count   ?? 0,
  agent:    agentRes.count    ?? 0,
},
totalValuations,
totalValuationValue,
totalFeedbacks,
averageRating,
averageStar,
totalStarRatings,
totalArticles: blogsRes.count ?? 0,   // ← correct, top level
totalSubscriptions: paidUsers,
        });
      } catch (err) {
        console.error('fetchStats error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    



    const channel = supabase
      .channel('admin-dashboard-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' },      () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'valuations' }, () => fetchStats())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' },  () => fetchStats())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  
    
  // ── Val chart useEffect (separate, depends on valPeriod) ─────────
// useEffect(() => {
//   const fetchValChart = async () => {
//     setValLoading(true);
//     try {
//       const now  = new Date();
//       const days = valPeriod === '7d' ? 7 : 30;
//       const from = new Date(now);
//       from.setDate(from.getDate() - (days - 1));
//       from.setHours(0, 0, 0, 0);

//       const { data, error } = await supabase
//         .from('valuations')
//         .select('updated_at')
//         .gte('updated_at', from.toISOString());

//       if (error) throw error;

//       const counts = {};
//       for (let i = 0; i < days; i++) {
//         const d = new Date(from);
//         d.setDate(d.getDate() + i);
//         const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
//         counts[key] = 0;
//       }
//       (data || []).forEach(row => {
//         const d   = new Date(row.updated_at);
//         const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
//         if (key in counts) counts[key]++;
//       });

//       setValChartData(
//         Object.entries(counts).map(([name, valuations]) => ({ name, valuations }))
//       );
//     } catch (err) {
//       console.error('valChart error:', err);
//     } finally {
//       setValLoading(false);
//     }
//   };

//   fetchValChart();
// }, [valPeriod]); // ← closes val chart useEffect

useEffect(() => {
  const fetchValChart = async () => {
    setValLoading(true);
    try {
      const now  = new Date();
      const days = valPeriod === '7d' ? 7 : 30;
      const from = new Date(now);
      from.setDate(from.getDate() - (days - 1));
      from.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('valuations')
        .select('updated_at')
        .gte('updated_at', from.toISOString());

      if (error) throw error;

      const counts = {};
      for (let i = 0; i < days; i++) {
        const d = new Date(from);
        d.setDate(d.getDate() + i);
        const key = valPeriod === '7d'
          ? d.toLocaleDateString('en-GB', { weekday: 'short' })
          : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        counts[key] = 0;
      }
      (data || []).forEach(row => {
        const d   = new Date(row.updated_at);
        const key = valPeriod === '7d'
          ? d.toLocaleDateString('en-GB', { weekday: 'short' })
          : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        if (key in counts) counts[key]++;
      });

      setValChartData(
        Object.entries(counts).map(([name, valuations]) => ({ name, valuations }))
      );
    } catch (err) {
      console.error('valChart error:', err);
    } finally {
      setValLoading(false);
    }
  };

  fetchValChart();
}, [valPeriod]);

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') setSideOpen(false); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  const handleNav = useCallback((key) => {
    setActiveNav(key);
    if (key !== 'overview') navigate(`/admin/${key}`);
  }, [navigate]);

  const freeUsers = stats?.freeUsers ?? 0;

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <style>{globalCss}</style>

      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} active={activeNav} onNav={handleNav} onLogout={handleLogout} />

      <DesktopHeader onHamburger={() => setSideOpen(true)} />
      <MobileHeader onHamburger={() => setSideOpen(true)} />

      <main className="main-wrap" style={{ paddingTop: 60 }}>
        <div className="main-inner" style={{ padding: '26px 22px', maxWidth: 1180, margin: '0 auto' }}>

          {/* Title */}
          <div style={{ marginBottom: 22 }}>
            <h1 className="page-h1" style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: '-0.7px' }}>
              Dashboard Overview
            </h1>
            <p style={{ fontSize: 14, color: C.muted, marginTop: 5 }}>
              Welcome back, Admin. Here's what's happening with Acqar today.
            </p>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                border: `3px solid ${C.copper}`, borderTopColor: 'transparent',
                animation: 'spin 0.75s linear infinite',
              }} />
            </div>
          ) : (
            <>
              {/* Row 1 */}
              <div className="g-3">
                <StatCard icon={Users} label="Total Platform Users" value={stats?.totalUsers ?? 0} />
                <StatCard icon={Zap}  iconBg="#E6FAF3" iconColor={C.emerald} label="Paid Users"  value={stats?.paidUsers ?? 0} />
                <StatCard icon={User} iconBg="#F5F5F5" iconColor={C.muted}   label="Free Users"  value={freeUsers} />
              </div>

              {/* Row 2 */}
              <div className="g-4">
                {[
                  { label: 'Investor', value: stats?.usersByType?.investor ?? 0 },
                  { label: 'Buyer',    value: stats?.usersByType?.buyer    ?? 0 },
                  { label: 'Seller',   value: stats?.usersByType?.seller   ?? 0 },
                  { label: 'Agent',    value: stats?.usersByType?.agent    ?? 0 },
                ].map((t, i) => <StatCard key={i} icon={User} label={t.label} value={t.value} />)}
              </div>

              {/* Row 3 */}
              <div className="g-2">
                <StatCard icon={FileText}   label="Total Valuations"  value={stats?.totalValuations ?? 0}  sub="Total property reports generated on the platform." />
                <StatCard icon={DollarSign} label="Total Asset Value" value={`AED ${((stats?.totalValuationValue ?? 0) / 1_000_000).toFixed(2)}M`} sub="Cumulative property value analyzed by Acqar." />
              </div>

              {/* Row 4 */}
              <div className="g-e">
                {/* Feedback card */}
                <div
                  className="stat-card-mobile"
                  style={{
                    background: C.white, borderRadius: 16,
                    border: `1px solid ${C.border}`, padding: '22px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    className="sc-icon-wrap"
                    style={{ width:38, height:38, borderRadius:9, background:'#FEF3E7', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}
                  >
                    <MessageSquare size={19} color={C.copper} strokeWidth={1.8} />
                  </div>
                  <div className="sc-label" style={{ fontSize:9.5, fontWeight:700, color:C.muted, letterSpacing:'0.13em', textTransform:'uppercase', marginBottom:5 }}>Feedback</div>
                  <div className="sc-value" style={{ fontSize:34, fontWeight:900, color:C.text, letterSpacing:'-1.5px', lineHeight:1, marginBottom:10 }}>
                    {stats?.totalFeedbacks ?? 0}
                  </div>
                  {/* <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                    {[...Array(5)].map((_, i) => {
                      const on = i < Math.round(stats?.averageRating ?? 0);
                      return <Star key={i} size={13} style={{ color: on ? C.amber : '#DDD', fill: on ? C.amber : 'transparent' }} />;
                    })}
                    <span style={{ fontSize:12, fontWeight:700, color:C.text, marginLeft:4 }}>
                      {(stats?.averageRating ?? 0).toFixed(1)}
                    </span>
                  </div> */}

                  {/* <div style={{ display:'flex', alignItems:'center', gap:3, marginBottom: 8 }}>
  {[...Array(5)].map((_, i) => {
    const on = i < Math.round(stats?.averageRating ?? 0);
    return <Star key={i} size={13} style={{ color: on ? C.amber : '#DDD', fill: on ? C.amber : 'transparent' }} />;
  })}
  <span style={{ fontSize:12, fontWeight:700, color:C.text, marginLeft:4 }}>
    {(stats?.averageRating ?? 0).toFixed(1)}
  </span>
</div> */}
<div style={{ display:'flex', alignItems:'center', gap:3 }}>
  {[...Array(5)].map((_, i) => {
    const on = i < Math.round(stats?.averageStar ?? 0);
    return <Star key={`s${i}`} size={13} style={{ color: on ? C.copper : '#DDD', fill: on ? C.copper : 'transparent' }} />;
  })}
  <span style={{ fontSize:11, color:C.muted, marginLeft:4 }}>
    {(stats?.averageStar ?? 0).toFixed(1)} avg · {stats?.totalStarRatings ?? 0} rated
  </span>
</div>
                </div>
                <StatCard icon={BookOpen}   label="Articles"      value={stats?.totalArticles      ?? 0} sub="Published blog posts"  />
                <StatCard icon={CreditCard} label="Subscriptions" value={stats?.totalSubscriptions ?? 0} sub="Active premium plans"  />
              </div>

              {/* Charts */}
              <div className="g-c">
                {/* <ChartCard
                  title="Valuation Activity"
                  right={
                    <div style={{ display:'flex', alignItems:'center', gap:5, background:'#F3F3F4', borderRadius:8, padding:'5px 11px', fontSize:12, fontWeight:600, color:C.text, cursor:'pointer', border:`1px solid ${C.border}` }}>
                      Last 7 Days <ChevronDown size={13} />
                    </div>
                  }
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barCategoryGap="40%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize:11, fontWeight:600, fill:'#AAA' }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fontWeight:600, fill:'#AAA' }} />
                      <Tooltip cursor={{ fill:'rgba(200,131,42,0.06)' }} contentStyle={ttStyle} />
                      <Bar dataKey="valuations" fill={C.copper} radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard> */}


                <ChartCard
  title="Valuation Activity"
  right={
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
    <select
      value={valPeriod}
      onChange={(e) => setValPeriod(e.target.value)}
      style={{
        appearance: 'none',
        WebkitAppearance: 'none',
        padding: '6px 32px 6px 12px',
        fontSize: 12, fontWeight: 600,
        borderRadius: 8,
        background: '#FEF3E7',
color: C.copper,
border: `1px solid ${C.copper}`,
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      <option value="7d">Last 7 Days</option>
      <option value="1m">Last Month</option>
    </select>
    <ChevronDown size={13} style={{ position: 'absolute', right: 10, pointerEvents: 'none', color: C.muted }} />
  </div>
}
>
  {valLoading ? (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100%' }}>
      <div style={{ width:24, height:24, borderRadius:'50%', border:`3px solid ${C.copper}`, borderTopColor:'transparent', animation:'spin 0.75s linear infinite' }} />
    </div>
  ) : (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={valChartData} barCategoryGap="40%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
        <XAxis
          dataKey="name"
          axisLine={false} tickLine={false}
          tick={{ fontSize: valPeriod === '1m' ? 9 : 11, fontWeight: 600, fill: '#AAA' }}
          interval={valPeriod === '1m' ? 4 : 0}
          dy={8}
        />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fontWeight:600, fill:'#AAA' }} />
        <Tooltip cursor={{ fill:'rgba(200,131,42,0.06)' }} contentStyle={ttStyle} />
        <Bar dataKey="valuations" fill={C.copper} radius={[6,6,0,0]} />
      </BarChart>
    </ResponsiveContainer>
  )}
</ChartCard>

                <ChartCard
                  title="Revenue Growth"
                  right={
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background:C.emerald, display:'inline-block' }} />
                      <span style={{ fontSize:11, fontWeight:700, color:C.muted, letterSpacing:'0.08em', textTransform:'uppercase' }}>Subscription</span>
                    </div>
                  }
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <<AreaChart data={stats?.revenueChartData?.length ? stats.revenueChartData : revenueData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={C.emerald} stopOpacity={0.18} />
                          <stop offset="95%" stopColor={C.emerald} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize:11, fontWeight:600, fill:'#AAA' }} dy={8} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize:11, fontWeight:600, fill:'#AAA' }} />
                      <Tooltip contentStyle={ttStyle} />
                      <Area type="monotone" dataKey="revenue" stroke={C.emerald} strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardHome;
