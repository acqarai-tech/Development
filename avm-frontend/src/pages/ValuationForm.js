// File: avm-frontend/src/pages/ValuationForm.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { supabase } from "../lib/supabase";

// ---------- Helpers ----------
function toSqm(areaVal, unit) {
  const v = Number(areaVal || 0);
  if (!v) return 0;
  if (unit === "sq.ft") return v * 0.092903;
  return v;
}
function useDebounced(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
function escapeForILike(s) {
  return (s || "").replace(/[%_\\]/g, (m) => `\\${m}`);
}

// ---------- NEW: DB helper utils (ADDED ONLY) ----------
function norm(s) {
  return (s || "").trim().replace(/\s+/g, " ");
}
function genDistrictCode() {
  const a = Date.now().toString(36);
  const b = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `D-${a}-${b}`;
}

// Ensure district row exists in `districts` table.
// If district does not exist => insert with unique code.
// Returns {district_code, district_name}
async function ensureDistrictExists({ district_name, district_code }) {
  const dn = norm(district_name);
  if (!dn) return { district_code: "", district_name: "" };

  // Try find by name (case-insensitive exact)
  const { data: found, error: findErr } = await supabase
    .from("districts")
    .select("id, district_code, district_name")
    .ilike("district_name", dn)
    .limit(1);

  if (findErr) throw findErr;

  if (found && found.length > 0) {
    const row = found[0];
    return {
      district_code: norm(row.district_code),
      district_name: norm(row.district_name) || dn,
    };
  }

  // Insert new district
  const newCode = norm(district_code) || genDistrictCode();

  const { data: inserted, error: insErr } = await supabase
    .from("districts")
    .insert([{ district_code: newCode, district_name: dn }])
    .select("district_code, district_name")
    .single();

  if (insErr) throw insErr;

  return {
    district_code: norm(inserted?.district_code) || newCode,
    district_name: norm(inserted?.district_name) || dn,
  };
}

// Ensure mapping exists in `district_properties` table.
// If not exists => insert {district_code, district_name, property_name}
async function ensureDistrictPropertyExists({ district_code, district_name, property_name }) {
  const dc = norm(district_code);
  const dn = norm(district_name);
  const pn = norm(property_name);

  if (!dc || !dn || !pn) return;

  const { data: found, error: findErr } = await supabase
    .from("district_properties")
    .select("id")
    .eq("district_code", dc)
    .ilike("property_name", pn)
    .limit(1);

  if (findErr) throw findErr;
  if (found && found.length > 0) return;

  const { error: insErr } = await supabase
    .from("district_properties")
    .insert([{ district_code: dc, district_name: dn, property_name: pn }]);

  if (insErr) throw insErr;
}

// ---------- Constants (same as your project) ----------
const COUNTRIES = [
  "United Arab Emirates",
  "Kingdom of Saudi Arabia",
  "Kingdom of Bahrain",
  "Qatar",
  "Oman",
  "Kuwait",
];

const UAE_CITIES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Umm Al Quwain",
  "Fujairah",
  "Ajman",
  "Ras Al Khaimah",
  "Kalba",
  "Khor Fakkan",
  "Al Ain",
];

const PROPERTY_CATEGORIES = ["Residential"];
const PROPERTY_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse", "Office", "Retail"];

const AMENITY_OPTIONS = [
  "24 Hour Security",
  "24 Hours Concierge",
  "ATM Facility",
  "Balcony or Terrace",
  "Barbeque Area",
  "Basketball Court",
  "Beach Access",
  "Beach View",
  "Broadband Internet",
  "Built-in Closet",
  "Built-in Kitchen Appliances",
  "Built-in Wardrobes",
  "Business Centre",
  "Canal View",
  "CCTV Security",
  "Central Heating",
  "Centrally Air-Conditioned",
  "Children's Pool",
  "City View",
  "Cleaning Services",
  "Clinic",
  "Community pool",
  "Community View",
  "Conference Room",
  "Courtyard view",
  "Covered Parking",
  "Cycling Tracks",
  "Day Care Center",
  "Double Glazed Windows",
  "Easy Access to Parking",
  "Electricity Backup",
  "Elevator",
  "Exclusive beach access",
  "Facilities for Disabled",
  "First Aid Medical Center",
  "Fitness center",
  "Football Pitches",
  "Games Room",
  "Golf",
  "Golf Course View",
  "Gym or Health Club",
  "Gymnasium",
  "Health & Beauty Salon",
  "Health Centre",
  "High-Rise views",
  "High-speed elevator",
  "Housekeeping",
  "Indoor Gardens",
  "Indoor Pool",
  "Intercom",
  "Jacuzzi",
  "Jogging Track",
  "Kid's Play Area",
  "Kitchen Appliances",
  "Lake View",
  "Landmark view",
  "Landscaping",
  "Laundry Facility",
  "Laundry Room",
  "Lawn or Garden",
  "Lobby",
  "Lounge Area",
  "Maid Service",
  "Maids Room",
  "Maintenance Staff",
  "Mall",
  "Mini-Market",
  "Nursery",
  "Outdoor Pool",
  "Pantry",
  "Park",
  "Park Views",
  "Parking",
  "Pets Allowed",
  "Pool View",
  "Prayer Room",
  "Private Garden",
  "Private Jacuzzi",
  "Private Parking",
  "Private Pool",
  "Public Pool",
  "Reception/Waiting Room",
  "Recording studio",
  "Restaurants",
  "Retail",
  "Road View",
  "Satellite/Cable TV",
  "Sauna",
  "Sea Views",
  "Security",
  "Shaded Garage",
  "Shared Gym",
  "Shared Jacuzzi",
  "Shared Pool",
  "Skating Park",
  "Social Club",
  "Solar Heating or Electrical",
  "Spa",
  "Sports Facilities",
  "Steam Room",
  "Storage Areas",
  "Study Room",
  "Supermarket",
  "Swimming Pool",
  "Tennis Court",
  "Theater",
  "Underground Parking",
  "Vastu-compliant",
  "Walk-in Closet",
  "Waste Disposal",
  "Water View",
  "Wellness club",
  "Yoga Studio",
];

const TITLE_DEED_TYPES = ["Leasehold", "Freehold", "Musataha"];
const VALUATION_TYPES = ["Current Market Value", "Historical Property Value", "Verify Previous Valuation"];
const PURPOSE_OF_VALUATION = ["Buy & Sell", "Mortgage", "Investment", "Tax", "Legal", "Other"];
const PROPERTY_STATUS = ["Owner Occupied", "Leased", "Vacant", "Under Construction"];
const FURNISHING_TYPES = ["Furnished", "Unfurnished", "SemiFurnished"];

const BEDROOMS = ["0", "1", "2", "3", "4", "5", "6", "7+"];
const BATHROOMS = ["1", "2", "3", "4", "5", "6+"];

const FLOOR_LEVELS = ["Basement", "Ground", "Mezzanine", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

// ---------- Component ----------
export default function ValuationForm({ formData, setFormData }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const [form, setForm] = useState(
    formData || {
      country: "United Arab Emirates",
      city: "Dubai",

      district_code: "",
      district_name: "",
      property_name: "",

      // legacy keys (keep)
      area_name_en: "",
      area_name_ar: "",
      district_key: "",
      building_name_en: "",
      building_key: "",
      project_name_en: "",
      project_name_ar: "",
      land_type_en: "",
      land_type_ar: "",

      // template fields
      address_search: "At Silicon Oasis Entrance, Near DSOA - HQ - دبي",
      project_reference: "",
      building_name: "",
      title_deed_no: "",
      title_deed_type: "Freehold",
      plot_no: "1001",
      is_project_valuation: false,

      valuation_type: "Current Market Value",
      property_category: "Residential",
      purpose_of_valuation: "Buy & Sell",
      property_status: "Leased",

      apartment_no: "",
      area_value: "",
      area_unit: "sq.ft",

      last_renovated_on: "",
      floor_level: "",

      furnishing: "SemiFurnished",
      bedrooms: "",
      bathrooms: "",

      property_type_en: "Apartment",
      property_name_unit: "",

      amenities: [],
    }
  );

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const isDubaiFlow = form.country === "United Arab Emirates" && form.city === "Dubai";

  // -------- Districts (from districts table) --------
  const [districtOpen, setDistrictOpen] = useState(false);
  const districtBoxRef = useRef(null);
  const [districtQuery, setDistrictQuery] = useState("");
  const dQ = useDebounced(districtQuery, 250);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [districtResults, setDistrictResults] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // -------- Properties (from district_properties mapping) --------
  const [propertyOpen, setPropertyOpen] = useState(false);
  const propertyBoxRef = useRef(null);
  const [propertyQuery, setPropertyQuery] = useState("");
  const pQ = useDebounced(propertyQuery, 150);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [propertyResults, setPropertyResults] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // -------- Features (amenities) picker --------
  const [featuresOpen, setFeaturesOpen] = useState(true);
  const [featureSearch, setFeatureSearch] = useState("");
  const fQ = useDebounced(featureSearch, 200);

  const computedSqm = useMemo(() => toSqm(form.area_value, form.area_unit), [form.area_value, form.area_unit]);

  const resetDistrictAndProperty = () => {
    setSelectedDistrict(null);
    setDistrictQuery("");
    setDistrictResults([]);
    setDistrictOpen(false);

    setSelectedProperty(null);
    setPropertyQuery("");
    setPropertyResults([]);
    setPropertyOpen(false);

    update("district_code", "");
    update("district_name", "");
    update("property_name", "");

    update("area_name_en", "");
    update("project_name_en", "");
    update("project_reference", "");
  };

  // click outside close
  useEffect(() => {
    function onDown(e) {
      if (districtBoxRef.current && !districtBoxRef.current.contains(e.target)) setDistrictOpen(false);
      if (propertyBoxRef.current && !propertyBoxRef.current.contains(e.target)) setPropertyOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Load districts when open (and on search)
  useEffect(() => {
    let alive = true;
    async function run() {
      if (!districtOpen) return;
      if (!isDubaiFlow) return;

      setDistrictLoading(true);
      setError("");

      const q = (dQ || "").trim();
      let query = supabase
        .from("districts")
        .select("district_code, district_name")
        .order("district_name", { ascending: true })
        .range(0, 9999);

      if (q.length >= 2) {
        const safe = escapeForILike(q);
        query = query.ilike("district_name", `%${safe}%`);
      }

      const { data, error: e } = await query;
      if (!alive) return;

      setDistrictLoading(false);

      if (e) {
        console.error(e);
        setDistrictResults([]);
        setError(e.message);
        return;
      }

      const map = new Map();
      (data || []).forEach((r) => {
        const code = (r.district_code || "").trim();
        const name = (r.district_name || "").trim();
        if (!name) return;
        const key = `${code}__${name}`;
        if (!map.has(key)) map.set(key, { district_code: code, district_name: name });
      });

      setDistrictResults(Array.from(map.values()));
    }

    run();
    return () => {
      alive = false;
    };
  }, [districtOpen, isDubaiFlow, dQ]);

  // Load properties when open for selected district
  useEffect(() => {
    let alive = true;
    async function run() {
      if (!propertyOpen) return;
      if (!selectedDistrict) return;

      setPropertyLoading(true);
      setError("");

      let query = supabase
        .from("district_properties")
        .select("property_name")
        .order("property_name", { ascending: true })
        .range(0, 9999)
        .not("property_name", "is", null)
        .neq("property_name", "");

      if (selectedDistrict.district_code) query = query.eq("district_code", selectedDistrict.district_code);
      else query = query.eq("district_name", selectedDistrict.district_name);

      const { data, error: e } = await query;
      if (!alive) return;

      setPropertyLoading(false);

      if (e) {
        console.error(e);
        setPropertyResults([]);
        setError(e.message);
        return;
      }

      const seen = new Set();
      const rows = [];
      (data || []).forEach((r) => {
        const name = (r.property_name || "").trim();
        if (!name) return;
        if (seen.has(name)) return;
        seen.add(name);
        rows.push({ property_name: name });
      });

      setPropertyResults(rows);
    }

    run();
    return () => {
      alive = false;
    };
  }, [propertyOpen, selectedDistrict]);

  const filteredProperties = useMemo(() => {
    const q = (pQ || "").trim().toLowerCase();
    if (!q) return propertyResults;
    return propertyResults.filter((x) => (x.property_name || "").toLowerCase().includes(q));
  }, [pQ, propertyResults]);

  const toggleAmenity = (a) => {
    const cur = Array.isArray(form.amenities) ? form.amenities : [];
    if (cur.includes(a)) update("amenities", cur.filter((x) => x !== a));
    else update("amenities", [...cur, a]);
  };

  const filteredAmenities = useMemo(() => {
    const q = (fQ || "").trim().toLowerCase();
    if (!q) return AMENITY_OPTIONS;
    return AMENITY_OPTIONS.filter((x) => x.toLowerCase().includes(q));
  }, [fQ]);

  // ---------- Submit (Go to report) ----------
  // ✅ Only change: make it async + ensure district & property mapping exist.
  const onNext = async () => {
    setError("");

    if (!isDubaiFlow) {
      setError("Please select Country: United Arab Emirates and City: Dubai.");
      return;
    }
    if (!selectedDistrict?.district_name) {
      setError("Please select a District.");
      return;
    }
    const chosenProperty = selectedProperty?.property_name || (propertyQuery || "").trim();
    if (!chosenProperty) {
      setError("Please select a Project / Property Reference (property).");
      return;
    }
    if (!form.apartment_no?.trim()) {
      setError("Please enter Apartment No.");
      return;
    }
    if (!computedSqm || computedSqm <= 0) {
      setError("Please enter Apartment Size (greater than 0).");
      return;
    }

    try {
      // ✅ NEW ADDITION: If district not present -> add to districts
      // ✅ NEW ADDITION: If property not present -> add to district_properties
      const ensuredDistrict = await ensureDistrictExists({
        district_name: selectedDistrict?.district_name || form.district_name,
        district_code: selectedDistrict?.district_code || form.district_code,
      });

      await ensureDistrictPropertyExists({
        district_code: ensuredDistrict.district_code,
        district_name: ensuredDistrict.district_name,
        property_name: chosenProperty,
      });

      const payload = {
        ...form,

        // your internal computed mapping
        procedure_area: Number(computedSqm),
        rooms_en: Number(form.bedrooms || 0),

        // Dubai chain
        district_code: ensuredDistrict?.district_code || "",
        district_name: ensuredDistrict?.district_name || "",
        property_name: chosenProperty,

        // legacy mapping
        area_name_en: ensuredDistrict?.district_name || "",
        project_name_en: chosenProperty,
        building_name_en: form.building_name || "",
      };

      localStorage.setItem("truvalu_formData_v1", JSON.stringify(payload));
      setFormData(payload);
      navigate("/report");
    } catch (e) {
      console.error(e);
      setError(e?.message || "Could not save district/property to database (check RLS policies).");
    }
  };

  const onReset = () => {
    setError("");
    resetDistrictAndProperty();
    setFeatureSearch("");
    setForm({
      country: "United Arab Emirates",
      city: "Dubai",

      district_code: "",
      district_name: "",
      property_name: "",

      area_name_en: "",
      area_name_ar: "",
      district_key: "",
      building_name_en: "",
      building_key: "",
      project_name_en: "",
      project_name_ar: "",
      land_type_en: "",
      land_type_ar: "",

      address_search: "",
      project_reference: "",
      building_name: "",
      title_deed_no: "",
      title_deed_type: "Freehold",
      plot_no: "",
      is_project_valuation: false,

      valuation_type: "Current Market Value",
      property_category: "Residential",
      purpose_of_valuation: "Buy & Sell",
      property_status: "Owner Occupied",

      apartment_no: "",
      area_value: "",
      area_unit: "sq.ft",

      last_renovated_on: "",
      floor_level: "",

      furnishing: "Unfurnished",
      bedrooms: "",
      bathrooms: "",

      property_type_en: "Apartment",
      property_name_unit: "",

      amenities: [],
    });
    localStorage.removeItem("truvalu_formData_v1");
  };

  return (
    <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
      <NavBar />

      <main className="pt-28 pb-20 md:pt-36 md:pb-28">
        <div className="max-w-5xl mx-auto px-6">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-end justify-between mb-3">
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Property Details</h1>
                <p className="text-slate-500 mt-2">Please provide your property details for the valuation</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-blue-600">Step 2 of 4</span>
                <div className="w-32 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                  <div className="w-1/2 h-full bg-blue-600" />
                </div>
              </div>
            </div>
            <div className="h-px bg-slate-200 w-full" />
          </div>

          {/* Card */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-8 md:p-12 space-y-10">
              {error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
                  {error}
                </div>
              ) : null}

              {/* Country / City / District */}
              <section className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label>Country *</Label>
                    <select
                      className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
                      value={form.country}
                      onChange={(e) => {
                        const v = e.target.value;
                        update("country", v);
                        if (v === "United Arab Emirates") update("city", "Dubai");
                        else update("city", "");
                        resetDistrictAndProperty();
                      }}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>City *</Label>
                    <select
                      className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
                      value={form.city}
                      onChange={(e) => {
                        update("city", e.target.value);
                        resetDistrictAndProperty();
                      }}
                      disabled={form.country !== "United Arab Emirates"}
                    >
                      {(form.country === "United Arab Emirates" ? UAE_CITIES : []).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District dropdown (from districts table) */}
                  <div ref={districtBoxRef} className="relative">
                    <Label>District *</Label>
                    <input
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
                      placeholder={isDubaiFlow ? "Select district" : "Select UAE + Dubai first"}
                      value={selectedDistrict ? selectedDistrict.district_name : districtQuery}
                      disabled={!isDubaiFlow}
                      onFocus={() => setDistrictOpen(true)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setDistrictQuery(v);
                        setSelectedDistrict(null);

                        // reset property chain
                        setSelectedProperty(null);
                        setPropertyQuery("");
                        setPropertyResults([]);
                        setPropertyOpen(false);

                        update("district_code", "");
                        update("district_name", v);
                        update("area_name_en", v);
                      }}
                    />

                    {districtLoading ? (
                      <div className="absolute right-3 top-9 text-xs text-slate-500">Loading…</div>
                    ) : null}

                    {districtOpen && isDubaiFlow && !selectedDistrict ? (
                      <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                        <div className="max-h-64 overflow-auto">
                          {districtResults.length === 0 && !districtLoading ? (
                            <div className="px-4 py-3 text-sm text-slate-500">No districts found</div>
                          ) : (
                            districtResults.map((d) => (
                              <button
                                key={`${d.district_code}-${d.district_name}`}
                                type="button"
                                className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50"
                                onClick={() => {
                                  setSelectedDistrict(d);
                                  setDistrictQuery(d.district_name);
                                  setDistrictOpen(false);

                                  update("district_code", d.district_code || "");
                                  update("district_name", d.district_name || "");
                                  update("area_name_en", d.district_name || "");

                                  // reset property
                                  setSelectedProperty(null);
                                  setPropertyQuery("");
                                  setPropertyResults([]);
                                  setPropertyOpen(false);
                                }}
                              >
                                {d.district_name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Map placeholder (same layout as template) */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-[360px] bg-slate-100">
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[70%] z-10">
                    <div className="relative">
                      <input
                        className="w-full h-14 bg-white border-none shadow-2xl rounded-xl px-6 pr-12 text-sm font-medium focus:ring-2 focus:ring-blue-600"
                        type="text"
                        value={form.address_search || ""}
                        onChange={(e) => update("address_search", e.target.value)}
                        placeholder="Search address (optional)"
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        onClick={() => update("address_search", "")}
                        aria-label="clear"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-5xl">📍</div>
                  </div>

                  <div className="absolute bottom-6 right-6 flex flex-col gap-2">
                    <button type="button" className="w-10 h-10 bg-white rounded-lg shadow-lg font-bold">
                      +
                    </button>
                    <button type="button" className="w-10 h-10 bg-white rounded-lg shadow-lg font-bold">
                      −
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-6">
                    <button type="button" className="px-4 py-2 bg-white rounded-lg shadow-lg text-xs font-bold text-slate-600">
                      ⤢ ENLARGE MAP
                    </button>
                  </div>
                </div>
              </section>

              {/* Project/Property + Building + Title deed */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
                <div className="space-y-6">
                  {/* Property dropdown (from district_properties) */}
                  <div ref={propertyBoxRef} className="relative">
                    <Label>Project / Property Reference (Optional)</Label>
                    <input
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
                      placeholder={selectedDistrict ? "Select property (or type)" : "Select district first"}
                      value={selectedProperty ? selectedProperty.property_name : propertyQuery}
                      disabled={!selectedDistrict}
                      onFocus={() => setPropertyOpen(true)}
                      onChange={(e) => {
                        const v = e.target.value;
                        setPropertyQuery(v);
                        setSelectedProperty(null);

                        update("property_name", v);
                        update("project_reference", v);
                        update("project_name_en", v);
                      }}
                    />

                    {propertyLoading ? (
                      <div className="absolute right-3 top-9 text-xs text-slate-500">Loading…</div>
                    ) : null}

                    {propertyOpen && selectedDistrict && !selectedProperty ? (
                      <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
                        <div className="max-h-64 overflow-auto">
                          {filteredProperties.length === 0 && !propertyLoading ? (
                            <div className="px-4 py-3 text-sm text-slate-500">No properties found</div>
                          ) : (
                            filteredProperties.map((p) => (
                              <button
                                key={p.property_name}
                                type="button"
                                className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50"
                                onClick={() => {
                                  setSelectedProperty(p);
                                  setPropertyQuery(p.property_name);
                                  setPropertyOpen(false);

                                  update("property_name", p.property_name);
                                  update("project_reference", p.property_name);
                                  update("project_name_en", p.property_name);
                                }}
                              >
                                {p.property_name}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <Label>Title Deed No (Optional)</Label>
                    <input
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
                      placeholder="Title Deed No"
                      value={form.title_deed_no || ""}
                      onChange={(e) => update("title_deed_no", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label>Building Name (Optional)</Label>
                    <input
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
                      placeholder="Building Name"
                      value={form.building_name || ""}
                      onChange={(e) => update("building_name", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Title Deed Type *</Label>
                    <div className="flex gap-3">
                      {TITLE_DEED_TYPES.map((t) => (
                        <ToggleBtn
                          key={t}
                          active={form.title_deed_type === t}
                          onClick={() => update("title_deed_type", t)}
                          label={t}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Label>Plot No (Optional)</Label>
                    <input
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
                      placeholder="e.g. 1001"
                      value={form.plot_no || ""}
                      onChange={(e) => update("plot_no", e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      type="checkbox"
                      checked={!!form.is_project_valuation}
                      onChange={(e) => update("is_project_valuation", e.target.checked)}
                    />
                    <span className="text-sm font-semibold text-slate-700">Is Project Valuation?</span>
                  </div>
                </div>
              </section>

              {/* Valuation type + category + purpose */}
              <section className="space-y-8 pt-6 border-t border-slate-100">
                <div>
                  <Label>Valuation Type Selection *</Label>
                  <div className="flex flex-wrap md:flex-nowrap gap-3">
                    {VALUATION_TYPES.map((x) => (
                      <ToggleBtn
                        key={x}
                        active={form.valuation_type === x}
                        onClick={() => update("valuation_type", x)}
                        label={x}
                        wide
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Label>Property Category *</Label>
                    <div className="flex gap-3">
                      {PROPERTY_CATEGORIES.map((x) => (
                        <ToggleBtn
                          key={x}
                          active={form.property_category === x}
                          onClick={() => update("property_category", x)}
                          label={x}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Purpose of Valuation *</Label>
                    <select
                      className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
                      value={form.purpose_of_valuation}
                      onChange={(e) => update("purpose_of_valuation", e.target.value)}
                    >
                      {PURPOSE_OF_VALUATION.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Status + apartment details */}
              <section className="space-y-8 pt-6 border-t border-slate-100">
                <div>
                  <Label>Property Current Status *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {PROPERTY_STATUS.map((x) => (
                      <ToggleBtn
                        key={x}
                        active={form.property_status === x}
                        onClick={() => update("property_status", x)}
                        label={x}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Label>Apartment No *</Label>
                    <input
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
                      placeholder="Enter Apartment No e.g. K-098"
                      value={form.apartment_no || ""}
                      onChange={(e) => update("apartment_no", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Apartment Size *</Label>
                    <div className="relative flex">
                      <input
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-l-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium"
                        placeholder="Enter Size e.g. 9000"
                        type="number"
                        value={form.area_value}
                        onChange={(e) => update("area_value", e.target.value)}
                      />
                      <select
                        className="h-12 bg-slate-100 border border-l-0 border-slate-200 rounded-r-xl px-4 text-sm font-bold focus:ring-0"
                        value={form.area_unit}
                        onChange={(e) => update("area_unit", e.target.value)}
                      >
                        <option value="sq.ft">Sq Feet</option>
                        <option value="sq.m">Sq Meters</option>
                      </select>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5 ml-1">This field accepts only English numbers.</p>
                  </div>

                  <div>
                    <Label>Last Renovated On</Label>
                    <input
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
                      type="date"
                      value={form.last_renovated_on || ""}
                      onChange={(e) => update("last_renovated_on", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Floor / Level</Label>
                    <select
                      className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
                      value={form.floor_level || ""}
                      onChange={(e) => update("floor_level", e.target.value)}
                    >
                      <option value="" disabled>
                        Select Floor / Level
                      </option>
                      {FLOOR_LEVELS.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Furnishing Type *</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {FURNISHING_TYPES.map((x) => (
                      <ToggleBtn
                        key={x}
                        active={form.furnishing === x}
                        onClick={() => update("furnishing", x)}
                        label={x}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Label>Bedroom *</Label>
                    <select
                      className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
                      value={String(form.bedrooms || "")}
                      onChange={(e) => update("bedrooms", e.target.value)}
                    >
                      <option value="" disabled>
                        Select No. Of Bedroom
                      </option>
                      {BEDROOMS.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>Bathroom *</Label>
                    <select
                      className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
                      value={String(form.bathrooms || "")}
                      onChange={(e) => update("bathrooms", e.target.value)}
                    >
                      <option value="" disabled>
                        Select No. Of Bathroom
                      </option>
                      {BATHROOMS.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Extra */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Label>Property Type</Label>
                    <select
                      className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
                      value={form.property_type_en}
                      onChange={(e) => update("property_type_en", e.target.value)}
                    >
                      {PROPERTY_TYPES.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Unit (Optional)</Label>
                    <input
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
                      placeholder="e.g. Unit 1502"
                      value={form.property_name_unit || ""}
                      onChange={(e) => update("property_name_unit", e.target.value)}
                    />
                  </div>
                </div>
              </section>

              {/* Features / Amenities */}
              <section className="space-y-4 pt-6 border-t border-slate-100">
                <Label>Select Features</Label>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/30">
                  <button
                    type="button"
                    className="w-full p-6 border-b border-slate-100 flex justify-between items-center"
                    onClick={() => setFeaturesOpen((s) => !s)}
                  >
                    <span className="text-slate-500 font-medium">Select Features</span>
                    <span className="text-slate-400">{featuresOpen ? "▴" : "▾"}</span>
                  </button>

                  {featuresOpen && (
                    <div className="p-6 space-y-6">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
                        <input
                          className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600"
                          placeholder="Search features..."
                          value={featureSearch}
                          onChange={(e) => setFeatureSearch(e.target.value)}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2 max-h-52 overflow-auto pr-1">
                        {filteredAmenities.map((a) => {
                          const on = (form.amenities || []).includes(a);
                          return (
                            <button
                              key={a}
                              type="button"
                              onClick={() => toggleAmenity(a)}
                              className={
                                on
                                  ? "px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg text-xs font-semibold"
                                  : "px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:border-blue-600"
                              }
                            >
                              {a}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Actions */}
              <div className="pt-8 flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={onNext}
                  className="flex-1 h-16 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
                >
                  ⚡ Get Free Valuation
                </button>

                <button
                  type="button"
                  onClick={onReset}
                  className="px-10 h-16 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold transition-all hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          <p className="text-center mt-8 text-xs text-slate-400 font-medium">
            Instant report powered by real-time DLD transaction data & neural intelligence.
          </p>
        </div>
      </main>
       {/* ================= FOOTER (NEW) ================= */}
      <footer className="bg-white border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold">
                  A
                </div>
                <span className="text-lg font-extrabold">ACQAR</span>
              </div>
              <p className="text-sm text-slate-500 mt-4">
                AI-powered real estate valuations aligned with UAE DLD data.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 mb-3">Product</p>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>Dashboard</li>
                <li>Valuation</li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 mb-3">Company</p>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>About</li>
                <li>Contact</li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-400 mb-3">Legal</p>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t text-xs text-slate-400 flex justify-between">
            <span>© {new Date().getFullYear()} ACQAR TECHNOLOGIES</span>
            <span>Made in UAE 🇦🇪</span>
          </div>
        </div>
      </footer>
    </div>
    
  );
}

// ---------- Small UI helpers ----------
function Label({ children }) {
  return (
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">
      {children}
    </label>
  );
}

function ToggleBtn({ label, active, onClick, wide }) {
  const base = "py-3 text-sm font-bold rounded-xl border-2 transition-all text-center cursor-pointer select-none";
  const act = "border-slate-900 bg-slate-900 text-white";
  const inact = "border-slate-100 bg-white text-slate-400 hover:border-slate-200";
  return (
    <button
      type="button"
      onClick={onClick}
      className={[base, wide ? "flex-1" : "flex-1", active ? act : inact].join(" ")}
    >
      {label}
    </button>
  );
}

