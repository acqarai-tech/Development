// import React, { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import "../styles/valucheck.css";

// const ROLES = ["Property Owner", "Investor", "Buyer", "Agent"];
// const LS_FORM_KEY = "truvalu_formData_v1";

// // ✅ ADDED: store email for Report page (set-password email flow)
// const LS_USER_EMAIL = "truvalu_user_email_v1";
// const LS_RESET_SENT = "truvalu_reset_link_sent_v1";

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

//   const [role, setRole] = useState("Investor");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [countryCode] = useState("+971");
//   const [phone, setPhone] = useState("");
//   const [agree, setAgree] = useState(false);

//   const [step, setStep] = useState("form"); // "form" | "otp"
//   const [otp, setOtp] = useState("");

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

//       // ✅ ADDED: store email early so Report can send reset link without refresh
//       localStorage.setItem(LS_USER_EMAIL, targetEmail);

//       setStep("otp");
//       setStatus({ type: "success", msg: "OTP sent to your email. Please enter the code." });
//     } catch (ex) {
//       setStatus({ type: "error", msg: ex?.message || "Could not send OTP. Please try again." });
//       console.error("OTP send error:", ex);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ✅ insert valuation row AFTER OTP verified
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

//     const { data, error } = await supabase.from("valuations").insert([row]).select("id").single();
//     if (error) throw error;

//     localStorage.setItem("truvalu_valuation_row_id", data.id);
//   }

//   async function verifyOtpAndSave() {
//   setStatus({ type: "", msg: "" });

//   const code = (otp || "").trim();
//   if (!code) {
//     setStatus({ type: "error", msg: "Please enter the OTP code." });
//     return;
//   }

//   setLoading(true);
//   try {
//     const targetEmail = email.trim().toLowerCase();

//     // 1) Verify OTP
//     const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
//       email: targetEmail,
//       token: code,
//       type: "email",
//     });

//     if (verifyErr) throw verifyErr;

//     const authUserId = verifyData?.user?.id || null;
//     if (!authUserId) throw new Error("Could not read authenticated user id.");

//     // 2) Ensure session exists
//     const { data: sessionData } = await supabase.auth.getSession();
//     if (!sessionData?.session) throw new Error("Session not created. Please try OTP again.");

//     // ✅ 3) Upsert in users table (ID MUST MATCH AUTH UID)
//     // IMPORTANT: users.id must be authUserId
//     const payload = {
//       id: authUserId,                 // ✅ FIX (THIS IS THE MAIN POINT)
//       role,
//       name: name.trim(),
//       email: targetEmail,
//       phone: cleanedPhone || null,
//     };

//     const { error: upErr } = await supabase
//       .from("users")
//       .upsert(payload, { onConflict: "id" });

//     if (upErr) throw upErr;

//     // ✅ Insert valuation row now (after OTP) using SAME authUserId
//     await insertValuationAfterOtp(authUserId, name.trim());

//     setStatus({ type: "success", msg: "Verified! Generating your report..." });
//     setOtp("");

//     // ✅ Store email for report page reset-password flow
//     localStorage.setItem(LS_USER_EMAIL, targetEmail);
//     localStorage.removeItem(LS_RESET_SENT);

//     navigate("/report");
//   } catch (ex) {
//     setStatus({
//       type: "error",
//       msg: ex?.message || "OTP verification or saving failed. Check RLS policy for users/valuations.",
//     });
//     console.error("OTP verify/save error:", ex);
//   } finally {
//     setLoading(false);
//   }
// }


//   async function onSubmit(e) {
//     e.preventDefault();
//     if (step === "form") return sendOtp();
//     return verifyOtpAndSave();
//   }

//   function changeEmail() {
//     setStep("form");
//     setOtp("");
//     setStatus({ type: "", msg: "" });
//   }

//   return (
//     <div className="vcWrap">
//       <div className="vcBackdrop" />

//       <div className="vcModal" role="dialog" aria-modal="true" aria-label="ValuCheck Signup">
//         <div className="vcPill">
//           <span className="vcPillIcon">🎉</span>
//           <span className="vcPillText">EARLY CUSTOMER OFFER</span>
//         </div>

//         <h1 className="vcTitle">Get Your Free ValuCheck™ Report</h1>
//         <p className="vcSub">Limited time • No credit card required</p>

//         <form className="vcForm" onSubmit={onSubmit}>
//           <div className="vcRoleLabel">I AM A:</div>

//           <div className="vcRoleGroup" role="tablist" aria-label="Role selection">
//             {ROLES.map((r) => {
//               const active = r === role;
//               return (
//                 <button
//                   key={r}
//                   type="button"
//                   className={`vcRoleBtn ${active ? "isActive" : ""}`}
//                   onClick={() => setRole(r)}
//                   aria-pressed={active}
//                   disabled={step === "otp"}
//                 >
//                   {r}
//                 </button>
//               );
//             })}
//           </div>

//           <div className="vcGrid2">
//             <div className="vcField">
//               <label className="vcLabel">FULL NAME</label>
//               <input
//                 className="vcInput"
//                 placeholder="e.g. Alexander Pierce"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 autoComplete="name"
//                 disabled={step === "otp"}
//               />
//             </div>

//             <div className="vcField">
//               <label className="vcLabel">EMAIL ADDRESS</label>
//               <input
//                 className="vcInput"
//                 placeholder="alex@venture.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 autoComplete="email"
//                 disabled={step === "otp"}
//               />
//             </div>
//           </div>

//           <div className="vcField vcFieldFull">
//             <label className="vcLabel">PHONE NUMBER</label>
//             <div className="vcPhoneRow">
//               <div className="vcCountryCode" aria-hidden="true">
//                 {countryCode}
//               </div>
//               <input
//                 className="vcInput vcPhoneInput"
//                 placeholder="50 000 0000"
//                 value={phone}
//                 onChange={(e) => setPhone(formatUaePhone(e.target.value))}
//                 inputMode="numeric"
//                 autoComplete="tel"
//                 disabled={step === "otp"}
//               />
//             </div>
//           </div>

//           <label className="vcAgree">
//             <input
//               type="checkbox"
//               checked={agree}
//               onChange={(e) => setAgree(e.target.checked)}
//               disabled={step === "otp"}
//             />
//             <span>
//               I AGREE TO THE{" "}
//               <a href="/terms" className="vcLink">
//                 TERMS OF SERVICE
//               </a>{" "}
//               AND{" "}
//               <a href="/privacy" className="vcLink">
//                 PRIVACY POLICY
//               </a>
//               .
//             </span>
//           </label>

//           {step === "otp" && (
//             <div className="vcField vcFieldFull">
//               <label className="vcLabel">EMAIL OTP CODE</label>
//               <input
//                 className="vcInput"
//                 placeholder="Enter OTP from your email"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 inputMode="numeric"
//                 autoComplete="one-time-code"
//               />

//               <div className="vcTrust" style={{ marginTop: 12, justifyContent: "space-between" }}>
//                 <button
//                   type="button"
//                   className="vcRoleBtn"
//                   onClick={sendOtp}
//                   disabled={loading}
//                   style={{ width: "auto", padding: "10px 14px" }}
//                 >
//                   Resend OTP
//                 </button>

//                 <button
//                   type="button"
//                   className="vcRoleBtn"
//                   onClick={changeEmail}
//                   disabled={loading}
//                   style={{ width: "auto", padding: "10px 14px" }}
//                 >
//                   Change Email
//                 </button>
//               </div>
//             </div>
//           )}

//           {status.msg ? (
//             <div className={`vcMsg ${status.type === "error" ? "isError" : "isSuccess"}`}>
//               {status.msg}
//             </div>
//           ) : null}

//           <button className="vcCTA" type="submit" disabled={loading}>
//             <span>
//               {loading
//                 ? "Please wait..."
//                 : step === "form"
//                 ? "Send OTP to Email"
//                 : "Verify OTP & Get Free ValuCheck™ Report"}
//             </span>
//             <span className="vcArrow" aria-hidden="true">
//               →
//             </span>
//           </button>

//           <div className="vcTrust">
//             <div className="vcTrustItem">
//               <span className="vcTrustIcon" aria-hidden="true">
//                 🔒
//               </span>
//               <span>SSL ENCRYPTED</span>
//             </div>
//             <div className="vcTrustItem">
//               <span className="vcTrustIcon" aria-hidden="true">
//                 ✅
//               </span>
//               <span>DLD VERIFIED DATA</span>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }



// import React, { useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";
// import "../styles/valucheck.css";

// const ROLES = ["Property Owner", "Investor", "Buyer", "Agent"];
// const LS_FORM_KEY = "truvalu_formData_v1";

// // ✅ ADDED: store email for Report page (set-password email flow)
// const LS_USER_EMAIL = "truvalu_user_email_v1";
// const LS_RESET_SENT = "truvalu_reset_link_sent_v1";

// // ✅ ADDED: all country calling codes (E.164) as dropdown options
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
//   { code: "+225", label: "Côte d’Ivoire (+225)" },
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

//   const [role, setRole] = useState("Investor");
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");

//   // ✅ CHANGED (only change): countryCode is now selectable from dropdown
//   const [countryCode, setCountryCode] = useState("+971");

//   const [phone, setPhone] = useState("");
//   const [agree, setAgree] = useState(false);

//   const [step, setStep] = useState("form"); // "form" | "otp"
//   const [otp, setOtp] = useState("");

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

//       // ✅ ADDED: store email early so Report can send reset link without refresh
//       localStorage.setItem(LS_USER_EMAIL, targetEmail);

//       setStep("otp");
//       setStatus({ type: "success", msg: "OTP sent to your email. Please enter the code." });
//     } catch (ex) {
//       setStatus({ type: "error", msg: ex?.message || "Could not send OTP. Please try again." });
//       console.error("OTP send error:", ex);
//     } finally {
//       setLoading(false);
//     }
//   }

//   // ✅ insert valuation row AFTER OTP verified
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

//     const { data, error } = await supabase.from("valuations").insert([row]).select("id").single();
//     if (error) throw error;

//     localStorage.setItem("truvalu_valuation_row_id", data.id);
//   }

//   async function verifyOtpAndSave() {
//     setStatus({ type: "", msg: "" });

//     const code = (otp || "").trim();
//     if (!code) {
//       setStatus({ type: "error", msg: "Please enter the OTP code." });
//       return;
//     }

//     setLoading(true);
//     try {
//       const targetEmail = email.trim().toLowerCase();

//       // 1) Verify OTP
//       const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
//         email: targetEmail,
//         token: code,
//         type: "email",
//       });

//       if (verifyErr) throw verifyErr;

//       const authUserId = verifyData?.user?.id || null;
//       if (!authUserId) throw new Error("Could not read authenticated user id.");

//       // 2) Ensure session exists
//       const { data: sessionData } = await supabase.auth.getSession();
//       if (!sessionData?.session) throw new Error("Session not created. Please try OTP again.");

//       // ✅ 3) Upsert in users table (ID MUST MATCH AUTH UID)
//       // IMPORTANT: users.id must be authUserId
//       const payload = {
//         id: authUserId, // ✅ FIX (THIS IS THE MAIN POINT)
//         role,
//         name: name.trim(),
//         email: targetEmail,
//         phone: cleanedPhone || null,
//       };

//       const { error: upErr } = await supabase.from("users").upsert(payload, { onConflict: "id" });

//       if (upErr) throw upErr;

//       // ✅ Insert valuation row now (after OTP) using SAME authUserId
//       await insertValuationAfterOtp(authUserId, name.trim());

//       setStatus({ type: "success", msg: "Verified! Generating your report..." });
//       setOtp("");

//       // ✅ Store email for report page reset-password flow
//       localStorage.setItem(LS_USER_EMAIL, targetEmail);
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

//   async function onSubmit(e) {
//     e.preventDefault();
//     if (step === "form") return sendOtp();
//     return verifyOtpAndSave();
//   }

//   function changeEmail() {
//     setStep("form");
//     setOtp("");
//     setStatus({ type: "", msg: "" });
//   }

//   return (
//     <div className="vcWrap">
//       <div className="vcBackdrop" />

//       <div className="vcModal" role="dialog" aria-modal="true" aria-label="ValuCheck Signup">
//         <div className="vcPill">
//           <span className="vcPillIcon">🎉</span>
//           <span className="vcPillText">EARLY CUSTOMER OFFER</span>
//         </div>

//         <h1 className="vcTitle">Get Your Free ValuCheck™ Report</h1>
//         <p className="vcSub">Limited time • No credit card required</p>

//         <form className="vcForm" onSubmit={onSubmit}>
//           <div className="vcRoleLabel">I AM A:</div>

//           <div className="vcRoleGroup" role="tablist" aria-label="Role selection">
//             {ROLES.map((r) => {
//               const active = r === role;
//               return (
//                 <button
//                   key={r}
//                   type="button"
//                   className={`vcRoleBtn ${active ? "isActive" : ""}`}
//                   onClick={() => setRole(r)}
//                   aria-pressed={active}
//                   disabled={step === "otp"}
//                 >
//                   {r}
//                 </button>
//               );
//             })}
//           </div>

//           <div className="vcGrid2">
//             <div className="vcField">
//               <label className="vcLabel">FULL NAME</label>
//               <input
//                 className="vcInput"
//                 placeholder="e.g. Alexander Pierce"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 autoComplete="name"
//                 disabled={step === "otp"}
//               />
//             </div>

//             <div className="vcField">
//               <label className="vcLabel">EMAIL ADDRESS</label>
//               <input
//                 className="vcInput"
//                 placeholder="alex@venture.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 autoComplete="email"
//                 disabled={step === "otp"}
//               />
//             </div>
//           </div>

//           <div className="vcField vcFieldFull">
//             <label className="vcLabel">PHONE NUMBER</label>
//             <div className="vcPhoneRow">
//               {/* ✅ CHANGED UI ONLY: dropdown country code */}
//               <select
//                 className="vcCountryCode"
//                 value={countryCode}
//                 onChange={(e) => setCountryCode(e.target.value)}
//                 disabled={step === "otp"}
//               >
//                 {COUNTRY_CODES.map((c) => (
//                   <option key={`${c.label}-${c.code}`} value={c.code.replace("-", "")}>
//                     {c.label}
//                   </option>
//                 ))}
//               </select>

//               <input
//                 className="vcInput vcPhoneInput"
//                 placeholder="50 000 0000"
//                 value={phone}
//                 onChange={(e) => setPhone(formatUaePhone(e.target.value))}
//                 inputMode="numeric"
//                 autoComplete="tel"
//                 disabled={step === "otp"}
//               />
//             </div>
//           </div>

//           <label className="vcAgree">
//             <input
//               type="checkbox"
//               checked={agree}
//               onChange={(e) => setAgree(e.target.checked)}
//               disabled={step === "otp"}
//             />
//             <span>
//               I AGREE TO THE{" "}
//               <a href="/terms" className="vcLink">
//                 TERMS OF SERVICE
//               </a>{" "}
//               AND{" "}
//               <a href="/privacy" className="vcLink">
//                 PRIVACY POLICY
//               </a>
//               .
//             </span>
//           </label>

//           {step === "otp" && (
//             <div className="vcField vcFieldFull">
//               <label className="vcLabel">EMAIL OTP CODE</label>
//               <input
//                 className="vcInput"
//                 placeholder="Enter OTP from your email"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 inputMode="numeric"
//                 autoComplete="one-time-code"
//               />

//               <div className="vcTrust" style={{ marginTop: 12, justifyContent: "space-between" }}>
//                 <button
//                   type="button"
//                   className="vcRoleBtn"
//                   onClick={sendOtp}
//                   disabled={loading}
//                   style={{ width: "auto", padding: "10px 14px" }}
//                 >
//                   Resend OTP
//                 </button>

//                 <button
//                   type="button"
//                   className="vcRoleBtn"
//                   onClick={changeEmail}
//                   disabled={loading}
//                   style={{ width: "auto", padding: "10px 14px" }}
//                 >
//                   Change Email
//                 </button>
//               </div>
//             </div>
//           )}

//           {status.msg ? (
//             <div className={`vcMsg ${status.type === "error" ? "isError" : "isSuccess"}`}>
//               {status.msg}
//             </div>
//           ) : null}

//           <button className="vcCTA" type="submit" disabled={loading}>
//             <span>
//               {loading
//                 ? "Please wait..."
//                 : step === "form"
//                 ? "Send OTP to Email"
//                 : "Verify OTP & Get Free ValuCheck™ Report"}
//             </span>
//             <span className="vcArrow" aria-hidden="true">
//               →
//             </span>
//           </button>

//           <div className="vcTrust">
//             <div className="vcTrustItem">
//               <span className="vcTrustIcon" aria-hidden="true">
//                 🔒
//               </span>
//               <span>SSL ENCRYPTED</span>
//             </div>
//             <div className="vcTrustItem">
//               <span className="vcTrustIcon" aria-hidden="true">
//                 ✅
//               </span>
//               <span>DLD VERIFIED DATA</span>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/valucheck.css";

const ROLES = ["Owner", "Investor", "Buyer", "Agent"];
const LS_FORM_KEY = "truvalu_formData_v1";

const LS_USER_EMAIL = "truvalu_user_email_v1";
const LS_RESET_SENT = "truvalu_reset_link_sent_v1";

// ✅ NEW: store signup draft for next OTP screen
const LS_VALUCHECK_DRAFT = "truvalu_valucheck_draft_v1";

const COUNTRY_CODES = [
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
];

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function formatUaePhone(value) {
  const digits = (value || "").replace(/[^\d]/g, "").slice(0, 9);
  if (!digits) return "";
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}

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

  async function sendOtpAndGoNext() {
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

      // ✅ keep existing behavior
      localStorage.setItem(LS_USER_EMAIL, targetEmail);
      localStorage.removeItem(LS_RESET_SENT);

      // ✅ NEW: store the form draft for OTP screen (no UI change)
      localStorage.setItem(
        LS_VALUCHECK_DRAFT,
        JSON.stringify({
          role,
          name: name.trim(),
          email: targetEmail,
          phone: cleanedPhone || null,
        })
      );

      // ✅ NEW: go to OTP screen (separate page)
      navigate("/valucheck-otp");
    } catch (ex) {
      setStatus({
        type: "error",
        msg: ex?.message || "Could not send OTP. Please try again.",
      });
      console.error("OTP send error:", ex);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    return sendOtpAndGoNext();
  }

  return (
    <div className="valucheck-wrapper">
      <div className="valucheck-backdrop" />

      <div className="valucheck-modal">
        <div className="valucheck-badge">
          <span className="valucheck-badge-icon">🎉</span>
          <span className="valucheck-badge-text">EARLY CUSTOMER OFFER</span>
        </div>

        <h1 className="valucheck-title">Get Your Free ValuCheck™ Report</h1>
        <p className="valucheck-subtitle">
          Join 5,000+ investors getting institutional-grade property insights.
        </p>

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
                  onClick={() => setRole(r)}
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
                  <option key={`${c.label}-${c.code}`} value={c.code.replace(/-/g, "")}>
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
              <a href="/terms" className="valucheck-link">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" className="valucheck-link">
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
            <span>{loading ? "Please wait..." : "Get Free ValuCheck™ Report"}</span>
            <span className="valucheck-arrow">→</span>
          </button>
        </form>
      </div>

      {/* ✅ Mobile responsiveness ONLY (no functionality change) */}
      <style>{`
        @media (max-width: 768px){
          .valucheck-wrapper{
            padding: 18px !important;
          }

          .valucheck-modal{
            width: 100% !important;
            max-width: 520px !important;
            margin: 0 auto !important;
            border-radius: 16px !important;
          }

          .valucheck-title{
            font-size: 1.4rem !important;
            line-height: 1.2 !important;
          }

          .valucheck-subtitle{
            font-size: .95rem !important;
          }

          .valucheck-row{
            display: grid !important;
            grid-template-columns: 1fr !important;
            gap: 14px !important;
          }

          .valucheck-roles{
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }

          .valucheck-role-btn{
            width: 100% !important;
            padding: 12px 10px !important;
          }

          .valucheck-phone-group{
            display: grid !important;
            grid-template-columns: 110px 1fr !important;
            gap: 10px !important;
          }

          .valucheck-country-code{
            width: 110px !important;
          }

          .valucheck-cta{
            width: 100% !important;
          }

          .valucheck-checkbox span{
            font-size: .85rem !important;
            line-height: 1.4 !important;
          }
        }

        @media (max-width: 380px){
          .valucheck-roles{
            grid-template-columns: 1fr !important;
          }
          .valucheck-phone-group{
            grid-template-columns: 1fr !important;
          }
          .valucheck-country-code{
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}

