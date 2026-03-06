// /// after adding prediction

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// import {
//   ResponsiveContainer,
//   AreaChart,
//   BarChart,
//   Bar,
//   Area,
//   Line,
//   LineChart,
//   CartesianGrid,
//   XAxis,
//   YAxis,
//   Tooltip,
//   PieChart,
//   Pie,
//   Cell,
//   Legend,
//   ReferenceLine,
// } from "recharts";

// const RAW_API = process.env.REACT_APP_AVM_API;
// const API = RAW_API ? RAW_API.replace(/\/+$/, "") : "";

// const LS_FORM_KEY = "truvalu_formData_v1";
// const LS_REPORT_KEY = "truvalu_reportData_v1";
// const LS_VAL_ROW_ID = "truvalu_valuation_row_id";

// function safeParse(json) {
//   try { return JSON.parse(json); } catch { return null; }
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

// function generatePriceTimeline(currentValue) {
//   const now = new Date();
//   const currentYear = now.getFullYear();
//   const GROWTH_RATE = 0.06;
//   const points = [];

//   // Past 2 years
//   for (let i = 2; i >= 1; i--) {
//     points.push({
//       year: String(currentYear - i),
//       value: Math.round(currentValue / Math.pow(1 + GROWTH_RATE, i)),
//       type: "past",
//     });
//   }

//   // Current year
//   points.push({ year: String(currentYear), value: Math.round(currentValue), type: "current" });

//   // Future 3 years
//   for (let i = 1; i <= 3; i++) {
//     points.push({
//       year: String(currentYear + i),
//       value: Math.round(currentValue * Math.pow(1 + GROWTH_RATE, i)),
//       type: "future",
//     });
//   }

//   return points;
// }

// function fmtDate(iso) {
//   if (!iso) return "—";
//   const s = String(iso).slice(0, 10);
//   const d = new Date(s);
//   if (Number.isNaN(d.getTime())) return s;
//   return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
// }
// function monthLabel(yyyyMm) {
//   if (!yyyyMm) return "";
//   const [y, m] = String(yyyyMm).split("-");
//   const d = new Date(Number(y), Number(m) - 1, 1);
//   if (Number.isNaN(d.getTime())) return String(yyyyMm);
//   return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
// }
// function fmtPct(x, d = 0) {
//   const n = Number(x);
//   if (!Number.isFinite(n)) return "—";
//   return `${n.toFixed(d)}%`;
// }
// const SQM_TO_SQFT = 10.763910416709722;
// function sqmToSqft(sqm) {
//   const n = Number(sqm);
//   if (!Number.isFinite(n)) return null;
//   return n * SQM_TO_SQFT;
// }
// function aedPerSqftFromAedPerSqm(aedPerSqm) {
//   const n = Number(aedPerSqm);
//   if (!Number.isFinite(n)) return null;
//   return n / SQM_TO_SQFT;
// }

// function normalizeValuationResponse(data, fallbackFormData) {
//   const total = data?.total_valuation ?? data?.total ?? data?.market?.total_valuation ?? data?.tx?.total_valuation ?? null;
//   const psm = data?.predicted_meter_sale_price ?? data?.price_per_sqm ?? data?.market?.price_per_sqm ?? data?.tx?.price_per_sqm ?? null;
//   const psf = data?.price_per_sqft ?? data?.market?.price_per_sqft ?? data?.tx?.price_per_sqft ?? (Number.isFinite(Number(psm)) ? aedPerSqftFromAedPerSqm(psm) : null);
//   const areaSqm = data?.procedure_area_sqm ?? data?.procedure_area ?? data?.tx?.procedure_area_sqm ?? data?.market?.procedure_area_sqm ?? fallbackFormData?.procedure_area ?? 0;
//   const areaSqft = data?.procedure_area_sqft ?? (Number.isFinite(Number(areaSqm)) ? sqmToSqft(areaSqm) : null);
//   const rangeLow = data?.range_low ?? data?.ci_low ?? null;
//   const rangeHigh = data?.range_high ?? data?.ci_high ?? null;
//   return { total_valuation: total, price_per_sqm: psm, price_per_sqft: psf, procedure_area_sqm: Number(areaSqm) || 0, procedure_area_sqft: Number(areaSqft) || null, range_low: rangeLow, range_high: rangeHigh, currency: data?.currency || "AED" };
// }

// function SectionHeader({ label, title }) {
//   return (
//     <div style={{ marginBottom: 16 }}>
//       <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(43,43,43,.4)", marginBottom: 4 }}>{label}</div>
//       <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#2B2B2B", letterSpacing: "-.01em" }}>{title}</h3>
//     </div>
//   );
// }

// function SectionBox({ children, style = {} }) {
//   return (
//     <section style={{ marginTop: 48, background: "#fff", border: "1px solid #E8E8E8", borderRadius: 12, padding: "24px 28px", ...style }}>
//       {children}
//     </section>
//   );
// }

// function PricePredictionChart({ currentValue }) {
//   const data = generatePriceTimeline(currentValue);
//   const currentYear = String(new Date().getFullYear());

//   const pastAndCurrent = data.filter(d => d.type !== "future");
//   const currentAndFuture = data.filter(d => d.type !== "past");

//   return (
//     <SectionBox>
//       <SectionHeader label="AI Projection" title="3-Year Price Forecast" />

//       {/* 3 prediction cards */}
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
//         {data.filter(d => d.type === "future").map((d) => (
//           <div key={d.year} style={{
//             background: "#fff8f3", border: "1px solid #fcd9b6",
//             borderRadius: 12, padding: "14px 16px",
//           }}>
//             <div style={{ fontSize: 10, fontWeight: 800, color: "#e87722", letterSpacing: 1, marginBottom: 4 }}>
//               {d.year} EST.
//             </div>
//             <div style={{ fontSize: 18, fontWeight: 900, color: "#111" }}>
//               {fmtAED(d.value)}
//             </div>
//             <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
//               +6% projected annual growth
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Chart */}
//       <div style={{ height: 240 }}>
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
//             <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
//             <YAxis
//               tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
//               tick={{ fontSize: 10, fill: "#6b7280" }}
//               axisLine={false} tickLine={false} width={55}
//             />
//             <Tooltip
//               formatter={(v) => [fmtAED(v), "Est. Value"]}
//               contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
//             />
//             <ReferenceLine
//               x={currentYear} stroke="#e87722" strokeDasharray="4 4"
//               label={{ value: "Today", position: "insideTopRight", fontSize: 10, fill: "#e87722" }}
//             />
//             {/* Gray line — past + current */}
//             <Line
//               data={pastAndCurrent}
//               type="monotone" dataKey="value"
//               stroke="#9ca3af" strokeWidth={2}
//               dot={{ r: 4, fill: "#9ca3af", strokeWidth: 0 }}
//               name="Historical"
//             />
//             {/* Copper dashed line — current + future */}
//             <Line
//               data={currentAndFuture}
//               type="monotone" dataKey="value"
//               stroke="#B87333" strokeWidth={2} strokeDasharray="6 3"
//               dot={(props) => {
//                 const { cx, cy, payload } = props;
//                 return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={4}
//                   fill={payload.type === "future" ? "#B87333" : "#9ca3af"} stroke="#fff" strokeWidth={2} />;
//               }}
//               name="Forecast"
//             />
//           </LineChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Legend */}
//       <div style={{ display: "flex", gap: 20, marginTop: 12, justifyContent: "center" }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b7280" }}>
//           <div style={{ width: 24, height: 2, background: "#9ca3af" }} />
//           Historical (2 years)
//         </div>
//         <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b7280" }}>
//           <div style={{ width: 24, height: 2, borderTop: "2px dashed #B87333" }} />
//           AI Forecast (3 years)
//         </div>
//       </div>

//       <div style={{ marginTop: 12, fontSize: 11, color: "rgba(43,43,43,.4)", fontStyle: "italic", textAlign: "center" }}>
//         Based on Dubai market avg. 6% annual growth · For indicative purposes only
//       </div>
//     </SectionBox>
//   );
// }

// function HeaderLite() {
//   const navigate = useNavigate();
//   return (
//     <>
//       <header className="acqHdrLite">
//         <div className="acqHdrLiteInner">
//           <div className="acqHdrLogo" onClick={() => navigate("/")} role="button" tabIndex={0}
//             onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/"); }}
//             aria-label="Go to landing page" title="ACQAR">
//             <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
//               <span style={{ color: "#B87333" }}>ACQ</span>
//               <span style={{ color: "#111111" }}>AR</span>
//             </h1>
//           </div>
//         </div>
//       </header>
//       <div className="acqHdrLiteSpacer" />
//     </>
//   );
// }

// function Footer() {
//     const navigate = useNavigate();
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
//     [
//       "COMPANY",
//       ["About ACQAR", "How It Works", "Pricing", "Contact Us", "Partners", "Press Kit"],
//     ],
//     [
//       "RESOURCES",
//       ["Help Center", "Market Reports", "Blog ", "Comparisons"],
//     ],
//     [
//       "COMPARISONS",
//       ["vs Bayut TruEstimate", "vs Property Finder", "vs Traditional Valuers", "Why ACQAR?"],
//     ],
//   ];

//   return (
//     <>
//       {/* Scoped styles — only affect this footer */}
//       <style>{`
//         .acq-footer {
//           background: #F9F9F9;
//           border-top: 1px solid #EBEBEB;
//           padding: 56px 0 0;
//           font-family: 'Inter', sans-serif;
//         }

//         /* ── TOP GRID ── */
//         .acq-footer-grid {
//           max-width: 80rem;
//           margin: 0 auto;
//           padding: 0 2rem;
//           display: grid;
//           grid-template-columns: 1.35fr 1fr 1fr 1fr 1fr;
//           gap: 48px;
//           align-items: start;
//           padding-bottom: 48px;
//         }

//         /* Brand col */
//         .acq-brand-name {
//           font-size: 1rem;
//           font-weight: 900;
//           letter-spacing: 0.04em;
//           text-transform: uppercase;
//           color: #2B2B2B;
//           display: block;
//           margin-bottom: 14px;
//         }
//         .acq-brand-desc {
//           font-size: 0.75rem;
//           color: rgba(43,43,43,0.58);
//           line-height: 1.75;
//           margin: 0 0 18px;
//           max-width: 240px;
//         }
//         .acq-rics-badge {
//           display: inline-flex;
//           align-items: center;
//           gap: 7px;
//           padding: 7px 12px;
//           background: #fff;
//           border: 1px solid #EBEBEB;
//           border-radius: 8px;
//           margin-bottom: 20px;
//         }
//         .acq-rics-badge svg { flex-shrink: 0; color: #2B2B2B; }
//         .acq-rics-badge span {
//           font-size: 0.5625rem;
//           font-weight: 800;
//           color: rgba(43,43,43,0.82);
//           text-transform: uppercase;
//           letter-spacing: 0.08em;
//           white-space: nowrap;
//         }
//         .acq-social-row { display: flex; gap: 10px; }
//         .acq-social-btn {
//           width: 34px; height: 34px;
//           border-radius: 50%;
//           border: 1px solid #E5E7EB;
//           display: flex; align-items: center; justify-content: center;
//           color: rgba(43,43,43,0.38);
//           text-decoration: none;
//           transition: color 0.18s, border-color 0.18s;
//           background: transparent;
//           cursor: pointer;
//         }
//         .acq-social-btn:hover { color: #B87333; border-color: #B87333; }

//         /* Link columns */
//         .acq-col-title {
//           font-size: 0.75rem;
//           font-weight: 800;
//           text-transform: uppercase;
//           letter-spacing: 0.16em;
//           color: #2B2B2B;
//           margin: 0 0 20px;
//         }
//         .acq-link-list {
//           list-style: none;
//           padding: 0; margin: 0;
//           display: flex;
//           flex-direction: column;
//           gap: 13px;
//         }
//         .acq-link-item {
//           font-size: 0.8125rem;
//           color: rgba(43,43,43,0.55);
//           font-weight: 400;
//           cursor: pointer;
//           transition: color 0.16s;
//           line-height: 1.4;
//         }
//         .acq-link-item:hover { color: #B87333; }

//         /* ── DIVIDER ── */
//         .acq-divider {
//           max-width: 80rem;
//           margin: 0 auto;
//           padding: 0 2rem;
//         }
//         .acq-divider hr {
//           border: none;
//           border-top: 1px solid #E5E7EB;
//           margin: 0;
//         }

//         /* ── BOTTOM BAR ── */
//         .acq-footer-bottom {
//           max-width: 80rem;
//           margin: 0 auto;
//           padding: 18px 2rem 28px;
//           display: flex;
//           align-items: center;
//           justify-content: space-between;
//           gap: 16px;
//         }
//         .acq-copy p {
//           font-size: 0.5625rem;
//           font-weight: 800;
//           color: rgba(43,43,43,0.38);
//           text-transform: uppercase;
//           letter-spacing: 0.12em;
//           margin: 0 0 3px;
//         }
//         .acq-copy small {
//           font-size: 0.5rem;
//           color: rgba(43,43,43,0.28);
//           text-transform: uppercase;
//           letter-spacing: 0.08em;
//           display: block;
//         }
//         .acq-legal {
//           display: flex;
//           align-items: center;
//           gap: 28px;
//           flex-wrap: wrap;
//           justify-content: flex-end;
//         }
//         .acq-legal a {
//           font-size: 0.5625rem;
//           font-weight: 800;
//           color: rgba(43,43,43,0.38);
//           text-transform: uppercase;
//           letter-spacing: 0.12em;
//           text-decoration: none;
//           white-space: nowrap;
//           transition: color 0.16s;
//         }
//         .acq-legal a:hover { color: #2B2B2B; }

//         /* ── RESPONSIVE ── */
//         @media (max-width: 1024px) {
//           .acq-footer-grid {
//             grid-template-columns: 1fr 1fr 1fr;
//             gap: 32px;
//           }
//           .acq-brand-col { grid-column: 1 / -1; }
//           .acq-brand-desc { max-width: 100%; }
//         }

//         @media (max-width: 640px) {
//           .acq-footer-grid {
//             grid-template-columns: 1fr 1fr;
//             gap: 28px;
//             padding: 0 1rem 40px;
//           }
//           .acq-brand-col { grid-column: 1 / -1; }
//           .acq-footer-bottom {
//             flex-direction: column;
//             align-items: center;
//             text-align: center;
//             gap: 14px;
//             padding: 18px 1rem 28px;
//           }
//           .acq-legal { justify-content: center; gap: 18px; }
//           .acq-divider { padding: 0 1rem; }
//         }
// .acq-legal span {
//   font-size: 0.5rem;          /* smaller */
//   font-weight: 700;
//   color: rgba(43,43,43,0.35);
//   text-transform: uppercase;
//   letter-spacing: 0.14em;
//   white-space: nowrap;
//   cursor: pointer;
//   transition: color 0.16s ease;
// }

// .acq-legal span:hover {
//   color: #B87333;              /* ACQAR copper hover */
// }
//         @media (max-width: 420px) {
//           .acq-footer-grid { grid-template-columns: 1fr; }
//         }
//       `}</style>

//       <footer className="acq-footer">
//         {/* ── TOP GRID ── */}
//         <div className="acq-footer-grid">

//           {/* Brand column */}
//           <div className="acq-brand-col">
//             <span className="acq-brand-name">ACQAR</span>
//             <p className="acq-brand-desc">
//               The world's first AI-powered property intelligence platform for Dubai real estate.
//               Independent, instant, investment-grade.
//             </p>

//             {/* RICS badge */}
//             <div className="acq-rics-badge">
//               {/* shield-check icon */}
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
//                 <polyline points="9 12 11 14 15 10"/>
//               </svg>
//               <span>RICS-Aligned Intelligence</span>
//             </div>

//             {/* LinkedIn */}
//             <div className="acq-social-row">
//               <a
//                 href="https://www.linkedin.com/company/acqar"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="acq-social-btn"
//                 aria-label="LinkedIn"
//               >
//                 <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
//                   <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5S1.1 1 2.48 1c1.38 0 2.5 1.12 2.5 2.5zM0 8h5v16H0V8zm7.5 0h4.8v2.2h.1c.67-1.2 2.3-2.4 4.73-2.4C22.2 7.8 24 10.2 24 14.1V24h-5v-8.5c0-2-.04-4.6-2.8-4.6-2.8 0-3.2 2.2-3.2 4.4V24h-5V8z"/>
//                 </svg>
//               </a>
//             </div>
//           </div>

//           {/* Link columns */}
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

//         {/* ── DIVIDER ── */}
//         <div className="acq-divider"><hr /></div>

//         {/* ── BOTTOM BAR ── */}
//         <div className="acq-footer-bottom">
//           <div className="acq-copy">
//             <p>© 2025 ACQARLABS L.L.C-FZ. All rights reserved.</p>
//             {/* <small>TruValu™ is a registered trademark.</small> */}
//           </div>
//           <nav className="acq-legal">
//   <span
//     style={{ cursor: "pointer" }}
//     onClick={() => navigate("/terms")}
//   >
//     Terms
//   </span>

//   <span
//     style={{ cursor: "pointer" }}
//     onClick={() => navigate("/privacy")}
//   >
//     Privacy
//   </span>

//   <span
//     style={{ cursor: "pointer" }}
//     onClick={() => navigate("/cookies")}
//   >
//     Cookies
//   </span>

//   <span
//     style={{ cursor: "pointer" }}
//     onClick={() => navigate("/security")}
//   >
//     Security
//   </span>
// </nav>
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
//   const [fbSubmitting, setFbSubmitting] = useState(false);
//   const [fbStep, setFbStep] = useState("choose");
//   const [fbRating, setFbRating] = useState("");
//   const [fbNote, setFbNote] = useState("");

//   const [formData, setFormData] = useState(() => safeParse(localStorage.getItem(LS_FORM_KEY)) || {});
//   const [reportData, setReportData] = useState(() => safeParse(localStorage.getItem(LS_REPORT_KEY)) || null);
//   const [valRow, setValRow] = useState(null);
//   const savedRef = useRef(false);
//   const location = useLocation();
//   const [copied, setCopied] = useState(false);
//   const [loggedUser, setLoggedUser] = useState(null);

//   const [lsValRowId, setLsValRowId] = useState(() => localStorage.getItem(LS_VAL_ROW_ID) || "");

//   // useEffect(() => {
//   //   if (!loading) {
//   //     const id = localStorage.getItem(LS_VAL_ROW_ID) || "";
//   //     if (id) setLsValRowId(id);
//   //   }
//   // }, [loading]);

//   async function submitFeedback(rating, note) {
//     try {
//       if (fbSubmitting) return;
//       setFbSubmitting(true);
//       const { data: u } = await supabase.auth.getUser();
//       const user = u?.user || null;
//       const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split("@")[0] : null) || null;
//       const valId = shareValId && /^\d+$/.test(String(shareValId)) ? Number(shareValId) : null;
//       const payload = { rating, comment: (note || "").trim() || null, valuation_id: valId, user_id: user?.id || null, user_name: userName, user_email: user?.email || null, page: "report", user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null };
//       const { error } = await supabase.from("feedback").insert(payload);
//       if (error) throw error;
//       setFbStep("success");
//     } catch (e) {
//       setErr(e?.message || "Failed to save feedback.");
//     } finally {
//       setFbSubmitting(false);
//     }
//   }

//   useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [location.pathname]);

//   function displayBedroomsFromForm(fd) {
//     const b = fd?.bedrooms ?? fd?.rooms_en ?? fd?.bedroom ?? "";
//     const s = String(b).trim().toLowerCase();
//     if (!s || s === "-" || s === "null" || s === "undefined") return "Studio";
//     if (s === "studio") return "Studio";
//     if (s === "0") return "Studio";
//     const m = s.match(/\d+/);
//     if (!m) return "Studio";
//     const n = Number(m[0]);
//     if (!Number.isFinite(n) || n <= 0) return "Studio";
//     return `${n} Bedroom${n === 1 ? "" : "s"}`;
//   }

//   function displayBathroomsFromForm(fd) {
//     const b = fd?.bathrooms ?? fd?.bathrooms_en ?? fd?.baths ?? fd?.bathroom ?? "";
//     const s = String(b).trim().toLowerCase();
//     if (!s || s === "-" || s === "null" || s === "undefined") return "1 Bathroom";
//     const m = s.match(/\d+(\.\d+)?/);
//     if (!m) return "1 Bathroom";
//     const n = Number(m[0]);
//     if (!Number.isFinite(n) || n <= 0) return "1 Bathroom";
//     return `${m[0]} Bathroom${Number(m[0]) === 1 ? "" : "s"}`;
//   }

//   const shareValId = useMemo(() => {
//     const fromLS = localStorage.getItem(LS_VAL_ROW_ID) || "";
//     const raw =
//       valuationId ||
//       (valRow?.id != null ? String(valRow.id) : "") ||
//       lsValRowId ||
//       fromLS;
//     const clean = String(raw || "").trim();
//     if (!/^\d+$/.test(clean)) return "";
//     return clean;
//   // }, [valuationId, valRow, lsValRowId, loading]);
//   }, [valuationId, valRow, lsValRowId]);

//   const shareUrl = shareValId ? `${window.location.origin}/report?id=${encodeURIComponent(shareValId)}` : "";

//   async function handleCopyShareLink() {
//     if (!shareUrl) { alert("No report id found to share."); return; }
//     try { await navigator.clipboard.writeText(shareUrl); } catch (e) {
//       const ta = document.createElement("textarea"); ta.value = shareUrl; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
//     }
//     setCopied(true); window.clearTimeout(handleCopyShareLink._copiedT); handleCopyShareLink._copiedT = window.setTimeout(() => setCopied(false), 1800);
//   }

//   useEffect(() => {
//     if (valuationId) return;
//     const storedForm = safeParse(localStorage.getItem(LS_FORM_KEY));
//     if (storedForm) setFormData(storedForm);
//   }, [valuationId]);

//   useEffect(() => {
//     let mounted = true;
//     async function loadValuation() {
//       if (!valuationId) return;
//       try {
//         setErr(""); setLoading(true);
//         const cleanId = valuationId ? String(valuationId).trim() : "";
//         if (!/^\d+$/.test(cleanId)) { if (!mounted) return; setErr("Invalid share link (id must be a number)."); setLoading(false); return; }
//         const { data, error } = await supabase.from("valuations").select("*").eq("id", Number(cleanId)).maybeSingle();
//         if (error) throw error;
//         if (!data) { setErr("This shared report was not found (invalid or deleted id)."); setLoading(false); return; }
//         setValRow(data || null);
//         const payload = data?.form_payload || data?.payload || null;
//         const obj = typeof payload === "string" ? safeParse(payload) : payload;
//         if (obj && typeof obj === "object") { setFormData(obj); } else { setErr("This shared report has no form_payload saved."); }
//       } catch (e) { if (!mounted) return; setErr(e?.message || "Failed to load shared valuation."); }
//       finally { if (!mounted) return; setLoading(false); }
//     }
//     loadValuation();
//     return () => { mounted = false; };
//   }, [valuationId]);

//   useEffect(() => {
//     let mounted = true;
//     async function run() {
//       try {
//         setErr(""); setLoading(true);
//         if (!API) throw new Error("REACT_APP_AVM_API is missing.");
//         if (valuationId && (!formData || Object.keys(formData).length === 0)) return;
//         if (!valuationId && (!formData || Object.keys(formData).length === 0)) throw new Error("No form data found for this report.");
//         const res = await fetch(`${API}/predict_with_comparables`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: formData }) });
//         const json = await res.json();
//         if (!res.ok) { const msg = json?.detail || json?.message || `Request failed (${res.status})`; throw new Error(msg); }
//         if (!mounted) return;
//         const normalized = normalizeValuationResponse(json, formData);
//         const merged = { ...json, ...normalized };
//         setReportData(merged);
//         if (!valuationId) localStorage.setItem(LS_REPORT_KEY, JSON.stringify(merged));
//         // if (!savedRef.current) {
//         //   const valuationRowId = localStorage.getItem(LS_VAL_ROW_ID);
//         //   const est = Number(merged?.total_valuation);
//         //   if (valuationRowId && Number.isFinite(est)) {
//         //     savedRef.current = true;
//         //     // ✅ BUG 3 FIX: also save form_payload and report_payload so shared links work
//         //     const { error: upErr } = await supabase.from("valuations").update({
//         //       estimated_valuation: est,
//         //       updated_at: new Date().toISOString(),
//         //       form_payload: formData,
//         //       report_payload: JSON.stringify(merged),
//         //     }).eq("id", valuationRowId);
//         //     if (upErr) { console.error("Failed to update estimated valuation:", upErr); savedRef.current = false; }
//         //     else { setLsValRowId(String(valuationRowId)); }
//         //   }
//         // }

//         if (!savedRef.current) {
//   const valuationRowId = localStorage.getItem(LS_VAL_ROW_ID);
//   const est = Number(merged?.total_valuation);
//   if (valuationRowId && Number.isFinite(est)) {
//     savedRef.current = true;
//     const { error: upErr } = await supabase.from("valuations").update({
//       estimated_valuation: est,
//       updated_at: new Date().toISOString(),
//       form_payload: formData,
//       report_payload: JSON.stringify(merged),
//     }).eq("id", valuationRowId);
//     if (upErr) {
//       console.error("Failed to update estimated valuation:", upErr);
//       savedRef.current = false;
//     } else {
//       setLsValRowId(String(valuationRowId));
//       localStorage.setItem(LS_VAL_ROW_ID, String(valuationRowId)); // ✅ ensure localStorage is fresh
//     }
//   }
// }
//       // } catch (e) { if (!mounted) return; setErr(e?.message || "Something went wrong"); }
//       // finally { if (!mounted) return; setLoading(false); }
//       } catch (e) { 
//   if (!mounted) return; 
//   setErr(e?.message || "Something went wrong"); 
//   setLoading(false); // ✅ fires on error path
//   return;
// }
// setLoading(false); // ✅ fires AFTER entire save block completes successfully
//     }
//     run();
//     return () => { mounted = false; };
//   }, [formData, valuationId]);

//   useEffect(() => {
//     async function getUser() { const { data } = await supabase.auth.getUser(); if (data?.user) setLoggedUser(data.user); }
//     getUser();
//   }, []);

//   // ─── Derived data ────────────────────────────────────────────────────────────

//   const trendSeries = useMemo(() => {
//     // ✅ BUG 1 CONFIRMED FINE: charts.trend is correct path from API response
//     const t = reportData?.charts?.trend || reportData?.trend || reportData?.market_trend || [];
//     const area = Number(reportData?.procedure_area_sqm ?? formData?.procedure_area ?? 0) || 0;
//     const propertyTotal = Number(reportData?.total_valuation);
//     return t.slice(-60).map((r) => {
//       const marketPsm = Number(r.median_price_per_sqm);
//       const marketTotal = Number.isFinite(marketPsm) ? marketPsm * area : null;
//       return { month: r.month, label: monthLabel(r.month), property_total: Number.isFinite(propertyTotal) ? propertyTotal : null, market_total: Number.isFinite(marketTotal) ? marketTotal : null };
//     });
//   }, [reportData, formData]);

//   const forecastSeries = useMemo(() => {
//     const hist = (reportData?.forecast?.historical || []).slice(-12).map(r => ({ label: monthLabel(r.month), psm: r.median_price_per_sqm, is_forecast: false }));
//     const proj = (reportData?.forecast?.forecast || []).map(r => ({ label: monthLabel(r.month), psm: r.median_price_per_sqm, is_forecast: true }));
//     return [...hist, ...proj];
//   }, [reportData]);

//   const supplyDemandSeries = useMemo(() => {
//     return (reportData?.supply_demand?.monthly || []).slice(-18).map(r => ({ label: monthLabel(r.month), transactions: r.transactions }));
//   }, [reportData]);

//   // ✅ BUG 5 FIX: removed exact district match — API already filters by area
//   // previously this always returned empty because subjectDistrictName !== compDistrictName
//   const filteredComparables = useMemo(() => {
//     const list = Array.isArray(reportData?.comparables) ? reportData.comparables : [];
//     const subjectProp = String(formData?.project_name_en || formData?.building_name_en || "").trim().toLowerCase();
//     return list
//       .filter((c) => {
//         // Only exclude the exact same project — show all other area comparables
//         if (!subjectProp) return true;
//         const compProp = String(c?.project_name_en || c?.building_name_en || c?.master_project_en || "").trim().toLowerCase();
//         if (!compProp) return true;
//         return compProp !== subjectProp;
//       })
//       .sort((a, b) => (Number(b?.match_pct) || 0) - (Number(a?.match_pct) || 0));
//   }, [reportData, formData]);

//   const displayUserName = useMemo(() => {
//     if (!loggedUser) return "User";
//     if (loggedUser.user_metadata?.full_name) return loggedUser.user_metadata.full_name;
//     if (loggedUser.email) { const name = loggedUser.email.split("@")[0]; return name.charAt(0).toUpperCase() + name.slice(1); }
//     return "User";
//   }, [loggedUser]);

//   const goBack = () => navigate("/valuation");

//   const areaName = formData?.area_name_en || "—";
//   const subArea = formData?.sub_area_en || formData?.community_en || "";
//   const projectName = formData?.project_name_en || formData?.building_name_en || "—";
//   const propertyType = formData?.property_type_en || "Property";

//   const totalVal = Number(reportData?.total_valuation);
//   const rateSqm = Number(reportData?.price_per_sqm);
//   const rateSqft = Number(reportData?.price_per_sqft ?? aedPerSqftFromAedPerSqm(rateSqm));
//   const band = 0.15;
//   const rangeLow = Number.isFinite(Number(reportData?.range_low)) ? Number(reportData?.range_low) : Number.isFinite(totalVal) ? totalVal * (1 - band) : null;
//   const rangeHigh = Number.isFinite(Number(reportData?.range_high)) ? Number(reportData?.range_high) : Number.isFinite(totalVal) ? totalVal * (1 + band) : null;
//   const compsCount = Number(reportData?.comparables_meta?.count ?? (reportData?.comparables || []).length);

//   // ✅ BUG 2 FIX: use anchor_level from API instead of fake formula
//   const anchorLevelConfidence = { project: 92, master_project: 85, bundle_project: 85, area: 72, city: 55, none: 40 };
//   const confidencePct = Number.isFinite(Number(reportData?.confidence_pct))
//     ? Number(reportData?.confidence_pct)
//     : anchorLevelConfidence[reportData?.tx?.anchor_level] ?? 70;

//   const sqm = Number(reportData?.procedure_area_sqm ?? formData?.procedure_area ?? 0);
//   const sqft = Number(reportData?.procedure_area_sqft ?? sqmToSqft(sqm));

//   const downPaymentPct = 0.20;
//   const mortgageRate = 0.045;
//   const mortgageYears = 25;
//   const downPayment = Number.isFinite(totalVal) ? totalVal * downPaymentPct : null;
//   const loanAmount = Number.isFinite(totalVal) ? totalVal * (1 - downPaymentPct) : null;
//   const monthlyRate = mortgageRate / 12;
//   const numPayments = mortgageYears * 12;
//   const monthlyPayment = loanAmount ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1) : null;

//   const dldFee = Number.isFinite(totalVal) ? totalVal * 0.04 : null;
//   const agentBuyFee = Number.isFinite(totalVal) ? totalVal * 0.02 : null;
//   const trusteeFee = 4000;
//   const mortgageRegFee = loanAmount ? loanAmount * 0.0025 : null;
//   const totalBuyingCost = dldFee && agentBuyFee && mortgageRegFee ? dldFee + agentBuyFee + trusteeFee + mortgageRegFee : null;
//   const agentSellFee = Number.isFinite(totalVal) ? totalVal * 0.02 : null;

//   const anchorLevel = reportData?.tx?.anchor_level || "area";
//   const anchorLevelMap = { project: 100, master_project: 85, bundle_project: 85, area: 70, city: 55, none: 40 };
//   const dataQuality = anchorLevelMap[anchorLevel] || 70;

//   // ✅ BUG 4 FIX: derive factorWeights dynamically from real API data
//   const factorWeights = useMemo(() => {
//     const level = reportData?.tx?.anchor_level || "area";
//     const comps = Number(reportData?.comparables_meta?.count || 0);

//     // Location weight increases when we have project-level precision
//     const locationW = level === "project" ? 40 : level === "master_project" ? 35 : level === "area" ? 30 : 20;
//     // Comparable sales weight increases with more data points (max 25)
//     const dataW = Math.min(25, Math.max(5, Math.round(comps * 2.5)));
//     const sizeW = 20;
//     const typeW = 15;
//     // Recency fills the remainder to always sum to 100
//     const recencyW = Math.max(5, 100 - locationW - dataW - sizeW - typeW);

//     return [
//       { name: "Location & Area",   value: locationW, color: "#B87333" },
//       { name: "Property Size",     value: sizeW,     color: "#2563EB" },
//       { name: "Property Type",     value: typeW,     color: "#10b981" },
//       { name: "Comparable Sales",  value: dataW,     color: "#f59e0b" },
//       { name: "Recency of Data",   value: recencyW,  color: "#8b5cf6" },
//     ];
//   }, [reportData]);

//   const CSS = `
//     :root{ --acq-text:#2B2B2B; --acq-accent:#B87333; --acq-border:#E5E5E5; }
//     body{ margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto',sans-serif; }
//     .reportPage{ width:100%; overflow-x:hidden; background:#F5F5F3; color:var(--acq-text); }
//     .acqHdrLite{ position:fixed; top:0; left:0; right:0; z-index:60; background:#fff; border-bottom:1px solid var(--acq-border); }
//     .acqHdrLiteInner{ max-width:80rem; margin:0 auto; height:64px; display:flex; align-items:center; padding:0 20px; }
//     .acqHdrLogo h1{ margin:0; font-size:20px; font-weight:900; letter-spacing:-0.04em; text-transform:uppercase; cursor:pointer; }
//     .acqHdrLiteSpacer{ height:64px; }
//     .vcMain{ max-width:1200px; margin:0 auto; padding:40px 20px 80px; }
//     .vcHeader{ margin-bottom:0; padding-bottom:24px; border-bottom:1px solid var(--acq-border); }
//     .vcTitle{ margin:0 0 8px; font-size:32px; line-height:1.2; font-weight:700; letter-spacing:-0.02em; color:#2B2B2B; }
//     .vcMeta{ display:flex; flex-wrap:wrap; gap:8px; color:rgba(43,43,43,.5); font-weight:400; font-size:13px; align-items:center; margin-bottom:12px; }
//     .vcDot{ width:3px; height:3px; border-radius:50%; background:rgba(43,43,43,.3); display:inline-block; }
//     .vcHeaderRow{ display:flex; gap:24px; flex-wrap:wrap; margin-top:12px; }
//     .vcMini span:first-child{ font-size:10px; font-weight:600; letter-spacing:.05em; text-transform:uppercase; color:rgba(43,43,43,.4); display:block; }
//     .vcMini span:last-child{ font-size:11px; font-weight:600; font-family:ui-monospace,monospace; color:#2B2B2B; }
//     .vcSectionGrid{ display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-top:32px; padding-top:32px; border-top:1px solid #F0F0F0; }
//     .vcSmallTitle{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 16px; }
//     .vcValueBig{ font-size:48px; font-weight:700; letter-spacing:-0.02em; margin:0; color:#2B2B2B; }
//     .vcValueSub{ font-size:13px; color:rgba(43,43,43,.5); font-weight:400; margin-top:6px; }
//     .vcBar{ height:8px; background:#F5F5F5; border-radius:4px; overflow:hidden; display:flex; margin-top:20px; }
//     .vcBar>div{ height:100%; }
//     .vcBarLow{ width:25%; background:#E5E5E5; }
//     .vcBarMid{ width:50%; background:#B87333; }
//     .vcBarHigh{ width:25%; background:#E5E5E5; }
//     .vcRange{ display:grid; grid-template-columns:1fr 1fr 1fr; margin-top:12px; font-size:11px; font-weight:600; }
//     .vcRange div{ font-family:ui-monospace,monospace; }
//     .vcRange small{ display:block; font-size:9px; color:rgba(43,43,43,.4); font-weight:600; letter-spacing:.08em; margin-bottom:4px; text-transform:uppercase; }
//     .vcRangeMid{ text-align:center; }
//     .vcRangeRight{ text-align:right; }
//     .vcTip{ margin-top:20px; padding:12px 14px; background:#FAFAF8; border:1px solid #F0F0F0; display:flex; gap:10px; align-items:flex-start; border-radius:6px; }
//     .vcTip p{ margin:0; font-size:12px; color:rgba(43,43,43,.6); line-height:1.5; }
//     .vcChartCard{ height:260px; width:100%; background:#FAFAFA; border-radius:6px; padding:12px; }
//     .vcCardsHead{ display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
//     .vcCardsSubtitle{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 4px; }
//     .vcCardsMainTitle{ font-size:18px; font-weight:700; margin:0; color:#2B2B2B; }
//     .vcUnlockBtn{ border:none; background:transparent; color:#B87333; font-weight:700; font-size:11px; letter-spacing:.05em; text-transform:uppercase; border-bottom:1.5px solid #B87333; padding:0 0 4px; cursor:pointer; }
//     .vcCards{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
//     .vcCard{ border:1px solid #E8E8E8; padding:16px; border-radius:8px; background:#FFFFFF; transition:all .2s; }
//     .vcCard:hover{ border-color:#B87333; box-shadow:0 2px 8px rgba(0,0,0,.04); }
//     .vcTagRow{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
//     .vcTag{ font-size:9px; font-weight:700; color:#2563EB; background:#EFF6FF; border:1px solid #DBEAFE; padding:3px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:.08em; }
//     .vcWhen{ font-size:10px; color:rgba(43,43,43,.4); font-weight:600; font-family:ui-monospace,monospace; }
//     .vcCardTitle{ font-size:15px; font-weight:700; margin:0 0 4px; color:#2B2B2B; }
//     .vcCardSub{ font-size:11px; color:rgba(43,43,43,.5); margin:0 0 16px; }
//     .vcCardBottom{ display:flex; justify-content:space-between; align-items:flex-end; gap:12px; border-top:1px solid #F5F5F5; padding-top:12px; }
//     .vcSoldLabel{ font-size:9px; color:rgba(43,43,43,.4); font-weight:600; letter-spacing:.08em; text-transform:uppercase; margin:0 0 4px; }
//     .vcSoldPrice{ font-size:18px; font-weight:700; font-family:ui-monospace,monospace; margin:0; color:#2B2B2B; }
//     .vcSize{ font-size:11px; color:rgba(43,43,43,.45); font-weight:600; font-family:ui-monospace,monospace; text-align:right; }
//     .vcFeedback{ margin-top:48px; background:#FAFAF8; border:1px solid #F0F0F0; border-radius:18px; padding:24px 26px; box-shadow:0 10px 24px rgba(0,0,0,.04); }
//     .vcFbTopRow{ display:flex; align-items:center; justify-content:space-between; gap:28px; }
//     .vcFbLeft{ flex:1; min-width:320px; }
//     .vcRewardBadge{ font-size:10px; font-weight:900; color:#B87333; background:#FEF3E7; border:1px solid #F0D9C0; padding:6px 12px; border-radius:999px; text-transform:uppercase; letter-spacing:.14em; display:inline-flex; align-items:center; gap:8px; }
//     .vcFeedbackTitle{ font-size:30px; font-weight:900; font-style:italic; letter-spacing:-.02em; text-transform:uppercase; margin:10px 0 8px; color:#2B2B2B; }
//     .vcFeedbackText{ font-size:13px; color:rgba(43,43,43,.55); line-height:1.6; margin:0; max-width:520px; }
//     .vcFeedbackText a{ color:#B87333; font-weight:800; text-decoration:none; border-bottom:1.5px solid rgba(184,115,51,.55); }
//     .vcFbRight{ display:flex; align-items:center; justify-content:flex-end; gap:14px; flex:0 0 auto; }
//     .vcFbChoice{ width:128px; height:76px; border:1px solid #D9D9D9; background:#FFFFFF; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; cursor:pointer; transition:all .18s ease; color:rgba(43,43,43,.45); font-weight:900; letter-spacing:.16em; text-transform:uppercase; font-size:10px; box-shadow:0 6px 14px rgba(0,0,0,.04); }
//     .vcFbChoice:hover{ border-color:#B87333; color:#B87333; }
//     .vcFbChoice:disabled{ opacity:.55; cursor:not-allowed; }
//     .vcFbFormTitle{ margin:0 0 14px; font-size:26px; font-weight:700; color:#2B2B2B; }
//     .vcFbTextarea{ width:640px; max-width:100%; height:120px; border:1px solid #E6E6E6; border-radius:10px; padding:14px 16px; font-size:12px; line-height:1.6; background:#FFFFFF; color:#2B2B2B; outline:none; resize:none; }
//     .vcFbActions{ margin-top:16px; display:flex; align-items:center; gap:22px; flex-wrap:wrap; }
//     .vcFbSubmit{ min-width:380px; height:54px; padding:0 22px; border-radius:12px; border:none; background:#2B2B2B; color:#FFFFFF; cursor:pointer; font-size:11px; font-weight:900; letter-spacing:.16em; text-transform:uppercase; display:flex; align-items:center; justify-content:center; gap:12px; box-shadow:0 14px 26px rgba(0,0,0,.18); }
//     .vcFbSubmit:hover{ background:#1F1F1F; }
//     .vcFbSubmit:disabled{ opacity:.6; cursor:not-allowed; }
//     .vcFbBack{ border:none; background:transparent; padding:0; height:54px; display:flex; align-items:center; font-size:11px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; color:rgba(43,43,43,.35); cursor:pointer; }
//     .vcRewardScreen{ padding:46px 22px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:14px; }
//     .vcRewardCheck{ width:56px; height:56px; border-radius:999px; display:flex; align-items:center; justify-content:center; background:rgba(34,197,94,.10); border:1px solid rgba(34,197,94,.18); }
//     .vcRewardTitle{ margin:10px 0 2px; font-size:34px; font-weight:900; font-style:italic; color:#2B2B2B; letter-spacing:-.02em; }
//     .vcRewardSub{ margin:0 0 10px; font-size:12px; color:rgba(43,43,43,.42); line-height:1.6; max-width:560px; }
//     .vcVoucher{ margin-top:12px; width:min(560px,100%); background:#2B2B2B; color:#FFFFFF; border-radius:14px; padding:16px 18px; display:flex; align-items:center; justify-content:space-between; gap:18px; box-shadow:0 22px 40px rgba(0,0,0,.22); }
//     .vcVoucherLeft{ display:flex; align-items:center; gap:14px; text-align:left; }
//     .vcVoucherIcon{ width:44px; height:44px; border-radius:12px; background:#B87333; display:flex; align-items:center; justify-content:center; color:#2B2B2B; font-weight:900; font-size:18px; flex:0 0 auto; }
//     .vcVoucherCode{ font-size:10px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; color:rgba(184,115,51,.95); }
//     .vcVoucherName{ font-size:14px; font-weight:900; text-transform:uppercase; color:#FFFFFF; }
//     .vcApplyBtn{ background:#FFFFFF; color:#2B2B2B; border:none; border-radius:12px; height:40px; padding:0 16px; font-size:11px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; cursor:pointer; }
//     .vcBottomSection{ margin-top:48px; }
//     .vcShareSection{ background:#FAFAFA; border:1px solid #E8E8E8; border-radius:8px; padding:20px; margin-bottom:24px; }
//     .vcShareLabel{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 12px; }
//     .vcShareRow{ display:flex; gap:12px; }
//     .vcShareInput{ flex:1; padding:10px 14px; border:1px solid #E5E5E5; border-radius:6px; font-size:12px; font-family:ui-monospace,monospace; background:#FFFFFF; color:rgba(43,43,43,.7); }
//     .vcCopyBtn{ padding:10px 20px; background:#B87333; color:#FFFFFF; border:none; border-radius:6px; font-size:11px; font-weight:700; text-transform:uppercase; cursor:pointer; }
//     .vcFooterInfo{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px; }
//     .vcInfoTitle{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 8px; }
//     .vcInfoContent{ font-size:12px; color:rgba(43,43,43,.7); line-height:1.6; margin:0; }
//     .vcInfoList{ list-style:none; padding:0; margin:0; }
//     .vcInfoList li{ font-size:12px; color:rgba(43,43,43,.7); margin-bottom:4px; padding-left:12px; position:relative; }
//     .vcInfoList li:before{ content:'•'; position:absolute; left:0; color:rgba(43,43,43,.3); }
//     .vcActions{ margin-top:32px; padding-top:24px; border-top:1px solid #E8E8E8; display:flex; justify-content:space-between; gap:14px; flex-wrap:wrap; align-items:center; }
//     .vcBtn{ padding:12px 20px; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; border-radius:6px; cursor:pointer; transition:all .2s; }
//     .vcBtnPrimary{ background:#2B2B2B; color:#fff; border:1px solid #2B2B2B; }
//     .vcBtnPrimary:hover{ background:#000; }
//     .vcBtnGhost{ background:#fff; color:#2B2B2B; border:1px solid #E5E5E5; }
//     .vcBtnGhost:hover{ background:#FAFAFA; border-color:#2B2B2B; }
//     .statCard{ background:#fff; border:1px solid #E8E8E8; border-radius:10px; padding:18px 20px; }
//     .statLabel{ font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 6px; }
//     .statValue{ font-size:22px; font-weight:700; color:#2B2B2B; margin:0; }
//     .statSub{ font-size:11px; color:rgba(43,43,43,.5); margin:4px 0 0; }
//     .featureGrid{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
//     .featureItem{ background:#FAFAFA; border:1px solid #F0F0F0; border-radius:8px; padding:14px 16px; }
//     .featureIcon{ font-size:20px; margin-bottom:8px; }
//     .featureLabel{ font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 4px; }
//     .featureValue{ font-size:14px; font-weight:700; color:#2B2B2B; margin:0; }
//     .txTable{ width:100%; border-collapse:collapse; }
//     .txTable th{ font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); padding:0 12px 10px; text-align:left; border-bottom:1px solid #F0F0F0; }
//     .txTable td{ font-size:12px; padding:12px; border-bottom:1px solid #F5F5F5; color:#2B2B2B; vertical-align:middle; }
//     .txTable tr:last-child td{ border-bottom:none; }
//     .txTable tr:hover td{ background:#FAFAF8; }
//     .factorRow{ display:flex; align-items:center; gap:12px; margin-bottom:14px; }
//     .factorName{ font-size:12px; font-weight:600; color:#2B2B2B; width:160px; flex-shrink:0; }
//     .factorBarWrap{ flex:1; height:8px; background:#F0F0F0; border-radius:4px; overflow:hidden; }
//     .factorBarFill{ height:100%; border-radius:4px; }
//     .factorPct{ font-size:11px; font-weight:700; color:rgba(43,43,43,.55); width:36px; text-align:right; flex-shrink:0; }
//     .finCard{ background:#FAFAFA; border:1px solid #F0F0F0; border-radius:10px; padding:18px; text-align:center; }
//     .finLabel{ font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 8px; }
//     .finValue{ font-size:20px; font-weight:700; color:#2B2B2B; margin:0; }
//     .finSub{ font-size:11px; color:rgba(43,43,43,.5); margin:4px 0 0; }
//     .costRow{ display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #F5F5F5; font-size:13px; }
//     .costRow:last-child{ border-bottom:none; }
//     .costLabel{ color:rgba(43,43,43,.7); font-weight:500; }
//     .costValue{ font-weight:700; font-family:ui-monospace,monospace; color:#2B2B2B; }
//     .costTotal{ background:#2B2B2B; color:#fff; border-radius:8px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; margin-top:12px; font-weight:700; }
//     @media(max-width:1024px){ .vcSectionGrid{ grid-template-columns:1fr; } .vcCards{ grid-template-columns:1fr 1fr; } .featureGrid{ grid-template-columns:repeat(2,1fr); } .vcFooterInfo{ grid-template-columns:1fr; } }
//     @media(max-width:640px){ .vcValueBig{ font-size:36px; } .vcCards{ grid-template-columns:1fr; } .featureGrid{ grid-template-columns:1fr 1fr; } .vcTitle{ font-size:24px; } .vcFbSubmit{ width:100%; min-width:0; } .vcFbLeft{ min-width:0; } .vcFbTopRow{ flex-direction:column; } .vcFbRight{ width:100%; } .vcFbChoice{ flex:1; } }
//   `;

//   return (
//     <div className="reportPage">
//       <style>{CSS}</style>
//       <HeaderLite />

//       {copied && (
//         <div style={{ position: "fixed", top: 76, right: 18, zIndex: 9999, background: "#2B2B2B", color: "#fff", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: ".04em", boxShadow: "0 10px 30px rgba(0,0,0,.18)" }} role="status" aria-live="polite">
//           ✅ Copied
//         </div>
//       )}

//       <main className="vcMain">

//         {/* ── HEADER ── */}
//         <section className="vcHeader">
//           <h1 className="vcTitle">{projectName}</h1>
//           <div className="vcMeta">
//             <span>{displayBedroomsFromForm(formData)}</span>
//             <span className="vcDot" />
//             <span>{displayBathroomsFromForm(formData)}</span>
//             <span className="vcDot" />
//             <span>{Number.isFinite(sqft) ? `${fmtNum(sqft, 0)} SQFT` : "—"}</span>
//             <span className="vcDot" />
//             <span>📍 {areaName}{subArea ? `, ${subArea}` : ""}</span>
//           </div>
//           <div className="vcHeaderRow">
//             <div className="vcMini">
//               <span>Generated On</span>
//               <span>{fmtDate(valRow?.created_at || reportData?.created_at || new Date().toISOString())}</span>
//             </div>
//           </div>
//         </section>

//         {loading ? (
//           <div style={{ marginTop: 32, background: "#fff", border: "1px solid #E8E8E8", padding: 24, borderRadius: 8 }}>
//             <div style={{ fontWeight: 700, marginBottom: 8 }}>Loading report…</div>
//             <div style={{ color: "rgba(43,43,43,.55)" }}>Generating prediction and fetching comparables</div>
//           </div>
//         ) : err ? (
//           <div style={{ marginTop: 32, background: "#fff", border: "1px solid #E8E8E8", padding: 24, borderRadius: 8 }}>
//             <div style={{ fontWeight: 700, marginBottom: 8 }}>Error</div>
//             <div style={{ color: "rgba(43,43,43,.7)" }}>{err}</div>
//           </div>
//         ) : (
//           <>

//             {/* ── 1. VALUATION RANGE ── */}
//             <section className="vcSectionGrid" style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid #F0F0F0" }}>
//               <div>
//                 <h2 className="vcSmallTitle">Estimated Market Value</h2>
//                 <p className="vcValueBig">{fmtAED(reportData?.total_valuation)}</p>
//                 <div className="vcValueSub">± {fmtPct(confidencePct, 0)} Confidence · {reportData?.tx?.anchor_level || "area"} level</div>
//                 <div className="vcBar"><div className="vcBarLow" /><div className="vcBarMid" /><div className="vcBarHigh" /></div>
//                 <div className="vcRange">
//                   <div><small>Low</small>{Number.isFinite(rangeLow) ? fmtAED(rangeLow) : "—"}</div>
//                   <div className="vcRangeMid"><small>Most Likely</small>{Number.isFinite(totalVal) ? fmtAED(totalVal) : "—"}</div>
//                   <div className="vcRangeRight"><small>High</small>{Number.isFinite(rangeHigh) ? fmtAED(rangeHigh) : "—"}</div>
//                 </div>
//                 <div className="vcTip">
//                   <p>Accuracy based on historical transaction density in {areaName}. For institutional-grade accuracy, upgrade to <strong>DealLens™</strong>.</p>
//                 </div>
//               </div>

//               <div>
//                 <h2 className="vcSmallTitle" style={{ marginBottom: 12 }}>Prices & Trends — {areaName}</h2>
//                 <div className="vcChartCard">
//                   {trendSeries.length >= 2 ? (
//                     <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart data={trendSeries}>
//                         <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
//                         <XAxis dataKey="label" interval={5} tick={{ fontSize: 10, fill: "#999" }} />
//                         <YAxis tickFormatter={(v) => fmtNum(v / 1000000, 1) + "M"} tick={{ fontSize: 10, fill: "#999" }} />
//                         <Tooltip formatter={(v) => fmtAED(v)} contentStyle={{ fontSize: 11, border: "1px solid #E8E8E8", borderRadius: 6 }} />
//                         <Area type="monotone" dataKey="market_total" fill="#B87333" fillOpacity={0.1} stroke="none" />
//                         <Line type="monotone" dataKey="market_total" dot={false} stroke="#B87333" strokeWidth={2} />
//                       </AreaChart>
//                     </ResponsiveContainer>
//                   ) : (
//                     <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(43,43,43,.4)", fontSize: 13, fontWeight: 700, letterSpacing: ".1em" }}>No trend data available</div>
//                   )}
//                 </div>
//                 <div style={{ marginTop: 10, color: "rgba(43,43,43,.55)", fontSize: 12, lineHeight: 1.6 }}>
//                   <strong style={{ color: "#2B2B2B" }}>Rate:</strong> {Number.isFinite(rateSqm) ? `AED ${fmtNum(rateSqm, 0)}/sqm` : "—"} {Number.isFinite(rateSqft) ? `· AED ${fmtNum(rateSqft, 0)}/sqft` : ""}
//                 </div>
//               </div>
//             </section>

//             {/* ── 2. 6-MONTH FORECAST ── */}
//             <SectionBox>
//               <SectionHeader label="AI Projection" title="6-Month Price Forecast" />
//               <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
//                 {reportData?.forecast?.growth_pct != null && (
//                   <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: reportData.forecast.growth_pct >= 0 ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${reportData.forecast.growth_pct >= 0 ? "#86EFAC" : "#FCA5A5"}`, borderRadius: 6, padding: "5px 12px" }}>
//                     <span style={{ fontSize: 14 }}>{reportData.forecast.growth_pct >= 0 ? "📈" : "📉"}</span>
//                     <span style={{ fontSize: 11, fontWeight: 700, color: reportData.forecast.growth_pct >= 0 ? "#15803D" : "#DC2626", letterSpacing: ".05em", textTransform: "uppercase" }}>
//                       {reportData.forecast.growth_pct >= 0 ? "+" : ""}{reportData.forecast.growth_pct?.toFixed(1)}% projected over 6 months
//                     </span>
//                   </div>
//                 )}
//                 <span style={{ fontSize: 11, color: "rgba(43,43,43,.4)", fontWeight: 600 }}>Based on historical trend in {areaName}</span>
//               </div>
//               <div style={{ height: 240 }}>
//                 {forecastSeries.length >= 2 ? (
//                   <ResponsiveContainer width="100%" height="100%">
//                     <LineChart data={forecastSeries}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
//                       <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#999" }} />
//                       <YAxis tickFormatter={(v) => `${fmtNum(v, 0)}`} tick={{ fontSize: 10, fill: "#999" }} />
//                       <Tooltip formatter={(v) => [`AED ${fmtNum(v, 0)}/sqm`, "Median PSM"]} contentStyle={{ fontSize: 11, border: "1px solid #E8E8E8", borderRadius: 6 }} />
//                       <Line type="monotone" dataKey="psm" dot={(props) => {
//                         const { cx, cy, payload } = props;
//                         return payload.is_forecast
//                           ? <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill="#B87333" stroke="#fff" strokeWidth={2} strokeDasharray="4 2" />
//                           : <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="#2563EB" />;
//                       }}
//                         stroke="#B87333" strokeWidth={2} strokeDasharray={(d) => d?.is_forecast ? "6 3" : "0"}
//                       />
//                     </LineChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(43,43,43,.4)", fontSize: 13, fontWeight: 700 }}>Insufficient data for forecast</div>
//                 )}
//               </div>
//               <div style={{ marginTop: 10, fontSize: 11, color: "rgba(43,43,43,.4)", fontStyle: "italic" }}>
//                 Dashed line = projected values · Solid line = historical data. Projections are indicative only.
//               </div>
//             </SectionBox>

//             {/* ── 3-YEAR PRICE FORECAST ── */}
// {Number.isFinite(totalVal) && totalVal > 0 ? (
//   <PricePredictionChart currentValue={totalVal} />
// ) : null}

//             {/* ── 3. PROPERTY FEATURES ── */}
//             <SectionBox>
//               <SectionHeader label="Property Details" title="Property Features" />
//               <div className="featureGrid">
//                 {[
//                   { icon: "🏢", label: "Property Type", value: formData?.property_type_en || "—" },
//                   { icon: "🛏", label: "Bedrooms", value: displayBedroomsFromForm(formData) },
//                   { icon: "🚿", label: "Bathrooms", value: displayBathroomsFromForm(formData) },
//                   { icon: "📐", label: "Area (sqft)", value: Number.isFinite(sqft) ? `${fmtNum(sqft, 0)} sqft` : "—" },
//                   { icon: "📏", label: "Area (sqm)", value: Number.isFinite(sqm) ? `${fmtNum(sqm, 2)} sqm` : "—" },
//                   { icon: "📍", label: "District", value: areaName },
//                   { icon: "🏗", label: "Project", value: projectName },
//                   { icon: "🔑", label: "Ownership", value: "Freehold" },
//                   { icon: "💰", label: "Rate / sqft", value: Number.isFinite(rateSqft) ? `AED ${fmtNum(rateSqft, 0)}` : "—" },
//                 ].map((f) => (
//                   <div className="featureItem" key={f.label}>
//                     <div className="featureIcon">{f.icon}</div>
//                     <div className="featureLabel">{f.label}</div>
//                     <div className="featureValue">{f.value}</div>
//                   </div>
//                 ))}
//               </div>
//             </SectionBox>

//             {/* ── 4. SUPPLY & DEMAND ── */}
//             <SectionBox>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
//                 <SectionHeader label="Market Activity" title="Supply & Demand" />
//                 <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
//                   {[
//                     { label: "Total Sales (loaded)", value: fmtNum(reportData?.supply_demand?.total_sales, 0) },
//                     { label: "Avg / Month", value: fmtNum(reportData?.supply_demand?.avg_monthly, 1) },
//                   ].map(s => (
//                     <div className="statCard" key={s.label} style={{ minWidth: 120 }}>
//                       <div className="statLabel">{s.label}</div>
//                       <div className="statValue">{s.value}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div style={{ height: 220 }}>
//                 {supplyDemandSeries.length >= 2 ? (
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={supplyDemandSeries} barSize={14}>
//                       <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
//                       <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#999" }} interval={2} />
//                       <YAxis tick={{ fontSize: 10, fill: "#999" }} />
//                       <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E8E8E8", borderRadius: 6 }} formatter={(v) => [v, "Transactions"]} />
//                       <Bar dataKey="transactions" fill="#B87333" radius={[3, 3, 0, 0]} />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 ) : (
//                   <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(43,43,43,.4)", fontSize: 13, fontWeight: 700 }}>No supply/demand data available</div>
//                 )}
//               </div>
//             </SectionBox>

//             {/* ── 5. TRANSACTION HISTORY ── */}
//             <SectionBox>
//               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
//                 <SectionHeader label="Recent Sales" title="Transaction History" />
//                 <button className="vcUnlockBtn" type="button">View All</button>
//               </div>
//               {filteredComparables.length > 0 ? (
//                 <div style={{ overflowX: "auto" }}>
//                   <table className="txTable">
//                     <thead>
//                       <tr>
//                         <th>Project</th>
//                         <th>Area</th>
//                         <th>Bedrooms</th>
//                         <th>Size</th>
//                         <th>Sold For</th>
//                         <th>Price / sqft</th>
//                         <th>Date</th>
//                         <th>Match</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredComparables.slice(0, 8).map((c, idx) => {
//                         const soldDate = fmtDate(c?.instance_date ?? c?.sold_date);
//                         const price = Number(c?.actual_worth ?? c?.price_aed ?? c?.transaction_value);
//                         const sizeSqft = Number(c?.size_sqft ?? (c?.procedure_area ? c.procedure_area * 10.764 : null));
//                         const psf = Number(c?.price_per_sqft);
//                         const match = Number(c?.match_pct);
//                         return (
//                           <tr key={idx}>
//                             <td style={{ fontWeight: 600 }}>{c?.project_name_en || c?.building_name_en || "—"}</td>
//                             <td style={{ color: "rgba(43,43,43,.6)" }}>{c?.area_name_en || "—"}</td>
//                             <td>{c?.rooms_en || "—"}</td>
//                             <td style={{ fontFamily: "ui-monospace,monospace" }}>{Number.isFinite(sizeSqft) ? `${fmtNum(sizeSqft, 0)} sqft` : "—"}</td>
//                             <td style={{ fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{Number.isFinite(price) ? fmtAED(price) : "—"}</td>
//                             <td style={{ fontFamily: "ui-monospace,monospace" }}>{Number.isFinite(psf) ? `AED ${fmtNum(psf, 0)}` : "—"}</td>
//                             <td style={{ color: "rgba(43,43,43,.5)", fontSize: 11 }}>{soldDate}</td>
//                             <td>
//                               <span style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #DBEAFE", borderRadius: 4, padding: "2px 7px", fontSize: 9, fontWeight: 700, letterSpacing: ".06em" }}>
//                                 {Number.isFinite(match) ? `${Math.round(match)}%` : "—"}
//                               </span>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div style={{ padding: 20, background: "#FAFAFA", borderRadius: 8, color: "rgba(43,43,43,.5)", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
//                   No comparable transactions found for this area.
//                 </div>
//               )}
//             </SectionBox>

//             {/* ── 6. FINANCING OPTIONS ── */}
//             <SectionBox>
//               <SectionHeader label="Mortgage Calculator" title="Financing Options" />
//               <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
//                 <div className="finCard">
//                   <div className="finLabel">Down Payment (20%)</div>
//                   <div className="finValue">{downPayment ? fmtAED(downPayment) : "—"}</div>
//                   <div className="finSub">Minimum required</div>
//                 </div>
//                 <div className="finCard" style={{ background: "#2B2B2B", borderColor: "#2B2B2B" }}>
//                   <div className="finLabel" style={{ color: "rgba(255,255,255,.5)" }}>Loan Amount (80%)</div>
//                   <div className="finValue" style={{ color: "#fff" }}>{loanAmount ? fmtAED(loanAmount) : "—"}</div>
//                   <div className="finSub" style={{ color: "rgba(255,255,255,.4)" }}>At 4.5% p.a.</div>
//                 </div>
//                 <div className="finCard" style={{ background: "#B87333", borderColor: "#B87333" }}>
//                   <div className="finLabel" style={{ color: "rgba(255,255,255,.7)" }}>Est. Monthly Payment</div>
//                   <div className="finValue" style={{ color: "#fff" }}>{monthlyPayment ? fmtAED(monthlyPayment) : "—"}</div>
//                   <div className="finSub" style={{ color: "rgba(255,255,255,.6)" }}>Over 25 years</div>
//                 </div>
//               </div>
//               <div style={{ background: "#FAFAF8", border: "1px solid #F0F0F0", borderRadius: 8, padding: "14px 18px", fontSize: 12, color: "rgba(43,43,43,.55)", lineHeight: 1.6 }}>
//                 ⚠️ Estimates based on 4.5% interest rate, 25-year term, 20% down payment. Actual mortgage terms depend on your bank, credit profile, and UAE Central Bank regulations. Upgrade to <strong style={{ color: "#B87333" }}>CertiFi™</strong> for a lender-ready valuation report.
//               </div>
//             </SectionBox>

//             {/* ── 7. KEY FACTORS ── */}
//             <SectionBox>
//               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
//                 <div>
//                   <SectionHeader label="Valuation Model" title="Key Factors in Your Evaluation" />
//                   {factorWeights.map((f) => (
//                     <div className="factorRow" key={f.name}>
//                       <div className="factorName">{f.name}</div>
//                       <div className="factorBarWrap">
//                         <div className="factorBarFill" style={{ width: `${f.value * 4}%`, background: f.color }} />
//                       </div>
//                       <div className="factorPct">{f.value}%</div>
//                     </div>
//                   ))}
//                   <div style={{ marginTop: 16, padding: "10px 14px", background: "#FAFAFA", border: "1px solid #F0F0F0", borderRadius: 8, fontSize: 11, color: "rgba(43,43,43,.55)", lineHeight: 1.6 }}>
//                     Anchor level: <strong style={{ color: "#2B2B2B" }}>{reportData?.tx?.anchor_level || "area"}</strong> · Data quality score: <strong style={{ color: "#2B2B2B" }}>{dataQuality}%</strong> · Model: XGBoost + Calibration
//                   </div>
//                 </div>
//                 <div>
//                   <SectionHeader label="Confidence" title="Data Quality Breakdown" />
//                   <div style={{ height: 200 }}>
//                     <ResponsiveContainer width="100%" height="100%">
//                       <PieChart>
//                         <Pie data={factorWeights} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${value}%`} labelLine={false} fontSize={10}>
//                           {factorWeights.map((f, i) => <Cell key={f.name} fill={f.color} />)}
//                         </Pie>
//                         <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ fontSize: 11, border: "1px solid #E8E8E8", borderRadius: 6 }} />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>
//                   <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
//                     {factorWeights.map(f => (
//                       <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "rgba(43,43,43,.6)" }}>
//                         <div style={{ width: 8, height: 8, borderRadius: 2, background: f.color, flexShrink: 0 }} />
//                         {f.name}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </SectionBox>

//             {/* ── 8. ADDITIONAL COSTS ── */}
//             <SectionBox>
//               <SectionHeader label="Transaction Costs" title="Additional Cost to Buy or Sell" />
//               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
//                 <div>
//                   <div style={{ fontSize: 13, fontWeight: 700, color: "#2B2B2B", marginBottom: 12 }}>🏦 Buying Costs</div>
//                   {[
//                     { label: "DLD Transfer Fee (4%)", value: dldFee },
//                     { label: "Agent Commission (2%)", value: agentBuyFee },
//                     { label: "Trustee Office Fee", value: trusteeFee },
//                     { label: "Mortgage Registration (0.25%)", value: mortgageRegFee },
//                   ].map(c => (
//                     <div className="costRow" key={c.label}>
//                       <span className="costLabel">{c.label}</span>
//                       <span className="costValue">{c.value ? fmtAED(c.value) : "—"}</span>
//                     </div>
//                   ))}
//                   <div className="costTotal">
//                     <span style={{ fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase" }}>Total Buying Cost</span>
//                     <span style={{ fontSize: 16 }}>{totalBuyingCost ? fmtAED(totalBuyingCost) : "—"}</span>
//                   </div>
//                 </div>
//                 <div>
//                   <div style={{ fontSize: 13, fontWeight: 700, color: "#2B2B2B", marginBottom: 12 }}>🤝 Selling Costs</div>
//                   {[
//                     { label: "Agent Commission (2%)", value: agentSellFee },
//                     { label: "NOC Fee (varies)", value: "AED 500 – 5,000" },
//                     { label: "Trustee Office Fee", value: "AED 4,000" },
//                     { label: "Mortgage Clearance (if any)", value: "Varies" },
//                   ].map(c => (
//                     <div className="costRow" key={c.label}>
//                       <span className="costLabel">{c.label}</span>
//                       <span className="costValue">{typeof c.value === "number" ? fmtAED(c.value) : c.value || "—"}</span>
//                     </div>
//                   ))}
//                   <div style={{ marginTop: 16, padding: "12px 14px", background: "#FEF3E7", border: "1px solid #F0D9C0", borderRadius: 8, fontSize: 11, color: "rgba(43,43,43,.65)", lineHeight: 1.6 }}>
//                     ℹ️ DLD fees apply to buyer. Seller is responsible for NOC and clearance. Consult a RERA-registered agent for exact figures.
//                   </div>
//                 </div>
//               </div>
//             </SectionBox>

//             {/* ── FEEDBACK ── */}
//             <section className="vcFeedback">
//               {fbStep === "choose" && (
//                 <div className="vcFbTopRow">
//                   <div className="vcFbLeft">
//                     <span className="vcRewardBadge">🎁 Community Reward</span>
//                     <h3 className="vcFeedbackTitle" style={{ marginBottom: 8 }}>Was our valuation accurate?</h3>
//                     <p className="vcFeedbackText">Help us improve our AI engine. Submit a 10-second feedback and unlock <a href="#">1 Free DealLens™ Report</a> (Value: AED 149).</p>
//                   </div>
//                   <div className="vcFbRight">
//                     {[
//                       { label: "TOO HIGH", rating: "too_high", icon: "📈" },
//                       { label: "SPOT ON", rating: "spot_on", icon: "✅" },
//                       { label: "TOO LOW", rating: "too_low", icon: "📉" },
//                     ].map(b => (
//                       <button key={b.rating} className="vcFbChoice" type="button" disabled={fbSubmitting} onClick={() => { setFbRating(b.rating); setFbNote(""); setFbStep("form"); }}>
//                         <span style={{ fontSize: 18 }}>{b.icon}</span>{b.label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}
//               {fbStep === "form" && (
//                 <div>
//                   <h3 className="vcFbFormTitle">How can we improve?</h3>
//                   <textarea className="vcFbTextarea" placeholder="Tell us what data points we missed (e.g. recent renovations, building amenities...)" value={fbNote} onChange={(e) => setFbNote(e.target.value)} />
//                   <div className="vcFbActions">
//                     <button className="vcFbSubmit" type="button" disabled={fbSubmitting || !fbRating} onClick={() => submitFeedback(fbRating, fbNote)}>
//                       SUBMIT FEEDBACK &amp; CLAIM REWARD <span aria-hidden="true">🎟️</span>
//                     </button>
//                     <button className="vcFbBack" type="button" disabled={fbSubmitting} onClick={() => { setFbStep("choose"); setFbRating(""); setFbNote(""); }}>GO BACK</button>
//                   </div>
//                 </div>
//               )}
//               {fbStep === "success" && (
//                 <div className="vcRewardScreen">
//                   <div className="vcRewardCheck"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg></div>
//                   <h3 className="vcRewardTitle">Reward Unlocked!</h3>
//                   <p className="vcRewardSub">Your feedback has been logged. We've added 1 DealLens™ Credit to your account.</p>
//                   <div className="vcVoucher">
//                     <div className="vcVoucherLeft">
//                       <div className="vcVoucherIcon">ⓐ</div>
//                       <div><div className="vcVoucherCode">VOUCHER CODE: FEEDBACK100</div><div className="vcVoucherName">1X FREE DEALLENS™ REPORT</div></div>
//                     </div>
//                     <button className="vcApplyBtn" type="button" onClick={() => navigate("/deallens")}>APPLY NOW</button>
//                   </div>
//                   <button className="vcFbBack" type="button" onClick={() => { setFbStep("choose"); setFbRating(""); setFbNote(""); }} style={{ marginTop: 10 }}>GO BACK</button>
//                 </div>
//               )}
//             </section>

//             {/* ── SHARE + FOOTER INFO ── */}
//             <section className="vcBottomSection">
//               <div className="vcShareSection">
//                 <p className="vcShareLabel">Public Shareable Link</p>
//                 <div className="vcShareRow">
//                   <input type="text" className="vcShareInput" value={shareUrl} readOnly placeholder="Link will appear once report is saved…" />
//                   <button className="vcCopyBtn" onClick={handleCopyShareLink} disabled={!shareUrl} style={{ opacity: shareUrl ? 1 : 0.45, cursor: shareUrl ? "pointer" : "not-allowed" }}>Copy</button>
//                 </div>
//                 {!shareUrl && (
//                   <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(43,43,43,.4)", fontStyle: "italic" }}>
//                     Saving report to generate shareable link…
//                   </p>
//                 )}
//               </div>
//               <div className="vcFooterInfo">
//                 <div>
//                   <p className="vcInfoTitle">Purpose</p>
//                   <p className="vcInfoContent">Prepared for investment decision-making only. <strong>NOT suitable for</strong>:</p>
//                   <ul className="vcInfoList">
//                     <li>Bank mortgage applications (upgrade to CertiFi™)</li>
//                     <li>Legal proceedings</li>
//                     <li>Tax assessments</li>
//                     <li>Financial reporting</li>
//                   </ul>
//                 </div>
//                 <div>
//                   <p className="vcInfoTitle">Intended User</p>
//                   <p className="vcInfoContent">{displayUserName} — For personal use only</p>
//                 </div>
//                 <div>
//                   <p className="vcInfoTitle">Third-Party Reliance</p>
//                   <p className="vcInfoContent">Not permitted without explicit written consent from ACQARLABS L.L.C-FZ.</p>
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
import UAECostCalculator from "../components/UAECostCalculator";
import UAEPropertyCostCalculator from "../components/UAEPropertyCostCalculator";

import {
  ResponsiveContainer,
  AreaChart,
  BarChart,
  Bar,
  Area,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
} from "recharts";

const RAW_API = process.env.REACT_APP_AVM_API;
const API = RAW_API ? RAW_API.replace(/\/+$/, "") : "";

const LS_FORM_KEY = "truvalu_formData_v1";
const LS_REPORT_KEY = "truvalu_reportData_v1";
const LS_VAL_ROW_ID = "truvalu_valuation_row_id";

function safeParse(json) {
  try { return JSON.parse(json); } catch { return null; }
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

function generatePriceTimeline(currentValue) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const GROWTH_RATE = 0.06;
  const points = [];

  // Past 2 years
  for (let i = 2; i >= 1; i--) {
    points.push({
      year: String(currentYear - i),
      value: Math.round(currentValue / Math.pow(1 + GROWTH_RATE, i)),
      type: "past",
    });
  }

  // Current year
  points.push({ year: String(currentYear), value: Math.round(currentValue), type: "current" });

  // Future 3 years
  for (let i = 1; i <= 3; i++) {
    points.push({
      year: String(currentYear + i),
      value: Math.round(currentValue * Math.pow(1 + GROWTH_RATE, i)),
      type: "future",
    });
  }

  return points;
}

function fmtDate(iso) {
  if (!iso) return "—";
  const s = String(iso).slice(0, 10);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}
function monthLabel(yyyyMm) {
  if (!yyyyMm) return "";
  const [y, m] = String(yyyyMm).split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  if (Number.isNaN(d.getTime())) return String(yyyyMm);
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}
function fmtPct(x, d = 0) {
  const n = Number(x);
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(d)}%`;
}
const SQM_TO_SQFT = 10.763910416709722;
function sqmToSqft(sqm) {
  const n = Number(sqm);
  if (!Number.isFinite(n)) return null;
  return n * SQM_TO_SQFT;
}
function aedPerSqftFromAedPerSqm(aedPerSqm) {
  const n = Number(aedPerSqm);
  if (!Number.isFinite(n)) return null;
  return n / SQM_TO_SQFT;
}

function normalizeValuationResponse(data, fallbackFormData) {
  const total = data?.total_valuation ?? data?.total ?? data?.market?.total_valuation ?? data?.tx?.total_valuation ?? null;
  const psm = data?.predicted_meter_sale_price ?? data?.price_per_sqm ?? data?.market?.price_per_sqm ?? data?.tx?.price_per_sqm ?? null;
  const psf = data?.price_per_sqft ?? data?.market?.price_per_sqft ?? data?.tx?.price_per_sqft ?? (Number.isFinite(Number(psm)) ? aedPerSqftFromAedPerSqm(psm) : null);
  const areaSqm = data?.procedure_area_sqm ?? data?.procedure_area ?? data?.tx?.procedure_area_sqm ?? data?.market?.procedure_area_sqm ?? fallbackFormData?.procedure_area ?? 0;
  const areaSqft = data?.procedure_area_sqft ?? (Number.isFinite(Number(areaSqm)) ? sqmToSqft(areaSqm) : null);
  const rangeLow = data?.range_low ?? data?.ci_low ?? null;
  const rangeHigh = data?.range_high ?? data?.ci_high ?? null;
  return { total_valuation: total, price_per_sqm: psm, price_per_sqft: psf, procedure_area_sqm: Number(areaSqm) || 0, procedure_area_sqft: Number(areaSqft) || null, range_low: rangeLow, range_high: rangeHigh, currency: data?.currency || "AED" };
}

function SectionHeader({ label, title }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(43,43,43,.4)", marginBottom: 4 }}>{label}</div>
      <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#2B2B2B", letterSpacing: "-.01em" }}>{title}</h3>
    </div>
  );
}

function SectionBox({ children, style = {} }) {
  return (
    <section style={{ marginTop: 48, background: "#fff", border: "1px solid #E8E8E8", borderRadius: 12, padding: "24px 28px", ...style }}>
      {children}
    </section>
  );
}

function PricePredictionChart({ currentValue }) {
  const data = generatePriceTimeline(currentValue);
  const currentYear = String(new Date().getFullYear());

  const pastAndCurrent = data.filter(d => d.type !== "future");
  const currentAndFuture = data.filter(d => d.type !== "past");

  return (
    <SectionBox>
      <SectionHeader label="AI Projection" title="3-Year Price Forecast" />

      {/* 3 prediction cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 24 }}>
        {data.filter(d => d.type === "future").map((d) => (
          <div key={d.year} style={{
            background: "#fff8f3", border: "1px solid #fcd9b6",
            borderRadius: 12, padding: "14px 16px",
          }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#e87722", letterSpacing: 1, marginBottom: 4 }}>
              {d.year} EST.
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#111" }}>
              {fmtAED(d.value)}
            </div>
            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 4 }}>
              +6% projected annual growth
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ height: "min(240px, 50vw)" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
              tick={{ fontSize: 10, fill: "#6b7280" }}
              axisLine={false} tickLine={false} width={55}
            />
            <Tooltip
              formatter={(v) => [fmtAED(v), "Est. Value"]}
              contentStyle={{ borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12 }}
            />
            <ReferenceLine
              x={currentYear} stroke="#e87722" strokeDasharray="4 4"
              label={{ value: "Today", position: "insideTopRight", fontSize: 10, fill: "#e87722" }}
            />
            {/* Gray line — past + current */}
            <Line
              data={pastAndCurrent}
              type="monotone" dataKey="value"
              stroke="#9ca3af" strokeWidth={2}
              dot={{ r: 4, fill: "#9ca3af", strokeWidth: 0 }}
              name="Historical"
            />
            {/* Copper dashed line — current + future */}
            <Line
              data={currentAndFuture}
              type="monotone" dataKey="value"
              stroke="#B87333" strokeWidth={2} strokeDasharray="6 3"
              dot={(props) => {
                const { cx, cy, payload } = props;
                return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={4}
                  fill={payload.type === "future" ? "#B87333" : "#9ca3af"} stroke="#fff" strokeWidth={2} />;
              }}
              name="Forecast"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b7280" }}>
          <div style={{ width: 24, height: 2, background: "#9ca3af" }} />
          Historical (2 years)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b7280" }}>
          <div style={{ width: 24, height: 2, borderTop: "2px dashed #B87333" }} />
          AI Forecast (3 years)
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 11, color: "rgba(43,43,43,.4)", fontStyle: "italic", textAlign: "center" }}>
        Based on Dubai market avg. 6% annual growth · For indicative purposes only
      </div>
    </SectionBox>
  );
}

function HeaderLite() {
  const navigate = useNavigate();
  return (
    <>
      <header className="acqHdrLite">
        <div className="acqHdrLiteInner">
          <div className="acqHdrLogo" onClick={() => navigate("/")} role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") navigate("/"); }}
            aria-label="Go to landing page" title="ACQAR">
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
              <span style={{ color: "#B87333" }}>ACQ</span>
              <span style={{ color: "#111111" }}>AR</span>
            </h1>
          </div>
        </div>
      </header>
      <div className="acqHdrLiteSpacer" />
    </>
  );
}

function Footer() {
    const navigate = useNavigate();
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
    [
      "RESOURCES",
      ["Help Center", "Market Reports", "Blog ", "Comparisons"],
    ],
    [
      "COMPARISONS",
      ["vs Bayut TruEstimate", "vs Property Finder", "vs Traditional Valuers", "Why ACQAR?"],
    ],
  ];

  return (
    <>
      {/* Scoped styles — only affect this footer */}
      <style>{`
        .acq-footer {
          background: #F9F9F9;
          border-top: 1px solid #EBEBEB;
          padding: 56px 0 0;
          font-family: 'Inter', sans-serif;
        }

        /* ── TOP GRID ── */
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

        /* Brand col */
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

        /* Link columns */
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

        /* ── DIVIDER ── */
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

        /* ── BOTTOM BAR ── */
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

        /* ── RESPONSIVE ── */
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
.acq-legal span {
  font-size: 0.5rem;          /* smaller */
  font-weight: 700;
  color: rgba(43,43,43,0.35);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  white-space: nowrap;
  cursor: pointer;
  transition: color 0.16s ease;
}

.acq-legal span:hover {
  color: #B87333;              /* ACQAR copper hover */
}
        @media (max-width: 420px) {
          .acq-footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <footer className="acq-footer">
        {/* ── TOP GRID ── */}
        <div className="acq-footer-grid">

          {/* Brand column */}
          <div className="acq-brand-col">
            <span className="acq-brand-name">ACQAR</span>
            <p className="acq-brand-desc">
              The world's first AI-powered property intelligence platform for Dubai real estate.
              Independent, instant, investment-grade.
            </p>

            {/* RICS badge */}
            <div className="acq-rics-badge">
              {/* shield-check icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
              <span>RICS-Aligned Intelligence</span>
            </div>

            {/* LinkedIn */}
            <div className="acq-social-row">
              <a
                href="https://www.linkedin.com/company/acqar"
                target="_blank"
                rel="noopener noreferrer"
                className="acq-social-btn"
                aria-label="LinkedIn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5S1.1 1 2.48 1c1.38 0 2.5 1.12 2.5 2.5zM0 8h5v16H0V8zm7.5 0h4.8v2.2h.1c.67-1.2 2.3-2.4 4.73-2.4C22.2 7.8 24 10.2 24 14.1V24h-5v-8.5c0-2-.04-4.6-2.8-4.6-2.8 0-3.2 2.2-3.2 4.4V24h-5V8z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Link columns */}
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

        {/* ── DIVIDER ── */}
        <div className="acq-divider"><hr /></div>

        {/* ── BOTTOM BAR ── */}
        <div className="acq-footer-bottom">
          <div className="acq-copy">
            <p>© 2025 ACQARLABS L.L.C-FZ. All rights reserved.</p>
            {/* <small>TruValu™ is a registered trademark.</small> */}
          </div>
          <nav className="acq-legal">
  <span
    style={{ cursor: "pointer" }}
    onClick={() => navigate("/terms")}
  >
    Terms
  </span>

  <span
    style={{ cursor: "pointer" }}
    onClick={() => navigate("/privacy")}
  >
    Privacy
  </span>

  <span
    style={{ cursor: "pointer" }}
    onClick={() => navigate("/cookies")}
  >
    Cookies
  </span>

  <span
    style={{ cursor: "pointer" }}
    onClick={() => navigate("/security")}
  >
    Security
  </span>
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
  const [fbSubmitting, setFbSubmitting] = useState(false);
  const [fbStep, setFbStep] = useState("choose");
  const [fbRating, setFbRating] = useState("");
  const [fbNote, setFbNote] = useState("");

  const [formData, setFormData] = useState(() => safeParse(localStorage.getItem(LS_FORM_KEY)) || {});
  const [reportData, setReportData] = useState(() => safeParse(localStorage.getItem(LS_REPORT_KEY)) || null);
  const [valRow, setValRow] = useState(null);
  const savedRef = useRef(false);
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [loggedUser, setLoggedUser] = useState(null);

  const [lsValRowId, setLsValRowId] = useState(() => localStorage.getItem(LS_VAL_ROW_ID) || "");

  // useEffect(() => {
  //   if (!loading) {
  //     const id = localStorage.getItem(LS_VAL_ROW_ID) || "";
  //     if (id) setLsValRowId(id);
  //   }
  // }, [loading]);

  async function submitFeedback(rating, note) {
    try {
      if (fbSubmitting) return;
      setFbSubmitting(true);
      const { data: u } = await supabase.auth.getUser();
      const user = u?.user || null;
      const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || (user?.email ? user.email.split("@")[0] : null) || null;
      const valId = shareValId && /^\d+$/.test(String(shareValId)) ? Number(shareValId) : null;
      const payload = { rating, comment: (note || "").trim() || null, valuation_id: valId, user_id: user?.id || null, user_name: userName, user_email: user?.email || null, page: "report", user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null };
      const { error } = await supabase.from("feedback").insert(payload);
      if (error) throw error;
      setFbStep("success");
    } catch (e) {
      setErr(e?.message || "Failed to save feedback.");
    } finally {
      setFbSubmitting(false);
    }
  }

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [location.pathname]);

  function displayBedroomsFromForm(fd) {
    const b = fd?.bedrooms ?? fd?.rooms_en ?? fd?.bedroom ?? "";
    const s = String(b).trim().toLowerCase();
    if (!s || s === "-" || s === "null" || s === "undefined") return "Studio";
    if (s === "studio") return "Studio";
    if (s === "0") return "Studio";
    const m = s.match(/\d+/);
    if (!m) return "Studio";
    const n = Number(m[0]);
    if (!Number.isFinite(n) || n <= 0) return "Studio";
    return `${n} Bedroom${n === 1 ? "" : "s"}`;
  }

  function displayBathroomsFromForm(fd) {
    const b = fd?.bathrooms ?? fd?.bathrooms_en ?? fd?.baths ?? fd?.bathroom ?? "";
    const s = String(b).trim().toLowerCase();
    if (!s || s === "-" || s === "null" || s === "undefined") return "1 Bathroom";
    const m = s.match(/\d+(\.\d+)?/);
    if (!m) return "1 Bathroom";
    const n = Number(m[0]);
    if (!Number.isFinite(n) || n <= 0) return "1 Bathroom";
    return `${m[0]} Bathroom${Number(m[0]) === 1 ? "" : "s"}`;
  }

  const shareValId = useMemo(() => {
    const fromLS = localStorage.getItem(LS_VAL_ROW_ID) || "";
    const raw =
      valuationId ||
      (valRow?.id != null ? String(valRow.id) : "") ||
      lsValRowId ||
      fromLS;
    const clean = String(raw || "").trim();
    if (!/^\d+$/.test(clean)) return "";
    return clean;
  // }, [valuationId, valRow, lsValRowId, loading]);
  }, [valuationId, valRow, lsValRowId]);

  const shareUrl = shareValId ? `${window.location.origin}/report?id=${encodeURIComponent(shareValId)}` : "";

  async function handleCopyShareLink() {
    if (!shareUrl) { alert("No report id found to share."); return; }
    try { await navigator.clipboard.writeText(shareUrl); } catch (e) {
      const ta = document.createElement("textarea"); ta.value = shareUrl; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopied(true); window.clearTimeout(handleCopyShareLink._copiedT); handleCopyShareLink._copiedT = window.setTimeout(() => setCopied(false), 1800);
  }

  useEffect(() => {
    if (valuationId) return;
    const storedForm = safeParse(localStorage.getItem(LS_FORM_KEY));
    if (storedForm) setFormData(storedForm);
  }, [valuationId]);

  useEffect(() => {
    let mounted = true;
    async function loadValuation() {
      if (!valuationId) return;
      try {
        setErr(""); setLoading(true);
        const cleanId = valuationId ? String(valuationId).trim() : "";
        if (!/^\d+$/.test(cleanId)) { if (!mounted) return; setErr("Invalid share link (id must be a number)."); setLoading(false); return; }
        const { data, error } = await supabase.from("valuations").select("*").eq("id", Number(cleanId)).maybeSingle();
        if (error) throw error;
        if (!data) { setErr("This shared report was not found (invalid or deleted id)."); setLoading(false); return; }
        setValRow(data || null);
        const payload = data?.form_payload || data?.payload || null;
        const obj = typeof payload === "string" ? safeParse(payload) : payload;
        if (obj && typeof obj === "object") { setFormData(obj); } else { setErr("This shared report has no form_payload saved."); }
      } catch (e) { if (!mounted) return; setErr(e?.message || "Failed to load shared valuation."); }
      finally { if (!mounted) return; setLoading(false); }
    }
    loadValuation();
    return () => { mounted = false; };
  }, [valuationId]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      try {
        setErr(""); setLoading(true);
        if (!API) throw new Error("REACT_APP_AVM_API is missing.");
        if (valuationId && (!formData || Object.keys(formData).length === 0)) return;
        if (!valuationId && (!formData || Object.keys(formData).length === 0)) throw new Error("No form data found for this report.");
        const res = await fetch(`${API}/predict_with_comparables`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: formData }) });
        const json = await res.json();
        if (!res.ok) { const msg = json?.detail || json?.message || `Request failed (${res.status})`; throw new Error(msg); }
        if (!mounted) return;
        const normalized = normalizeValuationResponse(json, formData);
        const merged = { ...json, ...normalized };
        setReportData(merged);
        if (!valuationId) localStorage.setItem(LS_REPORT_KEY, JSON.stringify(merged));
        // if (!savedRef.current) {
        //   const valuationRowId = localStorage.getItem(LS_VAL_ROW_ID);
        //   const est = Number(merged?.total_valuation);
        //   if (valuationRowId && Number.isFinite(est)) {
        //     savedRef.current = true;
        //     // ✅ BUG 3 FIX: also save form_payload and report_payload so shared links work
        //     const { error: upErr } = await supabase.from("valuations").update({
        //       estimated_valuation: est,
        //       updated_at: new Date().toISOString(),
        //       form_payload: formData,
        //       report_payload: JSON.stringify(merged),
        //     }).eq("id", valuationRowId);
        //     if (upErr) { console.error("Failed to update estimated valuation:", upErr); savedRef.current = false; }
        //     else { setLsValRowId(String(valuationRowId)); }
        //   }
        // }

        if (!savedRef.current) {
  const valuationRowId = localStorage.getItem(LS_VAL_ROW_ID);
  const est = Number(merged?.total_valuation);
  if (valuationRowId && Number.isFinite(est)) {
    savedRef.current = true;
    const { error: upErr } = await supabase.from("valuations").update({
      estimated_valuation: est,
      updated_at: new Date().toISOString(),
      form_payload: formData,
      report_payload: JSON.stringify(merged),
    }).eq("id", valuationRowId);
    if (upErr) {
      console.error("Failed to update estimated valuation:", upErr);
      savedRef.current = false;
    } else {
      setLsValRowId(String(valuationRowId));
      localStorage.setItem(LS_VAL_ROW_ID, String(valuationRowId)); // ✅ ensure localStorage is fresh
    }
  }
}
      // } catch (e) { if (!mounted) return; setErr(e?.message || "Something went wrong"); }
      // finally { if (!mounted) return; setLoading(false); }
      } catch (e) { 
  if (!mounted) return; 
  setErr(e?.message || "Something went wrong"); 
  setLoading(false); // ✅ fires on error path
  return;
}
setLoading(false); // ✅ fires AFTER entire save block completes successfully
    }
    run();
    return () => { mounted = false; };
  }, [formData, valuationId]);

  useEffect(() => {
    async function getUser() { const { data } = await supabase.auth.getUser(); if (data?.user) setLoggedUser(data.user); }
    getUser();
  }, []);

  // ─── Derived data ────────────────────────────────────────────────────────────

  const trendSeries = useMemo(() => {
    // ✅ BUG 1 CONFIRMED FINE: charts.trend is correct path from API response
    const t = reportData?.charts?.trend || reportData?.trend || reportData?.market_trend || [];
    const area = Number(reportData?.procedure_area_sqm ?? formData?.procedure_area ?? 0) || 0;
    const propertyTotal = Number(reportData?.total_valuation);
    return t.slice(-60).map((r) => {
      const marketPsm = Number(r.median_price_per_sqm);
      const marketTotal = Number.isFinite(marketPsm) ? marketPsm * area : null;
      return { month: r.month, label: monthLabel(r.month), property_total: Number.isFinite(propertyTotal) ? propertyTotal : null, market_total: Number.isFinite(marketTotal) ? marketTotal : null };
    });
  }, [reportData, formData]);

  const forecastSeries = useMemo(() => {
    const hist = (reportData?.forecast?.historical || []).slice(-12).map(r => ({ label: monthLabel(r.month), psm: r.median_price_per_sqm, is_forecast: false }));
    const proj = (reportData?.forecast?.forecast || []).map(r => ({ label: monthLabel(r.month), psm: r.median_price_per_sqm, is_forecast: true }));
    return [...hist, ...proj];
  }, [reportData]);

  const supplyDemandSeries = useMemo(() => {
    return (reportData?.supply_demand?.monthly || []).slice(-18).map(r => ({ label: monthLabel(r.month), transactions: r.transactions }));
  }, [reportData]);

  // ✅ BUG 5 FIX: removed exact district match — API already filters by area
  // previously this always returned empty because subjectDistrictName !== compDistrictName
  const filteredComparables = useMemo(() => {
    const list = Array.isArray(reportData?.comparables) ? reportData.comparables : [];
    const subjectProp = String(formData?.project_name_en || formData?.building_name_en || "").trim().toLowerCase();
    return list
      .filter((c) => {
        // Only exclude the exact same project — show all other area comparables
        if (!subjectProp) return true;
        const compProp = String(c?.project_name_en || c?.building_name_en || c?.master_project_en || "").trim().toLowerCase();
        if (!compProp) return true;
        return compProp !== subjectProp;
      })
      .sort((a, b) => (Number(b?.match_pct) || 0) - (Number(a?.match_pct) || 0));
  }, [reportData, formData]);

  const displayUserName = useMemo(() => {
    if (!loggedUser) return "User";
    if (loggedUser.user_metadata?.full_name) return loggedUser.user_metadata.full_name;
    if (loggedUser.email) { const name = loggedUser.email.split("@")[0]; return name.charAt(0).toUpperCase() + name.slice(1); }
    return "User";
  }, [loggedUser]);

  const goBack = () => navigate("/valuation");

  const areaName = formData?.area_name_en || "—";
  const subArea = formData?.sub_area_en || formData?.community_en || "";
  const projectName = formData?.project_name_en || formData?.building_name_en || "—";
  const propertyType = formData?.property_type_en || "Property";

  const totalVal = Number(reportData?.total_valuation);
  const rateSqm = Number(reportData?.price_per_sqm);
  const rateSqft = Number(reportData?.price_per_sqft ?? aedPerSqftFromAedPerSqm(rateSqm));
  const band = 0.15;
  const rangeLow = Number.isFinite(Number(reportData?.range_low)) ? Number(reportData?.range_low) : Number.isFinite(totalVal) ? totalVal * (1 - band) : null;
  const rangeHigh = Number.isFinite(Number(reportData?.range_high)) ? Number(reportData?.range_high) : Number.isFinite(totalVal) ? totalVal * (1 + band) : null;
  const compsCount = Number(reportData?.comparables_meta?.count ?? (reportData?.comparables || []).length);

  // ✅ BUG 2 FIX: use anchor_level from API instead of fake formula
  const anchorLevelConfidence = { project: 92, master_project: 85, bundle_project: 85, area: 72, city: 55, none: 40 };
  const confidencePct = Number.isFinite(Number(reportData?.confidence_pct))
    ? Number(reportData?.confidence_pct)
    : anchorLevelConfidence[reportData?.tx?.anchor_level] ?? 70;

  const sqm = Number(reportData?.procedure_area_sqm ?? formData?.procedure_area ?? 0);
  const sqft = Number(reportData?.procedure_area_sqft ?? sqmToSqft(sqm));

  const downPaymentPct = 0.20;
  const mortgageRate = 0.045;
  const mortgageYears = 25;
  const downPayment = Number.isFinite(totalVal) ? totalVal * downPaymentPct : null;
  const loanAmount = Number.isFinite(totalVal) ? totalVal * (1 - downPaymentPct) : null;
  const monthlyRate = mortgageRate / 12;
  const numPayments = mortgageYears * 12;
  const monthlyPayment = loanAmount ? loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1) : null;

  const dldFee = Number.isFinite(totalVal) ? totalVal * 0.04 : null;
  const agentBuyFee = Number.isFinite(totalVal) ? totalVal * 0.02 : null;
  const trusteeFee = 4000;
  const mortgageRegFee = loanAmount ? loanAmount * 0.0025 : null;
  const totalBuyingCost = dldFee && agentBuyFee && mortgageRegFee ? dldFee + agentBuyFee + trusteeFee + mortgageRegFee : null;
  const agentSellFee = Number.isFinite(totalVal) ? totalVal * 0.02 : null;

  const anchorLevel = reportData?.tx?.anchor_level || "area";
  const anchorLevelMap = { project: 100, master_project: 85, bundle_project: 85, area: 70, city: 55, none: 40 };
  const dataQuality = anchorLevelMap[anchorLevel] || 70;

  // ✅ BUG 4 FIX: derive factorWeights dynamically from real API data
  const factorWeights = useMemo(() => {
    const level = reportData?.tx?.anchor_level || "area";
    const comps = Number(reportData?.comparables_meta?.count || 0);

    // Location weight increases when we have project-level precision
    const locationW = level === "project" ? 40 : level === "master_project" ? 35 : level === "area" ? 30 : 20;
    // Comparable sales weight increases with more data points (max 25)
    const dataW = Math.min(25, Math.max(5, Math.round(comps * 2.5)));
    const sizeW = 20;
    const typeW = 15;
    // Recency fills the remainder to always sum to 100
    const recencyW = Math.max(5, 100 - locationW - dataW - sizeW - typeW);

    return [
      { name: "Location & Area",   value: locationW, color: "#B87333" },
      { name: "Property Size",     value: sizeW,     color: "#2563EB" },
      { name: "Property Type",     value: typeW,     color: "#10b981" },
      { name: "Comparable Sales",  value: dataW,     color: "#f59e0b" },
      { name: "Recency of Data",   value: recencyW,  color: "#8b5cf6" },
    ];
  }, [reportData]);

  const CSS = `
    :root{ --acq-text:#2B2B2B; --acq-accent:#B87333; --acq-border:#E5E5E5; }
    body{ margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto',sans-serif; }
    .reportPage{ width:100%; overflow-x:hidden; background:#F5F5F3; color:var(--acq-text); }
    .acqHdrLite{ position:fixed; top:0; left:0; right:0; z-index:60; background:#fff; border-bottom:1px solid var(--acq-border); }
    .acqHdrLiteInner{ max-width:80rem; margin:0 auto; height:64px; display:flex; align-items:center; padding:0 20px; }
    .acqHdrLogo h1{ margin:0; font-size:20px; font-weight:900; letter-spacing:-0.04em; text-transform:uppercase; cursor:pointer; }
    .acqHdrLiteSpacer{ height:64px; }
    .vcMain{ max-width:1200px; margin:0 auto; padding:40px 20px 80px; }
    .vcHeader{ margin-bottom:0; padding-bottom:24px; border-bottom:1px solid var(--acq-border); }
    .vcTitle{ margin:0 0 8px; font-size:32px; line-height:1.2; font-weight:700; letter-spacing:-0.02em; color:#2B2B2B; }
    .vcMeta{ display:flex; flex-wrap:wrap; gap:8px; color:rgba(43,43,43,.5); font-weight:400; font-size:13px; align-items:center; margin-bottom:12px; }
    .vcDot{ width:3px; height:3px; border-radius:50%; background:rgba(43,43,43,.3); display:inline-block; }
    .vcHeaderRow{ display:flex; gap:24px; flex-wrap:wrap; margin-top:12px; }
    .vcMini span:first-child{ font-size:10px; font-weight:600; letter-spacing:.05em; text-transform:uppercase; color:rgba(43,43,43,.4); display:block; }
    .vcMini span:last-child{ font-size:11px; font-weight:600; font-family:ui-monospace,monospace; color:#2B2B2B; }
    .vcSectionGrid{ display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-top:32px; padding-top:32px; border-top:1px solid #F0F0F0; }
    .vcSmallTitle{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 16px; }
    .vcValueBig{ font-size:48px; font-weight:700; letter-spacing:-0.02em; margin:0; color:#2B2B2B; }
    .vcValueSub{ font-size:13px; color:rgba(43,43,43,.5); font-weight:400; margin-top:6px; }
    .vcBar{ height:8px; background:#F5F5F5; border-radius:4px; overflow:hidden; display:flex; margin-top:20px; }
    .vcBar>div{ height:100%; }
    .vcBarLow{ width:25%; background:#E5E5E5; }
    .vcBarMid{ width:50%; background:#B87333; }
    .vcBarHigh{ width:25%; background:#E5E5E5; }
    .vcRange{ display:grid; grid-template-columns:1fr 1fr 1fr; margin-top:12px; font-size:11px; font-weight:600; }
    .vcRange div{ font-family:ui-monospace,monospace; }
    .vcRange small{ display:block; font-size:9px; color:rgba(43,43,43,.4); font-weight:600; letter-spacing:.08em; margin-bottom:4px; text-transform:uppercase; }
    .vcRangeMid{ text-align:center; }
    .vcRangeRight{ text-align:right; }
    .vcTip{ margin-top:20px; padding:12px 14px; background:#FAFAF8; border:1px solid #F0F0F0; display:flex; gap:10px; align-items:flex-start; border-radius:6px; }
    .vcTip p{ margin:0; font-size:12px; color:rgba(43,43,43,.6); line-height:1.5; }
    .vcChartCard{ height:260px; width:100%; background:#FAFAFA; border-radius:6px; padding:12px; }
    .vcCardsHead{ display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
    .vcCardsSubtitle{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 4px; }
    .vcCardsMainTitle{ font-size:18px; font-weight:700; margin:0; color:#2B2B2B; }
    .vcUnlockBtn{ border:none; background:transparent; color:#B87333; font-weight:700; font-size:11px; letter-spacing:.05em; text-transform:uppercase; border-bottom:1.5px solid #B87333; padding:0 0 4px; cursor:pointer; }
    .vcCards{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
    .vcCard{ border:1px solid #E8E8E8; padding:16px; border-radius:8px; background:#FFFFFF; transition:all .2s; }
    .vcCard:hover{ border-color:#B87333; box-shadow:0 2px 8px rgba(0,0,0,.04); }
    .vcTagRow{ display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
    .vcTag{ font-size:9px; font-weight:700; color:#2563EB; background:#EFF6FF; border:1px solid #DBEAFE; padding:3px 8px; border-radius:4px; text-transform:uppercase; letter-spacing:.08em; }
    .vcWhen{ font-size:10px; color:rgba(43,43,43,.4); font-weight:600; font-family:ui-monospace,monospace; }
    .vcCardTitle{ font-size:15px; font-weight:700; margin:0 0 4px; color:#2B2B2B; }
    .vcCardSub{ font-size:11px; color:rgba(43,43,43,.5); margin:0 0 16px; }
    .vcCardBottom{ display:flex; justify-content:space-between; align-items:flex-end; gap:12px; border-top:1px solid #F5F5F5; padding-top:12px; }
    .vcSoldLabel{ font-size:9px; color:rgba(43,43,43,.4); font-weight:600; letter-spacing:.08em; text-transform:uppercase; margin:0 0 4px; }
    .vcSoldPrice{ font-size:18px; font-weight:700; font-family:ui-monospace,monospace; margin:0; color:#2B2B2B; }
    .vcSize{ font-size:11px; color:rgba(43,43,43,.45); font-weight:600; font-family:ui-monospace,monospace; text-align:right; }
    .vcFeedback{ margin-top:48px; background:#FAFAF8; border:1px solid #F0F0F0; border-radius:18px; padding:24px 26px; box-shadow:0 10px 24px rgba(0,0,0,.04); }
    .vcFbTopRow{ display:flex; align-items:center; justify-content:space-between; gap:28px; }
    .vcFbLeft{ flex:1; min-width:320px; }
    .vcRewardBadge{ font-size:10px; font-weight:900; color:#B87333; background:#FEF3E7; border:1px solid #F0D9C0; padding:6px 12px; border-radius:999px; text-transform:uppercase; letter-spacing:.14em; display:inline-flex; align-items:center; gap:8px; }
    .vcFeedbackTitle{ font-size:30px; font-weight:900; font-style:italic; letter-spacing:-.02em; text-transform:uppercase; margin:10px 0 8px; color:#2B2B2B; }
    .vcFeedbackText{ font-size:13px; color:rgba(43,43,43,.55); line-height:1.6; margin:0; max-width:520px; }
    .vcFeedbackText a{ color:#B87333; font-weight:800; text-decoration:none; border-bottom:1.5px solid rgba(184,115,51,.55); }
    .vcFbRight{ display:flex; align-items:center; justify-content:flex-end; gap:14px; flex:0 0 auto; }
    .vcFbChoice{ width:128px; height:76px; border:1px solid #D9D9D9; background:#FFFFFF; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; cursor:pointer; transition:all .18s ease; color:rgba(43,43,43,.45); font-weight:900; letter-spacing:.16em; text-transform:uppercase; font-size:10px; box-shadow:0 6px 14px rgba(0,0,0,.04); }
    .vcFbChoice:hover{ border-color:#B87333; color:#B87333; }
    .vcFbChoice:disabled{ opacity:.55; cursor:not-allowed; }
    .vcFbFormTitle{ margin:0 0 14px; font-size:26px; font-weight:700; color:#2B2B2B; }
    .vcFbTextarea{ width:640px; max-width:100%; height:120px; border:1px solid #E6E6E6; border-radius:10px; padding:14px 16px; font-size:12px; line-height:1.6; background:#FFFFFF; color:#2B2B2B; outline:none; resize:none; }
    .vcFbActions{ margin-top:16px; display:flex; align-items:center; gap:22px; flex-wrap:wrap; }
    .vcFbSubmit{ min-width:380px; height:54px; padding:0 22px; border-radius:12px; border:none; background:#2B2B2B; color:#FFFFFF; cursor:pointer; font-size:11px; font-weight:900; letter-spacing:.16em; text-transform:uppercase; display:flex; align-items:center; justify-content:center; gap:12px; box-shadow:0 14px 26px rgba(0,0,0,.18); }
    .vcFbSubmit:hover{ background:#1F1F1F; }
    .vcFbSubmit:disabled{ opacity:.6; cursor:not-allowed; }
    .vcFbBack{ border:none; background:transparent; padding:0; height:54px; display:flex; align-items:center; font-size:11px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; color:rgba(43,43,43,.35); cursor:pointer; }
    .vcRewardScreen{ padding:46px 22px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:14px; }
    .vcRewardCheck{ width:56px; height:56px; border-radius:999px; display:flex; align-items:center; justify-content:center; background:rgba(34,197,94,.10); border:1px solid rgba(34,197,94,.18); }
    .vcRewardTitle{ margin:10px 0 2px; font-size:34px; font-weight:900; font-style:italic; color:#2B2B2B; letter-spacing:-.02em; }
    .vcRewardSub{ margin:0 0 10px; font-size:12px; color:rgba(43,43,43,.42); line-height:1.6; max-width:560px; }
    .vcVoucher{ margin-top:12px; width:min(560px,100%); background:#2B2B2B; color:#FFFFFF; border-radius:14px; padding:16px 18px; display:flex; align-items:center; justify-content:space-between; gap:18px; box-shadow:0 22px 40px rgba(0,0,0,.22); }
    .vcVoucherLeft{ display:flex; align-items:center; gap:14px; text-align:left; }
    .vcVoucherIcon{ width:44px; height:44px; border-radius:12px; background:#B87333; display:flex; align-items:center; justify-content:center; color:#2B2B2B; font-weight:900; font-size:18px; flex:0 0 auto; }
    .vcVoucherCode{ font-size:10px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; color:rgba(184,115,51,.95); }
    .vcVoucherName{ font-size:14px; font-weight:900; text-transform:uppercase; color:#FFFFFF; }
    .vcApplyBtn{ background:#FFFFFF; color:#2B2B2B; border:none; border-radius:12px; height:40px; padding:0 16px; font-size:11px; font-weight:900; letter-spacing:.14em; text-transform:uppercase; cursor:pointer; }
    .vcBottomSection{ margin-top:48px; }
    .vcShareSection{ background:#FAFAFA; border:1px solid #E8E8E8; border-radius:8px; padding:20px; margin-bottom:24px; }
    .vcShareLabel{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 12px; }
    .vcShareRow{ display:flex; gap:12px; }
    .vcShareInput{ flex:1; padding:10px 14px; border:1px solid #E5E5E5; border-radius:6px; font-size:12px; font-family:ui-monospace,monospace; background:#FFFFFF; color:rgba(43,43,43,.7); }
    .vcCopyBtn{ padding:10px 20px; background:#B87333; color:#FFFFFF; border:none; border-radius:6px; font-size:11px; font-weight:700; text-transform:uppercase; cursor:pointer; }
    .vcFooterInfo{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:24px; }
    .vcInfoTitle{ font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 8px; }
    .vcInfoContent{ font-size:12px; color:rgba(43,43,43,.7); line-height:1.6; margin:0; }
    .vcInfoList{ list-style:none; padding:0; margin:0; }
    .vcInfoList li{ font-size:12px; color:rgba(43,43,43,.7); margin-bottom:4px; padding-left:12px; position:relative; }
    .vcInfoList li:before{ content:'•'; position:absolute; left:0; color:rgba(43,43,43,.3); }
    .vcActions{ margin-top:32px; padding-top:24px; border-top:1px solid #E8E8E8; display:flex; justify-content:space-between; gap:14px; flex-wrap:wrap; align-items:center; }
    .vcBtn{ padding:12px 20px; font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; border-radius:6px; cursor:pointer; transition:all .2s; }
    .vcBtnPrimary{ background:#2B2B2B; color:#fff; border:1px solid #2B2B2B; }
    .vcBtnPrimary:hover{ background:#000; }
    .vcBtnGhost{ background:#fff; color:#2B2B2B; border:1px solid #E5E5E5; }
    .vcBtnGhost:hover{ background:#FAFAFA; border-color:#2B2B2B; }
    .statCard{ background:#fff; border:1px solid #E8E8E8; border-radius:10px; padding:18px 20px; }
    .statLabel{ font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 6px; }
    .statValue{ font-size:22px; font-weight:700; color:#2B2B2B; margin:0; }
    .statSub{ font-size:11px; color:rgba(43,43,43,.5); margin:4px 0 0; }
    .featureGrid{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
    .featureItem{ background:#FAFAFA; border:1px solid #F0F0F0; border-radius:8px; padding:14px 16px; }
    .featureIcon{ font-size:20px; margin-bottom:8px; }
    .featureLabel{ font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 4px; }
    .featureValue{ font-size:14px; font-weight:700; color:#2B2B2B; margin:0; }
    .txTable{ width:100%; border-collapse:collapse; }
    .txTable th{ font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); padding:0 12px 10px; text-align:left; border-bottom:1px solid #F0F0F0; }
    .txTable td{ font-size:12px; padding:12px; border-bottom:1px solid #F5F5F5; color:#2B2B2B; vertical-align:middle; }
    .txTable tr:last-child td{ border-bottom:none; }
    .txTable tr:hover td{ background:#FAFAF8; }
    .factorRow{ display:flex; align-items:center; gap:12px; margin-bottom:14px; }
    .factorName{ font-size:12px; font-weight:600; color:#2B2B2B; width:160px; flex-shrink:0; }
    .factorBarWrap{ flex:1; height:8px; background:#F0F0F0; border-radius:4px; overflow:hidden; }
    .factorBarFill{ height:100%; border-radius:4px; }
    .factorPct{ font-size:11px; font-weight:700; color:rgba(43,43,43,.55); width:36px; text-align:right; flex-shrink:0; }
    .finCard{ background:#FAFAFA; border:1px solid #F0F0F0; border-radius:10px; padding:18px; text-align:center; }
    .finLabel{ font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:rgba(43,43,43,.4); margin:0 0 8px; }
    .finValue{ font-size:20px; font-weight:700; color:#2B2B2B; margin:0; }
    .finSub{ font-size:11px; color:rgba(43,43,43,.5); margin:4px 0 0; }
    .costRow{ display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #F5F5F5; font-size:13px; }
    .costRow:last-child{ border-bottom:none; }
    .costLabel{ color:rgba(43,43,43,.7); font-weight:500; }
    .costValue{ font-weight:700; font-family:ui-monospace,monospace; color:#2B2B2B; }
    .costTotal{ background:#2B2B2B; color:#fff; border-radius:8px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; margin-top:12px; font-weight:700; }
    @media(max-width:1024px){ .vcSectionGrid{ grid-template-columns:1fr; } .vcCards{ grid-template-columns:1fr 1fr; } .featureGrid{ grid-template-columns:repeat(2,1fr); } .vcFooterInfo{ grid-template-columns:1fr; } }
    @media(max-width:640px){
  .vcValueBig{ font-size:30px; }
  .vcCards{ grid-template-columns:1fr; }
  .featureGrid{ grid-template-columns:1fr 1fr; }
  .vcTitle{ font-size:20px; }
  .vcFbSubmit{ width:100%; min-width:0; }
  .vcFbLeft{ min-width:0; }
  .vcFbTopRow{ flex-direction:column; }
  .vcFbRight{ width:100%; }
  .vcFbChoice{ flex:1; }
  .vcMain{ padding:16px 12px 60px; }
  .vcSectionGrid{ grid-template-columns:1fr !important; gap:20px; }
  .vcChartCard{ height:200px; padding:8px; }
  .vcRange{ font-size:9px; }
  .vcFooterInfo{ grid-template-columns:1fr !important; }
  .vcShareRow{ flex-direction:column; }
  .vcShareInput{ width:100%; box-sizing:border-box; }
  .vcCopyBtn{ width:100%; padding:12px; }
  .vcActions{ flex-direction:column; }
  .vcBtn{ width:100%; text-align:center; box-sizing:border-box; }
  .vcFbTextarea{ width:100%; box-sizing:border-box; }
  .txTable th,.txTable td{ font-size:10px; padding:8px 5px; }
  .vcVoucher{ flex-direction:column; align-items:flex-start; gap:10px; }
  .vcApplyBtn{ width:100%; }
  .vcFeedback{ padding:16px; }
  .vcRewardTitle{ font-size:24px; }
  .vcFeedbackTitle{ font-size:22px; }
  .statCard{ min-width:0 !important; }
}


    @media(max-width:768px){
  .vcMain{ padding:20px 12px 60px; }
  .vcTitle{ font-size:22px; }
  .vcValueBig{ font-size:28px; }
  .vcSectionGrid{ grid-template-columns:1fr; gap:20px; }
  .vcCards{ grid-template-columns:1fr; }
  .featureGrid{ grid-template-columns:1fr 1fr; }
  .vcFooterInfo{ grid-template-columns:1fr; gap:16px; }
  .vcFbTopRow{ flex-direction:column; gap:16px; }
  .vcFbLeft{ min-width:0; }
  .vcFbRight{ width:100%; justify-content:space-between; }
  .vcFbChoice{ flex:1; height:60px; }
  .vcFbSubmit{ min-width:0; width:100%; }
  .vcFbTextarea{ width:100%; box-sizing:border-box; }
  .vcShareRow{ flex-direction:column; }
  .vcShareInput{ width:100%; box-sizing:border-box; }
  .vcCopyBtn{ width:100%; }
  .vcActions{ flex-direction:column; }
  .vcBtn{ width:100%; text-align:center; }
  .statCard{ min-width:0 !important; }
  .finCard{ padding:14px 12px; }
}

@media(max-width:480px){
  .vcTitle{ font-size:17px; }
  .vcValueBig{ font-size:24px; }
  .featureGrid{ grid-template-columns:1fr; }
  .vcCards{ grid-template-columns:1fr; }
  .vcMeta{ font-size:11px; }
  .vcFbChoice{ height:58px; font-size:9px; }
  .factorName{ width:110px; font-size:11px; }
  .vcRewardSub{ font-size:11px; }
  .vcVoucherName{ font-size:12px; }
}
.vcSectionGrid{ display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-top:32px; padding-top:32px; border-top:1px solid #F0F0F0; }
  `;

  return (
    <div className="reportPage">
      <style>{CSS}</style>
      <HeaderLite />

      {copied && (
        <div style={{ position: "fixed", top: 76, right: 18, zIndex: 9999, background: "#2B2B2B", color: "#fff", padding: "10px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, letterSpacing: ".04em", boxShadow: "0 10px 30px rgba(0,0,0,.18)" }} role="status" aria-live="polite">
          ✅ Copied
        </div>
      )}

      <main className="vcMain">

        {/* ── HEADER ── */}
        <section className="vcHeader">
          <h1 className="vcTitle">{projectName}</h1>
          <div className="vcMeta">
            <span>{displayBedroomsFromForm(formData)}</span>
            <span className="vcDot" />
            <span>{displayBathroomsFromForm(formData)}</span>
            <span className="vcDot" />
            <span>{Number.isFinite(sqft) ? `${fmtNum(sqft, 0)} SQFT` : "—"}</span>
            <span className="vcDot" />
            <span>📍 {areaName}{subArea ? `, ${subArea}` : ""}</span>
          </div>
          <div className="vcHeaderRow">
            <div className="vcMini">
              <span>Generated On</span>
              <span>{fmtDate(valRow?.created_at || reportData?.created_at || new Date().toISOString())}</span>
            </div>
          </div>
        </section>

        {loading ? (
          <div style={{ marginTop: 32, background: "#fff", border: "1px solid #E8E8E8", padding: 24, borderRadius: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Loading report…</div>
            <div style={{ color: "rgba(43,43,43,.55)" }}>Generating prediction and fetching comparables</div>
          </div>
        ) : err ? (
          <div style={{ marginTop: 32, background: "#fff", border: "1px solid #E8E8E8", padding: 24, borderRadius: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Error</div>
            <div style={{ color: "rgba(43,43,43,.7)" }}>{err}</div>
          </div>
        ) : (
          <>

            {/* ── 1. VALUATION RANGE ── */}
            <section className="vcSectionGrid" style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid #F0F0F0" }}>
              <div>
                <h2 className="vcSmallTitle">Estimated Market Value</h2>
                <p className="vcValueBig">{fmtAED(reportData?.total_valuation)}</p>
                <div className="vcValueSub">± {fmtPct(confidencePct, 0)} Confidence · {reportData?.tx?.anchor_level || "area"} level</div>
                <div className="vcBar"><div className="vcBarLow" /><div className="vcBarMid" /><div className="vcBarHigh" /></div>
                <div className="vcRange">
                  <div><small>Low</small>{Number.isFinite(rangeLow) ? fmtAED(rangeLow) : "—"}</div>
                  <div className="vcRangeMid"><small>Most Likely</small>{Number.isFinite(totalVal) ? fmtAED(totalVal) : "—"}</div>
                  <div className="vcRangeRight"><small>High</small>{Number.isFinite(rangeHigh) ? fmtAED(rangeHigh) : "—"}</div>
                </div>
                <div className="vcTip">
                  <p>Accuracy based on historical transaction density in {areaName}. For institutional-grade accuracy, upgrade to <strong>DealLens™</strong>.</p>
                </div>
              </div>

              <div>
                <h2 className="vcSmallTitle" style={{ marginBottom: 12 }}>Prices & Trends — {areaName}</h2>
                <div className="vcChartCard">
                  {trendSeries.length >= 2 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                        <XAxis dataKey="label" interval={5} tick={{ fontSize: 10, fill: "#999" }} />
                        <YAxis tickFormatter={(v) => fmtNum(v / 1000000, 1) + "M"} tick={{ fontSize: 10, fill: "#999" }} />
                        <Tooltip formatter={(v) => fmtAED(v)} contentStyle={{ fontSize: 11, border: "1px solid #E8E8E8", borderRadius: 6 }} />
                        <Area type="monotone" dataKey="market_total" fill="#B87333" fillOpacity={0.1} stroke="none" />
                        <Line type="monotone" dataKey="market_total" dot={false} stroke="#B87333" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(43,43,43,.4)", fontSize: 13, fontWeight: 700, letterSpacing: ".1em" }}>No trend data available</div>
                  )}
                </div>
                <div style={{ marginTop: 10, color: "rgba(43,43,43,.55)", fontSize: 12, lineHeight: 1.6 }}>
                  <strong style={{ color: "#2B2B2B" }}>Rate:</strong> {Number.isFinite(rateSqm) ? `AED ${fmtNum(rateSqm, 0)}/sqm` : "—"} {Number.isFinite(rateSqft) ? `· AED ${fmtNum(rateSqft, 0)}/sqft` : ""}
                </div>
              </div>
            </section>

            {/* ── 2. 6-MONTH FORECAST ── */}
            <SectionBox>
              <SectionHeader label="AI Projection" title="6-Month Price Forecast" />
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                {reportData?.forecast?.growth_pct != null && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: reportData.forecast.growth_pct >= 0 ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${reportData.forecast.growth_pct >= 0 ? "#86EFAC" : "#FCA5A5"}`, borderRadius: 6, padding: "5px 12px" }}>
                    <span style={{ fontSize: 14 }}>{reportData.forecast.growth_pct >= 0 ? "📈" : "📉"}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: reportData.forecast.growth_pct >= 0 ? "#15803D" : "#DC2626", letterSpacing: ".05em", textTransform: "uppercase" }}>
                      {reportData.forecast.growth_pct >= 0 ? "+" : ""}{reportData.forecast.growth_pct?.toFixed(1)}% projected over 6 months
                    </span>
                  </div>
                )}
                <span style={{ fontSize: 11, color: "rgba(43,43,43,.4)", fontWeight: 600 }}>Based on historical trend in {areaName}</span>
              </div>
              <div style={{ height: 240 }}>
                {forecastSeries.length >= 2 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastSeries}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#999" }} />
                      <YAxis tickFormatter={(v) => `${fmtNum(v, 0)}`} tick={{ fontSize: 10, fill: "#999" }} />
                      <Tooltip formatter={(v) => [`AED ${fmtNum(v, 0)}/sqm`, "Median PSM"]} contentStyle={{ fontSize: 11, border: "1px solid #E8E8E8", borderRadius: 6 }} />
                      <Line type="monotone" dataKey="psm" dot={(props) => {
                        const { cx, cy, payload } = props;
                        return payload.is_forecast
                          ? <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={4} fill="#B87333" stroke="#fff" strokeWidth={2} strokeDasharray="4 2" />
                          : <circle key={`dot-${cx}-${cy}`} cx={cx} cy={cy} r={3} fill="#2563EB" />;
                      }}
                        stroke="#B87333" strokeWidth={2} strokeDasharray={(d) => d?.is_forecast ? "6 3" : "0"}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(43,43,43,.4)", fontSize: 13, fontWeight: 700 }}>Insufficient data for forecast</div>
                )}
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: "rgba(43,43,43,.4)", fontStyle: "italic" }}>
                Dashed line = projected values · Solid line = historical data. Projections are indicative only.
              </div>
            </SectionBox>

            {/* ── 3-YEAR PRICE FORECAST ── */}
{Number.isFinite(totalVal) && totalVal > 0 ? (
  <PricePredictionChart currentValue={totalVal} />
) : null}

            {/* ── 3. PROPERTY FEATURES ── */}
            <SectionBox>
              <SectionHeader label="Property Details" title="Property Features" />
              <div className="featureGrid">
                {[
                  { icon: "🏢", label: "Property Type", value: formData?.property_type_en || "—" },
                  { icon: "🛏", label: "Bedrooms", value: displayBedroomsFromForm(formData) },
                  { icon: "🚿", label: "Bathrooms", value: displayBathroomsFromForm(formData) },
                  { icon: "📐", label: "Area (sqft)", value: Number.isFinite(sqft) ? `${fmtNum(sqft, 0)} sqft` : "—" },
                  { icon: "📏", label: "Area (sqm)", value: Number.isFinite(sqm) ? `${fmtNum(sqm, 2)} sqm` : "—" },
                  { icon: "📍", label: "District", value: areaName },
                  { icon: "🏗", label: "Project", value: projectName },
                  { icon: "🔑", label: "Ownership", value: "Freehold" },
                  { icon: "💰", label: "Rate / sqft", value: Number.isFinite(rateSqft) ? `AED ${fmtNum(rateSqft, 0)}` : "—" },
                ].map((f) => (
                  <div className="featureItem" key={f.label}>
                    <div className="featureIcon">{f.icon}</div>
                    <div className="featureLabel">{f.label}</div>
                    <div className="featureValue">{f.value}</div>
                  </div>
                ))}
              </div>
            </SectionBox>

            {/* ── 4. SUPPLY & DEMAND ── */}
            <SectionBox>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 16 }}>
                <SectionHeader label="Market Activity" title="Supply & Demand" />
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {[
                    { label: "Total Sales (loaded)", value: fmtNum(reportData?.supply_demand?.total_sales, 0) },
                    { label: "Avg / Month", value: fmtNum(reportData?.supply_demand?.avg_monthly, 1) },
                  ].map(s => (
                    <div className="statCard" key={s.label} style={{ minWidth: 120 }}>
                      <div className="statLabel">{s.label}</div>
                      <div className="statValue">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ height: 220 }}>
                {supplyDemandSeries.length >= 2 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={supplyDemandSeries} barSize={14}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F5F5F5" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#999" }} interval={2} />
                      <YAxis tick={{ fontSize: 10, fill: "#999" }} />
                      <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E8E8E8", borderRadius: 6 }} formatter={(v) => [v, "Transactions"]} />
                      <Bar dataKey="transactions" fill="#B87333" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(43,43,43,.4)", fontSize: 13, fontWeight: 700 }}>No supply/demand data available</div>
                )}
              </div>
            </SectionBox>

            {/* ── 5. TRANSACTION HISTORY ── */}
            <SectionBox>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <SectionHeader label="Recent Sales" title="Transaction History" />
                <button className="vcUnlockBtn" type="button">View All</button>
              </div>
              {filteredComparables.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table className="txTable">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Area</th>
                        <th>Bedrooms</th>
                        <th>Size</th>
                        <th>Sold For</th>
                        <th>Price / sqft</th>
                        <th>Date</th>
                        <th>Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredComparables.slice(0, 8).map((c, idx) => {
                        const soldDate = fmtDate(c?.instance_date ?? c?.sold_date);
                        const price = Number(c?.actual_worth ?? c?.price_aed ?? c?.transaction_value);
                        const sizeSqft = Number(c?.size_sqft ?? (c?.procedure_area ? c.procedure_area * 10.764 : null));
                        const psf = Number(c?.price_per_sqft);
                        const match = Number(c?.match_pct);
                        return (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{c?.project_name_en || c?.building_name_en || "—"}</td>
                            <td style={{ color: "rgba(43,43,43,.6)" }}>{c?.area_name_en || "—"}</td>
                            <td>{c?.rooms_en || "—"}</td>
                            <td style={{ fontFamily: "ui-monospace,monospace" }}>{Number.isFinite(sizeSqft) ? `${fmtNum(sizeSqft, 0)} sqft` : "—"}</td>
                            <td style={{ fontWeight: 700, fontFamily: "ui-monospace,monospace" }}>{Number.isFinite(price) ? fmtAED(price) : "—"}</td>
                            <td style={{ fontFamily: "ui-monospace,monospace" }}>{Number.isFinite(psf) ? `AED ${fmtNum(psf, 0)}` : "—"}</td>
                            <td style={{ color: "rgba(43,43,43,.5)", fontSize: 11 }}>{soldDate}</td>
                            <td>
                              <span style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #DBEAFE", borderRadius: 4, padding: "2px 7px", fontSize: 9, fontWeight: 700, letterSpacing: ".06em" }}>
                                {Number.isFinite(match) ? `${Math.round(match)}%` : "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: 20, background: "#FAFAFA", borderRadius: 8, color: "rgba(43,43,43,.5)", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
                  No comparable transactions found for this area.
                </div>
              )}
            </SectionBox>

            {/* ── 6. FINANCING OPTIONS ──
            <SectionBox>
              <SectionHeader label="Mortgage Calculator" title="Financing Options" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 24 }}>
                <div className="finCard">
                  <div className="finLabel">Down Payment (20%)</div>
                  <div className="finValue">{downPayment ? fmtAED(downPayment) : "—"}</div>
                  <div className="finSub">Minimum required</div>
                </div>
                <div className="finCard" style={{ background: "#2B2B2B", borderColor: "#2B2B2B" }}>
                  <div className="finLabel" style={{ color: "rgba(255,255,255,.5)" }}>Loan Amount (80%)</div>
                  <div className="finValue" style={{ color: "#fff" }}>{loanAmount ? fmtAED(loanAmount) : "—"}</div>
                  <div className="finSub" style={{ color: "rgba(255,255,255,.4)" }}>At 4.5% p.a.</div>
                </div>
                <div className="finCard" style={{ background: "#B87333", borderColor: "#B87333" }}>
                  <div className="finLabel" style={{ color: "rgba(255,255,255,.7)" }}>Est. Monthly Payment</div>
                  <div className="finValue" style={{ color: "#fff" }}>{monthlyPayment ? fmtAED(monthlyPayment) : "—"}</div>
                  <div className="finSub" style={{ color: "rgba(255,255,255,.6)" }}>Over 25 years</div>
                </div>
              </div>
              <div style={{ background: "#FAFAF8", border: "1px solid #F0F0F0", borderRadius: 8, padding: "14px 18px", fontSize: 12, color: "rgba(43,43,43,.55)", lineHeight: 1.6 }}>
                ⚠️ Estimates based on 4.5% interest rate, 25-year term, 20% down payment. Actual mortgage terms depend on your bank, credit profile, and UAE Central Bank regulations. Upgrade to <strong style={{ color: "#B87333" }}>CertiFi™</strong> for a lender-ready valuation report.
              </div>
            </SectionBox> */}

            {/* ── 7. KEY FACTORS ── */}
            <SectionBox>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
                <div>
                  <SectionHeader label="Valuation Model" title="Key Factors in Your Evaluation" />
                  {factorWeights.map((f) => (
                    <div className="factorRow" key={f.name}>
                      <div className="factorName">{f.name}</div>
                      <div className="factorBarWrap">
                        <div className="factorBarFill" style={{ width: `${f.value * 4}%`, background: f.color }} />
                      </div>
                      <div className="factorPct">{f.value}%</div>
                    </div>
                  ))}
                  <div style={{ marginTop: 16, padding: "10px 14px", background: "#FAFAFA", border: "1px solid #F0F0F0", borderRadius: 8, fontSize: 11, color: "rgba(43,43,43,.55)", lineHeight: 1.6 }}>
                    Anchor level: <strong style={{ color: "#2B2B2B" }}>{reportData?.tx?.anchor_level || "area"}</strong> · Data quality score: <strong style={{ color: "#2B2B2B" }}>{dataQuality}%</strong>
                  </div>
                </div>
                <div>
                  <SectionHeader label="Confidence" title="Data Quality Breakdown" />
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={factorWeights} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={({ name, value }) => `${value}%`} labelLine={false} fontSize={13}>
                          {factorWeights.map((f, i) => <Cell key={f.name} fill={f.color} />)}
                        </Pie>
                        <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ fontSize: 11, border: "1px solid #E8E8E8", borderRadius: 6 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                    {factorWeights.map(f => (
                      <div key={f.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: "rgba(43,43,43,.75)" }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: f.color, flexShrink: 0 }} />
                        {f.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SectionBox>

            {/* ── 8. ADDITIONAL COSTS ── */}
            {/* <SectionBox>
              <SectionHeader label="Transaction Costs" title="Additional Cost to Buy or Sell" />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2B2B2B", marginBottom: 12 }}>🏦 Buying Costs</div>
                  {[
                    { label: "DLD Transfer Fee (4%)", value: dldFee },
                    { label: "Agent Commission (2%)", value: agentBuyFee },
                    { label: "Trustee Office Fee", value: trusteeFee },
                    { label: "Mortgage Registration (0.25%)", value: mortgageRegFee },
                  ].map(c => (
                    <div className="costRow" key={c.label}>
                      <span className="costLabel">{c.label}</span>
                      <span className="costValue">{c.value ? fmtAED(c.value) : "—"}</span>
                    </div>
                  ))}
                  <div className="costTotal">
                    <span style={{ fontSize: 12, letterSpacing: ".06em", textTransform: "uppercase" }}>Total Buying Cost</span>
                    <span style={{ fontSize: 16 }}>{totalBuyingCost ? fmtAED(totalBuyingCost) : "—"}</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#2B2B2B", marginBottom: 12 }}>🤝 Selling Costs</div>
                  {[
                    { label: "Agent Commission (2%)", value: agentSellFee },
                    { label: "NOC Fee (varies)", value: "AED 500 – 5,000" },
                    { label: "Trustee Office Fee", value: "AED 4,000" },
                    { label: "Mortgage Clearance (if any)", value: "Varies" },
                  ].map(c => (
                    <div className="costRow" key={c.label}>
                      <span className="costLabel">{c.label}</span>
                      <span className="costValue">{typeof c.value === "number" ? fmtAED(c.value) : c.value || "—"}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 16, padding: "12px 14px", background: "#FEF3E7", border: "1px solid #F0D9C0", borderRadius: 8, fontSize: 11, color: "rgba(43,43,43,.65)", lineHeight: 1.6 }}>
                    ℹ️ DLD fees apply to buyer. Seller is responsible for NOC and clearance. Consult a RERA-registered agent for exact figures.
                  </div>
                </div>
              </div>
            </SectionBox> */}

            {/* ── 8. ADDITIONAL COSTS ── */}
<SectionBox>
  <SectionHeader label="Transaction Costs" title="Additional Cost to Buy or Sell" />
  <UAECostCalculator initialPrice={totalVal} />
</SectionBox>

            {/* ── FEEDBACK ── */}
            <section className="vcFeedback">
              {fbStep === "choose" && (
                <div className="vcFbTopRow">
                  <div className="vcFbLeft">
                    <span className="vcRewardBadge">🎁 Community Reward</span>
                    <h3 className="vcFeedbackTitle" style={{ marginBottom: 8 }}>Was our valuation accurate?</h3>
                    <p className="vcFeedbackText">Help us improve our AI engine. Submit a 10-second feedback and unlock <a href="#">1 Free DealLens™ Report</a> (Value: AED 149).</p>
                  </div>
                  <div className="vcFbRight">
                    {[
                      { label: "TOO HIGH", rating: "too_high", icon: "📈" },
                      { label: "SPOT ON", rating: "spot_on", icon: "✅" },
                      { label: "TOO LOW", rating: "too_low", icon: "📉" },
                    ].map(b => (
                      <button key={b.rating} className="vcFbChoice" type="button" disabled={fbSubmitting} onClick={() => { setFbRating(b.rating); setFbNote(""); setFbStep("form"); }}>
                        <span style={{ fontSize: 18 }}>{b.icon}</span>{b.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {fbStep === "form" && (
                <div>
                  <h3 className="vcFbFormTitle">How can we improve?</h3>
                  <textarea className="vcFbTextarea" placeholder="Tell us what data points we missed (e.g. recent renovations, building amenities...)" value={fbNote} onChange={(e) => setFbNote(e.target.value)} />
                  <div className="vcFbActions">
                    <button className="vcFbSubmit" type="button" disabled={fbSubmitting || !fbRating} onClick={() => submitFeedback(fbRating, fbNote)}>
                      SUBMIT FEEDBACK &amp; CLAIM REWARD <span aria-hidden="true">🎟️</span>
                    </button>
                    <button className="vcFbBack" type="button" disabled={fbSubmitting} onClick={() => { setFbStep("choose"); setFbRating(""); setFbNote(""); }}>GO BACK</button>
                  </div>
                </div>
              )}
              {fbStep === "success" && (
                <div className="vcRewardScreen">
  <div className="vcRewardCheck">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  </div>
  <h3 className="vcRewardTitle">Reward Unlocked!</h3>
  <p className="vcRewardSub">Your feedback has been logged. You will receive an email with your free subscription shortly.</p>
  <button className="vcFbBack" type="button" onClick={() => { setFbStep("choose"); setFbRating(""); setFbNote(""); }} style={{ marginTop: 10 }}>GO BACK</button>
</div>
              )}
            </section>

            {/* ── SHARE + FOOTER INFO ── */}
            <section className="vcBottomSection">
              <div className="vcShareSection">
                <p className="vcShareLabel">Public Shareable Link</p>
                <div className="vcShareRow">
                  <input type="text" className="vcShareInput" value={shareUrl} readOnly placeholder="Link will appear once report is saved…" />
                  <button className="vcCopyBtn" onClick={handleCopyShareLink} disabled={!shareUrl} style={{ opacity: shareUrl ? 1 : 0.45, cursor: shareUrl ? "pointer" : "not-allowed" }}>Copy</button>
                </div>
                {!shareUrl && (
                  <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(43,43,43,.4)", fontStyle: "italic" }}>
                    Saving report to generate shareable link…
                  </p>
                )}
              </div>
              <div className="vcFooterInfo">
                <div>
                  <p className="vcInfoTitle">Purpose</p>
                  <p className="vcInfoContent">Prepared for investment decision-making only. <strong>NOT suitable for</strong>:</p>
                  <ul className="vcInfoList">
                    <li>Bank mortgage applications (upgrade to CertiFi™)</li>
                    <li>Legal proceedings</li>
                    <li>Tax assessments</li>
                    <li>Financial reporting</li>
                  </ul>
                </div>
                <div>
                  <p className="vcInfoTitle">Intended User</p>
                  <p className="vcInfoContent">{displayUserName} — For personal use only</p>
                </div>
                <div>
                  <p className="vcInfoTitle">Third-Party Reliance</p>
                  <p className="vcInfoContent">Not permitted without explicit written consent from ACQARLABS L.L.C-FZ.</p>
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
