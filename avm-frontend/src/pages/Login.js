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

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Login</h2>

        {msg.text ? (
          <div style={msg.type === "error" ? styles.msgError : styles.msgOk}>
            {msg.text}
          </div>
        ) : null}

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

          <button type="submit" style={styles.loginButton} disabled={loading}>
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

  // matches your uploaded look: centered white card, thick teal border, rounded corners
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

  // matches font size/centered title from your uploaded file
  title: {
    textAlign: "center",
    color: "#333",
    fontSize: 34,
    margin: 0,
    marginBottom: 18,
    letterSpacing: 0.2,
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

  // same idea as uploaded file: absolute toggle on the right
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
    cursor: "pointer",
    transition: "transform 0.05s ease, opacity 0.2s ease",
    opacity: 1,
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

  registerLink: { textAlign: "center", marginTop: 18 },
  registerLinkText: {
    color: "#307585",
    textDecoration: "none",
    fontWeight: "bold",
  },
};
