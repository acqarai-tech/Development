// // src/pages/RegisterPage.jsx
// import React, { useMemo, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// export default function RegisterPage() {
//   const navigate = useNavigate();

//   // ✅ NEW (UI only): role + confirm password + terms checkbox
//   const ROLES = ["Property Owner", "Investor", "Buyer", "Agent"];
//   const [role, setRole] = useState("Investor");
//   const [agree, setAgree] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");

//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [passwordVisible, setPasswordVisible] = useState(false);
//   const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const emailPattern = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setError(null);

//     // ✅ keep same validations + add confirm + agree + role required
//     if (!role || !name || !email || !password || !confirmPassword || !phone) {
//       setError("Please fill in all fields.");
//       return;
//     }

//     if (!emailPattern.test(email.trim())) {
//       setError("Please enter a valid email address.");
//       return;
//     }

//     if (password.length < 6) {
//       setError("Password must be at least 6 characters.");
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }

//     if (!agree) {
//       setError("Please agree to the Terms of Service and Privacy Policy.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const { data, error: signUpErr } = await supabase.auth.signUp({
//         email: email.trim(),
//         password,
//       });

//       if (signUpErr) throw signUpErr;
//       if (!data?.user) throw new Error("Signup failed. Please try again.");

//       const userId = data.user.id;

//       // ✅ keep same upsert + include role (no other behavior change)
//       const { error: upsertErr } = await supabase.from("users").upsert(
//         {
//           id: userId,
//           role,
//           name: name.trim(),
//           email: email.trim().toLowerCase(),
//           phone: phone.trim(),
//         },
//         { onConflict: "id" }
//       );

//       if (upsertErr) throw upsertErr;

//       navigate("/login");
//     } catch (err) {
//       setError(err?.message || "Registration failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={styles.page}>
//       <div style={styles.card}>
//         <div style={styles.offerPillRow}>
          
//         </div>

//         <h1 style={styles.h1}>
//            <span style={styles.tm}>Registration</span> 
//         </h1>
        

//         <div style={styles.sectionLabel}>I AM A:</div>
//         <div style={styles.roleRow}>
//           {ROLES.map((r) => {
//             const active = r === role;
//             return (
//               <button
//                 key={r}
//                 type="button"
//                 onClick={() => setRole(r)}
//                 aria-pressed={active}
//                 style={{
//                   ...styles.roleBtn,
//                   ...(active ? styles.roleBtnActive : {}),
//                 }}
//               >
//                 {r}
//               </button>
//             );
//           })}
//         </div>

//         {error && <div style={styles.errorBox}>{error}</div>}

//         <form onSubmit={handleRegister} style={styles.form}>
//           <div style={styles.grid2}>
//             <div style={styles.field}>
//               <label style={styles.label}>FULL NAME</label>
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 required
//                 style={styles.input}
//                 placeholder="e.g. Alexander Pierce"
//                 autoComplete="name"
//               />
//             </div>

//             <div style={styles.field}>
//               <label style={styles.label}>EMAIL ADDRESS</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 style={styles.input}
//                 placeholder="alex@venture.com"
//                 autoComplete="email"
//               />
//             </div>
//           </div>

//           <div style={{ ...styles.grid2, marginTop: 8 }}>
//             <div style={styles.field}>
//               <label style={styles.label}>PASSWORD</label>
//               <div style={styles.passwordWrap}>
//                 <input
//                   type={passwordVisible ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   style={{ ...styles.input, paddingRight: 86 }}
//                   placeholder="Create a password"
//                   autoComplete="new-password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setPasswordVisible((v) => !v)}
//                   style={styles.eyeBtn}
//                 >
//                   {passwordVisible ? "Hide" : "Show"}
//                 </button>
//               </div>
//             </div>

//             <div style={styles.field}>
//               <label style={styles.label}>CONFIRM PASSWORD</label>
//               <div style={styles.passwordWrap}>
//                 <input
//                   type={confirmPasswordVisible ? "text" : "password"}
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   required
//                   style={{ ...styles.input, paddingRight: 86 }}
//                   placeholder="Confirm password"
//                   autoComplete="new-password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setConfirmPasswordVisible((v) => !v)}
//                   style={styles.eyeBtn}
//                 >
//                   {confirmPasswordVisible ? "Hide" : "Show"}
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div style={styles.fieldFull}>
//             <label style={styles.label}>PHONE NUMBER</label>
//             <div style={styles.phoneWrap}>
//               <div style={styles.ccBox}>+971</div>
//               <input
//                 type="tel"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 required
//                 style={styles.phoneInput}
//                 placeholder="50 000 0000"
//                 autoComplete="tel"
//               />
//             </div>
//           </div>

//           <div style={styles.termsRow}>
//             <input
//               id="agree"
//               type="checkbox"
//               checked={agree}
//               onChange={(e) => setAgree(e.target.checked)}
//               style={styles.checkbox}
//             />
//             <label htmlFor="agree" style={styles.termsText}>
//               I AGREE TO THE{" "}
//               <a href="/terms" style={styles.termsLink}>
//                 TERMS OF SERVICE
//               </a>{" "}
//               AND{" "}
//               <a href="/privacy" style={styles.termsLink}>
//                 PRIVACY POLICY
//               </a>
//               .
//             </label>
//           </div>

//          <button type="submit" style={styles.cta} disabled={loading}>
//   <span style={styles.ctaText}>
//     {loading ? "Creating..." : "Create Account"}
//   </span>
// </button>


          

//           {/* keep existing flow */}
//           <div style={styles.bottomRow}>
//             <span style={styles.bottomText}>Already have an account?</span>{" "}
//             <Link to="/login" style={styles.link}>
//               Login
//             </Link>
//           </div>
//         </form>
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
//     maxWidth: 760,
//     height:"10%",
//     background: "#ffffff",
//     borderRadius: 26,
//     boxShadow: "0 26px 60px rgba(0,0,0,0.25)",
//     padding: "34px 34px 26px",
//   },

//   offerPillRow: { display: "flex", justifyContent: "center", marginBottom: 14 },
//   offerPill: {
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 8,
//     padding: "8px 14px",
//     borderRadius: 999,
//     background: "#fff2e7",
//     border: "1px solid rgba(255,153,92,0.45)",
//   },
//   offerIcon: { fontSize: 14 },
//   offerText: {
//     fontSize: 12,
//     fontWeight: 900,
//     letterSpacing: 1.2,
//     color: "#ff7a22",
//   },

//   h1: {
//     margin: 0,
//     textAlign: "center",
//     fontSize: 44,
//     fontWeight: 900,
//     color: "#0b1220",
//     letterSpacing: -0.6,
//   },
//   tm: { fontWeight: 900 },
//   subTitle: {
//     marginTop: 10,
//     textAlign: "center",
//     fontSize: 14,
//     color: "#6b7280",
//     fontWeight: 600,
//   },

//   sectionLabel: {
//     marginTop: 22,
//     textAlign: "center",
//     fontSize: 12,
//     color: "#94a3b8",
//     fontWeight: 900,
//     letterSpacing: 1.2,
//   },

//   roleRow: {
//     marginTop: 10,
//     display: "flex",
//     justifyContent: "center",
//     gap: 12,
//     flexWrap: "wrap",
//   },
//   roleBtn: {
//     border: "1px solid #e2e8f0",
//     background: "#ffffff",
//     color: "#334155",
//     padding: "10px 16px",
//     borderRadius: 999,
//     fontWeight: 800,
//     cursor: "pointer",
//     minWidth: 130,
//     boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
//   },
//   roleBtnActive: {
//     border: "1px solid rgba(35,110,255,0.35)",
//     background: "linear-gradient(180deg, #2f86ff 0%, #1246ff 100%)",
//     color: "#ffffff",
//     boxShadow: "0 14px 26px rgba(18,70,255,0.30)",
//   },

//   errorBox: {
//     marginTop: 16,
//     background: "#fff1f2",
//     border: "1px solid #fecdd3",
//     color: "#9f1239",
//     padding: 12,
//     borderRadius: 14,
//     fontSize: 14,
//     fontWeight: 700,
//   },

//   form: { marginTop: 18 },

//   grid2: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: 16,
//   },

//   field: { display: "flex", flexDirection: "column" },
//   fieldFull: { display: "flex", flexDirection: "column", marginTop: 14 },

//   label: {
//     fontSize: 12,
//     fontWeight: 900,
//     letterSpacing: 1.1,
//     color: "#94a3b8",
//     marginBottom: 8,
//   },

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

//   phoneWrap: {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     border: "1px solid #e5e7eb",
//     borderRadius: 14,
//     padding: "10px 12px",
//     background: "#ffffff",
//   },
//   ccBox: {
//     minWidth: 54,
//     height: 36,
//     display: "flex",
//     alignItems: "center",
//     justifyContent: "center",
//     borderRadius: 12,
//     border: "1px solid #e5e7eb",
//     background: "#f8fafc",
//     fontWeight: 900,
//     color: "#0b1220",
//   },
//   phoneInput: {
//     flex: 1,
//     border: "none",
//     outline: "none",
//     fontSize: 15,
//     padding: "8px 6px",
//     background: "transparent",
//   },

//   termsRow: {
//     display: "flex",
//     alignItems: "flex-start",
//     gap: 10,
//     marginTop: 14,
//   },
//   checkbox: { width: 16, height: 16, marginTop: 2 },
//   termsText: {
//     fontSize: 12,
//     color: "#64748b",
//     fontWeight: 700,
//     lineHeight: 1.35,
//   },
//   termsLink: { color: "#1d4ed8", fontWeight: 900, textDecoration: "none" },

//   cta: {
//     marginTop: 16,
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
//     opacity: 1,
//   },
//   ctaText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: 900,
//     letterSpacing: 0.2,
//   },
//   ctaArrow: {
//     width: 30,
//     height: 30,
//     borderRadius: 999,
//     display: "inline-flex",
//     alignItems: "center",
//     justifyContent: "center",
//     background: "rgba(255,255,255,0.18)",
//     color: "#ffffff",
//     fontWeight: 900,
//   },

//   badgesRow: {
//     marginTop: 14,
//     display: "flex",
//     justifyContent: "center",
//     gap: 22,
//     flexWrap: "wrap",
//   },
//   badge: { display: "inline-flex", alignItems: "center", gap: 8 },
//   badgeIcon: { fontSize: 14 },
//   badgeText: {
//     fontSize: 12,
//     fontWeight: 900,
//     color: "#94a3b8",
//     letterSpacing: 0.6,
//   },

//   bottomRow: { textAlign: "center", marginTop: 14 },
//   bottomText: { color: "#0b1220", fontWeight: 700 },
//   link: { color: "#1d4ed8", fontWeight: 900, textDecoration: "none" },

//   // ✅ responsive
//   "@media(maxWidth: 760px)": {},
// };




// src/pages/RegisterPage.jsx
// import React, { useMemo, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// export default function RegisterPage() {
//   const navigate = useNavigate();

//   // ✅ NEW (UI only): role + confirm password + terms checkbox
//   const ROLES = ["Property Owner", "Investor", "Buyer", "Agent"];
//   const [role, setRole] = useState("Investor");
//   const [agree, setAgree] = useState(false);

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");

//   // ✅ CHANGED (UI only): split country code + local phone input, but still saves as ONE phone string
//   const [countryCode, setCountryCode] = useState("+971");
//   const [phone, setPhone] = useState("");

//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [passwordVisible, setPasswordVisible] = useState(false);
//   const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const emailPattern = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

//   // ✅ ADDED (UI only): full country code list
//   const COUNTRY_CODES = useMemo(
//     () => [
//       { code: "+93", label: "Afghanistan (+93)" },
//       { code: "+355", label: "Albania (+355)" },
//       { code: "+213", label: "Algeria (+213)" },
//       { code: "+1-684", label: "American Samoa (+1-684)" },
//       { code: "+376", label: "Andorra (+376)" },
//       { code: "+244", label: "Angola (+244)" },
//       { code: "+1-264", label: "Anguilla (+1-264)" },
//       { code: "+672", label: "Antarctica (+672)" },
//       { code: "+1-268", label: "Antigua & Barbuda (+1-268)" },
//       { code: "+54", label: "Argentina (+54)" },
//       { code: "+374", label: "Armenia (+374)" },
//       { code: "+297", label: "Aruba (+297)" },
//       { code: "+61", label: "Australia (+61)" },
//       { code: "+43", label: "Austria (+43)" },
//       { code: "+994", label: "Azerbaijan (+994)" },
//       { code: "+1-242", label: "Bahamas (+1-242)" },
//       { code: "+973", label: "Bahrain (+973)" },
//       { code: "+880", label: "Bangladesh (+880)" },
//       { code: "+1-246", label: "Barbados (+1-246)" },
//       { code: "+375", label: "Belarus (+375)" },
//       { code: "+32", label: "Belgium (+32)" },
//       { code: "+501", label: "Belize (+501)" },
//       { code: "+229", label: "Benin (+229)" },
//       { code: "+1-441", label: "Bermuda (+1-441)" },
//       { code: "+975", label: "Bhutan (+975)" },
//       { code: "+591", label: "Bolivia (+591)" },
//       { code: "+387", label: "Bosnia & Herzegovina (+387)" },
//       { code: "+267", label: "Botswana (+267)" },
//       { code: "+55", label: "Brazil (+55)" },
//       { code: "+246", label: "British Indian Ocean Territory (+246)" },
//       { code: "+1-284", label: "British Virgin Islands (+1-284)" },
//       { code: "+673", label: "Brunei (+673)" },
//       { code: "+359", label: "Bulgaria (+359)" },
//       { code: "+226", label: "Burkina Faso (+226)" },
//       { code: "+257", label: "Burundi (+257)" },
//       { code: "+855", label: "Cambodia (+855)" },
//       { code: "+237", label: "Cameroon (+237)" },
//       { code: "+1", label: "Canada (+1)" },
//       { code: "+238", label: "Cape Verde (+238)" },
//       { code: "+1-345", label: "Cayman Islands (+1-345)" },
//       { code: "+236", label: "Central African Republic (+236)" },
//       { code: "+235", label: "Chad (+235)" },
//       { code: "+56", label: "Chile (+56)" },
//       { code: "+86", label: "China (+86)" },
//       { code: "+57", label: "Colombia (+57)" },
//       { code: "+269", label: "Comoros (+269)" },
//       { code: "+242", label: "Congo - Republic (+242)" },
//       { code: "+243", label: "Congo - DRC (+243)" },
//       { code: "+682", label: "Cook Islands (+682)" },
//       { code: "+506", label: "Costa Rica (+506)" },
//       { code: "+225", label: "Côte d’Ivoire (+225)" },
//       { code: "+385", label: "Croatia (+385)" },
//       { code: "+53", label: "Cuba (+53)" },
//       { code: "+599", label: "Curaçao (+599)" },
//       { code: "+357", label: "Cyprus (+357)" },
//       { code: "+420", label: "Czechia (+420)" },
//       { code: "+45", label: "Denmark (+45)" },
//       { code: "+253", label: "Djibouti (+253)" },
//       { code: "+1-767", label: "Dominica (+1-767)" },
//       { code: "+1-809", label: "Dominican Republic (+1-809)" },
//       { code: "+670", label: "Timor-Leste (+670)" },
//       { code: "+593", label: "Ecuador (+593)" },
//       { code: "+20", label: "Egypt (+20)" },
//       { code: "+503", label: "El Salvador (+503)" },
//       { code: "+240", label: "Equatorial Guinea (+240)" },
//       { code: "+291", label: "Eritrea (+291)" },
//       { code: "+372", label: "Estonia (+372)" },
//       { code: "+268", label: "Eswatini (+268)" },
//       { code: "+251", label: "Ethiopia (+251)" },
//       { code: "+679", label: "Fiji (+679)" },
//       { code: "+358", label: "Finland (+358)" },
//       { code: "+33", label: "France (+33)" },
//       { code: "+220", label: "Gambia (+220)" },
//       { code: "+995", label: "Georgia (+995)" },
//       { code: "+49", label: "Germany (+49)" },
//       { code: "+233", label: "Ghana (+233)" },
//       { code: "+30", label: "Greece (+30)" },
//       { code: "+299", label: "Greenland (+299)" },
//       { code: "+1-473", label: "Grenada (+1-473)" },
//       { code: "+502", label: "Guatemala (+502)" },
//       { code: "+224", label: "Guinea (+224)" },
//       { code: "+245", label: "Guinea-Bissau (+245)" },
//       { code: "+592", label: "Guyana (+592)" },
//       { code: "+509", label: "Haiti (+509)" },
//       { code: "+504", label: "Honduras (+504)" },
//       { code: "+852", label: "Hong Kong (+852)" },
//       { code: "+36", label: "Hungary (+36)" },
//       { code: "+354", label: "Iceland (+354)" },
//       { code: "+91", label: "India (+91)" },
//       { code: "+62", label: "Indonesia (+62)" },
//       { code: "+98", label: "Iran (+98)" },
//       { code: "+964", label: "Iraq (+964)" },
//       { code: "+353", label: "Ireland (+353)" },
//       { code: "+972", label: "Israel (+972)" },
//       { code: "+39", label: "Italy (+39)" },
//       { code: "+1-876", label: "Jamaica (+1-876)" },
//       { code: "+81", label: "Japan (+81)" },
//       { code: "+962", label: "Jordan (+962)" },
//       { code: "+7", label: "Kazakhstan (+7)" },
//       { code: "+254", label: "Kenya (+254)" },
//       { code: "+965", label: "Kuwait (+965)" },
//       { code: "+996", label: "Kyrgyzstan (+996)" },
//       { code: "+856", label: "Laos (+856)" },
//       { code: "+371", label: "Latvia (+371)" },
//       { code: "+961", label: "Lebanon (+961)" },
//       { code: "+218", label: "Libya (+218)" },
//       { code: "+352", label: "Luxembourg (+352)" },
//       { code: "+60", label: "Malaysia (+60)" },
//       { code: "+960", label: "Maldives (+960)" },
//       { code: "+356", label: "Malta (+356)" },
//       { code: "+52", label: "Mexico (+52)" },
//       { code: "+212", label: "Morocco (+212)" },
//       { code: "+95", label: "Myanmar (+95)" },
//       { code: "+977", label: "Nepal (+977)" },
//       { code: "+31", label: "Netherlands (+31)" },
//       { code: "+64", label: "New Zealand (+64)" },
//       { code: "+234", label: "Nigeria (+234)" },
//       { code: "+47", label: "Norway (+47)" },
//       { code: "+968", label: "Oman (+968)" },
//       { code: "+92", label: "Pakistan (+92)" },
//       { code: "+507", label: "Panama (+507)" },
//       { code: "+63", label: "Philippines (+63)" },
//       { code: "+48", label: "Poland (+48)" },
//       { code: "+351", label: "Portugal (+351)" },
//       { code: "+974", label: "Qatar (+974)" },
//       { code: "+40", label: "Romania (+40)" },
//       { code: "+7", label: "Russia (+7)" },
//       { code: "+966", label: "Saudi Arabia (+966)" },
//       { code: "+65", label: "Singapore (+65)" },
//       { code: "+27", label: "South Africa (+27)" },
//       { code: "+82", label: "South Korea (+82)" },
//       { code: "+34", label: "Spain (+34)" },
//       { code: "+94", label: "Sri Lanka (+94)" },
//       { code: "+46", label: "Sweden (+46)" },
//       { code: "+41", label: "Switzerland (+41)" },
//       { code: "+963", label: "Syria (+963)" },
//       { code: "+886", label: "Taiwan (+886)" },
//       { code: "+66", label: "Thailand (+66)" },
//       { code: "+216", label: "Tunisia (+216)" },
//       { code: "+90", label: "Turkey (+90)" },
//       { code: "+380", label: "Ukraine (+380)" },
//       { code: "+971", label: "United Arab Emirates (+971)" },
//       { code: "+44", label: "United Kingdom (+44)" },
//       { code: "+1", label: "United States (+1)" },
//       { code: "+998", label: "Uzbekistan (+998)" },
//       { code: "+58", label: "Venezuela (+58)" },
//       { code: "+84", label: "Vietnam (+84)" },
//       { code: "+967", label: "Yemen (+967)" },
//       { code: "+260", label: "Zambia (+260)" },
//       { code: "+263", label: "Zimbabwe (+263)" },
//     ],
//     []
//   );

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setError(null);

//     // ✅ keep same validations + add confirm + agree + role required
//     if (!role || !name || !email || !password || !confirmPassword || !phone) {
//       setError("Please fill in all fields.");
//       return;
//     }

//     if (!emailPattern.test(email.trim())) {
//       setError("Please enter a valid email address.");
//       return;
//     }

//     if (password.length < 6) {
//       setError("Password must be at least 6 characters.");
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }

//     if (!agree) {
//       setError("Please agree to the Terms of Service and Privacy Policy.");
//       return;
//     }

//     setLoading(true);

//     try {
//       const { data, error: signUpErr } = await supabase.auth.signUp({
//         email: email.trim(),
//         password,
//       });

//       if (signUpErr) throw signUpErr;
//       if (!data?.user) throw new Error("Signup failed. Please try again.");

//       const userId = data.user.id;

//       // ✅ keep same upsert + include role (no other behavior change)
//       const { error: upsertErr } = await supabase.from("users").upsert(
//         {
//           id: userId,
//           role,
//           name: name.trim(),
//           email: email.trim().toLowerCase(),
//           // ✅ only change: store with country code prefix
//           phone: `${countryCode}${phone.trim()}`,
//         },
//         { onConflict: "id" }
//       );

//       if (upsertErr) throw upsertErr;

//       navigate("/login");
//     } catch (err) {
//       setError(err?.message || "Registration failed.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={styles.page}>
//       <div style={styles.card}>
//         <div style={styles.offerPillRow}></div>

//         <h1 style={styles.h1}>
//           <span style={styles.tm}>Registration</span>
//         </h1>

//         <div style={styles.sectionLabel}>I AM A:</div>
//         <div style={styles.roleRow}>
//           {ROLES.map((r) => {
//             const active = r === role;
//             return (
//               <button
//                 key={r}
//                 type="button"
//                 onClick={() => setRole(r)}
//                 aria-pressed={active}
//                 style={{
//                   ...styles.roleBtn,
//                   ...(active ? styles.roleBtnActive : {}),
//                 }}
//               >
//                 {r}
//               </button>
//             );
//           })}
//         </div>

//         {error && <div style={styles.errorBox}>{error}</div>}

//         <form onSubmit={handleRegister} style={styles.form}>
//           <div style={styles.grid2}>
//             <div style={styles.field}>
//               <label style={styles.label}>FULL NAME</label>
//               <input
//                 type="text"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 required
//                 style={styles.input}
//                 placeholder="e.g. Alexander Pierce"
//                 autoComplete="name"
//               />
//             </div>

//             <div style={styles.field}>
//               <label style={styles.label}>EMAIL ADDRESS</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 style={styles.input}
//                 placeholder="alex@venture.com"
//                 autoComplete="email"
//               />
//             </div>
//           </div>

//           <div style={{ ...styles.grid2, marginTop: 8 }}>
//             <div style={styles.field}>
//               <label style={styles.label}>PASSWORD</label>
//               <div style={styles.passwordWrap}>
//                 <input
//                   type={passwordVisible ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   style={{ ...styles.input, paddingRight: 86 }}
//                   placeholder="Create a password"
//                   autoComplete="new-password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setPasswordVisible((v) => !v)}
//                   style={styles.eyeBtn}
//                 >
//                   {passwordVisible ? "Hide" : "Show"}
//                 </button>
//               </div>
//             </div>

//             <div style={styles.field}>
//               <label style={styles.label}>CONFIRM PASSWORD</label>
//               <div style={styles.passwordWrap}>
//                 <input
//                   type={confirmPasswordVisible ? "text" : "password"}
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   required
//                   style={{ ...styles.input, paddingRight: 86 }}
//                   placeholder="Confirm password"
//                   autoComplete="new-password"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setConfirmPasswordVisible((v) => !v)}
//                   style={styles.eyeBtn}
//                 >
//                   {confirmPasswordVisible ? "Hide" : "Show"}
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div style={styles.fieldFull}>
//             <label style={styles.label}>PHONE NUMBER</label>
//             <div style={styles.phoneWrap}>
//               {/* ✅ ONLY UI CHANGE: country code dropdown */}
//               <select
//                 value={countryCode}
//                 onChange={(e) => setCountryCode(e.target.value)}
//                 style={styles.ccSelect}
//               >
//                 {COUNTRY_CODES.map((c) => (
//                   <option key={`${c.code}-${c.label}`} value={c.code.replace(/-/g, "")}>
//                     {c.label}
//                   </option>
//                 ))}
//               </select>

//               <input
//                 type="tel"
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 required
//                 style={styles.phoneInput}
//                 placeholder="50 000 0000"
//                 autoComplete="tel"
//               />
//             </div>
//           </div>

//           <div style={styles.termsRow}>
//             <input
//               id="agree"
//               type="checkbox"
//               checked={agree}
//               onChange={(e) => setAgree(e.target.checked)}
//               style={styles.checkbox}
//             />
//             <label htmlFor="agree" style={styles.termsText}>
//               I AGREE TO THE{" "}
//               <a href="/terms" style={styles.termsLink}>
//                 TERMS OF SERVICE
//               </a>{" "}
//               AND{" "}
//               <a href="/privacy" style={styles.termsLink}>
//                 PRIVACY POLICY
//               </a>
//               .
//             </label>
//           </div>

//           <button type="submit" style={styles.cta} disabled={loading}>
//             <span style={styles.ctaText}>{loading ? "Creating..." : "Create Account"}</span>
//           </button>

//           {/* keep existing flow */}
//           <div style={styles.bottomRow}>
//             <span style={styles.bottomText}>Already have an account?</span>{" "}
//             <Link to="/login" style={styles.link}>
//               Login
//             </Link>
//           </div>
//         </form>
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
//     maxWidth: 760,
//     height: "10%",
//     background: "#ffffff",
//     borderRadius: 26,
//     boxShadow: "0 26px 60px rgba(0,0,0,0.25)",
//     padding: "34px 34px 26px",
//   },

//   offerPillRow: { display: "flex", justifyContent: "center", marginBottom: 14 },
//   offerPill: {
//     display: "inline-flex",
//     alignItems: "center",
//     gap: 8,
//     padding: "8px 14px",
//     borderRadius: 999,
//     background: "#fff2e7",
//     border: "1px solid rgba(255,153,92,0.45)",
//   },
//   offerIcon: { fontSize: 14 },
//   offerText: {
//     fontSize: 12,
//     fontWeight: 900,
//     letterSpacing: 1.2,
//     color: "#ff7a22",
//   },

//   h1: {
//     margin: 0,
//     textAlign: "center",
//     fontSize: 44,
//     fontWeight: 900,
//     color: "#0b1220",
//     letterSpacing: -0.6,
//   },
//   tm: { fontWeight: 900 },
//   subTitle: {
//     marginTop: 10,
//     textAlign: "center",
//     fontSize: 14,
//     color: "#6b7280",
//     fontWeight: 600,
//   },

//   sectionLabel: {
//     marginTop: 22,
//     textAlign: "center",
//     fontSize: 12,
//     color: "#94a3b8",
//     fontWeight: 900,
//     letterSpacing: 1.2,
//   },

//   roleRow: {
//     marginTop: 10,
//     display: "flex",
//     justifyContent: "center",
//     gap: 12,
//     flexWrap: "wrap",
//   },
//   roleBtn: {
//     border: "1px solid #e2e8f0",
//     background: "#ffffff",
//     color: "#334155",
//     padding: "10px 16px",
//     borderRadius: 999,
//     fontWeight: 800,
//     cursor: "pointer",
//     minWidth: 130,
//     boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
//   },
//   roleBtnActive: {
//     border: "1px solid rgba(35,110,255,0.35)",
//     background: "linear-gradient(180deg, #2f86ff 0%, #1246ff 100%)",
//     color: "#ffffff",
//     boxShadow: "0 14px 26px rgba(18,70,255,0.30)",
//   },

//   errorBox: {
//     marginTop: 16,
//     background: "#fff1f2",
//     border: "1px solid #fecdd3",
//     color: "#9f1239",
//     padding: 12,
//     borderRadius: 14,
//     fontSize: 14,
//     fontWeight: 700,
//   },

//   form: { marginTop: 18 },

//   grid2: {
//     display: "grid",
//     gridTemplateColumns: "1fr 1fr",
//     gap: 16,
//   },

//   field: { display: "flex", flexDirection: "column" },
//   fieldFull: { display: "flex", flexDirection: "column", marginTop: 14 },

//   label: {
//     fontSize: 12,
//     fontWeight: 900,
//     letterSpacing: 1.1,
//     color: "#94a3b8",
//     marginBottom: 8,
//   },

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

//   phoneWrap: {
//     display: "flex",
//     alignItems: "center",
//     gap: 10,
//     border: "1px solid #e5e7eb",
//     borderRadius: 14,
//     padding: "10px 12px",
//     background: "#ffffff",
//   },

//   // ✅ added select style (matches old ccBox)
//   ccSelect: {
//     minWidth: 190,
//     height: 36,
//     borderRadius: 12,
//     border: "1px solid #e5e7eb",
//     background: "#f8fafc",
//     fontWeight: 900,
//     color: "#0b1220",
//     outline: "none",
//     padding: "0 10px",
//     cursor: "pointer",
//   },

//   phoneInput: {
//     flex: 1,
//     border: "none",
//     outline: "none",
//     fontSize: 15,
//     padding: "8px 6px",
//     background: "transparent",
//   },

//   termsRow: {
//     display: "flex",
//     alignItems: "flex-start",
//     gap: 10,
//     marginTop: 14,
//   },
//   checkbox: { width: 16, height: 16, marginTop: 2 },
//   termsText: {
//     fontSize: 12,
//     color: "#64748b",
//     fontWeight: 700,
//     lineHeight: 1.35,
//   },
//   termsLink: { color: "#1d4ed8", fontWeight: 900, textDecoration: "none" },

//   cta: {
//     marginTop: 16,
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
//     opacity: 1,
//   },
//   ctaText: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: 900,
//     letterSpacing: 0.2,
//   },

//   bottomRow: { textAlign: "center", marginTop: 14 },
//   bottomText: { color: "#0b1220", fontWeight: 700 },


// src/pages/RegisterPage.jsx
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

  // Password strength calculation
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

      // Redirect after Google sign-in (make sure /dashboard exists)
      const redirectTo = `${window.location.origin}/dashboard`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) throw error;

      // After redirect, user will be in auth.users.
      // IMPORTANT: To guarantee public.users row is created with SAME id,
      // you must have a DB trigger (recommended) OR you must upsert after login (your Login already does sync).
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

      // ✅ Key fix:
      // Many projects have "Email confirmation" ON -> signUp creates auth.users
      // but DOES NOT create a session yet. Then any insert to public.users (RLS) fails.
      // So: upsert ONLY if we have an authenticated session right now.
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

      // ✅ If hasSession is false:
      // - auth.users is created already
      // - public.users should be created by DB trigger (recommended),
      //   OR it will be created on first login because your Login.jsx runs syncPublicUserFromAuth().
      navigate("/login");
    } catch (err) {
      // show the real Supabase error message (this is what you need to debug)
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* ── LEFT PANEL ── */}
      <div style={styles.leftPanel}>
        {/* Dark overlay */}
        <div style={styles.leftOverlay} />

        {/* Content above overlay */}
        <div style={styles.leftContent}>
          {/* Logo */}
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

          {/* Hero text */}
          <div style={styles.heroArea}>
            <h1 style={styles.heroTitle}>Experience the future of property valuation.</h1>
            <p style={styles.heroSub}>
              Access real-time AI insights and institutional-grade data for Dubai's most prestigious real estate assets.
            </p>
          </div>

          {/* Divider */}
          <div style={styles.statDivider} />

          {/* Stats */}
          <div style={styles.statsRow}>
            <div>
              <div style={styles.statNum}>99.2%</div>
              <div style={styles.statLabel}>Valuation Accuracy</div>
            </div>
            <div>
              <div style={styles.statNum}>$12B+</div>
              <div style={styles.statLabel}>Assets Analyzed</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          {/* Header */}
          <h2 style={styles.formTitle}>Create Your ACQAR Account</h2>
          <p style={styles.formSub}>Join Dubai's premier AI-driven property valuation ecosystem.</p>

          {/* Google */}
          <button type="button" style={styles.googleBtn} disabled={loading} onClick={handleGoogleRegister}>
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

          {/* Divider */}
          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>OR REGISTER WITH EMAIL</span>
            <span style={styles.dividerLine} />
          </div>

          {/* Error */}
          {error && <div style={styles.errorBox}>{error}</div>}

          {/* Role selector */}
          <div style={styles.roleSection}>
            <div style={styles.roleLabel}>I am a/an:</div>
            <div style={styles.roleRow}>
              {ROLES.map((r) => {
                const active = r === role;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    aria-pressed={active}
                    style={{
                      ...styles.roleBtn,
                      ...(active ? styles.roleBtnActive : {}),
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister}>
            {/* Full Name */}
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

            {/* Email */}
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

            {/* Password */}
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

              {/* Strength bar */}
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

            {/* Confirm Password */}
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
            </div>

            {/* Phone — hidden in screenshot but keep functionality */}
            <div style={{ ...styles.field, display: "none" }}>
              <label style={styles.label}>PHONE NUMBER</label>
              <div style={styles.phoneWrap}>
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={styles.ccSelect}>
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
                  style={styles.phoneInput}
                  placeholder="50 000 0000"
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Keep phone visible minimal field */}
            <div style={styles.field}>
              <label style={styles.label}>Phone Number</label>
              <div style={styles.phoneRowVisible}>
                <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} style={styles.ccSelectVisible}>
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
                  placeholder="50 000 0000"
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Terms */}
            <div style={styles.termsRow}>
              <input
                id="agree"
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                style={styles.checkbox}
              />
              <label htmlFor="agree" style={styles.termsText}>
                I agree to the <a href="/terms" style={styles.termsLink}>Terms of Service</a> and{" "}
                <a href="/privacy" style={styles.termsLink}>Privacy Policy</a>, including the processing of my property data.
              </label>
            </div>

            {/* CTA */}
            <button
              type="submit"
              style={{
                ...styles.cta,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Account →"}
            </button>
          </form>

          {/* Sign in link */}
          <p style={styles.signinRow}>
            Already have an account? <Link to="/login" style={styles.signinLink}>Sign In</Link>
          </p>

          {/* Bottom badges */}
          <div style={styles.bottomBadges}>
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

const styles = {
  /* ── Page ── */
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "row",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },

  /* ── Left Panel ── */
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
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
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
  logoText: {
    fontSize: 17,
    fontWeight: 800,
    color: "#ffffff",
    letterSpacing: 2.5,
  },
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
  statDivider: {
    height: 1,
    background: "rgba(255,255,255,0.18)",
    marginBottom: 28,
  },
  statsRow: {
    display: "flex",
    gap: 48,
  },
  statNum: {
    fontSize: 26,
    fontWeight: 900,
    color: "#e87722",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.55)",
    marginTop: 4,
    fontWeight: 500,
  },

  /* ── Right Panel ── */
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
  formCard: {
    width: "100%",
    maxWidth: 480,
  },

  formTitle: {
    margin: "0 0 6px",
    fontSize: 26,
    fontWeight: 800,
    color: "#111827",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  formSub: {
    margin: "0 0 22px",
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 1.5,
  },

  /* Google btn */
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
  googleIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    display: "grid",
    placeItems: "center",
  },

  /* Divider */
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "18px 0",
  },
  dividerLine: {
    height: 1,
    background: "#d1d5db",
    flex: 1,
  },
  dividerText: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: 700,
    letterSpacing: 1,
    whiteSpace: "nowrap",
  },

  /* Error */
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

  /* Role */
  roleSection: {
    marginBottom: 18,
  },
  roleLabel: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 10,
  },
  roleRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
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
  roleBtnActive: {
    border: "1.5px solid #e87722",
    background: "#fff8f3",
    color: "#c05e10",
    fontWeight: 700,
  },

  /* Fields */
  field: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 7,
  },
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

  /* Password */
  passwordWrap: {
    position: "relative",
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

  /* Strength */
  strengthArea: {
    marginTop: 8,
  },
  strengthBars: {
    display: "flex",
    gap: 5,
    marginBottom: 6,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    transition: "background 0.2s",
  },
  strengthMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: 0.8,
  },
  strengthHint: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: 500,
  },

  /* Phone */
  phoneRowVisible: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
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

  /* Hidden phone (original) */
  phoneWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "10px 12px",
    background: "#ffffff",
  },
  ccSelect: {
    minWidth: 190,
    height: 36,
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    background: "#f8fafc",
    fontWeight: 900,
    color: "#0b1220",
    outline: "none",
    padding: "0 10px",
    cursor: "pointer",
  },
  phoneInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 15,
    padding: "8px 6px",
    background: "transparent",
  },

  /* Terms */
  termsRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 18,
  },
  checkbox: {
    width: 16,
    height: 16,
    marginTop: 2,
    flexShrink: 0,
    accentColor: "#e87722",
    cursor: "pointer",
  },
  termsText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  termsLink: {
    color: "#e87722",
    fontWeight: 700,
    textDecoration: "none",
  },

  /* CTA */
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

  /* Sign in */
  signinRow: {
    textAlign: "center",
    marginTop: 18,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 500,
  },
  signinLink: {
    color: "#e87722",
    fontWeight: 800,
    textDecoration: "none",
  },

  /* Bottom badges */
  bottomBadges: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 26,
  },
  bottomBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  bottomBadgeText: {
    fontSize: 11,
    fontWeight: 700,
    color: "#9ca3af",
    letterSpacing: 0.6,
  },
  bottomBadgeSep: {
    width: 1,
    height: 14,
    background: "#d1d5db",
  },
};

  link: { color: "#1d4ed8", fontWeight: 900, textDecoration: "none" },
};


