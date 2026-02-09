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
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function RegisterPage() {
  const navigate = useNavigate();

  // ✅ NEW (UI only): role + confirm password + terms checkbox
  const ROLES = ["Property Owner", "Investor", "Buyer", "Agent"];
  const [role, setRole] = useState("Investor");
  const [agree, setAgree] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // ✅ CHANGED (UI only): split country code + local phone input, but still saves as ONE phone string
  const [countryCode, setCountryCode] = useState("+971");
  const [phone, setPhone] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const emailPattern = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  // ✅ ADDED (UI only): full country code list
  const COUNTRY_CODES = useMemo(
    () => [
      { code: "+93", label: "Afghanistan (+93)" },
      { code: "+355", label: "Albania (+355)" },
      { code: "+213", label: "Algeria (+213)" },
      { code: "+1-684", label: "American Samoa (+1-684)" },
      { code: "+376", label: "Andorra (+376)" },
      { code: "+244", label: "Angola (+244)" },
      { code: "+1-264", label: "Anguilla (+1-264)" },
      { code: "+672", label: "Antarctica (+672)" },
      { code: "+1-268", label: "Antigua & Barbuda (+1-268)" },
      { code: "+54", label: "Argentina (+54)" },
      { code: "+374", label: "Armenia (+374)" },
      { code: "+297", label: "Aruba (+297)" },
      { code: "+61", label: "Australia (+61)" },
      { code: "+43", label: "Austria (+43)" },
      { code: "+994", label: "Azerbaijan (+994)" },
      { code: "+1-242", label: "Bahamas (+1-242)" },
      { code: "+973", label: "Bahrain (+973)" },
      { code: "+880", label: "Bangladesh (+880)" },
      { code: "+1-246", label: "Barbados (+1-246)" },
      { code: "+375", label: "Belarus (+375)" },
      { code: "+32", label: "Belgium (+32)" },
      { code: "+501", label: "Belize (+501)" },
      { code: "+229", label: "Benin (+229)" },
      { code: "+1-441", label: "Bermuda (+1-441)" },
      { code: "+975", label: "Bhutan (+975)" },
      { code: "+591", label: "Bolivia (+591)" },
      { code: "+387", label: "Bosnia & Herzegovina (+387)" },
      { code: "+267", label: "Botswana (+267)" },
      { code: "+55", label: "Brazil (+55)" },
      { code: "+246", label: "British Indian Ocean Territory (+246)" },
      { code: "+1-284", label: "British Virgin Islands (+1-284)" },
      { code: "+673", label: "Brunei (+673)" },
      { code: "+359", label: "Bulgaria (+359)" },
      { code: "+226", label: "Burkina Faso (+226)" },
      { code: "+257", label: "Burundi (+257)" },
      { code: "+855", label: "Cambodia (+855)" },
      { code: "+237", label: "Cameroon (+237)" },
      { code: "+1", label: "Canada (+1)" },
      { code: "+238", label: "Cape Verde (+238)" },
      { code: "+1-345", label: "Cayman Islands (+1-345)" },
      { code: "+236", label: "Central African Republic (+236)" },
      { code: "+235", label: "Chad (+235)" },
      { code: "+56", label: "Chile (+56)" },
      { code: "+86", label: "China (+86)" },
      { code: "+57", label: "Colombia (+57)" },
      { code: "+269", label: "Comoros (+269)" },
      { code: "+242", label: "Congo - Republic (+242)" },
      { code: "+243", label: "Congo - DRC (+243)" },
      { code: "+682", label: "Cook Islands (+682)" },
      { code: "+506", label: "Costa Rica (+506)" },
      { code: "+225", label: "Côte d’Ivoire (+225)" },
      { code: "+385", label: "Croatia (+385)" },
      { code: "+53", label: "Cuba (+53)" },
      { code: "+599", label: "Curaçao (+599)" },
      { code: "+357", label: "Cyprus (+357)" },
      { code: "+420", label: "Czechia (+420)" },
      { code: "+45", label: "Denmark (+45)" },
      { code: "+253", label: "Djibouti (+253)" },
      { code: "+1-767", label: "Dominica (+1-767)" },
      { code: "+1-809", label: "Dominican Republic (+1-809)" },
      { code: "+670", label: "Timor-Leste (+670)" },
      { code: "+593", label: "Ecuador (+593)" },
      { code: "+20", label: "Egypt (+20)" },
      { code: "+503", label: "El Salvador (+503)" },
      { code: "+240", label: "Equatorial Guinea (+240)" },
      { code: "+291", label: "Eritrea (+291)" },
      { code: "+372", label: "Estonia (+372)" },
      { code: "+268", label: "Eswatini (+268)" },
      { code: "+251", label: "Ethiopia (+251)" },
      { code: "+679", label: "Fiji (+679)" },
      { code: "+358", label: "Finland (+358)" },
      { code: "+33", label: "France (+33)" },
      { code: "+220", label: "Gambia (+220)" },
      { code: "+995", label: "Georgia (+995)" },
      { code: "+49", label: "Germany (+49)" },
      { code: "+233", label: "Ghana (+233)" },
      { code: "+30", label: "Greece (+30)" },
      { code: "+299", label: "Greenland (+299)" },
      { code: "+1-473", label: "Grenada (+1-473)" },
      { code: "+502", label: "Guatemala (+502)" },
      { code: "+224", label: "Guinea (+224)" },
      { code: "+245", label: "Guinea-Bissau (+245)" },
      { code: "+592", label: "Guyana (+592)" },
      { code: "+509", label: "Haiti (+509)" },
      { code: "+504", label: "Honduras (+504)" },
      { code: "+852", label: "Hong Kong (+852)" },
      { code: "+36", label: "Hungary (+36)" },
      { code: "+354", label: "Iceland (+354)" },
      { code: "+91", label: "India (+91)" },
      { code: "+62", label: "Indonesia (+62)" },
      { code: "+98", label: "Iran (+98)" },
      { code: "+964", label: "Iraq (+964)" },
      { code: "+353", label: "Ireland (+353)" },
      { code: "+972", label: "Israel (+972)" },
      { code: "+39", label: "Italy (+39)" },
      { code: "+1-876", label: "Jamaica (+1-876)" },
      { code: "+81", label: "Japan (+81)" },
      { code: "+962", label: "Jordan (+962)" },
      { code: "+7", label: "Kazakhstan (+7)" },
      { code: "+254", label: "Kenya (+254)" },
      { code: "+965", label: "Kuwait (+965)" },
      { code: "+996", label: "Kyrgyzstan (+996)" },
      { code: "+856", label: "Laos (+856)" },
      { code: "+371", label: "Latvia (+371)" },
      { code: "+961", label: "Lebanon (+961)" },
      { code: "+218", label: "Libya (+218)" },
      { code: "+352", label: "Luxembourg (+352)" },
      { code: "+60", label: "Malaysia (+60)" },
      { code: "+960", label: "Maldives (+960)" },
      { code: "+356", label: "Malta (+356)" },
      { code: "+52", label: "Mexico (+52)" },
      { code: "+212", label: "Morocco (+212)" },
      { code: "+95", label: "Myanmar (+95)" },
      { code: "+977", label: "Nepal (+977)" },
      { code: "+31", label: "Netherlands (+31)" },
      { code: "+64", label: "New Zealand (+64)" },
      { code: "+234", label: "Nigeria (+234)" },
      { code: "+47", label: "Norway (+47)" },
      { code: "+968", label: "Oman (+968)" },
      { code: "+92", label: "Pakistan (+92)" },
      { code: "+507", label: "Panama (+507)" },
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
      { code: "+963", label: "Syria (+963)" },
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    // ✅ keep same validations + add confirm + agree + role required
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
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpErr) throw signUpErr;
      if (!data?.user) throw new Error("Signup failed. Please try again.");

      const userId = data.user.id;

      // ✅ keep same upsert + include role (no other behavior change)
      const { error: upsertErr } = await supabase.from("users").upsert(
        {
          id: userId,
          role,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          // ✅ only change: store with country code prefix
          phone: `${countryCode}${phone.trim()}`,
        },
        { onConflict: "id" }
      );

      if (upsertErr) throw upsertErr;

      navigate("/login");
    } catch (err) {
      setError(err?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.offerPillRow}></div>

        <h1 style={styles.h1}>
          <span style={styles.tm}>Registration</span>
        </h1>

        <div style={styles.sectionLabel}>I AM A:</div>
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

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label}>FULL NAME</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={styles.input}
                placeholder="e.g. Alexander Pierce"
                autoComplete="name"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.input}
                placeholder="alex@venture.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div style={{ ...styles.grid2, marginTop: 8 }}>
            <div style={styles.field}>
              <label style={styles.label}>PASSWORD</label>
              <div style={styles.passwordWrap}>
                <input
                  type={passwordVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ ...styles.input, paddingRight: 86 }}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((v) => !v)}
                  style={styles.eyeBtn}
                >
                  {passwordVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>CONFIRM PASSWORD</label>
              <div style={styles.passwordWrap}>
                <input
                  type={confirmPasswordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ ...styles.input, paddingRight: 86 }}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setConfirmPasswordVisible((v) => !v)}
                  style={styles.eyeBtn}
                >
                  {confirmPasswordVisible ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          <div style={styles.fieldFull}>
            <label style={styles.label}>PHONE NUMBER</label>
            <div style={styles.phoneWrap}>
              {/* ✅ ONLY UI CHANGE: country code dropdown */}
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                style={styles.ccSelect}
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
                style={styles.phoneInput}
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
              I AGREE TO THE{" "}
              <a href="/terms" style={styles.termsLink}>
                TERMS OF SERVICE
              </a>{" "}
              AND{" "}
              <a href="/privacy" style={styles.termsLink}>
                PRIVACY POLICY
              </a>
              .
            </label>
          </div>

          <button type="submit" style={styles.cta} disabled={loading}>
            <span style={styles.ctaText}>{loading ? "Creating..." : "Create Account"}</span>
          </button>

          {/* keep existing flow */}
          <div style={styles.bottomRow}>
            <span style={styles.bottomText}>Already have an account?</span>{" "}
            <Link to="/login" style={styles.link}>
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    background:
      "linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.10)), radial-gradient(1100px 600px at 50% 15%, rgba(255,255,255,0.30), transparent 55%), #7b8794",
  },

  card: {
    width: "50%",
    maxWidth: 760,
    height: "10%",
    background: "#ffffff",
    borderRadius: 26,
    boxShadow: "0 26px 60px rgba(0,0,0,0.25)",
    padding: "34px 34px 26px",
  },

  offerPillRow: { display: "flex", justifyContent: "center", marginBottom: 14 },
  offerPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 14px",
    borderRadius: 999,
    background: "#fff2e7",
    border: "1px solid rgba(255,153,92,0.45)",
  },
  offerIcon: { fontSize: 14 },
  offerText: {
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.2,
    color: "#ff7a22",
  },

  h1: {
    margin: 0,
    textAlign: "center",
    fontSize: 44,
    fontWeight: 900,
    color: "#0b1220",
    letterSpacing: -0.6,
  },
  tm: { fontWeight: 900 },
  subTitle: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 14,
    color: "#6b7280",
    fontWeight: 600,
  },

  sectionLabel: {
    marginTop: 22,
    textAlign: "center",
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: 900,
    letterSpacing: 1.2,
  },

  roleRow: {
    marginTop: 10,
    display: "flex",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  roleBtn: {
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#334155",
    padding: "10px 16px",
    borderRadius: 999,
    fontWeight: 800,
    cursor: "pointer",
    minWidth: 130,
    boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
  },
  roleBtnActive: {
    border: "1px solid rgba(35,110,255,0.35)",
    background: "linear-gradient(180deg, #2f86ff 0%, #1246ff 100%)",
    color: "#ffffff",
    boxShadow: "0 14px 26px rgba(18,70,255,0.30)",
  },

  errorBox: {
    marginTop: 16,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    padding: 12,
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 700,
  },

  form: { marginTop: 18 },

  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },

  field: { display: "flex", flexDirection: "column" },
  fieldFull: { display: "flex", flexDirection: "column", marginTop: 14 },

  label: {
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 1.1,
    color: "#94a3b8",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "14px 14px",
    fontSize: 15,
    outline: "none",
    background: "#ffffff",
    boxShadow: "inset 0 1px 0 rgba(0,0,0,0.02)",
  },

  passwordWrap: { position: "relative" },
  eyeBtn: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: "translateY(-50%)",
    padding: "8px 10px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.06)",
    background: "rgba(15, 23, 42, 0.04)",
    cursor: "pointer",
    fontWeight: 800,
    color: "#1f2a44",
  },

  phoneWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: "10px 12px",
    background: "#ffffff",
  },

  // ✅ added select style (matches old ccBox)
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

  termsRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 14,
  },
  checkbox: { width: 16, height: 16, marginTop: 2 },
  termsText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: 700,
    lineHeight: 1.35,
  },
  termsLink: { color: "#1d4ed8", fontWeight: 900, textDecoration: "none" },

  cta: {
    marginTop: 16,
    width: "100%",
    border: "none",
    cursor: "pointer",
    borderRadius: 999,
    padding: "16px 18px",
    background: "linear-gradient(180deg, #2f86ff 0%, #1246ff 100%)",
    boxShadow: "0 18px 34px rgba(18,70,255,0.32)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    opacity: 1,
  },
  ctaText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: 900,
    letterSpacing: 0.2,
  },

  bottomRow: { textAlign: "center", marginTop: 14 },
  bottomText: { color: "#0b1220", fontWeight: 700 },
  link: { color: "#1d4ed8", fontWeight: 900, textDecoration: "none" },
};

