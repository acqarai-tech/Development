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

// /* ── animated styles ── */
// const CSS = `
//   @keyframes pw-fade-in {
//     from { opacity: 0; transform: translateY(12px); }
//     to   { opacity: 1; transform: translateY(0); }
//   }
//   @keyframes pw-spin {
//     to { transform: rotate(360deg); }
//   }
//   @keyframes pw-pulse-ring {
//     0%   { transform: scale(0.8); opacity: 1; }
//     100% { transform: scale(1.6); opacity: 0; }
//   }
//   @keyframes pw-success-pop {
//     0%   { transform: scale(0.6); opacity: 0; }
//     70%  { transform: scale(1.1); }
//     100% { transform: scale(1);   opacity: 1; }
//   }
//   @keyframes pw-progress {
//     from { width: 0%; }
//     to   { width: 100%; }
//   }

//   .pw-modal {
//     animation: pw-fade-in 0.3s cubic-bezier(0.22, 1, 0.36, 1) both;
//   }
//   .pw-spinner {
//     animation: pw-spin 0.8s linear infinite;
//   }
//   .pw-pulse-ring {
//     animation: pw-pulse-ring 1.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
//   }
//   .pw-success-icon {
//     animation: pw-success-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
//   }
//   .pw-progress-bar {
//     animation: pw-progress 10s linear both;
//   }
// `;

// /* ── Spinner ── */
// function Spinner({ size = 18, color = "#fff" }) {
//   return (
//     <svg
//       className="pw-spinner"
//       width={size}
//       height={size}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke={color}
//       strokeWidth="2.5"
//       strokeLinecap="round"
//     >
//       <path d="M12 2a10 10 0 0 1 10 10" />
//     </svg>
//   );
// }

// /* ── Step indicator ── */
// function Steps({ current }) {
//   const steps = ["Details", "Payment", "Report"];
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
//       {steps.map((s, i) => {
//         const done = i < current;
//         const active = i === current;
//         return (
//           <React.Fragment key={s}>
//             <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
//               <div style={{
//                 width: 28, height: 28, borderRadius: "50%",
//                 background: done ? "#B87333" : active ? "#2B2B2B" : "#E5E5E5",
//                 color: done || active ? "#fff" : "#999",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 fontSize: 11, fontWeight: 800,
//                 transition: "all 0.3s",
//               }}>
//                 {done ? (
//                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
//                     <path d="M20 6L9 17l-5-5" />
//                   </svg>
//                 ) : i + 1}
//               </div>
//               <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase", color: active ? "#2B2B2B" : "#aaa" }}>
//                 {s}
//               </span>
//             </div>
//             {i < steps.length - 1 && (
//               <div style={{ flex: 1, height: 2, background: done ? "#B87333" : "#E5E5E5", margin: "0 6px", marginBottom: 18, transition: "background 0.4s" }} />
//             )}
//           </React.Fragment>
//         );
//       })}
//     </div>
//   );
// }

// /* ── Feature row ── */
// function Feature({ icon, text }) {
//   return (
//     <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F5F5F5" }}>
//       <div style={{
//         width: 28, height: 28, borderRadius: 8,
//         background: "#FFF7ED", display: "flex", alignItems: "center", justifyContent: "center",
//         fontSize: 14, flexShrink: 0,
//       }}>{icon}</div>
//       <span style={{ fontSize: 12, color: "rgba(43,43,43,0.7)", fontWeight: 500 }}>{text}</span>
//     </div>
//   );
// }

// /* ── Processing overlay ── */
// function ProcessingOverlay({ phase }) {
//   const phases = {
//     confirming: { icon: "💳", title: "Confirming Payment", sub: "Securely processing with Stripe…" },
//     verifying:  { icon: "🔄", title: "Verifying Transaction", sub: "Checking payment status…" },
//     unlocking:  { icon: "🔓", title: "Unlocking Your Report", sub: "Almost there…" },
//   };
//   const p = phases[phase] || phases.confirming;

//   return (
//     <div style={{
//       position: "absolute", inset: 0, borderRadius: 20,
//       background: "rgba(255,255,255,0.96)",
//       backdropFilter: "blur(4px)",
//       display: "flex", flexDirection: "column",
//       alignItems: "center", justifyContent: "center",
//       zIndex: 10, gap: 16,
//     }}>
//       <div style={{ position: "relative", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
//         <div className="pw-pulse-ring" style={{
//           position: "absolute", inset: 0, borderRadius: "50%",
//           border: "2px solid #B87333", opacity: 0.5,
//         }} />
//         <div style={{
//           width: 48, height: 48, borderRadius: "50%",
//           background: "#FFF7ED", border: "2px solid #F0D9C0",
//           display: "flex", alignItems: "center", justifyContent: "center",
//           fontSize: 22,
//         }}>{p.icon}</div>
//       </div>
//       <div style={{ textAlign: "center" }}>
//         <div style={{ fontSize: 15, fontWeight: 800, color: "#2B2B2B", marginBottom: 4 }}>{p.title}</div>
//         <div style={{ fontSize: 12, color: "rgba(43,43,43,0.5)" }}>{p.sub}</div>
//       </div>
//       {/* Progress bar */}
//       <div style={{ width: 200, height: 3, background: "#F0F0F0", borderRadius: 2, overflow: "hidden" }}>
//         <div className="pw-progress-bar" style={{ height: "100%", background: "#B87333", borderRadius: 2 }} />
//       </div>
//     </div>
//   );
// }

// /* ── Success screen ── */
// function SuccessScreen() {
//   return (
//     <div style={{ padding: "32px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
//       <div className="pw-success-icon" style={{
//         width: 72, height: 72, borderRadius: "50%",
//         background: "linear-gradient(135deg, #22c55e, #16a34a)",
//         display: "flex", alignItems: "center", justifyContent: "center",
//         boxShadow: "0 8px 24px rgba(34,197,94,0.35)",
//       }}>
//         <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
//           <path d="M20 6L9 17l-5-5" />
//         </svg>
//       </div>
//       <div>
//         <div style={{ fontSize: 22, fontWeight: 900, color: "#2B2B2B", marginBottom: 6 }}>Payment Successful!</div>
//         <div style={{ fontSize: 13, color: "rgba(43,43,43,0.55)", lineHeight: 1.6 }}>
//           Your full valuation report has been unlocked.<br />
//           Redirecting you now…
//         </div>
//       </div>
//       <div style={{
//         background: "#F0FDF4", border: "1px solid #86EFAC", borderRadius: 10,
//         padding: "10px 20px", fontSize: 12, color: "#15803D", fontWeight: 600,
//       }}>
//         ✅ 99 AED · One-time payment · Receipt sent to your email
//       </div>
//     </div>
//   );
// }

// /* ── Checkout form ── */
// function CheckoutForm({ onSuccess, onError }) {
//   const stripe = useStripe();
//   const elements = useElements();
//   const [phase, setPhase] = useState(null); // null | "confirming" | "verifying" | "unlocking"
//   const [errMsg, setErrMsg] = useState("");
//   const [succeeded, setSucceeded] = useState(false);

//   const loading = phase !== null;

//   const handlePay = async () => {
//     if (!stripe || !elements) return;
//     setErrMsg("");
//     setPhase("confirming");

//     const { error, paymentIntent } = await stripe.confirmPayment({
//       elements,
//       redirect: "if_required",
//     });

//     if (error) {
//       setErrMsg(error.message);
//       onError?.(error.message);
//       setPhase(null);
//       return;
//     }

//     if (paymentIntent?.status === "succeeded") {
//       setPhase("verifying");

//       let attempts = 0;
//       const maxAttempts = 10;

//       const poll = () => {
//         attempts++;
//         supabase
//           .from("payments")
//           .select("status")
//           .eq("stripe_payment_intent_id", paymentIntent.id)
//           .single()
//           .then(({ data }) => {
//             if (data?.status === "succeeded") {
//               setPhase("unlocking");
//               setTimeout(() => {
//                 setSucceeded(true);
//                 setTimeout(() => onSuccess?.(), 1200);
//               }, 600);
//             } else if (attempts < maxAttempts) {
//               setTimeout(poll, 1000);
//             } else {
//               // Webhook slow but Stripe confirmed — allow access
//               setPhase("unlocking");
//               setTimeout(() => {
//                 setSucceeded(true);
//                 setTimeout(() => onSuccess?.(), 1200);
//               }, 600);
//             }
//           })
//           .catch(() => {
//             if (attempts < maxAttempts) {
//               setTimeout(poll, 1000);
//             } else {
//               setPhase("unlocking");
//               setTimeout(() => {
//                 setSucceeded(true);
//                 setTimeout(() => onSuccess?.(), 1200);
//               }, 600);
//             }
//           });
//       };

//       poll();
//     } else {
//       setErrMsg("Payment was not completed. Please try again.");
//       setPhase(null);
//     }
//   };

//   if (succeeded) return <SuccessScreen />;

//   return (
//     <div style={{ position: "relative" }}>
//       {phase && <ProcessingOverlay phase={phase} />}

//       <PaymentElement options={{ layout: "tabs" }} />

//       {errMsg && (
//         <div style={{
//           marginTop: 12, padding: "10px 14px",
//           background: "#FEF2F2", border: "1px solid #FCA5A5",
//           borderRadius: 8, color: "#DC2626", fontSize: 12, fontWeight: 600,
//         }}>
//           ⚠️ {errMsg}
//         </div>
//       )}

//       <button
//         onClick={handlePay}
//         disabled={!stripe || loading}
//         style={{
//           marginTop: 20, width: "100%", padding: "15px",
//           background: loading ? "#D4A76A" : "linear-gradient(135deg, #C98945, #B87333)",
//           color: "#fff", borderRadius: 12, border: "none",
//           fontWeight: 800, fontSize: 15, cursor: loading ? "not-allowed" : "pointer",
//           display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
//           boxShadow: loading ? "none" : "0 4px 20px rgba(184,115,51,0.4)",
//           transition: "all 0.2s",
//           letterSpacing: ".02em",
//         }}
//       >
//         {loading ? (
//           <>
//             <Spinner size={16} color="rgba(255,255,255,0.8)" />
//             Processing…
//           </>
//         ) : (
//           <>
//             <span style={{ fontSize: 18 }}>💳</span>
//             Pay 99 AED &amp; Unlock Report
//           </>
//         )}
//       </button>

//       <p style={{ textAlign: "center", fontSize: 11, color: "#bbb", marginTop: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
//         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
//         256-bit SSL · Secured by Stripe · One-time payment
//       </p>
//     </div>
//   );
// }

// /* ── Main modal ── */
// export default function PaywallModal({ valuationId, onSuccess, onClose }) {
//   const [clientSecret, setClientSecret] = useState(null);
//   const [loadingSecret, setLoadingSecret] = useState(true);
//   const [fetchError, setFetchError] = useState("");

//   useEffect(() => {
//     async function createIntent() {
//       try {
//         const { data: { session } } = await supabase.auth.getSession();
//         const user = session?.user;
//         if (!user) throw new Error("Not logged in");

//         const res = await fetch(
//           `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-payment-intent`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${session.access_token}`,
//             },
//             body: JSON.stringify({ valuationId, userId: user.id, userEmail: user.email }),
//           }
//         );

//         if (!res.ok) {
//           const errData = await res.json().catch(() => ({}));
//           throw new Error(errData.error || "Failed to create payment intent");
//         }

//         const { clientSecret } = await res.json();
//         setClientSecret(clientSecret);
//       } catch (e) {
//         setFetchError(e.message);
//       } finally {
//         setLoadingSecret(false);
//       }
//     }
//     createIntent();
//   }, [valuationId]);

//   return (
//     <>
//       <style>{CSS}</style>

//       {/* Backdrop */}
//       <div
//         onClick={onClose}
//         style={{
//           position: "fixed", inset: 0,
//           background: "rgba(10,10,10,0.65)",
//           backdropFilter: "blur(6px)",
//           zIndex: 9998,
//         }}
//       />

//       {/* Modal */}
//       <div className="pw-modal" style={{
//         position: "fixed", inset: 0, zIndex: 9999,
//         display: "flex", alignItems: "center", justifyContent: "center",
//         padding: 16, pointerEvents: "none",
//       }}>
//         <div style={{
//           background: "#fff", borderRadius: 20,
//           width: "100%", maxWidth: 460,
//           maxHeight: "92vh", overflowY: "auto",
//           boxShadow: "0 32px 80px rgba(0,0,0,0.28)",
//           pointerEvents: "all", position: "relative",
//         }}>
//           {/* Close */}
//           <button
//             onClick={onClose}
//             style={{
//               position: "absolute", top: 14, right: 14,
//               width: 30, height: 30, borderRadius: "50%",
//               background: "#F5F5F5", border: "none",
//               fontSize: 14, cursor: "pointer", color: "#888",
//               display: "flex", alignItems: "center", justifyContent: "center",
//               zIndex: 2,
//             }}
//           >✕</button>

//           <div style={{ padding: "28px 28px 24px" }}>

//             {/* Steps */}
//             <Steps current={1} />

//             {/* Header */}
//             <div style={{ textAlign: "center", marginBottom: 24 }}>
//               <div style={{
//                 width: 56, height: 56, borderRadius: 16,
//                 background: "linear-gradient(135deg, #FFF7ED, #FEE8CC)",
//                 border: "1px solid #F0D9C0",
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 fontSize: 26, margin: "0 auto 14px",
//               }}>🔒</div>
//               <h2 style={{ fontSize: 20, fontWeight: 900, color: "#1a1a1a", margin: "0 0 8px", letterSpacing: "-.02em" }}>
//                 Unlock Full Valuation Report
//               </h2>
//               <p style={{ fontSize: 12.5, color: "#888", lineHeight: 1.6, margin: 0 }}>
//                 You've used your <strong style={{ color: "#2B2B2B" }}>3 free reports</strong>. Unlock instant access to your complete AI valuation.
//               </p>
//             </div>

//             {/* Price badge */}
//             <div style={{
//               background: "linear-gradient(135deg, #2B2B2B, #3d3d3d)",
//               borderRadius: 14, padding: "16px 20px",
//               display: "flex", justifyContent: "space-between", alignItems: "center",
//               marginBottom: 20,
//             }}>
//               <div>
//                 <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 4 }}>
//                   One-time · Instant Access
//                 </div>
//                 <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Full AI Valuation Report</div>
//               </div>
//               <div style={{ textAlign: "right" }}>
//                 <div style={{ fontSize: 28, fontWeight: 900, color: "#B87333", letterSpacing: "-.02em" }}>99</div>
//                 <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: ".08em" }}>AED</div>
//               </div>
//             </div>

//             {/* Features */}
//             <div style={{ marginBottom: 22 }}>
//               <Feature icon="📊" text="Full AI valuation with confidence score & price range" />
//               <Feature icon="📈" text="6-month forecast & 3-year price prediction chart" />
//               <Feature icon="🏘" text="Up to 8 comparable recent transactions in your area" />
//               <Feature icon="📋" text="Supply & demand analysis + market trend data" />
//               <Feature icon="🔗" text="Shareable report link — valid forever" />
//             </div>

//             {/* Divider */}
//             <div style={{ height: 1, background: "#F0F0F0", margin: "0 0 20px" }} />

//             {/* Payment form */}
//             {loadingSecret && (
//               <div style={{ textAlign: "center", padding: "24px 0", color: "#aaa", fontSize: 13, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
//                 <Spinner size={20} color="#B87333" />
//                 Preparing payment form…
//               </div>
//             )}

//             {fetchError && (
//               <div style={{
//                 background: "#FEF2F2", border: "1px solid #FCA5A5",
//                 borderRadius: 10, padding: "14px 16px",
//                 color: "#DC2626", fontSize: 13,
//               }}>
//                 ⚠️ {fetchError}
//                 <br />
//                 <button
//                   onClick={() => window.location.reload()}
//                   style={{ marginTop: 8, color: "#B91C1C", fontWeight: 700, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontSize: 12 }}
//                 >
//                   Try again
//                 </button>
//               </div>
//             )}

//             {!loadingSecret && !fetchError && !clientSecret && (
//               <p style={{ color: "#DC2626", fontSize: 13 }}>⚠️ Could not load payment form. Please refresh.</p>
//             )}

//             {clientSecret && (
//               <Elements
//                 stripe={stripePromise}
//                 options={{
//                   clientSecret,
//                   appearance: {
//                     theme: "stripe",
//                     variables: {
//                       colorPrimary: "#B87333",
//                       colorBackground: "#ffffff",
//                       borderRadius: "10px",
//                       fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
//                     },
//                   },
//                 }}
//               >
//                 <CheckoutForm onSuccess={onSuccess} />
//               </Elements>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
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

function CheckoutForm({ onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setErrMsg("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setErrMsg(error.message);
      onError?.(error.message);
    } else if (paymentIntent?.status === "succeeded") {
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <div>
      <PaymentElement />
      {errMsg && (
        <p style={{ color: "#dc2626", fontSize: 13, marginTop: 8 }}>{errMsg}</p>
      )}
      <button
        onClick={handlePay}
        disabled={!stripe || loading}
        style={{
          marginTop: 20,
          width: "100%",
          padding: "14px",
          background: loading ? "#ccc" : "#B87333",
          color: "#fff",
          borderRadius: 10,
          border: "none",
          fontWeight: 700,
          fontSize: 15,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Processing..." : "💳 Pay 29 AED & Get Report"}
      </button>
    </div>
  );
}

export default function PaywallModal({ valuationId, onSuccess, onClose }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [loadingSecret, setLoadingSecret] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    async function createIntent() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) throw new Error("Not logged in");

        const res = await fetch(
          `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-payment-intent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              valuationId,
              userId: user.id,
              userEmail: user.email,
            }),
          }
        );

        if (!res.ok) throw new Error("Failed to create payment intent");
        const { clientSecret } = await res.json();
        setClientSecret(clientSecret);
      } catch (e) {
        setFetchError(e.message);
      } finally {
        setLoadingSecret(false);
      }
    }

    createIntent();
  }, [valuationId]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "32px 28px",
          maxWidth: 440,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 16,
            background: "none",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            color: "#888",
          }}
        >
          ✕
        </button>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔒</div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#1a1a1a",
              marginBottom: 8,
            }}
          >
            Unlock Full Valuation Report
          </h2>
          <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>
            You've used your <strong>3 free reports</strong>. Pay a one-time
            fee to access this valuation instantly.
          </p>
        </div>

        {/* Price badge */}
        <div
          style={{
            background: "#FFF7ED",
            border: "1px solid #F5C89A",
            borderRadius: 10,
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>
            Full AI Valuation Report
          </span>
          <span style={{ fontSize: 22, fontWeight: 900, color: "#B87333" }}>
  29 AED
</span>
        </div>

        {/* Payment form */}
        {loadingSecret && (
          <p style={{ textAlign: "center", color: "#888", fontSize: 13 }}>
            Loading payment...
          </p>
        )}
        {fetchError && (
          <p style={{ color: "#dc2626", fontSize: 13 }}>{fetchError}</p>
        )}
        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: "stripe" } }}
          >
            <CheckoutForm onSuccess={onSuccess} />
          </Elements>
        )}

        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "#aaa",
            marginTop: 16,
          }}
        >
          🔐 Secured by Stripe · One-time payment
        </p>
      </div>
    </div>
  );
}
