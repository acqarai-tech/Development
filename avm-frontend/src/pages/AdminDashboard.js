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
  const [userNameMap, setUserNameMap] = useState({});

  const ADMIN_ROLE = "admin";

  const totalValuationValue = useMemo(() => {
    return (latestValuations || []).reduce(
      (acc, r) => acc + (Number(r.estimated_valuation) || 0),
      0
    );
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

        const { data: sess } = await supabase.auth.getSession();
        if (!sess?.session) {
          navigate("/login");
          return;
        }

        const { count: uCount } = await supabase
          .from("users")
          .select("id", { count: "exact", head: true })
          .neq("role", ADMIN_ROLE);

        const { count: vCount } = await supabase
          .from("valuations")
          .select("id", { count: "exact", head: true });

        const { data: uRows } = await supabase
          .from("users")
          .select("id, role, name, email, phone, created_at")
          .neq("role", ADMIN_ROLE)
          .order("created_at", { ascending: false })
          .limit(8);

        // ✅ ONLY CHANGE: valuations in ascending order (1,2,3...) by id
        const { data: vRows } = await supabase
          .from("valuations")
          .select(
            "id, user_id, name, property_name, building_name, district, estimated_valuation, created_at"
          )
          .order("id", { ascending: true }) // ✅ changed from created_at desc
          .limit(8);

        const ids = Array.from(
          new Set((vRows || []).map((r) => r.user_id).filter(Boolean))
        );
        let map = {};

        (vRows || []).forEach((r) => {
          if (r?.user_id && (r?.name || "").trim()) {
            map[r.user_id] = String(r.name).trim();
          }
        });

        const missingIds = ids.filter((id) => !map[id]);
        if (missingIds.length) {
          const { data: usersForVals } = await supabase
            .from("users")
            .select("id, name, email")
            .in("id", missingIds);

          (usersForVals || []).forEach((u) => {
            const nm =
              (u.name || "").trim() ||
              (u.email || "").split("@")[0] ||
              "—";
            map[u.id] = nm;
          });
        }

        if (!alive) return;

        setUsersCount(uCount || 0);
        setValuationsCount(vCount || 0);
        setLatestUsers(uRows || []);
        setLatestValuations(vRows || []);
        setUserNameMap(map || {});
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
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div style={styles.page}>
      <div style={styles.topbar}>
        <div style={styles.brand} onClick={() => navigate("/admin-dashboard")}>
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
            </div>

            <div style={styles.card}>
              <div style={styles.cardLabel}>VALUATIONS</div>
              <div style={styles.cardVal}>
                {valuationsCount.toLocaleString()}
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardLabel}>LATEST VALUE</div>
              <div style={styles.cardVal}>{fmtAED(totalValuationValue)}</div>
            </div>

            <div style={styles.cardWide}>
              <div style={styles.table}>
                <div style={styles.th}>
                  <div>ID</div>
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Phone</div>
                  <div>Created</div>
                </div>

                {latestUsers.map((u) => (
                  <div key={u.id} style={styles.tr}>
                    <div>{String(u.id).slice(0, 8)}</div>
                    <div style={styles.bold}>{u.name || "—"}</div>
                    <div>{u.email}</div>
                    <div>{u.role}</div>
                    <div>{u.phone}</div>
                    <div>
                      {u.created_at
                        ? new Date(u.created_at).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.cardWide}>
              <div style={styles.table}>
                <div style={styles.th}>
                  <div>ID</div>
                  <div>User</div>
                  <div>Property</div>
                  <div>District</div>
                  <div>Value</div>
                  <div>Created</div>
                </div>

                {latestValuations.map((v) => {
                  const userName = v.name || userNameMap[v.user_id] || "—";
                  const title =
                    v.property_name || v.building_name || "Property";

                  return (
                    <div key={v.id} style={styles.tr}>
                      <div>#{v.id}</div>
                      <div style={styles.bold}>{userName}</div>
                      <div style={styles.bold}>{title}</div>
                      <div>{v.district}</div>
                      <div>{fmtAED(v.estimated_valuation)}</div>
                      <div>
                        {v.created_at
                          ? new Date(v.created_at).toLocaleString()
                          : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#fff" },
  topbar: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "18px 18px 0",
    display: "flex",
    justifyContent: "space-between",
  },
  brand: { display: "flex", gap: 12, cursor: "pointer" },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "#1246ff",
    color: "#fff",
    fontWeight: 900,
  },
  brandName: { fontWeight: 900 },
  brandSub: { fontSize: 12, color: "#64748b" },
  actions: { display: "flex", gap: 10 },
  btnGhost: { padding: "8px 14px", borderRadius: 999 },
  btnPrimary: { padding: "8px 14px", borderRadius: 999 },
  wrap: { maxWidth: 1200, margin: "0 auto", padding: 18 },
  msg: { color: "red" },
  loading: { padding: 20 },
  grid: { display: "grid", gridTemplateColumns: "repeat(12,1fr)", gap: 16 },
  card: { gridColumn: "span 4", padding: 18, border: "1px solid #eee" },
  cardLabel: { fontSize: 12, color: "#64748b" },
  cardVal: { fontSize: 28, fontWeight: 900 },
  cardWide: { gridColumn: "span 12", padding: 18, border: "1px solid #eee" },
  table: { marginTop: 12 },
  th: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 2fr 1fr 1fr 1.5fr",
    fontWeight: 900,
    padding: 10,
    background: "#f1f5f9",
  },
  tr: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 2fr 1fr 1fr 1.5fr",
    padding: 10,
    borderBottom: "1px solid #eee",
  },
  bold: { fontWeight: 900 },
};
