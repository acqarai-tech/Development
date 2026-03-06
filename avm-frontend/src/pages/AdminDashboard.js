import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useLogout } from "../hooks/useLogout";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [usersCount, setUsersCount] = useState(0);
  const [valuationsCount, setValuationsCount] = useState(0);
  const [latestUsers, setLatestUsers] = useState([]);
  const [latestValuations, setLatestValuations] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [userNameMap, setUserNameMap] = useState({});

  const [activeRole, setActiveRole] = useState("All");
  const filteredUsers = useMemo(() => {
  if (activeRole === "All") return latestUsers;
  return latestUsers.filter(
    (u) => (u.role || "").toLowerCase() === activeRole.toLowerCase()
  );
}, [latestUsers, activeRole]);
  const totalValuationValue = useMemo(() => {
    return (latestValuations || []).reduce(
      (acc, r) => acc + (Number(r.estimated_valuation) || 0), 0
    );
  }, [latestValuations]);

  function fmtAED(n) {
    const x = Number(n);
    if (!Number.isFinite(x) || x <= 0) return "—";
    if (x >= 1_000_000) return `AED ${(x / 1_000_000).toFixed(2)}M`;
    return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  useEffect(() => {
    const isAdmin = localStorage.getItem("admin_auth") === "true";
    if (!isAdmin) {
      navigate("/login", { replace: true });
      return;
    }

    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setMsg("");

        const { data: sessData } = await supabase.auth.getSession();
        if (!sessData?.session) {
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: "admin@acqar.com",
            password: "acqar123",
          });
          if (signInErr) {
            console.warn("Admin sign-in failed:", signInErr.message);
          }
        }

        // USERS COUNT
        const { count: uCount, error: uCountErr } = await supabase
          .from("users")
          .select("id", { count: "exact", head: true })
          .neq("email", "admin@acqar.com");
        if (uCountErr) throw uCountErr;

        // VALUATIONS COUNT
        const { count: vCount, error: vCountErr } = await supabase
          .from("valuations")
          .select("id", { count: "exact", head: true });
        if (vCountErr) throw vCountErr;

        // USERS LIST
        const { data: uRows, error: uRowsErr } = await supabase
          .from("users")
          .select("id, role, name, email, phone, created_at")
          .neq("email", "admin@acqar.com")
          .order("created_at", { ascending: false });
        if (uRowsErr) throw uRowsErr;

        // VALUATIONS LIST
        const { data: vRows, error: vRowsErr } = await supabase
          .from("valuations")
          .select("id, user_id, name, property_name, building_name, district, estimated_valuation, created_at")
          .order("id", { ascending: true });
        if (vRowsErr) throw vRowsErr;

        // FEEDBACK LIST — correct columns from feedback table
        let fRows = [];
        try {
          const { data, error } = await supabase
            .from("feedback")
            .select("id, user_id, user_name, user_email, rating, comment, valuation_id, created_at")
            .order("created_at", { ascending: true });
          if (error && error.code !== "42P01") throw error;
          fRows = data || [];
        } catch (e) {
          console.warn("Feedback table not found:", e.message);
        }

        // Build userName map
        let map = {};
        (vRows || []).forEach((r) => {
          if (r?.user_id && (r?.name || "").trim()) {
            map[r.user_id] = String(r.name).trim();
          }
        });

        const ids = Array.from(new Set((vRows || []).map((r) => r.user_id).filter(Boolean)));
        const missingIds = ids.filter((id) => !map[id]);

        if (missingIds.length) {
          const { data: usersForVals, error: usersForValsErr } = await supabase
            .from("users")
            .select("id, name, email")
            .in("id", missingIds);
          if (usersForValsErr) throw usersForValsErr;

          (usersForVals || []).forEach((u) => {
            map[u.id] = (u.name || "").trim() || (u.email || "").split("@")[0] || "—";
          });
        }

        if (!alive) return;

        setUsersCount(uCount || 0);
        setValuationsCount(vCount || 0);
        setLatestUsers(uRows || []);
        setLatestValuations(vRows || []);
        setFeedbackList(fRows);
        setUserNameMap(map);
      } catch (e) {
        if (!alive) return;
        setMsg(e?.message || "Failed to load admin dashboard.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [navigate]);

  

  const handleLogout = useLogout();
  return (
    <div style={styles.page}>
      <style>{responsiveCss}</style>

      {/* ── TOPBAR ── */}
      <div style={styles.topbar} className="ad-topbar">
        <div style={styles.brand} className="ad-brand" onClick={() => navigate("/")}>
          <div style={styles.logoBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2"  y="2"  width="8" height="8" rx="1.5" fill="#e87722" />
              <rect x="14" y="2"  width="8" height="8" rx="1.5" fill="#e87722" opacity="0.7" />
              <rect x="2"  y="14" width="8" height="8" rx="1.5" fill="#e87722" opacity="0.7" />
              <rect x="14" y="14" width="8" height="8" rx="1.5" fill="#e87722" opacity="0.4" />
            </svg>
          </div>
          <div>
            <div style={styles.brandName}>
              <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
              <span style={{ color: "#B87333" }}>ACQ</span>
              <span style={{ color: "#111111" }}>AR</span>
            </h1>
            </div>
            <div style={styles.brandSub}>Admin Console</div>
          </div>
        </div>
        <div style={styles.actions} className="ad-actions">
          <button style={styles.btnPrimary} className="ad-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={styles.wrap}>
        {msg && <div style={styles.errorBox}>{msg}</div>}

        {loading ? (
          <div style={styles.loadingWrap}>
            <div style={styles.spinner} />
            <span style={styles.loadingText}>Loading admin dashboard…</span>
          </div>
        ) : (
          <div style={styles.grid} className="ad-grid">

            {/* ── STAT CARDS ── */}
            <div style={{ ...styles.card, ...styles.statCard }} className="ad-card">
              <div style={styles.statIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="#e87722" strokeWidth="1.8"/>
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#e87722" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={styles.cardLabel}>TOTAL USERS</div>
              <div style={styles.cardVal}>{usersCount.toLocaleString()}</div>
              <div style={styles.cardHint}>Excluding admin accounts</div>
            </div>

            <div style={{ ...styles.card, ...styles.statCard }} className="ad-card">
              <div style={styles.statIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="#e87722" strokeWidth="1.8"/>
                  <path d="M8 12h8M8 8h8M8 16h5" stroke="#e87722" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={styles.cardLabel}>VALUATIONS</div>
              <div style={styles.cardVal}>{valuationsCount.toLocaleString()}</div>
              <div style={styles.cardHint}>All valuation records</div>
            </div>

            <div style={{ ...styles.card, ...styles.statCard }} className="ad-card">
              <div style={styles.statIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="#e87722" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={styles.cardLabel}>TOTAL VALUE</div>
              <div style={styles.cardVal}>{fmtAED(totalValuationValue)}</div>
              <div style={styles.cardHint}>Sum of all valuations</div>
            </div>

            {/* ── USERS TABLE ── */}
            <div style={styles.cardWide} className="ad-cardWide">
              <div style={styles.tableHeader}>
                <div style={styles.tableTitle}>All Users</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
  {["All", "Owner", "Investor", "Seller", "Buyer"].map((role) => (
    <button
      key={role}
      onClick={() => setActiveRole(role)}
      style={{
        padding: "4px 12px",
        borderRadius: 999,
        border: `1px solid ${activeRole === role ? "#e87722" : "#e5e7eb"}`,
        background: activeRole === role ? "#fff8f3" : "#f9fafb",
        color: activeRole === role ? "#e87722" : "#6b7280",
        fontWeight: 800,
        fontSize: 11,
        cursor: "pointer",
        letterSpacing: 0.5,
      }}
    >
      {role}
    </button>
  ))}
  <span style={{
    fontSize: 12, fontWeight: 700, color: "#6b7280",
    background: "#f3f4f6", padding: "4px 10px",
    borderRadius: 999, border: "1px solid #e5e7eb",
  }}>
    {filteredUsers.length} records
  </span>
</div>
              </div>
              {filteredUsers.length === 0 ? (
                <div style={styles.emptyState}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 10 }}>
                    <circle cx="12" cy="8" r="4" stroke="#d1d5db" strokeWidth="1.5"/>
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <div>No users found</div>
                </div>
              ) : (
                <div style={styles.tableWrap} className="ad-table">
                  <div style={styles.thUsers} className="ad-thUsers">
                    <div>ID</div>
                    <div>Name</div>
                    <div>Email</div>
                    <div>Role</div>
                    <div>Phone</div>
                    <div>Created</div>
                  </div>
                {filteredUsers.map((u, i) => (
                    <div
                      key={u.id}
                      style={{ ...styles.trUsers, background: i % 2 === 0 ? "#fff" : "#fafafa" }}
                      className="ad-trUsers"
                    >
                      <div style={styles.mono}>{String(u.id).slice(0, 8)}…</div>
                      <div style={styles.bold}>{u.name || "—"}</div>
                      <div style={styles.muted}>{u.email || "—"}</div>
                      <div><span style={getRoleBadgeStyle(u.role)}>{u.role || "user"}</span></div>
                      <div style={styles.muted}>{u.phone || "—"}</div>
                      <div style={styles.muted}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── VALUATIONS TABLE ── */}
            <div style={styles.cardWide} className="ad-cardWide">
              <div style={styles.tableHeader}>
                <div style={styles.tableTitle}>All Valuations</div>
                <div style={styles.tableBadge}>{latestValuations.length} records</div>
              </div>
              {latestValuations.length === 0 ? (
                <div style={styles.emptyState}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 10 }}>
                    <rect x="3" y="3" width="18" height="18" rx="3" stroke="#d1d5db" strokeWidth="1.5"/>
                    <path d="M8 12h8M8 8h8M8 16h5" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <div>No valuations found</div>
                </div>
              ) : (
                <div style={styles.tableWrap} className="ad-table">
                  <div style={styles.thVals} className="ad-thVals">
                    <div>ID</div>
                    <div>User</div>
                    <div>Property</div>
                    <div>District</div>
                    <div>Value</div>
                    <div>Created</div>
                  </div>
                  {latestValuations.map((v, i) => {
                    const userName = v.name || userNameMap[v.user_id] || "—";
                    const title = v.property_name || v.building_name || "Property";
                    return (
                      <div
                        key={v.id}
                        style={{ ...styles.trVals, background: i % 2 === 0 ? "#fff" : "#fafafa" }}
                        className="ad-trVals"
                      >
                        <div style={styles.mono}>#{v.id}</div>
                        <div style={styles.bold}>{userName}</div>
                        <div style={styles.bold}>{title}</div>
                        <div style={styles.muted}>{v.district || "—"}</div>
                        <div style={styles.valueCell}>{fmtAED(v.estimated_valuation)}</div>
                        <div style={styles.muted}>
                          {v.created_at ? new Date(v.created_at).toLocaleDateString() : "—"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── FEEDBACK TABLE ── */}
            <div style={styles.cardWide} className="ad-cardWide">
              <div style={styles.tableHeader}>
                <div style={styles.tableTitle}>Feedback</div>
                <div style={styles.tableBadge}>{feedbackList.length} records</div>
              </div>
              {feedbackList.length === 0 ? (
                <div style={styles.emptyState}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ marginBottom: 10 }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>No feedback yet</div>
                </div>
              ) : (
                <div style={styles.tableWrap} className="ad-table">
                  <div style={styles.thFeedback} className="ad-thFeedback">
                    <div>ID</div>
                    <div>User</div>
                    <div>Email</div>
                    <div>Rating</div>
                    <div>Comment</div>
                    <div>Created</div>
                  </div>
                  {feedbackList.map((f, i) => (
                    <div
                      key={f.id}
                      style={{ ...styles.trFeedback, background: i % 2 === 0 ? "#fff" : "#fafafa" }}
                      className="ad-trFeedback"
                    >
                      <div style={styles.mono}>#{f.id}</div>
                      <div style={styles.bold}>{f.user_name || userNameMap[f.user_id] || "—"}</div>
                      <div style={styles.muted}>{f.user_email || "—"}</div>
                      <div><span style={getRatingBadgeStyle(f.rating)}>{f.rating || "—"}</span></div>
                      <div style={styles.muted}>{f.comment || "—"}</div>
                      <div style={styles.muted}>
                        {f.created_at ? new Date(f.created_at).toLocaleDateString() : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function getRoleBadgeStyle(role) {
  const base = {
    display: "inline-flex", alignItems: "center",
    padding: "4px 10px", borderRadius: 999,
    fontSize: 11, fontWeight: 800,
    textTransform: "capitalize", letterSpacing: 0.3,
  };
  const map = {
    investor: { background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8" },
    buyer:    { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" },
    seller:   { background: "#fdf4ff", border: "1px solid #e9d5ff", color: "#7e22ce" },
    agent:    { background: "#fff7ed", border: "1px solid #fed7aa", color: "#c2410c" },
    owner:    { background: "#fefce8", border: "1px solid #fef08a", color: "#854d0e" },
    user:     { background: "#f9fafb", border: "1px solid #e5e7eb", color: "#374151" },
  };
  return { ...base, ...(map[(role || "user").toLowerCase()] || map.user) };
}

function getRatingBadgeStyle(rating) {
  const base = {
    display: "inline-flex", alignItems: "center",
    padding: "4px 10px", borderRadius: 999,
    fontSize: 11, fontWeight: 800,
    textTransform: "capitalize", letterSpacing: 0.3,
  };
  const map = {
    too_high: { background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c" },
    spot_on:  { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d" },
    too_low:  { background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8" },
  };
  return { ...base, ...(map[(rating || "").toLowerCase()] || { background: "#f9fafb", border: "1px solid #e5e7eb", color: "#374151" }) };
}

const responsiveCss = `
  html, body { max-width: 100%; overflow-x: hidden; }
  @media (max-width: 980px) {
    .ad-topbar { flex-wrap: wrap; gap: 12px; padding: 18px 14px 0 !important; }
    .ad-actions { width: 100%; justify-content: flex-start; }
  }
  @media (max-width: 820px) {
    .ad-grid { gap: 12px !important; }
    .ad-card { grid-column: span 12 !important; }
    .ad-cardWide { grid-column: span 12 !important; }
  }
  @media (max-width: 640px) {
    .ad-btn { width: 100%; }
    .ad-table { overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .ad-thUsers, .ad-trUsers,
    .ad-thVals, .ad-trVals,
    .ad-thFeedback, .ad-trFeedback { min-width: 860px; }
    .ad-brand { width: 100%; }
  }
`;

const BORDER = "#e5e7eb";
const TEXT   = "#111827";
const MUTED  = "#6b7280";

const styles = {
  page: {
    minHeight: "100vh", background: "#f9fafb",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    color: TEXT,
  },
  topbar: {
    background: "#ffffff", borderBottom: `1px solid ${BORDER}`,
    padding: "16px 32px", display: "flex",
    justifyContent: "space-between", alignItems: "center",
    position: "sticky", top: 0, zIndex: 100,
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  brand: { display: "flex", gap: 12, cursor: "pointer", alignItems: "center" },
  logoBox: {
    width: 38, height: 38, borderRadius: 10,
    background: "#fff8f3", border: "1px solid #fcd9b6",
    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  brandName: { fontSize: 18, fontWeight: 900, letterSpacing: 1 },
  brandSub:  { fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: 0.5 },
  actions: { display: "flex", gap: 10, alignItems: "center" },
  btnPrimary: {
    padding: "10px 20px", borderRadius: 10, border: "none",
    background: "linear-gradient(180deg, #f09030 0%, #d96b10 100%)",
    color: "#fff", fontWeight: 800, fontSize: 14,
    cursor: "pointer", fontFamily: "inherit",
    boxShadow: "0 4px 12px rgba(217,107,16,0.3)",
  },
  wrap: { maxWidth: 1280, margin: "0 auto", padding: "28px 24px 48px" },
  errorBox: {
    background: "#fff1f2", border: "1px solid #fecdd3",
    color: "#9f1239", padding: "12px 16px",
    borderRadius: 12, fontWeight: 700, fontSize: 13, marginBottom: 20,
  },
  loadingWrap: {
    display: "flex", alignItems: "center",
    justifyContent: "center", gap: 14, padding: "80px 0",
  },
  spinner: {
    width: 28, height: 28, borderRadius: "50%",
    border: "3px solid #fcd9b6", borderTopColor: "#e87722",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: { fontSize: 15, color: MUTED, fontWeight: 600 },
  grid: { display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 20 },
  card: {
    gridColumn: "span 4", padding: "22px 20px", borderRadius: 16,
    background: "#fff", border: `1px solid ${BORDER}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  statCard: { display: "flex", flexDirection: "column", gap: 4 },
  statIcon: {
    width: 40, height: 40, borderRadius: 10,
    background: "#fff8f3", border: "1px solid #fcd9b6",
    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  cardLabel: { fontSize: 11, color: MUTED, fontWeight: 800, letterSpacing: 1.2 },
  cardVal:   { fontSize: 32, fontWeight: 900, color: TEXT, lineHeight: 1.1, marginTop: 2 },
  cardHint:  { fontSize: 12, color: MUTED, fontWeight: 500, marginTop: 4 },
  cardWide: {
    gridColumn: "span 12", padding: "22px 20px", borderRadius: 16,
    background: "#fff", border: `1px solid ${BORDER}`,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
  tableHeader: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16,
  },
  tableTitle: { fontSize: 16, fontWeight: 800, color: TEXT },
  tableBadge: {
    fontSize: 12, fontWeight: 700, color: MUTED,
    background: "#f3f4f6", padding: "4px 10px",
    borderRadius: 999, border: `1px solid ${BORDER}`,
  },
  emptyState: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "48px 0", color: "#d1d5db", fontSize: 14, fontWeight: 600,
  },
  tableWrap: { overflowX: "auto" },
  thUsers: {
    display: "grid", gridTemplateColumns: "1.2fr 1.2fr 2fr 1fr 1.2fr 1.2fr",
    fontWeight: 800, fontSize: 11, letterSpacing: 0.8,
    padding: "10px 14px", background: "#f9fafb",
    borderRadius: "10px 10px 0 0", color: MUTED,
    border: `1px solid ${BORDER}`, borderBottom: "none", textTransform: "uppercase",
  },
  trUsers: {
    display: "grid", gridTemplateColumns: "1.2fr 1.2fr 2fr 1fr 1.2fr 1.2fr",
    padding: "12px 14px", borderBottom: `1px solid ${BORDER}`,
    alignItems: "center", fontSize: 13,
  },
  thVals: {
    display: "grid", gridTemplateColumns: "0.8fr 1.2fr 2fr 1fr 1.2fr 1.2fr",
    fontWeight: 800, fontSize: 11, letterSpacing: 0.8,
    padding: "10px 14px", background: "#f9fafb",
    borderRadius: "10px 10px 0 0", color: MUTED,
    border: `1px solid ${BORDER}`, borderBottom: "none", textTransform: "uppercase",
  },
  trVals: {
    display: "grid", gridTemplateColumns: "0.8fr 1.2fr 2fr 1fr 1.2fr 1.2fr",
    padding: "12px 14px", borderBottom: `1px solid ${BORDER}`,
    alignItems: "center", fontSize: 13,
  },
  thFeedback: {
    display: "grid", gridTemplateColumns: "0.4fr 1fr 1.4fr 0.8fr 2fr 1fr",
    fontWeight: 800, fontSize: 11, letterSpacing: 0.8,
    padding: "10px 14px", background: "#f9fafb",
    borderRadius: "10px 10px 0 0", color: MUTED,
    border: `1px solid ${BORDER}`, borderBottom: "none", textTransform: "uppercase",
  },
  trFeedback: {
    display: "grid", gridTemplateColumns: "0.4fr 1fr 1.4fr 0.8fr 2fr 1fr",
    padding: "12px 14px", borderBottom: `1px solid ${BORDER}`,
    alignItems: "center", fontSize: 13,
  },
  bold:      { fontWeight: 700, color: TEXT },
  muted:     { color: MUTED, fontSize: 13 },
  mono:      { fontFamily: "ui-monospace, monospace", fontSize: 12, color: MUTED },
  valueCell: { fontWeight: 800, color: "#c05e10", fontSize: 13 },
};
