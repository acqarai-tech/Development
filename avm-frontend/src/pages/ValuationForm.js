// import React, { useMemo, useRef, useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import NavBar from "../components/NavBar";
// import "../styles/form.css";

// function toSqm(areaVal, unit) {
//   const v = Number(areaVal || 0);
//   if (!v) return 0;
//   if (unit === "sq.ft") return v * 0.092903;
//   return v;
// }

// const DUBAI_AREAS = [
//   "Downtown Dubai",
//   "Business Bay",
//   "Dubai Marina",
//   "Jumeirah Lake Towers (JLT)",
//   "Palm Jumeirah",
//   "Jumeirah Village Circle (JVC)",
//   "Jumeirah Village Triangle (JVT)",
//   "Dubai Hills Estate",
//   "Arabian Ranches",
//   "Al Barsha",
//   "Mirdif",
//   "Deira",
//   "Bur Dubai",
//   "Dubai Creek Harbour",
//   "City Walk",
//   "DIFC",
// ];

// const PROPERTY_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse", "Office", "Retail"];
// const CONDITIONS = ["Excellent", "Good", "Average"];
// const FURNISHING = ["Unfurnished", "Semi-Furnished", "Furnished"];

// export default function ValuationForm({ formData, setFormData }) {
//   const navigate = useNavigate();
//   const [error, setError] = useState("");

//   const [form, setForm] = useState(
//     formData || {
//       property_name_unit: "",
//       building_name_en: "",
//       project_name_en: "",
//       property_type_en: "Apartment",

//       city: "Dubai",
//       area_name_en: "",

//       bedrooms: 1,
//       bathrooms: 1,
//       area_value: "",
//       area_unit: "sq.ft",

//       year_built: 2020,
//       condition: "Good",
//       furnishing: "Unfurnished",

//       parking_spaces: 1,
//       amenity_pool: false,
//       amenity_garden_balcony: false,
//       amenity_gym: false,
//       amenity_security_24_7: true,
//     }
//   );

//   const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

//   const computedSqm = useMemo(() => {
//     const sqm = toSqm(form.area_value, form.area_unit);
//     return Number.isFinite(sqm) ? sqm : 0;
//   }, [form.area_value, form.area_unit]);

//   const onNext = () => {
//     setError("");

//     // ✅ hard validation so report always gets correct area
//     if (!computedSqm || computedSqm <= 0) {
//       setError("Please enter a valid Area (greater than 0).");
//       return;
//     }

//     const payload = {
//       ...form,
//       // ✅ Always store numeric m²
//       procedure_area: Number(computedSqm),
//       city: "Dubai",
//     };

//     // ✅ ADDED: save form payload so /report works independently on refresh/direct open
//     localStorage.setItem("truvalu_formData_v1", JSON.stringify(payload));

//     setFormData(payload);

//     navigate("/report");
//   };

//   return (
//     <div className="pageBg">
//       <NavBar />

//       <div className="pageContainer">
//         <div className="hero">
//           <div>
//             <div className="pageTitle">AI Property Valuation</div>
//             <div className="pageSub">Dubai-only valuation • clean & realistic form</div>
//           </div>
//         </div>

//         <div className="formCard">
//           {error && (
//             <div className="errorBox2" style={{ marginBottom: 12 }}>
//               Error: {error}
//             </div>
//           )}

//           {/* Property Information */}
//           <Section title="Property Information">
//             <div className="grid2">
//               <Field label="Property Name / Unit">
//                 <input
//                   className="input"
//                   placeholder="e.g., Unit 1502 or Villa 23"
//                   value={form.property_name_unit}
//                   onChange={(e) => update("property_name_unit", e.target.value)}
//                 />
//               </Field>

//               <Field label="Building / Tower Name">
//                 <input
//                   className="input"
//                   placeholder="e.g., Burj Khalifa or Marina Gate"
//                   value={form.building_name_en}
//                   onChange={(e) => update("building_name_en", e.target.value)}
//                 />
//               </Field>

//               <Field label="Community">
//                 <input
//                   className="input"
//                   placeholder="e.g., Downtown Dubai"
//                   value={form.project_name_en}
//                   onChange={(e) => update("project_name_en", e.target.value)}
//                 />
//               </Field>

//               <Field label="Property Type">
//                 <NiceSelect
//                   value={form.property_type_en}
//                   onChange={(v) => update("property_type_en", v)}
//                   options={PROPERTY_TYPES}
//                   placeholder="Select type"
//                 />
//               </Field>
//             </div>
//           </Section>

//           {/* Location */}
//           <Section title="Location">
//             <div className="grid2">
//               <Field label="City">
//                 <input className="input" value="Dubai" disabled />
//               </Field>

//               <Field label="Area / District">
//                 <SearchSelect
//                   value={form.area_name_en}
//                   onChange={(v) => update("area_name_en", v)}
//                   options={DUBAI_AREAS}
//                   placeholder="Select area"
//                 />
//               </Field>
//             </div>
//           </Section>

//           {/* Size */}
//           <Section title="Size & Layout">
//             <div className="grid4">
//               <Field label="Bedrooms">
//                 <NiceSelect
//                   value={String(form.bedrooms)}
//                   onChange={(v) => update("bedrooms", Number(v))}
//                   options={["0", "1", "2", "3", "4", "5"]}
//                   placeholder="Select"
//                 />
//               </Field>

//               <Field label="Bathrooms">
//                 <NiceSelect
//                   value={String(form.bathrooms)}
//                   onChange={(v) => update("bathrooms", Number(v))}
//                   options={["1", "2", "3", "4", "5"]}
//                   placeholder="Select"
//                 />
//               </Field>

//               <Field label="Area">
//                 <input
//                   className="input"
//                   type="number"
//                   placeholder="1200"
//                   value={form.area_value}
//                   onChange={(e) => update("area_value", e.target.value)}
//                 />
//               </Field>

//               <Field label="Unit">
//                 <NiceSelect
//                   value={form.area_unit}
//                   onChange={(v) => update("area_unit", v)}
//                   options={["sq.ft", "sq.m"]}
//                   placeholder="Select"
//                 />
//               </Field>
//             </div>

//             <div className="hintLine">
//               Converted size for model: <b>{computedSqm.toFixed(2)} m²</b>
//             </div>
//           </Section>

//           {/* Age & Condition */}
//           <Section title="Age & Condition">
//             <div className="grid3">
//               <Field label="Year Built">
//                 <input
//                   className="input"
//                   type="number"
//                   value={form.year_built}
//                   onChange={(e) => update("year_built", Number(e.target.value))}
//                 />
//               </Field>

//               <Field label="Condition">
//                 <NiceSelect
//                   value={form.condition}
//                   onChange={(v) => update("condition", v)}
//                   options={CONDITIONS}
//                   placeholder="Select"
//                 />
//               </Field>

//               <Field label="Furnishing">
//                 <NiceSelect
//                   value={form.furnishing}
//                   onChange={(v) => update("furnishing", v)}
//                   options={FURNISHING}
//                   placeholder="Select"
//                 />
//               </Field>
//             </div>
//           </Section>

//           {/* Amenities */}
//           <Section title="Amenities & Features">
//             <div className="chipRow">
//               <Chip label="Pool" checked={form.amenity_pool} onChange={(v) => update("amenity_pool", v)} />
//               <Chip
//                 label="Garden/Balcony"
//                 checked={form.amenity_garden_balcony}
//                 onChange={(v) => update("amenity_garden_balcony", v)}
//               />
//               <Chip label="Gym" checked={form.amenity_gym} onChange={(v) => update("amenity_gym", v)} />
//               <Chip
//                 label="24/7 Security"
//                 checked={form.amenity_security_24_7}
//                 onChange={(v) => update("amenity_security_24_7", v)}
//               />
//             </div>

//             <div className="bottomRow">
//               <div className="smallField">
//                 <div className="label">Parking Spaces</div>
//                 <NiceSelect
//                   value={String(form.parking_spaces)}
//                   onChange={(v) => update("parking_spaces", Number(v))}
//                   options={["0", "1", "2", "3", "4"]}
//                   placeholder="Select"
//                 />
//               </div>

//               <button className="btnBig" onClick={onNext}>
//                 Generate AI Valuation →
//               </button>
//             </div>
//           </Section>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ---------- UI building blocks ---------- */

// function Section({ title, children }) {
//   return (
//     <div className="section">
//       <div className="sectionTitle">{title}</div>
//       {children}
//     </div>
//   );
// }

// function Field({ label, children }) {
//   return (
//     <div className="field">
//       <div className="label">{label}</div>
//       {children}
//     </div>
//   );
// }

// function Chip({ label, checked, onChange }) {
//   return (
//     <button
//       type="button"
//       className={`chip ${checked ? "active" : ""}`}
//       onClick={() => onChange(!checked)}
//     >
//       <span className={`dot ${checked ? "on" : ""}`} />
//       {label}
//     </button>
//   );
// }

// function NiceSelect({ value, onChange, options, placeholder }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef(null);

//   useEffect(() => {
//     const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
//     document.addEventListener("mousedown", h);
//     return () => document.removeEventListener("mousedown", h);
//   }, []);

//   return (
//     <div className="niceSelect" ref={ref}>
//       <button type="button" className="niceSelectBtn" onClick={() => setOpen((s) => !s)}>
//         <span className={`niceSelectValue ${value ? "" : "placeholder"}`}>{value || placeholder}</span>
//         <span className={`chev ${open ? "up" : ""}`}>▾</span>
//       </button>

//       {open && (
//         <div className="niceSelectMenu">
//           {options.map((opt) => (
//             <button
//               type="button"
//               key={opt}
//               className={`niceSelectItem ${opt === value ? "active" : ""}`}
//               onClick={() => {
//                 onChange(opt);
//                 setOpen(false);
//               }}
//             >
//               {opt}
//             </button>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// function SearchSelect({ value, onChange, options, placeholder }) {
//   const [open, setOpen] = useState(false);
//   const [q, setQ] = useState("");
//   const ref = useRef(null);

//   useEffect(() => {
//     const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
//     document.addEventListener("mousedown", h);
//     return () => document.removeEventListener("mousedown", h);
//   }, []);

//   const filtered = options.filter((x) => x.toLowerCase().includes(q.toLowerCase()));

//   return (
//     <div className="niceSelect" ref={ref}>
//       <button type="button" className="niceSelectBtn" onClick={() => setOpen((s) => !s)}>
//         <span className={`niceSelectValue ${value ? "" : "placeholder"}`}>{value || placeholder}</span>
//         <span className={`chev ${open ? "up" : ""}`}>▾</span>
//       </button>

//       {open && (
//         <div className="niceSelectMenu">
//           <div className="searchBox">
//             <input
//               className="searchInput"
//               placeholder="Search area..."
//               value={q}
//               onChange={(e) => setQ(e.target.value)}
//               autoFocus
//             />
//           </div>

//           <div className="scroll">
//             {filtered.length === 0 ? (
//               <div className="empty">No matching areas</div>
//             ) : (
//               filtered.map((opt) => (
//                 <button
//                   type="button"
//                   key={opt}
//                   className={`niceSelectItem ${opt === value ? "active" : ""}`}
//                   onClick={() => {
//                     onChange(opt);
//                     setOpen(false);
//                     setQ("");
//                   }}
//                 >
//                   {opt}
//                 </button>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import "../styles/form.css";
import { supabase } from "../lib/supabase";

function toSqm(areaVal, unit) {
  const v = Number(areaVal || 0);
  if (!v) return 0;
  if (unit === "sq.ft") return v * 0.092903;
  return v;
}

const PROPERTY_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse", "Office", "Retail"];
const CONDITIONS = ["Excellent", "Good", "Average"];
const FURNISHING = ["Unfurnished", "Semi-Furnished", "Furnished"];

function useDebounced(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function ValuationForm({ formData, setFormData }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // ---------- Form ----------
  const [form, setForm] = useState(
    formData || {
      city: "Dubai",

      area_name_en: "",
      area_name_ar: "",
      district_key: "",

      building_name_en: "",
      building_key: "",

      project_name_en: "",
      project_name_ar: "",

      land_type_en: "",
      land_type_ar: "",

      property_type_en: "Apartment",
      property_name_unit: "",

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

  // ✅ NEW: dropdown open controls (show results ONLY after user clicks field)
  const [openDistrict, setOpenDistrict] = useState(false);
  const [openBuilding, setOpenBuilding] = useState(false);
  const [openProperty, setOpenProperty] = useState(false);
  const [openLandType, setOpenLandType] = useState(false);

  // ---------- State: District ----------
  const [districtQuery, setDistrictQuery] = useState("");
  const dQ = useDebounced(districtQuery);
  const [districtResults, setDistrictResults] = useState([]);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // ---------- State: Building ----------
  const [buildingQuery, setBuildingQuery] = useState("");
  const bQ = useDebounced(buildingQuery);
  const [buildingResults, setBuildingResults] = useState([]);
  const [buildingLoading, setBuildingLoading] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  // ---------- State: Project (Property Name) ----------
  const [propertyQuery, setPropertyQuery] = useState("");
  const pQ = useDebounced(propertyQuery);
  const [propertyResults, setPropertyResults] = useState([]);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // ---------- State: Land Type ----------
  const [landTypeQuery, setLandTypeQuery] = useState("");
  const lQ = useDebounced(landTypeQuery);
  const [landTypeResults, setLandTypeResults] = useState([]);
  const [landTypeLoading, setLandTypeLoading] = useState(false);
  const [selectedLandType, setSelectedLandType] = useState(null);
  


  // ---------- Computed sqm ----------
  const computedSqm = useMemo(() => {
    const sqm = toSqm(form.area_value, form.area_unit);
    return Number.isFinite(sqm) ? sqm : 0;
  }, [form.area_value, form.area_unit]);

  // ===================== 1) District search =====================
  useEffect(() => {
    let alive = true;

    async function run() {
      // ✅ only search if user is interacting with district field
      if (!openDistrict) return;

      const q = (dQ || "").trim();
      if (q.length < 2) {
        setDistrictResults([]);
        setDistrictLoading(false);
        return;
      }

      setDistrictLoading(true);
      setError("");

      const { data, error: e } = await supabase
        .from("v_districts_clean")
        .select("district_key, district_name_en, district_name_ar")
        .ilike("district_name_en", `%${q}%`)
        .order("district_name_en")
        .limit(50);

      if (!alive) return;
      setDistrictLoading(false);

      if (e) {
        console.error("district search error:", e);
        setDistrictResults([]);
        setError(e.message);
        return;
      }

      setDistrictResults(data || []);
    }

    run();
    return () => {
      alive = false;
    };
  }, [dQ, openDistrict]);

  // ✅ helper: fetch buildings only when user clicks Building field
  const fetchBuildings = async () => {
    if (!selectedDistrict?.district_key) return;
    if (buildingResults.length > 0) return; // already loaded

    setBuildingLoading(true);
    setError("");

    const { data, error: e } = await supabase
      .from("v_buildings_clean")
      .select("district_key, building_key, building_name_en, project_name_en, project_name_ar")
      .eq("district_key", selectedDistrict.district_key)
      .order("building_name_en")
      .limit(800);

    setBuildingLoading(false);

    if (e) {
      console.error("buildings load error:", e);
      setBuildingResults([]);
      setError(e.message);
      return;
    }

    setBuildingResults(data || []);
  };

  // ✅ helper: fetch projects only when user clicks Property field
  const fetchProjects = async () => {
    if (!selectedDistrict?.district_key) return;
    if (propertyResults.length > 0) return;

    setPropertyLoading(true);
    setError("");

    const { data, error: e } = await supabase
      .from("v_projects_clean")
      .select("district_key, project_name_en, project_name_ar")
      .eq("district_key", selectedDistrict.district_key)
      .order("project_name_en")
      .limit(800);

    setPropertyLoading(false);

    if (e) {
      console.error("projects load error:", e);
      setPropertyResults([]);
      setError(e.message);
      return;
    }

    setPropertyResults(data || []);
  };

  // ✅ helper: fetch land types only when user clicks Land Type field
  const fetchLandTypes = async () => {
    if (!selectedDistrict?.district_key) return;
    if (landTypeResults.length > 0) return;

    setLandTypeLoading(true);
    setError("");

    const { data, error: e } = await supabase
      .from("v_land_types_clean")
      .select("district_key, land_type_en, land_type_ar")
      .eq("district_key", selectedDistrict.district_key)
      .order("land_type_en")
      .limit(400);

    setLandTypeLoading(false);

    if (e) {
      console.error("land types load error:", e);
      setLandTypeResults([]);
      setError(e.message);
      return;
    }

    setLandTypeResults(data || []);
  };

  // ---------- Local filtering ----------
  const filteredBuildings = useMemo(() => {
    const q = (buildingQuery || "").trim().toLowerCase();
    if (!q) return buildingResults;
    return (buildingResults || []).filter((b) => (b.building_name_en || "").toLowerCase().includes(q));
  }, [buildingQuery, buildingResults]);

  const filteredProperties = useMemo(() => {
    const q = (propertyQuery || "").trim().toLowerCase();
    if (!q) return propertyResults;
    return (propertyResults || []).filter((p) => (p.project_name_en || "").toLowerCase().includes(q));
  }, [propertyQuery, propertyResults]);

  const filteredLandTypes = useMemo(() => {
    const q = (landTypeQuery || "").trim().toLowerCase();
    if (!q) return landTypeResults;
    return (landTypeResults || []).filter((t) => (t.land_type_en || "").toLowerCase().includes(q));
  }, [landTypeQuery, landTypeResults]);

  // ---------- Next ----------
  const onNext = async () => {
    setError("");

    if (!selectedDistrict?.district_key) {
      setError("Please select a District.");
      return;
    }

    if (!computedSqm || computedSqm <= 0) {
      setError("Please enter a valid Area (greater than 0).");
      return;
    }

    const payload = {
      ...form,
      procedure_area: Number(computedSqm),
      city: "Dubai",

      district_key: selectedDistrict?.district_key || "",
      area_name_en: selectedDistrict?.district_name_en || "",
      area_name_ar: selectedDistrict?.district_name_ar || "",

      building_key: selectedBuilding?.building_key || "",
      building_name_en: selectedBuilding?.building_name_en || buildingQuery || "",

      project_name_en: selectedProperty?.project_name_en || propertyQuery || "",
      project_name_ar: selectedProperty?.project_name_ar || "",

      land_type_en: selectedLandType?.land_type_en || landTypeQuery || "",
      land_type_ar: selectedLandType?.land_type_ar || "",
    };

    localStorage.setItem("truvalu_formData_v1", JSON.stringify(payload));
    setFormData(payload);
    navigate("/report");
  };

  return (
    <div className="pageBg">
      <NavBar />

      <div className="pageContainer">
        <div className="hero">
          <div>
            <div className="pageTitle">AI Property Valuation</div>
            <div className="pageSub">Dubai-only valuation • District → Building/Property/Land Type</div>
          </div>
        </div>

        <div className="formCard">
          {error && (
            <div className="errorBox2" style={{ marginBottom: 12 }}>
              Error: {error}
            </div>
          )}

          <Section title="Property Information">
            <div className="grid2">
              <Field label="City">
                <input className="input" value="Dubai" disabled />
              </Field>

              {/* DISTRICT */}
              <Field label="District ">
                <input
                  className="input"
                  placeholder="Type district (e.g., Business Bay)"
                  value={selectedDistrict ? selectedDistrict.district_name_en : districtQuery}
                  onFocus={() => setOpenDistrict(true)}
                  onBlur={() => setTimeout(() => setOpenDistrict(false), 150)}
                  onChange={(e) => {
                    const v = e.target.value;

                    setDistrictQuery(v);
                    setSelectedDistrict(null);
                    setDistrictResults([]);

                    // reset children
                    setSelectedBuilding(null);
                    setBuildingQuery("");
                    setBuildingResults([]);

                    setSelectedProperty(null);
                    setPropertyQuery("");
                    setPropertyResults([]);

                    setSelectedLandType(null);
                    setLandTypeQuery("");
                    setLandTypeResults([]);

                    update("district_key", "");
                    update("area_name_en", v);
                    update("area_name_ar", "");
                    update("building_key", "");
                    update("building_name_en", "");
                    update("project_name_en", "");
                    update("project_name_ar", "");
                    update("land_type_en", "");
                    update("land_type_ar", "");
                  }}
                />

                <InlineStatus loading={districtLoading} />

                {openDistrict && districtResults.length > 0 && !selectedDistrict && districtQuery.trim().length >= 2 && (
                  <DropMenu>
                    {districtResults.map((d) => (
                      <MenuItem
                        key={d.district_key}
                        title={d.district_name_en}
                        subtitle={d.district_name_ar || ""}
                        onClick={() => {
                          setSelectedDistrict(d);
                          setDistrictQuery(d.district_name_en);
                          setDistrictResults([]);

                          update("district_key", d.district_key);
                          update("area_name_en", d.district_name_en);
                          update("area_name_ar", d.district_name_ar || "");

                          // clear dependent fields
                          setSelectedBuilding(null);
                          setBuildingQuery("");
                          setBuildingResults([]);

                          setSelectedProperty(null);
                          setPropertyQuery("");
                          setPropertyResults([]);

                          setSelectedLandType(null);
                          setLandTypeQuery("");
                          setLandTypeResults([]);

                          update("building_key", "");
                          update("building_name_en", "");
                          update("project_name_en", "");
                          update("project_name_ar", "");
                          update("land_type_en", "");
                          update("land_type_ar", "");
                        }}
                      />
                    ))}
                  </DropMenu>
                )}
              </Field>

              <Field label="Property Type">
                <NiceSelect
                  value={form.property_type_en}
                  onChange={(v) => update("property_type_en", v)}
                  options={PROPERTY_TYPES}
                  placeholder="Select type"
                />
              </Field>

              {/* ✅ PROPERTY NAME: show list ONLY when user clicks here */}
              <Field label="Property Name ">
                <input
                  className="input"
                  placeholder={selectedDistrict ? "Click to see properties (or type to filter)" : "Select district first"}
                  value={selectedProperty ? selectedProperty.project_name_en : propertyQuery}
                  disabled={!selectedDistrict}
                  onFocus={async () => {
                    setOpenProperty(true);
                    await fetchProjects();
                  }}
                  onBlur={() => setTimeout(() => setOpenProperty(false), 150)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setPropertyQuery(v);
                    setSelectedProperty(null);
                    update("project_name_en", v);
                    update("project_name_ar", "");
                  }}
                />

                <InlineStatus loading={propertyLoading} />

                {openProperty && selectedDistrict && filteredProperties.length > 0 && !selectedProperty && (
                  <DropMenu>
                    {filteredProperties.slice(0, 60).map((p) => (
                      <MenuItem
                        key={`${p.district_key}-${p.project_name_en}`}
                        title={p.project_name_en}
                        subtitle={p.project_name_ar || ""}
                        onClick={() => {
                          setSelectedProperty(p);
                          setPropertyQuery(p.project_name_en);
                          update("project_name_en", p.project_name_en);
                          update("project_name_ar", p.project_name_ar || "");
                        }}
                      />
                    ))}
                  </DropMenu>
                )}
              </Field>

              {/* ✅ BUILDING: show list ONLY when user clicks here */}
              <Field label="Building Name ">
                <input
                  className="input"
                  placeholder={selectedDistrict ? "Click to see buildings (or type to filter)" : "Select district first"}
                  value={selectedBuilding ? selectedBuilding.building_name_en : buildingQuery}
                  disabled={!selectedDistrict}
                  onFocus={async () => {
                    setOpenBuilding(true);
                    await fetchBuildings();
                  }}
                  onBlur={() => setTimeout(() => setOpenBuilding(false), 150)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setBuildingQuery(v);
                    setSelectedBuilding(null);
                    update("building_name_en", v);
                    update("building_key", "");
                  }}
                />

                <InlineStatus loading={buildingLoading} />

                {openBuilding && selectedDistrict && filteredBuildings.length > 0 && !selectedBuilding && (
                  <DropMenu>
                    {filteredBuildings.slice(0, 60).map((b) => (
                      <MenuItem
                        key={`${b.district_key}-${b.building_key}`}
                        title={b.building_name_en}
                        subtitle={b.project_name_en || ""}
                        onClick={() => {
                          setSelectedBuilding(b);
                          setBuildingQuery(b.building_name_en);
                          update("building_key", b.building_key);
                          update("building_name_en", b.building_name_en);
                        }}
                      />
                    ))}
                  </DropMenu>
                )}
              </Field>

              {/* ✅ LAND TYPE: show list ONLY when user clicks here */}
              <Field label="Land Type ">
                <input
                  className="input"
                  placeholder={selectedDistrict ? "Click to see land types (or type to filter)" : "Select district first"}
                  value={selectedLandType ? selectedLandType.land_type_en : landTypeQuery}
                  disabled={!selectedDistrict}
                  onFocus={async () => {
                    setOpenLandType(true);
                    await fetchLandTypes();
                  }}
                  onBlur={() => setTimeout(() => setOpenLandType(false), 150)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLandTypeQuery(v);
                    setSelectedLandType(null);
                    update("land_type_en", v);
                    update("land_type_ar", "");
                  }}
                />

                <InlineStatus loading={landTypeLoading} />

                {openLandType && selectedDistrict && filteredLandTypes.length > 0 && !selectedLandType && (
                  <DropMenu>
                    {filteredLandTypes.slice(0, 60).map((t) => (
                      <MenuItem
                        key={`${t.district_key}-${t.land_type_en}`}
                        title={t.land_type_en}
                        subtitle={t.land_type_ar || ""}
                        onClick={() => {
                          setSelectedLandType(t);
                          setLandTypeQuery(t.land_type_en);
                          update("land_type_en", t.land_type_en);
                          update("land_type_ar", t.land_type_ar || "");
                        }}
                      />
                    ))}
                  </DropMenu>
                )}
              </Field>

              <Field label="Unit">
                <input
                  className="input"
                  placeholder="e.g., Unit 1502"
                  value={form.property_name_unit}
                  onChange={(e) => update("property_name_unit", e.target.value)}
                />
              </Field>
            </div>
          </Section>

          {/* screen same */}
          <Section title="Area and unit">
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

          <Section title="Amenities & Features">
            <div className="chipRow">
              <Chip label="Pool" checked={form.amenity_pool} onChange={(v) => update("amenity_pool", v)} />
              <Chip
                label="Garden/Balcony"
                checked={form.amenity_garden_balcony}
                onChange={(v) => update("amenity_garden_balcony", v)}
              />
              <Chip label="Gym" checked={form.amenity_gym} onChange={(v) => update("amenity_gym", v)} />
              <Chip
                label="24/7 Security"
                checked={form.amenity_security_24_7}
                onChange={(v) => update("amenity_security_24_7", v)}
              />
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

/* ---------- UI blocks ---------- */
function InlineStatus({ loading }) {
  if (!loading) return null;
  return <div className="miniLoading">Loading…</div>;
}

function DropMenu({ children }) {
  return (
    <div className="dropMenu" style={{ position: "relative", marginTop: 8 }}>
      <div className="scroll">{children}</div>
    </div>
  );
}

function MenuItem({ title, subtitle, onClick }) {
  return (
    <button type="button" className="niceSelectItem" onClick={onClick}>
      <div style={{ fontWeight: 800 }}>{title}</div>
      {subtitle ? <div style={{ fontSize: 12, opacity: 0.7 }}>{subtitle}</div> : null}
    </button>
  );
}

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
