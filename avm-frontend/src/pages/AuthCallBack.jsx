// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "../lib/supabase";

// export default function AuthCallback() {
//   const navigate = useNavigate();

//   useEffect(() => {
//     (async () => {
//       // 1) Let Supabase read the URL and store the session
//       const { data, error } = await supabase.auth.getSession();

//       // If session not ready yet, wait briefly for auth event
//       if (!data?.session) {
//         const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
//           if (session) {
//             sub.subscription.unsubscribe();
//             navigate("/dashboard", { replace: true });
//           }
//         });

//         // fallback (if something goes wrong)
//         setTimeout(() => {
//           sub.subscription.unsubscribe();
//           navigate("/dashboard", { replace: true });
//         }, 800);

//         return;
//       }

//       if (error) {
//         console.error(error);
//         navigate("/login", { replace: true });
//         return;
//       }

//       navigate("/dashboard", { replace: true });
//     })();
//   }, [navigate]);

//   return <div style={{ padding: 24 }}>Signing you in…</div>;
// }

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const hasHandled = useRef(false); // ✅ prevents double execution
  const [status, setStatus] = useState("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let listenerUnsub = null;

    const checkUserAndRedirect = async (session) => {
      // ✅ If already handled, do nothing
      if (hasHandled.current) return;
      hasHandled.current = true;

      if (listenerUnsub) listenerUnsub();

      try {
        setStatus("redirecting");

        const { data, error } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          // ✅ New user — no row in users table
          navigate("/complete-profile", { replace: true });
        } else {
          // ✅ Existing user
          navigate("/dashboard", { replace: true });
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setErrorMsg(err?.message || "Something went wrong.");
        setStatus("error");
        hasHandled.current = false; // allow retry on error
      }
    };

    const init = async () => {
      // 1. Try getSession first (handles page refresh / already active session)
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        setErrorMsg(error.message);
        setStatus("error");
        return;
      }

      if (session) {
        // Session already available
        await checkUserAndRedirect(session);
        return;
      }

      // 2. No session yet — wait for OAuth to complete via listener
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          await checkUserAndRedirect(session);
        }
      });

      listenerUnsub = () => listener.subscription.unsubscribe();

      // 3. Timeout safety net — if nothing happens in 10s, show error
      setTimeout(() => {
        if (!hasHandled.current) {
          setErrorMsg("Sign-in timed out. Please try again.");
          setStatus("error");
        }
      }, 10000);
    };

    init();

    return () => {
      if (listenerUnsub) listenerUnsub();
    };
  }, [navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <div style={styles.logoBox}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <rect x="2"  y="2"  width="8" height="8" rx="1.5" fill="#e87722" />
              <rect x="14" y="2"  width="8" height="8" rx="1.5" fill="#e87722" opacity="0.7" />
              <rect x="2"  y="14" width="8" height="8" rx="1.5" fill="#e87722" opacity="0.7" />
              <rect x="14" y="14" width="8" height="8" rx="1.5" fill="#e87722" opacity="0.4" />
            </svg>
          </div>
          <span style={styles.logoText}>ACQAR</span>
        </div>

        {status === "verifying" && (
          <>
            <div style={styles.spinnerWrap}>
              <div style={styles.spinnerRing} />
              <div style={styles.spinnerInner}>
                <svg width="22" height="22" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.694 32.657 29.29 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.055 6.053 29.273 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.01 12 24 12c3.059 0 5.842 1.154 7.957 3.043l5.657-5.657C34.055 6.053 29.273 4 24 4c-7.682 0-14.35 4.346-17.694 10.691z"/>
                  <path fill="#4CAF50" d="M24 44c5.182 0 9.91-1.986 13.471-5.219l-6.219-5.264C29.2 35.091 26.715 36 24 36c-5.268 0-9.66-3.317-11.29-7.946l-6.522 5.026C9.49 39.556 16.227 44 24 44z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.07 12.07 0 0 1-4.051 5.517l.003-.002 6.219 5.264C36.99 39.246 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
              </div>
            </div>
            <h2 style={styles.title}>Verifying your account</h2>
            <p style={styles.sub}>Completing Google sign-in, please wait…</p>
            <div style={styles.steps}>
              <Step icon="🔐" label="Authenticating with Google" done={true}  active={false} />
              <Step icon="🔍" label="Checking your profile"      done={false} active={true}  />
              <Step icon="🚀" label="Redirecting you"            done={false} active={false} />
            </div>
          </>
        )}

        {status === "redirecting" && (
          <>
            <div style={styles.successIconWrap}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#e87722" opacity="0.15"/>
                <circle cx="12" cy="12" r="10" stroke="#e87722" strokeWidth="1.5"/>
                <path d="M7.5 12l3 3 6-6" stroke="#e87722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={styles.title}>You're all set!</h2>
            <p style={styles.sub}>Taking you to your dashboard…</p>
            <div style={styles.steps}>
              <Step icon="🔐" label="Authenticated with Google" done={true} active={false} />
              <Step icon="🔍" label="Profile verified"          done={true} active={false} />
              <Step icon="🚀" label="Redirecting you"           done={false} active={true}  />
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div style={styles.errorIconWrap}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#fee2e2"/>
                <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="1.5"/>
                <path d="M12 7v5M12 16.5v.5" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 style={{ ...styles.title, color: "#9f1239" }}>Authentication Failed</h2>
            <p style={styles.sub}>{errorMsg}</p>
            <div style={styles.errorActions}>
              <button style={styles.retryBtn} onClick={() => navigate("/login")}>
                ← Back to Sign In
              </button>
              <button style={styles.supportBtn} onClick={() => navigate("/register")}>
                Create Account
              </button>
            </div>
          </>
        )}

        <div style={styles.badges}>
          <div style={styles.badge}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="#9ca3af" strokeWidth="1.8"/>
              <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <span style={styles.badgeText}>SSL ENCRYPTED</span>
          </div>
          <div style={styles.badgeSep} />
          <div style={styles.badge}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6L12 2z" stroke="#9ca3af" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={styles.badgeText}>GDPR COMPLIANT</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function Step({ icon, label, done, active }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 14px", borderRadius: 12,
      background: active ? "#fff8f3" : done ? "#f9fafb" : "transparent",
      border: active ? "1px solid #fcd9b6" : done ? "1px solid #e5e7eb" : "1px solid transparent",
      animation: active ? "fadeInUp 0.3s ease" : "none",
      marginBottom: 8,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: done ? "#e87722" : active ? "#fff8f3" : "#f3f4f6",
        border: active ? "2px solid #e87722" : "none",
      }}>
        {done ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <span style={{ fontSize: 13 }}>{icon}</span>
        )}
      </div>
      <span style={{
        fontSize: 13, fontWeight: active ? 700 : 500,
        color: active ? "#c05e10" : done ? "#6b7280" : "#9ca3af",
      }}>
        {label}
      </span>
      {active && (
        <div style={{ marginLeft: "auto", display: "flex", gap: 3 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "#e87722", opacity: 0.7,
              animation: `spin 1s ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f0eb 0%, #ede8e3 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "24px 16px",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  card: {
    background: "#ffffff", borderRadius: 24,
    padding: "44px 40px", width: "100%", maxWidth: 440,
    boxShadow: "0 20px 60px rgba(0,0,0,0.10)",
    textAlign: "center", animation: "fadeInUp 0.4s ease",
  },
  logoRow: {
    display: "flex", alignItems: "center",
    justifyContent: "center", gap: 10, marginBottom: 32,
  },
  logoBox: {
    width: 38, height: 38, borderRadius: 10,
    background: "#fff8f3", border: "1px solid #fcd9b6",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: { fontSize: 18, fontWeight: 800, color: "#111827", letterSpacing: 2.5 },
  spinnerWrap: {
    width: 72, height: 72, margin: "0 auto 24px",
    position: "relative", display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  spinnerRing: {
    position: "absolute", inset: 0, borderRadius: "50%",
    border: "3px solid #fcd9b6", borderTopColor: "#e87722",
    animation: "spin 0.9s linear infinite",
  },
  spinnerInner: {
    width: 48, height: 48, borderRadius: "50%",
    background: "#fff8f3", border: "1px solid #fcd9b6",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  successIconWrap: {
    margin: "0 auto 24px", width: 72, height: 72,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  errorIconWrap: {
    margin: "0 auto 24px", width: 72, height: 72,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  title: { margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: "#111827" },
  sub:   { margin: "0 0 28px", fontSize: 14, color: "#6b7280", lineHeight: 1.6 },
  steps: { textAlign: "left", marginBottom: 28 },
  errorActions: { display: "flex", gap: 10, marginBottom: 28 },
  retryBtn: {
    flex: 1, padding: "12px 16px", borderRadius: 12,
    border: "1px solid #d1d5db", background: "#ffffff",
    fontWeight: 700, fontSize: 14, color: "#374151",
    cursor: "pointer", fontFamily: "inherit",
  },
  supportBtn: {
    flex: 1, padding: "12px 16px", borderRadius: 12, border: "none",
    background: "linear-gradient(180deg, #f09030 0%, #d96b10 100%)",
    fontWeight: 700, fontSize: 14, color: "#ffffff",
    cursor: "pointer", fontFamily: "inherit",
  },
  badges: { display: "flex", justifyContent: "center", alignItems: "center", gap: 14 },
  badge:  { display: "flex", alignItems: "center", gap: 5 },
  badgeText: { fontSize: 10, fontWeight: 700, color: "#9ca3af", letterSpacing: 0.8 },
  badgeSep: { width: 1, height: 12, background: "#e5e7eb" },
};
