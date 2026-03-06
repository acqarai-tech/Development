


// ////// new changes to correct gmail

// import React, { useMemo, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// export default function Login() {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   // ✅ OTP login states
//   const [otpMode, setOtpMode] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [oauthLoading, setOauthLoading] = useState(false);
//   const [msg, setMsg] = useState({ type: "", text: "" });

//   function normEmail(v) {
//     return (v || "").trim().toLowerCase();
//   }

//   const ADMIN_EMAIL = "admin@acqar.com";
//   const ADMIN_PASSWORD = "acqar123";

//   function isAdminLogin(em, pw) {
//     return normEmail(em) === ADMIN_EMAIL && String(pw || "") === ADMIN_PASSWORD;
//   }

//   async function handleLogin(e) {
//     e.preventDefault();
//     setMsg({ type: "", text: "" });

//     const em = normEmail(email);
//     if (!em) {
//       setMsg({ type: "error", text: "Enter email." });
//       return;
//     }

//     // ✅ OTP mode: send OTP and open next screen
//     if (otpMode) {
//       return sendLoginOtpAndGoVerify();
//     }

//     // ✅ Password mode
//     if (!password) {
//       setMsg({ type: "error", text: "Enter email and password." });
//       return;
//     }

//     // ✅ Hard-coded admin (no Supabase auth)
//     if (isAdminLogin(em, password)) {
//       navigate("/admin-dashboard");
//       return;
//     }

//     // ✅ Normal email/password auth
//     try {
//       setLoading(true);
//       const { error } = await supabase.auth.signInWithPassword({
//         email: em,
//         password,
//       });
//       if (error) throw error;

//       setMsg({ type: "success", text: "Logged in successfully." });
//       navigate("/dashboard");
//     } catch (err) {
//       setMsg({ type: "error", text: err?.message || "Login failed." });
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleGoogleLogin() {
//   setMsg({ type: "", text: "" });

//   try {
//     setOauthLoading(true);

//     // ✅ Use a dedicated callback route (prevents bounce back to landing)
//     const redirectTo = `${window.location.origin}/auth/callback`;

//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: {
//         redirectTo,
//         // optional but helpful
//         queryParams: { prompt: "select_account" },
//       },
//     });

//     if (error) throw error;

//     // No navigate() here — Google will redirect the browser.
//   } catch (err) {
//     setMsg({ type: "error", text: err?.message || "Google login failed." });
//     setOauthLoading(false);
//   }
// }


//   // ✅ UPDATED: send OTP then route to /verify-otp
//   // ✅ Change 1: REMOVE "users table exists" pre-check (RLS blocks anon reads)
//   // ✅ Change 2: shouldCreateUser: false (prevents creating new auth users)
//  async function sendLoginOtpAndGoVerify() {
//   setMsg({ type: "", text: "" });
//   const em = normEmail(email);

//   if (!em) {
//     setMsg({ type: "error", text: "Enter your email first." });
//     return;
//   }

//   try {
//     setLoading(true);

//     const { error } = await supabase.auth.signInWithOtp({
//       email: em,
//       options: { shouldCreateUser: false },
//     });

//     if (error) throw error;

//     navigate("/verify-otp", { state: { email: em } });
//   } catch (err) {
//     setMsg({
//       type: "error",
//       text: err?.message || "Could not send OTP. Please try again.",
//     });
//   } finally {
//     setLoading(false);
//   }
// }



//   function switchToOtp() {
//     setMsg({ type: "", text: "" });
//     setOtpMode(true);
//     setPassword("");
//   }

//   function switchToPassword() {
//     setMsg({ type: "", text: "" });
//     setOtpMode(false);
//   }

//   // ✅ Responsive detection (kept as-is)
//   const isMobile =
//     typeof window !== "undefined" &&
//     window.matchMedia &&
//     window.matchMedia("(max-width: 900px)").matches;

//   // ✅ ONLY CHANGE: on mobile, hide left panel and show only the form (right panel)
//   const r = useMemo(
//     () => ({
//       pageDir: isMobile ? "column" : "row",
//       showLeft: !isMobile,
//       rightPad: isMobile ? "24px 16px" : styles.rightPanel.padding,
//       formMax: isMobile ? 520 : styles.formCard.maxWidth,
//     }),
//     [isMobile]
//   );

//   return (
//     <div style={{ ...styles.page, flexDirection: r.pageDir }}>
//       {/* ── LEFT PANEL ── */}
//       {r.showLeft && (
//         <div style={styles.leftPanel}>
//           {/* Logo */}
//           <div style={styles.logoRow}>
//             <div style={styles.logoBox}>
//               <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//                 <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#fff" />
//                 <rect
//                   x="14"
//                   y="2"
//                   width="8"
//                   height="8"
//                   rx="1.5"
//                   fill="#fff"
//                   opacity="0.6"
//                 />
//                 <rect
//                   x="2"
//                   y="14"
//                   width="8"
//                   height="8"
//                   rx="1.5"
//                   fill="#fff"
//                   opacity="0.6"
//                 />
//                 <rect
//                   x="14"
//                   y="14"
//                   width="8"
//                   height="8"
//                   rx="1.5"
//                   fill="#fff"
//                   opacity="0.3"
//                 />
//               </svg>
//             </div>
//              <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
//               <span style={{ color: "#B87333" }}>ACQ</span>
//               <span style={{ color: "#111111" }}>AR</span>
//             </h1>
//           </div>

//           {/* Headline */}
//           <div style={styles.heroSection}>
//             <h1 style={styles.heroTitle}>
//               Secure Access
//               <br />
//               to Your
//               <br />
//               Property
//               <br />
//               Intelligence
//             </h1>
//             <p style={styles.heroSub}>
//               The world's first AI-powered platform for institutional-grade Dubai
//               property valuations.
//             </p>
//           </div>

//           {/* Trust badges */}
//           <div style={styles.badgesList}>
//             {[
//               {
//                 icon: (
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                     <path
//                       d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z"
//                       fill="#b45309"
//                     />
//                     <path
//                       d="M10 12l2 2 4-4"
//                       stroke="#fff"
//                       strokeWidth="1.8"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 ),
//                 title: "256-BIT SSL",
//                 sub: "Bank-level encryption",
//               },
//               {
//                 icon: (
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                     <circle cx="12" cy="12" r="10" fill="#b45309" />
//                     <path
//                       d="M8 12l3 3 5-5"
//                       stroke="#fff"
//                       strokeWidth="1.8"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                     />
//                   </svg>
//                 ),
//                 title: "GDPR COMPLIANT",
//                 sub: "Strict privacy controls",
//               },
//               {
//                 icon: (
//                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                     <path
//                       d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
//                       fill="#b45309"
//                     />
//                     <circle cx="12" cy="9" r="2.5" fill="#fff" />
//                   </svg>
//                 ),
//                 title: "DUBAI DATA RESIDENCY",
//                 sub: "Local infrastructure",
//               },
//             ].map((b, i) => (
//               <div key={i} style={styles.badgeCard}>
//                 <div style={styles.badgeIcon}>{b.icon}</div>
//                 <div>
//                   <div style={styles.badgeTitle}>{b.title}</div>
//                   <div style={styles.badgeSub}>{b.sub}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* ── RIGHT PANEL ── */}
//       <div style={{ ...styles.rightPanel, padding: r.rightPad }}>
//         <div style={{ ...styles.formCard, maxWidth: r.formMax }}>
//           <h2 style={styles.formTitle}>Welcome Back to ACQAR</h2>
//           <p style={styles.formSub}>Please enter your institutional credentials.</p>

//           {/* Alert */}
//           {msg.text && (
//             <div style={msg.type === "error" ? styles.msgError : styles.msgOk}>
//               {msg.text}
//             </div>
//           )}

//           {/* Google */}
//           <button
//             type="button"
//             onClick={handleGoogleLogin}
//             style={{
//               ...styles.googleBtn,
//               opacity: oauthLoading ? 0.7 : 1,
//               cursor: oauthLoading ? "not-allowed" : "pointer",
//             }}
//             disabled={oauthLoading || loading}
//           >
//             <span style={styles.googleIconWrap} aria-hidden="true">
//               <svg width="18" height="18" viewBox="0 0 48 48">
//                 <path
//                   fill="#FFC107"
//                   d="M43.611 20.083H42V20H24v8h11.303C33.694 32.657 29.29 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.055 6.053 29.273 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
//                 />
//                 <path
//                   fill="#FF3D00"
//                   d="M6.306 14.691l6.571 4.819C14.655 16.108 19.01 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.055 6.053 29.273 4 24 4c-7.682 0-14.35 4.346-17.694 10.691z"
//                 />
//                 <path
//                   fill="#4CAF50"
//                   d="M24 44c5.182 0 9.91-1.986 13.471-5.219l-6.219-5.264C29.2 35.091 26.715 36 24 36c-5.268 0-9.66-3.317-11.29-7.946l-6.522 5.026C9.49 39.556 16.227 44 24 44z"
//                 />
//                 <path
//                   fill="#1976D2"
//                   d="M43.611 20.083H42V20H24v8h11.303a12.07 12.07 0 0 1-4.051 5.517l.003-.002 6.219 5.264C36.99 39.246 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
//                 />
//               </svg>
//             </span>
//             {oauthLoading ? "Connecting..." : "Continue with Google"}
//           </button>

//           {/* Divider */}
//           <div style={styles.divider}>
//             <span style={styles.dividerLine} />
//             <span style={styles.dividerText}>OR</span>
//             <span style={styles.dividerLine} />
//           </div>

//           {/* Form */}
//           <form onSubmit={handleLogin}>
//             {/* Email */}
//             <div style={styles.field}>
//               <label style={styles.label} htmlFor="email">
//                 WORK EMAIL
//               </label>
//               <div style={styles.inputWrap}>
//                 <span style={styles.inputIcon}>
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                     <rect
//                       x="2"
//                       y="4"
//                       width="20"
//                       height="16"
//                       rx="2.5"
//                       stroke="#9ca3af"
//                       strokeWidth="1.8"
//                     />
//                     <path
//                       d="M2 8l10 7 10-7"
//                       stroke="#9ca3af"
//                       strokeWidth="1.8"
//                       strokeLinecap="round"
//                     />
//                   </svg>
//                 </span>
//                 <input
//                   id="email"
//                   type="email"
//                   style={styles.input}
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="name@company.com"
//                   autoComplete="email"
//                   required
//                   disabled={oauthLoading}
//                 />
//               </div>
//             </div>

//             {/* Password (only if not OTP mode) */}
//             {!otpMode && (
//               <div style={styles.field}>
//                 <div style={styles.labelRow}>
//                   <label style={styles.label} htmlFor="password">
//                     PASSWORD
//                   </label>
//                   <span
//                     style={styles.forgotLink}
//                     role="button"
//                     tabIndex={0}
//                     onClick={() => navigate("/forgot-password")}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter" || e.key === " ")
//                         navigate("/forgot-password");
//                     }}
//                   >
//                     Forgot Password?
//                   </span>
//                 </div>
//                 <div style={styles.inputWrap}>
//                   <span style={styles.inputIcon}>
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                       <rect
//                         x="5"
//                         y="11"
//                         width="14"
//                         height="10"
//                         rx="2"
//                         stroke="#9ca3af"
//                         strokeWidth="1.8"
//                       />
//                       <path
//                         d="M8 11V7a4 4 0 0 1 8 0v4"
//                         stroke="#9ca3af"
//                         strokeWidth="1.8"
//                         strokeLinecap="round"
//                       />
//                     </svg>
//                   </span>
//                   <input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     style={{ ...styles.input, paddingRight: 46 }}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="••••••••"
//                     autoComplete="current-password"
//                     required
//                     disabled={oauthLoading}
//                   />
//                   <button
//                     type="button"
//                     style={styles.eyeBtn}
//                     onClick={() => setShowPassword((p) => !p)}
//                     disabled={oauthLoading}
//                     aria-label={showPassword ? "Hide password" : "Show password"}
//                   >
//                     {showPassword ? (
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                         <path
//                           d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
//                           stroke="#9ca3af"
//                           strokeWidth="1.8"
//                           strokeLinecap="round"
//                         />
//                         <path
//                           d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
//                           stroke="#9ca3af"
//                           strokeWidth="1.8"
//                           strokeLinecap="round"
//                         />
//                         <path
//                           d="M1 1l22 22"
//                           stroke="#9ca3af"
//                           strokeWidth="1.8"
//                           strokeLinecap="round"
//                         />
//                       </svg>
//                     ) : (
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                         <ellipse
//                           cx="12"
//                           cy="12"
//                           rx="11"
//                           ry="8"
//                           stroke="#9ca3af"
//                           strokeWidth="1.8"
//                         />
//                         <circle
//                           cx="12"
//                           cy="12"
//                           r="3"
//                           stroke="#9ca3af"
//                           strokeWidth="1.8"
//                         />
//                       </svg>
//                     )}
//                   </button>
//                 </div>
//               </div>
//             )}

//             {/* Submit */}
//             <button
//               type="submit"
//               style={{
//                 ...styles.cta,
//                 opacity: loading ? 0.75 : 1,
//                 cursor: loading ? "not-allowed" : "pointer",
//               }}
//               disabled={loading || oauthLoading}
//             >
//               {loading ? "Please wait..." : otpMode ? "Send OTP to Email →" : "Sign In →"}
//             </button>
//           </form>

//           {/* OTP toggle */}
//           <div style={styles.otpToggleRow}>
//             {otpMode ? (
//               <button
//                 type="button"
//                 style={styles.otpToggleBtn}
//                 onClick={switchToPassword}
//                 disabled={loading || oauthLoading}
//               >
//                 <svg
//                   width="14"
//                   height="14"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   style={{ marginRight: 6 }}
//                 >
//                   <rect
//                     x="5"
//                     y="11"
//                     width="14"
//                     height="10"
//                     rx="2"
//                     stroke="#b45309"
//                     strokeWidth="1.8"
//                   />
//                   <path
//                     d="M8 11V7a4 4 0 0 1 8 0v4"
//                     stroke="#b45309"
//                     strokeWidth="1.8"
//                     strokeLinecap="round"
//                   />
//                 </svg>
//                 Sign in with Password instead
//               </button>
//             ) : (
//               <button
//                 type="button"
//                 style={styles.otpToggleBtn}
//                 onClick={switchToOtp}
//                 disabled={loading || oauthLoading}
//               >
//                 <svg
//                   width="14"
//                   height="14"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   style={{ marginRight: 6 }}
//                 >
//                   <circle cx="9" cy="12" r="1.5" fill="#b45309" />
//                   <circle cx="15" cy="12" r="1.5" fill="#b45309" />
//                   <rect
//                     x="2"
//                     y="6"
//                     width="20"
//                     height="12"
//                     rx="2.5"
//                     stroke="#b45309"
//                     strokeWidth="1.8"
//                   />
//                 </svg>
//                 Sign in with OTP instead
//               </button>
//             )}
//           </div>

//           {/* Register */}
//           <p style={styles.registerLink}>
//             Don&apos;t have an account?{" "}
//             <Link to="/signup" style={styles.registerLinkText}>
//               Request Access
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   /* ── Page layout ── */
//   page: {
//     minHeight: "100vh",
//     display: "flex",
//     flexDirection: "row",
//     fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
//   },

//   /* ── Left panel ── */
//   leftPanel: {
//     width: "40%",
//     minHeight: "100vh",
//     background: "#f3f4f6",
//     display: "flex",
//     flexDirection: "column",
//     padding: "36px 40px 40px",
//     boxSizing: "border-box",
//     position: "relative",
//   },

//   logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 0 },
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
//     maxWidth: 300,
//   },

//   badgesList: { display: "flex", flexDirection: "column", gap: 12 },
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
//     background: "#fef3c7",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   badgeTitle: { fontSize: 13, fontWeight: 800, color: "#111827", letterSpacing: 0.4 },
//   badgeSub: { fontSize: 12, color: "#9ca3af", marginTop: 2 },

//   /* ── Right panel ── */
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
//   formCard: { width: "100%", maxWidth: 460 },

//   formTitle: {
//     margin: "0 0 6px",
//     fontSize: 24,
//     fontWeight: 800,
//     color: "#111827",
//     textAlign: "center",
//     letterSpacing: -0.3,
//   },
//   formSub: { margin: "0 0 22px", fontSize: 14, color: "#6b7280", textAlign: "center" },

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

//   googleBtn: {
//     width: "100%",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//     padding: "13px 16px",
//     borderRadius: 12,
//     border: "1px solid #e5e7eb",
//     background: "#fff",
//     fontWeight: 700,
//     fontSize: 15,
//     color: "#111827",
//     boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
//     cursor: "pointer",
//   },
//   googleIconWrap: {
//     width: 28,
//     height: 28,
//     borderRadius: 8,
//     display: "grid",
//     placeItems: "center",
//     background: "#f9fafb",
//     border: "1px solid rgba(0,0,0,0.06)",
//   },

//   divider: { display: "flex", alignItems: "center", gap: 12, margin: "18px 0" },
//   dividerLine: { height: 1, background: "#e5e7eb", flex: 1 },
//   dividerText: { fontSize: 12, color: "#9ca3af", fontWeight: 700, letterSpacing: 1 },

//   field: { marginBottom: 16 },
//   label: {
//     display: "block",
//     fontSize: 11,
//     fontWeight: 800,
//     letterSpacing: 1.2,
//     color: "#6b7280",
//     marginBottom: 7,
//   },
//   labelRow: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 7,
//   },
//   forgotLink: { fontSize: 12, fontWeight: 700, color: "#b45309", cursor: "pointer" },

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
//   },

//   cta: {
//     marginTop: 4,
//     width: "100%",
//     border: "none",
//     cursor: "pointer",
//     borderRadius: 12,
//     padding: "15px 18px",
//     background: "linear-gradient(180deg, #c97d24 0%, #a5620f 100%)",
//     boxShadow: "0 8px 24px rgba(180,83,9,0.28)",
//     fontSize: 15,
//     fontWeight: 800,
//     color: "#ffffff",
//     letterSpacing: 0.2,
//     fontFamily: "inherit",
//   },

//   otpToggleRow: { display: "flex", justifyContent: "center", marginTop: 18 },
//   otpToggleBtn: {
//     background: "transparent",
//     border: "none",
//     cursor: "pointer",
//     fontSize: 14,
//     fontWeight: 700,
//     color: "#b45309",
//     display: "flex",
//     alignItems: "center",
//     fontFamily: "inherit",
//     padding: 0,
//   },

//   registerLink: {
//     textAlign: "center",
//     marginTop: 22,
//     fontSize: 14,
//     fontWeight: 600,
//     color: "#6b7280",
//   },
//   registerLinkText: { color: "#111827", textDecoration: "none", fontWeight: 800 },
// };


import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const ADMIN_EMAIL = "admin@acqar.com";
const ADMIN_PASSWORD = "acqar123";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  function normEmail(v) {
    return (v || "").trim().toLowerCase();
  }

  function isAdminLogin(em, pw) {
    return (
      normEmail(em) === ADMIN_EMAIL &&
      String(pw || "").trim() === ADMIN_PASSWORD
    );
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const em = normEmail(email);
    if (!em) {
      setMsg({ type: "error", text: "Enter email." });
      return;
    }

    if (otpMode) {
      return sendLoginOtpAndGoVerify();
    }

    if (!password) {
      setMsg({ type: "error", text: "Enter email and password." });
      return;
    }

    // ✅ Hardcoded admin — bypass Supabase auth
    if (isAdminLogin(em, password)) {
  localStorage.setItem("admin_auth", "true");
  navigate("/admin-dashboard", { replace: true });
  return;
}

    // Normal user login
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: em,
        password,
      });
      if (error) throw error;
      setMsg({ type: "success", text: "Logged in successfully." });
      navigate("/dashboard");
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Login failed." });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setMsg({ type: "", text: "" });
    try {
      setOauthLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback-signup`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Google login failed." });
      setOauthLoading(false);
    }
  }

  async function sendLoginOtpAndGoVerify() {
    setMsg({ type: "", text: "" });
    const em = normEmail(email);
    if (!em) {
      setMsg({ type: "error", text: "Enter your email first." });
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: em,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;
      navigate("/verify-otp", { state: { email: em } });
    } catch (err) {
      setMsg({
        type: "error",
        text: err?.message || "Could not send OTP. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  function switchToOtp() {
    setMsg({ type: "", text: "" });
    setOtpMode(true);
    setPassword("");
  }

  function switchToPassword() {
    setMsg({ type: "", text: "" });
    setOtpMode(false);
  }

  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(max-width: 900px)").matches;

  const r = useMemo(
    () => ({
      pageDir: isMobile ? "column" : "row",
      showLeft: !isMobile,
      rightPad: isMobile ? "24px 16px" : styles.rightPanel.padding,
      formMax: isMobile ? 520 : styles.formCard.maxWidth,
    }),
    [isMobile]
  );

  return (
    <div style={{ ...styles.page, flexDirection: r.pageDir }}>
      {/* ── LEFT PANEL ── */}
      {r.showLeft && (
        <div style={styles.leftPanel}>
          <div style={styles.logoRow}>
            // <div style={styles.logoBox}>
            //   <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            //     <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#fff" />
            //     <rect x="14" y="2" width="8" height="8" rx="1.5" fill="#fff" opacity="0.6" />
            //     <rect x="2" y="14" width="8" height="8" rx="1.5" fill="#fff" opacity="0.6" />
            //     <rect x="14" y="14" width="8" height="8" rx="1.5" fill="#fff" opacity="0.3" />
            //   </svg>
            // </div>
           <div
            className="hdrLogo flex items-center cursor-pointer shrink-0 whitespace-nowrap"
            onClick={() => navigate("/")}
          >
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase whitespace-nowrap">
              <span style={{ color: "#B87333" }}>ACQ</span>
              <span style={{ color: "#111111" }}>AR</span>
            </h1>
          </div>
          </div>

          <div style={styles.heroSection}>
            <h1 style={styles.heroTitle}>
              Secure Access
              <br />to Your
              <br />Property
              <br />Intelligence
            </h1>
            <p style={styles.heroSub}>
              The world's first AI-powered platform for institutional-grade Dubai
              property valuations.
            </p>
          </div>

          <div style={styles.badgesList}>
            {[
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z" fill="#b45309" />
                    <path d="M10 12l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: "256-BIT SSL",
                sub: "Bank-level encryption",
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#b45309" />
                    <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
                title: "GDPR COMPLIANT",
                sub: "Strict privacy controls",
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#b45309" />
                    <circle cx="12" cy="9" r="2.5" fill="#fff" />
                  </svg>
                ),
                title: "DUBAI DATA RESIDENCY",
                sub: "Local infrastructure",
              },
            ].map((b, i) => (
              <div key={i} style={styles.badgeCard}>
                <div style={styles.badgeIcon}>{b.icon}</div>
                <div>
                  <div style={styles.badgeTitle}>{b.title}</div>
                  <div style={styles.badgeSub}>{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RIGHT PANEL ── */}
      <div style={{ ...styles.rightPanel, padding: r.rightPad }}>
        <div style={{ ...styles.formCard, maxWidth: r.formMax }}>
          <h2 style={styles.formTitle}>Welcome Back to ACQAR</h2>
          <p style={styles.formSub}>Please enter your institutional credentials.</p>

          {msg.text && (
            <div style={msg.type === "error" ? styles.msgError : styles.msgOk}>
              {msg.text}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              ...styles.googleBtn,
              opacity: oauthLoading ? 0.7 : 1,
              cursor: oauthLoading ? "not-allowed" : "pointer",
            }}
            disabled={oauthLoading || loading}
          >
            <span style={styles.googleIconWrap} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.694 32.657 29.29 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.055 6.053 29.273 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.01 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.055 6.053 29.273 4 24 4c-7.682 0-14.35 4.346-17.694 10.691z" />
                <path fill="#4CAF50" d="M24 44c5.182 0 9.91-1.986 13.471-5.219l-6.219-5.264C29.2 35.091 26.715 36 24 36c-5.268 0-9.66-3.317-11.29-7.946l-6.522 5.026C9.49 39.556 16.227 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.07 12.07 0 0 1-4.051 5.517l.003-.002 6.219 5.264C36.99 39.246 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
              </svg>
            </span>
            {oauthLoading ? "Connecting..." : "Continue with Google"}
          </button>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>OR</span>
            <span style={styles.dividerLine} />
          </div>

          <form onSubmit={handleLogin}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="email">WORK EMAIL</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="4" width="20" height="16" rx="2.5" stroke="#9ca3af" strokeWidth="1.8" />
                    <path d="M2 8l10 7 10-7" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                  disabled={oauthLoading}
                />
              </div>
            </div>

            {!otpMode && (
              <div style={styles.field}>
                <div style={styles.labelRow}>
                  <label style={styles.label} htmlFor="password">PASSWORD</label>
                  <span
                    style={styles.forgotLink}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate("/forgot-password")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") navigate("/forgot-password");
                    }}
                  >
                    Forgot Password?
                  </span>
                </div>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="11" width="14" height="10" rx="2" stroke="#9ca3af" strokeWidth="1.8" />
                      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    style={{ ...styles.input, paddingRight: 46 }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    disabled={oauthLoading}
                  />
                  <button
                    type="button"
                    style={styles.eyeBtn}
                    onClick={() => setShowPassword((p) => !p)}
                    disabled={oauthLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
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
            )}

            <button
              type="submit"
              style={{
                ...styles.cta,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading || oauthLoading}
            >
              {loading ? "Please wait..." : otpMode ? "Send OTP to Email →" : "Sign In →"}
            </button>
          </form>

          <div style={styles.otpToggleRow}>
            {otpMode ? (
              <button type="button" style={styles.otpToggleBtn} onClick={switchToPassword} disabled={loading || oauthLoading}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                  <rect x="5" y="11" width="14" height="10" rx="2" stroke="#b45309" strokeWidth="1.8" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                Sign in with Password instead
              </button>
            ) : (
              <button type="button" style={styles.otpToggleBtn} onClick={switchToOtp} disabled={loading || oauthLoading}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
                  <circle cx="9" cy="12" r="1.5" fill="#b45309" />
                  <circle cx="15" cy="12" r="1.5" fill="#b45309" />
                  <rect x="2" y="6" width="20" height="12" rx="2.5" stroke="#b45309" strokeWidth="1.8" />
                </svg>
                Sign in with OTP instead
              </button>
            )}
          </div>

          <p style={styles.registerLink}>
            Don&apos;t have an account?{" "}
            <Link to="/signup" style={styles.registerLinkText}>
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "row",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
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
  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 0 },
  logoBox: {
    width: 38, height: 38, borderRadius: 10,
    background: "#1a1a1a",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  heroSection: {
    flex: 1, display: "flex", flexDirection: "column",
    justifyContent: "center", paddingBottom: 20,
  },
  heroTitle: {
    margin: "0 0 20px", fontSize: 40, fontWeight: 900,
    color: "#111827", lineHeight: 1.13, letterSpacing: -0.5,
  },
  heroSub: { margin: 0, fontSize: 15, color: "#6b7280", lineHeight: 1.6, maxWidth: 300 },
  badgesList: { display: "flex", flexDirection: "column", gap: 12 },
  badgeCard: {
    display: "flex", alignItems: "center", gap: 14,
    background: "#ffffff", borderRadius: 14, padding: "14px 18px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  badgeIcon: {
    flexShrink: 0, width: 36, height: 36, borderRadius: 10,
    background: "#fef3c7",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  badgeTitle: { fontSize: 13, fontWeight: 800, color: "#111827", letterSpacing: 0.4 },
  badgeSub: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  rightPanel: {
    flex: 1, minHeight: "100vh", background: "#ffffff",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "40px 32px", boxSizing: "border-box",
  },
  formCard: { width: "100%", maxWidth: 460 },
  formTitle: {
    margin: "0 0 6px", fontSize: 24, fontWeight: 800,
    color: "#111827", textAlign: "center", letterSpacing: -0.3,
  },
  formSub: { margin: "0 0 22px", fontSize: 14, color: "#6b7280", textAlign: "center" },
  msgError: {
    marginBottom: 16, background: "#fff1f2", border: "1px solid #fecdd3",
    color: "#9f1239", padding: "11px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600,
  },
  msgOk: {
    marginBottom: 16, background: "#ecfdf5", border: "1px solid #bbf7d0",
    color: "#166534", padding: "11px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600,
  },
  googleBtn: {
    width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
    gap: 10, padding: "13px 16px", borderRadius: 12,
    border: "1px solid #e5e7eb", background: "#fff",
    fontWeight: 700, fontSize: 15, color: "#111827",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)", cursor: "pointer",
  },
  googleIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    display: "grid", placeItems: "center",
    background: "#f9fafb", border: "1px solid rgba(0,0,0,0.06)",
  },
  divider: { display: "flex", alignItems: "center", gap: 12, margin: "18px 0" },
  dividerLine: { height: 1, background: "#e5e7eb", flex: 1 },
  dividerText: { fontSize: 12, color: "#9ca3af", fontWeight: 700, letterSpacing: 1 },
  field: { marginBottom: 16 },
  label: {
    display: "block", fontSize: 11, fontWeight: 800,
    letterSpacing: 1.2, color: "#6b7280", marginBottom: 7,
  },
  labelRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 7,
  },
  forgotLink: { fontSize: 12, fontWeight: 700, color: "#b45309", cursor: "pointer" },
  inputWrap: { position: "relative", display: "flex", alignItems: "center" },
  inputIcon: {
    position: "absolute", left: 14, top: "50%",
    transform: "translateY(-50%)",
    display: "flex", alignItems: "center",
    pointerEvents: "none", zIndex: 1,
  },
  input: {
    width: "100%", boxSizing: "border-box",
    border: "1px solid #e5e7eb", borderRadius: 12,
    padding: "13px 14px 13px 42px", fontSize: 14,
    outline: "none", background: "#ffffff",
    color: "#111827", fontFamily: "inherit",
  },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%",
    transform: "translateY(-50%)", border: "none",
    background: "transparent", padding: 4, cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  cta: {
    marginTop: 4, width: "100%", border: "none", cursor: "pointer",
    borderRadius: 12, padding: "15px 18px",
    background: "linear-gradient(180deg, #c97d24 0%, #a5620f 100%)",
    boxShadow: "0 8px 24px rgba(180,83,9,0.28)",
    fontSize: 15, fontWeight: 800, color: "#ffffff",
    letterSpacing: 0.2, fontFamily: "inherit",
  },
  otpToggleRow: { display: "flex", justifyContent: "center", marginTop: 18 },
  otpToggleBtn: {
    background: "transparent", border: "none", cursor: "pointer",
    fontSize: 14, fontWeight: 700, color: "#b45309",
    display: "flex", alignItems: "center",
    fontFamily: "inherit", padding: 0,
  },
  registerLink: { textAlign: "center", marginTop: 22, fontSize: 14, fontWeight: 600, color: "#6b7280" },
  registerLinkText: { color: "#111827", textDecoration: "none", fontWeight: 800 },
};

