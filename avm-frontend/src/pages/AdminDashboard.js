// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [usersCount, setUsersCount] = useState(0);
  const [valuationsCount, setValuationsCount] = useState(0);
  const [latestUsers, setLatestUsers] = useState([]);
  const [latestValuations, setLatestValuations] = useState([]);

  // ✅ exclude admin from users list/count (by role)
  const ADMIN_ROLE = "admin";

  // optional: total portfolio value across valuations (if you want)
  const totalValuationValue = useMemo(() => {
    return (latestValuations || []).reduce((acc, r) => acc + (Number(r.estimated_valuation) || 0), 0);
  }, [latestValuations]);

  function fmtAED(n) {
    const x = Number(n);
    if (!Number.isFinite(x) || x <= 0) return "—";
    if (x >= 1_000_000) return `AED ${(x / 1_000_000).toFixed(2)}M`;
    return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setMsg("");

        // ✅ Make sure there is a session (admin must be logged in via Supabase)
        const { data: sess } = await supabase.auth.getSession();
        if (!sess?.session) {
          navigate("/login");
          return;
        }

        // 1) USERS COUNT (exclude admin)
        const { count: uCount, error: uCountErr } = await supabase
          .from("users")
          .select("id", { count: "exact", head: true })
          .neq("role", ADMIN_ROLE);

        if (uCountErr) throw uCountErr;

        // 2) VALUATIONS COUNT (all valuations)
        const { count: vCount, error: vCountErr } = await supabase
          .from("valuations")
          .select("id", { count: "exact", head: true });

        if (vCountErr) throw vCountErr;

        // 3) LATEST USERS (exclude admin)
        const { data: uRows, error: uRowsErr } = await supabase
          .from("users")
          .select("id, role, name, email, phone, created_at")
          .neq("role", ADMIN_ROLE)
          .order("created_at", { ascending: false })
          .limit(8);

        if (uRowsErr) console.warn("users list:", uRowsErr.message);

        // 4) LATEST VALUATIONS (all)
        const { data: vRows, error: vRowsErr } = await supabase
          .from("valuations")
          .select("id, user_id, property_name, building_name, district, estimated_valuation, created_at")
          .order("created_at", { ascending: false })
          .limit(8);

        if (vRowsErr) console.warn("valuations list:", vRowsErr.message);

        if (!alive) return;

        setUsersCount(uCount || 0);
        setValuationsCount(vCount || 0);
        setLatestUsers(uRows || []);
        setLatestValuations(vRows || []);
      } catch (e) {
        if (!alive) return;
        setMsg(e?.message || "Failed to load admin dashboard.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [navigate]);

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } finally {
      navigate("/login");
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div style={styles.brand} onClick={() => navigate("/admin-dashboard")} role="button" tabIndex={0}>
          <div style={styles.logo}>A</div>
          <div>
            <div style={styles.brandName}>ACQAR</div>
            <div style={styles.brandSub}>Admin Console</div>
          </div>
        </div>

        <div style={styles.actions}>
          <button style={styles.btnGhost} onClick={() => navigate("/dashboard")}>
            User Dashboard
          </button>
          <button style={styles.btnPrimary} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.wrap}>
        {msg ? <div style={styles.msg}>{msg}</div> : null}

        {loading ? (
          <div style={styles.loading}>Loading admin dashboard…</div>
        ) : (
          <div style={styles.grid}>
            <div style={styles.card}>
              <div style={styles.cardLabel}>USERS</div>
              <div style={styles.cardVal}>{usersCount.toLocaleString()}</div>
              <div style={styles.cardSub}>Total registered accounts (excluding admin)</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardLabel}>VALUATIONS</div>
              <div style={styles.cardVal}>{valuationsCount.toLocaleString()}</div>
              <div style={styles.cardSub}>Total valuations created</div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardLabel}>LATEST (8) VALUE</div>
              <div style={styles.cardVal}>{fmtAED(totalValuationValue)}</div>
              <div style={styles.cardSub}>Sum of last 8 valuations shown</div>
            </div>

            <div style={styles.cardWide}>
              <div style={styles.sectionTop}>
                <div style={styles.cardTitle}>Latest Users</div>
                <div style={styles.miniNote}>
                  From table: <b>users</b>
                </div>
              </div>

              {latestUsers.length === 0 ? (
                <div style={styles.empty}>No users found.</div>
              ) : (
                <div style={styles.table}>
                  <div style={styles.th}>
                    <div>ID</div>
                    <div>NAME</div>
                    <div>EMAIL</div>
                    <div>ROLE</div>
                    <div>PHONE</div>
                    <div>CREATED</div>
                  </div>

                  {latestUsers.map((u) => (
                    <div key={u.id} style={styles.tr}>
                      <div style={styles.mono}>{String(u.id).slice(0, 8)}…</div>
                      <div style={styles.bold}>{(u.name || "—").toString()}</div>
                      <div>{u.email || "—"}</div>
                      <div>{u.role || "—"}</div>
                      <div>{u.phone || "—"}</div>
                      <div>{u.created_at ? new Date(u.created_at).toLocaleString() : "—"}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={styles.cardWide}>
              <div style={styles.sectionTop}>
                <div style={styles.cardTitle}>Latest Valuations</div>
                <div style={styles.miniNote}>
                  From table: <b>valuations</b>
                </div>
              </div>

              {latestValuations.length === 0 ? (
                <div style={styles.empty}>No valuations found.</div>
              ) : (
                <div style={styles.table}>
                  <div style={styles.th}>
                    <div>ID</div>
                    <div>USER</div>
                    <div>PROPERTY</div>
                    <div>DISTRICT</div>
                    <div>EST. VALUE</div>
                    <div>CREATED</div>
                  </div>

                  {latestValuations.map((v) => {
                    const title = (v.property_name || v.building_name || "Property").toString();
                    return (
                      <div key={v.id} style={styles.tr}>
                        <div style={styles.mono}>#{v.id}</div>
                        <div style={styles.mono}>{String(v.user_id || "").slice(0, 8)}…</div>
                        <div style={styles.bold}>{title}</div>
                        <div>{v.district || "—"}</div>
                        <div style={styles.bold}>{fmtAED(v.estimated_valuation)}</div>
                        <div>{v.created_at ? new Date(v.created_at).toLocaleString() : "—"}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  // ✅ WHITE BACKGROUND
  page: {
    minHeight: "100vh",
    background: "#ffffff",
  },

  topbar: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "18px 18px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 18,
    padding: "10px 12px",
    boxShadow: "0 10px 22px rgba(2, 6, 23, 0.06)",
    cursor: "pointer",
  },

  logo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(180deg, #2f86ff 0%, #1246ff 100%)",
    color: "#fff",
    fontWeight: 900,
    fontSize: 18,
  },

  brandName: { fontWeight: 900, color: "#0b1220", letterSpacing: -0.2, fontSize: 16 },
  brandSub: { fontWeight: 800, color: "#64748b", fontSize: 12, marginTop: 1 },

  actions: { display: "flex", gap: 10, flexWrap: "wrap" },

  btnGhost: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(15, 23, 42, 0.04)",
    color: "#0b1220",
    fontWeight: 900,
    cursor: "pointer",
  },

  btnPrimary: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(180deg, #2f86ff 0%, #1246ff 100%)",
    color: "#fff",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 14px 26px rgba(18,70,255,0.22)",
  },

  wrap: { maxWidth: 1200, margin: "0 auto", padding: 18 },

  msg: {
    background: "rgba(255, 0, 0, 0.06)",
    border: "1px solid rgba(255, 0, 0, 0.18)",
    color: "#991b1b",
    padding: 12,
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 800,
    marginBottom: 14,
  },

  loading: {
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(0,0,0,0.08)",
    background: "rgba(15, 23, 42, 0.03)",
    fontWeight: 900,
    color: "#0b1220",
  },

  grid: { display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16 },

  card: {
    gridColumn: "span 4",
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 22,
    padding: 18,
    boxShadow: "0 10px 22px rgba(2, 6, 23, 0.06)",
  },

  cardLabel: { fontSize: 12, fontWeight: 900, letterSpacing: 1.2, color: "#94a3b8" },
  cardVal: { marginTop: 10, fontSize: 34, fontWeight: 1000, color: "#0b1220", letterSpacing: -0.6 },
  cardSub: { marginTop: 6, fontSize: 13, fontWeight: 800, color: "#64748b" },

  cardWide: {
    gridColumn: "span 12",
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: 22,
    padding: 18,
    boxShadow: "0 10px 22px rgba(2, 6, 23, 0.06)",
  },

  sectionTop: { display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: 1000, color: "#0b1220", letterSpacing: -0.2 },
  miniNote: { fontSize: 12, fontWeight: 900, color: "#94a3b8" },

  empty: {
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    border: "1px dashed rgba(0,0,0,0.18)",
    color: "#64748b",
    fontWeight: 800,
    background: "rgba(15, 23, 42, 0.02)",
  },

  table: { marginTop: 12, border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, overflow: "hidden" },
  th: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1.2fr 2fr 1fr 1.2fr 1.4fr",
    gap: 10,
    padding: "12px 12px",
    background: "rgba(15, 23, 42, 0.04)",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    fontSize: 12,
    fontWeight: 1000,
    letterSpacing: 0.9,
    color: "#64748b",
  },
  tr: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1.2fr 2fr 1fr 1.2fr 1.4fr",
    gap: 10,
    padding: "12px 12px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    alignItems: "center",
    fontSize: 13,
    fontWeight: 800,
    color: "#0b1220",
  },

  mono: { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
  bold: { fontWeight: 1000 },
};
