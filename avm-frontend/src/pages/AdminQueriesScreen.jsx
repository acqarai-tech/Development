import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLogout } from '../hooks/useLogout';
import { Helmet } from 'react-helmet-async';
import {
  Users, User, MessageSquare, FileText,
  DollarSign, Star, BookOpen, CreditCard, Zap,
  LayoutDashboard, Home, BarChart2, Settings,
  Bell, Search, ChevronDown, X, Menu, LogOut,
  Link2, Copy, ExternalLink, Check
} from 'lucide-react';

/* ─── Tokens (identical to AdminDashboardHome so the two screens match) ── */
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

// Real route confirmed from ChatPage.jsx: shared chats are opened via
// /broker?share=<id>, read by the useEffect that watches location.search.
const SHARED_CHAT_BASE_URL = 'https://www.acqar.com/broker';
const buildSharedLink = (id) => `${SHARED_CHAT_BASE_URL}?share=${id}`;

// ─── Lightweight version of ChatPage's value highlighting, so admin ──────
// responses read the same way the chat itself renders them (bold AED
// amounts, percentages, BUY/HOLD/WATCH badges) without pulling in the
// full card/chart machinery from ChatPage.jsx.
function highlightValues(text) {
  if (!text) return '';
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#0F0F0F;font-weight:700">$1</strong>')
    .replace(/(AED\s?[\d,.]+[MBK]?)/g, '<strong style="color:#0F0F0F;font-weight:700">$1</strong>')
    .replace(/(\d+\.?\d*%)/g, '<strong style="color:#0F0F0F;font-weight:700">$1</strong>')
    .replace(/(\d+\/100)/g, '<strong style="color:#0F0F0F;font-weight:700">$1</strong>')
    .replace(/\b(BUY)\b/g, '<span style="color:#065F46;font-weight:700;background:#D1FAE5;padding:1px 6px;border-radius:4px">BUY</span>')
    .replace(/\b(HOLD)\b/g, '<span style="color:#92400E;font-weight:700;background:#FEF3C7;padding:1px 6px;border-radius:4px">HOLD</span>')
    .replace(/\b(WATCH)\b/g, '<span style="color:#991B1B;font-weight:700;background:#FEE2E2;padding:1px 6px;border-radius:4px">WATCH</span>');
}

const SECTION_EMOJIS = ["🏙️","📊","💰","🏗️","📈","⚡","🛡️","📉","✅","🏆","🔢","🏡","🏫","💡","🏠","📋","🔑","💼","📌","🔍"];
function stripEmojis(text) {
  if (!text) return text;
  return text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").trim();
}

// Renders a response_data payload the way ChatPage does: summary line,
// then the reply body with value-highlighting, then area link pills.
const ResponseCell = ({ query: queryText, response, responseData }) => {
  const [expanded, setExpanded] = useState(false);
  if (!response && !responseData) {
    return (
      <span style={{ fontSize: 12, color: '#BBB', fontStyle: 'italic' }}>
        Asked before response-logging was enabled
      </span>
    );
  }

  const summary = responseData?.summary || responseData?._summary || null;
  const reply = responseData?.reply || response || '';
  const areaLinks = Array.isArray(responseData?.area_links) ? responseData.area_links : [];
  const isLong = reply.length > 280;
  const shown = expanded || !isLong ? reply : `${reply.slice(0, 280)}…`;

  return (
    <div style={{ maxWidth: 420 }}>
      {summary && (
        <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, marginBottom: 6, lineHeight: 1.5 }}>
          {summary}
        </div>
      )}
      <div
        style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: highlightValues(shown) }}
      />
      {isLong && (
        <button
          onClick={() => setExpanded(e => !e)}
          style={{ marginTop: 4, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 11.5, fontWeight: 700, color: C.copper }}
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
      {areaLinks.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
          {areaLinks.slice(0, 4).map((l, i) => (
            <a
              key={i}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11, fontWeight: 600, color: C.copper, textDecoration: 'none',
                background: '#FEF3E7', border: `1px solid ${C.copper}`, borderRadius: 20,
                padding: '3px 10px', whiteSpace: 'nowrap',
              }}
            >
              {l.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const navItems = [
  { label: 'Overview',       icon: LayoutDashboard, key: 'overview'        },
  { label: 'Users',          icon: Users,            key: 'users'           },
  { label: 'Valuations',     icon: Home,             key: 'valuations'      },
  { label: 'Queries',        icon: MessageSquare,    key: 'queries'         },
  { label: 'Feedback',       icon: MessageSquare,    key: 'feedback'        },
  { label: 'Blogs',          icon: BookOpen,         key: 'blogs'           },
  { label: 'Analytics',      icon: BarChart2,        key: 'analytics'       },
  { label: 'Discount Codes', icon: CreditCard,       key: 'discount-codes'  },
  { label: 'Settings',       icon: Settings,         key: 'settings'        },
];

const PAGE_SIZE = 20;

/* ─── Global CSS (subset reused from AdminDashboardHome) ──────────────── */
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

  .hdr-desktop { display: flex; }
  .hdr-mobile  { display: none; }

  .q-row { transition: background 0.12s; }
  .q-row:hover { background: #FAFAFA; }

  .q-link-btn { transition: background 0.12s, border-color 0.12s; }
  .q-link-btn:hover { background: #FEF3E7 !important; border-color: ${C.copper} !important; }

  @media (max-width: 900px) {
    .q-table-wrap { overflow-x: auto; }
  }

  @media (max-width: 600px) {
    .hdr-desktop { display: none !important; }
    .hdr-mobile  { display: flex !important; }
    .main-inner  { padding: 20px 16px !important; }
    .page-h1     { font-size: 26px !important; }
    .main-wrap   { padding-top: 60px !important; }
  }
`;

/* ─── Sidebar (identical structure to AdminDashboardHome) ─────────────── */
const Sidebar = ({ open, onClose, active, onNav, onLogout }) => {
  if (!open) return null;
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 98, background: 'rgba(0,0,0,0.5)', animation: 'fadeIn 0.18s ease' }}
      />
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: SIDEBAR_W, background: C.sidebar,
        display: 'flex', flexDirection: 'column', zIndex: 99, animation: 'slideIn 0.22s ease',
        boxShadow: '6px 0 28px rgba(0,0,0,0.28)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
        }}>
          <div>
            <span style={{ color: C.white,  fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ACQAR </span>
            <span style={{ color: C.copper, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ADMIN</span>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', width: 28, height: 28, borderRadius: 6,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.sidebarText,
          }}>
            <X size={14} />
          </button>
        </div>

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

/* ─── Headers (identical to AdminDashboardHome) ───────────────────────── */
const DesktopHeader = ({ onHamburger, search, onSearch }) => (
  <header className="hdr-desktop" style={{
    position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: C.white,
    borderBottom: `1px solid ${C.border}`, alignItems: 'center', justifyContent: 'space-between',
    padding: '0 22px', zIndex: 90, gap: 12,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
      <button onClick={onHamburger} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: C.muted, padding: 4 }} aria-label="Open menu">
        <Menu size={22} strokeWidth={1.8} />
      </button>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, background: '#F3F3F4', borderRadius: 22,
        padding: '8px 16px', maxWidth: 360, width: '100%', border: `1px solid ${C.border}`,
      }}>
        <Search size={14} color={C.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by name, email, or query..."
          style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: 13, color: C.text, width: '100%' }}
        />
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
      <div style={{ position: 'relative', cursor: 'pointer', display: 'flex' }}>
        <Bell size={20} color={C.muted} strokeWidth={1.8} />
        <span style={{ position: 'absolute', top: -2, right: -2, width: 7, height: 7, borderRadius: '50%', background: C.copper, border: `2px solid ${C.white}` }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Admin User</div>
          <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Super Admin</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#F5EBE0', border: `2px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={17} color={C.copper} strokeWidth={1.8} />
        </div>
      </div>
    </div>
  </header>
);

const MobileHeader = ({ onHamburger }) => (
  <header className="hdr-mobile" style={{
    position: 'fixed', top: 0, left: 0, right: 0, height: 60, background: C.sidebar,
    alignItems: 'center', justifyContent: 'space-between', padding: '0 18px', zIndex: 90,
  }}>
    <div>
      <span style={{ color: C.white,  fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ACQAR </span>
      <span style={{ color: C.copper, fontWeight: 900, fontSize: 16, letterSpacing: '0.05em' }}>ADMIN</span>
    </div>
    <button onClick={onHamburger} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, color: C.white }} aria-label="Open menu">
      <Menu size={24} strokeWidth={2} />
    </button>
  </header>
);

/* ─── Small "copy link" button with a check-mark confirmation ─────────── */
const CopyLinkButton = ({ url }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — no-op, the Open button still works
    }
  };
  return (
    <button
      className="q-link-btn"
      onClick={handleCopy}
      title="Copy shared link"
      style={{
        width: 28, height: 28, borderRadius: 7, border: `1px solid ${C.border}`,
        background: C.white, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {copied ? <Check size={13} color={C.emerald} /> : <Copy size={13} color={C.muted} />}
    </button>
  );
};

/* ─── Page ─────────────────────────────────────────────────────────────── */
const AdminQueriesScreen = () => {
  const navigate = useNavigate();
  const handleLogout = useLogout();

  const [activeNav, setActiveNav] = useState('queries');
  const [sideOpen,  setSideOpen]  = useState(false);

  const [rows,     setRows]     = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(0);
  const [total,    setTotal]    = useState(0);

  const handleNav = useCallback((key) => {
    setActiveNav(key);
    if (key === 'queries') return;
    navigate(key === 'overview' ? '/admin' : `/admin/${key}`);
  }, [navigate]);

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') setSideOpen(false); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, []);

  const fetchQueries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Page of broker_queries, newest first
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('broker_queries')
        .select('id, user_id, email, query, response, response_data, page, created_at', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (search.trim()) {
        // matches against the query text or the logged email
        query = query.or(`query.ilike.%${search.trim()}%,email.ilike.%${search.trim()}%`);
      }

      const { data: queryRows, count, error: qErr } = await query.range(from, to);
      if (qErr) throw qErr;

      const userIds = [...new Set((queryRows ?? []).map(r => r.user_id).filter(Boolean))];

      // 2. Names for those users
      const { data: brokerUsers, error: buErr } = userIds.length
        ? await supabase.from('broker_users').select('user_id, full_name, email').in('user_id', userIds)
        : { data: [], error: null };
      if (buErr) throw buErr;
      const nameMap = new Map((brokerUsers ?? []).map(u => [u.user_id, u.full_name]));

      // 3. Shared chats for those users — matched to a query by checking
      //    whether the chat's message list contains that exact query text
      const { data: sharedChats, error: scErr } = userIds.length
        ? await supabase.from('broker_shared_chats').select('id, user_id, messages, created_at').in('user_id', userIds)
        : { data: [], error: null };
      if (scErr) throw scErr;

      const chatsByUser = new Map();
      (sharedChats ?? []).forEach(c => {
        if (!chatsByUser.has(c.user_id)) chatsByUser.set(c.user_id, []);
        chatsByUser.get(c.user_id).push(c);
      });

      const findSharedChatId = (userId, queryText) => {
        const chats = chatsByUser.get(userId);
        if (!chats) return null;
        const matches = chats.filter(c =>
          Array.isArray(c.messages) &&
          c.messages.some(m => m.role === 'user' && m.text === queryText)
        );
        if (!matches.length) return null;
        matches.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return matches[0].id;
      };

      const enriched = (queryRows ?? []).map(r => {
        const sharedChatId = findSharedChatId(r.user_id, r.query);
        return {
          ...r,
          userName: nameMap.get(r.user_id) || r.email || 'Unknown user',
          sharedChatId,
          // Optional extra — the full multi-turn conversation, only present
          // if the user explicitly clicked "Share this chat".
          sharedLink: sharedChatId ? buildSharedLink(sharedChatId) : null,
        };
      });

      setRows(enriched);
      setTotal(count ?? 0);
    } catch (err) {
      console.error('fetchQueries error:', err);
      setError('Could not load queries. Check the console for details.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchQueries(); }, [fetchQueries]);

  // live updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-queries-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'broker_queries' }, () => fetchQueries())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [fetchQueries]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ background: C.bg, minHeight: '100vh' }}>
      <Helmet>
        <title>Queries | Acqar Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <style>{globalCss}</style>

      <Sidebar open={sideOpen} onClose={() => setSideOpen(false)} active={activeNav} onNav={handleNav} onLogout={handleLogout} />
      <DesktopHeader onHamburger={() => setSideOpen(true)} search={search} onSearch={(v) => { setPage(0); setSearch(v); }} />
      <MobileHeader onHamburger={() => setSideOpen(true)} />

      <main className="main-wrap" style={{ paddingTop: 60 }}>
        <div className="main-inner" style={{ padding: '26px 22px', maxWidth: 1180, margin: '0 auto' }}>

          <div style={{ marginBottom: 22, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h1 className="page-h1" style={{ fontSize: 28, fontWeight: 900, color: C.text, letterSpacing: '-0.7px' }}>
                User Queries
              </h1>
              <p style={{ fontSize: 14, color: C.muted, marginTop: 5 }}>
                Every question asked on the broker chat and the AI's response. "Shared Chat" links to the full multi-turn conversation, when the user chose to share it.
              </p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, background: C.white, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: '8px 14px', fontSize: 12.5, fontWeight: 700, color: C.muted,
            }}>
              {total} total {total === 1 ? 'query' : 'queries'}
            </div>
          </div>

          <div style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden' }}>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 220 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', border: `3px solid ${C.copper}`, borderTopColor: 'transparent', animation: 'spin 0.75s linear infinite' }} />
              </div>
            ) : error ? (
              <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 13.5 }}>{error}</div>
            ) : rows.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 13.5 }}>No queries match your search.</div>
            ) : (
              <div className="q-table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
                  <thead>
                    <tr style={{ background: '#FAFAFA', borderBottom: `1px solid ${C.border}` }}>
                      {['User', 'Query', 'Response', 'Shared Chat', 'Date'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 10.5, fontWeight: 800, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="q-row" style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#F5EBE0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <User size={14} color={C.copper} strokeWidth={1.8} />
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{r.userName}</div>
                              <div style={{ fontSize: 11.5, color: C.muted }}>{r.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', verticalAlign: 'top', maxWidth: 340 }}>
                          <div style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>{r.query}</div>
                        </td>
                        <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                          <ResponseCell query={r.query} response={r.response} responseData={r.response_data} />
                        </td>
                        <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
                          {r.sharedLink ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <a
                                href={r.sharedLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700,
                                  color: C.copper, textDecoration: 'none', background: '#FEF3E7',
                                  border: `1px solid ${C.copper}`, borderRadius: 7, padding: '5px 10px',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                <Link2 size={12} /> Open <ExternalLink size={11} />
                              </a>
                              <CopyLinkButton url={r.sharedLink} />
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: '#BBB', fontStyle: 'italic' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '16px 20px', verticalAlign: 'top', fontSize: 12, color: C.muted, whiteSpace: 'nowrap' }}>
                          {formatDate(r.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !error && rows.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderTop: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.muted }}>
                  Page {page + 1} of {totalPages}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white,
                      fontSize: 12, fontWeight: 700, color: page === 0 ? '#CCC' : C.text,
                      cursor: page === 0 ? 'default' : 'pointer',
                    }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => (p + 1 < totalPages ? p + 1 : p))}
                    disabled={page + 1 >= totalPages}
                    style={{
                      padding: '6px 14px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.white,
                      fontSize: 12, fontWeight: 700, color: page + 1 >= totalPages ? '#CCC' : C.text,
                      cursor: page + 1 >= totalPages ? 'default' : 'pointer',
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminQueriesScreen;
