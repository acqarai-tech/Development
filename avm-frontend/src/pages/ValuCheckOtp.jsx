// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import "../styles/valucheck.css";

// const LS_FORM_KEY = "truvalu_formData_v1";
// const LS_USER_EMAIL = "truvalu_user_email_v1";
// const LS_RESET_SENT = "truvalu_reset_link_sent_v1";
// const LS_VALUCHECK_DRAFT = "truvalu_valucheck_draft_v1";
// const LS_VAL_ROW_ID = "truvalu_valuation_row_id";

// function safeParse(json) {
//   try {
//     return JSON.parse(json);
//   } catch {
//     return null;
//   }
// }
// function norm(s) {
//   return (s || "").trim().replace(/\s+/g, " ");
// }

// export default function ValuCheckOtp() {
//   const navigate = useNavigate();

//   const draft = useMemo(
//     () => safeParse(localStorage.getItem(LS_VALUCHECK_DRAFT)) || null,
//     []
//   );
//   const draftEmail = (
//     draft?.email ||
//     localStorage.getItem(LS_USER_EMAIL) ||
//     ""
//   )
//     .trim()
//     .toLowerCase();

//   // ✅ keep original behavior: we still store a single otp string, and verify using that string.
//   // UI will use 6 boxes but underlying otp stays same.
//   const [otp, setOtp] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState({ type: "", msg: "" });

//   // ---- NEW (UI only): 6 digit boxes + timer ----
//   const OTP_LEN = 6;
//   const [digits, setDigits] = useState(Array(OTP_LEN).fill(""));
//   const inputsRef = useRef([]);

//   const [secondsLeft, setSecondsLeft] = useState(9 * 60 + 32); // 09:32 like screenshot (UI only)

//   useEffect(() => {
//     // keep digits -> otp sync
//     const joined = digits.join("");
//     setOtp(joined);
//   }, [digits]);

//   useEffect(() => {
//     // countdown (UI only)
//     const t = setInterval(() => {
//       setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
//     }, 1000);
//     return () => clearInterval(t);
//   }, []);

//   function mmss(sec) {
//     const m = Math.floor(sec / 60);
//     const s = sec % 60;
//     return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
//   }

//   function focusIndex(i) {
//     const el = inputsRef.current?.[i];
//     if (el) el.focus();
//   }

//   function handleDigitChange(i, v) {
//     const val = (v || "").replace(/\D/g, ""); // digits only

//     // paste support
//     if (val.length > 1) {
//       const chars = val.slice(0, OTP_LEN).split("");
//       const next = Array(OTP_LEN).fill("");
//       for (let k = 0; k < chars.length; k++) next[k] = chars[k] || "";
//       setDigits(next);
//       focusIndex(Math.min(chars.length, OTP_LEN - 1));
//       return;
//     }

//     const next = [...digits];
//     next[i] = val.slice(0, 1);
//     setDigits(next);

//     if (val && i < OTP_LEN - 1) focusIndex(i + 1);
//   }

//   function handleKeyDown(i, e) {
//     if (e.key === "Backspace") {
//       if (digits[i]) {
//         const next = [...digits];
//         next[i] = "";
//         setDigits(next);
//         return;
//       }
//       if (i > 0) {
//         focusIndex(i - 1);
//         const next = [...digits];
//         next[i - 1] = "";
//         setDigits(next);
//       }
//     }
//     if (e.key === "ArrowLeft" && i > 0) focusIndex(i - 1);
//     if (e.key === "ArrowRight" && i < OTP_LEN - 1) focusIndex(i + 1);
//   }

//   async function insertValuationAfterOtp(authUserId, userName) {
//     const formData = safeParse(localStorage.getItem(LS_FORM_KEY)) || {};
//     const computedSqm = Number(formData?.procedure_area || 0) || null;

//     const row = {
//       user_id: authUserId,
//       name: norm(userName || ""),

//       district: norm(formData?.district_name || formData?.area_name_en || ""),
//       property_name: norm(
//         formData?.property_name ||
//           formData?.project_reference ||
//           formData?.project_name_en ||
//           ""
//       ),
//       building_name: norm(formData?.building_name || formData?.building_name_en || ""),
//       title_deed_no: norm(formData?.title_deed_no || ""),
//       title_deed_type: norm(formData?.title_deed_type || ""),
//       plot_no: norm(formData?.plot_no || ""),

//       valuation_type: norm(formData?.valuation_type || ""),
//       valuation_type_selection: norm(formData?.valuation_type || ""),
//       property_category: norm(formData?.property_category || ""),
//       purpose_of_valuation: norm(formData?.purpose_of_valuation || ""),
//       property_current_status: norm(formData?.property_status || ""),

//       apartment_no: norm(formData?.apartment_no || ""),
//       apartment_size: computedSqm,
//       apartment_size_unit: norm(formData?.area_unit || ""),
//       last_renovated_on: formData?.last_renovated_on || null,
//       floor_level: norm(formData?.floor_level || ""),

//       furnishing_type: norm(formData?.furnishing || ""),
//       bedroom: norm(String(formData?.bedrooms || "")),
//       bathroom: norm(String(formData?.bathrooms || "")),
//       property_type: norm(formData?.property_type_en || ""),
//       unit: norm(formData?.property_name_unit || ""),
//       features: Array.isArray(formData?.amenities) ? formData.amenities : [],

//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString(),
//     };

//     const { data, error } = await supabase
//       .from("valuations")
//       .insert([row])
//       .select("id")
//       .single();
//     if (error) throw error;

//     localStorage.setItem(LS_VAL_ROW_ID, data.id);
//   }

//   async function verifyOtpAndSave() {
//     setStatus({ type: "", msg: "" });

//     const code = (otp || "").trim();
//     if (!draftEmail) {
//       setStatus({
//         type: "error",
//         msg: "Email missing. Please go back and enter your details again.",
//       });
//       return;
//     }
//     if (!code) {
//       setStatus({ type: "error", msg: "Please enter the OTP code." });
//       return;
//     }

//     setLoading(true);
//     try {
//       const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
//         email: draftEmail,
//         token: code,
//         type: "email",
//       });
//       if (verifyErr) throw verifyErr;

//       const authUserId = verifyData?.user?.id || null;
//       if (!authUserId) throw new Error("Could not read authenticated user id.");

//       const { data: sessionData } = await supabase.auth.getSession();
//       if (!sessionData?.session) throw new Error("Session not created. Please try OTP again.");

//       const payload = {
//         id: authUserId,
//         role: draft?.role || null,
//         name: (draft?.name || "").trim() || null,
//         email: draftEmail,
//         phone: draft?.phone || null,
//       };

//       const { error: upErr } = await supabase
//         .from("users")
//         .upsert(payload, { onConflict: "id" });
//       if (upErr) throw upErr;

//       await insertValuationAfterOtp(authUserId, payload.name || "");

//       setStatus({ type: "success", msg: "Verified! Generating your report..." });
//       setOtp("");
//       setDigits(Array(OTP_LEN).fill(""));

//       localStorage.setItem(LS_USER_EMAIL, draftEmail);
//       localStorage.removeItem(LS_RESET_SENT);

//       navigate("/report");
//     } catch (ex) {
//       setStatus({
//         type: "error",
//         msg:
//           ex?.message ||
//           "OTP verification or saving failed. Check RLS policy for users/valuations.",
//       });
//       console.error("OTP verify/save error:", ex);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function resendOtp() {
//     setStatus({ type: "", msg: "" });

//     if (!draftEmail) {
//       setStatus({
//         type: "error",
//         msg: "Email missing. Please go back and enter your details again.",
//       });
//       return;
//     }

//     setLoading(true);
//     try {
//       const { error } = await supabase.auth.signInWithOtp({
//         email: draftEmail,
//         options: { shouldCreateUser: true },
//       });
//       if (error) throw error;

//       setStatus({ type: "success", msg: "OTP resent to your email." });

//       // UI only: reset timer like screenshot vibe
//       setSecondsLeft(9 * 60 + 32);
//       setDigits(Array(OTP_LEN).fill(""));
//       focusIndex(0);
//     } catch (ex) {
//       setStatus({
//         type: "error",
//         msg: ex?.message || "Could not resend OTP. Please try again.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   }

//   function changeEmail() {
//     navigate("/valucheck");
//   }

//   // ---------- UI styles (inline, does not touch your global CSS) ----------
//   const UI = {
//     BTN: "#b45309",
//     BTN_DARK: "#92400e",
//     BG: "#f7f7f7",
//     CARD: "#ffffff",
//     TEXT: "#111827",
//     MUTED: "#6b7280",
//     BORDER: "#e5e7eb",
//     SOFT: "#f3f4f6",
//   };

//   return (
//     <div style={{ minHeight: "100vh", background: UI.BG }}>
//       {/* Top bar */}
//       <div
//         style={{
//           height: 64,
//           background: "#fff",
//           borderBottom: `1px solid ${UI.BORDER}`,
//           display: "flex",
//           alignItems: "center",
//         }}
//       >
//         <div
//           style={{
//             maxWidth: 1100,
//             margin: "0 auto",
//             width: "100%",
//             padding: "0 18px",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             boxSizing: "border-box",
//           }}
//         >
//           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//             <div
//               style={{
//                 width: 18,
//                 height: 18,
//                 borderRadius: 4,
//                 background: UI.BTN,
//                 boxShadow: "0 8px 18px rgba(180,83,9,0.18)",
//               }}
//             />
//             <div style={{ fontWeight: 900, letterSpacing: 1, color: UI.TEXT }}>ACQAR</div>
//           </div>

//           <button
//             type="button"
//             style={{
//               background: UI.BTN,
//               border: "none",
//               color: "#fff",
//               fontWeight: 800,
//               padding: "10px 14px",
//               borderRadius: 10,
//               cursor: "pointer",
//               boxShadow: "0 10px 22px rgba(180,83,9,0.22)",
//             }}
//             onClick={() => window.open("mailto:support@acqar.com")}
//           >
//             Contact Support
//           </button>
//         </div>
//       </div>

//       {/* Center card */}
//       <div
//         style={{
//           minHeight: "calc(100vh - 64px)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           padding: "34px 16px",
//           boxSizing: "border-box",
//         }}
//       >
//         <div
//           style={{
//             width: "100%",
//             maxWidth: 520,
//             background: UI.CARD,
//             borderRadius: 16,
//             border: `1px solid ${UI.BORDER}`,
//             boxShadow: "0 18px 50px rgba(0,0,0,0.06)",
//             padding: "28px 26px",
//             textAlign: "center",
//           }}
//         >
//           {/* icon */}
//           <div
//             style={{
//               width: 56,
//               height: 56,
//               margin: "0 auto 12px",
//               borderRadius: 14,
//               background: UI.SOFT,
//               display: "grid",
//               placeItems: "center",
//             }}
//           >
//             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
//               <path
//                 d="M4 6.5C4 5.12 5.12 4 6.5 4h11C18.88 4 20 5.12 20 6.5v11c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 20 4 18.88 4 17.5v-11Z"
//                 stroke={UI.MUTED}
//                 strokeWidth="1.6"
//               />
//               <path
//                 d="M6.5 7.5 12 12l5.5-4.5"
//                 stroke={UI.MUTED}
//                 strokeWidth="1.6"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           </div>

//           {/* ✅ KEEP heading/subtitle EXACT from your screen */}
//           <h1 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 900, color: UI.TEXT }}>
//             Enter OTP Code
//           </h1>
//           <p style={{ margin: 0, fontSize: 13, color: UI.MUTED, lineHeight: 1.6 }}>
//             We sent a verification code to <b style={{ color: UI.TEXT }}>{draftEmail || "your email"}</b>
//           </p>

//           {/* OTP boxes */}
//           <div style={{ marginTop: 22, display: "flex", gap: 10, justifyContent: "center" }}>
//             {digits.map((d, i) => (
//               <input
//                 key={i}
//                 ref={(el) => (inputsRef.current[i] = el)}
//                 value={d}
//                 onChange={(e) => handleDigitChange(i, e.target.value)}
//                 onKeyDown={(e) => handleKeyDown(i, e)}
//                 inputMode="numeric"
//                 autoComplete={i === 0 ? "one-time-code" : "off"}
//                 disabled={loading}
//                 style={{
//                   width: 46,
//                   height: 52,
//                   borderRadius: 10,
//                   border: `1px solid ${UI.BORDER}`,
//                   background: "#fff",
//                   textAlign: "center",
//                   fontSize: 18,
//                   fontWeight: 900,
//                   color: UI.TEXT,
//                   outline: "none",
//                   boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
//                 }}
//                 aria-label={`OTP digit ${i + 1}`}
//               />
//             ))}
//           </div>

//           {/* Timer row */}
//           <div
//             style={{
//               marginTop: 14,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: 8,
//               fontSize: 12,
//               color: UI.MUTED,
//               fontWeight: 700,
//             }}
//           >
//             <span
//               style={{
//                 width: 16,
//                 height: 16,
//                 borderRadius: 999,
//                 background: UI.SOFT,
//                 display: "grid",
//                 placeItems: "center",
//               }}
//               aria-hidden="true"
//             >
//               <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
//                 <path
//                   d="M12 8v5l3 2"
//                   stroke={UI.MUTED}
//                   strokeWidth="2"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                 />
//                 <circle cx="12" cy="12" r="9" stroke={UI.MUTED} strokeWidth="2" />
//               </svg>
//             </span>
//             <span>Code expires in</span>
//             <span style={{ color: UI.BTN, fontWeight: 900 }}>{mmss(secondsLeft)}</span>
//           </div>

//           {/* Status message */}
//           {status.msg ? (
//             <div
//               style={{
//                 marginTop: 14,
//                 padding: "10px 12px",
//                 borderRadius: 12,
//                 fontWeight: 800,
//                 fontSize: 13,
//                 border: status.type === "error" ? "1px solid #fecdd3" : "1px solid #bbf7d0",
//                 background: status.type === "error" ? "#fff1f2" : "#ecfdf5",
//                 color: status.type === "error" ? "#9f1239" : "#166534",
//               }}
//             >
//               {status.msg}
//             </div>
//           ) : null}

//           {/* CTA */}
//           <button
//             type="button"
//             onClick={verifyOtpAndSave}
//             disabled={loading}
//             style={{
//               width: "100%",
//               marginTop: 18,
//               height: 48,
//               borderRadius: 10,
//               border: "none",
//               background: UI.BTN,
//               color: "#fff",
//               fontWeight: 900,
//               cursor: loading ? "not-allowed" : "pointer",
//               boxShadow: "0 14px 28px rgba(180,83,9,0.22)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               gap: 10,
//               opacity: loading ? 0.75 : 1,
//             }}
//           >
//             <span>{loading ? "Please wait..." : "Verify OTP & Get Report"}</span>
//             <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
//           </button>

//           {/* Links row */}
//           <div style={{ marginTop: 14, fontSize: 12, color: UI.MUTED, fontWeight: 700 }}>
//             Didn&apos;t receive the code?{" "}
//             <button
//               type="button"
//               onClick={resendOtp}
//               disabled={loading}
//               style={{
//                 border: "none",
//                 background: "transparent",
//                 color: UI.BTN,
//                 fontWeight: 900,
//                 cursor: loading ? "not-allowed" : "pointer",
//                 padding: 0,
//               }}
//             >
//               Resend
//             </button>
//           </div>

//           <div style={{ marginTop: 10 }}>
//             <button
//               type="button"
//               onClick={changeEmail}
//               disabled={loading}
//               style={{
//                 border: "none",
//                 background: "transparent",
//                 color: UI.TEXT,
//                 fontWeight: 800,
//                 fontSize: 12,
//                 cursor: loading ? "not-allowed" : "pointer",
//                 opacity: 0.7,
//               }}
//             >
//               Change Email
//             </button>
//           </div>

//           {/* Security pill */}
//           <div
//             style={{
//               marginTop: 16,
//               display: "inline-flex",
//               alignItems: "center",
//               gap: 8,
//               borderRadius: 999,
//               padding: "7px 12px",
//               background: "#f0fdf4",
//               border: "1px solid #bbf7d0",
//               color: "#166534",
//               fontWeight: 900,
//               fontSize: 10,
//               letterSpacing: 1.2,
//               textTransform: "uppercase",
//             }}
//           >
//             <span
//               style={{
//                 width: 18,
//                 height: 18,
//                 borderRadius: 999,
//                 background: "#22c55e",
//                 display: "grid",
//                 placeItems: "center",
//                 color: "#fff",
//                 fontSize: 12,
//               }}
//               aria-hidden="true"
//             >
//               🔒
//             </span>
//             Secure Encryption Enabled
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <div
//         style={{
//           padding: "16px 12px 22px",
//           textAlign: "center",
//           color: "#9ca3af",
//           fontSize: 11,
//           background: "transparent",
//         }}
//       >
//         © 2024 ACQAR Technology. Licensed for AI Property Valuations in Dubai, UAE.
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/valucheck.css";

const LS_FORM_KEY = "truvalu_formData_v1";
const LS_USER_EMAIL = "truvalu_user_email_v1";
const LS_RESET_SENT = "truvalu_reset_link_sent_v1";
const LS_VALUCHECK_DRAFT = "truvalu_valucheck_draft_v1";
const LS_VAL_ROW_ID = "truvalu_valuation_row_id";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function norm(s) {
  return (s || "").trim().replace(/\s+/g, " ");
}

export default function ValuCheckOtp() {
  const navigate = useNavigate();

  const draft = useMemo(
    () => safeParse(localStorage.getItem(LS_VALUCHECK_DRAFT)) || null,
    []
  );
  const draftEmail = (
    draft?.email ||
    localStorage.getItem(LS_USER_EMAIL) ||
    ""
  )
    .trim()
    .toLowerCase();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const OTP_LEN = 6;
  const [digits, setDigits] = useState(Array(OTP_LEN).fill(""));
  const inputsRef = useRef([]);

  const [secondsLeft, setSecondsLeft] = useState(9 * 60 + 32);

  useEffect(() => {
    const joined = digits.join("");
    setOtp(joined);
  }, [digits]);

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  function mmss(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function focusIndex(i) {
    const el = inputsRef.current?.[i];
    if (el) el.focus();
  }

  function handleDigitChange(i, v) {
    const val = (v || "").replace(/\D/g, "");

    if (val.length > 1) {
      const chars = val.slice(0, OTP_LEN).split("");
      const next = Array(OTP_LEN).fill("");
      for (let k = 0; k < chars.length; k++) next[k] = chars[k] || "";
      setDigits(next);
      focusIndex(Math.min(chars.length, OTP_LEN - 1));
      return;
    }

    const next = [...digits];
    next[i] = val.slice(0, 1);
    setDigits(next);

    if (val && i < OTP_LEN - 1) focusIndex(i + 1);
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = [...digits];
        next[i] = "";
        setDigits(next);
        return;
      }
      if (i > 0) {
        focusIndex(i - 1);
        const next = [...digits];
        next[i - 1] = "";
        setDigits(next);
      }
    }
    if (e.key === "ArrowLeft" && i > 0) focusIndex(i - 1);
    if (e.key === "ArrowRight" && i < OTP_LEN - 1) focusIndex(i + 1);
  }

  async function insertValuationAfterOtp(authUserId, userName) {
    const formData = safeParse(localStorage.getItem(LS_FORM_KEY)) || {};
    const computedSqm = Number(formData?.procedure_area || 0) || null;

    const row = {
      user_id: authUserId,
      name: norm(userName || ""),

      district: norm(formData?.district_name || formData?.area_name_en || ""),
      property_name: norm(
        formData?.property_name ||
          formData?.project_reference ||
          formData?.project_name_en ||
          ""
      ),
      building_name: norm(formData?.building_name || formData?.building_name_en || ""),
      title_deed_no: norm(formData?.title_deed_no || ""),
      title_deed_type: norm(formData?.title_deed_type || ""),
      plot_no: norm(formData?.plot_no || ""),

      valuation_type: norm(formData?.valuation_type || ""),
      valuation_type_selection: norm(formData?.valuation_type || ""),
      property_category: norm(formData?.property_category || ""),
      purpose_of_valuation: norm(formData?.purpose_of_valuation || ""),
      property_current_status: norm(formData?.property_status || ""),

      apartment_no: norm(formData?.apartment_no || ""),
      apartment_size: computedSqm,
      apartment_size_unit: norm(formData?.area_unit || ""),
      last_renovated_on: formData?.last_renovated_on || null,
      floor_level: norm(formData?.floor_level || ""),

      furnishing_type: norm(formData?.furnishing || ""),
      bedroom: norm(String(formData?.bedrooms || "")),
      bathroom: norm(String(formData?.bathrooms || "")),
      property_type: norm(formData?.property_type_en || ""),
      unit: norm(formData?.property_name_unit || ""),
      features: Array.isArray(formData?.amenities) ? formData.amenities : [],

      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("valuations")
      .insert([row])
      .select("id")
      .single();
    if (error) throw error;

    localStorage.setItem(LS_VAL_ROW_ID, data.id);
  }

  async function verifyOtpAndSave() {
    setStatus({ type: "", msg: "" });

    const code = (otp || "").trim();
    if (!draftEmail) {
      setStatus({
        type: "error",
        msg: "Email missing. Please go back and enter your details again.",
      });
      return;
    }
    if (!code) {
      setStatus({ type: "error", msg: "Please enter the OTP code." });
      return;
    }

    setLoading(true);
    try {
      const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
        email: draftEmail,
        token: code,
        type: "email",
      });
      if (verifyErr) throw verifyErr;

      const authUserId = verifyData?.user?.id || null;
      if (!authUserId) throw new Error("Could not read authenticated user id.");

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) throw new Error("Session not created. Please try OTP again.");

      const payload = {
        id: authUserId,
        role: draft?.role || null,
        name: (draft?.name || "").trim() || null,
        email: draftEmail,
        phone: draft?.phone || null,
      };

      const { error: upErr } = await supabase
        .from("users")
        .upsert(payload, { onConflict: "id" });
      if (upErr) throw upErr;

      await insertValuationAfterOtp(authUserId, payload.name || "");

      setStatus({ type: "success", msg: "Verified! Generating your report..." });
      setOtp("");
      setDigits(Array(OTP_LEN).fill(""));

      localStorage.setItem(LS_USER_EMAIL, draftEmail);
      localStorage.removeItem(LS_RESET_SENT);

      navigate("/report");
    } catch (ex) {
      setStatus({
        type: "error",
        msg:
          ex?.message ||
          "OTP verification or saving failed. Check RLS policy for users/valuations.",
      });
      console.error("OTP verify/save error:", ex);
    } finally {
      setLoading(false);
    }
  }

  async function resendOtp() {
    setStatus({ type: "", msg: "" });

    if (!draftEmail) {
      setStatus({
        type: "error",
        msg: "Email missing. Please go back and enter your details again.",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: draftEmail,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;

      setStatus({ type: "success", msg: "OTP resent to your email." });

      setSecondsLeft(9 * 60 + 32);
      setDigits(Array(OTP_LEN).fill(""));
      focusIndex(0);
    } catch (ex) {
      setStatus({
        type: "error",
        msg: ex?.message || "Could not resend OTP. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function changeEmail() {
    navigate("/valucheck");
  }

  const UI = {
    BTN: "#b45309",
    BTN_DARK: "#92400e",
    BG: "#f7f7f7",
    CARD: "#ffffff",
    TEXT: "#111827",
    MUTED: "#6b7280",
    BORDER: "#e5e7eb",
    SOFT: "#f3f4f6",
  };

  // ✅ NEW: responsive helpers (no UI/functionality change, only sizing)
  const R = {
    pagePadX: "clamp(12px, 3.5vw, 18px)",
    pagePadY: "clamp(24px, 6vw, 34px)",
    cardPad: "clamp(18px, 4vw, 28px) clamp(16px, 4vw, 26px)",
    cardRadius: "clamp(14px, 3vw, 16px)",
    h1: "clamp(20px, 4.8vw, 26px)",
    p: "clamp(12px, 2.6vw, 13px)",
    otpGap: "clamp(6px, 2vw, 10px)",
    otpW: "clamp(38px, 10vw, 46px)",
    otpH: "clamp(46px, 12vw, 52px)",
    otpFs: "clamp(16px, 4vw, 18px)",
    btnH: "clamp(44px, 10.5vw, 48px)",
    btnPadX: "clamp(12px, 3.2vw, 14px)",
  };

  return (
    <div style={{ minHeight: "100vh", background: UI.BG }}>
      {/* Top bar */}
      <div
        style={{
          height: 64,
          background: "#fff",
          borderBottom: `1px solid ${UI.BORDER}`,
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            width: "100%",
            padding: `0 ${R.pagePadX}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxSizing: "border-box",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: 4,
                background: UI.BTN,
                boxShadow: "0 8px 18px rgba(180,83,9,0.18)",
                flex: "0 0 auto",
              }}
            />
            <div
              style={{
                fontWeight: 900,
                letterSpacing: 1,
                color: UI.TEXT,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              ACQAR
            </div>
          </div>

          <button
            type="button"
            style={{
              background: UI.BTN,
              border: "none",
              color: "#fff",
              fontWeight: 800,
              padding: `10px ${R.btnPadX}`,
              borderRadius: 10,
              cursor: "pointer",
              boxShadow: "0 10px 22px rgba(180,83,9,0.22)",
              flex: "0 0 auto",
              maxWidth: "52vw",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            onClick={() => window.open("mailto:support@acqar.com")}
          >
            Contact Support
          </button>
        </div>
      </div>

      {/* Center card */}
      <div
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `${R.pagePadY} ${R.pagePadX}`,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            background: UI.CARD,
            borderRadius: R.cardRadius,
            border: `1px solid ${UI.BORDER}`,
            boxShadow: "0 18px 50px rgba(0,0,0,0.06)",
            padding: R.cardPad,
            textAlign: "center",
          }}
        >
          {/* icon */}
          <div
            style={{
              width: "clamp(48px, 12vw, 56px)",
              height: "clamp(48px, 12vw, 56px)",
              margin: "0 auto 12px",
              borderRadius: "clamp(12px, 3vw, 14px)",
              background: UI.SOFT,
              display: "grid",
              placeItems: "center",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M4 6.5C4 5.12 5.12 4 6.5 4h11C18.88 4 20 5.12 20 6.5v11c0 1.38-1.12 2.5-2.5 2.5h-11C5.12 20 4 18.88 4 17.5v-11Z"
                stroke={UI.MUTED}
                strokeWidth="1.6"
              />
              <path
                d="M6.5 7.5 12 12l5.5-4.5"
                stroke={UI.MUTED}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 style={{ margin: "0 0 6px", fontSize: R.h1, fontWeight: 900, color: UI.TEXT }}>
            Enter OTP Code
          </h1>
          <p style={{ margin: 0, fontSize: R.p, color: UI.MUTED, lineHeight: 1.6 }}>
            We sent a verification code to{" "}
            <b style={{ color: UI.TEXT, wordBreak: "break-word" }}>
              {draftEmail || "your email"}
            </b>
          </p>

          {/* OTP boxes */}
          <div
            style={{
              marginTop: 22,
              display: "flex",
              gap: R.otpGap,
              justifyContent: "center",
              flexWrap: "wrap",
              maxWidth: 360,
              marginInline: "auto",
            }}
          >
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                disabled={loading}
                style={{
                  width: R.otpW,
                  height: R.otpH,
                  borderRadius: 10,
                  border: `1px solid ${UI.BORDER}`,
                  background: "#fff",
                  textAlign: "center",
                  fontSize: R.otpFs,
                  fontWeight: 900,
                  color: UI.TEXT,
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>

          {/* Timer row */}
          <div
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: "clamp(11px, 2.6vw, 12px)",
              color: UI.MUTED,
              fontWeight: 700,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                width: 16,
                height: 16,
                borderRadius: 999,
                background: UI.SOFT,
                display: "grid",
                placeItems: "center",
              }}
              aria-hidden="true"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8v5l3 2"
                  stroke={UI.MUTED}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="9" stroke={UI.MUTED} strokeWidth="2" />
              </svg>
            </span>
            <span>Code expires in</span>
            <span style={{ color: UI.BTN, fontWeight: 900 }}>{mmss(secondsLeft)}</span>
          </div>

          {/* Status message */}
          {status.msg ? (
            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 12,
                fontWeight: 800,
                fontSize: "clamp(12px, 2.8vw, 13px)",
                border: status.type === "error" ? "1px solid #fecdd3" : "1px solid #bbf7d0",
                background: status.type === "error" ? "#fff1f2" : "#ecfdf5",
                color: status.type === "error" ? "#9f1239" : "#166534",
                wordBreak: "break-word",
              }}
            >
              {status.msg}
            </div>
          ) : null}

          {/* CTA */}
          <button
            type="button"
            onClick={verifyOtpAndSave}
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 18,
              height: R.btnH,
              borderRadius: 10,
              border: "none",
              background: UI.BTN,
              color: "#fff",
              fontWeight: 900,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 14px 28px rgba(180,83,9,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              opacity: loading ? 0.75 : 1,
            }}
          >
            <span>{loading ? "Please wait..." : "Verify OTP & Get Report"}</span>
            <span style={{ fontSize: 18, lineHeight: 1 }}>→</span>
          </button>

          {/* Links row */}
          <div style={{ marginTop: 14, fontSize: "clamp(11px, 2.6vw, 12px)", color: UI.MUTED, fontWeight: 700 }}>
            Didn&apos;t receive the code?{" "}
            <button
              type="button"
              onClick={resendOtp}
              disabled={loading}
              style={{
                border: "none",
                background: "transparent",
                color: UI.BTN,
                fontWeight: 900,
                cursor: loading ? "not-allowed" : "pointer",
                padding: 0,
              }}
            >
              Resend
            </button>
          </div>

          <div style={{ marginTop: 10 }}>
            <button
              type="button"
              onClick={changeEmail}
              disabled={loading}
              style={{
                border: "none",
                background: "transparent",
                color: UI.TEXT,
                fontWeight: 800,
                fontSize: "clamp(11px, 2.6vw, 12px)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: 0.7,
              }}
            >
              Change Email
            </button>
          </div>

          {/* Security pill */}
          <div
            style={{
              marginTop: 16,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 999,
              padding: "7px 12px",
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
              fontWeight: 900,
              fontSize: 10,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              maxWidth: "100%",
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 999,
                background: "#22c55e",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontSize: 12,
                flex: "0 0 auto",
              }}
              aria-hidden="true"
            >
              🔒
            </span>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Secure Encryption Enabled
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "16px 12px 22px",
          textAlign: "center",
          color: "#9ca3af",
          fontSize: "clamp(10px, 2.3vw, 11px)",
          background: "transparent",
        }}
      >
        © 2024 ACQAR Technology. Licensed for AI Property Valuations in Dubai, UAE.
      </div>
    </div>
  );
}
