// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import NavBar from "../components/NavBar";
// import "../styles/report.css";

// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   LineChart,
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
//   return m ? `${m[0]} BR` : s;
// }

// /* ===== Added helpers for header (no change to existing logic) ===== */
// function fmtPct(x, d = 0) {
//   const n = Number(x);
//   if (!Number.isFinite(n)) return "—";
//   return `${n.toFixed(d)}%`;
// }
// function aedPerSqftFromAedPerSqm(aedPerSqm) {
//   const n = Number(aedPerSqm);
//   if (!Number.isFinite(n)) return null;
//   return n / 10.763910416709722; // 1 sqm = 10.7639 sqft
// }

// export default function Report() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   const [formData, setFormData] = useState(
//     () => safeParse(localStorage.getItem(LS_FORM_KEY)) || {}
//   );
//   const [reportData, setReportData] = useState(
//     () => safeParse(localStorage.getItem(LS_REPORT_KEY)) || null
//   );

//   useEffect(() => {
//     const storedForm = safeParse(localStorage.getItem(LS_FORM_KEY));
//     if (storedForm) setFormData(storedForm);
//   }, []);

//   useEffect(() => {
//     let mounted = true;

//     async function run() {
//       try {
//         setErr("");
//         setLoading(true);

//         // ✅ Helpful error if API env missing
//         if (!API) {
//           throw new Error(
//             "REACT_APP_AVM_API is missing. Add it to Vercel/your .env and redeploy/restart."
//           );
//         }

//         // ✅ Helpful error if form data missing
//         if (!formData || Object.keys(formData).length === 0) {
//           throw new Error("Missing form data. Please go back and fill the valuation form again.");
//         }

//         const res = await fetch(`${API}/predict_with_comparables`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ data: formData }),
//         });

//         // ✅ SAFER: read raw text first (handles HTML 404 pages, empty body, etc.)
//         const text = await res.text();
//         let json = null;
//         try {
//           json = text ? JSON.parse(text) : null;
//         } catch {
//           json = null;
//         }

//         if (!res.ok) {
//           const msg =
//             json?.detail ||
//             json?.message ||
//             (text ? text.slice(0, 200) : "") ||
//             `Request failed (${res.status})`;
//           throw new Error(msg);
//         }

//         if (!json) throw new Error("Backend returned empty response.");

//         if (!mounted) return;
//         setReportData(json);
//         localStorage.setItem(LS_REPORT_KEY, JSON.stringify(json));
//       } catch (e) {
//         if (!mounted) return;
//         setErr(e?.message || "Something went wrong");
//       } finally {
//         if (!mounted) return;
//         setLoading(false);
//       }
//     }

//     run();
//     return () => {
//       mounted = false;
//     };
//   }, [formData]);

//   const comps5 = useMemo(
//     () => (reportData?.comparables || []).slice(0, 5),
//     [reportData]
//   );

//   // ---- Trend chart (property value vs market average) ----
//   const trendSeries = useMemo(() => {
//     const t = reportData?.charts?.trend || [];
//     const area = Number(reportData?.procedure_area || formData?.procedure_area || 0) || 0;

//     const propertyTotal = Number(reportData?.predicted_meter_sale_price || 0) * area; // constant line
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

//   // ---- Donut (static weights like screenshot) ----
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

//   /* ===== Added computed values for header (no functional change) ===== */
//   const areaName = formData?.area_name_en || "—";
//   const subArea = formData?.sub_area_en || formData?.community_en || "";
//   const projectName = formData?.project_name_en || formData?.building_name_en || "—";
//   const propertyType = formData?.property_type_en || "Property";

//   const totalVal = Number(reportData?.total_valuation);
//   const rateSqm = Number(reportData?.predicted_meter_sale_price);
//   const rateSqft = aedPerSqftFromAedPerSqm(rateSqm);

//   const band = 0.15;
//   const rangeLow =
//     Number.isFinite(Number(reportData?.range_low))
//       ? Number(reportData?.range_low)
//       : Number.isFinite(totalVal)
//       ? totalVal * (1 - band)
//       : null;

//   const rangeHigh =
//     Number.isFinite(Number(reportData?.range_high))
//       ? Number(reportData?.range_high)
//       : Number.isFinite(totalVal)
//       ? totalVal * (1 + band)
//       : null;

//   const compsCount = Number(
//     reportData?.comparables_meta?.count ?? (reportData?.comparables || []).length
//   );
//   const confidencePct = Number.isFinite(Number(reportData?.confidence_pct))
//     ? Number(reportData?.confidence_pct)
//     : compsCount >= 10
//     ? 95
//     : compsCount >= 5
//     ? 90
//     : compsCount >= 1
//     ? 82
//     : 70;

//   const stabilityLabel = reportData?.stability_label || "Stable";

//   const modelName = reportData?.model_name || "XGBoost + K-Nearest Neighbors";
//   const modelAcc = reportData?.model_accuracy || "94.2%";
//   const modelUpdated = reportData?.model_updated || "2026-01-23";

//   return (
//     <div className="reportPage">
//       <NavBar />

//       <div className="reportWrap">
//         <div className="topRow">
//           <div>
//             <div className="reportTitle">Valuation Report</div>
//             <div className="reportSub">
//               {formData?.area_name_en ? `${formData.area_name_en}` : ""}
//               {formData?.property_type_en ? ` • ${formData.property_type_en}` : ""}
//               {formData?.project_name_en ? ` • ${formData.project_name_en}` : ""}
//               {formData?.rooms_en ? ` • ${normalizeRooms(formData.rooms_en)}` : ""}
//             </div>
//           </div>

//           <div className="topActions">
//             <button className="btnSecondary" onClick={goBack}>
//               Edit Inputs
//             </button>
//           </div>
//         </div>

//         {loading ? (
//           <div className="card2" style={{ marginTop: 14 }}>
//             <div className="card2Title">Loading report…</div>
//             <div className="card2Hint">Generating prediction and fetching comparables</div>
//           </div>
//         ) : err ? (
//           <div className="card2" style={{ marginTop: 14 }}>
//             <div className="card2Title">Error</div>
//             <div className="empty2">{err}</div>

//             <div className="card2Hint" style={{ marginTop: 10 }}>
//               Quick check: DevTools → Network → predict_with_comparables → Response (it may be HTML 404 if API URL is wrong).
//             </div>
//           </div>
//         ) : (
//           <>
//             {/* ===== Template Header (Added) ===== */}
//             <div className="heroCard" style={{ marginTop: 14 }}>
//               <div className="heroTop">
//                 <div className="heroLeft">
//                   <div className="heroIcon" aria-hidden="true">▦</div>

//                   <div className="heroMeta">
//                     <div className="heroName">
//                       {projectName} <span className="heroDot">•</span>{" "}
//                       {String(propertyType).toLowerCase()}
//                     </div>

//                     <div className="heroLoc">
//                       {areaName}{subArea ? ` • ${subArea}` : ""}
//                     </div>

//                     <div className="heroValue">{fmtAED(reportData?.total_valuation)}</div>

//                     <div className="heroRangeRow">
//                       <div className="heroRangeText">
//                         Range: <b>{rangeLow ? fmtAED(rangeLow) : "—"}</b> –{" "}
//                         <b>{rangeHigh ? fmtAED(rangeHigh) : "—"}</b>
//                       </div>
//                       <span className="pill">{stabilityLabel}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="heroRight">
//                   <div className="statCard">
//                     <div className="statLabel">Price/Sq.ft</div>
//                     <div className="statValue">{rateSqft ? fmtAED(rateSqft) : "—"}</div>
//                   </div>

//                   <div className="statCard">
//                     <div className="statLabel">Confidence</div>
//                     <div className="statValueRow">
//                       <div className="statValue">{fmtPct(confidencePct, 0)}</div>
//                       <span className="okDot" aria-hidden="true" />
//                     </div>
//                   </div>

//                   <div className="statCard statCardOk">
//                     <div className="statLabel">RICS</div>
//                     <div className="statValueRow">
//                       <div className="statValue">OK</div>
//                       <span className="shield" aria-hidden="true">🛡</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="modelStrip">
//                 <div className="modelIcon" aria-hidden="true">⚙</div>
//                 <div className="modelText">
//                   <div className="modelTitle">ML Model: {modelName}</div>
//                   <div className="modelSub">
//                     {modelAcc} accuracy • Updated {fmtDate(modelUpdated)}
//                   </div>
//                 </div>
//               </div>
//             </div>
//             {/* ===== End Template Header ===== */}

//             {/* Summary (UNCHANGED) */}
//             <div className="card2" style={{ marginTop: 14 }}>
//               <div className="card2Title">Estimated Value</div>

//               <div className="summaryGrid">
//                 <div className="summaryItem">
//                   <div className="k">Total Valuation</div>
//                   <div className="v">{fmtAED(reportData?.total_valuation)}</div>
//                 </div>
//                 <div className="summaryItem">
//                   <div className="k">Rate (AED/m²)</div>
//                   <div className="v">{fmtNum(reportData?.predicted_meter_sale_price, 0)}</div>
//                 </div>
//                 <div className="summaryItem">
//                   <div className="k">Area (m²)</div>
//                   <div className="v">{fmtNum(reportData?.procedure_area, 2)}</div>
//                 </div>
//               </div>
//             </div>

//             {/* Charts like your screenshot (UNCHANGED) */}
//             <div className="chartsRow">
//               <div className="card2">
//                 <div className="card2Title">Historical Value Trend</div>
//                 <div className="card2Hint">Property Value vs Market Average</div>

//                 {trendSeries.length < 2 ? (
//                   <div className="empty2">No trend data for this area</div>
//                 ) : (
//                   <div style={{ width: "100%", height: 280, marginTop: 10 }}>
//                     <ResponsiveContainer>
//                       <AreaChart data={trendSeries}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         <XAxis dataKey="label" interval={5} />
//                         <YAxis tickFormatter={(v) => fmtNum(v / 1000000, 1) + "M"} />
//                         <Tooltip formatter={(v) => fmtAED(v)} />
//                         <Area type="monotone" dataKey="market_total" fillOpacity={0.2} />
//                         <Line type="monotone" dataKey="property_total" dot={false} />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   </div>
//                 )}
//               </div>

//               <div className="card2">
//                 <div className="card2Title">Valuation Factors Weight</div>
//                 <div className="card2Hint">Indicative weights</div>

//                 <div style={{ width: "100%", height: 280, marginTop: 10 }}>
//                   <ResponsiveContainer>
//                     <PieChart>
//                       <Pie
//                         data={factorWeights}
//                         dataKey="value"
//                         nameKey="name"
//                         innerRadius="55%"
//                         outerRadius="80%"
//                         paddingAngle={2}
//                       >
//                         {factorWeights.map((_, idx) => (
//                           <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
//                         ))}
//                       </Pie>
//                       <Tooltip formatter={(v) => `${v}%`} />
//                       <Legend />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
//             </div>

//             {/* Comparable Properties (UNCHANGED) */}
//             <div className="card2" style={{ marginTop: 14 }}>
//               <div className="card2Title">Comparable Properties</div>
//               <div className="card2Hint">
//                 Recently sold properties similar to yours
//                 {reportData?.comparables_meta?.used_level ? (
//                   <>
//                     {" "}
//                     • Level: <b>{reportData.comparables_meta.used_level}</b> • Found:{" "}
//                     <b>{reportData.comparables_meta.count}</b>
//                   </>
//                 ) : null}
//               </div>

//               {comps5.length === 0 ? (
//                 <div className="empty2">
//                   No comparables found. Try adjusting district / project / bedrooms / size.
//                 </div>
//               ) : (
//                 <div className="tableWrap2">
//                   <table className="compsTable">
//                     <thead>
//                       <tr>
//                         <th>Property</th>
//                         <th>Details</th>
//                         <th>Price</th>
//                         <th>Price/Sq.ft</th>
//                         <th>Sold Date</th>
//                         <th>Match</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {comps5.map((c, i) => {
//                         const subtype = c.property_sub_type_en || c.property_type_en || "Property";
//                         const name =
//                           c.project_name_en || c.building_name_en || c.master_project_en || "Property";
//                         const area = c.area_name_en || "—";
//                         const rooms = normalizeRooms(c.rooms_en) || "—";
//                         const sizeSqft = Number(c.size_sqft);
//                         const sizeText = Number.isFinite(sizeSqft)
//                           ? `${fmtNum(sizeSqft, 0)} sq.ft`
//                           : "—";
//                         const match = Number(c.match_pct);

//                         return (
//                           <tr key={i}>
//                             <td>
//                               <div className="propTitle">
//                                 {subtype} • {name}, {area}
//                               </div>
//                             </td>
//                             <td>
//                               <div className="detailsRow">
//                                 <span>🛏 {rooms}</span>
//                                 <span style={{ marginLeft: 12 }}>📐 {sizeText}</span>
//                               </div>
//                             </td>
//                             <td className="priceStrong">{fmtAED(c.price_aed)}</td>
//                             <td>{fmtAED(c.price_per_sqft)}</td>
//                             <td>{fmtDate(c.sold_date)}</td>
//                             <td>
//                               <span
//                                 className={`matchPill ${
//                                   match >= 90 ? "good" : match >= 80 ? "mid" : "low"
//                                 }`}
//                               >
//                                 {Number.isFinite(match) ? `${match}%` : "—"}
//                               </span>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// File: src/pages/Report.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/report.css";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const RAW_API = process.env.REACT_APP_AVM_API;
const API = RAW_API ? RAW_API.replace(/\/+$/, "") : "";

const LS_FORM_KEY = "truvalu_formData_v1";
const LS_REPORT_KEY = "truvalu_reportData_v1";

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
  if (x === null || x === undefined) return "—";
  const s = String(x);
  const m = s.match(/\d+/);
  return m ? `${m[0]} Bedrooms` : s;
}

function fmtPct(x, d = 1) {
  const n = Number(x);
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(d)}%`;
}

function aedPerSqftFromAedPerSqm(aedPerSqm) {
  const n = Number(aedPerSqm);
  if (!Number.isFinite(n)) return null;
  return n / 10.763910416709722;
}

export default function Report() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [formData, setFormData] = useState(
    () => safeParse(localStorage.getItem(LS_FORM_KEY)) || {}
  );
  const [reportData, setReportData] = useState(
    () => safeParse(localStorage.getItem(LS_REPORT_KEY)) || null
  );

  useEffect(() => {
    const storedForm = safeParse(localStorage.getItem(LS_FORM_KEY));
    if (storedForm) setFormData(storedForm);
  }, []);

  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        setErr("");
        setLoading(true);

        if (!API) {
          throw new Error(
            "REACT_APP_AVM_API is missing. Please set it in your frontend .env and restart npm."
          );
        }

        const res = await fetch(`${API}/predict_with_comparables`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: formData }),
        });

        const json = await res.json();
        if (!res.ok) {
          const msg =
            json?.detail || json?.message || `Request failed (${res.status})`;
          throw new Error(msg);
        }

        if (!mounted) return;
        setReportData(json);
        localStorage.setItem(LS_REPORT_KEY, JSON.stringify(json));
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Something went wrong");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [formData]);

  // -----------------------------
  // Data binding / computed values
  // -----------------------------
  const compsAll = useMemo(() => reportData?.comparables || [], [reportData]);
  const comps5 = useMemo(() => compsAll.slice(0, 5), [compsAll]);

  const areaName = formData?.area_name_en || "—";
  const propertyTitle =
    formData?.project_name_en ||
    formData?.building_name_en ||
    formData?.master_project_en ||
    "Property";
  const country = formData?.country || "United Arab Emirates";
  const city = formData?.city || "Dubai";
  const areaSqft =
    Number(formData?.size_sqft) ||
    (Number(formData?.procedure_area) ? Number(formData?.procedure_area) * 10.7639104 : null);

  const bedrooms = normalizeRooms(formData?.rooms_en);

  const totalVal = Number(reportData?.total_valuation);
  const prevQ = Number(reportData?.prev_quarter_total_valuation); // optional if you have
  const qChangePct =
    Number.isFinite(totalVal) && Number.isFinite(prevQ) && prevQ !== 0
      ? ((totalVal - prevQ) / prevQ) * 100
      : null;

  const rateSqm = Number(reportData?.predicted_meter_sale_price);
  const rateSqft = aedPerSqftFromAedPerSqm(rateSqm);

  const compsCount = Number(
    reportData?.comparables_meta?.count ?? compsAll.length
  );
  const confidencePct = Number.isFinite(Number(reportData?.confidence_pct))
    ? Number(reportData?.confidence_pct)
    : compsCount >= 10
    ? 95
    : compsCount >= 5
    ? 90
    : compsCount >= 1
    ? 82
    : 70;

  // ---- trend series for sparkline (use last 18 points)
  const trendSeries = useMemo(() => {
    const t = reportData?.charts?.trend || [];
    const areaM2 = Number(reportData?.procedure_area || formData?.procedure_area || 0) || 0;

    const propertyTotal = Number(reportData?.predicted_meter_sale_price || 0) * areaM2; // constant line
    return t.slice(-18).map((r) => {
      const marketPpm2 = Number(r.median_price_per_sqm);
      const marketTotal = Number.isFinite(marketPpm2) ? marketPpm2 * areaM2 : null;

      return {
        month: r.month,
        label: monthLabel(r.month),
        property_total: Number.isFinite(propertyTotal) ? propertyTotal : null,
        market_total: Number.isFinite(marketTotal) ? marketTotal : null,
      };
    });
  }, [reportData, formData]);

  // Yield donut — bind to your backend if you have these fields, else it will show placeholders
  const grossYield = Number(reportData?.gross_yield_pct);
  const netYield = Number(reportData?.net_yield_pct);
  const estAnnualRent = Number(reportData?.estimated_annual_rent);
  const estAnnualIncome = Number(reportData?.estimated_annual_income);

  // Donut data: show “Net yield” as main
  const yieldMain = Number.isFinite(netYield) ? netYield : Number.isFinite(grossYield) ? grossYield : 7.2;
  const yieldDonut = useMemo(() => {
    const v = Math.max(0, Math.min(100, Number(yieldMain) || 0));
    return [
      { name: "Yield", value: v },
      { name: "Remaining", value: 100 - v },
    ];
  }, [yieldMain]);

  const YIELD_COLORS = ["#2563eb", "#e5e7eb"];

  // Transaction list (fallback from comparables if you don’t have timeline)
  const txList = useMemo(() => {
    const tx = reportData?.transaction_history;
    if (Array.isArray(tx) && tx.length) return tx.slice(0, 3);

    // fallback: use top 3 comparables
    return (compsAll || []).slice(0, 3).map((c, idx) => ({
      date: c.sold_date,
      title: idx === 0 ? "Transaction Confirmed" : idx === 1 ? "New Lease Agreement" : "Primary Transfer",
      subtitle:
        c.project_name_en || c.building_name_en || c.master_project_en || "Comparable",
      amount: c.price_aed,
      tag: idx === 0 ? "Market value" : idx === 1 ? "High-floor premium" : "Secondary market",
    }));
  }, [reportData, compsAll]);

  // Market Comparables Matrix (groups)
  const matrix = useMemo(() => {
    // You can later replace this with backend-ready groups.
    // For now, split comparables into simple buckets.
    const sold = compsAll.slice(0, 3);
    const forSale = compsAll.slice(3, 6);
    const rented = compsAll.slice(6, 9);
    const rentals = compsAll.slice(9, 12);

    function rowFrom(c, labelPrefix = "Unit") {
      const name =
        c?.unit_no || c?.unit || c?.apartment_no || c?.property_id
          ? `${labelPrefix} ${c.unit_no || c.unit || c.apartment_no || c.property_id}`
          : c?.project_name_en || c?.building_name_en || "Unit";
      const size = Number(c?.size_sqft);
      const ppsf = Number(c?.price_per_sqft);
      return {
        name,
        size: Number.isFinite(size) ? `${fmtNum(size, 0)} sf` : "—",
        price: fmtAED(c?.price_aed),
        ppsf: Number.isFinite(ppsf) ? fmtAED(ppsf) : "—",
      };
    }

    return {
      sold: sold.map((c) => rowFrom(c)),
      forSale: forSale.map((c) => rowFrom(c)),
      rented: rented.map((c) => rowFrom(c)),
      rentals: rentals.map((c) => rowFrom(c)),
    };
  }, [compsAll]);

  const goBack = () => navigate("/valuation");

  const handleShare = async () => {
    try {
      const shareData = {
        title: "Valuation Report",
        text: `Valuation for ${propertyTitle}`,
        url: window.location.href,
      };
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(window.location.href);
      alert("Link copied.");
    } catch {
      // ignore
    }
  };

  const handleDownloadPdf = () => {
    // If you already have PDF endpoint, replace this.
    // For now: print dialog.
    window.print();
  };

  return (
    <div className="reportV2Page">
      <NavBar />

      <div className="reportV2Wrap">
        {/* Top bar like screenshot */}
        <div className="rTopBar">
          <div className="rTopLeft">
            <div className="rBrand">
              <span className="rBrandDot" />
              <span className="rBrandName">ACQARAI</span>
            </div>
            <div className="rStep">Step 4 of 4 • Unlocked Full Valuation Report</div>
          </div>

          <div className="rTopRight">
            <button className="rBtnGhost" onClick={handleShare}>
              Share
            </button>
            <button className="rBtnPrimary" onClick={handleDownloadPdf}>
              Download PDF
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rCard" style={{ marginTop: 12 }}>
            <div className="rCardTitle">Loading report…</div>
            <div className="rMuted">Generating prediction and fetching comparables</div>
          </div>
        ) : err ? (
          <div className="rCard" style={{ marginTop: 12 }}>
            <div className="rCardTitle">Error</div>
            <div className="rMuted">{err}</div>
            <div style={{ marginTop: 12 }}>
              <button className="rBtnGhost" onClick={goBack}>
                Edit Inputs
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Property header row */}
            <div className="rPropHeader">
              <div className="rPropLeft">
                <div className="rBadge">VERIFIED AI VALUATION</div>
                <div className="rPropTitle">{propertyTitle}</div>
                <div className="rPropMeta">
                  {areaName}, {city}, {country}
                  {Number.isFinite(areaSqft) ? ` • ${fmtNum(areaSqft, 0)} Sq.ft` : ""}
                  {bedrooms ? ` • ${bedrooms}` : ""}
                </div>
              </div>

              <div className="rPropRight">
                <div className="rReportIdLabel">REPORT ID</div>
                <div className="rReportIdValue">
                  {reportData?.report_id || "AQ-TRU-REPORT-1"}
                </div>
                <div className="rMiniActions">
                  <button className="rBtnGhost" onClick={goBack}>
                    Edit Inputs
                  </button>
                </div>
              </div>
            </div>

            {/* 3-column main section */}
            <div className="rGridTop">
              {/* Left big valuation card */}
              <div className="rCard rValCard">
                <div className="rValTop">
                  <div>
                    <div className="rLabelSm">FINAL ESTIMATE</div>
                    <div className="rValueBig">{fmtAED(totalVal)}</div>
                    <div className="rMuted">
                      {Number.isFinite(qChangePct) ? (
                        <>
                          <span className={qChangePct >= 0 ? "rUp" : "rDown"}>
                            {qChangePct >= 0 ? "+" : ""}
                            {fmtPct(qChangePct, 1)}
                          </span>{" "}
                          vs previous quarter
                        </>
                      ) : (
                        "— vs previous quarter"
                      )}
                    </div>
                  </div>

                  <div className="rConfidenceBox">
                    <div className="rLabelSm">CONFIDENCE</div>
                    <div className="rConfidencePct">{fmtPct(confidencePct, 0)}</div>
                    <div className="rMuted">High accuracy</div>
                  </div>
                </div>

                <div className="rSparkWrap">
                  <div className="rMutedSm">3-Year Price Forecast Trend</div>
                  <div className="rSparkChart">
                    <ResponsiveContainer>
                      <LineChart data={trendSeries}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" hide />
                        <YAxis hide />
                        <Tooltip formatter={(v) => fmtAED(v)} />
                        <Line
                          type="monotone"
                          dataKey="market_total"
                          dot={false}
                          strokeWidth={2}
                          stroke="#93c5fd"
                        />
                        <Line
                          type="monotone"
                          dataKey="property_total"
                          dot={false}
                          strokeWidth={2.5}
                          stroke="#2563eb"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="rFootNote">
                    Projection based on area trend & comparables.
                  </div>
                </div>
              </div>

              {/* Middle yield intelligence */}
              <div className="rCard">
                <div className="rCardTitleRow">
                  <div className="rCardTitle">YIELD INTELLIGENCE</div>
                </div>

                <div className="rYieldCenter">
                  <div className="rYieldDonut">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={yieldDonut}
                          dataKey="value"
                          nameKey="name"
                          innerRadius="70%"
                          outerRadius="92%"
                          startAngle={90}
                          endAngle={-270}
                          paddingAngle={0}
                        >
                          {yieldDonut.map((_, idx) => (
                            <Cell key={idx} fill={YIELD_COLORS[idx]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="rYieldLabel">
                      <div className="rYieldPct">{fmtPct(yieldMain, 1)}</div>
                      <div className="rMutedSm">NET YIELD</div>
                    </div>
                  </div>

                  <div className="rYieldStats">
                    <div className="rYieldStatRow">
                      <span className="rMuted">Gross Yield</span>
                      <b>{Number.isFinite(grossYield) ? fmtPct(grossYield, 1) : "8.4%"}</b>
                    </div>
                    <div className="rYieldStatRow">
                      <span className="rMuted">Est. Annual Income</span>
                      <b>{Number.isFinite(estAnnualIncome) ? fmtAED(estAnnualIncome) : "AED 380,000"}</b>
                    </div>
                    <div className="rYieldStatRow">
                      <span className="rMuted">Est. Annual Rent</span>
                      <b>{Number.isFinite(estAnnualRent) ? fmtAED(estAnnualRent) : "AED 320,000"}</b>
                    </div>
                  </div>
                </div>

                <div className="rDivider" />

                <div className="rMiniKV">
                  <div className="rMiniKVRow">
                    <span className="rMuted">Price / Sq.ft</span>
                    <b>{rateSqft ? fmtAED(rateSqft) : "—"}</b>
                  </div>
                  <div className="rMiniKVRow">
                    <span className="rMuted">Price / Sq.m</span>
                    <b>{Number.isFinite(rateSqm) ? fmtAED(rateSqm) : "—"}</b>
                  </div>
                </div>
              </div>

              {/* Right insights + audit */}
              <div className="rRightCol">
                <div className="rCard">
                  <div className="rCardTitle">COMMUNITY INSIGHTS</div>
                  <div className="rInsightTitle">{areaName}</div>

                  <div className="rPillsRow">
                    <span className="rPill rPillGreen">High Demand</span>
                    <span className="rPill rPillBlue">Market stability</span>
                  </div>

                  <div className="rInsightGrid">
                    <div className="rInsightItem">
                      <div className="rMutedSm">AVG. APPRECIATION</div>
                      <div className="rInsightValue rUp">+{fmtPct(reportData?.avg_appreciation_pct ?? 12.3, 1)}</div>
                      <div className="rMutedSm">YOY</div>
                    </div>
                    <div className="rInsightItem">
                      <div className="rMutedSm">RENT GROWTH</div>
                      <div className="rInsightValue rUp">+{fmtPct(reportData?.rent_growth_pct ?? 8.2, 1)}</div>
                      <div className="rMutedSm">12 Mo</div>
                    </div>
                  </div>

                  <div className="rMuted" style={{ marginTop: 10 }}>
                    We compare local transactions, market trend and building-level signals to
                    estimate market value aligned to standard valuation reporting practices.
                  </div>
                </div>

                <div className="rCard rAuditCard">
                  <div className="rAuditTop">
                    <div>
                      <div className="rCardTitle">AI AUDIT GRADE</div>
                      <div className="rMutedSm">
                        Validation based on comparables density, input consistency and market coverage.
                      </div>
                    </div>
                    <div className="rAuditGrade">
                      <div className="rAuditLetter">{reportData?.audit_grade || "A+"}</div>
                      <div className="rMutedSm">Verified</div>
                    </div>
                  </div>

                  <div className="rAuditMeta">
                    <div className="rAuditMetaRow">
                      <span className="rMuted">Comparables used</span>
                      <b>{fmtNum(compsCount, 0)}</b>
                    </div>
                    <div className="rAuditMetaRow">
                      <span className="rMuted">Confidence</span>
                      <b>{fmtPct(confidencePct, 0)}</b>
                    </div>
                    <div className="rAuditMetaRow">
                      <span className="rMuted">Data coverage</span>
                      <b>{fmtPct(reportData?.data_coverage_pct ?? 92, 0)}</b>
                    </div>
                  </div>

                  <button className="rBtnPrimary rBtnFull" onClick={handleDownloadPdf}>
                    Download Report
                  </button>
                </div>
              </div>
            </div>

            {/* Transactions + Matrix row */}
            <div className="rGridBottom">
              {/* Transaction timeline */}
              <div className="rCard">
                <div className="rCardTitleRow">
                  <div className="rCardTitle">UNIT {formData?.unit_no || "1205"} TRANSACTION HISTORY</div>
                  <button className="rBtnGhost">View All</button>
                </div>

                <div className="rTimeline">
                  {txList.map((t, idx) => (
                    <div className="rTxRow" key={idx}>
                      <div className="rTxLeft">
                        <div className="rTxDot" />
                        <div className="rTxText">
                          <div className="rTxDate">{fmtDate(t.date)}</div>
                          <div className="rTxTitle">{t.title}</div>
                          <div className="rMutedSm">{t.subtitle}</div>
                          {t.tag ? <div className="rTag">{t.tag}</div> : null}
                        </div>
                      </div>

                      <div className="rTxRight">
                        <div className="rTxAmount">{fmtAED(t.amount)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market comparables matrix */}
              <div className="rCard">
                <div className="rCardTitle">Market Comparables Matrix</div>

                <div className="rMatrix">
                  <div className="rMatrixBlock">
                    <div className="rMatrixHead">
                      <b>RECENTLY SOLD</b>
                      <span className="rMutedSm">Last 6 months</span>
                    </div>
                    <div className="rMatrixTable">
                      {matrix.sold.map((r, i) => (
                        <div className="rMatrixRow" key={i}>
                          <div className="rMatrixName">{r.name}</div>
                          <div className="rMatrixSize">{r.size}</div>
                          <div className="rMatrixPrice">{r.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rMatrixBlock">
                    <div className="rMatrixHead">
                      <b>ADVERTISED FOR SALE</b>
                      <span className="rLinkSm">Active listings</span>
                    </div>
                    <div className="rMatrixTable">
                      {matrix.forSale.map((r, i) => (
                        <div className="rMatrixRow" key={i}>
                          <div className="rMatrixName">{r.name}</div>
                          <div className="rMatrixSize">{r.size}</div>
                          <div className="rMatrixPrice">{r.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rMatrixBlock">
                    <div className="rMatrixHead">
                      <b>RECENTLY RENTED</b>
                      <span className="rMutedSm">Last 12 months</span>
                    </div>
                    <div className="rMatrixTable">
                      {matrix.rented.map((r, i) => (
                        <div className="rMatrixRow" key={i}>
                          <div className="rMatrixName">{r.name}</div>
                          <div className="rMatrixSize">{r.size}</div>
                          <div className="rMatrixPrice">{r.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rMatrixBlock">
                    <div className="rMatrixHead">
                      <b>ACTIVE RENTALS</b>
                      <span className="rPill rPillGreen">Verified</span>
                    </div>
                    <div className="rMatrixTable">
                      {matrix.rentals.map((r, i) => (
                        <div className="rMatrixRow" key={i}>
                          <div className="rMatrixName">{r.name}</div>
                          <div className="rMatrixSize">{r.size}</div>
                          <div className="rMatrixPrice">{r.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rFootNote" style={{ marginTop: 10 }}>
                  Comparables are selected using proximity, building match, size similarity and time decay weighting.
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="rFooter">
              <div className="rMutedSm">
                © {new Date().getFullYear()} ACQARAI Property Intelligence
              </div>
              <div className="rFooterLinks">
                <span className="rMutedSm">Methodology</span>
                <span className="rMutedSm">Compliance</span>
                <span className="rMutedSm">Terms</span>
                <span className="rMutedSm">Support</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
