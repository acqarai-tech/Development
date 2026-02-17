import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

/* ── FOOTER COMPONENT ── */
function Footer() {
  const cols = [
    [
      "PRODUCT",
      [
        "TruValu™ Products",
        "ValuCheck™ (FREE)",
        "DealLens™",
        "InvestIQ™",
        "CertiFi™",
        "Compare Tiers",
      ],
    ],
    [
      "COMPANY",
      ["About ACQAR", "How It Works", "Pricing", "Contact Us", "Partners", "Press Kit"],
    ],
    ["RESOURCES", ["Help Center", "Market Reports", "Blog Column 5", "Comparisons"]],
    [
      "COMPARISONS",
      ["vs Bayut TruEstimate", "vs Property Finder", "vs Traditional Valuers", "Why ACQAR?"],
    ],
  ];

  return (
    <>
      <style>{`
        .acq-footer {
          background: #F9F9F9;
          border-top: 1px solid #EBEBEB;
          padding: 56px 0 0;
          font-family: 'Inter', sans-serif;
        }
        .acq-footer-grid {
          max-width: 80rem;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1.35fr 1fr 1fr 1fr 1fr;
          gap: 48px;
          align-items: start;
          padding-bottom: 48px;
        }
        .acq-brand-name {
          font-size: 1rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #2B2B2B;
          display: block;
          margin-bottom: 14px;
        }
        .acq-brand-desc {
          font-size: 0.75rem;
          color: rgba(43,43,43,0.58);
          line-height: 1.75;
          margin: 0 0 18px;
          max-width: 240px;
        }
        .acq-rics-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 12px;
          background: #fff;
          border: 1px solid #EBEBEB;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .acq-rics-badge svg { flex-shrink: 0; color: #2B2B2B; }
        .acq-rics-badge span {
          font-size: 0.5625rem;
          font-weight: 800;
          color: rgba(43,43,43,0.82);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .acq-social-row { display: flex; gap: 10px; }
        .acq-social-btn {
          width: 34px; height: 34px;
          border-radius: 50%;
          border: 1px solid #E5E7EB;
          display: flex; align-items: center; justify-content: center;
          color: rgba(43,43,43,0.38);
          text-decoration: none;
          transition: color 0.18s, border-color 0.18s;
          background: transparent;
          cursor: pointer;
        }
        .acq-social-btn:hover { color: #B87333; border-color: #B87333; }
        .acq-col-title {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #2B2B2B;
          margin: 0 0 20px;
        }
        .acq-link-list {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 13px;
        }
        .acq-link-item {
          font-size: 0.8125rem;
          color: rgba(43,43,43,0.55);
          font-weight: 400;
          cursor: pointer;
          transition: color 0.16s;
          line-height: 1.4;
        }
        .acq-link-item:hover { color: #B87333; }
        .acq-divider {
          max-width: 80rem;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .acq-divider hr {
          border: none;
          border-top: 1px solid #E5E7EB;
          margin: 0;
        }
        .acq-footer-bottom {
          max-width: 80rem;
          margin: 0 auto;
          padding: 18px 2rem 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .acq-copy p {
          font-size: 0.5625rem;
          font-weight: 800;
          color: rgba(43,43,43,0.38);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin: 0 0 3px;
        }
        .acq-copy small {
          font-size: 0.5rem;
          color: rgba(43,43,43,0.28);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: block;
        }
        .acq-legal {
          display: flex;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .acq-legal a {
          font-size: 0.5625rem;
          font-weight: 800;
          color: rgba(43,43,43,0.38);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          text-decoration: none;
          white-space: nowrap;
          transition: color 0.16s;
        }
        .acq-legal a:hover { color: #2B2B2B; }
        @media (max-width: 1024px) {
          .acq-footer-grid {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 32px;
          }
          .acq-brand-col { grid-column: 1 / -1; }
          .acq-brand-desc { max-width: 100%; }
        }
        @media (max-width: 640px) {
          .acq-footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 28px;
            padding: 0 1rem 40px;
          }
          .acq-brand-col { grid-column: 1 / -1; }
          .acq-footer-bottom {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 14px;
            padding: 18px 1rem 28px;
          }
          .acq-legal { justify-content: center; gap: 18px; }
          .acq-divider { padding: 0 1rem; }
        }
        @media (max-width: 420px) {
          .acq-footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <footer className="acq-footer">
        <div className="acq-footer-grid">
          <div className="acq-brand-col">
            <span className="acq-brand-name">ACQAR</span>
            <p className="acq-brand-desc">
              The world's first AI-powered property intelligence platform for Dubai real estate.
              Independent, instant, investment-grade.
            </p>

            <div className="acq-rics-badge">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span>RICS-Aligned Intelligence</span>
            </div>

            <div className="acq-social-row">
              <a
                href="https://www.linkedin.com/company/acqar"
                target="_blank"
                rel="noopener noreferrer"
                className="acq-social-btn"
                aria-label="LinkedIn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5S1.1 1 2.48 1c1.38 0 2.5 1.12 2.5 2.5zM0 8h5v16H0V8zm7.5 0h4.8v2.2h.1c.67-1.2 2.3-2.4 4.73-2.4C22.2 7.8 24 10.2 24 14.1V24h-5v-8.5c0-2-.04-4.6-2.8-4.6-2.8 0-3.2 2.2-3.2 4.4V24h-5V8z" />
                </svg>
              </a>
            </div>
          </div>

          {cols.map(([title, items]) => (
            <div key={title}>
              <h6 className="acq-col-title">{title}</h6>
              <ul className="acq-link-list">
                {items.map((item) => (
                  <li key={item} className="acq-link-item">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="acq-divider">
          <hr />
        </div>

        <div className="acq-footer-bottom">
          <div className="acq-copy">
            <p>© 2025 ACQARLABS L.L.C-FZ. All rights reserved.</p>
            <small>TruValu™ is a registered trademark.</small>
          </div>
          <nav className="acq-legal">
            {["Legal links", "Terms", "Privacy", "Cookies", "Security"].map((l) => (
              <a key={l} href="#">
                {l}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [showAllValuations, setShowAllValuations] = useState(false);
  const [activeFilter, setActiveFilter] = useState("ALL");
 const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 640);

useEffect(() => {
  const onResize = () => setIsMobile(window.innerWidth <= 640);
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}, []);



  // dropdown state
  const [menuOpen, setMenuOpen] = useState(false);
  const menuWrapRef = useRef(null);

  const nameToShow = useMemo(() => {
    const n = (profile?.name || "").trim();
    if (n) return n;
    const em = (profile?.email || "").split("@")[0] || "User";
    return em.charAt(0).toUpperCase() + em.slice(1);
  }, [profile]);

  const initials = useMemo(() => {
    const parts = (nameToShow || "").trim().split(/\s+/).filter(Boolean);
    const a = (parts[0] || "A")[0] || "A";
    const b = (parts[1] || parts[0] || "M")[0] || "M";
    return (a + b).toUpperCase();
  }, [nameToShow]);

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
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return "TODAY";
    if (days === 1) return "1 DAY AGO";
    if (days < 30) return `${days} DAYS AGO`;
    
    return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  }

  const selectedPassportId = useMemo(() => {
    return valuations?.length ? valuations[0].id : null;
  }, [valuations]);

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

        let { data: uRow, error: byIdErr } = await supabase
          .from("users")
          .select("id, role, name, email, phone, created_at")
          .eq("id", authId)
          .maybeSingle();

        if (byIdErr) console.warn("users select by id:", byIdErr.message);

        if (!uRow && authEmail) {
          const { data: emailRow, error: byEmailErr } = await supabase
            .from("users")
            .select("id, role, name, email, phone, created_at")
            .eq("email", authEmail)
            .maybeSingle();

          if (byEmailErr) console.warn("users select by email:", byEmailErr.message);

          if (emailRow?.id && emailRow.id !== authId) {
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
              const { error: delErr } = await supabase.from("users").delete().eq("id", emailRow.id);
              if (delErr) console.warn("users delete old row:", delErr.message);

              const { data: after, error: afterErr } = await supabase
                .from("users")
                .select("id, role, name, email, phone, created_at")
                .eq("id", authId)
                .maybeSingle();

              if (afterErr) console.warn("users select after migrate:", afterErr.message);
              uRow = after || null;
            }
          } else {
            uRow = emailRow || null;
          }
        }

        if (!uRow) {
          const payload = { id: authId, email: authEmail, name: metaName || null };

          const { error: createErr } = await supabase.from("users").upsert(payload, {
            onConflict: "id",
          });
          if (createErr) console.warn("users create upsert:", createErr.message);

          const { data: createdRow, error: createdSelErr } = await supabase
            .from("users")
            .select("id, role, name, email, phone, created_at")
            .eq("id", authId)
            .maybeSingle();

          if (createdSelErr) console.warn("users select created:", createdSelErr.message);
          uRow = createdRow || null;
        }

        if (uRow && !(uRow.name || "").trim() && metaName) {
          const { data: updated, error: updErr } = await supabase
            .from("users")
            .update({ name: metaName })
            .eq("id", authId)
            .select("id, role, name, email, phone, created_at")
            .maybeSingle();

          if (updErr) console.warn("users update name:", updErr.message);
          else uRow = updated || uRow;
        }

        if (!mounted) return;

        setProfile(
          uRow || { id: authId, name: metaName || null, email: authEmail || null, phone: null, created_at: null }
        );

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

  // close dropdown on outside click / ESC
  useEffect(() => {
    function onDown(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    function onClick(e) {
      const el = menuWrapRef.current;
      if (!el) return;
      if (!el.contains(e.target)) setMenuOpen(false);
    }
    window.addEventListener("keydown", onDown);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const totalPortfolio = useMemo(() => {
    const sum = valuations.reduce((acc, r) => acc + (Number(r.estimated_valuation) || 0), 0);
    return sum || 0;
  }, [valuations]);

  const reportCards = useMemo(() => {
    if (!valuations?.length) return [];
    return valuations.map((v) => {
      const property = (v.property_name || "").trim();
      const building = (v.building_name || "").trim();
      const district = (v.district || "").trim();

      const title = property || building || "Property";
      const unitInfo = building && building !== title ? building : "";

      return {
        id: v.id,
        title,
        unitInfo,
        district,
        date: fmtDate(v.created_at),
        value: Number(v.estimated_valuation) || 0,
        score: Math.floor(Math.random() * 30) + 70,
        badge: "DEALLENS™",
      };
    });
  }, [valuations]);

  function goPassportFromDashboard() {
    const id = selectedPassportId;
    if (!id) {
      setMsg("No valuations found yet. Create a valuation first.");
      return;
    }
    navigate(`/passport?id=${id}`);
  }

  const UI_CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      background: #FAFAFA;
      color: #1a1a1a;
    }

    /* TOP NAV */
    .topNav {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 58px;
      background: #FFFFFF;
      border-bottom: 1px solid #EAEAEA;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
    }

    .navLeft {
      display: flex;
      align-items: center;
      gap: 44px;
      min-width: 0;
    }

    .navBrand {
      font-size: 14px;
      font-weight: 900;
      letter-spacing: 0.16em;
      color: #1a1a1a;
      cursor: pointer;
      text-transform: uppercase;
      line-height: 1;
    }

    .navLinks {
      display: flex;
      gap: 26px;
      align-items: center;
    }

    .navLink {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.14em;
      color: rgba(26,26,26,0.55);
      cursor: pointer;
      text-transform: uppercase;
      line-height: 1;
      padding: 18px 0;
      position: relative;
      user-select: none;
    }

    .navLink:hover { color: rgba(26,26,26,0.85); }
    .navLink.active { color: #1a1a1a; }
    .navLink.active::after {
      content: "";
      position: absolute;
      left: 0; right: 0;
      bottom: 0px;
      height: 2px;
      background: #1a1a1a;
      border-radius: 2px;
    }

    .navRight {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .bellBtn {
      width: 34px;
      height: 34px;
      border-radius: 999px;
      background: transparent;
      border: none;
      display: grid;
      place-items: center;
      cursor: pointer;
      position: relative;
    }

    .bellIcon { width: 16px; height: 16px; color: rgba(26,26,26,0.75); }

    .notificationDot {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 7px;
      height: 7px;
      background: #B87333;
      border-radius: 50%;
      border: 2px solid #fff;
    }

    .profileWrap { position: relative; }

    .profileBtn {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      border: none;
      background: transparent;
      padding: 4px 0;
    }

    .profileMeta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      line-height: 1.05;
    }

    .profileName {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #1a1a1a;
      white-space: nowrap;
      max-width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .profileRole {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(26,26,26,0.45);
      margin-top: 2px;
      white-space: nowrap;
    }

    .profileAvatar {
      width: 28px;
      height: 28px;
      border-radius: 999px;
      background: #B87333;
      display: grid;
      place-items: center;
      color: #fff;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .caret {
      width: 14px;
      height: 14px;
      color: rgba(26,26,26,0.55);
      margin-left: 2px;
    }

    /* DROPDOWN */
    .menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: 220px;
      background: #fff;
      border: 1px solid #EAEAEA;
      border-radius: 12px;
      box-shadow: 0 18px 40px rgba(0,0,0,0.10);
      overflow: hidden;
      z-index: 200;
    }

    .menuTop {
      padding: 14px 16px 12px;
      border-bottom: 1px solid #EFEFEF;
      background: #fff;
    }

    .menuTopLabel {
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.18em;
      color: rgba(26,26,26,0.35);
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .menuName {
      font-size: 13px;
      font-weight: 900;
      font-style: italic;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: 0.02em;
      margin-bottom: 4px;
      line-height: 1.1;
    }

    .menuTier {
      font-size: 9px;
      font-weight: 900;
      letter-spacing: 0.14em;
      color: #B87333;
      text-transform: uppercase;
      line-height: 1.1;
    }

    .menuList { padding: 8px 0; }

    .menuItem {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 11px 16px;
      cursor: pointer;
      user-select: none;
      transition: background 0.14s;
    }

    .menuItem:hover { background: #FAFAFA; }

    .menuIcon {
      width: 16px;
      height: 16px;
      color: rgba(26,26,26,0.55);
      flex-shrink: 0;
    }

    .menuText {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.14em;
      color: #1a1a1a;
      text-transform: uppercase;
    }

    .menuDivider { height: 1px; background: #EFEFEF; margin: 8px 0; }

    .menuSignout {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 16px 14px;
      cursor: pointer;
      color: #FF4D4D;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      user-select: none;
      transition: background 0.14s;
    }

    .menuSignout:hover { background: #FFF6F6; }
    .menuSignout svg { width: 16px; height: 16px; color: #FF4D4D; }

    /* Main Content */
    .dashMain {
      margin-top: 58px;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
      padding: 48px 40px 80px;
    }

    /* Header */
    .dashHeader {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 36px;
    }

    .dashHeaderLeft h1 {
      font-size: 36px;
      font-weight: 700;
      font-style: italic;
      letter-spacing: -0.5px;
      margin-bottom: 10px;
      color: #1a1a1a;
      text-transform: uppercase;
    }

    .dashHeaderLeft p {
      font-size: 11px;
      color: #999;
      font-weight: 500;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .memberBadge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(184, 115, 51, 0.08);
      border: 1px solid rgba(184, 115, 51, 0.25);
      border-radius: 20px;
      font-size: 9px;
      font-weight: 700;
      color: #B87333;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-top: 10px;
    }

    .newValuationBtn {
      padding: 12px 24px;
      background: #1a1a1a;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
    }

    .newValuationBtn:hover {
      background: #000;
      transform: translateY(-1px);
    }

    /* Stats Grid */
    .statsGrid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 48px;
    }

    .statCard {
      background: #fff;
      border: 1px solid #E8E8E8;
      border-radius: 12px;
      padding: 24px 20px;
    }

    .statLabel {
      font-size: 9px;
      font-weight: 800;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 10px;
    }

    .statValue {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
    }

    .statChange {
      font-size: 11px;
      font-weight: 600;
      color: #00B050;
    }

    .statSub {
      font-size: 10px;
      color: #999;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .statActive {
      font-size: 14px;
      font-weight: 700;
      color: #00B050;
    }

    /* Quick Actions */
  .quickActions { 
  margin-bottom: 56px; 
}

.qaLabel {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: rgba(26,26,26,0.40);
  text-transform: uppercase;
  margin-bottom: 22px;
}

/* grid */
.qaGrid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

/* default card */
.qaCard {
  background: #fff;
  border: 1px solid #EDEDED;
  border-radius: 20px;
  padding: 28px 26px 24px;
  cursor: pointer;
  transition: all 0.18s ease;
  min-height: 160px;
  position: relative;
  user-select: none;
}

/* hover copper border */
.qaCard:hover {
  border-color: #B87333;
  box-shadow: 0 14px 28px rgba(0,0,0,0.06);
  transform: translateY(-1px);
}

/* click copper */
.qaCard:active {
  border-color: #B87333;
  box-shadow: 0 18px 38px rgba(0,0,0,0.10);
  transform: translateY(0);
}

/* keyboard focus */
.qaCard:focus-visible {
  outline: none;
  border-color: #B87333;
  box-shadow: 0 18px 38px rgba(0,0,0,0.10);
}

/* remove special highlight so all cards same */
.qaCardActive {
  border-color: #EDEDED;
  box-shadow: none;
}

/* icon box default */
.qaIconBox,
.qaIconCoin {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid #EFEFEF;
  background: #F7F7F7;
  display: grid;
  place-items: center;
  color: #1a1a1a;
  margin-bottom: 18px;
  transition: all 0.18s ease;
}

.qaIconBox svg,
.qaIconCoin svg {
  width: 18px;
  height: 18px;
  color: currentColor;
  fill: currentColor;
}

/* hover → icon copper */
.qaCard:hover .qaIconBox,
.qaCard:hover .qaIconCoin,
.qaCard:active .qaIconBox,
.qaCard:active .qaIconCoin,
.qaCard:focus-visible .qaIconBox,
.qaCard:focus-visible .qaIconCoin {
  background: #B87333;
  border-color: #B87333;
  color: #fff;
}

/* heading like screenshot */
.qaTitle {
  font-size: 18px;
  font-weight: 900;
  font-style: italic;
  color: #1a1a1a;
  letter-spacing: -0.4px;
  margin-bottom: 8px;
  text-transform: uppercase;
  line-height: 1.15;
}

/* description */
.qaDesc {
  font-size: 10px;
  font-weight: 800;
  color: rgba(26,26,26,0.42);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1.55;
}


    /* Reports Section */
    .reportsSection { margin-bottom: 56px; }

    .reportsHeader {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .reportsTitle {
      font-size: 22px;
      font-weight: 700;
      font-style: italic;
      color: #1a1a1a;
      text-transform: uppercase;
    }

    .viewAllLink {
      font-size: 11px;
      font-weight: 700;
      color: #B87333;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .viewAllLink:hover { text-decoration: underline; }

    .filterTabs { display: flex; gap: 12px; margin-bottom: 24px; }

    .filterTab {
      padding: 8px 16px;
      background: #fff;
      border: 1px solid #EDEDED;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 800;
      color: #999;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .filterTab:hover {
      border-color: #D9D9D9;
    }

    .filterTab.active { 
      background: #1a1a1a; 
      color: #fff; 
      border-color: #1a1a1a;
    }

    .reportsGrid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .reportCard {
      background: #fff;
      border: 1px solid #E8E8E8;
      border-radius: 16px;
      padding: 24px 20px 22px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
    }

    .reportCard:hover {
      border-color: #B87333;
      transform: translateY(-2px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.08);
    }

    .reportBadge {
      position: absolute;
      top: 18px;
      right: 18px;
      padding: 4px 10px;
      background: #1a1a1a;
      color: #fff;
      border-radius: 12px;
      font-size: 8px;
      font-weight: 800;
      letter-spacing: 0.08em;
    }

    .reportDate {
      font-size: 9px;
      color: #999;
      margin-bottom: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .reportIcon {
      width: 44px;
      height: 44px;
      background: #FAFAFA;
      border: 1px solid #EDEDED;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      margin-bottom: 14px;
    }

    .reportTitle {
      font-size: 16px;
      font-weight: 800;
      font-style: italic;
      margin-bottom: 4px;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: -0.3px;
    }

    .reportUnit {
      font-size: 10px;
      color: #999;
      margin-bottom: 18px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .reportValue {
      font-size: 9px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 4px;
      font-weight: 700;
    }

    .reportPrice {
      font-size: 20px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 16px;
      letter-spacing: -0.5px;
    }

    .reportFooter {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid #F5F5F5;
    }

    .reportScore {
      font-size: 11px;
      font-weight: 700;
      color: #B87333;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .reportActions { display: flex; gap: 8px; }

    .reportActionBtn {
      padding: 7px 14px;
      background: #1a1a1a;
      color: #fff;
      border: none;
      border-radius: 6px;
      font-size: 9px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .reportActionBtn:hover { background: #000; }

    .downloadIcon {
      width: 30px;
      height: 30px;
      background: #F8F8F8;
      border: 1px solid #EDEDED;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      color: #666;
    }

    .downloadIcon:hover { background: #EDEDED; }

    /* Subscription Card */
    .subscriptionCard {
      background: #fff;
      border: 1px solid #EDEDED;
      border-radius: 16px;
      padding: 28px 24px;
      margin-bottom: 32px;
    }

    .subHeader { 
      display: flex; 
      align-items: center; 
      gap: 14px; 
      margin-bottom: 24px; 
    }

    .subIcon {
      width: 40px;
      height: 40px;
      background: #B87333;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
    }

    .subTitle {
      font-size: 16px;
      font-weight: 800;
      font-style: italic;
      color: #1a1a1a;
      text-transform: uppercase;
      letter-spacing: -0.3px;
    }

    .subGrid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-bottom: 24px;
    }

    .subStat { 
      padding: 16px 14px; 
      background: #FAFAFA; 
      border-radius: 10px; 
    }

    .subStatLabel {
      font-size: 8px;
      font-weight: 800;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 8px;
    }

    .subStatValue { 
      font-size: 14px; 
      font-weight: 700; 
      color: #1a1a1a;
      letter-spacing: -0.3px;
    }

    .subStatActive { color: #00B050; }

    .usageBar { margin-bottom: 20px; }

    .usageLabel {
      font-size: 9px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 10px;
      font-weight: 800;
    }

    .usageProgress {
      height: 8px;
      background: #F5F5F5;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 6px;
    }

    .usageProgressBar {
      height: 100%;
      background: linear-gradient(90deg, #B87333, #D4A574);
      border-radius: 4px;
      transition: width 0.3s;
    }

    .usageText { 
      font-size: 9px; 
      color: #999; 
      text-align: right; 
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .subButtons { display: flex; gap: 12px; }

    .subBtn {
      flex: 1;
      padding: 12px;
      border: none;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .subBtnPrimary { background: #1a1a1a; color: #fff; }
    .subBtnPrimary:hover { background: #000; }

    .subBtnSecondary {
      background: #FAFAFA;
      color: #999;
      border: 1px solid #EDEDED;
    }
    .subBtnSecondary:hover { 
      background: #F5F5F5; 
      color: #666;
    }

    /* Activity Section */
    .activitySection { margin-bottom: 48px; }

    .sectionHeader {
      font-size: 10px;
      font-weight: 800;
      color: rgba(26,26,26,0.40);
      text-transform: uppercase;
      letter-spacing: 0.18em;
      margin-bottom: 16px;
    }

    .activityList {
      background: #fff;
      border: 1px solid #EDEDED;
      border-radius: 16px;
      overflow: hidden;
    }

    .activityItem {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 18px 20px;
      border-bottom: 1px solid #F8F8F8;
      cursor: pointer;
      transition: all 0.2s;
    }

    .activityItem:last-child { border-bottom: none; }
    .activityItem:hover { background: #FAFAFA; }

    .activityIcon {
      width: 36px;
      height: 36px;
      background: #FAFAFA;
      border: 1px solid #F5F5F5;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }

    .activityContent { flex: 1; }

    .activityTitle {
      font-size: 12px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 3px;
    }

    .activityDate {
      font-size: 9px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-weight: 700;
    }

    .viewAllActivity {
      padding: 16px;
      text-align: center;
      font-size: 11px;
      font-weight: 800;
      color: #B87333;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      border-top: 1px solid #F5F5F5;
    }

    .viewAllActivity:hover { background: #FAFAFA; }

    /* Upgrade CTA */
    .upgradeCTA {
      background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 48px 40px;
      text-align: center;
      color: #fff;
      margin-bottom: 60px;
    }

    .ctaIcon { font-size: 28px; margin-bottom: 16px; }

    .ctaTitle {
      font-size: 26px;
      font-weight: 700;
      font-style: italic;
      margin-bottom: 12px;
      line-height: 1.2;
      text-transform: uppercase;
      letter-spacing: -0.5px;
    }

    .ctaDesc {
      font-size: 11px;
      color: rgba(255,255,255,0.7);
      margin-bottom: 24px;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      line-height: 1.6;
    }

    .ctaButtons { display: flex; gap: 12px; justify-content: center; }

    .ctaBtn {
      padding: 14px 24px;
      border: none;
      border-radius: 8px;
      font-size: 10px;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .ctaBtnPrimary { background: #B87333; color: #fff; }
    .ctaBtnPrimary:hover { background: #A06229; }

    .ctaBtnSecondary {
      background: transparent;
      color: #fff;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .ctaBtnSecondary:hover { background: rgba(255,255,255,0.1); }

    .ctaRating { 
      margin-top: 20px; 
      font-size: 10px; 
      color: rgba(255,255,255,0.5);
      letter-spacing: 0.05em;
    }
    .ctaStars { color: #B87333; margin-right: 8px; }

    @media (max-width: 1024px) {
      .navLinks { display: none; }
      .dashMain { padding: 40px 28px 60px; }
      .statsGrid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.statCard {
  padding: 18px 16px;
  border-radius: 14px;
}
.statLabel {
  font-size: 9px;
  letter-spacing: 0.14em;
}
.statValue {
  font-size: 20px;
}
.statChange {
  font-size: 11px;
}
.statSub {
  font-size: 9px;
}
.statActive {
  font-size: 13px;
}

      .reportsGrid { grid-template-columns: repeat(2, 1fr); }
      .qaGrid { grid-template-columns: 1fr; }
      .qaCard { min-height: unset; }
    }

    @media (max-width: 640px) {
      .topNav { padding: 0 16px; }
      .profileMeta { display: none; }
      .dashMain { padding: 32px 20px 60px; }
      .dashHeaderLeft h1 { font-size: 26px; }
    .statsGrid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.statCard {
  padding: 18px 16px;
  border-radius: 14px;
}
.statLabel {
  font-size: 9px;
  letter-spacing: 0.14em;
}
.statValue {
  font-size: 20px;
}
.statChange {
  font-size: 11px;
}
.statSub {
  font-size: 9px;
}
.statActive {
  font-size: 13px;
}

      .reportsGrid { grid-template-columns: 1fr; }
      .subGrid { grid-template-columns: 1fr; }
      .ctaButtons { flex-direction: column; }
      .ctaTitle { font-size: 22px; }
    }
  `;

  const path = location.pathname;
  const isDash = path === "/dashboard" || path === "/";
  const isReports = path === "/my-reports";
  const isSettings = path === "/settings";

  return (
    <>
      <style>{UI_CSS}</style>

      {/* Top Navigation */}
      <nav className="topNav">
        <div className="navLeft">
          <div className="navBrand" onClick={() => navigate("/dashboard")}>
            ACQAR
          </div>

          <div className="navLinks">
            <div
              className={`navLink ${isDash ? "active" : ""}`}
              onClick={() => navigate("/dashboard")}
            >
              DASHBOARD
            </div>
            <div
              className={`navLink ${isReports ? "active" : ""}`}
              onClick={() => navigate("/my-reports")}
            >
              MY REPORTS
            </div>
            <div
              className={`navLink ${isSettings ? "active" : ""}`}
              onClick={() => navigate("/settings")}
            >
              SETTINGS
            </div>
          </div>
        </div>

        <div className="navRight" ref={menuWrapRef}>
          <button className="bellBtn" type="button" aria-label="Notifications">
            <svg
              className="bellIcon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
              <path d="M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <span className="notificationDot" />
          </button>

          <div className="profileWrap">
            <button
              type="button"
              className="profileBtn"
              onClick={() => setMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen ? "true" : "false"}
            >
              <div className="profileMeta">
                <div className="profileName">{nameToShow}</div>
                <div className="profileRole">INVESTOR TIER</div>
              </div>
              <div className="profileAvatar">{initials}</div>
              <svg
                className="caret"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {menuOpen && (
              <div className="menu" role="menu">
                <div className="menuTop">
                  <div className="menuTopLabel">Authenticated Account</div>
                  <div className="menuName">{nameToShow}</div>
                  <div className="menuTier">InvestIQ™ Premium Member</div>
                </div>

                <div className="menuList">
                  <div
                    className="menuItem"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/dashboard");
                    }}
                  >
                    <svg
                      className="menuIcon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />
                    </svg>
                    <div className="menuText">Dashboard</div>
                  </div>

                  <div
                    className="menuItem"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/reports");
                    }}
                  >
                    <svg
                      className="menuIcon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                    <div className="menuText">My Reports</div>
                  </div>

                  <div
                    className="menuItem"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/settings");
                    }}
                  >
                    <svg
                      className="menuIcon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" />
                      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.05.05a2 2 0 0 1-1.41 3.41h-.1a1.7 1.7 0 0 0-1.6 1.16 1.7 1.7 0 0 0-.37.62 2 2 0 0 1-3.82 0 1.7 1.7 0 0 0-.37-.62 1.7 1.7 0 0 0-1.6-1.16H9.5a2 2 0 0 1-1.41-3.41l.05-.05A1.7 1.7 0 0 0 8.6 15a1.7 1.7 0 0 0-1.06-1.6l-.06-.03a2 2 0 0 1 0-3.74l.06-.03A1.7 1.7 0 0 0 8.6 9a1.7 1.7 0 0 0-.34-1.87l-.05-.05A2 2 0 0 1 9.62 3.7h.1a1.7 1.7 0 0 0 1.6-1.16 2 2 0 0 1 3.82 0 1.7 1.7 0 0 0 1.6 1.16h.1A2 2 0 0 1 21 6.98l-.05.05A1.7 1.7 0 0 0 20.6 9a1.7 1.7 0 0 0 1.06 1.6l.06.03a2 2 0 0 1 0 3.74l-.06.03A1.7 1.7 0 0 0 19.4 15z" />
                    </svg>
                    <div className="menuText">Account Settings</div>
                  </div>

                  <div
                    className="menuItem"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/billing");
                    }}
                  >
                    <svg
                      className="menuIcon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                    <div className="menuText">Billing & Plans</div>
                  </div>

                  <div className="menuDivider" />

                  <div
                    className="menuSignout"
                    role="menuitem"
                    onClick={async () => {
                      setMenuOpen(false);
                      await handleLogout();
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M10 17l5-5-5-5" />
                      <path d="M15 12H3" />
                      <path d="M21 3v18" />
                    </svg>
                    SIGN OUT
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <style>{`
  @media (max-width: 640px){
    .nvBtn{ width:100% !important; max-width:100% !important; margin-top:16px; }
    .dashHeaderInline{ flex-direction:column !important; align-items:flex-start !important; }
  }
`}</style>


      {/* Main Content */}
      <main className="dashMain">
        {/* Header */}
       <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: isMobile ? "flex-start" : "center",
    flexDirection: isMobile ? "column" : "row",
    gap: isMobile ? 16 : 22,
    marginBottom: isMobile ? 24 : 36,
    width: "100%",
  }}
>
  {/* LEFT */}
  <div style={{ minWidth: 0, flex: 1, width: "100%" }}>
    <h1
      style={{
        fontSize: isMobile ? 28 : 36,
        fontWeight: 900,
        fontStyle: "italic",
        letterSpacing: isMobile ? "-0.6px" : "-0.8px",
        marginBottom: 8,
        color: "#1a1a1a",
        textTransform: "uppercase",
        lineHeight: 1.05,
      }}
    >
      WELCOME BACK, {nameToShow.toUpperCase()}
    </h1>

    <p
      style={{
        fontSize: isMobile ? 10 : 11,
        color: "rgba(26,26,26,0.45)",
        fontWeight: 800,
        letterSpacing: isMobile ? "0.12em" : "0.14em",
        textTransform: "uppercase",
      }}
    >
      YOU HAVE {valuations.length} ACTIVE REPORTS IN YOUR DASHBOARD
    </p>

    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: isMobile ? "10px 14px" : "8px 14px",
        background: "rgba(184,115,51,0.10)",
        border: "1px solid rgba(184,115,51,0.26)",
        borderRadius: isMobile ? 18 : 999,
        fontSize: 9,
        fontWeight: 900,
        color: "#B87333",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        marginTop: 12,
        width: isMobile ? "100%" : "fit-content",
        maxWidth: "100%",
      }}
    >
      🏆 EARLY ACQAR MEMBER - VALUCHECK™ FREE FOREVER
    </div>
  </div>

  {/* BUTTON (right on desktop, full-width on mobile) */}
  <div
    style={{
      marginLeft: isMobile ? 0 : "auto",
      width: isMobile ? "100%" : "auto",
      display: "flex",
      justifyContent: isMobile ? "center" : "flex-end",
      alignItems: "center",
    }}
  >
    <button
      onClick={() => navigate("/valuation")}
      style={{
        height: isMobile ? 48 : 44,
        width: isMobile ? "100%" : 220,
        padding: "0 22px",
        background: "#111",
        color: "#fff",
        border: "1px solid rgba(0,0,0,0.10)",
        borderRadius: isMobile ? 14 : 12,
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: "0.14em",
        cursor: "pointer",
        textTransform: "uppercase",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        whiteSpace: "nowrap",
        boxShadow: "0 14px 30px rgba(0,0,0,0.08)",
      }}
    >
      <span
        style={{
          display: "grid",
          placeItems: "center",
          width: 18,
          height: 18,
          borderRadius: 6,
          background: "rgba(255,255,255,0.10)",
          border: "1px solid rgba(255,255,255,0.10)",
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        +
      </span>
      NEW VALUATION
    </button>
  </div>
</div>



        {/* Stats Grid */}
        <div className="statsGrid">
          <div className="statCard">
            <div className="statLabel">TOTAL VALUE</div>
            <div className="statValue">{fmtAED(totalPortfolio)}</div>
            <div className="statChange">+5.2% ↗</div>
          </div>

          <div className="statCard">
            <div className="statLabel">PROPERTIES</div>
            <div className="statValue">{valuations.length}</div>
            <div className="statSub">MARKET STABLE</div>
          </div>

          <div className="statCard">
            <div className="statLabel">AVG SCORE</div>
            <div className="statValue">82/100</div>
            <div
  style={{
    fontSize: 10,
    color: "#B87333",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  }}
>
  EXCEEDS AREA
</div>

          </div>

          <div className="statCard">
            <div className="statLabel">ACTIVE SUBSCRIPTION</div>
            <div className="statValue">INVESTIQ™</div>
            <div className="statChange">ACTIVE ✓</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quickActions">
          <div className="qaLabel">QUICK ACTIONS</div>

          <div className="qaGrid">
            {/* Card 1 */}
            <div className="qaCard" onClick={() => navigate("/valuation")} role="button" tabIndex={0}>
              <div className="qaIconBox">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="qaTitle">NEW VALUATION</div>
              <div className="qaDesc">GET INSTANT PROPERTY INTELLIGENCE FOR ANY ASSET.</div>
            </div>

            {/* Card 2 (highlighted) */}
            <div
              className="qaCard qaCardActive"
              onClick={() => navigate("/my-reports")}
              role="button"
              tabIndex={0}
            >
              <div className="qaIconCoin" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2v6h6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="qaTitle">MY REPORTS</div>
              <div className="qaDesc">VIEW AND MANAGE ALL YOUR GENERATED REPORTS.</div>
            </div>

            {/* Card 3 */}
            <div className="qaCard" onClick={() => navigate("/settings")} role="button" tabIndex={0}>
              <div className="qaIconBox">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M19.4 15a1.8 1.8 0 0 0 .35 1.9l.05.05a2 2 0 0 1-1.42 3.42h-.1a1.8 1.8 0 0 0-1.7 1.2 2 2 0 0 1-3.84 0 1.8 1.8 0 0 0-1.7-1.2H9.5a2 2 0 0 1-1.42-3.42l.05-.05A1.8 1.8 0 0 0 8.6 15a1.8 1.8 0 0 0-1.1-1.7l-.06-.03a2 2 0 0 1 0-3.74l.06-.03A1.8 1.8 0 0 0 8.6 9a1.8 1.8 0 0 0-.35-1.9l-.05-.05A2 2 0 0 1 9.62 3.7h.1a1.8 1.8 0 0 0 1.7-1.2 2 2 0 0 1 3.84 0 1.8 1.8 0 0 0 1.7 1.2h.1A2 2 0 0 1 21 6.98l-.05.05A1.8 1.8 0 0 0 20.6 9a1.8 1.8 0 0 0 1.1 1.7l.06.03a2 2 0 0 1 0 3.74l-.06.03A1.8 1.8 0 0 0 19.4 15z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="qaTitle">ACCOUNT SETTINGS</div>
              <div className="qaDesc">MANAGE YOUR PROFILE, BILLING AND PREFERENCES.</div>
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="reportsSection">
          <div className="reportsHeader">
            <div className="reportsTitle">RECENT REPORTS</div>
            <div className="viewAllLink" onClick={() => setShowAllValuations(!showAllValuations)}>
              {showAllValuations ? "SHOW LESS" : "VIEW ALL REPORTS →"}
            </div>
          </div>

          <div className="filterTabs">
            <div
              className={`filterTab ${activeFilter === "ALL" ? "active" : ""}`}
              onClick={() => setActiveFilter("ALL")}
            >
              ALL
            </div>
            <div
              className={`filterTab ${activeFilter === "VALUCHECK" ? "active" : ""}`}
              onClick={() => setActiveFilter("VALUCHECK")}
            >
              VALUCHECK™
            </div>
            <div
              className={`filterTab ${activeFilter === "DEALLENS" ? "active" : ""}`}
              onClick={() => setActiveFilter("DEALLENS")}
            >
              DEALLENS™
            </div>
            <div
              className={`filterTab ${activeFilter === "CERTIFI" ? "active" : ""}`}
              onClick={() => setActiveFilter("CERTIFI")}
            >
              CERTIFI™
            </div>
          </div>

          {reportCards.length === 0 ? (
            <div style={{ padding: "60px 40px", textAlign: "center", color: "#999", background: "#FAFAFA", borderRadius: "16px", border: "1px solid #EDEDED" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
              <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px", color: "#1a1a1a" }}>No Valuations Yet</div>
              <div style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Create your first valuation to see it here.</div>
            </div>
          ) : (
            <div className="reportsGrid">
              {(showAllValuations ? reportCards : reportCards.slice(0, 6)).map((card) => (
                <div
                  key={card.id}
                  className="reportCard"
                  onClick={() => navigate(`/report?id=${card.id}`)}
                >
                  <div className="reportBadge">{card.badge}</div>
                  <div className="reportDate">{card.date}</div>
                  <div className="reportIcon">🏠</div>
                  <div className="reportTitle">{card.title}</div>
                  <div className="reportUnit">{card.unitInfo || `UNIT ${String(card.id).slice(0, 4)}`}</div>
                  <div className="reportValue">ASSET VALUE</div>
                  <div className="reportPrice">{fmtAEDFull(card.value)}</div>
                  <div className="reportFooter">
                    <div className="reportScore">SCORE: {card.score}/100</div>
                    <div className="reportActions">
                      <button className="reportActionBtn">VIEW REPORT</button>
                      <div className="downloadIcon">↓</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscription Card */}
        <div className="subscriptionCard">
          <div className="subHeader">
            <div className="subIcon">⚡</div>
            <div className="subTitle">YOUR INVESTIQ™ SUBSCRIPTION</div>
          </div>

          <div className="subGrid">
            <div className="subStat">
              <div className="subStatLabel">STATUS</div>
              <div className="subStatValue subStatActive">● ACTIVE</div>
            </div>
            <div className="subStat">
              <div className="subStatLabel">NEXT BILLING</div>
              <div className="subStatValue">FEB 19, 2026</div>
            </div>
            <div className="subStat">
              <div className="subStatLabel">REPORTS USED</div>
              <div className="subStatValue">3 / 5 <span style={{ fontSize: "10px", color: "#999", fontWeight: "500" }}>Reports</span></div>
            </div>
          </div>

          <div className="usageBar">
            <div className="usageLabel">USAGE THIS MONTH</div>
            <div className="usageProgress">
              <div className="usageProgressBar" style={{ width: "60%" }} />
            </div>
            <div className="usageText">60% USED</div>
          </div>

          <div className="subButtons">
            <button className="subBtn subBtnPrimary">MANAGE SUBSCRIPTION</button>
            <button className="subBtn subBtnSecondary">VIEW BILLING HISTORY</button>
          </div>
        </div>

        {/* Activity Section */}
        <div className="activitySection">
          <div className="sectionHeader">RECENT ACTIVITY</div>
          <div className="activityList">
            {reportCards.slice(0, 3).map((card, idx) => (
              <div key={card.id} className="activityItem" onClick={() => navigate(`/report?id=${card.id}`)}>
                <div className="activityIcon">
                  {idx === 0 ? "📄" : idx === 1 ? "💳" : "⬇️"}
                </div>
                <div className="activityContent">
                  <div className="activityTitle">
                    {idx === 0 ? `Report generated: ${card.title}` :
                     idx === 1 ? "Subscription renewed: InvestIQ™ Annual" :
                     `Report downloaded: ${card.title}`}
                  </div>
                  <div className="activityDate">{card.date}</div>
                </div>
              </div>
            ))}

            <div className="viewAllActivity">VIEW ALL ACTIVITY →</div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="upgradeCTA">
          <div className="ctaIcon">⚡</div>
          <div className="ctaTitle">UPGRADE TO INVESTMENT-GRADE INTELLIGENCE</div>
          <div className="ctaDesc">
            GET EXACT VALUATIONS (±5%), INVESTMENT SCORES, AND 3-YEAR FORECASTS WITH DEALLENS™.
            TRUSTED BY 2,500+ DUBAI INVESTORS.
          </div>
          <div className="ctaButtons">
            <button className="ctaBtn ctaBtnPrimary">UPGRADE TO DEALLENS™ - AED 149 →</button>
            <button className="ctaBtn ctaBtnSecondary">SEE ALL PLANS</button>
          </div>
          <div className="ctaRating">
            <span className="ctaStars">★★★★★</span>
            <span>4.9/5 Rating</span>
          </div>
          <div style={{ fontSize: "9px", marginTop: "8px", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            VERIFIED BY 347 GLOBAL PORTFOLIO MANAGERS
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

