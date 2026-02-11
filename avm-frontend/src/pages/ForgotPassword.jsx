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
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function RegisterPage() {
  const navigate = useNavigate();

  const ROLES = ["Investor", "Buyer", "Seller", "Agent"];
  const [role, setRole] = useState("Investor");
  const [agree, setAgree] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [countryCode, setCountryCode] = useState("+971");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const emailPattern = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  const passwordStrength = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return Math.min(score, 4);
  }, [password]);

  const strengthLabel = ["", "WEAK PASSWORD", "FAIR PASSWORD", "GOOD PASSWORD", "STRONG PASSWORD"][passwordStrength];
  const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#e87722"][passwordStrength];

  const COUNTRY_CODES = useMemo(
    () => [
      { code: "+93", label: "Afghanistan (+93)" },
      { code: "+355", label: "Albania (+355)" },
      { code: "+213", label: "Algeria (+213)" },
      { code: "+1-684", label: "American Samoa (+1-684)" },
      { code: "+376", label: "Andorra (+376)" },
      { code: "+244", label: "Angola (+244)" },
      { code: "+54", label: "Argentina (+54)" },
      { code: "+61", label: "Australia (+61)" },
      { code: "+43", label: "Austria (+43)" },
      { code: "+994", label: "Azerbaijan (+994)" },
      { code: "+973", label: "Bahrain (+973)" },
      { code: "+880", label: "Bangladesh (+880)" },
      { code: "+32", label: "Belgium (+32)" },
      { code: "+55", label: "Brazil (+55)" },
      { code: "+1", label: "Canada (+1)" },
      { code: "+86", label: "China (+86)" },
      { code: "+57", label: "Colombia (+57)" },
      { code: "+20", label: "Egypt (+20)" },
      { code: "+33", label: "France (+33)" },
      { code: "+49", label: "Germany (+49)" },
      { code: "+233", label: "Ghana (+233)" },
      { code: "+30", label: "Greece (+30)" },
      { code: "+852", label: "Hong Kong (+852)" },
      { code: "+36", label: "Hungary (+36)" },
      { code: "+91", label: "India (+91)" },
      { code: "+62", label: "Indonesia (+62)" },
      { code: "+98", label: "Iran (+98)" },
      { code: "+964", label: "Iraq (+964)" },
      { code: "+353", label: "Ireland (+353)" },
      { code: "+972", label: "Israel (+972)" },
      { code: "+39", label: "Italy (+39)" },
      { code: "+81", label: "Japan (+81)" },
      { code: "+962", label: "Jordan (+962)" },
      { code: "+254", label: "Kenya (+254)" },
      { code: "+965", label: "Kuwait (+965)" },
      { code: "+961", label: "Lebanon (+961)" },
      { code: "+60", label: "Malaysia (+60)" },
      { code: "+52", label: "Mexico (+52)" },
      { code: "+212", label: "Morocco (+212)" },
      { code: "+31", label: "Netherlands (+31)" },
      { code: "+64", label: "New Zealand (+64)" },
      { code: "+234", label: "Nigeria (+234)" },
      { code: "+47", label: "Norway (+47)" },
      { code: "+968", label: "Oman (+968)" },
      { code: "+92", label: "Pakistan (+92)" },
      { code: "+63", label: "Philippines (+63)" },
      { code: "+48", label: "Poland (+48)" },
      { code: "+351", label: "Portugal (+351)" },
      { code: "+974", label: "Qatar (+974)" },
      { code: "+40", label: "Romania (+40)" },
      { code: "+7", label: "Russia (+7)" },
      { code: "+966", label: "Saudi Arabia (+966)" },
      { code: "+65", label: "Singapore (+65)" },
      { code: "+27", label: "South Africa (+27)" },
      { code: "+82", label: "South Korea (+82)" },
      { code: "+34", label: "Spain (+34)" },
      { code: "+94", label: "Sri Lanka (+94)" },
      { code: "+46", label: "Sweden (+46)" },
      { code: "+41", label: "Switzerland (+41)" },
      { code: "+886", label: "Taiwan (+886)" },
      { code: "+66", label: "Thailand (+66)" },
      { code: "+216", label: "Tunisia (+216)" },
      { code: "+90", label: "Turkey (+90)" },
      { code: "+380", label: "Ukraine (+380)" },
      { code: "+971", label: "United Arab Emirates (+971)" },
      { code: "+44", label: "United Kingdom (+44)" },
      { code: "+1", label: "United States (+1)" },
      { code: "+998", label: "Uzbekistan (+998)" },
      { code: "+58", label: "Venezuela (+58)" },
      { code: "+84", label: "Vietnam (+84)" },
      { code: "+967", label: "Yemen (+967)" },
      { code: "+260", label: "Zambia (+260)" },
      { code: "+263", label: "Zimbabwe (+263)" },
    ],
    []
  );

  function normEmail(v) {
    return (v || "").trim().toLowerCase();
  }

  async function handleGoogleRegister() {
    setError(null);
    try {
      setLoading(true);
      const redirectTo = `${window.location.origin}/dashboard`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) throw error;
    } catch (err) {
      setError(err?.message || "Google signup failed.");
      setLoading(false);
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!role || !name || !email || !password || !confirmPassword || !phone) {
      setError("Please fill in all fields.");
      return;
    }

    if (!emailPattern.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agree) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);

    try {
      const em = normEmail(email);

      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: em,
        password,
        options: {
          data: {
            name: name.trim(),
            role,
            phone: `${countryCode}${phone.trim()}`,
          },
        },
      });

      if (signUpErr) throw signUpErr;
      if (!data?.user?.id) throw new Error("Signup failed. Please try again.");

      const userId = data.user.id;

      const { data: sessionData } = await supabase.auth.getSession();
      const hasSession = !!sessionData?.session;

      if (hasSession) {
        const { error: upsertErr } = await supabase.from("users").upsert(
          {
            id: userId,
            role,
            name: name.trim(),
            email: em,
            phone: `${countryCode}${phone.trim()}`,
          },
          { onConflict: "id" }
        );

        if (upsertErr) throw upsertErr;
      }

      navigate("/login");
    } catch (err) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page} className="rp-page">
      <style>{responsiveCss}</style>

      {/* ── LEFT PANEL ── */}
      <div style={styles.leftPanel} className="rp-leftPanel">
        <div style={styles.leftOverlay} />
        <div style={styles.leftContent} className="rp-leftContent">
          <div style={styles.logoRow}>
            <div style={styles.logoBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#e87722" />
                <rect x="14" y="2" width="8" height="8" rx="1.5" fill="#e87722" opacity="0.7" />
                <rect x="2" y="14" width="8" height="8" rx="1.5" fill="#e87722" opacity="0.7" />
                <rect x="14" y="14" width="8" height="8" rx="1.5" fill="#e87722" opacity="0.4" />
              </svg>
            </div>
            <span style={styles.logoText}>ACQAR</span>
          </div>

          <div style={styles.heroArea} className="rp-heroArea">
            <h1 style={styles.heroTitle} className="rp-heroTitle">
              Experience the future of property valuation.
            </h1>
            <p style={styles.heroSub} className="rp-heroSub">
              Access real-time AI insights and institutional-grade data for Dubai&apos;s most prestigious real estate assets.
            </p>
          </div>

          <div style={styles.statDivider} className="rp-statDivider" />

          <div style={styles.statsRow} className="rp-statsRow">
            <div>
              <div style={styles.statNum} className="rp-statNum">
                99.2%
              </div>
              <div style={styles.statLabel}>Valuation Accuracy</div>
            </div>
            <div>
              <div style={styles.statNum} className="rp-statNum">
                $12B+
              </div>
              <div style={styles.statLabel}>Assets Analyzed</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={styles.rightPanel} className="rp-rightPanel">
        <div style={styles.formCard} className="rp-formCard">
          <h2 style={styles.formTitle} className="rp-formTitle">
            Create Your ACQAR Account
          </h2>
          <p style={styles.formSub} className="rp-formSub">
            Join Dubai&apos;s premier AI-driven property valuation ecosystem.
          </p>

          <button type="button" style={styles.googleBtn} disabled={loading} onClick={handleGoogleRegister} className="rp-googleBtn">
            <span style={styles.googleIconWrap} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.611 20.083H42V20H24v8h11.303C33.694 32.657 29.29 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.055 6.053 29.273 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306 14.691l6.571 4.819C14.655 16.108 19.01 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.055 6.053 29.273 4 24 4c-7.682 0-14.35 4.346-17.694 10.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24 44c5.182 0 9.91-1.986 13.471-5.219l-6.219-5.264C29.2 35.091 26.715 36 24 36c-5.268 0-9.66-3.317-11.29-7.946l-6.522 5.026C9.49 39.556 16.227 44 24 44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611 20.083H42V20H24v8h11.303a12.07 12.07 0 0 1-4.051 5.517l.003-.002 6.219 5.264C36.99 39.246 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
                />
              </svg>
            </span>
            Continue with Google
          </button>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>OR REGISTER WITH EMAIL</span>
            <span style={styles.dividerLine} />
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.roleSection}>
            <div style={styles.roleLabel}>I am a/an:</div>
            <div style={styles.roleRow} className="rp-roleRow">
              {ROLES.map((r) => {
                const active = r === role;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    aria-pressed={active}
                    style={{ ...styles.roleBtn, ...(active ? styles.roleBtnActive : {}) }}
                    className="rp-roleBtn"
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleRegister}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={styles.input}
                placeholder="John Doe"
                autoComplete="name"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Professional Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="john@example.com"
                autoComplete="email"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Secure Password</label>
              <div style={styles.passwordWrap}>
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...styles.input, paddingRight: 46, marginBottom: 0 }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((v) => !v)}
                  style={styles.eyeBtn}
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                >
                  {passwordVisible ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                        stroke="#9ca3af"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                        stroke="#9ca3af"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path d="M1 1l22 22" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <ellipse cx="12" cy="12" rx="11" ry="8" stroke="#9ca3af" strokeWidth="1.8" />
                      <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="1.8" />
                    </svg>
                  )}
                </button>
              </div>

              {password && (
                <div style={styles.strengthArea}>
                  <div style={styles.strengthBars}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          ...styles.strengthBar,
                          background: i <= passwordStrength ? strengthColor : "#e5e7eb",
                        }}
                      />
                    ))}
                  </div>
                  <div style={styles.strengthMeta}>
                    <span style={{ ...styles.strengthLabel, color: strengthColor }}>{strengthLabel}</span>
                    <span style={styles.strengthHint}>Min. 12 characters</span>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.passwordWrap}>
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ ...styles.input, paddingRight: 46 }}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setConfirmPasswordVisible((v) => !v)}
                  style={styles.eyeBtn}
                  aria-label={confirmPasswordVisible ? "Hide password" : "Show password"}
                >
                  {confirmPasswordVisible ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                        stroke="#9ca3af"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path
                        d="M9.9 4.24A9.12 10.07 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                        stroke="#9ca3af"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                      <path d="M1 1l22 22" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <ellipse cx="12" cy="12" rx="11" ry="8" stroke="#9ca3af" strokeWidth="1.8" />
                      <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="1.8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Phone Number</label>
              <div style={styles.phoneRowVisible} className="rp-phoneRowVisible">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  style={styles.ccSelectVisible}
                  className="rp-ccSelectVisible"
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={`${c.code}-${c.label}`} value={c.code.replace(/-/g, "")}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={styles.phoneInputVisible}
                  className="rp-phoneInputVisible"
                  placeholder="50 000 0000"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div style={styles.termsRow}>
              <input
                id="agree"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                style={styles.checkbox}
              />
              <label htmlFor="agree" style={styles.termsText}>
                I agree to the{" "}
                <a href="/terms" style={styles.termsLink}>
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/privacy" style={styles.termsLink}>
                  Privacy Policy
                </a>
                , including the processing of my property data.
              </label>
            </div>

            <button
              type="submit"
              style={{
                ...styles.cta,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
              className="rp-cta"
            >
              {loading ? "Creating..." : "Create Account →"}
            </button>
          </form>

          <p style={styles.signinRow}>
            Already have an account?{" "}
            <Link to="/login" style={styles.signinLink}>
              Sign In
            </Link>
          </p>

          <div style={styles.bottomBadges} className="rp-bottomBadges">
            <div style={styles.bottomBadge}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="#9ca3af" strokeWidth="1.8" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span style={styles.bottomBadgeText}>SSL ENCRYPTED</span>
            </div>
            <div style={styles.bottomBadgeSep} />
            <div style={styles.bottomBadge}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z"
                  stroke="#9ca3af"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="#9ca3af"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span style={styles.bottomBadgeText}>GDPR COMPLIANT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ✅ Responsive changes (as you asked):
 * - Desktop: left panel + form side-by-side
 * - Mobile/tablet: LEFT PANEL becomes TOP hero (visible), FORM goes below
 * - No UI/functionality changes otherwise
 */
const responsiveCss = `
  html, body { max-width: 100%; overflow-x: hidden; }
  select, input, button { max-width: 100%; }

  /* tablet: slightly narrower left side */
  @media (max-width: 1024px) {
    .rp-leftPanel { width: 40%; }
  }

  /* ✅ stack: left on top, form below */
  @media (max-width: 900px) {
    .rp-page {
      flex-direction: column !important;
      min-height: 100vh;
    }

    .rp-leftPanel {
      width: 100% !important;
      min-height: auto !important;
      display: block !important;
    }

    .rp-leftContent {
      min-height: auto !important;
      padding: 22px 18px 22px !important;
    }

    /* make hero compact on top */
    .rp-heroArea {
      padding: 18px 0 10px !important;
    }
    .rp-heroTitle { font-size: 24px !important; margin: 0 0 10px !important; }
    .rp-heroSub { max-width: 100% !important; }

    /* stats: closer + wrap */
    .rp-statDivider { margin-bottom: 18px !important; }
    .rp-statsRow { gap: 26px !important; flex-wrap: wrap !important; }

    /* form section below */
    .rp-rightPanel {
      min-height: auto !important;
      padding: 18px 14px 28px !important;
      align-items: stretch !important;
      justify-content: flex-start !important;
    }

    .rp-formCard { max-width: 520px; margin: 0 auto; }
  }

  @media (max-width: 520px) {
    .rp-formTitle { font-size: 22px; }
    .rp-formSub { font-size: 13px; margin-bottom: 16px; }

    .rp-googleBtn { padding: 12px 14px; font-size: 14px; }

    .rp-roleRow {
  flex-wrap: nowrap !important;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.rp-roleBtn {
  flex: 0 0 auto !important;
  padding: 8px 14px;
  font-size: 13px;
  white-space: nowrap;
}


    .rp-phoneRowVisible { flex-direction: column; align-items: stretch; }
    .rp-ccSelectVisible { width: 100% !important; height: 46px; }
    .rp-phoneInputVisible { width: 100%; box-sizing: border-box; }

    .rp-cta { padding: 14px 16px; font-size: 15px; }

    .rp-bottomBadges { flex-wrap: wrap; gap: 10px; }
  }

  @media (max-width: 360px) {
    .rp-roleBtn { flex: 1 1 100%; }
  }
`;

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "row",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  leftPanel: {
    width: "42%",
    minHeight: "100vh",
    position: "relative",
    background: "linear-gradient(160deg, #1a2e25 0%, #2d3a2e 30%, #3d2b1a 65%, #2a1f10 100%)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  leftOverlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(20,28,20,0.55) 0%, rgba(30,20,10,0.45) 50%, rgba(10,10,10,0.75) 100%)",
    zIndex: 1,
  },
  leftContent: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "36px 40px 44px",
    boxSizing: "border-box",
    minHeight: "100vh",
  },
  logoRow: { display: "flex", alignItems: "center", gap: 10 },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    background: "rgba(255,255,255,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,0.15)",
  },
  logoText: { fontSize: 17, fontWeight: 800, color: "#ffffff", letterSpacing: 2.5 },

  heroArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingBottom: 20,
  },
  heroTitle: {
    margin: "0 0 18px",
    fontSize: 36,
    fontWeight: 900,
    color: "#ffffff",
    lineHeight: 1.18,
    letterSpacing: -0.3,
  },
  heroSub: {
    margin: 0,
    fontSize: 14.5,
    color: "rgba(255,255,255,0.65)",
    lineHeight: 1.65,
    maxWidth: 320,
  },
  statDivider: { height: 1, background: "rgba(255,255,255,0.18)", marginBottom: 28 },
  statsRow: { display: "flex", gap: 48 },
  statNum: { fontSize: 26, fontWeight: 900, color: "#e87722", letterSpacing: -0.5 },
  statLabel: { fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 4, fontWeight: 500 },

  rightPanel: {
    flex: 1,
    minHeight: "100vh",
    background: "#f5f0eb",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "44px 32px",
    boxSizing: "border-box",
    overflowY: "auto",
  },
  formCard: { width: "100%", maxWidth: 480 },

  formTitle: {
    margin: "0 0 6px",
    fontSize: 26,
    fontWeight: 800,
    color: "#111827",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  formSub: { margin: "0 0 22px", fontSize: 14, color: "#6b7280", textAlign: "center", lineHeight: 1.5 },

  googleBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#ffffff",
    fontWeight: 700,
    fontSize: 15,
    color: "#111827",
    cursor: "pointer",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    fontFamily: "inherit",
  },
  googleIconWrap: { width: 26, height: 26, borderRadius: 6, display: "grid", placeItems: "center" },

  divider: { display: "flex", alignItems: "center", gap: 10, margin: "18px 0" },
  dividerLine: { height: 1, background: "#d1d5db", flex: 1 },
  dividerText: { fontSize: 11, color: "#9ca3af", fontWeight: 700, letterSpacing: 1, whiteSpace: "nowrap" },

  errorBox: {
    marginBottom: 14,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    padding: "11px 14px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 600,
  },

  roleSection: { marginBottom: 18 },
  roleLabel: { fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 10 },
  roleRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  roleBtn: {
    padding: "9px 20px",
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    fontWeight: 600,
    fontSize: 14,
    color: "#374151",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.15s",
  },
  roleBtnActive: { border: "1.5px solid #e87722", background: "#fff8f3", color: "#c05e10", fontWeight: 700 },

  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 7 },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: "13px 14px",
    fontSize: 14,
    outline: "none",
    background: "#ffffff",
    color: "#111827",
    fontFamily: "inherit",
  },

  passwordWrap: { position: "relative" },
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
  },

  strengthArea: { marginTop: 8 },
  strengthBars: { display: "flex", gap: 5, marginBottom: 6 },
  strengthBar: { flex: 1, height: 4, borderRadius: 999, transition: "background 0.2s" },
  strengthMeta: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  strengthLabel: { fontSize: 11, fontWeight: 800, letterSpacing: 0.8 },
  strengthHint: { fontSize: 11, color: "#9ca3af", fontWeight: 500 },

  phoneRowVisible: { display: "flex", gap: 8, alignItems: "center" },
  ccSelectVisible: {
    width: 160,
    flexShrink: 0,
    height: 46,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    fontWeight: 600,
    color: "#374151",
    outline: "none",
    padding: "0 10px",
    cursor: "pointer",
    fontSize: 13,
    fontFamily: "inherit",
  },
  phoneInputVisible: {
    flex: 1,
    border: "1px solid #d1d5db",
    borderRadius: 12,
    outline: "none",
    fontSize: 14,
    padding: "13px 14px",
    background: "#ffffff",
    color: "#111827",
    fontFamily: "inherit",
  },

  termsRow: { display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 18 },
  checkbox: { width: 16, height: 16, marginTop: 2, flexShrink: 0, accentColor: "#e87722", cursor: "pointer" },
  termsText: { fontSize: 13, color: "#6b7280", fontWeight: 500, lineHeight: 1.5 },
  termsLink: { color: "#e87722", fontWeight: 700, textDecoration: "none" },

  cta: {
    width: "100%",
    border: "none",
    borderRadius: 12,
    padding: "15px 18px",
    background: "linear-gradient(180deg, #f09030 0%, #d96b10 100%)",
    boxShadow: "0 8px 24px rgba(217,107,16,0.32)",
    fontSize: 16,
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: 0.2,
    fontFamily: "inherit",
    marginBottom: 4,
  },

  signinRow: { textAlign: "center", marginTop: 18, fontSize: 14, color: "#6b7280", fontWeight: 500 },
  signinLink: { color: "#e87722", fontWeight: 800, textDecoration: "none" },

  bottomBadges: { display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 26 },
  bottomBadge: { display: "flex", alignItems: "center", gap: 6 },
  bottomBadgeText: { fontSize: 11, fontWeight: 700, color: "#9ca3af", letterSpacing: 0.6 },
  bottomBadgeSep: { width: 1, height: 14, background: "#d1d5db" },
};
