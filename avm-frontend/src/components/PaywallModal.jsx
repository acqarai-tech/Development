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
        {loading ? "Processing..." : "💳 Pay 99 AED & Get Report"}
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
            99 AED
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