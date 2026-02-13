// // src/pages/UserDashboard.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import "../styles/dashboard.css";

// export default function UserDashboard() {
//   const navigate = useNavigate();

//   const [profile, setProfile] = useState(null);
//   const [valuations, setValuations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [msg, setMsg] = useState("");

//   const nameToShow = useMemo(() => {
//     const n = (profile?.name || "").trim();
//     if (n) return n;

//     const em = (profile?.email || "").split("@")[0] || "User";
//     return em.charAt(0).toUpperCase() + em.slice(1);
//   }, [profile]);

//   function fmtAED(n) {
//     const x = Number(n);
//     if (!Number.isFinite(x) || x <= 0) return "—";
//     if (x >= 1_000_000) return `AED ${(x / 1_000_000).toFixed(1)}M`;
//     return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
//   }

//   function fmtAEDFull(n) {
//     const x = Number(n);
//     if (!Number.isFinite(x) || x <= 0) return "—";
//     return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
//   }

//   function fmtDate(iso) {
//     if (!iso) return "";
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return "";
//     return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
//   }

//   // ✅ helper: pick which valuation id to open for passport
//   // Rule: use latest valuation id (first row) else fallback to first in list
//   const selectedPassportId = useMemo(() => {
//     return valuations?.length ? valuations[0].id : null;
//   }, [valuations]);

//   useEffect(() => {
//     let mounted = true;

//     async function load() {
//       try {
//         setLoading(true);
//         setMsg("");

//         const { data, error: userErr } = await supabase.auth.getUser();
//         if (userErr) throw userErr;

//         const user = data?.user;
//         if (!user?.id) {
//           navigate("/login");
//           return;
//         }

//         const authId = user.id;
//         const authEmail = (user.email || "").toLowerCase();

//         const metaName = (
//           user.user_metadata?.name ||
//           user.user_metadata?.full_name ||
//           user.user_metadata?.display_name ||
//           ""
//         ).trim();

//         // -----------------------------
//         // PERMANENT FIX: profile row sync
//         // -----------------------------
//         let { data: uRow, error: byIdErr } = await supabase
//           .from("users")
//           .select("id, role, name, email, phone, created_at")
//           .eq("id", authId)
//           .maybeSingle();

//         if (byIdErr) console.warn("users select by id:", byIdErr.message);

//         if (!uRow && authEmail) {
//           const { data: emailRow, error: byEmailErr } = await supabase
//             .from("users")
//             .select("id, role, name, email, phone, created_at")
//             .eq("email", authEmail)
//             .maybeSingle();

//           if (byEmailErr) console.warn("users select by email:", byEmailErr.message);

//           if (emailRow?.id && emailRow.id !== authId) {
//             const payload = {
//               id: authId,
//               email: authEmail,
//               role: emailRow.role || null,
//               name: (emailRow.name || metaName || "").trim() || null,
//               phone: emailRow.phone || null,
//             };

//             const { error: migrateUpsertErr } = await supabase.from("users").upsert(payload, {
//               onConflict: "id",
//             });

//             if (migrateUpsertErr) {
//               console.warn("users migrate upsert:", migrateUpsertErr.message);
//             } else {
//               const { error: delErr } = await supabase.from("users").delete().eq("id", emailRow.id);
//               if (delErr) console.warn("users delete old row:", delErr.message);

//               const { data: after, error: afterErr } = await supabase
//                 .from("users")
//                 .select("id, role, name, email, phone, created_at")
//                 .eq("id", authId)
//                 .maybeSingle();

//               if (afterErr) console.warn("users select after migrate:", afterErr.message);
//               uRow = after || null;
//             }
//           } else {
//             uRow = emailRow || null;
//           }
//         }

//         if (!uRow) {
//           const payload = {
//             id: authId,
//             email: authEmail,
//             name: metaName || null,
//           };

//           const { error: createErr } = await supabase.from("users").upsert(payload, {
//             onConflict: "id",
//           });
//           if (createErr) console.warn("users create upsert:", createErr.message);

//           const { data: createdRow, error: createdSelErr } = await supabase
//             .from("users")
//             .select("id, role, name, email, phone, created_at")
//             .eq("id", authId)
//             .maybeSingle();

//           if (createdSelErr) console.warn("users select created:", createdSelErr.message);
//           uRow = createdRow || null;
//         }

//         if (uRow && !(uRow.name || "").trim() && metaName) {
//           const { data: updated, error: updErr } = await supabase
//             .from("users")
//             .update({ name: metaName })
//             .eq("id", authId)
//             .select("id, role, name, email, phone, created_at")
//             .maybeSingle();

//           if (updErr) console.warn("users update name:", updErr.message);
//           else uRow = updated || uRow;
//         }

//         if (!mounted) return;

//         setProfile(
//           uRow || {
//             id: authId,
//             name: metaName || null,
//             email: authEmail || null,
//             phone: null,
//             created_at: null,
//           }
//         );

//         // -----------------------------
//         // Load valuations (real DB)
//         // -----------------------------
//         const { data: vRows, error: vErr } = await supabase
//           .from("valuations")
//           .select("id, property_name, building_name, district, created_at, estimated_valuation")
//           .eq("user_id", authId)
//           .order("created_at", { ascending: false })
//           .limit(12);

//         if (!mounted) return;

//         if (vErr) {
//           console.warn("valuations select:", vErr.message);
//           setValuations([]);
//         } else {
//           setValuations(vRows || []);
//         }
//       } catch (e) {
//         if (!mounted) return;
//         setMsg(e?.message || "Failed to load dashboard.");
//       } finally {
//         if (!mounted) return;
//         setLoading(false);
//       }
//     }

//     load();
//     return () => {
//       mounted = false;
//     };
//   }, [navigate]);

//   async function handleLogout() {
//     await supabase.auth.signOut();
//     navigate("/login");
//   }

//   const totalPortfolio = useMemo(() => {
//     const sum = valuations.reduce((acc, r) => acc + (Number(r.estimated_valuation) || 0), 0);
//     return sum || 0;
//   }, [valuations]);

//   const tableRows = useMemo(() => {
//     if (!valuations?.length) return [];
//     return valuations.map((v) => {
//       const property = (v.property_name || "").trim();
//       const building = (v.building_name || "").trim();
//       const district = (v.district || "").trim();

//       const title = property || building || "Property";
//       const subParts = [];
//       if (building && building !== title) subParts.push(building);
//       if (district) subParts.push(district);
//       subParts.push(fmtDate(v.created_at));

//       return {
//         id: v.id,
//         title,
//         sub: subParts.filter(Boolean).join(" • "),
//         value: Number(v.estimated_valuation) || 0,
//         change: 0.0,
//         status: "ValuCheck™ Complete",
//         statusClass: "blue",
//       };
//     });
//   }, [valuations]);

//   // ✅ helper for "My Portfolio" nav (must be /passport?id=<selected_valuation_id>)
//   function goPassportFromDashboard() {
//     const id = selectedPassportId;
//     if (!id) {
//       setMsg("No valuations found yet. Create a valuation first.");
//       return;
//     }
//     navigate(`/passport?id=${id}`);
//   }

//   return (
//     <div className="dash">
//       <aside className="dashSide">
//         <div className="dashBrand" role="button" tabIndex={0} onClick={() => navigate("/dashboard")}>
//           <div className="dashBrandLogo">A</div>
//           <div className="dashBrandName">ACQAR</div>
//         </div>

//         <nav className="dashNav">
//           <button className="dashNavItem active" onClick={() => navigate("/dashboard")}>
//             <span className="ico">▦</span>
//             <span>Dashboard</span>
//           </button>

//           {/* ✅ FIXED: My Portfolio -> /passport?id=<selected_valuation_id> */}
//           <button className="dashNavItem" onClick={goPassportFromDashboard}>
//             <span className="ico">▤</span>
//             <span>My Portfolio</span>
//           </button>

//           <button className="dashNavItem" onClick={() => navigate("/vault")}>
//             <span className="ico">✓</span>
//             <span>Digital Vault</span>
//           </button>

//           <button className="dashNavItem" onClick={() => navigate("/insights")}>
//             <span className="ico">↗</span>
//             <span>Market Insights</span>
//           </button>

//           <div className="dashNavSection">SUPPORT</div>

//           <button className="dashNavItem" onClick={() => navigate("/settings")}>
//             <span className="ico">⚙</span>
//             <span>Settings</span>
//           </button>
//         </nav>

//         <div className="dashSideFooter">
//           <div className="dashUserChip">
//             <div className="dashAvatar" />
//             <div className="dashUserMeta">
//               <div className="dashUserName">{nameToShow}</div>
//               <div className="dashUserPlan">Premium Member</div>
//             </div>

//             <button className="dashLogoutIcon" onClick={handleLogout} title="Logout">
//               ⎋
//             </button>
//           </div>
//         </div>
//       </aside>

//       <main className="dashMain">
//         <header className="dashHeader">
//           <div>
//             <h1 className="dashH1">Welcome back, {nameToShow}</h1>
//             <p className="dashSub">Here&apos;s your property intelligence overview for today.</p>
//           </div>

//           <div className="dashHeaderRight">
//             <div className="dashMetric">
//               <div className="dashMetricLabel">TOTAL PORTFOLIO VALUE</div>
//               <div className="dashMetricVal">{totalPortfolio ? fmtAED(totalPortfolio) : "—"}</div>
//             </div>

//             <button className="dashPrimary" onClick={() => navigate("/valuation")}>
//               <span className="plus">＋</span> New Valuation
//             </button>
//           </div>
//         </header>

//         {msg ? <div className="dashMsg">{msg}</div> : null}

//         {loading ? (
//           <div className="dashLoading">Loading dashboard…</div>
//         ) : (
//           <div className="dashGrid">
//             <section className="card cardWide">
//               <div className="cardTop">
//                 <div className="cardTitle">My Valuations &amp; Reports</div>

//                 {/* ✅ FIXED: View All -> /passport?id=<selected_valuation_id> */}
//                 <button className="cardLink" onClick={goPassportFromDashboard}>
//                   View All →
//                 </button>
//               </div>

//               <div className="tableHead">
//                 <div>PROPERTY DETAILS</div>
//                 <div>LAST VALUATION</div>
//                 <div>CHANGE</div>
//                 <div>INTELLIGENCE STATUS</div>
//               </div>

//               <div className="tableBody">
//                 {tableRows.slice(0, 3).map((r) => (
//                   <div
//                     key={r.id}
//                     className="tRow"
//                     role="button"
//                     tabIndex={0}
//                     onClick={() => navigate(`/report?id=${r.id}`)}
//                   >
//                     <div className="propCell">
//                       <div className="thumb" />
//                       <div>
//                         <div className="propTitle">{r.title}</div>
//                         <div className="propSub">{r.sub}</div>
//                       </div>
//                     </div>

//                     <div className="valCell">
//                       <div className="aed">AED</div>
//                       <div className="val">{fmtAEDFull(r.value).replace("AED ", "")}</div>
//                     </div>

//                     <div className="chgCell neutral">— {Math.abs(r.change).toFixed(1)}%</div>

//                     <div className="statusCell">
//                       <span className={`pill ${r.statusClass}`}>{r.status}</span>
//                     </div>
//                   </div>
//                 ))}

//                 {!tableRows.length ? (
//                   <div className="empty">No valuations found for this user yet. Create a new valuation to see it here.</div>
//                 ) : null}
//               </div>
//             </section>

//             <aside className="card cardSide">
//               <div className="sideTop">
//                 <div className="cardTitle">Market Intelligence</div>
//                 <div className="sideIcon">✦</div>
//               </div>

//               <div className="miBox">
//                 <div className="miLabel">TOP PERFORMER (7D)</div>
//                 <div className="miRow">
//                   <div>
//                     <div className="miName">Dubai Hills Estate</div>
//                     <div className="miSub">Secondary Market Sales</div>
//                   </div>
//                   <div className="miUp">+2.4%</div>
//                 </div>
//               </div>

//               <div className="secTitle">TRENDING LOCALITIES</div>

//               <div className="trend">
//                 <div className="trendRow">
//                   <span>Palm Jumeirah</span>
//                   <span className="bar">
//                     <i style={{ width: "78%" }} />
//                   </span>
//                 </div>
//                 <div className="trendRow">
//                   <span>Downtown Dubai</span>
//                   <span className="bar">
//                     <i style={{ width: "56%" }} />
//                   </span>
//                 </div>
//                 <div className="trendRow">
//                   <span>JVC</span>
//                   <span className="bar">
//                     <i style={{ width: "66%" }} />
//                   </span>
//                 </div>
//               </div>

//               <div className="divider" />

//               <div className="secTitle">
//                 SCOUT™ OPPORTUNITIES <span className="dot" />
//               </div>

//               <div className="opp">
//                 <div className="oppCard">
//                   <div className="oppTitle">Undervalued Listing Found</div>
//                   <div className="oppSub">Park Heights, Dubai Hills • 12% below community average.</div>
//                   <button className="oppBtn">ANALYZEDEAL →</button>
//                 </div>

//                 <div className="oppCard">
//                   <div className="oppTitle">High-Yield Prospect</div>
//                   <div className="oppSub">Sobha Hartland studio expected net ROI: 8.4%.</div>
//                   <button className="oppBtn">ANALYZEDEAL →</button>
//                 </div>
//               </div>
//             </aside>

//             <section className="passport">
//               <div className="passportHead">
//                 <div className="shield">🛡</div>
//                 <div>
//                   <div className="passportTitle">ACQAR PASSPORT™</div>
//                   <div className="passportSub">SECURE DIGITAL ASSET VAULT</div>
//                 </div>
//               </div>

//               <div className="passportBody">
//                 <div className="passportLeft">
//                   <div className="passportBox">
//                     <div className="passportProp">Secure Document Vault</div>

//                     <div className="tags">
//                       <span className="tag ok">Title Deed • Verified</span>
//                       <span className="tag blue">SPA • Uploaded</span>
//                       <span className="tag warn">EJARI • Renewal Due</span>
//                     </div>

//                     <div className="passportBtns">
//                       {/* ✅ OPTIONAL: Open passport detail for selected valuation */}
//                       <button className="pBtn light" onClick={goPassportFromDashboard}>
//                         Open Passport →
//                       </button>
//                       <button className="pBtn ghost">↗ Share Secure Link</button>
//                       <button className="pBtn ghost">✓ Verify Ownership</button>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="passportRight">
//                   <div className="ring">
//                     <div className="ringNum">98.5</div>
//                     <div className="ringLbl">TRUST INDEX</div>
//                   </div>
//                   <div className="ringNote">Enterprise-grade encryption active.</div>
//                 </div>
//               </div>
//             </section>

//             <aside className="ticker">
//               <div className="tickerTitle">✶ LIVE DLD TICKER</div>
//               <div className="tickerItem">
//                 Villa sold in Emirates Hills for <b>AED 42.5M</b>
//               </div>
//               <div className="tickerItem">
//                 Apartment sold in Marina Gate for <b>AED 3.2M</b>
//               </div>
//               <div className="tickerItem">
//                 Plot transacted in Jebel Ali for <b>AED 15.8M</b>
//               </div>
//             </aside>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }


// // src/pages/UserDashboard.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import "../styles/dashboard.css";

// export default function UserDashboard() {
//   const navigate = useNavigate();

//   const [profile, setProfile] = useState(null);
//   const [valuations, setValuations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [msg, setMsg] = useState("");

//   const nameToShow = useMemo(() => {
//     const n = (profile?.name || "").trim();
//     if (n) return n;

//     const em = (profile?.email || "").split("@")[0] || "User";
//     return em.charAt(0).toUpperCase() + em.slice(1);
//   }, [profile]);

//   function fmtAED(n) {
//     const x = Number(n);
//     if (!Number.isFinite(x) || x <= 0) return "—";
//     if (x >= 1_000_000) return `AED ${(x / 1_000_000).toFixed(1)}M`;
//     return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
//   }

//   function fmtAEDFull(n) {
//     const x = Number(n);
//     if (!Number.isFinite(x) || x <= 0) return "—";
//     return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
//   }

//   function fmtDate(iso) {
//     if (!iso) return "";
//     const d = new Date(iso);
//     if (Number.isNaN(d.getTime())) return "";
//     return d.toLocaleDateString(undefined, {
//       day: "2-digit",
//       month: "short",
//       year: "numeric",
//     });
//   }

//   // ✅ helper: pick which valuation id to open for passport
//   // Rule: use latest valuation id (first row) else fallback to first in list
//   const selectedPassportId = useMemo(() => {
//     return valuations?.length ? valuations[0].id : null;
//   }, [valuations]);

//   useEffect(() => {
//     let mounted = true;

//     async function load() {
//       try {
//         setLoading(true);
//         setMsg("");

//         const { data, error: userErr } = await supabase.auth.getUser();
//         if (userErr) throw userErr;

//         const user = data?.user;
//         if (!user?.id) {
//           navigate("/login");
//           return;
//         }

//         const authId = user.id;
//         const authEmail = (user.email || "").toLowerCase();

//         const metaName = (
//           user.user_metadata?.name ||
//           user.user_metadata?.full_name ||
//           user.user_metadata?.display_name ||
//           ""
//         ).trim();

//         // -----------------------------
//         // PERMANENT FIX: profile row sync
//         // -----------------------------
//         let { data: uRow, error: byIdErr } = await supabase
//           .from("users")
//           .select("id, role, name, email, phone, created_at")
//           .eq("id", authId)
//           .maybeSingle();

//         if (byIdErr) console.warn("users select by id:", byIdErr.message);

//         if (!uRow && authEmail) {
//           const { data: emailRow, error: byEmailErr } = await supabase
//             .from("users")
//             .select("id, role, name, email, phone, created_at")
//             .eq("email", authEmail)
//             .maybeSingle();

//           if (byEmailErr)
//             console.warn("users select by email:", byEmailErr.message);

//           if (emailRow?.id && emailRow.id !== authId) {
//             const payload = {
//               id: authId,
//               email: authEmail,
//               role: emailRow.role || null,
//               name: (emailRow.name || metaName || "").trim() || null,
//               phone: emailRow.phone || null,
//             };

//             const { error: migrateUpsertErr } = await supabase
//               .from("users")
//               .upsert(payload, {
//                 onConflict: "id",
//               });

//             if (migrateUpsertErr) {
//               console.warn("users migrate upsert:", migrateUpsertErr.message);
//             } else {
//               const { error: delErr } = await supabase
//                 .from("users")
//                 .delete()
//                 .eq("id", emailRow.id);
//               if (delErr) console.warn("users delete old row:", delErr.message);

//               const { data: after, error: afterErr } = await supabase
//                 .from("users")
//                 .select("id, role, name, email, phone, created_at")
//                 .eq("id", authId)
//                 .maybeSingle();

//               if (afterErr)
//                 console.warn("users select after migrate:", afterErr.message);
//               uRow = after || null;
//             }
//           } else {
//             uRow = emailRow || null;
//           }
//         }

//         if (!uRow) {
//           const payload = {
//             id: authId,
//             email: authEmail,
//             name: metaName || null,
//           };

//           const { error: createErr } = await supabase.from("users").upsert(
//             payload,
//             {
//               onConflict: "id",
//             }
//           );
//           if (createErr) console.warn("users create upsert:", createErr.message);

//           const { data: createdRow, error: createdSelErr } = await supabase
//             .from("users")
//             .select("id, role, name, email, phone, created_at")
//             .eq("id", authId)
//             .maybeSingle();

//           if (createdSelErr)
//             console.warn("users select created:", createdSelErr.message);
//           uRow = createdRow || null;
//         }

//         if (uRow && !(uRow.name || "").trim() && metaName) {
//           const { data: updated, error: updErr } = await supabase
//             .from("users")
//             .update({ name: metaName })
//             .eq("id", authId)
//             .select("id, role, name, email, phone, created_at")
//             .maybeSingle();

//           if (updErr) console.warn("users update name:", updErr.message);
//           else uRow = updated || uRow;
//         }

//         if (!mounted) return;

//         setProfile(
//           uRow || {
//             id: authId,
//             name: metaName || null,
//             email: authEmail || null,
//             phone: null,
//             created_at: null,
//           }
//         );

//         // -----------------------------
//         // Load valuations (real DB)
//         // -----------------------------
//         const { data: vRows, error: vErr } = await supabase
//           .from("valuations")
//           .select(
//             "id, property_name, building_name, district, created_at, estimated_valuation"
//           )
//           .eq("user_id", authId)
//           .order("created_at", { ascending: false })
//           .limit(12);

//         if (!mounted) return;

//         if (vErr) {
//           console.warn("valuations select:", vErr.message);
//           setValuations([]);
//         } else {
//           setValuations(vRows || []);
//         }
//       } catch (e) {
//         if (!mounted) return;
//         setMsg(e?.message || "Failed to load dashboard.");
//       } finally {
//         if (!mounted) return;
//         setLoading(false);
//       }
//     }

//     load();
//     return () => {
//       mounted = false;
//     };
//   }, [navigate]);

//   async function handleLogout() {
//     await supabase.auth.signOut();
//     navigate("/login");
//   }

//   const totalPortfolio = useMemo(() => {
//     const sum = valuations.reduce(
//       (acc, r) => acc + (Number(r.estimated_valuation) || 0),
//       0
//     );
//     return sum || 0;
//   }, [valuations]);

//   const tableRows = useMemo(() => {
//     if (!valuations?.length) return [];
//     return valuations.map((v) => {
//       const property = (v.property_name || "").trim();
//       const building = (v.building_name || "").trim();
//       const district = (v.district || "").trim();

//       const title = property || building || "Property";
//       const subParts = [];
//       if (building && building !== title) subParts.push(building);
//       if (district) subParts.push(district);
//       subParts.push(fmtDate(v.created_at));

//       return {
//         id: v.id,
//         title,
//         sub: subParts.filter(Boolean).join(" • "),
//         value: Number(v.estimated_valuation) || 0,
//         change: 0.0,
//         status: "ValuCheck™ Complete",
//         statusClass: "blue",
//       };
//     });
//   }, [valuations]);

//   // ✅ helper for "My Portfolio" nav (must be /passport?id=<selected_valuation_id>)
//   function goPassportFromDashboard() {
//     const id = selectedPassportId;
//     if (!id) {
//       setMsg("No valuations found yet. Create a valuation first.");
//       return;
//     }
//     navigate(`/passport?id=${id}`);
//   }

//   return (
//     <div className="dash">
//       {/* ✅ ONLY COLORS OVERRIDE (keeps your existing dashboard.css layout) */}
//       <style>{`
//         :root{
//           --acqar-orange:#b45309;
//           --acqar-black:#111827;
//           --acqar-muted:#6b7280;
//           --acqar-border:#e5e7eb;
//           --acqar-bg:#ffffff;
//           --acqar-soft:#f9fafb;
//           --acqar-orange-soft:#fff7ed;
//         }

//         /* Page background + base text */
//         .dash, .dashMain, .dashSide { background: var(--acqar-bg) !important; color: var(--acqar-black) !important; }

//         /* Sidebar */
//         .dashSide { border-right: 1px solid var(--acqar-border) !important; }
//         .dashBrandName, .dashH1, .cardTitle, .passportTitle { color: var(--acqar-black) !important; }
//         .dashSub, .dashMetricLabel, .dashUserPlan, .passportSub, .tickerTitle { color: var(--acqar-muted) !important; }

//         /* Brand logo block */
//         .dashBrandLogo { background: #111827 !important; color: #fff !important; }

//         /* Nav items */
//         .dashNavItem { border: 1px solid transparent !important; color: var(--acqar-black) !important; }
//         .dashNavItem:hover { background: var(--acqar-soft) !important; }
//         .dashNavItem.active { background: var(--acqar-orange-soft) !important; border: 1px solid rgba(180,83,9,.25) !important; }

//         /* Cards */
//         .card, .passport, .ticker { background: #fff !important; border: 1px solid var(--acqar-border) !important; }
//         .cardTop, .passportHead { border-bottom: 1px solid var(--acqar-border) !important; }

//         /* Table header */
//         .tableHead { background: var(--acqar-soft) !important; color: var(--acqar-muted) !important; border-bottom: 1px solid var(--acqar-border) !important; }

//         /* Primary buttons -> ORANGE */
//         .dashPrimary,
//         .oppBtn,
//         .pBtn.light {
//           background: var(--acqar-orange) !important;
//           color: #fff !important;
//           border: none !important;
//           box-shadow: 0 10px 22px rgba(180,83,9,0.20) !important;
//         }

//         /* Secondary/ghost buttons */
//         .pBtn.ghost,
//         .cardLink,
//         .dashLogoutIcon {
//           background: #fff !important;
//           color: var(--acqar-black) !important;
//           border: 1px solid var(--acqar-border) !important;
//         }
//         .pBtn.ghost:hover,
//         .cardLink:hover {
//           background: var(--acqar-soft) !important;
//         }

//         /* Links */
//         .cardLink { font-weight: 800 !important; }

//         /* Pills: keep your existing classes, but ensure good contrast */
//         .pill { border: 1px solid var(--acqar-border) !important; }

//         /* Passport / misc accents */
//         .shield { background: var(--acqar-orange-soft) !important; border: 1px solid rgba(180,83,9,.25) !important; }
//         .ring { border: 1px solid var(--acqar-border) !important; }
//       `}</style>

//       <aside className="dashSide">
//         <div
//           className="dashBrand"
//           role="button"
//           tabIndex={0}
//           onClick={() => navigate("/dashboard")}
//         >
//           <div className="dashBrandLogo">A</div>
//           <div className="dashBrandName">ACQAR</div>
//         </div>

//         <nav className="dashNav">
//           <button
//             className="dashNavItem active"
//             onClick={() => navigate("/dashboard")}
//           >
//             <span className="ico">▦</span>
//             <span>Dashboard</span>
//           </button>

//           {/* ✅ FIXED: My Portfolio -> /passport?id=<selected_valuation_id> */}
//           <button className="dashNavItem" onClick={goPassportFromDashboard}>
//             <span className="ico">▤</span>
//             <span>My Portfolio</span>
//           </button>

//           <button className="dashNavItem" onClick={() => navigate("/vault")}>
//             <span className="ico">✓</span>
//             <span>Digital Vault</span>
//           </button>

//           <button className="dashNavItem" onClick={() => navigate("/insights")}>
//             <span className="ico">↗</span>
//             <span>Market Insights</span>
//           </button>

//           <div className="dashNavSection">SUPPORT</div>

//           <button className="dashNavItem" onClick={() => navigate("/settings")}>
//             <span className="ico">⚙</span>
//             <span>Settings</span>
//           </button>
//         </nav>

//         <div className="dashSideFooter">
//           <div className="dashUserChip">
//             <div className="dashAvatar" />
//             <div className="dashUserMeta">
//               <div className="dashUserName">{nameToShow}</div>
//               <div className="dashUserPlan">Premium Member</div>
//             </div>

//             <button
//               className="dashLogoutIcon"
//               onClick={handleLogout}
//               title="Logout"
//             >
//               ⎋
//             </button>
//           </div>
//         </div>
//       </aside>

//       <main className="dashMain">
//         <header className="dashHeader">
//           <div>
//             <h1 className="dashH1">Welcome back, {nameToShow}</h1>
//             <p className="dashSub">
//               Here&apos;s your property intelligence overview for today.
//             </p>
//           </div>

//           <div className="dashHeaderRight">
//             <div className="dashMetric">
//               <div className="dashMetricLabel">TOTAL PORTFOLIO VALUE</div>
//               <div className="dashMetricVal">
//                 {totalPortfolio ? fmtAED(totalPortfolio) : "—"}
//               </div>
//             </div>

//             <button className="dashPrimary" onClick={() => navigate("/valuation")}>
//               <span className="plus">＋</span> New Valuation
//             </button>
//           </div>
//         </header>

//         {msg ? <div className="dashMsg">{msg}</div> : null}

//         {loading ? (
//           <div className="dashLoading">Loading dashboard…</div>
//         ) : (
//           <div className="dashGrid">
//             <section className="card cardWide">
//               <div className="cardTop">
//                 <div className="cardTitle">My Valuations &amp; Reports</div>

//                 {/* ✅ FIXED: View All -> /passport?id=<selected_valuation_id> */}
//                 <button className="cardLink" onClick={goPassportFromDashboard}>
//                   View All →
//                 </button>
//               </div>

//               <div className="tableHead">
//                 <div>PROPERTY DETAILS</div>
//                 <div>LAST VALUATION</div>
//                 <div>CHANGE</div>
//                 <div>INTELLIGENCE STATUS</div>
//               </div>

//               <div className="tableBody">
//                 {tableRows.slice(0, 3).map((r) => (
//                   <div
//                     key={r.id}
//                     className="tRow"
//                     role="button"
//                     tabIndex={0}
//                     onClick={() => navigate(`/report?id=${r.id}`)}
//                   >
//                     <div className="propCell">
//                       <div className="thumb" />
//                       <div>
//                         <div className="propTitle">{r.title}</div>
//                         <div className="propSub">{r.sub}</div>
//                       </div>
//                     </div>

//                     <div className="valCell">
//                       <div className="aed">AED</div>
//                       <div className="val">
//                         {fmtAEDFull(r.value).replace("AED ", "")}
//                       </div>
//                     </div>

//                     <div className="chgCell neutral">
//                       — {Math.abs(r.change).toFixed(1)}%
//                     </div>

//                     <div className="statusCell">
//                       <span className={`pill ${r.statusClass}`}>{r.status}</span>
//                     </div>
//                   </div>
//                 ))}

//                 {!tableRows.length ? (
//                   <div className="empty">
//                     No valuations found for this user yet. Create a new valuation
//                     to see it here.
//                   </div>
//                 ) : null}
//               </div>
//             </section>

//             <aside className="card cardSide">
//               <div className="sideTop">
//                 <div className="cardTitle">Market Intelligence</div>
//                 <div className="sideIcon">✦</div>
//               </div>

//               <div className="miBox">
//                 <div className="miLabel">TOP PERFORMER (7D)</div>
//                 <div className="miRow">
//                   <div>
//                     <div className="miName">Dubai Hills Estate</div>
//                     <div className="miSub">Secondary Market Sales</div>
//                   </div>
//                   <div className="miUp">+2.4%</div>
//                 </div>
//               </div>

//               <div className="secTitle">TRENDING LOCALITIES</div>

//               <div className="trend">
//                 <div className="trendRow">
//                   <span>Palm Jumeirah</span>
//                   <span className="bar">
//                     <i style={{ width: "78%" }} />
//                   </span>
//                 </div>
//                 <div className="trendRow">
//                   <span>Downtown Dubai</span>
//                   <span className="bar">
//                     <i style={{ width: "56%" }} />
//                   </span>
//                 </div>
//                 <div className="trendRow">
//                   <span>JVC</span>
//                   <span className="bar">
//                     <i style={{ width: "66%" }} />
//                   </span>
//                 </div>
//               </div>

//               <div className="divider" />

//               <div className="secTitle">
//                 SCOUT™ OPPORTUNITIES <span className="dot" />
//               </div>

//               <div className="opp">
//                 <div className="oppCard">
//                   <div className="oppTitle">Undervalued Listing Found</div>
//                   <div className="oppSub">
//                     Park Heights, Dubai Hills • 12% below community average.
//                   </div>
//                   <button className="oppBtn">ANALYZEDEAL →</button>
//                 </div>

//                 <div className="oppCard">
//                   <div className="oppTitle">High-Yield Prospect</div>
//                   <div className="oppSub">
//                     Sobha Hartland studio expected net ROI: 8.4%.
//                   </div>
//                   <button className="oppBtn">ANALYZEDEAL →</button>
//                 </div>
//               </div>
//             </aside>

//             <section className="passport">
//               <div className="passportHead">
//                 <div className="shield">🛡</div>
//                 <div>
//                   <div className="passportTitle">ACQAR PASSPORT™</div>
//                   <div className="passportSub">SECURE DIGITAL ASSET VAULT</div>
//                 </div>
//               </div>

//               <div className="passportBody">
//                 <div className="passportLeft">
//                   <div className="passportBox">
//                     <div className="passportProp">Secure Document Vault</div>

//                     <div className="tags">
//                       <span className="tag ok">Title Deed • Verified</span>
//                       <span className="tag blue">SPA • Uploaded</span>
//                       <span className="tag warn">EJARI • Renewal Due</span>
//                     </div>

//                     <div className="passportBtns">
//                       <button className="pBtn light" onClick={goPassportFromDashboard}>
//                         Open Passport →
//                       </button>
//                       <button className="pBtn ghost">↗ Share Secure Link</button>
//                       <button className="pBtn ghost">✓ Verify Ownership</button>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="passportRight">
//                   <div className="ring">
//                     <div className="ringNum">98.5</div>
//                     <div className="ringLbl">TRUST INDEX</div>
//                   </div>
//                   <div className="ringNote">Enterprise-grade encryption active.</div>
//                 </div>
//               </div>
//             </section>

//             <aside className="ticker">
//               <div className="tickerTitle">✶ LIVE DLD TICKER</div>
//               <div className="tickerItem">
//                 Villa sold in Emirates Hills for <b>AED 42.5M</b>
//               </div>
//               <div className="tickerItem">
//                 Apartment sold in Marina Gate for <b>AED 3.2M</b>
//               </div>
//               <div className="tickerItem">
//                 Plot transacted in Jebel Ali for <b>AED 15.8M</b>
//               </div>
//             </aside>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

// src/pages/UserDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/dashboard.css";

export default function UserDashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [valuations, setValuations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const nameToShow = useMemo(() => {
    const n = (profile?.name || "").trim();
    if (n) return n;

    const em = (profile?.email || "").split("@")[0] || "User";
    return em.charAt(0).toUpperCase() + em.slice(1);
  }, [profile]);

  function fmtAED(n) {
    const x = Number(n);
    if (!Number.isFinite(x) || x <= 0) return "—";
    if (x >= 1_000_000) return `AED ${(x / 1_000_000).toFixed(1)}M`;
    return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  function fmtAEDFull(n) {
    const x = Number(n);
    if (!Number.isFinite(x) || x <= 0) return "—";
    return `AED ${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  }

  function fmtDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const selectedPassportId = useMemo(() => {
    return valuations?.length ? valuations[0].id : null;
  }, [valuations]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setMsg("");

        const { data, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;

        const user = data?.user;
        if (!user?.id) {
          navigate("/login");
          return;
        }

        const authId = user.id;
        const authEmail = (user.email || "").toLowerCase();

        const metaName = (
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.display_name ||
          ""
        ).trim();

        let { data: uRow, error: byIdErr } = await supabase
          .from("users")
          .select("id, role, name, email, phone, created_at")
          .eq("id", authId)
          .maybeSingle();

        if (byIdErr) console.warn("users select by id:", byIdErr.message);

        if (!uRow && authEmail) {
          const { data: emailRow, error: byEmailErr } = await supabase
            .from("users")
            .select("id, role, name, email, phone, created_at")
            .eq("email", authEmail)
            .maybeSingle();

          if (byEmailErr) console.warn("users select by email:", byEmailErr.message);

          if (emailRow?.id && emailRow.id !== authId) {
            const payload = {
              id: authId,
              email: authEmail,
              role: emailRow.role || null,
              name: (emailRow.name || metaName || "").trim() || null,
              phone: emailRow.phone || null,
            };

            const { error: migrateUpsertErr } = await supabase
              .from("users")
              .upsert(payload, { onConflict: "id" });

            if (migrateUpsertErr) {
              console.warn("users migrate upsert:", migrateUpsertErr.message);
            } else {
              const { error: delErr } = await supabase
                .from("users")
                .delete()
                .eq("id", emailRow.id);
              if (delErr) console.warn("users delete old row:", delErr.message);

              const { data: after, error: afterErr } = await supabase
                .from("users")
                .select("id, role, name, email, phone, created_at")
                .eq("id", authId)
                .maybeSingle();

              if (afterErr) console.warn("users select after migrate:", afterErr.message);
              uRow = after || null;
            }
          } else {
            uRow = emailRow || null;
          }
        }

        if (!uRow) {
          const payload = {
            id: authId,
            email: authEmail,
            name: metaName || null,
          };

          const { error: createErr } = await supabase.from("users").upsert(payload, {
            onConflict: "id",
          });
          if (createErr) console.warn("users create upsert:", createErr.message);

          const { data: createdRow, error: createdSelErr } = await supabase
            .from("users")
            .select("id, role, name, email, phone, created_at")
            .eq("id", authId)
            .maybeSingle();

          if (createdSelErr) console.warn("users select created:", createdSelErr.message);
          uRow = createdRow || null;
        }

        if (uRow && !(uRow.name || "").trim() && metaName) {
          const { data: updated, error: updErr } = await supabase
            .from("users")
            .update({ name: metaName })
            .eq("id", authId)
            .select("id, role, name, email, phone, created_at")
            .maybeSingle();

          if (updErr) console.warn("users update name:", updErr.message);
          else uRow = updated || uRow;
        }

        if (!mounted) return;

        setProfile(
          uRow || {
            id: authId,
            name: metaName || null,
            email: authEmail || null,
            phone: null,
            created_at: null,
          }
        );

        const { data: vRows, error: vErr } = await supabase
          .from("valuations")
          .select("id, property_name, building_name, district, created_at, estimated_valuation")
          .eq("user_id", authId)
          .order("created_at", { ascending: false })
          .limit(12);

        if (!mounted) return;

        if (vErr) {
          console.warn("valuations select:", vErr.message);
          setValuations([]);
        } else {
          setValuations(vRows || []);
        }
      } catch (e) {
        if (!mounted) return;
        setMsg(e?.message || "Failed to load dashboard.");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const totalPortfolio = useMemo(() => {
    const sum = valuations.reduce((acc, r) => acc + (Number(r.estimated_valuation) || 0), 0);
    return sum || 0;
  }, [valuations]);

  const tableRows = useMemo(() => {
    if (!valuations?.length) return [];
    return valuations.map((v) => {
      const property = (v.property_name || "").trim();
      const building = (v.building_name || "").trim();
      const district = (v.district || "").trim();

      const title = property || building || "Property";
      const subParts = [];
      if (building && building !== title) subParts.push(building);
      if (district) subParts.push(district);
      subParts.push(fmtDate(v.created_at));

      return {
        id: v.id,
        title,
        sub: subParts.filter(Boolean).join(" • "),
        value: Number(v.estimated_valuation) || 0,
        change: 0.0,
        status: "ValuCheck™ Complete",
        statusClass: "blue",
      };
    });
  }, [valuations]);

  function goPassportFromDashboard() {
    const id = selectedPassportId;
    if (!id) {
      setMsg("No valuations found yet. Create a valuation first.");
      return;
    }
    navigate(`/passport?id=${id}`);
  }

  return (
    <div className="dash">
      {/* ✅ NEW COLOR SCHEME - maintains all responsive behavior */}
      <style>{`
        :root{
          --acqar-primary:#2B2B2B;
          --acqar-copper:#B87333;
          --acqar-gray-light:#D4D4D4;
          --acqar-gray-medium:#B3B3B3;
          --acqar-bg:#FAFAFA;
          --acqar-white:#FFFFFF;
          --acqar-text:#1a1a1a;
          --acqar-text-muted:#6b7280;
        }

        .dash, .dashMain, .dashSide { background: var(--acqar-bg) !important; color: var(--acqar-text) !important; }
        .dashSide { border-right: 1px solid var(--acqar-gray-light) !important; background: var(--acqar-white) !important; }
        .dashBrandName, .dashH1, .cardTitle, .passportTitle { color: var(--acqar-primary) !important; }
        .dashSub, .dashMetricLabel, .dashUserPlan, .passportSub, .tickerTitle { color: var(--acqar-text-muted) !important; }
        .dashBrandLogo { background: var(--acqar-primary) !important; color: #fff !important; }
        .dashNavItem { border: 1px solid transparent !important; color: var(--acqar-text-muted) !important; }
        .dashNavItem:hover { background: #f5f5f5 !important; color: var(--acqar-primary) !important; }
        .dashNavItem.active { 
          background: var(--acqar-copper) !important; 
          border: 1px solid var(--acqar-copper) !important;
          color: #fff !important;
          box-shadow: 0 10px 20px rgba(184,115,51,0.25) !important;
        }
        .card, .passport, .ticker { background: var(--acqar-white) !important; border: 1px solid var(--acqar-gray-light) !important; }
        .cardTop, .passportHead { border-bottom: 1px solid var(--acqar-gray-light) !important; }
        .tableHead { background: #f9f9f9 !important; color: var(--acqar-text-muted) !important; border-bottom: 1px solid var(--acqar-gray-light) !important; }
        .dashPrimary, .oppBtn, .pBtn.light {
          background: var(--acqar-copper) !important;
          color: #fff !important;
          border: none !important;
          box-shadow: 0 10px 22px rgba(184,115,51,0.30) !important;
        }
        .dashPrimary:hover, .oppBtn:hover, .pBtn.light:hover {
          background: #a0632d !important;
        }
        .pBtn.ghost, .cardLink, .dashLogoutIcon {
          background: var(--acqar-white) !important;
          color: var(--acqar-primary) !important;
          border: 1px solid var(--acqar-gray-light) !important;
        }
        .pBtn.ghost:hover, .cardLink:hover { background: #f5f5f5 !important; }
        .cardLink { font-weight: 800 !important; color: var(--acqar-copper) !important; }
        .pill { border: 1px solid var(--acqar-gray-light) !important; color: var(--acqar-text-muted) !important; background: #f9f9f9 !important; }
        .pill.blue { border: 1px solid rgba(184,115,51,0.3) !important; color: var(--acqar-copper) !important; background: rgba(184,115,51,0.08) !important; }
        .shield { background: rgba(184,115,51,0.1) !important; border: 1px solid rgba(184,115,51,0.25) !important; }
        .ring { border: 10px solid rgba(184,115,51,0.3) !important; outline: 6px solid rgba(184,115,51,0.1) !important; }
        .dashMetricVal { color: var(--acqar-copper) !important; }
        .dashMetric { border-right: 1px solid var(--acqar-gray-light) !important; }
        .dashUserChip { background: #f9f9f9 !important; border: 1px solid var(--acqar-gray-light) !important; }
        .dashAvatar { background: linear-gradient(135deg, var(--acqar-gray-medium), var(--acqar-gray-light)) !important; }
        .dashLogoutIcon:hover { color: var(--acqar-copper) !important; }
        .thumb { background: linear-gradient(135deg, rgba(184,115,51,0.15), rgba(212,212,212,0.20)) !important; border: 1px solid var(--acqar-gray-light) !important; }
        .miBox { border: 1px solid rgba(184,115,51,0.25) !important; background: rgba(184,115,51,0.08) !important; }
        .miUp { color: #10b981 !important; }
        .bar { background: var(--acqar-gray-light) !important; border: 1px solid var(--acqar-gray-light) !important; }
        .bar i { background: var(--acqar-copper) !important; }
        .divider { background: var(--acqar-gray-light) !important; }
        .oppCard { background: var(--acqar-white) !important; border: 1px solid var(--acqar-gray-light) !important; }
        .oppTitle { color: var(--acqar-primary) !important; }
        .oppBtn { background: transparent !important; color: var(--acqar-copper) !important; box-shadow: none !important; }
        .oppBtn:hover { text-decoration: underline !important; background: transparent !important; }
        
        .passport {
          background: linear-gradient(135deg, var(--acqar-primary) 0%, #1a1a1a 100%) !important;
          border: 1px solid rgba(255,255,255,0.10) !important;
        }
        .passportTitle, .passportSub { color: #fff !important; }
        .shield { background: rgba(184,115,51,0.2) !important; border: 1px solid rgba(184,115,51,0.3) !important; }
        .passportBox { background: rgba(255,255,255,0.06) !important; border: 1px solid rgba(255,255,255,0.10) !important; }
        .passportProp { color: #fff !important; }
        .tag { border: 1px solid rgba(255,255,255,0.14) !important; background: rgba(255,255,255,0.06) !important; }
        .pBtn { border: 1px solid rgba(255,255,255,0.16) !important; background: rgba(255,255,255,0.08) !important; color: #fff !important; }
        .pBtn.light { background: var(--acqar-copper) !important; border-color: var(--acqar-copper) !important; color: #fff !important; }
        .passportRight { border-left: 1px solid rgba(255,255,255,0.10) !important; }
        .ring { border: 10px solid rgba(184,115,51,0.4) !important; outline: 6px solid rgba(184,115,51,0.15) !important; }
        .ringNum, .ringLbl { color: #fff !important; }
        
        .ticker {
          background: var(--acqar-primary) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
        }
        .tickerTitle, .tickerItem { color: #fff !important; }
        .tickerItem { border-top: 1px solid rgba(255,255,255,0.10) !important; }
        .tickerItem b { color: var(--acqar-copper) !important; }

        /* ---------------------------
           RESPONSIVE (MOBILE/TABLET)
           --------------------------- */
        @media (max-width: 980px){
          /* stack sidebar on top */
          .dash { display: block !important; }

          .dashSide{
            position: sticky !important;
            top: 0 !important;
            z-index: 50 !important;
            width: 100% !important;
            border-right: none !important;
            border-bottom: 1px solid var(--acqar-gray-light) !important;
          }

          /* brand row tighter */
          .dashBrand{ padding: 14px 16px !important; }
          .dashBrandName{ letter-spacing: 1.5px !important; }

          /* nav becomes horizontal scroll */
          .dashNav{
            display: flex !important;
            gap: 10px !important;
            padding: 8px 12px 12px !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .dashNav::-webkit-scrollbar{ height: 6px; }
          .dashNavSection{ display:none !important; }
          .dashNavItem{
            flex: 0 0 auto !important;
            white-space: nowrap !important;
          }

          /* footer chip moves under nav */
          .dashSideFooter{ padding: 10px 12px 14px !important; }
          .dashUserChip{ width: 100% !important; }

          /* main padding tighter */
          .dashMain{ padding: 16px 14px 22px !important; }

          /* header stacks */
          .dashHeader{
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .dashHeaderRight{
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            align-items: stretch !important;
          }
          .dashMetric{
            width: 100% !important;
            text-align: left !important;
            border-right: none !important;
            padding: 8px 0 !important;
          }
          .dashPrimary{
            width: 100% !important;
            justify-content: center !important;
          }

          /* grid becomes single column */
          .dashGrid{
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }

          /* wide/side cards behave same */
          .cardWide, .cardSide{ grid-column: auto !important; }

          /* table becomes scrollable on small screens */
          .tableHead, .tRow{
            min-width: 720px !important;
          }
          .cardWide .tableBody, .cardWide .tableHead{
            width: 100% !important;
          }
          .cardWide{
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }

          /* passport layout stacks */
          .passportBody{
            display: flex !important;
            flex-direction: column !important;
            gap: 14px !important;
          }
          .passportRight{
            border-left: none !important;
            border-top: 1px solid rgba(255,255,255,0.10) !important;
            padding-left: 0 !important;
            padding-top: 14px !important;
          }
          .passportBtns{
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
          }
          .pBtn{ width: 100% !important; }

          /* ticker items wrap */
          .tickerItem{ word-break: break-word !important; }
        }

        @media (max-width: 420px){
          .dashH1{ font-size: 20px !important; }
          .dashSub{ font-size: 13px !important; }
          .dashMetricVal{ font-size: 18px !important; }
          .dashBrandLogo{ width: 34px !important; height: 34px !important; }
        }
      `}</style>

      <aside className="dashSide">
        <div
          className="dashBrand"
          role="button"
          tabIndex={0}
          onClick={() => navigate("/dashboard")}
        >
          
          <div className="dashBrandName">ACQAR</div>
        </div>

        <nav className="dashNav">
          <button className="dashNavItem active" onClick={() => navigate("/dashboard")}>
            <span className="ico">▦</span>
            <span>Dashboard</span>
          </button>

          <button className="dashNavItem" onClick={goPassportFromDashboard}>
            <span className="ico">▤</span>
            <span>My Portfolio</span>
          </button>

          <button className="dashNavItem" onClick={() => navigate("/vault")}>
            <span className="ico">✓</span>
            <span>Digital Vault</span>
          </button>

          <button className="dashNavItem" onClick={() => navigate("/insights")}>
            <span className="ico">↗</span>
            <span>Market Insights</span>
          </button>

          <div className="dashNavSection">SUPPORT</div>

          <button className="dashNavItem" onClick={() => navigate("/settings")}>
            <span className="ico">⚙</span>
            <span>Settings</span>
          </button>
        </nav>

        <div className="dashSideFooter">
          <div className="dashUserChip">
            <div className="dashAvatar" />
            <div className="dashUserMeta">
              <div className="dashUserName">{nameToShow}</div>
              <div className="dashUserPlan">Premium Member</div>
            </div>

            <button className="dashLogoutIcon" onClick={handleLogout} title="Logout">
              ⎋
            </button>
          </div>
        </div>
      </aside>

      <main className="dashMain">
        <header className="dashHeader">
          <div>
            <h1 className="dashH1">Welcome back, {nameToShow}</h1>
            <p className="dashSub">Here&apos;s your property intelligence overview for today.</p>
          </div>

          <div className="dashHeaderRight">
            <div className="dashMetric">
              <div className="dashMetricLabel">TOTAL PORTFOLIO VALUE</div>
              <div className="dashMetricVal">
                {totalPortfolio ? fmtAED(totalPortfolio) : "—"}
              </div>
            </div>

            <button className="dashPrimary" onClick={() => navigate("/valuation")}>
              <span className="plus">＋</span> New Valuation
            </button>
          </div>
        </header>

        {msg ? <div className="dashMsg">{msg}</div> : null}

        {loading ? (
          <div className="dashLoading">Loading dashboard…</div>
        ) : (
          <div className="dashGrid">
            <section className="card cardWide">
              <div className="cardTop">
                <div className="cardTitle">My Valuations &amp; Reports</div>
                <button className="cardLink" onClick={goPassportFromDashboard}>
                  View All →
                </button>
              </div>

              <div className="tableHead">
                <div>PROPERTY DETAILS</div>
                <div>LAST VALUATION</div>
                <div>CHANGE</div>
                <div>INTELLIGENCE STATUS</div>
              </div>

              <div className="tableBody">
                {tableRows.slice(0, 3).map((r) => (
                  <div
                    key={r.id}
                    className="tRow"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/report?id=${r.id}`)}
                  >
                    <div className="propCell">
                      <div className="thumb" />
                      <div>
                        <div className="propTitle">{r.title}</div>
                        <div className="propSub">{r.sub}</div>
                      </div>
                    </div>

                    <div className="valCell">
                      <div className="aed">AED</div>
                      <div className="val">{fmtAEDFull(r.value).replace("AED ", "")}</div>
                    </div>

                    <div className="chgCell neutral">— {Math.abs(r.change).toFixed(1)}%</div>

                    <div className="statusCell">
                      <span className={`pill ${r.statusClass}`}>{r.status}</span>
                    </div>
                  </div>
                ))}

                {!tableRows.length ? (
                  <div className="empty">
                    No valuations found for this user yet. Create a new valuation to see it here.
                  </div>
                ) : null}
              </div>
            </section>

            <aside className="card cardSide">
              <div className="sideTop">
                <div className="cardTitle">Market Intelligence</div>
                <div className="sideIcon">✦</div>
              </div>

              <div className="miBox">
                <div className="miLabel">TOP PERFORMER (7D)</div>
                <div className="miRow">
                  <div>
                    <div className="miName">Dubai Hills Estate</div>
                    <div className="miSub">Secondary Market Sales</div>
                  </div>
                  <div className="miUp">+2.4%</div>
                </div>
              </div>

              <div className="secTitle">TRENDING LOCALITIES</div>

              <div className="trend">
                <div className="trendRow">
                  <span>Palm Jumeirah</span>
                  <span className="bar">
                    <i style={{ width: "78%" }} />
                  </span>
                </div>
                <div className="trendRow">
                  <span>Downtown Dubai</span>
                  <span className="bar">
                    <i style={{ width: "56%" }} />
                  </span>
                </div>
                <div className="trendRow">
                  <span>JVC</span>
                  <span className="bar">
                    <i style={{ width: "66%" }} />
                  </span>
                </div>
              </div>

              <div className="divider" />

              <div className="secTitle">
                SCOUT™ OPPORTUNITIES <span className="dot" />
              </div>

              <div className="opp">
                <div className="oppCard">
                  <div className="oppTitle">Undervalued Listing Found</div>
                  <div className="oppSub">Park Heights, Dubai Hills • 12% below community average.</div>
                  <button className="oppBtn">ANALYZE DEAL →</button>
                </div>

                <div className="oppCard">
                  <div className="oppTitle">High-Yield Prospect</div>
                  <div className="oppSub">Sobha Hartland studio expected net ROI: 8.4%.</div>
                  <button className="oppBtn">ANALYZE DEAL →</button>
                </div>
              </div>
            </aside>

            <section className="passport">
              <div className="passportHead">
                <div className="shield">🛡</div>
                <div>
                  <div className="passportTitle">ACQAR PASSPORT™</div>
                  <div className="passportSub">SECURE DIGITAL ASSET VAULT</div>
                </div>
              </div>

              <div className="passportBody">
                <div className="passportLeft">
                  <div className="passportBox">
                    <div className="passportProp">Secure Document Vault</div>

                    <div className="tags">
                      <span className="tag ok">Title Deed • Verified</span>
                      <span className="tag blue">SPA • Uploaded</span>
                      <span className="tag warn">EJARI • Renewal Due</span>
                    </div>

                    <div className="passportBtns">
                      <button className="pBtn light" onClick={goPassportFromDashboard}>
                        Open Passport →
                      </button>
                      <button className="pBtn ghost">↗ Share Secure Link</button>
                      <button className="pBtn ghost">✓ Verify Ownership</button>
                    </div>
                  </div>
                </div>

                <div className="passportRight">
                  <div className="ring">
                    <div className="ringNum">98.5</div>
                    <div className="ringLbl">TRUST INDEX</div>
                  </div>
                  <div className="ringNote">Enterprise-grade encryption active.</div>
                </div>
              </div>
            </section>

            <aside className="ticker">
              <div className="tickerTitle">✶ LIVE DLD TICKER</div>
              <div className="tickerItem">
                Villa sold in Emirates Hills for <b>AED 42.5M</b>
              </div>
              <div className="tickerItem">
                Apartment sold in Marina Gate for <b>AED 3.2M</b>
              </div>
              <div className="tickerItem">
                Plot transacted in Jebel Ali for <b>AED 15.8M</b>
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

