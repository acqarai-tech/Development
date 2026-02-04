// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" }); // type: "error" | "success" | ""

  async function handleLogin(e) {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    const em = email.trim().toLowerCase();
    if (!em || !password) {
      setMsg({ type: "error", text: "Enter email and password." });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: em,
        password,
      });
      if (error) throw error;

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

      // IMPORTANT:
      // Supabase will redirect back to your Site URL / Redirect URLs (Dashboard URL allowed).
      // We set redirectTo to be explicit:
      const redirectTo = `${window.location.origin}/dashboard`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) throw error;

      // No navigate() here because OAuth redirects the browser.
    } catch (err) {
      setMsg({ type: "error", text: err?.message || "Google login failed." });
      setOauthLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Login</h2>

        {msg.text ? (
          <div style={msg.type === "error" ? styles.msgError : styles.msgOk}>
            {msg.text}
          </div>
        ) : null}

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
            {/* Simple Google "G" icon (inline SVG) */}
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

        {/* Email/Password */}
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              disabled={oauthLoading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="password">
              Password
            </label>

            <div style={styles.passwordWrap}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                style={{ ...styles.input, paddingRight: 72 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                disabled={oauthLoading}
              />

              <span
                style={styles.passwordToggle}
                role="button"
                tabIndex={0}
                onClick={() => setShowPassword((p) => !p)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setShowPassword((p) => !p);
                  }
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </span>
            </div>
          </div>

          <button
            type="submit"
            style={{
              ...styles.loginButton,
              opacity: loading ? 0.75 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            disabled={loading || oauthLoading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
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
      "radial-gradient(900px 500px at 20% 10%, rgba(48,117,133,0.12), transparent 60%), #f5f7fb",
  },

  container: {
    width: "100%",
    maxWidth: 420,
    margin: "0 auto",
    padding: 22,
    backgroundColor: "white",
    borderRadius: 10,
    border: "5px solid #307585",
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
  },

  title: {
    textAlign: "center",
    color: "#333",
    fontSize: 34,
    margin: 0,
    marginBottom: 16,
    letterSpacing: 0.2,
  },

  msgError: {
    background: "#fff1f2",
    border: "1px solid #fecdd3",
    color: "#9f1239",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14,
  },
  msgOk: {
    background: "#ecfdf5",
    border: "1px solid #bbf7d0",
    color: "#166534",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 14,
  },

  googleBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "12px 12px",
    borderRadius: 10,
    border: "1px solid #d8dce6",
    background: "#fff",
    fontWeight: 700,
    fontSize: 15,
    color: "#111827",
    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
  },
  googleIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    display: "grid",
    placeItems: "center",
    background: "rgba(0,0,0,0.03)",
    border: "1px solid rgba(0,0,0,0.06)",
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "14px 0",
  },
  dividerLine: {
    height: 1,
    background: "#e5e7eb",
    flex: 1,
  },
  dividerText: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 600,
  },

  form: { display: "flex", flexDirection: "column" },
  formGroup: { marginBottom: 14 },

  label: {
    color: "#333",
    fontWeight: "bold",
    display: "block",
    marginBottom: 6,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px 12px",
    border: "1px solid black",
    borderRadius: 8,
    fontSize: 16,
    outline: "none",
  },

  passwordWrap: { position: "relative" },
  passwordToggle: {
    position: "absolute",
    right: 14,
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    color: "#307585",
    fontWeight: "bold",
    userSelect: "none",
    padding: "4px 8px",
    borderRadius: 8,
    background: "rgba(48,117,133,0.08)",
  },

  loginButton: {
    width: "80%",
    marginLeft: "10%",
    padding: "12px 10px",
    backgroundColor: "#002147",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    transition: "transform 0.05s ease, opacity 0.2s ease",
  },

  registerLink: { textAlign: "center", marginTop: 18 },
  registerLinkText: {
    color: "#307585",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
