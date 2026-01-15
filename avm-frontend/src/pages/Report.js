import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/report.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

const API = process.env.REACT_APP_AVM_API || "http://127.0.0.1:8000";

function formatNumber(x, digits = 0) {
  if (x === null || x === undefined || Number.isNaN(Number(x))) return "—";
  return Number(x).toLocaleString(undefined, { maximumFractionDigits: digits });
}
function formatAED(x) {
  return `${formatNumber(x, 0)} AED`;
}
function todayParts() {
  const d = new Date();
  return { y: d.getFullYear(), m: d.getMonth() + 1, day: d.getDate() };
}

export default function Report({ formData, reportData, setReportData }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!formData) navigate("/valuation");
  }, [formData, navigate]);

  const payload = useMemo(() => {
    if (!formData) return null;
    const { y, m, day } = todayParts();

    return {
      data: {
        ...formData,
        // backend model expects these typical fields:
        rooms_en: `${formData.bedrooms} B/R`,
        has_parking: Number(formData.parking_spaces) > 0 ? 1 : 0,
        procedure_area_clipped: formData.procedure_area,
        instance_year: y,
        instance_month: m,
        instance_day: day,
      },
    };
  }, [formData]);

  async function postJSON(path, body) {
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function loadReport() {
    if (!payload) return;
    setLoading(true);
    setErr("");

    try {
      const pred = await postJSON("/predict", payload);

      let comps = [];
      try {
        const c = await postJSON("/comparables", payload);
        comps = c?.comparables || [];
      } catch {
        comps = [];
      }

      let charts = { distribution: [], trend: [] };
      try {
        const ch = await postJSON("/charts", payload);
        charts = {
          distribution: ch?.distribution || [],
          trend: ch?.trend || [],
        };
      } catch {
        charts = { distribution: [], trend: [] };
      }

      setReportData({ pred, comps, charts });
    } catch (e) {
      setErr(e.message || "Error generating report");
    } finally {
      setLoading(false);
    }
  }

  // Auto-run once when page opens
  useEffect(() => {
    if (!reportData && payload) loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  const compsBar = useMemo(() => {
    return (reportData?.comps || []).slice(0, 10).map((c, idx) => ({
      name: `Comp ${idx + 1}`,
      price: Number(c.meter_sale_price || 0),
    }));
  }, [reportData]);

  const distData = useMemo(() => {
    return (reportData?.charts?.distribution || []).map((b) => ({
      bin: `${Math.round(b.bin_start)}–${Math.round(b.bin_end)}`,
      count: b.count,
    }));
  }, [reportData]);

  const trendData = useMemo(() => {
    return (reportData?.charts?.trend || []).map((t) => ({
      month: t.month,
      median: Number(t.median_meter_sale_price || 0),
    }));
  }, [reportData]);

  const pred = reportData?.pred;

  return (
    <div className="reportBg">
      <NavBar />

      <div className="reportContainer">
        <div className="reportTop">
          <div>
            <div className="reportTitle">Valuation Report</div>
            <div className="reportSub">
              {formData?.building_name_en} • {formData?.area_name_en} • {formData?.property_type_en}
            </div>
          </div>

          <div className="reportActions">
            <button className="btnGhost" onClick={() => navigate("/valuation")}>
              Edit details
            </button>
            <button className="btnPrimary2" onClick={loadReport} disabled={loading}>
              {loading ? "Refreshing…" : "Refresh report"}
            </button>
          </div>
        </div>

        {err && <div className="errorBox2">Error: {err}</div>}

        <div className="kpiGrid">
          <KPI label="Estimated Value" value={pred ? formatAED(pred.total_valuation) : "—"} />
          <KPI label="Price / m²" value={pred ? `${formatNumber(pred.predicted_meter_sale_price)} AED/m²` : "—"} />
          <KPI label="Area (m²)" value={formData ? formatNumber(formData.procedure_area, 2) : "—"} />
          <KPI label="Bedrooms / Bathrooms" value={formData ? `${formData.bedrooms} / ${formData.bathrooms}` : "—"} />
        </div>

        <div className="twoCol">
          <div className="card2">
            <div className="card2Title">Market Distribution</div>
            <div className="card2Hint">Price/m² histogram for this area</div>

            {distData.length === 0 ? (
              <div className="empty2">Not enough data for distribution.</div>
            ) : (
              <div className="chartBox">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={distData}>
                    <XAxis dataKey="bin" hide />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="card2">
            <div className="card2Title">Market Trend</div>
            <div className="card2Hint">Monthly median price/m²</div>

            {trendData.length === 0 ? (
              <div className="empty2">No trend data available.</div>
            ) : (
              <div className="chartBox">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="median" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="card2" style={{ marginTop: 14 }}>
          <div className="card2Title">Comparables</div>
          <div className="card2Hint">Top similar transactions (if available)</div>

          {(!reportData?.comps || reportData.comps.length === 0) ? (
            <div className="empty2">No comparables found for the current filters.</div>
          ) : (
            <>
              <div className="chartBox" style={{ marginBottom: 12 }}>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={compsBar}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="price" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="tableWrap2">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Area</th>
                      <th>Building</th>
                      <th>Project</th>
                      <th>Rooms</th>
                      <th>Size</th>
                      <th>Price/m²</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.comps.slice(0, 10).map((c, i) => (
                      <tr key={i}>
                        <td>{c.instance_date || "—"}</td>
                        <td>{c.area_name_en || "—"}</td>
                        <td>{c.building_name_en || "—"}</td>
                        <td>{c.project_name_en || "—"}</td>
                        <td>{c.rooms_en || "—"}</td>
                        <td>{c.procedure_area ?? "—"}</td>
                        <td>{formatNumber(c.meter_sale_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        <div className="footer2">© {new Date().getFullYear()} TruValu</div>
      </div>
    </div>
  );
}

function KPI({ label, value }) {
  return (
    <div className="kpi">
      <div className="kpiLabel">{label}</div>
      <div className="kpiValue">{value}</div>
    </div>
  );
}
