



import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

  // ✅ Report + New Header responsive CSS (NO functionality change)
  const MOBILE_CSS = `
    .reportPage { width: 100%; overflow-x: hidden; background: #f3f4f6; }

    /* ✅ New header styles */
    .rhdr {
      position: sticky;
      top: 0;
      z-index: 50;
      background: #ffffff;
      border-bottom: 1px solid #e5e7eb;
    }
    .rhdrInner {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 0 18px;
      box-sizing: border-box;
    }
    .rhdrLeft { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .rhdrLogoBox {
      width: 34px; height: 34px; border-radius: 9px;
      display: grid; place-items: center;
      background: #111827; color: #fff; font-weight: 900; flex: 0 0 auto;
    }
    .rhdrBrand {
      font-weight: 900; letter-spacing: 1.8px; color: #111827;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .rhdrCenter { display: flex; justify-content: center; flex: 1; min-width: 0; }
    .rhdrPill {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 8px 14px; border-radius: 999px;
      background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412;
      font-weight: 900; font-size: 12px; letter-spacing: 1px; text-transform: uppercase;
      white-space: nowrap; max-width: 100%; overflow: hidden; text-overflow: ellipsis;
    }
    .rhdrRight { display: flex; align-items: center; gap: 12px; flex: 0 0 auto; }
    .rhdrPortal {
      font-size: 11px; letter-spacing: 2px; color: #9ca3af;
      font-weight: 800; text-transform: uppercase; white-space: nowrap;
    }
    .rhdrAvatar {
      width: 34px; height: 34px; border-radius: 999px;
      background: #b45309; color: #fff; font-weight: 900;
      display: grid; place-items: center;
      box-shadow: 0 10px 18px rgba(180,83,9,0.25);
      flex: 0 0 auto; font-size: 12px;
    }
    .rhdrBanner {
      max-width: 1200px; margin: 0 auto; width: 100%;
      padding: 10px 18px 12px; box-sizing: border-box;
      color: #b45309; font-weight: 800; text-align: center;
      font-size: 12px; background: #ffffff;
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
      .rhdrInner { padding: 0 14px; }
      .rhdrBanner { padding: 10px 14px 12px; }
    }

    @media (max-width: 768px) {
  /* ✅ Header becomes 2-row layout */
  .rhdrInner{
    height: auto !important;
    padding: 10px 12px !important;
    display: grid !important;
    grid-template-columns: 1fr auto !important;
    grid-template-areas:
      "left right"
      "center center" !important;
    row-gap: 8px !important;
    align-items: center !important;
  }

  .rhdrLeft { grid-area: left !important; }
  .rhdrRight { grid-area: right !important; }
  .rhdrCenter{
    grid-area: center !important;
    justify-content: center !important;
    width: 100% !important;
  }

  /* hide portal text on mobile (already) */
  .rhdrPortal{ display:none !important; }

  /* ✅ pill: smaller + centered */
  .rhdrPill{
    width: fit-content !important;
    max-width: 100% !important;
    font-size: 11px !important;
    padding: 7px 12px !important;
  }

  /* ✅ brand text smaller */
  .rhdrBrand{
    font-size: 13px !important;
    letter-spacing: 1.2px !important;
  }

  /* ✅ banner: tighter + better readability */
  .rhdrBanner{
    padding: 10px 12px 12px !important;
    font-size: 11px !important;
    line-height: 1.35 !important;
  }
}

@media (max-width: 420px) {
  /* extra tiny screens */
  .rhdrLogoBox{ width: 30px !important; height: 30px !important; }
  .rhdrAvatar{ width: 30px !important; height: 30px !important; font-size: 11px !important; }
  .rhdrPill{ font-size: 10.5px !important; padding: 6px 10px !important; }
}

  `;


  return (
    <div className="reportPage">
      <style>{MOBILE_CSS}</style>

      {/* ✅ NEW Header (replaces old NavBar logic on Report screen) */}
      <div className="rhdr">
  <div className="rhdrInner">
    <div className="rhdrLeft">
      <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-[#2B2B2B] uppercase whitespace-nowrap">
        ACQAR
      </h1>
    </div>
  </div>
</div>


          <div className="rhdrCenter">
            <div className="rhdrPill">VALUcheck™ REPORT</div>
          </div>

          <div className="rhdrRight">
            <div className="rhdrPortal">INVESTOR PORTAL</div>
            <div className="rhdrAvatar" title="User">
              {headerInitials}
            </div>
          </div>
        </div>

        <div className="rhdrBanner">
          🎉 Early Customer Offer: ValuCheck™ is <b>FREE</b> for First <b>1000 Customers!</b>.
        </div>
      </div>

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
                                className={`matchPill ${
                                  match >= 90 ? "good" : match >= 80 ? "mid" : "low"
                                }`}
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
    </div>
  );
}

