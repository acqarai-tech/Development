// // src/pages/Login.jsx
// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// export default function Login() {
//   const navigate = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);

//   // ✅ OTP login states
//   const [otpMode, setOtpMode] = useState(false); // false=password, true=OTP
//   const [otpStep, setOtpStep] = useState("request"); // "request" | "verify"
//   const [otp, setOtp] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [oauthLoading, setOauthLoading] = useState(false);
//   const [msg, setMsg] = useState({ type: "", text: "" }); // type: "error" | "success" | ""

//   function normEmail(v) {
//     return (v || "").trim().toLowerCase();
//   }

//   // ✅ LOCAL ADMIN (ONLY ADDITION)
//   const ADMIN_EMAIL = "admin@acqar.com";
//   const ADMIN_PASSWORD = "acqar123";

//   function isAdminLogin(em, pw) {
//     return normEmail(em) === ADMIN_EMAIL && String(pw || "") === ADMIN_PASSWORD;
//   }

//   // -------------------------------------------------------
//   // ✅ PERMANENT FIX: sync auth.users <-> public.users
//   // -------------------------------------------------------
//   async function syncPublicUserFromAuth() {
//     const { data: uData, error: uErr } = await supabase.auth.getUser();
//     if (uErr) throw uErr;

//     const user = uData?.user;
//     if (!user?.id) throw new Error("User not authenticated.");

//     const authId = user.id;
//     const authEmail = normEmail(user.email);

//     const metaName = (
//       user.user_metadata?.name ||
//       user.user_metadata?.full_name ||
//       user.user_metadata?.display_name ||
//       ""
//     ).trim();

//     // 1) Try get row by authId
//     let { data: byIdRow, error: byIdErr } = await supabase
//       .from("users")
//       .select("id, role, name, email, phone, created_at")
//       .eq("id", authId)
//       .maybeSingle();

//     if (byIdErr) console.warn("users select by id:", byIdErr.message);

//     // 2) If not found, try by email
//     if (!byIdRow && authEmail) {
//       const { data: byEmailRow, error: byEmailErr } = await supabase
//         .from("users")
//         .select("id, role, name, email, phone, created_at")
//         .eq("email", authEmail)
//         .maybeSingle();

//       if (byEmailErr) console.warn("users select by email:", byEmailErr.message);

//       // If found but wrong id => migrate
//       if (byEmailRow?.id && byEmailRow.id !== authId) {
//         const payload = {
//           id: authId,
//           email: authEmail,
//           role: byEmailRow.role || null,
//           phone: byEmailRow.phone || null,
//           name: (byEmailRow.name || metaName || "").trim() || null,
//         };

//         const { error: upsertErr } = await supabase.from("users").upsert(payload, { onConflict: "id" });
//         if (upsertErr) throw upsertErr;

//         // delete old wrong-id row
//         const { error: delErr } = await supabase.from("users").delete().eq("id", byEmailRow.id);
//         if (delErr) console.warn("users delete old row:", delErr.message);

//         // re-fetch correct
//         const { data: afterRow, error: afterErr } = await supabase
//           .from("users")
//           .select("id, role, name, email, phone, created_at")
//           .eq("id", authId)
//           .maybeSingle();

//         if (afterErr) console.warn("users select after migrate:", afterErr.message);
//         byIdRow = afterRow || null;
//       } else {
//         byIdRow = byEmailRow || null;
//       }
//     }

//     // 3) If still missing, create correct row
//     if (!byIdRow) {
//       const payload = { id: authId, email: authEmail, name: metaName || null };

//       const { error: createErr } = await supabase.from("users").upsert(payload, { onConflict: "id" });
//       if (createErr) throw createErr;

//       const { data: createdRow, error: createdSelErr } = await supabase
//         .from("users")
//         .select("id, role, name, email, phone, created_at")
//         .eq("id", authId)
//         .maybeSingle();

//       if (createdSelErr) console.warn("users select created:", createdSelErr.message);
//       byIdRow = createdRow || null;
//     }

//     // 4) If name empty but metaName exists, update once
//     if (byIdRow && !(byIdRow.name || "").trim() && metaName) {
//       const { error: updErr } = await supabase.from("users").update({ name: metaName }).eq("id", authId);
//       if (updErr) console.warn("users update name:", updErr.message);
//     }

//     return true;
//   }

//   async function handleLogin(e) {
//     e.preventDefault();
//     setMsg({ type: "", text: "" });

//     const em = normEmail(email);
//     if (!em) {
//       setMsg({ type: "error", text: "Enter email." });
//       return;
//     }

//     // ✅ OTP flow (unchanged)
//     if (otpMode) {
//       if (otpStep === "request") return sendLoginOtp();
//       return verifyLoginOtp();
//     }

//     // ✅ Password flow
//     if (!password) {
//       setMsg({ type: "error", text: "Enter email and password." });
//       return;
//     }

//     // ✅ UPDATED: Admin login (REAL Supabase session)
//     if (isAdminLogin(em, password)) {
//       try {
//         setLoading(true);
//         setMsg({ type: "", text: "" });

//         const { error } = await supabase.auth.signInWithPassword({
//           email: ADMIN_EMAIL,
//           password: ADMIN_PASSWORD,
//         });

//         if (error) throw error;

//         // ✅ Permanent fix: sync public.users immediately after admin login
//         await syncPublicUserFromAuth();

//         navigate("/admin-dashboard");
//         return;
//       } catch (e2) {
//         setMsg({ type: "error", text: e2?.message || "Admin login failed." });
//         return;
//       } finally {
//         setLoading(false);
//       }
//     }

//     try {
//       setLoading(true);
//       const { error } = await supabase.auth.signInWithPassword({ email: em, password });
//       if (error) throw error;

//       // ✅ Permanent fix: sync public.users immediately after login
//       await syncPublicUserFromAuth();

//       navigate("/dashboard");
//     } catch (err) {
//       setMsg({ type: "error", text: err?.message || "Login failed." });
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleGoogleLogin() {
//     setMsg({ type: "", text: "" });

//     try {
//       setOauthLoading(true);
//       const redirectTo = `${window.location.origin}/dashboard`;

//       const { error } = await supabase.auth.signInWithOAuth({
//         provider: "google",
//         options: { redirectTo },
//       });

//       if (error) throw error;
//     } catch (err) {
//       setMsg({ type: "error", text: err?.message || "Google login failed." });
//       setOauthLoading(false);
//     }
//   }

//   // =========================
//   // ✅ OTP Login
//   // =========================
//   async function sendLoginOtp() {
//     setMsg({ type: "", text: "" });
//     const em = normEmail(email);

//     if (!em) {
//       setMsg({ type: "error", text: "Enter your email first." });
//       return;
//     }

//     try {
//       setLoading(true);

//       const { data: existingUser, error: checkErr } = await supabase
//         .from("users")
//         .select("email")
//         .eq("email", em)
//         .maybeSingle();

//       if (checkErr) throw checkErr;

//       if (!existingUser) {
//         setMsg({ type: "error", text: "Email not found. Please sign up first." });
//         return;
//       }

//       const { error } = await supabase.auth.signInWithOtp({
//         email: em,
//         options: { shouldCreateUser: true },
//       });

//       if (error) throw error;

//       setOtpStep("verify");
//       setMsg({ type: "success", text: "OTP sent to your email. Please enter the code." });
//     } catch (err) {
//       setMsg({ type: "error", text: err?.message || "Could not send OTP. Please try again." });
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function verifyLoginOtp() {
//     setMsg({ type: "", text: "" });

//     const em = normEmail(email);
//     const code = (otp || "").trim();

//     if (!em) {
//       setMsg({ type: "error", text: "Enter your email first." });
//       return;
//     }
//     if (!code) {
//       setMsg({ type: "error", text: "Enter the OTP code." });
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

//       await syncPublicUserFromAuth();

//       setMsg({ type: "success", text: "Logged in successfully." });
//       setOtp("");
//       navigate("/dashboard");
//     } catch (err) {
//       setMsg({ type: "error", text: err?.message || "OTP verification failed." });
//     } finally {
//       setLoading(false);
//     }
//   }

//   function switchToOtp() {
//     setMsg({ type: "", text: "" });
//     setOtpMode(true);
//     setOtpStep("request");
//     setOtp("");
//     setPassword("");
//   }

//   function switchToPassword() {
//     setMsg({ type: "", text: "" });
//     setOtpMode(false);
//     setOtpStep("request");
//     setOtp("");
//   }

//   function changeEmailInOtp() {
//     setMsg({ type: "", text: "" });
//     setOtpStep("request");
//     setOtp("");
//   }

//   return (
//     <div style={styles.page}>
//       <div style={styles.card}>
//         <h1 style={styles.h1}>Login</h1>
//         <div style={styles.subTitle}>Sign in to access your dashboard</div>

//         {msg.text ? <div style={msg.type === "error" ? styles.msgError : styles.msgOk}>{msg.text}</div> : null}

//         {/* Google */}
//         <button
//           type="button"
//           onClick={handleGoogleLogin}
//           style={{
//             ...styles.googleBtn,
//             opacity: oauthLoading ? 0.75 : 1,
//             cursor: oauthLoading ? "not-allowed" : "pointer",
//           }}
//           disabled={oauthLoading || loading}
//         >
//           <span style={styles.googleIconWrap} aria-hidden="true">
//             <svg width="18" height="18" viewBox="0 0 48 48">
//               <path
//                 fill="#FFC107"
//                 d="M43.611 20.083H42V20H24v8h11.303C33.694 32.657 29.29 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.055 6.053 29.273 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
//               />
//               <path
//                 fill="#FF3D00"
//                 d="M6.306 14.691l6.571 4.819C14.655 16.108 19.01 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.055 6.053 29.273 4 24 4c-7.682 0-14.35 4.346-17.694 10.691z"
//               />
//               <path
//                 fill="#4CAF50"
//                 d="M24 44c5.182 0 9.91-1.986 13.471-5.219l-6.219-5.264C29.2 35.091 26.715 36 24 36c-5.268 0-9.66-3.317-11.29-7.946l-6.522 5.026C9.49 39.556 16.227 44 24 44z"
//               />
//               <path
//                 fill="#1976D2"
//                 d="M43.611 20.083H42V20H24v8h11.303a12.07 12.07 0 0 1-4.051 5.517l.003-.002 6.219 5.264C36.99 39.246 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
//               />
//             </svg>
//           </span>
//           {oauthLoading ? "Connecting..." : "Continue with Google"}
//         </button>

//         {/* Divider */}
//         <div style={styles.divider}>
//           <span style={styles.dividerLine} />
//           <span style={styles.dividerText}>or</span>
//           <span style={styles.dividerLine} />
//         </div>

//         {/* Toggle */}
//         <div style={styles.modeToggleRow}>
//           <button
//             type="button"
//             onClick={switchToPassword}
//             style={{ ...styles.modeToggleBtn, ...(otpMode ? {} : styles.modeToggleBtnActive) }}
//             disabled={loading || oauthLoading}
//           >
//             Password
//           </button>
//           <button
//             type="button"
//             onClick={switchToOtp}
//             style={{ ...styles.modeToggleBtn, ...(otpMode ? styles.modeToggleBtnActive : {}) }}
//             disabled={loading || oauthLoading}
//           >
//             Login with OTP
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleLogin} style={styles.form}>
//           <div style={styles.grid2}>
//             <div style={styles.field}>
//               <label style={styles.label} htmlFor="email">
//                 EMAIL ADDRESS
//               </label>
//               <input
//                 id="email"
//                 type="email"
//                 style={styles.input}
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="alex@venture.com"
//                 autoComplete="email"
//                 required
//                 disabled={oauthLoading || (otpMode && otpStep === "verify")}
//               />
//             </div>

//             {!otpMode ? (
//               <div style={styles.field}>
//                 <label style={styles.label} htmlFor="password">
//                   PASSWORD
//                 </label>

//                 <div style={styles.passwordWrap}>
//                   <input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     style={{ ...styles.input, paddingRight: 86 }}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Enter your password"
//                     autoComplete="current-password"
//                     required
//                     disabled={oauthLoading}
//                   />

//                   <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword((p) => !p)} disabled={oauthLoading}>
//                     {showPassword ? "Hide" : "Show"}
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div style={styles.field}>
//                 <label style={styles.label} htmlFor="otp">
//                   {otpStep === "verify" ? "EMAIL OTP CODE" : "OTP"}
//                 </label>

//                 {otpStep === "verify" ? (
//                   <input
//                     id="otp"
//                     type="text"
//                     style={styles.input}
//                     value={otp}
//                     onChange={(e) => setOtp(e.target.value)}
//                     placeholder="Enter OTP from your email"
//                     autoComplete="one-time-code"
//                     inputMode="numeric"
//                     required
//                     disabled={oauthLoading}
//                   />
//                 ) : (
//                   <input
//                     id="otp"
//                     type="text"
//                     style={{ ...styles.input, background: "rgba(15, 23, 42, 0.04)" }}
//                     value="Click button below to send OTP"
//                     readOnly
//                     disabled
//                   />
//                 )}

//                 {otpMode && otpStep === "verify" ? (
//                   <div style={styles.otpActionsRow}>
//                     <button type="button" style={styles.smallBtn} onClick={sendLoginOtp} disabled={loading || oauthLoading}>
//                       Resend OTP
//                     </button>
//                     <button type="button" style={styles.smallBtn} onClick={changeEmailInOtp} disabled={loading || oauthLoading}>
//                       Change Email
//                     </button>
//                   </div>
//                 ) : null}
//               </div>
//             )}
//           </div>

//           <button
//             type="submit"
//             style={{
//               ...styles.cta,
//               opacity: loading ? 0.75 : 1,
//               cursor: loading ? "not-allowed" : "pointer",
//             }}
//             disabled={loading || oauthLoading}
//           >
//             <span style={styles.ctaText}>
//               {loading ? "Please wait..." : !otpMode ? "Login" : otpStep === "request" ? "Send OTP to Email" : "Verify OTP & Login"}
//             </span>
//           </button>

//           <div style={styles.badgesRow}>
//             <div style={styles.badge}>
//               <span style={styles.badgeIcon}>🔒</span>
//               <span style={styles.badgeText}>SSL ENCRYPTED</span>
//             </div>
//             <div style={styles.badge}>
//               <span style={styles.badgeIcon}>✅</span>
//               <span style={styles.badgeText}>SECURE AUTH</span>
//             </div>
//           </div>
//         </form>

//         <p style={styles.registerLink}>
//           Don&apos;t have an account?{" "}
//           <Link to="/signup" style={styles.registerLinkText}>
//             Create account
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// const styles = {
//   page: {
//     minHeight: "100vh",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 18,
//     background:
//       "linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.10)), radial-gradient(1100px 600px at 50% 15%, rgba(255,255,255,0.30), transparent 55%), #7b8794",
//   },
//   card: {
//     width: "50%",
//     maxWidth: 860,
//     background: "#ffffff",
//     borderRadius: 26,
//     boxShadow: "0 26px 60px rgba(0,0,0,0.25)",
//     padding: "34px 34px 26px",
//   },
//   h1: { margin: 0, textAlign: "center", fontSize: 44, fontWeight: 900, color: "#0b1220", letterSpacing: -0.6 },
//   subTitle: { marginTop: 10, textAlign: "center", fontSize: 14, color: "#6b7280", fontWeight: 600 },

//   modeToggleRow: { marginTop: 10, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 },
//   modeToggleBtn: {
//     padding: "7px 26px",
//     borderRadius: 999,
//     border: "1px solid #e5e7eb",
//     background: "#fff",
//     fontWeight: 500,
//     cursor: "pointer",
//     color: "#111827",
//     minWidth: 170,
//     textAlign: "center",
//   },
//   modeToggleBtnActive: { background: "rgba(18,70,255,0.10)", border: "1px solid rgba(18,70,255,0.28)", color: "#1246ff" },

//   otpActionsRow: { display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" },
//   smallBtn: {
//     padding: "10px 12px",
//     borderRadius: 999,
//     border: "1px solid rgba(0,0,0,0.10)",
//     background: "rgba(15, 23, 42, 0.04)",
//     cursor: "pointer",
//     fontWeight: 900,
//     color: "#1f2a44",
//   },

//   msgError: {
//     marginTop: 16,
//     background: "#fff1f2",
//     border: "1px solid #fecdd3",
//     color: "#9f1239",
//     padding: 12,
//     borderRadius: 14,
//     fontSize: 14,
//     fontWeight: 700,
//   },
//   msgOk: {
//     marginTop: 16,
//     background: "#ecfdf5",
//     border: "1px solid #bbf7d0",
//     color: "#166534",
//     padding: 12,
//     borderRadius: 14,
//     fontSize: 14,
//     fontWeight: 700,
//   },

//   googleBtn: {
//     width: "100%",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 10,
//     padding: "12px 12px",
//     borderRadius: 14,
//     border: "1px solid #e2e8f0",
//     background: "#fff",
//     fontWeight: 800,
//     fontSize: 15,
//     color: "#111827",
//     boxShadow: "0 10px 22px rgba(0,0,0,0.06)",
//     marginTop: 18,
//   },
//   googleIconWrap: {
//     width: 34,
//     height: 34,
//     borderRadius: 12,
//     display: "grid",
//     placeItems: "center",
//     background: "rgba(15, 23, 42, 0.04)",
//     border: "1px solid rgba(0,0,0,0.06)",
//   },

//   divider: { display: "flex", alignItems: "center", gap: 10, margin: "16px 0" },
//   dividerLine: { height: 1, background: "#e5e7eb", flex: 1 },
//   dividerText: { fontSize: 13, color: "#6b7280", fontWeight: 700 },

//   form: { marginTop: 6 },
//   grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
//   field: { display: "flex", flexDirection: "column" },

//   label: { fontSize: 12, fontWeight: 900, letterSpacing: 1.1, color: "#94a3b8", marginBottom: 8 },

//   input: {
//     width: "100%",
//     boxSizing: "border-box",
//     border: "1px solid #e5e7eb",
//     borderRadius: 14,
//     padding: "14px 14px",
//     fontSize: 15,
//     outline: "none",
//     background: "#ffffff",
//     boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
//   },

//   passwordWrap: { position: "relative" },
//   eyeBtn: {
//     position: "absolute",
//     right: 10,
//     top: "50%",
//     transform: "translateY(-50%)",
//     padding: "8px 10px",
//     borderRadius: 999,
//     border: "1px solid rgba(0,0,0,0.06)",
//     background: "rgba(15, 23, 42, 0.04)",
//     cursor: "pointer",
//     fontWeight: 800,
//     color: "#1f2a44",
//   },

//   cta: {
//     marginTop: 18,
//     width: "100%",
//     border: "none",
//     cursor: "pointer",
//     borderRadius: 999,
//     padding: "16px 18px",
//     background: "linear-gradient(180deg, #2f86ff 0%, #1246ff 100%)",
//     boxShadow: "0 18px 34px rgba(18,70,255,0.32)",
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 14,
//   },
//   ctaText: { color: "#ffffff", fontSize: 16, fontWeight: 900, letterSpacing: 0.2 },

//   badgesRow: { marginTop: 14, display: "flex", justifyContent: "center", gap: 22, flexWrap: "wrap" },
//   badge: { display: "inline-flex", alignItems: "center", gap: 8 },
//   badgeIcon: { fontSize: 14 },
//   badgeText: { fontSize: 12, fontWeight: 900, color: "#94a3b8", letterSpacing: 0.6 },

//   registerLink: { textAlign: "center", marginTop: 18, fontWeight: 700, color: "#0b1220" },
//   registerLinkText: { color: "#1d4ed8", textDecoration: "none", fontWeight: 900 },
// };


// import React, { useState } from "react";
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

//     // ✅ Normal email/password auth (optional if you want to keep)
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
//     setMsg({ type: "", text: "" });

//     try {
//       setOauthLoading(true);
//       const redirectTo = `${window.location.origin}/dashboard`;

//       const { error } = await supabase.auth.signInWithOAuth({
//         provider: "google",
//         options: { redirectTo },
//       });

//       if (error) throw error;
//     } catch (err) {
//       setMsg({ type: "error", text: err?.message || "Google login failed." });
//       setOauthLoading(false);
//     }
//   }

//   // ✅ NEW: send OTP then route to /verify-otp
//   async function sendLoginOtpAndGoVerify() {
//     setMsg({ type: "", text: "" });
//     const em = normEmail(email);

//     if (!em) {
//       setMsg({ type: "error", text: "Enter your email first." });
//       return;
//     }

//     try {
//       setLoading(true);

//       // ✅ optional: keep your "must exist in users table" check
//       const { data: existingUser, error: checkErr } = await supabase
//         .from("users")
//         .select("email")
//         .eq("email", em)
//         .maybeSingle();

//       if (checkErr) throw checkErr;

//       if (!existingUser) {
//         setMsg({ type: "error", text: "Email not found. Please sign up first." });
//         return;
//       }

//       const { error } = await supabase.auth.signInWithOtp({
//         email: em,
//         options: { shouldCreateUser: true },
//       });

//       if (error) throw error;

//       // ✅ Go to OTP screen and pass email
//       navigate("/verify-otp", { state: { email: em } });
//     } catch (err) {
//       setMsg({ type: "error", text: err?.message || "Could not send OTP. Please try again." });
//     } finally {
//       setLoading(false);
//     }
//   }

//   function switchToOtp() {
//     setMsg({ type: "", text: "" });
//     setOtpMode(true);
//     setPassword("");
//   }

//   function switchToPassword() {
//     setMsg({ type: "", text: "" });
//     setOtpMode(false);
//   }

//   // ✅ ONLY CHANGE: add responsive behavior (layout + sizing) without changing UI or functionality
//   const isMobile =
//     typeof window !== "undefined" &&
//     window.matchMedia &&
//     window.matchMedia("(max-width: 900px)").matches;

//   const r = {
//     pageDir: isMobile ? "column" : "row",
//     leftW: isMobile ? "100%" : "40%",
//     rightPad: isMobile ? "24px 16px" : styles.rightPanel.padding,
//     leftPad: isMobile ? "28px 16px 18px" : styles.leftPanel.padding,
//     heroTitleFs: isMobile ? 32 : styles.heroTitle.fontSize,
//     heroSubMax: isMobile ? "100%" : styles.heroSub.maxWidth,
//     formMax: isMobile ? 520 : styles.formCard.maxWidth,
//     alignHero: isMobile ? "flex-start" : "center",
//   };

//   return (
//     <div style={{ ...styles.page, flexDirection: r.pageDir }}>
//       {/* ── LEFT PANEL ── */}
//       <div
//         style={{
//           ...styles.leftPanel,
//           width: r.leftW,
//           minHeight: isMobile ? "auto" : styles.leftPanel.minHeight,
//           padding: r.leftPad,
//         }}
//       >
//         {/* Logo */}
//         <div style={styles.logoRow}>
//           <div style={styles.logoBox}>
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
//               <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#fff" />
//               <rect x="14" y="2" width="8" height="8" rx="1.5" fill="#fff" opacity="0.6" />
//               <rect x="2" y="14" width="8" height="8" rx="1.5" fill="#fff" opacity="0.6" />
//               <rect x="14" y="14" width="8" height="8" rx="1.5" fill="#fff" opacity="0.3" />
//             </svg>
//           </div>
//           <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-[#2B2B2B] uppercase whitespace-nowrap">
//   ACQAR
// </h1>
//         </div>

//         {/* Headline */}
//         <div style={{ ...styles.heroSection, justifyContent: r.alignHero, paddingBottom: isMobile ? 16 : 20 }}>
//           <h1 style={{ ...styles.heroTitle, fontSize: r.heroTitleFs }}>
//             Secure Access<br />to Your<br />Property<br />Intelligence
//           </h1>
//           <p style={{ ...styles.heroSub, maxWidth: r.heroSubMax }}>
//             The world's first AI-powered platform for institutional-grade Dubai property valuations.
//           </p>
//         </div>

//         {/* Trust badges */}
//         <div style={styles.badgesList}>
//           {[
//             {
//               icon: (
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                   <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z" fill="#b45309" />
//                   <path d="M10 12l2 2 4-4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//                 </svg>
//               ),
//               title: "256-BIT SSL",
//               sub: "Bank-level encryption",
//             },
//             {
//               icon: (
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                   <circle cx="12" cy="12" r="10" fill="#b45309" />
//                   <path d="M8 12l3 3 5-5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
//                 </svg>
//               ),
//               title: "GDPR COMPLIANT",
//               sub: "Strict privacy controls",
//             },
//             {
//               icon: (
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
//                   <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#b45309" />
//                   <circle cx="12" cy="9" r="2.5" fill="#fff" />
//                 </svg>
//               ),
//               title: "DUBAI DATA RESIDENCY",
//               sub: "Local infrastructure",
//             },
//           ].map((b, i) => (
//             <div key={i} style={styles.badgeCard}>
//               <div style={styles.badgeIcon}>{b.icon}</div>
//               <div>
//                 <div style={styles.badgeTitle}>{b.title}</div>
//                 <div style={styles.badgeSub}>{b.sub}</div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

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
//                 <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.694 32.657 29.29 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.055 6.053 29.273 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
//                 <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.01 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.055 6.053 29.273 4 24 4c-7.682 0-14.35 4.346-17.694 10.691z" />
//                 <path fill="#4CAF50" d="M24 44c5.182 0 9.91-1.986 13.471-5.219l-6.219-5.264C29.2 35.091 26.715 36 24 36c-5.268 0-9.66-3.317-11.29-7.946l-6.522 5.026C9.49 39.556 16.227 44 24 44z" />
//                 <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.07 12.07 0 0 1-4.051 5.517l.003-.002 6.219 5.264C36.99 39.246 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
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
//               <label style={styles.label} htmlFor="email">WORK EMAIL</label>
//               <div style={styles.inputWrap}>
//                 <span style={styles.inputIcon}>
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                     <rect x="2" y="4" width="20" height="16" rx="2.5" stroke="#9ca3af" strokeWidth="1.8" />
//                     <path d="M2 8l10 7 10-7" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
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
//                   <label style={styles.label} htmlFor="password">PASSWORD</label>
//                   <span
//                     style={styles.forgotLink}
//                     role="button"
//                     tabIndex={0}
//                     onClick={() => navigate("/forgot-password")}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter" || e.key === " ") navigate("/forgot-password");
//                     }}
//                   >
//                     Forgot Password?
//                   </span>
//                 </div>
//                 <div style={styles.inputWrap}>
//                   <span style={styles.inputIcon}>
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                       <rect x="5" y="11" width="14" height="10" rx="2" stroke="#9ca3af" strokeWidth="1.8" />
//                       <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
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
//                         <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
//                         <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
//                         <path d="M1 1l22 22" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" />
//                       </svg>
//                     ) : (
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
//                         <ellipse cx="12" cy="12" rx="11" ry="8" stroke="#9ca3af" strokeWidth="1.8" />
//                         <circle cx="12" cy="12" r="3" stroke="#9ca3af" strokeWidth="1.8" />
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
//               <button type="button" style={styles.otpToggleBtn} onClick={switchToPassword} disabled={loading || oauthLoading}>
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
//                   <rect x="5" y="11" width="14" height="10" rx="2" stroke="#b45309" strokeWidth="1.8" />
//                   <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#b45309" strokeWidth="1.8" strokeLinecap="round" />
//                 </svg>
//                 Sign in with Password instead
//               </button>
//             ) : (
//               <button type="button" style={styles.otpToggleBtn} onClick={switchToOtp} disabled={loading || oauthLoading}>
//                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginRight: 6 }}>
//                   <circle cx="9" cy="12" r="1.5" fill="#b45309" />
//                   <circle cx="15" cy="12" r="1.5" fill="#b45309" />
//                   <rect x="2" y="6" width="20" height="12" rx="2.5" stroke="#b45309" strokeWidth="1.8" />
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
//   logoText: { fontSize: 17, fontWeight: 800, color: "#1a1a1a", letterSpacing: 2 },

//   heroSection: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 20 },
//   heroTitle: { margin: "0 0 20px", fontSize: 40, fontWeight: 900, color: "#111827", lineHeight: 1.13, letterSpacing: -0.5 },
//   heroSub: { margin: 0, fontSize: 15, color: "#6b7280", lineHeight: 1.6, maxWidth: 300 },

//   badgesList: { display: "flex", flexDirection: "column", gap: 12 },
//   badgeCard: { display: "flex", alignItems: "center", gap: 14, background: "#ffffff", borderRadius: 14, padding: "14px 18px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
//   badgeIcon: { flexShrink: 0, width: 36, height: 36, borderRadius: 10, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center" },
//   badgeTitle: { fontSize: 13, fontWeight: 800, color: "#111827", letterSpacing: 0.4 },
//   badgeSub: { fontSize: 12, color: "#9ca3af", marginTop: 2 },

//   /* ── Right panel ── */
//   rightPanel: { flex: 1, minHeight: "100vh", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px", boxSizing: "border-box" },
//   formCard: { width: "100%", maxWidth: 460 },

//   formTitle: { margin: "0 0 6px", fontSize: 24, fontWeight: 800, color: "#111827", textAlign: "center", letterSpacing: -0.3 },
//   formSub: { margin: "0 0 22px", fontSize: 14, color: "#6b7280", textAlign: "center" },

//   msgError: { marginBottom: 16, background: "#fff1f2", border: "1px solid #fecdd3", color: "#9f1239", padding: "11px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600 },
//   msgOk: { marginBottom: 16, background: "#ecfdf5", border: "1px solid #bbf7d0", color: "#166534", padding: "11px 14px", borderRadius: 12, fontSize: 13, fontWeight: 600 },

//   googleBtn: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "13px 16px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", fontWeight: 700, fontSize: 15, color: "#111827", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", cursor: "pointer" },
//   googleIconWrap: { width: 28, height: 28, borderRadius: 8, display: "grid", placeItems: "center", background: "#f9fafb", border: "1px solid rgba(0,0,0,0.06)" },

//   divider: { display: "flex", alignItems: "center", gap: 12, margin: "18px 0" },
//   dividerLine: { height: 1, background: "#e5e7eb", flex: 1 },
//   dividerText: { fontSize: 12, color: "#9ca3af", fontWeight: 700, letterSpacing: 1 },

//   field: { marginBottom: 16 },
//   label: { display: "block", fontSize: 11, fontWeight: 800, letterSpacing: 1.2, color: "#6b7280", marginBottom: 7 },
//   labelRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 },
//   forgotLink: { fontSize: 12, fontWeight: 700, color: "#b45309", cursor: "pointer" },

//   inputWrap: { position: "relative", display: "flex", alignItems: "center" },
//   inputIcon: { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", pointerEvents: "none", zIndex: 1 },
//   input: { width: "100%", boxSizing: "border-box", border: "1px solid #e5e7eb", borderRadius: 12, padding: "13px 14px 13px 42px", fontSize: 14, outline: "none", background: "#ffffff", color: "#111827", fontFamily: "inherit" },
//   eyeBtn: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", border: "none", background: "transparent", padding: 4, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },

//   cta: { marginTop: 4, width: "100%", border: "none", cursor: "pointer", borderRadius: 12, padding: "15px 18px", background: "linear-gradient(180deg, #c97d24 0%, #a5620f 100%)", boxShadow: "0 8px 24px rgba(180,83,9,0.28)", fontSize: 15, fontWeight: 800, color: "#ffffff", letterSpacing: 0.2, fontFamily: "inherit" },

//   otpToggleRow: { display: "flex", justifyContent: "center", marginTop: 18 },
//   otpToggleBtn: { background: "transparent", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#b45309", display: "flex", alignItems: "center", fontFamily: "inherit", padding: 0 },

//   registerLink: { textAlign: "center", marginTop: 22, fontSize: 14, fontWeight: 600, color: "#6b7280" },
//   registerLinkText: { color: "#111827", textDecoration: "none", fontWeight: 800 },
// };

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ OTP login states
  const [otpMode, setOtpMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  function normEmail(v) {
    return (v || "").trim().toLowerCase();
  }

  const ADMIN_EMAIL = "admin@acqar.com";
  const ADMIN_PASSWORD = "acqar123";

  function isAdminLogin(em, pw) {
    return normEmail(em) === ADMIN_EMAIL && String(pw || "") === ADMIN_PASSWORD;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const em = normEmail(email);
    if (!em) {
      setMsg({ type: "error", text: "Enter email." });
      return;
    }

    // ✅ OTP mode: send OTP and open next screen
    if (otpMode) {
      return sendLoginOtpAndGoVerify();
    }

    // ✅ Password mode
    if (!password) {
      setMsg({ type: "error", text: "Enter email and password." });
      return;
    }

    // ✅ Hard-coded admin (no Supabase auth)
    if (isAdminLogin(em, password)) {
      navigate("/admin-dashboard");
      return;
    }

    // ✅ Normal email/password auth (optional if you want to keep)
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
      const redirectTo = `${window.location.origin}/dashboard`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) throw error;
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Google login failed." });
      setOauthLoading(false);
    }
  }

  // ✅ NEW: send OTP then route to /verify-otp
  async function sendLoginOtpAndGoVerify() {
    setMsg({ type: "", text: "" });
    const em = normEmail(email);

    if (!em) {
      setMsg({ type: "error", text: "Enter your email first." });
      return;
    }

    try {
      setLoading(true);

      // ✅ optional: keep your "must exist in users table" check
      const { data: existingUser, error: checkErr } = await supabase
        .from("users")
        .select("email")
        .eq("email", em)
        .maybeSingle();

      if (checkErr) throw checkErr;

      if (!existingUser) {
        setMsg({ type: "error", text: "Email not found. Please sign up first." });
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: em,
        options: { shouldCreateUser: true },
      });

      if (error) throw error;

      // ✅ Go to OTP screen and pass email
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

  // ✅ Responsive detection (kept as-is)
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(max-width: 900px)").matches;

  // ✅ ONLY CHANGE: on mobile, hide left panel and show only the form (right panel)
  const r = {
    pageDir: isMobile ? "column" : "row",
    showLeft: !isMobile,
    rightPad: isMobile ? "24px 16px" : styles.rightPanel.padding,
    formMax: isMobile ? 520 : styles.formCard.maxWidth,
  };

  return (
    <div style={{ ...styles.page, flexDirection: r.pageDir }}>
      {/* ── LEFT PANEL ── */}
      {r.showLeft && (
        <div style={styles.leftPanel}>
          {/* Logo */}
          <div style={styles.logoRow}>
            <div style={styles.logoBox}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#fff" />
                <rect
                  x="14"
                  y="2"
                  width="8"
                  height="8"
                  rx="1.5"
                  fill="#fff"
                  opacity="0.6"
                />
                <rect
                  x="2"
                  y="14"
                  width="8"
                  height="8"
                  rx="1.5"
                  fill="#fff"
                  opacity="0.6"
                />
                <rect
                  x="14"
                  y="14"
                  width="8"
                  height="8"
                  rx="1.5"
                  fill="#fff"
                  opacity="0.3"
                />
              </svg>
            </div>
            <span style={styles.logoText}>ACQAR</span>
          </div>

          {/* Headline */}
          <div style={styles.heroSection}>
            <h1 style={styles.heroTitle}>
              Secure Access
              <br />
              to Your
              <br />
              Property
              <br />
              Intelligence
            </h1>
            <p style={styles.heroSub}>
              The world's first AI-powered platform for institutional-grade Dubai
              property valuations.
            </p>
          </div>

          {/* Trust badges */}
          <div style={styles.badgesList}>
            {[
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z"
                      fill="#b45309"
                    />
                    <path
                      d="M10 12l2 2 4-4"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
                title: "256-BIT SSL",
                sub: "Bank-level encryption",
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#b45309" />
                    <path
                      d="M8 12l3 3 5-5"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ),
                title: "GDPR COMPLIANT",
                sub: "Strict privacy controls",
              },
              {
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                      fill="#b45309"
                    />
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

          {/* Alert */}
          {msg.text && (
            <div style={msg.type === "error" ? styles.msgError : styles.msgOk}>
              {msg.text}
            </div>
          )}

          {/* Google */}
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
            {oauthLoading ? "Connecting..." : "Continue with Google"}
          </button>

          {/* Divider */}
          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>OR</span>
            <span style={styles.dividerLine} />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={styles.field}>
              <label style={styles.label} htmlFor="email">
                WORK EMAIL
              </label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect
                      x="2"
                      y="4"
                      width="20"
                      height="16"
                      rx="2.5"
                      stroke="#9ca3af"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M2 8l10 7 10-7"
                      stroke="#9ca3af"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
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

            {/* Password (only if not OTP mode) */}
            {!otpMode && (
              <div style={styles.field}>
                <div style={styles.labelRow}>
                  <label style={styles.label} htmlFor="password">
                    PASSWORD
                  </label>
                  <span
                    style={styles.forgotLink}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate("/forgot-password")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        navigate("/forgot-password");
                    }}
                  >
                    Forgot Password?
                  </span>
                </div>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect
                        x="5"
                        y="11"
                        width="14"
                        height="10"
                        rx="2"
                        stroke="#9ca3af"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M8 11V7a4 4 0 0 1 8 0v4"
                        stroke="#9ca3af"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
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
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
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
                        <path
                          d="M1 1l22 22"
                          stroke="#9ca3af"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <ellipse
                          cx="12"
                          cy="12"
                          rx="11"
                          ry="8"
                          stroke="#9ca3af"
                          strokeWidth="1.8"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="#9ca3af"
                          strokeWidth="1.8"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Submit */}
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

          {/* OTP toggle */}
          <div style={styles.otpToggleRow}>
            {otpMode ? (
              <button
                type="button"
                style={styles.otpToggleBtn}
                onClick={switchToPassword}
                disabled={loading || oauthLoading}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: 6 }}
                >
                  <rect
                    x="5"
                    y="11"
                    width="14"
                    height="10"
                    rx="2"
                    stroke="#b45309"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M8 11V7a4 4 0 0 1 8 0v4"
                    stroke="#b45309"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                Sign in with Password instead
              </button>
            ) : (
              <button
                type="button"
                style={styles.otpToggleBtn}
                onClick={switchToOtp}
                disabled={loading || oauthLoading}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ marginRight: 6 }}
                >
                  <circle cx="9" cy="12" r="1.5" fill="#b45309" />
                  <circle cx="15" cy="12" r="1.5" fill="#b45309" />
                  <rect
                    x="2"
                    y="6"
                    width="20"
                    height="12"
                    rx="2.5"
                    stroke="#b45309"
                    strokeWidth="1.8"
                  />
                </svg>
                Sign in with OTP instead
              </button>
            )}
          </div>

          {/* Register */}
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
  /* ── Page layout ── */
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "row",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  /* ── Left panel ── */
  leftPanel: {
    width: "40%",
    minHeight: "100vh",
    background: "#f3f4f6",
    display: "flex",
    flexDirection: "column",
    padding: "36px 40px 40px",
    boxSizing: "border-box",
    position: "relative",
  },

  logoRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 0 },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "#1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: { fontSize: 17, fontWeight: 800, color: "#1a1a1a", letterSpacing: 2 },

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
  heroSub: { margin: 0, fontSize: 15, color: "#6b7280", lineHeight: 1.6, maxWidth: 300 },

  badgesList: { display: "flex", flexDirection: "column", gap: 12 },
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
    background: "#fef3c7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTitle: { fontSize: 13, fontWeight: 800, color: "#111827", letterSpacing: 0.4 },
  badgeSub: { fontSize: 12, color: "#9ca3af", marginTop: 2 },

  /* ── Right panel ── */
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
  formCard: { width: "100%", maxWidth: 460 },

  formTitle: {
    margin: "0 0 6px",
    fontSize: 24,
    fontWeight: 800,
    color: "#111827",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  formSub: { margin: "0 0 22px", fontSize: 14, color: "#6b7280", textAlign: "center" },

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

  googleBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "13px 16px",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontWeight: 700,
    fontSize: 15,
    color: "#111827",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    cursor: "pointer",
  },
  googleIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: "grid",
    placeItems: "center",
    background: "#f9fafb",
    border: "1px solid rgba(0,0,0,0.06)",
  },

  divider: { display: "flex", alignItems: "center", gap: 12, margin: "18px 0" },
  dividerLine: { height: 1, background: "#e5e7eb", flex: 1 },
  dividerText: { fontSize: 12, color: "#9ca3af", fontWeight: 700, letterSpacing: 1 },

  field: { marginBottom: 16 },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 1.2,
    color: "#6b7280",
    marginBottom: 7,
  },
  labelRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 },
  forgotLink: { fontSize: 12, fontWeight: 700, color: "#b45309", cursor: "pointer" },

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
  },

  cta: {
    marginTop: 4,
    width: "100%",
    border: "none",
    cursor: "pointer",
    borderRadius: 12,
    padding: "15px 18px",
    background: "linear-gradient(180deg, #c97d24 0%, #a5620f 100%)",
    boxShadow: "0 8px 24px rgba(180,83,9,0.28)",
    fontSize: 15,
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: 0.2,
    fontFamily: "inherit",
  },

  otpToggleRow: { display: "flex", justifyContent: "center", marginTop: 18 },
  otpToggleBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 700,
    color: "#b45309",
    display: "flex",
    alignItems: "center",
    fontFamily: "inherit",
    padding: 0,
  },

  registerLink: { textAlign: "center", marginTop: 22, fontSize: 14, fontWeight: 600, color: "#6b7280" },
  registerLinkText: { color: "#111827", textDecoration: "none", fontWeight: 800 },
};

