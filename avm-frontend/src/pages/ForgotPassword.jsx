// // src/pages/ForgotPassword.jsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// export default function ForgotPassword() {
//   const navigate = useNavigate();

//   const [step, setStep] = useState("email"); // "email" | "otp" | "reset"
//   const [email, setEmail] = useState("");

//   // OTP: 6 boxes
//   const OTP_LEN = 6;
//   const [otpDigits, setOtpDigits] = useState(Array(OTP_LEN).fill(""));
//   const otpRefs = useRef([]);

//   const [newPw, setNewPw] = useState("");
//   const [confirmPw, setConfirmPw] = useState("");
//   const [showPw, setShowPw] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [msg, setMsg] = useState({ type: "", text: "" });

//   function normEmail(v) {
//     return (v || "").trim().toLowerCase();
//   }

//   const otpValue = useMemo(() => otpDigits.join(""), [otpDigits]);

//   useEffect(() => {
//     // reset messages on step change
//     setMsg({ type: "", text: "" });
//   }, [step]);

//   // ---------------------------
//   // Step 1: Send OTP
//   // ---------------------------
//   async function sendRecoveryOtp(e) {
//     e?.preventDefault?.();
//     setMsg({ type: "", text: "" });

//     const em = normEmail(email);
//     if (!em) {
//       setMsg({ type: "error", text: "Enter your email first." });
//       return;
//     }

//     try {
//       setLoading(true);

//       // ✅ Send OTP to email (Supabase)
//       // NOTE: shouldCreateUser:false means "only existing auth users"
//       const { error } = await supabase.auth.signInWithOtp({
//         email: em,
//         options: { shouldCreateUser: false },
//       });

//       if (error) {
//         // Common case: if user is not in auth, Supabase will error
//         throw error;
//       }

//       setStep("otp");
//       setOtpDigits(Array(OTP_LEN).fill(""));
//       setTimeout(() => otpRefs.current?.[0]?.focus?.(), 0);

//       setMsg({ type: "success", text: "OTP sent to your email. Enter the 6-digit code." });
//     } catch (err) {
//       setMsg({
//         type: "error",
//         text: err?.message || "Could not send OTP. Please try again.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ---------------------------
//   // Step 2: Verify OTP
//   // ---------------------------
//   async function verifyOtp(e) {
//     e?.preventDefault?.();
//     setMsg({ type: "", text: "" });

//     const em = normEmail(email);
//     const code = (otpValue || "").trim();

//     if (!em) {
//       setMsg({ type: "error", text: "Email missing. Go back and enter email." });
//       return;
//     }
//     if (code.length !== OTP_LEN || code.split("").some((c) => c < "0" || c > "9")) {
//       setMsg({ type: "error", text: "Enter the full 6-digit OTP code." });
//       return;
//     }

//     try {
//       setLoading(true);

//       const { data, error } = await supabase.auth.verifyOtp({
//         email: em,
//         token: code,
//         type: "email",
//       });

//       if (error) throw error;

//       const { data: sessionData } = await supabase.auth.getSession();
//       if (!sessionData?.session && !data?.session) {
//         throw new Error("Session not created. Please request OTP again.");
//       }

//       setStep("reset");
//       setMsg({ type: "success", text: "OTP verified. Set your new password." });
//     } catch (err) {
//       setMsg({
//         type: "error",
//         text: err?.message || "OTP verification failed. Try again.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ---------------------------
//   // Step 3: Update Password
//   // ---------------------------
//   async function updatePassword(e) {
//     e.preventDefault();
//     setMsg({ type: "", text: "" });

//     if (!newPw || newPw.length < 8) {
//       setMsg({ type: "error", text: "Password must be at least 8 characters." });
//       return;
//     }
//     if (newPw !== confirmPw) {
//       setMsg({ type: "error", text: "Passwords do not match." });
//       return;
//     }

//     try {
//       setLoading(true);

//       // ✅ Supabase: update current authenticated user's password
//       const { error } = await supabase.auth.updateUser({ password: newPw });
//       if (error) throw error;

//       setMsg({ type: "success", text: "Password updated successfully. Please login again." });

//       // optional: sign out to force login with new password
//       await supabase.auth.signOut();

//       setTimeout(() => navigate("/login"), 400);
//     } catch (err) {
//       setMsg({ type: "error", text: err?.message || "Failed to update password." });
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ---------------------------
//   // OTP input helpers (6 boxes)
//   // ---------------------------
//   function setDigitAt(idx, val) {
//     const v = (val || "").replace(/\D/g, "").slice(-1); // one digit
//     setOtpDigits((prev) => {
//       const next = [...prev];
//       next[idx] = v;
//       return next;
//     });
//   }

//   function onOtpChange(idx, e) {
//     setDigitAt(idx, e.target.value);
//     const v = (e.target.value || "").replace(/\D/g, "");
//     if (v) {
//       const nextIdx = Math.min(idx + 1, OTP_LEN - 1);
//       otpRefs.current?.[nextIdx]?.focus?.();
//     }
//   }

//   function onOtpKeyDown(idx, e) {
//     if (e.key === "Backspace") {
//       if (otpDigits[idx]) {
//         setDigitAt(idx, "");
//         return;
//       }
//       const prevIdx = Math.max(idx - 1, 0);
//       otpRefs.current?.[prevIdx]?.focus?.();
//       return;
//     }
//     if (e.key === "ArrowLeft") {
//       const prevIdx = Math.max(idx - 1, 0);
//       otpRefs.current?.[prevIdx]?.focus?.();
//     }
//     if (e.key === "ArrowRight") {
//       const nextIdx = Math.min(idx + 1, OTP_LEN - 1);
//       otpRefs.current?.[nextIdx]?.focus?.();
//     }
//   }

//   async function resendOtp() {
//     await sendRecoveryOtp();
//   }

//   function changeEmail() {
//     setStep("email");
//     setOtpDigits(Array(OTP_LEN).fill(""));
//   }

//   return (
//     <div style={styles.page}>
//       {/* ── LEFT PANEL (matches Login style) ── */}
//       <div style={styles.leftPanel}>
//         <div style={styles.logoRow}>
//           <div style={styles.logoBox}>
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//               <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#fff" />
//               <rect x="14" y="2" width="8" height="8" rx="1.5" fill="#fff" opacity="0.6" />
//               <rect x="2" y="14" width="8" height="8" rx="1.5" fill="#fff" opacity="0.6" />
//               <rect x="14" y="14" width="8" height="8" rx="1.5" fill="#fff" opacity="0.3" />
//             </svg>
//           </div>
//           <span style={styles.logoText}>ACQAR</span>
//         </div>

//         <div style={styles.heroSection}>
//           <h1 style={styles.heroTitle}>
//             Security<br />First<br />Recovery<br />Access
//           </h1>
//           <p style={styles.heroSub}>
//             Reset your password using encrypted email verification.
//           </p>
//         </div>

//         <div style={styles.badgesList}>
//           {[
//             { title: "ENCRYPTED RECOVERY", sub: "Tokenized verification" },
//             { title: "GDPR COMPLIANT", sub: "Strict privacy controls" },
//             { title: "DUBAI DATA RESIDENCY", sub: "Local infrastructure" },
//           ].map((b, i) => (
//             <div key={i} style={styles.badgeCard}>
//               <div style={styles.badgeIcon}>
//                 <span style={{ fontWeight: 900, color: BTN_ORANGE }}>✓</span>
//               </div>
//               <div>
//                 <div style={styles.badgeTitle}>{b.title}</div>
//                 <div style={styles.badgeSub}>{b.sub}</div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* ── RIGHT PANEL ── */}
//       <div style={styles.rightPanel}>
//         <div style={styles.formCard}>
//           <h2 style={styles.formTitle}>
//             {step === "email"
//               ? "Forgot Password?"
//               : step === "otp"
//               ? "Verify Your Email"
//               : "Reset Password"}
//           </h2>

//           <p style={styles.formSub}>
//             {step === "email"
//               ? "Enter your registered email to receive a secure OTP code."
//               : step === "otp"
//               ? <>We sent a 6-digit code to <b>{normEmail(email) || "your email"}</b></>
//               : "Create a new password for your account."}
//           </p>

//           {msg.text ? (
//             <div style={msg.type === "error" ? styles.msgError : styles.msgOk}>
//               {msg.text}
//             </div>
//           ) : null}

//           {/* STEP 1 */}
//           {step === "email" && (
//             <form onSubmit={sendRecoveryOtp}>
//               <div style={styles.field}>
//                 <label style={styles.label} htmlFor="fp-email">
//                   WORK EMAIL
//                 </label>
//                 <div style={styles.inputWrap}>
//                   <span style={styles.inputIcon}>
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                       <rect x="2" y="4" width="20" height="16" rx="2.5" stroke="#9ca3af" strokeWidth="1.8" />
//                       <path d="M2 8l10 7 10-7" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
//                     </svg>
//                   </span>
//                   <input
//                     id="fp-email"
//                     type="email"
//                     style={styles.input}
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     placeholder="name@company.com"
//                     autoComplete="email"
//                     required
//                     disabled={loading}
//                   />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 style={{
//                   ...styles.cta,
//                   opacity: loading ? 0.75 : 1,
//                   cursor: loading ? "not-allowed" : "pointer",
//                 }}
//                 disabled={loading}
//               >
//                 {loading ? "Please wait..." : "Send Recovery OTP →"}
//               </button>
//             </form>
//           )}

//           {/* STEP 2 */}
//           {step === "otp" && (
//             <form onSubmit={verifyOtp}>
//               <div style={styles.otpRow}>
//                 {otpDigits.map((d, idx) => (
//                   <input
//                     key={idx}
//                     ref={(el) => (otpRefs.current[idx] = el)}
//                     value={d}
//                     onChange={(e) => onOtpChange(idx, e)}
//                     onKeyDown={(e) => onOtpKeyDown(idx, e)}
//                     inputMode="numeric"
//                     autoComplete="one-time-code"
//                     maxLength={1}
//                     style={styles.otpBox}
//                     disabled={loading}
//                   />
//                 ))}
//               </div>

//               <button
//                 type="submit"
//                 style={{
//                   ...styles.cta,
//                   opacity: loading ? 0.75 : 1,
//                   cursor: loading ? "not-allowed" : "pointer",
//                 }}
//                 disabled={loading}
//               >
//                 {loading ? "Verifying..." : "Verify & Continue →"}
//               </button>

//               <div style={styles.otpActionsRow}>
//                 <button
//                   type="button"
//                   style={styles.smallBtn}
//                   onClick={resendOtp}
//                   disabled={loading}
//                 >
//                   Resend OTP
//                 </button>
//                 <button
//                   type="button"
//                   style={styles.smallBtn}
//                   onClick={changeEmail}
//                   disabled={loading}
//                 >
//                   Change Email
//                 </button>
//               </div>
//             </form>
//           )}

//           {/* STEP 3 */}
//           {step === "reset" && (
//             <form onSubmit={updatePassword}>
//               <div style={styles.field}>
//                 <label style={styles.label} htmlFor="newPw">
//                   NEW PASSWORD
//                 </label>
//                 <div style={styles.inputWrap}>
//                   <span style={styles.inputIcon}>
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                       <rect x="5" y="11" width="14" height="10" rx="2" stroke="#9ca3af" strokeWidth="1.8" />
//                       <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
//                     </svg>
//                   </span>
//                   <input
//                     id="newPw"
//                     type={showPw ? "text" : "password"}
//                     style={{ ...styles.input, paddingRight: 46 }}
//                     value={newPw}
//                     onChange={(e) => setNewPw(e.target.value)}
//                     placeholder="••••••••"
//                     autoComplete="new-password"
//                     required
//                     disabled={loading}
//                   />
//                   <button
//                     type="button"
//                     style={styles.eyeBtn}
//                     onClick={() => setShowPw((p) => !p)}
//                     disabled={loading}
//                     aria-label={showPw ? "Hide password" : "Show password"}
//                   >
//                     {showPw ? "🙈" : "👁"}
//                   </button>
//                 </div>
//               </div>

//               <div style={styles.field}>
//                 <label style={styles.label} htmlFor="confirmPw">
//                   CONFIRM NEW PASSWORD
//                 </label>
//                 <div style={styles.inputWrap}>
//                   <span style={styles.inputIcon}>
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                       <rect x="5" y="11" width="14" height="10" rx="2" stroke="#9ca3af" strokeWidth="1.8" />
//                       <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
//                     </svg>
//                   </span>
//                   <input
//                     id="confirmPw"
//                     type={showPw ? "text" : "password"}
//                     style={styles.input}
//                     value={confirmPw}
//                     onChange={(e) => setConfirmPw(e.target.value)}
//                     placeholder="••••••••"
//                     autoComplete="new-password"
//                     required
//                     disabled={loading}
//                   />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 style={{
//                   ...styles.cta,
//                   opacity: loading ? 0.75 : 1,
//                   cursor: loading ? "not-allowed" : "pointer",
//                 }}
//                 disabled={loading}
//               >
//                 {loading ? "Updating..." : "Update Password →"}
//               </button>
//             </form>
//           )}

//           <p style={styles.registerLink}>
//             Remembered your password?{" "}
//             <Link to="/login" style={styles.registerLinkText}>
//               Back to Sign In
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// const BTN_ORANGE = "#b45309";

// // Same visual language as your Login.jsx
// const styles = {
//   page: {
//     minHeight: "100vh",
//     display: "flex",
//     flexDirection: "row",
//     fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
//     background: "#ffffff",
//   },

//   leftPanel: {
//     width: "40%",
//     minHeight: "100vh",
//     background: "#f3f4f6",
//     display: "flex",
//     flexDirection: "column",
//     padding: "36px 40px 40px",
//     boxSizing: "border-box",
//   },

//   logoRow: {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//   },
//   logoBox: {
//     width: 38,
//     height: 38,
//     borderRadius: 10,
//     background: "#1a1a1a",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   logoText: {
//     fontSize: 17,
//     fontWeight: 800,
//     color: "#1a1a1a",
//     letterSpacing: 2,
//   },

//   heroSection: {
//     flex: 1,
//     display: "flex",
//     flexDirection: "column",
//     justifyContent: "center",
//     paddingBottom: 20,
//   },
//   heroTitle: {
//     margin: "0 0 20px",
//     fontSize: 40,
//     fontWeight: 900,
//     color: "#111827",
//     lineHeight: 1.13,
//     letterSpacing: -0.5,
//   },
//   heroSub: {
//     margin: 0,
//     fontSize: 15,
//     color: "#6b7280",
//     lineHeight: 1.6,
//     maxWidth: 320,
//   },

//   badgesList: {
//     display: "flex",
//     flexDirection: "column",
//     gap: 12,
//   },
//   badgeCard: {
//     display: "flex",
//     alignItems: "center",
//     gap: 14,
//     background: "#ffffff",
//     borderRadius: 14,
//     padding: "14px 18px",
//     boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
//   },
//   badgeIcon: {
//     flexShrink: 0,
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     background: "#fff7ed",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     border: "1px solid rgba(180,83,9,0.25)",
//   },
//   badgeTitle: {
//     fontSize: 13,
//     fontWeight: 800,
//     color: "#111827",
//     letterSpacing: 0.4,
//   },
//   badgeSub: {
//     fontSize: 12,
//     color: "#9ca3af",
//     marginTop: 2,
//   },

//   rightPanel: {
//     flex: 1,
//     minHeight: "100vh",
//     background: "#ffffff",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: "40px 32px",
//     boxSizing: "border-box",
//   },

//   formCard: {
//     width: "100%",
//     maxWidth: 460,
//   },

//   formTitle: {
//     margin: "0 0 6px",
//     fontSize: 24,
//     fontWeight: 800,
//     color: "#111827",
//     textAlign: "center",
//     letterSpacing: -0.3,
//   },
//   formSub: {
//     margin: "0 0 22px",
//     fontSize: 14,
//     color: "#6b7280",
//     textAlign: "center",
//     lineHeight: 1.6,
//   },

//   msgError: {
//     marginBottom: 16,
//     background: "#fff1f2",
//     border: "1px solid #fecdd3",
//     color: "#9f1239",
//     padding: "11px 14px",
//     borderRadius: 12,
//     fontSize: 13,
//     fontWeight: 600,
//   },
//   msgOk: {
//     marginBottom: 16,
//     background: "#ecfdf5",
//     border: "1px solid #bbf7d0",
//     color: "#166534",
//     padding: "11px 14px",
//     borderRadius: 12,
//     fontSize: 13,
//     fontWeight: 600,
//   },

//   field: { marginBottom: 16 },
//   label: {
//     display: "block",
//     fontSize: 11,
//     fontWeight: 800,
//     letterSpacing: 1.2,
//     color: "#6b7280",
//     marginBottom: 7,
//   },
//   inputWrap: { position: "relative", display: "flex", alignItems: "center" },
//   inputIcon: {
//     position: "absolute",
//     left: 14,
//     top: "50%",
//     transform: "translateY(-50%)",
//     display: "flex",
//     alignItems: "center",
//     pointerEvents: "none",
//     zIndex: 1,
//   },
//   input: {
//     width: "100%",
//     boxSizing: "border-box",
//     border: "1px solid #e5e7eb",
//     borderRadius: 12,
//     padding: "13px 14px 13px 42px",
//     fontSize: 14,
//     outline: "none",
//     background: "#ffffff",
//     color: "#111827",
//     fontFamily: "inherit",
//   },
//   eyeBtn: {
//     position: "absolute",
//     right: 12,
//     top: "50%",
//     transform: "translateY(-50%)",
//     border: "none",
//     background: "transparent",
//     padding: 4,
//     cursor: "pointer",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     fontSize: 16,
//   },

//   cta: {
//     marginTop: 4,
//     width: "100%",
//     border: "none",
//     cursor: "pointer",
//     borderRadius: 12,
//     padding: "15px 18px",
//     background: BTN_ORANGE,
//     boxShadow: "0 8px 24px rgba(180,83,9,0.22)",
//     fontSize: 15,
//     fontWeight: 800,
//     color: "#ffffff",
//     letterSpacing: 0.2,
//     fontFamily: "inherit",
//   },

//   otpRow: {
//     display: "flex",
//     gap: 10,
//     justifyContent: "space-between",
//     margin: "10px 0 14px",
//   },
//   otpBox: {
//     width: "14%",
//     height: 56,
//     borderRadius: 12,
//     border: "1px solid #e5e7eb",
//     textAlign: "center",
//     fontSize: 22,
//     fontWeight: 900,
//     outline: "none",
//     color: "#111827",
//     background: "#ffffff",
//   },

//   otpActionsRow: {
//     display: "flex",
//     gap: 10,
//     marginTop: 12,
//     justifyContent: "center",
//     flexWrap: "wrap",
//   },
//   smallBtn: {
//     padding: "8px 14px",
//     borderRadius: 999,
//     border: "1px solid #e5e7eb",
//     background: "#f9fafb",
//     cursor: "pointer",
//     fontWeight: 700,
//     fontSize: 12,
//     color: "#374151",
//     fontFamily: "inherit",
//   },

//   registerLink: {
//     textAlign: "center",
//     marginTop: 22,
//     fontSize: 14,
//     fontWeight: 600,
//     color: "#6b7280",
//   },
//   registerLinkText: {
//     color: "#111827",
//     textDecoration: "none",
//     fontWeight: 800,
//   },
// };


// src/pages/ForgotPassword.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("email"); // "email" | "otp" | "reset"
  const [email, setEmail] = useState("");

  // OTP: 6 boxes
  const OTP_LEN = 6;
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LEN).fill(""));
  const otpRefs = useRef([]);

  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  function normEmail(v) {
    return (v || "").trim().toLowerCase();
  }

  const otpValue = useMemo(() => otpDigits.join(""), [otpDigits]);

  useEffect(() => {
    // reset messages on step change
    setMsg({ type: "", text: "" });
  }, [step]);

  // ---------------------------
  // Step 1: Send OTP
  // ---------------------------
  async function sendRecoveryOtp(e) {
    e?.preventDefault?.();
    setMsg({ type: "", text: "" });

    const em = normEmail(email);
    if (!em) {
      setMsg({ type: "error", text: "Enter your email first." });
      return;
    }

    try {
      setLoading(true);

      // ✅ Send OTP to email (Supabase)
      // NOTE: shouldCreateUser:false means "only existing auth users"
      const { error } = await supabase.auth.signInWithOtp({
        email: em,
        options: { shouldCreateUser: false },
      });

      if (error) {
        // Common case: if user is not in auth, Supabase will error
        throw error;
      }

      setStep("otp");
      setOtpDigits(Array(OTP_LEN).fill(""));
      setTimeout(() => otpRefs.current?.[0]?.focus?.(), 0);

      setMsg({
        type: "success",
        text: "OTP sent to your email. Enter the 6-digit code.",
      });
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.message || "Could not send OTP. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------
  // Step 2: Verify OTP
  // ---------------------------
  async function verifyOtp(e) {
    e?.preventDefault?.();
    setMsg({ type: "", text: "" });

    const em = normEmail(email);
    const code = (otpValue || "").trim();

    if (!em) {
      setMsg({ type: "error", text: "Email missing. Go back and enter email." });
      return;
    }
    if (code.length !== OTP_LEN || code.split("").some((c) => c < "0" || c > "9")) {
      setMsg({ type: "error", text: "Enter the full 6-digit OTP code." });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.verifyOtp({
        email: em,
        token: code,
        type: "email",
      });

      if (error) throw error;

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session && !data?.session) {
        throw new Error("Session not created. Please request OTP again.");
      }

      setStep("reset");
      setMsg({ type: "success", text: "OTP verified. Set your new password." });
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.message || "OTP verification failed. Try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------
  // Step 3: Update Password
  // ---------------------------
  async function updatePassword(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!newPw || newPw.length < 8) {
      setMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (newPw !== confirmPw) {
      setMsg({ type: "error", text: "Passwords do not match." });
      return;
    }

    try {
      setLoading(true);

      // ✅ Supabase: update current authenticated user's password
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;

      setMsg({
        type: "success",
        text: "Password updated successfully. Please login again.",
      });

      // optional: sign out to force login with new password
      await supabase.auth.signOut();

      setTimeout(() => navigate("/login"), 400);
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Failed to update password." });
    } finally {
      setLoading(false);
    }
  }

  // ---------------------------
  // OTP input helpers (6 boxes)
  // ---------------------------
  function setDigitAt(idx, val) {
    const v = (val || "").replace(/\D/g, "").slice(-1); // one digit
    setOtpDigits((prev) => {
      const next = [...prev];
      next[idx] = v;
      return next;
    });
  }

  function onOtpChange(idx, e) {
    setDigitAt(idx, e.target.value);
    const v = (e.target.value || "").replace(/\D/g, "");
    if (v) {
      const nextIdx = Math.min(idx + 1, OTP_LEN - 1);
      otpRefs.current?.[nextIdx]?.focus?.();
    }
  }

  function onOtpKeyDown(idx, e) {
    if (e.key === "Backspace") {
      if (otpDigits[idx]) {
        setDigitAt(idx, "");
        return;
      }
      const prevIdx = Math.max(idx - 1, 0);
      otpRefs.current?.[prevIdx]?.focus?.();
      return;
    }
    if (e.key === "ArrowLeft") {
      const prevIdx = Math.max(idx - 1, 0);
      otpRefs.current?.[prevIdx]?.focus?.();
    }
    if (e.key === "ArrowRight") {
      const nextIdx = Math.min(idx + 1, OTP_LEN - 1);
      otpRefs.current?.[nextIdx]?.focus?.();
    }
  }

  async function resendOtp() {
    await sendRecoveryOtp();
  }

  function changeEmail() {
    setStep("email");
    setOtpDigits(Array(OTP_LEN).fill(""));
  }

  return (
    <div style={styles.page}>
      {/* ✅ Responsive ONLY (no functionality/UI changes) */}
      <style>{responsiveCss}</style>

      {/* ── LEFT PANEL (matches Login style) ── */}
      <div style={styles.leftPanel} className="fp-left">
        <div style={styles.logoRow}>
          <div style={styles.logoBox}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#fff" />
              <rect x="14" y="2" width="8" height="8" rx="1.5" fill="#fff" opacity="0.6" />
              <rect x="2" y="14" width="8" height="8" rx="1.5" fill="#fff" opacity="0.6" />
              <rect x="14" y="14" width="8" height="8" rx="1.5" fill="#fff" opacity="0.3" />
            </svg>
          </div>
          <span style={styles.logoText}>ACQAR</span>
        </div>

        <div style={styles.heroSection} className="fp-hero">
          <h1 style={styles.heroTitle} className="fp-heroTitle">
            Security<br />First<br />Recovery<br />Access
          </h1>
          <p style={styles.heroSub}>
            Reset your password using encrypted email verification.
          </p>
        </div>

        <div style={styles.badgesList} className="fp-badges">
          {[
            { title: "ENCRYPTED RECOVERY", sub: "Tokenized verification" },
            { title: "GDPR COMPLIANT", sub: "Strict privacy controls" },
            { title: "DUBAI DATA RESIDENCY", sub: "Local infrastructure" },
          ].map((b, i) => (
            <div key={i} style={styles.badgeCard} className="fp-badgeCard">
              <div style={styles.badgeIcon}>
                <span style={{ fontWeight: 900, color: BTN_ORANGE }}>✓</span>
              </div>
              <div>
                <div style={styles.badgeTitle}>{b.title}</div>
                <div style={styles.badgeSub}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={styles.rightPanel} className="fp-right">
        <div style={styles.formCard} className="fp-card">
          <h2 style={styles.formTitle}>
            {step === "email"
              ? "Forgot Password?"
              : step === "otp"
              ? "Verify Your Email"
              : "Reset Password"}
          </h2>

          <p style={styles.formSub}>
            {step === "email"
              ? "Enter your registered email to receive a secure OTP code."
              : step === "otp"
              ? (
                <>
                  We sent a 6-digit code to <b>{normEmail(email) || "your email"}</b>
                </>
              )
              : "Create a new password for your account."}
          </p>

          {msg.text ? (
            <div style={msg.type === "error" ? styles.msgError : styles.msgOk}>
              {msg.text}
            </div>
          ) : null}

          {/* STEP 1 */}
          {step === "email" && (
            <form onSubmit={sendRecoveryOtp}>
              <div style={styles.field}>
                <label style={styles.label} htmlFor="fp-email">
                  WORK EMAIL
                </label>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="4" width="20" height="16" rx="2.5" stroke="#9ca3af" strokeWidth="1.8" />
                      <path d="M2 8l10 7 10-7" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="fp-email"
                    type="email"
                    style={styles.input}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    autoComplete="email"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  ...styles.cta,
                  opacity: loading ? 0.75 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                disabled={loading}
              >
                {loading ? "Please wait..." : "Send Recovery OTP →"}
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === "otp" && (
            <form onSubmit={verifyOtp}>
              <div style={styles.otpRow} className="fp-otpRow">
                {otpDigits.map((d, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    value={d}
                    onChange={(e) => onOtpChange(idx, e)}
                    onKeyDown={(e) => onOtpKeyDown(idx, e)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    style={styles.otpBox}
                    className="fp-otpBox"
                    disabled={loading}
                  />
                ))}
              </div>

              <button
                type="submit"
                style={{
                  ...styles.cta,
                  opacity: loading ? 0.75 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Continue →"}
              </button>

              <div style={styles.otpActionsRow}>
                <button
                  type="button"
                  style={styles.smallBtn}
                  onClick={resendOtp}
                  disabled={loading}
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  style={styles.smallBtn}
                  onClick={changeEmail}
                  disabled={loading}
                >
                  Change Email
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 */}
          {step === "reset" && (
            <form onSubmit={updatePassword}>
              <div style={styles.field}>
                <label style={styles.label} htmlFor="newPw">
                  NEW PASSWORD
                </label>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke="#9ca3af" strokeWidth="1.8" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="newPw"
                    type={showPw ? "text" : "password"}
                    style={{ ...styles.input, paddingRight: 46 }}
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    style={styles.eyeBtn}
                    onClick={() => setShowPw((p) => !p)}
                    disabled={loading}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label} htmlFor="confirmPw">
                  CONFIRM NEW PASSWORD
                </label>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke="#9ca3af" strokeWidth="1.8" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="confirmPw"
                    type={showPw ? "text" : "password"}
                    style={styles.input}
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{
                  ...styles.cta,
                  opacity: loading ? 0.75 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password →"}
              </button>
            </form>
          )}

          <p style={styles.registerLink}>
            Remembered your password?{" "}
            <Link to="/login" style={styles.registerLinkText}>
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const responsiveCss = `
  html, body { max-width: 100%; overflow-x: hidden; }

  /* Tablet / below: stack panels */
  @media (max-width: 980px) {
    .fp-left { width: 44% !important; padding: 28px 26px 28px !important; }
    .fp-right { padding: 32px 22px !important; }
    .fp-heroTitle { font-size: 34px !important; }
  }

  /* Mobile: single column */
  @media (max-width: 768px) {
    /* stack */
    .fp-left {
      width: 100% !important;
      min-height: auto !important;
      padding: 22px 18px 18px !important;
    }
    .fp-right{
      width: 100% !important;
      min-height: auto !important;
      padding: 22px 16px 34px !important;
      align-items: flex-start !important;
    }

    /* make main wrapper column */
    /* (target the root inline flex container via global) */
    body .fp-left, body .fp-right { box-sizing: border-box; }

    /* hero tweaks */
    .fp-hero { padding: 18px 0 8px !important; }
    .fp-heroTitle { font-size: 30px !important; line-height: 1.12 !important; }
    .fp-badges { gap: 10px !important; }
    .fp-badgeCard { padding: 12px 14px !important; border-radius: 14px !important; }

    /* card sizing */
    .fp-card { max-width: 520px !important; margin: 0 auto !important; }

    /* OTP row: fit nicely */
    .fp-otpRow { gap: 8px !important; }
    .fp-otpBox { height: 52px !important; font-size: 20px !important; }
  }

  /* Small phones */
  @media (max-width: 420px) {
    .fp-heroTitle { font-size: 26px !important; }
    .fp-otpRow { gap: 6px !important; }
    .fp-otpBox { height: 48px !important; font-size: 18px !important; }
  }
`;

const BTN_ORANGE = "#b45309";

// Same visual language as your Login.jsx
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "row",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    background: "#ffffff",
  },

  leftPanel: {
    width: "40%",
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    flexDirection: "column",
    padding: "36px 40px 40px",
    boxSizing: "border-box",
  },

  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "#1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 17,
    fontWeight: 800,
    color: "#1a1a1a",
    letterSpacing: 2,
  },

  heroSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingBottom: 20,
  },
  heroTitle: {
    margin: "0 0 20px",
    fontSize: 40,
    fontWeight: 900,
    color: "#111827",
    lineHeight: 1.13,
    letterSpacing: -0.5,
  },
  heroSub: {
    margin: 0,
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 1.6,
    maxWidth: 320,
  },

  badgesList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  badgeCard: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    background: "#ffffff",
    borderRadius: 14,
    padding: "14px 18px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  badgeIcon: {
    flexShrink: 0,
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#fff7ed",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(180,83,9,0.25)",
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: "#111827",
    letterSpacing: 0.4,
  },
  badgeSub: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },

  rightPanel: {
    flex: 1,
    minHeight: "100vh",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 32px",
    boxSizing: "border-box",
  },

  formCard: {
    width: "100%",
    maxWidth: 460,
  },

  formTitle: {
    margin: "0 0 6px",
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  formSub: {
    margin: "0 0 22px",
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 1.6,
  },

  msgError: {
    marginBottom: 16,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    padding: "11px 14px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
  },
  msgOk: {
    marginBottom: 16,
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    color: "#166534",
    padding: "11px 14px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
  },

  field: { marginBottom: 16 },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.2,
    color: "#6b7280",
    marginBottom: 7,
  },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "13px 14px 13px 42px",
    fontSize: 14,
    outline: "none",
    background: "#ffffff",
    color: "#111827",
    fontFamily: "inherit",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    border: "none",
    background: "transparent",
    padding: 4,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
  },

  cta: {
    marginTop: 4,
    width: "100%",
    border: "none",
    cursor: "pointer",
    borderRadius: 12,
    padding: "15px 18px",
    background: BTN_ORANGE,
    boxShadow: "0 8px 24px rgba(180,83,9,0.22)",
    fontSize: 15,
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: 0.2,
    fontFamily: "inherit",
  },

  otpRow: {
    display: "flex",
    gap: 10,
    justifyContent: "space-between",
    margin: "10px 0 14px",
  },
  otpBox: {
    width: "14%",
    height: 56,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    textAlign: "center",
    fontSize: 22,
    fontWeight: 900,
    outline: "none",
    color: "#111827",
    background: "#ffffff",
  },

  otpActionsRow: {
    display: "flex",
    gap: 10,
    marginTop: 12,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  smallBtn: {
    padding: "8px 14px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 12,
    color: "#374151",
    fontFamily: "inherit",
  },

  registerLink: {
    textAlign: "center",
    marginTop: 22,
    fontSize: 14,
    fontWeight: 600,
    color: "#6b7280",
  },
  registerLinkText: {
    color: "#111827",
    textDecoration: "none",
    fontWeight: 800,
  },
};
