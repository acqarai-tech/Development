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
function CheckoutForm({ onSuccess, onError, userDetails }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);


  const handlePay = async () => {
    if (!stripe || !elements) return;

    // ── Validate fields first ──
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
    // if (!userDetails.password || userDetails.password.length < 6) {
    //   setErrMsg("Password must be at least 6 characters.");
    //   return;
    // }
    if (!userDetails.role) {
      setErrMsg("Please select your role.");
      return;
    }

    setLoading(true);
    setErrMsg("");

    try {

      // ── STEP 1: Create or login user BEFORE payment ──
      // We need a real user session before we can do anything
      let userId = null;

// Sign up user using phone as password (they never see it)
const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
  email: userDetails.email.trim(),
  password: `${userDetails.countryCode}${userDetails.phone.trim()}`, // phone as hidden password
  options: {
    data: {
      full_name: userDetails.name.trim(),
      phone: `${userDetails.countryCode}${userDetails.phone.trim()}`,
    },
  },
});

if (signUpError && signUpError.message === "User already registered") {
  // Existing user — sign them in silently using same logic
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

      const { error: insertError } = await supabase.from("users").upsert(
        {
          id: userId,
          role: userDetails.role,          // ✅ exact same as RegisterPage
          name: userDetails.name.trim(),   // ✅ exact same as RegisterPage
          email: userDetails.email.trim(),
          phone: `${userDetails.countryCode}${userDetails.phone.trim()}`,
          provider: "email",               // ✅ exact same as RegisterPage
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
        // Don't block payment — row may already exist
      } else {
        console.log("[PaywallModal] User row created/updated in users table ✅");
      }

      // ── STEP 3: Process payment ──
      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (paymentError) {
        setErrMsg(paymentError.message);
        onError?.(paymentError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        console.log("[PaywallModal] Payment succeeded ✅");

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
      <PaymentElement />
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

  useEffect(() => {
    async function createIntent() {
      try {
        setFetchError("");

        const { data: { session } } = await supabase.auth.getSession();

        // Pre-fill email if already logged in
        if (session?.user?.email) {
          setEmail(session.user.email);
        }

        const headers = {
          "Content-Type": "application/json",
          Authorization: session
            ? `Bearer ${session.access_token}`
            : `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`,
        };

        const res = await fetch(
          `${process.env.REACT_APP_SUPABASE_URL}/functions/v1/create-payment-intent`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({
              valuationId: valuationId || null,
              userId: session?.user?.id || null,
              userEmail: session?.user?.email || null,
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

      } catch (e) {
        console.error("[PaywallModal] createIntent error:", e);
        setFetchError(e.message);
      } finally {
        setLoadingSecret(false);
      }
    }

    createIntent();
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

        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: "stripe" } }}
          >

            {/* ── Account details box ── */}
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
                <label style={{
                  fontSize: 11, fontWeight: 700, color: "#555",
                  display: "block", marginBottom: 4,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%", padding: "11px 13px", borderRadius: 8,
                    border: "1px solid #e5e7eb", fontSize: 14,
                    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                  }}
                />
              </div>
{/* Role */}
              <div style={{ marginBottom: 10 }}>
                <label style={{
                  fontSize: 11, fontWeight: 700, color: "#555",
                  display: "block", marginBottom: 4,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  I Am A *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: "100%", padding: "11px 13px", borderRadius: 8,
                    border: "1px solid #e5e7eb", fontSize: 14,
                    outline: "none", boxSizing: "border-box",
                    fontFamily: "inherit", background: "#fff",
                    color: role ? "#2B2B2B" : "#aaa", cursor: "pointer",
                  }}
                >
                 <option value="" disabled>Select your role...</option>
<option value="investor">Investor</option>
<option value="buyer">Buyer</option>
<option value="seller">Seller</option>
<option value="agent">Agent</option>
                  
                </select>
              </div>

              {/* Email */}
              <div style={{ marginBottom: 10 }}>
                <label style={{
                  fontSize: 11, fontWeight: 700, color: "#555",
                  display: "block", marginBottom: 4,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  Email Address *
                </label>
            
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%", padding: "11px 13px", borderRadius: 8,
                    border: "1px solid #e5e7eb", fontSize: 14,
                    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Phone */}
              <div style={{ marginBottom: 10 }}>
                <label style={{
                  fontSize: 11, fontWeight: 700, color: "#555",
                  display: "block", marginBottom: 4,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  Phone Number *
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    style={{
                      padding: "11px 8px", borderRadius: 8,
                      border: "1px solid #e5e7eb", fontSize: 13,
                      outline: "none", background: "#fff",
                      fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    }}
                  >
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+92">🇵🇰 +92</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+965">🇰🇼 +965</option>
                    <option value="+974">🇶🇦 +974</option>
                    <option value="+973">🇧🇭 +973</option>
                    <option value="+968">🇴🇲 +968</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="50 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      flex: 1, padding: "11px 13px", borderRadius: 8,
                      border: "1px solid #e5e7eb", fontSize: 14,
                      outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              {/* <div>
                <label style={{
                  fontSize: 11, fontWeight: 700, color: "#555",
                  display: "block", marginBottom: 4,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%", padding: "11px 13px", borderRadius: 8,
                    border: "1px solid #e5e7eb", fontSize: 14,
                    outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                  }}
                />
                <p style={{ fontSize: 11, color: "#aaa", marginTop: 4, marginBottom: 0 }}>
                  Already have an account? Enter your existing password to log in.
                </p>
              </div> */}
            </div>

            {/* Stripe card + Pay button */}
            <CheckoutForm
              onSuccess={onSuccess}
              userDetails={{ name, email, phone, countryCode, role }}
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
