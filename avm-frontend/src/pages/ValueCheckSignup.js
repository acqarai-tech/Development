// import React, { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import "../styles/valucheck.css";

// const ROLES = ["Owner", "Investor", "Buyer", "Agent"];
// const LS_FORM_KEY = "truvalu_formData_v1";

// const LS_USER_EMAIL = "truvalu_user_email_v1";
// const LS_RESET_SENT = "truvalu_reset_link_sent_v1";
// const LS_VALUCHECK_DRAFT = "truvalu_valucheck_draft_v1";

// const COUNTRY_CODES = [
//   { code: "+93", label: "Afghanistan (+93)" },
//   { code: "+355", label: "Albania (+355)" },
//   { code: "+213", label: "Algeria (+213)" },
//   { code: "+1-684", label: "American Samoa (+1-684)" },
//   { code: "+376", label: "Andorra (+376)" },
//   { code: "+244", label: "Angola (+244)" },
//   { code: "+1-264", label: "Anguilla (+1-264)" },
//   { code: "+672", label: "Antarctica (+672)" },
//   { code: "+1-268", label: "Antigua & Barbuda (+1-268)" },
//   { code: "+54", label: "Argentina (+54)" },
//   { code: "+374", label: "Armenia (+374)" },
//   { code: "+297", label: "Aruba (+297)" },
//   { code: "+61", label: "Australia (+61)" },
//   { code: "+43", label: "Austria (+43)" },
//   { code: "+994", label: "Azerbaijan (+994)" },
//   { code: "+1-242", label: "Bahamas (+1-242)" },
//   { code: "+973", label: "Bahrain (+973)" },
//   { code: "+880", label: "Bangladesh (+880)" },
//   { code: "+1-246", label: "Barbados (+1-246)" },
//   { code: "+375", label: "Belarus (+375)" },
//   { code: "+32", label: "Belgium (+32)" },
//   { code: "+501", label: "Belize (+501)" },
//   { code: "+229", label: "Benin (+229)" },
//   { code: "+1-441", label: "Bermuda (+1-441)" },
//   { code: "+975", label: "Bhutan (+975)" },
//   { code: "+591", label: "Bolivia (+591)" },
//   { code: "+387", label: "Bosnia & Herzegovina (+387)" },
//   { code: "+267", label: "Botswana (+267)" },
//   { code: "+55", label: "Brazil (+55)" },
//   { code: "+246", label: "British Indian Ocean Territory (+246)" },
//   { code: "+1-284", label: "British Virgin Islands (+1-284)" },
//   { code: "+673", label: "Brunei (+673)" },
//   { code: "+359", label: "Bulgaria (+359)" },
//   { code: "+226", label: "Burkina Faso (+226)" },
//   { code: "+257", label: "Burundi (+257)" },
//   { code: "+855", label: "Cambodia (+855)" },
//   { code: "+237", label: "Cameroon (+237)" },
//   { code: "+1", label: "Canada (+1)" },
//   { code: "+238", label: "Cape Verde (+238)" },
//   { code: "+1-345", label: "Cayman Islands (+1-345)" },
//   { code: "+236", label: "Central African Republic (+236)" },
//   { code: "+235", label: "Chad (+235)" },
//   { code: "+56", label: "Chile (+56)" },
//   { code: "+86", label: "China (+86)" },
//   { code: "+61", label: "Christmas Island (+61)" },
//   { code: "+61", label: "Cocos (Keeling) Islands (+61)" },
//   { code: "+57", label: "Colombia (+57)" },
//   { code: "+269", label: "Comoros (+269)" },
//   { code: "+242", label: "Congo - Republic (+242)" },
//   { code: "+243", label: "Congo - DRC (+243)" },
//   { code: "+682", label: "Cook Islands (+682)" },
//   { code: "+506", label: "Costa Rica (+506)" },
//   { code: "+225", label: "Côte d'Ivoire (+225)" },
//   { code: "+385", label: "Croatia (+385)" },
//   { code: "+53", label: "Cuba (+53)" },
//   { code: "+599", label: "Curaçao (+599)" },
//   { code: "+357", label: "Cyprus (+357)" },
//   { code: "+420", label: "Czechia (+420)" },
//   { code: "+45", label: "Denmark (+45)" },
//   { code: "+253", label: "Djibouti (+253)" },
//   { code: "+1-767", label: "Dominica (+1-767)" },
//   { code: "+1-809", label: "Dominican Republic (+1-809)" },
//   { code: "+1-829", label: "Dominican Republic (+1-829)" },
//   { code: "+1-849", label: "Dominican Republic (+1-849)" },
//   { code: "+670", label: "East Timor (Timor-Leste) (+670)" },
//   { code: "+593", label: "Ecuador (+593)" },
//   { code: "+20", label: "Egypt (+20)" },
//   { code: "+503", label: "El Salvador (+503)" },
//   { code: "+240", label: "Equatorial Guinea (+240)" },
//   { code: "+291", label: "Eritrea (+291)" },
//   { code: "+372", label: "Estonia (+372)" },
//   { code: "+268", label: "Eswatini (+268)" },
//   { code: "+251", label: "Ethiopia (+251)" },
//   { code: "+500", label: "Falkland Islands (+500)" },
//   { code: "+298", label: "Faroe Islands (+298)" },
//   { code: "+679", label: "Fiji (+679)" },
//   { code: "+358", label: "Finland (+358)" },
//   { code: "+33", label: "France (+33)" },
//   { code: "+594", label: "French Guiana (+594)" },
//   { code: "+689", label: "French Polynesia (+689)" },
//   { code: "+241", label: "Gabon (+241)" },
//   { code: "+220", label: "Gambia (+220)" },
//   { code: "+995", label: "Georgia (+995)" },
//   { code: "+49", label: "Germany (+49)" },
//   { code: "+233", label: "Ghana (+233)" },
//   { code: "+350", label: "Gibraltar (+350)" },
//   { code: "+30", label: "Greece (+30)" },
//   { code: "+299", label: "Greenland (+299)" },
//   { code: "+1-473", label: "Grenada (+1-473)" },
//   { code: "+590", label: "Guadeloupe (+590)" },
//   { code: "+1-671", label: "Guam (+1-671)" },
//   { code: "+502", label: "Guatemala (+502)" },
//   { code: "+44-1481", label: "Guernsey (+44-1481)" },
//   { code: "+224", label: "Guinea (+224)" },
//   { code: "+245", label: "Guinea-Bissau (+245)" },
//   { code: "+592", label: "Guyana (+592)" },
//   { code: "+509", label: "Haiti (+509)" },
//   { code: "+504", label: "Honduras (+504)" },
//   { code: "+852", label: "Hong Kong (+852)" },
//   { code: "+36", label: "Hungary (+36)" },
//   { code: "+354", label: "Iceland (+354)" },
//   { code: "+91", label: "India (+91)" },
//   { code: "+62", label: "Indonesia (+62)" },
//   { code: "+98", label: "Iran (+98)" },
//   { code: "+964", label: "Iraq (+964)" },
//   { code: "+353", label: "Ireland (+353)" },
//   { code: "+44-1624", label: "Isle of Man (+44-1624)" },
//   { code: "+972", label: "Israel (+972)" },
//   { code: "+39", label: "Italy (+39)" },
//   { code: "+1-876", label: "Jamaica (+1-876)" },
//   { code: "+81", label: "Japan (+81)" },
//   { code: "+44-1534", label: "Jersey (+44-1534)" },
//   { code: "+962", label: "Jordan (+962)" },
//   { code: "+7", label: "Kazakhstan (+7)" },
//   { code: "+254", label: "Kenya (+254)" },
//   { code: "+686", label: "Kiribati (+686)" },
//   { code: "+383", label: "Kosovo (+383)" },
//   { code: "+965", label: "Kuwait (+965)" },
//   { code: "+996", label: "Kyrgyzstan (+996)" },
//   { code: "+856", label: "Laos (+856)" },
//   { code: "+371", label: "Latvia (+371)" },
//   { code: "+961", label: "Lebanon (+961)" },
//   { code: "+266", label: "Lesotho (+266)" },
//   { code: "+231", label: "Liberia (+231)" },
//   { code: "+218", label: "Libya (+218)" },
//   { code: "+423", label: "Liechtenstein (+423)" },
//   { code: "+370", label: "Lithuania (+370)" },
//   { code: "+352", label: "Luxembourg (+352)" },
//   { code: "+853", label: "Macau (+853)" },
//   { code: "+389", label: "North Macedonia (+389)" },
//   { code: "+261", label: "Madagascar (+261)" },
//   { code: "+265", label: "Malawi (+265)" },
//   { code: "+60", label: "Malaysia (+60)" },
//   { code: "+960", label: "Maldives (+960)" },
//   { code: "+223", label: "Mali (+223)" },
//   { code: "+356", label: "Malta (+356)" },
//   { code: "+692", label: "Marshall Islands (+692)" },
//   { code: "+596", label: "Martinique (+596)" },
//   { code: "+222", label: "Mauritania (+222)" },
//   { code: "+230", label: "Mauritius (+230)" },
//   { code: "+262", label: "Mayotte (+262)" },
//   { code: "+52", label: "Mexico (+52)" },
//   { code: "+691", label: "Micronesia (+691)" },
//   { code: "+373", label: "Moldova (+373)" },
//   { code: "+377", label: "Monaco (+377)" },
//   { code: "+976", label: "Mongolia (+976)" },
//   { code: "+382", label: "Montenegro (+382)" },
//   { code: "+1-664", label: "Montserrat (+1-664)" },
//   { code: "+212", label: "Morocco (+212)" },
//   { code: "+258", label: "Mozambique (+258)" },
//   { code: "+95", label: "Myanmar (+95)" },
//   { code: "+264", label: "Namibia (+264)" },
//   { code: "+674", label: "Nauru (+674)" },
//   { code: "+977", label: "Nepal (+977)" },
//   { code: "+31", label: "Netherlands (+31)" },
//   { code: "+687", label: "New Caledonia (+687)" },
//   { code: "+64", label: "New Zealand (+64)" },
//   { code: "+505", label: "Nicaragua (+505)" },
//   { code: "+227", label: "Niger (+227)" },
//   { code: "+234", label: "Nigeria (+234)" },
//   { code: "+683", label: "Niue (+683)" },
//   { code: "+850", label: "North Korea (+850)" },
//   { code: "+1-670", label: "Northern Mariana Islands (+1-670)" },
//   { code: "+47", label: "Norway (+47)" },
//   { code: "+968", label: "Oman (+968)" },
//   { code: "+92", label: "Pakistan (+92)" },
//   { code: "+680", label: "Palau (+680)" },
//   { code: "+970", label: "Palestine (+970)" },
//   { code: "+507", label: "Panama (+507)" },
//   { code: "+675", label: "Papua New Guinea (+675)" },
//   { code: "+595", label: "Paraguay (+595)" },
//   { code: "+51", label: "Peru (+51)" },
//   { code: "+63", label: "Philippines (+63)" },
//   { code: "+48", label: "Poland (+48)" },
//   { code: "+351", label: "Portugal (+351)" },
//   { code: "+1-787", label: "Puerto Rico (+1-787)" },
//   { code: "+1-939", label: "Puerto Rico (+1-939)" },
//   { code: "+974", label: "Qatar (+974)" },
//   { code: "+262", label: "Réunion (+262)" },
//   { code: "+40", label: "Romania (+40)" },
//   { code: "+7", label: "Russia (+7)" },
//   { code: "+250", label: "Rwanda (+250)" },
//   { code: "+590", label: "Saint Barthélemy (+590)" },
//   { code: "+290", label: "Saint Helena (+290)" },
//   { code: "+1-869", label: "Saint Kitts & Nevis (+1-869)" },
//   { code: "+1-758", label: "Saint Lucia (+1-758)" },
//   { code: "+590", label: "Saint Martin (+590)" },
//   { code: "+508", label: "Saint Pierre & Miquelon (+508)" },
//   { code: "+1-784", label: "Saint Vincent & the Grenadines (+1-784)" },
//   { code: "+685", label: "Samoa (+685)" },
//   { code: "+378", label: "San Marino (+378)" },
//   { code: "+239", label: "São Tomé & Príncipe (+239)" },
//   { code: "+966", label: "Saudi Arabia (+966)" },
//   { code: "+221", label: "Senegal (+221)" },
//   { code: "+381", label: "Serbia (+381)" },
//   { code: "+248", label: "Seychelles (+248)" },
//   { code: "+232", label: "Sierra Leone (+232)" },
//   { code: "+65", label: "Singapore (+65)" },
//   { code: "+1-721", label: "Sint Maarten (+1-721)" },
//   { code: "+421", label: "Slovakia (+421)" },
//   { code: "+386", label: "Slovenia (+386)" },
//   { code: "+677", label: "Solomon Islands (+677)" },
//   { code: "+252", label: "Somalia (+252)" },
//   { code: "+27", label: "South Africa (+27)" },
//   { code: "+82", label: "South Korea (+82)" },
//   { code: "+211", label: "South Sudan (+211)" },
//   { code: "+34", label: "Spain (+34)" },
//   { code: "+94", label: "Sri Lanka (+94)" },
//   { code: "+249", label: "Sudan (+249)" },
//   { code: "+597", label: "Suriname (+597)" },
//   { code: "+46", label: "Sweden (+46)" },
//   { code: "+41", label: "Switzerland (+41)" },
//   { code: "+963", label: "Syria (+963)" },
//   { code: "+886", label: "Taiwan (+886)" },
//   { code: "+992", label: "Tajikistan (+992)" },
//   { code: "+255", label: "Tanzania (+255)" },
//   { code: "+66", label: "Thailand (+66)" },
//   { code: "+228", label: "Togo (+228)" },
//   { code: "+690", label: "Tokelau (+690)" },
//   { code: "+676", label: "Tonga (+676)" },
//   { code: "+1-868", label: "Trinidad & Tobago (+1-868)" },
//   { code: "+216", label: "Tunisia (+216)" },
//   { code: "+90", label: "Turkey (+90)" },
//   { code: "+993", label: "Turkmenistan (+993)" },
//   { code: "+1-649", label: "Turks & Caicos Islands (+1-649)" },
//   { code: "+688", label: "Tuvalu (+688)" },
//   { code: "+1-340", label: "U.S. Virgin Islands (+1-340)" },
//   { code: "+256", label: "Uganda (+256)" },
//   { code: "+380", label: "Ukraine (+380)" },
//   { code: "+971", label: "United Arab Emirates (+971)" },
//   { code: "+44", label: "United Kingdom (+44)" },
//   { code: "+1", label: "United States (+1)" },
//   { code: "+598", label: "Uruguay (+598)" },
//   { code: "+998", label: "Uzbekistan (+998)" },
//   { code: "+678", label: "Vanuatu (+678)" },
//   { code: "+379", label: "Vatican City (+379)" },
//   { code: "+58", label: "Venezuela (+58)" },
//   { code: "+84", label: "Vietnam (+84)" },
//   { code: "+681", label: "Wallis & Futuna (+681)" },
//   { code: "+212", label: "Western Sahara (+212)" },
//   { code: "+967", label: "Yemen (+967)" },
//   { code: "+260", label: "Zambia (+260)" },
//   { code: "+263", label: "Zimbabwe (+263)" },
// ];

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

// function formatUaePhone(value) {
//   const digits = (value || "").replace(/[^\d]/g, "").slice(0, 9);
//   if (!digits) return "";
//   if (digits.length <= 2) return digits;
//   if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
//   return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
// }

// export default function ValuCheckSignup() {
//   const navigate = useNavigate();

//   const [role, setRole] = useState("Owner");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [countryCode, setCountryCode] = useState("+971");
//   const [phone, setPhone] = useState("");
//   const [agree, setAgree] = useState(false);

//   const [loading, setLoading] = useState(false);
//   const [status, setStatus] = useState({ type: "", msg: "" });

//   const cleanedPhone = useMemo(() => {
//     const local = (phone || "").replace(/[^\d]/g, "");
//     if (!local) return "";
//     return `${countryCode}${local}`;
//   }, [phone, countryCode]);

//   function validate() {
//     if (!role) return "Please select a role.";
//     if (!name.trim()) return "Please enter your full name.";
//     if (!email.trim()) return "Please enter your email.";
//     if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Please enter a valid email.";
//     if (!phone.trim()) return "Please enter your phone number.";
//     if ((phone || "").replace(/[^\d]/g, "").length < 7) return "Phone number looks too short.";
//     if (!agree) return "Please agree to the Terms of Service and Privacy Policy.";
//     return "";
//   }

//   async function sendOtp() {
//     setStatus({ type: "", msg: "" });

//     const err = validate();
//     if (err) {
//       setStatus({ type: "error", msg: err });
//       return;
//     }

//     setLoading(true);
//     try {
//       const targetEmail = email.trim().toLowerCase();

//       const { error } = await supabase.auth.signInWithOtp({
//         email: targetEmail,
//         options: { shouldCreateUser: true },
//       });

//       if (error) throw error;

//       // Save form data to localStorage
//       const draftData = {
//         role,
//         name: name.trim(),
//         email: targetEmail,
//         phone: cleanedPhone || null,
//       };
//       localStorage.setItem(LS_VALUCHECK_DRAFT, JSON.stringify(draftData));
//       localStorage.setItem(LS_USER_EMAIL, targetEmail);

//       // Navigate to OTP page
//       navigate("/valucheck-otp");
//     } catch (ex) {
//       setStatus({ type: "error", msg: ex?.message || "Could not send OTP. Please try again." });
//       console.error("OTP send error:", ex);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function onSubmit(e) {
//     e.preventDefault();
//     return sendOtp();
//   }

//   return (
//     <div className="valucheck-wrapper">
//       <div className="valucheck-backdrop" />

//       <div className="valucheck-modal">
//         <div className="valucheck-badge">
//           <span className="valucheck-badge-icon">🎉</span>
//           <span className="valucheck-badge-text">EARLY CUSTOMER OFFER</span>
//         </div>

//         <h1 className="valucheck-title">Get Your Free ValuCheck™ Report</h1>
//         <p className="valucheck-subtitle">Join 5,000+ investors getting institutional-grade property insights.</p>

//         <form className="valucheck-form" onSubmit={onSubmit}>
//           <div className="valucheck-section-label">I AM A:</div>

//           <div className="valucheck-roles">
//             {ROLES.map((r) => {
//               const active = r === role;
//               return (
//                 <button
//                   key={r}
//                   type="button"
//                   className={`valucheck-role-btn ${active ? "active" : ""}`}
//                   onClick={() => setRole(r)}
//                   disabled={loading}
//                 >
//                   {r}
//                 </button>
//               );
//             })}
//           </div>

//           <div className="valucheck-row">
//             <div className="valucheck-field">
//               <label className="valucheck-label">FULL NAME</label>
//               <input
//                 className="valucheck-input"
//                 placeholder="John Doe"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 autoComplete="name"
//                 disabled={loading}
//               />
//             </div>

//             <div className="valucheck-field">
//               <label className="valucheck-label">EMAIL ADDRESS</label>
//               <input
//                 className="valucheck-input"
//                 placeholder="john@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 autoComplete="email"
//                 disabled={loading}
//               />
//             </div>
//           </div>

//           <div className="valucheck-field">
//             <label className="valucheck-label">PHONE NUMBER</label>
//             <div className="valucheck-phone-group">
//               <select
//                 className="valucheck-country-code"
//                 value={countryCode}
//                 onChange={(e) => setCountryCode(e.target.value)}
//                 disabled={loading}
//               >
//                 {COUNTRY_CODES.map((c) => (
//                   <option key={`${c.label}-${c.code}`} value={c.code.replace("-", "")}>
//                     {c.code}
//                   </option>
//                 ))}
//               </select>

//               <input
//                 className="valucheck-input valucheck-phone-input"
//                 placeholder="50 000 0000"
//                 value={phone}
//                 onChange={(e) => setPhone(formatUaePhone(e.target.value))}
//                 inputMode="numeric"
//                 autoComplete="tel"
//                 disabled={loading}
//               />
//             </div>
//           </div>

//           <label className="valucheck-checkbox">
//             <input
//               type="checkbox"
//               checked={agree}
//               onChange={(e) => setAgree(e.target.checked)}
//               disabled={loading}
//             />
//             <span>
//               I agree to the{" "}
//               <a href="/terms" className="valucheck-link">
//                 Terms of Service
//               </a>{" "}
//               and{" "}
//               <a href="/privacy" className="valucheck-link">
//                 Privacy Policy
//               </a>
//               . ACQAR may contact me regarding property insights.
//             </span>
//           </label>

//           {status.msg ? (
//             <div className={`valucheck-message ${status.type === "error" ? "error" : "success"}`}>
//               {status.msg}
//             </div>
//           ) : null}

//           <button className="valucheck-cta" type="submit" disabled={loading}>
//             <span>
//               {loading ? "Please wait..." : "Get Free ValuCheck™ Report"}
//             </span>
//             <span className="valucheck-arrow">→</span>
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }



import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { trackEvent } from "../analytics";
import "../styles/valucheck.css";

const ROLES = ["Owner", "Investor", "Buyer", "Agent"];
const LS_FORM_KEY = "truvalu_formData_v1";

const LS_USER_EMAIL = "truvalu_user_email_v1";
const LS_RESET_SENT = "truvalu_reset_link_sent_v1";
const LS_VALUCHECK_DRAFT = "truvalu_valucheck_draft_v1";

const COUNTRY_CODES = [
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
  { code: "+61", label: "Christmas Island (+61)" },
  { code: "+61", label: "Cocos (Keeling) Islands (+61)" },
  { code: "+57", label: "Colombia (+57)" },
  { code: "+269", label: "Comoros (+269)" },
  { code: "+242", label: "Congo - Republic (+242)" },
  { code: "+243", label: "Congo - DRC (+243)" },
  { code: "+682", label: "Cook Islands (+682)" },
  { code: "+506", label: "Costa Rica (+506)" },
  { code: "+225", label: "Côte d'Ivoire (+225)" },
  { code: "+385", label: "Croatia (+385)" },
  { code: "+53", label: "Cuba (+53)" },
  { code: "+599", label: "Curaçao (+599)" },
  { code: "+357", label: "Cyprus (+357)" },
  { code: "+420", label: "Czechia (+420)" },
  { code: "+45", label: "Denmark (+45)" },
  { code: "+253", label: "Djibouti (+253)" },
  { code: "+1-767", label: "Dominica (+1-767)" },
  { code: "+1-809", label: "Dominican Republic (+1-809)" },
  { code: "+1-829", label: "Dominican Republic (+1-829)" },
  { code: "+1-849", label: "Dominican Republic (+1-849)" },
  { code: "+670", label: "East Timor (Timor-Leste) (+670)" },
  { code: "+593", label: "Ecuador (+593)" },
  { code: "+20", label: "Egypt (+20)" },
  { code: "+503", label: "El Salvador (+503)" },
  { code: "+240", label: "Equatorial Guinea (+240)" },
  { code: "+291", label: "Eritrea (+291)" },
  { code: "+372", label: "Estonia (+372)" },
  { code: "+268", label: "Eswatini (+268)" },
  { code: "+251", label: "Ethiopia (+251)" },
  { code: "+500", label: "Falkland Islands (+500)" },
  { code: "+298", label: "Faroe Islands (+298)" },
  { code: "+679", label: "Fiji (+679)" },
  { code: "+358", label: "Finland (+358)" },
  { code: "+33", label: "France (+33)" },
  { code: "+594", label: "French Guiana (+594)" },
  { code: "+689", label: "French Polynesia (+689)" },
  { code: "+241", label: "Gabon (+241)" },
  { code: "+220", label: "Gambia (+220)" },
  { code: "+995", label: "Georgia (+995)" },
  { code: "+49", label: "Germany (+49)" },
  { code: "+233", label: "Ghana (+233)" },
  { code: "+350", label: "Gibraltar (+350)" },
  { code: "+30", label: "Greece (+30)" },
  { code: "+299", label: "Greenland (+299)" },
  { code: "+1-473", label: "Grenada (+1-473)" },
  { code: "+590", label: "Guadeloupe (+590)" },
  { code: "+1-671", label: "Guam (+1-671)" },
  { code: "+502", label: "Guatemala (+502)" },
  { code: "+44-1481", label: "Guernsey (+44-1481)" },
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
  { code: "+44-1624", label: "Isle of Man (+44-1624)" },
  { code: "+972", label: "Israel (+972)" },
  { code: "+39", label: "Italy (+39)" },
  { code: "+1-876", label: "Jamaica (+1-876)" },
  { code: "+81", label: "Japan (+81)" },
  { code: "+44-1534", label: "Jersey (+44-1534)" },
  { code: "+962", label: "Jordan (+962)" },
  { code: "+7", label: "Kazakhstan (+7)" },
  { code: "+254", label: "Kenya (+254)" },
  { code: "+686", label: "Kiribati (+686)" },
  { code: "+383", label: "Kosovo (+383)" },
  { code: "+965", label: "Kuwait (+965)" },
  { code: "+996", label: "Kyrgyzstan (+996)" },
  { code: "+856", label: "Laos (+856)" },
  { code: "+371", label: "Latvia (+371)" },
  { code: "+961", label: "Lebanon (+961)" },
  { code: "+266", label: "Lesotho (+266)" },
  { code: "+231", label: "Liberia (+231)" },
  { code: "+218", label: "Libya (+218)" },
  { code: "+423", label: "Liechtenstein (+423)" },
  { code: "+370", label: "Lithuania (+370)" },
  { code: "+352", label: "Luxembourg (+352)" },
  { code: "+853", label: "Macau (+853)" },
  { code: "+389", label: "North Macedonia (+389)" },
  { code: "+261", label: "Madagascar (+261)" },
  { code: "+265", label: "Malawi (+265)" },
  { code: "+60", label: "Malaysia (+60)" },
  { code: "+960", label: "Maldives (+960)" },
  { code: "+223", label: "Mali (+223)" },
  { code: "+356", label: "Malta (+356)" },
  { code: "+692", label: "Marshall Islands (+692)" },
  { code: "+596", label: "Martinique (+596)" },
  { code: "+222", label: "Mauritania (+222)" },
  { code: "+230", label: "Mauritius (+230)" },
  { code: "+262", label: "Mayotte (+262)" },
  { code: "+52", label: "Mexico (+52)" },
  { code: "+691", label: "Micronesia (+691)" },
  { code: "+373", label: "Moldova (+373)" },
  { code: "+377", label: "Monaco (+377)" },
  { code: "+976", label: "Mongolia (+976)" },
  { code: "+382", label: "Montenegro (+382)" },
  { code: "+1-664", label: "Montserrat (+1-664)" },
  { code: "+212", label: "Morocco (+212)" },
  { code: "+258", label: "Mozambique (+258)" },
  { code: "+95", label: "Myanmar (+95)" },
  { code: "+264", label: "Namibia (+264)" },
  { code: "+674", label: "Nauru (+674)" },
  { code: "+977", label: "Nepal (+977)" },
  { code: "+31", label: "Netherlands (+31)" },
  { code: "+687", label: "New Caledonia (+687)" },
  { code: "+64", label: "New Zealand (+64)" },
  { code: "+505", label: "Nicaragua (+505)" },
  { code: "+227", label: "Niger (+227)" },
  { code: "+234", label: "Nigeria (+234)" },
  { code: "+683", label: "Niue (+683)" },
  { code: "+850", label: "North Korea (+850)" },
  { code: "+1-670", label: "Northern Mariana Islands (+1-670)" },
  { code: "+47", label: "Norway (+47)" },
  { code: "+968", label: "Oman (+968)" },
  { code: "+92", label: "Pakistan (+92)" },
  { code: "+680", label: "Palau (+680)" },
  { code: "+970", label: "Palestine (+970)" },
  { code: "+507", label: "Panama (+507)" },
  { code: "+675", label: "Papua New Guinea (+675)" },
  { code: "+595", label: "Paraguay (+595)" },
  { code: "+51", label: "Peru (+51)" },
  { code: "+63", label: "Philippines (+63)" },
  { code: "+48", label: "Poland (+48)" },
  { code: "+351", label: "Portugal (+351)" },
  { code: "+1-787", label: "Puerto Rico (+1-787)" },
  { code: "+1-939", label: "Puerto Rico (+1-939)" },
  { code: "+974", label: "Qatar (+974)" },
  { code: "+262", label: "Réunion (+262)" },
  { code: "+40", label: "Romania (+40)" },
  { code: "+7", label: "Russia (+7)" },
  { code: "+250", label: "Rwanda (+250)" },
  { code: "+590", label: "Saint Barthélemy (+590)" },
  { code: "+290", label: "Saint Helena (+290)" },
  { code: "+1-869", label: "Saint Kitts & Nevis (+1-869)" },
  { code: "+1-758", label: "Saint Lucia (+1-758)" },
  { code: "+590", label: "Saint Martin (+590)" },
  { code: "+508", label: "Saint Pierre & Miquelon (+508)" },
  { code: "+1-784", label: "Saint Vincent & the Grenadines (+1-784)" },
  { code: "+685", label: "Samoa (+685)" },
  { code: "+378", label: "San Marino (+378)" },
  { code: "+239", label: "São Tomé & Príncipe (+239)" },
  { code: "+966", label: "Saudi Arabia (+966)" },
  { code: "+221", label: "Senegal (+221)" },
  { code: "+381", label: "Serbia (+381)" },
  { code: "+248", label: "Seychelles (+248)" },
  { code: "+232", label: "Sierra Leone (+232)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+1-721", label: "Sint Maarten (+1-721)" },
  { code: "+421", label: "Slovakia (+421)" },
  { code: "+386", label: "Slovenia (+386)" },
  { code: "+677", label: "Solomon Islands (+677)" },
  { code: "+252", label: "Somalia (+252)" },
  { code: "+27", label: "South Africa (+27)" },
  { code: "+82", label: "South Korea (+82)" },
  { code: "+211", label: "South Sudan (+211)" },
  { code: "+34", label: "Spain (+34)" },
  { code: "+94", label: "Sri Lanka (+94)" },
  { code: "+249", label: "Sudan (+249)" },
  { code: "+597", label: "Suriname (+597)" },
  { code: "+46", label: "Sweden (+46)" },
  { code: "+41", label: "Switzerland (+41)" },
  { code: "+963", label: "Syria (+963)" },
  { code: "+886", label: "Taiwan (+886)" },
  { code: "+992", label: "Tajikistan (+992)" },
  { code: "+255", label: "Tanzania (+255)" },
  { code: "+66", label: "Thailand (+66)" },
  { code: "+228", label: "Togo (+228)" },
  { code: "+690", label: "Tokelau (+690)" },
  { code: "+676", label: "Tonga (+676)" },
  { code: "+1-868", label: "Trinidad & Tobago (+1-868)" },
  { code: "+216", label: "Tunisia (+216)" },
  { code: "+90", label: "Turkey (+90)" },
  { code: "+993", label: "Turkmenistan (+993)" },
  { code: "+1-649", label: "Turks & Caicos Islands (+1-649)" },
  { code: "+688", label: "Tuvalu (+688)" },
  { code: "+1-340", label: "U.S. Virgin Islands (+1-340)" },
  { code: "+256", label: "Uganda (+256)" },
  { code: "+380", label: "Ukraine (+380)" },
  { code: "+971", label: "United Arab Emirates (+971)" },
  { code: "+44", label: "United Kingdom (+44)" },
  { code: "+1", label: "United States (+1)" },
  { code: "+598", label: "Uruguay (+598)" },
  { code: "+998", label: "Uzbekistan (+998)" },
  { code: "+678", label: "Vanuatu (+678)" },
  { code: "+379", label: "Vatican City (+379)" },
  { code: "+58", label: "Venezuela (+58)" },
  { code: "+84", label: "Vietnam (+84)" },
  { code: "+681", label: "Wallis & Futuna (+681)" },
  { code: "+212", label: "Western Sahara (+212)" },
  { code: "+967", label: "Yemen (+967)" },
  { code: "+260", label: "Zambia (+260)" },
  { code: "+263", label: "Zimbabwe (+263)" },
];

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

function formatUaePhone(value) {
  const digits = (value || "").replace(/[^\d]/g, "").slice(0, 9);
  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

/* ──────────────────────────────────────
   HEADER
────────────────────────────────────── */
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
            onClick={() => {
              trackEvent("ValuCheckSignup", "Click", "Header Logo");
              navigate("/");
            }}
          >
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter text-[#2B2B2B] uppercase whitespace-nowrap">
              ACQAR
            </h1>
          </div>

          {/* Mobile pricing */}
          <button
            onClick={() => {
              trackEvent("ValuCheckSignup", "Click", "Header Pricing (Mobile)");
              navigate("/pricing");
            }}
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
                onClick={() => {
                  trackEvent("ValuCheckSignup", "Click", `Header Nav - ${item.label}`);
                  navigate(item.path);
                }}
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
            <button
              onClick={() => {
                trackEvent("ValuCheckSignup", "Click", "Header Sign In");
                navigate("/login");
              }}
              className="bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
            >
              Sign In
            </button>

            <button
              onClick={() => {
                trackEvent("ValuCheckSignup", "Click", "Header Get Started");
                navigate("/valuation");
              }}
              className="hidden md:inline-flex hdrCta bg-[#B87333] text-white px-4 sm:px-6 py-2.5 rounded-md text-[11px] sm:text-sm font-bold tracking-wide hover:bg-[#a6682e] hover:shadow-lg active:scale-95 whitespace-nowrap"
            >
              Get Started
            </button>
          </div>

        </div>

        {/* Mobile spacing tweaks */}
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

      <div className="h-20" />
    </>
  );
}

/* ──────────────────────────────────────
   FOOTER
────────────────────────────────────── */
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
    [
      "COMPANY",
      ["About ACQAR", "How It Works", "Pricing", "Contact Us", "Partners", "Press Kit"],
    ],
    [
      "RESOURCES",
      ["Help Center", "Market Reports", "Blog Column 5", "Comparisons"],
    ],
    [
      "COMPARISONS",
      ["vs Bayut TruEstimate", "vs Property Finder", "vs Traditional Valuers", "Why ACQAR?"],
    ],
  ];

  return (
    <>
      <style>{`
        .acq-footer {
          background: #F9F9F9;
          border-top: 1px solid #EBEBEB;
          padding: 56px 0 0;
          font-family: 'Inter', sans-serif;
        }

        .acq-footer-grid {
          max-width: 80rem;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1.35fr 1fr 1fr 1fr 1fr;
          gap: 48px;
          align-items: start;
          padding-bottom: 48px;
        }

        .acq-brand-name {
          font-size: 1rem;
          font-weight: 900;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #2B2B2B;
          display: block;
          margin-bottom: 14px;
        }
        .acq-brand-desc {
          font-size: 0.75rem;
          color: rgba(43,43,43,0.58);
          line-height: 1.75;
          margin: 0 0 18px;
          max-width: 240px;
        }
        .acq-rics-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 12px;
          background: #fff;
          border: 1px solid #EBEBEB;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .acq-rics-badge svg { flex-shrink: 0; color: #2B2B2B; }
        .acq-rics-badge span {
          font-size: 0.5625rem;
          font-weight: 800;
          color: rgba(43,43,43,0.82);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          white-space: nowrap;
        }
        .acq-social-row { display: flex; gap: 10px; }
        .acq-social-btn {
          width: 34px; height: 34px;
          border-radius: 50%;
          border: 1px solid #E5E7EB;
          display: flex; align-items: center; justify-content: center;
          color: rgba(43,43,43,0.38);
          text-decoration: none;
          transition: color 0.18s, border-color 0.18s;
          background: transparent;
          cursor: pointer;
        }
        .acq-social-btn:hover { color: #B87333; border-color: #B87333; }

        .acq-col-title {
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: #2B2B2B;
          margin: 0 0 20px;
        }
        .acq-link-list {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 13px;
        }
        .acq-link-item {
          font-size: 0.8125rem;
          color: rgba(43,43,43,0.55);
          font-weight: 400;
          cursor: pointer;
          transition: color 0.16s;
          line-height: 1.4;
        }
        .acq-link-item:hover { color: #B87333; }

        .acq-divider {
          max-width: 80rem;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .acq-divider hr {
          border: none;
          border-top: 1px solid #E5E7EB;
          margin: 0;
        }

        .acq-footer-bottom {
          max-width: 80rem;
          margin: 0 auto;
          padding: 18px 2rem 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .acq-copy p {
          font-size: 0.5625rem;
          font-weight: 800;
          color: rgba(43,43,43,0.38);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          margin: 0 0 3px;
        }
        .acq-copy small {
          font-size: 0.5rem;
          color: rgba(43,43,43,0.28);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: block;
        }
        .acq-legal {
          display: flex;
          align-items: center;
          gap: 28px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }
        .acq-legal a {
          font-size: 0.5625rem;
          font-weight: 800;
          color: rgba(43,43,43,0.38);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          text-decoration: none;
          white-space: nowrap;
          transition: color 0.16s;
        }
        .acq-legal a:hover { color: #2B2B2B; }

        @media (max-width: 1024px) {
          .acq-footer-grid {
            grid-template-columns: 1fr 1fr 1fr;
            gap: 32px;
          }
          .acq-brand-col { grid-column: 1 / -1; }
          .acq-brand-desc { max-width: 100%; }
        }

        @media (max-width: 640px) {
          .acq-footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 28px;
            padding: 0 1rem 40px;
          }
          .acq-brand-col { grid-column: 1 / -1; }
          .acq-footer-bottom {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 14px;
            padding: 18px 1rem 28px;
          }
          .acq-legal { justify-content: center; gap: 18px; }
          .acq-divider { padding: 0 1rem; }
        }

        @media (max-width: 420px) {
          .acq-footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <footer className="acq-footer">
        <div className="acq-footer-grid">

          <div className="acq-brand-col">
            <span className="acq-brand-name">ACQAR</span>
            <p className="acq-brand-desc">
              The world's first AI-powered property intelligence platform for Dubai real estate.
              Independent, instant, investment-grade.
            </p>

            <div className="acq-rics-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <polyline points="9 12 11 14 15 10"/>
              </svg>
              <span>RICS-Aligned Intelligence</span>
            </div>

            <div className="acq-social-row">
              
                href="https://www.linkedin.com/company/acqar"
                target="_blank"
                rel="noopener noreferrer"
                className="acq-social-btn"
                aria-label="LinkedIn"
                onClick={() => {
                  trackEvent("ValuCheckSignup", "Click", "Footer LinkedIn");
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6 1.1 6 0 4.88 0 3.5S1.1 1 2.48 1c1.38 0 2.5 1.12 2.5 2.5zM0 8h5v16H0V8zm7.5 0h4.8v2.2h.1c.67-1.2 2.3-2.4 4.73-2.4C22.2 7.8 24 10.2 24 14.1V24h-5v-8.5c0-2-.04-4.6-2.8-4.6-2.8 0-3.2 2.2-3.2 4.4V24h-5V8z"/>
                </svg>
              </a>
            </div>
          </div>

          {cols.map(([title, items]) => (
            <div key={title}>
              <h6 className="acq-col-title">{title}</h6>
              <ul className="acq-link-list">
                {items.map((item) => (
                  <li
                    key={item}
                    className="acq-link-item"
                    onClick={() => {
                      trackEvent("ValuCheckSignup", "Click", `Footer ${title} - ${item}`);
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="acq-divider"><hr /></div>

        <div className="acq-footer-bottom">
          <div className="acq-copy">
            <p>© 2025 ACQARLABS L.L.C-FZ. All rights reserved.</p>
            <small>TruValu™ is a registered trademark.</small>
          </div>
          <nav className="acq-legal">
            {["Legal links", "Terms", "Privacy", "Cookies", "Security"].map((l) => (
              
                key={l}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  trackEvent("ValuCheckSignup", "Click", `Footer Legal - ${l}`);
                }}
              >
                {l}
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}

/* ──────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────── */
export default function ValuCheckSignup() {
  const navigate = useNavigate();

  const [role, setRole] = useState("Owner");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+971");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(false);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  React.useEffect(() => {
    trackEvent("Screen", "View", "ValuCheckSignup");
  }, []);

  const cleanedPhone = useMemo(() => {
    const local = (phone || "").replace(/[^\d]/g, "");
    if (!local) return "";
    return `${countryCode}${local}`;
  }, [phone, countryCode]);

  function validate() {
    if (!role) return "Please select a role.";
    if (!name.trim()) return "Please enter your full name.";
    if (!email.trim()) return "Please enter your email.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Please enter a valid email.";
    if (!phone.trim()) return "Please enter your phone number.";
    if ((phone || "").replace(/[^\d]/g, "").length < 7) return "Phone number looks too short.";
    if (!agree) return "Please agree to the Terms of Service and Privacy Policy.";
    return "";
  }

  async function sendOtp() {
    setStatus({ type: "", msg: "" });

    const err = validate();
    if (err) {
      setStatus({ type: "error", msg: err });
      return;
    }

    setLoading(true);
    try {
      const targetEmail = email.trim().toLowerCase();

      const { error } = await supabase.auth.signInWithOtp({
        email: targetEmail,
        options: { shouldCreateUser: true },
      });

      if (error) throw error;

      const draftData = {
        role,
        name: name.trim(),
        email: targetEmail,
        phone: cleanedPhone || null,
      };
      localStorage.setItem(LS_VALUCHECK_DRAFT, JSON.stringify(draftData));
      localStorage.setItem(LS_USER_EMAIL, targetEmail);

      trackEvent("ValuCheckSignup", "Submit", "Get Free ValuCheck Report");
      navigate("/valucheck-otp");
    } catch (ex) {
      setStatus({ type: "error", msg: ex?.message || "Could not send OTP. Please try again." });
      console.error("OTP send error:", ex);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    return sendOtp();
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }

        .valucheck-page-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #fff;
        }

        .valucheck-content-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          margin-top: 80px;
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .valucheck-content-container {
            margin-top: 20px;
            margin-bottom: 20px;
            padding: 20px 16px;
          }
        }

        @media (max-width: 480px) {
          .valucheck-content-container {
            padding: 20px 12px;
          }
        }
      `}</style>

      <div className="valucheck-page-wrapper">
        <Header />
        
        <div className="valucheck-content-container">
          <div className="valucheck-wrapper">
            <div className="valucheck-backdrop" />

            <div className="valucheck-modal">
              <div className="valucheck-badge">
                <span className="valucheck-badge-icon">🎉</span>
                <span className="valucheck-badge-text">EARLY CUSTOMER OFFER</span>
              </div>

              <h1 className="valucheck-title">Get Your Free ValuCheck™ Report</h1>
              <p className="valucheck-subtitle">Join 5,000+ investors getting institutional-grade property insights.</p>

              <form className="valucheck-form" onSubmit={onSubmit}>
                <div className="valucheck-section-label">I AM A:</div>

                <div className="valucheck-roles">
                  {ROLES.map((r) => {
                    const active = r === role;
                    return (
                      <button
                        key={r}
                        type="button"
                        className={`valucheck-role-btn ${active ? "active" : ""}`}
                        onClick={() => {
                          trackEvent("ValuCheckSignup", "Click", `Role - ${r}`);
                          setRole(r);
                        }}
                        disabled={loading}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>

                <div className="valucheck-row">
                  <div className="valucheck-field">
                    <label className="valucheck-label">FULL NAME</label>
                    <input
                      className="valucheck-input"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      disabled={loading}
                    />
                  </div>

                  <div className="valucheck-field">
                    <label className="valucheck-label">EMAIL ADDRESS</label>
                    <input
                      className="valucheck-input"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="valucheck-field">
                  <label className="valucheck-label">PHONE NUMBER</label>
                  <div className="valucheck-phone-group">
                    <select
                      className="valucheck-country-code"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      disabled={loading}
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={`${c.label}-${c.code}`} value={c.code.replace("-", "")}>
                          {c.code}
                        </option>
                      ))}
                    </select>

                    <input
                      className="valucheck-input valucheck-phone-input"
                      placeholder="50 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(formatUaePhone(e.target.value))}
                      inputMode="numeric"
                      autoComplete="tel"
                      disabled={loading}
                    />
                  </div>
                </div>

                <label className="valucheck-checkbox">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    disabled={loading}
                  />
                  <span>
                    I agree to the{" "}
                    
                      href="/terms"
                      className="valucheck-link"
                      onClick={() => {
                        trackEvent("ValuCheckSignup", "Click", "Terms of Service Link");
                      }}
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    
                      href="/privacy"
                      className="valucheck-link"
                      onClick={() => {
                        trackEvent("ValuCheckSignup", "Click", "Privacy Policy Link");
                      }}
                    >
                      Privacy Policy
                    </a>
                    . ACQAR may contact me regarding property insights.
                  </span>
                </label>

                {status.msg ? (
                  <div className={`valucheck-message ${status.type === "error" ? "error" : "success"}`}>
                    {status.msg}
                  </div>
                ) : null}

                <button className="valucheck-cta" type="submit" disabled={loading}>
                  <span>
                    {loading ? "Please wait..." : "Get Free ValuCheck™ Report"}
                  </span>
                  <span className="valucheck-arrow">→</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
