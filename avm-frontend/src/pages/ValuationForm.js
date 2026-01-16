import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/form.css";

function toSqm(areaVal, unit) {
  const v = Number(areaVal || 0);
  if (!v) return 0;
  if (unit === "sq.ft") return v * 0.092903;
  return v;
}

const DUBAI_AREAS = [
  "Downtown Dubai",
  "Business Bay",
  "Dubai Marina",
  "Jumeirah Lake Towers (JLT)",
  "Palm Jumeirah",
  "Jumeirah Village Circle (JVC)",
  "Jumeirah Village Triangle (JVT)",
  "Dubai Hills Estate",
  "Arabian Ranches",
  "Al Barsha",
  "Mirdif",
  "Deira",
  "Bur Dubai",
  "Dubai Creek Harbour",
  "City Walk",
  "DIFC",
];

const PROPERTY_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse", "Office", "Retail"];
const CONDITIONS = ["Excellent", "Good", "Average"];
const FURNISHING = ["Unfurnished", "Semi-Furnished", "Furnished"];

export default function ValuationForm({ formData, setFormData }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [form, setForm] = useState(
    formData || {
      property_name_unit: "",
      building_name_en: "",
      project_name_en: "",
      property_type_en: "Apartment",

      city: "Dubai",
      area_name_en: "",

      bedrooms: 1,
      bathrooms: 1,
      area_value: "",
      area_unit: "sq.ft",

      year_built: 2020,
      condition: "Good",
      furnishing: "Unfurnished",

      parking_spaces: 1,
      amenity_pool: false,
      amenity_garden_balcony: false,
      amenity_gym: false,
      amenity_security_24_7: true,
    }
  );

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const computedSqm = useMemo(() => {
    const sqm = toSqm(form.area_value, form.area_unit);
    return Number.isFinite(sqm) ? sqm : 0;
  }, [form.area_value, form.area_unit]);

  const onNext = () => {
    setError("");

    // ✅ hard validation so report always gets correct area
    if (!computedSqm || computedSqm <= 0) {
      setError("Please enter a valid Area (greater than 0).");
      return;
    }

    setFormData({
      ...form,
      // ✅ Always store numeric m²
      procedure_area: Number(computedSqm),
      city: "Dubai",
    });

    navigate("/report");
  };

  return (
    <div className="pageBg">
      <NavBar />

      <div className="pageContainer">
        <div className="hero">
          <div>
            <div className="pageTitle">AI Property Valuation</div>
            <div className="pageSub">Dubai-only valuation • clean & realistic form</div>
          </div>
        </div>

        <div className="formCard">
          {error && <div className="errorBox2" style={{ marginBottom: 12 }}>Error: {error}</div>}

          {/* Property Information */}
          <Section title="Property Information">
            <div className="grid2">
              <Field label="Property Name / Unit">
                <input
                  className="input"
                  placeholder="e.g., Unit 1502 or Villa 23"
                  value={form.property_name_unit}
                  onChange={(e) => update("property_name_unit", e.target.value)}
                />
              </Field>

              <Field label="Building / Tower Name">
                <input
                  className="input"
                  placeholder="e.g., Burj Khalifa or Marina Gate"
                  value={form.building_name_en}
                  onChange={(e) => update("building_name_en", e.target.value)}
                />
              </Field>

              <Field label="Community">
                <input
                  className="input"
                  placeholder="e.g., Downtown Dubai"
                  value={form.project_name_en}
                  onChange={(e) => update("project_name_en", e.target.value)}
                />
              </Field>

              <Field label="Property Type">
                <NiceSelect
                  value={form.property_type_en}
                  onChange={(v) => update("property_type_en", v)}
                  options={PROPERTY_TYPES}
                  placeholder="Select type"
                />
              </Field>
            </div>
          </Section>

          {/* Location */}
          <Section title="Location">
            <div className="grid2">
              <Field label="City">
                <input className="input" value="Dubai" disabled />
              </Field>

              <Field label="Area / District">
                <SearchSelect
                  value={form.area_name_en}
                  onChange={(v) => update("area_name_en", v)}
                  options={DUBAI_AREAS}
                  placeholder="Select area"
                />
              </Field>
            </div>
          </Section>

          {/* Size */}
          <Section title="Size & Layout">
            <div className="grid4">
              <Field label="Bedrooms">
                <NiceSelect
                  value={String(form.bedrooms)}
                  onChange={(v) => update("bedrooms", Number(v))}
                  options={["0", "1", "2", "3", "4", "5"]}
                  placeholder="Select"
                />
              </Field>

              <Field label="Bathrooms">
                <NiceSelect
                  value={String(form.bathrooms)}
                  onChange={(v) => update("bathrooms", Number(v))}
                  options={["1", "2", "3", "4", "5"]}
                  placeholder="Select"
                />
              </Field>

              <Field label="Area">
                <input
                  className="input"
                  type="number"
                  placeholder="1200"
                  value={form.area_value}
                  onChange={(e) => update("area_value", e.target.value)}
                />
              </Field>

              <Field label="Unit">
                <NiceSelect
                  value={form.area_unit}
                  onChange={(v) => update("area_unit", v)}
                  options={["sq.ft", "sq.m"]}
                  placeholder="Select"
                />
              </Field>
            </div>

            <div className="hintLine">
              Converted size for model: <b>{computedSqm.toFixed(2)} m²</b>
            </div>
          </Section>

          {/* Age & Condition */}
          <Section title="Age & Condition">
            <div className="grid3">
              <Field label="Year Built">
                <input
                  className="input"
                  type="number"
                  value={form.year_built}
                  onChange={(e) => update("year_built", Number(e.target.value))}
                />
              </Field>

              <Field label="Condition">
                <NiceSelect
                  value={form.condition}
                  onChange={(v) => update("condition", v)}
                  options={CONDITIONS}
                  placeholder="Select"
                />
              </Field>

              <Field label="Furnishing">
                <NiceSelect
                  value={form.furnishing}
                  onChange={(v) => update("furnishing", v)}
                  options={FURNISHING}
                  placeholder="Select"
                />
              </Field>
            </div>
          </Section>

          {/* Amenities */}
          <Section title="Amenities & Features">
            <div className="chipRow">
              <Chip label="Pool" checked={form.amenity_pool} onChange={(v) => update("amenity_pool", v)} />
              <Chip label="Garden/Balcony" checked={form.amenity_garden_balcony} onChange={(v) => update("amenity_garden_balcony", v)} />
              <Chip label="Gym" checked={form.amenity_gym} onChange={(v) => update("amenity_gym", v)} />
              <Chip label="24/7 Security" checked={form.amenity_security_24_7} onChange={(v) => update("amenity_security_24_7", v)} />
            </div>

            <div className="bottomRow">
              <div className="smallField">
                <div className="label">Parking Spaces</div>
                <NiceSelect
                  value={String(form.parking_spaces)}
                  onChange={(v) => update("parking_spaces", Number(v))}
                  options={["0", "1", "2", "3", "4"]}
                  placeholder="Select"
                />
              </div>

              <button className="btnBig" onClick={onNext}>
                Generate AI Valuation →
              </button>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ---------- UI building blocks ---------- */

function Section({ title, children }) {
  return (
    <div className="section">
      <div className="sectionTitle">{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="field">
      <div className="label">{label}</div>
      {children}
    </div>
  );
}

function Chip({ label, checked, onChange }) {
  return (
    <button type="button" className={`chip ${checked ? "active" : ""}`} onClick={() => onChange(!checked)}>
      <span className={`dot ${checked ? "on" : ""}`} />
      {label}
    </button>
  );
}

function NiceSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="niceSelect" ref={ref}>
      <button type="button" className="niceSelectBtn" onClick={() => setOpen((s) => !s)}>
        <span className={`niceSelectValue ${value ? "" : "placeholder"}`}>{value || placeholder}</span>
        <span className={`chev ${open ? "up" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="niceSelectMenu">
          {options.map((opt) => (
            <button
              type="button"
              key={opt}
              className={`niceSelectItem ${opt === value ? "active" : ""}`}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SearchSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = options.filter((x) => x.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="niceSelect" ref={ref}>
      <button type="button" className="niceSelectBtn" onClick={() => setOpen((s) => !s)}>
        <span className={`niceSelectValue ${value ? "" : "placeholder"}`}>{value || placeholder}</span>
        <span className={`chev ${open ? "up" : ""}`}>▾</span>
      </button>

      {open && (
        <div className="niceSelectMenu">
          <div className="searchBox">
            <input
              className="searchInput"
              placeholder="Search area..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          </div>

          <div className="scroll">
            {filtered.length === 0 ? (
              <div className="empty">No matching areas</div>
            ) : (
              filtered.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  className={`niceSelectItem ${opt === value ? "active" : ""}`}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setQ("");
                  }}
                >
                  {opt}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
