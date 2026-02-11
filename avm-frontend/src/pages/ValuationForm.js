// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import NavBar from "../components/NavBar";
// import { supabase } from "../lib/supabase";

// // ---------- Helpers ----------
// function toSqm(areaVal, unit) {
//   const v = Number(areaVal || 0);
//   if (!v) return 0;
//   if (unit === "sq.ft") return v * 0.092903;
//   return v;
// }
// function useDebounced(value, delay = 250) {
//   const [v, setV] = useState(value);
//   useEffect(() => {
//     const t = setTimeout(() => setV(value), delay);
//     return () => clearTimeout(t);
//   }, [value, delay]);
//   return v;
// }
// function escapeForILike(s) {
//   return (s || "").replace(/[%_\\]/g, (m) => `\\${m}`);
// }

// // ---------- NEW: DB helper utils (ADDED ONLY) ----------
// function norm(s) {
//   return (s || "").trim().replace(/\s+/g, " ");
// }
// function genDistrictCode() {
//   const a = Date.now().toString(36);
//   const b = Math.random().toString(36).slice(2, 6).toUpperCase();
//   return `D-${a}-${b}`;
// }

// // Ensure district row exists in `districts` table.
// async function ensureDistrictExists({ district_name, district_code }) {
//   const dn = norm(district_name);
//   if (!dn) return { district_code: "", district_name: "" };

//   const { data: found, error: findErr } = await supabase
//     .from("districts")
//     .select("id, district_code, district_name")
//     .ilike("district_name", dn)
//     .limit(1);

//   if (findErr) throw findErr;

//   if (found && found.length > 0) {
//     const row = found[0];
//     return {
//       district_code: norm(row.district_code),
//       district_name: norm(row.district_name) || dn,
//     };
//   }

//   const newCode = norm(district_code) || genDistrictCode();

//   const { data: inserted, error: insErr } = await supabase
//     .from("districts")
//     .insert([{ district_code: newCode, district_name: dn }])
//     .select("district_code, district_name")
//     .single();

//   if (insErr) throw insErr;

//   return {
//     district_code: norm(inserted?.district_code) || newCode,
//     district_name: norm(inserted?.district_name) || dn,
//   };
// }

// // Ensure mapping exists in `district_properties` table.
// async function ensureDistrictPropertyExists({ district_code, district_name, property_name }) {
//   const dc = norm(district_code);
//   const dn = norm(district_name);
//   const pn = norm(property_name);
//   if (!dc || !dn || !pn) return;

//   const { data: found, error: findErr } = await supabase
//     .from("district_properties")
//     .select("id")
//     .eq("district_code", dc)
//     .ilike("property_name", pn)
//     .limit(1);

//   if (findErr) throw findErr;
//   if (found && found.length > 0) return;

//   const { error: insErr } = await supabase
//     .from("district_properties")
//     .insert([{ district_code: dc, district_name: dn, property_name: pn }]);

//   if (insErr) throw insErr;
// }

// // ✅ NEW (ADDED ONLY): insert valuation snapshot (store ID for Report update)
// async function insertValuationRow(row) {
//   const { data, error } = await supabase
//     .from("valuations")
//     .insert([row])
//     .select("id")
//     .single();
//   if (error) throw error;
//   return data?.id;
// }

// // ---------- Constants ----------
// const COUNTRIES = [
//   "United Arab Emirates",
//   "Kingdom of Saudi Arabia",
//   "Kingdom of Bahrain",
//   "Qatar",
//   "Oman",
//   "Kuwait",
// ];

// const UAE_CITIES = [
//   "Dubai",
//   "Abu Dhabi",
//   "Sharjah",
//   "Umm Al Quwain",
//   "Fujairah",
//   "Ajman",
//   "Ras Al Khaimah",
//   "Kalba",
//   "Khor Fakkan",
//   "Al Ain",
// ];

// const PROPERTY_CATEGORIES = ["Residential"];
// const PROPERTY_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse", "Office", "Retail"];

// const AMENITY_OPTIONS = [
//   "24 Hour Security",
//   "24 Hours Concierge",
//   "ATM Facility",
//   "Balcony or Terrace",
//   "Barbeque Area",
//   "Basketball Court",
//   "Beach Access",
//   "Beach View",
//   "Broadband Internet",
//   "Built-in Closet",
//   "Built-in Kitchen Appliances",
//   "Built-in Wardrobes",
//   "Business Centre",
//   "Canal View",
//   "CCTV Security",
//   "Central Heating",
//   "Centrally Air-Conditioned",
//   "Children's Pool",
//   "City View",
//   "Cleaning Services",
//   "Clinic",
//   "Community pool",
//   "Community View",
//   "Conference Room",
//   "Courtyard view",
//   "Covered Parking",
//   "Cycling Tracks",
//   "Day Care Center",
//   "Double Glazed Windows",
//   "Easy Access to Parking",
//   "Electricity Backup",
//   "Elevator",
//   "Exclusive beach access",
//   "Facilities for Disabled",
//   "First Aid Medical Center",
//   "Fitness center",
//   "Football Pitches",
//   "Games Room",
//   "Golf",
//   "Golf Course View",
//   "Gym or Health Club",
//   "Gymnasium",
//   "Health & Beauty Salon",
//   "Health Centre",
//   "High-Rise views",
//   "High-speed elevator",
//   "Housekeeping",
//   "Indoor Gardens",
//   "Indoor Pool",
//   "Intercom",
//   "Jacuzzi",
//   "Jogging Track",
//   "Kid's Play Area",
//   "Kitchen Appliances",
//   "Lake View",
//   "Landmark view",
//   "Landscaping",
//   "Laundry Facility",
//   "Laundry Room",
//   "Lawn or Garden",
//   "Lobby",
//   "Lounge Area",
//   "Maid Service",
//   "Maids Room",
//   "Maintenance Staff",
//   "Mall",
//   "Mini-Market",
//   "Nursery",
//   "Outdoor Pool",
//   "Pantry",
//   "Park",
//   "Park Views",
//   "Parking",
//   "Pets Allowed",
//   "Pool View",
//   "Prayer Room",
//   "Private Garden",
//   "Private Jacuzzi",
//   "Private Parking",
//   "Private Pool",
//   "Public Pool",
//   "Reception/Waiting Room",
//   "Recording studio",
//   "Restaurants",
//   "Retail",
//   "Road View",
//   "Satellite/Cable TV",
//   "Sauna",
//   "Sea Views",
//   "Security",
//   "Shaded Garage",
//   "Shared Gym",
//   "Shared Jacuzzi",
//   "Shared Pool",
//   "Skating Park",
//   "Social Club",
//   "Solar Heating or Electrical",
//   "Spa",
//   "Sports Facilities",
//   "Steam Room",
//   "Storage Areas",
//   "Study Room",
//   "Supermarket",
//   "Swimming Pool",
//   "Tennis Court",
//   "Theater",
//   "Underground Parking",
//   "Vastu-compliant",
//   "Walk-in Closet",
//   "Waste Disposal",
//   "Water View",
//   "Wellness club",
//   "Yoga Studio",
// ];

// const TITLE_DEED_TYPES = ["Leasehold", "Freehold", "Musataha"];
// const VALUATION_TYPES = ["Current Market Value", "Historical Property Value", "Verify Previous Valuation"];
// const PURPOSE_OF_VALUATION = ["Buy & Sell", "Mortgage", "Investment", "Tax", "Legal", "Other"];
// const PROPERTY_STATUS = ["Owner Occupied", "Leased", "Vacant", "Under Construction"];
// const FURNISHING_TYPES = ["Furnished", "Unfurnished", "SemiFurnished"];
// const BEDROOMS = ["0", "1", "2", "3", "4", "5", "6", "7+"];
// const BATHROOMS = ["1", "2", "3", "4", "5", "6+"];
// const FLOOR_LEVELS = ["Basement", "Ground", "Mezzanine", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

// // ---------- Component ----------
// export default function ValuationForm({ formData, setFormData }) {
//   const navigate = useNavigate();
//   const [error, setError] = useState("");

//   const [form, setForm] = useState(
//     formData || {
//       country: "United Arab Emirates",
//       city: "Dubai",

//       district_code: "",
//       district_name: "",
//       property_name: "",

//       // legacy keys (keep)
//       area_name_en: "",
//       area_name_ar: "",
//       district_key: "",
//       building_name_en: "",
//       building_key: "",
//       project_name_en: "",
//       project_name_ar: "",
//       land_type_en: "",
//       land_type_ar: "",

//       address_search: "At Silicon Oasis Entrance, Near DSOA - HQ - دبي",
//       project_reference: "",
//       building_name: "",
//       title_deed_no: "",
//       title_deed_type: "Freehold",
//       plot_no: "1001",
//       is_project_valuation: false,

//       valuation_type: "Current Market Value",
//       property_category: "Residential",
//       purpose_of_valuation: "Buy & Sell",
//       property_status: "Leased",

//       apartment_no: "",
//       area_value: "",
//       area_unit: "sq.ft",

//       last_renovated_on: "",
//       floor_level: "",

//       furnishing: "SemiFurnished",
//       bedrooms: "",
//       bathrooms: "",

//       property_type_en: "Apartment",
//       property_name_unit: "",

//       amenities: [],
//     }
//   );

//   const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

//   const isDubaiFlow = form.country === "United Arab Emirates" && form.city === "Dubai";

//   // -------- Districts --------
//   const [districtOpen, setDistrictOpen] = useState(false);
//   const districtBoxRef = useRef(null);
//   const [districtQuery, setDistrictQuery] = useState("");
//   const dQ = useDebounced(districtQuery, 250);
//   const [districtLoading, setDistrictLoading] = useState(false);
//   const [districtResults, setDistrictResults] = useState([]);
//   const [selectedDistrict, setSelectedDistrict] = useState(null);

//   // -------- Properties --------
//   const [propertyOpen, setPropertyOpen] = useState(false);
//   const propertyBoxRef = useRef(null);
//   const [propertyQuery, setPropertyQuery] = useState("");
//   const pQ = useDebounced(propertyQuery, 150);
//   const [propertyLoading, setPropertyLoading] = useState(false);
//   const [propertyResults, setPropertyResults] = useState([]);
//   const [selectedProperty, setSelectedProperty] = useState(null);

//   // -------- Amenities --------
//   const [featuresOpen, setFeaturesOpen] = useState(true);
//   const [featureSearch, setFeatureSearch] = useState("");
//   const fQ = useDebounced(featureSearch, 200);

//   const computedSqm = useMemo(() => toSqm(form.area_value, form.area_unit), [form.area_value, form.area_unit]);

//   const typedDistrictName = norm(selectedDistrict?.district_name || districtQuery || form.district_name);

//   const resetDistrictAndProperty = () => {
//     setSelectedDistrict(null);
//     setDistrictQuery("");
//     setDistrictResults([]);
//     setDistrictOpen(false);

//     setSelectedProperty(null);
//     setPropertyQuery("");
//     setPropertyResults([]);
//     setPropertyOpen(false);

//     update("district_code", "");
//     update("district_name", "");
//     update("property_name", "");

//     update("area_name_en", "");
//     update("project_name_en", "");
//     update("project_reference", "");
//   };

//   useEffect(() => {
//     function onDown(e) {
//       if (districtBoxRef.current && !districtBoxRef.current.contains(e.target)) setDistrictOpen(false);
//       if (propertyBoxRef.current && !propertyBoxRef.current.contains(e.target)) setPropertyOpen(false);
//     }
//     document.addEventListener("mousedown", onDown);
//     return () => document.removeEventListener("mousedown", onDown);
//   }, []);

//   useEffect(() => {
//     let alive = true;
//     async function run() {
//       if (!districtOpen) return;
//       if (!isDubaiFlow) return;

//       setDistrictLoading(true);
//       setError("");

//       const q = (dQ || "").trim();
//       let query = supabase
//         .from("districts")
//         .select("district_code, district_name")
//         .order("district_name", { ascending: true })
//         .range(0, 9999);

//       if (q.length >= 2) {
//         const safe = escapeForILike(q);
//         query = query.ilike("district_name", `%${safe}%`);
//       }

//       const { data, error: e } = await query;
//       if (!alive) return;

//       setDistrictLoading(false);

//       if (e) {
//         console.error(e);
//         setDistrictResults([]);
//         setError(e.message);
//         return;
//       }

//       const map = new Map();
//       (data || []).forEach((r) => {
//         const code = (r.district_code || "").trim();
//         const name = (r.district_name || "").trim();
//         if (!name) return;
//         const key = `${code}__${name}`;
//         if (!map.has(key)) map.set(key, { district_code: code, district_name: name });
//       });

//       setDistrictResults(Array.from(map.values()));
//     }

//     run();
//     return () => {
//       alive = false;
//     };
//   }, [districtOpen, isDubaiFlow, dQ]);

//   const filteredDistricts = useMemo(() => {
//     const q = (districtQuery || "").trim().toLowerCase();
//     if (!q) return districtResults;
//     return districtResults.filter((d) => (d.district_name || "").toLowerCase().includes(q));
//   }, [districtQuery, districtResults]);

//   const canAddTypedDistrict = useMemo(() => {
//     const dn = norm(districtQuery);
//     if (!dn) return false;
//     const exists = (districtResults || []).some((d) => norm(d.district_name).toLowerCase() === dn.toLowerCase());
//     return !exists;
//   }, [districtQuery, districtResults]);

//   useEffect(() => {
//     let alive = true;
//     async function run() {
//       if (!propertyOpen) return;

//       const districtForLookup =
//         selectedDistrict?.district_name
//           ? selectedDistrict
//           : typedDistrictName
//           ? { district_code: "", district_name: typedDistrictName }
//           : null;

//       if (!districtForLookup) return;

//       setPropertyLoading(true);
//       setError("");

//       let query = supabase
//         .from("district_properties")
//         .select("property_name")
//         .order("property_name", { ascending: true })
//         .range(0, 9999)
//         .not("property_name", "is", null)
//         .neq("property_name", "");

//       if (districtForLookup.district_code) query = query.eq("district_code", districtForLookup.district_code);
//       else query = query.eq("district_name", districtForLookup.district_name);

//       const { data, error: e } = await query;
//       if (!alive) return;

//       setPropertyLoading(false);

//       if (e) {
//         console.error(e);
//         setPropertyResults([]);
//         setError(e.message);
//         return;
//       }

//       const seen = new Set();
//       const rows = [];
//       (data || []).forEach((r) => {
//         const name = (r.property_name || "").trim();
//         if (!name) return;
//         if (seen.has(name)) return;
//         seen.add(name);
//         rows.push({ property_name: name });
//       });

//       setPropertyResults(rows);
//     }

//     run();
//     return () => {
//       alive = false;
//     };
//   }, [propertyOpen, selectedDistrict, typedDistrictName]);

//   const filteredProperties = useMemo(() => {
//     const q = (pQ || "").trim().toLowerCase();
//     if (!q) return propertyResults;
//     return propertyResults.filter((x) => (x.property_name || "").toLowerCase().includes(q));
//   }, [pQ, propertyResults]);

//   const canAddTypedProperty = useMemo(() => {
//     const pn = norm(propertyQuery);
//     if (!pn) return false;
//     const exists = (propertyResults || []).some((p) => norm(p.property_name).toLowerCase() === pn.toLowerCase());
//     return !exists;
//   }, [propertyQuery, propertyResults]);

//   const toggleAmenity = (a) => {
//     const cur = Array.isArray(form.amenities) ? form.amenities : [];
//     if (cur.includes(a)) update("amenities", cur.filter((x) => x !== a));
//     else update("amenities", [...cur, a]);
//   };

//   const filteredAmenities = useMemo(() => {
//     const q = (fQ || "").trim().toLowerCase();
//     if (!q) return AMENITY_OPTIONS;
//     return AMENITY_OPTIONS.filter((x) => x.toLowerCase().includes(q));
//   }, [fQ]);

//   // ---------- Submit ----------
//   const onNext = async () => {
//     setError("");

//     if (!isDubaiFlow) {
//       setError("Please select Country: United Arab Emirates and City: Dubai.");
//       return;
//     }

//     const finalDistrictName = norm(selectedDistrict?.district_name || districtQuery || form.district_name);
//     if (!finalDistrictName) {
//       setError("Please select a District.");
//       return;
//     }

//     const chosenProperty = norm(selectedProperty?.property_name || propertyQuery || form.property_name);
//     if (!chosenProperty) {
//       setError("Please select a Project / Property Reference (property).");
//       return;
//     }

//     if (!form.apartment_no?.trim()) {
//       setError("Please enter Apartment No.");
//       return;
//     }
//     if (!computedSqm || computedSqm <= 0) {
//       setError("Please enter Apartment Size (greater than 0).");
//       return;
//     }

//     try {
//       // ✅ must be logged-in already OR you can still insert AFTER OTP. We do AFTER OTP.
//       // So here we only store form + go to valucheck.
//       const ensuredDistrict = await ensureDistrictExists({
//         district_name: finalDistrictName,
//         district_code: selectedDistrict?.district_code || form.district_code || "",
//       });

//       await ensureDistrictPropertyExists({
//         district_code: ensuredDistrict.district_code,
//         district_name: ensuredDistrict.district_name,
//         property_name: chosenProperty,
//       });

//       const payload = {
//         ...form,
//         procedure_area: Number(computedSqm),
//         rooms_en: Number(form.bedrooms || 0),
//         district_code: ensuredDistrict?.district_code || "",
//         district_name: ensuredDistrict?.district_name || "",
//         property_name: chosenProperty,
//         area_name_en: ensuredDistrict?.district_name || "",
//         project_name_en: chosenProperty,
//         project_reference: chosenProperty,
//         building_name_en: form.building_name || "",
//       };

//       localStorage.setItem("truvalu_formData_v1", JSON.stringify(payload));
//       setFormData(payload);

//       // ✅ IMPORTANT: just go to valucheck (OTP)
//       navigate("/valucheck");
//     } catch (e) {
//       console.error(e);
//       setError(e?.message || "Could not save district/property to database (check RLS policies).");
//     }
//   };

//   const onReset = () => {
//     setError("");
//     resetDistrictAndProperty();
//     setFeatureSearch("");
//     setForm({
//       country: "United Arab Emirates",
//       city: "Dubai",
//       district_code: "",
//       district_name: "",
//       property_name: "",
//       area_name_en: "",
//       area_name_ar: "",
//       district_key: "",
//       building_name_en: "",
//       building_key: "",
//       project_name_en: "",
//       project_name_ar: "",
//       land_type_en: "",
//       land_type_ar: "",
//       address_search: "",
//       project_reference: "",
//       building_name: "",
//       title_deed_no: "",
//       title_deed_type: "Freehold",
//       plot_no: "",
//       is_project_valuation: false,
//       valuation_type: "Current Market Value",
//       property_category: "Residential",
//       purpose_of_valuation: "Buy & Sell",
//       property_status: "Owner Occupied",
//       apartment_no: "",
//       area_value: "",
//       area_unit: "sq.ft",
//       last_renovated_on: "",
//       floor_level: "",
//       furnishing: "Unfurnished",
//       bedrooms: "",
//       bathrooms: "",
//       property_type_en: "Apartment",
//       property_name_unit: "",
//       amenities: [],
//     });
//     localStorage.removeItem("truvalu_formData_v1");
//     localStorage.removeItem("truvalu_valuation_row_id");
//   };

//   return (
//     <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
//       <NavBar />

//       <main className="pt-28 pb-20 md:pt-36 md:pb-28">
//         <div className="max-w-5xl mx-auto px-6">
//           <div className="mb-10">
//             <div className="flex items-end justify-between mb-3">
//               <div>
//                 <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Property Details</h1>
//                 <p className="text-slate-500 mt-2">Please provide your property details for the valuation</p>
//               </div>
//               <div className="text-right">
//                 <span className="text-sm font-bold text-blue-600">Step 2 of 4</span>
//                 <div className="w-32 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
//                   <div className="w-1/2 h-full bg-blue-600" />
//                 </div>
//               </div>
//             </div>
//             <div className="h-px bg-slate-200 w-full" />
//           </div>

//           <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
//             <div className="p-8 md:p-12 space-y-10">
//               {error ? (
//                 <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
//                   {error}
//                 </div>
//               ) : null}

//               {/* Country / City / District */}
//               <section className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div>
//                     <Label>Country *</Label>
//                     <select
//                       className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       value={form.country}
//                       onChange={(e) => {
//                         const v = e.target.value;
//                         update("country", v);
//                         if (v === "United Arab Emirates") update("city", "Dubai");
//                         else update("city", "");
//                         resetDistrictAndProperty();
//                       }}
//                     >
//                       {COUNTRIES.map((c) => (
//                         <option key={c} value={c}>
//                           {c}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <Label>City *</Label>
//                     <select
//                       className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       value={form.city}
//                       onChange={(e) => {
//                         update("city", e.target.value);
//                         resetDistrictAndProperty();
//                       }}
//                       disabled={form.country !== "United Arab Emirates"}
//                     >
//                       {(form.country === "United Arab Emirates" ? UAE_CITIES : []).map((c) => (
//                         <option key={c} value={c}>
//                           {c}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div ref={districtBoxRef} className="relative">
//                     <Label>District *</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       placeholder={isDubaiFlow ? "Select district (or type to add)" : "Select UAE + Dubai first"}
//                       value={selectedDistrict ? selectedDistrict.district_name : districtQuery}
//                       disabled={!isDubaiFlow}
//                       onFocus={() => setDistrictOpen(true)}
//                       onChange={(e) => {
//                         const v = e.target.value;
//                         setDistrictQuery(v);
//                         setSelectedDistrict(null);

//                         setSelectedProperty(null);
//                         setPropertyQuery("");
//                         setPropertyResults([]);
//                         setPropertyOpen(false);

//                         update("district_code", "");
//                         update("district_name", v);
//                         update("area_name_en", v);
//                       }}
//                     />

//                     {districtOpen && isDubaiFlow && !selectedDistrict ? (
//                       <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
//                         <div className="p-3 border-b border-slate-100 bg-white sticky top-0 z-10">
//                           <div className="relative">
//                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
//                             <input
//                               className="w-full h-10 pl-9 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 text-sm font-semibold"
//                               placeholder="Search district..."
//                               value={districtQuery}
//                               onChange={(e) => {
//                                 const v = e.target.value;
//                                 setDistrictQuery(v);
//                                 setSelectedDistrict(null);

//                                 setSelectedProperty(null);
//                                 setPropertyQuery("");
//                                 setPropertyResults([]);
//                                 setPropertyOpen(false);

//                                 update("district_code", "");
//                                 update("district_name", v);
//                                 update("area_name_en", v);
//                               }}
//                               autoFocus
//                             />
//                             {districtQuery ? (
//                               <button
//                                 type="button"
//                                 className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500"
//                                 onClick={() => {
//                                   setDistrictQuery("");
//                                   update("district_name", "");
//                                   update("area_name_en", "");
//                                 }}
//                                 aria-label="clear district search"
//                               >
//                                 ✕
//                               </button>
//                             ) : null}

//                             {districtLoading ? <div className="mt-2 text-xs text-slate-400 font-semibold"></div> : null}

//                             {canAddTypedDistrict ? (
//                               <button
//                                 type="button"
//                                 className="mt-2 w-full text-left px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm font-extrabold hover:bg-blue-100"
//                                 onClick={() => {
//                                   const dn = norm(districtQuery);
//                                   if (!dn) return;

//                                   const d = { district_code: "", district_name: dn };
//                                   setSelectedDistrict(d);
//                                   setDistrictQuery(dn);
//                                   setDistrictOpen(false);

//                                   update("district_code", "");
//                                   update("district_name", dn);
//                                   update("area_name_en", dn);

//                                   setSelectedProperty(null);
//                                   setPropertyQuery("");
//                                   setPropertyResults([]);
//                                   setPropertyOpen(false);
//                                 }}
//                               >
//                                 + Use “{norm(districtQuery)}” (add new district)
//                               </button>
//                             ) : null}
//                           </div>
//                         </div>

//                         <div className="max-h-64 overflow-auto">
//                           {filteredDistricts.length === 0 && !districtLoading ? (
//                             <div className="px-4 py-3 text-sm text-slate-500">No districts found</div>
//                           ) : (
//                             filteredDistricts.map((d) => (
//                               <button
//                                 key={`${d.district_code}-${d.district_name}`}
//                                 type="button"
//                                 className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50"
//                                 onClick={() => {
//                                   setSelectedDistrict(d);
//                                   setDistrictQuery(d.district_name);
//                                   setDistrictOpen(false);

//                                   update("district_code", d.district_code || "");
//                                   update("district_name", d.district_name || "");
//                                   update("area_name_en", d.district_name || "");

//                                   setSelectedProperty(null);
//                                   setPropertyQuery("");
//                                   setPropertyResults([]);
//                                   setPropertyOpen(false);
//                                 }}
//                               >
//                                 {d.district_name}
//                               </button>
//                             ))
//                           )}
//                         </div>
//                       </div>
//                     ) : null}
//                   </div>
//                 </div>

//                 {/* Map placeholder */}
//                 <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-[360px] bg-slate-100">
//                   <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[70%] z-10">
//                     <div className="relative">
//                       <input
//                         className="w-full h-14 bg-white border-none shadow-2xl rounded-xl px-6 pr-12 text-sm font-medium focus:ring-2 focus:ring-blue-600"
//                         type="text"
//                         value={form.address_search || ""}
//                         onChange={(e) => update("address_search", e.target.value)}
//                         placeholder="Search address (optional)"
//                       />
//                       <button
//                         type="button"
//                         className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//                         onClick={() => update("address_search", "")}
//                         aria-label="clear"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   </div>

//                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                     <div className="text-5xl">📍</div>
//                   </div>

//                   <div className="absolute bottom-6 right-6 flex flex-col gap-2">
//                     <button type="button" className="w-10 h-10 bg-white rounded-lg shadow-lg font-bold">+</button>
//                     <button type="button" className="w-10 h-10 bg-white rounded-lg shadow-lg font-bold">−</button>
//                   </div>

//                   <div className="absolute bottom-6 left-6">
//                     <button type="button" className="px-4 py-2 bg-white rounded-lg shadow-lg text-xs font-bold text-slate-600">
//                       ⤢ ENLARGE MAP
//                     </button>
//                   </div>
//                 </div>
//               </section>

//               {/* Project/Property + Building + Title deed */}
//               <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
//                 <div className="space-y-6">
//                   <div ref={propertyBoxRef} className="relative">
//                     <Label>Project / Property Reference (Optional)</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       placeholder={typedDistrictName ? "Select property (or type to add)" : "Select district first"}
//                       value={selectedProperty ? selectedProperty.property_name : propertyQuery}
//                       disabled={!typedDistrictName}
//                       onFocus={() => setPropertyOpen(true)}
//                       onChange={(e) => {
//                         const v = e.target.value;
//                         setPropertyQuery(v);
//                         setSelectedProperty(null);

//                         update("property_name", v);
//                         update("project_reference", v);
//                         update("project_name_en", v);
//                       }}
//                     />

//                     {propertyOpen && typedDistrictName && !selectedProperty ? (
//                       <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
//                         <div className="p-3 border-b border-slate-100 bg-white sticky top-0 z-10">
//                           <div className="relative">
//                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
//                             <input
//                               className="w-full h-10 pl-9 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 text-sm font-semibold"
//                               placeholder="Search property..."
//                               value={propertyQuery}
//                               onChange={(e) => {
//                                 const v = e.target.value;
//                                 setPropertyQuery(v);
//                                 setSelectedProperty(null);

//                                 update("property_name", v);
//                                 update("project_reference", v);
//                                 update("project_name_en", v);
//                               }}
//                               autoFocus
//                             />
//                             {propertyQuery ? (
//                               <button
//                                 type="button"
//                                 className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500"
//                                 onClick={() => {
//                                   setPropertyQuery("");
//                                   update("property_name", "");
//                                   update("project_reference", "");
//                                   update("project_name_en", "");
//                                 }}
//                                 aria-label="clear property search"
//                               >
//                                 ✕
//                               </button>
//                             ) : null}

//                             {propertyLoading ? <div className="mt-2 text-xs text-slate-400 font-semibold"></div> : null}

//                             {canAddTypedProperty ? (
//                               <button
//                                 type="button"
//                                 className="mt-2 w-full text-left px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm font-extrabold hover:bg-blue-100"
//                                 onClick={() => {
//                                   const pn = norm(propertyQuery);
//                                   if (!pn) return;

//                                   const p = { property_name: pn };
//                                   setSelectedProperty(p);
//                                   setPropertyQuery(pn);
//                                   setPropertyOpen(false);

//                                   update("property_name", pn);
//                                   update("project_reference", pn);
//                                   update("project_name_en", pn);
//                                 }}
//                               >
//                                 + Use “{norm(propertyQuery)}” (add new property)
//                               </button>
//                             ) : null}
//                           </div>
//                         </div>

//                         <div className="max-h-64 overflow-auto">
//                           {filteredProperties.length === 0 && !propertyLoading ? (
//                             <div className="px-4 py-3 text-sm text-slate-500">No properties found</div>
//                           ) : (
//                             filteredProperties.map((p) => (
//                               <button
//                                 key={p.property_name}
//                                 type="button"
//                                 className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50"
//                                 onClick={() => {
//                                   setSelectedProperty(p);
//                                   setPropertyQuery(p.property_name);
//                                   setPropertyOpen(false);

//                                   update("property_name", p.property_name);
//                                   update("project_reference", p.property_name);
//                                   update("project_name_en", p.property_name);
//                                 }}
//                               >
//                                 {p.property_name}
//                               </button>
//                             ))
//                           )}
//                         </div>
//                       </div>
//                     ) : null}
//                   </div>

//                   <div>
//                     <Label>Title Deed No (Optional)</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       placeholder="Title Deed No"
//                       value={form.title_deed_no || ""}
//                       onChange={(e) => update("title_deed_no", e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-6">
//                   <div>
//                     <Label>Building Name (Optional)</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       placeholder="Building Name"
//                       value={form.building_name || ""}
//                       onChange={(e) => update("building_name", e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <Label>Title Deed Type *</Label>
//                     <div className="flex gap-3">
//                       {TITLE_DEED_TYPES.map((t) => (
//                         <ToggleBtn key={t} active={form.title_deed_type === t} onClick={() => update("title_deed_type", t)} label={t} />
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8">
//                   <div>
//                     <Label>Plot No (Optional)</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       placeholder="e.g. 1001"
//                       value={form.plot_no || ""}
//                       onChange={(e) => update("plot_no", e.target.value)}
//                     />
//                   </div>

//                   <div className="flex items-center gap-3 pt-6">
//                     <input
//                       className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
//                       type="checkbox"
//                       checked={!!form.is_project_valuation}
//                       onChange={(e) => update("is_project_valuation", e.target.checked)}
//                     />
//                     <span className="text-sm font-semibold text-slate-700">Is Project Valuation?</span>
//                   </div>
//                 </div>
//               </section>

//               {/* Valuation type + category + purpose */}
//               <section className="space-y-8 pt-6 border-t border-slate-100">
//                 <div>
//                   <Label>Valuation Type Selection *</Label>
//                   <div className="flex flex-wrap md:flex-nowrap gap-3">
//                     {VALUATION_TYPES.map((x) => (
//                       <ToggleBtn key={x} active={form.valuation_type === x} onClick={() => update("valuation_type", x)} label={x} wide />
//                     ))}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                   <div>
//                     <Label>Property Category *</Label>
//                     <div className="flex gap-3">
//                       {PROPERTY_CATEGORIES.map((x) => (
//                         <ToggleBtn key={x} active={form.property_category === x} onClick={() => update("property_category", x)} label={x} />
//                       ))}
//                     </div>
//                   </div>

//                   <div>
//                     <Label>Purpose of Valuation *</Label>
//                     <select
//                       className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       value={form.purpose_of_valuation}
//                       onChange={(e) => update("purpose_of_valuation", e.target.value)}
//                     >
//                       {PURPOSE_OF_VALUATION.map((x) => (
//                         <option key={x} value={x}>{x}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </section>

//               {/* Status + apartment details */}
//               <section className="space-y-8 pt-6 border-t border-slate-100">
//                 <div>
//                   <Label>Property Current Status *</Label>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                     {PROPERTY_STATUS.map((x) => (
//                       <ToggleBtn key={x} active={form.property_status === x} onClick={() => update("property_status", x)} label={x} />
//                     ))}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                   <div>
//                     <Label>Apartment No *</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       placeholder="Enter Apartment No e.g. K-098"
//                       value={form.apartment_no || ""}
//                       onChange={(e) => update("apartment_no", e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <Label>Apartment Size *</Label>
//                     <div className="relative flex">
//                       <input
//                         className="w-full h-12 bg-slate-50 border border-slate-200 rounded-l-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium"
//                         placeholder="Enter Size e.g. 9000"
//                         type="number"
//                         value={form.area_value}
//                         onChange={(e) => update("area_value", e.target.value)}
//                       />
//                       <select
//                         className="h-12 bg-slate-100 border border-l-0 border-slate-200 rounded-r-xl px-4 text-sm font-bold focus:ring-0"
//                         value={form.area_unit}
//                         onChange={(e) => update("area_unit", e.target.value)}
//                       >
//                         <option value="sq.ft">Sq Feet</option>
//                         <option value="sq.m">Sq Meters</option>
//                       </select>
//                     </div>
//                     <p className="text-[10px] text-slate-400 mt-1.5 ml-1">This field accepts only English numbers.</p>
//                   </div>

//                   <div>
//                     <Label>Last Renovated On</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       type="date"
//                       value={form.last_renovated_on || ""}
//                       onChange={(e) => update("last_renovated_on", e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <Label>Floor / Level</Label>
//                     <select
//                       className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       value={form.floor_level || ""}
//                       onChange={(e) => update("floor_level", e.target.value)}
//                     >
//                       <option value="" disabled>Select Floor / Level</option>
//                       {FLOOR_LEVELS.map((x) => (
//                         <option key={x} value={x}>{x}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <Label>Furnishing Type *</Label>
//                   <div className="grid grid-cols-3 gap-3">
//                     {FURNISHING_TYPES.map((x) => (
//                       <ToggleBtn key={x} active={form.furnishing === x} onClick={() => update("furnishing", x)} label={x} />
//                     ))}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                   <div>
//                     <Label>Bedroom *</Label>
//                     <select
//                       className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       value={String(form.bedrooms || "")}
//                       onChange={(e) => update("bedrooms", e.target.value)}
//                     >
//                       <option value="" disabled>Select No. Of Bedroom</option>
//                       {BEDROOMS.map((x) => (
//                         <option key={x} value={x}>{x}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <Label>Bathroom *</Label>
//                     <select
//                       className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       value={String(form.bathrooms || "")}
//                       onChange={(e) => update("bathrooms", e.target.value)}
//                     >
//                       <option value="" disabled>Select No. Of Bathroom</option>
//                       {BATHROOMS.map((x) => (
//                         <option key={x} value={x}>{x}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                   <div>
//                     <Label>Property Type</Label>
//                     <select
//                       className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       value={form.property_type_en}
//                       onChange={(e) => update("property_type_en", e.target.value)}
//                     >
//                       {PROPERTY_TYPES.map((x) => (
//                         <option key={x} value={x}>{x}</option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <Label>Unit (Optional)</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       placeholder="e.g. Unit 1502"
//                       value={form.property_name_unit || ""}
//                       onChange={(e) => update("property_name_unit", e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </section>

//               {/* Features */}
//               <section className="space-y-4 pt-6 border-t border-slate-100">
//                 <Label>Select Features</Label>

//                 <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/30">
//                   <button
//                     type="button"
//                     className="w-full p-6 border-b border-slate-100 flex justify-between items-center"
//                     onClick={() => setFeaturesOpen((s) => !s)}
//                   >
//                     <span className="text-slate-500 font-medium">Select Features</span>
//                     <span className="text-slate-400">{featuresOpen ? "▴" : "▾"}</span>
//                   </button>

//                   {featuresOpen && (
//                     <div className="p-6 space-y-6">
//                       <div className="relative">
//                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
//                         <input
//                           className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600"
//                           placeholder="Search features..."
//                           value={featureSearch}
//                           onChange={(e) => setFeatureSearch(e.target.value)}
//                         />
//                       </div>

//                       <div className="flex flex-wrap gap-2 max-h-52 overflow-auto pr-1">
//                         {filteredAmenities.map((a) => {
//                           const on = (form.amenities || []).includes(a);
//                           return (
//                             <button
//                               key={a}
//                               type="button"
//                               onClick={() => toggleAmenity(a)}
//                               className={
//                                 on
//                                   ? "px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg text-xs font-semibold"
//                                   : "px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:border-blue-600"
//                               }
//                             >
//                               {a}
//                             </button>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </section>

//               {/* Actions */}
//               <div className="pt-8 flex flex-col md:flex-row gap-4">
//                 <button
//                   type="button"
//                   onClick={onNext}
//                   className="flex-1 h-16 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
//                 >
//                   ⚡ Get Free Valuation
//                 </button>

//                 <button
//                   type="button"
//                   onClick={onReset}
//                   className="px-10 h-16 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold transition-all hover:bg-slate-50"
//                 >
//                   Reset
//                 </button>
//               </div>
//             </div>
//           </div>

//           <p className="text-center mt-8 text-xs text-slate-400 font-medium">
//             Instant report powered by real-time DLD transaction data & neural intelligence.
//           </p>
//         </div>
//       </main>

//       <footer className="bg-white border-t border-slate-200">
//         <div className="max-w-5xl mx-auto px-6 py-10">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
//             <div>
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold">
//                   A
//                 </div>
//                 <span className="text-lg font-extrabold">ACQAR</span>
//               </div>
//               <p className="text-sm text-slate-500 mt-4">AI-powered real estate valuations aligned with UAE DLD data.</p>
//             </div>

//             <div>
//               <p className="text-xs font-bold text-slate-400 mb-3">Product</p>
//               <ul className="text-sm text-slate-600 space-y-2">
//                 <li>Dashboard</li>
//                 <li>Valuation</li>
//               </ul>
//             </div>

//             <div>
//               <p className="text-xs font-bold text-slate-400 mb-3">Company</p>
//               <ul className="text-sm text-slate-600 space-y-2">
//                 <li>About</li>
//                 <li>Contact</li>
//               </ul>
//             </div>

//             <div>
//               <p className="text-xs font-bold text-slate-400 mb-3">Legal</p>
//               <ul className="text-sm text-slate-600 space-y-2">
//                 <li>Privacy</li>
//                 <li>Terms</li>
//               </ul>
//             </div>
//           </div>

//           <div className="mt-10 pt-6 border-t text-xs text-slate-400 flex justify-between">
//             <span>© {new Date().getFullYear()} ACQAR TECHNOLOGIES</span>
//             <span>Made in UAE 🇦🇪</span>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// // ---------- Small UI helpers ----------
// function Label({ children }) {
//   return <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">{children}</label>;
// }

// function ToggleBtn({ label, active, onClick }) {
//   const base = "py-3 text-sm font-bold rounded-xl border-2 transition-all text-center cursor-pointer select-none";
//   const act = "border-slate-900 bg-slate-900 text-white";
//   const inact = "border-slate-100 bg-white text-slate-400 hover:border-slate-200";
//   return (
//     <button type="button" onClick={onClick} className={[base, "flex-1", active ? act : inact].join(" ")}>
//       {label}
//     </button>
//   );
// }


// // src/pages/ValuationForm.jsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import NavBar from "../components/NavBar";
// import { supabase } from "../lib/supabase";

// // ---------- Helpers ----------
// function toSqm(areaVal, unit) {
//   const v = Number(areaVal || 0);
//   if (!v) return 0;
//   if (unit === "sq.ft") return v * 0.092903;
//   return v;
// }
// function useDebounced(value, delay = 250) {
//   const [v, setV] = useState(value);
//   useEffect(() => {
//     const t = setTimeout(() => setV(value), delay);
//     return () => clearTimeout(t);
//   }, [value, delay]);
//   return v;
// }
// function escapeForILike(s) {
//   return (s || "").replace(/[%_\\]/g, (m) => `\\${m}`);
// }

// // ---------- NEW: DB helper utils (ADDED ONLY) ----------
// function norm(s) {
//   return (s || "").trim().replace(/\s+/g, " ");
// }
// function genDistrictCode() {
//   const a = Date.now().toString(36);
//   const b = Math.random().toString(36).slice(2, 6).toUpperCase();
//   return `D-${a}-${b}`;
// }

// // Ensure district row exists in `districts` table.
// async function ensureDistrictExists({ district_name, district_code }) {
//   const dn = norm(district_name);
//   if (!dn) return { district_code: "", district_name: "" };

//   const { data: found, error: findErr } = await supabase
//     .from("districts")
//     .select("id, district_code, district_name")
//     .ilike("district_name", dn)
//     .limit(1);

//   if (findErr) throw findErr;

//   if (found && found.length > 0) {
//     const row = found[0];
//     return {
//       district_code: norm(row.district_code),
//       district_name: norm(row.district_name) || dn,
//     };
//   }

//   const newCode = norm(district_code) || genDistrictCode();

//   const { data: inserted, error: insErr } = await supabase
//     .from("districts")
//     .insert([{ district_code: newCode, district_name: dn }])
//     .select("district_code, district_name")
//     .single();

//   if (insErr) throw insErr;

//   return {
//     district_code: norm(inserted?.district_code) || newCode,
//     district_name: norm(inserted?.district_name) || dn,
//   };
// }

// // Ensure mapping exists in `district_properties` table.
// async function ensureDistrictPropertyExists({ district_code, district_name, property_name }) {
//   const dc = norm(district_code);
//   const dn = norm(district_name);
//   const pn = norm(property_name);
//   if (!dc || !dn || !pn) return;

//   const { data: found, error: findErr } = await supabase
//     .from("district_properties")
//     .select("id")
//     .eq("district_code", dc)
//     .ilike("property_name", pn)
//     .limit(1);

//   if (findErr) throw findErr;
//   if (found && found.length > 0) return;

//   const { error: insErr } = await supabase
//     .from("district_properties")
//     .insert([{ district_code: dc, district_name: dn, property_name: pn }]);

//   if (insErr) throw insErr;
// }

// // ✅ insert valuation snapshot (store ID for Report update)
// async function insertValuationRow(row) {
//   const { data, error } = await supabase.from("valuations").insert([row]).select("id").single();
//   if (error) throw error;
//   return data?.id;
// }

// // ✅ safe JSON parse (kept)
// function safeParse(json) {
//   try {
//     return JSON.parse(json);
//   } catch {
//     return null;
//   }
// }

// // ✅ create small deterministic signature for report cache
// function stableStringify(obj) {
//   const seen = new WeakSet();
//   return JSON.stringify(obj, function (k, v) {
//     if (v && typeof v === "object") {
//       if (seen.has(v)) return;
//       seen.add(v);
//       if (Array.isArray(v)) return v;
//       return Object.keys(v)
//         .sort()
//         .reduce((acc, key) => {
//           acc[key] = v[key];
//           return acc;
//         }, {});
//     }
//     return v;
//   });
// }
// function hashLike(str) {
//   let h = 0;
//   for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
//   return String(h);
// }

// // ---------- Constants ----------
// const COUNTRIES = [
//   "United Arab Emirates",
//   "Kingdom of Saudi Arabia",
//   "Kingdom of Bahrain",
//   "Qatar",
//   "Oman",
//   "Kuwait",
// ];

// const UAE_CITIES = [
//   "Dubai",
//   "Abu Dhabi",
//   "Sharjah",
//   "Umm Al Quwain",
//   "Fujairah",
//   "Ajman",
//   "Ras Al Khaimah",
//   "Kalba",
//   "Khor Fakkan",
//   "Al Ain",
// ];

// const PROPERTY_CATEGORIES = ["Residential"];
// const PROPERTY_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse", "Office", "Retail"];

// const AMENITY_OPTIONS = [
//   "24 Hour Security",
//   "24 Hours Concierge",
//   "ATM Facility",
//   "Balcony or Terrace",
//   "Barbeque Area",
//   "Basketball Court",
//   "Beach Access",
//   "Beach View",
//   "Broadband Internet",
//   "Built-in Closet",
//   "Built-in Kitchen Appliances",
//   "Built-in Wardrobes",
//   "Business Centre",
//   "Canal View",
//   "CCTV Security",
//   "Central Heating",
//   "Centrally Air-Conditioned",
//   "Children's Pool",
//   "City View",
//   "Cleaning Services",
//   "Clinic",
//   "Community pool",
//   "Community View",
//   "Conference Room",
//   "Courtyard view",
//   "Covered Parking",
//   "Cycling Tracks",
//   "Day Care Center",
//   "Double Glazed Windows",
//   "Easy Access to Parking",
//   "Electricity Backup",
//   "Elevator",
//   "Exclusive beach access",
//   "Facilities for Disabled",
//   "First Aid Medical Center",
//   "Fitness center",
//   "Football Pitches",
//   "Games Room",
//   "Golf",
//   "Golf Course View",
//   "Gym or Health Club",
//   "Gymnasium",
//   "Health & Beauty Salon",
//   "Health Centre",
//   "High-Rise views",
//   "High-speed elevator",
//   "Housekeeping",
//   "Indoor Gardens",
//   "Indoor Pool",
//   "Intercom",
//   "Jacuzzi",
//   "Jogging Track",
//   "Kid's Play Area",
//   "Kitchen Appliances",
//   "Lake View",
//   "Landmark view",
//   "Landscaping",
//   "Laundry Facility",
//   "Laundry Room",
//   "Lawn or Garden",
//   "Lobby",
//   "Lounge Area",
//   "Maid Service",
//   "Maids Room",
//   "Maintenance Staff",
//   "Mall",
//   "Mini-Market",
//   "Nursery",
//   "Outdoor Pool",
//   "Pantry",
//   "Park",
//   "Park Views",
//   "Parking",
//   "Pets Allowed",
//   "Pool View",
//   "Prayer Room",
//   "Private Garden",
//   "Private Jacuzzi",
//   "Private Parking",
//   "Private Pool",
//   "Public Pool",
//   "Reception/Waiting Room",
//   "Recording studio",
//   "Restaurants",
//   "Retail",
//   "Road View",
//   "Satellite/Cable TV",
//   "Sauna",
//   "Sea Views",
//   "Security",
//   "Shaded Garage",
//   "Shared Gym",
//   "Shared Jacuzzi",
//   "Shared Pool",
//   "Skating Park",
//   "Social Club",
//   "Solar Heating or Electrical",
//   "Spa",
//   "Sports Facilities",
//   "Steam Room",
//   "Storage Areas",
//   "Study Room",
//   "Supermarket",
//   "Swimming Pool",
//   "Tennis Court",
//   "Theater",
//   "Underground Parking",
//   "Vastu-compliant",
//   "Walk-in Closet",
//   "Waste Disposal",
//   "Water View",
//   "Wellness club",
//   "Yoga Studio",
// ];

// const TITLE_DEED_TYPES = ["Leasehold", "Freehold", "Musataha"];
// const VALUATION_TYPES = ["Current Market Value", "Historical Property Value", "Verify Previous Valuation"];
// const PURPOSE_OF_VALUATION = ["Buy & Sell", "Mortgage", "Investment", "Tax", "Legal", "Other"];
// const PROPERTY_STATUS = ["Owner Occupied", "Leased", "Vacant", "Under Construction"];
// const FURNISHING_TYPES = ["Furnished", "Unfurnished", "SemiFurnished"];
// const BEDROOMS = ["0", "1", "2", "3", "4", "5", "6", "7+"];
// const BATHROOMS = ["1", "2", "3", "4", "5", "6+"];
// const FLOOR_LEVELS = ["Basement", "Ground", "Mezzanine", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

// // ✅ localStorage keys
// const LS_FORM_KEY = "truvalu_formData_v1";
// const LS_VAL_ROW_ID = "truvalu_valuation_row_id";
// const LS_REPORT_KEY = "truvalu_reportData_v1";
// const LS_REPORT_META = "truvalu_report_meta_v1"; // { formHash }
// const LS_PENDING_INSERT = "truvalu_pending_valuation_insert_v1"; // optional fallback

// const HIDE_MAP_UI = true; // set false if you want it back


// // ✅ NEW: default form (used to clear UI after success)
// const DEFAULT_FORM = {
//   country: "United Arab Emirates",
//   city: "Dubai",

//   district_code: "",
//   district_name: "",
//   property_name: "",

//   // legacy keys (keep)
//   area_name_en: "",
//   area_name_ar: "",
//   district_key: "",
//   building_name_en: "",
//   building_key: "",
//   project_name_en: "",
//   project_name_ar: "",
//   land_type_en: "",
//   land_type_ar: "",

//   // address_search: "At Silicon Oasis Entrance, Near DSOA - HQ - دبي",
//   project_reference: "",
//   building_name: "",
//   title_deed_no: "",
//   title_deed_type: "Freehold",
//   plot_no: "1001",
//   is_project_valuation: false,

//   valuation_type: "Current Market Value",
//   property_category: "Residential",
//   purpose_of_valuation: "Buy & Sell",
//   property_status: "Leased",

//   apartment_no: "",
//   area_value: "",
//   area_unit: "sq.ft",

//   last_renovated_on: "",
//   floor_level: "",

//   furnishing: "SemiFurnished",
//   bedrooms: "",
//   bathrooms: "",

//   property_type_en: "Apartment",
//   property_name_unit: "",

//   amenities: [],
// };

// // ✅ requirement #1: graph hidden (code present, UI hidden)
// const HIDE_GRAPHS_BUT_KEEP_CODE = true;

// // ---------- Component ----------
// export default function ValuationForm({ formData, setFormData }) {
//   const navigate = useNavigate();
//   const [error, setError] = useState("");

//   // ✅ auth state to drive routing + hide header
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [sessionUser, setSessionUser] = useState(null);

//   useEffect(() => {
//     let mounted = true;

//     async function boot() {
//       const { data } = await supabase.auth.getSession();
//       const sess = data?.session || null;
//       if (!mounted) return;
//       setIsLoggedIn(!!sess);
//       setSessionUser(sess?.user || null);
//     }

//     boot();

//     const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
//       setIsLoggedIn(!!sess);
//       setSessionUser(sess?.user || null);
//     });

//     return () => {
//       mounted = false;
//       sub?.subscription?.unsubscribe?.();
//     };
//   }, []);

//   // ✅ CHANGED: use DEFAULT_FORM so we can clear UI after success
//   const [form, setForm] = useState(formData || DEFAULT_FORM);

//   const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

//   const isDubaiFlow = form.country === "United Arab Emirates" && form.city === "Dubai";

//   // -------- Districts --------
//   const [districtOpen, setDistrictOpen] = useState(false);
//   const districtBoxRef = useRef(null);
//   const [districtQuery, setDistrictQuery] = useState("");
//   const dQ = useDebounced(districtQuery, 250);
//   const [districtLoading, setDistrictLoading] = useState(false);
//   const [districtResults, setDistrictResults] = useState([]);
//   const [selectedDistrict, setSelectedDistrict] = useState(null);

//   // -------- Properties --------
//   const [propertyOpen, setPropertyOpen] = useState(false);
//   const propertyBoxRef = useRef(null);
//   const [propertyQuery, setPropertyQuery] = useState("");
//   const pQ = useDebounced(propertyQuery, 150);
//   const [propertyLoading, setPropertyLoading] = useState(false);
//   const [propertyResults, setPropertyResults] = useState([]);
//   const [selectedProperty, setSelectedProperty] = useState(null);

//   // -------- Amenities --------
//   const [featuresOpen, setFeaturesOpen] = useState(true);
//   const [featureSearch, setFeatureSearch] = useState("");
//   const fQ = useDebounced(featureSearch, 200);

//   const computedSqm = useMemo(() => toSqm(form.area_value, form.area_unit), [form.area_value, form.area_unit]);

//   const typedDistrictName = norm(selectedDistrict?.district_name || districtQuery || form.district_name);

//   const resetDistrictAndProperty = () => {
//     setSelectedDistrict(null);
//     setDistrictQuery("");
//     setDistrictResults([]);
//     setDistrictOpen(false);

//     setSelectedProperty(null);
//     setPropertyQuery("");
//     setPropertyResults([]);
//     setPropertyOpen(false);

//     update("district_code", "");
//     update("district_name", "");
//     update("property_name", "");

//     update("area_name_en", "");
//     update("project_name_en", "");
//     update("project_reference", "");
//   };

//   // ✅ NEW: clear UI after successful valuation (does NOT delete localStorage / report)
//   function clearUiAfterSuccessfulValuation() {
//     // close dropdowns and clear search
//     setSelectedDistrict(null);
//     setDistrictQuery("");
//     setDistrictResults([]);
//     setDistrictOpen(false);

//     setSelectedProperty(null);
//     setPropertyQuery("");
//     setPropertyResults([]);
//     setPropertyOpen(false);

//     setFeaturesOpen(true);
//     setFeatureSearch("");

//     // clear form UI
//     setForm(DEFAULT_FORM);

//     // stop parent state from refilling the form
//     setFormData?.(null);
//   }

//   useEffect(() => {
//     function onDown(e) {
//       if (districtBoxRef.current && !districtBoxRef.current.contains(e.target)) setDistrictOpen(false);
//       if (propertyBoxRef.current && !propertyBoxRef.current.contains(e.target)) setPropertyOpen(false);
//     }
//     document.addEventListener("mousedown", onDown);
//     return () => document.removeEventListener("mousedown", onDown);
//   }, []);

//   useEffect(() => {
//     let alive = true;
//     async function run() {
//       if (!districtOpen) return;
//       if (!isDubaiFlow) return;

//       setDistrictLoading(true);
//       setError("");

//       const q = (dQ || "").trim();
//       let query = supabase
//         .from("districts")
//         .select("district_code, district_name")
//         .order("district_name", { ascending: true })
//         .range(0, 9999);

//       if (q.length >= 2) {
//         const safe = escapeForILike(q);
//         query = query.ilike("district_name", `%${safe}%`);
//       }

//       const { data, error: e } = await query;
//       if (!alive) return;

//       setDistrictLoading(false);

//       if (e) {
//         console.error(e);
//         setDistrictResults([]);
//         setError(e.message);
//         return;
//       }

//       const map = new Map();
//       (data || []).forEach((r) => {
//         const code = (r.district_code || "").trim();
//         const name = (r.district_name || "").trim();
//         if (!name) return;
//         const key = `${code}__${name}`;
//         if (!map.has(key)) map.set(key, { district_code: code, district_name: name });
//       });

//       setDistrictResults(Array.from(map.values()));
//     }

//     run();
//     return () => {
//       alive = false;
//     };
//   }, [districtOpen, isDubaiFlow, dQ]);

//   const filteredDistricts = useMemo(() => {
//     const q = (districtQuery || "").trim().toLowerCase();
//     if (!q) return districtResults;
//     return districtResults.filter((d) => (d.district_name || "").toLowerCase().includes(q));
//   }, [districtQuery, districtResults]);

//   const canAddTypedDistrict = useMemo(() => {
//     const dn = norm(districtQuery);
//     if (!dn) return false;
//     const exists = (districtResults || []).some((d) => norm(d.district_name).toLowerCase() === dn.toLowerCase());
//     return !exists;
//   }, [districtQuery, districtResults]);

//   useEffect(() => {
//     let alive = true;
//     async function run() {
//       if (!propertyOpen) return;

//       const districtForLookup =
//         selectedDistrict?.district_name
//           ? selectedDistrict
//           : typedDistrictName
//           ? { district_code: "", district_name: typedDistrictName }
//           : null;

//       if (!districtForLookup) return;

//       setPropertyLoading(true);
//       setError("");

//       let query = supabase
//         .from("district_properties")
//         .select("property_name")
//         .order("property_name", { ascending: true })
//         .range(0, 9999)
//         .not("property_name", "is", null)
//         .neq("property_name", "");

//       if (districtForLookup.district_code) query = query.eq("district_code", districtForLookup.district_code);
//       else query = query.eq("district_name", districtForLookup.district_name);

//       const { data, error: e } = await query;
//       if (!alive) return;

//       setPropertyLoading(false);

//       if (e) {
//         console.error(e);
//         setPropertyResults([]);
//         setError(e.message);
//         return;
//       }

//       const seen = new Set();
//       const rows = [];
//       (data || []).forEach((r) => {
//         const name = (r.property_name || "").trim();
//         if (!name) return;
//         if (seen.has(name)) return;
//         seen.add(name);
//         rows.push({ property_name: name });
//       });

//       setPropertyResults(rows);
//     }

//     run();
//     return () => {
//       alive = false;
//     };
//   }, [propertyOpen, selectedDistrict, typedDistrictName]);

//   const filteredProperties = useMemo(() => {
//     const q = (pQ || "").trim().toLowerCase();
//     if (!q) return propertyResults;
//     return propertyResults.filter((x) => (x.property_name || "").toLowerCase().includes(q));
//   }, [pQ, propertyResults]);

//   const canAddTypedProperty = useMemo(() => {
//     const pn = norm(propertyQuery);
//     if (!pn) return false;
//     const exists = (propertyResults || []).some((p) => norm(p.property_name).toLowerCase() === pn.toLowerCase());
//     return !exists;
//   }, [propertyQuery, propertyResults]);

//   const toggleAmenity = (a) => {
//     const cur = Array.isArray(form.amenities) ? form.amenities : [];
//     if (cur.includes(a)) update("amenities", cur.filter((x) => x !== a));
//     else update("amenities", [...cur, a]);
//   };

//   const filteredAmenities = useMemo(() => {
//     const q = (fQ || "").trim().toLowerCase();
//     if (!q) return AMENITY_OPTIONS;
//     return AMENITY_OPTIONS.filter((x) => x.toLowerCase().includes(q));
//   }, [fQ]);

//   // ---------- Submit ----------
//   const onNext = async () => {
//     setError("");

//     if (!isDubaiFlow) {
//       setError("Please select Country: United Arab Emirates and City: Dubai.");
//       return;
//     }

//     const finalDistrictName = norm(selectedDistrict?.district_name || districtQuery || form.district_name);
//     if (!finalDistrictName) {
//       setError("Please select a District.");
//       return;
//     }

//     const chosenProperty = norm(selectedProperty?.property_name || propertyQuery || form.property_name);
//     if (!chosenProperty) {
//       setError("Please select a Project / Property Reference (property).");
//       return;
//     }

//     if (!form.apartment_no?.trim()) {
//       setError("Please enter Apartment No.");
//       return;
//     }
//     if (!computedSqm || computedSqm <= 0) {
//       setError("Please enter Apartment Size (greater than 0).");
//       return;
//     }

//     try {
//       const ensuredDistrict = await ensureDistrictExists({
//         district_name: finalDistrictName,
//         district_code: selectedDistrict?.district_code || form.district_code || "",
//       });

//       await ensureDistrictPropertyExists({
//         district_code: ensuredDistrict.district_code,
//         district_name: ensuredDistrict.district_name,
//         property_name: chosenProperty,
//       });

//       const payload = {
//         ...form,
//         procedure_area: Number(computedSqm),
//         rooms_en: Number(form.bedrooms || 0),
//         district_code: ensuredDistrict?.district_code || "",
//         district_name: ensuredDistrict?.district_name || "",
//         property_name: chosenProperty,
//         area_name_en: ensuredDistrict?.district_name || "",
//         project_name_en: chosenProperty,
//         project_reference: chosenProperty,
//         building_name_en: form.building_name || "",
//       };

//       // ✅ store form for Report + cache matching
//       localStorage.setItem(LS_FORM_KEY, JSON.stringify(payload));
//       setFormData(payload);

//       const formHash = hashLike(stableStringify(payload));
//       localStorage.setItem(LS_REPORT_META, JSON.stringify({ formHash }));
//       // keep LS_REPORT_KEY (do NOT remove)

//       // ✅ create a valuations row NOW (if allowed)
//       const userId = sessionUser?.id || null;
//       const nameGuess =
//         (sessionUser?.user_metadata?.name ||
//           sessionUser?.user_metadata?.full_name ||
//           sessionUser?.email?.split("@")?.[0] ||
//           "") || null;

//       const row = {
//         user_id: userId,
//         name: nameGuess,
//         district: payload.district_name || "",
//         property_name: payload.property_name || "",
//         building_name: payload.building_name || "",
//         title_deed_no: payload.title_deed_no || "",
//         title_deed_type: payload.title_deed_type || "",
//         plot_no: payload.plot_no || "",

//         valuation_type: payload.valuation_type || "",
//         valuation_type_selection: payload.valuation_type || "",
//         property_category: payload.property_category || "",
//         purpose_of_valuation: payload.purpose_of_valuation || "",
//         property_current_status: payload.property_status || "",

//         apartment_no: payload.apartment_no || "",
//         apartment_size: payload.area_value || "",
//         apartment_size_unit: payload.area_unit || "",
//         last_renovated_on: payload.last_renovated_on || null,
//         floor_level: payload.floor_level || "",

//         furnishing_type: payload.furnishing || "",
//         bedroom: payload.bedrooms || "",
//         bathroom: payload.bathrooms || "",
//         property_type: payload.property_type_en || "",
//         unit: payload.property_name_unit || "",

//         features: Array.isArray(payload.amenities) ? payload.amenities : [],
//         form_payload: payload,
//         updated_at: new Date().toISOString(),
//       };

//       try {
//         const valuationRowId = await insertValuationRow(row);
//         if (valuationRowId) localStorage.setItem(LS_VAL_ROW_ID, String(valuationRowId));
//       } catch (dbErr) {
//         console.warn("Valuations insert blocked (likely RLS). Keeping flow:", dbErr?.message);
//         localStorage.removeItem(LS_VAL_ROW_ID);
//         localStorage.setItem(LS_PENDING_INSERT, JSON.stringify(row));
//       }

//       // ✅ NEW: clear UI values so next valuation starts fresh (while keeping saved data for report)
//       clearUiAfterSuccessfulValuation();

//       // ✅ keep routing exactly as before
//       if (isLoggedIn) {
//         navigate("/report");
//       } else {
//         navigate("/valucheck");
//       }
//     } catch (e) {
//       console.error(e);
//       setError(e?.message || "Could not save district/property to database (check RLS policies).");
//     }
//   };

//   const onReset = () => {
//     setError("");
//     resetDistrictAndProperty();
//     setFeatureSearch("");
//     setForm({
//       ...DEFAULT_FORM,
//       // if you want Reset to differ from DEFAULT_FORM, keep your old choices here:
//       address_search: "",
//       plot_no: "",
//       property_status: "Owner Occupied",
//       furnishing: "Unfurnished",
//     });

//     localStorage.removeItem(LS_FORM_KEY);
//     localStorage.removeItem(LS_VAL_ROW_ID);
//     localStorage.removeItem(LS_PENDING_INSERT);
//     // keep LS_REPORT_KEY (your requirement says keep previous done reports)
//   };

//   return (
//     <div className="bg-slate-50 text-slate-900 font-sans min-h-screen">
//       {/* ✅ hide header when logged in */}
//       {!isLoggedIn ? <NavBar /> : null}

//       <main className="pt-28 pb-20 md:pt-36 md:pb-28">
//         <div className="max-w-5xl mx-auto px-6">
//           <div className="mb-10">
//             <div className="flex items-end justify-between mb-3">
//               <div>
//                 <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Property Details</h1>
//                 <p className="text-slate-500 mt-2">Please provide your property details for the valuation</p>
//               </div>
//               <div className="text-right">
//                 <span className="text-sm font-bold text-blue-600">Step 2 of 4</span>
//                 <div className="w-32 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
//                   <div className="w-1/2 h-full bg-blue-600" />
//                 </div>
//               </div>
//             </div>
//             <div className="h-px bg-slate-200 w-full" />
//           </div>

//           <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden">
//             <div className="p-8 md:p-12 space-y-10">
//               {error ? (
//                 <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-semibold">
//                   {error}
//                 </div>
//               ) : null}

              

//               {/* Country / City / District */}
//               <section className="space-y-6">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                   <div>
//                     <Label>Country *</Label>
//                     <select
//                       className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       value={form.country}
//                       onChange={(e) => {
//                         const v = e.target.value;
//                         update("country", v);
//                         if (v === "United Arab Emirates") update("city", "Dubai");
//                         else update("city", "");
//                         resetDistrictAndProperty();
//                       }}
//                     >
//                       {COUNTRIES.map((c) => (
//                         <option key={c} value={c}>
//                           {c}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <Label>City *</Label>
//                     <select
//                       className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       value={form.city}
//                       onChange={(e) => {
//                         update("city", e.target.value);
//                         resetDistrictAndProperty();
//                       }}
//                       disabled={form.country !== "United Arab Emirates"}
//                     >
//                       {(form.country === "United Arab Emirates" ? UAE_CITIES : []).map((c) => (
//                         <option key={c} value={c}>
//                           {c}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div ref={districtBoxRef} className="relative">
//                     <Label>District *</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       placeholder={isDubaiFlow ? "Select district (or type to add)" : "Select UAE + Dubai first"}
//                       value={selectedDistrict ? selectedDistrict.district_name : districtQuery}
//                       disabled={!isDubaiFlow}
//                       onFocus={() => setDistrictOpen(true)}
//                       onChange={(e) => {
//                         const v = e.target.value;
//                         setDistrictQuery(v);
//                         setSelectedDistrict(null);

//                         setSelectedProperty(null);
//                         setPropertyQuery("");
//                         setPropertyResults([]);
//                         setPropertyOpen(false);

//                         update("district_code", "");
//                         update("district_name", v);
//                         update("area_name_en", v);
//                       }}
//                     />

//                     {districtOpen && isDubaiFlow && !selectedDistrict ? (
//                       <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
//                         <div className="p-3 border-b border-slate-100 bg-white sticky top-0 z-10">
//                           <div className="relative">
//                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
//                             <input
//                               className="w-full h-10 pl-9 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 text-sm font-semibold"
//                               placeholder="Search district..."
//                               value={districtQuery}
//                               onChange={(e) => {
//                                 const v = e.target.value;
//                                 setDistrictQuery(v);
//                                 setSelectedDistrict(null);

//                                 setSelectedProperty(null);
//                                 setPropertyQuery("");
//                                 setPropertyResults([]);
//                                 setPropertyOpen(false);

//                                 update("district_code", "");
//                                 update("district_name", v);
//                                 update("area_name_en", v);
//                               }}
//                               autoFocus
//                             />
//                             {districtQuery ? (
//                               <button
//                                 type="button"
//                                 className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500"
//                                 onClick={() => {
//                                   setDistrictQuery("");
//                                   update("district_name", "");
//                                   update("area_name_en", "");
//                                 }}
//                                 aria-label="clear district search"
//                               >
//                                 ✕
//                               </button>
//                             ) : null}

//                             {districtLoading ? <div className="mt-2 text-xs text-slate-400 font-semibold"></div> : null}

//                             {canAddTypedDistrict ? (
//                               <button
//                                 type="button"
//                                 className="mt-2 w-full text-left px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm font-extrabold hover:bg-blue-100"
//                                 onClick={() => {
//                                   const dn = norm(districtQuery);
//                                   if (!dn) return;

//                                   const d = { district_code: "", district_name: dn };
//                                   setSelectedDistrict(d);
//                                   setDistrictQuery(dn);
//                                   setDistrictOpen(false);

//                                   update("district_code", "");
//                                   update("district_name", dn);
//                                   update("area_name_en", dn);

//                                   setSelectedProperty(null);
//                                   setPropertyQuery("");
//                                   setPropertyResults([]);
//                                   setPropertyOpen(false);
//                                 }}
//                               >
//                                 + Use “{norm(districtQuery)}” (add new district)
//                               </button>
//                             ) : null}
//                           </div>
//                         </div>

//                         <div className="max-h-64 overflow-auto">
//                           {filteredDistricts.length === 0 && !districtLoading ? (
//                             <div className="px-4 py-3 text-sm text-slate-500">No districts found</div>
//                           ) : (
//                             filteredDistricts.map((d) => (
//                               <button
//                                 key={`${d.district_code}-${d.district_name}`}
//                                 type="button"
//                                 className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50"
//                                 onClick={() => {
//                                   setSelectedDistrict(d);
//                                   setDistrictQuery(d.district_name);
//                                   setDistrictOpen(false);

//                                   update("district_code", d.district_code || "");
//                                   update("district_name", d.district_name || "");
//                                   update("area_name_en", d.district_name || "");

//                                   setSelectedProperty(null);
//                                   setPropertyQuery("");
//                                   setPropertyResults([]);
//                                   setPropertyOpen(false);
//                                 }}
//                               >
//                                 {d.district_name}
//                               </button>
//                             ))
//                           )}
//                         </div>
//                       </div>
//                     ) : null}
//                   </div>
//                 </div>

//                 {/* Map placeholder */}
//                 {/* Map placeholder */}
// {HIDE_MAP_UI ? null : (
//   <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-[360px] bg-slate-100">
//     <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[70%] z-10">
//       <div className="relative">
//         <input
//           className="w-full h-14 bg-white border-none shadow-2xl rounded-xl px-6 pr-12 text-sm font-medium focus:ring-2 focus:ring-blue-600"
//           type="text"
//           value={form.address_search || ""}
//           onChange={(e) => update("address_search", e.target.value)}
//           placeholder="Search address (optional)"
//         />
//         <button
//           type="button"
//           className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//           onClick={() => update("address_search", "")}
//           aria-label="clear"
//         >
//           ✕
//         </button>
//       </div>
//     </div>

//     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//       <div className="text-5xl">📍</div>
//     </div>

//     <div className="absolute bottom-6 right-6 flex flex-col gap-2">
//       <button type="button" className="w-10 h-10 bg-white rounded-lg shadow-lg font-bold">
//         +
//       </button>
//       <button type="button" className="w-10 h-10 bg-white rounded-lg shadow-lg font-bold">
//         −
//       </button>
//     </div>

//     <div className="absolute bottom-6 left-6">
//       <button type="button" className="px-4 py-2 bg-white rounded-lg shadow-lg text-xs font-bold text-slate-600">
//         ⤢ ENLARGE MAP
//       </button>
//     </div>
//   </div>
// )}

//               </section>

//               {/* Project/Property + Building + Title deed */}
//               <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
//                 <div className="space-y-6">
//                   <div ref={propertyBoxRef} className="relative">
//                     <Label>Project / Property Reference (Optional)</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       placeholder={typedDistrictName ? "Select property (or type to add)" : "Select district first"}
//                       value={selectedProperty ? selectedProperty.property_name : propertyQuery}
//                       disabled={!typedDistrictName}
//                       onFocus={() => setPropertyOpen(true)}
//                       onChange={(e) => {
//                         const v = e.target.value;
//                         setPropertyQuery(v);
//                         setSelectedProperty(null);

//                         update("property_name", v);
//                         update("project_reference", v);
//                         update("project_name_en", v);
//                       }}
//                     />

//                     {propertyOpen && typedDistrictName && !selectedProperty ? (
//                       <div className="absolute z-50 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
//                         <div className="p-3 border-b border-slate-100 bg-white sticky top-0 z-10">
//                           <div className="relative">
//                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
//                             <input
//                               className="w-full h-10 pl-9 pr-10 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 text-sm font-semibold"
//                               placeholder="Search property..."
//                               value={propertyQuery}
//                               onChange={(e) => {
//                                 const v = e.target.value;
//                                 setPropertyQuery(v);
//                                 setSelectedProperty(null);

//                                 update("property_name", v);
//                                 update("project_reference", v);
//                                 update("project_name_en", v);
//                               }}
//                               autoFocus
//                             />
//                             {propertyQuery ? (
//                               <button
//                                 type="button"
//                                 className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500"
//                                 onClick={() => {
//                                   setPropertyQuery("");
//                                   update("property_name", "");
//                                   update("project_reference", "");
//                                   update("project_name_en", "");
//                                 }}
//                                 aria-label="clear property search"
//                               >
//                                 ✕
//                               </button>
//                             ) : null}

//                             {propertyLoading ? <div className="mt-2 text-xs text-slate-400 font-semibold"></div> : null}

//                             {canAddTypedProperty ? (
//                               <button
//                                 type="button"
//                                 className="mt-2 w-full text-left px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm font-extrabold hover:bg-blue-100"
//                                 onClick={() => {
//                                   const pn = norm(propertyQuery);
//                                   if (!pn) return;

//                                   const p = { property_name: pn };
//                                   setSelectedProperty(p);
//                                   setPropertyQuery(pn);
//                                   setPropertyOpen(false);

//                                   update("property_name", pn);
//                                   update("project_reference", pn);
//                                   update("project_name_en", pn);
//                                 }}
//                               >
//                                 + Use “{norm(propertyQuery)}” (add new property)
//                               </button>
//                             ) : null}
//                           </div>
//                         </div>

//                         <div className="max-h-64 overflow-auto">
//                           {filteredProperties.length === 0 && !propertyLoading ? (
//                             <div className="px-4 py-3 text-sm text-slate-500">No properties found</div>
//                           ) : (
//                             filteredProperties.map((p) => (
//                               <button
//                                 key={p.property_name}
//                                 type="button"
//                                 className="w-full text-left px-4 py-3 text-sm font-semibold hover:bg-slate-50"
//                                 onClick={() => {
//                                   setSelectedProperty(p);
//                                   setPropertyQuery(p.property_name);
//                                   setPropertyOpen(false);

//                                   update("property_name", p.property_name);
//                                   update("project_reference", p.property_name);
//                                   update("project_name_en", p.property_name);
//                                 }}
//                               >
//                                 {p.property_name}
//                               </button>
//                             ))
//                           )}
//                         </div>
//                       </div>
//                     ) : null}
//                   </div>

//                   <div>
//                     <Label>Title Deed No (Optional)</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       placeholder="Title Deed No"
//                       value={form.title_deed_no || ""}
//                       onChange={(e) => update("title_deed_no", e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 <div className="space-y-6">
//                   <div>
//                     <Label>Building Name (Optional)</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       placeholder="Building Name"
//                       value={form.building_name || ""}
//                       onChange={(e) => update("building_name", e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <Label>Title Deed Type *</Label>
//                     <div className="flex gap-3">
//                       {TITLE_DEED_TYPES.map((t) => (
//                         <ToggleBtn
//                           key={t}
//                           active={form.title_deed_type === t}
//                           onClick={() => update("title_deed_type", t)}
//                           label={t}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-8">
//                   <div>
//                     <Label>Plot No (Optional)</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       placeholder="e.g. 1001"
//                       value={form.plot_no || ""}
//                       onChange={(e) => update("plot_no", e.target.value)}
//                     />
//                   </div>

//                   <div className="flex items-center gap-3 pt-6">
//                     <input
//                       className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
//                       type="checkbox"
//                       checked={!!form.is_project_valuation}
//                       onChange={(e) => update("is_project_valuation", e.target.checked)}
//                     />
//                     <span className="text-sm font-semibold text-slate-700">Is Project Valuation?</span>
//                   </div>
//                 </div>
//               </section>

//               {/* Valuation type + category + purpose */}
//               <section className="space-y-8 pt-6 border-t border-slate-100">
//                 <div>
//                   <Label>Valuation Type Selection *</Label>
//                   <div className="flex flex-wrap md:flex-nowrap gap-3">
//                     {VALUATION_TYPES.map((x) => (
//                       <ToggleBtn key={x} active={form.valuation_type === x} onClick={() => update("valuation_type", x)} label={x} wide />
//                     ))}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                   <div>
//                     <Label>Property Category *</Label>
//                     <div className="flex gap-3">
//                       {PROPERTY_CATEGORIES.map((x) => (
//                         <ToggleBtn key={x} active={form.property_category === x} onClick={() => update("property_category", x)} label={x} />
//                       ))}
//                     </div>
//                   </div>

//                   <div>
//                     <Label>Purpose of Valuation *</Label>
//                     <select
//                       className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       value={form.purpose_of_valuation}
//                       onChange={(e) => update("purpose_of_valuation", e.target.value)}
//                     >
//                       {PURPOSE_OF_VALUATION.map((x) => (
//                         <option key={x} value={x}>
//                           {x}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>
//               </section>

//               {/* Status + apartment details */}
//               <section className="space-y-8 pt-6 border-t border-slate-100">
//                 <div>
//                   <Label>Property Current Status *</Label>
//                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                     {PROPERTY_STATUS.map((x) => (
//                       <ToggleBtn key={x} active={form.property_status === x} onClick={() => update("property_status", x)} label={x} />
//                     ))}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                   <div>
//                     <Label>Apartment No *</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       placeholder="Enter Apartment No e.g. K-098"
//                       value={form.apartment_no || ""}
//                       onChange={(e) => update("apartment_no", e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <Label>Apartment Size *</Label>
//                     <div className="relative flex">
//                       <input
//                         className="w-full h-12 bg-slate-50 border border-slate-200 rounded-l-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium"
//                         placeholder="Enter Size e.g. 9000"
//                         type="number"
//                         value={form.area_value}
//                         onChange={(e) => update("area_value", e.target.value)}
//                       />
//                       <select
//                         className="h-12 bg-slate-100 border border-l-0 border-slate-200 rounded-r-xl px-4 text-sm font-bold focus:ring-0"
//                         value={form.area_unit}
//                         onChange={(e) => update("area_unit", e.target.value)}
//                       >
//                         <option value="sq.ft">Sq Feet</option>
//                         <option value="sq.m">Sq Meters</option>
//                       </select>
//                     </div>
//                     <p className="text-[10px] text-slate-400 mt-1.5 ml-1">This field accepts only English numbers.</p>
//                   </div>

//                   <div>
//                     <Label>Last Renovated On</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       type="date"
//                       value={form.last_renovated_on || ""}
//                       onChange={(e) => update("last_renovated_on", e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <Label>Floor / Level</Label>
//                     <select
//                       className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       value={form.floor_level || ""}
//                       onChange={(e) => update("floor_level", e.target.value)}
//                     >
//                       <option value="" disabled>
//                         Select Floor / Level
//                       </option>
//                       {FLOOR_LEVELS.map((x) => (
//                         <option key={x} value={x}>
//                           {x}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <Label>Furnishing Type *</Label>
//                   <div className="grid grid-cols-3 gap-3">
//                     {FURNISHING_TYPES.map((x) => (
//                       <ToggleBtn key={x} active={form.furnishing === x} onClick={() => update("furnishing", x)} label={x} />
//                     ))}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                   <div>
//                     <Label>Bedroom *</Label>
//                     <select
//                       className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       value={String(form.bedrooms || "")}
//                       onChange={(e) => update("bedrooms", e.target.value)}
//                     >
//                       <option value="" disabled>
//                         Select No. Of Bedroom
//                       </option>
//                       {BEDROOMS.map((x) => (
//                         <option key={x} value={x}>
//                           {x}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <Label>Bathroom *</Label>
//                     <select
//                       className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       value={String(form.bathrooms || "")}
//                       onChange={(e) => update("bathrooms", e.target.value)}
//                     >
//                       <option value="" disabled>
//                         Select No. Of Bathroom
//                       </option>
//                       {BATHROOMS.map((x) => (
//                         <option key={x} value={x}>
//                           {x}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                   <div>
//                     <Label>Property Type</Label>
//                     <select
//                       className="w-full h-12 bg-slate-50 border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       value={form.property_type_en}
//                       onChange={(e) => update("property_type_en", e.target.value)}
//                     >
//                       {PROPERTY_TYPES.map((x) => (
//                         <option key={x} value={x}>
//                           {x}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                   <div>
//                     <Label>Unit (Optional)</Label>
//                     <input
//                       className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600 px-4 font-medium transition-all"
//                       placeholder="e.g. Unit 1502"
//                       value={form.property_name_unit || ""}
//                       onChange={(e) => update("property_name_unit", e.target.value)}
//                     />
//                   </div>
//                 </div>
//               </section>

//               {/* Features */}
//               <section className="space-y-4 pt-6 border-t border-slate-100">
//                 <Label>Select Features</Label>

//                 <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/30">
//                   <button
//                     type="button"
//                     className="w-full p-6 border-b border-slate-100 flex justify-between items-center"
//                     onClick={() => setFeaturesOpen((s) => !s)}
//                   >
//                     <span className="text-slate-500 font-medium">Select Features</span>
//                     <span className="text-slate-400">{featuresOpen ? "▴" : "▾"}</span>
//                   </button>

//                   {featuresOpen && (
//                     <div className="p-6 space-y-6">
//                       <div className="relative">
//                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔎</span>
//                         <input
//                           className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl focus:ring-blue-600 focus:border-blue-600"
//                           placeholder="Search features..."
//                           value={featureSearch}
//                           onChange={(e) => setFeatureSearch(e.target.value)}
//                         />
//                       </div>

//                       <div className="flex flex-wrap gap-2 max-h-52 overflow-auto pr-1">
//                         {filteredAmenities.map((a) => {
//                           const on = (form.amenities || []).includes(a);
//                           return (
//                             <button
//                               key={a}
//                               type="button"
//                               onClick={() => toggleAmenity(a)}
//                               className={
//                                 on
//                                   ? "px-4 py-2 bg-blue-600 text-white border border-blue-600 rounded-lg text-xs font-semibold"
//                                   : "px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:border-blue-600"
//                               }
//                             >
//                               {a}
//                             </button>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </section>

//               {/* Actions */}
//               <div className="pt-8 flex flex-col md:flex-row gap-4">
//                 <button
//                   type="button"
//                   onClick={onNext}
//                   className="flex-1 h-16 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
//                 >
//                   ⚡ Get Free Valuation
//                 </button>

//                 <button
//                   type="button"
//                   onClick={onReset}
//                   className="px-10 h-16 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold transition-all hover:bg-slate-50"
//                 >
//                   Reset
//                 </button>
//               </div>
//             </div>
//           </div>

//           <p className="text-center mt-8 text-xs text-slate-400 font-medium">
//             Instant report powered by real-time DLD transaction data & neural intelligence.
//           </p>
//         </div>
//       </main>

//       <footer className="bg-white border-t border-slate-200">
//         <div className="max-w-5xl mx-auto px-6 py-10">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
//             <div>
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold">
//                   A
//                 </div>
//                 <span className="text-lg font-extrabold">ACQAR</span>
//               </div>
//               <p className="text-sm text-slate-500 mt-4">AI-powered real estate valuations aligned with UAE DLD data.</p>
//             </div>

//             <div>
//               <p className="text-xs font-bold text-slate-400 mb-3">Product</p>
//               <ul className="text-sm text-slate-600 space-y-2">
//                 <li>Dashboard</li>
//                 <li>Valuation</li>
//               </ul>
//             </div>

//             <div>
//               <p className="text-xs font-bold text-slate-400 mb-3">Company</p>
//               <ul className="text-sm text-slate-600 space-y-2">
//                 <li>About</li>
//                 <li>Contact</li>
//               </ul>
//             </div>

//             <div>
//               <p className="text-xs font-bold text-slate-400 mb-3">Legal</p>
//               <ul className="text-sm text-slate-600 space-y-2">
//                 <li>Privacy</li>
//                 <li>Terms</li>
//               </ul>
//             </div>
//           </div>

//           <div className="mt-10 pt-6 border-t text-xs text-slate-400 flex justify-between">
//             <span>© {new Date().getFullYear()} ACQAR TECHNOLOGIES</span>
//             <span>Made in UAE 🇦🇪</span>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// // ---------- Small UI helpers ----------
// function Label({ children }) {
//   return (
//     <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block ml-1">
//       {children}
//     </label>
//   );
// }

// function ToggleBtn({ label, active, onClick }) {
//   const base = "py-3 text-sm font-bold rounded-xl border-2 transition-all text-center cursor-pointer select-none";
//   const act = "border-slate-900 bg-slate-900 text-white";
//   const inact = "border-slate-100 bg-white text-slate-400 hover:border-slate-200";
//   return (
//     <button type="button" onClick={onClick} className={[base, "flex-1", active ? act : inact].join(" ")}>
//       {label}
//     </button>
//   );
// }

// src/pages/ValuationForm.jsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import NavBar from "../components/NavBar";
// import { supabase } from "../lib/supabase";

// // ✅ ADDED: Header (colors updated as you wanted)
// const Header = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const current = location.pathname;

//   const navItems = [
//     { label: "Products", path: "/" },
//     { label: "Pricing", path: "/pricing" },
//     { label: "Resources", path: "/resources" },
//     { label: "About", path: "/about" },
//   ];

//   return (
//     <header className="sticky top-0 z-50 w-full border-b border-[#D4D4D4] bg-white">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2 sm:gap-4">
//         {/* Logo */}
//         <div
//           className="flex items-center cursor-pointer shrink-0"
//           onClick={() => navigate("/")}
//         >
//           <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-[#2B2B2B] uppercase">
//             ACQAR
//           </h1>
//         </div>

//         {/* Mobile pricing */}
//         <button
//           onClick={() => navigate("/pricing")}
//           className={`md:hidden text-[10px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-full ${
//             current === "/pricing"
//               ? "text-[#B87333] underline underline-offset-4"
//               : "text-[#2B2B2B]/70"
//           }`}
//         >
//           Pricing
//         </button>

//         {/* Desktop nav */}
//         <nav className="hidden md:flex items-center gap-10">
//           {navItems.map((item) => (
//             <button
//               key={item.label}
//               onClick={() => navigate(item.path)}
//               className={`text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] ${
//                 current === item.path ? "text-[#B87333]" : "text-[#2B2B2B]"
//               }`}
//             >
//               {item.label}
//             </button>
//           ))}
//         </nav>

//         {/* Right buttons */}
//         <div className="flex items-center gap-2 sm:gap-4 shrink-0">
//           <button
//             onClick={() => navigate("/login")}
//             className="hidden sm:block text-sm font-bold px-4 py-2 text-[#2B2B2B] hover:text-[#B87333]"
//           >
//             Sign In
//           </button>

//           <button
//             onClick={() => navigate("/valuation")}
//             className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
//           >
//             Get Started
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// };

// // ---------- Helpers ----------
// function toSqm(areaVal, unit) {
//   const v = Number(areaVal || 0);
//   if (!v) return 0;
//   if (unit === "sq.ft") return v * 0.092903;
//   return v;
// }
// function useDebounced(value, delay = 250) {
//   const [v, setV] = useState(value);
//   useEffect(() => {
//     const t = setTimeout(() => setV(value), delay);
//     return () => clearTimeout(t);
//   }, [value, delay]);
//   return v;
// }
// function escapeForILike(s) {
//   return (s || "").replace(/[%_\\]/g, (m) => `\\${m}`);
// }

// // ---------- NEW: DB helper utils (ADDED ONLY) ----------
// function norm(s) {
//   return (s || "").trim().replace(/\s+/g, " ");
// }
// function genDistrictCode() {
//   const a = Date.now().toString(36);
//   const b = Math.random().toString(36).slice(2, 6).toUpperCase();
//   return `D-${a}-${b}`;
// }

// // Ensure district row exists in `districts` table.
// async function ensureDistrictExists({ district_name, district_code }) {
//   const dn = norm(district_name);
//   if (!dn) return { district_code: "", district_name: "" };

//   const { data: found, error: findErr } = await supabase
//     .from("districts")
//     .select("id, district_code, district_name")
//     .ilike("district_name", dn)
//     .limit(1);

//   if (findErr) throw findErr;

//   if (found && found.length > 0) {
//     const row = found[0];
//     return {
//       district_code: norm(row.district_code),
//       district_name: norm(row.district_name) || dn,
//     };
//   }

//   const newCode = norm(district_code) || genDistrictCode();

//   const { data: inserted, error: insErr } = await supabase
//     .from("districts")
//     .insert([{ district_code: newCode, district_name: dn }])
//     .select("district_code, district_name")
//     .single();

//   if (insErr) throw insErr;

//   return {
//     district_code: norm(inserted?.district_code) || newCode,
//     district_name: norm(inserted?.district_name) || dn,
//   };
// }

// // Ensure mapping exists in `district_properties` table.
// async function ensureDistrictPropertyExists({ district_code, district_name, property_name }) {
//   const dc = norm(district_code);
//   const dn = norm(district_name);
//   const pn = norm(property_name);
//   if (!dc || !dn || !pn) return;

//   const { data: found, error: findErr } = await supabase
//     .from("district_properties")
//     .select("id")
//     .eq("district_code", dc)
//     .ilike("property_name", pn)
//     .limit(1);

//   if (findErr) throw findErr;
//   if (found && found.length > 0) return;

//   const { error: insErr } = await supabase
//     .from("district_properties")
//     .insert([{ district_code: dc, district_name: dn, property_name: pn }]);

//   if (insErr) throw insErr;
// }

// // ✅ insert valuation snapshot (store ID for Report update)
// async function insertValuationRow(row) {
//   const { data, error } = await supabase.from("valuations").insert([row]).select("id").single();
//   if (error) throw error;
//   return data?.id;
// }

// // ✅ safe JSON parse (kept)
// function safeParse(json) {
//   try {
//     return JSON.parse(json);
//   } catch {
//     return null;
//   }
// }

// // ✅ create small deterministic signature for report cache
// function stableStringify(obj) {
//   const seen = new WeakSet();
//   return JSON.stringify(obj, function (k, v) {
//     if (v && typeof v === "object") {
//       if (seen.has(v)) return;
//       seen.add(v);
//       if (Array.isArray(v)) return v;
//       return Object.keys(v)
//         .sort()
//         .reduce((acc, key) => {
//           acc[key] = v[key];
//           return acc;
//         }, {});
//     }
//     return v;
//   });
// }
// function hashLike(str) {
//   let h = 0;
//   for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
//   return String(h);
// }

// // ---------- Constants ----------
// const COUNTRIES = [
//   "United Arab Emirates",
//   "Kingdom of Saudi Arabia",
//   "Kingdom of Bahrain",
//   "Qatar",
//   "Oman",
//   "Kuwait",
// ];

// const UAE_CITIES = [
//   "Dubai",
//   "Abu Dhabi",
//   "Sharjah",
//   "Umm Al Quwain",
//   "Fujairah",
//   "Ajman",
//   "Ras Al Khaimah",
//   "Kalba",
//   "Khor Fakkan",
//   "Al Ain",
// ];

// const PROPERTY_CATEGORIES = ["Residential"];
// const PROPERTY_TYPES = ["Apartment", "Villa", "Townhouse", "Penthouse", "Office", "Retail"];

// const AMENITY_OPTIONS = [
//   "24 Hour Security",
//   "24 Hours Concierge",
//   "ATM Facility",
//   "Balcony or Terrace",
//   "Barbeque Area",
//   "Basketball Court",
//   "Beach Access",
//   "Beach View",
//   "Broadband Internet",
//   "Built-in Closet",
//   "Built-in Kitchen Appliances",
//   "Built-in Wardrobes",
//   "Business Centre",
//   "Canal View",
//   "CCTV Security",
//   "Central Heating",
//   "Centrally Air-Conditioned",
//   "Children's Pool",
//   "City View",
//   "Cleaning Services",
//   "Clinic",
//   "Community pool",
//   "Community View",
//   "Conference Room",
//   "Courtyard view",
//   "Covered Parking",
//   "Cycling Tracks",
//   "Day Care Center",
//   "Double Glazed Windows",
//   "Easy Access to Parking",
//   "Electricity Backup",
//   "Elevator",
//   "Exclusive beach access",
//   "Facilities for Disabled",
//   "First Aid Medical Center",
//   "Fitness center",
//   "Football Pitches",
//   "Games Room",
//   "Golf",
//   "Golf Course View",
//   "Gym or Health Club",
//   "Gymnasium",
//   "Health & Beauty Salon",
//   "Health Centre",
//   "High-Rise views",
//   "High-speed elevator",
//   "Housekeeping",
//   "Indoor Gardens",
//   "Indoor Pool",
//   "Intercom",
//   "Jacuzzi",
//   "Jogging Track",
//   "Kid's Play Area",
//   "Kitchen Appliances",
//   "Lake View",
//   "Landmark view",
//   "Landscaping",
//   "Laundry Facility",
//   "Laundry Room",
//   "Lawn or Garden",
//   "Lobby",
//   "Lounge Area",
//   "Maid Service",
//   "Maids Room",
//   "Maintenance Staff",
//   "Mall",
//   "Mini-Market",
//   "Nursery",
//   "Outdoor Pool",
//   "Pantry",
//   "Park",
//   "Park Views",
//   "Parking",
//   "Pets Allowed",
//   "Pool View",
//   "Prayer Room",
//   "Private Garden",
//   "Private Jacuzzi",
//   "Private Parking",
//   "Private Pool",
//   "Public Pool",
//   "Reception/Waiting Room",
//   "Recording studio",
//   "Restaurants",
//   "Retail",
//   "Road View",
//   "Satellite/Cable TV",
//   "Sauna",
//   "Sea Views",
//   "Security",
//   "Shaded Garage",
//   "Shared Gym",
//   "Shared Jacuzzi",
//   "Shared Pool",
//   "Skating Park",
//   "Social Club",
//   "Solar Heating or Electrical",
//   "Spa",
//   "Sports Facilities",
//   "Steam Room",
//   "Storage Areas",
//   "Study Room",
//   "Supermarket",
//   "Swimming Pool",
//   "Tennis Court",
//   "Theater",
//   "Underground Parking",
//   "Vastu-compliant",
//   "Walk-in Closet",
//   "Waste Disposal",
//   "Water View",
//   "Wellness club",
//   "Yoga Studio",
// ];

// const TITLE_DEED_TYPES = ["Leasehold", "Freehold", "Musataha"];
// const VALUATION_TYPES = ["Current Market Value", "Historical Property Value", "Verify Previous Valuation"];
// const PURPOSE_OF_VALUATION = ["Buy & Sell", "Mortgage", "Investment", "Tax", "Legal", "Other"];
// const PROPERTY_STATUS = ["Owner Occupied", "Leased", "Vacant", "Under Construction"];
// const FURNISHING_TYPES = ["Furnished", "Unfurnished", "SemiFurnished"];
// const BEDROOMS = ["0", "1", "2", "3", "4", "5", "6", "7+"];
// const BATHROOMS = ["1", "2", "3", "4", "5", "6+"];
// const FLOOR_LEVELS = ["Basement", "Ground", "Mezzanine", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

// // ✅ localStorage keys
// const LS_FORM_KEY = "truvalu_formData_v1";
// const LS_VAL_ROW_ID = "truvalu_valuation_row_id";
// const LS_REPORT_KEY = "truvalu_reportData_v1";
// const LS_REPORT_META = "truvalu_report_meta_v1"; // { formHash }
// const LS_PENDING_INSERT = "truvalu_pending_valuation_insert_v1"; // optional fallback

// const HIDE_MAP_UI = true; // set false if you want it back

// // ✅ NEW: default form (used to clear UI after success)
// const DEFAULT_FORM = {
//   country: "United Arab Emirates",
//   city: "Dubai",
//   district_code: "",
//   district_name: "",
//   property_name: "",
//   // legacy keys (keep)
//   area_name_en: "",
//   area_name_ar: "",
//   district_key: "",
//   building_name_en: "",
//   building_key: "",
//   project_name_en: "",
//   project_name_ar: "",
//   land_type_en: "",
//   land_type_ar: "",
//   project_reference: "",
//   building_name: "",
//   title_deed_no: "",
//   title_deed_type: "Freehold",
//   plot_no: "1001",
//   is_project_valuation: false,
//   valuation_type: "Current Market Value",
//   property_category: "Residential",
//   purpose_of_valuation: "Buy & Sell",
//   property_status: "Leased",
//   apartment_no: "",
//   area_value: "",
//   area_unit: "sq.ft",
//   last_renovated_on: "",
//   floor_level: "",
//   furnishing: "SemiFurnished",
//   bedrooms: "",
//   bathrooms: "",
//   property_type_en: "Apartment",
//   property_name_unit: "",
//   amenities: [],
// };

// // ✅ requirement #1: graph hidden (code present, UI hidden)
// const HIDE_GRAPHS_BUT_KEEP_CODE = true;

// // ---------- Component ----------
// export default function ValuationForm({ formData, setFormData }) {
//   const navigate = useNavigate();
//   const [error, setError] = useState("");

//   // ✅ auth state to drive routing + hide header
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [sessionUser, setSessionUser] = useState(null);

//   useEffect(() => {
//     let mounted = true;

//     async function boot() {
//       const { data } = await supabase.auth.getSession();
//       const sess = data?.session || null;
//       if (!mounted) return;
//       setIsLoggedIn(!!sess);
//       setSessionUser(sess?.user || null);
//     }

//     boot();

//     const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
//       setIsLoggedIn(!!sess);
//       setSessionUser(sess?.user || null);
//     });

//     return () => {
//       mounted = false;
//       sub?.subscription?.unsubscribe?.();
//     };
//   }, []);

//   // ✅ CHANGED: use DEFAULT_FORM so we can clear UI after success
//   const [form, setForm] = useState(formData || DEFAULT_FORM);

//   const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

//   const isDubaiFlow = form.country === "United Arab Emirates" && form.city === "Dubai";

//   // -------- Districts --------
//   const [districtOpen, setDistrictOpen] = useState(false);
//   const districtBoxRef = useRef(null);
//   const [districtQuery, setDistrictQuery] = useState("");
//   const dQ = useDebounced(districtQuery, 250);
//   const [districtLoading, setDistrictLoading] = useState(false);
//   const [districtResults, setDistrictResults] = useState([]);
//   const [selectedDistrict, setSelectedDistrict] = useState(null);

//   // -------- Properties --------
//   const [propertyOpen, setPropertyOpen] = useState(false);
//   const propertyBoxRef = useRef(null);
//   const [propertyQuery, setPropertyQuery] = useState("");
//   const pQ = useDebounced(propertyQuery, 150);
//   const [propertyLoading, setPropertyLoading] = useState(false);
//   const [propertyResults, setPropertyResults] = useState([]);
//   const [selectedProperty, setSelectedProperty] = useState(null);

//   // -------- Amenities --------
//   const [featuresOpen, setFeaturesOpen] = useState(true);
//   const [featureSearch, setFeatureSearch] = useState("");
//   const fQ = useDebounced(featureSearch, 200);

//   const computedSqm = useMemo(() => toSqm(form.area_value, form.area_unit), [form.area_value, form.area_unit]);

//   const typedDistrictName = norm(selectedDistrict?.district_name || districtQuery || form.district_name);

//   const resetDistrictAndProperty = () => {
//     setSelectedDistrict(null);
//     setDistrictQuery("");
//     setDistrictResults([]);
//     setDistrictOpen(false);

//     setSelectedProperty(null);
//     setPropertyQuery("");
//     setPropertyResults([]);
//     setPropertyOpen(false);

//     update("district_code", "");
//     update("district_name", "");
//     update("property_name", "");

//     update("area_name_en", "");
//     update("project_name_en", "");
//     update("project_reference", "");
//   };

//   // ✅ NEW: clear UI after successful valuation (does NOT delete localStorage / report)
//   function clearUiAfterSuccessfulValuation() {
//     setSelectedDistrict(null);
//     setDistrictQuery("");
//     setDistrictResults([]);
//     setDistrictOpen(false);

//     setSelectedProperty(null);
//     setPropertyQuery("");
//     setPropertyResults([]);
//     setPropertyOpen(false);

//     setFeaturesOpen(true);
//     setFeatureSearch("");

//     setForm(DEFAULT_FORM);
//     setFormData?.(null);
//   }

//   useEffect(() => {
//     function onDown(e) {
//       if (districtBoxRef.current && !districtBoxRef.current.contains(e.target)) setDistrictOpen(false);
//       if (propertyBoxRef.current && !propertyBoxRef.current.contains(e.target)) setPropertyOpen(false);
//     }
//     document.addEventListener("mousedown", onDown);
//     return () => document.removeEventListener("mousedown", onDown);
//   }, []);

//   useEffect(() => {
//     let alive = true;
//     async function run() {
//       if (!districtOpen) return;
//       if (!isDubaiFlow) return;

//       setDistrictLoading(true);
//       setError("");

//       const q = (dQ || "").trim();
//       let query = supabase
//         .from("districts")
//         .select("district_code, district_name")
//         .order("district_name", { ascending: true })
//         .range(0, 9999);

//       if (q.length >= 2) {
//         const safe = escapeForILike(q);
//         query = query.ilike("district_name", `%${safe}%`);
//       }

//       const { data, error: e } = await query;
//       if (!alive) return;

//       setDistrictLoading(false);

//       if (e) {
//         console.error(e);
//         setDistrictResults([]);
//         setError(e.message);
//         return;
//       }

//       const map = new Map();
//       (data || []).forEach((r) => {
//         const code = (r.district_code || "").trim();
//         const name = (r.district_name || "").trim();
//         if (!name) return;
//         const key = `${code}__${name}`;
//         if (!map.has(key)) map.set(key, { district_code: code, district_name: name });
//       });

//       setDistrictResults(Array.from(map.values()));
//     }

//     run();
//     return () => {
//       alive = false;
//     };
//   }, [districtOpen, isDubaiFlow, dQ]);

//   const filteredDistricts = useMemo(() => {
//     const q = (districtQuery || "").trim().toLowerCase();
//     if (!q) return districtResults;
//     return districtResults.filter((d) => (d.district_name || "").toLowerCase().includes(q));
//   }, [districtQuery, districtResults]);

//   const canAddTypedDistrict = useMemo(() => {
//     const dn = norm(districtQuery);
//     if (!dn) return false;
//     const exists = (districtResults || []).some((d) => norm(d.district_name).toLowerCase() === dn.toLowerCase());
//     return !exists;
//   }, [districtQuery, districtResults]);

//   useEffect(() => {
//     let alive = true;
//     async function run() {
//       if (!propertyOpen) return;

//       const districtForLookup = selectedDistrict?.district_name
//         ? selectedDistrict
//         : typedDistrictName
//         ? { district_code: "", district_name: typedDistrictName }
//         : null;

//       if (!districtForLookup) return;

//       setPropertyLoading(true);
//       setError("");

//       let query = supabase
//         .from("district_properties")
//         .select("property_name")
//         .order("property_name", { ascending: true })
//         .range(0, 9999)
//         .not("property_name", "is", null)
//         .neq("property_name", "");

//       if (districtForLookup.district_code) query = query.eq("district_code", districtForLookup.district_code);
//       else query = query.eq("district_name", districtForLookup.district_name);

//       const { data, error: e } = await query;
//       if (!alive) return;

//       setPropertyLoading(false);

//       if (e) {
//         console.error(e);
//         setPropertyResults([]);
//         setError(e.message);
//         return;
//       }

//       const seen = new Set();
//       const rows = [];
//       (data || []).forEach((r) => {
//         const name = (r.property_name || "").trim();
//         if (!name) return;
//         if (seen.has(name)) return;
//         seen.add(name);
//         rows.push({ property_name: name });
//       });

//       setPropertyResults(rows);
//     }

//     run();
//     return () => {
//       alive = false;
//     };
//   }, [propertyOpen, selectedDistrict, typedDistrictName]);

//   const filteredProperties = useMemo(() => {
//     const q = (pQ || "").trim().toLowerCase();
//     if (!q) return propertyResults;
//     return propertyResults.filter((x) => (x.property_name || "").toLowerCase().includes(q));
//   }, [pQ, propertyResults]);

//   const canAddTypedProperty = useMemo(() => {
//     const pn = norm(propertyQuery);
//     if (!pn) return false;
//     const exists = (propertyResults || []).some((p) => norm(p.property_name).toLowerCase() === pn.toLowerCase());
//     return !exists;
//   }, [propertyQuery, propertyResults]);

//   const toggleAmenity = (a) => {
//     const cur = Array.isArray(form.amenities) ? form.amenities : [];
//     if (cur.includes(a)) update("amenities", cur.filter((x) => x !== a));
//     else update("amenities", [...cur, a]);
//   };

//   const filteredAmenities = useMemo(() => {
//     const q = (fQ || "").trim().toLowerCase();
//     if (!q) return AMENITY_OPTIONS;
//     return AMENITY_OPTIONS.filter((x) => x.toLowerCase().includes(q));
//   }, [fQ]);

//   // ---------- Submit ----------
//   const onNext = async () => {
//     setError("");

//     const { data: sessData } = await supabase.auth.getSession();
//     const sessNow = sessData?.session || null;
//     const loggedInNow = !!sessNow;
//     const userNow = sessNow?.user || null;

//     setIsLoggedIn(loggedInNow);
//     setSessionUser(userNow);

//     if (!isDubaiFlow) {
//       setError("Please select Country: United Arab Emirates and City: Dubai.");
//       return;
//     }

//     const finalDistrictName = norm(selectedDistrict?.district_name || districtQuery || form.district_name);
//     if (!finalDistrictName) {
//       setError("Please select a District.");
//       return;
//     }

//     const chosenProperty = norm(selectedProperty?.property_name || propertyQuery || form.property_name);
//     if (!chosenProperty) {
//       setError("Please select a Project / Property Reference (property).");
//       return;
//     }

//     if (!form.apartment_no?.trim()) {
//       setError("Please enter Apartment No.");
//       return;
//     }
//     if (!computedSqm || computedSqm <= 0) {
//       setError("Please enter Apartment Size (greater than 0).");
//       return;
//     }

//     try {
//       const ensuredDistrict = await ensureDistrictExists({
//         district_name: finalDistrictName,
//         district_code: selectedDistrict?.district_code || form.district_code || "",
//       });

//       await ensureDistrictPropertyExists({
//         district_code: ensuredDistrict.district_code,
//         district_name: ensuredDistrict.district_name,
//         property_name: chosenProperty,
//       });

//       const payload = {
//         ...form,
//         procedure_area: Number(computedSqm),
//         rooms_en: Number(form.bedrooms || 0),
//         district_code: ensuredDistrict?.district_code || "",
//         district_name: ensuredDistrict?.district_name || "",
//         property_name: chosenProperty,
//         area_name_en: ensuredDistrict?.district_name || "",
//         project_name_en: chosenProperty,
//         project_reference: chosenProperty,
//         building_name_en: form.building_name || "",
//       };

//       localStorage.setItem(LS_FORM_KEY, JSON.stringify(payload));
//       setFormData(payload);

//       const formHash = hashLike(stableStringify(payload));
//       localStorage.setItem(LS_REPORT_META, JSON.stringify({ formHash }));

//       const userId = userNow?.id || null;
//       const nameGuess =
//         (userNow?.user_metadata?.name ||
//           userNow?.user_metadata?.full_name ||
//           userNow?.email?.split("@")?.[0] ||
//           "") || null;

//       const row = {
//         user_id: userId,
//         name: nameGuess,
//         district: payload.district_name || "",
//         property_name: payload.property_name || "",
//         building_name: payload.building_name || "",
//         title_deed_no: payload.title_deed_no || "",
//         title_deed_type: payload.title_deed_type || "",
//         plot_no: payload.plot_no || "",

//         valuation_type: payload.valuation_type || "",
//         valuation_type_selection: payload.valuation_type || "",
//         property_category: payload.property_category || "",
//         purpose_of_valuation: payload.purpose_of_valuation || "",
//         property_current_status: payload.property_status || "",

//         apartment_no: payload.apartment_no || "",
//         apartment_size: payload.area_value || "",
//         apartment_size_unit: payload.area_unit || "",
//         last_renovated_on: payload.last_renovated_on || null,
//         floor_level: payload.floor_level || "",

//         furnishing_type: payload.furnishing || "",
//         bedroom: payload.bedrooms || "",
//         bathroom: payload.bathrooms || "",
//         property_type: payload.property_type_en || "",
//         unit: payload.property_name_unit || "",

//         features: Array.isArray(payload.amenities) ? payload.amenities : [],
//         form_payload: payload,
//         updated_at: new Date().toISOString(),
//       };

//       try {
//         const valuationRowId = await insertValuationRow(row);
//         if (valuationRowId) localStorage.setItem(LS_VAL_ROW_ID, String(valuationRowId));
//       } catch (dbErr) {
//         console.warn("Valuations insert blocked (likely RLS). Keeping flow:", dbErr?.message);
//         localStorage.removeItem(LS_VAL_ROW_ID);
//         localStorage.setItem(LS_PENDING_INSERT, JSON.stringify(row));
//       }

//       clearUiAfterSuccessfulValuation();

//       if (loggedInNow) navigate("/report");
//       else navigate("/valucheck");
//     } catch (e) {
//       console.error(e);
//       setError(e?.message || "Could not save district/property to database (check RLS policies).");
//     }
//   };

//   const onReset = () => {
//     setError("");
//     resetDistrictAndProperty();
//     setFeatureSearch("");
//     setForm({
//       ...DEFAULT_FORM,
//       address_search: "",
//       plot_no: "",
//       property_status: "Owner Occupied",
//       furnishing: "Unfurnished",
//     });

//     localStorage.removeItem(LS_FORM_KEY);
//     localStorage.removeItem(LS_VAL_ROW_ID);
//     localStorage.removeItem(LS_PENDING_INSERT);
//   };

//   return (
//     <div className="bg-[#F8F8F8] text-gray-900 font-sans min-h-screen">
//       {/* ✅ show NEW Header only when NOT logged in (same behavior as before) */}
//       {!isLoggedIn ? <Header /> : null}

//       {/* ✅ keep your old NavBar behavior when logged out? (REPLACED by Header) */}
//       {/* {!isLoggedIn ? <NavBar /> : null} */}

//       <main className="pt-20 pb-16 md:pt-24 md:pb-20">
//         <div className="max-w-4xl mx-auto px-6">
//           {/* Header Section */}
//           <div className="text-center mb-8">
//             <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">Property Details</h1>
//             <p className="text-gray-500 text-sm">
//               Please provide the structural and legal specifications of your asset
//               <br />
//               for a RICS-standard AI valuation.
//             </p>
//           </div>

//           {/* Progress Bar */}
//           <div className="mb-8">
//             <div className="flex items-center justify-between mb-2">
//               <div className="h-[2px] flex-1 bg-gray-200 relative">
//                 <div className="absolute left-0 top-0 h-full w-1/2 bg-[#B8763C]" />
//               </div>
//             </div>
//             <div className="flex justify-between text-xs">
//               <span className="text-gray-400">PROGRESS</span>
//               <span className="text-sm font-bold">Step 2 of 4</span>
//             </div>
//           </div>

//           {/* Main Form Card */}
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//             <div className="p-6 md:p-8 space-y-8">
//               {error ? (
//                 <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-semibold">
//                   {error}
//                 </div>
//               ) : null}

//               {/* Map Section */}
//               <section className="relative rounded-lg overflow-hidden border border-gray-200 h-[280px] bg-gray-100">
//                 <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] md:w-[70%] z-10">
//                   <div className="relative">
//                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//                         />
//                       </svg>
//                     </span>
//                     <input
//                       className="w-full h-12 bg-white border-none shadow-lg rounded-lg px-11 pr-10 text-sm focus:ring-2 focus:ring-[#B8763C] focus:outline-none"
//                       type="text"
//                       value={form.address_search || ""}
//                       onChange={(e) => update("address_search", e.target.value)}
//                       placeholder="Search by Building Name, Area or Community..."
//                     />
//                     <button
//                       type="button"
//                       className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100"
//                       aria-label="locate"
//                     >
//                       <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
//                         <path
//                           fillRule="evenodd"
//                           d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
//                           clipRule="evenodd"
//                         />
//                       </svg>
//                     </button>
//                   </div>
//                 </div>

//                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                   <div className="text-5xl">📍</div>
//                 </div>
//               </section>

//               {/* 01. LOCATION */}
//               <section className="space-y-4">
//                 <h2 className="text-sm font-bold tracking-wider">01. LOCATION</h2>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <Label>COUNTRY</Label>
//                     <select
//                       className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
//                       value={form.country}
//                       onChange={(e) => {
//                         const v = e.target.value;
//                         update("country", v);
//                         if (v === "United Arab Emirates") update("city", "Dubai");
//                         else update("city", "");
//                         resetDistrictAndProperty();
//                       }}
//                     >
//                       {COUNTRIES.map((c) => (
//                         <option key={c} value={c}>
//                           {c}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <Label>CITY</Label>
//                     <select
//                       className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
//                       value={form.city}
//                       onChange={(e) => {
//                         update("city", e.target.value);
//                         resetDistrictAndProperty();
//                       }}
//                       disabled={form.country !== "United Arab Emirates"}
//                     >
//                       {(form.country === "United Arab Emirates" ? UAE_CITIES : []).map((c) => (
//                         <option key={c} value={c}>
//                           {c}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div ref={districtBoxRef} className="relative">
//                     <Label>DISTRICT / AREA</Label>
//                     <input
//                       className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
//                       placeholder={isDubaiFlow ? "Select district" : "Select UAE + Dubai first"}
//                       value={selectedDistrict ? selectedDistrict.district_name : districtQuery}
//                       disabled={!isDubaiFlow}
//                       onFocus={() => setDistrictOpen(true)}
//                       onChange={(e) => {
//                         const v = e.target.value;
//                         setDistrictQuery(v);
//                         setSelectedDistrict(null);
//                         setSelectedProperty(null);
//                         setPropertyQuery("");
//                         setPropertyResults([]);
//                         setPropertyOpen(false);
//                         update("district_code", "");
//                         update("district_name", v);
//                         update("area_name_en", v);
//                       }}
//                     />

//                     {districtOpen && isDubaiFlow && !selectedDistrict ? (
//                       <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
//                         <div className="p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
//                           <div className="relative">
//                             <input
//                               className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] text-sm"
//                               placeholder="Search district..."
//                               value={districtQuery}
//                               onChange={(e) => {
//                                 const v = e.target.value;
//                                 setDistrictQuery(v);
//                                 setSelectedDistrict(null);
//                                 setSelectedProperty(null);
//                                 setPropertyQuery("");
//                                 setPropertyResults([]);
//                                 setPropertyOpen(false);
//                                 update("district_code", "");
//                                 update("district_name", v);
//                                 update("area_name_en", v);
//                               }}
//                               autoFocus
//                             />

//                             {canAddTypedDistrict ? (
//                               <button
//                                 type="button"
//                                 className="mt-2 w-full text-left px-3 py-2 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold hover:bg-orange-100"
//                                 onClick={() => {
//                                   const dn = norm(districtQuery);
//                                   if (!dn) return;
//                                   const d = { district_code: "", district_name: dn };
//                                   setSelectedDistrict(d);
//                                   setDistrictQuery(dn);
//                                   setDistrictOpen(false);
//                                   update("district_code", "");
//                                   update("district_name", dn);
//                                   update("area_name_en", dn);
//                                   setSelectedProperty(null);
//                                   setPropertyQuery("");
//                                   setPropertyResults([]);
//                                   setPropertyOpen(false);
//                                 }}
//                               >
//                                 + Use "{norm(districtQuery)}" (add new)
//                               </button>
//                             ) : null}
//                           </div>
//                         </div>

//                         <div className="max-h-60 overflow-auto">
//                           {filteredDistricts.length === 0 && !districtLoading ? (
//                             <div className="px-4 py-3 text-sm text-gray-500">No districts found</div>
//                           ) : (
//                             filteredDistricts.map((d) => (
//                               <button
//                                 key={`${d.district_code}-${d.district_name}`}
//                                 type="button"
//                                 className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50"
//                                 onClick={() => {
//                                   setSelectedDistrict(d);
//                                   setDistrictQuery(d.district_name);
//                                   setDistrictOpen(false);
//                                   update("district_code", d.district_code || "");
//                                   update("district_name", d.district_name || "");
//                                   update("area_name_en", d.district_name || "");
//                                   setSelectedProperty(null);
//                                   setPropertyQuery("");
//                                   setPropertyResults([]);
//                                   setPropertyOpen(false);
//                                 }}
//                               >
//                                 {d.district_name}
//                               </button>
//                             ))
//                           )}
//                         </div>
//                       </div>
//                     ) : null}
//                   </div>
//                 </div>
//               </section>

//               {/* 02. PROPERTY SPECIFICATIONS */}
//               <section className="space-y-4 pt-4 border-t border-gray-100">
//                 <h2 className="text-sm font-bold tracking-wider">02. PROPERTY SPECIFICATIONS</h2>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <Label>TITLE DEED NUMBER</Label>
//                     <input
//                       className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
//                       placeholder="e.g. 12347904"
//                       value={form.title_deed_no || ""}
//                       onChange={(e) => update("title_deed_no", e.target.value)}
//                     />
//                   </div>

//                   <div ref={propertyBoxRef} className="relative">
//                     <Label>BUILDING / PROJECT NAME</Label>
//                     <input
//                       className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
//                       placeholder={typedDistrictName ? "Select property" : "Select district first"}
//                       value={selectedProperty ? selectedProperty.property_name : propertyQuery}
//                       disabled={!typedDistrictName}
//                       onFocus={() => setPropertyOpen(true)}
//                       onChange={(e) => {
//                         const v = e.target.value;
//                         setPropertyQuery(v);
//                         setSelectedProperty(null);
//                         update("property_name", v);
//                         update("project_reference", v);
//                         update("project_name_en", v);
//                       }}
//                     />

//                     {propertyOpen && typedDistrictName && !selectedProperty ? (
//                       <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
//                         <div className="p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
//                           <div className="relative">
//                             <input
//                               className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] text-sm"
//                               placeholder="Search property..."
//                               value={propertyQuery}
//                               onChange={(e) => {
//                                 const v = e.target.value;
//                                 setPropertyQuery(v);
//                                 setSelectedProperty(null);
//                                 update("property_name", v);
//                                 update("project_reference", v);
//                                 update("project_name_en", v);
//                               }}
//                               autoFocus
//                             />

//                             {canAddTypedProperty ? (
//                               <button
//                                 type="button"
//                                 className="mt-2 w-full text-left px-3 py-2 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold hover:bg-orange-100"
//                                 onClick={() => {
//                                   const pn = norm(propertyQuery);
//                                   if (!pn) return;
//                                   const p = { property_name: pn };
//                                   setSelectedProperty(p);
//                                   setPropertyQuery(pn);
//                                   setPropertyOpen(false);
//                                   update("property_name", pn);
//                                   update("project_reference", pn);
//                                   update("project_name_en", pn);
//                                 }}
//                               >
//                                 + Use "{norm(propertyQuery)}" (add new)
//                               </button>
//                             ) : null}
//                           </div>
//                         </div>

//                         <div className="max-h-60 overflow-auto">
//                           {filteredProperties.length === 0 && !propertyLoading ? (
//                             <div className="px-4 py-3 text-sm text-gray-500">No properties found</div>
//                           ) : (
//                             filteredProperties.map((p) => (
//                               <button
//                                 key={p.property_name}
//                                 type="button"
//                                 className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50"
//                                 onClick={() => {
//                                   setSelectedProperty(p);
//                                   setPropertyQuery(p.property_name);
//                                   setPropertyOpen(false);
//                                   update("property_name", p.property_name);
//                                   update("project_reference", p.property_name);
//                                   update("project_name_en", p.property_name);
//                                 }}
//                               >
//                                 {p.property_name}
//                               </button>
//                             ))
//                           )}
//                         </div>
//                       </div>
//                     ) : null}
//                   </div>

//                   <div>
//                     <Label>PLOT NUMBER</Label>
//                     <input
//                       className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
//                       placeholder="enter plot number"
//                       value={form.plot_no || ""}
//                       onChange={(e) => update("plot_no", e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <Label>TENURE TYPE</Label>
//                     <div className="flex gap-2">
//                       {TITLE_DEED_TYPES.map((t) => (
//                         <ToggleBtnClean
//                           key={t}
//                           active={form.title_deed_type === t}
//                           onClick={() => update("title_deed_type", t)}
//                           label={t}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               </section>

//               {/* 03. VALUATION TYPE */}
//               <section className="space-y-4 pt-4 border-t border-gray-100">
//                 <h2 className="text-sm font-bold tracking-wider">03. VALUATION TYPE</h2>

//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                   {["MARKET VALUE", "RENTAL YIELD", "MORTGAGE APP.", "REINSTATEMENT"].map((x) => {
//                     const mapping = {
//                       "MARKET VALUE": "Current Market Value",
//                       "RENTAL YIELD": "Historical Property Value",
//                       "MORTGAGE APP.": "Verify Previous Valuation",
//                       REINSTATEMENT: "Current Market Value",
//                     };
//                     const formValue = mapping[x];
//                     return (
//                       <ToggleBtnClean
//                         key={x}
//                         active={form.valuation_type === formValue}
//                         onClick={() => update("valuation_type", formValue)}
//                         label={x}
//                       />
//                     );
//                   })}
//                 </div>
//               </section>

//               {/* 04. UNIT DETAILS */}
//               <section className="space-y-4 pt-4 border-t border-gray-100">
//                 <h2 className="text-sm font-bold tracking-wider">04. UNIT DETAILS</h2>

//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                   <div>
//                     <Label>APARTMENT NO.</Label>
//                     <input
//                       className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
//                       placeholder="e.g. 402"
//                       value={form.apartment_no || ""}
//                       onChange={(e) => update("apartment_no", e.target.value)}
//                     />
//                   </div>

//                   <div>
//                     <Label>
//                       SIZE <span className="text-[10px] text-[#B8763C] ml-1">SqFt ▼</span>
//                     </Label>
//                     <div className="relative flex">
//                       <input
//                         className="w-full h-11 bg-white border border-gray-200 rounded-l-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
//                         placeholder="Total Area"
//                         type="number"
//                         value={form.area_value}
//                         onChange={(e) => update("area_value", e.target.value)}
//                       />
//                       <select
//                         className="h-11 bg-gray-50 border border-l-0 border-gray-200 rounded-r-md px-2 text-xs focus:ring-0"
//                         value={form.area_unit}
//                         onChange={(e) => update("area_unit", e.target.value)}
//                       >
//                         <option value="sq.ft">Sq Ft</option>
//                         <option value="sq.m">Sq M</option>
//                       </select>
//                     </div>
//                   </div>

//                   <div>
//                     <Label>BEDROOMS</Label>
//                     <select
//                       className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
//                       value={String(form.bedrooms || "")}
//                       onChange={(e) => update("bedrooms", e.target.value)}
//                     >
//                       <option value="" disabled>
//                         3 Bedrooms
//                       </option>
//                       {BEDROOMS.map((x) => (
//                         <option key={x} value={x}>
//                           {x} Bedroom{x !== "1" ? "s" : ""}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <Label>BATHROOMS</Label>
//                     <select
//                       className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
//                       value={String(form.bathrooms || "")}
//                       onChange={(e) => update("bathrooms", e.target.value)}
//                     >
//                       <option value="" disabled>
//                         4 Bathrooms
//                       </option>
//                       {BATHROOMS.map((x) => (
//                         <option key={x} value={x}>
//                           {x} Bathroom{x !== "1" ? "s" : ""}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div>
//                   <Label>FURNISHING STATUS</Label>
//                   <div className="flex gap-2">
//                     {["Fully Furnished", "Semi-Furnished", "Unfurnished"].map((x) => {
//                       const mapping = {
//                         "Fully Furnished": "Furnished",
//                         "Semi-Furnished": "SemiFurnished",
//                         Unfurnished: "Unfurnished",
//                       };
//                       const formValue = mapping[x];
//                       return (
//                         <label key={x} className="flex items-center gap-2 cursor-pointer">
//                           <input
//                             type="radio"
//                             name="furnishing"
//                             checked={form.furnishing === formValue}
//                             onChange={() => update("furnishing", formValue)}
//                             className="w-4 h-4 text-[#B8763C] focus:ring-[#B8763C]"
//                           />
//                           <span className="text-sm">{x}</span>
//                         </label>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </section>

//               {/* 05. FEATURES & AMENITIES */}
//               <section className="space-y-4 pt-4 border-t border-gray-100">
//                 <h2 className="text-sm font-bold tracking-wider">05. FEATURES & AMENITIES</h2>

//                 <div className="flex flex-wrap gap-2">
//                   {[
//                     "SWIMMING POOL",
//                     "24 HOUR SECURITY",
//                     "GYMNASIUM",
//                     "COVERED PARKING",
//                     "PRIVATE GARDEN",
//                     "WATERFRONT VIEW",
//                     "SMART HOME TECH",
//                     "CONCIERGE",
//                   ].map((a) => {
//                     const on = (form.amenities || []).includes(a);
//                     return (
//                       <button
//                         key={a}
//                         type="button"
//                         onClick={() => toggleAmenity(a)}
//                         className={
//                           on
//                             ? "px-4 py-2 bg-[#B8763C] text-white rounded-full text-xs font-medium"
//                             : "px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-full text-xs font-medium hover:border-[#B8763C]"
//                         }
//                       >
//                         {a}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </section>

//               {/* Actions */}
//               <div className="pt-6 flex flex-col md:flex-row gap-4">
//                 <button
//                   type="button"
//                   onClick={onNext}
//                   className="flex-1 h-12 bg-[#B8763C] text-white rounded-md font-semibold text-sm hover:bg-[#A66A34] transition-colors flex items-center justify-center gap-2"
//                 >
//                   Get Free Valuation
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                   </svg>
//                 </button>

//                 <button
//                   type="button"
//                   onClick={onReset}
//                   className="px-8 h-12 bg-white border border-gray-200 text-gray-600 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors"
//                 >
//                   RESET ALL FIELDS
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="bg-white border-t border-gray-200">
//         <div className="max-w-6xl mx-auto px-6 py-12">
//           <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
//             <div className="md:col-span-2">
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="w-6 h-6 bg-black rounded flex items-center justifyContent-center text-white text-xs font-bold">
//                   A
//                 </div>
//                 <span className="text-lg font-bold">ACQAR</span>
//               </div>
//               <p className="text-xs text-gray-500 leading-relaxed">
//                 THIS GOLD STANDARD IN
//                 <br />
//                 DUBAI AI INTELLIGENT
//                 <br />
//                 PROPERTY VALUATION
//               </p>
//             </div>

//             <div>
//               <p className="text-[10px] font-bold text-gray-400 mb-3 tracking-wider">SERVICES</p>
//               <ul className="text-xs text-gray-600 space-y-2">
//                 <li>INSTANT VALUATION</li>
//                 <li>PORTFOLIO CARD</li>
//                 <li>YIELD PROJECTION</li>
//               </ul>
//             </div>

//             <div>
//               <p className="text-[10px] font-bold text-gray-400 mb-3 tracking-wider">COMPANY</p>
//               <ul className="text-xs text-gray-600 space-y-2">
//                 <li>DUBAI FMCG</li>
//                 <li>DUBAI MARKET</li>
//                 <li>PARTNERSHIPS</li>
//               </ul>
//             </div>

//             <div>
//               <p className="text-[10px] font-bold text-gray-400 mb-3 tracking-wider">SUPPORT</p>
//               <ul className="text-xs text-gray-600 space-y-2">
//                 <li>HELP DESK</li>
//                 <li>LEGAL TERMS</li>
//                 <li>CONTACT</li>
//               </ul>
//             </div>
//           </div>

//           <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
//             <div className="text-xs text-gray-400">© 2025 ACQARLABS. ALL RIGHTS RESERVED.</div>
//             <div className="flex gap-6 text-xs text-gray-400">
//               <span>PRIVACY POLICY</span>
//               <span>COOKIES</span>
//             </div>
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }

// // ---------- Small UI helpers ----------
// function Label({ children }) {
//   return <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">{children}</label>;
// }

// function ToggleBtnClean({ label, active, onClick }) {
//   const base =
//     "py-2.5 px-4 text-xs font-semibold rounded-md border transition-all text-center cursor-pointer select-none";
//   const act = "border-black bg-black text-white";
//   const inact = "border-gray-200 bg-white text-gray-600 hover:border-gray-300";
//   return (
//     <button type="button" onClick={onClick} className={[base, "flex-1", active ? act : inact].join(" ")}>
//       {label}
//     </button>
//   );
// }


// src/pages/ValuationForm.jsx


import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import { supabase } from "../lib/supabase";

// ✅ REPLACED: Header (your provided fixed header exactly)
function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const current = location.pathname;

  const navItems = [
    { label: "Products", path: "/" },
    { label: "Pricing", path: "/pricing" },
    { label: "Resources", path: "/resources" },
    { label: "About", path: "/about" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#D4D4D4] bg-white">
        <div className="hdrWrap max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
          {/* Logo */}
          <div
            className="hdrLogo flex items-center cursor-pointer shrink-0 whitespace-nowrap"
            onClick={() => navigate("/")}
          >
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-[#2B2B2B] uppercase whitespace-nowrap">
              ACQAR
            </h1>
          </div>

          {/* Mobile pricing */}
          <button
            onClick={() => navigate("/pricing")}
            className={`md:hidden text-[10px] font-black uppercase tracking-[0.2em] px-3 py-2 rounded-full ${
              current === "/pricing"
                ? "text-[#B87333] underline underline-offset-4"
                : "text-[#2B2B2B]/70"
            }`}
          >
            Pricing
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className={`text-sm font-semibold tracking-wide transition-colors hover:text-[#B87333] whitespace-nowrap ${
                  current === item.path ? "text-[#B87333]" : "text-[#2B2B2B]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right buttons */}
          <div className="hdrRight flex items-center gap-2 sm:gap-4 shrink-0 flex-nowrap">
            {/* ✅ MOBILE: Sign In */}
            <button
              onClick={() => navigate("/login")}
              className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
            >
              Sign In
            </button>

            {/* ✅ DESKTOP: Get Started ONLY on md+ */}
            <button
              onClick={() => navigate("/valuation")}
              className="hidden md:inline-flex hdrCta bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
            >
              Get Started
            </button>
          </div>
        </div>

        {/* Mobile spacing tweaks (unchanged) */}
        <style>{`
          @media (max-width: 420px){
            .hdrWrap{
              padding-left: 10px !important;
              padding-right: 10px !important;
              gap: 8px !important;
            }

            .hdrLogo h1{
              font-size: 18px !important;
              letter-spacing: -0.02em !important;
            }

            .hdrPricing{
              padding: 6px 10px !important;
              font-size: 9px !important;
              letter-spacing: 0.16em !important;
            }

            .hdrCta{
              padding: 9px 12px !important;
              font-size: 10px !important;
            }
          }

          @media (max-width: 360px){
            .hdrWrap{ gap: 6px !important; }

            .hdrPricing{
              padding: 6px 8px !important;
              letter-spacing: 0.12em !important;
            }

            .hdrCta{
              padding: 8px 10px !important;
              font-size: 10px !important;
            }
          }
        `}</style>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
}

// ✅ ADDED: small Icon helper (so Footer compiles)
function Icon({ name = "verified", size = "sm" }) {
  const px = size === "sm" ? 16 : 20;
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize: px,
        lineHeight: 1,
        color: "var(--accent-copper)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}

// ✅ REPLACED: Footer (your provided footer exactly)
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

  const lnk = {
    fontSize: ".75rem",
    color: "rgba(43,43,43,0.6)",
    fontWeight: 500,
    cursor: "pointer",
    listStyle: "none",
    transition: "color .2s",
    lineHeight: 1.5,
  };

  return (
    <footer
      style={{
        background: "var(--bg-off-white)",
        borderTop: "1px solid #e5e7eb",
        paddingTop: 64,
        paddingBottom: 28,
      }}
    >
      {/* TOP GRID */}
      <div className="container footer-grid">
        {/* Brand */}
        <div className="footer-brand-col">
          <span
            style={{
              display: "inline-block",
              fontSize: "1rem",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: ".04em",
              color: "var(--primary)",
              marginBottom: 14,
            }}
          >
            ACQAR
          </span>

          <p
            style={{
              fontSize: ".75rem",
              color: "rgba(43,43,43,0.6)",
              lineHeight: 1.7,
              marginBottom: 16,
              maxWidth: 260,
            }}
          >
            The world's first AI-powered property intelligence platform for Dubai real estate. Independent, instant,
            investment-grade.
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              background: "#fff",
              border: "1px solid #f3f4f6",
              borderRadius: 10,
              width: "fit-content",
              marginBottom: 16,
            }}
          >
            <Icon name="verified" size="sm" />
            <span
              style={{
                fontSize: ".56rem",
                fontWeight: 800,
                color: "rgba(43,43,43,0.85)",
                textTransform: "uppercase",
                letterSpacing: ".08em",
                whiteSpace: "nowrap",
              }}
            >
              RICS-Aligned Intelligence
            </span>
          </div>

          {/* Social (LinkedIn) */}
          <div style={{ display: "flex", gap: 12 }}>
            <a
              href="https://www.linkedin.com/company/acqar"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(43,43,43,0.4)",
                transition: "all .2s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent-copper)";
                e.currentTarget.style.borderColor = "var(--accent-copper)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(43,43,43,0.4)";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5S1.1 1 2.48 1c1.38 0 2.5 1.12 2.5 2.5zM0 8h5v16H0V8zm7.5 0h4.8v2.2h.1c.67-1.2 2.3-2.4 4.73-2.4C22.2 7.8 24 10.2 24 14.1V24h-5v-8.5c0-2-.04-4.6-2.8-4.6-2.8 0-3.2 2.2-3.2 4.4V24h-5V8z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Columns */}
        {cols.map(([title, items]) => (
          <div key={title} className="footer-col">
            <h6
              style={{
                fontWeight: 800,
                fontSize: ".8rem",
                marginBottom: 18,
                textTransform: "uppercase",
                letterSpacing: ".14em",
                color: "var(--primary)",
              }}
            >
              {title}
            </h6>

            <ul style={{ display: "flex", flexDirection: "column", gap: 12, padding: 0, margin: 0 }}>
              {items.map((item) => (
                <li
                  key={item}
                  style={lnk}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-copper)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(43,43,43,0.6)")}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* DIVIDER */}
      <div className="container" style={{ marginTop: 44 }}>
        <div style={{ height: 1, background: "#e5e7eb" }} />
      </div>

      {/* BOTTOM ROW */}
      <div className="container footer-bottom">
        <div className="footer-copy">
          <p
            style={{
              fontSize: ".56rem",
              fontWeight: 800,
              color: "rgba(43,43,43,0.4)",
              textTransform: "uppercase",
              letterSpacing: ".12em",
              margin: 0,
            }}
          >
            © 2025 ACQARLABS L.L.C-FZ. All rights reserved.
          </p>
          <p
            style={{
              fontSize: ".5rem",
              color: "rgba(43,43,43,0.3)",
              textTransform: "uppercase",
              marginTop: 3,
              marginBottom: 0,
            }}
          >
            TruValu™ is a registered trademark.
          </p>
        </div>

        <div className="footer-legal">
          {["Legal links", "Terms", "Privacy", "Cookies", "Security"].map((l) => (
            <a
              key={l}
              href="#"
              className="footer-legal-link"
              style={{
                fontSize: ".56rem",
                fontWeight: 800,
                color: "rgba(43,43,43,0.4)",
                textTransform: "uppercase",
                letterSpacing: ".12em",
                textDecoration: "none",
                transition: "color .2s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(43,43,43,0.4)")}
            >
              {l}
            </a>
          ))}
        </div>
      </div>

      {/* RESPONSIVE CSS (matches your screenshots) */}
      <style>{`
        /* Ensure a container exists even if your app doesn't define it */
        .container{
          max-width: 80rem;
          margin-left: auto;
          margin-right: auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        @media (min-width: 640px){
          .container{ padding-left: 1.5rem; padding-right: 1.5rem; }
        }

        /* Desktop: Brand + 4 columns like screenshot */
        .footer-grid{
          display:grid;
          grid-template-columns: 1.3fr 1fr 1fr 1fr 1fr;
          gap: 56px;
          align-items:start;
        }

        /* Bottom row: left copy + right legal links */
        .footer-bottom{
          margin-top: 18px;
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap: 24px;
        }

        .footer-legal{
          display:flex;
          align-items:center;
          gap: 26px;
          justify-content:flex-end;
          flex-wrap:wrap;
        }

        /* Mobile: stacked like your screenshots */
        @media (max-width: 768px){
          footer{ padding-top: 40px !important; }

          .footer-grid{
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }

          .footer-brand-col p{ max-width: 100% !important; }

          .footer-bottom{
            flex-direction:column;
            align-items:center;
            text-align:center;
            gap: 14px;
          }

          .footer-legal{
            justify-content:center;
            gap: 18px;
          }

          /* Helps "SECURITY" drop to next line if needed like screenshot */
          .footer-legal-link{
            display:inline-block;
            padding: 2px 0;
          }
        }
      `}</style>
    </footer>
  );
}

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
async function ensureDistrictExists({ district_name, district_code }) {
  const dn = norm(district_name);
  if (!dn) return { district_code: "", district_name: "" };

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

// ✅ insert valuation snapshot (store ID for Report update)
async function insertValuationRow(row) {
  const { data, error } = await supabase.from("valuations").insert([row]).select("id").single();
  if (error) throw error;
  return data?.id;
}

// ✅ safe JSON parse (kept)
function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// ✅ create small deterministic signature for report cache
function stableStringify(obj) {
  const seen = new WeakSet();
  return JSON.stringify(obj, function (k, v) {
    if (v && typeof v === "object") {
      if (seen.has(v)) return;
      seen.add(v);
      if (Array.isArray(v)) return v;
      return Object.keys(v)
        .sort()
        .reduce((acc, key) => {
          acc[key] = v[key];
          return acc;
        }, {});
    }
    return v;
  });
}
function hashLike(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return String(h);
}

// ---------- Constants ----------
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

// ✅ localStorage keys
const LS_FORM_KEY = "truvalu_formData_v1";
const LS_VAL_ROW_ID = "truvalu_valuation_row_id";
const LS_REPORT_KEY = "truvalu_reportData_v1";
const LS_REPORT_META = "truvalu_report_meta_v1"; // { formHash }
const LS_PENDING_INSERT = "truvalu_pending_valuation_insert_v1"; // optional fallback

const HIDE_MAP_UI = true; // set false if you want it back

// ✅ NEW: default form (used to clear UI after success)
const DEFAULT_FORM = {
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
};

// ✅ requirement #1: graph hidden (code present, UI hidden)
const HIDE_GRAPHS_BUT_KEEP_CODE = true;

// ---------- Component ----------
export default function ValuationForm({ formData, setFormData }) {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  // ✅ auth state to drive routing + hide header
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      const { data } = await supabase.auth.getSession();
      const sess = data?.session || null;
      if (!mounted) return;
      setIsLoggedIn(!!sess);
      setSessionUser(sess?.user || null);
    }

    boot();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setIsLoggedIn(!!sess);
      setSessionUser(sess?.user || null);
    });

    return () => {
      mounted = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  // ✅ CHANGED: use DEFAULT_FORM so we can clear UI after success
  const [form, setForm] = useState(formData || DEFAULT_FORM);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const isDubaiFlow = form.country === "United Arab Emirates" && form.city === "Dubai";

  // -------- Districts --------
  const [districtOpen, setDistrictOpen] = useState(false);
  const districtBoxRef = useRef(null);
  const [districtQuery, setDistrictQuery] = useState("");
  const dQ = useDebounced(districtQuery, 250);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [districtResults, setDistrictResults] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  // -------- Properties --------
  const [propertyOpen, setPropertyOpen] = useState(false);
  const propertyBoxRef = useRef(null);
  const [propertyQuery, setPropertyQuery] = useState("");
  const pQ = useDebounced(propertyQuery, 150);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [propertyResults, setPropertyResults] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // -------- Amenities --------
  const [featuresOpen, setFeaturesOpen] = useState(true);
  const [featureSearch, setFeatureSearch] = useState("");
  const fQ = useDebounced(featureSearch, 200);

  const computedSqm = useMemo(() => toSqm(form.area_value, form.area_unit), [form.area_value, form.area_unit]);

  const typedDistrictName = norm(selectedDistrict?.district_name || districtQuery || form.district_name);

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

  // ✅ NEW: clear UI after successful valuation (does NOT delete localStorage / report)
  function clearUiAfterSuccessfulValuation() {
    setSelectedDistrict(null);
    setDistrictQuery("");
    setDistrictResults([]);
    setDistrictOpen(false);

    setSelectedProperty(null);
    setPropertyQuery("");
    setPropertyResults([]);
    setPropertyOpen(false);

    setFeaturesOpen(true);
    setFeatureSearch("");

    setForm(DEFAULT_FORM);
    setFormData?.(null);
  }

  useEffect(() => {
    function onDown(e) {
      if (districtBoxRef.current && !districtBoxRef.current.contains(e.target)) setDistrictOpen(false);
      if (propertyBoxRef.current && !propertyBoxRef.current.contains(e.target)) setPropertyOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

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

  const filteredDistricts = useMemo(() => {
    const q = (districtQuery || "").trim().toLowerCase();
    if (!q) return districtResults;
    return districtResults.filter((d) => (d.district_name || "").toLowerCase().includes(q));
  }, [districtQuery, districtResults]);

  const canAddTypedDistrict = useMemo(() => {
    const dn = norm(districtQuery);
    if (!dn) return false;
    const exists = (districtResults || []).some((d) => norm(d.district_name).toLowerCase() === dn.toLowerCase());
    return !exists;
  }, [districtQuery, districtResults]);

  useEffect(() => {
    let alive = true;
    async function run() {
      if (!propertyOpen) return;

      const districtForLookup = selectedDistrict?.district_name
        ? selectedDistrict
        : typedDistrictName
        ? { district_code: "", district_name: typedDistrictName }
        : null;

      if (!districtForLookup) return;

      setPropertyLoading(true);
      setError("");

      let query = supabase
        .from("district_properties")
        .select("property_name")
        .order("property_name", { ascending: true })
        .range(0, 9999)
        .not("property_name", "is", null)
        .neq("property_name", "");

      if (districtForLookup.district_code) query = query.eq("district_code", districtForLookup.district_code);
      else query = query.eq("district_name", districtForLookup.district_name);

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
  }, [propertyOpen, selectedDistrict, typedDistrictName]);

  const filteredProperties = useMemo(() => {
    const q = (pQ || "").trim().toLowerCase();
    if (!q) return propertyResults;
    return propertyResults.filter((x) => (x.property_name || "").toLowerCase().includes(q));
  }, [pQ, propertyResults]);

  const canAddTypedProperty = useMemo(() => {
    const pn = norm(propertyQuery);
    if (!pn) return false;
    const exists = (propertyResults || []).some((p) => norm(p.property_name).toLowerCase() === pn.toLowerCase());
    return !exists;
  }, [propertyQuery, propertyResults]);

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

  // ---------- Submit ----------
  const onNext = async () => {
    setError("");

    const { data: sessData } = await supabase.auth.getSession();
    const sessNow = sessData?.session || null;
    const loggedInNow = !!sessNow;
    const userNow = sessNow?.user || null;

    setIsLoggedIn(loggedInNow);
    setSessionUser(userNow);

    if (!isDubaiFlow) {
      setError("Please select Country: United Arab Emirates and City: Dubai.");
      return;
    }

    const finalDistrictName = norm(selectedDistrict?.district_name || districtQuery || form.district_name);
    if (!finalDistrictName) {
      setError("Please select a District.");
      return;
    }

    const chosenProperty = norm(selectedProperty?.property_name || propertyQuery || form.property_name);
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
      const ensuredDistrict = await ensureDistrictExists({
        district_name: finalDistrictName,
        district_code: selectedDistrict?.district_code || form.district_code || "",
      });

      await ensureDistrictPropertyExists({
        district_code: ensuredDistrict.district_code,
        district_name: ensuredDistrict.district_name,
        property_name: chosenProperty,
      });

      const payload = {
        ...form,
        procedure_area: Number(computedSqm),
        rooms_en: Number(form.bedrooms || 0),
        district_code: ensuredDistrict?.district_code || "",
        district_name: ensuredDistrict?.district_name || "",
        property_name: chosenProperty,
        area_name_en: ensuredDistrict?.district_name || "",
        project_name_en: chosenProperty,
        project_reference: chosenProperty,
        building_name_en: form.building_name || "",
      };

      localStorage.setItem(LS_FORM_KEY, JSON.stringify(payload));
      setFormData(payload);

      const formHash = hashLike(stableStringify(payload));
      localStorage.setItem(LS_REPORT_META, JSON.stringify({ formHash }));

      const userId = userNow?.id || null;
      const nameGuess =
        (userNow?.user_metadata?.name ||
          userNow?.user_metadata?.full_name ||
          userNow?.email?.split("@")?.[0] ||
          "") || null;

      const row = {
        user_id: userId,
        name: nameGuess,
        district: payload.district_name || "",
        property_name: payload.property_name || "",
        building_name: payload.building_name || "",
        title_deed_no: payload.title_deed_no || "",
        title_deed_type: payload.title_deed_type || "",
        plot_no: payload.plot_no || "",

        valuation_type: payload.valuation_type || "",
        valuation_type_selection: payload.valuation_type || "",
        property_category: payload.property_category || "",
        purpose_of_valuation: payload.purpose_of_valuation || "",
        property_current_status: payload.property_status || "",

        apartment_no: payload.apartment_no || "",
        apartment_size: payload.area_value || "",
        apartment_size_unit: payload.area_unit || "",
        last_renovated_on: payload.last_renovated_on || null,
        floor_level: payload.floor_level || "",

        furnishing_type: payload.furnishing || "",
        bedroom: payload.bedrooms || "",
        bathroom: payload.bathrooms || "",
        property_type: payload.property_type_en || "",
        unit: payload.property_name_unit || "",

        features: Array.isArray(payload.amenities) ? payload.amenities : [],
        form_payload: payload,
        updated_at: new Date().toISOString(),
      };

      try {
        const valuationRowId = await insertValuationRow(row);
        if (valuationRowId) localStorage.setItem(LS_VAL_ROW_ID, String(valuationRowId));
      } catch (dbErr) {
        console.warn("Valuations insert blocked (likely RLS). Keeping flow:", dbErr?.message);
        localStorage.removeItem(LS_VAL_ROW_ID);
        localStorage.setItem(LS_PENDING_INSERT, JSON.stringify(row));
      }

      clearUiAfterSuccessfulValuation();

      if (loggedInNow) navigate("/report");
      else navigate("/valucheck");
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
      ...DEFAULT_FORM,
      address_search: "",
      plot_no: "",
      property_status: "Owner Occupied",
      furnishing: "Unfurnished",
    });

    localStorage.removeItem(LS_FORM_KEY);
    localStorage.removeItem(LS_VAL_ROW_ID);
    localStorage.removeItem(LS_PENDING_INSERT);
  };

  return (
    <div className="bg-[#F8F8F8] text-gray-900 font-sans min-h-screen">
      {/* ✅ show NEW Header only when NOT logged in (same behavior as before) */}
      {!isLoggedIn ? <Header /> : null}

      {/* ✅ keep your old NavBar behavior when logged out? (REPLACED by Header) */}
      {/* {!isLoggedIn ? <NavBar /> : null} */}

      {/* ✅ IMPORTANT: removed top padding because Header is fixed + includes spacer */}
      <main className="pb-12 sm:pb-16 md:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 sm:mb-3">
              Property Details
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Please provide the structural and legal specifications of your asset
              <br className="hidden sm:block" />
              for a RICS-standard AI valuation.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="h-[2px] flex-1 bg-gray-200 relative">
                <div className="absolute left-0 top-0 h-full w-1/2 bg-[#B8763C]" />
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">PROGRESS</span>
              <span className="text-sm font-bold">Step 2 of 4</span>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 md:p-8 space-y-8">
              {error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm font-semibold">
                  {error}
                </div>
              ) : null}

              {/* Map Section
              <section className="relative rounded-lg overflow-hidden border border-gray-200 h-[220px] sm:h-[280px] bg-gray-100">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[92%] sm:w-[90%] md:w-[70%] z-10">
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </span>
                    <input
                      className="w-full h-11 sm:h-12 bg-white border-none shadow-lg rounded-lg px-11 pr-10 text-sm focus:ring-2 focus:ring-[#B8763C] focus:outline-none"
                      type="text"
                      value={form.address_search || ""}
                      onChange={(e) => update("address_search", e.target.value)}
                      placeholder="Search by Building Name, Area or Community..."
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-6 sm:h-6 rounded-full flex items-center justify-center hover:bg-gray-100"
                      aria-label="locate"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-5xl">📍</div>
                </div>
              </section> */}

              {/* 01. LOCATION */}
     <section className="space-y-4">
  <h2 className="text-sm font-bold tracking-wider">01. LOCATION</h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {/* COUNTRY */}
    <div>
      <Label>COUNTRY</Label>
      <select
        className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
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

    {/* CITY */}
    <div>
      <Label>CITY</Label>
      <select
        className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
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

    {/* DISTRICT */}
    <div ref={districtBoxRef} className="relative">
      <Label>DISTRICT / AREA</Label>

      <input
        className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
        placeholder={isDubaiFlow ? "Select district" : "Select UAE + Dubai first"}
        value={selectedDistrict ? selectedDistrict.district_name : districtQuery}
        disabled={!isDubaiFlow}
        onFocus={() => setDistrictOpen(true)}
        onChange={(e) => {
          const v = e.target.value;
          setDistrictQuery(v);
          setSelectedDistrict(null);

          // reset property
          setSelectedProperty(null);
          setPropertyQuery("");
          setPropertyResults([]);
          setPropertyOpen(false);

          update("district_code", "");
          update("district_name", v);
          update("area_name_en", v);
        }}
      />

      {/* ✅ Mobile-friendly anchored dropdown */}
      {districtOpen && isDubaiFlow && !selectedDistrict ? (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
            <input
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] text-sm"
              placeholder="Search district..."
              value={districtQuery}
              onChange={(e) => {
                const v = e.target.value;
                setDistrictQuery(v);
                setSelectedDistrict(null);

                // reset property
                setSelectedProperty(null);
                setPropertyQuery("");
                setPropertyResults([]);
                setPropertyOpen(false);

                update("district_code", "");
                update("district_name", v);
                update("area_name_en", v);
              }}
              autoFocus
            />

            {canAddTypedDistrict ? (
              <button
                type="button"
                className="mt-2 w-full text-left px-3 py-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold hover:bg-orange-100"
                onClick={() => {
                  const dn = norm(districtQuery);
                  if (!dn) return;
                  const d = { district_code: "", district_name: dn };
                  setSelectedDistrict(d);
                  setDistrictQuery(dn);
                  setDistrictOpen(false);

                  update("district_code", "");
                  update("district_name", dn);
                  update("area_name_en", dn);

                  // reset property
                  setSelectedProperty(null);
                  setPropertyQuery("");
                  setPropertyResults([]);
                  setPropertyOpen(false);
                }}
              >
                + Use "{norm(districtQuery)}" (add new)
              </button>
            ) : null}
          </div>

          <div className="max-h-64 overflow-auto overscroll-contain">
            {filteredDistricts.length === 0 && !districtLoading ? (
              <div className="px-4 py-3 text-sm text-gray-500">No districts found</div>
            ) : (
              filteredDistricts.map((d) => (
                <button
                  key={`${d.district_code}-${d.district_name}`}
                  type="button"
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 active:bg-gray-100"
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

          <div className="sm:hidden border-t border-gray-100 p-2 bg-white">
            <button
              type="button"
              onClick={() => setDistrictOpen(false)}
              className="w-full h-10 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white active:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>

    {/* BUILDING / PROPERTY (same dropdown logic as district) */}
    {/* BUILDING / PROPERTY (UI same as District) */}
<div ref={propertyBoxRef} className="relative">
  <Label>BUILDING / PROPERTY</Label>

  <input
    className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
    placeholder={selectedDistrict ? "Select building / property" : "Select district first"}
    value={selectedProperty ? selectedProperty.property_name : propertyQuery}
    disabled={!isDubaiFlow || !selectedDistrict}
    onFocus={() => {
      if (!isDubaiFlow || !selectedDistrict) return;
      setPropertyOpen(true);
    }}
    onChange={(e) => {
      const v = e.target.value;
      setPropertyQuery(v);
      setSelectedProperty(null);

      // keep same behavior: update form fields for typed value
      update("property_code", "");
      update("property_name", v);
      update("building_name", v);
    }}
  />

  {/* ✅ Anchored dropdown exactly like District */}
  {propertyOpen && isDubaiFlow && selectedDistrict && !selectedProperty ? (
    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
      <div className="p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        <input
          className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] text-sm"
          placeholder="Search property..."
          value={propertyQuery}
          onChange={(e) => {
            const v = e.target.value;
            setPropertyQuery(v);
            setSelectedProperty(null);

            update("property_code", "");
            update("property_name", v);
            update("building_name", v);
          }}
          autoFocus
        />

        {canAddTypedProperty ? (
          <button
            type="button"
            className="mt-2 w-full text-left px-3 py-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold hover:bg-orange-100"
            onClick={() => {
              const pn = norm(propertyQuery);
              if (!pn) return;

              const p = { property_code: "", property_name: pn };
              setSelectedProperty(p);
              setPropertyQuery(pn);
              setPropertyOpen(false);

              update("property_code", "");
              update("property_name", pn);
              update("building_name", pn);
            }}
          >
            + Use "{norm(propertyQuery)}" (add new)
          </button>
        ) : null}
      </div>

      <div className="max-h-64 overflow-auto overscroll-contain">
        {propertyResults.length === 0 && !propertyLoading ? (
          <div className="px-4 py-3 text-sm text-gray-500">No properties found</div>
        ) : (
          propertyResults.map((p) => (
            <button
              key={`${p.property_code}-${p.property_name}`}
              type="button"
              className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 active:bg-gray-100"
              onClick={() => {
                setSelectedProperty(p);
                setPropertyQuery(p.property_name);
                setPropertyOpen(false);

                update("property_code", p.property_code || "");
                update("property_name", p.property_name || "");
                update("building_name", p.property_name || "");
              }}
            >
              {p.property_name}
            </button>
          ))
        )}
      </div>

      <div className="sm:hidden border-t border-gray-100 p-2 bg-white">
        <button
          type="button"
          onClick={() => setPropertyOpen(false)}
          className="w-full h-10 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700 bg-white active:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  ) : null}
</div>



  </div>
</section>




              {/* 02. PROPERTY SPECIFICATIONS */}
              <section className="space-y-4 pt-4 border-t border-gray-100">
                <h2 className="text-sm font-bold tracking-wider">02. PROPERTY SPECIFICATIONS</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>TITLE DEED NUMBER</Label>
                    <input
                      className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
                      placeholder="e.g. 12347904"
                      value={form.title_deed_no || ""}
                      onChange={(e) => update("title_deed_no", e.target.value)}
                    />
                  </div>

                  <div ref={propertyBoxRef} className="relative">
                    <Label>BUILDING / PROJECT NAME</Label>
                    <input
                      className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
                      placeholder={typedDistrictName ? "Select property" : "Select district first"}
                      value={selectedProperty ? selectedProperty.property_name : propertyQuery}
                      disabled={!typedDistrictName}
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

                    {propertyOpen && typedDistrictName && !selectedProperty ? (
                      <div className="fixed left-3 right-3 top-[76px] sm:absolute sm:left-0 sm:right-auto sm:top-auto sm:w-full z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        <div className="p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
                          <div className="relative">
                            <input
                              className="w-full h-9 px-3 bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] text-sm"
                              placeholder="Search property..."
                              value={propertyQuery}
                              onChange={(e) => {
                                const v = e.target.value;
                                setPropertyQuery(v);
                                setSelectedProperty(null);
                                update("property_name", v);
                                update("project_reference", v);
                                update("project_name_en", v);
                              }}
                              autoFocus
                            />

                            {canAddTypedProperty ? (
                              <button
                                type="button"
                                className="mt-2 w-full text-left px-3 py-2 rounded-md bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold hover:bg-orange-100"
                                onClick={() => {
                                  const pn = norm(propertyQuery);
                                  if (!pn) return;
                                  const p = { property_name: pn };
                                  setSelectedProperty(p);
                                  setPropertyQuery(pn);
                                  setPropertyOpen(false);
                                  update("property_name", pn);
                                  update("project_reference", pn);
                                  update("project_name_en", pn);
                                }}
                              >
                                + Use "{norm(propertyQuery)}" (add new)
                              </button>
                            ) : null}
                          </div>
                        </div>

                        <div className="max-h-[50vh] sm:max-h-60 overflow-auto">
                          {filteredProperties.length === 0 && !propertyLoading ? (
                            <div className="px-4 py-3 text-sm text-gray-500">No properties found</div>
                          ) : (
                            filteredProperties.map((p) => (
                              <button
                                key={p.property_name}
                                type="button"
                                className="w-full text-left px-4 py-3 sm:py-2.5 text-sm hover:bg-gray-50"
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

                        <div className="sm:hidden border-t border-gray-100 p-2">
                          <button
                            type="button"
                            onClick={() => setPropertyOpen(false)}
                            className="w-full h-10 rounded-md border border-gray-200 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>

                 <div>
  <Label>PLOT NUMBER</Label>

  <input
    className="
      w-full h-12
      bg-white border border-gray-200
      rounded-lg
      px-3 text-sm
      placeholder:text-gray-400
      focus:ring-2 focus:ring-[#B8763C]/30
      focus:border-[#B8763C]
      transition-all
    "
    placeholder="Enter plot number"
    
    // ✅ always show placeholder visually
    value="" 

    // ✅ still save value in state
    onChange={(e) => update("plot_no", e.target.value)}
  />
</div>


                  <div>
                    <Label>TENURE TYPE</Label>
                    <div className="flex flex-wrap gap-2">
                      {TITLE_DEED_TYPES.map((t) => (
                        <ToggleBtnClean key={t} active={form.title_deed_type === t} onClick={() => update("title_deed_type", t)} label={t} />
                      ))}
                    </div>
                  </div>
                </div>
              </section>

               {/* 03. VALUATION TYPE */}
              <section className="space-y-4 pt-4 border-t border-gray-100">
                <h2 className="text-sm font-bold tracking-wider">03. VALUATION TYPE</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  {["MARKET VALUE", "RENTAL YIELD", "MORTGAGE APP.", "REINSTATEMENT"].map((x) => {
    const mapping = {
      "MARKET VALUE": "Current Market Value",
      "RENTAL YIELD": "Historical Property Value",
      "MORTGAGE APP.": "Verify Previous Valuation",
      "REINSTATEMENT": "Reinstatement Value", // ✅ unique
    };

    const formValue = mapping[x];

    return (
      <ToggleBtnClean
        key={x}
        active={form.valuation_type === formValue}
        onClick={() => update("valuation_type", formValue)}
        label={x}
      />
    );
  })}
</div>

              </section>


             {/* 04. UNIT DETAILS */}
              <section className="space-y-4 pt-4 border-t border-gray-100">
                <h2 className="text-sm font-bold tracking-wider">04. UNIT DETAILS</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>APARTMENT NO.</Label>
                    <input
                      className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
                      placeholder="e.g. 402"
                      value={form.apartment_no || ""}
                      onChange={(e) => update("apartment_no", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>
                      SIZE <span className="text-[10px] text-[#B8763C] ml-1">SqFt ▼</span>
                    </Label>
                    <div className="relative flex">
                      <input
                        className="w-full h-11 bg-white border border-gray-200 rounded-l-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
                        placeholder="Total Area"
                        type="number"
                        value={form.area_value}
                        onChange={(e) => update("area_value", e.target.value)}
                      />
                      <select
                        className="h-11 bg-gray-50 border border-l-0 border-gray-200 rounded-r-md px-2 text-xs focus:ring-0"
                        value={form.area_unit}
                        onChange={(e) => update("area_unit", e.target.value)}
                      >
                        <option value="sq.ft">Sq Ft</option>
                        <option value="sq.m">Sq M</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label>BEDROOMS</Label>
                    <select
                      className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
                      value={String(form.bedrooms || "")}
                      onChange={(e) => update("bedrooms", e.target.value)}
                    >
                      <option value="" disabled>
                        0 Bedrooms
                      </option>
                      {BEDROOMS.map((x) => (
                        <option key={x} value={x}>
                          {x} Bedroom{x !== "1" ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label>BATHROOMS</Label>
                    <select
                      className="w-full h-11 bg-white border border-gray-200 rounded-md focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] px-3 text-sm"
                      value={String(form.bathrooms || "")}
                      onChange={(e) => update("bathrooms", e.target.value)}
                    >
                      <option value="" disabled>
                        0 Bathrooms
                      </option>
                      {BATHROOMS.map((x) => (
                        <option key={x} value={x}>
                          {x} Bathroom{x !== "1" ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <Label>FURNISHING STATUS</Label>
                  {/* ✅ Mobile responsiveness: wrap */}
                  <div className="flex flex-wrap gap-3">
                    {["Fully Furnished", "Semi-Furnished", "Unfurnished"].map((x) => {
                      const mapping = {
                        "Fully Furnished": "Furnished",
                        "Semi-Furnished": "SemiFurnished",
                        Unfurnished: "Unfurnished",
                      };
                      const formValue = mapping[x];
                      return (
                        <label key={x} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="furnishing"
                            checked={form.furnishing === formValue}
                            onChange={() => update("furnishing", formValue)}
                            className="w-4 h-4 text-[#B8763C] focus:ring-[#B8763C]"
                          />
                          <span className="text-sm">{x}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </section>

              {/* 05. FEATURES & AMENITIES */}
<section className="space-y-4 pt-4 border-t border-gray-100">
  <h2 className="text-sm font-bold tracking-wider">05. FEATURES & AMENITIES</h2>

  {/* Search */}
  <div className="relative">
    <input
      type="text"
      value={featureSearch}
      onChange={(e) => setFeatureSearch(e.target.value)}
      placeholder="Search amenities..."
      className="w-full h-11 bg-white border border-gray-200 rounded-md px-10 text-sm focus:ring-1 focus:ring-[#B8763C] focus:border-[#B8763C] outline-none"
    />
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </span>

    {featureSearch ? (
      <button
        type="button"
        onClick={() => setFeatureSearch("")}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        aria-label="clear amenities search"
      >
        ✕
      </button>
    ) : null}
  </div>

  {/* Scroll container */}
  <div className="rounded-lg border border-gray-200 bg-white">
    <div className="max-h-64 overflow-y-auto p-3">
      <div className="flex flex-wrap gap-2">
        {(filteredAmenities || []).map((a) => {
          const on = (form.amenities || []).includes(a);
          return (
            <button
              key={a}
              type="button"
              onClick={() => toggleAmenity(a)}
              className={
                on
                  ? "px-3 sm:px-4 py-2 bg-[#B8763C] text-white rounded-full text-[11px] sm:text-xs font-medium"
                  : "px-3 sm:px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-full text-[11px] sm:text-xs font-medium hover:border-[#B8763C]"
              }
            >
              {a}
            </button>
          );
        })}

        {filteredAmenities?.length === 0 ? (
          <div className="text-sm text-gray-500 px-1 py-2">No amenities found.</div>
        ) : null}
      </div>
    </div>
  </div>
</section>


              {/* Actions */}
              <div className="pt-6 flex flex-col md:flex-row gap-4">
                
  <button
    type="button"
    onClick={onNext}
    className="
      w-full
      h-14 md:h-12
      bg-gradient-to-r from-[#B8763C] to-[#C98945]
      text-white
      rounded-xl
      font-bold
      text-[15px] md:text-sm
      tracking-wide
      shadow-lg shadow-[#B8763C]/30
      active:scale-[0.98]
      hover:shadow-xl
      transition-all
      duration-200
      flex items-center justify-center gap-2
    "
  >
    Get Free Valuation

    <svg
      className="w-5 h-5 md:w-4 md:h-4 transition-transform group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>



                <button
                  type="button"
                  onClick={onReset}
                  className="px-8 h-12 bg-white border border-gray-200 text-gray-600 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  RESET ALL FIELDS
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ✅ REPLACED Footer */}
      <Footer />
    </div>
  );
}

// ---------- Small UI helpers ----------
function Label({ children }) {
  return <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">{children}</label>;
}

function ToggleBtnClean({ label, active, onClick }) {
  const base = "py-2.5 px-4 text-xs font-semibold rounded-md border transition-all text-center cursor-pointer select-none";
  const act = "border-black bg-black text-white";
  const inact = "border-gray-200 bg-white text-gray-600 hover:border-gray-300";

  return (
    <button
      type="button"
      onClick={onClick}
      className={[base, "flex-1 min-w-[120px] sm:min-w-0", active ? act : inact].join(" ")}
    >
      {label}
    </button>
  );
}
