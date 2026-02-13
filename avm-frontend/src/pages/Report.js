// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import "../styles/report.css";
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
//   return m ? `${m[0]} BR` : s;
// }
// function fmtPct(x, d = 0) {
//   const n = Number(x);
//   if (!Number.isFinite(n)) return "—";
//   return `${n.toFixed(d)}%`;
// }
// function aedPerSqftFromAedPerSqm(aedPerSqm) {
//   const n = Number(aedPerSqm);
//   if (!Number.isFinite(n)) return null;
//   return n / 10.763910416709722;
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

//   // ✅ NEW: Header avatar initials (safe, no functionality change)
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

//   // ✅ load valuation from DB when id exists
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
//     return () => {
//       alive = false;
//     };
//   }, [valuationId]);

//   // keep localStorage form in sync ONLY when no id (latest flow)
//   useEffect(() => {
//     if (valuationId) return;
//     const storedForm = safeParse(localStorage.getItem(LS_FORM_KEY));
//     if (storedForm) setFormData(storedForm);
//   }, [valuationId]);

//   // ✅ run prediction whenever formData changes (from DB or LS)
//   useEffect(() => {
//     let mounted = true;

//     async function run() {
//       try {
//         setErr("");
//         setLoading(true);

//         if (!API) {
//           throw new Error("REACT_APP_AVM_API is missing. Please set it in your frontend .env and restart npm.");
//         }

//         if (!formData || Object.keys(formData).length === 0) {
//           throw new Error("No form data found for this report.");
//         }

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

//         if (!valuationId) {
//           localStorage.setItem(LS_REPORT_KEY, JSON.stringify(json));
//         }

//         if (!savedRef.current) {
//           const valuationRowId = localStorage.getItem(LS_VAL_ROW_ID);
//           const est = Number(json?.total_valuation);

//           if (valuationRowId && Number.isFinite(est)) {
//             savedRef.current = true;

//             const { error: upErr } = await supabase
//               .from("valuations")
//               .update({
//                 estimated_valuation: est,
//                 updated_at: new Date().toISOString(),
//               })
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
//     return () => {
//       mounted = false;
//     };
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

//   const stabilityLabel = reportData?.stability_label || "Stable";

//   const modelName = reportData?.model_name || "XGBoost + K-Nearest Neighbors";
//   const modelAcc = reportData?.model_accuracy || "94.2%";
//   const modelUpdated = reportData?.model_updated || "2026-01-23";

//   // ✅ Report + New Header responsive CSS (NO functionality change)
//   const MOBILE_CSS = `
//     .reportPage { width: 100%; overflow-x: hidden; background: #f3f4f6; }

//     /* ✅ New header styles */
//     .rhdr {
//       position: sticky;
//       top: 0;
//       z-index: 50;
//       background: #ffffff;
//       border-bottom: 1px solid #e5e7eb;
//     }
//     .rhdrInner {
//       max-width: 1200px;
//       margin: 0 auto;
//       width: 100%;
//       height: 64px;
//       display: flex;
//       align-items: center;
//       justify-content: space-between;
//       gap: 14px;
//       padding: 0 18px;
//       box-sizing: border-box;
//     }
//     .rhdrLeft { display: flex; align-items: center; gap: 10px; min-width: 0; }
//     .rhdrLogoBox {
//       width: 34px; height: 34px; border-radius: 9px;
//       display: grid; place-items: center;
//       background: #111827; color: #fff; font-weight: 900; flex: 0 0 auto;
//     }
//     .rhdrBrand {
//       font-weight: 900; letter-spacing: 1.8px; color: #111827;
//       white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
//     }
//     .rhdrCenter { display: flex; justify-content: center; flex: 1; min-width: 0; }
//     .rhdrPill {
//       display: inline-flex; align-items: center; justify-content: center;
//       padding: 8px 14px; border-radius: 999px;
//       background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412;
//       font-weight: 900; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;
//       white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
//     }
//     .rhdrRight { display: flex; align-items: center; gap: 12px; flex: 0 0 auto; }
//     .rhdrPortal {
//       font-size: 11px; letter-spacing: 2px; color: #9ca3af;
//       font-weight: 800; text-transform: uppercase; white-space: nowrap;
//     }
//     .rhdrAvatar {
//       width: 34px; height: 34px; border-radius: 999px;
//       background: #b45309; color: #fff; font-weight: 900;
//       display: grid; place-items: center;
//       box-shadow: 0 10px 18px rgba(180,83,9,0.25);
//       flex: 0 0 auto; font-size: 12px;
//     }
//     .rhdrBanner {
//       max-width: 1200px; margin: 0 auto; width: 100%;
//       padding: 10px 18px 12px; box-sizing: border-box;
//       color: #b45309; font-weight: 800; text-align: center;
//       font-size: 12px; background: #ffffff;
//     }

//     /* Prevent long strings from breaking layout */
//     .reportTitle, .reportSub, .heroName, .heroLoc, .modelTitle, .modelSub, .empty2, .card2Hint {
//       word-break: break-word;
//       overflow-wrap: anywhere;
//     }

//     /* Make wide tables scroll horizontally on mobile */
//     .tableWrap2 { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
//     .compsTable { min-width: 900px; }

//     /* Charts wrapper safe */
//     .chartsRow > .card2 { min-width: 0; }

//     @media (max-width: 980px) {
//       .reportWrap { padding-left: 14px; padding-right: 14px; }
//       .topRow { gap: 12px; }
//       .topActions { flex-shrink: 0; }
//       .rhdrInner { padding: 0 14px; }
//       .rhdrBanner { padding: 10px 14px 12px; }
//     }

//     @media (max-width: 768px) {
//   /* ✅ Header becomes 2-row layout */
//   .rhdrInner{
//     height: auto !important;
//     padding: 10px 12px !important;
//     display: grid !important;
//     grid-template-columns: 1fr auto !important;
//     grid-template-areas:
//       "left right"
//       "center center" !important;
//     row-gap: 8px !important;
//     align-items: center !important;
//   }

//   .rhdrLeft { grid-area: left !important; }
//   .rhdrRight { grid-area: right !important; }
//   .rhdrCenter{
//     grid-area: center !important;
//     justify-content: center !important;
//     width: 100% !important;
//   }

//   /* hide portal text on mobile (already) */
//   .rhdrPortal{ display:none !important; }

//   /* ✅ pill: smaller + centered */
//   .rhdrPill{
//     width: fit-content !important;
//     max-width: 100% !important;
//     font-size: 11px !important;
//     padding: 7px 12px !important;
//   }

//   /* ✅ brand text smaller */
//   .rhdrBrand{
//     font-size: 13px !important;
//     letter-spacing: 1.2px !important;
//   }

//   /* ✅ banner: tighter + better readability */
//   .rhdrBanner{
//     padding: 10px 12px 12px !important;
//     font-size: 11px !important;
//     line-height: 1.35 !important;
//   }
// }

// @media (max-width: 420px) {
//   /* extra tiny screens */
//   .rhdrLogoBox{ width: 30px !important; height: 30px !important; }
//   .rhdrAvatar{ width: 30px !important; height: 30px !important; font-size: 11px !important; }
//   .rhdrPill{ font-size: 10.5px !important; padding: 6px 10px !important; }
// }

//   `;


//   return (
//     <div className="reportPage">
//       <style>{MOBILE_CSS}</style>

//       {/* ✅ NEW Header (replaces old NavBar logic on Report screen) */}
//      {/* Header */}
// <div className="rhdr">
//   <div className="rhdrInner">
//     <div className="rhdrLeft">
//       <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-[#2B2B2B] uppercase whitespace-nowrap">
//         ACQAR
//       </h1>
//     </div>

//     <div className="rhdrCenter">
//       <div className="rhdrPill">VALUcheck™ REPORT</div>
//     </div>

//     <div className="rhdrRight">
//       <div className="rhdrPortal">INVESTOR PORTAL</div>
//       <div className="rhdrAvatar" title="User">
//         {headerInitials}
//       </div>
//     </div>
//   </div>

//   <div className="rhdrBanner">
//     🎉 Early Customer Offer: ValuCheck™ is <b>FREE</b> for First <b>1000 Customers!</b>.
//   </div>
// </div>

//       <div className="reportWrap">
//         <div className="topRow">
//           <div>
//             <div className="reportTitle">Valuation Report</div>
//             <div className="reportSub">
//               {formData?.area_name_en ? `${formData.area_name_en}` : ""}
//               {formData?.property_type_en ? ` • ${formData.property_type_en}` : ""}
//               {formData?.project_name_en ? ` • ${formData.project_name_en}` : ""}
//               {formData?.rooms_en ? ` • ${normalizeRooms(formData.rooms_en)}` : ""}
//               {valuationId ? ` • ID: ${valuationId}` : ""}
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
//           </div>
//         ) : (
//           <>
//             <div className="heroCard" style={{ marginTop: 14 }}>
//               <div className="heroTop">
//                 <div className="heroLeft">
//                   <div className="heroIcon" aria-hidden="true">
//                     ▦
//                   </div>

//                   <div className="heroMeta">
//                     <div className="heroName">
//                       {projectName} <span className="heroDot">•</span>{" "}
//                       {String(propertyType).toLowerCase()}
//                     </div>

//                     <div className="heroLoc">
//                       {areaName}
//                       {subArea ? ` • ${subArea}` : ""}
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
//                       <span className="shield" aria-hidden="true">
//                         🛡
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="modelStrip">
//                 <div className="modelIcon" aria-hidden="true">
//                   ⚙
//                 </div>
//                 <div className="modelText">
//                   <div className="modelTitle">ML Model: {modelName}</div>
//                   <div className="modelSub">
//                     {modelAcc} accuracy • Updated {fmtDate(modelUpdated)}
//                   </div>
//                 </div>
//               </div>
//             </div>

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

//             <div className="card2" style={{ marginTop: 14 }}>
//               <div className="card2Title">Comparable Properties</div>
//               <div className="card2Hint">Recently sold properties similar to yours</div>

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
//                         const sizeText = Number.isFinite(sizeSqft) ? `${fmtNum(sizeSqft, 0)} sq.ft` : "—";
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


import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import "../styles/report.css";
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
  return m ? `${m[0]} BR` : s;
}
function fmtPct(x, d = 0) {
  const n = Number(x);
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(d)}%`;
}
function aedPerSqftFromAedPerSqm(aedPerSqm) {
  const n = Number(aedPerSqm);
  if (!Number.isFinite(n)) return null;
  return n / 10.763910416709722;
}

/* ✅ HEADER (logo only) */
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
      {/* spacer for fixed header */}
      <div className="acqHdrLiteSpacer" />
    </>
  );
}

/* ✅ FOOTER (your provided footer, unchanged) */
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

  const location = useLocation(); // ✅ add this (you already import useLocation)

  // ✅ ADD THIS EFFECT (place it near the top, after hooks)
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

 

  

  // ✅ NEW: Header avatar initials (safe, no functionality change)
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

  // ✅ load valuation from DB when id exists
  useEffect(() => {
    let alive = true;

    async function loadValuation() {
      try {
        if (!valuationId) return;

        setErr("");
        setLoading(true);

        const { data, error } = await supabase
          .from("valuations")
          .select("id, form_payload, estimated_valuation, created_at, updated_at")
          .eq("id", valuationId)
          .single();

        if (!alive) return;

        if (error) throw error;
        if (!data?.form_payload) throw new Error("This valuation has no saved form_payload.");

        setValRow(data);

        setFormData(data.form_payload);

        localStorage.setItem(LS_VAL_ROW_ID, String(data.id));
      } catch (e) {
        if (!alive) return;
        setErr(e?.message || "Failed to load valuation");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    loadValuation();
    return () => {
      alive = false;
    };
  }, [valuationId]);

  // keep localStorage form in sync ONLY when no id (latest flow)
  useEffect(() => {
    if (valuationId) return;
    const storedForm = safeParse(localStorage.getItem(LS_FORM_KEY));
    if (storedForm) setFormData(storedForm);
  }, [valuationId]);

  // ✅ run prediction whenever formData changes (from DB or LS)
  useEffect(() => {
    let mounted = true;

    async function run() {
      try {
        setErr("");
        setLoading(true);

        if (!API) {
          throw new Error("REACT_APP_AVM_API is missing. Please set it in your frontend .env and restart npm.");
        }

        if (!formData || Object.keys(formData).length === 0) {
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

        if (!valuationId) {
          localStorage.setItem(LS_REPORT_KEY, JSON.stringify(json));
        }

        if (!savedRef.current) {
          const valuationRowId = localStorage.getItem(LS_VAL_ROW_ID);
          const est = Number(json?.total_valuation);

          if (valuationRowId && Number.isFinite(est)) {
            savedRef.current = true;

            const { error: upErr } = await supabase
              .from("valuations")
              .update({
                estimated_valuation: est,
                updated_at: new Date().toISOString(),
              })
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
    return () => {
      mounted = false;
    };
  }, [formData, valuationId]);

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
  }, [reportData, formData]);

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

  // keep your pie colors (chart only)
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

  const stabilityLabel = reportData?.stability_label || "Stable";

  const modelName = reportData?.model_name || "XGBoost + K-Nearest Neighbors";
  const modelAcc = reportData?.model_accuracy || "94.2%";
  const modelUpdated = reportData?.model_updated || "2026-01-23";

  // ✅ Theme colors aligned with header (#2B2B2B + #B87333 + soft grays)
  const MOBILE_CSS = `
    :root{
      --acq-text: #2B2B2B;
      --acq-accent: #B87333;
      --acq-border: #E5E7EB;
      --acq-muted: rgba(43,43,43,0.58);
      --acq-bg: #F9F9F9;
      --acq-card: #FFFFFF;
      --acq-accent-soft: rgba(184,115,51,0.12);
    }

    .reportPage { width: 100%; overflow-x: hidden; background: var(--acq-bg); color: var(--acq-text); }

    /* ✅ HEADER LITE */
    .acqHdrLite{
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 60;
      background: #fff;
      border-bottom: 1px solid #D4D4D4;
    }
    .acqHdrLiteInner{
      max-width: 80rem;
      margin: 0 auto;
      height: 80px;
      display:flex;
      align-items:center;
      padding: 0 16px;
      box-sizing: border-box;
    }
    .acqHdrLogo{
      display:flex;
      align-items:center;
      cursor:pointer;
      user-select:none;
      white-space:nowrap;
    }
    .acqHdrLogo h1{
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.04em;
      color: var(--acq-text);
      text-transform: uppercase;
      margin: 0;
    }
    .acqHdrLiteSpacer{ height: 80px; }

    @media (max-width: 420px){
      .acqHdrLiteInner{ height: 72px; padding: 0 12px; }
      .acqHdrLiteSpacer{ height: 72px; }
      .acqHdrLogo h1{ font-size: 18px; letter-spacing: -0.02em; }
    }

    /* ✅ ALIGN REPORT UI COLORS TO HEADER THEME */
    .reportWrap{ max-width: 1200px; }

    .reportTitle{ color: var(--acq-text); }
    .reportSub{ color: var(--acq-muted); }

    .btnSecondary{
      border-color: var(--acq-border) !important;
      color: var(--acq-text) !important;
      background: #fff !important;
    }
    .btnSecondary:hover{
      border-color: var(--acq-accent) !important;
      box-shadow: 0 10px 22px rgba(184,115,51,0.12);
    }

    .heroCard,
    .card2{
      background: var(--acq-card) !important;
      border: 1px solid var(--acq-border) !important;
    }

    .heroValue{ color: var(--acq-text) !important; }
    .pill{
      background: var(--acq-accent-soft) !important;
      border: 1px solid rgba(184,115,51,0.28) !important;
      color: var(--acq-accent) !important;
      font-weight: 900 !important;
    }

    .modelStrip{
      border-top: 1px solid var(--acq-border) !important;
      background: #fff !important;
    }

    .statCard{
      border: 1px solid var(--acq-border) !important;
      background: #fff !important;
    }
    .statLabel{ color: rgba(43,43,43,0.60) !important; }
    .statValue{ color: var(--acq-text) !important; }
    .statCardOk{
      border-color: rgba(184,115,51,0.35) !important;
      background: var(--acq-accent-soft) !important;
    }

    .priceStrong{ color: var(--acq-text) !important; }

    .compsTable thead th{
      color: var(--acq-text) !important;
      border-bottom: 1px solid var(--acq-border) !important;
    }
    .compsTable td{
      border-bottom: 1px solid var(--acq-border) !important;
    }

    .matchPill.good{
      background: rgba(184,115,51,0.12) !important;
      border: 1px solid rgba(184,115,51,0.35) !important;
      color: var(--acq-accent) !important;
    }

    /* Prevent long strings from breaking layout */
    .reportTitle, .reportSub, .heroName, .heroLoc, .modelTitle, .modelSub, .empty2, .card2Hint {
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    /* Make wide tables scroll horizontally on mobile */
    .tableWrap2 { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    .compsTable { min-width: 900px; }

    /* Charts wrapper safe */
    .chartsRow > .card2 { min-width: 0; }

    @media (max-width: 980px) {
      .reportWrap { padding-left: 14px; padding-right: 14px; }
      .topRow { gap: 12px; }
      .topActions { flex-shrink: 0; }
    }
  `;

  return (
    <div className="reportPage">
      <style>{MOBILE_CSS}</style>

      {/* ✅ Header added (logo only). Click logo -> landing page */}
      <HeaderLite />

      <div className="reportWrap">
        <div className="topRow">
          <div>
            <div className="reportTitle">Valuation Report</div>
            <div className="reportSub">
              {formData?.area_name_en ? `${formData.area_name_en}` : ""}
              {formData?.property_type_en ? ` • ${formData.property_type_en}` : ""}
              {formData?.project_name_en ? ` • ${formData.project_name_en}` : ""}
              {formData?.rooms_en ? ` • ${normalizeRooms(formData.rooms_en)}` : ""}
              {valuationId ? ` • ID: ${valuationId}` : ""}
            </div>
          </div>

          <div className="topActions">
            <button className="btnSecondary" onClick={goBack}>
              Edit Inputs
            </button>
          </div>
        </div>

        {loading ? (
          <div className="card2" style={{ marginTop: 14 }}>
            <div className="card2Title">Loading report…</div>
            <div className="card2Hint">Generating prediction and fetching comparables</div>
          </div>
        ) : err ? (
          <div className="card2" style={{ marginTop: 14 }}>
            <div className="card2Title">Error</div>
            <div className="empty2">{err}</div>
          </div>
        ) : (
          <>
            <div className="heroCard" style={{ marginTop: 14 }}>
              <div className="heroTop">
                <div className="heroLeft">
                  <div className="heroIcon" aria-hidden="true">
                    ▦
                  </div>

                  <div className="heroMeta">
                    <div className="heroName">
                      {projectName} <span className="heroDot">•</span>{" "}
                      {String(propertyType).toLowerCase()}
                    </div>

                    <div className="heroLoc">
                      {areaName}
                      {subArea ? ` • ${subArea}` : ""}
                    </div>

                    <div className="heroValue">{fmtAED(reportData?.total_valuation)}</div>

                    <div className="heroRangeRow">
                      <div className="heroRangeText">
                        Range: <b>{rangeLow ? fmtAED(rangeLow) : "—"}</b> –{" "}
                        <b>{rangeHigh ? fmtAED(rangeHigh) : "—"}</b>
                      </div>
                      <span className="pill">{stabilityLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="heroRight">
                  <div className="statCard">
                    <div className="statLabel">Price/Sq.ft</div>
                    <div className="statValue">{rateSqft ? fmtAED(rateSqft) : "—"}</div>
                  </div>

                  <div className="statCard">
                    <div className="statLabel">Confidence</div>
                    <div className="statValueRow">
                      <div className="statValue">{fmtPct(confidencePct, 0)}</div>
                      <span className="okDot" aria-hidden="true" />
                    </div>
                  </div>

                  <div className="statCard statCardOk">
                    <div className="statLabel">RICS</div>
                    <div className="statValueRow">
                      <div className="statValue">OK</div>
                      <span className="shield" aria-hidden="true">
                        🛡
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modelStrip">
                <div className="modelIcon" aria-hidden="true">
                  ⚙
                </div>
                <div className="modelText">
                  <div className="modelTitle">ML Model: {modelName}</div>
                  <div className="modelSub">
                    {modelAcc} accuracy • Updated {fmtDate(modelUpdated)}
                  </div>
                </div>
              </div>
            </div>

            <div className="card2" style={{ marginTop: 14 }}>
              <div className="card2Title">Estimated Value</div>

              <div className="summaryGrid">
                <div className="summaryItem">
                  <div className="k">Total Valuation</div>
                  <div className="v">{fmtAED(reportData?.total_valuation)}</div>
                </div>
                <div className="summaryItem">
                  <div className="k">Rate (AED/m²)</div>
                  <div className="v">{fmtNum(reportData?.predicted_meter_sale_price, 0)}</div>
                </div>
                <div className="summaryItem">
                  <div className="k">Area (m²)</div>
                  <div className="v">{fmtNum(reportData?.procedure_area, 2)}</div>
                </div>
              </div>
            </div>

            <div className="chartsRow">
              <div className="card2">
                <div className="card2Title">Historical Value Trend</div>
                <div className="card2Hint">Property Value vs Market Average</div>

                {trendSeries.length < 2 ? (
                  <div className="empty2">No trend data for this area</div>
                ) : (
                  <div style={{ width: "100%", height: 280, marginTop: 10 }}>
                    <ResponsiveContainer>
                      <AreaChart data={trendSeries}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" interval={5} />
                        <YAxis tickFormatter={(v) => fmtNum(v / 1000000, 1) + "M"} />
                        <Tooltip formatter={(v) => fmtAED(v)} />
                        <Area type="monotone" dataKey="market_total" fillOpacity={0.2} />
                        <Line type="monotone" dataKey="property_total" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="card2">
                <div className="card2Title">Valuation Factors Weight</div>
                <div className="card2Hint">Indicative weights</div>

                <div style={{ width: "100%", height: 280, marginTop: 10 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={factorWeights}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={2}
                      >
                        {factorWeights.map((_, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="card2" style={{ marginTop: 14 }}>
              <div className="card2Title">Comparable Properties</div>
              <div className="card2Hint">Recently sold properties similar to yours</div>

              {comps5.length === 0 ? (
                <div className="empty2">
                  No comparables found. Try adjusting district / project / bedrooms / size.
                </div>
              ) : (
                <div className="tableWrap2">
                  <table className="compsTable">
                    <thead>
                      <tr>
                        <th>Property</th>
                        <th>Details</th>
                        <th>Price</th>
                        <th>Price/Sq.ft</th>
                        <th>Sold Date</th>
                        <th>Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comps5.map((c, i) => {
                        const subtype = c.property_sub_type_en || c.property_type_en || "Property";
                        const name =
                          c.project_name_en || c.building_name_en || c.master_project_en || "Property";
                        const area = c.area_name_en || "—";
                        const rooms = normalizeRooms(c.rooms_en) || "—";
                        const sizeSqft = Number(c.size_sqft);
                        const sizeText = Number.isFinite(sizeSqft) ? `${fmtNum(sizeSqft, 0)} sq.ft` : "—";
                        const match = Number(c.match_pct);

                        return (
                          <tr key={i}>
                            <td>
                              <div className="propTitle">
                                {subtype} • {name}, {area}
                              </div>
                            </td>
                            <td>
                              <div className="detailsRow">
                                <span>🛏 {rooms}</span>
                                <span style={{ marginLeft: 12 }}>📐 {sizeText}</span>
                              </div>
                            </td>
                            <td className="priceStrong">{fmtAED(c.price_aed)}</td>
                            <td>{fmtAED(c.price_per_sqft)}</td>
                            <td>{fmtDate(c.sold_date)}</td>
                            <td>
                              <span
                                className={`matchPill ${match >= 90 ? "good" : match >= 80 ? "mid" : "low"}`}
                              >
                                {Number.isFinite(match) ? `${match}%` : "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ✅ Footer added */}
      <Footer />
    </div>
  );
}
