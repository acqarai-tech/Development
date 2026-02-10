// src/pages/VerifyOtp.jsx
// ✅ Same functionality (Supabase verify/resend/sync + navigation) — UI updated to match your screenshot
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(""); // ✅ keep as single string for existing verify logic

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // ✅ UI-only: 6 boxes
  const OTP_LEN = 6;
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LEN).fill(""));
  const inputsRef = useRef([]);

  // ✅ UI-only: countdown (10 minutes default)
  const [secondsLeft, setSecondsLeft] = useState(10 * 60);

  function normEmail(v) {
    return (v || "").trim().toLowerCase();
  }

  // ✅ same logic you already had (copied to keep behavior)
  async function syncPublicUserFromAuth() {
    const { data: uData, error: uErr } = await supabase.auth.getUser();
    if (uErr) throw uErr;

    const user = uData?.user;
    if (!user?.id) throw new Error("User not authenticated.");

    const authId = user.id;
    const authEmail = normEmail(user.email);

    const metaName = (
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.display_name ||
      ""
    ).trim();

    let { data: byIdRow, error: byIdErr } = await supabase
      .from("users")
      .select("id, role, name, email, phone, created_at")
      .eq("id", authId)
      .maybeSingle();

    if (byIdErr) console.warn("users select by id:", byIdErr.message);

    if (!byIdRow && authEmail) {
      const { data: byEmailRow, error: byEmailErr } = await supabase
        .from("users")
        .select("id, role, name, email, phone, created_at")
        .eq("email", authEmail)
        .maybeSingle();

      if (byEmailErr) console.warn("users select by email:", byEmailErr.message);

      if (byEmailRow?.id && byEmailRow.id !== authId) {
        const payload = {
          id: authId,
          email: authEmail,
          role: byEmailRow.role || null,
          phone: byEmailRow.phone || null,
          name: (byEmailRow.name || metaName || "").trim() || null,
        };

        const { error: upsertErr } = await supabase
          .from("users")
          .upsert(payload, { onConflict: "id" });
        if (upsertErr) throw upsertErr;

        const { error: delErr } = await supabase
          .from("users")
          .delete()
          .eq("id", byEmailRow.id);
        if (delErr) console.warn("users delete old row:", delErr.message);

        const { data: afterRow, error: afterErr } = await supabase
          .from("users")
          .select("id, role, name, email, phone, created_at")
          .eq("id", authId)
          .maybeSingle();

        if (afterErr) console.warn("users select after migrate:", afterErr.message);
        byIdRow = afterRow || null;
      } else {
        byIdRow = byEmailRow || null;
      }
    }

    if (!byIdRow) {
      const payload = { id: authId, email: authEmail, name: metaName || null };

      const { error: createErr } = await supabase
        .from("users")
        .upsert(payload, { onConflict: "id" });
      if (createErr) throw createErr;

      const { data: createdRow, error: createdSelErr } = await supabase
        .from("users")
        .select("id, role, name, email, phone, created_at")
        .eq("id", authId)
        .maybeSingle();

      if (createdSelErr) console.warn("users select created:", createdSelErr.message);
      byIdRow = createdRow || null;
    }

    if (byIdRow && !(byIdRow.name || "").trim() && metaName) {
      const { error: updErr } = await supabase
        .from("users")
        .update({ name: metaName })
        .eq("id", authId);
      if (updErr) console.warn("users update name:", updErr.message);
    }

    return true;
  }

  // ✅ same routing behavior as you already had
  useEffect(() => {
    const em = normEmail(location?.state?.email || "");
    if (!em) {
      navigate("/login");
      return;
    }
    setEmail(em);
  }, [location, navigate]);

  // ✅ countdown (UI-only)
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [secondsLeft]);

  function mmss(s) {
    const m = Math.floor(s / 60);
    const r = s % 60;
    const mm = String(m).padStart(2, "0");
    const ss = String(r).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  // ✅ Keep otp (string) in sync with boxes
  useEffect(() => {
    const joined = otpDigits.join("");
    setOtp(joined);
  }, [otpDigits]);

  function focusIndex(i) {
    const el = inputsRef.current?.[i];
    if (el) {
      el.focus();
      el.select?.();
    }
  }

  function setDigitAt(i, val) {
    setOtpDigits((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  }

  function handleDigitChange(i, e) {
    const raw = e.target.value || "";
    const v = raw.replace(/\D/g, ""); // digits only

    if (!v) {
      setDigitAt(i, "");
      return;
    }

    // if user typed/pasted multiple digits into one box
    const chars = v.slice(0, OTP_LEN - i).split("");
    setOtpDigits((prev) => {
      const next = [...prev];
      for (let k = 0; k < chars.length; k++) {
        next[i + k] = chars[k];
      }
      return next;
    });

    const nextIndex = Math.min(i + chars.length, OTP_LEN - 1);
    focusIndex(nextIndex);
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace") {
      if (otpDigits[i]) {
        setDigitAt(i, "");
        return;
      }
      if (i > 0) {
        setDigitAt(i - 1, "");
        focusIndex(i - 1);
      }
    }
    if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      focusIndex(i - 1);
    }
    if (e.key === "ArrowRight" && i < OTP_LEN - 1) {
      e.preventDefault();
      focusIndex(i + 1);
    }
    if (e.key === "Enter") {
      // allow submit with Enter
    }
  }

  function handlePaste(e) {
    const text = (e.clipboardData?.getData("text") || "").replace(/\D/g, "");
    if (!text) return;
    e.preventDefault();

    const chars = text.slice(0, OTP_LEN).split("");
    setOtpDigits((prev) => {
      const next = [...prev];
      for (let i = 0; i < OTP_LEN; i++) next[i] = chars[i] || "";
      return next;
    });

    const lastFilled = Math.min(chars.length, OTP_LEN) - 1;
    if (lastFilled >= 0) focusIndex(lastFilled);
  }

  const otpComplete = useMemo(
    () => otpDigits.every((d) => d && d.length === 1),
    [otpDigits]
  );

  async function resendOtp() {
    setMsg({ type: "", text: "" });
    const em = normEmail(email);

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOtp({
        email: em,
        options: { shouldCreateUser: true },
      });
      if (error) throw error;

      // ✅ UI-only: reset timer like screenshot behavior
      setSecondsLeft(10 * 60);

      setMsg({ type: "success", text: "OTP resent to your email." });
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Could not resend OTP." });
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtpAndLogin(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const em = normEmail(email);
    const code = (otp || "").trim();

    if (!code) {
      setMsg({ type: "error", text: "Enter the OTP code." });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.verifyOtp({
        email: em,
        token: code,
        type: "email",
      });

      if (error) throw error;

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session && !data?.session) {
        throw new Error("Session not created. Please request OTP again.");
      }

      await syncPublicUserFromAuth();

      setMsg({ type: "success", text: "Logged in successfully." });
      navigate("/dashboard");
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "OTP verification failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Top bar (like screenshot) */}
      <div style={styles.topBar}>
        <div style={styles.brand}>
          <div style={styles.brandMark} aria-hidden="true" />
          <div style={styles.brandText}>ACQAR</div>
        </div>

        <button
          type="button"
          style={styles.supportBtn}
          onClick={() => {
            // UI-only placeholder; keep behavior safe
            // If you have a support page route later, change to: navigate("/support")
            window.location.href = "mailto:support@acqar.com";
          }}
        >
          Contact Support
        </button>
      </div>

      {/* Center content */}
      <div style={styles.centerWrap}>
        <div style={styles.card}>
          <div style={styles.mailIconWrap} aria-hidden="true">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6.5h16v11H4v-11Z"
                stroke="#9CA3AF"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <path
                d="M4 7l8 6 8-6"
                stroke="#9CA3AF"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h2 style={styles.title}>Verify Your Email</h2>
          <p style={styles.sub}>
            We&apos;ve sent a 6-digit code to{" "}
            <span style={styles.emailStrong}>{email}</span>
          </p>

          {/* Alerts (kept) */}
          {msg.text && (
            <div style={msg.type === "error" ? styles.msgError : styles.msgOk}>
              {msg.text}
            </div>
          )}

          {/* OTP boxes */}
          <form onSubmit={verifyOtpAndLogin}>
            <div style={styles.otpRow} onPaste={handlePaste}>
              {otpDigits.map((d, i) => {
                const isActive = i === otpDigits.findIndex((x) => x === "") || otpComplete;
                const isFilled = !!d;
                return (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={OTP_LEN} // allows multi-digit paste into one field
                    disabled={loading}
                    style={{
                      ...styles.otpBox,
                      ...(isActive ? styles.otpBoxActive : null),
                      ...(isFilled ? styles.otpBoxFilled : null),
                    }}
                    aria-label={`OTP digit ${i + 1}`}
                  />
                );
              })}
            </div>

            {/* Timer line */}
            <div style={styles.timerRow}>
              <span style={styles.timerDot} aria-hidden="true">
                i
              </span>
              <span style={styles.timerText}>
                Code expires in{" "}
                <span style={styles.timerStrong}>{mmss(secondsLeft)}</span>
              </span>
            </div>

            <button
              type="submit"
              style={{
                ...styles.primaryBtn,
                opacity: loading ? 0.75 : otpComplete ? 1 : 0.92,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading || !otpComplete}
            >
              {loading ? "Please wait..." : "Verify & Sign In →"}
            </button>
          </form>

          {/* Resend + Change email (kept behavior) */}
          <div style={styles.bottomLinks}>
            <span style={styles.bottomMuted}>Didn&apos;t receive the code?</span>{" "}
            <button
              type="button"
              style={styles.linkBtn}
              onClick={resendOtp}
              disabled={loading}
            >
              Resend
            </button>
            <span style={styles.dotSep}>•</span>
            <Link to="/login" style={styles.linkBtn}>
              Change Email
            </Link>
          </div>

          {/* Secure badge */}
          <div style={styles.secureBadge}>
            <span style={styles.lock} aria-hidden="true">🔒</span>
            <span style={styles.secureText}>SECURE ENCRYPTION ENABLED</span>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          © 2024 ACQAR Technology. Licensed for AI Property Valuations in Dubai, UAE.
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F7F7F7",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    position: "relative",
  },

  topBar: {
    height: 64,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    background: "#FFFFFF",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 900,
    letterSpacing: 1,
  },
  brandMark: {
    width: 14,
    height: 14,
    borderRadius: 4,
    background: "#b45309",
    boxShadow: "0 4px 12px rgba(249,115,22,0.35)",
  },
  brandText: {
    fontSize: 14,
    color: "#111827",
  },
  supportBtn: {
    border: "none",
    background: "#b45309",
    color: "#fff",
    fontWeight: 800,
    fontSize: 12,
    padding: "10px 14px",
    borderRadius: 8,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(249,115,22,0.28)",
  },

  centerWrap: {
    minHeight: "calc(100vh - 64px)",
    display: "grid",
    placeItems: "center",
    padding: "28px 16px 18px",
  },

  card: {
    width: "100%",
    maxWidth: 520,
    background: "#FFFFFF",
    borderRadius: 16,
    padding: "32px 34px 26px",
    boxShadow: "0 14px 40px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.05)",
    textAlign: "center",
  },

  mailIconWrap: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#F3F4F6",
    display: "grid",
    placeItems: "center",
    margin: "0 auto 14px",
  },

  title: {
    margin: "0 0 6px",
    fontSize: 20,
    fontWeight: 900,
    color: "#111827",
    letterSpacing: -0.2,
  },
  sub: {
    margin: "0 0 18px",
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 1.6,
  },
  emailStrong: {
    color: "#111827",
    fontWeight: 800,
  },

  msgError: {
    margin: "0 auto 14px",
    maxWidth: 440,
    background: "#FFF1F2",
    border: "1px solid #FECDD3",
    color: "#9F1239",
    padding: "10px 12px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    textAlign: "left",
  },
  msgOk: {
    margin: "0 auto 14px",
    maxWidth: 440,
    background: "#ECFDF5",
    border: "1px solid #BBF7D0",
    color: "#166534",
    padding: "10px 12px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    textAlign: "left",
  },

  otpRow: {
    display: "flex",
    justifyContent: "center",
    gap: 10,
    margin: "6px 0 14px",
  },
  otpBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    background: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: 900,
    color: "#111827",
    outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  otpBoxActive: {
    border: "2px solid #60A5FA",
    boxShadow: "0 0 0 3px rgba(96,165,250,0.18)",
  },
  otpBoxFilled: {
    border: "1px solid #D1D5DB",
  },

  timerRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    margin: "2px 0 16px",
  },
  timerDot: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: "#EEF2FF",
    color: "#64748B",
    display: "grid",
    placeItems: "center",
    fontSize: 11,
    fontWeight: 900,
  },
  timerText: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: 700,
  },
  timerStrong: {
    color: "#b45309",
    fontWeight: 900,
  },

  primaryBtn: {
    width: "100%",
    maxWidth: 420,
    margin: "0 auto",
    border: "none",
    background: "#b45309",
    color: "#FFFFFF",
    borderRadius: 10,
    padding: "13px 16px",
    fontWeight: 900,
    fontSize: 14,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(249,115,22,0.25)",
  },

  bottomLinks: {
    marginTop: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexWrap: "wrap",
    fontSize: 12,
  },
  bottomMuted: {
    color: "#9CA3AF",
    fontWeight: 700,
  },
  linkBtn: {
    background: "transparent",
    border: "none",
    color: "#b45309",
    fontWeight: 900,
    cursor: "pointer",
    textDecoration: "none",
    padding: 0,
  },
  dotSep: {
    color: "#D1D5DB",
    fontWeight: 900,
    margin: "0 4px",
  },

  secureBadge: {
    margin: "16px auto 0",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    background: "#ECFDF5",
    border: "1px solid #BBF7D0",
  },
  lock: { fontSize: 12 },
  secureText: {
    fontSize: 11,
    fontWeight: 900,
    color: "#166534",
    letterSpacing: 0.8,
  },

  footer: {
    marginTop: 18,
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
  },
};
