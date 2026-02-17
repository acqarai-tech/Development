// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   Line,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
// } from "recharts";

// const RAW_API = process.env.REACT_APP_AVM_API;
// const API = RAW_API ? RAW_API.replace(/\/+$/, "") : "";

// const LS_FORM_KEY = "truvalu_formData_v1";
// const LS_REPORT_KEY = "truvalu_reportData_v1";
// const LS_VAL_ROW_ID = "truvalu_valuation_row_id";

// function safeParse(json) {
//   try {
//     return JSON.parse(json);
//   } catch {
//     return null;
//   }
// }

// function fmtAED(x) {
//   const n = Number(x);
//   if (!Number.isFinite(n)) return "—";
//   return `AED ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
// }
// function fmtNum(x, d = 0) {
//   const n = Number(x);
//   if (!Number.isFinite(n)) return "—";
//   return n.toLocaleString(undefined, { maximumFractionDigits: d });
// }
// function fmtDate(iso) {
//   if (!iso) return "—";
//   const s = String(iso).slice(0, 10);
//   const d = new Date(s);
//   if (Number.isNaN(d.getTime())) return s;
//   return d.toLocaleDateString(undefined, {
//     day: "2-digit",
//     month: "short",
//     year: "numeric",
//   });
// }
// function monthLabel(yyyyMm) {
//   if (!yyyyMm) return "";
//   const [y, m] = String(yyyyMm).split("-");
//   const d = new Date(Number(y), Number(m) - 1, 1);
//   if (Number.isNaN(d.getTime())) return String(yyyyMm);
//   return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
// }
// function normalizeRooms(x) {
//   if (x === null || x === undefined) return "";
//   const s = String(x);
//   const m = s.match(/\d+/);
//   return m ? `${m[0]} Bedrooms` : s;
// }
// function fmtPct(x, d = 0) {
//   const n = Number(x);
//   if (!Number.isFinite(n)) return "—";
//   return `${n.toFixed(d)}%`;
// }
// function sqmToSqft(sqm) {
//   const n = Number(sqm);
//   if (!Number.isFinite(n)) return null;
//   return n * 10.763910416709722;
// }
// function aedPerSqftFromAedPerSqm(aedPerSqm) {
//   const n = Number(aedPerSqm);
//   if (!Number.isFinite(n)) return null;
//   return n / 10.763910416709722;
// }

// /* ✅ HEADER (logo only) - unchanged */
// function HeaderLite() {
//   const navigate = useNavigate();
//   return (
//     <>
//       <header className="acqHdrLite">
//         <div className="acqHdrLiteInner">
//           <div
//             className="acqHdrLogo"
//             onClick={() => navigate("/")}
//             role="button"
//             tabIndex={0}
//             onKeyDown={(e) => {
//               if (e.key === "Enter" || e.key === " ") navigate("/");
//             }}
//             aria-label="Go to landing page"
//             title="ACQAR"
//           >
//             <h1>ACQAR</h1>
//           </div>
//         </div>
//       </header>
//       <div className="acqHdrLiteSpacer" />
//     </>
//   );
// }

// /* ✅ FOOTER - unchanged (your footer code) */
// function Footer() {
//   const cols = [
//     [
//       "PRODUCT",
//       [
//         "TruValu™ Products",
//         "ValuCheck™ (FREE)",
//         "DealLens™",
//         "InvestIQ™",
//         "CertiFi™",
//         "Compare Tiers",
//       ],
//     ],
//     ["COMPANY", ["About ACQAR", "How It Works", "Pricing", "Contact Us", "Partners", "Press Kit"]],
//     ["RESOURCES", ["Help Center", "Market Reports", "Blog Column 5", "Comparisons"]],
//     ["COMPARISONS", ["vs Bayut TruEstimate", "vs Property Finder", "vs Traditional Valuers", "Why ACQAR?"]],
//   ];

//   return (
//     <>
//       <style>{`
//         .acq-footer { background:#F9F9F6; border-top:1px solid #EBEBEB; padding:56px 0 0; font-family:Inter,sans-serif; }
//         .acq-footer-grid { max-width:80rem; margin:0 auto; padding:0 2rem; display:grid; grid-template-columns:1.35fr 1fr 1fr 1fr 1fr; gap:48px; align-items:start; padding-bottom:48px; }
//         .acq-brand-name { font-size:1rem; font-weight:900; letter-spacing:.04em; text-transform:uppercase; color:#2B2B2B; display:block; margin-bottom:14px; }
//         .acq-brand-desc { font-size:.75rem; color:rgba(43,43,43,.58); line-height:1.75; margin:0 0 18px; max-width:240px; }
//         .acq-rics-badge { display:inline-flex; align-items:center; gap:7px; padding:7px 12px; background:#fff; border:1px solid #EBEBEB; border-radius:8px; margin-bottom:20px; }
//         .acq-rics-badge svg { flex-shrink:0; color:#2B2B2B; }
//         .acq-rics-badge span { font-size:.5625rem; font-weight:800; color:rgba(43,43,43,.82); text-transform:uppercase; letter-spacing:.08em; white-space:nowrap; }
//         .acq-social-row { display:flex; gap:10px; }
//         .acq-social-btn { width:34px; height:34px; border-radius:50%; border:1px solid #E5E7EB; display:flex; align-items:center; justify-content:center; color:rgba(43,43,43,.38); text-decoration:none; transition:color .18s, border-color .18s; background:transparent; cursor:pointer; }
//         .acq-social-btn:hover { color:#B87333; border-color:#B87333; }
//         .acq-col-title { font-size:.75rem; font-weight:800; text-transform:uppercase; letter-spacing:.16em; color:#2B2B2B; margin:0 0 20px; }
//         .acq-link-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:13px; }
//         .acq-link-item { font-size:.8125rem; color:rgba(43,43,43,.55); font-weight:400; cursor:pointer; transition:color .16s; line-height:1.4; }
//         .acq-link-item:hover { color:#B87333; }
//         .acq-divider { max-width:80rem; margin:0 auto; padding:0 2rem; }
//         .acq-divider hr { border:none; border-top:1px solid #E5E7EB; margin:0; }
//         .acq-footer-bottom { max-width:80rem; margin:0 auto; padding:18px 2rem 28px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
//         .acq-copy p { font-size:.5625rem; font-weight:800; color:rgba(43,43,43,.38); text-transform:uppercase; letter-spacing:.12em; margin:0 0 3px; }
//         .acq-copy small { font-size:.5rem; color:rgba(43,43,43,.28); text-transform:uppercase; letter-spacing:.08em; display:block; }
//         .acq-legal { display:flex; align-items:center; gap:28px; flex-wrap:wrap; justify-content:flex-end; }
//         .acq-legal a { font-size:.5625rem; font-weight:800; color:rgba(43,43,43,.38); text-transform:uppercase; letter-spacing:.12em; text-decoration:none; white-space:nowrap; transition:color .16s; }
//         .acq-legal a:hover { color:#2B2B2B; }
//         @media (max-width:1024px){ .acq-footer-grid{ grid-template-columns:1fr 1fr 1fr; gap:32px; } .acq-brand-col{ grid-column:1/-1; } .acq-brand-desc{ max-width:100%; } }
//         @media (max-width:640px){ .acq-footer-grid{ grid-template-columns:1fr 1fr; gap:28px; padding:0 1rem 40px; } .acq-brand-col{ grid-column:1/-1; } .acq-footer-bottom{ flex-direction:column; align-items:center; text-align:center; gap:14px; padding:18px 1rem 28px; } .acq-legal{ justify-content:center; gap:18px; } .acq-divider{ padding:0 1rem; } }
//         @media (max-width:420px){ .acq-footer-grid{ grid-template-columns:1fr; } }
//       `}</style>

//       <footer className="acq-footer">
//         <div className="acq-footer-grid">
//           <div className="acq-brand-col">
//             <span className="acq-brand-name">ACQAR</span>
//             <p className="acq-brand-desc">
//               The world's first AI-powered property intelligence platform for Dubai real estate.
//               Independent, instant, investment-grade.
//             </p>

//             <div className="acq-rics-badge">
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
//                 <polyline points="9 12 11 14 15 10" />
//               </svg>
//               <span>RICS-Aligned Intelligence</span>
//             </div>

//             <div className="acq-social-row">
//               <a href="https://www.linkedin.com/company/acqar" target="_blank" rel="noopener noreferrer" className="acq-social-btn" aria-label="LinkedIn">
//                 <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5S1.1 1 2.48 1c1.38 0 2.5 1.12 2.5 2.5zM0 8h5v16H0V8zm7.5 0h4.8v2.2h.1c.67-1.2 2.3-2.4 4.73-2.4C22.2 7.8 24 10.2 24 14.1V24h-5v-8.5c0-2-.04-4.6-2.8-4.6-2.8 0-3.2 2.2-3.2 4.4V24h-5V8z" />
//                 </svg>
//               </a>
//             </div>
//           </div>

//           {cols.map(([title, items]) => (
//             <div key={title}>
//               <h6 className="acq-col-title">{title}</h6>
//               <ul className="acq-link-list">
//                 {items.map((item) => (
//                   <li key={item} className="acq-link-item">{item}</li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>

//         <div className="acq-divider"><hr /></div>

//         <div className="acq-footer-bottom">
//           <div className="acq-copy">
//             <p>© 2025 ACQARLABS L.L.C-FZ. All rights reserved.</p>
//             <small>TruValu™ is a registered trademark.</small>
//           </div>
//           <nav className="acq-legal">
//             {["Legal links", "Terms", "Privacy", "Cookies", "Security"].map((l) => (
//               <a key={l} href="#">{l}</a>
//             ))}
//           </nav>
//         </div>
//       </footer>
//     </>
//   );
// }

// export default function Report() {
//   const navigate = useNavigate();
//   const [sp] = useSearchParams();
//   const valuationId = sp.get("id");

//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   const [formData, setFormData] = useState(() => safeParse(localStorage.getItem(LS_FORM_KEY)) || {});
//   const [reportData, setReportData] = useState(() => safeParse(localStorage.getItem(LS_REPORT_KEY)) || null);

//   const [valRow, setValRow] = useState(null);
//   const savedRef = useRef(false);

//   const location = useLocation();

//   useEffect(() => {
//     window.scrollTo({ top: 0, left: 0, behavior: "auto" });
//   }, [location.pathname]);

//   const headerInitials = useMemo(() => {
//     const nm =
//       (formData?.name ||
//         formData?.full_name ||
//         formData?.customer_name ||
//         formData?.email ||
//         "ACQAR") + "";
//     const parts = nm.trim().split(/\s+/).filter(Boolean);
//     const a = (parts[0]?.[0] || "A").toUpperCase();
//     const b = (parts[1]?.[0] || "M").toUpperCase();
//     return (a + b).slice(0, 2);
//   }, [formData]);

//   useEffect(() => {
//     let alive = true;

//     async function loadValuation() {
//       try {
//         if (!valuationId) return;

//         setErr("");
//         setLoading(true);

//         const { data, error } = await supabase
//           .from("valuations")
//           .select("id, form_payload, estimated_valuation, created_at, updated_at")
//           .eq("id", valuationId)
//           .single();

//         if (!alive) return;

//         if (error) throw error;
//         if (!data?.form_payload) throw new Error("This valuation has no saved form_payload.");

//         setValRow(data);
//         setFormData(data.form_payload);
//         localStorage.setItem(LS_VAL_ROW_ID, String(data.id));
//       } catch (e) {
//         if (!alive) return;
//         setErr(e?.message || "Failed to load valuation");
//       } finally {
//         if (!alive) return;
//         setLoading(false);
//       }
//     }

//     loadValuation();
//     return () => { alive = false; };
//   }, [valuationId]);

//   useEffect(() => {
//     if (valuationId) return;
//     const storedForm = safeParse(localStorage.getItem(LS_FORM_KEY));
//     if (storedForm) setFormData(storedForm);
//   }, [valuationId]);

//   useEffect(() => {
//     let mounted = true;

//     async function run() {
//       try {
//         setErr("");
//         setLoading(true);

//         if (!API) throw new Error("REACT_APP_AVM_API is missing. Please set it in your frontend .env and restart npm.");
//         if (!formData || Object.keys(formData).length === 0) throw new Error("No form data found for this report.");

//         const res = await fetch(`${API}/predict_with_comparables`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ data: formData }),
//         });

//         const json = await res.json();
//         if (!res.ok) {
//           const msg = json?.detail || json?.message || `Request failed (${res.status})`;
//           throw new Error(msg);
//         }

//         if (!mounted) return;

//         setReportData(json);

//         if (!valuationId) localStorage.setItem(LS_REPORT_KEY, JSON.stringify(json));

//         if (!savedRef.current) {
//           const valuationRowId = localStorage.getItem(LS_VAL_ROW_ID);
//           const est = Number(json?.total_valuation);

//           if (valuationRowId && Number.isFinite(est)) {
//             savedRef.current = true;

//             const { error: upErr } = await supabase
//               .from("valuations")
//               .update({ estimated_valuation: est, updated_at: new Date().toISOString() })
//               .eq("id", valuationRowId);

//             if (upErr) {
//               console.error("Failed to update estimated valuation:", upErr);
//               savedRef.current = false;
//             }
//           }
//         }
//       } catch (e) {
//         if (!mounted) return;
//         setErr(e?.message || "Something went wrong");
//       } finally {
//         if (!mounted) return;
//         setLoading(false);
//       }
//     }

//     run();
//     return () => { mounted = false; };
//   }, [formData, valuationId]);

//   const comps5 = useMemo(() => (reportData?.comparables || []).slice(0, 5), [reportData]);

//   const trendSeries = useMemo(() => {
//     const t = reportData?.charts?.trend || [];
//     const area = Number(reportData?.procedure_area || formData?.procedure_area || 0) || 0;
//     const propertyTotal = Number(reportData?.predicted_meter_sale_price || 0) * area;

//     return t.slice(-60).map((r) => {
//       const marketPpm2 = Number(r.median_price_per_sqm);
//       const marketTotal = Number.isFinite(marketPpm2) ? marketPpm2 * area : null;
//       return {
//         month: r.month,
//         label: monthLabel(r.month),
//         property_total: Number.isFinite(propertyTotal) ? propertyTotal : null,
//         market_total: Number.isFinite(marketTotal) ? marketTotal : null,
//       };
//     });
//   }, [reportData, formData]);

//   const factorWeights = useMemo(
//     () => [
//       { name: "Location", value: 25 },
//       { name: "Property Type", value: 20 },
//       { name: "Condition", value: 15 },
//       { name: "Age", value: 15 },
//       { name: "Proximity", value: 15 },
//       { name: "Amenities", value: 10 },
//     ],
//     []
//   );

//   const PIE_COLORS = ["#1d4ed8", "#10b981", "#f59e0b", "#8b5cf6", "#0ea5e9", "#e11d48"];

//   const goBack = () => navigate("/valuation");

//   const areaName = formData?.area_name_en || "—";
//   const subArea = formData?.sub_area_en || formData?.community_en || "";
//   const projectName = formData?.project_name_en || formData?.building_name_en || "—";
//   const propertyType = formData?.property_type_en || "Property";

//   const totalVal = Number(reportData?.total_valuation);
//   const rateSqm = Number(reportData?.predicted_meter_sale_price);
//   const rateSqft = aedPerSqftFromAedPerSqm(rateSqm);

//   const band = 0.15;
//   const rangeLow = Number.isFinite(Number(reportData?.range_low))
//     ? Number(reportData?.range_low)
//     : Number.isFinite(totalVal)
//     ? totalVal * (1 - band)
//     : null;

//   const rangeHigh = Number.isFinite(Number(reportData?.range_high))
//     ? Number(reportData?.range_high)
//     : Number.isFinite(totalVal)
//     ? totalVal * (1 + band)
//     : null;

//   const compsCount = Number(reportData?.comparables_meta?.count ?? (reportData?.comparables || []).length);
//   const confidencePct = Number.isFinite(Number(reportData?.confidence_pct))
//     ? Number(reportData?.confidence_pct)
//     : compsCount >= 10
//     ? 95
//     : compsCount >= 5
//     ? 90
//     : compsCount >= 1
//     ? 82
//     : 70;

//   const sqm = Number(reportData?.procedure_area ?? formData?.procedure_area ?? 0);
//   const sqft = sqmToSqft(sqm);

//   const modelName = reportData?.model_name || "XGBoost + K-Nearest Neighbors";
//   const modelAcc = reportData?.model_accuracy || "94.2%";
//   const modelUpdated = reportData?.model_updated || "2026-01-23";

//   const UI_CSS = `
//     :root{
//       --acq-text: #2B2B2B;
//       --acq-accent: #B87333;
//       --acq-border: #E5E5E5;
//       --acq-bg: #FFFFFF;
//       --muted: rgba(43,43,43,.55);
//       --soft: rgba(184,115,51,.10);
//     }

//     body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }

//     .reportPage{ width:100%; overflow-x:hidden; background:#FAFAFA; color:var(--acq-text); }

//     .acqHdrLite{ position:fixed; top:0; left:0; right:0; z-index:60; background:#fff; border-bottom:1px solid var(--acq-border); }
//     .acqHdrLiteInner{ max-width:80rem; margin:0 auto; height:64px; display:flex; align-items:center; padding:0 20px; }
//     .acqHdrLogo h1{ margin:0; font-size:20px; font-weight:900; letter-spacing:-0.04em; text-transform:uppercase; color:var(--acq-text); cursor: pointer; }
//     .acqHdrLiteSpacer{ height:64px; }

//     .vcMain{ max-width:1200px; margin:0 auto; padding:40px 20px 60px; }

//     /* Header Section */
//     .vcHeader{ margin-bottom:0; padding-bottom:24px; border-bottom:1px solid var(--acq-border); }
//     .vcTitle{ margin:0 0 8px; font-size:32px; line-height:1.2; font-weight:700; letter-spacing:-0.02em; color:#2B2B2B; }
//     .vcMeta{ display:flex; flex-wrap:wrap; gap:8px; color:rgba(43,43,43,.5); font-weight:400; font-size:13px; align-items:center; margin-bottom:12px; }
//     .vcDot{ width:3px; height:3px; border-radius:50%; background:rgba(43,43,43,.3); display:inline-block; }

//     .vcHeaderRow{ display:flex; gap:24px; flex-wrap:wrap; margin-top:12px; }
//     .vcMini{ display:flex; flex-direction:column; gap:2px; }
//     .vcMini span:first-child{ font-size:10px; font-weight:600; letter-spacing:.05em; text-transform:uppercase; color:rgba(43,43,43,.4); }
//     .vcMini span:last-child{ font-size:11px; font-weight:600; font-family: ui-monospace, monospace; color:#2B2B2B; }

//     /* Two Column Layout */
//     .vcSectionGrid{ display:grid; grid-template-columns: 1fr 1fr; gap:32px; margin-top:32px; padding-top:32px; border-top:1px solid #F0F0F0; }
//     .vcSmallTitle{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 16px; }

//     /* Left Column - Value */
//     .vcValueBig{ font-size:48px; font-weight:700; letter-spacing:-0.02em; margin:0; color:#2B2B2B; }
//     .vcValueSub{ font-size:13px; color:rgba(43,43,43,.5); font-weight:400; margin-top:6px; }

//     .vcBar{ height:8px; background:#F5F5F5; border-radius:4px; overflow:hidden; display:flex; margin-top:20px; }
//     .vcBar > div{ height:100%; }
//     .vcBarLow{ width:25%; background:#E5E5E5; }
//     .vcBarMid{ width:50%; background:#B87333; }
//     .vcBarHigh{ width:25%; background:#E5E5E5; }

//     .vcRange{ display:grid; grid-template-columns: 1fr 1fr 1fr; margin-top:12px; font-size:11px; font-weight:600; }
//     .vcRange div{ font-family: ui-monospace, monospace; }
//     .vcRange small{ display:block; font-size:9px; color:rgba(43,43,43,.4); font-weight:600; letter-spacing:.08em; margin-bottom:4px; text-transform:uppercase; }
//     .vcRangeMid{ text-align:center; }
//     .vcRangeRight{ text-align:right; }

//     .vcTip{ margin-top:20px; padding:12px 14px; background:#FAFAF8; border:1px solid #F0F0F0; display:flex; gap:10px; align-items:flex-start; border-radius:6px; }
//     .vcTip .material-symbols-outlined{ color:var(--acq-accent); font-size:16px; flex-shrink:0; }
//     .vcTip p{ margin:0; font-size:12px; color:rgba(43,43,43,.6); line-height:1.5; }

//     /* Right Column - Chart */
//     .vcChartBox{ }
//     .vcChartHeader{ display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
//     .vcGrowthBadge{ font-size:10px; font-weight:700; padding:4px 10px; border-radius:4px; border:1px solid #86EFAC; background:#F0FDF4; color:#15803D; text-transform:uppercase; letter-spacing:.05em; }
//     .vcChartCard{ height:280px; width:100%; background:#FAFAFA; border-radius:6px; padding:16px; }

//     /* Comparables Cards */
//     .vcCardsHead{ display:flex; justify-content:space-between; align-items:center; margin-top:48px; margin-bottom:16px; }
//     .vcCardsTitle{ margin:0; }
//     .vcCardsSubtitle{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 4px; }
//     .vcCardsMainTitle{ font-size:18px; font-weight:700; margin:0; color:#2B2B2B; }
//     .vcUnlockBtn{ border:none; background:transparent; color:#B87333; font-weight:700; font-size:11px; letter-spacing:.05em; text-transform:uppercase; border-bottom:1.5px solid #B87333; padding:0 0 4px; cursor:pointer; transition:opacity .2s; }
//     .vcUnlockBtn:hover{ opacity:0.7; }

//     .vcCards{ display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; }
//     .vcCard{ border:1px solid #E8E8E8; padding:16px; border-radius:8px; background:#FFFFFF; transition:all .2s; }
//     .vcCard:hover{ border-color:#B87333; box-shadow:0 2px 8px rgba(0,0,0,.04); }
//     .vcTagRow{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
//     .vcTag{ font-size:9px; font-weight:700; color:#2563EB; background:#EFF6FF; border:1px solid #DBEAFE; padding:3px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:.08em; }
//     .vcWhen{ font-size:10px; color:rgba(43,43,43,.4); font-weight:600; font-family: ui-monospace, monospace; }
//     .vcCardTitle{ font-size:15px; font-weight:700; margin:0 0 4px; color:#2B2B2B; }
//     .vcCardSub{ font-size:11px; color:rgba(43,43,43,.5); margin:0 0 16px; font-weight:400; }
//     .vcCardBottom{ display:flex; justify-content:space-between; align-items:flex-end; gap:12px; border-top:1px solid #F5F5F5; padding-top:12px; }
//     .vcSoldLabel{ font-size:9px; color:rgba(43,43,43,.4); font-weight:600; letter-spacing:.08em; text-transform:uppercase; margin:0 0 4px; }
//     .vcSoldPrice{ font-size:18px; font-weight:700; font-family: ui-monospace, monospace; margin:0; color:#2B2B2B; }
//     .vcSize{ font-size:11px; color:rgba(43,43,43,.45); font-weight:600; font-family: ui-monospace, monospace; text-align:right; }

//     /* Macro Market Context */
//     .vcMacroSection{ margin-top:48px; }
//     .vcMacroGrid{ display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; margin-top:16px; }
//     .vcMacroCard{ background:#FFFFFF; border:1px solid #E8E8E8; padding:16px; border-radius:8px; }
//     .vcMacroLabel{ font-size:9px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 8px; }
//     .vcMacroValue{ font-size:24px; font-weight:700; margin:0; color:#2B2B2B; }
//     .vcMacroSub{ font-size:11px; color:rgba(43,43,43,.5); margin:4px 0 0; font-weight:400; }

//     /* Feedback Section */
//     .vcFeedback{ margin-top:48px; background:#FAFAF8; border:1px solid #F0F0F0; border-radius:8px; padding:20px 24px; }
//     .vcFeedbackHeader{ display:flex; align-items:center; gap:12px; margin-bottom:16px; }
//     .vcRewardBadge{ font-size:9px; font-weight:700; color:#B87333; background:#FEF3E7; border:1px solid #F0D9C0; padding:4px 10px; border-radius:4px; text-transform:uppercase; letter-spacing:.08em; display:inline-flex; align-items:center; gap:6px; }
//     .vcFeedbackTitle{ font-size:18px; font-weight:700; font-style:italic; margin:0; color:#2B2B2B; }
//     .vcFeedbackText{ font-size:12px; color:rgba(43,43,43,.6); line-height:1.5; margin:0 0 16px; }
//     .vcFeedbackText a{ color:#B87333; text-decoration:underline; font-weight:600; }
//     .vcFeedbackBtns{ display:flex; gap:10px; }
//     .vcFeedbackBtn{ padding:8px 16px; border:1px solid #E5E5E5; background:#FFFFFF; border-radius:6px; font-size:11px; font-weight:600; color:rgba(43,43,43,.6); cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:6px; }
//     .vcFeedbackBtn:hover{ border-color:#B87333; color:#B87333; }

//     /* Bottom Actions */
//     .vcBottomSection{ margin-top:48px; }
//     .vcShareSection{ background:#FAFAFA; border:1px solid #E8E8E8; border-radius:8px; padding:20px; margin-bottom:24px; }
//     .vcShareLabel{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 12px; }
//     .vcShareRow{ display:flex; gap:12px; }
//     .vcShareInput{ flex:1; padding:10px 14px; border:1px solid #E5E5E5; border-radius:6px; font-size:12px; font-family:ui-monospace, monospace; background:#FFFFFF; color:rgba(43,43,43,.7); }
//     .vcCopyBtn{ padding:10px 20px; background:#B87333; color:#FFFFFF; border:none; border-radius:6px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; cursor:pointer; transition:background .2s; }
//     .vcCopyBtn:hover{ background:#A06229; }

//     .vcFooterInfo{ display:grid; grid-template-columns: 1fr 1fr 1fr; gap:24px; }
//     .vcInfoBox{ }
//     .vcInfoTitle{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 8px; }
//     .vcInfoContent{ font-size:12px; color:rgba(43,43,43,.7); line-height:1.6; margin:0; }
//     .vcInfoList{ list-style:none; padding:0; margin:0; }
//     .vcInfoList li{ font-size:12px; color:rgba(43,43,43,.7); margin-bottom:4px; padding-left:12px; position:relative; }
//     .vcInfoList li:before{ content:'•'; position:absolute; left:0; color:rgba(43,43,43,.3); }

//     .vcActions{ margin-top:32px; padding-top:24px; border-top:1px solid #E8E8E8; display:flex; justify-content:space-between; gap:14px; flex-wrap:wrap; align-items:center; }
//     .vcBtn{ padding:12px 20px; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; border-radius:6px; cursor:pointer; transition:all .2s; }
//     .vcBtnPrimary{ background:#2B2B2B; color:#fff; border:1px solid #2B2B2B; }
//     .vcBtnPrimary:hover{ background:#000; border-color:#000; }
//     .vcBtnGhost{ background:#fff; color:#2B2B2B; border:1px solid #E5E5E5; }
//     .vcBtnGhost:hover{ background:#FAFAFA; border-color:#2B2B2B; }

//     @media (max-width: 1024px){
//       .vcSectionGrid{ grid-template-columns:1fr; gap:32px; }
//       .vcCards{ grid-template-columns: 1fr; }
//       .vcMacroGrid{ grid-template-columns: repeat(2, 1fr); }
//       .vcFooterInfo{ grid-template-columns: 1fr; }
//       .vcTitle{ font-size:28px; }
//     }

//     @media (max-width: 640px){
//       .vcValueBig{ font-size:36px; }
//       .vcMacroGrid{ grid-template-columns: 1fr; }
//     }
//   `;

//   return (
//     <div className="reportPage">
//       <style>{UI_CSS}</style>

//       <HeaderLite />

//       <main className="vcMain">
//         {/* PROPERTY HEADER */}
//         <section className="vcHeader">
//           <h1 className="vcTitle">{projectName}</h1>

//           <div className="vcMeta">
//             <span>{normalizeRooms(formData?.rooms_en) || "—"}</span>
//             <span className="vcDot" />
//             <span>{sqft ? `${fmtNum(sqft, 0)} SQFT` : "—"}</span>
//             <span className="vcDot" />
//             <span>
//               📍 {areaName}{subArea ? `, ${subArea}` : ""}
//             </span>
//           </div>

//           <div className="vcHeaderRow">
//             {/* <div className="vcMini">
//               <span>Report ID</span>
//               <span>
//                 {valuationId ? String(valuationId).slice(0, 13) : "—"}
//               </span>
//             </div> */}
//             <div className="vcMini">
//               <span>Generated On</span>
//               <span>
//                 {fmtDate(valRow?.created_at || reportData?.created_at || new Date().toISOString())}
//               </span>
//             </div>
//           </div>
//         </section>

//         {/* LOADING / ERROR / CONTENT */}
//         {loading ? (
//           <div style={{ marginTop: 32, border: "1px solid #E8E8E8", background: "#fff", padding: 24, borderRadius: 8 }}>
//             <div style={{ fontWeight: 700, marginBottom: 8 }}>Loading report…</div>
//             <div style={{ color: "rgba(43,43,43,.55)" }}>Generating prediction and fetching comparables</div>
//           </div>
//         ) : err ? (
//           <div style={{ marginTop: 32, border: "1px solid #E8E8E8", background: "#fff", padding: 24, borderRadius: 8 }}>
//             <div style={{ fontWeight: 700, marginBottom: 8 }}>Error</div>
//             <div style={{ color: "rgba(43,43,43,.7)" }}>{err}</div>
//           </div>
//         ) : (
//           <>
//             {/* VALUE + TREND */}
//             <section className="vcSectionGrid">
//               <div>
//                 <h2 className="vcSmallTitle">Estimated Market Value</h2>

//                 <p className="vcValueBig">{fmtAED(reportData?.total_valuation)}</p>
//                 <div className="vcValueSub">± {fmtPct(confidencePct, 0)} Confidence</div>

//                 <div className="vcBar">
//                   <div className="vcBarLow" />
//                   <div className="vcBarMid" />
//                   <div className="vcBarHigh" />
//                 </div>

//                 <div className="vcRange">
//                   <div>
//                     <small>Low</small>
//                     {rangeLow ? fmtAED(rangeLow) : "—"}
//                   </div>
//                   <div className="vcRangeMid">
//                     <small>Most Likely</small>
//                     {Number.isFinite(totalVal) ? fmtAED(totalVal) : "—"}
//                   </div>
//                   <div className="vcRangeRight">
//                     <small>High</small>
//                     {rangeHigh ? fmtAED(rangeHigh) : "—"}
//                   </div>
//                 </div>

//                 <div className="vcTip">
//                   <span className="material-symbols-outlined">lightbulb</span>
//                   <p>
//                     Accuracy is based on historical transaction density in {areaName}. For institutional-grade accuracy and hidden cost analysis,
//                     upgrade to <strong>DealLens™</strong>.
//                   </p>
//                 </div>
//               </div>

//               <div className="vcChartBox">
//                 <div className="vcChartHeader">
//                   <h2 className="vcSmallTitle" style={{ marginBottom: 0 }}>6-Month Price Trend</h2>
//                   <span className="vcGrowthBadge">+5.2% Growth</span>
//                 </div>

//                 <div className="vcChartCard">
//                   {trendSeries.length < 2 ? (
//                     <div style={{ marginTop: 14, color: "rgba(43,43,43,.6)", fontWeight: 600, fontSize: 13 }}>
//                       No trend data for this area
//                     </div>
//                   ) : (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart data={trendSeries}>
//                         <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
//                         <XAxis dataKey="label" interval={5} tick={{ fontSize: 10, fill: '#999' }} />
//                         <YAxis tickFormatter={(v) => fmtNum(v / 1000000, 1) + "M"} tick={{ fontSize: 10, fill: '#999' }} />
//                         <Tooltip formatter={(v) => fmtAED(v)} contentStyle={{ fontSize: 11, border: '1px solid #E8E8E8', borderRadius: 6 }} />
//                         <Area type="monotone" dataKey="market_total" fill="#B87333" fillOpacity={0.1} stroke="none" />
//                         <Line type="monotone" dataKey="property_total" dot={false} stroke="#B87333" strokeWidth={2} />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   )}
//                 </div>
//               </div>
//             </section>

//             {/* COMPARABLE CARDS */}
//             <section style={{ marginTop: 48 }}>
//               <div className="vcCardsHead">
//                 <div>
//                   <div className="vcCardsSubtitle">Verified Comparables</div>
//                   <h2 className="vcCardsMainTitle">Recently Transacted Units</h2>
//                 </div>
//                 <button type="button" className="vcUnlockBtn" onClick={() => navigate("/pricing")}>
//                   Unlock 15+ More Comparables
//                 </button>
//               </div>

//               {comps5.length === 0 ? (
//                 <div style={{ marginTop: 16, color: "rgba(43,43,43,.6)", fontSize: 13 }}>
//                   No comparables found. Try adjusting district / project / bedrooms / size.
//                 </div>
//               ) : (
//                 <div className="vcCards">
//                   {comps5.slice(0, 3).map((c, i) => {
//                     const title = c.project_name_en || c.building_name_en || c.master_project_en || "Property";
//                     const unit = `Unit ${c.rooms_en || "—"} • ${fmtNum(c.size_sqft, 0) || "—"} sqft • ${c.usage_en || "Apartment"}`;
//                     return (
//                       <div key={i} className="vcCard">
//                         <div className="vcTagRow">
//                           <span className="vcTag">DLD Official</span>
//                           <span className="vcWhen">{fmtDate(c.sold_date)}</span>
//                         </div>

//                         <p className="vcCardTitle">{title}</p>
//                         <p className="vcCardSub">{unit}</p>

//                         <div className="vcCardBottom">
//                           <div>
//                             <p className="vcSoldLabel">Sold Price</p>
//                             <p className="vcSoldPrice">{fmtAED(c.price_aed)}</p>
//                           </div>
//                           <div className="vcSize">{fmtAED(c.price_per_sqft)} / sqft</div>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </section>

//             {/* MACRO MARKET CONTEXT */}
//             <section className="vcMacroSection">
//               <div className="vcCardsSubtitle">Macro Market Context</div>
//               <div className="vcMacroGrid">
//                 <div className="vcMacroCard">
//                   <p className="vcMacroLabel">Avg. Price / SQFT</p>
//                   <p className="vcMacroValue">AED {rateSqft ? fmtNum(rateSqft, 0) : "—"}</p>
//                   <p className="vcMacroSub">+1.4% vs Area Avg</p>
//                 </div>
//                 <div className="vcMacroCard">
//                   <p className="vcMacroLabel">Market Activity</p>
//                   <p className="vcMacroValue">High</p>
//                   <p className="vcMacroSub">42 sales this month</p>
//                 </div>
//                 <div className="vcMacroCard">
//                   <p className="vcMacroLabel">Asset Grade</p>
//                   <p className="vcMacroValue">Prime</p>
//                   <p className="vcMacroSub">Top 10% of district</p>
//                 </div>
//                 <div className="vcMacroCard">
//                   <p className="vcMacroLabel">Asset Type</p>
//                   <p className="vcMacroValue">Freehold</p>
//                   <p className="vcMacroSub">International ownership</p>
//                 </div>
//               </div>
//             </section>

//             {/* FEEDBACK SECTION */}
//             <section className="vcFeedback">
//               <div className="vcFeedbackHeader">
//                 <span className="vcRewardBadge">
//                   🎁 Community Reward
//                 </span>
//               </div>
//               <h3 className="vcFeedbackTitle">Was our valuation accurate?</h3>
//               <p className="vcFeedbackText">
//                 Help us improve our AI engine. Submit a 10-second feedback and unlock <a href="#">Free DealLens™ Report</a> (Value: AED 149).
//               </p>
//               <div className="vcFeedbackBtns">
//                 <button className="vcFeedbackBtn">
//                   👍 Too High
//                 </button>
//                 <button className="vcFeedbackBtn">
//                   🎯 Spot On
//                 </button>
//                 <button className="vcFeedbackBtn">
//                   👎 Too Low
//                 </button>
//               </div>
//             </section>

//             {/* SHARE SECTION */}
//             <section className="vcBottomSection">
//               <div className="vcShareSection">
//                 <p className="vcShareLabel">Public Shareable Link</p>
//                 <div className="vcShareRow">
//                   <input 
//                     type="text" 
//                     className="vcShareInput" 
//                     value={`https://acqar.com/report/check/${valuationId || '8X205...'}`}
//                     readOnly
//                   />
//                   <button className="vcCopyBtn">Copy</button>
//                 </div>
//               </div>

//               <div className="vcFooterInfo">
//                 <div className="vcInfoBox">
//                   <p className="vcInfoTitle">Purpose</p>
//                   <p className="vcInfoContent">
//                     This valuation has been prepared for investment decision-making and personal property analysis purposes only. This report is <strong>NOT suitable for</strong>:
//                   </p>
//                   <ul className="vcInfoList">
//                     <li>Bank mortgage applications (upgrade to DualFit™)</li>
//                     <li>Legal proceedings</li>
//                     <li>Tax assessments</li>
//                     <li>Financial reporting</li>
//                   </ul>
//                 </div>

//                 <div className="vcInfoBox">
//                   <p className="vcInfoTitle">Intended User</p>
//                   <p className="vcInfoContent">
//                     Ahmed Mansouri — For personal use only
//                   </p>
//                 </div>

//                 <div className="vcInfoBox">
//                   <p className="vcInfoTitle">Third-Party Reliance</p>
//                   <p className="vcInfoContent">
//                     No permitted without explicit written consent from ACQARLABS L.L.C-FZ.
//                   </p>
//                 </div>
//               </div>

//               <div className="vcActions">
//                 <button className="vcBtn vcBtnGhost" onClick={goBack}>Regenerate Report</button>
//                 <button className="vcBtn vcBtnPrimary" onClick={goBack}>Delete Report</button>
//               </div>
//             </section>
//           </>
//         )}
//       </main>

//       <Footer />
//     </div>
//   );
// }


import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const RAW_API = process.env.REACT_APP_AVM_API;
const API = RAW_API ? RAW_API.replace(/\/+$/, "") : "";

const LS_FORM_KEY = "truvalu_formData_v1";
const LS_REPORT_KEY = "truvalu_reportData_v1";
const LS_VAL_ROW_ID = "truvalu_valuation_row_id";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function fmtAED(x) {
  const n = Number(x);
  if (!Number.isFinite(n)) return "—";
  return `AED ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}
function fmtNum(x, d = 0) {
  const n = Number(x);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: d });
}
function fmtDate(iso) {
  if (!iso) return "—";
  const s = String(iso).slice(0, 10);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
function monthLabel(yyyyMm) {
  if (!yyyyMm) return "";
  const [y, m] = String(yyyyMm).split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  if (Number.isNaN(d.getTime())) return String(yyyyMm);
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}
function normalizeRooms(x) {
  if (x === null || x === undefined) return "";
  const s = String(x);
  const m = s.match(/\d+/);
  return m ? `${m[0]} Bedrooms` : s;
}
function fmtPct(x, d = 0) {
  const n = Number(x);
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(d)}%`;
}
function sqmToSqft(sqm) {
  const n = Number(sqm);
  if (!Number.isFinite(n)) return null;
  return n * 10.763910416709722;
}
function aedPerSqftFromAedPerSqm(aedPerSqm) {
  const n = Number(aedPerSqm);
  if (!Number.isFinite(n)) return null;
  return n / 10.763910416709722;
}

/* ✅ HEADER (logo only) - unchanged */
function HeaderLite() {
  const navigate = useNavigate();
  return (
    <>
      <header className="acqHdrLite">
        <div className="acqHdrLiteInner">
          <div
            className="acqHdrLogo"
            onClick={() => navigate("/")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") navigate("/");
            }}
            aria-label="Go to landing page"
            title="ACQAR"
          >
            <h1>ACQAR</h1>
          </div>
        </div>
      </header>
      <div className="acqHdrLiteSpacer" />
    </>
  );
}

/* ✅ FOOTER - unchanged (your footer code) */
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
    ["COMPANY", ["About ACQAR", "How It Works", "Pricing", "Contact Us", "Partners", "Press Kit"]],
    ["RESOURCES", ["Help Center", "Market Reports", "Blog Column 5", "Comparisons"]],
    ["COMPARISONS", ["vs Bayut TruEstimate", "vs Property Finder", "vs Traditional Valuers", "Why ACQAR?"]],
  ];

  return (
    <>
      <style>{`
        .acq-footer { background:#F9F9F6; border-top:1px solid #EBEBEB; padding:56px 0 0; font-family:Inter,sans-serif; }
        .acq-footer-grid { max-width:80rem; margin:0 auto; padding:0 2rem; display:grid; grid-template-columns:1.35fr 1fr 1fr 1fr 1fr; gap:48px; align-items:start; padding-bottom:48px; }
        .acq-brand-name { font-size:1rem; font-weight:900; letter-spacing:.04em; text-transform:uppercase; color:#2B2B2B; display:block; margin-bottom:14px; }
        .acq-brand-desc { font-size:.75rem; color:rgba(43,43,43,.58); line-height:1.75; margin:0 0 18px; max-width:240px; }
        .acq-rics-badge { display:inline-flex; align-items:center; gap:7px; padding:7px 12px; background:#fff; border:1px solid #EBEBEB; border-radius:8px; margin-bottom:20px; }
        .acq-rics-badge svg { flex-shrink:0; color:#2B2B2B; }
        .acq-rics-badge span { font-size:.5625rem; font-weight:800; color:rgba(43,43,43,.82); text-transform:uppercase; letter-spacing:.08em; white-space:nowrap; }
        .acq-social-row { display:flex; gap:10px; }
        .acq-social-btn { width:34px; height:34px; border-radius:50%; border:1px solid #E5E7EB; display:flex; align-items:center; justify-content:center; color:rgba(43,43,43,.38); text-decoration:none; transition:color .18s, border-color .18s; background:transparent; cursor:pointer; }
        .acq-social-btn:hover { color:#B87333; border-color:#B87333; }
        .acq-col-title { font-size:.75rem; font-weight:800; text-transform:uppercase; letter-spacing:.16em; color:#2B2B2B; margin:0 0 20px; }
        .acq-link-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:13px; }
        .acq-link-item { font-size:.8125rem; color:rgba(43,43,43,.55); font-weight:400; cursor:pointer; transition:color .16s; line-height:1.4; }
        .acq-link-item:hover { color:#B87333; }
        .acq-divider { max-width:80rem; margin:0 auto; padding:0 2rem; }
        .acq-divider hr { border:none; border-top:1px solid #E5E7EB; margin:0; }
        .acq-footer-bottom { max-width:80rem; margin:0 auto; padding:18px 2rem 28px; display:flex; align-items:center; justify-content:space-between; gap:16px; }
        .acq-copy p { font-size:.5625rem; font-weight:800; color:rgba(43,43,43,.38); text-transform:uppercase; letter-spacing:.12em; margin:0 0 3px; }
        .acq-copy small { font-size:.5rem; color:rgba(43,43,43,.28); text-transform:uppercase; letter-spacing:.08em; display:block; }
        .acq-legal { display:flex; align-items:center; gap:28px; flex-wrap:wrap; justify-content:flex-end; }
        .acq-legal a { font-size:.5625rem; font-weight:800; color:rgba(43,43,43,.38); text-transform:uppercase; letter-spacing:.12em; text-decoration:none; white-space:nowrap; transition:color .16s; }
        .acq-legal a:hover { color:#2B2B2B; }
        @media (max-width:1024px){ .acq-footer-grid{ grid-template-columns:1fr 1fr 1fr; gap:32px; } .acq-brand-col{ grid-column:1/-1; } .acq-brand-desc{ max-width:100%; } }
        @media (max-width:640px){ .acq-footer-grid{ grid-template-columns:1fr 1fr; gap:28px; padding:0 1rem 40px; } .acq-brand-col{ grid-column:1/-1; } .acq-footer-bottom{ flex-direction:column; align-items:center; text-align:center; gap:14px; padding:18px 1rem 28px; } .acq-legal{ justify-content:center; gap:18px; } .acq-divider{ padding:0 1rem; } }
        @media (max-width:420px){ .acq-footer-grid{ grid-template-columns:1fr; } }
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
              <span>RICS-Aligned Intelligence</span>
            </div>

            <div className="acq-social-row">
              <a href="https://www.linkedin.com/company/acqar" target="_blank" rel="noopener noreferrer" className="acq-social-btn" aria-label="LinkedIn">
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
                  <li key={item} className="acq-link-item">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="acq-divider"><hr /></div>

        <div className="acq-footer-bottom">
          <div className="acq-copy">
            <p>© 2025 ACQARLABS L.L.C-FZ. All rights reserved.</p>
            <small>TruValu™ is a registered trademark.</small>
          </div>
          <nav className="acq-legal">
            {["Legal links", "Terms", "Privacy", "Cookies", "Security"].map((l) => (
              <a key={l} href="#">{l}</a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}

export default function Report() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const valuationId = sp.get("id");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [formData, setFormData] = useState(() => safeParse(localStorage.getItem(LS_FORM_KEY)) || {});
  const [reportData, setReportData] = useState(() => safeParse(localStorage.getItem(LS_REPORT_KEY)) || null);

  const [valRow, setValRow] = useState(null);
  const savedRef = useRef(false);

  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

    // ✅ Shareable link (uses the exact valuations.id that your page already supports)
  const shareValId =
    valuationId ||
    (valRow?.id ? String(valRow.id) : "") ||
    (localStorage.getItem(LS_VAL_ROW_ID) ? String(localStorage.getItem(LS_VAL_ROW_ID)) : "");

  const shareUrl = shareValId
    ? `${window.location.origin}/report?id=${encodeURIComponent(shareValId)}`
    : `${window.location.origin}/report`;

  async function handleCopyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (e) {
      // fallback for some browsers / http
      const ta = document.createElement("textarea");
      ta.value = shareUrl;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }


  const headerInitials = useMemo(() => {
    const nm =
      (formData?.name ||
        formData?.full_name ||
        formData?.customer_name ||
        formData?.email ||
        "ACQAR") + "";
    const parts = nm.trim().split(/\s+/).filter(Boolean);
    const a = (parts[0]?.[0] || "A").toUpperCase();
    const b = (parts[1]?.[0] || "M").toUpperCase();
    return (a + b).slice(0, 2);
  }, [formData]);

  
  useEffect(() => {
    if (valuationId) return;
    const storedForm = safeParse(localStorage.getItem(LS_FORM_KEY));
    if (storedForm) setFormData(storedForm);
  }, [valuationId]);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        setErr("");
        setLoading(true);

        if (!API) throw new Error("REACT_APP_AVM_API is missing. Please set it in your frontend .env and restart npm.");
        // if (!formData || Object.keys(formData).length === 0) throw new Error("No form data found for this report.");
        // ✅ If opened via share link (?id=...), wait for Supabase to load form_payload
if (valuationId && (!formData || Object.keys(formData).length === 0)) {
  setLoading(true);
  return; // wait; loadValuation() will setFormData then this effect re-runs
}

// ✅ If not share-link mode, we still require local form data
if (!valuationId && (!formData || Object.keys(formData).length === 0)) {
  throw new Error("No form data found for this report.");
}

        const res = await fetch(`${API}/predict_with_comparables`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: formData }),
        });

        const json = await res.json();
        if (!res.ok) {
          const msg = json?.detail || json?.message || `Request failed (${res.status})`;
          throw new Error(msg);
        }

        if (!mounted) return;

        setReportData(json);

        if (!valuationId) localStorage.setItem(LS_REPORT_KEY, JSON.stringify(json));

        if (!savedRef.current) {
          const valuationRowId = localStorage.getItem(LS_VAL_ROW_ID);
          const est = Number(json?.total_valuation);

          if (valuationRowId && Number.isFinite(est)) {
            savedRef.current = true;

            const { error: upErr } = await supabase
              .from("valuations")
              .update({ estimated_valuation: est, updated_at: new Date().toISOString() })
              .eq("id", valuationRowId);

            if (upErr) {
              console.error("Failed to update estimated valuation:", upErr);
              savedRef.current = false;
            }
          }
        }
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Something went wrong");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    run();
    return () => { mounted = false; };
  }, [formData, valuationId]);

  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
  async function getUser() {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      setLoggedUser(data.user);
    }
  }
  getUser();
}, []);


  const comps5 = useMemo(() => (reportData?.comparables || []).slice(0, 5), [reportData]);

  const trendSeries = useMemo(() => {
    const t = reportData?.charts?.trend || [];
    const area = Number(reportData?.procedure_area || formData?.procedure_area || 0) || 0;
    const propertyTotal = Number(reportData?.predicted_meter_sale_price || 0) * area;

    return t.slice(-60).map((r) => {
      const marketPpm2 = Number(r.median_price_per_sqm);
      const marketTotal = Number.isFinite(marketPpm2) ? marketPpm2 * area : null;
      return {
        month: r.month,
        label: monthLabel(r.month),
        property_total: Number.isFinite(propertyTotal) ? propertyTotal : null,
        market_total: Number.isFinite(marketTotal) ? marketTotal : null,
      };
    });
  }, [reportData, formData,valRow]);

  const factorWeights = useMemo(
    () => [
      { name: "Location", value: 25 },
      { name: "Property Type", value: 20 },
      { name: "Condition", value: 15 },
      { name: "Age", value: 15 },
      { name: "Proximity", value: 15 },
      { name: "Amenities", value: 10 },
    ],
    []
  );

  const displayUserName = useMemo(() => {
  if (!loggedUser) return "User";

  // If you store name in user_metadata
  if (loggedUser.user_metadata?.full_name) {
    return loggedUser.user_metadata.full_name;
  }

  // fallback to email
  if (loggedUser.email) {
    const name = loggedUser.email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  return "User";
}, [loggedUser]);


  const PIE_COLORS = ["#1d4ed8", "#10b981", "#f59e0b", "#8b5cf6", "#0ea5e9", "#e11d48"];

  const goBack = () => navigate("/valuation");

  const areaName = formData?.area_name_en || "—";
  const subArea = formData?.sub_area_en || formData?.community_en || "";
  const projectName = formData?.project_name_en || formData?.building_name_en || "—";
  const propertyType = formData?.property_type_en || "Property";

  const totalVal = Number(reportData?.total_valuation);
  const rateSqm = Number(reportData?.predicted_meter_sale_price);
  const rateSqft = aedPerSqftFromAedPerSqm(rateSqm);

  const band = 0.15;
  const rangeLow = Number.isFinite(Number(reportData?.range_low))
    ? Number(reportData?.range_low)
    : Number.isFinite(totalVal)
    ? totalVal * (1 - band)
    : null;

  const rangeHigh = Number.isFinite(Number(reportData?.range_high))
    ? Number(reportData?.range_high)
    : Number.isFinite(totalVal)
    ? totalVal * (1 + band)
    : null;

  const compsCount = Number(reportData?.comparables_meta?.count ?? (reportData?.comparables || []).length);
  const confidencePct = Number.isFinite(Number(reportData?.confidence_pct))
    ? Number(reportData?.confidence_pct)
    : compsCount >= 10
    ? 95
    : compsCount >= 5
    ? 90
    : compsCount >= 1
    ? 82
    : 70;

  const sqm = Number(reportData?.procedure_area ?? formData?.procedure_area ?? 0);
  const sqft = sqmToSqft(sqm);

  const modelName = reportData?.model_name || "XGBoost + K-Nearest Neighbors";
  const modelAcc = reportData?.model_accuracy || "94.2%";
  const modelUpdated = reportData?.model_updated || "2026-01-23";

  const UI_CSS = `
    :root{
      --acq-text: #2B2B2B;
      --acq-accent: #B87333;
      --acq-border: #E5E5E5;
      --acq-bg: #FFFFFF;
      --muted: rgba(43,43,43,.55);
      --soft: rgba(184,115,51,.10);
    }

    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }

    .reportPage{ width:100%; overflow-x:hidden; background:#FAFAFA; color:var(--acq-text); }

    .acqHdrLite{ position:fixed; top:0; left:0; right:0; z-index:60; background:#fff; border-bottom:1px solid var(--acq-border); }
    .acqHdrLiteInner{ max-width:80rem; margin:0 auto; height:64px; display:flex; align-items:center; padding:0 20px; }
    .acqHdrLogo h1{ margin:0; font-size:20px; font-weight:900; letter-spacing:-0.04em; text-transform:uppercase; color:var(--acq-text); cursor: pointer; }
    .acqHdrLiteSpacer{ height:64px; }

    .vcMain{ max-width:1200px; margin:0 auto; padding:40px 20px 60px; }

    /* Header Section */
    .vcHeader{ margin-bottom:0; padding-bottom:24px; border-bottom:1px solid var(--acq-border); }
    .vcTitle{ margin:0 0 8px; font-size:32px; line-height:1.2; font-weight:700; letter-spacing:-0.02em; color:#2B2B2B; }
    .vcMeta{ display:flex; flex-wrap:wrap; gap:8px; color:rgba(43,43,43,.5); font-weight:400; font-size:13px; align-items:center; margin-bottom:12px; }
    .vcDot{ width:3px; height:3px; border-radius:50%; background:rgba(43,43,43,.3); display:inline-block; }

    .vcHeaderRow{ display:flex; gap:24px; flex-wrap:wrap; margin-top:12px; }
    .vcMini{ display:flex; flex-direction:column; gap:2px; }
    .vcMini span:first-child{ font-size:10px; font-weight:600; letter-spacing:.05em; text-transform:uppercase; color:rgba(43,43,43,.4); }
    .vcMini span:last-child{ font-size:11px; font-weight:600; font-family: ui-monospace, monospace; color:#2B2B2B; }

    /* Two Column Layout */
    .vcSectionGrid{ display:grid; grid-template-columns: 1fr 1fr; gap:32px; margin-top:32px; padding-top:32px; border-top:1px solid #F0F0F0; }
    .vcSmallTitle{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 16px; }

    /* Left Column - Value */
    .vcValueBig{ font-size:48px; font-weight:700; letter-spacing:-0.02em; margin:0; color:#2B2B2B; }
    .vcValueSub{ font-size:13px; color:rgba(43,43,43,.5); font-weight:400; margin-top:6px; }

    .vcBar{ height:8px; background:#F5F5F5; border-radius:4px; overflow:hidden; display:flex; margin-top:20px; }
    .vcBar > div{ height:100%; }
    .vcBarLow{ width:25%; background:#E5E5E5; }
    .vcBarMid{ width:50%; background:#B87333; }
    .vcBarHigh{ width:25%; background:#E5E5E5; }

    .vcRange{ display:grid; grid-template-columns: 1fr 1fr 1fr; margin-top:12px; font-size:11px; font-weight:600; }
    .vcRange div{ font-family: ui-monospace, monospace; }
    .vcRange small{ display:block; font-size:9px; color:rgba(43,43,43,.4); font-weight:600; letter-spacing:.08em; margin-bottom:4px; text-transform:uppercase; }
    .vcRangeMid{ text-align:center; }
    .vcRangeRight{ text-align:right; }

    .vcTip{ margin-top:20px; padding:12px 14px; background:#FAFAF8; border:1px solid #F0F0F0; display:flex; gap:10px; align-items:flex-start; border-radius:6px; }
    .vcTip .material-symbols-outlined{ color:var(--acq-accent); font-size:16px; flex-shrink:0; }
    .vcTip p{ margin:0; font-size:12px; color:rgba(43,43,43,.6); line-height:1.5; }

    /* Right Column - Chart */
    .vcChartBox{ }
    .vcChartHeader{ display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
    .vcGrowthBadge{ font-size:10px; font-weight:700; padding:4px 10px; border-radius:4px; border:1px solid #86EFAC; background:#F0FDF4; color:#15803D; text-transform:uppercase; letter-spacing:.05em; }
    .vcChartCard{ height:280px; width:100%; background:#FAFAFA; border-radius:6px; padding:16px; }

    /* Comparables Cards */
    .vcCardsHead{ display:flex; justify-content:space-between; align-items:center; margin-top:48px; margin-bottom:16px; }
    .vcCardsTitle{ margin:0; }
    .vcCardsSubtitle{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 4px; }
    .vcCardsMainTitle{ font-size:18px; font-weight:700; margin:0; color:#2B2B2B; }
    .vcUnlockBtn{ border:none; background:transparent; color:#B87333; font-weight:700; font-size:11px; letter-spacing:.05em; text-transform:uppercase; border-bottom:1.5px solid #B87333; padding:0 0 4px; cursor:pointer; transition:opacity .2s; }
    .vcUnlockBtn:hover{ opacity:0.7; }

    .vcCards{ display:grid; grid-template-columns: repeat(3, 1fr); gap:16px; }
    .vcCard{ border:1px solid #E8E8E8; padding:16px; border-radius:8px; background:#FFFFFF; transition:all .2s; }
    .vcCard:hover{ border-color:#B87333; box-shadow:0 2px 8px rgba(0,0,0,.04); }
    .vcTagRow{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
    .vcTag{ font-size:9px; font-weight:700; color:#2563EB; background:#EFF6FF; border:1px solid #DBEAFE; padding:3px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:.08em; }
    .vcWhen{ font-size:10px; color:rgba(43,43,43,.4); font-weight:600; font-family: ui-monospace, monospace; }
    .vcCardTitle{ font-size:15px; font-weight:700; margin:0 0 4px; color:#2B2B2B; }
    .vcCardSub{ font-size:11px; color:rgba(43,43,43,.5); margin:0 0 16px; font-weight:400; }
    .vcCardBottom{ display:flex; justify-content:space-between; align-items:flex-end; gap:12px; border-top:1px solid #F5F5F5; padding-top:12px; }
    .vcSoldLabel{ font-size:9px; color:rgba(43,43,43,.4); font-weight:600; letter-spacing:.08em; text-transform:uppercase; margin:0 0 4px; }
    .vcSoldPrice{ font-size:18px; font-weight:700; font-family: ui-monospace, monospace; margin:0; color:#2B2B2B; }
    .vcSize{ font-size:11px; color:rgba(43,43,43,.45); font-weight:600; font-family: ui-monospace, monospace; text-align:right; }

    /* Macro Market Context */
    .vcMacroSection{ margin-top:48px; }
    .vcMacroGrid{ display:grid; grid-template-columns: repeat(4, 1fr); gap:16px; margin-top:16px; }
    .vcMacroCard{ background:#FFFFFF; border:1px solid #E8E8E8; padding:16px; border-radius:8px; }
    .vcMacroLabel{ font-size:9px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 8px; }
    .vcMacroValue{ font-size:24px; font-weight:700; margin:0; color:#2B2B2B; }
    .vcMacroSub{ font-size:11px; color:rgba(43,43,43,.5); margin:4px 0 0; font-weight:400; }

    /* Feedback Section */
    .vcFeedback{ margin-top:48px; background:#FAFAF8; border:1px solid #F0F0F0; border-radius:8px; padding:20px 24px; }
    .vcFeedbackHeader{ display:flex; align-items:center; gap:12px; margin-bottom:16px; }
    .vcRewardBadge{ font-size:9px; font-weight:700; color:#B87333; background:#FEF3E7; border:1px solid #F0D9C0; padding:4px 10px; border-radius:4px; text-transform:uppercase; letter-spacing:.08em; display:inline-flex; align-items:center; gap:6px; }
    .vcFeedbackTitle{ font-size:18px; font-weight:700; font-style:italic; margin:0; color:#2B2B2B; }
    .vcFeedbackText{ font-size:12px; color:rgba(43,43,43,.6); line-height:1.5; margin:0 0 16px; }
    .vcFeedbackText a{ color:#B87333; text-decoration:underline; font-weight:600; }
    .vcFeedbackBtns{ display:flex; gap:10px; }
    .vcFeedbackBtn{ padding:8px 16px; border:1px solid #E5E5E5; background:#FFFFFF; border-radius:6px; font-size:11px; font-weight:600; color:rgba(43,43,43,.6); cursor:pointer; transition:all .2s; display:flex; align-items:center; gap:6px; }
    .vcFeedbackBtn:hover{ border-color:#B87333; color:#B87333; }

    /* Bottom Actions */
    .vcBottomSection{ margin-top:48px; }
    .vcShareSection{ background:#FAFAFA; border:1px solid #E8E8E8; border-radius:8px; padding:20px; margin-bottom:24px; }
    .vcShareLabel{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 12px; }
    .vcShareRow{ display:flex; gap:12px; }
    .vcShareInput{ flex:1; padding:10px 14px; border:1px solid #E5E5E5; border-radius:6px; font-size:12px; font-family:ui-monospace, monospace; background:#FFFFFF; color:rgba(43,43,43,.7); }
    .vcCopyBtn{ padding:10px 20px; background:#B87333; color:#FFFFFF; border:none; border-radius:6px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; cursor:pointer; transition:background .2s; }
    .vcCopyBtn:hover{ background:#A06229; }

    .vcFooterInfo{ display:grid; grid-template-columns: 1fr 1fr 1fr; gap:24px; }
    .vcInfoBox{ }
    .vcInfoTitle{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 8px; }
    .vcInfoContent{ font-size:12px; color:rgba(43,43,43,.7); line-height:1.6; margin:0; }
    .vcInfoList{ list-style:none; padding:0; margin:0; }
    .vcInfoList li{ font-size:12px; color:rgba(43,43,43,.7); margin-bottom:4px; padding-left:12px; position:relative; }
    .vcInfoList li:before{ content:'•'; position:absolute; left:0; color:rgba(43,43,43,.3); }

    .vcActions{ margin-top:32px; padding-top:24px; border-top:1px solid #E8E8E8; display:flex; justify-content:space-between; gap:14px; flex-wrap:wrap; align-items:center; }
    .vcBtn{ padding:12px 20px; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; border-radius:6px; cursor:pointer; transition:all .2s; }
    .vcBtnPrimary{ background:#2B2B2B; color:#fff; border:1px solid #2B2B2B; }
    .vcBtnPrimary:hover{ background:#000; border-color:#000; }
    .vcBtnGhost{ background:#fff; color:#2B2B2B; border:1px solid #E5E5E5; }
    .vcBtnGhost:hover{ background:#FAFAFA; border-color:#2B2B2B; }

    @media (max-width: 1024px){
      .vcSectionGrid{ grid-template-columns:1fr; gap:32px; }
      .vcCards{ grid-template-columns: 1fr; }
      .vcMacroGrid{ grid-template-columns: repeat(2, 1fr); }
      .vcFooterInfo{ grid-template-columns: 1fr; }
      .vcTitle{ font-size:28px; }
    }

    @media (max-width: 640px){
      .vcValueBig{ font-size:36px; }
      .vcMacroGrid{ grid-template-columns: 1fr; }
    }
  `;

  return (
    <div className="reportPage">
      <style>{UI_CSS}</style>

      <HeaderLite />

      <main className="vcMain">
        {/* PROPERTY HEADER */}
        <section className="vcHeader">
          <h1 className="vcTitle">{projectName}</h1>

          <div className="vcMeta">
            <span>{normalizeRooms(formData?.rooms_en) || "—"}</span>
            <span className="vcDot" />
            <span>{sqft ? `${fmtNum(sqft, 0)} SQFT` : "—"}</span>
            <span className="vcDot" />
            <span>
              📍 {areaName}{subArea ? `, ${subArea}` : ""}
            </span>
          </div>

          <div className="vcHeaderRow">
            {/* <div className="vcMini">
              <span>Report ID</span>
              <span>
                {valuationId ? String(valuationId).slice(0, 13) : "—"}
              </span>
            </div> */}
            <div className="vcMini">
              <span>Generated On</span>
              <span>
                {fmtDate(valRow?.created_at || reportData?.created_at || new Date().toISOString())}
              </span>
            </div>
          </div>
        </section>

        {/* LOADING / ERROR / CONTENT */}
        {loading ? (
          <div style={{ marginTop: 32, border: "1px solid #E8E8E8", background: "#fff", padding: 24, borderRadius: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Loading report…</div>
            <div style={{ color: "rgba(43,43,43,.55)" }}>Generating prediction and fetching comparables</div>
          </div>
        ) : err ? (
          <div style={{ marginTop: 32, border: "1px solid #E8E8E8", background: "#fff", padding: 24, borderRadius: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Error</div>
            <div style={{ color: "rgba(43,43,43,.7)" }}>{err}</div>
          </div>
        ) : (
          <>
            {/* VALUE + TREND */}
            <section className="vcSectionGrid">
              <div>
                <h2 className="vcSmallTitle">Estimated Market Value</h2>

                <p className="vcValueBig">{fmtAED(reportData?.total_valuation)}</p>
                <div className="vcValueSub">± {fmtPct(confidencePct, 0)} Confidence</div>

                <div className="vcBar">
                  <div className="vcBarLow" />
                  <div className="vcBarMid" />
                  <div className="vcBarHigh" />
                </div>

                <div className="vcRange">
                  <div>
                    <small>Low</small>
                    {rangeLow ? fmtAED(rangeLow) : "—"}
                  </div>
                  <div className="vcRangeMid">
                    <small>Most Likely</small>
                    {Number.isFinite(totalVal) ? fmtAED(totalVal) : "—"}
                  </div>
                  <div className="vcRangeRight">
                    <small>High</small>
                    {rangeHigh ? fmtAED(rangeHigh) : "—"}
                  </div>
                </div>

                <div className="vcTip">
                  <span className="material-symbols-outlined">lightbulb</span>
                  <p>
                    Accuracy is based on historical transaction density in {areaName}. For institutional-grade accuracy and hidden cost analysis,
                    upgrade to <strong>DealLens™</strong>.
                  </p>
                </div>
              </div>

              {/* <div className="vcChartBox">
                <div className="vcChartHeader">
                  <h2 className="vcSmallTitle" style={{ marginBottom: 0 }}>6-Month Price Trend</h2>
                  <span className="vcGrowthBadge">+5.2% Growth</span>
                </div>

                <div className="vcChartCard">
                  {trendSeries.length < 2 ? (
                    <div style={{ marginTop: 14, color: "rgba(43,43,43,.6)", fontWeight: 600, fontSize: 13 }}>
                      No trend data for this area
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                        <XAxis dataKey="label" interval={5} tick={{ fontSize: 10, fill: '#999' }} />
                        <YAxis tickFormatter={(v) => fmtNum(v / 1000000, 1) + "M"} tick={{ fontSize: 10, fill: '#999' }} />
                        <Tooltip formatter={(v) => fmtAED(v)} contentStyle={{ fontSize: 11, border: '1px solid #E8E8E8', borderRadius: 6 }} />
                        <Area type="monotone" dataKey="market_total" fill="#B87333" fillOpacity={0.1} stroke="none" />
                        <Line type="monotone" dataKey="property_total" dot={false} stroke="#B87333" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div> */}
            </section>

            {/* COMPARABLE CARDS */}
            {/* <section style={{ marginTop: 48 }}>
              <div className="vcCardsHead">
                <div>
                  <div className="vcCardsSubtitle">Verified Comparables</div>
                  <h2 className="vcCardsMainTitle">Recently Transacted Units</h2>
                </div>
                <button type="button" className="vcUnlockBtn" onClick={() => navigate("/pricing")}>
                  Unlock 15+ More Comparables
                </button>
              </div>

              {comps5.length === 0 ? (
                <div style={{ marginTop: 16, color: "rgba(43,43,43,.6)", fontSize: 13 }}>
                  No comparables found. Try adjusting district / project / bedrooms / size.
                </div>
              ) : (
                <div className="vcCards">
                  {comps5.slice(0, 3).map((c, i) => {
                    const title = c.project_name_en || c.building_name_en || c.master_project_en || "Property";
                    const unit = `Unit ${c.rooms_en || "—"} • ${fmtNum(c.size_sqft, 0) || "—"} sqft • ${c.usage_en || "Apartment"}`;
                    return (
                      <div key={i} className="vcCard">
                        <div className="vcTagRow">
                          <span className="vcTag">DLD Official</span>
                          <span className="vcWhen">{fmtDate(c.sold_date)}</span>
                        </div>

                        <p className="vcCardTitle">{title}</p>
                        <p className="vcCardSub">{unit}</p>

                        <div className="vcCardBottom">
                          <div>
                            <p className="vcSoldLabel">Sold Price</p>
                            <p className="vcSoldPrice">{fmtAED(c.price_aed)}</p>
                          </div>
                          <div className="vcSize">{fmtAED(c.price_per_sqft)} / sqft</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section> */}

            {/* MACRO MARKET CONTEXT */}
            <section className="vcMacroSection">
              <div className="vcCardsSubtitle">Macro Market Context</div>
              <div className="vcMacroGrid">
                <div className="vcMacroCard">
                  <p className="vcMacroLabel">Avg. Price / SQFT</p>
                  <p className="vcMacroValue">AED {rateSqft ? fmtNum(rateSqft, 0) : "—"}</p>
                  <p className="vcMacroSub">+1.4% vs Area Avg</p>
                </div>
                <div className="vcMacroCard">
                  <p className="vcMacroLabel">Market Activity</p>
                  <p className="vcMacroValue">High</p>
                  <p className="vcMacroSub">42 sales this month</p>
                </div>
                <div className="vcMacroCard">
                  <p className="vcMacroLabel">Asset Grade</p>
                  <p className="vcMacroValue">Prime</p>
                  <p className="vcMacroSub">Top 10% of district</p>
                </div>
                <div className="vcMacroCard">
                  <p className="vcMacroLabel">Asset Type</p>
                  <p className="vcMacroValue">Freehold</p>
                  <p className="vcMacroSub">International ownership</p>
                </div>
              </div>
            </section>

            {/* FEEDBACK SECTION */}
            <section className="vcFeedback">
              <div className="vcFeedbackHeader">
                <span className="vcRewardBadge">
                  🎁 Community Reward
                </span>
              </div>
              <h3 className="vcFeedbackTitle">Was our valuation accurate?</h3>
              <p className="vcFeedbackText">
                Help us improve our AI engine. Submit a 10-second feedback and unlock <a href="#">Free DealLens™ Report</a> (Value: AED 149).
              </p>
              <div className="vcFeedbackBtns">
                <button className="vcFeedbackBtn">
                  👍 Too High
                </button>
                <button className="vcFeedbackBtn">
                  🎯 Spot On
                </button>
                <button className="vcFeedbackBtn">
                  👎 Too Low
                </button>
              </div>
            </section>

            {/* SHARE SECTION */}
            <section className="vcBottomSection">
  <div className="vcShareSection">
    <p className="vcShareLabel">Public Shareable Link</p>
    <div className="vcShareRow">
      <input
        type="text"
        className="vcShareInput"
        value={shareUrl}
        readOnly
      />
      <button className="vcCopyBtn" onClick={handleCopyShareLink}>
        Copy
      </button>
    </div>
  </div>

  <div className="vcFooterInfo">
    <div className="vcInfoBox">
      <p className="vcInfoTitle">Purpose</p>
      <p className="vcInfoContent">
        This valuation has been prepared for investment decision-making and personal property analysis purposes only. This report is <strong>NOT suitable for</strong>:
      </p>
      <ul className="vcInfoList">
        <li>Bank mortgage applications (upgrade to DualFit™)</li>
        <li>Legal proceedings</li>
        <li>Tax assessments</li>
        <li>Financial reporting</li>
      </ul>
    </div>

    <div className="vcInfoBox">
  <p className="vcInfoTitle">Intended User</p>
  <p className="vcInfoContent">
    {displayUserName} — For personal use only
  </p>
</div>


    <div className="vcInfoBox">
      <p className="vcInfoTitle">Third-Party Reliance</p>
      <p className="vcInfoContent">
        No permitted without explicit written consent from ACQARLABS L.L.C-FZ.
      </p>
    </div>
  </div>

  <div className="vcActions">
    <button className="vcBtn vcBtnGhost" onClick={goBack}>Regenerate Report</button>
    <button className="vcBtn vcBtnPrimary" onClick={goBack}>Delete Report</button>
  </div>
</section>

          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

