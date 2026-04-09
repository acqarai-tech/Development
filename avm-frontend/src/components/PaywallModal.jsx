// import React, { useState, useEffect } from "react";
// import { loadStripe } from "@stripe/stripe-js";
// import {
//   PaymentElement,
//   Elements,
//   useStripe,
//   useElements,
// } from "@stripe/react-stripe-js";
// import { supabase } from "../lib/supabase";

// const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// // ── Inner checkout form ──────────────────────────────────────────────────────
// function CheckoutForm({ onSuccess, onError, userDetails, isLoggedIn, paymentIntentId, setClientSecret, setPaymentIntentId, valuationId }) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [loading, setLoading] = useState(false);
//   const [errMsg, setErrMsg] = useState("");
//   const [showSuccess, setShowSuccess] = useState(false);


//   const handlePay = async () => {
//     if (!stripe || !elements) return;

//     // ── Validate fields first ──
//     if (!isLoggedIn) {
//   if (!userDetails.name.trim()) {
//     setErrMsg("Please enter your full name.");
//     return;
//   }
//   if (!userDetails.email.trim()) {
//     setErrMsg("Please enter your email address.");
//     return;
//   }
//   if (!userDetails.phone.trim()) {
//     setErrMsg("Please enter your phone number.");
//     return;
//   }
//   if (!userDetails.role) {
//     setErrMsg("Please select your role.");
//     return;
//   }
// }

//     setLoading(true);
//     setErrMsg("");

//     try {

//       // ── STEP 1: Create or login user BEFORE payment ──
//       // We need a real user session before we can do anything
//       let userId = null;

// if (isLoggedIn) {
//   // ── Already logged in — just get current user ID ──
//   const { data: { session } } = await supabase.auth.getSession();
//   userId = session?.user?.id;
// } else {
//   // ── Not logged in — sign up or sign in ──
//   const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
//     email: userDetails.email.trim(),
//     password: `${userDetails.countryCode}${userDetails.phone.trim()}`,
//     options: {
//       data: {
//         full_name: userDetails.name.trim(),
//         phone: `${userDetails.countryCode}${userDetails.phone.trim()}`,
//       },
//     },
//   });

//   if (signUpError && signUpError.message === "User already registered") {
//     const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
//       email: userDetails.email.trim(),
//       password: `${userDetails.countryCode}${userDetails.phone.trim()}`,
//     });

//     if (signInError) {
//       setErrMsg("Account already exists. Please contact support.");
//       setLoading(false);
//       return;
//     }

//     userId = signInData.session.user.id;
//   } else if (signUpError) {
//     setErrMsg(signUpError.message);
//     setLoading(false);
//     return;
//   } else {
//     userId = signUpData.user?.id;
//   }
// }

// if (!userId) {
//   setErrMsg("Could not create account. Please try again.");
//   setLoading(false);
//   return;
// }
//       // ── STEP 2: Insert user row into users table ──
//       // Do this BEFORE payment so the row exists
//       // const { error: insertError } = await supabase.from("users").upsert({
//       //   id: userId,
//       //   email: userDetails.email.trim(),
//       //   full_name: userDetails.name.trim(),
//       //   name: userDetails.name.trim(),        // ✅ name column
//       //   phone: `${userDetails.countryCode}${userDetails.phone.trim()}`,
//       //   role: userDetails.role || null,        // ✅ role column
//       //   plan: "free",
//       //   free_reports_used: 0,
//       //   free_reports_limit: 3,
//       //   is_founding_member: false,
//       // }, { onConflict: "id" });

//       // ── STEP 2: Insert user row — only for new signups ──
// if (!isLoggedIn) {
//       const { error: insertError } = await supabase.from("users").upsert(
//         {
//           id: userId,
//           role: userDetails.role,
//           name: userDetails.name.trim(),
//           email: userDetails.email.trim(),
//           phone: `${userDetails.countryCode}${userDetails.phone.trim()}`,
//           provider: "email",
//           plan: "free",
//           free_reports_used: 0,
//           free_reports_limit: 3,
//           is_founding_member: false,
//           plan_started_at: new Date().toISOString(),
//         },
//         { onConflict: "id" }
//       );

//       if (insertError) {
//         console.error("[PaywallModal] Users table insert error:", insertError);
//       } else {
//         console.log("[PaywallModal] User row created/updated in users table ✅");
//       }
// }

     

//       // ── STEP 3: Process payment ──
    

// // ── STEP 4: Update receipt email before payment ──
// // ── STEP 4: Update receipt email before payment ──
// if (userDetails.email) {
//   try {
//     await fetch(
//       `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/update-payment-email`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
//         },
//         body: JSON.stringify({
//           email: userDetails.email.trim(),
//           userId: userId,
//           isGuest: !isLoggedIn,
//           paymentIntentId: paymentIntentId,
//         }),
//       }
//     );
//   } catch (e) {
//     console.log("Email update skipped:", e.message);
//   }
// }

// // ── STEP 5: Process payment ──
// const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
//   elements,
//   confirmParams: {
//     return_url: window.location.href,
//     payment_method_data: {
//       billing_details: {
//         email: userDetails.email?.trim() || "",
//         name: userDetails.name?.trim() || "",
//         phone: userDetails.phone
//           ? `${userDetails.countryCode}${userDetails.phone.trim()}`
//           : "",
//         address: {
//   country: "AE",
//   postal_code: "",
//   line1: "",
//   city: "",
//   state: "",
// },
//       },
//     },
//   },
//   redirect: "if_required",
// });


// if (paymentError) {
//   if (paymentError.type === 'card_error' || paymentError.type === 'validation_error') {
//     setErrMsg(paymentError.message);
//   } else {
//     setErrMsg('Payment failed. Please check your card details and try again.');
//   }
//   onError?.(paymentError.message);
//   setLoading(false);
//   return;
// }
//       if (paymentIntent?.status === "succeeded") {
//         console.log("[PaywallModal] Payment succeeded ✅");


//      const { data: { session } } = await supabase.auth.getSession();

//   await fetch(
//     `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/save-payment-details`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": session
//           ? `Bearer ${session.access_token}`
//           : `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
//       },
//       body: JSON.stringify({
//         paymentIntentId: paymentIntent.id,
//         userId: userId,
//       }),
//     }
//   );
//         // ── STEP 4: Upgrade user to pro ──
//         const { error: upgradeError } = await supabase.from("users").update({
//           plan: "pro",
//           account_type: "pro", 
//           free_reports_limit: 10,
//           free_reports_used: 0,
//           is_founding_member: true,
//           plan_activated_at: new Date().toISOString(),   // ✅ ADD THIS
//   plan_started_at: new Date().toISOString(), 
//         }).eq("id", userId);

//         if (upgradeError) {
//           console.error("[PaywallModal] Plan upgrade error:", upgradeError);
//           // Payment succeeded — don't block, try again
//         } else {
//           console.log("[PaywallModal] Plan upgraded to pro ✅");
//         }

//         // ── STEP 5: Done ──
//         setShowSuccess(true);
//         setTimeout(() => {
//           setShowSuccess(false);
//           onSuccess?.();
//         }, 3000); // shows for 3 seconds then navigates
//       } else {
//         setErrMsg('Payment was not completed. Please try again or use a different card.');
//         setLoading(false);
//         return;
//       }
//     } catch (e) {
//       console.error("[PaywallModal] Unexpected error:", e);
//       setErrMsg(e.message || "Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>


//        {/* ── Success popup overlay ── */}
//       {showSuccess && (
//         <div style={{
//           position: "fixed",
//           inset: 0,
//           background: "rgba(0,0,0,0.7)",
//           zIndex: 99999,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           padding: "16px",
//         }}>
//           <div style={{
//             background: "#fff",
//             borderRadius: 20,
//             padding: "40px 32px",
//             maxWidth: 380,
//             width: "100%",
//             textAlign: "center",
//             boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
//             animation: "fadeInUp 0.4s ease",
//           }}>
//             {/* Checkmark circle */}
//             <div style={{
//               width: 72, height: 72,
//               borderRadius: "50%",
//               background: "rgba(34,197,94,0.1)",
//               border: "3px solid rgba(34,197,94,0.4)",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               margin: "0 auto 20px",
//             }}>
//               <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
//                 <path d="M20 6L9 17l-5-5" />
//               </svg>
//             </div>

//             {/* Title */}
//             <h2 style={{
//               fontSize: 22, fontWeight: 900,
//               color: "#1a1a1a", marginBottom: 8,
//               letterSpacing: "-0.02em",
//             }}>
//               Payment Successful! 🎉
//             </h2>

//             {/* Subtitle */}
//             <p style={{
//               fontSize: 14, color: "#666",
//               lineHeight: 1.6, marginBottom: 20,
//             }}>
//               Welcome to <strong style={{ color: "#B87333" }}>Acqar Pro</strong>!
//               Your account has been activated. Redirecting to your dashboard...
//             </p>

//             {/* Plan badge */}
//             <div style={{
//               display: "inline-flex",
//               alignItems: "center",
//               gap: 8,
//               padding: "8px 20px",
//               background: "#FFF7ED",
//               border: "1px solid #F5C89A",
//               borderRadius: 999,
//               marginBottom: 20,
//             }}>
//               <span style={{ fontSize: 16 }}>⭐</span>
//               <span style={{
//                 fontSize: 12, fontWeight: 800,
//                 color: "#B87333", textTransform: "uppercase",
//                 letterSpacing: "0.1em",
//               }}>
//                 Founding Member — Pro Plan
//               </span>
//             </div>

//             {/* Loading bar */}
//             <div style={{
//               height: 4,
//               background: "#f3f4f6",
//               borderRadius: 999,
//               overflow: "hidden",
//             }}>
//               <div style={{
//                 height: "100%",
//                 background: "linear-gradient(to right, #B87333, #D4956A)",
//                 borderRadius: 999,
//                 animation: "progressBar 3s linear forwards",
//               }} />
//             </div>

//             <style>{`
//               @keyframes fadeInUp {
//                 from { opacity: 0; transform: translateY(20px); }
//                 to { opacity: 1; transform: translateY(0); }
//               }
//               @keyframes progressBar {
//                 from { width: 0%; }
//                 to { width: 100%; }
//               }
//             `}</style>
//           </div>
//         </div>
//       )}
//       <PaymentElement
//   options={{
//     fields: {
//       billingDetails: {
//         email: "never",
//         phone: "never",
//         address: "never",
//       }
//     },
//     wallets: {
//       link: "never",
//     }
//   }}
// />
//       {errMsg && (
//         <div style={{
//           marginTop: 10, padding: "10px 14px",
//           background: "#fef2f2", border: "1px solid #fecaca",
//           borderRadius: 8, color: "#dc2626", fontSize: 12,
//         }}>
//           ⚠️ {errMsg}
//         </div>
//       )}
//       <button
//         onClick={handlePay}
//         disabled={!stripe || loading}
//         style={{
//           marginTop: 20, width: "100%", padding: "14px",
//           background: loading ? "#ccc" : "#B87333",
//           color: "#fff", borderRadius: 10, border: "none",
//           fontWeight: 700, fontSize: 15,
//           cursor: loading ? "not-allowed" : "pointer",
//           fontFamily: "inherit",
//         }}
//       >
//         {loading ? "Processing..." : "💳 Pay AED 29 & Activate Pro"}
//       </button>
//     </div>
//   );
// }

// // ── Main Modal ───────────────────────────────────────────────────────────────
// export default function PaywallModal({ valuationId, onSuccess, onClose }) {
//   const [clientSecret, setClientSecret] = useState(null);
//   const [loadingSecret, setLoadingSecret] = useState(true);
//   const [fetchError, setFetchError] = useState("");

//   // User details
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [countryCode, setCountryCode] = useState("+971");
//   // const [password, setPassword] = useState("");
//   const [role, setRole] = useState("");
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [paymentIntentId, setPaymentIntentId] = useState(null);
//   const [showCardForm, setShowCardForm] = useState(false);
// const [continuLoading, setContinueLoading] = useState(false);
// const [continueError, setContinueError] = useState("");

//   useEffect(() => {
//   async function init() {
//     try {
//       setFetchError("");
//       const { data: { session } } = await supabase.auth.getSession();

//       if (session?.user?.email) {
//         setEmail(session.user.email);
//         setIsLoggedIn(true);

//         // Logged in — create payment intent immediately with email
//         const res = await fetch(
//           `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-payment-intent`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${session.access_token}`,
//             },
//             body: JSON.stringify({
//               valuationId: valuationId || null,
//               userId: session.user.id,
//               userEmail: session.user.email,
//               amount: 2900,
//             }),
//           }
//         );
//         if (!res.ok) {
//           const errText = await res.text();
//           throw new Error(`Payment init failed: ${errText}`);
//         }
//         const data = await res.json();
//         setClientSecret(data.clientSecret);
//         setPaymentIntentId(data.paymentIntentId);
//       } else {
//         // Not logged in — do NOT create payment intent yet
//         // It will be created in handlePay after user fills their email
//         setLoadingSecret(false);
//         return;
//       }
//     } catch (e) {
//       console.error("[PaywallModal] init error:", e);
//       setFetchError(e.message);
//     } finally {
//       setLoadingSecret(false);
//     }
//   }
//   init();
// }, [valuationId]);

//   return (
//     <div style={{
//       position: "fixed", inset: 0,
//       background: "rgba(0,0,0,0.6)",
//       zIndex: 9999, display: "flex",
//       alignItems: "center", justifyContent: "center",
//       padding: "16px",
//     }}>
//       <div style={{
//         background: "#fff", borderRadius: 16,
//         padding: "32px 28px", maxWidth: 460, width: "100%",
//         boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
//         position: "relative", maxHeight: "92vh", overflowY: "auto",
//       }}>

//         {/* Close */}
//         <button onClick={onClose} style={{
//           position: "absolute", top: 14, right: 16,
//           background: "none", border: "none",
//           fontSize: 20, cursor: "pointer", color: "#888",
//         }}>✕</button>

//         {/* Header */}
//         <div style={{ textAlign: "center", marginBottom: 20 }}>
//           <div style={{ fontSize: 34, marginBottom: 8 }}>🔒</div>
//           <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", marginBottom: 6 }}>
//             Unlock Full Valuation Report
//           </h2>
//           <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
//             Pay once — your account is created automatically.
//           </p>
//         </div>

//         {/* Price badge */}
//         <div style={{
//           background: "#FFF7ED", border: "1px solid #F5C89A",
//           borderRadius: 10, padding: "12px 16px",
//           display: "flex", justifyContent: "space-between",
//           alignItems: "center", marginBottom: 24,
//         }}>
//           <div>
//             <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>
//               Acqar Pro — Founding Member
//             </div>
//             <div style={{ fontSize: 11, color: "#B87333", marginTop: 2 }}>
//               First 3 months · then AED 149/mo · Cancel anytime
//             </div>
//           </div>
//           <span style={{ fontSize: 22, fontWeight: 900, color: "#B87333" }}>
//             AED 29
//           </span>
//         </div>

//         {/* Loading */}
//         {loadingSecret && (
//           <p style={{ textAlign: "center", color: "#888", fontSize: 13, marginBottom: 16 }}>
//             Loading payment form...
//           </p>
//         )}

//         {/* Error */}
//         {fetchError && (
//           <div style={{
//             padding: "10px 14px", background: "#fef2f2",
//             border: "1px solid #fecaca", borderRadius: 8,
//             color: "#dc2626", fontSize: 12, marginBottom: 16,
//           }}>
//             ⚠️ {fetchError}
//           </div>
//         )}

// {/* ── Guest: Account Details + Continue button ── */}
// {!isLoggedIn && !showCardForm && !loadingSecret && (
//   <div>
//     <div style={{
//       marginBottom: 20, padding: "16px",
//       background: "#f9fafb", borderRadius: 10,
//       border: "1px solid #e5e7eb",
//     }}>
//       <p style={{
//         fontSize: 11, fontWeight: 700, color: "#B87333",
//         textTransform: "uppercase", letterSpacing: "0.1em",
//         marginBottom: 14, marginTop: 0,
//       }}>
//         📋 Your Account Details
//       </p>

//       {/* Full Name */}
//       <div style={{ marginBottom: 10 }}>
//         <label style={{ fontSize: 11, fontWeight: 700, color: "#555", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Full Name *</label>
//         <input type="text" placeholder="John Smith" value={name} onChange={(e) => setName(e.target.value)}
//           style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
//       </div>

//       {/* Role */}
//       <div style={{ marginBottom: 10 }}>
//         <label style={{ fontSize: 11, fontWeight: 700, color: "#555", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>I Am A *</label>
//         <select value={role} onChange={(e) => setRole(e.target.value)}
//           style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", color: role ? "#2B2B2B" : "#aaa", cursor: "pointer" }}>
//           <option value="" disabled>Select your role...</option>
//           <option value="investor">Investor</option>
//           <option value="buyer">Buyer</option>
//           <option value="seller">Seller</option>
//           <option value="agent">Agent</option>
//         </select>
//       </div>

//       {/* Email */}
//       <div style={{ marginBottom: 10 }}>
//         <label style={{ fontSize: 11, fontWeight: 700, color: "#555", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Email Address *</label>
//         <input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
//           style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
//       </div>

//       {/* Phone */}
//       <div style={{ marginBottom: 10 }}>
//         <label style={{ fontSize: 11, fontWeight: 700, color: "#555", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Phone Number *</label>
//         <div style={{ display: "flex", gap: 8, width: "100%" }}>
//           <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
//             style={{ padding: "11px 8px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, outline: "none", background: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, width: "140px" }}>
//             <option value="+971">UAE (+971)</option>
//             <option value="+92">Pakistan (+92)</option>
//             <option value="+91">India (+91)</option>
//             <option value="+1">USA/Canada (+1)</option>
//             <option value="+44">UK (+44)</option>
//             <option value="+966">Saudi Arabia (+966)</option>
//             <option value="+965">Kuwait (+965)</option>
//             <option value="+974">Qatar (+974)</option>
//             <option value="+968">Oman (+968)</option>
//             <option value="+973">Bahrain (+973)</option>
//           </select>
//           <input type="tel" placeholder="50 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)}
//             style={{ flex: 1, minWidth: 0, padding: "11px 13px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
//         </div>
//       </div>
//     </div>

//     {continueError && (
//       <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 12, marginBottom: 12 }}>
//         ⚠️ {continueError}
//       </div>
//     )}

//     <button
//       disabled={continuLoading}
//       onClick={async () => {
//         setContinueError("");
//         if (!name.trim()) return setContinueError("Please enter your full name.");
//         if (!role) return setContinueError("Please select your role.");
//         if (!email.trim() || !email.includes("@")) return setContinueError("Please enter a valid email address.");
//         if (!phone.trim()) return setContinueError("Please enter your phone number.");

//         setContinueLoading(true);
//         try {
//           const res = await fetch(
//             `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-payment-intent`,
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
//               },
//               body: JSON.stringify({
//                 valuationId: valuationId || null,
//                 userId: null,
//                 userEmail: email.trim(),
//                 amount: 2900,
//               }),
//             }
//           );
//           const data = await res.json();
//           if (data.clientSecret) {
//             setClientSecret(data.clientSecret);
//             setPaymentIntentId(data.paymentIntentId);
//             setShowCardForm(true);
//           } else {
//             setContinueError("Payment setup failed. Please try again.");
//           }
//         } catch (e) {
//           setContinueError("Something went wrong. Please try again.");
//         } finally {
//           setContinueLoading(false);
//         }
//       }}
//       style={{
//         width: "100%", padding: "14px",
//         background: continuLoading ? "#ccc" : "#B87333",
//         color: "#fff", borderRadius: 10, border: "none",
//         fontWeight: 700, fontSize: 15,
//         cursor: continuLoading ? "not-allowed" : "pointer",
//         fontFamily: "inherit",
//       }}
//     >
//       {continuLoading ? "Setting up payment..." : "Continue to Payment →"}
//     </button>
//   </div>
// )}

// {/* ── Card form — only shown after clientSecret exists ── */}
// {(clientSecret) && (
//   <Elements
//     key={clientSecret}
//     stripe={stripePromise}
//     options={{ clientSecret, appearance: { theme: "stripe" } }}
//   >
        
//             {/* Stripe card + Pay button */}
//           <CheckoutForm
//   onSuccess={onSuccess}
//   userDetails={{ name, email, phone, countryCode, role }}
//   isLoggedIn={isLoggedIn}
//   paymentIntentId={paymentIntentId}
//   setClientSecret={setClientSecret}
//   setPaymentIntentId={setPaymentIntentId}
//   valuationId={valuationId}
// />
//           </Elements>
//         )}

//         <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", marginTop: 16 }}>
//           🔐 Secured by Stripe · No hidden fees
//         </p>
//       </div>
//     </div>
//   );
// }















import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { supabase } from "../lib/supabase";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// ── Inner checkout form ──────────────────────────────────────────────────────
function CheckoutForm({ onSuccess, onError, userDetails, isLoggedIn, paymentIntentId, setClientSecret, setPaymentIntentId, valuationId, termsAccepted, setTermsAccepted }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);


  const handlePay = async () => {
    if (!stripe || !elements) return;

    if (!termsAccepted) {
      setErrMsg("Please accept the Terms and Conditions to proceed with payment.");
      return;
    }

    // ── Validate fields first ──
    if (!isLoggedIn) {
  if (!userDetails.name.trim()) {
    setErrMsg("Please enter your full name.");
    return;
  }
  if (!userDetails.email.trim()) {
    setErrMsg("Please enter your email address.");
    return;
  }
  if (!userDetails.phone.trim()) {
    setErrMsg("Please enter your phone number.");
    return;
  }
  if (!userDetails.role) {
    setErrMsg("Please select your role.");
    return;
  }
}

    setLoading(true);
    setErrMsg("");

    try {

      // ── STEP 1: Create or login user BEFORE payment ──
      // We need a real user session before we can do anything
      let userId = null;

if (isLoggedIn) {
  // ── Already logged in — just get current user ID ──
  const { data: { session } } = await supabase.auth.getSession();
  userId = session?.user?.id;
} else {
  // ── Not logged in — sign up or sign in ──
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: userDetails.email.trim(),
    password: `${userDetails.countryCode}${userDetails.phone.trim()}`,
    options: {
      data: {
        full_name: userDetails.name.trim(),
        phone: `${userDetails.countryCode}${userDetails.phone.trim()}`,
      },
    },
  });

  if (signUpError && signUpError.message === "User already registered") {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userDetails.email.trim(),
      password: `${userDetails.countryCode}${userDetails.phone.trim()}`,
    });

    if (signInError) {
      setErrMsg("Account already exists. Please contact support.");
      setLoading(false);
      return;
    }

    userId = signInData.session.user.id;
  } else if (signUpError) {
    setErrMsg(signUpError.message);
    setLoading(false);
    return;
  } else {
    userId = signUpData.user?.id;
  }
}

if (!userId) {
  setErrMsg("Could not create account. Please try again.");
  setLoading(false);
  return;
}
      // ── STEP 2: Insert user row into users table ──
      // Do this BEFORE payment so the row exists
      // const { error: insertError } = await supabase.from("users").upsert({
      //   id: userId,
      //   email: userDetails.email.trim(),
      //   full_name: userDetails.name.trim(),
      //   name: userDetails.name.trim(),        // ✅ name column
      //   phone: `${userDetails.countryCode}${userDetails.phone.trim()}`,
      //   role: userDetails.role || null,        // ✅ role column
      //   plan: "free",
      //   free_reports_used: 0,
      //   free_reports_limit: 3,
      //   is_founding_member: false,
      // }, { onConflict: "id" });

      // ── STEP 2: Insert user row — only for new signups ──
if (!isLoggedIn) {
      const { error: insertError } = await supabase.from("users").upsert(
        {
          id: userId,
          role: userDetails.role,
          name: userDetails.name.trim(),
          email: userDetails.email.trim(),
          phone: `${userDetails.countryCode}${userDetails.phone.trim()}`,
          provider: "email",
          plan: "free",
          free_reports_used: 0,
          free_reports_limit: 3,
          is_founding_member: false,
          plan_started_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (insertError) {
        console.error("[PaywallModal] Users table insert error:", insertError);
      } else {
        console.log("[PaywallModal] User row created/updated in users table ✅");
      }
}

     

      // ── STEP 3: Process payment ──
    

// ── STEP 4: Update receipt email before payment ──
// ── STEP 4: Update receipt email before payment ──
if (userDetails.email) {
  try {
    await fetch(
      `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/update-payment-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email: userDetails.email.trim(),
          userId: userId,
          isGuest: !isLoggedIn,
          paymentIntentId: paymentIntentId,
        }),
      }
    );
  } catch (e) {
    console.log("Email update skipped:", e.message);
  }
}

// ── STEP 5: Process payment ──
const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
  elements,
  confirmParams: {
    return_url: window.location.href,
    payment_method_data: {
      billing_details: {
        email: userDetails.email?.trim() || "",
        name: userDetails.name?.trim() || "",
        phone: userDetails.phone
          ? `${userDetails.countryCode}${userDetails.phone.trim()}`
          : "",
        address: {
  country: "AE",
  postal_code: "",
  line1: "",
  city: "",
  state: "",
},
      },
    },
  },
  redirect: "if_required",
});


if (paymentError) {
  if (paymentError.type === 'card_error' || paymentError.type === 'validation_error') {
    setErrMsg(paymentError.message);
  } else {
    setErrMsg('Payment failed. Please check your card details and try again.');
  }
  onError?.(paymentError.message);
  setLoading(false);
  return;
}
      if (paymentIntent?.status === "succeeded") {
        console.log("[PaywallModal] Payment succeeded ✅");


     const { data: { session } } = await supabase.auth.getSession();

  await fetch(
    `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/save-payment-details`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": session
          ? `Bearer ${session.access_token}`
          : `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        paymentIntentId: paymentIntent.id,
        userId: userId,
      }),
    }
  );
        // ── STEP 4: Upgrade user to pro ──
        const { error: upgradeError } = await supabase.from("users").update({
          plan: "pro",
          account_type: "pro", 
          free_reports_limit: 10,
          free_reports_used: 0,
          is_founding_member: true,
          plan_activated_at: new Date().toISOString(),   // ✅ ADD THIS
  plan_started_at: new Date().toISOString(), 
        }).eq("id", userId);

        if (upgradeError) {
          console.error("[PaywallModal] Plan upgrade error:", upgradeError);
          // Payment succeeded — don't block, try again
        } else {
          console.log("[PaywallModal] Plan upgraded to pro ✅");
        }

        // ── STEP 5: Done ──
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onSuccess?.();
        }, 3000); // shows for 3 seconds then navigates
      } else {
        setErrMsg('Payment was not completed. Please try again or use a different card.');
        setLoading(false);
        return;
      }
    } catch (e) {
      console.error("[PaywallModal] Unexpected error:", e);
      setErrMsg(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>


       {/* ── Success popup overlay ── */}
      {showSuccess && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 20,
            padding: "40px 32px",
            maxWidth: 380,
            width: "100%",
            textAlign: "center",
            boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
            animation: "fadeInUp 0.4s ease",
          }}>
            {/* Checkmark circle */}
            <div style={{
              width: 72, height: 72,
              borderRadius: "50%",
              background: "rgba(34,197,94,0.1)",
              border: "3px solid rgba(34,197,94,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: 22, fontWeight: 900,
              color: "#1a1a1a", marginBottom: 8,
              letterSpacing: "-0.02em",
            }}>
              Payment Successful! 🎉
            </h2>

            {/* Subtitle */}
            <p style={{
              fontSize: 14, color: "#666",
              lineHeight: 1.6, marginBottom: 20,
            }}>
              Welcome to <strong style={{ color: "#B87333" }}>Acqar Pro</strong>!
              Your account has been activated. Redirecting to your dashboard...
            </p>

            {/* Plan badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 20px",
              background: "#FFF7ED",
              border: "1px solid #F5C89A",
              borderRadius: 999,
              marginBottom: 20,
            }}>
              <span style={{ fontSize: 16 }}>⭐</span>
              <span style={{
                fontSize: 12, fontWeight: 800,
                color: "#B87333", textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}>
                Founding Member — Pro Plan
              </span>
            </div>

            {/* Loading bar */}
            <div style={{
              height: 4,
              background: "#f3f4f6",
              borderRadius: 999,
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                background: "linear-gradient(to right, #B87333, #D4956A)",
                borderRadius: 999,
                animation: "progressBar 3s linear forwards",
              }} />
            </div>

            <style>{`
              @keyframes fadeInUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes progressBar {
                from { width: 0%; }
                to { width: 100%; }
              }
            `}</style>
          </div>
        </div>
      )}
      <PaymentElement
  options={{
    fields: {
      billingDetails: {
        email: "never",
        phone: "never",
        address: "never",
      }
    },
    wallets: {
      link: "never",
    }
  }}
/>

  {/* ── Terms box ── */}
      <div style={{ marginTop: 16, marginBottom: 4 }}>
        <div style={{
          background: "#f9fafb", border: "1px solid #e5e7eb",
          borderRadius: 10, padding: "14px 16px",
          maxHeight: 160, overflowY: "auto", marginBottom: 10,
        }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#1a1a1a", marginBottom: 6, marginTop: 0 }}>
            Please Read the Following Terms and Conditions carefully. You may only proceed if these terms are acceptable to you.
          </p>
          <p style={{ fontSize: 11, color: "#444", marginBottom: 6 }}>By proceeding further you agree to the following:</p>
         <ul style={{ fontSize: 11, color: "#444", lineHeight: 1.7, paddingLeft: "1.1rem", margin: 0, listStyleType: "disc" }}>
            <li style={{ marginBottom: 5 }}>THE FEE IS NON-REFUNDABLE AFTER THIS STAGE.</li>
            <li style={{ marginBottom: 5 }}>We have NO REFUND POLICY against any application initiated/submitted. The applicant is requested to thoroughly review the information and guidelines on the website. Also make sure that you apply in the correct category because once your payment is processed, no refund will be entertained.</li>
            <li style={{ marginBottom: 5 }}>We are not responsible if applicant's credit card issuer does not authorize charge of their credit card for payment of the fees on this website.</li>
            <li>We reserve the right to cancel any application without providing any reason or notification for doing so. In case of a cancellation, the application fee shall not be refunded.</li>
          </ul>
        </div>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={e => setTermsAccepted(e.target.checked)}
            style={{ marginTop: 2, accentColor: "#B87333", width: 15, height: 15, flexShrink: 0 }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#2B2B2B" }}>
            I have read and accept the Payment Terms and Conditions
          </span>
        </label>
      </div>


      {errMsg && (
        <div style={{
          marginTop: 10, padding: "10px 14px",
          background: "#fef2f2", border: "1px solid #fecaca",
          borderRadius: 8, color: "#dc2626", fontSize: 12,
        }}>
          ⚠️ {errMsg}
        </div>
      )}
      <button
        onClick={handlePay}
        disabled={!stripe || loading}
        style={{
          marginTop: 20, width: "100%", padding: "14px",
          background: loading ? "#ccc" : "#B87333",
          color: "#fff", borderRadius: 10, border: "none",
          fontWeight: 700, fontSize: 15,
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "inherit",
        }}
      >
        {loading ? "Processing..." : "💳 Pay AED 29 & Activate Pro"}
      </button>
    </div>
  );
}

// ── Main Modal ───────────────────────────────────────────────────────────────
export default function PaywallModal({ valuationId, onSuccess, onClose }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loadingSecret, setLoadingSecret] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // User details
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+971");
  // const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [paymentIntentId, setPaymentIntentId] = useState(null);
  const [showCardForm, setShowCardForm] = useState(false);
const [termsAccepted, setTermsAccepted] = useState(false);

const [continuLoading, setContinueLoading] = useState(false);
const [continueError, setContinueError] = useState("");

  useEffect(() => {
  async function init() {
    try {
      setFetchError("");
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user?.email) {
        setEmail(session.user.email);
        setIsLoggedIn(true);

        // Logged in — create payment intent immediately with email
        const res = await fetch(
          `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-payment-intent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              valuationId: valuationId || null,
              userId: session.user.id,
              userEmail: session.user.email,
              amount: 2900,
            }),
          }
        );
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Payment init failed: ${errText}`);
        }
        const data = await res.json();
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
      } else {
        // Not logged in — do NOT create payment intent yet
        // It will be created in handlePay after user fills their email
        setLoadingSecret(false);
        return;
      }
    } catch (e) {
      console.error("[PaywallModal] init error:", e);
      setFetchError(e.message);
    } finally {
      setLoadingSecret(false);
    }
  }
  init();
}, [valuationId]);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.6)",
      zIndex: 9999, display: "flex",
      alignItems: "center", justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16,
        padding: "32px 28px", maxWidth: 460, width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        position: "relative", maxHeight: "92vh", overflowY: "auto",
      }}>

        {/* Close */}
        <button onClick={onClose} style={{
          position: "absolute", top: 14, right: 16,
          background: "none", border: "none",
          fontSize: 20, cursor: "pointer", color: "#888",
        }}>✕</button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 34, marginBottom: 8 }}>🔒</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", marginBottom: 6 }}>
            Unlock Full Valuation Report
          </h2>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
            Pay once — your account is created automatically.
          </p>
        </div>

        {/* Price badge */}
        <div style={{
          background: "#FFF7ED", border: "1px solid #F5C89A",
          borderRadius: 10, padding: "12px 16px",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 24,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e" }}>
              Acqar Pro — Founding Member
            </div>
            <div style={{ fontSize: 11, color: "#B87333", marginTop: 2 }}>
              First 3 months · then AED 149/mo · Cancel anytime
            </div>
          </div>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#B87333" }}>
            AED 29
          </span>
        </div>

        {/* Loading */}
        {loadingSecret && (
          <p style={{ textAlign: "center", color: "#888", fontSize: 13, marginBottom: 16 }}>
            Loading payment form...
          </p>
        )}

        {/* Error */}
        {fetchError && (
          <div style={{
            padding: "10px 14px", background: "#fef2f2",
            border: "1px solid #fecaca", borderRadius: 8,
            color: "#dc2626", fontSize: 12, marginBottom: 16,
          }}>
            ⚠️ {fetchError}
          </div>
        )}

{/* ── Guest: Account Details + Continue button ── */}
{!isLoggedIn && !showCardForm && !loadingSecret && (
  <div>
    <div style={{
      marginBottom: 20, padding: "16px",
      background: "#f9fafb", borderRadius: 10,
      border: "1px solid #e5e7eb",
    }}>
      <p style={{
        fontSize: 11, fontWeight: 700, color: "#B87333",
        textTransform: "uppercase", letterSpacing: "0.1em",
        marginBottom: 14, marginTop: 0,
      }}>
        📋 Your Account Details
      </p>

      {/* Full Name */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#555", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Full Name *</label>
        <input type="text" placeholder="John Smith" value={name} onChange={(e) => setName(e.target.value)}
          style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
      </div>

      {/* Role */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#555", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>I Am A *</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}
          style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fff", color: role ? "#2B2B2B" : "#aaa", cursor: "pointer" }}>
          <option value="" disabled>Select your role...</option>
          <option value="investor">Investor</option>
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
          <option value="agent">Agent</option>
        </select>
      </div>

      {/* Email */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#555", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Email Address *</label>
        <input type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "11px 13px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
      </div>

      {/* Phone */}
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#555", display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Phone Number *</label>
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}
            style={{ padding: "11px 8px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, outline: "none", background: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", flexShrink: 0, width: "140px" }}>
            <option value="+971">UAE (+971)</option>
            <option value="+92">Pakistan (+92)</option>
            <option value="+91">India (+91)</option>
            <option value="+1">USA/Canada (+1)</option>
            <option value="+44">UK (+44)</option>
            <option value="+966">Saudi Arabia (+966)</option>
            <option value="+965">Kuwait (+965)</option>
            <option value="+974">Qatar (+974)</option>
            <option value="+968">Oman (+968)</option>
            <option value="+973">Bahrain (+973)</option>
          </select>
          <input type="tel" placeholder="50 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)}
            style={{ flex: 1, minWidth: 0, padding: "11px 13px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} />
        </div>
      </div>
    </div>

    {continueError && (
      <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, color: "#dc2626", fontSize: 12, marginBottom: 12 }}>
        ⚠️ {continueError}
      </div>
    )}

    <button
      disabled={continuLoading}
      onClick={async () => {
        setContinueError("");
        if (!name.trim()) return setContinueError("Please enter your full name.");
        if (!role) return setContinueError("Please select your role.");
        if (!email.trim() || !email.includes("@")) return setContinueError("Please enter a valid email address.");
        if (!phone.trim()) return setContinueError("Please enter your phone number.");

        setContinueLoading(true);
        try {
          const res = await fetch(
            `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-payment-intent`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                valuationId: valuationId || null,
                userId: null,
                userEmail: email.trim(),
                amount: 2900,
              }),
            }
          );
          const data = await res.json();
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
            setPaymentIntentId(data.paymentIntentId);
            setShowCardForm(true);
          } else {
            setContinueError("Payment setup failed. Please try again.");
          }
        } catch (e) {
          setContinueError("Something went wrong. Please try again.");
        } finally {
          setContinueLoading(false);
        }
      }}
      style={{
        width: "100%", padding: "14px",
        background: continuLoading ? "#ccc" : "#B87333",
        color: "#fff", borderRadius: 10, border: "none",
        fontWeight: 700, fontSize: 15,
        cursor: continuLoading ? "not-allowed" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {continuLoading ? "Setting up payment..." : "Continue to Payment →"}
    </button>
  </div>
)}



{/* ── Card form — only shown after clientSecret exists ── */}
{(clientSecret) && (
  <Elements
    key={clientSecret}
    stripe={stripePromise}
    options={{ clientSecret, appearance: { theme: "stripe" } }}
  >

    
        
            {/* Stripe card + Pay button */}
          <CheckoutForm
  onSuccess={onSuccess}
  userDetails={{ name, email, phone, countryCode, role }}
  isLoggedIn={isLoggedIn}
  paymentIntentId={paymentIntentId}
  setClientSecret={setClientSecret}
  setPaymentIntentId={setPaymentIntentId}
  valuationId={valuationId}
  termsAccepted={termsAccepted}
  setTermsAccepted={setTermsAccepted}
/>
          </Elements>
        )}


        <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", marginTop: 16 }}>
          🔐 Secured by Stripe · No hidden fees
        </p>
      </div>
    </div>
  );
}
