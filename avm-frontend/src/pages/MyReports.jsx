// src/pages/MyReports.jsx
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

export default function MyReports() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState(null);
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [pressedId, setPressedId] = useState(null);


  // ✅ tabs scroll refs (mobile)
const tabsRef = useRef(null);
const [tabThumb, setTabThumb] = useState({ w: 40, x: 0 });

useEffect(() => {
  const el = tabsRef.current;
  if (!el) return;

  const update = () => {
    const scrollW = el.scrollWidth || 1;
    const clientW = el.clientWidth || 1;
    const maxScroll = Math.max(1, scrollW - clientW);

    // thumb width proportional to visible area (with min/max like screenshot)
    const w = Math.max(48, Math.min(180, (clientW / scrollW) * clientW));

    // thumb position
    const x = ((el.scrollLeft || 0) / maxScroll) * Math.max(0, clientW - w);

    setTabThumb({ w, x });
  };

  update();
  el.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);

  return () => {
    el.removeEventListener("scroll", update);
    window.removeEventListener("resize", update);
  };
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

  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-US", { 
      month: "short", 
      day: "2-digit", 
      year: "numeric" 
    }).toUpperCase();
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);

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

        let { data: uRow } = await supabase
          .from("users")
          .select("id, role, name, email, phone, created_at")
          .eq("id", authId)
          .maybeSingle();

        if (!mounted) return;

        setProfile(
          uRow || { id: authId, name: metaName || null, email: authEmail || null, phone: null, created_at: null }
        );

        const { data: vRows, error: vErr } = await supabase
          .from("valuations")
          .select("id, property_name, building_name, district, created_at, estimated_valuation")
          .eq("user_id", authId)
          .order("created_at", { ascending: false });

        if (!mounted) return;

        if (vErr) {
          console.warn("valuations select:", vErr.message);
          setValuations([]);
        } else {
          setValuations(vRows || []);
        }
      } catch (e) {
        if (!mounted) return;
        console.error("Failed to load reports:", e);
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

  const totalValue = useMemo(() => {
    const sum = valuations.reduce((acc, r) => acc + (Number(r.estimated_valuation) || 0), 0);
    return sum || 0;
  }, [valuations]);

  const reportCards = useMemo(() => {
    if (!valuations?.length) return [];
    
    let filtered = valuations;
    
    // Filter by type
    if (activeFilter !== "ALL") {
      // For now, all are DEALLENS™ - you can add type field to database later
      filtered = valuations;
    }
    
    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(v => {
        const property = (v.property_name || "").toLowerCase();
        const building = (v.building_name || "").toLowerCase();
        const district = (v.district || "").toLowerCase();
        return property.includes(query) || building.includes(query) || district.includes(query);
      });
    }
    
    return filtered.map((v) => {
      const property = (v.property_name || "").trim();
      const building = (v.building_name || "").trim();
      const district = (v.district || "").trim();

      const title = property || building || "Property";
      const unitInfo = building && building !== title ? building : "";

      // Determine status based on created date
      const createdDate = new Date(v.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      
      let status = "ACTIVE";
      let statusColor = "#10B981";
      
      if (daysDiff > 90) {
        status = "EXPIRED";
        statusColor = "#999";
      } else if (daysDiff > 60) {
        status = "EXPIRING";
        statusColor = "#F59E0B";
      }

      return {
        id: v.id,
        title,
        unitInfo,
        district,
        date: fmtDate(v.created_at),
        value: Number(v.estimated_valuation) || 0,
        score: Math.floor(Math.random() * 30) + 70,
        badge: "DEALLENS™",
        status,
        statusColor,
      };
    });
  }, [valuations, activeFilter, searchQuery]);

  // Calculate health metrics
  const healthMetrics = useMemo(() => {
    if (!reportCards.length) return { score: 0, investmentReady: 0, needsAttention: 0, validChange: 0 };
    
    const investmentReady = reportCards.filter(r => r.score >= 80).length;
    const needsAttention = reportCards.filter(r => r.score < 70).length;
    const avgScore = Math.round(reportCards.reduce((acc, r) => acc + r.score, 0) / reportCards.length);
    
    return {
      score: avgScore,
      investmentReady: Math.round((investmentReady / reportCards.length) * 100),
      needsAttention: Math.round((needsAttention / reportCards.length) * 100),
      validChange: 5.2
    };
  }, [reportCards]);

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
    .reportsMain {
      margin-top: 58px;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
      padding: 48px 40px 80px;
    }

    /* Header */
    /* Header */
/* Header bottom divider */
.reportsHeader{
  padding-bottom: 30px;
  border-bottom: 1px solid #E6E6E6;
  margin-bottom: 50px;
}


.reportsHeaderRow{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:40px;
}

.reportsHeaderLeft{ min-width:0; }

.reportsHeader h1{
  font-size: 46px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -1.2px;
  margin: 0 0 8px;
  color:#1a1a1a;
  text-transform: uppercase;
  line-height: 1;
  transform: skewX(-8deg);
}

.reportsHeader p{
  margin: 0;
  font-size: 10px;
  color: #9a9a9a;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.reportsStatsTop{
  display:flex;
  gap:46px;
  margin-top: 6px;
  flex-shrink:0;
}

.reportsStatItem{
  display:flex;
  flex-direction:column;
  gap:6px;
  align-items:flex-end;
  text-align:right;
}

.reportsStatLabel{
  font-size: 9px;
  font-weight: 800;
  color:#9a9a9a;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.reportsStatValue{
  font-size: 18px;
  font-weight: 900;
  color:#1a1a1a;
  letter-spacing: -0.2px;
}

.reportsStatAccent{
  color:#B87333;
}


    /* Controls */
    .controlsBar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 50px;
      gap: 20px;
    }

    .filterTabs {
      display: flex;
      gap: 12px;
    }

    .filterTab {
      padding: 10px 20px;
      background: #fff;
      border: 1px solid #E8E8E8;
      border-radius: 24px;
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

    /* ✅ Default (desktop/tablet): hide mobile scroll bar + arrows */
.tabsBottomRow { 
  display: none ; 
}


    .searchControls {
      display: flex;
      gap: 30px;
      align-items: center;
    }

    .searchBox {
      position: relative;
      width: 280px;
    }

    .searchIcon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: #999;
    }

    .searchInput {
      width: 100%;
      padding: 10px 14px 10px 40px;
      border: 1px solid #E8E8E8;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 500;
      color: #1a1a1a;
      background: #fff;
      outline: none;
      transition: border-color 0.2s;
    }

    .searchInput:focus {
      border-color: #B87333;
    }

    .searchInput::placeholder {
      color: #999;
    }

    .filterBtn {
      width: 38px;
      height: 38px;
      border: 1px solid #E8E8E8;
      border-radius: 8px;
      background: #fff;
      display: grid;
      place-items: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .filterBtn:hover {
      border-color: #B87333;
      background: #FAFAFA;
    }

    .filterBtn svg {
      width: 16px;
      height: 16px;
      color: #666;
    }

    /* Reports Grid */
    // .reportsGrid {
    //   display: grid;
    //   grid-template-columns: repeat(3, 1fr);
    //   gap: 24px;
    //   margin-bottom: 56px;
    // }

    // .reportCard {
    //   background: #fff;
    //   border: 1px solid #E8E8E8;
    //   border-radius: 16px;
    //   padding: 24px 20px 22px;
    //   cursor: pointer;
    //   transition: all 0.2s;
    //   position: relative;
    // }

    // .reportCard:hover {
    //   border-color: #B87333;
    //   transform: translateY(-2px);
    //   box-shadow: 0 12px 24px rgba(0,0,0,0.08);
    // }

    // .reportCardHeader {
    //   display: flex;
    //   justify-content: space-between;
    //   align-items: flex-start;
    //   margin-bottom: 14px;
    // }

    // .reportIcon {
    //   width: 40px;
    //   height: 40px;
    //   background: #FAFAFA;
    //   border: 1px solid #EDEDED;
    //   border-radius: 10px;
    //   display: flex;
    //   align-items: center;
    //   justify-content: center;
    //   font-size: 18px;
    // }

    // .reportStatus {
    //   display: flex;
    //   flex-direction: column;
    //   align-items: flex-end;
    //   gap: 6px;
    // }

    // .statusBadge {
    //   padding: 4px 10px;
    //   border-radius: 12px;
    //   font-size: 8px;
    //   font-weight: 800;
    //   letter-spacing: 0.08em;
    //   text-transform: uppercase;
    // }

    // .statusActive {
    //   background: #10B981;
    //   color: #fff;
    // }

    // .statusExpiring {
    //   background: #F59E0B;
    //   color: #fff;
    // }

    // .statusExpired {
    //   background: #E8E8E8;
    //   color: #999;
    // }

    // .reportDate {
    //   font-size: 9px;
    //   color: #999;
    //   font-weight: 700;
    //   letter-spacing: 0.08em;
    //   text-transform: uppercase;
    // }

    // .reportTitle {
    //   font-size: 16px;
    //   font-weight: 800;
    //   font-style: italic;
    //   margin-bottom: 4px;
    //   color: #1a1a1a;
    //   text-transform: uppercase;
    //   letter-spacing: -0.3px;
    // }

    // .reportUnit {
    //   font-size: 10px;
    //   color: #999;
    //   margin-bottom: 18px;
    //   text-transform: uppercase;
    //   letter-spacing: 0.05em;
    // }

    // .reportMeta {
    //   display: flex;
    //   justify-content: space-between;
    //   align-items: flex-start;
    //   margin-bottom: 16px;
    // }

    // .reportMetaItem {
    //   display: flex;
    //   flex-direction: column;
    //   gap: 4px;
    // }

    // .reportMetaLabel {
    //   font-size: 9px;
    //   color: #999;
    //   text-transform: uppercase;
    //   letter-spacing: 0.12em;
    //   font-weight: 700;
    // }

    // .reportMetaValue {
    //   font-size: 18px;
    //   font-weight: 700;
    //   color: #1a1a1a;
    //   letter-spacing: -0.5px;
    // }

    // .reportMetaType {
    //   font-size: 9px;
    //   color: #B87333;
    //   text-transform: uppercase;
    //   letter-spacing: 0.08em;
    //   font-weight: 800;
    //   font-style: italic;
    // }

    // .reportFooter {
    //   display: flex;
    //   justify-content: space-between;
    //   align-items: center;
    //   padding-top: 14px;
    //   border-top: 1px solid #F5F5F5;
    // }

    // .reportScore {
    //   font-size: 11px;
    //   font-weight: 700;
    //   color: #B87333;
    //   text-transform: uppercase;
    //   letter-spacing: 0.05em;
    // }

    // .reportActions {
    //   display: flex;
    //   gap: 8px;
    // }

    // .reportActionBtn {
    //   padding: 7px 14px;
    //   background: #1a1a1a;
    //   color: #fff;
    //   border: none;
    //   border-radius: 6px;
    //   font-size: 9px;
    //   font-weight: 800;
    //   cursor: pointer;
    //   transition: all 0.2s;
    //   text-transform: uppercase;
    //   letter-spacing: 0.08em;
    // }

    // .reportActionBtn:hover { background: #000; }

    // .downloadIcon {
    //   width: 30px;
    //   height: 30px;
    //   background: #F8F8F8;
    //   border: 1px solid #E8E8E8;
    //   border-radius: 6px;
    //   cursor: pointer;
    //   transition: all 0.2s;
    //   display: flex;
    //   align-items: center;
    //   justify-content: center;
    //   font-size: 13px;
    //   color: #666;
    // }

    // .downloadIcon:hover { background: #E8E8E8; }

    /* Reports Grid */
.reportsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 56px;
}

/* ✅ CARD: match screenshot */
.reportCard {
  background: #fff;
  border: 1px solid #EFEFEF;
  border-radius: 26px;
  padding: 26px 22px 22px;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
  position: relative;
  box-shadow: 0 10px 22px rgba(0,0,0,0.05);
  outline: none;
}

/* hover like screenshot (soft lift) */
.reportCard:hover {
  border-color: #E7E7E7;
  transform: translateY(-2px);
  box-shadow: 0 16px 30px rgba(0,0,0,0.08);
}

/* ✅ “clicked/pressed” look like screenshot */
.reportCard:active,
.reportCard.isPressed {
  transform: translateY(0);
  border-color: rgba(184,115,51,0.40);
  box-shadow: 0 14px 28px rgba(0,0,0,0.07);
}

/* copper bottom accent (only on pressed) */
.reportCard:active::after,
.reportCard.isPressed::after {
  content: "";
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: -1px;
  height: 3px;
  background: #B87333;
  border-radius: 999px;
}

/* header row */
.reportCardHeader {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

/* ✅ icon box like screenshot */
.reportIcon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #F6F6F6;
  border: 1px solid #EFEFEF;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* icon svg default */
.reportIcon svg {
  width: 18px;
  height: 18px;
  color: #B87333;
}

/* icon becomes copper filled on pressed */
.reportCard:active .reportIcon,
.reportCard.isPressed .reportIcon {
  background: #B87333;
  border-color: #B87333;
}
.reportCard:active .reportIcon svg,
.reportCard.isPressed .reportIcon svg {
  color: #fff;
}

.reportStatus {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.statusBadge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.10em;
  text-transform: uppercase;
}

.statusActive { background: #00B050; color: #fff; }
.statusExpiring { background: #F59E0B; color: #fff; }
.statusExpired { background: #E8E8E8; color: #999; }

.reportDate {
  font-size: 9px;
  color: #9a9a9a;
  font-weight: 800;
  letter-spacing: 0.10em;
  text-transform: uppercase;
}

.reportTitle {
  font-size: 18px;
  font-weight: 900;
  font-style: italic;
  margin-bottom: 6px;
  color: #1a1a1a;
  text-transform: uppercase;
  letter-spacing: -0.4px;
}

.reportUnit {
  font-size: 10px;
  color: #9a9a9a;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  font-weight: 800;
}

.reportMeta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

.reportMetaLabel {
  font-size: 9px;
  color: #9a9a9a;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 900;
}

.reportMetaValue {
  font-size: 20px;
  font-weight: 900;
  color: #1a1a1a;
  letter-spacing: -0.6px;
}

.reportMetaType {
  font-size: 9px;
  color: #B87333;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  font-weight: 900;
  font-style: italic;
}

.reportFooter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #F2F2F2;
}

/* score colors like screenshot vibe */
.reportScore {
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.scoreCopper { color: #B87333; }
.scoreGreen { color: #10B981; }
.scoreGray { color: #9a9a9a; }

.reportActions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.reportActionBtn {
  padding: 9px 18px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 9px;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.18s;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  box-shadow: 0 8px 16px rgba(0,0,0,0.10);
}

.reportActionBtn:hover { background: #000; }

.downloadIcon {
  width: 34px;
  height: 34px;
  background: #F7F7F7;
  border: 1px solid #EAEAEA;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1a1a;
}

.downloadIcon:hover { background: #EFEFEF; }

    /* Health Score Card */
    /* ===== Archive Health Score (desktop = image 2, mobile = image 1) ===== */
/* ===== Archive Health Score (DESKTOP = image 2, MOBILE = image 1) ===== */

/* --- DESKTOP BASE (image 2) --- */
.healthScoreCard{
  background:#F6F6F6;
  border:1px solid #EAEAEA;
  border-radius:999px;
  padding:22px 30px;
  margin-bottom:32px;
  display:flex;
  align-items:center;
  gap:18px;
}

.healthScoreCircle{
  width:66px;
  height:66px;
  border-radius:999px;
  border:4px solid #B87333;
  background:#fff;
  display:grid;
  place-items:center;
  font-size:18px;
  font-weight:900;
  color:#111;
  flex-shrink:0;
  box-shadow: 0 10px 22px rgba(0,0,0,0.10);
}

.healthScoreContent{
  flex:1;
  min-width:0;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:28px;
}

.healthScoreText{
  min-width:0;
}

.healthScoreTitle{
  font-size:16px;
  font-weight:900;
  font-style:italic;
  text-transform:uppercase;
  letter-spacing:-0.25px;
  color:#111;
  margin:0 0 6px;
  line-height:1.05;
}

.healthScoreDesc{
  font-size:9px;
  font-weight:900;
  font-style:italic;
  text-transform:uppercase;
  letter-spacing:0.16em;
  color:rgba(17,17,17,0.35);
  margin:0;
  line-height:1.35;
}

.healthMetrics{
  display:grid;
  grid-template-columns: repeat(3, auto);
  gap:44px;
  align-items:center;
}

.healthMetric{
  display:flex;
  flex-direction:column;
  align-items:center;
  text-align:center;
  gap:6px;
  min-width:92px;
}

.healthMetricValue{
  font-size:20px;
  font-weight:900;
  letter-spacing:-0.25px;
  line-height:1;
}

.healthMetricLabel{
  font-size:8px;
  font-weight:900;
  font-style:italic;
  text-transform:uppercase;
  letter-spacing:0.18em;
  color:rgba(17,17,17,0.35);
  line-height:1.1;
}

/* exact colors like screenshot */
.metricGreen{ color:#18A94B; }
.metricOrange{ color:#B87333; }

/* --- MOBILE (image 1) --- */
/* ===== MOBILE ARCHIVE HEALTH SCORE — FINAL ===== */
@media (max-width: 640px) {
/* =========================================
   ARCHIVE HEALTH SCORE — MOBILE FINAL
   matches screenshot exactly
========================================= */

.healthScoreCard{
  background:#F6F6F6;
  border:1px solid #E6E6E6;
  border-radius:28px;

  padding:30px 22px 34px;
  min-height:340px;

  display:flex;
  align-items:flex-start;
  gap:16px;
}

/* left vertical pill */
.healthScoreCircle{
  width:42px;
  height:78px;
  border-radius:999px;
  border:4px solid #B87333;
  background:#fff;

  display:flex;
  align-items:center;
  justify-content:center;

  font-size:18px;
  font-weight:600;
  color:#111;

  flex-shrink:0;
  box-shadow:0 10px 22px rgba(0,0,0,0.10);
}

/* content area */
.healthScoreContent{
  display:block;
  width:100%;
}

/* heading */


  /* keep title + subtitle like screenshot */
  .healthScoreTitle{
    font-size:18px;
    font-weight:900;
    font-style:italic;
    text-transform:uppercase;
    letter-spacing:-0.25px;
    color:#111;
    margin:2px 0 8px;
    line-height:1.05;
  }

  /* force SCORE on next line (exact layout) */
  .healthScoreTitleBreak{
    display:block;
  }

  /* subtitle */
  .healthScoreDesc{
  font-size:10px;
  font-weight:800;
  font-style:italic;
  text-transform:uppercase;
  letter-spacing:0.18em;
  color:#9C9C9C;
  line-height:1.6;
  margin-top:4px;
  max-width:260px;
}

.healthScoreCard .healthMetrics{
    margin-top:42px !important;
    padding: 0 6px !important;
    width:100% !important;

    display:grid !important;
    grid-template-columns: 1fr 1fr !important;
    column-gap: 34px !important;
    row-gap: 40px !important;
    align-items:start !important;
    margin-left: -25px !important;
  }

  .healthScoreCard .healthMetric{
    min-width:0 !important;
    display:flex !important;
    flex-direction:column !important;
    align-items:center !important;
    text-align:center !important;
  }

  .healthScoreCard .healthMetric.healthMetricChange{
    grid-column: 1 / -1 !important;
    margin-top: 6px !important;
  }

  /* stop overlap */
  .healthScoreCard .healthMetricLabel{
    white-space: normal !important;
    line-height: 1.25 !important;
    width: 100% !important;
    text-align:center !important;
    letter-spacing: 0.14em !important;
    font-size:8px;
  }

.healthMetrics .healthMetric:nth-child(1) .healthMetricValue{
  color:#111;
}

  
}



/* colors exactly like screenshot */
.metricGreen{ color:#00B050; }
.metricOrange{ color:#B87333; }
}


 

.upgradeCTA{
  width: 100%;
  border-radius: 56px;
  padding: 56px 44px 54px;
  margin: 44px 0 72px;

  /* main dark body */
  background: linear-gradient(180deg, #1b1b1b 0%, #141414 100%);
  border: 1px solid rgba(255,255,255,0.07);
  box-shadow: 0 30px 80px rgba(0,0,0,0.35);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;

  position: relative;
  overflow: hidden;
  color: #fff;
}

/* subtle center vertical highlight band (like screenshot) */
.upgradeCTA::before{
  content:"";
  position:absolute;
  top:0;
  bottom:0;
  left:50%;
  width: 260px;
  transform: translateX(-50%);
  background: linear-gradient(
    180deg,
    rgba(255,255,255,0.05),
    rgba(255,255,255,0.02),
    rgba(255,255,255,0.04)
  );
  filter: blur(0px);
  opacity: 0.55;
  pointer-events:none;
}

/* soft corner vignette/glow */
.upgradeCTA::after{
  content:"";
  position:absolute;
  inset:-40px;
  background:
    radial-gradient(520px 260px at 20% 25%, rgba(255,255,255,0.06), transparent 60%),
    radial-gradient(520px 260px at 80% 55%, rgba(255,255,255,0.05), transparent 62%);
  opacity: 0.9;
  pointer-events:none;
}

/* icon */
.ctaIcon{
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  margin-bottom: 14px;
  position: relative;
  z-index: 1;

  color: #B87333;
}

.ctaIconSvg{
  width: 24px;
  height: 24px;
  display: block;
}

/* title */
.ctaTitle{
  position: relative;
  z-index: 1;

  margin: 0 0 14px;
  font-size: 44px;
  font-weight: 900;
  font-style: italic;
  text-transform: uppercase;
  letter-spacing: -1px;
  line-height: 1;
  transform: skewX(-8deg);

  text-shadow:
    0 14px 30px rgba(0,0,0,0.55),
    0 2px 0 rgba(0,0,0,0.35);
}

/* subtitle */
.ctaDesc{
  position: relative;
  z-index: 1;

  max-width: 820px;
  margin: 0 auto 28px;

  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  line-height: 1.75;
  color: rgba(255,255,255,0.55);
}

/* button */
.ctaBtn{
  position: relative;
  z-index: 1;

  height: 48px;
  padding: 0 38px;
  border: none;
  border-radius: 14px;

  background: linear-gradient(90deg, #B8763C 0%, #CFA24A 100%);
  color: #fff;

  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.22em;
  text-transform: uppercase;

  cursor: pointer;
  box-shadow: 0 18px 46px rgba(184,115,51,0.28);
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
}

.ctaBtn:hover{
  transform: translateY(-2px);
  filter: brightness(1.03);
  box-shadow: 0 24px 60px rgba(184,115,51,0.36);
}

.ctaBtn:active{
  transform: translateY(0) scale(0.99);
}

/* mobile */
@media (max-width: 640px){
  .upgradeCTA{
    border-radius: 34px;
    padding: 34px 18px 36px;
  }

  .upgradeCTA::before{
    width: 190px;
    opacity: 0.5;
  }

  .ctaTitle{
    font-size: 28px;
    letter-spacing: -0.6px;
  }

  .ctaDesc{
    font-size: 10px;
    letter-spacing: 0.14em;
    margin-bottom: 20px;
    max-width: 520px;
  }

  .ctaBtn{
    width: 100%;
    max-width: 320px;
  }
}



    @media (max-width: 1024px) {
      .navLinks { display: none; }
      .reportsMain { padding: 40px 28px 60px; }
      .reportsGrid { grid-template-columns: repeat(2, 1fr); }
      .controlsBar { flex-direction: column; align-items: stretch; }
      .searchBox { width: 100%; }
      .healthMetrics { gap: 24px; }
    }

    @media (max-width: 640px) {
      .topNav { padding: 0 16px; }
      .profileMeta { display: none; }
      .reportsMain { padding: 32px 20px 60px; }
      .reportsHeader h1 { font-size: 26px; }
      .reportsStats { flex-direction: column; gap: 16px; }
      .reportsGrid { grid-template-columns: 1fr; }
      

      /* ===== MOBILE FILTER TABS LIKE SCREENSHOT ===== */
.controlsBar{
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
}

/* wrap with arrows */
/* ===== MOBILE: tabs exactly like screenshot ===== */
.filterTabsWrap{
  width: 100%;
}

/* pills row */
.filterTabs{
  display: flex;
  gap: 12px;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  white-space: nowrap;
  padding: 0 2px;
  margin-bottom: 10px;

  /* hide native scrollbar (we use custom rail below) */
  scrollbar-width: none;
}
.filterTabs::-webkit-scrollbar{ display: none; }

.filterTab{
  flex: 0 0 auto;
  padding: 10px 18px;
  background: #fff;
  border: 1px solid #E8E8E8;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 800;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.10em;
}

.filterTab.active{
  background: #1a1a1a;
  color: #fff;
  border-color: #1a1a1a;
}

/* bottom row: left arrow + rail + right arrow */
.tabsBottomRow{
  display: grid;
  grid-template-columns: 18px 1fr 18px;
  align-items: center;
  gap: 10px;
}

.tabArrowBtn{
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  color: #9a9a9a;
  font-size: 16px;
  line-height: 1;
  padding: 0;
  cursor: pointer;
}

.tabsRail{
  height: 10px;
  background: #BDBDBD;
  border-radius: 999px;
  position: relative;
  overflow: hidden;
}

.tabsThumb{
  height: 100%;
  background: #7F7F7F;
  border-radius: 999px;
  position: absolute;
  left: 0;
  top: 0;
  will-change: transform;
}


      
      .ctaTitle { font-size: 22px; }
       /* ✅ Mobile header layout like screenshot */
.reportsHeaderRow{
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}

.reportsHeaderLeft{
  width: 100%;
}

.reportsHeader h1{
  font-size: 34px;
  line-height: 0.95;
  transform: skewX(-8deg);
}

.reportsHeader p{
  font-size: 9px;
  letter-spacing: 0.18em;
  line-height: 1.6;
  max-width: 320px;           /* keeps it neat like screenshot */
}

/* Stats go BELOW subtitle, centered, 2 columns */
/* ===== MOBILE: stats in one row ===== */
.reportsStatsTop{
 display: grid;
  grid-template-columns: 1fr 1fr;   /* 2 tight columns */
  gap: 0;                           /* remove space between */
  margin-top: 14px;
  width: 100%;
}

.reportsStatItem{
  align-items: center;
  text-align: center;
  gap: 6px;
}

.reportsStatLabel{
  font-size: 9px;
  letter-spacing: 0.14em;
  color: #9a9a9a;
}

.reportsStatValue{
  font-size: 22px;
  font-weight: 900;
  margin-top: 4px;
  letter-spacing: -0.3px;
}

/* copper color for right value */
.reportsStatItem:last-child .reportsStatValue{
  color: #B87333;
}

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

      {/* Main Content */}
      <main className="reportsMain">
        {/* Header */}
        <div className="reportsHeader">
  <div className="reportsHeaderRow">
    <div className="reportsHeaderLeft">
      <h1>INTELLIGENCE ARCHIVE</h1>
      <p>MANAGE AND MONITOR ALL YOUR GENERATED PROPERTY ASSESSMENTS</p>
    </div>

    <div className="reportsStats reportsStatsTop">
      <div className="reportsStatItem">
        <div className="reportsStatLabel">TOTAL REPORTS</div>
        <div className="reportsStatValue">{valuations.length}</div>
      </div>

      <div className="reportsStatItem">
        <div className="reportsStatLabel">ACTIVE ASSETS</div>
        <div className="reportsStatValue reportsStatAccent">{fmtAED(totalValue)}</div>
      </div>
    </div>
  </div>
</div>


        {/* Controls Bar */}
        <div className="controlsBar">
          <div className="filterTabsWrap">
  <div className="filterTabs" ref={tabsRef}>
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

  {/* bottom row like screenshot */}
  <div className="tabsBottomRow">
    <button
      type="button"
      className="tabArrowBtn"
      aria-label="Scroll left"
      onClick={() => tabsRef.current?.scrollBy({ left: -160, behavior: "smooth" })}
    >
      ‹
    </button>

    <div className="tabsRail">
      <div
        className="tabsThumb"
        style={{
          width: `${tabThumb.w}px`,
          transform: `translateX(${tabThumb.x}px)`,
        }}
      />
    </div>

    <button
      type="button"
      className="tabArrowBtn"
      aria-label="Scroll right"
      onClick={() => tabsRef.current?.scrollBy({ left: 160, behavior: "smooth" })}
    >
      ›
    </button>
  </div>
</div>

        

          <div className="searchControls">
            <div className="searchBox">
              <svg className="searchIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="searchInput"
                placeholder="Search by building or unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="filterBtn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="16" y2="12" />
                <line x1="11" y1="18" x2="13" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Reports Grid */}
        {reportCards.length === 0 ? (
          <div className="emptyState">
            <div className="emptyIcon">📊</div>
            <div className="emptyTitle">No Reports Found</div>
            <div className="emptyDesc">
              {searchQuery ? "Try adjusting your search criteria" : "Create your first valuation to see it here"}
            </div>
            <button className="emptyBtn" onClick={() => navigate("/valuation")}>
              + CREATE VALUATION
            </button>
          </div>
        ) : (
          <>
            <div className="reportsGrid">
              {reportCards.map((card) => (
                <div
                  key={card.id}
                  className="reportCard"
                  onClick={() => navigate(`/report?id=${card.id}`)}
                >
                  <div className="reportCardHeader">
                    <div className="reportIcon">🏠</div>
                    <div className="reportStatus">
                      <div className={`statusBadge ${
                        card.status === "ACTIVE" ? "statusActive" : 
                        card.status === "EXPIRING" ? "statusExpiring" : "statusExpired"
                      }`}>
                        {card.status}
                      </div>
                      <div className="reportDate">{card.date}</div>
                    </div>
                  </div>

                  <div className="reportTitle">{card.title}</div>
                  <div className="reportUnit">{card.unitInfo || `UNIT ${String(card.id).slice(0, 4)}`}</div>

                  <div className="reportMeta">
                    <div className="reportMetaItem">
                      <div className="reportMetaLabel">ASSET VALUE</div>
                      <div className="reportMetaValue">{fmtAED(card.value)}</div>
                    </div>
                    <div className="reportMetaItem" style={{ alignItems: "flex-end" }}>
                      <div className="reportMetaLabel">TYPE</div>
                      <div className="reportMetaType">{card.badge}</div>
                    </div>
                  </div>

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

            {/* Archive Health Score */}
            {/* Archive Health Score */}
<div className="healthScoreCard">
  <div className="healthScoreCircle">{healthMetrics.score}</div>

  <div className="healthScoreContent">
    <div className="healthScoreText">
     <div className="healthScoreTitle">
  ARCHIVE HEALTH <span className="healthScoreTitleBreak">SCORE</span>
</div>

      <div className="healthScoreDesc">
  BASED ON YOUR PORTFOLIO'S<br/>
  INVESTMENT GRADE<br/>
  DISTRIBUTION
</div>

    </div>

    <div className="healthMetrics">
      <div className="healthMetric">
        <div className="healthMetricValue metricGreen">{healthMetrics.investmentReady}%</div>
        <div className="healthMetricLabel">INVESTMENT READY</div>
      </div>

      <div className="healthMetric">
        <div className="healthMetricValue metricOrange">{healthMetrics.needsAttention}%</div>
        <div className="healthMetricLabel">NEEDS ATTENTION</div>
      </div>

      <div className="healthMetric healthMetricChange">
        <div className="healthMetricValue metricGreen">+{healthMetrics.validChange}%</div>
        <div className="healthMetricLabel">VALUE CHANGE</div>
      </div>
    </div>
  </div>
</div>

          </>
        )}

 {/* Upgrade CTA (desktop + mobile responsive like your screenshot) */}
<div
  className="upgradeCTA"
  style={{
    width: "100%",
    borderRadius: 56,
    padding: "56px 44px 54px",
    margin: "44px 0 72px",
    background: "linear-gradient(180deg, #1b1b1b 0%, #121212 100%)",
    border: "1px solid rgba(255,255,255,0.07)",
    boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    position: "relative",
    overflow: "hidden",
    color: "#fff",
    isolation: "isolate",
  }}
>
  {/* ✅ MOBILE OVERRIDES (only affects this component) */}
  <style>{`
    @media (max-width: 520px){
      .upgradeCTA{
        border-radius: 40px !important;
        padding: 34px 18px 28px !important;
        margin: 22px 0 34px !important;
        min-height: 420px;
      }
      .upgradeCTA .ctaIconWrap{
        width: 54px !important;
        height: 54px !important;
        border-radius: 18px !important;
        margin-bottom: 14px !important;
      }
      .upgradeCTA .ctaTitle{
        font-size: 30px !important;
        line-height: 1.05 !important;
        letter-spacing: -0.02em !important;
        margin-bottom: 14px !important;
        transform: skewX(-8deg) !important;
      }
      .upgradeCTA .ctaDesc{
        font-size: 12px !important;
        letter-spacing: 0.12em !important;
        line-height: 1.7 !important;
        max-width: 280px !important;
        margin-bottom: 22px !important;
        color: rgba(255,255,255,0.80) !important;
      }
      .upgradeCTA .ctaBtn{
        width: 88% !important;
        max-width: 280px !important;
        height: 64px !important;
        border-radius: 18px !important;
        font-size: 11px !important;
        letter-spacing: 0.22em !important;
        padding: 0 18px !important;
        white-space: normal !important;
        line-height: 1.2 !important;
      }
      .upgradeCTA .ctaBtn span{
        display:block;
      }
    }
  `}</style>

  {/* premium glows */}
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(1200px 420px at 50% 10%, rgba(255,255,255,0.06), transparent 60%), radial-gradient(900px 360px at 15% 70%, rgba(184,115,51,0.10), transparent 60%), radial-gradient(900px 360px at 85% 75%, rgba(255,255,255,0.05), transparent 62%)",
      pointerEvents: "none",
      zIndex: 0,
    }}
  />

  {/* subtle top highlight */}
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      height: 140,
      background: "linear-gradient(180deg, rgba(255,255,255,0.06), transparent)",
      opacity: 0.65,
      pointerEvents: "none",
      zIndex: 0,
    }}
  />

  {/* icon */}
  <div
    className="ctaIconWrap"
    style={{
      width: 52,
      height: 52,
      display: "grid",
      placeItems: "center",
      marginBottom: 14,
      zIndex: 1,
      borderRadius: 16,
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
      backdropFilter: "blur(8px)",
    }}
  >
    <svg viewBox="0 0 24 24" style={{ width: 50, height: 50, color: "#B87333" }}>
      <path
        d="M12 6.5c-3.3 0-6 2.2-6 5.3 0 2.6 2.2 4.6 5 4.6 2.4 0 4.3-1.6 4.3-3.6 0-1.7-1.5-3-3.3-3-1.5 0-2.7.9-2.7 2.1 0 1 1 1.7 2.1 1.7.9 0 1.6-.5 1.6-1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>

  {/* title */}
  <div
    className="ctaTitle"
    style={{
      zIndex: 1,
      margin: "0 0 14px",
      fontSize: 44,
      fontWeight: 900,
      fontStyle: "italic",
      textTransform: "uppercase",
      letterSpacing: "-1px",
      lineHeight: 1,
      transform: "skewX(-8deg)",
      textShadow: "0 14px 30px rgba(0,0,0,0.55), 0 2px 0 rgba(0,0,0,0.35)",
    }}
  >
    NEED DEEPER <br /> INSIGHTS?
  </div>

  {/* desc */}
  <div
    className="ctaDesc"
    style={{
      zIndex: 1,
      maxWidth: 820,
      margin: "0 auto 28px",
      fontSize: 12,
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.18em",
      lineHeight: 1.75,
      color: "rgba(255,255,255,0.88)",
    }}
  >
    UPGRADE ANY VALUCHECK™ REPORT TO DEALLENS™ FOR BANK-GRADE PRECISION AND PREDICTIVE MODELING.
  </div>

  {/* button */}
  <button
    type="button"
    className="ctaBtn"
    style={{
      zIndex: 1,
      height: 50,
      padding: "0 38px",
      border: "1px solid rgba(255,255,255,0.10)",
      borderRadius: 14,
      background: "linear-gradient(90deg, #B8763C 0%, #CFA24A 100%)",
      color: "#fff",
      fontSize: 10,
      fontWeight: 900,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      cursor: "pointer",
      boxShadow: "0 18px 46px rgba(184,115,51,0.28)",
      transition: "transform 160ms ease, box-shadow 160ms ease, filter 160ms ease",
      outline: "none",
    }}
  >
    {/* ✅ makes 2-line button on mobile */}
    <span>EXPLORE PREMIUM</span>
    <span>ANALYSIS</span>
  </button>
</div>



      </main>

      <Footer />
    </>
  );
}
