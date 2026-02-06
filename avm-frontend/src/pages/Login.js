// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ OTP login states
  const [otpMode, setOtpMode] = useState(false); // false=password, true=OTP
  const [otpStep, setOtpStep] = useState("request"); // "request" | "verify"
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" }); // type: "error" | "success" | ""

  function normEmail(v) {
    return (v || "").trim().toLowerCase();
  }

  // ✅ LOCAL ADMIN (ONLY ADDITION)
  const ADMIN_EMAIL = "admin@acqar.com";
  const ADMIN_PASSWORD = "acqar123";

  function isAdminLogin(em, pw) {
    return normEmail(em) === ADMIN_EMAIL && String(pw || "") === ADMIN_PASSWORD;
  }

  // -------------------------------------------------------
  // ✅ PERMANENT FIX: sync auth.users <-> public.users
  // -------------------------------------------------------
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

    // 1) Try get row by authId
    let { data: byIdRow, error: byIdErr } = await supabase
      .from("users")
      .select("id, role, name, email, phone, created_at")
      .eq("id", authId)
      .maybeSingle();

    if (byIdErr) console.warn("users select by id:", byIdErr.message);

    // 2) If not found, try by email
    if (!byIdRow && authEmail) {
      const { data: byEmailRow, error: byEmailErr } = await supabase
        .from("users")
        .select("id, role, name, email, phone, created_at")
        .eq("email", authEmail)
        .maybeSingle();

      if (byEmailErr) console.warn("users select by email:", byEmailErr.message);

      // If found but wrong id => migrate
      if (byEmailRow?.id && byEmailRow.id !== authId) {
        const payload = {
          id: authId,
          email: authEmail,
          role: byEmailRow.role || null,
          phone: byEmailRow.phone || null,
          name: (byEmailRow.name || metaName || "").trim() || null,
        };

        const { error: upsertErr } = await supabase.from("users").upsert(payload, { onConflict: "id" });
        if (upsertErr) throw upsertErr;

        // delete old wrong-id row
        const { error: delErr } = await supabase.from("users").delete().eq("id", byEmailRow.id);
        if (delErr) console.warn("users delete old row:", delErr.message);

        // re-fetch correct
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

    // 3) If still missing, create correct row
    if (!byIdRow) {
      const payload = { id: authId, email: authEmail, name: metaName || null };

      const { error: createErr } = await supabase.from("users").upsert(payload, { onConflict: "id" });
      if (createErr) throw createErr;

      const { data: createdRow, error: createdSelErr } = await supabase
        .from("users")
        .select("id, role, name, email, phone, created_at")
        .eq("id", authId)
        .maybeSingle();

      if (createdSelErr) console.warn("users select created:", createdSelErr.message);
      byIdRow = createdRow || null;
    }

    // 4) If name empty but metaName exists, update once
    if (byIdRow && !(byIdRow.name || "").trim() && metaName) {
      const { error: updErr } = await supabase.from("users").update({ name: metaName }).eq("id", authId);
      if (updErr) console.warn("users update name:", updErr.message);
    }

    return true;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const em = normEmail(email);
    if (!em) {
      setMsg({ type: "error", text: "Enter email." });
      return;
    }

    // ✅ OTP flow (unchanged)
    if (otpMode) {
      if (otpStep === "request") return sendLoginOtp();
      return verifyLoginOtp();
    }

    // ✅ Password flow
    if (!password) {
      setMsg({ type: "error", text: "Enter email and password." });
      return;
    }

    // ✅ UPDATED: Admin login (REAL Supabase session)
    if (isAdminLogin(em, password)) {
      try {
        setLoading(true);
        setMsg({ type: "", text: "" });

        const { error } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        });

        if (error) throw error;

        // ✅ Permanent fix: sync public.users immediately after admin login
        await syncPublicUserFromAuth();

        navigate("/admin-dashboard");
        return;
      } catch (e2) {
        setMsg({ type: "error", text: e2?.message || "Admin login failed." });
        return;
      } finally {
        setLoading(false);
      }
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email: em, password });
      if (error) throw error;

      // ✅ Permanent fix: sync public.users immediately after login
      await syncPublicUserFromAuth();

      navigate("/dashboard");
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Login failed." });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setMsg({ type: "", text: "" });

    try {
      setOauthLoading(true);
      const redirectTo = `${window.location.origin}/dashboard`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) throw error;
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Google login failed." });
      setOauthLoading(false);
    }
  }

  // =========================
  // ✅ OTP Login
  // =========================
  async function sendLoginOtp() {
    setMsg({ type: "", text: "" });
    const em = normEmail(email);

    if (!em) {
      setMsg({ type: "error", text: "Enter your email first." });
      return;
    }

    try {
      setLoading(true);

      const { data: existingUser, error: checkErr } = await supabase
        .from("users")
        .select("email")
        .eq("email", em)
        .maybeSingle();

      if (checkErr) throw checkErr;

      if (!existingUser) {
        setMsg({ type: "error", text: "Email not found. Please sign up first." });
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: em,
        options: { shouldCreateUser: true },
      });

      if (error) throw error;

      setOtpStep("verify");
      setMsg({ type: "success", text: "OTP sent to your email. Please enter the code." });
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Could not send OTP. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  async function verifyLoginOtp() {
    setMsg({ type: "", text: "" });

    const em = normEmail(email);
    const code = (otp || "").trim();

    if (!em) {
      setMsg({ type: "error", text: "Enter your email first." });
      return;
    }
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
      setOtp("");
      navigate("/dashboard");
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "OTP verification failed." });
    } finally {
      setLoading(false);
    }
  }

  function switchToOtp() {
    setMsg({ type: "", text: "" });
    setOtpMode(true);
    setOtpStep("request");
    setOtp("");
    setPassword("");
  }

  function switchToPassword() {
    setMsg({ type: "", text: "" });
    setOtpMode(false);
    setOtpStep("request");
    setOtp("");
  }

  function changeEmailInOtp() {
    setMsg({ type: "", text: "" });
    setOtpStep("request");
    setOtp("");
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.h1}>Login</h1>
        <div style={styles.subTitle}>Sign in to access your dashboard</div>

        {msg.text ? <div style={msg.type === "error" ? styles.msgError : styles.msgOk}>{msg.text}</div> : null}

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{
            ...styles.googleBtn,
            opacity: oauthLoading ? 0.75 : 1,
            cursor: oauthLoading ? "not-allowed" : "pointer",
          }}
          disabled={oauthLoading || loading}
        >
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
          {oauthLoading ? "Connecting..." : "Continue with Google"}
        </button>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine} />
        </div>

        {/* Toggle */}
        <div style={styles.modeToggleRow}>
          <button
            type="button"
            onClick={switchToPassword}
            style={{ ...styles.modeToggleBtn, ...(otpMode ? {} : styles.modeToggleBtnActive) }}
            disabled={loading || oauthLoading}
          >
            Password
          </button>
          <button
            type="button"
            onClick={switchToOtp}
            style={{ ...styles.modeToggleBtn, ...(otpMode ? styles.modeToggleBtnActive : {}) }}
            disabled={loading || oauthLoading}
          >
            Login with OTP
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.grid2}>
            <div style={styles.field}>
              <label style={styles.label} htmlFor="email">
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@venture.com"
                autoComplete="email"
                required
                disabled={oauthLoading || (otpMode && otpStep === "verify")}
              />
            </div>

            {!otpMode ? (
              <div style={styles.field}>
                <label style={styles.label} htmlFor="password">
                  PASSWORD
                </label>

                <div style={styles.passwordWrap}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    style={{ ...styles.input, paddingRight: 86 }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={oauthLoading}
                  />

                  <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword((p) => !p)} disabled={oauthLoading}>
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={styles.field}>
                <label style={styles.label} htmlFor="otp">
                  {otpStep === "verify" ? "EMAIL OTP CODE" : "OTP"}
                </label>

                {otpStep === "verify" ? (
                  <input
                    id="otp"
                    type="text"
                    style={styles.input}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP from your email"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    required
                    disabled={oauthLoading}
                  />
                ) : (
                  <input
                    id="otp"
                    type="text"
                    style={{ ...styles.input, background: "rgba(15, 23, 42, 0.04)" }}
                    value="Click button below to send OTP"
                    readOnly
                    disabled
                  />
                )}

                {otpMode && otpStep === "verify" ? (
                  <div style={styles.otpActionsRow}>
                    <button type="button" style={styles.smallBtn} onClick={sendLoginOtp} disabled={loading || oauthLoading}>
                      Resend OTP
                    </button>
                    <button type="button" style={styles.smallBtn} onClick={changeEmailInOtp} disabled={loading || oauthLoading}>
                      Change Email
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <button
            type="submit"
            style={{
              ...styles.cta,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading || oauthLoading}
          >
            <span style={styles.ctaText}>
              {loading ? "Please wait..." : !otpMode ? "Login" : otpStep === "request" ? "Send OTP to Email" : "Verify OTP & Login"}
            </span>
          </button>

          <div style={styles.badgesRow}>
            <div style={styles.badge}>
              <span style={styles.badgeIcon}>🔒</span>
              <span style={styles.badgeText}>SSL ENCRYPTED</span>
            </div>
            <div style={styles.badge}>
              <span style={styles.badgeIcon}>✅</span>
              <span style={styles.badgeText}>SECURE AUTH</span>
            </div>
          </div>
        </form>

        <p style={styles.registerLink}>
          Don&apos;t have an account?{" "}
          <Link to="/signup" style={styles.registerLinkText}>
            Create account
          </Link>
        </p>
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
    maxWidth: 860,
    background: "#ffffff",
    borderRadius: 26,
    boxShadow: "0 26px 60px rgba(0,0,0,0.25)",
    padding: "34px 34px 26px",
  },
  h1: { margin: 0, textAlign: "center", fontSize: 44, fontWeight: 900, color: "#0b1220", letterSpacing: -0.6 },
  subTitle: { marginTop: 10, textAlign: "center", fontSize: 14, color: "#6b7280", fontWeight: 600 },

  modeToggleRow: { marginTop: 10, display: "flex", justifyContent: "center", alignItems: "center", gap: 16 },
  modeToggleBtn: {
    padding: "7px 26px",
    borderRadius: 999,
    border: "1px solid #e5e7eb",
    background: "#fff",
    fontWeight: 500,
    cursor: "pointer",
    color: "#111827",
    minWidth: 170,
    textAlign: "center",
  },
  modeToggleBtnActive: { background: "rgba(18,70,255,0.10)", border: "1px solid rgba(18,70,255,0.28)", color: "#1246ff" },

  otpActionsRow: { display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" },
  smallBtn: {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(0,0,0,0.10)",
    background: "rgba(15, 23, 42, 0.04)",
    cursor: "pointer",
    fontWeight: 900,
    color: "#1f2a44",
  },

  msgError: {
    marginTop: 16,
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    padding: 12,
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 700,
  },
  msgOk: {
    marginTop: 16,
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    color: "#166534",
    padding: 12,
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 700,
  },

  googleBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "12px 12px",
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    background: "#fff",
    fontWeight: 800,
    fontSize: 15,
    color: "#111827",
    boxShadow: "0 10px 22px rgba(0,0,0,0.06)",
    marginTop: 18,
  },
  googleIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    display: "grid",
    placeItems: "center",
    background: "rgba(15, 23, 42, 0.04)",
    border: "1px solid rgba(0,0,0,0.06)",
  },

  divider: { display: "flex", alignItems: "center", gap: 10, margin: "16px 0" },
  dividerLine: { height: 1, background: "#e5e7eb", flex: 1 },
  dividerText: { fontSize: 13, color: "#6b7280", fontWeight: 700 },

  form: { marginTop: 6 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  field: { display: "flex", flexDirection: "column" },

  label: { fontSize: 12, fontWeight: 900, letterSpacing: 1.1, color: "#94a3b8", marginBottom: 8 },

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

  cta: {
    marginTop: 18,
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
  },
  ctaText: { color: "#ffffff", fontSize: 16, fontWeight: 900, letterSpacing: 0.2 },

  badgesRow: { marginTop: 14, display: "flex", justifyContent: "center", gap: 22, flexWrap: "wrap" },
  badge: { display: "inline-flex", alignItems: "center", gap: 8 },
  badgeIcon: { fontSize: 14 },
  badgeText: { fontSize: 12, fontWeight: 900, color: "#94a3b8", letterSpacing: 0.6 },

  registerLink: { textAlign: "center", marginTop: 18, fontWeight: 700, color: "#0b1220" },
  registerLinkText: { color: "#1d4ed8", textDecoration: "none", fontWeight: 900 },
};
