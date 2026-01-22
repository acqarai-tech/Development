// import React, { useMemo, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import NavBar from "../components/NavBar";
// import "../styles/report.css";

// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   LineChart,
//   Line,
//   CartesianGrid,
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

// function formatNumber(x, digits = 0) {
//   if (x === null || x === undefined || Number.isNaN(Number(x))) return "—";
//   return Number(x).toLocaleString(undefined, { maximumFractionDigits: digits });
// }
// function formatAED(x) {
//   return `${formatNumber(x, 0)} AED`;
// }
// function todayParts() {
//   const d = new Date();
//   return { y: d.getFullYear(), m: d.getMonth() + 1, day: d.getDate() };
// }

// export default function Report({ formData, reportData, setReportData }) {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState("");

//   const [localForm, setLocalForm] = useState(() =>
//     safeParse(localStorage.getItem(LS_FORM_KEY))
//   );
//   const [localReport, setLocalReport] = useState(() =>
//     safeParse(localStorage.getItem(LS_REPORT_KEY))
//   );

//   // Re-check localStorage once after mount (helps in strict mode / refresh / hot reload)
//   useEffect(() => {
//     const f = safeParse(localStorage.getItem(LS_FORM_KEY));
//     const r = safeParse(localStorage.getItem(LS_REPORT_KEY));
//     if (!formData && f) setLocalForm(f);
//     if (!reportData && r) setLocalReport(r);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   // Keep local cache in sync when flow provides new data
//   useEffect(() => {
//     if (formData) {
//       setLocalForm(formData);
//       localStorage.setItem(LS_FORM_KEY, JSON.stringify(formData));
//     }
//   }, [formData]);

//   useEffect(() => {
//     if (reportData) {
//       setLocalReport(reportData);
//       localStorage.setItem(LS_REPORT_KEY, JSON.stringify(reportData));
//     }
//   }, [reportData]);

//   const effectiveForm = formData || localForm;
//   const effectiveReport = reportData || localReport;

//   const payload = useMemo(() => {
//     if (!effectiveForm) return null;
//     const { y, m, day } = todayParts();

//     return {
//       data: {
//         ...effectiveForm,
//         rooms_en: `${effectiveForm.bedrooms} B/R`,
//         has_parking: Number(effectiveForm.parking_spaces) > 0 ? 1 : 0,
//         instance_year: y,
//         instance_month: m,
//         instance_day: day,
//       },
//     };
//   }, [effectiveForm]);

//   async function postJSON(path, body) {
//     const url = `${API}${path}`;

//     const res = await fetch(url, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(body),
//     });

//     let data;
//     const text = await res.text();
//     try {
//       data = text ? JSON.parse(text) : null;
//     } catch {
//       data = text;
//     }

//     if (!res.ok) {
//       const msg =
//         (data && typeof data === "object" && data.detail && String(data.detail)) ||
//         (typeof data === "string" && data) ||
//         `HTTP ${res.status}`;
//       throw new Error(msg);
//     }

//     return data;
//   }

//   async function loadReport() {
//     if (!payload) return;

//     if (!API) {
//       setErr(
//         "Missing REACT_APP_AVM_API. Set it in Render Static Site → Settings → Environment Variables, then redeploy."
//       );
//       return;
//     }

//     setLoading(true);
//     setErr("");

//     try {
//       const pred = await postJSON("/predict", payload);

//       let comps = [];
//       try {
//         const c = await postJSON("/comparables", payload);
//         comps = c?.comparables || [];
//       } catch {
//         comps = [];
//       }

//       let charts = { distribution: [], trend: [] };
//       try {
//         const ch = await postJSON("/charts", payload);
//         charts = {
//           distribution: ch?.distribution || [],
//           trend: ch?.trend || [],
//         };
//       } catch {
//         charts = { distribution: [], trend: [] };
//       }

//       const next = { pred, comps, charts };

//       if (typeof setReportData === "function") setReportData(next);

//       setLocalReport(next);
//       localStorage.setItem(LS_REPORT_KEY, JSON.stringify(next));
//     } catch (e) {
//       setErr(e?.message || "Error generating report");
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Auto-run once when page opens (only if we have form data)
//   useEffect(() => {
//     if (!effectiveReport && payload) loadReport();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [payload]);

//   const compsBar = useMemo(() => {
//     return (effectiveReport?.comps || []).slice(0, 10).map((c, idx) => ({
//       name: `Comp ${idx + 1}`,
//       price: Number(c.meter_sale_price || 0),
//     }));
//   }, [effectiveReport]);

//   const distData = useMemo(() => {
//     return (effectiveReport?.charts?.distribution || []).map((b) => ({
//       bin: `${Math.round(b.bin_start)}–${Math.round(b.bin_end)}`,
//       count: b.count,
//     }));
//   }, [effectiveReport]);

//   const trendData = useMemo(() => {
//     return (effectiveReport?.charts?.trend || []).map((t) => ({
//       month: t.month,
//       median: Number(t.median_meter_sale_price || 0),
//     }));
//   }, [effectiveReport]);

//   const pred = effectiveReport?.pred;

//   return (
//     <div className="reportBg">
//       <NavBar />

//       <div className="reportContainer">
//         <div className="reportTop">
//           <div>
//             <div className="reportTitle">Valuation Report</div>
//             <div className="reportSub">
//               {effectiveForm?.building_name_en || "—"} •{" "}
//               {effectiveForm?.area_name_en || "—"} •{" "}
//               {effectiveForm?.property_type_en || "—"}
//             </div>
//           </div>

//           <div className="reportActions">
//             {!effectiveForm ? (
//               <button className="btnPrimary2" onClick={() => navigate("/valuation")}>
//                 Go to Valuation Form
//               </button>
//             ) : (
//               <>
//                 <button className="btnGhost" onClick={() => navigate("/valuation")}>
//                   Edit details
//                 </button>
//                 <button className="btnPrimary2" onClick={loadReport} disabled={loading}>
//                   {loading ? "Refreshing…" : "Refresh report"}
//                 </button>
//               </>
//             )}
//           </div>
//         </div>

//         {err && <div className="errorBox2">Error: {err}</div>}

//         <div className="kpiGrid">
//           <KPI label="Estimated Value" value={pred ? formatAED(pred.total_valuation) : "—"} />
//           <KPI
//             label="Price / m²"
//             value={pred ? `${formatNumber(pred.predicted_meter_sale_price)} AED/m²` : "—"}
//           />
//           <KPI
//             label="Area (m²)"
//             value={effectiveForm ? formatNumber(effectiveForm.procedure_area, 2) : "—"}
//           />
//           <KPI
//             label="Bedrooms / Bathrooms"
//             value={
//               effectiveForm ? `${effectiveForm.bedrooms} / ${effectiveForm.bathrooms}` : "—"
//             }
//           />
//         </div>

//         <div className="twoCol">
//           <div className="card2">
//             <div className="card2Title">Market Distribution</div>
//             <div className="card2Hint">Price/m² histogram for this area</div>

//             {distData.length === 0 ? (
//               <div className="empty2">Not enough data for distribution.</div>
//             ) : (
//               <div className="chartBox">
//                 <ResponsiveContainer width="100%" height={260}>
//                   <BarChart data={distData}>
//                     <XAxis dataKey="bin" hide />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="count" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             )}
//           </div>

//           <div className="card2">
//             <div className="card2Title">Market Trend</div>
//             <div className="card2Hint">Monthly median price/m²</div>

//             {trendData.length === 0 ? (
//               <div className="empty2">No trend data available.</div>
//             ) : (
//               <div className="chartBox">
//                 <ResponsiveContainer width="100%" height={260}>
//                   <LineChart data={trendData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="month" />
//                     <YAxis />
//                     <Tooltip />
//                     <Line type="monotone" dataKey="median" dot={false} />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="card2" style={{ marginTop: 14 }}>
//           <div className="card2Title">Comparables</div>
//           <div className="card2Hint">Top similar transactions (if available)</div>

//           {!effectiveReport?.comps || effectiveReport.comps.length === 0 ? (
//             <div className="empty2">No comparables found for the current filters.</div>
//           ) : (
//             <>
//               <div className="chartBox" style={{ marginBottom: 12 }}>
//                 <ResponsiveContainer width="100%" height={240}>
//                   <BarChart data={compsBar}>
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="price" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>

//               <div className="tableWrap2">
//                 <table>
//                   <thead>
//                     <tr>
//                       <th>Date</th>
//                       <th>Area</th>
//                       <th>Building</th>
//                       <th>Project</th>
//                       <th>Rooms</th>
//                       <th>Size</th>
//                       <th>Price/m²</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {effectiveReport.comps.slice(0, 10).map((c, i) => (
//                       <tr key={i}>
//                         <td>{c.instance_date || "—"}</td>
//                         <td>{c.area_name_en || "—"}</td>
//                         <td>{c.building_name_en || "—"}</td>
//                         <td>{c.project_name_en || "—"}</td>
//                         <td>{c.rooms_en || "—"}</td>
//                         <td>{c.procedure_area ?? "—"}</td>
//                         <td>{formatNumber(c.meter_sale_price)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </>
//           )}
//         </div>

//         <div className="footer2">© {new Date().getFullYear()} TruValu</div>
//       </div>
//     </div>
//   );
// }

// function KPI({ label, value }) {
//   return (
//     <div className="kpi">
//       <div className="kpiLabel">{label}</div>
//       <div className="kpiValue">{value}</div>
//     </div>
//   );
// }


//..........................................

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/report.css";

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
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default function Report() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [formData, setFormData] = useState(() => safeParse(localStorage.getItem(LS_FORM_KEY)) || {});
  const [reportData, setReportData] = useState(() => safeParse(localStorage.getItem(LS_REPORT_KEY)) || null);

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

        if (!API) throw new Error("REACT_APP_AVM_API is missing. Please set it in your frontend .env");

        const res = await fetch(`${API}/predict_with_comparables`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: formData }),
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json?.detail || "Failed to generate report");

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

  const comps5 = useMemo(() => {
    const comps = reportData?.comparables || [];
    return comps.slice(0, 5);
  }, [reportData]);

  const goBack = () => navigate("/valuation");

  return (
    <div className="reportPage">
      <NavBar />

      <div className="reportWrap">
        <div className="topRow">
          <div>
            <div className="reportTitle">Valuation Report</div>
            <div className="reportSub">
              {formData?.area_name_en ? `${formData.area_name_en}` : ""}
              {formData?.property_type_en ? ` • ${formData.property_type_en}` : ""}
              {formData?.project_name_en ? ` • ${formData.project_name_en}` : ""}
              {Number.isFinite(Number(formData?.rooms_en)) ? ` • ${formData.rooms_en} BR` : ""}
            </div>
          </div>

          <div className="topActions">
            <button className="btnSecondary" onClick={goBack}>Edit Inputs</button>
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
            {/* Summary */}
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

            {/* Comparable Properties */}
            <div className="card2" style={{ marginTop: 14 }}>
              <div className="card2Title">Comparable Properties</div>
              <div className="card2Hint">
                Recently sold properties similar to yours
                {reportData?.comparables_meta?.used_level ? (
                  <>
                    {" "}• Level: <b>{reportData.comparables_meta.used_level}</b>
                    {" "}• Found: <b>{reportData.comparables_meta.count}</b>
                  </>
                ) : null}
              </div>

              {comps5.length === 0 ? (
                <div className="empty2">No comparables found. Try adjusting district / project / bedrooms / size.</div>
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
                          c.project_name_en ||
                          c.building_name_en ||
                          c.master_project_en ||
                          "Property";

                        const area = c.area_name_en || "—";

                        const rooms = c.rooms_en ?? "—";
                        const sizeSqft = Number(c.size_sqft);
                        const sizeText = Number.isFinite(sizeSqft) ? `${fmtNum(sizeSqft, 0)} sq.ft` : "—";

                        const match = Number(c.match_pct);

                        return (
                          <tr key={i}>
                            <td>
                              <div className="propTitle">{subtype} • {name}, {area}</div>
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
                              <span className={`matchPill ${match >= 90 ? "good" : match >= 80 ? "mid" : "low"}`}>
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
    </div>
  );
}
