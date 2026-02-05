// src/pages/UserDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/dashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const nameToShow = useMemo(() => {
    const n = (profile?.name || "").trim();
    if (n) return n;

    const em = (profile?.email || "").split("@")[0] || "User";
    return em.charAt(0).toUpperCase() + em.slice(1);
  }, [profile]);

  function fmtAED(n) {
    const x = Number(n);
    if (!Number.isFinite(x) || x <= 0) return "—";
    if (x >= 1_000_000) return `AED ${(x / 1_000_000).toFixed(1)}M`;
    return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  function fmtAEDFull(n) {
    const x = Number(n);
    if (!Number.isFinite(x) || x <= 0) return "—";
    return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setMsg("");

        const { data, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;

        const user = data?.user;
        if (!user?.id) {
          navigate("/login");
          return;
        }

        const authId = user.id;
        const authEmail = (user.email || "").toLowerCase();

        const metaName = (
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.display_name ||
          ""
        ).trim();

        // -----------------------------
        // PERMANENT FIX: profile row sync
        // -----------------------------

        // A) try fetch by auth uid
        let { data: uRow, error: byIdErr } = await supabase
          .from("users")
          .select("id, role, name, email, phone, created_at")
          .eq("id", authId)
          .maybeSingle();

        if (byIdErr) console.warn("users select by id:", byIdErr.message);

        // B) if not found by id, try fetch by email
        if (!uRow && authEmail) {
          const { data: emailRow, error: byEmailErr } = await supabase
            .from("users")
            .select("id, role, name, email, phone, created_at")
            .eq("email", authEmail)
            .maybeSingle();

          if (byEmailErr) console.warn("users select by email:", byEmailErr.message);

          // If we found a row by email BUT its id is different => migrate
          if (emailRow?.id && emailRow.id !== authId) {
            // 1) upsert correct row with authId, copying data
            const payload = {
              id: authId,
              email: authEmail,
              role: emailRow.role || null,
              name: (emailRow.name || metaName || "").trim() || null,
              phone: emailRow.phone || null,
            };

            const { error: migrateUpsertErr } = await supabase
              .from("users")
              .upsert(payload, { onConflict: "id" });

            if (migrateUpsertErr) {
              console.warn("users migrate upsert:", migrateUpsertErr.message);
            } else {
              // 2) delete old wrong-id row (to avoid duplicates)
              const { error: delErr } = await supabase
                .from("users")
                .delete()
                .eq("id", emailRow.id);

              if (delErr) console.warn("users delete old row:", delErr.message);

              // 3) re-fetch by correct id
              const { data: after, error: afterErr } = await supabase
                .from("users")
                .select("id, role, name, email, phone, created_at")
                .eq("id", authId)
                .maybeSingle();

              if (afterErr) console.warn("users select after migrate:", afterErr.message);
              uRow = after || null;
            }
          } else {
            // Email row exists and id matches OR it's empty
            uRow = emailRow || null;
          }
        }

        // C) if still no row, create it (first login case)
        if (!uRow) {
          const payload = {
            id: authId,
            email: authEmail,
            name: metaName || null,
          };

          const { error: createErr } = await supabase
            .from("users")
            .upsert(payload, { onConflict: "id" });

          if (createErr) console.warn("users create upsert:", createErr.message);

          const { data: createdRow, error: createdSelErr } = await supabase
            .from("users")
            .select("id, role, name, email, phone, created_at")
            .eq("id", authId)
            .maybeSingle();

          if (createdSelErr) console.warn("users select created:", createdSelErr.message);
          uRow = createdRow || null;
        }

        // D) if name is missing but we have metaName, update once
        if (uRow && !(uRow.name || "").trim() && metaName) {
          const { data: updated, error: updErr } = await supabase
            .from("users")
            .update({ name: metaName })
            .eq("id", authId)
            .select("id, role, name, email, phone, created_at")
            .maybeSingle();

          if (updErr) {
            console.warn("users update name:", updErr.message);
          } else {
            uRow = updated || uRow;
          }
        }

        if (!mounted) return;

        setProfile(
          uRow || {
            id: authId,
            name: metaName || null,
            email: authEmail || null,
            phone: null,
            created_at: null,
          }
        );

        // -----------------------------
        // Load valuations (real DB)
        // -----------------------------
        const { data: vRows, error: vErr } = await supabase
          .from("valuations")
          .select("id, property_name, building_name, district, created_at, estimated_valuation")
          .eq("user_id", authId)
          .order("created_at", { ascending: false })
          .limit(12);

        if (!mounted) return;

        if (vErr) {
          console.warn("valuations select:", vErr.message);
          setValuations([]);
        } else {
          setValuations(vRows || []);
        }
      } catch (e) {
        if (!mounted) return;
        setMsg(e?.message || "Failed to load dashboard.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const totalPortfolio = useMemo(() => {
    const sum = valuations.reduce((acc, r) => acc + (Number(r.estimated_valuation) || 0), 0);
    return sum || 0;
  }, [valuations]);

  const tableRows = useMemo(() => {
    if (!valuations?.length) return [];
    return valuations.map((v) => {
      const property = (v.property_name || "").trim();
      const building = (v.building_name || "").trim();
      const district = (v.district || "").trim();

      const title = property || building || "Property";
      const subParts = [];
      if (building && building !== title) subParts.push(building);
      if (district) subParts.push(district);
      subParts.push(fmtDate(v.created_at));

      return {
        id: v.id,
        title,
        sub: subParts.filter(Boolean).join(" • "),
        value: Number(v.estimated_valuation) || 0,
        change: 0.0,
        status: "ValuCheck™ Complete",
        statusClass: "blue",
      };
    });
  }, [valuations]);

  return (
    <div className="dash">
      <aside className="dashSide">
        <div className="dashBrand" role="button" tabIndex={0} onClick={() => navigate("/dashboard")}>
          <div className="dashBrandLogo">A</div>
          <div className="dashBrandName">ACQAR</div>
        </div>

        <nav className="dashNav">
          <button className="dashNavItem active" onClick={() => navigate("/dashboard")}>
            <span className="ico">▦</span>
            <span>Dashboard</span>
          </button>

          {/* ✅ CHANGED: My Portfolio -> /passport */}
          <button className="dashNavItem" onClick={() => navigate("/passport")}>
            <span className="ico">▤</span>
            <span>My Portfolio</span>
          </button>

          <button className="dashNavItem" onClick={() => navigate("/vault")}>
            <span className="ico">✓</span>
            <span>Digital Vault</span>
          </button>

          <button className="dashNavItem" onClick={() => navigate("/insights")}>
            <span className="ico">↗</span>
            <span>Market Insights</span>
          </button>

          <div className="dashNavSection">SUPPORT</div>

          <button className="dashNavItem" onClick={() => navigate("/settings")}>
            <span className="ico">⚙</span>
            <span>Settings</span>
          </button>
        </nav>

        <div className="dashSideFooter">
          <div className="dashUserChip">
            <div className="dashAvatar" />
            <div className="dashUserMeta">
              <div className="dashUserName">{nameToShow}</div>
              <div className="dashUserPlan">Premium Member</div>
            </div>

            <button className="dashLogoutIcon" onClick={handleLogout} title="Logout">
              ⎋
            </button>
          </div>
        </div>
      </aside>

      <main className="dashMain">
        <header className="dashHeader">
          <div>
            <h1 className="dashH1">Welcome back, {nameToShow}</h1>
            <p className="dashSub">Here&apos;s your property intelligence overview for today.</p>
          </div>

          <div className="dashHeaderRight">
            <div className="dashMetric">
              <div className="dashMetricLabel">TOTAL PORTFOLIO VALUE</div>
              <div className="dashMetricVal">{totalPortfolio ? fmtAED(totalPortfolio) : "—"}</div>
            </div>

            <button className="dashPrimary" onClick={() => navigate("/valuation")}>
              <span className="plus">＋</span> New Valuation
            </button>
          </div>
        </header>

        {msg ? <div className="dashMsg">{msg}</div> : null}

        {loading ? (
          <div className="dashLoading">Loading dashboard…</div>
        ) : (
          <div className="dashGrid">
            <section className="card cardWide">
              <div className="cardTop">
                <div className="cardTitle">My Valuations &amp; Reports</div>

                {/* ✅ CHANGED: View All -> /passport */}
                <button className="cardLink" onClick={() => navigate("/passport")}>
                  View All →
                </button>
              </div>

              <div className="tableHead">
                <div>PROPERTY DETAILS</div>
                <div>LAST VALUATION</div>
                <div>CHANGE</div>
                <div>INTELLIGENCE STATUS</div>
              </div>

              <div className="tableBody">
                {tableRows.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="tRow"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/report?id=${r.id}`)}
                  >
                    <div className="propCell">
                      <div className="thumb" />
                      <div>
                        <div className="propTitle">{r.title}</div>
                        <div className="propSub">{r.sub}</div>
                      </div>
                    </div>

                    <div className="valCell">
                      <div className="aed">AED</div>
                      <div className="val">{fmtAEDFull(r.value).replace("AED ", "")}</div>
                    </div>

                    <div className="chgCell neutral">— {Math.abs(r.change).toFixed(1)}%</div>

                    <div className="statusCell">
                      <span className={`pill ${r.statusClass}`}>{r.status}</span>
                    </div>
                  </div>
                ))}

                {!tableRows.length ? (
                  <div className="empty">
                    No valuations found for this user yet. Create a new valuation to see it here.
                  </div>
                ) : null}
              </div>
            </section>

            <aside className="card cardSide">
              <div className="sideTop">
                <div className="cardTitle">Market Intelligence</div>
                <div className="sideIcon">✦</div>
              </div>

              <div className="miBox">
                <div className="miLabel">TOP PERFORMER (7D)</div>
                <div className="miRow">
                  <div>
                    <div className="miName">Dubai Hills Estate</div>
                    <div className="miSub">Secondary Market Sales</div>
                  </div>
                  <div className="miUp">+2.4%</div>
                </div>
              </div>

              <div className="secTitle">TRENDING LOCALITIES</div>

              <div className="trend">
                <div className="trendRow">
                  <span>Palm Jumeirah</span>
                  <span className="bar">
                    <i style={{ width: "78%" }} />
                  </span>
                </div>
                <div className="trendRow">
                  <span>Downtown Dubai</span>
                  <span className="bar">
                    <i style={{ width: "56%" }} />
                  </span>
                </div>
                <div className="trendRow">
                  <span>JVC</span>
                  <span className="bar">
                    <i style={{ width: "66%" }} />
                  </span>
                </div>
              </div>

              <div className="divider" />

              <div className="secTitle">
                SCOUT™ OPPORTUNITIES <span className="dot" />
              </div>

              <div className="opp">
                <div className="oppCard">
                  <div className="oppTitle">Undervalued Listing Found</div>
                  <div className="oppSub">Park Heights, Dubai Hills • 12% below community average.</div>
                  <button className="oppBtn">ANALYZEDEAL →</button>
                </div>

                <div className="oppCard">
                  <div className="oppTitle">High-Yield Prospect</div>
                  <div className="oppSub">Sobha Hartland studio expected net ROI: 8.4%.</div>
                  <button className="oppBtn">ANALYZEDEAL →</button>
                </div>
              </div>
            </aside>

            <section className="passport">
              <div className="passportHead">
                <div className="shield">🛡</div>
                <div>
                  <div className="passportTitle">ACQAR PASSPORT™</div>
                  <div className="passportSub">SECURE DIGITAL ASSET VAULT</div>
                </div>
              </div>

              <div className="passportBody">
                <div className="passportLeft">
                  <div className="passportBox">
                    <div className="passportProp">Secure Document Vault</div>

                    <div className="tags">
                      <span className="tag ok">Title Deed • Verified</span>
                      <span className="tag blue">SPA • Uploaded</span>
                      <span className="tag warn">EJARI • Renewal Due</span>
                    </div>

                    <div className="passportBtns">
                      <button className="pBtn light">＋ Upload Document</button>
                      <button className="pBtn ghost">↗ Share Secure Link</button>
                      <button className="pBtn ghost">✓ Verify Ownership</button>
                    </div>
                  </div>
                </div>

                <div className="passportRight">
                  <div className="ring">
                    <div className="ringNum">98.5</div>
                    <div className="ringLbl">TRUST INDEX</div>
                  </div>
                  <div className="ringNote">Enterprise-grade encryption active.</div>
                </div>
              </div>
            </section>

            <aside className="ticker">
              <div className="tickerTitle">✶ LIVE DLD TICKER</div>
              <div className="tickerItem">
                Villa sold in Emirates Hills for <b>AED 42.5M</b>
              </div>
              <div className="tickerItem">
                Apartment sold in Marina Gate for <b>AED 3.2M</b>
              </div>
              <div className="tickerItem">
                Plot transacted in Jebel Ali for <b>AED 15.8M</b>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
