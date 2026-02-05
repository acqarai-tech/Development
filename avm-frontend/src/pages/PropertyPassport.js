// // src/pages/PropertyPassport.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import "../styles/passport.css";

// const BUCKET = "passport_docs";

// const CATEGORIES = [
//   { key: "Legal & Ownership", icon: "📁" },
//   { key: "Contracts", icon: "📄" },
//   { key: "Financials", icon: "💳" },
//   { key: "Maintenance", icon: "🛠" },
//   { key: "Other", icon: "🗂" },
// ];

// function fmtAED(n) {
//   const x = Number(n);
//   if (!Number.isFinite(x)) return "—";
//   if (x >= 1_000_000) return `AED ${(x / 1_000_000).toFixed(2)}M`;
//   return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
// }

// function fmtDateAgo(iso) {
//   if (!iso) return "—";
//   const d = new Date(iso);
//   const diff = Date.now() - d.getTime();
//   if (!Number.isFinite(diff)) return "—";
//   const days = Math.floor(diff / (1000 * 60 * 60 * 24));
//   if (days <= 0) return "Updated today";
//   if (days === 1) return "Updated 1 day ago";
//   if (days < 30) return `Updated ${days} days ago`;
//   const months = Math.floor(days / 30);
//   return months === 1 ? "Updated 1 month ago" : `Updated ${months} months ago`;
// }

// export default function PropertyPassport() {
//   const navigate = useNavigate();
//   const [params] = useSearchParams();
//   const valuationIdRaw = params.get("id"); // /passport?id=19
//   const valuationIdNum = valuationIdRaw ? Number(valuationIdRaw) : null;

//   const [loading, setLoading] = useState(true);
//   const [msg, setMsg] = useState("");

//   const [user, setUser] = useState(null);

//   // LIST MODE
//   const [portfolio, setPortfolio] = useState([]);

//   // DETAIL MODE
//   const [valuation, setValuation] = useState(null);
//   const [docs, setDocs] = useState([]);
//   const [audit, setAudit] = useState([]);

//   // upload
//   const [uploading, setUploading] = useState(false);
//   const [upCategory, setUpCategory] = useState("Legal & Ownership");
//   const [upTitle, setUpTitle] = useState("");
//   const [upFile, setUpFile] = useState(null);

//   // secure share
//   const [secureUrl, setSecureUrl] = useState("");

//   const isDetailMode = Number.isFinite(valuationIdNum);

//   const grouped = useMemo(() => {
//     const m = new Map();
//     CATEGORIES.forEach((c) => m.set(c.key, []));
//     (docs || []).forEach((d) => {
//       const k = d.category || "Other";
//       if (!m.has(k)) m.set(k, []);
//       m.get(k).push(d);
//     });
//     for (const [k, arr] of m.entries()) {
//       arr.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
//       m.set(k, arr);
//     }
//     return m;
//   }, [docs]);

//   const passportTitle = useMemo(() => {
//     const p = (valuation?.property_name || "").trim();
//     const b = (valuation?.building_name || "").trim();
//     const name = p || b || "Property";
//     // show "Unit 1205" style if property_name includes it; else use district
//     const district = (valuation?.district || "").trim();
//     return { name, district };
//   }, [valuation]);

//   const passportId = useMemo(() => {
//     const v = Number(valuationIdNum);
//     if (!Number.isFinite(v)) return "AQ-0000-DXB";
//     return `AQ-${String(8800 + v).padStart(4, "0")}-DXB`;
//   }, [valuationIdNum]);

//   const portfolioHealth = useMemo(() => {
//     const count = docs?.length || 0;
//     if (count >= 8) return 96;
//     if (count >= 6) return 92;
//     if (count >= 4) return 88;
//     if (count >= 2) return 80;
//     return 72;
//   }, [docs]);

//   // =========================
//   // LOAD (LIST OR DETAIL)
//   // =========================
//   useEffect(() => {
//     let alive = true;

//     async function load() {
//       try {
//         setLoading(true);
//         setMsg("");

//         const { data: uData, error: uErr } = await supabase.auth.getUser();
//         if (uErr) throw uErr;

//         if (!uData?.user?.id) {
//           navigate("/login");
//           return;
//         }
//         if (!alive) return;
//         setUser(uData.user);

//         // LIST MODE
//         if (!isDetailMode) {
//           const { data: vRows, error: vErr } = await supabase
//             .from("valuations")
//             .select("id, property_name, building_name, district, created_at, estimated_valuation")
//             .eq("user_id", uData.user.id)
//             .order("created_at", { ascending: false })
//             .limit(50);

//           if (vErr) throw vErr;

//           if (!alive) return;
//           setPortfolio(vRows || []);
//           setLoading(false);
//           return;
//         }

//         // DETAIL MODE
//         const { data: vRow, error: vErr } = await supabase
//           .from("valuations")
//           .select("id, user_id, district, property_name, building_name, estimated_valuation, created_at, updated_at")
//           .eq("id", Number(valuationIdNum))
//           .maybeSingle();

//         if (vErr) throw vErr;

//         if (vRow?.user_id && vRow.user_id !== uData.user.id) {
//           setMsg("You do not have access to this property.");
//           setLoading(false);
//           return;
//         }

//         if (!alive) return;
//         setValuation(vRow || null);

//         const { data: dRows, error: dErr } = await supabase
//           .from("passport_documents")
//           .select("id, valuation_id, user_id, category, title, file_path, file_size_kb, status, updated_at, created_at")
//           .eq("valuation_id", Number(valuationIdNum))
//           .order("updated_at", { ascending: false });

//         if (dErr) console.warn("passport_documents:", dErr.message);
//         if (!alive) return;
//         setDocs(dRows || []);

//         const { data: aRows, error: aErr } = await supabase
//           .from("passport_audit")
//           .select("id, valuation_id, action, actor, created_at")
//           .eq("valuation_id", Number(valuationIdNum))
//           .order("created_at", { ascending: false })
//           .limit(20);

//         if (aErr) console.warn("passport_audit:", aErr.message);
//         if (!alive) return;
//         setAudit(aRows || []);
//       } catch (e) {
//         if (!alive) return;
//         setMsg(e?.message || "Failed to load passport.");
//       } finally {
//         if (!alive) return;
//         setLoading(false);
//       }
//     }

//     load();
//     return () => {
//       alive = false;
//     };
//   }, [navigate, isDetailMode, valuationIdNum]);

//   async function logAudit(action, actor = "Portfolio Owner") {
//     try {
//       if (!user?.id || !valuationIdNum) return;
//       await supabase.from("passport_audit").insert({
//         valuation_id: Number(valuationIdNum),
//         user_id: user.id,
//         action,
//         actor,
//       });
//     } catch (e) {
//       console.warn("audit insert:", e?.message || e);
//     }
//   }

//   async function openDoc(doc) {
//     try {
//       const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.file_path, 60 * 10);
//       if (error) throw error;
//       await logAudit(`Document View: ${doc.title}`);
//       window.open(data.signedUrl, "_blank", "noopener,noreferrer");
//     } catch (e) {
//       setMsg(e?.message || "Could not open document.");
//     }
//   }

//   async function generateSecureShare() {
//     try {
//       if (!docs?.length) {
//         setMsg("Upload at least one document to generate a secure share link.");
//         return;
//       }
//       const latest = [...docs].sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""))[0];
//       const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(latest.file_path, 60 * 30);
//       if (error) throw error;
//       setSecureUrl(data.signedUrl);
//       await logAudit("Secure Link Generated");
//     } catch (e) {
//       setMsg(e?.message || "Failed to generate secure link.");
//     }
//   }

//   async function uploadNewDocument(e) {
//     e.preventDefault();
//     setMsg("");

//     if (!user?.id) return setMsg("Please login again.");
//     if (!valuationIdNum) return setMsg("Missing valuation id.");
//     if (!upFile) return setMsg("Please choose a file.");

//     const title = (upTitle || "").trim() || upFile.name;

//     setUploading(true);
//     try {
//       const ext = upFile.name.includes(".") ? upFile.name.split(".").pop() : "bin";
//       const safeExt = (ext || "bin").toLowerCase().slice(0, 10);
//       const path = `${user.id}/${valuationIdNum}/${Date.now()}_${Math.random().toString(16).slice(2)}.${safeExt}`;

//       const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, upFile, {
//         cacheControl: "3600",
//         upsert: false,
//       });
//       if (upErr) throw upErr;

//       const kb = Math.max(1, Math.round(upFile.size / 1024));

//       const { data: inserted, error: insErr } = await supabase
//         .from("passport_documents")
//         .insert({
//           valuation_id: Number(valuationIdNum),
//           user_id: user.id,
//           category: upCategory,
//           title,
//           file_path: path,
//           file_size_kb: kb,
//           status: "verified",
//           updated_at: new Date().toISOString(),
//         })
//         .select("*")
//         .single();

//       if (insErr) throw insErr;

//       await logAudit(`Document Uploaded: ${title}`);

//       setDocs((prev) => [inserted, ...(prev || [])]);
//       setUpTitle("");
//       setUpFile(null);
//       setMsg("Document uploaded successfully.");
//     } catch (e2) {
//       setMsg(e2?.message || "Upload failed.");
//     } finally {
//       setUploading(false);
//     }
//   }

//   // =========================
//   // RENDER
//   // =========================
//   return (
//     <div className="ppPage">
//       {/* Top Header */}
//       <div className="ppTopHeader">
//         <div className="ppTHLeft" onClick={() => navigate("/dashboard")} role="button" tabIndex={0}>
//           <div className="ppBrandMark" />
//           <div className="ppBrand">ACQAR</div>

//           <div className="ppSearch">
//             <span className="ppSearchIcon">🔍</span>
//             <input className="ppSearchInput" placeholder="Search documents or properties.." value="" readOnly />
//           </div>
//         </div>

//         <div className="ppTHNav">
//           <button className="ppNavBtn" type="button" onClick={() => navigate("/dashboard")}>
//             Dashboard
//           </button>
//           <button
//             className={`ppNavBtn ${window.location.pathname.startsWith("/passport") ? "active" : ""}`}
//             type="button"
//             onClick={() => navigate("/passport")}
//           >
//             Portfolio
//           </button>
//           <button className="ppNavBtn" type="button" onClick={() => navigate("/marketplace")}>
//             Marketplace
//           </button>
//           <button className="ppNavBtn" type="button" onClick={() => navigate("/settings")}>
//             Settings
//           </button>
//         </div>

//         <div className="ppTHRight">
//           <button className="ppBell" type="button" title="Notifications">
//             🔔
//           </button>
//           <div className="ppAvatar" title="Profile" />
//         </div>
//       </div>

//       <div className="ppWrap">
//         <div className="ppCrumbs">
//           Dashboard <span>/</span> My Portfolio{" "}
//           {isDetailMode ? (
//             <>
//               <span>/</span> <b>{passportTitle.name}</b>
//             </>
//           ) : null}
//         </div>

//         {msg ? <div className="ppMsg">{msg}</div> : null}

//         {loading ? (
//           <div className="ppCard">Loading…</div>
//         ) : !isDetailMode ? (
//           // LIST MODE
//           <div className="ppCard">
//             <div className="ppListTop">
//               <div>
//                 <div className="ppListTitle">My Portfolio</div>
//                 <div className="ppListSub">Select a property to open its Passport</div>
//               </div>

//               <button className="ppPrimary" type="button" onClick={() => navigate("/valuation")}>
//                 ＋ New Valuation
//               </button>
//             </div>

//             {!portfolio.length ? (
//               <div className="ppEmptyBlock">No properties found. Create a valuation to generate a Property Passport.</div>
//             ) : (
//               <div className="ppListGrid">
//                 {portfolio.map((v) => {
//                   const title = (v.property_name || "").trim() || (v.building_name || "").trim() || "Property";
//                   const sub = [(v.building_name || "").trim(), (v.district || "").trim()].filter(Boolean).join(" • ");
//                   return (
//                     <button
//                       key={v.id}
//                       type="button"
//                       className="ppListCard"
//                       onClick={() => navigate(`/passport?id=${v.id}`)}
//                     >
//                       <div className="ppListCardTop">
//                         <div>
//                           <div className="ppListCardTitle">{title}</div>
//                           <div className="ppListCardSub">{sub || "—"}</div>
//                         </div>
//                         <div className="ppListCardVal">{fmtAED(v.estimated_valuation)}</div>
//                       </div>
//                       <div className="ppListCardAgo">{fmtDateAgo(v.created_at)}</div>
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         ) : !valuation ? (
//           <div className="ppCard">Property not found.</div>
//         ) : (
//           // DETAIL MODE (matches screenshot)
//           <>
//             <div className="ppHeaderRow">
//               <div className="ppHeaderLeft">
//                 <h1 className="ppTitle">
//                   Property Passport: {passportTitle.name}
//                   {passportTitle.district ? `, ${passportTitle.district}` : ""}
//                 </h1>

//                 <div className="ppPills">
//                   <span className="ppPill blue">🛡 Trust Score: 98.5</span>
//                   <span className="ppPill amber">🟡 Verified Identity</span>
//                 </div>
//               </div>

//               <form className="ppUploadWrap" onSubmit={uploadNewDocument}>
//                 <label className="ppUploadBtn">
//                   ⬆ Upload New Document
//                   <input
//                     type="file"
//                     onChange={(e) => setUpFile(e.target.files?.[0] || null)}
//                     style={{ display: "none" }}
//                     disabled={uploading}
//                   />
//                 </label>

//                 {/* mini controls stay hidden until file chosen (keeps screenshot clean) */}
//                 <div className={`ppUploadMini ${upFile ? "show" : ""}`}>
//                   <select value={upCategory} onChange={(e) => setUpCategory(e.target.value)} disabled={uploading}>
//                     {CATEGORIES.map((c) => (
//                       <option key={c.key} value={c.key}>
//                         {c.key}
//                       </option>
//                     ))}
//                   </select>

//                   <input
//                     value={upTitle}
//                     onChange={(e) => setUpTitle(e.target.value)}
//                     placeholder="Document title (optional)"
//                     disabled={uploading}
//                   />

//                   <button type="submit" className="ppMiniBtn" disabled={uploading || !upFile}>
//                     {uploading ? "Uploading…" : "Save"}
//                   </button>
//                 </div>
//               </form>
//             </div>

//             <div className="ppMainGrid">
//               {/* LEFT COLUMN */}
//               <section className="ppLeftCol">
//                 <div className="ppPassportCard">
//                   <div className="ppPropImage" />

//                   <div className="ppPassportMeta">
//                     <div className="ppLabel">PASSPORT ID</div>
//                     <div className="ppPassportId">{passportId}</div>
//                   </div>

//                   <div className="ppTwoCols">
//                     <div className="ppStat">
//                       <div className="ppLabel">LAST VALUATION</div>
//                       <div className="ppVal">{fmtAED(valuation.estimated_valuation)}</div>
//                     </div>
//                     <div className="ppStat">
//                       <div className="ppLabel">OWNERSHIP</div>
//                       <div className="ppVerified">✅ Verified</div>
//                     </div>
//                   </div>

//                   <div className="ppHealth">
//                     <div className="ppHealthTop">
//                       <span>Portfolio Health</span>
//                       <b>{portfolioHealth}%</b>
//                     </div>
//                     <div className="ppHealthBar">
//                       <span style={{ width: `${portfolioHealth}%` }} />
//                     </div>
//                   </div>
//                 </div>

//                 <div className="ppShareCard">
//                   <div className="ppShareTitle">🔐 Secure Share</div>
//                   <div className="ppShareSub">
//                     Generate a time-limited, encrypted link for banks or brokers.
//                   </div>

//                   <div className="ppShareBox">
//                     <div className="ppShareInput">
//                       <span className="ppLinkIcon">🔗</span>
//                       <input value={secureUrl} readOnly placeholder="acqar.com/s/72x-k9..." />
//                     </div>

//                     <button
//                       type="button"
//                       className="ppCopy"
//                       onClick={() => {
//                         if (!secureUrl) return;
//                         navigator.clipboard?.writeText(secureUrl);
//                         setMsg("Secure link copied.");
//                       }}
//                     >
//                       Copy
//                     </button>
//                   </div>

//                   <button type="button" className="ppPrimaryWide" onClick={generateSecureShare}>
//                     Generate Secure Link
//                   </button>

//                   <button
//                     type="button"
//                     className="ppGhostWide"
//                     onClick={async () => {
//                       await logAudit("Request Official Verification");
//                       setMsg("Verification request logged (demo).");
//                     }}
//                   >
//                     Request Official Verification
//                   </button>
//                 </div>
//               </section>

//               {/* RIGHT COLUMN */}
//               <section className="ppRightCol">
//                 <div className="ppDocGrid">
//                   {CATEGORIES.slice(0, 4).map((cat) => (
//                     <div key={cat.key} className="ppDocGroup">
//                       <div className="ppGroupHead">
//                         <span className="ppGroupIcon">{cat.icon}</span>
//                         <span className="ppGroupName">{cat.key}</span>
//                       </div>

//                       <div className="ppGroupBody">
//                         {(grouped.get(cat.key) || []).length === 0 ? (
//                           <div className="ppEmptySmall">No documents yet.</div>
//                         ) : (
//                           (grouped.get(cat.key) || []).slice(0, 2).map((d) => (
//                             <button key={d.id} type="button" className="ppDocRow" onClick={() => openDoc(d)}>
//                               <div className="ppDocLeft">
//                                 <div className="ppDocFileIcon">📄</div>
//                                 <div className="ppDocText">
//                                   <div className="ppDocTitle">{d.title}</div>
//                                   <div className="ppDocSub">
//                                     {fmtDateAgo(d.updated_at)} • {d.file_size_kb ? `${d.file_size_kb} KB` : "—"}
//                                   </div>
//                                 </div>
//                               </div>

//                               <div className={`ppCheck ${String(d.status || "verified").toLowerCase()}`}>✓</div>
//                             </button>
//                           ))
//                         )}
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="ppAuditCard">
//                   <div className="ppAuditTop">
//                     <div className="ppAuditTitle">Audit Trail &amp; Security</div>
//                     <div className="ppEncrypt">🔒 256-BIT AES ENCRYPTED</div>
//                   </div>

//                   <div className="ppAuditTable">
//                     <div className="ppAuditTH">
//                       <div>ACTION</div>
//                       <div>ACTOR</div>
//                       <div className="ppAuditTimeCol">TIMESTAMP</div>
//                     </div>

//                     {(audit || []).length === 0 ? (
//                       <div className="ppAuditEmpty">No activity yet.</div>
//                     ) : (
//                       audit.slice(0, 6).map((a) => (
//                         <div className="ppAuditTR" key={a.id}>
//                           <div className="ppAuditAction">{a.action}</div>
//                           <div className="ppAuditActor">
//                             <span className="ppDot" />
//                             {a.actor || "Portfolio Owner"}
//                           </div>
//                           <div className="ppAuditTime ppAuditTimeCol">{new Date(a.created_at).toLocaleString()}</div>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </div>
//               </section>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }


// src/pages/PropertyPassport.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/passport.css";

const BUCKET = "passport_docs";

const CATEGORIES = [
  { key: "Legal & Ownership", icon: "📁" },
  { key: "Contracts", icon: "📄" },
  { key: "Financials", icon: "💳" },
  { key: "Maintenance", icon: "🛠" },
  { key: "Other", icon: "🗂" },
];

function fmtAED(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  if (x >= 1_000_000) return `AED ${(x / 1_000_000).toFixed(2)}M`;
  return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function fmtDateAgo(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (!Number.isFinite(diff)) return "—";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Updated today";
  if (days === 1) return "Updated 1 day ago";
  if (days < 30) return `Updated ${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "Updated 1 month ago" : `Updated ${months} months ago`;
}

export default function PropertyPassport() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // ✅ if no id in URL → redirect to passport?id=20
  const valuationIdRaw = params.get("id");
  const valuationIdNum = valuationIdRaw ? Number(valuationIdRaw) : null;

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [user, setUser] = useState(null);

  // ✅ DETAIL MODE only
  const [valuation, setValuation] = useState(null);
  const [docs, setDocs] = useState([]);
  const [audit, setAudit] = useState([]);

  // upload state
  const [uploading, setUploading] = useState(false);
  const [upCategory, setUpCategory] = useState("Legal & Ownership");
  const [upTitle, setUpTitle] = useState("");
  const [upFile, setUpFile] = useState(null);

  // secure share
  const [secureUrl, setSecureUrl] = useState("");

  // ✅ redirect immediately if user opens /passport without id
  useEffect(() => {
    if (!valuationIdRaw) {
      navigate("/passport?id=20", { replace: true });
    }
  }, [valuationIdRaw, navigate]);

  const grouped = useMemo(() => {
    const m = new Map();
    CATEGORIES.forEach((c) => m.set(c.key, []));
    (docs || []).forEach((d) => {
      const k = d.category || "Other";
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(d);
    });
    for (const [k, arr] of m.entries()) {
      arr.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
      m.set(k, arr);
    }
    return m;
  }, [docs]);

  const passportTitle = useMemo(() => {
    const p = (valuation?.property_name || "").trim();
    const b = (valuation?.building_name || "").trim();
    const d = (valuation?.district || "").trim();
    const name = p || b || "Property";
    const sub = [b && b !== name ? b : null, d].filter(Boolean).join(", ");
    return { name, sub };
  }, [valuation]);

  const passportId = useMemo(() => {
    const v = Number(valuationIdNum);
    if (!Number.isFinite(v)) return "AQ-0000-DXB";
    return `AQ-${String(8000 + v).padStart(4, "0")}-DXB`;
  }, [valuationIdNum]);

  const portfolioHealth = useMemo(() => {
    const count = docs?.length || 0;
    if (count >= 8) return 96;
    if (count >= 6) return 90;
    if (count >= 4) return 84;
    if (count >= 2) return 78;
    return 65;
  }, [docs]);

  // =========================
  // ✅ LOAD DETAIL MODE ONLY
  // =========================
  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setMsg("");

        const { data: uData, error: uErr } = await supabase.auth.getUser();
        if (uErr) throw uErr;

        if (!uData?.user?.id) {
          navigate("/login");
          return;
        }
        if (!alive) return;
        setUser(uData.user);

        // if redirect still not done yet, stop
        if (!Number.isFinite(valuationIdNum)) {
          setLoading(false);
          return;
        }

        const { data: vRow, error: vErr } = await supabase
          .from("valuations")
          .select("id, user_id, name, district, property_name, building_name, estimated_valuation, created_at, updated_at")
          .eq("id", Number(valuationIdNum))
          .maybeSingle();

        if (vErr) throw vErr;

        if (vRow?.user_id && vRow.user_id !== uData.user.id) {
          setMsg("You do not have access to this property.");
          setLoading(false);
          return;
        }

        if (!alive) return;
        setValuation(vRow || null);

        const { data: dRows, error: dErr } = await supabase
          .from("passport_documents")
          .select("id, valuation_id, user_id, category, title, file_path, file_size_kb, status, updated_at, created_at")
          .eq("valuation_id", Number(valuationIdNum))
          .order("updated_at", { ascending: false });

        if (dErr) console.warn("passport_documents:", dErr.message);
        if (!alive) return;
        setDocs(dRows || []);

        const { data: aRows, error: aErr } = await supabase
          .from("passport_audit")
          .select("id, valuation_id, action, actor, created_at")
          .eq("valuation_id", Number(valuationIdNum))
          .order("created_at", { ascending: false })
          .limit(20);

        if (aErr) console.warn("passport_audit:", aErr.message);
        if (!alive) return;
        setAudit(aRows || []);
      } catch (e) {
        if (!alive) return;
        setMsg(e?.message || "Failed to load passport.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [navigate, valuationIdNum]);

  async function logAudit(action, actor = "Portfolio Owner") {
    try {
      if (!user?.id || !Number.isFinite(valuationIdNum)) return;
      await supabase.from("passport_audit").insert({
        valuation_id: Number(valuationIdNum),
        user_id: user.id,
        action,
        actor,
      });
    } catch (e) {
      console.warn("audit insert:", e?.message || e);
    }
  }

  async function openDoc(doc) {
    try {
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(doc.file_path, 60 * 10);
      if (error) throw error;
      await logAudit(`Document View: ${doc.title}`);
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (e) {
      setMsg(e?.message || "Could not open document.");
    }
  }

  async function generateSecureShare() {
    try {
      if (!docs?.length) {
        setMsg("Upload at least one document to generate a secure share link.");
        return;
      }
      const latest = [...docs].sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""))[0];
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(latest.file_path, 60 * 30);
      if (error) throw error;

      setSecureUrl(data.signedUrl);
      await logAudit("Secure Link Generated");
    } catch (e) {
      setMsg(e?.message || "Failed to generate secure link.");
    }
  }

  async function uploadNewDocument(e) {
    e.preventDefault();
    setMsg("");

    if (!user?.id) return setMsg("Please login again.");
    if (!Number.isFinite(valuationIdNum)) return setMsg("Missing valuation id.");
    if (!upFile) return setMsg("Please choose a file.");

    const title = (upTitle || "").trim() || upFile.name;

    setUploading(true);
    try {
      const ext = upFile.name.includes(".") ? upFile.name.split(".").pop() : "bin";
      const safeExt = (ext || "bin").toLowerCase().slice(0, 10);
      const path = `${user.id}/${valuationIdNum}/${Date.now()}_${Math.random().toString(16).slice(2)}.${safeExt}`;

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, upFile, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) throw upErr;

      const kb = Math.max(1, Math.round(upFile.size / 1024));

      const { data: inserted, error: insErr } = await supabase
        .from("passport_documents")
        .insert({
          valuation_id: Number(valuationIdNum),
          user_id: user.id,
          category: upCategory,
          title,
          file_path: path,
          file_size_kb: kb,
          status: "verified",
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (insErr) throw insErr;

      await logAudit(`Document Uploaded: ${title}`);

      setDocs((prev) => [inserted, ...(prev || [])]);
      setUpTitle("");
      setUpFile(null);
      setMsg("Document uploaded successfully.");
    } catch (e2) {
      setMsg(e2?.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  // =========================
  // ✅ RENDER DETAIL ONLY
  // =========================
  return (
    <div className="ppPage">
      <div className="ppHeaderBar">
        <div className="ppHBLeft" onClick={() => navigate("/dashboard")} role="button" tabIndex={0}>
          <div className="ppLogoMark">A</div>
          <div className="ppLogoText">ACQAR</div>

          <div className="ppSearch">
            <span className="ppSearchIcon">🔍</span>
            <input className="ppSearchInput" placeholder="Search documents or properties..." value="" readOnly />
          </div>
        </div>

        <div className="ppHBNav">
          <button type="button" className="ppNavItem" onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
          <button type="button" className="ppNavItem isActive" onClick={() => navigate("/passport?id=20")}>
            Portfolio
          </button>
          <button type="button" className="ppNavItem" onClick={() => navigate("/marketplace")}>
            Marketplace
          </button>
          <button type="button" className="ppNavItem" onClick={() => navigate("/settings")}>
            Settings
          </button>
        </div>

        <div className="ppHBRight">
          <button type="button" className="ppIconBtn" title="Notifications">
            🔔
          </button>
          <div className="ppAvatar" title="Profile" />
        </div>
      </div>

      <div className="ppWrap">
        {msg ? <div className="ppMsg">{msg}</div> : null}

        {loading ? (
          <div className="ppCard">Loading…</div>
        ) : !valuation ? (
          <div className="ppCard">Property not found.</div>
        ) : (
          <>
            <div className="ppTopBar">
              <div className="ppCrumbs">
                Dashboard <span> / </span> My Portfolio <span> / </span> <b>{passportTitle.name}</b>
              </div>
            </div>

            <div className="ppHeader">
              <div>
                <h1 className="ppH1">
                  Property Passport: {passportTitle.name}
                  {passportTitle.sub ? `, ${passportTitle.sub}` : ""}
                </h1>

                <div className="ppPills">
                  <span className="ppPill blue">🛡 Trust Score: 98.5</span>
                  <span className="ppPill amber">🟡 Verified Identity</span>
                </div>
              </div>

              <form className="ppUploadBtnWrap" onSubmit={uploadNewDocument}>
                <label className="ppUploadBtn">
                  ⬆ Upload New Document
                  <input
                    type="file"
                    onChange={(e) => setUpFile(e.target.files?.[0] || null)}
                    style={{ display: "none" }}
                    disabled={uploading}
                  />
                </label>

                <div className="ppUploadMini">
                  <select value={upCategory} onChange={(e) => setUpCategory(e.target.value)} disabled={uploading}>
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.key}
                      </option>
                    ))}
                  </select>

                  <input
                    value={upTitle}
                    onChange={(e) => setUpTitle(e.target.value)}
                    placeholder="Document title (optional)"
                    disabled={uploading}
                  />

                  <button type="submit" className="ppMiniPrimary" disabled={uploading || !upFile}>
                    {uploading ? "Uploading…" : "Save"}
                  </button>
                </div>
              </form>
            </div>

            <div className="ppGrid">
              <section className="ppLeft">
                <div className="ppCard ppPassportCard">
                  <div className="ppImg" />
                  <div className="ppMeta">
                    <div className="ppLabel">PASSPORT ID</div>
                    <div className="ppBig">{passportId}</div>
                  </div>

                  <div className="ppStatsRow">
                    <div>
                      <div className="ppLabel">LAST VALUATION</div>
                      <div className="ppValBlue">{fmtAED(valuation.estimated_valuation)}</div>
                    </div>
                    <div>
                      <div className="ppLabel">OWNERSHIP</div>
                      <div className="ppOk">✅ Verified</div>
                    </div>
                  </div>

                  <div className="ppHealthRow">
                    <div className="ppHealthTop">
                      <span>Portfolio Health</span>
                      <b>{portfolioHealth}%</b>
                    </div>
                    <div className="ppHealthBar">
                      <span style={{ width: `${portfolioHealth}%` }} />
                    </div>
                  </div>
                </div>

                <div className="ppCard ppShareCard">
                  <div className="ppShareTitle">🔐 Secure Share</div>
                  <div className="ppShareSub">Generate a time-limited, encrypted link for banks or brokers.</div>

                  <div className="ppShareBox">
                    <input value={secureUrl} readOnly placeholder="Click Generate to create secure link…" />
                    <button
                      type="button"
                      onClick={() => {
                        if (!secureUrl) return;
                        navigator.clipboard?.writeText(secureUrl);
                        setMsg("Secure link copied.");
                      }}
                    >
                      Copy
                    </button>
                  </div>

                  <button type="button" className="ppPrimaryWide" onClick={generateSecureShare}>
                    Generate Secure Link
                  </button>

                  <button
                    type="button"
                    className="ppSecondaryWide"
                    onClick={async () => {
                      await logAudit("Request Official Verification");
                      setMsg("Verification request logged (demo).");
                    }}
                  >
                    Request Official Verification
                  </button>
                </div>
              </section>

              <section className="ppRight">
                <div className="ppDocsGrid">
                  {CATEGORIES.slice(0, 4).map((cat) => (
                    <div key={cat.key} className="ppDocGroup">
                      <div className="ppGroupTitle">
                        <span className="ppGroupIcon">{cat.icon}</span>
                        <span>{cat.key}</span>
                      </div>

                      <div className="ppGroupList">
                        {(grouped.get(cat.key) || []).length === 0 ? (
                          <div className="ppEmptySmall">No documents yet.</div>
                        ) : (
                          (grouped.get(cat.key) || []).slice(0, 2).map((d) => (
                            <button key={d.id} type="button" className="ppDocRow" onClick={() => openDoc(d)}>
                              <div className="ppDocIcon">📄</div>
                              <div className="ppDocMeta">
                                <div className="ppDocTitle">{d.title}</div>
                                <div className="ppDocSub">
                                  {fmtDateAgo(d.updated_at)} • {d.file_size_kb ? `${d.file_size_kb} KB` : ""}
                                </div>
                              </div>
                              <div className={`ppDocStatus ${String(d.status || "").toLowerCase()}`}>✓</div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="ppAuditCard">
                  <div className="ppAuditTop">
                    <div className="ppAuditTitle">Audit Trail &amp; Security</div>
                    <div className="ppEncrypt">🔒 256-BIT AES ENCRYPTED</div>
                  </div>

                  <div className="ppTable">
                    <div className="ppTH">
                      <div>ACTION</div>
                      <div>ACTOR</div>
                      <div>TIMESTAMP</div>
                    </div>

                    {(audit || []).length === 0 ? (
                      <div className="ppTR ppEmptyRow">No activity yet.</div>
                    ) : (
                      audit.slice(0, 6).map((a) => (
                        <div className="ppTR" key={a.id}>
                          <div className="ppAction">{a.action}</div>
                          <div className="ppActor">
                            <span className="ppDot" />
                            {a.actor || "Portfolio Owner"}
                          </div>
                          <div className="ppTime">{new Date(a.created_at).toLocaleString()}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
