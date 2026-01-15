import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/form.css";

function toSqm(areaVal, unit) {
  const v = Number(areaVal || 0);
  if (!v) return 0;
  if (unit === "sq.ft") return v * 0.092903;
  return v; // sq.m
}

export default function ValuationForm({ formData, setFormData }) {
  const navigate = useNavigate();

  const [form, setForm] = useState(
    formData || {
      // Property Information
      property_name_unit: "Unit 1502",
      building_name_en: "Burj Khalifa",
      project_name_en: "Downtown Dubai",
      property_type_en: "Unit",

      // Location
      city: "Dubai",
      area_name_en: "Business Bay",

      // Size & Layout
      bedrooms: 2,
      bathrooms: 2,
      area_value: 1200,
      area_unit: "sq.ft",

      // Age & Condition
      year_built: 2020,
      condition: "Good",
      furnishing: "Unfurnished",

      // Distances (km)
      dist_metro_km: 1,
      dist_beach_km: 5,
      dist_mall_km: 2,
      dist_school_km: 1,
      dist_hospital_km: 3,

      // Amenities & Features
      parking_spaces: 1,
      amenity_pool: true,
      amenity_garden_balcony: true,
      amenity_gym: true,
      amenity_security_24_7: true,
    }
  );

  function update(k, v) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  const computedSqm = useMemo(() => toSqm(form.area_value, form.area_unit), [form.area_value, form.area_unit]);

  function onNext() {
    // save and go report page
    setFormData({ ...form, procedure_area: computedSqm });
    navigate("/report");
  }

  return (
    <div className="pageBg">
      <NavBar />

      <div className="pageContainer">
        <div className="pageTitle">Get AI Valuation</div>
        <div className="pageSub">
          Enter property details. Area will be converted to m² automatically for the model.
        </div>

        <div className="formCard">
          <div className="sectionTitle">Property Information</div>
          <div className="grid2">
            <Field label="Property Name / Unit">
              <input value={form.property_name_unit} onChange={(e) => update("property_name_unit", e.target.value)} placeholder="Unit 1502" />
            </Field>
            <Field label="Building / Tower Name">
              <input value={form.building_name_en} onChange={(e) => update("building_name_en", e.target.value)} placeholder="Burj Khalifa" />
            </Field>
            <Field label="Community">
              <input value={form.project_name_en} onChange={(e) => update("project_name_en", e.target.value)} placeholder="Marina Walk" />
            </Field>
            <Field label="Property Type">
              <select value={form.property_type_en} onChange={(e) => update("property_type_en", e.target.value)}>
                <option>Unit</option>
                <option>Villa</option>
                <option>Townhouse</option>
                <option>Penthouse</option>
                <option>Office</option>
                <option>Retail</option>
              </select>
            </Field>
          </div>

          <div className="sectionTitle">Location</div>
          <div className="grid2">
            <Field label="City">
              <input value={form.city} onChange={(e) => update("city", e.target.value)} />
            </Field>
            <Field label="Area / District">
              <input value={form.area_name_en} onChange={(e) => update("area_name_en", e.target.value)} placeholder="Business Bay" />
            </Field>
          </div>

          <div className="sectionTitle">Size & Layout</div>
          <div className="grid2">
            <Field label="Bedrooms">
              <input type="number" value={form.bedrooms} onChange={(e) => update("bedrooms", Number(e.target.value))} />
            </Field>
            <Field label="Bathrooms">
              <input type="number" value={form.bathrooms} onChange={(e) => update("bathrooms", Number(e.target.value))} />
            </Field>
            <Field label="Area">
              <input type="number" value={form.area_value} onChange={(e) => update("area_value", Number(e.target.value))} />
            </Field>
            <Field label="Unit">
              <select value={form.area_unit} onChange={(e) => update("area_unit", e.target.value)}>
                <option value="sq.ft">sq.ft</option>
                <option value="sq.m">sq.m</option>
              </select>
            </Field>
          </div>

          <div className="hintLine">
            Converted size for valuation model: <b>{computedSqm.toFixed(2)} m²</b>
          </div>

          <div className="sectionTitle">Age & Condition</div>
          <div className="grid2">
            <Field label="Year Built">
              <input type="number" value={form.year_built} onChange={(e) => update("year_built", Number(e.target.value))} />
            </Field>
            <Field label="Condition">
              <select value={form.condition} onChange={(e) => update("condition", e.target.value)}>
                <option>Excellent</option>
                <option>Good</option>
                <option>Average</option>
                <option>Poor</option>
              </select>
            </Field>
            <Field label="Furnishing">
              <select value={form.furnishing} onChange={(e) => update("furnishing", e.target.value)}>
                <option>Unfurnished</option>
                <option>Semi-Furnished</option>
                <option>Furnished</option>
              </select>
            </Field>
          </div>

          <div className="sectionTitle">Distances (in km)</div>
          <div className="grid2">
            <Field label="To Metro">
              <input type="number" value={form.dist_metro_km} onChange={(e) => update("dist_metro_km", Number(e.target.value))} />
            </Field>
            <Field label="To Beach">
              <input type="number" value={form.dist_beach_km} onChange={(e) => update("dist_beach_km", Number(e.target.value))} />
            </Field>
            <Field label="To Mall">
              <input type="number" value={form.dist_mall_km} onChange={(e) => update("dist_mall_km", Number(e.target.value))} />
            </Field>
            <Field label="To School">
              <input type="number" value={form.dist_school_km} onChange={(e) => update("dist_school_km", Number(e.target.value))} />
            </Field>
            <Field label="To Hospital">
              <input type="number" value={form.dist_hospital_km} onChange={(e) => update("dist_hospital_km", Number(e.target.value))} />
            </Field>
          </div>

          <div className="sectionTitle">Amenities & Features</div>
          <div className="grid2">
            <Field label="Parking Spaces">
              <input type="number" value={form.parking_spaces} onChange={(e) => update("parking_spaces", Number(e.target.value))} />
            </Field>
          </div>

          <div className="checkRow">
            <Check label="Pool" checked={form.amenity_pool} onChange={(v) => update("amenity_pool", v)} />
            <Check label="Garden/Balcony" checked={form.amenity_garden_balcony} onChange={(v) => update("amenity_garden_balcony", v)} />
            <Check label="Gym" checked={form.amenity_gym} onChange={(v) => update("amenity_gym", v)} />
            <Check label="24/7 Security" checked={form.amenity_security_24_7} onChange={(v) => update("amenity_security_24_7", v)} />
          </div>

          <button className="btnBig" onClick={onNext}>
            Generate AI Valuation →
          </button>
        </div>
      </div>
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

function Check({ label, checked, onChange }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
